'use client';

import { useTheme } from "@/app/contexts/ThemeContext";
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { WebGLAboutScene } from "./WebGLScene";
import { useState, useEffect, useRef } from "react";
import { useVirtualScroll } from "./hooks/useVirtualScroll";
import { TEXT_PHASES } from "./scrollConfig";
import { AboutScrollNav } from "./components/AboutScrollNav";
import { AboutScrollIndicator } from "./components/AboutScrollIndicator";
import { usePageReady } from "@/hooks/usePageReady";

function phaseOpacity(r: number, start: number, peak: number, end: number) {
  if (r < start || r > end) return 0;
  if (r <= peak) return (r - start) / (peak - start);
  return 1 - (r - peak) / (end - peak);
}

function CinematicTextOverlay({
  scrollProgress,
}: {
  scrollProgress: { current: number };
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      const r = scrollProgress.current;

      if (heroRef.current) {
        const heroOpacity = Math.max(0, 1 - r / 0.12);
        heroRef.current.style.opacity = `${heroOpacity}`;
        heroRef.current.style.transform = `scale(${1 + r * 0.5})`;
      }

      TEXT_PHASES.forEach((phase, i) => {
        const el = phaseRefs.current[i];
        if (!el) return;
        const opacity = phaseOpacity(r, phase.start, phase.peak, phase.end);
        el.style.opacity = `${opacity}`;
        el.style.transform = `translateY(${(1 - opacity) * 20}px)`;
      });

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [scrollProgress]);

  return (
    <div className="relative h-screen w-full overflow-hidden pointer-events-none flex items-center justify-center">
      <div
        ref={heroRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <h1
          className="font-sans font-bold tracking-widest whitespace-nowrap text-white"
          style={{ fontSize: '14vw', letterSpacing: '0.05em' }}
        >
          COLORWALL
        </h1>
      </div>

      {TEXT_PHASES.map((phase, i) => (
        <div
          key={phase.id}
          ref={(el) => {
            phaseRefs.current[i] = el;
          }}
          className="absolute inset-0 flex items-end justify-between px-[5vw] pb-[15vh] opacity-0 pointer-events-none"
        >
          <div className="text-white">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-wide">
              {phase.left.map((line, j) => (
                <span key={j}>
                  {line}
                  {j < phase.left.length - 1 && <br />}
                </span>
              ))}
            </h2>
          </div>
          <div className="text-white text-right pb-1">
            <h2
              className={`text-3xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-wide ${phase.rightItalic ? 'italic' : ''}`}
            >
              {phase.right.map((line, j) => (
                <span key={j}>
                  {line}
                  {j < phase.right.length - 1 && <br />}
                </span>
              ))}
            </h2>
          </div>
        </div>
      ))}
    </div>
  );
}

function AboutContent({
  scrollProgress,
}: {
  scrollProgress: { current: number };
}) {
  return (
    <div className="absolute inset-0 w-full pointer-events-none z-10">
      <CinematicTextOverlay scrollProgress={scrollProgress} />
    </div>
  );
}

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    
    // Prevent SSR hydration crashes with WebGL portals
    const [mounted, setMounted] = useState(false);
    
    // defer heavy webgl mounting until html/css finishes painting and browser is idle
    const isPageReady = usePageReady();
    
    const scrollProgress = useVirtualScroll();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className={`relative h-screen w-full overflow-hidden ${isDark ? "bg-black" : "bg-slate-50"}`}>
            
            {/* The 3D WebGL Canvas */}
            {isPageReady && (
                <Canvas
                    gl={{
                      antialias: true,
                      alpha: false,
                      powerPreference: 'high-performance',
                      toneMapping: THREE.NoToneMapping,
                    }}
                    camera={{ position: [0, 7.3, -5], fov: 60, near: 1, far: 100 }}
                    style={{ width: '100vw', height: '100vh', position: 'absolute', inset: 0, zIndex: 0 }}
                >
                    <WebGLAboutScene theme={theme as 'dark' | 'light'} scrollProgress={scrollProgress} />
                </Canvas>
            )}

            {/* DOM Overlay correctly placed OUTSIDE the WebGL Canvas in the standard DOM tree */}
            <AboutContent scrollProgress={scrollProgress} />

            <AboutScrollNav scrollProgress={scrollProgress} isDark={isDark} />
            <AboutScrollIndicator scrollProgress={scrollProgress} isDark={isDark} />

            {/* A tiny minimalist return button */}
            <a 
                href="/" 
                className={`absolute top-8 left-8 z-50 text-sm font-medium tracking-tight hover:opacity-50 transition-opacity ${isDark ? "text-white" : "text-black"}`}
            >
                ← Back
            </a>
        </div>
    );
}