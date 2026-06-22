'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';

import { useLusionGeometry } from '../useLusionGeometry';
import { buildShader, SHADERS } from '../shaders/buildShader';
import extracted from '../shaders/extracted.json';
import type { useAboutUniforms } from '../hooks/useAboutUniforms';
import { BLOOM_LAYER } from '../layers';

const SIM_W = 128;
const SIM_H = 192;
const LIGHT = new THREE.Vector3(0, 8, 0);

function createDefaultSimTexture() {
  const count = SIM_W * SIM_H;
  const data = new Float32Array(count * 4);
  for (let i = 0, a = 0; i < count; i++, a += 4) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * Math.PI * 2;
    const phi = Math.acos(2 * v - 1);
    const r = 0.25 + Math.cbrt(Math.random()) * 0.5;
    data[a] = r * Math.sin(phi) * Math.cos(theta);
    data[a + 1] = r * Math.sin(phi) * Math.sin(theta);
    data[a + 2] = r * Math.cos(phi);
    data[a + 3] = i / count - 1;
  }
  const tex = new THREE.DataTexture(data, SIM_W, SIM_H, THREE.RGBAFormat, THREE.FloatType);
  tex.needsUpdate = true;
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  return tex;
}

function buildSimUvs() {
  const count = SIM_W * SIM_H;
  const column = new Float32Array((SIM_W - 1) * SIM_H * 2);
  const emissive = new Float32Array(SIM_H * 2);
  let ci = 0;
  let ei = 0;
  for (let p = 0; p < count; p++) {
    const u = (p % SIM_W + 0.5) / SIM_W;
    const v = (Math.floor(p / SIM_W) + 0.5) / SIM_H;
    if (p % SIM_W === 0) {
      emissive[ei++] = u;
      emissive[ei++] = v;
    } else {
      column[ci++] = u;
      column[ci++] = v;
    }
  }
  return { column, emissive };
}

const CORE_VERT = `
attribute vec3 simUv;
uniform sampler2D u_simCurrPosLifeTexture;
uniform float u_isEmissive;
uniform float u_sceneHideRatio;
varying float v_brightness;
void main() {
  vec4 info = texture2D(u_simCurrPosLifeTexture, simUv.xy);
  float life = smoothstep(0.0, 0.1, info.w) * smoothstep(1.0, 0.9, info.w);
  float size = mix(0.05, 0.14, u_isEmissive) * life * (1.0 - u_sceneHideRatio);
  vec3 pos = position * size + info.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  v_brightness = life;
}
`;

const CORE_FRAG = `
varying float v_brightness;
void main() {
  float luma = v_brightness * 0.35;
  gl_FragColor = vec4(vec3(luma), luma);
}
`;

function makeParticleMaterial(
  shared: ReturnType<typeof useAboutUniforms>['uniforms'],
  simTex: THREE.Texture,
  isEmissive: number,
  lightFieldTex: THREE.Texture,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_simCurrPosLifeTexture: { value: simTex },
      u_simTextureSize: { value: new THREE.Vector2(SIM_W, SIM_H) },
      u_sceneHideRatio: { value: 0 },
      u_isEmissive: { value: isEmissive },
      u_emissiveRatio: { value: 0 },
      u_contrast: { value: 1 },
      u_noiseStableFactor: shared.u_noiseStableFactor,
      u_lightFieldSlicedTexture: { value: lightFieldTex },
      u_lightScatterDivider: shared.u_lightScatterDivider,
      u_lightScatterPowInv: shared.u_lightScatterPowInv,
      u_lightScatterPos0: shared.u_lightScatterPos0,
      u_lightScatterPos1: shared.u_lightScatterPos1,
      u_lightScatterRatio: shared.u_lightScatterRatio,
      u_blueNoiseTexture: shared.u_blueNoiseTexture,
      u_blueNoiseTexelSize: shared.u_blueNoiseTexelSize,
      u_blueNoiseCoordOffset: shared.u_blueNoiseCoordOffset,
    },
    vertexShader: buildShader(SHADERS.particleVert),
    fragmentShader: buildShader(SHADERS.particleFrag),
    depthWrite: true,
    depthTest: true,
    transparent: false,
  });
}

export function ParticleField({
  shared,
  scrollProgress,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  scrollProgress: { current: number };
}) {
  const sphereL = useLusionGeometry('/lusion-assets/sphere_l.buf');
  const sphereM = useLusionGeometry('/lusion-assets/sphere_m.buf');
  const simUvs = useMemo(() => buildSimUvs(), []);
  const defaultSim = useMemo(() => createDefaultSimTexture(), []);

  const lightFieldTex = useMemo(() => {
    const data = new Float32Array([1, 1, 1, 1]);
    const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat, THREE.FloatType);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const currFbo = useFBO(SIM_W, SIM_H, { type: THREE.FloatType });
  const prevFbo = useFBO(SIM_W, SIM_H, { type: THREE.FloatType });
  const swap = useRef(false);
  const noiseTime = useRef(0);
  const noiseScaleTime = useRef(Math.random());
  const quadScene = useMemo(() => new THREE.Scene(), []);
  const quadCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const quadMesh = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), []);

  const simMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_simPrevPosLifeTexture: { value: prevFbo.texture },
        u_simDefaultPosLifeTexture: { value: defaultSim },
        u_introDeltaTime: { value: 0.016 },
        u_noiseTime: { value: 0 },
        u_noiseScale: { value: 10 },
        u_noiseStableFactor: shared.u_noiseStableFactor,
        u_lightPosition: shared.u_lightPosition,
      },
      vertexShader: `
        varying vec2 v_uv;
        void main() { v_uv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: buildShader(extracted.fragSim as string),
      depthTest: false,
      depthWrite: false,
    });
  }, [defaultSim, prevFbo.texture, shared]);

  const columnGeo = useMemo(() => new THREE.InstancedBufferGeometry(), []);
  const emissiveGeo = useMemo(() => new THREE.InstancedBufferGeometry(), []);
  const coreColumnGeo = useMemo(() => new THREE.InstancedBufferGeometry(), []);
  const coreEmissiveGeo = useMemo(() => new THREE.InstancedBufferGeometry(), []);

  const columnMat = useMemo(
    () => makeParticleMaterial(shared, currFbo.texture, 0, lightFieldTex),
    [shared, currFbo.texture, lightFieldTex],
  );
  const emissiveMat = useMemo(
    () => makeParticleMaterial(shared, currFbo.texture, 1, lightFieldTex),
    [shared, currFbo.texture, lightFieldTex],
  );

  const coreColumnMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_simCurrPosLifeTexture: { value: currFbo.texture },
          u_isEmissive: { value: 0 },
          u_sceneHideRatio: { value: 0 },
        },
        vertexShader: CORE_VERT,
        fragmentShader: CORE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [currFbo.texture],
  );

  const coreEmissiveMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_simCurrPosLifeTexture: { value: currFbo.texture },
          u_isEmissive: { value: 1 },
          u_sceneHideRatio: { value: 0 },
        },
        vertexShader: CORE_VERT,
        fragmentShader: CORE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [currFbo.texture],
  );

  useLayoutEffect(() => {
    quadMesh.material = simMaterial;
    quadScene.add(quadMesh);
    return () => {
      quadScene.remove(quadMesh);
    };
  }, [quadMesh, quadScene, simMaterial]);

  useLayoutEffect(() => {
    const sphere = sphereM || sphereL;
    if (!sphere) return;
    for (const geo of [columnGeo, emissiveGeo, coreColumnGeo, coreEmissiveGeo]) {
      if (sphere.index) geo.setIndex(sphere.index);
      for (const name in sphere.attributes) {
        geo.setAttribute(name, sphere.attributes[name]);
      }
    }
    columnGeo.setAttribute('simUv', new THREE.InstancedBufferAttribute(simUvs.column, 2));
    emissiveGeo.setAttribute('simUv', new THREE.InstancedBufferAttribute(simUvs.emissive, 2));
    coreColumnGeo.setAttribute('simUv', new THREE.InstancedBufferAttribute(simUvs.column, 2));
    coreEmissiveGeo.setAttribute('simUv', new THREE.InstancedBufferAttribute(simUvs.emissive, 2));
  }, [sphereL, sphereM, columnGeo, emissiveGeo, coreColumnGeo, coreEmissiveGeo, simUvs]);

  const initialized = useRef(false);
  const bloomRef = useRef<THREE.InstancedMesh>(null);
  const bloomEmissiveRef = useRef<THREE.InstancedMesh>(null);
  const layersSet = useRef(false);

  useFrame(({ gl }, delta) => {
    if (!initialized.current) {
      initialized.current = true;
      simMaterial.uniforms.u_simPrevPosLifeTexture.value = defaultSim;
    }

    const scroll = scrollProgress.current;
    const intro = Math.min(scroll / 0.85, 1);
    const emissiveRatio = THREE.MathUtils.smoothstep(intro, 0, 0.2) * 0.75;
    const hideRatio = THREE.MathUtils.smoothstep(intro, 0.85, 1);

    noiseTime.current += delta * 0.4;
    noiseScaleTime.current += delta;
    simMaterial.uniforms.u_noiseTime.value = noiseTime.current;
    simMaterial.uniforms.u_noiseScale.value = 10 * Math.abs(Math.sin(noiseScaleTime.current * 0.7));
    simMaterial.uniforms.u_introDeltaTime.value = delta;
    simMaterial.uniforms.u_noiseStableFactor.value = shared.u_noiseStableFactor.value;

    const read = swap.current ? currFbo : prevFbo;
    const write = swap.current ? prevFbo : currFbo;
    swap.current = !swap.current;

    simMaterial.uniforms.u_simPrevPosLifeTexture.value = read.texture;
    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(write);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(quadScene, quadCam);
    gl.setRenderTarget(prevTarget);

    const simTex = write.texture;
    for (const mat of [columnMat, emissiveMat, coreColumnMat, coreEmissiveMat]) {
      mat.uniforms.u_simCurrPosLifeTexture.value = simTex;
    }
    for (const mat of [columnMat, emissiveMat]) {
      mat.uniforms.u_emissiveRatio.value = emissiveRatio;
      mat.uniforms.u_sceneHideRatio.value = hideRatio;
      mat.uniforms.u_noiseStableFactor.value = shared.u_noiseStableFactor.value;
      mat.uniforms.u_lightScatterPowInv.value = shared.u_lightScatterPowInv.value;
      mat.uniforms.u_lightScatterRatio.value = shared.u_lightScatterRatio.value;
    }
    coreColumnMat.uniforms.u_sceneHideRatio.value = hideRatio;
    coreEmissiveMat.uniforms.u_sceneHideRatio.value = hideRatio;

    if (!layersSet.current && bloomRef.current && bloomEmissiveRef.current) {
      for (const mesh of [bloomRef.current, bloomEmissiveRef.current]) {
        mesh.layers.disable(0);
        mesh.layers.enable(BLOOM_LAYER);
      }
      layersSet.current = true;
    }
  });

  if (!sphereL && !sphereM) return null;

  const columnCount = (SIM_W - 1) * SIM_H;
  const emissiveCount = SIM_H;

  return (
    <group position={LIGHT}>
      {/* Dim cores — visible in base pass */}
      <instancedMesh
        args={[coreColumnGeo, coreColumnMat, columnCount]}
        frustumCulled={false}
        renderOrder={4}
      />
      <instancedMesh
        args={[coreEmissiveGeo, coreEmissiveMat, emissiveCount]}
        frustumCulled={false}
        renderOrder={4}
      />
      {/* Lusion particle shaders — bloom layer only */}
      <instancedMesh
        ref={bloomRef}
        args={[columnGeo, columnMat, columnCount]}
        frustumCulled={false}
        renderOrder={6}
      />
      <instancedMesh
        ref={bloomEmissiveRef}
        args={[emissiveGeo, emissiveMat, emissiveCount]}
        frustumCulled={false}
        renderOrder={6}
      />
    </group>
  );
}
