"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, FileText, MessageCircle, Monitor, Cpu, Github } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import { ScrollArrow } from "./ScrollArrow";

export const HeroSection = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* video bg — no blur */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={`w-full h-full object-cover ${theme === "dark" ? "opacity-65" : "opacity-90"}`}
                >
                    <source src="/videos/myCutekoiiii.webm" type="video/webm" />
                </video>
                {/* subtle gradient fade at edges */}
                <div className={`absolute inset-0 ${theme === "dark"
                    ? "bg-gradient-to-b from-black/60 via-transparent to-black"
                    : "bg-gradient-to-b from-white/30 via-transparent to-white/80"}`}
                />
            </div>

            <div className="relative z-10 text-center flex flex-col items-center space-y-8 max-w-5xl">
                {/* logo — static, small, no fill nonsense */}
                <Image
                    src="/LxColorWall.png"
                    alt="ColorWall"
                    width={800}
                    height={300}
                    className="w-[220px] sm:w-[320px] md:w-[450px] h-auto object-contain drop-shadow-2xl"
                    priority
                />

                <h2 className={`text-sm sm:text-base font-mono font-medium tracking-widest uppercase opacity-60 mb-1
                    ${theme === "dark" ? "text-white" : "text-black"}`}>
                    Live Wallpaper <span className="text-blue-500">&</span> Desktop Customization Engine
                </h2>

                {/* typewriter */}
                <div className={`text-sm sm:text-lg md:text-xl font-mono ${theme === "dark" ? "text-white/50" : "text-black/50"}`}>
                    <Typewriter
                        words={[
                            "< An community driven Alternative to Wallpaper Engine />",
                            "< Made in Rust-tauri; A 5mb App, Beat us to it. />",
                            "< Insane Performance, Less GPU usage, hardware decoded />",
                            "< multiple wallpaper sources, one unified store, free forever />",
                            "< Tired of paying just to get animated desktop wallpapers? Same. />",
                        ]}
                        loop={0}
                        cursor
                        cursorStyle="_"
                        typeSpeed={45}
                        deleteSpeed={25}
                        delaySpeed={2200}
                    />
                </div>

                {/* cta row */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    {/* download */}
                    <Link
                        href="/download"
                        className={`group inline-flex items-center gap-3 px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "bg-white text-black hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
                                : "bg-black text-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"}`}
                    >
                        <Download size={18} />
                        Download for Windows
                        <span className={`text-xs px-2 py-0.5 rounded-md ml-1
                            ${theme === "dark" ? "bg-black/10 text-black/60" : "bg-white/10 text-white/60"}`}>
                            Win 10/11
                        </span>
                    </Link>

                    {/* changelog */}
                    <Link
                        href="/changelog"
                        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "border border-white/15 text-white/70 hover:border-white/30 hover:bg-white/5 hover:text-white"
                                : "border border-black/15 text-black/60 hover:border-black/30 hover:bg-black/5 hover:text-black"}`}
                    >
                        <FileText size={16} />
                        Changelog
                    </Link>

                    {/* discord support */}
                    <a
                        href="https://discord.gg/QYwhay7r2V"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "border border-white/15 text-white/70 hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-300"
                                : "border border-black/15 text-black/60 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-600"}`}
                    >
                        <MessageCircle size={16} />
                        Discord
                    </a>
                </div>

                {/* platform tags */}
                <div className={`flex items-center gap-3 text-xs font-mono pt-2
                    ${theme === "dark" ? "text-white/30" : "text-black/30"}`}
                >
                    <span className="flex items-center gap-1.5"><Cpu size={12} /> Rust + Tauri</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Monitor size={12} /> Windows 10/11</span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5"><Github size={12} /> AGPL-3</span>
                </div>
            </div>

            <ScrollArrow theme={theme} />
        </section>
    );
};