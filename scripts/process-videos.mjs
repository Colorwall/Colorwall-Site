// video processing script
// 1. generates missing .webp posters from videos via ffmpeg
// 2. prunes orphan posters that have no matching video
// 3. converts mp4 files to webm (vp9) for universal browser playback and reduced payload size

import { readdirSync, existsSync, unlinkSync, statSync } from "fs";
import { join, parse } from "path";
import { execSync } from "child_process";

const VIDEOS_DIR = join(process.cwd(), "public", "videos");
const POSTERS_DIR = join(VIDEOS_DIR, "posters");

const videoExtensions = new Set([".mp4", ".webm"]);
const allVideoFiles = readdirSync(VIDEOS_DIR).filter(f => videoExtensions.has(parse(f).ext.toLowerCase()));
const allPosterFiles = existsSync(POSTERS_DIR) ? readdirSync(POSTERS_DIR) : [];

const videoBaseNames = new Set(allVideoFiles.map(f => parse(f).name));

console.log("=== STEP 1: GENERATING MISSING POSTERS ===");
for (const file of allVideoFiles) {
    const base = parse(file).name;
    const targetPoster = join(POSTERS_DIR, `${base}.webp`);

    if (!existsSync(targetPoster)) {
        console.log(`Generating poster for ${file} -> ${base}.webp...`);
        const srcVideo = join(VIDEOS_DIR, file);
        try {
            // grab crisp frame at 1 second mark, scale to max 1920 width to keep poster light
            const cmd = `ffmpeg -y -ss 00:00:01 -i "${srcVideo}" -vframes 1 -vf "scale='min(1920,iw)':-2" -q:v 80 "${targetPoster}"`;
            execSync(cmd, { stdio: "inherit" });
            console.log(`[CREATED] ${base}.webp`);
        } catch (e) {
            console.error(`[ERROR] Failed to generate poster for ${file}:`, e.message);
        }
    } else {
        console.log(`[EXISTS] Poster for ${file} already present.`);
    }
}

console.log("\n=== STEP 2: PRUNING ORPHAN POSTERS ===");
for (const poster of allPosterFiles) {
    const base = parse(poster).name;
    if (!videoBaseNames.has(base)) {
        const orphanPath = join(POSTERS_DIR, poster);
        console.log(`Pruning orphan poster: ${poster}...`);
        try {
            unlinkSync(orphanPath);
            console.log(`[DELETED] ${poster}`);
        } catch (e) {
            console.error(`[ERROR] Failed to delete ${poster}:`, e.message);
        }
    }
}

console.log("\n=== STEP 3: CONVERTING MP4s TO WEBM ===");
const mp4Files = allVideoFiles.filter(f => parse(f).ext.toLowerCase() === ".mp4");

// configure duration overrides for ambient wallpapers requiring longer loop cycles
const DURATION_OVERRIDES = {
    "Windmills_Battlefield_1_Dawn_of_War_Live_Wallpaper": 20,
    "Arylin_Forest_Live_Wallpaper": 20,
    "lifeandeath": 16,
};

for (const file of mp4Files) {
    const base = parse(file).name;
    const srcPath = join(VIDEOS_DIR, file);
    const destPath = join(VIDEOS_DIR, `${base}.webm`);
    const duration = DURATION_OVERRIDES[base] || 10;

    console.log(`Converting ${file} to WebM (VP9, ${duration}s duration)...`);
    try {
        // probe for audio stream presence to avoid failing on silent video sources
        let hasAudio = false;
        try {
            const probeOut = execSync(`ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "${srcPath}"`, { encoding: "utf8" });
            hasAudio = probeOut.trim().length > 0;
        } catch {
            hasAudio = false;
        }

        const audioFlags = hasAudio ? "-c:a libopus -b:a 128k" : "-an";
        // transcode with libvpx-vp9: trim to specified duration, preserve native resolution without downscaling, crf 32
        const cmd = `ffmpeg -y -i "${srcPath}" -t ${duration} -c:v libvpx-vp9 -crf 32 -b:v 2500k ${audioFlags} "${destPath}"`;
        execSync(cmd, { stdio: "inherit" });
        
        const oldSizeMb = (statSync(srcPath).size / (1024 * 1024)).toFixed(2);
        const newSizeMb = (statSync(destPath).size / (1024 * 1024)).toFixed(2);
        console.log(`[CONVERTED] ${file} (${oldSizeMb} MB) -> ${base}.webm (${newSizeMb} MB)`);

        // remove original mp4 to free disk and git space
        unlinkSync(srcPath);
        console.log(`[REMOVED ORIGINAL MP4] ${file}`);
    } catch (e) {
        console.error(`[ERROR] Failed to convert ${file}:`, e.message);
    }
}

console.log("\nAll video & poster operations completed successfully!");
