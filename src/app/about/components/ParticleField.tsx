'use client';

import { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBO } from '@react-three/drei';
import * as THREE from 'three';

import { useLusionGeometry } from '../useLusionGeometry';
import { buildShader } from '../shaders/buildShader';
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

const PARTICLE_VERT = `
attribute vec3 simUv;
uniform sampler2D u_simCurrPosLifeTexture;
uniform float u_isEmissive;
uniform float u_sceneHideRatio;
varying vec3 v_worldPosition;
varying float v_brightness;
void main() {
  vec4 info = texture2D(u_simCurrPosLifeTexture, simUv.xy);
  float life = smoothstep(0.0, 0.1, info.w) * smoothstep(1.0, 0.9, info.w);
  float size = mix(0.04, 0.12, u_isEmissive) * life * (1.0 - u_sceneHideRatio);
  vec3 pos = position * size + info.xyz;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  v_worldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
  v_brightness = life;
}
`;

const PARTICLE_FRAG = `
uniform float u_isEmissive;
uniform float u_emissiveRatio;
varying vec3 v_worldPosition;
varying float v_brightness;
void main() {
  float core = v_brightness * (0.12 + u_isEmissive * 0.88);
  float glow = v_brightness * u_isEmissive * 0.35;
  float outColor = (core + glow) * (1.4 + u_emissiveRatio * 1.2);
  gl_FragColor = vec4(vec3(outColor), 1.0);
}
`;

export function ParticleField({
  shared,
  scrollProgress,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'] & {
    u_sceneHideRatio?: { value: number };
  };
  scrollProgress: { current: number };
}) {
  const sphereGeo = useLusionGeometry('/lusion-assets/sphere_l.buf');
  const simUvs = useMemo(() => buildSimUvs(), []);
  const defaultSim = useMemo(() => createDefaultSimTexture(), []);

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

  const columnGeo = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();
    return geo;
  }, []);

  const emissiveGeo = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();
    return geo;
  }, []);

  const columnMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_simCurrPosLifeTexture: { value: currFbo.texture },
          u_isEmissive: { value: 0 },
          u_emissiveRatio: { value: 0 },
          u_sceneHideRatio: { value: 0 },
        },
        vertexShader: buildShader(PARTICLE_VERT),
        fragmentShader: PARTICLE_FRAG,
        transparent: false,
        depthWrite: true,
        depthTest: true,
      }),
    [currFbo.texture],
  );

  const emissiveMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_simCurrPosLifeTexture: { value: currFbo.texture },
          u_isEmissive: { value: 1 },
          u_emissiveRatio: { value: 0 },
          u_sceneHideRatio: { value: 0 },
        },
        vertexShader: buildShader(PARTICLE_VERT),
        fragmentShader: PARTICLE_FRAG,
        transparent: false,
        depthWrite: true,
        depthTest: true,
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
    if (!sphereGeo) return;
    for (const geo of [columnGeo, emissiveGeo]) {
      if (sphereGeo.index) geo.setIndex(sphereGeo.index);
      for (const name in sphereGeo.attributes) {
        geo.setAttribute(name, sphereGeo.attributes[name]);
      }
    }
    columnGeo.setAttribute('simUv', new THREE.InstancedBufferAttribute(simUvs.column, 2));
    emissiveGeo.setAttribute('simUv', new THREE.InstancedBufferAttribute(simUvs.emissive, 2));
  }, [sphereGeo, columnGeo, emissiveGeo, simUvs]);

  const initialized = useRef(false);

  useFrame(({ gl, clock }, delta) => {
    if (!initialized.current) {
      initialized.current = true;
      simMaterial.uniforms.u_simPrevPosLifeTexture.value = defaultSim;
    }

    const scroll = scrollProgress.current;
    const intro = Math.min(scroll / 0.85, 1);
    const emissiveRatio = THREE.MathUtils.smoothstep(intro, 0, 0.25) * 0.85;
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

    columnMat.uniforms.u_simCurrPosLifeTexture.value = write.texture;
    emissiveMat.uniforms.u_simCurrPosLifeTexture.value = write.texture;
    columnMat.uniforms.u_emissiveRatio.value = emissiveRatio;
    emissiveMat.uniforms.u_emissiveRatio.value = emissiveRatio;
    columnMat.uniforms.u_sceneHideRatio.value = hideRatio;
    emissiveMat.uniforms.u_sceneHideRatio.value = hideRatio;
  });

  const columnRef = useRef<THREE.InstancedMesh>(null);
  const emissiveRef = useRef<THREE.InstancedMesh>(null);
  const layersSet = useRef(false);

  useFrame(() => {
    if (layersSet.current || !columnRef.current || !emissiveRef.current) return;
    for (const mesh of [columnRef.current, emissiveRef.current]) {
      mesh.layers.disable(0);
      mesh.layers.enable(BLOOM_LAYER);
    }
    layersSet.current = true;
  });

  if (!sphereGeo) return null;

  const columnCount = (SIM_W - 1) * SIM_H;
  const emissiveCount = SIM_H;

  return (
    <group position={LIGHT}>
      <instancedMesh
        ref={columnRef}
        args={[columnGeo, columnMat, columnCount]}
        frustumCulled={false}
        renderOrder={5}
      />
      <instancedMesh
        ref={emissiveRef}
        args={[emissiveGeo, emissiveMat, emissiveCount]}
        frustumCulled={false}
        renderOrder={5}
      />
    </group>
  );
}
