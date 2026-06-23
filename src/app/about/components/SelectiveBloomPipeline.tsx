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
varying vec2 vUv;
void main() {
  // Lusion renders the scene as a data buffer: R = Luminance, G = Depth, B = Mask
  float baseLum = texture2D(tBase, vUv).r;
  float bloomLum = texture2D(tBloom, vUv).r;
  
  vec3 col = vec3(baseLum + bloomLum);
  col = pow(col, vec3(1.05));
  col = clamp(col * vec3(1.02, 1.0, 0.99), 0.0, 1.0);
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

  const quadScene = useMemo(() => new THREE.Scene(), []);
  const quadCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const blitMesh = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), []);

  const compositeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          tBase: { value: null as THREE.Texture | null },
          tBloom: { value: null as THREE.Texture | null },
        },
        vertexShader: COMPOSITE_VERT,
        fragmentShader: COMPOSITE_FRAG,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  const bloomPass = useMemo(
    () => new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 2.5, 0.4, 0.12),
    [size.width, size.height],
  );

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
