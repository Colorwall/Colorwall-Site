import { NextResponse } from "next/server";

// ─── shared secret for hash validation ────────────────────────────────────────
// not real security — just raises the bar so bots can't blindly paginate
const HASH_SECRET = "cw-wallpaper-archive-2026";

// ─── in-memory cache ──────────────────────────────────────────────────────────

type WallpaperEntry = { url: string; title: string; tags: string[] };

let cache: { data: WallpaperEntry[]; fetchedAt: number } | null = null;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// ─── parser ───────────────────────────────────────────────────────────────────

function parseReadme(raw: string): WallpaperEntry[] {
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
        entries.push({ url, title, tags });
    }
    return entries;
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

    // fetch & cache the readme
    if (!cache || Date.now() - cache.fetchedAt > CACHE_TTL) {
        try {
            const res = await fetch(
                "https://raw.githubusercontent.com/LaxentaInc/Wallpaper-Archive/main/README.md",
                { next: { revalidate: 3600 } }
            );
            if (!res.ok) throw new Error(`github returned ${res.status}`);
            const raw = await res.text();
            cache = { data: parseReadme(raw), fetchedAt: Date.now() };
        } catch (err) {
            if (cache) {
                console.error("failed to refresh wallpaper cache, serving stale:", err);
            } else {
                return NextResponse.json({ error: "failed to fetch wallpaper archive" }, { status: 502 });
            }
        }
    }

    let items = cache!.data;

    // filter by tag
    if (tag) {
        const lower = tag.toLowerCase();
        items = items.filter((w) => w.tags.some((t) => t.toLowerCase() === lower));
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const slice = items.slice(start, start + limit);

    // generate token for the NEXT page so the client can request it
    const nextPage = page + 1;
    const nextMinute = Math.floor(Date.now() / 60000);
    const nextToken = start + limit < total ? computeToken(nextPage, nextMinute) : null;

    // collect unique tags (only on first page to save bandwidth)
    const allTags = page === 1 ? [...new Set(cache!.data.flatMap((w) => w.tags))].sort() : undefined;

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
