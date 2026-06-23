'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useLusionGeometry } from '../useLusionGeometry';
import type { useAboutUniforms } from '../hooks/useAboutUniforms';
import { BLOOM_LAYER } from '../layers';

const vertShader = `
attribute vec3 instancePos;
attribute vec4 instanceRands;
attribute float instanceDensity;
uniform float u_time;
uniform float u_showRatio;
varying vec2 v_uv;
varying vec2 v_charUv;
varying vec3 v_worldPosition;
varying vec4 v_instanceRands;
varying float v_opacity;

void main() {
  float charCount = mix(50., 100., instanceRands.y);
  vec3 pos = position;
  v_uv = uv;
  pos.xy *= vec2(1., 6./5. * charCount);
  v_charUv = vec2(1. - position.x, position.y * charCount) + vec2(.5, 0.);
  v_charUv.y -= u_time * mix(2., 10., instanceRands.x);
  pos = pos * 0.75 + instancePos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
  v_worldPosition = (modelMatrix * vec4(pos, 1.)).xyz;
  v_instanceRands = instanceRands;
  v_opacity = mix(.5, 1., instanceDensity) * u_showRatio;
}
`;

const fragShader = `
uniform sampler2D u_letterTexture;
uniform float u_time;
varying vec2 v_charUv;
varying vec2 v_uv;
varying vec3 v_worldPosition;
varying vec4 v_instanceRands;
varying float v_opacity;

float linearStep(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

vec4 hash43(vec3 p) {
  vec4 p4 = fract(vec4(p.xyzx) * vec4(.1031, .1030, .0973, .1099));
  p4 += dot(p4, p4.wzxy + 33.33);
  return fract((p4.xxyz + p4.yzzw) * p4.zywx);
}

void main() {
  if (v_opacity < 0.01) discard;
  float MAX_CHAR = 42.;
  float charIdx = floor(mod(v_charUv.y, MAX_CHAR));
  float charTime = u_time * mix(1., 2., v_instanceRands.y + hash43(vec3(charIdx, -100., v_instanceRands.z)).x);
  vec4 charRands = hash43(vec3(charIdx, v_instanceRands.w, floor(charTime * -2.)));
  charIdx = mod(charIdx + floor(charRands.x * MAX_CHAR), MAX_CHAR);
  vec2 charUv = vec2((v_charUv.x + charIdx) / MAX_CHAR, mod(v_charUv.y, 1.));
  
  float fade = 1.0;
  float shade = texture2D(u_letterTexture, charUv).r;
  gl_FragColor = vec4(shade) * charRands.w * charRands.y * v_opacity;
  gl_FragColor *= smoothstep(0.5, 0.35, abs(v_uv.y - .5)) * (0.5 + fade * 0.5) * (0.3 + v_instanceRands.z * 1.25) * smoothstep(100., 150., mod(v_charUv.y - 200. * v_instanceRands.y, 200.));
  gl_FragColor.a *= 3.;
}
`;

export function AboutHeroLetters({
  shared,
  scrollProgress,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  scrollProgress: { current: number };
}) {
  const geoData = useLusionGeometry('/lusion-assets/letter_placements.buf');
  const letterTexture = useLoader(THREE.TextureLoader, '/lusion-assets/font.png');

  const material = useMemo(() => {
    letterTexture.minFilter = THREE.NearestFilter;
    letterTexture.magFilter = THREE.NearestFilter;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        u_time: shared.u_time,
        u_showRatio: { value: 1.0 },
        u_letterTexture: { value: letterTexture },
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquationAlpha: THREE.AddEquation,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
    });
  }, [shared, letterTexture]);

  const geometries = useMemo(() => {
    if (!geoData || !geoData.attributes.position) return [];
    const baseGeo = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0).rotateY(Math.PI);
    const totalCount = geoData.attributes.position.count;
    const countPerMesh = Math.floor(totalCount / 4);
    
    const geos = [];
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.InstancedBufferGeometry();
      geo.setIndex(baseGeo.index);
      for (const key in baseGeo.attributes) {
        geo.setAttribute(key, baseGeo.attributes[key]);
      }
      
      const rands = new Float32Array(countPerMesh * 4);
      for (let j = 0; j < countPerMesh; j++) {
        rands[j * 4 + 0] = Math.random();
        rands[j * 4 + 1] = Math.random();
        rands[j * 4 + 2] = Math.random();
        rands[j * 4 + 3] = Math.random();
      }
      geo.setAttribute('instanceRands', new THREE.InstancedBufferAttribute(rands, 4));
      
      const offset = countPerMesh * i;
      const positions = geoData.attributes.position.array.slice(offset * 3, (offset + countPerMesh) * 3);
      geo.setAttribute('instancePos', new THREE.InstancedBufferAttribute(positions, 3));
      
      const density = geoData.attributes.density?.array.slice(offset, offset + countPerMesh) || new Float32Array(countPerMesh).fill(1);
      geo.setAttribute('instanceDensity', new THREE.InstancedBufferAttribute(density, 1));
      
      geos.push(geo);
    }
    return geos;
  }, [geoData]);

  useFrame(() => {
    // Letters fade out as you scroll down
    const scroll = scrollProgress.current;
    // Fade out completely by scroll = 0.2
    material.uniforms.u_showRatio.value = THREE.MathUtils.clamp(1.0 - scroll * 5.0, 0, 1);
  });

  if (geometries.length === 0) return null;

  return (
    <group layers={BLOOM_LAYER}>
      {geometries.map((geo, idx) => (
        <mesh key={idx} geometry={geo} material={material} frustumCulled={false} renderOrder={10} />
      ))}
    </group>
  );
}
