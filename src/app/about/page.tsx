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
import { AndroidGate } from "./components/AndroidGate";
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
  const scrollHintRef = useRef<HTMLDivElement>(null);

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

      // fade out the scroll hint as soon as the user starts scrolling
      if (scrollHintRef.current) {
        const hintOpacity = Math.max(0, 1 - r / 0.05);
        scrollHintRef.current.style.opacity = `${hintOpacity}`;
        scrollHintRef.current.style.pointerEvents = hintOpacity > 0.5 ? 'auto' : 'none';
      }

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

      {/* scroll hint - bouncing chevron at bottom center, fades out once user starts scrolling */}
      <div
        ref={scrollHintRef}
        className="absolute bottom-[6vh] left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-white/60 text-xs md:text-sm uppercase tracking-[0.3em] font-semibold">
          Scroll to explore
        </span>
        <div className="animate-[scrollBounce_2s_ease-in-out_infinite]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white/30"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
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
    
    // prevent ssr hydration crashes with webgl portals
    const [mounted, setMounted] = useState(false);
    // tracks whether the current device is android (can not render webgl scene)
    const [isAndroid, setIsAndroid] = useState(false);
    
    // defer heavy webgl mounting until html/css finishes painting and browser is idle
    const isPageReady = usePageReady();
    
    const scrollProgress = useVirtualScroll();

    useEffect(() => {
        setMounted(true);
        // check for android devices via user agent - runs client-side only
        // to avoid ssr mismatches between server and client renders
        if (/Android/i.test(navigator.userAgent)) {
            setIsAndroid(true);
        }
    }, []);

    if (!mounted) return null;

    // android devices get a styled redirect page instead of the full webgl pipeline
    if (isAndroid) return <AndroidGate />;

    return (
        <div className={`relative h-screen w-full overflow-hidden ${isDark ? "bg-black" : "bg-slate-50"}`}>
            
            {/* the 3d webgl canvas */}
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

            {/* svg loading spinner - visible while usePageReady is false (webgl not yet mounted).
                sits below the colorwall title as a thin rotating ring with label text.
                fades out via css opacity transition once isPageReady flips to true. */}
            <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
                style={{
                    opacity: isPageReady ? 0 : 1,
                    transition: 'opacity 0.8s ease-out',
                }}
            >
                {/* offset downward from center so it sits below the colorwall title */}
                <div className="mt-[28vh] flex flex-col items-center gap-5">
                    <svg
                        width="32"
                        height="32"
                        viewBox="0 0 32 32"
                        fill="none"
                        className="animate-spin"
                        style={{ animationDuration: '1.8s' }}
                    >
                        <circle
                            cx="16"
                            cy="16"
                            r="13"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="1.5"
                            fill="none"
                        />
                        <path
                            d="M16 3a13 13 0 0 1 13 13"
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            fill="none"
                        />
                    </svg>
                    <span className="text-white/20 text-[9px] uppercase tracking-[0.35em] font-medium">
                        Loading Experience
                    </span>
                </div>
            </div>

            {/* dom overlay correctly placed outside the webgl canvas in the standard dom tree */}
            <AboutContent scrollProgress={scrollProgress} />

            <AboutScrollNav scrollProgress={scrollProgress} isDark={isDark} />
            <AboutScrollIndicator scrollProgress={scrollProgress} isDark={isDark} />

            {/* a tiny minimalist return button */}
            <a 
                href="/" 
                className={`absolute top-8 left-8 z-50 text-sm font-medium tracking-tight hover:opacity-50 transition-opacity ${isDark ? "text-white" : "text-black"}`}
            >
                ← Back
            </a>
        </div>
    );
}