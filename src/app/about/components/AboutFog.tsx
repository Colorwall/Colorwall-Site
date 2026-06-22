'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { useAboutUniforms } from '../hooks/useAboutUniforms';

const FOG_COUNT = 32;

const FOG_VERT = `
attribute float a_instanceId;
attribute vec3 a_instancePos;
attribute vec3 a_instanceRands;
varying vec2 v_uv;
varying vec3 v_worldPosition;
varying float v_opacity;
uniform float u_sceneRatio;
void main() {
  vec3 pos = position;
  pos.xy *= 4.0 + a_instanceRands.x * 2.0;
  pos += a_instancePos;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  v_uv = uv;
  v_worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  float distFade = smoothstep(40.0, 8.0, length(v_worldPosition - cameraPosition));
  v_opacity = (0.15 + a_instanceRands.y * 0.2) * u_sceneRatio * distFade;
}
`;

const FOG_FRAG = `
uniform sampler2D u_fogTexture;
varying vec2 v_uv;
varying vec3 v_worldPosition;
varying float v_opacity;
void main() {
  vec4 fog = texture2D(u_fogTexture, v_uv);
  float alpha = fog.r * v_opacity;
  gl_FragColor = vec4(vec3(1.0), alpha);
}
`;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function AboutFog({
  shared,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
}) {
  const fogTexture = useTexture('/lusion-assets/fog.png');
  fogTexture.wrapS = fogTexture.wrapT = THREE.RepeatWrapping;
  fogTexture.colorSpace = THREE.LinearSRGBColorSpace;

  const { geometry, instanceIds, instancePos, instanceRands } = useMemo(() => {
    const base = new THREE.PlaneGeometry(1, 1, 3, 3);
    const geo = new THREE.InstancedBufferGeometry();
    if (base.index) geo.setIndex(base.index);
    for (const name in base.attributes) {
      geo.setAttribute(name, base.attributes[name]);
    }

    const ids = new Float32Array(FOG_COUNT);
    const pos = new Float32Array(FOG_COUNT * 3);
    const rands = new Float32Array(FOG_COUNT * 3);

    for (let i = 0, c = 0; i < FOG_COUNT; i++, c += 3) {
      ids[i] = i;
      pos[c] = 12 * (seededRandom(i * 3) * 2 - 1);
      pos[c + 1] = -0.25 + 0.5 * seededRandom(i * 3 + 1);
      pos[c + 2] = 12 * (1 - (i / (FOG_COUNT - 1)) * 2);
      rands[c] = seededRandom(i * 7);
      rands[c + 1] = seededRandom(i * 11);
      rands[c + 2] = seededRandom(i * 13);
    }

    geo.setAttribute('a_instanceId', new THREE.InstancedBufferAttribute(ids, 1));
    geo.setAttribute('a_instancePos', new THREE.InstancedBufferAttribute(pos, 3));
    geo.setAttribute('a_instanceRands', new THREE.InstancedBufferAttribute(rands, 3));

    return { geometry: geo, instanceIds: ids, instancePos: pos, instanceRands: rands };
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_fogTexture: { value: fogTexture },
          u_sceneRatio: shared.u_sceneRatio,
        },
        vertexShader: FOG_VERT,
        fragmentShader: FOG_FRAG,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
      }),
    [fogTexture, shared],
  );

  useFrame(() => {
    material.uniforms.u_sceneRatio.value = shared.u_sceneRatio.value;
  });

  return (
    <instancedMesh args={[geometry, material, FOG_COUNT]} frustumCulled={false} renderOrder={20} />
  );
}
