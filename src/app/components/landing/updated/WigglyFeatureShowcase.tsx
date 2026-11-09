"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThingsCardsShowcase } from "./ThingsCardsShowcase";

interface FeatureItem {
  id: string;
  num: string;
  tag: string;
  title: string;
  desc: string;
  stats: { label: string; val: string }[];
  image: string;
}

// user focused feature list with verified metrics in exact requested order
const FEATURES: FeatureItem[] = [
  {
    id: "store",
    num: "01",
    tag: "Community Catalog",
    title: "MarketPlace & Store",
    desc: "Tons of Scenes sourced from 8+ major registries directly in one app. Free instant downloads at native resolution without creating an account.",
    stats: [
      { label: "Wallpapers", val: "10,000+" },
      { label: "Registries", val: "8 Sources" },
      { label: "Account", val: "0 Required" },
    ],
    image: "/STORE.webp",
  },
  {
    id: "widgets",
    num: "02",
    tag: "Desktop Overlay",
    title: "Desktop Widgets",
    desc: "The most killer part of the app, Widgets are NOT pre-embedded in the wallpaper, you could use them On ANY wallpaper or scene you may like! And it's not even heavy!",
    stats: [
      { label: "Prebuilt", val: "24+ Widgets" },
      { label: "Input Delay", val: "< 1.2ms" },
      { label: "RAM Impact", val: "~15MB Idle" },
    ],
    image: "/widgets.webp",
  },
  {
    id: "library",
    num: "03",
    tag: "Local Asset Hub",
    title: "Your Permanent Library",
    desc: "Manage your personal collection 100% offline and free. Upload your own collection to keep it In once place. Or save from AppStore. Any codec, and live shaders could be saved.",
    stats: [
      { label: "Storage", val: "100% Offline" },
      { label: "Formats", val: "MP4 · WebM · Shaders" },
      { label: "Telemetry", val: "Zero Tracking" },
    ],
    image: "/Library.webp",
  },
  {
    id: "displays",
    num: "04",
    tag: "Multi-Screen Engine",
    title: "Multi-Monitor & RGB Support",
    desc: "Seamlessly stretch ultra-wide wallpapers across 2, 3, or more displays with independent per-monitor scaling, management, widgets, 10-bit HDR10 color, and zero bezel stretching.",
    stats: [
      { label: "Max Resolution", val: "Upto 8k or whatever the resolution is." },
      { label: "Displays", val: "Up to 8 Monitors, or any number works!" },
      // { label: "Color Space", val: "10-bit HDR10" },
    ],
    image: "/multi.webp",
  },
  {
    id: "taskbar",
    num: "05",
    tag: "Desktop Styling",
    title: "Taskbar Customization",
    desc: "Customize your Windows taskbar with crystal clear acrylic blur, centered icons, custom color tints, and floating dock layouts without risking explorer crashes.",
    stats: [
      { label: "Modes", val: "Clear · Blur · Acrylic" },
      // { label: "Docking", val: "Centered & Floating" },
      // { label: "Hook Type", val: "Direct DWM Injection" },
    ],
    image: "/taskbar.webp",
  },
  {
    id: "performance",
    num: "06",
    tag: "Hardware Acceleration",
    title: "Sub-1% Performance",
    desc: "Try it. Engineered from the metal up in Rust and DirectX 11. Uses less than 5% GPU overhead and automatically pauses instantly whenever you launch a fullscreen game and uses less than 100mb ram.",
    stats: [
      { label: "GPU Load", val: "< 5.0% GPU" },
      { label: "Game Detection", val: "Auto Pauses <3" },
      { label: "VRAM Usage?", val: "Maybe 1-5%" },
    ],
    image: "/colorwall-hardware.webp",
  },
  {
    id: "shaders",
    num: "07",
    tag: "Audio-Reactive Pipeline",
    title: "Fluid Live Shaders",
    desc: "Inbuilt store and upcoming MarketPlace with everything from video to scenes and prebuilt widgets by creators~!, we are working towards it!",
    stats: [
      { label: "Audio Sync", val: "128-Band WASAPI" },
      { label: "Refresh Target", val: "Up to 360Hz" },
      { label: "Available?", val: "Well technically yes!" },
    ],
    image: "/INTERACTIVES.webp",
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

// signature tactile scrolly card with threejs interactive mesh and real metrics
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
        "relative z-20 w-full -mt-2 sm:-mt-2 lg:-mt-8 rounded-[3rem] sm:rounded-[4rem] lg:rounded-[5rem] border pt-16 sm:pt-20 lg:pt-24 pb-14 sm:pb-20 mb-12 sm:mb-16 select-none transition-colors duration-700 shadow-[0_-24px_70px_rgba(0,0,0,0.85)]",
        isDark
          ? "bg-[#0a0b14]/98 border-white/10 text-white backdrop-blur-xl"
          : "bg-white/98 border-black/10 text-slate-900 backdrop-blur-xl"
      )}
    >
      {/* squircle scroll pill floating right on the transition seam */}
      <div className="absolute -top-7 sm:-top-8 right-8 sm:right-16 lg:right-24 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={handleScrollDown}
          aria-label="Scroll down into feature showcase"
          className={cn(
            "flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.4rem] shadow-2xl border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",
            isDark
              ? "bg-[#181a38]/90 border-white/20 text-white hover:bg-[#20234a]"
              : "bg-[#e5ecfb]/95 border-black/10 text-slate-800 hover:bg-[#d8e3fa]"
          )}
        >
          <span className="text-xs sm:text-sm font-bold mb-0.5 animate-bounce">↓</span>
          <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-wide">Scroll</span>
        </button>
      </div>

      {/* inner content wrapper with responsive edge margins */}
      <div className="relative z-10 w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* section top heading pushed down along y axis with 3d plant asset */}
        <div
          className={cn(
            "mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-6 sm:pb-8",
            isDark ? "border-white/10" : "border-black/10"
          )}
        >
          {/* 2 line large bold heading paired with the voxel plant asset */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Image
              src="/editorial/homepage/673662960f25280c0ca517c7_plant_new-p-800.png"
              alt="Editorial Plant Asset"
              width={160}
              height={160}
              className="w-20 sm:w-28 md:w-36 h-auto object-contain pointer-events-none drop-shadow-[0_16px_32px_rgba(0,0,0,0.4)] shrink-0"
              priority
            />
            <div>
              <h2
                className={cn(
                  "font-outfit text-4xl sm:text-6xl md:text-7xl font-[400] tracking-[-0.03em] leading-[1.02]",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Performance
                <br />
                <span className={isDark ? "text-white/60 font-[300]" : "text-slate-500 font-[300]"}>
                  without compromise.
                </span>
              </h2>
            </div>
          </div>

          <p
            className={cn(
              "text-xs sm:text-sm font-light max-w-sm leading-relaxed md:text-right",
              isDark ? "text-white/50" : "text-slate-600"
            )}
          >
            Colorwall while being a full desktop customization engine delivers never beforeseen performance with minimal resource usage. It isn&apos;t a crutch, it&apos;s engineered to perform. Sounds cool? Maybe..
          </p>
        </div>

        {/* things.inc aesthetic showcase cards placed directly under the heading */}
        <ThingsCardsShowcase isDark={isDark} />

        {/* main layout grid with sleek sideways rail */}
        <div className="relative flex gap-4 sm:gap-6 lg:gap-8 items-stretch">
          {/* sideway typography rail */}
          <div
            aria-hidden="true"
            className="hidden xl:flex items-center gap-4 select-none pointer-events-none [writing-mode:vertical-rl] rotate-180 text-[10px] font-mono tracking-[0.3em] uppercase opacity-30 text-current py-2"
          >
            <span>Directx 11 zero-copy engine</span>
            <span className="w-8 h-[1px] bg-current" />
            <span>Rust native desktop runtime</span>
            <span className="w-8 h-[1px] bg-current" />
            <span>Hardware accelerated</span>
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
                        "group border-b py-3.5 sm:py-4 cursor-pointer transition-colors duration-300",
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
                            "font-outfit text-xl sm:text-2xl lg:text-3xl font-[200] tracking-tight transition-all duration-300",
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
                                "mt-2.5 text-xs sm:text-sm font-light leading-relaxed pl-8 sm:pl-12 max-w-lg",
                                isDark ? "text-white/70" : "text-slate-700"
                              )}
                            >
                              {feat.desc}
                            </p>

                            {/* clean subtext metrics without pill containers */}
                            <div className="mt-3.5 pl-8 sm:pl-12 flex flex-wrap items-baseline gap-6 sm:gap-8">
                              {feat.stats.map((s, sIdx) => (
                                <div key={sIdx} className="flex flex-col">
                                  <span
                                    className={cn(
                                      "font-mono text-[9px] uppercase tracking-wider",
                                      isDark ? "text-white/40" : "text-slate-500"
                                    )}
                                  >
                                    {s.label}
                                  </span>
                                  <span className="font-outfit text-xs sm:text-sm font-medium text-[#00a4ff] mt-0.5">
                                    {s.val}
                                  </span>
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
