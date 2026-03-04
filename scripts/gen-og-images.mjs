// generates all platform-required image formats from sitepfpthingy.PNG
// run: node scripts/gen-og-images.mjs

import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "public", "sitepfpthingy.PNG");
const pub = join(root, "public");

// ensure public exists
if (!existsSync(pub)) mkdirSync(pub, { recursive: true });

const meta = await sharp(src).metadata();
console.log(`source: ${meta.width}x${meta.height} ${meta.format}`);

const jobs = [
    // --- open graph / discord / facebook / linkedin ---
    // must be exactly 1200x630 for best results
    { out: "og-image.png", width: 1200, height: 630, fit: "cover", format: "png" },
    // square version for platforms that crop to square (instagram dm links, etc)
    { out: "og-image-square.png", width: 1200, height: 1200, fit: "cover", format: "png" },
    // webp versions (faster load, same support)
    { out: "og-image.webp", width: 1200, height: 630, fit: "cover", format: "webp", quality: 90 },

    // --- twitter / x (needs 2:1 ratio for summary_large_image) ---
    { out: "twitter-card.png", width: 1200, height: 600, fit: "cover", format: "png" },

    // --- apple touch icon (180x180 square, no transparency) ---
    { out: "apple-touch-icon.png", width: 180, height: 180, fit: "cover", format: "png", bg: { r: 10, g: 10, b: 10 } },

    // --- pwa / manifest icons ---
    { out: "icon-192.png", width: 192, height: 192, fit: "cover", format: "png" },
    { out: "icon-512.png", width: 512, height: 512, fit: "cover", format: "png" },

    // --- favicon sizes (stored as png, then use ico separately) ---
    { out: "favicon-32x32.png", width: 32, height: 32, fit: "cover", format: "png" },
    { out: "favicon-16x16.png", width: 16, height: 16, fit: "cover", format: "png" },
];

for (const job of jobs) {
    const outPath = join(pub, job.out);
    let pipeline = sharp(src).resize(job.width, job.height, {
        fit: job.fit ?? "cover",
        position: "center",
    });

    // flatten transparent bg if needed
    if (job.bg) {
        pipeline = pipeline.flatten({ background: job.bg });
    }

    if (job.format === "webp") {
        pipeline = pipeline.webp({ quality: job.quality ?? 85 });
    } else {
        pipeline = pipeline.png({ compressionLevel: 8 });
    }

    await pipeline.toFile(outPath);
    console.log(`✓ ${job.out} (${job.width}x${job.height})`);
}

console.log("\ndone! all images written to /public");
console.log("don't forget to set NEXT_PUBLIC_SITE_URL in your env.");
