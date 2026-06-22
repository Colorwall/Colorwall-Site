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

const names = ['vert$9', 'frag$d', 'frag$7', 'vert$4', 'fragSim', 'motionVert', 'motionFrag', 'lightFieldVert', 'lightFieldFrag'];
const out = {};
for (const n of names) {
  const s = extract(n);
  if (s) out[n] = s;
  else console.warn('Missing:', n);
}

const existing = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'about', 'shaders', 'extracted.json'), 'utf8'));
Object.assign(existing, out);
fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'about', 'shaders', 'extracted.json'), JSON.stringify(existing, null, 2));
console.log('Added', Object.keys(out).length, 'shaders');
