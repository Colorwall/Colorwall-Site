const fs = require('fs');
const path = require('path');

const src = fs.readFileSync('lusion_source.js', 'utf8');

function extract(varName) {
  const idx = src.indexOf(varName + '=');
  if (idx === -1) return null;
  const start = src.indexOf('`', idx);
  const end = src.indexOf('`', start + 1);
  return src.substring(start + 1, end);
}

const names = [
  'groundVert', 'groundFrag', 'vert$8', 'frag$c', 'vert$6', 'frag$9',
  'getScatter', 'getBlueNoise', 'getLightUv',
  'aboutHeroVisualFinalVert', 'aboutHeroVisualFinalFrag',
  'shadowVert', 'shadowFrag', 'frag$b',
];

const out = {};
for (const n of names) {
  const s = extract(n);
  if (s) out[n] = s;
  else console.warn('Missing:', n);
}

const outPath = path.join(__dirname, '..', 'src', 'app', 'about', 'shaders', 'extracted.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log('Wrote', Object.keys(out).length, 'shaders to', outPath);
