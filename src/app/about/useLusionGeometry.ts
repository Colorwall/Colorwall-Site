import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { fetchLusionBuffer } from './parseLusionBuffer';

export function useLusionGeometry(url: string) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    fetchLusionBuffer(url)
      .then(({ geometry: geo }) => {
        if (geo) setGeometry(geo);
      })
      .catch((err) => console.error('Failed to parse Lusion geometry:', url, err));
  }, [url]);

  return geometry;
}

export function useLusionAnimation(url: string) {
  const [data, setData] = useState<{
    positions: Float32Array;
    orients: Float32Array;
    frameCount: number;
    boneCount: number;
  } | null>(null);

  useEffect(() => {
    fetchLusionBuffer(url).then(({ header, raw }) => {
      const orient = raw.orient as Float32Array;
      const positionAttr = header.attributes.find((a) => a.id === 'position')!;
      const count = header.vertexCount;
      const componentCount = positionAttr.componentSize;

      let positions: Float32Array;
      if (positionAttr.needsPack && positionAttr.packedComponents) {
        const packed = raw.position as Uint16Array | Int16Array;
        positions = new Float32Array(count * 3);
        const packs = positionAttr.packedComponents;
        for (let i = 0; i < count; i++) {
          for (let c = 0; c < 3; c++) {
            let normalized = 0;
            const rawVal = packed[i * componentCount + c];
            if (positionAttr.storageType === 'Uint16Array') {
              normalized = rawVal / 65535;
            } else if (positionAttr.storageType === 'Int16Array') {
              normalized = (rawVal + 32768) / 65535;
            }
            positions[i * 3 + c] = packs[c].from + normalized * packs[c].delta;
          }
        }
      } else {
        positions = raw.position as Float32Array;
      }

      const boneCount = url.includes('person_idle') ? 54 : 16;
      const frameCount = count / boneCount;

      setData({ positions, orients: orient, frameCount, boneCount });
    });
  }, [url]);

  return data;
}

export function createRockDataTextures(
  positions: Float32Array,
  orients: Float32Array,
  pieceCount = 16,
  frameCount = 120,
) {
  const posData = new Float32Array(positions.length / 3 * 4);
  const randByPiece: number[] = [];

  for (let i = 0, u = 0, f = 0; u < positions.length; i++, u += 3, f += 4) {
    posData[f] = positions[u];
    posData[f + 1] = positions[u + 1];
    posData[f + 2] = positions[u + 2];
    if (i < pieceCount) randByPiece[i] = Math.random();
    posData[f + 3] = randByPiece[i % pieceCount];
  }

  const posTex = new THREE.DataTexture(posData, pieceCount, frameCount, THREE.RGBAFormat, THREE.FloatType);
  posTex.needsUpdate = true;
  posTex.minFilter = THREE.NearestFilter;
  posTex.magFilter = THREE.NearestFilter;

  const orientTex = new THREE.DataTexture(orients, pieceCount, frameCount, THREE.RGBAFormat, THREE.FloatType);
  orientTex.needsUpdate = true;
  orientTex.minFilter = THREE.NearestFilter;
  orientTex.magFilter = THREE.NearestFilter;

  return { posTex, orientTex };
}

export function createPersonTexture(
  lightTex: THREE.Texture,
  baseTex: THREE.Texture,
): THREE.Texture {
  const lightImg = lightTex.image as HTMLImageElement;
  const baseImg = baseTex.image as HTMLImageElement;
  const w = lightImg.width;
  const h = lightImg.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  ctx.drawImage(lightImg, 0, 0);
  const lightData = ctx.getImageData(0, 0, w, h);

  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(baseImg, 0, 0);
  const baseData = ctx.getImageData(0, 0, w, h);

  for (let i = 0; i < lightData.data.length; i += 4) {
    const r = baseData.data[i];
    const g = baseData.data[i + 1];
    const b = baseData.data[i + 2];
    const shade = 0.299 * r + 0.587 * g + 0.114 * b;
    lightData.data[i + 3] = shade;
  }

  ctx.putImageData(lightData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  return tex;
}

export function createRocksChannelTexture(rocksTex: THREE.Texture): THREE.Texture {
  const img = rocksTex.image as HTMLImageElement;
  const w = 512;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const si = (y * w + x) * 4;
      const oi = si;
      const u = (x / w) * 0.5;
      const v = (y / h) * 0.5;

      const sample = (ox: number, oy: number) => {
        const sx = Math.floor(ox * w * 2) % (w * 2);
        const sy = Math.floor(oy * h * 2) % (h * 2);
        const idx = (sy * w + sx) * 4;
        return src.data[idx + 1];
      };

      out.data[oi] = sample(u, v);
      out.data[oi + 1] = sample(u + 0.5, v);
      out.data[oi + 2] = sample(u, v + 0.5);
      out.data[oi + 3] = sample(u + 0.5, v + 0.5);
    }
  }

  ctx.putImageData(out, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  tex.colorSpace = THREE.LinearSRGBColorSpace;
  return tex;
}
