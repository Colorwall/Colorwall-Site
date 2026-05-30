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
        let body;
        try {
            body = await req.json();
        } catch {
            return err('Invalid JSON payload.', 400);
        }

        const { threadId, text: rawText, username: rawUsername } = body;

        if (!threadId || typeof threadId !== 'string') {
            return err('Invalid thread ID.', 400);
        }

        const username = sanitizeString(rawUsername || '');
        const text     = sanitizeString(rawText || '').replace(/META_START/g, 'META_DISABLED');

        if (!text || text.length > 2000) {
            return err('Reply must be between 1 and 2000 characters.', 400);
        }
        if (!username || username.length > 64) {
            return err('Username must be valid.', 400);
        }

        const ipHash = hashIp(req);
        
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/cw_admin_token=([^;]+)/);
        const token = match ? match[1] : null;
        const isVerified = token === process.env.ADMIN_PASSKEY;

        const issueNumber = parseInt(threadId, 10);
        if (isNaN(issueNumber)) return err('Invalid thread ID format.', 400);

        const meta = { username, ipHash, ...(isVerified ? { isVerified: true } : {}) };
        const commentBody = `${text}\n\n<!-- META_START\n${JSON.stringify(meta, null, 2)}\nMETA_END -->`;

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
            text,
            isVerified,
            createdAt: new Date(comment.created_at)
        };

        return NextResponse.json({ success: true, reply }, { status: 201 });

    } catch (error) {
        console.error('[feedback/reply/POST]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
