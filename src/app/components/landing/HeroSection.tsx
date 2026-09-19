"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Monitor, Cpu, Wrench } from "lucide-react";
import { AmbientPlayer } from "./AmbientPlayer";
import { Outfit } from "next/font/google";
import { HeroInteractive } from "./HeroInteractive";
import { HeroTypewriter } from "./HeroTypewriter";
import { useAmbient } from "@/app/contexts/AmbientContext";

import RippleDistortion from "../ui/sexyripples";

const outfit = Outfit({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500"] });


type HeroVideo = {
    src: string;
    type: string;
    poster: string;
};

const HERO_VIDEOS: HeroVideo[] = [
    { src: "/videos/laxenta.webm", type: "video/webm", poster: "/videos/posters/laxenta.webp" },
    { src: "/videos/Ajitani_Hifumi_Train_Ride_Blue_Archive_Live_Wallpaper.webm", type: "video/webm", poster: "/videos/posters/Ajitani_Hifumi_Train_Ride_Blue_Archive_Live_Wallpaper.webp" },
    { src: "/videos/Anime_Angel_Girl_and_Astronaut_in_Space_Live_Wallpaper.webm", type: "video/webm", poster: "/videos/posters/Anime_Angel_Girl_and_Astronaut_in_Space_Live_Wallpaper.webp" },
    { src: "/videos/Autumn_Leaves_And_Water_Reflection_Live_Wallpaper.webm", type: "video/webm", poster: "/videos/posters/Autumn_Leaves_And_Water_Reflection_Live_Wallpaper.webp" },
    // { src: "/videos/background.webm", type: "video/webm", poster: "/videos/posters/background.webp" },
    { src: "/videos/Download_Misty_Valley_Live_Wallpaper_live_wallpaper__4K_HD_.webm", type: "video/webm", poster: "/videos/posters/Download_Misty_Valley_Live_Wallpaper_live_wallpaper__4K_HD_.webp" },
    { src: "/videos/initialstwo.webm", type: "video/webm", poster: "/videos/posters/initialstwo.webp" },
    { src: "/videos/Prana_System_Error.webm", type: "video/webm", poster: "/videos/posters/Prana_System_Error.webp" },
];

const HeroBackground = React.memo(() => (
    <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: `
            <img id="hero-poster" src="${HERO_VIDEOS[0].poster}" alt="Background Poster" fetchpriority="high" class="object-cover absolute inset-0 w-full h-full opacity-100 transition-opacity duration-1000 ease-in-out" />
            <video id="hero-video" src="${HERO_VIDEOS[0].src}" autoplay muted loop playsinline preload="none" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out"></video>
            <script>
                (function() {
                    try {
                        var videos = ${JSON.stringify(HERO_VIDEOS)};
                        var v = videos[Math.floor(Math.random() * videos.length)];
                        var poster = document.getElementById('hero-poster');
                        var video = document.getElementById('hero-video');
                        
                        poster.src = v.poster;
                        video.src = v.src;

                        var forcePlay = function() {
                            var playPromise = video.play();
                            if (playPromise !== undefined) {
                                playPromise.catch(function(e) { console.error('Autoplay blocked:', e); });
                            }
                        };

                        video.oncanplay = function() {
                            if (poster.classList.contains('opacity-100')) {
                                video.classList.replace('opacity-0', 'opacity-100');
                                poster.classList.replace('opacity-100', 'opacity-0');
                            }
                            forcePlay();
                        };

                        // defer video load until browser is idle so it doesn't block lcp
                        var startLoad = function() { 
                            video.load(); 
                            setTimeout(function() {
                                if (window.requestIdleCallback) {
                                    requestIdleCallback(function() { console.clear(); }, { timeout: 2000 });
                                } else {
                                    console.clear();
                                }
                            }, 1500);
                        };
                        if (window.requestIdleCallback) {
                            requestIdleCallback(startLoad, { timeout: 1500 });
                        } else {
                            setTimeout(startLoad, 200);
                        }

                    } catch (e) { console.error(e); }
                })();
            </script>
        `}}
    />
), () => true);

// isolated webgl ripple canvas prevents hero tree re-renders and eliminates hmr refresh triggers
const HeroRippleCanvas = React.memo(() => {
    const [mounted, setMounted] = useState(false);
    const [poster, setPoster] = useState(HERO_VIDEOS[0].poster);

    useEffect(() => {
        // randomly select one of the featured hero wallpaper posters for the ripple canvas
        const randomVideo = HERO_VIDEOS[Math.floor(Math.random() * HERO_VIDEOS.length)];
        if (randomVideo?.poster) {
            setPoster(randomVideo.poster);
        }

        // schedule webgl ripple distortion initialization only when browser main thread is idle
        // this guarantees zero blocking on initial page paint and prevents lcp regression
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            const idleId = (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(() => {
                setMounted(true);
            }, { timeout: 2000 });
            return () => {
                if ("cancelIdleCallback" in window) {
                    (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
                }
            };
        } else {
            const timer = setTimeout(() => {
                setMounted(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!mounted) return null;

    return (
        <div 
            className="absolute inset-0 z-[1] overflow-hidden pointer-events-none transition-opacity duration-1000 opacity-100"
        >
            <RippleDistortion
                src={poster}
                brushSize={140}
                strength={0.22}
                swirl={0.8}
                rings={3}
                spread={4}
                fade={2.6}
                dispersion={0.02}
                glint={0.25}
                tint="#00d8ff"
                tintAmount={0.03}
                grayscale={false}
                trigger="both"
                quality="medium"
                className="w-full h-full object-cover"
            />
        </div>
    );
});
HeroRippleCanvas.displayName = "HeroRippleCanvas";

export const HeroSection = () => {
    const ambient = useAmbient();

    // handler for launching the 3d webgl gallery scene while initiating ambient audio
    const handleLaunchGallery = () => {
        ambient.forcePlay();
        const url = new URL(window.location.href);
        url.searchParams.set("gallery", "true");
        window.history.pushState({}, "", url.pathname + url.search);
        window.dispatchEvent(new Event("popstate"));
    };

    // handler for launching the standalone cinematic wallpaper mode
    const handleLaunchCinematic = () => {
        ambient.forcePlay();
        const url = new URL(window.location.href);
        url.searchParams.set("cinematic", "true");
        window.history.pushState({}, "", url.pathname + url.search);
        window.dispatchEvent(new Event("popstate"));
    };

    return (
        <section
            className="min-h-screen flex flex-col justify-between relative overflow-hidden px-6 sm:px-10 md:px-14 lg:px-20 pt-24 sm:pt-28 pb-10 sm:pb-14 bg-black text-white select-none"
        >
            {/* dynamic video background with fallback poster */}
            <HeroBackground />

            {/* interactive webgl ripple distortion backdrop isolated in memoized leaf component */}
            <HeroRippleCanvas />

            {/* subtle cinematic vignette overlay for optimal typography contrast */}
            <div 
                aria-hidden="true" 
                className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-black/90 via-black/35 to-black/20" 
            />

            {/* top row: ambient sound status indicator and quick actions */}
            <div className="relative z-10 w-full flex items-center justify-between pt-2">
                {/* sleek brand mark */}
                <div className="flex items-center">
                    <Image
                        src="/LxColorWall.webp"
                        alt="ColorWall Logo"
                        width={256}
                        height={96}
                        className="w-36 sm:w-44 md:w-52 h-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
                        priority
                        fetchPriority="high"
                    />
                </div>

                {/* ambient player replacing the static sound button */}
                <div className="flex items-center">
                    <AmbientPlayer theme="dark" />
                </div>
            </div>

            {/* main lower-quadrant typography headline */}
            <div className="relative z-10 w-full max-w-6xl my-auto pt-16 sm:pt-20 pb-8">
                {/* category tag / engine eyebrow */}
                {/* <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase text-cyan-300/90 font-medium">
                        Next-Gen Desktop Engine
                    </span>
                </div> */}

                {/* massive editorial headline */}
                <h1 
                    className={`text-white text-left ${outfit.className} uppercase tracking-[-0.04em] leading-[0.94] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}
                    style={{ 
                        fontWeight: 300, 
                        fontSize: "clamp(2.4rem, 6.2vw, 5.75rem)", 
                    }}
                >
                    THE DESKTOP CUSTOMIZATION
                    <br />
                    <span className="text-white/90 font-[200]">YOU DESERVE.</span>
                </h1>

                {/* dynamic typewriter statement */}
                <div className="mt-4 sm:mt-6 max-w-2xl text-left">
                    <HeroTypewriter />
                </div>
            </div>

            {/* bottom area: two-column layout and absolute centered scroll prompt */}
            <div className="relative z-10 w-full flex flex-col lg:flex-row justify-between items-start pt-6 border-t border-white/10 gap-8">
                {/* Left Column: Information Cluster */}
                <div className="flex flex-col text-left max-w-xl">
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-sans mb-4">
                        ColorWall Is an upcoming Desktop customization engine with native hardware-accelerated video/shader decoding, audio-reactive, RGB* components support, and Widgets with near-zero resource consumption.
                    </p>
                    
                    <div className="flex flex-col font-mono mb-4">
                        <span className="text-xs sm:text-sm font-bold tracking-wider text-white flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Rust + Tauri
                        </span>
                        <span className="text-[9px] font-medium tracking-wide text-white/60 mt-1">
                            Windows 10/11 · Direct3D11 / MediaFoundation
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleLaunchGallery}
                            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-medium text-cyan-300 hover:text-cyan-200 transition-colors uppercase tracking-wider cursor-pointer"
                        >
                            <span>Cinematic Site</span>
                            <span className="text-sm">→</span>
                        </button>
                        <span className="text-white/30 text-xs">·</span>
                        <button
                            type="button"
                            onClick={handleLaunchCinematic}
                            className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
                        >
                            <span>Cinematic Mode</span>
                            <span className="text-sm">→</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Action Cluster */}
                <div className="flex flex-col items-start lg:items-end w-full lg:w-auto">
                    <HeroInteractive />
                </div>
            </div>

            {/* Scroll indicator centered at bottom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-white/60 z-10">
                <span>SCROLL TO EXPLORE</span>
                <span className="animate-pulse text-white">→</span>
            </div>
        </section>
    );
};

