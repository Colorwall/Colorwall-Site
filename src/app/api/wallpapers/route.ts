import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ─── rate limiter (in-memory, per-ip sliding window) ──────────────────────────
// 60 requests per minute per ip — enough for normal browsing, blocks hammering

const RATE_LIMIT = 60;
const RATE_WINDOW = 60_000; // 1 minute

type RateBucket = { timestamps: number[] };
const rateLimits = new Map<string, RateBucket>();

// clean up stale entries every 5 minutes so we don't leak memory
let lastCleanup = Date.now();
function cleanupRateLimits() {
    const now = Date.now();
    if (now - lastCleanup < 300_000) return;
    lastCleanup = now;
    for (const [ip, bucket] of rateLimits) {
        bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_WINDOW);
        if (bucket.timestamps.length === 0) rateLimits.delete(ip);
    }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
    cleanupRateLimits();
    const now = Date.now();
    let bucket = rateLimits.get(ip);
    if (!bucket) {
        bucket = { timestamps: [] };
        rateLimits.set(ip, bucket);
    }
    // drop timestamps outside the window
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < RATE_WINDOW);
    if (bucket.timestamps.length >= RATE_LIMIT) {
        return { allowed: false, remaining: 0 };
    }
    bucket.timestamps.push(now);
    return { allowed: true, remaining: RATE_LIMIT - bucket.timestamps.length };
}

// ─── origin / referer check ───────────────────────────────────────────────────
// only allow requests from our own site — blocks direct curl/scraper access
const ALLOWED_ORIGINS = [
    "colorwall.xyz",
    "www.colorwall.xyz",
    "localhost",
    "127.0.0.1",
];

function isAllowedOrigin(headersList: Headers): boolean {
    const origin = headersList.get("origin") || "";
    const referer = headersList.get("referer") || "";
    const check = origin || referer;
    if (!check) return false; // no origin/referer = probably a raw api call
    try {
        const hostname = new URL(check).hostname;
        return ALLOWED_ORIGINS.some((allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`));
    } catch {
        return false;
    }
}

// ─── bot user-agent blocker ───────────────────────────────────────────────────
const BOT_PATTERNS = [
    /python-requests/i, /scrapy/i, /httpclient/i, /java\//i,
    /wget/i, /curl/i, /go-http-client/i, /node-fetch/i,
    /axios/i, /postman/i, /insomnia/i, /http/i
];

function isBot(headersList: Headers): boolean {
    const ua = headersList.get("user-agent") || "";
    if (!ua) return true; // no user-agent = suspicious
    return BOT_PATTERNS.some((pat) => pat.test(ua));
}

// ─── shared secret for hash validation ────────────────────────────────────────
const HASH_SECRET = "cw-wallpaper-archive-2026";

// ─── types ────────────────────────────────────────────────────────────────────

import { getIndex, searchEntries } from "@/lib/wallpapers";

// ─── simple hash for token validation ─────────────────────────────────────────

function computeToken(page: number, minuteWindow: number): string {
    const input = `${HASH_SECRET}:${page}:${minuteWindow}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
}

function validateToken(token: string, page: number): boolean {
    const now = Math.floor(Date.now() / 60000);
    // allow current minute and previous minute (2 minute window)
    return token === computeToken(page, now) || token === computeToken(page, now - 1);
}

// ─── route ────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
    const headersList = await headers();

    // ── security: origin / referer check ──────────────────────────────────────
    if (!isAllowedOrigin(headersList)) {
        return NextResponse.json(
            { error: "forbidden" },
            { status: 403, headers: { "X-Blocked": "origin" } }
        );
    }

    // ── security: bot user-agent check ────────────────────────────────────────
    if (isBot(headersList)) {
        return NextResponse.json(
            { error: "forbidden" },
            { status: 403, headers: { "X-Blocked": "bot" } }
        );
    }

    // ── security: rate limit ──────────────────────────────────────────────────
    const clientIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
        || headersList.get("x-real-ip")
        || "unknown";
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
        return NextResponse.json(
            { error: "rate limited — slow down", code: "RATE_LIMITED" },
            {
                status: 429,
                headers: {
                    "Retry-After": "60",
                    "X-RateLimit-Limit": String(RATE_LIMIT),
                    "X-RateLimit-Remaining": "0",
                },
            }
        );
    }

    // ── load pre-built index ──────────────────────────────────────────────────
    const idx = getIndex();
    if (!idx) {
        return NextResponse.json(
            {
                status: "no_index",
                error: "wallpaper index not built yet — run `npm run index:wallpapers`",
                items: [],
                total: 0,
                page: 1,
                limit: 20,
                hasMore: false,
                nextToken: null,
            },
            { status: 503 }
        );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const tag = searchParams.get("tag") || "";
    const query = searchParams.get("q") || "";
    const token = searchParams.get("token") || "";

    // validate token — page 1 is always free (initial load), rest need token
    if (page > 1 && !validateToken(token, page)) {
        return NextResponse.json(
            { error: "invalid or expired token", code: "INVALID_TOKEN" },
            { status: 403 }
        );
    }

    // ── filter / search ───────────────────────────────────────────────────────
    let items = idx.entries;

    // server-side search by query string
    if (query) {
        items = searchEntries(query, idx);
    }
    // filter by exact tag (legacy support)
    else if (tag) {
        const lower = tag.toLowerCase();
        const indices = idx.tagIndex.get(lower);
        items = indices ? Array.from(indices).map(i => idx.entries[i]) : [];
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const slice = items.slice(start, start + limit);

    // generate token for the next page
    const nextPage = page + 1;
    const nextMinute = Math.floor(Date.now() / 60000);
    const nextToken = start + limit < total ? computeToken(nextPage, nextMinute) : null;

    return NextResponse.json(
        {
            status: "ready",
            items: slice,
            total,
            page,
            limit,
            hasMore: start + limit < total,
            nextToken,
            builtAt: idx.builtAt,
        },
        {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
                "X-RateLimit-Limit": String(RATE_LIMIT),
                "X-RateLimit-Remaining": String(rateCheck.remaining),
            },
        }
    );
}
