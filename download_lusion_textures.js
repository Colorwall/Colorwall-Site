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
    'rocks.webp'
];

function downloadFile(fileName) {
    // We now know images are in /textures/ instead of /models/
    const url = `https://lusion.dev/assets/textures/about/${fileName}`;
    
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
        }
    }).on('error', (e) => console.log(e));
}

console.log("Starting image texture downloads from lusion.dev...");
files.forEach(downloadFile);
