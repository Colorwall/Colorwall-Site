"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureItem {
  id: string;
  num: string;
  tag: string;
  title: string;
  desc: string;
  stats: { label: string; val: string }[];
  image: string;
}

// core technical specifications mapped directly to verified engine assets
const FEATURES: FeatureItem[] = [
  {
    id: "compositor",
    num: "01",
    tag: "Rust + DirectX 11 Pipeline",
    title: "Zero-Copy Compositor",
    desc: "Engineered from the metal up in Rust. Hardware-accelerated desktop swapchain maintaining sub-1.5% GPU overhead with instantaneous zero-copy frame dispatch.",
    stats: [
      { label: "Overhead", val: "< 1.5% GPU" },
      { label: "Engine Core", val: "Rust + D3D11" },
      { label: "Frame Dispatch", val: "Zero-Copy" },
    ],
    image: "/colorwall-hardware.webp",
  },
  {
    id: "shaders",
    num: "02",
    tag: "Realtime Compute Passes",
    title: "Fluid Live Shaders",
    desc: "DirectX 11 compute and HLSL/GLSL shader passes with 128-band WASAPI audio loopback reactivity, procedural waves, and continuous 60-360 FPS delivery.",
    stats: [
      { label: "Refresh Target", val: "Up to 360Hz" },
      { label: "Latency", val: "0.2ms Dispatch" },
      { label: "Audio FFT", val: "WASAPI 128-band" },
    ],
    image: "/INTERACTIVES.webp",
  },
  {
    id: "sandboxes",
    num: "03",
    tag: "Modular Desktop Docks",
    title: "Translucent Sandboxes",
    desc: "Customizable taskbars, interactive diagnostic overlays, and web-component sandboxes injected directly into the desktop plane without Windows Explorer hooks.",
    stats: [
      { label: "Backdrop Blur", val: "DWM Acrylic" },
      { label: "Isolation", val: "Process Sandbox" },
      { label: "Memory Idle", val: "0.2% CPU Idle" },
    ],
    image: "/taskbar.webp",
  },
  {
    id: "displays",
    num: "04",
    tag: "Independent Scaling Engine",
    title: "8K Panoramic Spans",
    desc: "Multi-monitor workspace coordination with independent per-display refresh synchronization, native HDR10 color profiles, and ultra-wide spans without tearing.",
    stats: [
      { label: "Max Resolution", val: "8K Native HDR" },
      { label: "Multi-Screen", val: "Per-Screen Sync" },
      { label: "Color Space", val: "10-bit Rec.2020" },
    ],
    image: "/multi.webp",
  },
  {
    id: "library",
    num: "05",
    tag: "Offline-First Local Storage",
    title: "Instant Asset Cache",
    desc: "Zero tracking, zero cloud lock-in. SQLite-backed local repository with asynchronous thumbnail threads and instant switching across 8+ wallpaper formats.",
    stats: [
      { label: "Database", val: "SQLite Local" },
      { label: "Privacy", val: "Zero Telemetry" },
      { label: "Formats", val: "Shaders / MP4 / EXE" },
    ],
    image: "/Library.webp",
  },
];

// vertex shader implementing continuous sinusoidal wave ripples and mouse localized deformation
const vertexShader = `
  uniform float u_time;
  uniform float u_wiggleStrength;
  uniform vec2 u_mouse;
  varying vec2 v_uv;
  varying float v_elevation;

  void main() {
    v_uv = uv;
    vec3 pos = position;

    // localized ripple responding to normalized cursor distance
    float distToMouse = distance(uv, u_mouse);
    float mouseWave = sin(distToMouse * 14.0 - u_time * 4.0) * exp(-distToMouse * 3.5) * 0.12;

    // ambient fluid surface tension wave
    float ambientWave = sin(pos.x * 2.8 + u_time * 1.8) * cos(pos.y * 2.4 + u_time * 1.4) * 0.07;

    pos.z += (ambientWave + mouseWave) * u_wiggleStrength;
    v_elevation = pos.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// fragment shader blending active and incoming textures with subtle optical dispersion
const fragmentShader = `
  uniform sampler2D u_textureCurrent;
  uniform sampler2D u_textureNext;
  uniform float u_transition;
  varying vec2 v_uv;
  varying float v_elevation;

  void main() {
    // subtle optical chromatic aberration driven by surface elevation
    vec2 offsetR = vec2(v_elevation * 0.035, v_elevation * 0.02);
    vec2 offsetG = vec2(v_elevation * 0.012, v_elevation * 0.006);
    vec2 offsetB = -vec2(v_elevation * 0.028, v_elevation * 0.014);

    vec4 curR = texture2D(u_textureCurrent, v_uv + offsetR);
    vec4 curG = texture2D(u_textureCurrent, v_uv + offsetG);
    vec4 curB = texture2D(u_textureCurrent, v_uv + offsetB);
    vec4 colCurrent = vec4(curR.r, curG.g, curB.b, curR.a);

    vec4 nextR = texture2D(u_textureNext, v_uv + offsetR);
    vec4 nextG = texture2D(u_textureNext, v_uv + offsetG);
    vec4 nextB = texture2D(u_textureNext, v_uv + offsetB);
    vec4 colNext = vec4(nextR.r, nextG.g, nextB.b, nextG.a);

    gl_FragColor = mix(colCurrent, colNext, u_transition);
  }
`;

interface WigglyFeatureShowcaseProps {
  theme?: "dark" | "light";
}

// signature tactile scrolly card with rounded top corners slipping directly over the hero section
export function WigglyFeatureShowcase({ theme = "dark" }: WigglyFeatureShowcaseProps) {
  const isDark = theme === "dark";
  const [activeIndex, setActiveIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const meshRef = useRef<THREE.Mesh | null>(null);

  const transitionProgressRef = useRef(1);
  const currentIndexRef = useRef(0);
  const targetIndexRef = useRef(0);
  const mouseTargetRef = useRef<THREE.Vector2>(new THREE.Vector2(0.5, 0.5));
  const mouseSmoothRef = useRef<THREE.Vector2>(new THREE.Vector2(0.5, 0.5));
  const rotTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotSmoothRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // initialize threejs scene, texture loader, and responsive viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 500;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.z = 3.2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // preload all feature textures
    const textureLoader = new THREE.TextureLoader();
    const loadedTextures = FEATURES.map((feat) => {
      const tex = textureLoader.load(feat.image);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      return tex;
    });
    texturesRef.current = loadedTextures;

    // custom shader material with uniforms driving wave animation and texture crossfading
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_wiggleStrength: { value: 1.0 },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_textureCurrent: { value: loadedTextures[0] },
        u_textureNext: { value: loadedTextures[0] },
        u_transition: { value: 1.0 },
      },
      side: THREE.DoubleSide,
      transparent: true,
    });
    materialRef.current = material;

    // subdivided plane geometry supporting detailed vertex wave displacement
    const geometry = new THREE.PlaneGeometry(3.1, 1.95, 64, 64);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    let animId: number;
    const clock = new THREE.Clock();

    // animation loop updating wave uniforms and smoothing mouse parallax
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      if (materialRef.current) {
        materialRef.current.uniforms.u_time.value = elapsedTime;

        // smooth mouse ripple coordinates
        mouseSmoothRef.current.x += (mouseTargetRef.current.x - mouseSmoothRef.current.x) * 0.08;
        mouseSmoothRef.current.y += (mouseTargetRef.current.y - mouseSmoothRef.current.y) * 0.08;
        materialRef.current.uniforms.u_mouse.value.copy(mouseSmoothRef.current);

        // handle smooth crossfade transition between textures
        if (transitionProgressRef.current < 1) {
          transitionProgressRef.current += 0.045;
          if (transitionProgressRef.current >= 1) {
            transitionProgressRef.current = 1;
            materialRef.current.uniforms.u_textureCurrent.value =
              texturesRef.current[targetIndexRef.current];
            currentIndexRef.current = targetIndexRef.current;
          }
          materialRef.current.uniforms.u_transition.value = transitionProgressRef.current;
        }
      }

      // smooth mesh tilt parallax driven by mouse coordinates
      if (meshRef.current) {
        rotSmoothRef.current.x += (rotTargetRef.current.x - rotSmoothRef.current.x) * 0.06;
        rotSmoothRef.current.y += (rotTargetRef.current.y - rotSmoothRef.current.y) * 0.06;
        meshRef.current.rotation.x = rotSmoothRef.current.x;
        meshRef.current.rotation.y = rotSmoothRef.current.y;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // resize observer to maintain aspect ratio without stretching
    const handleResize = () => {
      if (!canvas || !rendererRef.current || !cameraRef.current) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h, false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      loadedTextures.forEach((t) => t.dispose());
    };
  }, []);

  // trigger smooth texture dissolve when switching features
  const handleSelectFeature = (idx: number) => {
    if (idx === activeIndex) return;
    setActiveIndex(idx);
    targetIndexRef.current = idx;

    if (materialRef.current && texturesRef.current[idx]) {
      materialRef.current.uniforms.u_textureNext.value = texturesRef.current[idx];
      transitionProgressRef.current = 0;
    }
  };

  // track mouse coordinates over canvas for interactive ripple and tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;

    mouseTargetRef.current.set(x, y);
    rotTargetRef.current.y = (x - 0.5) * 0.18;
    rotTargetRef.current.x = -(y - 0.5) * 0.14;
  };

  const handleMouseLeave = () => {
    mouseTargetRef.current.set(0.5, 0.5);
    rotTargetRef.current.x = 0;
    rotTargetRef.current.y = 0;
  };

  // scroll handler to smoothly slide down into the feature showcase
  const handleScrollDown = () => {
    window.scrollBy({ top: 520, behavior: "smooth" });
  };

  return (
    <section
      className={cn(
        "relative z-20 w-full -mt-16 sm:-mt-24 lg:-mt-32 rounded-t-[3rem] sm:rounded-t-[4rem] lg:rounded-t-[5rem] border-t border-x pt-14 sm:pt-20 pb-16 sm:pb-24 select-none transition-colors duration-700 shadow-[0_-24px_70px_rgba(0,0,0,0.85)]",
        isDark
          ? "bg-[#0b0c16]/98 border-white/10 text-white bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:32px_32px]"
          : "bg-white/98 border-black/10 text-slate-900 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"
      )}
    >
      {/* squircle scroll pill floating right on the transition seam */}
      <div className="absolute -top-7 sm:-top-9 right-8 sm:right-16 lg:right-24 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={handleScrollDown}
          aria-label="Scroll down into feature showcase"
          className={cn(
            "flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-[1.3rem] sm:rounded-[1.6rem] shadow-2xl border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",
            isDark
              ? "bg-[#1d2042]/90 border-white/20 text-white hover:bg-[#252a55]"
              : "bg-[#e5ecfb]/95 border-black/10 text-slate-800 hover:bg-[#d8e3fa]"
          )}
        >
          <span className="text-sm sm:text-base font-bold mb-0.5 animate-bounce">↓</span>
          <span className="text-[10px] sm:text-xs font-sans font-medium tracking-wide">Scroll</span>
        </button>
      </div>

      {/* inner content wrapper with responsive edge margins */}
      <div className="relative z-10 w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* section top metadata and title */}
        <div
          className={cn(
            "mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-5",
            isDark ? "border-white/10" : "border-black/10"
          )}
        >
          <div>
            <h2
              className={cn(
                "font-outfit text-3xl sm:text-5xl lg:text-6xl font-[200] tracking-[-0.04em] leading-[1.05]",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Performance without compromise
            </h2>
          </div>

          <p
            className={cn(
              "text-xs sm:text-sm font-light max-w-sm leading-relaxed sm:text-right",
              isDark ? "text-white/50" : "text-slate-600"
            )}
          >
            DirectX 11 compositor architecture with sub-millisecond dispatch and hardware zero-copy presentation.
          </p>
        </div>

        {/* main layout grid with sleek sideways rail */}
        <div className="relative flex gap-4 sm:gap-6 lg:gap-8 items-stretch">
          {/* sideway typography rail */}
          <div
            aria-hidden="true"
            className="hidden xl:flex items-center gap-4 select-none pointer-events-none [writing-mode:vertical-rl] rotate-180 text-[10px] font-mono tracking-[0.3em] uppercase opacity-30 text-current py-2"
          >
            <span>directx 11 zero-copy engine</span>
            <span className="w-8 h-[1px] bg-current" />
            <span>rust native desktop runtime</span>
            <span className="w-8 h-[1px] bg-current" />
            <span>hardware accelerated</span>
          </div>

          {/* split screen showcase */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center">
            {/* left half: prominently sized interactive wiggly threejs canvas */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="lg:col-span-7 relative w-full aspect-[16/10] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            >
              {/* threejs canvas rendering fluid wave ripples */}
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* right half: navigable feature deck with breathy thin typography */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="flex flex-col">
                {FEATURES.map((feat, idx) => {
                  const isActive = idx === activeIndex;

                  return (
                    <div
                      key={feat.id}
                      onClick={() => handleSelectFeature(idx)}
                      onMouseEnter={() => handleSelectFeature(idx)}
                      className={cn(
                        "group border-b py-4 sm:py-5 cursor-pointer transition-colors duration-300",
                        isDark ? "border-white/10" : "border-black/10"
                      )}
                    >
                      {/* feature header row */}
                      <div className="flex items-baseline gap-4 sm:gap-6">
                        <span
                          className={cn(
                            "font-mono text-xs sm:text-sm font-light transition-colors duration-300",
                            isActive
                              ? "text-[#00a4ff]"
                              : isDark
                              ? "text-white/35 group-hover:text-white/70"
                              : "text-slate-400 group-hover:text-slate-800"
                          )}
                        >
                          {feat.num}
                        </span>

                        <h3
                          className={cn(
                            "font-outfit text-2xl sm:text-3xl lg:text-4xl font-[200] tracking-tight transition-all duration-300",
                            isActive
                              ? isDark
                                ? "text-white translate-x-1 font-[300]"
                                : "text-slate-900 translate-x-1 font-[300]"
                              : isDark
                              ? "text-white/45 group-hover:text-white/80"
                              : "text-slate-400 group-hover:text-slate-700"
                          )}
                        >
                          {feat.title}
                        </h3>
                      </div>

                      {/* expandable details drawer */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p
                              className={cn(
                                "mt-3 text-xs sm:text-sm font-light leading-relaxed pl-8 sm:pl-12 max-w-lg",
                                isDark ? "text-white/70" : "text-slate-700"
                              )}
                            >
                              {feat.desc}
                            </p>

                            {/* technical metric telemetry chips */}
                            <div className="mt-3.5 pl-8 sm:pl-12 flex flex-wrap gap-2.5">
                              {feat.stats.map((s, sIdx) => (
                                <div
                                  key={sIdx}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg border backdrop-blur-sm",
                                    isDark
                                      ? "bg-white/[0.04] border-white/10"
                                      : "bg-black/[0.04] border-black/10"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "font-mono text-[9px] uppercase tracking-wider",
                                      isDark ? "text-white/40" : "text-slate-500"
                                    )}
                                  >
                                    {s.label}
                                  </div>
                                  <div className="font-outfit text-xs sm:text-sm font-normal text-[#00a4ff]">
                                    {s.val}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
