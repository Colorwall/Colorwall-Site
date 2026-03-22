import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashIp(req: Request): string {
    const raw =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        'unknown';
    return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * GET /api/feedback/identity
 * Returns the stored username for the caller's hashed IP, if any.
 * Used to auto-restore username across devices / after clearing localStorage.
 */
export async function GET(req: Request) {
    try {
        const ipHash = hashIp(req);
        const db     = await getDb();

        // First check dedicated identity collection
        const identity = await db.collection('identities').findOne({ ipHash });
        if (identity?.username) {
            return NextResponse.json({ username: identity.username });
        }

        // Fall back: most recent feedback from this IP
        const latest = await db.collection('feedback')
            .findOne({ ipHash }, { sort: { createdAt: -1 }, projection: { username: 1 } });

        return NextResponse.json({ username: latest?.username ?? null });
    } catch (err) {
        console.error('[identity/GET]', err);
        return NextResponse.json({ username: null }, { status: 500 });
    }
}

/**
 * POST /api/feedback/identity
 * Body: { username: string }
 * Upserts the username↔ipHash association.
 * Called once when a user first sets their display name.
 */
export async function POST(req: Request) {
    try {
        const { username } = await req.json() as { username?: string };

        if (!username?.trim() || username.length > 64) {
            return NextResponse.json({ error: 'Invalid username.' }, { status: 400 });
        }

        const ipHash = hashIp(req);
        const db     = await getDb();

        await db.collection('identities').updateOne(
            { ipHash },
            {
                $set:         { username: username.trim(), updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true },
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[identity/POST]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}