'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildShader } from '../shaders/buildShader';
import { buildTerrainLinesGeometry } from '../buildTerrainLinesGeometry';
import type { useAboutUniforms } from '../hooks/useAboutUniforms';

// Buffer vert$7 + frag$a — tube contours along terrain_lines.buf
const TERRAIN_LINES_VERT = `#define GLSLIFY 1
attribute float t;
attribute float totalLength;
attribute float lineId;
varying float v_t;
varying float v_totalLength;
varying float v_thicknessRatio;
varying vec3 v_viewNormal;
varying vec3 v_worldNormal;
varying vec3 v_worldPosition;
vec3 inverseTransformDirection(in vec3 dir,in mat4 matrix){return normalize((vec4(dir,0.0)*matrix).xyz);}
void main(){
  v_t=t;
  v_totalLength=totalLength;
  float yIndex=floor(position.y+.5);
  v_thicknessRatio=step(mod(yIndex,4.),0.5);
  vec3 pos=position+normal*mix(0.04,0.1,v_thicknessRatio);
  vec3 nor=normalize(normalMatrix*normal);
  v_viewNormal=nor;
  v_worldNormal=inverseTransformDirection(nor,viewMatrix);
  v_worldPosition=(modelMatrix*vec4(pos,1.0)).xyz;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);
  gl_Position.z-=0.1/gl_Position.w;
}`;

const TERRAIN_LINES_FRAG = `#define GLSLIFY 1
uniform float u_time;
uniform float u_hudRatio;
varying float v_t;
varying float v_totalLength;
varying float v_thicknessRatio;
varying vec3 v_viewNormal;
varying vec3 v_worldNormal;
varying vec3 v_worldPosition;
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
vec2 fade(vec2 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}
float pnoise(vec2 P,vec2 rep){
  vec4 Pi=floor(P.xyxy)+vec4(0.0,0.0,1.0,1.0);
  vec4 Pf=fract(P.xyxy)-vec4(0.0,0.0,1.0,1.0);
  Pi=mod(Pi,rep.xyxy);Pi=mod289(Pi);
  vec4 ix=Pi.xzxz;vec4 iy=Pi.yyww;vec4 fx=Pf.xzxz;vec4 fy=Pf.yyww;
  vec4 i=permute(permute(ix)+iy);
  vec4 gx=fract(i*(1.0/41.0))*2.0-1.0;vec4 gy=abs(gx)-0.5;
  vec4 tx=floor(gx+0.5);gx=gx-tx;
  vec2 g00=vec2(gx.x,gy.x);vec2 g10=vec2(gx.y,gy.y);
  vec2 g01=vec2(gx.z,gy.z);vec2 g11=vec2(gx.w,gy.w);
  vec4 norm=taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
  g00*=norm.x;g01*=norm.y;g10*=norm.z;g11*=norm.w;
  float n00=dot(g00,vec2(fx.x,fy.x));float n10=dot(g10,vec2(fx.y,fy.y));
  float n01=dot(g01,vec2(fx.z,fy.z));float n11=dot(g11,vec2(fx.w,fy.w));
  vec2 fade_xy=fade(Pf.xy);
  vec2 n_x=mix(vec2(n00,n01),vec2(n10,n11),fade_xy.x);
  float n_xy=mix(n_x.x,n_x.y,fade_xy.y);
  return 2.3*n_xy;
}
float linearStep(float edge0,float edge1,float x){return clamp((x-edge0)/(edge1-edge0),0.0,1.0);}
void main(){
  float t=mod(v_t-u_time*2.,v_totalLength);
  float noiseScale=0.25;
  float n=pnoise(vec2(t*noiseScale,0.),vec2(v_totalLength*noiseScale,100.));
  float shade=mix(0.3+smoothstep(0.,0.-fwidth(n),n)*0.6,1.,v_thicknessRatio);
  shade*=linearStep(50.,-20.,v_worldPosition.z);
  gl_FragColor=vec4(shade,0.,0.,1.)*step(v_totalLength-v_t,v_totalLength*u_hudRatio);
  gl_FragColor.b=linearStep(15.,66.,v_worldPosition.z);
  gl_FragColor.r*=.85;
}`;

export function AboutHeroLines({
  shared,
}: {
  shared: ReturnType<typeof useAboutUniforms>['uniforms'];
}) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    let cancelled = false;
    buildTerrainLinesGeometry()
      .then((geo) => {
        if (!cancelled) setGeometry(geo);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          u_time: { value: 0 },
          u_hudRatio: shared.u_hudRatio,
        },
        vertexShader: buildShader(TERRAIN_LINES_VERT),
        fragmentShader: buildShader(TERRAIN_LINES_FRAG),
        blending: THREE.CustomBlending,
        blendEquation: THREE.MaxEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneFactor,
        blendEquationAlpha: THREE.AddEquation,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneFactor,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        extensions: { derivatives: true },
      }),
    [shared],
  );

  useFrame((state) => {
    material.uniforms.u_time.value = state.clock.elapsedTime;
    material.uniforms.u_hudRatio.value = shared.u_hudRatio.value;

    if (meshRef.current) {
      meshRef.current.visible = shared.u_hudRatio.value > 0;
    }
  });

  if (!geometry) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={15}
    />
  );
}
