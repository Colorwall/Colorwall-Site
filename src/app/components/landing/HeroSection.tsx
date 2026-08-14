import React from "react";
import Image from "next/image";
import { Monitor, Cpu, Wrench } from "lucide-react";
import { AmbientPlayer } from "./AmbientPlayer";
import { Outfit } from "next/font/google";
import { HeroInteractive } from "./HeroInteractive";
import { HeroTypewriter } from "./HeroTypewriter";
import { useAmbient } from "@/app/contexts/AmbientContext";

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

            {/* subtle cinematic vignette overlay for optimal typography contrast */}
            <div 
                aria-hidden="true" 
                className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-black/90 via-black/35 to-black/20" 
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
                <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase text-cyan-300/90 font-medium">
                        Next-Gen Desktop Engine
                    </span>
                </div>

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

            {/* bottom grid bar: tech badge, editorial story block, and action triggers */}
            <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-end pt-6 border-t border-white/10">
                {/* left: tech spec badge */}
                <div className="lg:col-span-3 flex items-center">
                    <div className="flex flex-col text-left font-mono">
                        <span className="text-xs sm:text-sm font-bold tracking-wider text-white flex items-center gap-1.5 mt-1">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Rust + Tauri
                        </span>
                        <span className="text-[9px] font-medium tracking-wide text-white/60 mt-0.5">
                            Windows 10/11 · Direct3D11 / MediaFoundation
                        </span>
                    </div>
                </div>

                {/* center: editorial story block */}
                <div className="lg:col-span-5 flex flex-col justify-center text-left">
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-sans max-w-lg">
                        ColorWall Is an upcoming Desktop customization engine with native hardware-accelerated video/shader decoding, audio-reactive, RGB* components support, and Widgets with near-zero resource consumption.
                    </p>
                    {/* quick experience launchers */}
                    <div className="flex items-center gap-3 mt-3">
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

                {/* right: interactive buttons & scroll indicator */}
                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4">
                    <HeroInteractive />

                    <div className="hidden lg:flex items-center gap-2 text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.2em] uppercase text-white/60 mt-1">
                        <span>SCROLL TO EXPLORE</span>
                        <span className="animate-pulse text-white">→</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

