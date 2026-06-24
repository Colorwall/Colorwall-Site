#!/usr/bin/env node
/**
 * Scans a reverse-engineered Lusion source file for the specific patterns
 * we care about (particle geometry, motion stretch, fresnel/rim lighting,
 * LOD switches, bloom config, sim texture resolution) and writes everything
 * found into a single readable txt report with surrounding context.
 *
 * Usage: node scan_lusion.js lusion_source.js
 * Output: lusion_scan_report.txt (written next to the input file)
 */

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scan_lusion.js <path-to-lusion_source.js>');
  process.exit(1);
}

const src = fs.readFileSync(inputPath, 'utf8');
const lines = src.split('\n');

// Each entry: a label + list of regexes that count as a hit for that category.
const CATEGORIES = [
  {
    label: '1. MOTION / VELOCITY / STRETCH (egg-shape-via-shader clue)',
    patterns: [
      /gl_PointSize/,
      /instanceMatrix/i,
      /\bvel(ocity)?\b/i,
      /prevPos/i,
      /\bstretch\b/i,
      /aVelocity/,
      /aPrevPosition/,
      /motionVert/i,
      /motionFrag/i,
      /headTail/i,
    ],
  },
  {
    label: '2. BASE GEOMETRY CONSTRUCTION (sphere/egg/blob source)',
    patterns: [
      /SphereGeometry\s*\(/,
      /IcosahedronGeometry\s*\(/,
      /\begg\b/i,
      /\bblob\b/i,
      /particle\.glb/i,
      /particle\.json/i,
      /BufferGeometry\s*\(/,
      /widthSegments/i,
      /heightSegments/i,
    ],
  },
  {
    label: '3. FRESNEL / RIM LIGHTING (glossy/wet surface clue)',
    patterns: [
      /fresnel/i,
      /\brim\b/i,
      /1\.0\s*-\s*dot\(/,
      /pow\(\s*1\.0\s*-/,
      /viewDir/i,
      /NdotV/i,
      /reflect\(/,
      /envMap/i,
      /cubeTexture/i,
    ],
  },
  {
    label: '4. LOD / SIZE-BASED SWITCHING (small particle handling)',
    patterns: [
      /\blod\b/i,
      /pickParticleLod/i,
      /sizeThreshold/i,
      /distanceThreshold/i,
      /\bswitch.*size/i,
    ],
  },
  {
    label: '5. BLOOM / POST-PROCESSING',
    patterns: [
      /UnrealBloomPass/,
      /BloomPass/,
      /luminanceThreshold/i,
      /bloomStrength/i,
      /bloomRadius/i,
      /\bbloom\b/i,
    ],
  },
  {
    label: '6. SIM TEXTURE RESOLUTION / INSTANCE COUNT',
    patterns: [
      /SIM_W/,
      /SIM_H/,
      /simTextureSize/i,
      /textureWidth/i,
      /textureHeight/i,
      /instanceCount/i,
      /particleCount/i,
      /\bcount\s*=\s*\d{3,}/,
    ],
  },
];

const CONTEXT_LINES = 4; // lines of context before/after a hit

function collectHits() {
  const results = CATEGORIES.map((cat) => ({ label: cat.label, hits: [] }));

  lines.forEach((line, idx) => {
    CATEGORIES.forEach((cat, catIdx) => {
      for (const pattern of cat.patterns) {
        if (pattern.test(line)) {
          const start = Math.max(0, idx - CONTEXT_LINES);
          const end = Math.min(lines.length, idx + CONTEXT_LINES + 1);
          const snippet = lines.slice(start, end)
            .map((l, i) => {
              const lineNum = start + i + 1;
              const marker = lineNum === idx + 1 ? '>>' : '  ';
              return `${marker} ${lineNum.toString().padStart(6)}: ${l}`;
            })
            .join('\n');
          results[catIdx].hits.push({
            lineNum: idx + 1,
            matchedPattern: pattern.toString(),
            snippet,
          });
          break; // one hit per line per category is enough, avoid dupes
        }
      }
    });
  });

  return results;
}

function writeReport(results) {
  const outPath = path.join(
    path.dirname(inputPath),
    'lusion_scan_report.txt'
  );

  let out = '';
  out += `LUSION SOURCE SCAN REPORT\n`;
  out += `Source file: ${inputPath}\n`;
  out += `Total lines scanned: ${lines.length}\n`;
  out += `Generated: ${new Date().toISOString()}\n`;
  out += `${'='.repeat(80)}\n\n`;

  for (const cat of results) {
    out += `${'#'.repeat(80)}\n`;
    out += `${cat.label}\n`;
    out += `Hits found: ${cat.hits.length}\n`;
    out += `${'#'.repeat(80)}\n\n`;

    if (cat.hits.length === 0) {
      out += `(no matches — this technique likely isn't present, or uses different naming)\n\n`;
      continue;
    }

    for (const hit of cat.hits) {
      out += `--- line ${hit.lineNum} | matched: ${hit.matchedPattern} ---\n`;
      out += hit.snippet + '\n\n';
    }
  }

  fs.writeFileSync(outPath, out, 'utf8');
  return outPath;
}

const results = collectHits();
const outPath = writeReport(results);

console.log(`Scanned ${lines.length} lines from ${inputPath}`);
console.log(`Report written to: ${outPath}`);
console.log('');
console.log('Summary:');
for (const cat of results) {
  console.log(`  ${cat.label}: ${cat.hits.length} hits`);
}

// echo "done writing scan_lusion.js"
