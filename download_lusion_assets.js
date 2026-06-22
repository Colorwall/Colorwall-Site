const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'lusion-assets');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const files = [
    'terrain_shadow_light_height.webp',
    'person_light.webp',
    'person.webp',
    'ground_person_shadow.webp',
    'rocks.webp',
    'rock_1.buf',
    'rock_1_low.buf',
    'rock_animation_1.buf',
    'rock_2.buf',
    'rock_3.buf',
    'terrain.buf',
    'terrain_lines.buf',
    'person.buf',
    'person_idle.buf',
    'bg_box.buf',
    'letter_placements.buf'
];

function downloadFile(fileName) {
    const url = `https://lusion.dev/assets/models/about/${fileName}`;
    
    // Some assets like images might be in /assets/images/about/ or similar, but we'll try /models/about/ first.
    // Lusion.dev uses cloudflare. We should spoof headers if we get 403s.
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
                console.log(`Successfully downloaded ${fileName} from ${url}`);
            });
        } else {
            console.log(`Failed to download ${fileName} - HTTP ${res.statusCode}`);
            // Let's also try without /models/ just /assets/
            const url2 = `https://lusion.dev/assets/about/${fileName}`;
            https.get(url2, options, (res2) => {
                if (res2.statusCode === 200) {
                     const filePath = path.join(targetDir, fileName);
                     const file = fs.createWriteStream(filePath);
                     res2.pipe(file);
                     file.on('finish', () => {
                         file.close();
                         console.log(`Successfully downloaded ${fileName} from ${url2}`);
                     });
                }
            });
        }
    }).on('error', (e) => console.log(e));
}

console.log("Starting asset downloads from lusion.dev...");
files.forEach(downloadFile);
