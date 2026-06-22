'use client';

import { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BLOOM_LAYER } from '../layers';

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
  gl_FragColor = vec4(texture2D(tBase, vUv).rgb + texture2D(tBloom, vUv).rgb, 1.0);
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
    const scroll = scrollProgress.current;
    const intro = Math.min(scroll / 0.85, 1);
    const hud = scroll > 0.35 ? Math.min((scroll - 0.35) / 0.15, 1) : 0;

    bloomPass.strength = THREE.MathUtils.lerp(2.0, 3.8, THREE.MathUtils.smoothstep(intro, 0, 0.4));
    bloomPass.strength = THREE.MathUtils.lerp(bloomPass.strength, 5.0, hud * 0.35);
    bloomPass.threshold = 0.05;
    bloomPass.radius = 0.45;

    const savedMask = camera.layers.mask;

    // Crisp base — terrain, rocks, astronaut, halo (no bloom-layer particles)
    camera.layers.set(0);
    camera.layers.disable(BLOOM_LAYER);
    gl.setRenderTarget(baseTarget);
    gl.setClearColor(0x000000, 1);
    gl.clear();
    gl.render(scene, camera);

    // Particle-only mask
    camera.layers.set(BLOOM_LAYER);
    gl.setRenderTarget(bloomMaskTarget);
    gl.setClearColor(0x000000, 1);
    gl.clear();
    gl.render(scene, camera);

    camera.layers.mask = savedMask;

    // Copy mask into bloom read buffer
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
