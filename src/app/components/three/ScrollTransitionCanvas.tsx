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

export interface ShowcaseFeatureItem {
    id: string;
    title: string;
    description: string;
    badge: string;
    imageSrcs: string[];
}

// composite texture creation: strictly loads image and applies vignette gradient without baking text
function createCompositeTexture(slide: ShowcaseFeatureItem): Promise<THREE.Texture> {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 2560;
        canvas.height = 1440;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            resolve(new THREE.Texture());
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = slide.imageSrcs[0];

        img.onload = () => {
            const imgAspect = img.width / img.height;
            const canvasAspect = canvas.width / canvas.height;
            let drawW = canvas.width;
            let drawH = canvas.height;
            let offsetX = 0;
            let offsetY = 0;

            if (imgAspect > canvasAspect) {
                drawW = canvas.height * imgAspect;
                offsetX = (canvas.width - drawW) / 2;
            } else {
                drawH = canvas.width / imgAspect;
                offsetY = (canvas.height - drawH) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

            // dark vignette gradient overlay for text readability
            const grad = ctx.createLinearGradient(0, 0, canvas.width * 0.75, canvas.height);
            grad.addColorStop(0, "rgba(0, 0, 0, 0.75)");
            grad.addColorStop(0.5, "rgba(0, 0, 0, 0.35)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0.1)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.needsUpdate = true;

            resolve(texture);
        };
    });
}

function ScrollMaterial({ 
    features, 
    onSlideChange,
    onExitDown,
    onExitUp,
    isLocked = false
}: { 
    features: ShowcaseFeatureItem[];
    onSlideChange?: (index: number) => void;
    onExitDown?: () => void;
    onExitUp?: () => void;
    isLocked?: boolean;
}) {
    const [textures, setTextures] = useState<THREE.Texture[]>([]);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { viewport } = useThree();

    useEffect(() => {
        const promises = features.map((f) => createCompositeTexture(f));
        Promise.all(promises).then(setTextures);
    }, [features]);

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

    const targetIndexRef = useRef(0);
    const positionRef = useRef(0);
    const lastSlideRef = useRef(0);
    const lastWheelTimeRef = useRef(0);

    // listen to wheel events on both axes with passive false to lock native scroll and trigger instant slide switches on tiny mouse movements
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            // ignore wheel events if section is not locked at top of viewport
            if (!isLocked) return;

            // measure dominant scroll axis delta (supports vertical wheel and horizontal swipe)
            const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

            // ignore negligible noise near zero
            if (Math.abs(delta) < 0.1) return;

            const now = Date.now();
            // throttle wheel gestures by 160ms for crisp rapid slide stepping
            if (now - lastWheelTimeRef.current < 160) {
                e.preventDefault();
                return;
            }

            if (delta > 0.1) {
                if (targetIndexRef.current < features.length - 1) {
                    e.preventDefault();
                    targetIndexRef.current += 1;
                    lastWheelTimeRef.current = now;
                    if (onSlideChange) onSlideChange(targetIndexRef.current);
                } else if (onExitDown) {
                    onExitDown();
                    lastWheelTimeRef.current = now;
                }
            } else if (delta < -0.1) {
                if (targetIndexRef.current > 0) {
                    e.preventDefault();
                    targetIndexRef.current -= 1;
                    lastWheelTimeRef.current = now;
                    if (onSlideChange) onSlideChange(targetIndexRef.current);
                } else if (onExitUp) {
                    onExitUp();
                    lastWheelTimeRef.current = now;
                }
            }
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        return () => window.removeEventListener("wheel", handleWheel);
    }, [isLocked, features.length, onSlideChange, onExitDown, onExitUp]);

    useFrame((_, delta) => {
        if (!materialRef.current || textures.length === 0) return;
        const total = textures.length;
        if (total < 2) return;

        // calculate distance to target slide index
        const distanceToTarget = targetIndexRef.current - positionRef.current;
        
        // smooth lerp factor tuned to 6.5 for elegant fluid visual transitions
        positionRef.current += distanceToTarget * Math.min(1.0, delta * 6.5);

        // clamp position within valid texture index bounds
        positionRef.current = Math.max(0, Math.min(total - 1, positionRef.current));

        // calculate fractional transition progress for GLSL shader uniforms
        const currentSlide = Math.floor(positionRef.current);
        const nextSlide = Math.min(total - 1, currentSlide + 1);
        const progress = positionRef.current - currentSlide;

        // notify parent section of integer slide changes to drive html text crossfades
        const roundedIndex = Math.round(positionRef.current);
        if (roundedIndex !== lastSlideRef.current) {
            lastSlideRef.current = roundedIndex;
            if (onSlideChange) {
                onSlideChange(roundedIndex);
            }
        }

        materialRef.current.uniforms.tex1.value = textures[currentSlide];
        materialRef.current.uniforms.tex2.value = textures[nextSlide];
        materialRef.current.uniforms.progress.value = progress;
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
    features: ShowcaseFeatureItem[];
    onSlideChange?: (index: number) => void;
    onExitDown?: () => void;
    onExitUp?: () => void;
    isLocked?: boolean;
}

export const ScrollTransitionCanvas = ({ features, onSlideChange, onExitDown, onExitUp, isLocked }: Props) => {
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
                <ScrollMaterial 
                    features={features} 
                    onSlideChange={onSlideChange} 
                    onExitDown={onExitDown}
                    onExitUp={onExitUp}
                    isLocked={isLocked} 
                />
            </mesh>
        </Canvas>
    );
}