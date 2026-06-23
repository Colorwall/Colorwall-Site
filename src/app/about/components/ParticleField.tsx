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

const SIM_W = 96;
const SIM_H = 128;

function pickParticleLod(intro: number, isSmallScreen: boolean) {
  const early = intro < 0.3;
  const mid = !early && intro < 0.7;
  if (isSmallScreen) {
    return {
      column: early ? 2 : 3,
      emissive: early ? 1 : mid ? 2 : 3,
    };
  }
  return {
    column: early ? 1 : mid ? 2 : 3,
    emissive: early ? 0 : mid ? 1 : 3,
  };
}

function applyLodGeometry(
  geo: THREE.InstancedBufferGeometry,
  lodGeo: THREE.BufferGeometry,
) {
  if (lodGeo.index) geo.setIndex(lodGeo.index);
  for (const name in lodGeo.attributes) {
    geo.setAttribute(name, lodGeo.attributes[name]);
  }
}

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

const GRID_COUNT = new THREE.Vector3(64, 64, 64);
const GRID_SIZE = 8 / 63;
const VOLUME_SIZE = new THREE.Vector3(8, GRID_SIZE * 63, GRID_SIZE * 63);

function makeParticleMaterial(
  shared: ReturnType<typeof useAboutUniforms>['uniforms'],
  simTex: THREE.Texture,
  isEmissive: number,
  fragmentKey: 'particleFrag' | 'particleFragBloom',
  bloomPass = false,
) {
  const volOffset = new THREE.Vector3();
  volOffset.copy(VOLUME_SIZE).multiplyScalar(0.5).sub(shared.u_lightPosition.value).multiplyScalar(-1);
  volOffset.addScalar(-GRID_SIZE / 2);

  return new THREE.ShaderMaterial({
    uniforms: {
      u_simCurrPosLifeTexture: { value: simTex },
      u_simTextureSize: { value: new THREE.Vector2(SIM_W, SIM_H) },
      u_sceneHideRatio: { value: 0 },
      u_isEmissive: { value: isEmissive },
      u_emissiveRatio: { value: 0 },
      u_contrast: { value: 1 },
      u_noiseStableFactor: shared.u_noiseStableFactor,
      u_lightFieldSlicedTexture: { value: null },
      u_lightFieldSlicedTextureSize: { value: new THREE.Vector2(1, 1) },
      u_lightFieldSliceColRowCount: { value: new THREE.Vector2(1, 1) },
      u_lightFieldGridCount: { value: GRID_COUNT.clone() },
      u_lightFieldVolumeOffset: { value: volOffset },
      u_lightFieldVolumeSize: { value: VOLUME_SIZE.clone() },
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
    fragmentShader: buildShader(SHADERS[fragmentKey]),
    depthWrite: !bloomPass,
    depthTest: !bloomPass,
    transparent: bloomPass,
    blending: bloomPass ? THREE.AdditiveBlending : THREE.NormalBlending,
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
  const sphereS = useLusionGeometry('/lusion-assets/sphere_s.buf');
  const sphereXs = useLusionGeometry('/lusion-assets/sphere_xs.buf');
  const lodGeometries = useMemo(
    () => [sphereL, sphereM, sphereS, sphereXs],
    [sphereL, sphereM, sphereS, sphereXs],
  );
  const simUvs = useMemo(() => buildSimUvs(), []);
  const defaultSim = useMemo(() => createDefaultSimTexture(), []);

  const currFbo = useFBO(SIM_W, SIM_H, { type: THREE.FloatType });
  const prevFbo = useFBO(SIM_W, SIM_H, { type: THREE.FloatType });
  const swap = useRef(false);

  const drawnSliceFbo = useFBO(512, 512, { type: THREE.FloatType });
  const sliceFbo1 = useFBO(512, 512, { type: THREE.FloatType });
  const sliceFbo2 = useFBO(512, 512, { type: THREE.FloatType });
  const sliceSwap = useRef(false);

  const volOffset = useMemo(() => {
    const o = new THREE.Vector3();
    o.copy(VOLUME_SIZE).multiplyScalar(0.5).sub(shared.u_lightPosition.value).multiplyScalar(-1);
    o.addScalar(-GRID_SIZE / 2);
    return o;
  }, [shared.u_lightPosition]);
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

  const lightFieldGeo = useMemo(() => {
    const count = SIM_W * SIM_H;
    const positions = new Float32Array(count * 3);
    for (let p = 0, g = 0; p < count; p++, g += 3) {
      positions[g + 0] = (p % SIM_W + 0.5) / SIM_W;
      positions[g + 1] = (Math.floor(p / SIM_W) + 0.5) / SIM_H;
      positions[g + 2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const lightFieldMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_simCurrPosLifeTexture: { value: null },
        u_noiseStableFactor: shared.u_noiseStableFactor,
        u_lightFieldSlicedTextureSize: { value: new THREE.Vector2(512, 512) },
        u_lightFieldSliceColRowCount: { value: new THREE.Vector2(8, 8) },
        u_lightFieldGridCount: { value: GRID_COUNT },
        u_lightFieldVolumeOffset: { value: volOffset },
        u_lightFieldVolumeSize: { value: VOLUME_SIZE }
      },
      vertexShader: buildShader(SHADERS.lightFieldVert),
      fragmentShader: buildShader(SHADERS.lightFieldFrag),
      blending: THREE.CustomBlending,
      blendEquation: THREE.MaxEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquationAlpha: THREE.MaxEquation,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
  }, [shared, volOffset]);

  const lightFieldScene = useMemo(() => {
    const scene = new THREE.Scene();
    scene.add(new THREE.Points(lightFieldGeo, lightFieldMaterial));
    return scene;
  }, [lightFieldGeo, lightFieldMaterial]);

  const sliceBlendMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_lightFieldSlicedTextureSize: { value: new THREE.Vector2(512, 512) },
        u_lightFieldSliceColRowCount: { value: new THREE.Vector2(8, 8) },
        u_lightFieldGridCount: { value: GRID_COUNT },
        u_lightFieldVolumeOffset: { value: volOffset },
        u_lightFieldVolumeSize: { value: VOLUME_SIZE },
        u_prevSliceTexture: { value: null },
        u_drawnSliceTexture: { value: null }
      },
      vertexShader: `
        varying vec2 v_uv;
        void main() { v_uv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: buildShader(SHADERS.sliceBlendFrag),
      depthTest: false,
      depthWrite: false,
    });
  }, [volOffset]);

  const columnGeo = useMemo(() => new THREE.InstancedBufferGeometry(), []);
  const emissiveGeo = useMemo(() => new THREE.InstancedBufferGeometry(), []);

  const baseColumnMat = useMemo(
    () => makeParticleMaterial(shared, currFbo.texture, 0, 'particleFrag'),
    [shared, currFbo.texture],
  );
  const baseEmissiveMat = useMemo(
    () => makeParticleMaterial(shared, currFbo.texture, 1, 'particleFrag'),
    [shared, currFbo.texture],
  );
  const bloomColumnMat = useMemo(
    () => makeParticleMaterial(shared, currFbo.texture, 0, 'particleFragBloom', true),
    [shared, currFbo.texture],
  );
  const bloomEmissiveMat = useMemo(
    () => makeParticleMaterial(shared, currFbo.texture, 1, 'particleFragBloom', true),
    [shared, currFbo.texture],
  );

  useLayoutEffect(() => {
    quadMesh.material = simMaterial;
    quadScene.add(quadMesh);
    return () => {
      quadScene.remove(quadMesh);
    };
  }, [quadMesh, quadScene, simMaterial]);

  useLayoutEffect(() => {
    const lod = pickParticleLod(0, window.innerWidth < 768);
    const columnSphere = lodGeometries[lod.column];
    const emissiveSphere = lodGeometries[lod.emissive];
    if (!columnSphere || !emissiveSphere) return;
    applyLodGeometry(columnGeo, columnSphere);
    applyLodGeometry(emissiveGeo, emissiveSphere);
    columnGeo.setAttribute('simUv', new THREE.InstancedBufferAttribute(simUvs.column, 2));
    emissiveGeo.setAttribute('simUv', new THREE.InstancedBufferAttribute(simUvs.emissive, 2));
  }, [lodGeometries, columnGeo, emissiveGeo, simUvs]);

  const initialized = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const bloomColumnRef = useRef<THREE.InstancedMesh>(null);
  const bloomEmissiveRef = useRef<THREE.InstancedMesh>(null);
  const layersSet = useRef(false);
  const lastLod = useRef({ column: -1, emissive: -1 });

  useFrame(({ gl }, delta) => {
    const dt = Math.min(delta, 0.033);

    if (!initialized.current) {
      initialized.current = true;
      simMaterial.uniforms.u_simPrevPosLifeTexture.value = defaultSim;
    }

    const scroll = scrollProgress.current;
    const intro = Math.min(scroll / 0.85, 1);
    const emissiveRatio = THREE.MathUtils.smoothstep(intro, 0, 0.2) * 0.75;
    const hideRatio = shared.u_sceneHideRatio.value;

    const lod = pickParticleLod(intro, window.innerWidth < 768);
    if (lod.column !== lastLod.current.column || lod.emissive !== lastLod.current.emissive) {
      const columnSphere = lodGeometries[lod.column];
      const emissiveSphere = lodGeometries[lod.emissive];
      if (columnSphere && emissiveSphere) {
        applyLodGeometry(columnGeo, columnSphere);
        applyLodGeometry(emissiveGeo, emissiveSphere);
        lastLod.current = lod;
      }
    }

    noiseTime.current += dt * 0.4;
    noiseScaleTime.current += dt;
    simMaterial.uniforms.u_noiseTime.value = noiseTime.current;
    simMaterial.uniforms.u_noiseScale.value =
      7.5 + 2.5 * (0.5 + 0.5 * Math.sin(noiseScaleTime.current * 0.7));
    simMaterial.uniforms.u_introDeltaTime.value = dt;
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

    const simTex = write.texture;

    // STEP 3: Splat positions into drawn slice buffer
    gl.setRenderTarget(drawnSliceFbo);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    lightFieldMaterial.uniforms.u_simCurrPosLifeTexture.value = simTex;
    gl.render(lightFieldScene, quadCam);

    // STEP 4: Temporal decay blend into current slice buffer
    const sRead = sliceSwap.current ? sliceFbo1 : sliceFbo2;
    const sWrite = sliceSwap.current ? sliceFbo2 : sliceFbo1;
    sliceSwap.current = !sliceSwap.current;

    gl.setRenderTarget(sWrite);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    sliceBlendMaterial.uniforms.u_prevSliceTexture.value = sRead.texture;
    sliceBlendMaterial.uniforms.u_drawnSliceTexture.value = drawnSliceFbo.texture;
    quadMesh.material = sliceBlendMaterial;
    gl.render(quadScene, quadCam);
    quadMesh.material = simMaterial; // restore for sim next frame

    gl.setRenderTarget(prevTarget);

    const finalLightField = sWrite.texture;
    for (const mat of [baseColumnMat, baseEmissiveMat, bloomColumnMat, bloomEmissiveMat]) {
      mat.uniforms.u_lightFieldSlicedTexture.value = finalLightField;
      mat.uniforms.u_simCurrPosLifeTexture.value = simTex;
      mat.uniforms.u_emissiveRatio.value = emissiveRatio;
      mat.uniforms.u_sceneHideRatio.value = hideRatio;
      mat.uniforms.u_noiseStableFactor.value = shared.u_noiseStableFactor.value;
      mat.uniforms.u_lightScatterPowInv.value = shared.u_lightScatterPowInv.value;
      mat.uniforms.u_lightScatterRatio.value = shared.u_lightScatterRatio.value;
    }

    if (groupRef.current) {
      groupRef.current.visible = shared.u_hudRatio.value < 1;
    }

    if (!layersSet.current && bloomColumnRef.current && bloomEmissiveRef.current) {
      for (const mesh of [bloomColumnRef.current, bloomEmissiveRef.current]) {
        mesh.layers.disable(0);
        mesh.layers.enable(BLOOM_LAYER);
      }
      layersSet.current = true;
    }
  }, -1);

  if (!lodGeometries.some(Boolean)) return null;

  const columnCount = (SIM_W - 1) * SIM_H;
  const emissiveCount = SIM_H;

  return (
    <group ref={groupRef}>
      {/* Base pass — always visible like Lusion */}
      <instancedMesh
        args={[columnGeo, baseColumnMat, columnCount]}
        frustumCulled={false}
        renderOrder={5}
      />
      <instancedMesh
        args={[emissiveGeo, baseEmissiveMat, emissiveCount]}
        frustumCulled={false}
        renderOrder={5}
      />
      {/* Bloom mask — additive glow, no depth fight */}
      <instancedMesh
        ref={bloomColumnRef}
        args={[columnGeo, bloomColumnMat, columnCount]}
        frustumCulled={false}
        renderOrder={7}
      />
      <instancedMesh
        ref={bloomEmissiveRef}
        args={[emissiveGeo, bloomEmissiveMat, emissiveCount]}
        frustumCulled={false}
        renderOrder={7}
      />
    </group>
  );
}
