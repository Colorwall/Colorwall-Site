'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLusionGeometry } from '../useLusionGeometry';
import { buildShader } from '../shaders/buildShader';
import extracted from '../shaders/extracted.json';
import type { useAboutUniforms } from '../hooks/useAboutUniforms';
import React from 'react';
import { BLOOM_LAYER } from '../layers';

// Lusion AboutHeroHalo — exact vert$4 + frag$7 from lusion_bundle.js / bg_box.buf
export function AboutHalo({
  shared,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  scrollProgress?: { current: number };
}) {
  const geometry = useLusionGeometry('/lusion-assets/bg_box.buf');

  const haloFrag = useMemo(
    () =>
      (extracted['frag$7'] as string).replace(
        'gl_FragColor.r+=noise.r*0.004;}',
        'gl_FragColor.r+=noise.r*0.004;gl_FragColor.rgb=vec3(gl_FragColor.r);gl_FragColor.a=gl_FragColor.r*0.15;}',
      ),
    [],
  );

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
        vertexShader: buildShader(extracted['vert$4'] as string),
        fragmentShader: buildShader(haloFrag),
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [shared, haloFrag],
  );

  useFrame((state) => {
    material.uniforms.u_sceneRatio.value = shared.u_sceneRatio.value;
    material.uniforms.u_hudRatio.value = shared.u_hudRatio.value;
    material.uniforms.u_lightScatterPowInv.value = shared.u_lightScatterPowInv.value;
    material.uniforms.u_lightScatterRatio.value = shared.u_lightScatterRatio.value;
    material.uniforms.u_resolution.value.set(state.size.width, state.size.height);
  });

  const meshRef = React.useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    if (meshRef.current) {
      meshRef.current.layers.enable(BLOOM_LAYER);
    }
  }, []);

  if (!geometry) return null;

  return <mesh ref={meshRef} geometry={geometry} material={material} position={[0, 8, 0]} renderOrder={10} frustumCulled={false} />;
}
