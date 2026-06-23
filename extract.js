const fs = require('fs');
const content = fs.readFileSync('lusion_source.js', 'utf-8');

function searchAll(regex) {
    let match;
    let results = [];
    while ((match = regex.exec(content)) !== null) {
        results.push(content.substring(Math.max(0, match.index - 50), Math.min(content.length, match.index + 100)));
    }
    return results.join('\n\n');
}

console.log('--- .toneMapping = ---');
console.log(searchAll(/\.toneMapping\s*=/g));
console.log('--- .outputColorSpace = ---');
console.log(searchAll(/\.outputColorSpace\s*=/g));
console.log('--- .outputEncoding = ---');
console.log(searchAll(/\.outputEncoding\s*=/g));
console.log('--- .toneMappingExposure = ---');
console.log(searchAll(/\.toneMappingExposure\s*=/g));
console.log('--- .strength = ---');
console.log(searchAll(/bloomPass.*?\.strength\s*=/g));
console.log('--- .threshold = ---');
console.log(searchAll(/bloomPass.*?\.threshold\s*=/g));
console.log('--- .radius = ---');
console.log(searchAll(/bloomPass.*?\.radius\s*=/g));
