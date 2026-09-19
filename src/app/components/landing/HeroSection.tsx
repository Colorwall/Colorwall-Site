"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Monitor, Cpu, Wrench } from "lucide-react";
import { Outfit } from "next/font/google";
import { HeroInteractive } from "./HeroInteractive";
import { HeroTypewriter } from "./HeroTypewriter";

import RippleDistortion from "../ui/sexyripples";

const outfit = Outfit({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500"] });


export type HeroVideo = {
    src: string;
    type: string;
    poster: string;
};

const DEFAULT_HERO_VIDEOS: HeroVideo[] = [
    { src: "/videos/laxenta.webm", type: "video/webm", poster: "/videos/posters/laxenta.webp" },
    { src: "/videos/Ajitani_Hifumi_Train_Ride_Blue_Archive_Live_Wallpaper.webm", type: "video/webm", poster: "/videos/posters/Ajitani_Hifumi_Train_Ride_Blue_Archive_Live_Wallpaper.webp" },
    { src: "/videos/Anime_Angel_Girl_and_Astronaut_in_Space_Live_Wallpaper.webm", type: "video/webm", poster: "/videos/posters/Anime_Angel_Girl_and_Astronaut_in_Space_Live_Wallpaper.webp" },
    { src: "/videos/Autumn_Leaves_And_Water_Reflection_Live_Wallpaper.webm", type: "video/webm", poster: "/videos/posters/Autumn_Leaves_And_Water_Reflection_Live_Wallpaper.webp" },
    // { src: "/videos/background.webm", type: "video/webm", poster: "/videos/posters/background.webp" },
    { src: "/videos/Download_Misty_Valley_Live_Wallpaper_live_wallpaper__4K_HD_.webm", type: "video/webm", poster: "/videos/posters/Download_Misty_Valley_Live_Wallpaper_live_wallpaper__4K_HD_.webp" },
    { src: "/videos/initialstwo.webm", type: "video/webm", poster: "/videos/posters/initialstwo.webp" },
    { src: "/videos/Prana_System_Error.webm", type: "video/webm", poster: "/videos/posters/Prana_System_Error.webp" },
];

const VideoLayer = ({ video, isActive, isNext, isPrev, isStruggling }: { video: HeroVideo, isActive: boolean, isNext: boolean, isPrev: boolean, isStruggling: boolean }) => {
    const isVideoType = video.type.startsWith("video/");
    const [isVideoReady, setIsVideoReady] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // handle cached videos where onCanPlay might not fire
    useEffect(() => {
        if (isVideoType && videoRef.current && videoRef.current.readyState >= 3) {
            setIsVideoReady(true);
        }
    }, [isVideoType]);

    useEffect(() => {
        if (!isVideoType) return;
        
        if (isActive && videoRef.current && isVideoReady) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.error("Autoplay blocked:", e));
            }
        } else if (!isActive && videoRef.current) {
            // pause the video after it finishes fading out to save CPU
            const timeout = setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.pause();
                }
            }, 2500);
            return () => clearTimeout(timeout);
        }
    }, [isActive, isVideoReady, isVideoType]);

    return (
        <div className={`absolute inset-0 transition-opacity ease-in-out ${isActive || isPrev ? 'opacity-100' : 'opacity-0'} ${isActive ? 'z-10' : 'z-0'} duration-[1000ms]`}>
            <img 
                src={video.poster} 
                alt="Background Poster" 
                className={`object-cover absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${(isVideoReady && !isStruggling && isVideoType) ? 'opacity-0' : 'opacity-100'}`} 
            />
            {!isStruggling && isVideoType && (
                <video 
                    ref={videoRef}
                    src={video.src} 
                    muted 
                    loop 
                    playsInline 
                    preload={isActive || isNext ? "auto" : "none"}
                    onCanPlay={() => setIsVideoReady(true)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isVideoReady ? 'opacity-100' : 'opacity-0'}`} 
                />
            )}
        </div>
    );
};

const HeroBackground = React.memo(({ videos = DEFAULT_HERO_VIDEOS }: { videos?: HeroVideo[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStruggling, setIsStruggling] = useState(false);

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        // @ts-ignore
        const saveData = navigator.connection?.saveData === true;
        
        // fallback to a poster slideshow if the device is struggling, is mobile, or prefers reduced motion
        if (reducedMotion || saveData || isMobile) {
            setIsStruggling(true);
        }

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % videos.length);
        }, 5000); // crossfade every 5 seconds

        return () => clearInterval(interval);
    }, [videos.length]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
            {videos.map((video, index) => {
                const isActive = index === currentIndex;
                const isNext = index === (currentIndex + 1) % videos.length;
                const isPrev = index === (currentIndex - 1 + videos.length) % videos.length;
                
                // only mount the active, next, and previous videos to save massive memory
                // always mount index 0 to ensure flawless SSR hydration matching
                const isRendered = isActive || isNext || isPrev || index === 0;

                if (!isRendered) return null;

                return (
                    <VideoLayer 
                        key={video.src}
                        video={video}
                        isActive={isActive}
                        isNext={isNext}
                        isPrev={isPrev}
                        isStruggling={isStruggling}
                    />
                );
            })}
        </div>
    );
}, (prevProps, nextProps) => true);

// isolated webgl ripple canvas prevents hero tree re-renders and eliminates hmr refresh triggers
const HeroRippleCanvas = React.memo(({ videos = DEFAULT_HERO_VIDEOS }: { videos?: HeroVideo[] }) => {
    const [mounted, setMounted] = useState(false);
    const [poster, setPoster] = useState(videos[0]?.poster || DEFAULT_HERO_VIDEOS[0].poster);

    useEffect(() => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) return; // do not mount heavy webgl on mobile

        // randomly select one of the featured hero wallpaper posters for the ripple canvas
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
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

export const HeroSection = ({ videos = DEFAULT_HERO_VIDEOS }: { videos?: HeroVideo[] }) => {

    // handler for launching the 3d webgl gallery scene while initiating ambient audio
    const handleLaunchGallery = () => {
        const url = new URL(window.location.href);
        url.searchParams.set("gallery", "true");
        window.history.pushState({}, "", url.pathname + url.search);
        window.dispatchEvent(new Event("popstate"));
    };

    // handler for launching the standalone cinematic wallpaper mode
    const handleLaunchCinematic = () => {
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
            <HeroBackground videos={videos} />

            {/* interactive webgl ripple distortion backdrop isolated in memoized leaf component */}
            <HeroRippleCanvas videos={videos} />

            {/* subtle cinematic vignette overlay for optimal typography contrast */}
            <div 
                aria-hidden="true" 
                className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-black/90 via-black/35 to-black/20" 
            />

            {/* top row: quick actions */}
            <div className="relative z-10 w-full flex items-center justify-end pt-2">
            </div>

            {/* main lower-quadrant typography headline */}
            <div className="relative z-10 w-full max-w-6xl my-auto pt-16 sm:pt-20 pb-8">
                {/* sleek brand mark */}
                <div className="flex items-center mb-6 sm:mb-8 ml-0">
                    <Image
                        src="/LxColorWall.webp"
                        alt="ColorWall Logo"
                        width={300}
                        height={112}
                        className="w-48 sm:w-64 md:w-72 h-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
                        priority
                        fetchPriority="high"
                    />
                </div>

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
                        ColorWall isn't just another wallpaper engine. It's a ridiculously optimized desktop customization suite featuring native hardware-accelerated video and shader decoding. Unleash audio-reactive effects, RGB component support, and dynamic widgets—all while sipping near-zero system resources.
                    </p>
                    
                    <div className="flex flex-row flex-wrap items-center font-mono mb-4 gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm font-bold tracking-wider text-white flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Rust + Tauri
                        </span>
                        <span className="text-white/30 text-[10px] hidden sm:block">·</span>
                        <span className="text-[9px] sm:text-[10px] font-medium tracking-wide text-white/60">
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

