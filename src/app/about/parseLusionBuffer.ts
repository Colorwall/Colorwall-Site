import * as THREE from 'three';

export interface PackedComponent {
  from: number;
  delta: number;
}

export interface BufferAttributeDef {
  id: string;
  needsPack: boolean;
  componentSize: number;
  storageType: 'Float32Array' | 'Int16Array' | 'Uint16Array' | 'Uint8Array';
  packedComponents?: PackedComponent[];
}

export interface BufferHeader {
  vertexCount: number;
  indexCount: number;
  attributes: BufferAttributeDef[];
  meshType: string;
}

export type RawAttributes = Record<string, Float32Array | Int16Array | Uint16Array | Uint8Array>;

function alignOffset(offset: number) {
  return offset % 4 !== 0 ? offset + (4 - (offset % 4)) : offset;
}

function unpackAttribute(
  attr: BufferAttributeDef,
  count: number,
  typedArray: Float32Array | Int16Array | Uint16Array | Uint8Array,
): Float32Array {
  const totalElements = count * attr.componentSize;
  const unpacked = new Float32Array(totalElements);

  for (let i = 0; i < count; i++) {
    for (let c = 0; c < attr.componentSize; c++) {
      const packDef = attr.packedComponents![c];
      const rawVal = typedArray[i * attr.componentSize + c];

      let normalized = 0;
      if (attr.storageType === 'Uint16Array') {
        normalized = rawVal / 65535;
      } else if (attr.storageType === 'Int16Array') {
        normalized = (rawVal + 32768) / 65535;
      } else if (attr.storageType === 'Uint8Array') {
        normalized = rawVal / 255;
      }

      unpacked[i * attr.componentSize + c] = packDef.from + normalized * packDef.delta;
    }
  }

  return unpacked;
}

export function parseLusionBuffer(buffer: ArrayBuffer): {
  header: BufferHeader;
  geometry: THREE.BufferGeometry | null;
  raw: RawAttributes;
} {
  const dataView = new DataView(buffer);
  const jsonLength = dataView.getUint32(0, true);
  const decoder = new TextDecoder('utf-8');
  const jsonString = decoder.decode(new Uint8Array(buffer, 4, jsonLength));
  const header: BufferHeader = JSON.parse(jsonString);

  let byteOffset = alignOffset(4 + jsonLength);
  const raw: RawAttributes = {};
  const geo = header.meshType === 'Mesh' ? new THREE.BufferGeometry() : null;

  for (const attr of header.attributes) {
    const isIndex = attr.id === 'indices';
    const count = isIndex ? header.indexCount : header.vertexCount;
    const totalElements = count * attr.componentSize;

    if (attr.storageType === 'Float32Array' && byteOffset % 4 !== 0) {
      byteOffset += 4 - (byteOffset % 4);
    }

    let byteLength = 0;
    let typedArray: Float32Array | Int16Array | Uint16Array | Uint8Array;

    if (attr.storageType === 'Float32Array') {
      byteLength = totalElements * 4;
      typedArray = new Float32Array(buffer, byteOffset, totalElements);
    } else if (attr.storageType === 'Uint16Array') {
      byteLength = totalElements * 2;
      typedArray = new Uint16Array(buffer, byteOffset, totalElements);
    } else if (attr.storageType === 'Int16Array') {
      byteLength = totalElements * 2;
      typedArray = new Int16Array(buffer, byteOffset, totalElements);
    } else if (attr.storageType === 'Uint8Array') {
      byteLength = totalElements;
      typedArray = new Uint8Array(buffer, byteOffset, totalElements);
    } else {
      throw new Error(`Unknown storage type: ${attr.storageType}`);
    }

    byteOffset += byteLength;
    raw[attr.id] = typedArray;

    if (!geo) continue;

    if (attr.needsPack && attr.packedComponents) {
      const unpacked = unpackAttribute(attr, count, typedArray);
      setGeometryAttribute(geo, attr.id, unpacked, attr.componentSize);
    } else if (isIndex) {
      geo.setIndex(new THREE.BufferAttribute(typedArray as Uint16Array, 1));
    } else {
      setGeometryAttribute(geo, attr.id, typedArray as Float32Array, attr.componentSize);
    }
  }

  return { header, geometry: geo, raw };
}

function setGeometryAttribute(
  geo: THREE.BufferGeometry,
  id: string,
  array: Float32Array | Int16Array | Uint16Array | Uint8Array,
  itemSize: number,
) {
  const map: Record<string, string> = {
    position: 'position',
    normal: 'normal',
    uv: 'uv',
    boneWeights: 'boneWeights',
    boneIndices: 'boneIndices',
    piece: 'piece',
    indices: 'index',
  };

  const name = map[id] ?? id;
  if (name === 'index') return;
  geo.setAttribute(name, new THREE.BufferAttribute(array, itemSize));
}

export async function fetchLusionBuffer(url: string) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return parseLusionBuffer(buffer);
}
