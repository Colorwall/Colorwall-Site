'use client';

import { useRef, useMemo, useEffect, useLayoutEffect, type MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture, useFBO } from '@react-three/drei';
import { SelectiveBloomPipeline } from './components/SelectiveBloomPipeline';

import {
  useLusionGeometry,
  useLusionAnimation,
  createRockDataTextures,
  createPersonTexture,
  createRocksChannelTexture,
} from './useLusionGeometry';
import {
  useCameraSpline,
  sampleSpline,
  getScrollPhases,
  getCameraFollowStrength,
} from './hooks/useCameraSpline';
import { useAboutUniforms } from './hooks/useAboutUniforms';
import { buildShader, SHADERS } from './shaders/buildShader';
import { ParticleField } from './components/ParticleField';
import { AboutHalo } from './components/AboutHalo';
import { AboutFog } from './components/AboutFog';

const ROCK_COUNT = 64;
const BONE_COUNT = 54;
const PARTICLE_FOCUS = new THREE.Vector3(0, 8.2, 0);

function CameraRig({
  scrollProgress,
  spline,
}: {
  scrollProgress: { current: number };
  spline: NonNullable<ReturnType<typeof useCameraSpline>>;
}) {
  const smoothPos = useMemo(() => new THREE.Vector3(0, 7.3, -5), []);
  const smoothLook = useMemo(() => new THREE.Vector3(0, 7.3, 4), []);
  const initialized = useRef(false);

  useFrame((state, delta) => {
    const phases = getScrollPhases(scrollProgress.current);
    const { position, lookAt } = sampleSpline(spline, phases.splineT);

    if (!initialized.current) {
      smoothPos.copy(position);
      smoothLook.copy(lookAt).lerp(PARTICLE_FOCUS, 0.92);
      initialized.current = true;
    }

    const follow = getCameraFollowStrength(phases.initialSplineRatio);
    const dt = Math.min(delta, 0.05);
    const ease = 1 - Math.exp(-follow * 60 * dt);
    smoothPos.lerp(position, ease);
    smoothLook.lerp(lookAt, ease);

    // Default drone view: camera locked on the particle burst above the light
    const focusT = THREE.MathUtils.lerp(0.92, 0.5, phases.initialSplineRatio);
    smoothLook.lerp(PARTICLE_FOCUS, focusT);

    state.camera.position.copy(smoothPos);
    state.camera.lookAt(smoothLook);

    if (state.camera instanceof THREE.PerspectiveCamera) {
      const dolly = THREE.MathUtils.smoothstep(phases.initialSplineRatio, 0.4, 0.8);
      state.camera.fov = 60 + THREE.MathUtils.lerp(0, -10, dolly);
      state.camera.updateProjectionMatrix();
    }
  });
  return null;
}

function GroundShadowPass({
  shared,
  groundShadowRef,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  groundShadowRef: MutableRefObject<THREE.Texture | null>;
}) {
  const fbo = useFBO(768, 768, { type: THREE.HalfFloatType });
  const prevFbo = useFBO(768, 768, { type: THREE.HalfFloatType });
  const swap = useRef(false);
  const quadScene = useMemo(() => new THREE.Scene(), []);
  const quadCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const quadMesh = useMemo(
    () => new THREE.Mesh(new THREE.PlaneGeometry(2, 2)),
    [],
  );

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_prevTexture: { value: prevFbo.texture },
        u_lightShadowTexture: shared.u_lightShadowTexture,
        u_lightPosition: shared.u_lightPosition,
        u_blueNoiseOffset: { value: new THREE.Vector2() },
        u_lightShadowMaxDistance: shared.u_lightShadowMaxDistance,
        u_radius: { value: 12 },
        u_texelSize: { value: 1 / 768 },
        u_blueNoiseTexture: shared.u_blueNoiseTexture,
        u_blueNoiseTexelSize: shared.u_blueNoiseTexelSize,
        u_blueNoiseCoordOffset: shared.u_blueNoiseCoordOffset,
        u_lightShadowTextureTexelSize: shared.u_lightShadowTextureTexelSize,
      },
      vertexShader: `
        varying vec2 v_uv;
        void main() {
          v_uv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: buildShader(SHADERS.groundShadowFrag, { LIGHT_SHADOW_SAMPLE_COUNT: 8 }),
      depthTest: false,
      depthWrite: false,
    });
  }, [shared, prevFbo.texture]);

  useEffect(() => {
    quadMesh.material = material;
    quadScene.add(quadMesh);
    return () => {
      quadScene.remove(quadMesh);
    };
  }, [material, quadMesh, quadScene]);

  useFrame(({ gl }) => {
    const read = swap.current ? fbo : prevFbo;
    const write = swap.current ? prevFbo : fbo;
    swap.current = !swap.current;

    material.uniforms.u_prevTexture.value = read.texture;
    material.uniforms.u_blueNoiseOffset.value.set(
      Math.floor(Math.random() * 128),
      Math.floor(Math.random() * 128),
    );

    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(write);
    gl.setClearColor(0xffffff, 1);
    gl.clear();
    gl.render(quadScene, quadCam);
    gl.setRenderTarget(prevTarget);

    groundShadowRef.current = write.texture;
  });

  return null;
}

function Terrain({
  shared,
  geometry,
  texture,
  groundShadowRef,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture;
  groundShadowRef: MutableRefObject<THREE.Texture | null>;
}) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_texture: { value: texture },
        u_groundShadowTexture: { value: null },
        u_color: { value: new THREE.Color('#ffffff') },
        u_bgColor: shared.u_bgColor,
        u_lightPosition: shared.u_lightPosition,
        u_fogA: { value: 0.03 },
        u_fogB: { value: 0.285 },
        u_sceneRatio: shared.u_sceneRatio,
        u_hudRatio: shared.u_hudRatio,
        u_noiseStableFactor: shared.u_noiseStableFactor,
        u_lightScatterDivider: shared.u_lightScatterDivider,
        u_lightScatterPowInv: shared.u_lightScatterPowInv,
        u_lightScatterPos0: shared.u_lightScatterPos0,
        u_lightScatterPos1: shared.u_lightScatterPos1,
        u_lightScatterRatio: shared.u_lightScatterRatio,
        u_blueNoiseTexture: shared.u_blueNoiseTexture,
        u_blueNoiseTexelSize: shared.u_blueNoiseTexelSize,
        u_blueNoiseCoordOffset: shared.u_blueNoiseCoordOffset,
      },
      vertexShader: buildShader(SHADERS.groundVert),
      fragmentShader: buildShader(SHADERS.groundFrag),
    });
  }, [texture, shared]);

  useFrame(() => {
    if (groundShadowRef.current) {
      material.uniforms.u_groundShadowTexture.value = groundShadowRef.current;
    }
    material.uniforms.u_sceneRatio.value = shared.u_sceneRatio.value;
    material.uniforms.u_hudRatio.value = shared.u_hudRatio.value;
    material.uniforms.u_noiseStableFactor.value = shared.u_noiseStableFactor.value;
    material.uniforms.u_lightScatterPowInv.value = shared.u_lightScatterPowInv.value;
    material.uniforms.u_lightScatterRatio.value = shared.u_lightScatterRatio.value;
  });

  return <mesh geometry={geometry} material={material} />;
}

function RockGroup({
  typeIndex,
  geometry,
  rocksTexture,
  animPos,
  animOrient,
  shared,
  scrollProgress,
}: {
  typeIndex: number;
  geometry: THREE.BufferGeometry;
  rocksTexture: THREE.Texture;
  animPos: THREE.DataTexture;
  animOrient: THREE.DataTexture;
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  scrollProgress: { current: number };
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const time = useRef(0);

  const instanceIds = useMemo(() => {
    const arr = new Float32Array(ROCK_COUNT);
    for (let i = 0; i < ROCK_COUNT; i++) arr[i] = typeIndex + i * 4;
    return arr;
  }, [typeIndex]);

  const instanceRands = useMemo(() => {
    const arr = new Float32Array(ROCK_COUNT * 4);
    for (let i = 0; i < ROCK_COUNT; i++) {
      arr[i * 4] = Math.random();
      arr[i * 4 + 1] = Math.random();
      arr[i * 4 + 2] = Math.random();
      arr[i * 4 + 3] = Math.random();
    }
    return arr;
  }, [typeIndex]);

  const channelMixer = useMemo(() => {
    const v = new THREE.Vector4(0, 0, 0, 0);
    v.setComponent(typeIndex, 1);
    return v;
  }, [typeIndex]);

  const instancedGeometry = useMemo(() => {
    const geo = new THREE.InstancedBufferGeometry();
    if (geometry.index) geo.setIndex(geometry.index);
    for (const name in geometry.attributes) {
      geo.setAttribute(name, geometry.attributes[name]);
    }
    geo.setAttribute('instanceId', new THREE.InstancedBufferAttribute(instanceIds, 1));
    geo.setAttribute('instanceRands', new THREE.InstancedBufferAttribute(instanceRands, 4));
    return geo;
  }, [geometry, instanceIds, instanceRands]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_texture: { value: rocksTexture },
        u_textureChannelMixer: { value: channelMixer },
        u_lightColor: { value: new THREE.Color('#000000') },
        u_lightPosition: shared.u_lightPosition,
        u_noiseStableFactor: shared.u_noiseStableFactor,
        u_posRandTexture: { value: animPos },
        u_orientTexture: { value: animOrient },
        u_animationTextureSize: { value: new THREE.Vector2(16, 120) },
        u_time: { value: 0 },
        u_globalTime: { value: 0 },
        u_scale: { value: 1 },
        u_hudRatio: shared.u_hudRatio,
        u_lightScatterDivider: shared.u_lightScatterDivider,
        u_lightScatterPowInv: shared.u_lightScatterPowInv,
        u_lightScatterPos0: shared.u_lightScatterPos0,
        u_lightScatterPos1: shared.u_lightScatterPos1,
        u_lightScatterRatio: shared.u_lightScatterRatio,
      },
      vertexShader: buildShader(SHADERS.rockVert),
      fragmentShader: buildShader(SHADERS.rockFrag),
    });
  }, [rocksTexture, channelMixer, animPos, animOrient, shared]);

  useFrame((state, delta) => {
    time.current += delta;
    const intro = Math.min(scrollProgress.current / 0.85, 1);
    material.uniforms.u_time.value = time.current;
    material.uniforms.u_globalTime.value = state.clock.elapsedTime;
    material.uniforms.u_scale.value = THREE.MathUtils.smoothstep(intro, 0, 0.2);
    material.uniforms.u_hudRatio.value = shared.u_hudRatio.value;
    material.uniforms.u_noiseStableFactor.value = shared.u_noiseStableFactor.value;
    material.uniforms.u_lightScatterPowInv.value = shared.u_lightScatterPowInv.value;
    material.uniforms.u_lightScatterRatio.value = shared.u_lightScatterRatio.value;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[instancedGeometry, material, ROCK_COUNT]}
      frustumCulled={false}
    />
  );
}

function Person({
  geometry,
  personTexture,
  animData,
  shared,
}: {
  geometry: THREE.BufferGeometry;
  personTexture: THREE.Texture;
  animData: NonNullable<ReturnType<typeof useLusionAnimation>>;
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
}) {
  const time = useRef(0);
  const bonePoses = useMemo(
    () => Array.from({ length: BONE_COUNT }, () => new THREE.Vector3()),
    [],
  );
  const boneOrients = useMemo(
    () => Array.from({ length: BONE_COUNT }, () => new THREE.Quaternion()),
    [],
  );
  const lightMixer = useMemo(() => new THREE.Vector3(1, 0, 0), []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_texture: { value: personTexture },
        u_lightPosition: shared.u_lightPosition,
        u_lightMixer: { value: lightMixer },
        u_sceneRatio: shared.u_sceneRatio,
        u_hudRatio: shared.u_hudRatio,
        u_bonePoses: { value: bonePoses },
        u_boneOrients: { value: boneOrients },
        u_lightScatterDivider: shared.u_lightScatterDivider,
        u_lightScatterPowInv: shared.u_lightScatterPowInv,
        u_lightScatterPos0: shared.u_lightScatterPos0,
        u_lightScatterPos1: shared.u_lightScatterPos1,
        u_lightScatterRatio: shared.u_lightScatterRatio,
      },
      vertexShader: buildShader(SHADERS.personVert, { BONE_COUNT }),
      fragmentShader: buildShader(SHADERS.personFrag),
      depthWrite: true,
      depthTest: true,
    });
  }, [personTexture, shared, bonePoses, boneOrients, lightMixer]);

  const _v1 = useMemo(() => new THREE.Vector3(), []);
  const _v2 = useMemo(() => new THREE.Vector3(), []);
  const _q1 = useMemo(() => new THREE.Quaternion(), []);
  const _q2 = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    time.current += delta * 0.5;
    const fps = 60;
    const frameCount = animData.frameCount;
    const t = (time.current * fps) % frameCount;
    const floor = Math.floor(t);
    const ceil = Math.ceil(t) % frameCount;
    const fract = t - floor;
    const u = frameCount / 3;

    lightMixer.set(
      fit(t, u * 2, frameCount, 0, 1) + fit(t, 0, u, 1, 0),
      fit(t, 0, u, 0, 1) * fit(t, u, u * 2, 1, 0),
      fit(t, u, u * 2, 0, 1) * fit(t, u * 2, frameCount, 1, 0),
    );

    const l = floor * BONE_COUNT;
    const c = ceil * BONE_COUNT;

    for (let f = 0; f < BONE_COUNT; f++) {
      bonePoses[f].copy(_v1.fromArray(animData.positions, (l + f) * 3))
        .lerp(_v2.fromArray(animData.positions, (c + f) * 3), fract);
      boneOrients[f].copy(_q1.fromArray(animData.orients, (l + f) * 4))
        .slerp(_q2.fromArray(animData.orients, (c + f) * 4), fract);
    }
    material.uniforms.u_sceneRatio.value = shared.u_sceneRatio.value;
    material.uniforms.u_hudRatio.value = shared.u_hudRatio.value;
    material.uniforms.u_lightScatterPowInv.value = shared.u_lightScatterPowInv.value;
    material.uniforms.u_lightScatterRatio.value = shared.u_lightScatterRatio.value;
  });

  return (
    <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={50} />
  );
}

function PersonShadow({
  shadowTexture,
  shared,
  animData,
}: {
  shadowTexture: THREE.Texture;
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
  animData: NonNullable<ReturnType<typeof useLusionAnimation>>;
}) {
  const lightMixer = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const time = useRef(0);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_texture: { value: shadowTexture },
        u_lightMixer: { value: lightMixer },
        u_blueNoiseTexture: shared.u_blueNoiseTexture,
        u_blueNoiseTexelSize: shared.u_blueNoiseTexelSize,
        u_blueNoiseCoordOffset: shared.u_blueNoiseCoordOffset,
      },
      vertexShader: buildShader(SHADERS.shadowVert),
      fragmentShader: buildShader(SHADERS.shadowFrag),
      transparent: true,
      depthWrite: false,
      premultipliedAlpha: true,
      blending: THREE.MultiplyBlending,
    });
  }, [shadowTexture, shared, lightMixer]);

  useFrame((_, delta) => {
    time.current += delta * 0.5;
    const frameCount = animData.frameCount;
    const t = (time.current * 60) % frameCount;
    const u = frameCount / 3;
    lightMixer.set(
      fit(t, u * 2, frameCount, 0, 1) + fit(t, 0, u, 1, 0),
      fit(t, 0, u, 0, 1) * fit(t, u, u * 2, 1, 0),
      fit(t, u, u * 2, 0, 1) * fit(t, u * 2, frameCount, 1, 0),
    );
  });

  return (
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={10}>
      <planeGeometry args={[1.5, 1.5]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function fit(t: number, a: number, b: number, c: number, d: number) {
  return THREE.MathUtils.lerp(c, d, THREE.MathUtils.clamp((t - a) / (b - a), 0, 1));
}

export function WebGLAboutScene({
  scrollProgress,
}: {
  theme: 'dark' | 'light';
  scrollProgress: { current: number };
}) {
  const spline = useCameraSpline();
  const { uniforms, sync } = useAboutUniforms(scrollProgress);
  const groundShadowRef = useRef<THREE.Texture | null>(null);

  const defaultShadowMap = useMemo(() => {
    const data = new Float32Array([1]);
    const tex = new THREE.DataTexture(data, 1, 1, THREE.RedFormat, THREE.FloatType);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const terrainGeometry = useLusionGeometry('/lusion-assets/terrain.buf');
  const personGeometry = useLusionGeometry('/lusion-assets/person.buf');
  const rock0 = useLusionGeometry('/lusion-assets/rock_0.buf');
  const rock1 = useLusionGeometry('/lusion-assets/rock_1.buf');
  const rock2 = useLusionGeometry('/lusion-assets/rock_2.buf');
  const rock3 = useLusionGeometry('/lusion-assets/rock_3.buf');

  const personAnim = useLusionAnimation('/lusion-assets/person_idle.buf');
  const rockAnim0 = useLusionAnimation('/lusion-assets/rock_animation_0.buf');
  const rockAnim1 = useLusionAnimation('/lusion-assets/rock_animation_1.buf');
  const rockAnim2 = useLusionAnimation('/lusion-assets/rock_animation_2.buf');
  const rockAnim3 = useLusionAnimation('/lusion-assets/rock_animation_3.buf');

  const terrainTexture = useTexture('/lusion-assets/terrain_shadow_light_height.webp');
  const personLightTexture = useTexture('/lusion-assets/person_light.webp');
  const personBaseTexture = useTexture('/lusion-assets/person.webp');
  const rocksRawTexture = useTexture('/lusion-assets/rocks.webp');
  const shadowTexture = useTexture('/lusion-assets/ground_person_shadow.webp');
  const blueNoiseTexture = useTexture('/lusion-assets/LDR_RGB1_0.png');

  terrainTexture.flipY = true;
  terrainTexture.colorSpace = THREE.LinearSRGBColorSpace;
  personLightTexture.colorSpace = THREE.LinearSRGBColorSpace;
  personBaseTexture.colorSpace = THREE.SRGBColorSpace;
  rocksRawTexture.colorSpace = THREE.LinearSRGBColorSpace;
  shadowTexture.colorSpace = THREE.LinearSRGBColorSpace;
  blueNoiseTexture.wrapS = blueNoiseTexture.wrapT = THREE.RepeatWrapping;
  blueNoiseTexture.minFilter = THREE.NearestFilter;
  blueNoiseTexture.magFilter = THREE.NearestFilter;

  const personTexture = useMemo(
    () => createPersonTexture(personLightTexture, personBaseTexture),
    [personLightTexture, personBaseTexture],
  );

  const rocksTexture = useMemo(
    () => createRocksChannelTexture(rocksRawTexture),
    [rocksRawTexture],
  );

  const rockTextures0 = useMemo(
    () => (rockAnim0 ? createRockDataTextures(rockAnim0.positions, rockAnim0.orients) : null),
    [rockAnim0],
  );
  const rockTextures1 = useMemo(
    () => (rockAnim1 ? createRockDataTextures(rockAnim1.positions, rockAnim1.orients) : null),
    [rockAnim1],
  );
  const rockTextures2 = useMemo(
    () => (rockAnim2 ? createRockDataTextures(rockAnim2.positions, rockAnim2.orients) : null),
    [rockAnim2],
  );
  const rockTextures3 = useMemo(
    () => (rockAnim3 ? createRockDataTextures(rockAnim3.positions, rockAnim3.orients) : null),
    [rockAnim3],
  );

  useEffect(() => {
    uniforms.u_blueNoiseTexture.value = blueNoiseTexture;
    uniforms.u_lightShadowTexture.value = defaultShadowMap;
  }, [blueNoiseTexture, defaultShadowMap, uniforms]);

  useFrame(() => {
    sync();
  });

  const shared = uniforms;

  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 15, 90]} />

      {spline && <CameraRig scrollProgress={scrollProgress} spline={spline} />}
      <SelectiveBloomPipeline scrollProgress={scrollProgress} />
      <GroundShadowPass shared={shared} groundShadowRef={groundShadowRef} />

      {terrainGeometry && (
        <Terrain
          shared={shared}
          geometry={terrainGeometry}
          texture={terrainTexture}
          groundShadowRef={groundShadowRef}
        />
      )}

      {rock0 && rockTextures0 && (
        <RockGroup typeIndex={0} geometry={rock0} rocksTexture={rocksTexture} animPos={rockTextures0.posTex} animOrient={rockTextures0.orientTex} shared={shared} scrollProgress={scrollProgress} />
      )}
      {rock1 && rockTextures1 && (
        <RockGroup typeIndex={1} geometry={rock1} rocksTexture={rocksTexture} animPos={rockTextures1.posTex} animOrient={rockTextures1.orientTex} shared={shared} scrollProgress={scrollProgress} />
      )}
      {rock2 && rockTextures2 && (
        <RockGroup typeIndex={2} geometry={rock2} rocksTexture={rocksTexture} animPos={rockTextures2.posTex} animOrient={rockTextures2.orientTex} shared={shared} scrollProgress={scrollProgress} />
      )}
      {rock3 && rockTextures3 && (
        <RockGroup typeIndex={3} geometry={rock3} rocksTexture={rocksTexture} animPos={rockTextures3.posTex} animOrient={rockTextures3.orientTex} shared={shared} scrollProgress={scrollProgress} />
      )}

      <ParticleField shared={shared} scrollProgress={scrollProgress} />
      <AboutHalo shared={shared} scrollProgress={scrollProgress} />

      {personGeometry && personAnim && (
        <Person
          geometry={personGeometry}
          personTexture={personTexture}
          animData={personAnim}
          shared={shared}
        />
      )}

      {personAnim && (
        <PersonShadow shadowTexture={shadowTexture} shared={shared} animData={personAnim} />
      )}

      <AboutFog shared={shared} />
    </>
  );
}
