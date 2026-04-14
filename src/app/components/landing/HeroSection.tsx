"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import Image from "next/image";
import Link from "next/link";
import { Download, FileText, MessageCircle, Monitor, Cpu, Wrench } from "lucide-react";
import { ScrollArrow } from "./ScrollArrow";

export const HeroSection = ({ theme }: { theme?: "dark" | "light" }) => {
    const { scrollYProgress } = useScroll();
    const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

    const [bgVideo, setBgVideo] = useState({ src: "/videos/myCutekoiiii.webm", type: "video/webm" });

    useEffect(() => {
        const r = Math.random();
        if (r < 0.3) {
            setBgVideo({ src: "/wallpaper_1775826051.webm", type: "video/webm" });
        } else if (r < 0.6) {
            setBgVideo({ src: "/Shimoe_Koharu_-_Blue_Archive.webm", type: "video/webm" });
        }
        // otherwise it stays as the default we initialized with
    }, []);

    return (
        <motion.section
            style={{ scale: heroScale }}
            className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-black text-white"
        >
            {/* video bg */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <video
                    key={bgVideo.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    // @ts-expect-error React types don't officially support fetchPriority natively on video elements yet in this TS version
                    fetchPriority="high"
                    className="w-full h-full object-cover opacity-65"
                >
                    <source src={bgVideo.src} type={bgVideo.type} />
                </video>

                {/* Removed fallback gradient fade at edges as requested */}
            </div>

            <div className="relative z-10 text-center flex flex-col items-center space-y-6 sm:space-y-8 md:space-y-10 max-w-4xl xl:max-w-5xl">
                {/* logo */}
                <div className="relative w-full flex justify-center items-center">
                    <Image
                        src="/LxColorWall.webp"
                        alt="ColorWall"
                        width={512}
                        height={192}
                        className="w-64 sm:w-80 md:w-96 lg:w-[448px] xl:w-[512px] h-auto object-contain drop-shadow-2xl"
                        style={{ height: 'auto' }}
                        priority
                        fetchPriority="high"
                    />
                </div>

                <h2 className="text-xs sm:text-sm md:text-base font-mono font-semibold tracking-widest uppercase opacity-90 mb-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    Live Wallpaper <span className="text-blue-500">&</span> Desktop Customization Engine
                </h2>

                {/* typewriter */}
                <div className="text-xs sm:text-sm md:text-base lg:text-lg font-mono text-white/90 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    <Typewriter
                        words={[
                            "< The desktop customization engine you deserved />",
                            "< Built in Rust + Tauri · Workshop/8k/Local/Shader Support · Multiple Renderers />",
                            "< 8K Vsync · Hardware accelerated DirectX 3D 11 · Minimal GPU even on the highest workloads />",
                            "< 10+ Wallpaper sources · One unified store · Inbuild Shader configuarations (in dev) />",
                            "< We made something beautiful, people will complain & compare idc, but we will keep improving. />",
                        ]}
                        loop={0}
                        cursor
                        cursorStyle="_"
                        typeSpeed={45}
                        deleteSpeed={25}
                        delaySpeed={2200}
                    />
                </div>

                {/* CTA row */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                    {/* download */}
                    <Link
                        href="/download"
                        className="group inline-flex items-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 bg-white text-black hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
                    >
                        <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                        Download Now
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-md ml-0.5 sm:ml-1 bg-black/10 text-black/60">
                            Win 10/11
                        </span>
                    </Link>

                    {/* changelog */}
                    <Link
                        href="/changelog"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-5 py-3 sm:px-7 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 border border-white/20 text-white bg-black/30 hover:border-white/40 hover:bg-black/50"
                    >
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Changelog
                    </Link>

                    {/* discord */}
                    <a
                        href="https://discord.gg/cHVwPkBC7p"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-5 py-3 sm:px-7 sm:py-4 rounded-xl font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 border border-white/20 text-white bg-black/30 hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="w-[1em] h-[1em] inline-block text-sm sm:text-base"><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.276c3.2-4.375,6.233-8.855,9.117-13.435a1.889,1.889,0,0,0-1.026-2.822,331.066,331.066,0,0,1-47.533-22.385,1.884,1.884,0,0,1-.186-3.136,24.71,24.71,0,0,0,3.2-2.527,1.888,1.888,0,0,1,1.979-.315,348.608,348.608,0,0,0,175.762,35.882,348.4,348.4,0,0,0,175.525-35.882,1.884,1.884,0,0,1,1.979.315,22.065,22.065,0,0,0,3.242,2.566,1.887,1.887,0,0,1-.144,3.136,335.8,335.8,0,0,1-47.6,22.385,1.885,1.885,0,0,0-1.026,2.822c2.884,4.58,5.918,9.06,9.117,13.435a1.882,1.882,0,0,0,2.063.276A486.291,486.291,0,0,0,611.43,405.729a1.882,1.882,0,0,0,.765-1.354C624.4,269.175,584.288,159.224,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"/></svg>
                        Discord
                    </a>
                </div>

                {/* platform tags */}
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono pt-2 text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <span className="flex items-center gap-1 sm:gap-1.5"><Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Rust + Tauri</span>
                    <span className="opacity-50">·</span>
                    <span className="flex items-center gap-1 sm:gap-1.5"><Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Windows 10/11</span>
                    <span className="opacity-50">·</span>
                    <span className="flex items-center gap-1 sm:gap-1.5"><Wrench className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Under Development</span>
                </div>
            </div>

            <ScrollArrow theme="dark" />
        </motion.section>
    );
};

