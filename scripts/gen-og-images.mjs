// generates all platform-required image formats from LxColorWall.png
// run: node scripts/gen-og-images.mjs

import sharp from "sharp";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const logo = join(root, "public", "LxColorWall.png");
const sitepfp = join(root, "public", "LxColorWall.png");
const pub = join(root, "public");

// -- og images: logo centered on a dark bg --
// this is what discord/instagram/twitter etc show as embed
async function genOG(outName, w, h) {
    // create a dark gradient-ish background
    const bg = await sharp({
        create: {
            width: w,
            height: h,
            channels: 4,
            background: { r: 10, g: 10, b: 14, alpha: 1 },
        }
    }).png().toBuffer();

    // resize logo to fit nicely (60% of width, maintain aspect)
    const logoW = Math.round(w * 0.6);
    const resizedLogo = await sharp(logo)
        .resize(logoW, null, { fit: "inside" })
        .png()
        .toBuffer();

    const logoMeta = await sharp(resizedLogo).metadata();
    const left = Math.round((w - logoMeta.width) / 2);
    const top = Math.round((h - logoMeta.height) / 2);

    await sharp(bg)
        .composite([{ input: resizedLogo, left, top }])
        .png({ compressionLevel: 8 })
        .toFile(join(pub, outName));

    console.log(`✓ ${outName} (${w}x${h})`);
}

// -- icon images: from sitepfpthingy (square crop) --
async function genIcon(outName, size, format = "png") {
    let pipeline = sharp(sitepfp)
        .resize(size, size, { fit: "cover", position: "center" })
        .flatten({ background: { r: 10, g: 10, b: 14 } });

    if (format === "webp") {
        pipeline = pipeline.webp({ quality: 85 });
    } else {
        pipeline = pipeline.png({ compressionLevel: 8 });
    }

    await pipeline.toFile(join(pub, outName));
    console.log(`✓ ${outName} (${size}x${size})`);
}

// --- open graph / discord / facebook / linkedin (landscape 1200x630) ---
await genOG("og-image.png", 1200, 630);

// --- twitter / x (summary_large_image needs 2:1) ---
await genOG("twitter-card.png", 1200, 600);

// --- webp version for speed ---
// copy the og-image and convert to webp
await sharp(join(pub, "og-image.png"))
    .webp({ quality: 90 })
    .toFile(join(pub, "og-image.webp"));
console.log("✓ og-image.webp (1200x630)");

// --- square og fallback (whatsapp, instagram dms) ---
await genOG("og-image-square.png", 1200, 1200);

// --- favicons and app icons from the screenshot ---
await genIcon("apple-touch-icon.png", 180);
await genIcon("icon-192.png", 192);
await genIcon("icon-512.png", 512);
await genIcon("favicon-32x32.png", 32);
await genIcon("favicon-16x16.png", 16);

console.log("\ndone! all images written to /public");
