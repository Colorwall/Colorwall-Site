'use client';

import { useTheme } from "@/app/contexts/ThemeContext";
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { WebGLAboutScene } from "./WebGLScene";
import { DEFAULT_SCROLL } from "./scrollConfig";
import { useState, useEffect, useRef } from "react";

function CinematicTextOverlay({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    
    const renderLoop = () => {
      if (!heroRef.current || !infoRef.current) return;
      const r = scrollProgress.current; // 0 to 1

      // Phase 1: Hero text fades quickly so the 3D scene is visible
      const heroOpacity = Math.max(0, 1 - (r / 0.12));
      heroRef.current.style.opacity = `${heroOpacity}`;
      // Slight scale out as we zoom
      heroRef.current.style.transform = `scale(${1 + r * 0.5})`;

      // Phase 2: Dual Column Info Text (0.4 to 1.0)
      let infoOpacity = 0;
      if (r > 0.35) {
        infoOpacity = Math.min(1, (r - 0.35) / 0.15);
      }
      infoRef.current.style.opacity = `${infoOpacity}`;
      // Slide up slightly
      infoRef.current.style.transform = `translateY(${(0.6 - r) * 30}px)`;

      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [scrollProgress]);

  return (
    <div className="relative h-screen w-full overflow-hidden pointer-events-none flex items-center justify-center">
      
      {/* 1. MASSIVE HERO TEXT (Phase 1) */}
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

      {/* 2. DUAL COLUMN INFO TEXT (Phase 2) */}
      <div 
        ref={infoRef} 
        className="absolute inset-0 flex items-end justify-between px-[5vw] pb-[15vh] opacity-0 pointer-events-none"
      >
        {/* Left Column */}
        <div className="text-white">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight tracking-wide">
            WE ARE<br />
            COLORWALL<br />
            A CREATIVE<br />
            PRODUCTION STUDIO
          </h2>
        </div>

        {/* Right Column (Italicized) */}
        <div className="text-white text-right pb-1">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium italic leading-tight tracking-wide">
            CRAFTING UNIQUE<br />
            DIGITAL EXPERIENCES
          </h2>
        </div>
      </div>

    </div>
  );
}

function AboutContent({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
  return (
    <div className="absolute inset-0 w-full pointer-events-none z-10">
      <CinematicTextOverlay theme={theme} scrollProgress={scrollProgress} />
    </div>
  );
}

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    
    // Prevent SSR hydration crashes with WebGL portals
    const [mounted, setMounted] = useState(false);
    
    // Virtual scroll (0–1); start one wheel notch out from spline origin
    const scrollProgress = useRef(DEFAULT_SCROLL);

    useEffect(() => {
        setMounted(true);
        
        // Hijack the wheel globally
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const delta = e.deltaY * 0.0012;
            scrollProgress.current = Math.min(1, Math.max(0, scrollProgress.current + delta));
        };
        
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    if (!mounted) return null;

    return (
        <div className={`relative h-screen w-full overflow-hidden ${isDark ? "bg-black" : "bg-slate-50"}`}>
            
            {/* The 3D WebGL Canvas */}
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

            {/* DOM Overlay correctly placed OUTSIDE the WebGL Canvas in the standard DOM tree */}
            <AboutContent theme={theme as 'dark' | 'light'} scrollProgress={scrollProgress} />

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