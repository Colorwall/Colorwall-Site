import React from "react";
import Image from "next/image";
import { Monitor, Cpu, Wrench } from "lucide-react";
import { AmbientPlayer } from "./AmbientPlayer";
import { Outfit } from "next/font/google";
import { HeroInteractive } from "./HeroInteractive";
import { HeroTypewriter } from "./HeroTypewriter";

const outfit = Outfit({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500"] });


type HeroVideo = {
    src: string;
    type: string;
    poster: string;
};

const HERO_VIDEOS: HeroVideo[] = [
    { src: "/videos/laxenta.webm", type: "video/webm", poster: "/videos/posters/laxenta.webp" },
    { src: "/videos/Shimoe_Koharu.webm", type: "video/webm", poster: "/videos/posters/Shimoe_Koharu.webp" },
    { src: "/videos/mycutekoii.webm", type: "video/webm", poster: "/videos/posters/mycutekoii.webp" },
    { src: "/videos/Crimson_Divide_Soul.webm", type: "video/webm", poster: "/videos/posters/Crimson_Divide_Soul.webp" },
    { src: "/videos/Violet_Evergarden_Blue_Glow_Live_Wallpaper_live_wallpaper_video__4K_HD_.mp4", type: "video/mp4", poster: "/videos/posters/Violet_Evergarden_Blue_Glow_Live_Wallpaper_live_wallpaper_video__4K_HD_.webp" },
    { src: "/videos/background.mp4", type: "video/mp4", poster: "/videos/posters/background.webp" },
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
    return (
        <section
            className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-black text-white"
        >
            {/* Preload removed to avoid console warnings about unused preloaded resources. 
               The chosen image is still loaded with priority by the Image component. */}

            <HeroBackground />

            <div className="relative z-10 text-center flex flex-col items-center space-y-6 sm:space-y-8 md:space-y-10 max-w-4xl xl:max-w-5xl">
                {/* logo */}
                <div className="relative w-full flex justify-center items-center">
                    <div
                        aria-hidden="true"
                        className="absolute -z-10 h-24 w-56 sm:h-28 sm:w-72 md:h-32 md:w-80 rounded-full bg-black/70 blur-3xl"
                    />
                    <Image
                        src="/LxColorWall.webp"
                        alt="ColorWall"
                        width={512}
                        height={192}
                        className="w-64 sm:w-80 md:w-96 lg:w-[448px] xl:w-[512px] h-auto object-contain"
                        style={{ height: 'auto' }}
                        priority
                        fetchPriority="high"
                    />
                </div>

                <div className="relative w-full flex flex-col items-center justify-center mt-4 mb-2">
                    <h1 
                        className={`text-white text-center ${outfit.className}`}
                        style={{ 
                            fontWeight: 200, 
                            fontSize: "clamp(1.2rem, 2.5vw, 2.5rem)", 
                            lineHeight: 0.95, 
                            letterSpacing: "-0.04em", 
                            mixBlendMode: "exclusion" 
                        }}
                    >
                        The Ultimate Wallpaper Engine Alternative
                    </h1>
                </div>

                {/* typewriter */}
                <HeroTypewriter />

                {/* CTA row */}
                <HeroInteractive />

                {/* ambient player — inline on homepage */}
                <AmbientPlayer theme="dark" />


                {/* platform tags */}
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono pt-2 text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <span className="flex items-center gap-1 sm:gap-1.5"><Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Rust + Tauri</span>
                    <span className="opacity-50">·</span>
                    <span className="flex items-center gap-1 sm:gap-1.5"><Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Windows 10/11</span>
                    <span className="opacity-50">·</span>
                    <span className="flex items-center gap-1 sm:gap-1.5"><Wrench className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Under Development</span>
                </div>
            </div>
        </section>
    );
};

