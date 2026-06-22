import { useState, useEffect } from 'react';
import * as THREE from 'three';

interface PackedComponent {
  from: number;
  delta: number;
}

interface BufferAttributeDef {
  id: string;
  needsPack: boolean;
  componentSize: number;
  storageType: 'Float32Array' | 'Int16Array' | 'Uint16Array' | 'Uint8Array';
  packedComponents?: PackedComponent[];
}

interface BufferHeader {
  vertexCount: number;
  indexCount: number;
  attributes: BufferAttributeDef[];
  meshType: string;
}

/**
 * Decodes Lusion's proprietary compressed WebGL binary format.
 * Lusion packs attributes like Position, UV, Normals into tight Uint16/Uint8 arrays
 * and compresses them using Draco-style quantization (from + delta).
 */
export function useLusionGeometry(url: string) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const dataView = new DataView(buffer);
        
        // 1. Read the JSON Header Length (first 4 bytes, Little Endian)
        const jsonLength = dataView.getUint32(0, true);
        
        // 2. Read the JSON String
        const decoder = new TextDecoder('utf-8');
        const jsonString = decoder.decode(new Uint8Array(buffer, 4, jsonLength));
        const header: BufferHeader = JSON.parse(jsonString);
        
        // 3. Parse the binary chunks sequentially
        let byteOffset = 4 + jsonLength;
        // Align to 4 bytes just in case
        if (byteOffset % 4 !== 0) byteOffset += 4 - (byteOffset % 4);

        const geo = new THREE.BufferGeometry();

        header.attributes.forEach(attr => {
          const isIndex = attr.id === 'indices';
          const count = isIndex ? header.indexCount : header.vertexCount;
          const totalElements = count * attr.componentSize;
          
          let byteLength = 0;
          let typedArray: Float32Array | Int16Array | Uint16Array | Uint8Array;
          
          if (attr.storageType === 'Float32Array') {
            byteLength = totalElements * 4;
            typedArray = new Float32Array(buffer.slice(byteOffset, byteOffset + byteLength));
          } else if (attr.storageType === 'Uint16Array') {
            byteLength = totalElements * 2;
            typedArray = new Uint16Array(buffer.slice(byteOffset, byteOffset + byteLength));
          } else if (attr.storageType === 'Int16Array') {
            byteLength = totalElements * 2;
            typedArray = new Int16Array(buffer.slice(byteOffset, byteOffset + byteLength));
          } else if (attr.storageType === 'Uint8Array') {
            byteLength = totalElements * 1;
            typedArray = new Uint8Array(buffer.slice(byteOffset, byteOffset + byteLength));
          } else {
            throw new Error(`Unknown storage type: ${attr.storageType}`);
          }
          
          byteOffset += byteLength;
          // Align to 4 bytes for next chunk
          if (byteOffset % 4 !== 0) byteOffset += 4 - (byteOffset % 4);

          // 4. Decode Quantized (Packed) Data
          if (attr.needsPack && attr.packedComponents) {
            // Unpack to Float32
            const unpacked = new Float32Array(totalElements);
            const maxVal = attr.storageType === 'Uint16Array' ? 65535 : 255;
            
            for (let i = 0; i < count; i++) {
              for (let c = 0; c < attr.componentSize; c++) {
                const packDef = attr.packedComponents[c];
                const rawVal = typedArray[i * attr.componentSize + c];
                // Formula: from + (value / max) * delta
                unpacked[i * attr.componentSize + c] = packDef.from + (rawVal / maxVal) * packDef.delta;
              }
            }
            
            if (attr.id === 'position') geo.setAttribute('position', new THREE.BufferAttribute(unpacked, attr.componentSize));
            else if (attr.id === 'normal') geo.setAttribute('normal', new THREE.BufferAttribute(unpacked, attr.componentSize));
            else if (attr.id === 'boneWeights') geo.setAttribute('skinWeight', new THREE.BufferAttribute(unpacked, attr.componentSize));
          } else {
            // Unpacked raw data
            if (attr.id === 'indices') geo.setIndex(new THREE.BufferAttribute(typedArray, 1));
            else if (attr.id === 'uv') geo.setAttribute('uv', new THREE.BufferAttribute(typedArray, attr.componentSize));
            else if (attr.id === 'boneIndices') geo.setAttribute('skinIndex', new THREE.BufferAttribute(typedArray, attr.componentSize));
            else geo.setAttribute(attr.id, new THREE.BufferAttribute(typedArray, attr.componentSize));
          }
        });

        setGeometry(geo);
      })
      .catch(err => console.error("Failed to parse Lusion geometry:", url, err));
  }, [url]);

  return geometry;
}
