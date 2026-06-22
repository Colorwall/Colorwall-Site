'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useLusionGeometry } from '../useLusionGeometry';
import { buildShader } from '../shaders/buildShader';
import type { useAboutUniforms } from '../hooks/useAboutUniforms';

const HALO_VERT = `
varying vec3 v_worldPosition;
varying vec3 v_viewPosition;
varying vec2 v_uv;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  v_worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  v_viewPosition = -mv.xyz;
  v_uv = uv;
}
`;

const HALO_FRAG = `
uniform float u_sceneRatio;
uniform float u_hudRatio;
varying vec3 v_worldPosition;
#include <getScatter>
#include <getBlueNoise>
void main() {
  vec3 noise = getBlueNoise(gl_FragCoord.xy + vec2(57., 27.));
  float scatter = getScatter(cameraPosition, v_worldPosition);
  // Keep volumetric beam above the astronaut — no ground-level whiteout
  float heightFade = smoothstep(1.5, 7.0, v_worldPosition.y);
  scatter *= u_sceneRatio * (1.0 - u_hudRatio) * 0.35 * heightFade;
  scatter += noise.r * 0.001;
  gl_FragColor = vec4(vec3(scatter), scatter * 0.25);
}
`;

export function AboutHalo({
  shared,
  scrollProgress,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  scrollProgress: { current: number };
}) {
  const geometry = useLusionGeometry('/lusion-assets/bg_box.buf');

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
        },
        vertexShader: HALO_VERT,
        fragmentShader: buildShader(HALO_FRAG),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [shared],
  );

  useFrame(() => {
    material.uniforms.u_sceneRatio.value = shared.u_sceneRatio.value;
    material.uniforms.u_hudRatio.value = shared.u_hudRatio.value;
    material.uniforms.u_lightScatterPowInv.value = shared.u_lightScatterPowInv.value;
    material.uniforms.u_lightScatterRatio.value = shared.u_lightScatterRatio.value;
  });

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} material={material} position={[0, 8, 0]} renderOrder={10} frustumCulled={false} />
  );
}
