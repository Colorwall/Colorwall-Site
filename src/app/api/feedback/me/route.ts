import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import crypto from 'crypto';

function hashIp(req: Request): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const raw =
        (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
        req.headers.get('x-real-ip') ||
        'unknown';
    return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const deviceId = url.searchParams.get('deviceId') || '';
        const username = url.searchParams.get('username') || '';
        const skip = Math.max(0, parseInt(url.searchParams.get('skip') || '0', 10));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
        const ipHash = hashIp(req);

        const db = await getDb();
        
        let query: any = {};
        
        if (deviceId && username) {
            query = {
                $or: [
                    { deviceId },
                    { ipHash, username: { $regex: new RegExp(`^${username}$`, 'i') } }
                ]
            };
        } else if (deviceId) {
            query = { deviceId };
        } else if (username) {
            // Fallback for strictly IP + username
            query = { 
                ipHash, 
                username: { $regex: new RegExp(`^${username}$`, 'i') } 
            };
        } else {
            return NextResponse.json({ success: false, error: 'Missing identifying parameters.' }, { status: 400 });
        }

        const docs = await db.collection('feedback')
            .find(query)
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
        console.error('[feedback/me/GET]', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
