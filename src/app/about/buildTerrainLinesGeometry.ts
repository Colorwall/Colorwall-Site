import * as THREE from 'three';
import { fetchBuffer } from './parseBuffer';

const THRESHOLDS = [
  60, 245, 806, 966, 991, 1026, 1191, 1853, 2061, 3111, 4279, 4309, 4338, 5265, 5316, 5447,
  5475, 6407, 6445, 7116, 7235, 7349, 7934, 8555, 8583, 8614, 9154, 9640, 9688, 10163, 10420,
  10645, 10895, 11074, 11286, 11453, 11596, 11628, 11740, 11799, 11832,
];

const SEGMENT_COUNT = 3;

export async function buildTerrainLinesGeometry() {
  const { raw } = await fetchBuffer('/shaders/terrain_lines.buf');
  const t = raw.position as Float32Array;
  const n = t.length / 3;

  const a = new Float32Array(n * SEGMENT_COUNT * 3);
  const normals = new Float32Array(n * SEGMENT_COUNT * 3);
  const tAttr = new Float32Array(n * SEGMENT_COUNT);
  const totalLength = new Float32Array(n * SEGMENT_COUNT);
  const lineId = new Uint8Array(n * SEGMENT_COUNT);
  const indices: number[] = [];

  const prev = new THREE.Vector3();
  const curr = new THREE.Vector3();
  const next = new THREE.Vector3();
  const g = new THREE.Vector3();
  const v = new THREE.Vector3();
  const T = new THREE.Vector3();
  const M = new THREE.Vector3(0, 1, 0);
  const S = new THREE.Vector3();
  const C = new THREE.Vector3();
  const v0 = new THREE.Vector3();
  const b = new THREE.Quaternion();

  let R = 0;
  let w = 0;
  let E = 0;

  for (let k = 0; k < THRESHOLDS.length; k++) {
    const L = k === 0 ? 0 : THRESHOLDS[k - 1];
    const D = THRESHOLDS[k];
    prev.fromArray(t, L * 3);
    v.copy(prev);
    M.set(0, 1, 0);
    let ne = 0;

    for (let z = L; z < D; z++) {
      const j = z * 3;
      g.copy(v);
      v.copy(prev);
      if (z < D - 1) {
        next.fromArray(t, j + 3);
        prev.copy(next);
      }
      T.subVectors(prev, g).normalize();
      S.crossVectors(M, T).normalize();
      b.setFromAxisAngle(T, (Math.PI * 2) / SEGMENT_COUNT);
      C.copy(M);
      ne += v0.copy(v).sub(g).length();

      for (let X = 0; X < SEGMENT_COUNT; X++) {
        C.applyQuaternion(b);
        a[R] = v.x;
        a[R + 1] = v.y;
        a[R + 2] = v.z;
        normals[R] = C.x;
        normals[R + 1] = C.y;
        normals[R + 2] = C.z;
        tAttr[w] = ne;
        lineId[w] = k;

        if (z < D - 1) {
          const Z = X === SEGMENT_COUNT - 1 ? 1 - SEGMENT_COUNT : 1;
          indices.push(w, w + Z, w + SEGMENT_COUNT);
          indices.push(w + Z, w + SEGMENT_COUNT + Z, w + SEGMENT_COUNT);
        }

        w++;
        R += 3;
      }
    }

    const re = SEGMENT_COUNT * (D - L);
    w -= re;
    const ce = w + re;
    while (w < ce) {
      totalLength[w] = ne;
      w++;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(a, 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute('t', new THREE.BufferAttribute(tAttr, 1));
  geometry.setAttribute('totalLength', new THREE.BufferAttribute(totalLength, 1));
  geometry.setAttribute('lineId', new THREE.BufferAttribute(lineId, 1));
  geometry.setIndex(indices);

  return geometry;
}
