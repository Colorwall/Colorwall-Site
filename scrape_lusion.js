const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://lusion.co';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("Fetched Lusion.co HTML");
    
    // Find JS files
    const jsRegex = /src="([^"]+\.js[^"]*)"/g;
    let match;
    const jsFiles = [];
    while ((match = jsRegex.exec(data)) !== null) {
        if (match[1].startsWith('/')) {
            jsFiles.push('https://lusion.co' + match[1]);
        } else if (match[1].startsWith('http')) {
            jsFiles.push(match[1]);
        }
    }
    
    console.log("JS Bundles:", jsFiles);
    
    // Find Images
    const imgRegex = /(?:href|src)="([^"]+\.(?:png|jpg|jpeg|webp|gif))"/g;
    const images = [];
    while ((match = imgRegex.exec(data)) !== null) {
        if (match[1].startsWith('/')) {
            images.push('https://lusion.co' + match[1]);
        } else if (match[1].startsWith('http')) {
            images.push(match[1]);
        }
    }
    
    console.log("Image Assets:", images);
    
    // Download first JS file to look for shaders
    if (jsFiles.length > 0) {
        const firstJs = jsFiles[0];
        console.log("Downloading", firstJs, "to scan for shaders...");
        https.get(firstJs, (jsRes) => {
            let jsData = '';
            jsRes.on('data', chunk => jsData += chunk);
            jsRes.on('end', () => {
                fs.writeFileSync(path.join(__dirname, 'lusion_bundle.js'), jsData);
                console.log("Bundle saved to lusion_bundle.js. Scan it for frag/vert shaders.");
            });
        });
    }
  });
});
