import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  cubicIn,
  cubicOut,
  fit,
  hudRatioFromIntro,
  introRatioFromScroll,
} from '../mathLusion';

export function useAboutUniforms(scrollRef: { current: number }) {
  const lightPosition = useMemo(() => new THREE.Vector3(0, 8, 0), []);
  const loadTime = useRef(performance.now());

  const uniforms = useRef({
    u_lightPosition: { value: lightPosition },
    u_lightShadowMaxDistance: { value: 12 },
    u_lightShadowTexture: { value: null as THREE.Texture | null },
    u_lightShadowTextureTexelSize: { value: new THREE.Vector2(1 / 1024, 1 / 2048) },
    u_lightScatterDivider: { value: new THREE.Vector2(1.1, 5.5) },
    u_lightScatterPowInv: { value: 0.7 },
    u_lightScatterRatio: { value: 1 },
    u_lightScatterPos0: { value: new THREE.Vector3(0, 18, 0) },
    u_lightScatterPos1: { value: new THREE.Vector3(0, 0, 0) },
    u_blueNoiseTexture: { value: null as THREE.Texture | null },
    u_blueNoiseTexelSize: { value: new THREE.Vector2(1 / 128, 1 / 128) },
    u_blueNoiseCoordOffset: { value: new THREE.Vector2() },
    u_sceneRatio: { value: 1 },
    u_sceneHideRatio: { value: 0 },
    u_introTime: { value: 0 },
    u_hudRatio: { value: 0 },
    u_noiseStableFactor: { value: 0 },
    u_bgColor: { value: new THREE.Color('#000000') },
  });

  const sync = () => {
    const intro = introRatioFromScroll(scrollRef.current);

    // Lusion AboutHero.syncProperties — scene fades in early, then HUD dims platform/light
    uniforms.current.u_sceneRatio.value = fit(intro, 0.01, 0.1, 0, 1, cubicOut);
    uniforms.current.u_sceneHideRatio.value = fit(intro, 0.85, 1, 0, 1);
    
    // Do not ramp hudRatio to 1, because that transitions the terrain to black.
    // We want the astronaut area to stay fully lit.
    uniforms.current.u_hudRatio.value = 0;
    uniforms.current.u_noiseStableFactor.value = fit(intro, 0, 0.4, 0, 1);

    // Lusion AboutHeroScatter.update
    // Drive this with true time rather than scroll so it acts as an intro animation
    const timeElapsed = (performance.now() - loadTime.current) / 1000;
    const timeIntro = Math.min(timeElapsed / 3.0, 1.0); // 3-second intro

    let scatterPow = fit(timeIntro, 0, 0.2, 2, 0.7);
    scatterPow = fit(timeIntro, 0.7, 0.85, scatterPow, 0.4);
    uniforms.current.u_lightScatterPowInv.value = scatterPow;
    
    // We do not go all the way to 0 here because our port lacks the LightField volume
    // so we need the scatter to remain and light the scene at a resting state.
    uniforms.current.u_lightScatterRatio.value = fit(timeIntro, 0.7, 0.85, 1.0, 0.35, cubicIn);
  };

  return { uniforms: uniforms.current, sync, lightPosition };
}
