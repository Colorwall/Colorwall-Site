import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ─── types ────────────────────────────────────────────────────────────────────

export type SourceId = "archive" | "yapude";
export type WallpaperEntry = { url: string; title: string; tags: string[]; source: SourceId };

// ─── pre-built index format (from build-wallpaper-index.mjs) ──────────────────
// compact format: entries are [prefixIndex, filename, title, [tags], source]

export interface IndexFile {
    version: number;
    builtAt: string;
    totalEntries: number;
    totalTags: number;
    tags: string[];
    prefixes: string[];
    entries: [number, string, string, string[], string][];
}

// ─── in-memory index (loaded once from pre-built json) ────────────────────────

export interface LoadedIndex {
    entries: WallpaperEntry[];
    tags: string[];
    builtAt: string;
    // reverse index: lowercased tag -> set of entry indices for fast tag search
    tagIndex: Map<string, Set<number>>;
}

let loadedIndex: LoadedIndex | null = null;

export function getIndex(): LoadedIndex | null {
    if (loadedIndex) return loadedIndex;

    // try to load from pre-built data file
    const dataPath = join(process.cwd(), "data", "wallpapers.json");
    if (!existsSync(dataPath)) {
        console.warn("wallpaper index not found at", dataPath);
        console.warn("run `npm run index:wallpapers` to generate it");
        return null;
    }

    try {
        const startMs = Date.now();
        const raw = readFileSync(dataPath, "utf-8");
        const data: IndexFile = JSON.parse(raw);

        // expand compact format back to full entries
        const entries: WallpaperEntry[] = data.entries.map(([pi, filename, title, tags, source]) => ({
            url: data.prefixes[pi] + filename,
            title,
            tags,
            source: source as SourceId,
        }));

        // build reverse tag index for fast lookups
        const tagIndex = new Map<string, Set<number>>();
        for (let i = 0; i < entries.length; i++) {
            for (const tag of entries[i].tags) {
                const lower = tag.toLowerCase();
                let set = tagIndex.get(lower);
                if (!set) {
                    set = new Set();
                    tagIndex.set(lower, set);
                }
                set.add(i);
            }
        }

        loadedIndex = {
            entries,
            tags: data.tags,
            builtAt: data.builtAt,
            tagIndex,
        };

        const elapsed = Date.now() - startMs;
        console.log(`loaded wallpaper index: ${entries.length.toLocaleString()} entries, ${tagIndex.size.toLocaleString()} unique tags in ${elapsed}ms`);
        return loadedIndex;
    } catch (err) {
        console.error("failed to load wallpaper index:", err);
        return null;
    }
}

// ─── server-side search ───────────────────────────────────────────────────────
// searches across titles and tags. returns entries sorted by relevance.

export function searchEntries(query: string, idx: LoadedIndex): WallpaperEntry[] {
    const q = query.toLowerCase().trim();
    if (!q) return idx.entries;

    // FAST PATH: exact tag lookup
    const exactIndices = idx.tagIndex.get(q);
    if (exactIndices && exactIndices.size > 0) {
        const res: WallpaperEntry[] = [];
        for (const i of exactIndices) {
            res.push(idx.entries[i]);
        }
        return res;
    }

    // SLOW PATH: linear scan for partial/fuzzy matches
    type Scored = { entry: WallpaperEntry; score: number };
    const results: Scored[] = [];

    for (let i = 0; i < idx.entries.length; i++) {
        const entry = idx.entries[i];
        let score = 0;

        // tag contains query (partial)
        for (let j = 0; j < entry.tags.length; j++) {
            if (entry.tags[j].toLowerCase().includes(q)) {
                score = 7;
                break;
            }
        }

        // title contains query
        if (score === 0 && entry.title.toLowerCase().includes(q)) {
            score = 5;
        }

        // fuzzy title match (subsequence)
        if (score === 0) {
            const title = entry.title.toLowerCase();
            let qi = 0;
            for (let ti = 0; ti < title.length && qi < q.length; ti++) {
                if (q[qi] === title[ti]) qi++;
            }
            if (qi === q.length) score = 2;
        }

        if (score > 0) results.push({ entry, score });
    }

    // sort by score descending
    results.sort((a, b) => b.score - a.score);
    return results.map(r => r.entry);
}

// ─── simple hash for token validation ─────────────────────────────────────────

const HASH_SECRET = "cw-wallpaper-archive-2026";

export function computeToken(page: number, minuteWindow: number): string {
    const input = `${HASH_SECRET}:${page}:${minuteWindow}`;
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
}
