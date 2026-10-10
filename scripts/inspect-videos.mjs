// inspection script for videos and poster assets
// compares public/videos with public/videos/posters and probes video metadata

import { readdirSync, existsSync, statSync } from "fs";
import { join, parse } from "path";
import { execSync } from "child_process";

const VIDEOS_DIR = join(process.cwd(), "public", "videos");
const POSTERS_DIR = join(VIDEOS_DIR, "posters");

const videoExtensions = new Set([".mp4", ".webm", ".mkv", ".mov"]);
const allVideoFiles = readdirSync(VIDEOS_DIR).filter(f => videoExtensions.has(parse(f).ext.toLowerCase()));
const allPosterFiles = existsSync(POSTERS_DIR) ? readdirSync(POSTERS_DIR) : [];

console.log(`\n=== VIDEO FILES IN public/videos (${allVideoFiles.length}) ===`);
const videoMap = new Map();

for (const file of allVideoFiles) {
    const fullPath = join(VIDEOS_DIR, file);
    const base = parse(file).name;
    const stats = statSync(fullPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    
    let codec = "unknown";
    let resolution = "unknown";
    let duration = "unknown";
    let bitrate = "unknown";

    try {
        const out = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,duration,bit_rate -of json "${fullPath}"`, { encoding: "utf8" });
        const data = JSON.parse(out);
        if (data.streams && data.streams[0]) {
            const s = data.streams[0];
            codec = s.codec_name;
            resolution = `${s.width}x${s.height}`;
            duration = s.duration ? `${parseFloat(s.duration).toFixed(1)}s` : "unknown";
            bitrate = s.bit_rate ? `${(parseInt(s.bit_rate) / 1000).toFixed(0)} kbps` : "unknown";
        }
    } catch (e) {
        codec = `error: ${e.message}`;
    }

    videoMap.set(base, { file, sizeMb, codec, resolution, duration, bitrate });
    console.log(`- ${file}: ${sizeMb} MB | ${codec} | ${resolution} | ${duration} | ${bitrate}`);
}

console.log(`\n=== POSTER ANALYSIS ===`);
const orphanPosters = [];
const validPosters = [];

for (const poster of allPosterFiles) {
    const base = parse(poster).name;
    if (videoMap.has(base)) {
        validPosters.push(poster);
    } else {
        orphanPosters.push(poster);
    }
}

console.log(`Valid posters matching existing videos (${validPosters.length}):`);
validPosters.forEach(p => console.log(`  [OK] ${p}`));

console.log(`\nOrphan posters with NO matching video (${orphanPosters.length}):`);
orphanPosters.forEach(p => console.log(`  [ORPHAN] ${p}`));

const missingPosters = [];
for (const [base, info] of videoMap.entries()) {
    const expectedWebp = `${base}.webp`;
    if (!allPosterFiles.includes(expectedWebp)) {
        missingPosters.push(info.file);
    }
}

console.log(`\nVideos missing posters (${missingPosters.length}):`);
missingPosters.forEach(v => console.log(`  [MISSING POSTER] ${v}`));
