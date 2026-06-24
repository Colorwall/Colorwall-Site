/**
 * Pulls just the requested category sections out of an already-generated
 * lusion_scan_report.txt, so you don't have to scroll through the whole thing.
 *
 * Usage: node extract_top_categories.js lusion_scan_report.txt "1,2,6"
 * Output: lusion_scan_summary.txt (just the requested sections)
 */

const fs = require('fs');
const path = require('path');

const reportPath = process.argv[2];
const wantedNums = (process.argv[3] || '1,2,6').split(',').map((s) => s.trim());

if (!reportPath) {
  console.error('Usage: node extract_top_categories.js <path-to-lusion_scan_report.txt> "1,2,6"');
  process.exit(1);
}

const text = fs.readFileSync(reportPath, 'utf8');
const lines = text.split('\n');

const HASH_LINE = '#'.repeat(80);

// Find all indices where a hash-line occurs — sections are framed by these.
const hashIdxs = [];
lines.forEach((line, i) => {
  if (line.trim() === HASH_LINE) hashIdxs.push(i);
});

// Each section is: hashIdxs[n] (top border), label line, hashIdxs[n+1] (bottom border), body...
const sections = [];
for (let i = 0; i < hashIdxs.length; i += 2) {
  const topBorder = hashIdxs[i];
  const bottomBorder = hashIdxs[i + 1];
  if (bottomBorder === undefined) break;
  const label = lines[topBorder + 1];
  // body runs from just after bottomBorder until the next topBorder (or EOF)
  const nextTop = hashIdxs[i + 2] !== undefined ? hashIdxs[i + 2] : lines.length;
  const body = lines.slice(bottomBorder + 1, nextTop).join('\n');
  sections.push({ label, body });
}

const picked = sections.filter((s) =>
  wantedNums.some((n) => s.label.trim().startsWith(`${n}.`))
);

let out = '';
for (const s of picked) {
  out += `${HASH_LINE}\n${s.label}\n${HASH_LINE}\n${s.body}\n\n`;
}

const outPath = path.join(path.dirname(reportPath) || '.', 'lusion_scan_summary.txt');
fs.writeFileSync(outPath, out, 'utf8');

console.log(`Found ${sections.length} total section(s) in report.`);
console.log(`Extracted ${picked.length} matching section(s): ${picked.map((s) => s.label.trim().split(' ')[0]).join(', ')}`);
console.log(`Written to: ${outPath}`);
console.log(`Total size: ${out.length} chars (~${Math.round(out.length / 4)} tokens)`);