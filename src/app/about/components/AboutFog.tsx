'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useFBO, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { buildShader } from '../shaders/buildShader';
import type { useAboutUniforms } from '../hooks/useAboutUniforms';

const FOG_COUNT = 32;

// Buffer AboutHeroFog — vert$5 + frag$8 from buffer_source.js
const FOG_VERT = `#define GLSLIFY 1
varying vec3 v_worldPosition;varying vec2 v_uv;varying float v_depth;varying float v_instanceId;varying float v_opacity;attribute float a_instanceId;attribute vec3 a_instancePos;attribute vec3 a_instanceRands;uniform float u_introTime;uniform float u_sceneRatio;uniform float u_hudRatio;vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}float mod289(float x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}float permute(float x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}float taylorInvSqrt(float r){return 1.79284291400159-0.85373472095314*r;}vec4 grad4(float j,vec4 ip){const vec4 ones=vec4(1.0,1.0,1.0,-1.0);vec4 p,s;p.xyz=floor(fract(vec3(j)*ip.xyz)*7.0)*ip.z-1.0;p.w=1.5-dot(abs(p.xyz),ones.xyz);s=vec4(lessThan(p,vec4(0.0)));p.xyz=p.xyz+(s.xyz*2.0-1.0)*s.www;return p;}
#define F4 0.309016994374947451
vec4 simplexNoiseDerivatives(vec4 v_0){const vec4 C=vec4(0.138196601125011,0.276393202250021,0.414589803375032,-0.447213595499958);vec4 i=floor(v_0+dot(v_0,vec4(F4)));vec4 x0=v_0-i+dot(i,C.xxxx);vec4 i0;vec3 isX=step(x0.yzw,x0.xxx);vec3 isYZ=step(x0.zww,x0.yyz);i0.x=isX.x+isX.y+isX.z;i0.yzw=1.0-isX;i0.y+=isYZ.x+isYZ.y;i0.zw+=1.0-isYZ.xy;i0.z+=isYZ.z;i0.w+=1.0-isYZ.z;vec4 i3=clamp(i0,0.0,1.0);vec4 i2=clamp(i0-1.0,0.0,1.0);vec4 i1=clamp(i0-2.0,0.0,1.0);vec4 x1=x0-i1+C.xxxx;vec4 x2=x0-i2+C.yyyy;vec4 x3=x0-i3+C.zzzz;vec4 x4=x0+C.wwww;i=mod289(i);float j0=permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);vec4 j1=permute(permute(permute(permute(i.w+vec4(i1.w,i2.w,i3.w,1.0))+i.z+vec4(i1.z,i2.z,i3.z,1.0))+i.y+vec4(i1.y,i2.y,i3.y,1.0))+i.x+vec4(i1.x,i2.x,i3.x,1.0));vec4 ip=vec4(1.0/294.0,1.0/49.0,1.0/7.0,0.0);vec4 p0=grad4(j0,ip);vec4 p1=grad4(j1.x,ip);vec4 p2=grad4(j1.y,ip);vec4 p3=grad4(j1.z,ip);vec4 p4=grad4(j1.w,ip);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;p4*=taylorInvSqrt(dot(p4,p4));vec3 values0=vec3(dot(p0,x0),dot(p1,x1),dot(p2,x2));vec2 values1=vec2(dot(p3,x3),dot(p4,x4));vec3 m0=max(0.5-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2)),0.0);vec2 m1=max(0.5-vec2(dot(x3,x3),dot(x4,x4)),0.0);vec3 temp0=-6.0*m0*m0*values0;vec2 temp1=-6.0*m1*m1*values1;vec3 mmm0=m0*m0*m0;vec2 mmm1=m1*m1*m1;float dx=temp0[0]*x0.x+temp0[1]*x1.x+temp0[2]*x2.x+temp1[0]*x3.x+temp1[1]*x4.x+mmm0[0]*p0.x+mmm0[1]*p1.x+mmm0[2]*p2.x+mmm1[0]*p3.x+mmm1[1]*p4.x;float dy=temp0[0]*x0.y+temp0[1]*x1.y+temp0[2]*x2.y+temp1[0]*x3.y+temp1[1]*x4.y+mmm0[0]*p0.y+mmm0[1]*p1.y+mmm0[2]*p2.y+mmm1[0]*p3.y+mmm1[1]*p4.y;float dz=temp0[0]*x0.z+temp0[1]*x1.z+temp0[2]*x2.z+temp1[0]*x3.z+temp1[1]*x4.z+mmm0[0]*p0.z+mmm0[1]*p1.z+mmm0[2]*p2.z+mmm1[0]*p3.z+mmm1[1]*p4.z;float dw=temp0[0]*x0.w+temp0[1]*x1.w+temp0[2]*x2.w+temp1[0]*x3.w+temp1[1]*x4.w+mmm0[0]*p0.w+mmm0[1]*p1.w+mmm0[2]*p2.w+mmm1[0]*p3.w+mmm1[1]*p4.w;return vec4(dx,dy,dz,dw)*49.0;}vec2 rotate(vec2 v,float a){float s=sin(a);float c=cos(a);mat2 m=mat2(c,s,-s,c);return m*v;}float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}void main(){vec3 localPos=position;localPos.xy=rotate(localPos.xy,a_instanceRands.y*6.28+sign(-a_instancePos.x)*u_introTime*mix(0.03,0.15,a_instanceRands.z));vec3 pos=(9.0+2.0*a_instanceRands.x)*localPos;vec3 noise=simplexNoiseDerivatives(vec4((a_instancePos+pos)*0.5,u_introTime*0.075)).yzw;float cycle=fract((0.08+0.08*a_instanceRands.x)*u_introTime+a_instanceRands.z);vec3 instancePos=a_instancePos+vec3(cycle*(a_instancePos.x*0.75+sign(a_instancePos.x)*0.25),0.0,0.0)+noise*vec3(0.35,0.2,0.1);instancePos.y-=linearStep(4.,1.,abs(instancePos.x))*1.+0.5;pos+=instancePos;vec4 mvPosition=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mvPosition;v_worldPosition=(modelMatrix*vec4(pos,1.)).xyz;v_uv=uv;v_instanceId=a_instanceId;float d=(modelViewMatrix*vec4(instancePos,1.0)).z;v_opacity=smoothstep(1.,3.,-d)*u_sceneRatio*(1.-u_hudRatio)*linearStep(0.,0.25,cycle)*linearStep(1.,0.75,cycle)*mix(1.,0.75,a_instanceRands.x);if(v_opacity<0.004){gl_Position.z=2.*gl_Position.w;}
#include <aboutHeroVisualFinal_vert>
}`;

const FOG_FRAG = `#define GLSLIFY 1
varying vec3 v_worldPosition;varying vec2 v_uv;varying float v_depth;varying float v_instanceId;varying float v_opacity;uniform sampler2D u_currSceneTexture;uniform sampler2D u_fogTexture;uniform vec2 u_resolution;uniform vec3 u_lightPosition;uniform float u_noiseStableFactor;uniform float u_time;
#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define saturate( a ) clamp( a, 0.0, 1.0 )
#include <getBlueNoise>
#include <getScatter>
float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}void main(){float faceDirection=gl_FrontFacing ? 1.0 :-1.0;vec2 screenPaintUv=gl_FragCoord.xy/u_resolution;vec2 fogMap=texture2D(u_fogTexture,v_uv).rg;vec4 currScene=texture2D(u_currSceneTexture,screenPaintUv);float depth=v_depth-fogMap.y*0.02;float depthMask=fogMap.x*1.35-fogMap.y*0.15;gl_FragColor.r=depthMask*v_opacity;gl_FragColor.gb=currScene.gb;gl_FragColor.a=exp(-length(v_worldPosition+vec3(0.,0.,-max(0.,fogMap.y-0.25)*10.+5.)-vec3(0.,0.,0.))*(0.22-fogMap.x*0.2))*fogMap.y*linearStep(0.0,0.035,depth-currScene.g)*v_opacity*0.45;}`;

const COPY_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const COPY_FRAG = `
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(tDiffuse, vUv);
}
`;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function AboutFog({
  shared,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
}) {
  const { size } = useThree();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const cacheRT = useFBO(1, 1);
  const copyScene = useMemo(() => new THREE.Scene(), []);
  const copyCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const copyMesh = useMemo(() => new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), []);

  const fogTexture = useTexture('/shaders/fog.png');
  fogTexture.wrapS = fogTexture.wrapT = THREE.RepeatWrapping;
  fogTexture.colorSpace = THREE.LinearSRGBColorSpace;

  const copyMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { value: null as THREE.Texture | null } },
        vertexShader: COPY_VERT,
        fragmentShader: COPY_FRAG,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  const { geometry } = useMemo(() => {
    const base = new THREE.PlaneGeometry(1, 1, 3, 3);
    const geo = new THREE.InstancedBufferGeometry();
    if (base.index) geo.setIndex(base.index);
    for (const name in base.attributes) {
      geo.setAttribute(name, base.attributes[name]);
    }

    const ids = new Float32Array(FOG_COUNT);
    const pos = new Float32Array(FOG_COUNT * 3);
    const rands = new Float32Array(FOG_COUNT * 3);

    for (let i = 0, c = 0; i < FOG_COUNT; i++, c += 3) {
      ids[i] = i;
      pos[c] = 12 * (seededRandom(i * 3) * 2 - 1);
      pos[c + 1] = -0.25 + 0.5 * seededRandom(i * 3 + 1);
      pos[c + 2] = 12 * (1 - (i / (FOG_COUNT - 1)) * 2);
      rands[c] = seededRandom(i * 7) * 2 - 1;
      rands[c + 1] = seededRandom(i * 11) * 2 - 1;
      rands[c + 2] = seededRandom(i * 13) * 2 - 1;
    }

    geo.setAttribute('a_instanceId', new THREE.InstancedBufferAttribute(ids, 1));
    geo.setAttribute('a_instancePos', new THREE.InstancedBufferAttribute(pos, 3));
    geo.setAttribute('a_instanceRands', new THREE.InstancedBufferAttribute(rands, 3));

    return { geometry: geo };
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_fogTexture: { value: fogTexture },
          u_currSceneTexture: { value: cacheRT.texture },
          u_lightPosition: shared.u_lightPosition,
          u_resolution: { value: new THREE.Vector2(1, 1) },
          u_introTime: shared.u_introTime,
          u_sceneRatio: shared.u_sceneRatio,
          u_hudRatio: shared.u_hudRatio,
          u_noiseStableFactor: shared.u_noiseStableFactor,
          u_time: { value: 0 },
          u_blueNoiseTexture: shared.u_blueNoiseTexture,
          u_blueNoiseTexelSize: shared.u_blueNoiseTexelSize,
          u_blueNoiseCoordOffset: shared.u_blueNoiseCoordOffset,
          u_lightScatterDivider: shared.u_lightScatterDivider,
          u_lightScatterPowInv: shared.u_lightScatterPowInv,
          u_lightScatterPos0: shared.u_lightScatterPos0,
          u_lightScatterPos1: shared.u_lightScatterPos1,
          u_lightScatterRatio: shared.u_lightScatterRatio,
        },
        vertexShader: buildShader(FOG_VERT),
        fragmentShader: buildShader(FOG_FRAG),
        side: THREE.DoubleSide,
        depthWrite: false,
        transparent: true,
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendEquationAlpha: THREE.AddEquation,
        blendSrcAlpha: THREE.ZeroFactor,
        blendDstAlpha: THREE.OneFactor,
      }),
    [fogTexture, shared, cacheRT.texture],
  );

  useEffect(() => {
    copyMesh.material = copyMaterial;
    copyScene.add(copyMesh);
    return () => {
      copyScene.remove(copyMesh);
    };
  }, [copyMaterial, copyMesh, copyScene]);

  const onBeforeRender = useCallback(
    (renderer: THREE.WebGLRenderer) => {
      const rt = renderer.getRenderTarget();
      if (!rt?.texture) return;

      if (cacheRT.width !== rt.width || cacheRT.height !== rt.height) {
        cacheRT.setSize(rt.width, rt.height);
      }

      copyMaterial.uniforms.tDiffuse.value = rt.texture;
      const prev = renderer.getRenderTarget();
      renderer.setRenderTarget(cacheRT);
      renderer.render(copyScene, copyCam);
      renderer.setRenderTarget(prev);
      material.uniforms.u_currSceneTexture.value = cacheRT.texture;
    },
    [cacheRT, copyCam, copyMaterial, copyScene, material],
  );

  useFrame((state) => {
    material.uniforms.u_introTime.value = shared.u_introTime.value;
    material.uniforms.u_sceneRatio.value = shared.u_sceneRatio.value;
    material.uniforms.u_hudRatio.value = shared.u_hudRatio.value;
    material.uniforms.u_noiseStableFactor.value = shared.u_noiseStableFactor.value;
    material.uniforms.u_resolution.value.set(state.size.width, state.size.height);
    material.uniforms.u_time.value = state.clock.elapsedTime;

    if (cacheRT.width !== size.width || cacheRT.height !== size.height) {
      cacheRT.setSize(size.width, size.height);
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, FOG_COUNT]}
      frustumCulled={false}
      renderOrder={20}
      onBeforeRender={(renderer) => onBeforeRender(renderer)}
    />
  );
}
