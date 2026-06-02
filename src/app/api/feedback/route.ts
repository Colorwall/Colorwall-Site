import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ─── Constants ────────────────────────────────────────────────────────────────

const LIMITS = {
    USERNAME_MAX:   64,
    TEXT_MAX:       2000,
    IMAGE_MAX_SIZE: 2 * 1024 * 1024,   // 2 MB
    LOG_MAX_SIZE:   1 * 1024 * 1024,   // 1 MB
    IMAGE_COUNT:    5,
    RATE_WINDOW_MS: 1 * 60 * 1000,     // 1 min
} as const;

const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
]);

const ALLOWED_SOURCES = new Set(['App', 'Web']);

// ─── GitHub Config ────────────────────────────────────────────────────────────
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeString(value: string): string {
    return value
        .replace(/\0/g, '')
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '')
        .trim();
}

function err(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status });
}

function hashIp(req: Request): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const raw =
        (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
        req.headers.get('x-real-ip') ||
        'unknown';
    return crypto.createHash('sha256').update(raw).digest('hex');
}

function detectSource(formData: FormData, req: Request): 'App' | 'Web' {
    const sourceStr = formData.get('source');
    const explicit = typeof sourceStr === 'string' ? sourceStr.trim() : null;
    const deviceId = formData.get('deviceId');
    
    if (explicit && ALLOWED_SOURCES.has(explicit)) {
        if (explicit === 'App' && !deviceId) return 'Web';
        return explicit as 'App' | 'Web';
    }
    const ua = req.headers.get('user-agent') ?? '';
    return (ua.includes('Tauri') && deviceId) ? 'App' : 'Web';
}

async function uploadToGithub(path: string, contentBase64: string): Promise<string | null> {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) return null;
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Upload ${path}`,
                content: contentBase64
            })
        });
        if (!res.ok) {
            console.error(`GitHub upload failed: ${await res.text()}`);
            return null;
        }
        const data = await res.json();
        return data.content?.download_url || null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function GET(req: Request) {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return NextResponse.json({ success: true, data: [] });
    }
    try {
        const url = new URL(req.url);
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
        const skip = Math.max(0, parseInt(url.searchParams.get('skip') || '0', 10));
        const page = Math.floor(skip / limit) + 1;

        const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open&sort=created&direction=desc&per_page=${limit}&page=${page}`, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });
        
        if (!res.ok) throw new Error('Failed to fetch issues');
        const issues = await res.json();

        const formatted = await Promise.all(issues.map(async (issue: any) => {
            let meta: any = {};
            let text = issue.body || '';
            const metaMatch = text.match(/<!--\s*META_START([\s\S]*?)META_END\s*-->/);
            if (metaMatch) {
                try {
                    meta = JSON.parse(metaMatch[1]);
                } catch(e) {}
                text = text.replace(metaMatch[0], '').trim();
                // Also remove image and log preview sections appended
                text = text.replace(/### Images[\s\S]*/, '').trim();
                text = text.replace(/### Logs[\s\S]*/, '').trim();
            }
            
            // Strip imported text artifacts
            text = text.replace(/\*\*Source:\*\*.*?\n/g, '').trim();
            text = text.replace(/\*\*App Version:\*\*.*?\n/g, '').trim();
            text = text.replace(/\*\*Original Date:\*\*.*?\n/g, '').trim();

            const logFiles = [];
            if (meta.logFiles) {
                for (const lf of meta.logFiles) {
                    try {
                        const lfRes = await fetch(lf.url);
                        if (lfRes.ok) {
                            const content = await lfRes.text();
                            logFiles.push({ name: lf.name, content: content.slice(0, 2000) });
                        }
                    } catch(e) {}
                }
            }

            let replies = [];
            if (issue.comments > 0) {
                const commentsRes = await fetch(issue.comments_url, {
                    headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
                });
                if (commentsRes.ok) {
                    const comments = await commentsRes.json();
                    replies = comments.map((c: any) => {
                        let cUsername = c.user?.login || 'Anonymous';
                        let cCreatedAt = c.created_at;
                        let cText = c.body || '';
                        let cIsVerified = false;
                        
                        // Parse META tag if present
                        const metaMatch = cText.match(/<!--\s*META_START([\s\S]*?)META_END\s*-->/);
                        if (metaMatch) {
                            try {
                                const cMeta = JSON.parse(metaMatch[1]);
                                if (cMeta.isVerified) cIsVerified = true;
                                if (cMeta.username) cUsername = cMeta.username;
                            } catch(e) {}
                            cText = cText.replace(metaMatch[0], '').trim();
                        }

                        // Parse importer format: **Reply from User** on Date:
                        const match = cText.match(/^\*\*Reply from (.*?)\*\* on (.*?):\n\n([\s\S]*)$/);
                        if (match) {
                            cUsername = match[1];
                            cCreatedAt = match[2];
                            cText = match[3];
                        }

                        return {
                            id: c.id.toString(),
                            username: cUsername,
                            text: cText,
                            isVerified: cIsVerified,
                            createdAt: new Date(cCreatedAt)
                        };
                    });
                }
            }

            return {
                id: issue.number.toString(),
                username: meta.username || 'Anonymous',
                text: text,
                images: meta.images || [],
                logFiles,
                appVersion: meta.appVersion,
                source: meta.source || 'Web',
                labels: issue.labels?.map((l: any) => l.name) || [],
                isVerified: !!meta.isVerified,
                createdAt: new Date(meta.createdAt || issue.created_at),
                replies
            };
        }));

        const response = NextResponse.json({ success: true, data: formatted });
        response.headers.set('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
        return response;
    } catch (error) {
        console.error('[feedback/GET]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return err('GitHub configuration missing.', 500);
    }
    try {
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return err('Invalid multipart/form-data payload.', 400);
        }

        const rawUsername = formData.get('username')?.toString() ?? '';
        const rawText     = formData.get('text')?.toString() ?? '';

        let username = sanitizeString(rawUsername) || 'Anonymous';
        const text     = sanitizeString(rawText).replace(/META_START/g, 'META_DISABLED');

        if (username.length > LIMITS.USERNAME_MAX) {
            return err(`Username must be ${LIMITS.USERNAME_MAX} characters or fewer.`, 400);
        }
        if (text.length > LIMITS.TEXT_MAX) {
            return err(`Feedback text must be ${LIMITS.TEXT_MAX} characters or fewer.`, 400);
        }

        const images: string[] = [];
        const imageEntries = formData.getAll('images');
        const allImageFiles = [
            ...imageEntries,
            ...Array.from(formData.keys())
                .filter(k => /^image\d+$/.test(k))
                .flatMap(k => formData.getAll(k)),
        ].filter((v): v is File => typeof v === 'object' && v !== null && 'size' in v && 'type' in v && 'arrayBuffer' in v);

        for (const file of allImageFiles) {
            if (images.length >= LIMITS.IMAGE_COUNT) break;
            if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
                return err(`Unsupported image type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.`, 400);
            }
            if (file.size > LIMITS.IMAGE_MAX_SIZE) {
                return err(`Each image must be under ${LIMITS.IMAGE_MAX_SIZE / 1024 / 1024} MB.`, 400);
            }
            if (file.size === 0) continue;

            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const ext = file.name.split('.').pop() || 'png';
            const filename = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const url = await uploadToGithub(filename, base64);
            if (url) images.push(url);
        }

        const logFiles: { name: string, url: string }[] = [];
        const rawLogFiles = [
            ...formData.getAll('logFiles'),
            ...formData.getAll('logFile')
        ].filter((v): v is File => typeof v === 'object' && v !== null && 'size' in v && 'type' in v && 'arrayBuffer' in v);

        for (const file of rawLogFiles) {
            if (logFiles.length >= 5) break;
            if (file.size > LIMITS.LOG_MAX_SIZE) {
                return err(`Log file "${file.name}" must be under ${LIMITS.LOG_MAX_SIZE / 1024 / 1024} MB.`, 400);
            }
            if (file.size > 0) {
                const buffer = await file.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const filename = `logs/${Date.now()}-${Math.random().toString(36).substring(7)}.txt`;
                const url = await uploadToGithub(filename, base64);
                if (url) logFiles.push({ name: sanitizeString(file.name).slice(0, 50) || 'log.txt', url });
            }
        }

        if (!text && images.length === 0 && logFiles.length === 0) {
            return err('Feedback must include text, at least one image, or a log file.', 400);
        }

        const appVersion = sanitizeString(formData.get('appVersion')?.toString() ?? '').slice(0, 32) || null;
        const source = detectSource(formData, req);
        const deviceId = formData.get('deviceId')?.toString().slice(0, 100) || null;
        const ipHash = hashIp(req);
        const userLabels = formData.getAll('labels').map(String).map(sanitizeString).filter(Boolean).slice(0, 5);

        // We omit username uniqueness checks since GitHub issues don't naturally enforce it,
        // and we are not using a database anymore.

        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/cw_admin_token=([^;]+)/);
        const token = match ? match[1] : null;
        const isVerified = token === process.env.ADMIN_PASSKEY;

        const meta = { username, images, logFiles, appVersion, source, deviceId, ipHash, ...(isVerified ? { isVerified: true } : {}) };
        let issueBody = text;
        
        if (images.length > 0) {
            issueBody += '\n\n### Images\n' + images.map(url => `![image](${url})`).join('\n');
        }
        if (logFiles.length > 0) {
            issueBody += '\n\n### Logs\n' + logFiles.map(l => `[${l.name}](${l.url})`).join('\n');
        }
        issueBody += `\n\n<!-- META_START\n${JSON.stringify(meta, null, 2)}\nMETA_END -->`;

        const title = `Feedback from ${username}`;
        
        const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                body: issueBody,
                labels: ['feedback', source, ...userLabels]
            })
        });

        if (!res.ok) {
            console.error('Failed to create issue:', await res.text());
            return err('Failed to save feedback.', 500);
        }

        const issue = await res.json();
        const newItem = {
            id: issue.number.toString(),
            username,
            text: text,
            images: images,
            logFiles: logFiles.map(l => ({ name: l.name, content: '[Log attached]' })),
            appVersion,
            source,
            labels: ['feedback', source, ...userLabels],
            createdAt: new Date().toISOString(),
            replies: []
        };
        return NextResponse.json({ success: true, id: issue.number.toString(), data: newItem }, { status: 201 });

    } catch (error) {
        console.error('[feedback/POST]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}