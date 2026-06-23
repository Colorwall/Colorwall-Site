'use client';

import { useMemo, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BLOOM_LAYER } from '../layers';
import { fit, hudRatioFromIntro, introRatioFromScroll, sineOut } from '../mathLusion';

const COMPOSITE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const COMPOSITE_FRAG = `
uniform sampler2D tBase;
uniform sampler2D tBloom;
uniform vec3 u_colorBurn;
uniform float u_colorBurnAlpha;
uniform vec3 u_colorDodge;
uniform float u_colorDodgeAlpha;
uniform vec2 u_vignetteAspect;
uniform float u_vignetteFrom;
uniform float u_vignetteTo;
uniform vec3 u_vignetteColor;
varying vec2 vUv;

vec3 colorDodge(vec3 src, vec3 dst) {
  return mix(step(0.0, src) * (min(vec3(1.0), dst / (1.0 - src))), vec3(1.0), step(1.0, dst));
}

vec3 colorBurn(vec3 src, vec3 dst) {
  return mix(step(0.0, src) * (1.0 - min(vec3(1.0), (1.0 - dst) / src)), vec3(1.0), step(1.0, dst));
}

void main() {
  vec4 baseCol = texture2D(tBase, vUv);
  vec4 bloomCol = texture2D(tBloom, vUv);
  
  // Additive bloom
  vec3 texCol = baseCol.rgb + bloomCol.rgb;
  
  // Apply Lusion's exact AboutPageHeroEfx color grading
  vec3 burned = mix(texCol, colorBurn(u_colorBurn, texCol), u_colorBurnAlpha);
  vec3 dodged = mix(texCol, colorDodge(u_colorDodge, texCol), u_colorDodgeAlpha);
  texCol = mix(burned, dodged, texCol);
  
  // Apply vignette
  float d = length((vUv - 0.5) * u_vignetteAspect) * 2.0;
  texCol = mix(texCol, u_vignetteColor, smoothstep(u_vignetteFrom, u_vignetteTo, d));
  
  gl_FragColor = vec4(texCol, 1.0);
}
`;

export function SelectiveBloomPipeline({
  scrollProgress,
}: {
  scrollProgress: { current: number };
}) {
  const { gl, scene, camera, size } = useThree();
  const baseTarget = useFBO();
  const bloomMaskTarget = useFBO();
  const bloomReadTarget = useFBO();
  const bloomWriteTarget = useFBO();

  const quadScene = useMemo(() => new THREE.Scene(), []);
  const quadCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const blitMesh = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), []);

  const compositeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tBase: { value: null as THREE.Texture | null },
          tBloom: { value: null as THREE.Texture | null },
          u_colorBurn: { value: new THREE.Color() },
          u_colorBurnAlpha: { value: 1.0 },
          u_colorDodge: { value: new THREE.Color() },
          u_colorDodgeAlpha: { value: 1.0 },
          u_vignetteAspect: { value: new THREE.Vector2() },
          u_vignetteFrom: { value: 2.0 },
          u_vignetteTo: { value: 5.0 },
          u_vignetteColor: { value: new THREE.Color('#000000') },
        },
        vertexShader: COMPOSITE_VERT,
        fragmentShader: COMPOSITE_FRAG,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  const bloomPass = useMemo(() => {
    const pass = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 2.0, 1.0, 0.85);
    pass.threshold = 0;
    pass.strength = 2.0;
    pass.radius = 1.0;
    return pass;
  }, [size.width, size.height]);

  useLayoutEffect(() => {
    quadScene.add(blitMesh);
    return () => {
      quadScene.remove(blitMesh);
    };
  }, [blitMesh, quadScene]);

  useLayoutEffect(() => {
    bloomPass.setSize(size.width, size.height);
  }, [bloomPass, size.width, size.height]);

  useFrame(() => {
    const intro = introRatioFromScroll(scrollProgress.current);
    const hud = hudRatioFromIntro(intro);

    let bloomStrength = fit(intro, 0.1, 0.85, 3.2, 5.2, sineOut);
    bloomStrength = fit(intro, 0.85, 1, bloomStrength, 6.0);
    bloomStrength = fit(hud, 0, 0.5, bloomStrength, 6.0);
    bloomPass.strength = bloomStrength;
    bloomPass.threshold = 0.02;
    bloomPass.radius = 0.55;

    // Apply exact Lusion Post-Processing Colors
    const sceneColorBurn = new THREE.Color('#00f0ff');
    const sceneColorDodge = new THREE.Color('#005aff');
    const sceneColorBurnAlpha = 0.15;
    const sceneColorDodgeAlpha = 0.12;

    const hudColorBurn = new THREE.Color('#79a8ff');
    const hudColorDodge = new THREE.Color('#a5ff44');
    const hudColorBurnAlpha = 1.0;
    const hudColorDodgeAlpha = 0.7;

    compositeMat.uniforms.u_colorBurn.value.copy(sceneColorBurn).lerp(hudColorBurn, hud);
    compositeMat.uniforms.u_colorDodge.value.copy(sceneColorDodge).lerp(hudColorDodge, hud);
    compositeMat.uniforms.u_colorBurnAlpha.value = THREE.MathUtils.lerp(sceneColorBurnAlpha, hudColorBurnAlpha, hud * hud);
    compositeMat.uniforms.u_colorDodgeAlpha.value = THREE.MathUtils.lerp(sceneColorDodgeAlpha, hudColorDodgeAlpha, hud * hud);

    const aspect = size.width / Math.sqrt(size.width * size.width + size.height * size.height);
    compositeMat.uniforms.u_vignetteAspect.value.set(size.width / size.height * aspect, aspect);

    const savedMask = camera.layers.mask;

    camera.layers.set(0);
    camera.layers.disable(BLOOM_LAYER);
    gl.setRenderTarget(baseTarget);
    gl.setClearColor(0x000000, 1);
    gl.clear();
    gl.render(scene, camera);

    camera.layers.set(BLOOM_LAYER);
    gl.setRenderTarget(bloomMaskTarget);
    gl.setClearColor(0x000000, 1);
    gl.clear();
    gl.render(scene, camera);

    camera.layers.mask = savedMask;

    blitMesh.material = new THREE.MeshBasicMaterial({ map: bloomMaskTarget.texture });
    gl.setRenderTarget(bloomReadTarget);
    gl.clear();
    gl.render(quadScene, quadCam);

    bloomPass.render(gl, bloomWriteTarget, bloomReadTarget, 0, false);

    compositeMat.uniforms.tBase.value = baseTarget.texture;
    compositeMat.uniforms.tBloom.value = bloomWriteTarget.texture;
    blitMesh.material = compositeMat;
    gl.setRenderTarget(null);
    gl.clear();
    gl.render(quadScene, quadCam);
  }, 1);

  return null;
}
