'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBufferGeometry } from '../useBufferGeometry';
import { buildShader, SHADERS } from '../shaders/buildShader';
import type { useAboutUniforms } from '../hooks/useAboutUniforms';
import React from 'react';
import { BLOOM_LAYER } from '../layers';

// Buffer AboutHeroHalo — exact vert$4 + frag$7 from buffer_bundle.js / bg_box.buf
export function AboutHalo({
  shared,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  scrollProgress?: { current: number };
}) {
  const geometry = useBufferGeometry('/shaders/bg_box.buf');

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_sceneRatio: shared.u_sceneRatio,
          u_hudRatio: shared.u_hudRatio,
          u_lightScatterDivider: shared.u_lightScatterDivider,
          u_lightScatterPowInv: shared.u_lightScatterPowInv,
          u_lightScatterPos0: shared.u_lightScatterPos0,
          u_lightScatterPos1: shared.u_lightScatterPos1,
          u_lightScatterRatio: shared.u_lightScatterRatio,
          u_blueNoiseTexture: shared.u_blueNoiseTexture,
          u_blueNoiseTexelSize: shared.u_blueNoiseTexelSize,
          u_blueNoiseCoordOffset: shared.u_blueNoiseCoordOffset,
          u_lightPosition: shared.u_lightPosition,
          u_bgColor: shared.u_bgColor,
          u_resolution: { value: new THREE.Vector2(1, 1) },
          u_currSceneTexture: { value: null },
        },
        vertexShader: buildShader(SHADERS.haloVert),
        fragmentShader: buildShader(SHADERS.haloFrag),
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    [shared],
  );

  useFrame((state) => {
    material.uniforms.u_sceneRatio.value = shared.u_sceneRatio.value;
    material.uniforms.u_hudRatio.value = shared.u_hudRatio.value;
    material.uniforms.u_lightScatterPowInv.value = shared.u_lightScatterPowInv.value;
    material.uniforms.u_lightScatterRatio.value = shared.u_lightScatterRatio.value;
    material.uniforms.u_resolution.value.set(state.size.width, state.size.height);
  });

  if (!geometry) return null;

  return (
    <mesh
      geometry={geometry}
      material={material}
      
      renderOrder={10}
      frustumCulled={false}
      onUpdate={(self) => self.layers.enable(BLOOM_LAYER)}
    />
  );
}
