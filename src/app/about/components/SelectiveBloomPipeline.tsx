'use client';

import { useMemo, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BLOOM_LAYER } from '../layers';
import { fit, hudRatioFromIntro, introRatioFromScroll, sineOut } from '../mathUtils';

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
varying vec2 vUv;

vec3 colorDodge(vec3 src, vec3 dst) {
  return mix(step(0.0, src) * (min(vec3(1.0), dst / (1.0 - src))), vec3(1.0), step(1.0, dst));
}

vec3 colorBurn(vec3 src, vec3 dst) {
  return mix(step(0.0, src) * (1.0 - min(vec3(1.0), (1.0 - dst) / src)), vec3(1.0), step(1.0, dst));
}

void main() {
  // Buffer renders the scene as a data buffer: R = Luminance
  float baseLum = texture2D(tBase, vUv).r;
  float bloomLum = texture2D(tBloom, vUv).r;
  vec3 col = vec3(baseLum + bloomLum);
  
  // Clamp HDR bloom to 0-1 before color grading to prevent mix() extrapolation and math explosion
  col = clamp(col, 0.0, 1.0);
  
  // Apply Buffer's exact AboutPageHeroEfx composite
  vec3 burned = mix(col, colorBurn(u_colorBurn, col), u_colorBurnAlpha);
  vec3 dodged = mix(col, colorDodge(u_colorDodge, col), u_colorDodgeAlpha);
  col = mix(burned, dodged, col); // Buffer mixes between burned and dodged based on original luminance!
  
  gl_FragColor = vec4(col, 1.0);
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

  // temporal motion blur state to smoothly track velocity and keep history
  const currentFrameTarget = useFBO();
  const historyTarget1 = useFBO();
  const historyTarget2 = useFBO();
  const historySwap = useRef(false);
  const prevScroll = useRef(0);
  const blurRef = useRef(0);

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
        },
        vertexShader: COMPOSITE_VERT,
        fragmentShader: COMPOSITE_FRAG,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  const motionBlurMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tCurrent: { value: null as THREE.Texture | null },
          tHistory: { value: null as THREE.Texture | null },
          u_blurAmount: { value: 0.0 },
        },
        vertexShader: COMPOSITE_VERT,
        fragmentShader: `
          uniform sampler2D tCurrent;
          uniform sampler2D tHistory;
          uniform float u_blurAmount;
          varying vec2 vUv;
          void main() {
            vec4 cur = texture2D(tCurrent, vUv);
            vec4 hist = texture2D(tHistory, vUv);
            // blend the current frame with previous history based on velocity
            gl_FragColor = mix(cur, hist, u_blurAmount);
          }
        `,
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

    // Apply exact Buffer Post-Processing Colors
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

    // render the fully composited frame (base + bloom) to currentframetarget 
    // instead of directly to screen. we use this as input for temporal motion blur.
    compositeMat.uniforms.tBase.value = baseTarget.texture;
    compositeMat.uniforms.tBloom.value = bloomWriteTarget.texture;
    blitMesh.material = compositeMat;
    gl.setRenderTarget(currentFrameTarget);
    gl.clear();
    gl.render(quadScene, quadCam);

    // calculate instantaneous scroll velocity and map it to a blur intensity (0.0 to 0.85).
    // we use a highly smoothed interpolator (blurref) to organically fade the motion blur 
    // in and out, making the webgl camera motion feel cinematic rather than abrupt.
    const vel = Math.abs(scrollProgress.current - prevScroll.current);
    prevScroll.current = scrollProgress.current;
    
    const targetBlur = Math.min(vel * 80.0, 0.85);
    blurRef.current += (targetBlur - blurRef.current) * 0.1;
    motionBlurMat.uniforms.u_blurAmount.value = blurRef.current;

    // temporal accumulation ping-pong logic
    const readHistory = historySwap.current ? historyTarget1 : historyTarget2;
    const writeHistory = historySwap.current ? historyTarget2 : historyTarget1;
    historySwap.current = !historySwap.current;

    motionBlurMat.uniforms.tCurrent.value = currentFrameTarget.texture;
    motionBlurMat.uniforms.tHistory.value = readHistory.texture;
    blitMesh.material = motionBlurMat;

    // save the blended result into the history buffer for the next frame
    gl.setRenderTarget(writeHistory);
    gl.clear();
    gl.render(quadScene, quadCam);

    // finally, render the motion-blurred history buffer to the screen
    gl.setRenderTarget(null);
    gl.clear();
    gl.render(quadScene, quadCam);
  }, 1);

  return null;
}
