"use client";

import { useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import Image from "next/image";
import Link from "next/link";
import { Download, FileText, MessageCircle, Monitor, Cpu, Github } from "lucide-react";
import { ScrollArrow } from "./ScrollArrow";

export const HeroSection = ({ theme }: { theme?: "dark" | "light" }) => {
    const { scrollYProgress } = useScroll();
    const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.95]);

    /* randomly select a bg video each page load — ~30% each new webm, else the default webm */
    const bgVideo = useMemo(() => {
        const r = Math.random();
        if (r < 0.3) return { src: "/wallpaper_1775826051.webm", type: "video/webm" };
        if (r < 0.6) return { src: "/Shimoe_Koharu_-_Blue_Archive.webm", type: "video/webm" };
        return { src: "/videos/myCutekoiiii.webm", type: "video/webm" };
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
                        src="/LxColorWall.png"
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
                            "< Built in Rust + Tauri · ~5MB · Near-zero overhead />",
                            "< 4K 60fps · Hardware decoded · Lower GPU than alternatives />",
                            "< 8 wallpaper sources · One unified store · No account needed />",
                            "< Your desktop should feel alive. Now it can. />",
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
                        <i className="fa-brands fa-discord text-sm sm:text-base"></i>
                        Discord
                    </a>
                </div>

                {/* platform tags */}
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono pt-2 text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    <span className="flex items-center gap-1 sm:gap-1.5"><Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Rust + Tauri</span>
                    <span className="opacity-50">·</span>
                    <span className="flex items-center gap-1 sm:gap-1.5"><Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Windows 10/11</span>
                    <span className="opacity-50">·</span>
                    <span className="flex items-center gap-1 sm:gap-1.5"><Github className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> AGPL-3</span>
                </div>
            </div>

            <ScrollArrow theme="dark" />
        </motion.section>
    );
};

