const fs = require('fs');
const path = require('path');

const buf = fs.readFileSync(path.join(__dirname, '..', 'public', 'lusion-assets', 'camera_spline.buf'));
const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
const jsonLen = dv.getUint32(0, true);

let offset = 4 + jsonLen;
if (offset % 4 !== 0) offset += 4 - (offset % 4);

// orient: Float32Array, 4 components, 200 vertices
const orientCount = 200 * 4;
const orients = new Float32Array(buf.buffer, buf.byteOffset + offset, orientCount);
offset += orientCount * 4;
if (offset % 4 !== 0) offset += 4 - (offset % 4);

// position: packed Uint16Array, 3 components, 200 vertices
const posCount = 200 * 3;
const posRaw = new Uint16Array(buf.buffer, buf.byteOffset + offset, posCount);

const packs = [
  { from: -19.1331158, delta: 19.1331158 },
  { from: 5.46889019, delta: 44.531109810000004 },
  { from: -75.1132812, delta: 70.1132812 }
];

console.log("=== Camera Spline Positions ===");
const keyFrames = [0, 1, 10, 20, 50, 74, 100, 130, 149, 150, 175, 199];
for (const i of keyFrames) {
  const x = packs[0].from + (posRaw[i * 3] / 65535) * packs[0].delta;
  const y = packs[1].from + (posRaw[i * 3 + 1] / 65535) * packs[1].delta;
  const z = packs[2].from + (posRaw[i * 3 + 2] / 65535) * packs[2].delta;
  const qx = orients[i * 4].toFixed(4);
  const qy = orients[i * 4 + 1].toFixed(4);
  const qz = orients[i * 4 + 2].toFixed(4);
  const qw = orients[i * 4 + 3].toFixed(4);
  console.log("Point " + i + ": pos(" + x.toFixed(2) + ", " + y.toFixed(2) + ", " + z.toFixed(2) + ") quat(" + qx + ", " + qy + ", " + qz + ", " + qw + ")");
}
