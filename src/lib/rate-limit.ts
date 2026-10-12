import { NextResponse } from 'next/server';

// metadata returned by the sliding window evaluator for headers and error bodies
export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetMs: number;
    retryAfterSeconds: number;
}

// memory store maintaining timestamp arrays keyed by composite identifier (ip + route)
const requestLogs = new Map<string, number[]>();

// last cleanup epoch timestamp to prevent map unbounded growth over time
let lastCleanupEpoch = Date.now();
const CLEANUP_CADENCE_MS = 60_000;

// periodic cleanup helper purging keys whose timestamps have completely elapsed
function purgeStaleEntries(windowMs: number) {
    const now = Date.now();
    if (now - lastCleanupEpoch < CLEANUP_CADENCE_MS) {
        return;
    }
    lastCleanupEpoch = now;

    const threshold = now - windowMs;
    for (const [key, timestamps] of requestLogs.entries()) {
        const active = timestamps.filter((t) => t > threshold);
        if (active.length === 0) {
            requestLogs.delete(key);
        } else {
            requestLogs.set(key, active);
        }
    }
}

// extract genuine visitor ip address adhering to cloudflare and reverse proxy precedence
export function getClientIp(req: Request): string {
    // 1. cloudflare injected visitor ip header
    const cfIp = req.headers.get('cf-connecting-ip');
    if (cfIp) {
        return cfIp.trim();
    }

    // 2. standard proxy forwarding header with client ip first
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        const clientIp = forwardedFor.split(',')[0].trim();
        if (clientIp) {
            return clientIp;
        }
    }

    // 3. reverse proxy direct visitor ip header
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    // 4. local loopback fallback for dev environments
    return '127.0.0.1';
}

// evaluate incoming request against rolling sliding window log
export function checkRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
): RateLimitResult {
    const now = Date.now();
    purgeStaleEntries(windowMs);

    const windowStart = now - windowMs;
    const timestamps = requestLogs.get(identifier) || [];

    // filter timestamps to strictly keep hits inside the active sliding window
    const recentHits = timestamps.filter((t) => t > windowStart);

    if (recentHits.length >= limit) {
        const oldestHit = recentHits[0];
        const resetMs = oldestHit + windowMs;
        const retryAfterSeconds = Math.max(1, Math.ceil((resetMs - now) / 1000));

        return {
            success: false,
            limit,
            remaining: 0,
            resetMs,
            retryAfterSeconds,
        };
    }

    // record current request epoch into rolling log
    recentHits.push(now);
    requestLogs.set(identifier, recentHits);

    const remaining = limit - recentHits.length;
    const oldestHit = recentHits[0];
    const resetMs = oldestHit + windowMs;
    const retryAfterSeconds = 0;

    return {
        success: true,
        limit,
        remaining,
        resetMs,
        retryAfterSeconds,
    };
}

// cors headers allowing external callers and bots to receive structured 429 response
const RATE_LIMIT_CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-sync-secret',
};

// construct standard rfc compliant 429 response with telemetry headers
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
    return NextResponse.json(
        {
            success: false,
            error: 'too_many_requests',
            message: 'rate limit exceeded. slow down, twin.',
            limit: result.limit,
            retryAfterSeconds: result.retryAfterSeconds,
        },
        {
            status: 429,
            headers: {
                ...RATE_LIMIT_CORS_HEADERS,
                'Retry-After': String(result.retryAfterSeconds),
                'X-RateLimit-Limit': String(result.limit),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(Math.ceil(result.resetMs / 1000)),
            },
        }
    );
}
