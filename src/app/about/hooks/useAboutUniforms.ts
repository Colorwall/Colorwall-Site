import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { introRatioFromScroll } from './useCameraSpline';

export function useAboutUniforms(scrollRef: { current: number }) {
  const lightPosition = useMemo(() => new THREE.Vector3(0, 8, 0), []);

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
    u_hudRatio: { value: 0 },
    u_noiseStableFactor: { value: 0 },
    u_bgColor: { value: new THREE.Color('#000000') },
  });

  const sync = () => {
    const scroll = scrollRef.current;
    const intro = introRatioFromScroll(scroll);
    const hud = scroll > 0.35 ? Math.min((scroll - 0.35) / 0.15, 1) : 0;

    uniforms.current.u_sceneRatio.value = Math.max(
      THREE.MathUtils.smoothstep(intro, 0.01, 0.15),
      0.85,
    );
    uniforms.current.u_sceneHideRatio.value = THREE.MathUtils.smoothstep(intro, 0.85, 1);
    uniforms.current.u_hudRatio.value = hud;
    uniforms.current.u_noiseStableFactor.value = THREE.MathUtils.smoothstep(intro, 0, 0.2);

    const scatterPow = intro < 0.7
      ? THREE.MathUtils.lerp(2, 0.7, intro / 0.7)
      : THREE.MathUtils.lerp(0.7, 0.4, (intro - 0.7) / 0.15);
    uniforms.current.u_lightScatterPowInv.value = scatterPow;
    uniforms.current.u_lightScatterRatio.value = intro > 0.7
      ? 1 - THREE.MathUtils.smoothstep(intro, 0.7, 0.85)
      : 1;
  };

  return { uniforms: uniforms.current, sync, lightPosition };
}
