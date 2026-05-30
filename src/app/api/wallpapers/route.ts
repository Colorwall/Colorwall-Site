import { NextResponse } from "next/server";
import { headers } from "next/headers";

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
    /axios/i, /postman/i, /insomnia/i, /httpie/i,
];

function isBot(headersList: Headers): boolean {
    const ua = headersList.get("user-agent") || "";
    if (!ua) return true; // no user-agent = suspicious
    return BOT_PATTERNS.some((pat) => pat.test(ua));
}

// ─── shared secret for hash validation ────────────────────────────────────────
// not real security — just raises the bar so bots can't blindly paginate
const HASH_SECRET = "cw-wallpaper-archive-2026";

// ─── source config ────────────────────────────────────────────────────────────

type SourceId = "archive" | "yapude";

interface SourceConfig {
    id: SourceId;
    url: string;
    ttl: number; // cache ttl in ms
}

// ttls bumped to 6 hours — the readmes don't change that frequently
// and downloading 14.5 MB (yapude) every 30 min was destroying cold start times on vercel
const SOURCES: SourceConfig[] = [
    {
        id: "archive",
        url: "https://raw.githubusercontent.com/LaxentaInc/Wallpaper-Archive/main/README.md",
        ttl: 1000 * 60 * 60 * 6, // 6 hours
    },
    {
        id: "yapude",
        url: "https://raw.githubusercontent.com/yapude/wallpapers/main/README.md",
        ttl: 1000 * 60 * 60 * 6, // 6 hours — was 30 min but that downloads 14.5 MB way too often
    },
];

// ─── in-memory cache (per source) ─────────────────────────────────────────────

type WallpaperEntry = { url: string; title: string; tags: string[]; source: SourceId };

type SourceCache = { data: WallpaperEntry[]; fetchedAt: number; etag?: string };

const caches: Record<SourceId, SourceCache | null> = {
    archive: null,
    yapude: null,
};

// ─── parser ───────────────────────────────────────────────────────────────────
// both repos use the same markdown table format:
// | <img src="..."> | **Title** ... | tag1, tag2, ... |

function parseReadme(raw: string, source: SourceId): WallpaperEntry[] {
    const entries: WallpaperEntry[] = [];
    const rowRegex = /\|\s*<img\s+src="([^"]+)"[^>]*>\s*\|\s*\*\*([^*]+)\*\*.*?\|\s*([^|]*)\|/g;
    let match: RegExpExecArray | null;
    while ((match = rowRegex.exec(raw)) !== null) {
        const url = match[1].trim();
        const title = match[2].trim().replace(/\s*(Desktop|Laptop|PC)\s+Wallpaper\s*(4K)?$/i, "").trim();
        const tagsRaw = match[3].trim();
        const tags = tagsRaw
            ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
            : [];
        entries.push({ url, title, tags, source });
    }
    
    // Shuffle the array to randomize the wallpaper order
    for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    
    return entries;
}

// ─── deduplication & merging ──────────────────────────────────────────────────
// deduplicate by url — keep the entry with more tags (richer metadata)

function deduplicateByUrl(entries: WallpaperEntry[]): WallpaperEntry[] {
    const seen = new Map<string, WallpaperEntry>();
    for (const entry of entries) {
        const existing = seen.get(entry.url);
        if (!existing || entry.tags.length > existing.tags.length) {
            seen.set(entry.url, entry);
        }
    }
    return Array.from(seen.values());
}

// ─── interleave two arrays for variety ────────────────────────────────────────
// alternates picks from each source so the user sees a mix

function interleave(a: WallpaperEntry[], b: WallpaperEntry[]): WallpaperEntry[] {
    const result: WallpaperEntry[] = [];
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < a.length) result.push(a[i]);
        if (i < b.length) result.push(b[i]);
    }
    return result;
}

// ─── simple hash for token validation ─────────────────────────────────────────
// token = hex(simple hash of: secret + page + minute-window)
// client generates same hash, api checks it matches

function computeToken(page: number, minuteWindow: number): string {
    // simple fnv-1a style hash — no crypto needed, just a speed bump
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

// ─── fetch & cache a single source ────────────────────────────────────────────
// uses etag-based conditional requests so we skip re-downloading 14.5 MB
// when the content hasn't actually changed

async function fetchSource(config: SourceConfig): Promise<WallpaperEntry[]> {
    const cached = caches[config.id];
    if (cached && Date.now() - cached.fetchedAt < config.ttl) {
        return cached.data;
    }

    try {
        // build conditional request headers if we have a cached etag
        const fetchHeaders: Record<string, string> = {};
        if (cached?.etag) {
            fetchHeaders["If-None-Match"] = cached.etag;
        }

        const res = await fetch(config.url, {
            cache: "no-store",
            headers: fetchHeaders,
        });

        // 304 = content unchanged, just refresh the timestamp
        if (res.status === 304 && cached) {
            caches[config.id] = { ...cached, fetchedAt: Date.now() };
            return cached.data;
        }

        if (!res.ok) throw new Error(`github returned ${res.status}`);
        const raw = await res.text();
        const parsed = parseReadme(raw, config.id);
        const etag = res.headers.get("etag") || undefined;
        caches[config.id] = { data: parsed, fetchedAt: Date.now(), etag };
        return parsed;
    } catch (err) {
        if (cached) {
            // serve stale data if available
            console.error(`failed to refresh ${config.id} cache, serving stale:`, err);
            return cached.data;
        }
        console.error(`failed to fetch ${config.id} source:`, err);
        return []; // graceful — return empty instead of crashing
    }
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const tag = searchParams.get("tag") || "";
    const token = searchParams.get("token") || "";

    // validate token — page 1 is always free (initial load), rest need token
    if (page > 1 && !validateToken(token, page)) {
        return NextResponse.json(
            { error: "invalid or expired token", code: "INVALID_TOKEN" },
            { status: 403 }
        );
    }

    // fetch both sources in parallel — if one fails, the other still works
    const results = await Promise.allSettled(
        SOURCES.map((src) => fetchSource(src))
    );

    // collect entries from each source
    const sourceEntries: WallpaperEntry[][] = results.map((r) =>
        r.status === "fulfilled" ? r.value : []
    );

    // if both sources returned nothing, return error
    if (sourceEntries.every((arr) => arr.length === 0)) {
        return NextResponse.json(
            { error: "failed to fetch wallpaper sources" },
            { status: 502 }
        );
    }

    // interleave then deduplicate for variety across sources
    const merged = interleave(sourceEntries[0], sourceEntries[1]);
    const allEntries = deduplicateByUrl(merged);

    let items = allEntries;

    // filter by tag
    if (tag) {
        const lower = tag.toLowerCase();
        items = items.filter((w) => w.tags.some((t) => t.toLowerCase() === lower));
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const slice = items.slice(start, start + limit);

    // generate token for the next page so the client can request it
    const nextPage = page + 1;
    const nextMinute = Math.floor(Date.now() / 60000);
    const nextToken = start + limit < total ? computeToken(nextPage, nextMinute) : null;

    // collect tags ranked by frequency — most popular first (only on page 1)
    let allTags: string[] | undefined;
    if (page === 1) {
        const tagCounts = new Map<string, number>();
        for (const w of allEntries) {
            for (const t of w.tags) {
                const lower = t.toLowerCase();
                tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
            }
        }
        // sort by count descending, keep tags with >= 2 occurrences
        allTags = [...tagCounts.entries()]
            .filter(([, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag);
    }

    return NextResponse.json(
        {
            items: slice,
            total,
            page,
            limit,
            hasMore: start + limit < total,
            nextToken,
            ...(allTags ? { tags: allTags } : {}),
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
