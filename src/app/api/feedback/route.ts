import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip null bytes and control characters that break MongoDB / display. */
function sanitizeString(value: string): string {
    return value
        .replace(/\0/g, '')                       // null bytes
        .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '') // ASCII control chars (keep \t \n \r)
        .trim();
}

function err(message: string, status: number) {
    return NextResponse.json({ success: false, error: message }, { status });
}

/** Hash the IP so we never store PII in the database. */
function hashIp(req: Request): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const raw =
        (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
        req.headers.get('x-real-ip') ||
        'unknown';
    return crypto.createHash('sha256').update(raw).digest('hex');
}

/** Detect submission source with priority:
 *  1. Explicit `source` field sent by the client (validated against allowlist)
 *  2. Tauri user-agent detection (desktop app)
 *  3. Default → Web
 */
function detectSource(formData: FormData, req: Request): 'App' | 'Web' {
    const sourceStr = formData.get('source');
    const explicit = typeof sourceStr === 'string' ? sourceStr.trim() : null;
    if (explicit && ALLOWED_SOURCES.has(explicit)) {
        return explicit as 'App' | 'Web';
    }
    const ua = req.headers.get('user-agent') ?? '';
    return ua.includes('Tauri') ? 'App' : 'Web';
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
    try {
        const url = new URL(req.url);
        const skip = Math.max(0, parseInt(url.searchParams.get('skip') || '0', 10));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));

        const db = await getDb();
        const docs = await db.collection('feedback')
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();

        const formatted = docs.map(doc => ({
            id:        doc._id.toString(),
            username:  doc.username ?? 'Anonymous',
            text:      doc.text     ?? '',
            images:    doc.images   ?? [],
            logFiles:  doc.logFiles ?? (doc.logFile ? [{ name: 'log.txt', content: doc.logFile }] : []),
            appVersion: doc.appVersion,
            source:    (doc.source === 'App' ? 'App' : 'Web') as 'App' | 'Web',
            createdAt: doc.createdAt,
            replies:   (doc.replies || []).map((r: any) => ({
                id: r.id,
                username: r.username,
                text: r.text,
                createdAt: r.createdAt
            })),
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('[feedback/GET]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // ── 1. Parse form data ───────────────────────────────────────────────
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return err('Invalid multipart/form-data payload.', 400);
        }

        // ── 2. Validate text fields ──────────────────────────────────────────
        const rawUsername = formData.get('username')?.toString() ?? '';
        const rawText     = formData.get('text')?.toString() ?? '';

        let username = sanitizeString(rawUsername) || 'Anonymous';
        const text     = sanitizeString(rawText);

        if (username.length > LIMITS.USERNAME_MAX) {
            return err(`Username must be ${LIMITS.USERNAME_MAX} characters or fewer.`, 400);
        }

        if (text.length > LIMITS.TEXT_MAX) {
            return err(`Feedback text must be ${LIMITS.TEXT_MAX} characters or fewer.`, 400);
        }

        // ── 3. Parse & validate files ────────────────────────────────────────
        const images: string[] = [];
        let   logFileContent: string | null = null;
        const imageEntries = formData.getAll('images'); // multi-file field

        // Accept both `images` (array) and legacy `image0`…`imageN` keys
        const allImageFiles = [
            ...imageEntries,
            ...Array.from(formData.keys())
                .filter(k => /^image\d+$/.test(k))
                .flatMap(k => formData.getAll(k)),
        ].filter((v): v is File => typeof v === 'object' && v !== null && 'size' in v && 'type' in v && 'arrayBuffer' in v);

        for (const file of allImageFiles) {
            if (images.length >= LIMITS.IMAGE_COUNT) break;

            if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
                return err(
                    `Unsupported image type "${file.type}". Allowed: JPEG, PNG, WebP, GIF.`,
                    400,
                );
            }

            if (file.size > LIMITS.IMAGE_MAX_SIZE) {
                return err(`Each image must be under ${LIMITS.IMAGE_MAX_SIZE / 1024 / 1024} MB.`, 400);
            }

            if (file.size === 0) continue; // skip empty blobs silently

            const buffer = await file.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            images.push(`data:${file.type};base64,${base64}`);
        }

        // Log files
        const logFiles: { name: string, content: string }[] = [];
        const rawLogFiles = [
            ...formData.getAll('logFiles'),
            ...formData.getAll('logFile') // fallback for legacy
        ].filter((v): v is File => typeof v === 'object' && v !== null && 'size' in v && 'type' in v && 'arrayBuffer' in v);

        for (const file of rawLogFiles) {
            if (logFiles.length >= 5) break;
            
            if (file.size > LIMITS.LOG_MAX_SIZE) {
                return err(`Log file "${file.name}" must be under ${LIMITS.LOG_MAX_SIZE / 1024 / 1024} MB.`, 400);
            }
            if (file.size > 0) {
                logFiles.push({
                    name: sanitizeString(file.name).slice(0, 50) || 'log.txt',
                    content: await file.text()
                });
            }
        }

        // ── 4. Require at least something meaningful ─────────────────────────
        if (!text && images.length === 0 && logFiles.length === 0) {
            return err('Feedback must include text, at least one image, or a log file.', 400);
        }

        // ── 5. Optional metadata ─────────────────────────────────────────────
        const appVersion = sanitizeString(
            formData.get('appVersion')?.toString() ?? ''
        ).slice(0, 32) || null;

        const source = detectSource(formData, req);

        const ipHash   = hashIp(req);
        const db       = await getDb();
        const now      = new Date();

        // ── 5.5 Username Collision Check ─────────────────────────────────────
        if (username !== 'Anonymous') {
            const existingUser = await db.collection('feedback').findOne({
                username: { $regex: new RegExp(`^${username}$`, 'i') },
                ipHash: { $ne: ipHash }
            });

            if (existingUser) {
                if (source === 'Web') {
                    return err('This username is already taken by someone else.', 400);
                } else {
                    const tag = Math.floor(1000 + Math.random() * 9000);
                    username = `${username}#${tag}`;
                }
            }
        }

        // ── 6. Atomic rate-limit check ───────────────────────────────────────
        const expiresAt = new Date(now.getTime() + LIMITS.RATE_WINDOW_MS);

        const rl = await db.collection('rateLimits').findOneAndUpdate(
            { ipHash, expiresAt: { $gt: now } },            // find an active window
            { $setOnInsert: { ipHash, createdAt: now, expiresAt } },
            { upsert: true, returnDocument: 'before' },     // "before" → null if inserted fresh
        );

        // If a document existed before our upsert, the IP is rate-limited
        if (rl !== null) {
            return err('You have already submitted feedback recently. Please wait 1 minute.', 429);
        }

        // ── 7. Persist feedback ──────────────────────────────────────────────
        const result = await db.collection('feedback').insertOne({
            username,
            text,
            images,
            logFiles,
            appVersion,
            ipHash,
            source,
            createdAt:  now,
        });

        return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });

    } catch (error) {
        console.error('[feedback/POST]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}