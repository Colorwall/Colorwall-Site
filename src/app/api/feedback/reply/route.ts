import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ─── GitHub Config ────────────────────────────────────────────────────────────
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

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

export async function POST(req: Request) {
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return err('GitHub config missing.', 500);
    }
    try {
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return err('Invalid multipart/form-data payload.', 400);
        }

        const threadId    = formData.get('threadId')?.toString() ?? '';
        const rawText     = formData.get('text')?.toString() ?? '';
        const rawUsername = formData.get('username')?.toString() ?? '';

        if (!threadId || typeof threadId !== 'string') {
            return err('Invalid thread ID.', 400);
        }

        const username = sanitizeString(rawUsername || '');
        const text     = sanitizeString(rawText || '').replace(/META_START/g, 'META_DISABLED');

        const images: string[] = [];
        const imageEntries = formData.getAll('images');
        const allImageFiles = [
            ...imageEntries,
        ].filter((v): v is File => typeof v === 'object' && v !== null && 'size' in v && 'type' in v && 'arrayBuffer' in v);

        for (const file of allImageFiles) {
            if (images.length >= 5) break;
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
                return err(`Unsupported image type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.`, 400);
            }
            if (file.size > 2 * 1024 * 1024) {
                return err(`Each image must be under 2 MB.`, 400);
            }
            if (file.size === 0) continue;

            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const ext = file.name.split('.').pop() || 'png';
            const filename = `images/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            
            // Upload to Github
            const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: `Upload ${filename}`, content: base64 })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.content?.download_url) {
                    images.push(data.content.download_url);
                }
            }
        }

        if (!text && images.length === 0) {
            return err('Reply must include text or an image.', 400);
        }
        if (text.length > 2000) {
            return err('Reply text must be 2000 characters or fewer.', 400);
        }

        const ipHash = hashIp(req);
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/cw_admin_token=([^;]+)/);
        const token = match ? match[1] : null;
        const isVerified = token === process.env.ADMIN_PASSKEY;

        const issueNumber = parseInt(threadId, 10);
        if (isNaN(issueNumber)) return err('Invalid thread ID format.', 400);

        const meta = { username, ipHash, ...(isVerified ? { isVerified: true } : {}) };
        
        let commentBody = text;
        if (images.length > 0) {
            commentBody += '\n\n' + images.map(url => `![image](${url})`).join('\n');
        }
        commentBody += `\n\n<!-- META_START\n${JSON.stringify(meta, null, 2)}\nMETA_END -->`;

        const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ body: commentBody })
        });

        if (!res.ok) {
            if (res.status === 404) {
                return err('Thread not found. It may have been deleted.', 404);
            }
            return err('Failed to post reply.', 500);
        }

        const comment = await res.json();
        const reply = {
            id: comment.id.toString(),
            username,
            text: text + (images.length > 0 ? '\n\n' + images.map(url => `![image](${url})`).join('\n') : ''),
            isVerified,
            createdAt: new Date(comment.created_at)
        };

        return NextResponse.json({ success: true, reply }, { status: 201 });

    } catch (error) {
        console.error('[feedback/reply/POST]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
