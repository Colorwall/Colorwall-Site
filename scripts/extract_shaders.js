const fs = require('fs');

const src = fs.readFileSync('lusion_source.js', 'utf8');

function extractString(varName) {
  const idx = src.indexOf(varName + '=');
  if (idx === -1) return "NOT FOUND";
  const start = src.indexOf('`', idx);
  const end = src.indexOf('`', start + 1);
  return src.substring(idx, end + 1);
}

console.log("=== GROUND FRAG ===");
console.log(extractString('groundFrag'));

console.log("\n=== PERSON FRAG ===");
console.log(extractString('frag$9'));

console.log("\n=== ROCK FRAG ===");
console.log(extractString('frag$c'));
