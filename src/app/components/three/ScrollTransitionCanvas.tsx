"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float progress;
uniform float aspect;
uniform float imageAspect;
varying vec2 vUv;

// Classic Perlin 2D Noise for organic distortion
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i); 
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
    // Emulate CSS object-fit: cover
    vec2 uv = vUv - 0.5;
    float ratio = aspect / imageAspect;
    if (ratio > 1.0) { uv.y *= 1.0 / ratio; } else { uv.x *= ratio; }
    uv += 0.5;

    // Smooth easing for the progress
    float p = smoothstep(0.0, 1.0, progress);
    
    // Generate organic noise
    float noiseVal = snoise(uv * 3.0 + p * 2.0);
    
    // Liquid tear effect (horizontal wave distortion)
    float tear = sin(uv.y * 20.0 + noiseVal * 10.0) * 0.1;
    
    // Intensity peaks at the middle of the transition (0.5)
    float intensity = sin(p * 3.1415);
    
    // Apply displacement
    vec2 disp = vec2(tear * intensity, noiseVal * 0.05 * intensity);
    
    // Zoom out/in effect while displaced
    vec2 uv1 = (uv - 0.5) * (1.0 + p * 0.15) + 0.5 + disp;
    vec2 uv2 = (uv - 0.5) * (1.0 + (1.0 - p) * 0.15) + 0.5 + disp;

    // Cinematic Chromatic Aberration (RGB Split)
    float rOffset = 0.04 * intensity;
    float bOffset = -0.04 * intensity;

    vec4 t1 = vec4(
        texture2D(tex1, uv1 + vec2(rOffset, 0.0)).r,
        texture2D(tex1, uv1).g,
        texture2D(tex1, uv1 + vec2(bOffset, 0.0)).b,
        1.0
    );

    vec4 t2 = vec4(
        texture2D(tex2, uv2 + vec2(rOffset, 0.0)).r,
        texture2D(tex2, uv2).g,
        texture2D(tex2, uv2 + vec2(bOffset, 0.0)).b,
        1.0
    );

    // Diagonal liquid wipe
    float wipe = smoothstep(0.0, 1.0, (uv.x + uv.y) * 0.5 + tear);
    float sweep = smoothstep(wipe - 0.5, wipe + 0.5, p * 2.0 - 0.5);

    gl_FragColor = mix(t1, t2, sweep);
}
`;

function ScrollMaterial({ 
    images, 
    scrollYProgress 
}: { 
    images: string[], 
    scrollYProgress: MotionValue<number> 
}) {
    const [textures, setTextures] = useState<THREE.Texture[]>([]);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport } = useThree();

    // Preload all textures on mount
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        const promises = images.map((src) => {
            return new Promise<THREE.Texture>((resolve) => {
                loader.load(src, (t) => {
                    t.colorSpace = THREE.SRGBColorSpace;
                    resolve(t);
                });
            });
        });

        Promise.all(promises).then((loadedTextures) => {
            console.log("🚀 WebGL: Successfully preloaded all textures for scroll tracking!");
            setTextures(loadedTextures);
        });
    }, [images]);

    const uniforms = useMemo(
        () => ({
            tex1: { value: null },
            tex2: { value: null },
            progress: { value: 0.0 },
            aspect: { value: viewport.aspect },
            imageAspect: { value: 16 / 9 }, // Assumes features are roughly 16:9
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // Update aspect ratio if the window resizes
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.aspect.value = viewport.aspect;
        }
    }, [viewport.aspect]);

    // 60FPS loop binding Framer Motion scroll directly to the GPU shader
    useFrame(() => {
        if (!materialRef.current || textures.length === 0) return;

        const total = textures.length;
        const progress = scrollYProgress.get(); // Raw scroll value between 0.0 and 1.0
        
        // Calculate which two images we are currently transitioning between
        const activeSlide = progress * (total - 1);
        const index1 = Math.floor(activeSlide);
        const index2 = Math.min(total - 1, Math.ceil(activeSlide));
        
        // Calculate the local progress percentage between those two specific images
        const localProgress = activeSlide - index1;

        // Push values instantly to the GPU
        materialRef.current.uniforms.tex1.value = textures[index1];
        materialRef.current.uniforms.tex2.value = textures[index2];
        materialRef.current.uniforms.progress.value = localProgress;
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent={true}
        />
    );
}

export function ScrollTransitionCanvas({ 
    images, 
    scrollYProgress 
}: { 
    images: string[], 
    scrollYProgress: MotionValue<number> 
}) {
    return (
        <Canvas 
            orthographic
            camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: true }}
            className="absolute inset-0 w-full h-full z-0"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
            <mesh>
                <planeGeometry args={[2, 2]} />
                <ScrollMaterial images={images} scrollYProgress={scrollYProgress} />
            </mesh>
        </Canvas>
    );
}
