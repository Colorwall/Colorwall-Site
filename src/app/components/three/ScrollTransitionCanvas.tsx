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
uniform float time;
varying vec2 vUv;

vec2 mirrored(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

float tri(float p) {
  return mix(p, 1.0 - p, step(0.5, p))*2.0;
}

void main() {
    // Preserve aspect ratio for the texture UVs (equivalent to vUv1 and uvRate1 in the repo)
    vec2 vUv1 = vUv - 0.5;
    float ratio = aspect / imageAspect;
    if (ratio > 1.0) { vUv1.y *= 1.0 / ratio; } else { vUv1.x *= ratio; }
    vUv1 += 0.5;

    // Use raw vUv as the screen coordinate for the delay effect (equivalent to gl_FragCoord / pixels)
    vec2 uv = vUv;
    
    // progress is already the fractional part (0.0 to 1.0) passed from JS
    float p = progress;

    vec2 accel = vec2(0.5, 2.0);
    
    float delayValue = p * 7.0 - uv.y * 2.0 + uv.x - 2.0;
    delayValue = clamp(delayValue, 0.0, 1.0);

    vec2 translateValue = p + delayValue*accel;
    vec2 translateValue1 = vec2(-0.5, 1.0) * translateValue;
    vec2 translateValue2 = vec2(-0.5, 1.0) * (translateValue - 1.0 - accel);

    vec2 w = sin( sin(time)*vec2(0.0, 0.3) + vUv.yx*vec2(0.0, 4.0)) * vec2(0.0, 0.5);
    vec2 xy = w*(tri(p)*0.5 + tri(delayValue)*0.5);

    vec2 uv1 = vUv1 + translateValue1 + xy;
    vec2 uv2 = vUv1 + translateValue2 + xy;

    vec4 rgba1 = texture2D(tex1, mirrored(uv1));
    vec4 rgba2 = texture2D(tex2, mirrored(uv2));

    vec4 rgba = mix(rgba1, rgba2, delayValue);
    gl_FragColor = rgba;
}
`;

function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}

function ScrollMaterial({ 
    images, 
    activeIndex 
}: { 
    images: string[], 
    activeIndex: number 
}) {
    const [textures, setTextures] = useState<THREE.Texture[]>([]);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport, gl } = useThree();

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        const maxAniso = gl.capabilities.getMaxAnisotropy();

        const promises = images.map((src) => {
            return new Promise<THREE.Texture>((resolve) => {
                loader.load(src, (t) => {
                    t.colorSpace = THREE.SRGBColorSpace;
                    t.wrapS = THREE.ClampToEdgeWrapping;
                    t.wrapT = THREE.ClampToEdgeWrapping;
                    t.generateMipmaps = false;
                    t.minFilter = THREE.LinearFilter;
                    t.magFilter = THREE.LinearFilter;
                    t.needsUpdate = true;
                    resolve(t);
                });
            });
        });
        Promise.all(promises).then(setTextures);
    }, [images, gl]);

    const uniforms = useMemo(
        () => ({
            tex1: { value: null },
            tex2: { value: null },
            progress: { value: 0.0 },
            aspect: { value: viewport.aspect },
            imageAspect: { value: 16 / 9 },
            time: { value: 0.0 },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.aspect.value = viewport.aspect;
        }
    }, [viewport.aspect]);

    const currentScroll = useRef(0);

    useFrame((_, delta) => {
        if (!materialRef.current || textures.length === 0) return;
        const total = textures.length;
        if (total < 2) return;

        const targetScroll = activeIndex;

        // Smoothly lerp towards target for that buttery fluid feel
        // react-fluid-gallery uses a gentle spring/lerp (roughly delta * 2.5)
        currentScroll.current += (targetScroll - currentScroll.current) * (delta * 3.0);

        // Clamp to valid range to prevent out-of-bounds indexing
        let clampedScroll = Math.max(0, Math.min(total - 1, currentScroll.current));

        let currentIdx = Math.floor(clampedScroll);
        let nextIdx = Math.min(total - 1, currentIdx + 1);

        // The fractional part is exactly where we are in the transition (0.0 to 1.0)
        let localProgress = clampedScroll - currentIdx;

        // Handle edge case at the very end of the scroll array
        if (currentIdx === total - 1) {
            currentIdx = total - 2;
            nextIdx = total - 1;
            localProgress = 1.0;
        }

        materialRef.current.uniforms.tex1.value = textures[currentIdx];
        materialRef.current.uniforms.tex2.value = textures[nextIdx];
        materialRef.current.uniforms.progress.value = localProgress;
        materialRef.current.uniforms.time.value += delta;
    });

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent={true}
            toneMapped={false}
        />
    );
}

interface Props {
    images: string[];
    activeIndex: number;
}

export const ScrollTransitionCanvas = ({ images, activeIndex }: Props) => {
    return (
        <Canvas 
            orthographic
            camera={{ position: [0, 0, 1], left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
                gl.toneMapping = THREE.NoToneMapping;
            }}
            className="absolute inset-0 w-full h-full z-0"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
            <mesh>
                <planeGeometry args={[2, 2]} />
                <ScrollMaterial images={images} activeIndex={activeIndex} />
            </mesh>
        </Canvas>
    );
}