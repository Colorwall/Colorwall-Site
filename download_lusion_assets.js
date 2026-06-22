const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'lusion-assets');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// each entry: [filename, base url]
// models live at /assets/models/about/
// textures live at /assets/textures/about/ or /assets/textures/
const files = [
    // -- models (from /assets/models/about/) --
    ['rock_0.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_0_low.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_animation_0.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_1.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_1_low.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_animation_1.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_2.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_2_low.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_animation_2.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_3.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_3_low.buf', 'https://lusion.dev/assets/models/about/'],
    ['rock_animation_3.buf', 'https://lusion.dev/assets/models/about/'],
    ['sphere_l.buf', 'https://lusion.dev/assets/models/about/'],
    ['sphere_m.buf', 'https://lusion.dev/assets/models/about/'],
    ['sphere_s.buf', 'https://lusion.dev/assets/models/about/'],
    ['sphere_xs.buf', 'https://lusion.dev/assets/models/about/'],
    ['camera_spline.buf', 'https://lusion.dev/assets/models/about/'],
    ['logo_text.buf', 'https://lusion.dev/assets/models/about/'],
    ['terrain.buf', 'https://lusion.dev/assets/models/about/'],
    ['terrain_lines.buf', 'https://lusion.dev/assets/models/about/'],
    ['person.buf', 'https://lusion.dev/assets/models/about/'],
    ['person_idle.buf', 'https://lusion.dev/assets/models/about/'],
    ['bg_box.buf', 'https://lusion.dev/assets/models/about/'],
    ['letter_placements.buf', 'https://lusion.dev/assets/models/about/'],

    // -- textures (from /assets/textures/about/) --
    ['terrain_shadow_light_height.webp', 'https://lusion.dev/assets/textures/about/'],
    ['person_light.webp', 'https://lusion.dev/assets/textures/about/'],
    ['person.webp', 'https://lusion.dev/assets/textures/about/'],
    ['ground_person_shadow.webp', 'https://lusion.dev/assets/textures/about/'],
    ['rocks.webp', 'https://lusion.dev/assets/textures/about/'],
    ['fog.png', 'https://lusion.dev/assets/textures/about/'],

    // -- global textures (from /assets/textures/) --
    ['smaa-search.png', 'https://lusion.dev/assets/textures/'],
    ['smaa-area.png', 'https://lusion.dev/assets/textures/'],
    ['LDR_RGB1_0.png', 'https://lusion.dev/assets/textures/'],

    // -- lines (from /assets/models/lines/) --
    ['line_capability.buf', 'https://lusion.dev/assets/models/lines/'],
];

let completed = 0;
let failed = 0;

files.forEach(([fileName, baseUrl]) => {
    const url = baseUrl + fileName;
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
            'Referer': 'https://lusion.co/',
            'Origin': 'https://lusion.co'
        }
    };

    https.get(url, options, (res) => {
        if (res.statusCode === 200) {
            const filePath = path.join(targetDir, fileName);
            const file = fs.createWriteStream(filePath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                const stats = fs.statSync(filePath);
                console.log(`OK ${fileName} (${stats.size} bytes)`);
                completed++;
            });
        } else {
            console.log(`FAIL ${fileName} (HTTP ${res.statusCode}) from ${url}`);
            failed++;
            res.resume(); // drain the response
        }
    }).on('error', err => {
        console.log(`ERROR ${fileName}: ${err.message}`);
        failed++;
    });
});

process.on('exit', () => {
    console.log(`\nDone: ${completed} downloaded, ${failed} failed`);
});
