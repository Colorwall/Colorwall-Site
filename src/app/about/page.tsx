'use client';

import { useTheme } from "@/app/contexts/ThemeContext";
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { WebGLAboutScene } from "./WebGLScene";
import { useState, useEffect, useRef } from "react";

function CinematicTextOverlay({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutMeRef = useRef<HTMLDivElement>(null);
  const colorwallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    
    const renderLoop = () => {
      if (!heroRef.current || !aboutMeRef.current || !colorwallRef.current) return;
      const r = scrollProgress.current; // 0 to 1

      // Phase 1: Hero (0.0 to 0.3)
      const heroOpacity = Math.max(0, 1 - (r / 0.25));
      heroRef.current.style.opacity = `${heroOpacity}`;
      heroRef.current.style.transform = `translateY(${r * 50}px)`;

      // Phase 2: About Me (0.3 to 0.6)
      let aboutOpacity = 0;
      if (r > 0.25 && r < 0.65) {
        if (r < 0.35) aboutOpacity = (r - 0.25) / 0.1;
        else if (r > 0.55) aboutOpacity = 1 - ((r - 0.55) / 0.1);
        else aboutOpacity = 1;
      }
      aboutMeRef.current.style.opacity = `${aboutOpacity}`;
      aboutMeRef.current.style.transform = `translateY(${(0.45 - r) * 50}px)`;

      // Phase 3: ColorWall (0.6 to 1.0)
      const cwOpacity = Math.max(0, Math.min(1, (r - 0.6) / 0.1));
      colorwallRef.current.style.opacity = `${cwOpacity}`;
      colorwallRef.current.style.transform = `translateY(${(0.8 - r) * 50}px)`;
      
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    renderLoop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [scrollProgress]);

  return (
    <div className="relative h-screen w-full overflow-hidden pointer-events-none">
      
      {/* 1. HERO TEXT */}
      <div ref={heroRef} className="absolute inset-0 flex flex-col justify-end px-[4vw] pb-[8vh]">
        <h1 className={`font-black leading-[0.82] tracking-tight whitespace-nowrap text-[16vw] md:text-[15vw] ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          COLORWALL
        </h1>
        <p className={`mt-4 text-lg md:text-2xl font-medium tracking-wide ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
          A project built entirely by one stubborn developer.
        </p>
      </div>

      {/* 2. ABOUT ME TEXT */}
      <div ref={aboutMeRef} className="absolute inset-0 flex items-center justify-center opacity-0">
        <div className="max-w-3xl px-6 text-center">
          <h2 className={`text-4xl md:text-6xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Oliver Laxenta
          </h2>
          <p className={`text-lg md:text-2xl leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
            I am an 18-year-old hobbyist developer. I build things because my dev friends have even worse ADHD than me, so they never helped much. 
            <br/><br/>
            Every line of code is written with love. Well kinda. Mostly out of coping from life.
          </p>
        </div>
      </div>

      {/* 3. COLORWALL TEXT */}
      <div ref={colorwallRef} className="absolute inset-0 flex items-center justify-center opacity-0">
        <div className="max-w-4xl px-6 text-center">
          <h2 className={`text-5xl md:text-7xl font-black mb-8 tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
            Welcome to the Void.
          </h2>
          <p className={`text-lg md:text-2xl leading-relaxed ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
            ColorWall is an 8K live wallpaper & desktop customization engine for Windows. Shaders, particles, store, library — all in 10MB.
            <br/><br/>
            Zero telemetry. Zero subscriptions. 0/72 on VirusTotal. Just a wallpaper engine that respects you.
          </p>
        </div>
      </div>

    </div>
  );
}

export function AboutContent({ theme, scrollProgress }: { theme: 'dark' | 'light', scrollProgress: { current: number } }) {
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
    
    // Virtual Scroll State (0 to 1)
    const scrollProgress = useRef(0);

    useEffect(() => {
        setMounted(true);
        
        // Hijack the wheel globally
        const handleWheel = (e: WheelEvent) => {
            // A simple accumulation factor, adjust sensitivity if needed
            const delta = e.deltaY * 0.0005; 
            scrollProgress.current = Math.min(1, Math.max(0, scrollProgress.current + delta));
        };
        
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    if (!mounted) return null;

    return (
        <div className={`relative h-screen w-full overflow-hidden ${isDark ? "bg-[#080809]" : "bg-slate-50"}`}>
            
            {/* The 3D WebGL Canvas */}
            <Canvas camera={{ position: [0, 0, 10], fov: 35 }} style={{ width: '100vw', height: '100vh', position: 'absolute', inset: 0, zIndex: 0 }}>
                <ambientLight intensity={isDark ? 0.5 : 2} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                
                {/* 3D Scene */}
                <WebGLAboutScene theme={theme as 'dark' | 'light'} scrollProgress={scrollProgress} />
                
                <Environment preset={isDark ? "city" : "studio"} />
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