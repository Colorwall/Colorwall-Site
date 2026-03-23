import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

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
        const text     = sanitizeString(rawText || '');

        if (!text || text.length > 2000) {
            return err('Reply must be between 1 and 2000 characters.', 400);
        }
        if (!username || username.length > 64) {
            return err('Username must be valid.', 400);
        }

        const ipHash = hashIp(req);
        const db = await getDb();
        const now = new Date();
        const RATE_WINDOW_MS = 60 * 1000; // 1 min

        // Rate limit uniquely for replies, so replying doesn't block posting threads
        const rlDocId = `reply:${ipHash}`;
        const expiresAt = new Date(now.getTime() + RATE_WINDOW_MS);

        const rl = await db.collection('rateLimits').findOneAndUpdate(
            { ipHash: rlDocId, expiresAt: { $gt: now } },
            { $setOnInsert: { ipHash: rlDocId, createdAt: now, expiresAt } },
            { upsert: true, returnDocument: 'before' }
        );

        if (rl !== null) {
            return err('You are replying too fast. Please wait 1 minute.', 429);
        }

        let objectId: ObjectId;
        try {
            objectId = new ObjectId(threadId);
        } catch {
            return err('Invalid thread ID format.', 400);
        }

        const reply = {
            id: new ObjectId().toString(),
            username,
            text,
            createdAt: now,
            ipHash
        };

        const result = await db.collection('feedback').updateOne(
            { _id: objectId },
            { $push: { replies: reply } as any }
        );

        if (result.matchedCount === 0) {
            return err('Thread not found. It may have been deleted.', 404);
        }

        return NextResponse.json({ success: true, reply }, { status: 201 });

    } catch (error) {
        console.error('[feedback/reply/POST]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
