import { NextResponse } from "next/server";

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

const SOURCES: SourceConfig[] = [
    {
        id: "archive",
        url: "https://raw.githubusercontent.com/LaxentaInc/Wallpaper-Archive/main/README.md",
        ttl: 1000 * 60 * 60, // 1 hour
    },
    {
        id: "yapude",
        url: "https://raw.githubusercontent.com/yapude/wallpapers/main/README.md",
        ttl: 1000 * 60 * 30, // 30 minutes — scraper keeps appending
    },
];

// ─── in-memory cache (per source) ─────────────────────────────────────────────

type WallpaperEntry = { url: string; title: string; tags: string[]; source: SourceId };

type SourceCache = { data: WallpaperEntry[]; fetchedAt: number };

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

async function fetchSource(config: SourceConfig): Promise<WallpaperEntry[]> {
    const cached = caches[config.id];
    if (cached && Date.now() - cached.fetchedAt < config.ttl) {
        return cached.data;
    }

    try {
        const res = await fetch(config.url, { cache: "no-store" });
        if (!res.ok) throw new Error(`github returned ${res.status}`);
        const raw = await res.text();
        const parsed = parseReadme(raw, config.id);
        caches[config.id] = { data: parsed, fetchedAt: Date.now() };
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

    // collect unique tags (only on first page to save bandwidth)
    const allTags = page === 1 ? [...new Set(allEntries.flatMap((w) => w.tags))].sort() : undefined;

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
            },
        }
    );
}
