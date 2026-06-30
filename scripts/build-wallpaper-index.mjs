// ─── wallpaper index builder ──────────────────────────────────────────────────
// runs at build time (prebuild script) — downloads both readme sources,
// parses every table row, deduplicates, and writes a compact json index
// to data/wallpapers.json. the api route reads this file at startup
// instead of fetching 105mb on every cold start.
//
// usage: node scripts/build-wallpaper-index.mjs
// runs automatically via "prebuild" npm script before next build

import { writeFileSync, mkdirSync, existsSync, createWriteStream, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT_DIR = join(ROOT, "data");
const OUTPUT_FILE = join(OUTPUT_DIR, "wallpapers.json");

// ─── sources ──────────────────────────────────────────────────────────────────

const SOURCES = [
    {
        id: "archive",
        url: "https://raw.githubusercontent.com/LaxentaInc/Wallpaper-Archive/main/README.md",
        prefix: "https://raw.githubusercontent.com/yap02417-create/site-archive/main/wallpapersclan/",
    },
    {
        id: "yapude",
        url: "https://raw.githubusercontent.com/yapude/wallpapers/main/README.md",
        prefix: "https://raw.githubusercontent.com/yapude/wallpapers/main/assets/",
    },
    {
        id: "yapude",
        url: "https://raw.githubusercontent.com/yapude/wallpapers/main/README2.md",
        prefix: "https://raw.githubusercontent.com/yapude/wallpapers/main/assets/",
    },
    {
        id: "yapude",
        url: "https://raw.githubusercontent.com/yapude/Wallpaper-archive/main/README3.md",
        prefix: "https://raw.githubusercontent.com/yapude/Wallpaper-archive/main/assets/",
    },
];

// ─── filler tags to strip from yapude (generic seo spam) ──────────────────────

const FILLER_TAGS = new Set([
    "hd wallpapers", "pc wallpapers", "mobile wallpapers", "tablet wallpapers",
    "hd desktop", "free download", "1080p", "2k", "4k", "5k", "8k",
]);

// ─── line parser ──────────────────────────────────────────────────────────────
// parses a single markdown table row. splits on | instead of using a giant
// regex — much more reliable with the varied formatting between sources.

const IMG_REGEX = /^<img\s+src="([^"]+)"[^>]*>$/;

function parseRow(line, sourceId) {
    // split the row by | and trim. typical structure:
    // | <img src="..." width="200"> | **Title**<br>[Download](...) | tag1, tag2, ... |
    const cells = line.split("|").map(c => c.trim()).filter(Boolean);
    if (cells.length < 3) return null;

    // cell 0: <img src="..." ...>
    const imgMatch = IMG_REGEX.exec(cells[0]);
    if (!imgMatch) return null;
    const url = imgMatch[1];

    // cell 1: **Title**<br>[Download](...)
    const titleMatch = cells[1].match(/^\*\*(.+?)\*\*/);
    if (!titleMatch) return null;
    let title = titleMatch[1]
        .replace(/\s*(Desktop|Laptop|PC)\s+Wallpaper\s*(4K)?$/i, "")
        .replace(/\s*HD wallpaper$/i, "")
        .trim();

    // cell 2: comma-separated tags
    const tagsRaw = cells[2] || "";
    const tags = tagsRaw
        .split(",")
        .map(t => t.trim())
        .filter(t => {
            if (!t) return false;
            return !FILLER_TAGS.has(t.toLowerCase());
        })
        .slice(0, 15); // cap at 15 tags per entry

    return { url, title, tags, source: sourceId };
}

// ─── stream-download and parse line by line ───────────────────────────────────

async function fetchAndParse(source) {
    const label = `[${source.id}]`;
    console.log(`${label} downloading from ${source.url}...`);

    const res = await fetch(source.url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${label} github returned ${res.status}`);

    const contentLength = res.headers.get("content-length");
    console.log(`${label} content-length: ${contentLength ? (Number(contentLength) / 1024 / 1024).toFixed(1) + " MB" : "unknown"}`);

    // stream the body and parse line by line
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const entries = [];
    let lineCount = 0;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep incomplete last line

        for (const line of lines) {
            lineCount++;
            if (!line.startsWith("|") || line.startsWith("| ---") || line.startsWith("| Preview")) continue;
            const entry = parseRow(line, source.id);
            if (entry) entries.push(entry);
        }

        // progress log every 25k lines
        if (lineCount % 25000 < 100) {
            console.log(`${label} parsed ${lineCount.toLocaleString()} lines, ${entries.length.toLocaleString()} entries so far...`);
        }
    }

    // process remaining buffer
    if (buffer.startsWith("|") && !buffer.startsWith("| ---") && !buffer.startsWith("| Preview")) {
        const entry = parseRow(buffer, source.id);
        if (entry) entries.push(entry);
    }

    console.log(`${label} done. ${entries.length.toLocaleString()} entries from ${lineCount.toLocaleString()} lines.`);
    return entries;
}

// ─── deduplicate by url ───────────────────────────────────────────────────────

function deduplicate(entries) {
    const seen = new Map();
    for (const entry of entries) {
        // extract the filename for aggressive cross-repo deduplication
        const filename = entry.url.split("/").pop();
        const existing = seen.get(filename);
        if (!existing || entry.tags.length > existing.tags.length) {
            seen.set(filename, entry);
        }
    }
    return Array.from(seen.values());
}

// ─── build tag frequency index ────────────────────────────────────────────────

function buildTagList(entries) {
    const counts = new Map();
    for (const entry of entries) {
        for (const tag of entry.tags) {
            const lower = tag.toLowerCase();
            counts.set(lower, (counts.get(lower) || 0) + 1);
        }
    }
    // sort by frequency, keep tags with >= 2 occurrences
    return [...counts.entries()]
        .filter(([, c]) => c >= 2)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag);
}

// ─── compact format ───────────────────────────────────────────────────────────
// to keep the json file small, we extract common url prefixes and store
// entries as arrays instead of objects:
// [prefixIndex, filename, title, [tag1, tag2, ...], sourceId]

function compactify(entries) {
    // collect all unique url prefixes
    const prefixMap = new Map();
    for (const entry of entries) {
        const lastSlash = entry.url.lastIndexOf("/");
        const prefix = entry.url.substring(0, lastSlash + 1);
        if (!prefixMap.has(prefix)) {
            prefixMap.set(prefix, prefixMap.size);
        }
    }

    const prefixes = [...prefixMap.keys()];
    const compact = entries.map(e => {
        const lastSlash = e.url.lastIndexOf("/");
        const prefix = e.url.substring(0, lastSlash + 1);
        const filename = e.url.substring(lastSlash + 1);
        return [prefixMap.get(prefix), filename, e.title, e.tags, e.source];
    });

    return { prefixes, entries: compact };
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log("╔══════════════════════════════════════════════╗");
    console.log("║   wallpaper index builder                    ║");
    console.log("╚══════════════════════════════════════════════╝");
    console.log();

    const startTime = Date.now();

    // fetch both sources — archive first (small), then yapude (large)
    // note: do NOT use push(...bigArray) — it overflows the stack with 148k+ entries
    const sourceResults = [];
    for (const source of SOURCES) {
        try {
            const entries = await fetchAndParse(source);
            sourceResults.push(entries);
        } catch (err) {
            console.error(`failed to fetch ${source.id}:`, err.message);
            // continue with other sources
        }
    }

    // concat all source arrays (safe for large arrays unlike spread)
    let allEntries = [];
    for (const arr of sourceResults) {
        allEntries = allEntries.concat(arr);
    }

    if (allEntries.length === 0) {
        console.error("no entries parsed from any source! aborting.");
        process.exit(1);
    }

    // deduplicate
    console.log(`\ntotal raw entries: ${allEntries.length.toLocaleString()}`);
    const deduped = deduplicate(allEntries);
    console.log(`after dedup: ${deduped.length.toLocaleString()}`);

    // shuffle deterministically
    const seed = Math.floor(Date.now() / 86400000); // changes daily
    let s = seed;
    for (let i = deduped.length - 1; i > 0; i--) {
        s = (s * 1664525 + 1013904223) & 0x7fffffff;
        const j = s % (i + 1);
        [deduped[i], deduped[j]] = [deduped[j], deduped[i]];
    }

    // build tag list
    const tags = buildTagList(deduped);
    console.log(`unique tags (>=2 occurrences): ${tags.length.toLocaleString()}`);

    // compactify
    const compact = compactify(deduped);

    // build the output json
    const output = {
        version: 1,
        builtAt: new Date().toISOString(),
        totalEntries: deduped.length,
        totalTags: tags.length,
        tags,
        prefixes: compact.prefixes,
        entries: compact.entries,
    };

    // write to data/wallpapers.json
    // for large datasets we write in chunks to avoid v8 string size limits
    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log(`\nwriting ${OUTPUT_FILE}...`);

    // write json manually in chunks for large entry arrays
    const ws = createWriteStream(OUTPUT_FILE, { encoding: "utf-8" });
    const header = {
        version: output.version,
        builtAt: output.builtAt,
        totalEntries: output.totalEntries,
        totalTags: output.totalTags,
    };

    ws.write('{');
    // write simple fields
    ws.write(`"version":${header.version},`);
    ws.write(`"builtAt":${JSON.stringify(header.builtAt)},`);
    ws.write(`"totalEntries":${header.totalEntries},`);
    ws.write(`"totalTags":${header.totalTags},`);
    // write tags array
    ws.write(`"tags":${JSON.stringify(output.tags)},`);
    // write prefixes array
    ws.write(`"prefixes":${JSON.stringify(output.prefixes)},`);
    // write entries array in chunks of 5000
    ws.write('"entries":[');
    const CHUNK = 5000;
    let totalBytes = 0;
    for (let i = 0; i < compact.entries.length; i += CHUNK) {
        const chunk = compact.entries.slice(i, i + CHUNK);
        const chunkStr = chunk.map(e => JSON.stringify(e)).join(",");
        if (i > 0) ws.write(",");
        ws.write(chunkStr);
        totalBytes += chunkStr.length;
    }
    ws.write(']}');

    await new Promise((resolve, reject) => {
        ws.end(() => resolve());
        ws.on('error', reject);
    });

    const { size: fileSize } = statSync(OUTPUT_FILE);
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✓ wrote ${OUTPUT_FILE}`);
    console.log(`  size: ${fileSizeMB} MB`);
    console.log(`  entries: ${deduped.length.toLocaleString()}`);
    console.log(`  tags: ${tags.length.toLocaleString()}`);
    console.log(`  built in: ${elapsed}s`);
}

main().catch(err => {
    console.error("build failed:", err);
    process.exit(1);
});
