import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, createRateLimitResponse, getClientIp } from '@/lib/rate-limit';

// rate limit tiers configured per route category
const TIERS = {
    // aggressive limit for the public open-interest endpoint: 5 hits per 10 seconds
    OPEN_INTEREST: { limit: 5, windowMs: 10_000 },
    // baseline guard for general public api endpoints: 60 hits per 60 seconds
    GENERAL_API: { limit: 60, windowMs: 60_000 },
};

// global next.js edge middleware intercepting incoming traffic
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // allow cors options preflight requests to pass through unthrottled
    if (req.method === 'OPTIONS') {
        return NextResponse.next();
    }

    // extract client ip address using cloudflare and proxy priority chain
    const clientIp = getClientIp(req);

    // 1. dedicated aggressive rate limiting for open-interest endpoint
    if (pathname.startsWith('/api/open-interest')) {
        const rateLimitKey = `${clientIp}:open-interest`;
        const result = checkRateLimit(
            rateLimitKey,
            TIERS.OPEN_INTEREST.limit,
            TIERS.OPEN_INTEREST.windowMs
        );

        if (!result.success) {
            return createRateLimitResponse(result);
        }

        const res = NextResponse.next();
        res.headers.set('X-RateLimit-Limit', String(result.limit));
        res.headers.set('X-RateLimit-Remaining', String(result.remaining));
        res.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetMs / 1000)));
        return res;
    }

    // 2. general baseline protection for all other api routes
    if (pathname.startsWith('/api/')) {
        const rateLimitKey = `${clientIp}:general-api`;
        const result = checkRateLimit(
            rateLimitKey,
            TIERS.GENERAL_API.limit,
            TIERS.GENERAL_API.windowMs
        );

        if (!result.success) {
            return createRateLimitResponse(result);
        }

        const res = NextResponse.next();
        res.headers.set('X-RateLimit-Limit', String(result.limit));
        res.headers.set('X-RateLimit-Remaining', String(result.remaining));
        res.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetMs / 1000)));
        return res;
    }

    return NextResponse.next();
}

// configure matcher to exclusively target api routes without overhead on static assets
export const config = {
    matcher: ['/api/:path*'],
};
