import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  cubicIn,
  cubicOut,
  fit,
  hudRatioFromIntro,
  introRatioFromScroll,
} from '../mathUtils';

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
    const scroll = scrollRef.current;
    const intro = introRatioFromScroll(scroll);
    // Use the exact hudRatio calculation from getScrollPhases for consistency
    const hudRatio = scroll > 0.85 ? Math.min((scroll - 0.85) / 0.15, 1) : 0;

    // Buffer AboutHero.syncProperties
    uniforms.current.u_sceneRatio.value = fit(intro, 0.01, 0.1, 0, 1, cubicOut);
    uniforms.current.u_sceneHideRatio.value = fit(intro, 0.85, 1, 0, 1);
    uniforms.current.u_hudRatio.value = hudRatio;
    uniforms.current.u_noiseStableFactor.value = fit(intro, 0, 0.4, 0, 1);

    // Buffer AboutHeroScatter.update
    let scatterPow = fit(intro, 0, 0.2, 2, 0.7);
    scatterPow = fit(intro, 0.7, 0.85, scatterPow, 0.4);
    uniforms.current.u_lightScatterPowInv.value = scatterPow;
    
    // Buffer correctly fades the ambient scatter to 0 from 0.7 to 0.85
    uniforms.current.u_lightScatterRatio.value = fit(intro, 0.7, 0.85, 1.0, 0.0, cubicIn);
  };

  return { uniforms: uniforms.current, sync, lightPosition };
}
