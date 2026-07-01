"use client";

import React, { useState } from "react";
import { Typewriter } from "react-simple-typewriter";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Monitor, Cpu, Wrench, LoaderCircle } from "lucide-react";
import { GradientHeading } from "./GradientHeading";
import { AmbientPlayer } from "./AmbientPlayer";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500"] });


type HeroVideo = {
    src: string;
    type: string;
    poster: string;
};

const HERO_VIDEOS: HeroVideo[] = [
    { src: "/videos/laxenta.webm", type: "video/webm", poster: "/videos/posters/laxenta.webp" },
    { src: "/videos/Shimoe_Koharu.webm", type: "video/webm", poster: "/videos/posters/Shimoe_Koharu.webp" },
    { src: "/videos/Plana___Arona__Blue_Archive_.webm", type: "video/webm", poster: "/videos/posters/Plana___Arona__Blue_Archive_.webp" },
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
                        var startLoad = function() { video.load(); };
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
    const router = useRouter();
    const [loadingButton, setLoadingButton] = useState<"download" | "discord" | null>(null);

    const handleInternalNavigation = (
        event: React.MouseEvent<HTMLAnchorElement>,
        button: "download",
        href: string
    ) => {
        event.preventDefault();
        setLoadingButton(button);

        // keep the spinner visible for at least one render before route transition
        setTimeout(() => {
            router.push(href);
        }, 120);
    };

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
                <div className="min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center text-xs sm:text-sm md:text-base lg:text-lg font-mono text-white/90 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    <Typewriter
                        words={[
                            "< Your Desktop Called, It wants Personality! >",
                            "< A Wallpaper Engine built for performance and You!>",
                            "< Built in Rust + Tauri · DirectX 11/IMF/MPV/WEB2 · Hardware Accelerated >",
                            "< 8K Video · Workshop/Studio (under work) · Advanced D3D11 Shader Effects >",
                            "< Desktop Widgets · Taskbar Customization · Audio Reactive >",
                            "< 100% Free · No limits, no subscriptions >",
                        ]}
                        loop={0}
                        cursor
                        cursorStyle={
                            <svg 
                                width="0.6em" 
                                height="1em" 
                                viewBox="0 0 12 24" 
                                fill="currentColor" 
                                className="inline-block align-middle ml-1 text-cyan-400/90"
                            >
                                <path d="M10 2 L12 2 L4 22 L2 22 Z" />
                            </svg>
                        }
                        typeSpeed={35}
                        deleteSpeed={15}
                        delaySpeed={5200}
                    />
                </div>

                {/* CTA row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto px-8 sm:px-0 max-w-xs sm:max-w-none mx-auto">
                    {/* download */}
                    <div className="relative group flex sm:inline-flex w-full sm:w-auto rounded-[12px] overflow-hidden p-[2px] hover:-translate-y-0.5 transition-transform duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
                        {/* Spinning Conic Gradient for Edge Glint */}
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#60a5fa_50%,transparent_100%)] opacity-100 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <Link
                            href="/download"
                            onClick={(event) => handleInternalNavigation(event, "download", "/download")}
                            aria-busy={loadingButton === "download" ? "true" : "false"}
                            className="relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-[10px] bg-white text-black font-bold text-xs sm:text-sm tracking-wide w-full"
                        >
                            {loadingButton === "download" ? (
                                <LoaderCircle className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                            Download Now
                            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md ml-0.5 sm:ml-1 bg-black/10 text-black/60">
                                Win 10/11
                            </span>
                        </Link>
                    </div>


                    {/* discord */}
                    <a
                        href="https://discord.gg/QYwhay7r2V"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setLoadingButton("discord")}
                        {...{ "aria-busy": loadingButton === "discord" ? "true" : "false" }}
                        className="flex sm:inline-flex justify-center items-center gap-1.5 sm:gap-2 px-5 py-3 sm:px-7 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 border border-white/20 text-white bg-black/30 hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-300 w-full sm:w-auto"
                    >
                        {loadingButton === "discord" ? (
                            <LoaderCircle className="w-[1em] h-[1em] inline-block text-sm sm:text-base animate-spin" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="w-[1em] h-[1em] inline-block text-sm sm:text-base"><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.276c3.2-4.375,6.233-8.855,9.117-13.435a1.889,1.889,0,0,0-1.026-2.822,331.066,331.066,0,0,1-47.533-22.385,1.884,1.884,0,0,1-.186-3.136,24.71,24.71,0,0,0,3.2-2.527,1.888,1.888,0,0,1,1.979-.315,348.608,348.608,0,0,0,175.762,35.882,348.4,348.4,0,0,0,175.525-35.882,1.884,1.884,0,0,1,1.979.315,22.065,22.065,0,0,0,3.242,2.566,1.887,1.887,0,0,1-.144,3.136,335.8,335.8,0,0,1-47.6,22.385,1.885,1.885,0,0,0-1.026,2.822c2.884,4.58,5.918,9.06,9.117,13.435a1.882,1.882,0,0,0,2.063.276A486.291,486.291,0,0,0,611.43,405.729a1.882,1.882,0,0,0,.765-1.354C624.4,269.175,584.288,159.224,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"/></svg>
                        )}
                        Discord
                    </a>
                </div>

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

