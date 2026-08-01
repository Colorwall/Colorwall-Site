"use client";

import Link from "next/link";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Footer } from "@/app/components/Footer";
import { Sparkles, Cpu, Monitor, ShieldCheck, Heart, Download, Github, ArrowRight } from "lucide-react";

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const features = [
        {
            icon: Cpu,
            title: "Rust & Tauri Core",
            description: "engineered with low-level rust bindings to deliver minimal memory footprint and near-zero idle cpu utilization on windows."
        },
        {
            icon: Monitor,
            title: "Multi-Monitor Support",
            description: "seamlessly spans ultra-wide, vertical, and dual-monitor displays with dynamic aspect ratio scaling and per-display wallpaper assignment."
        },
        {
            icon: ShieldCheck,
            title: "Privacy First Architecture",
            description: "fully open source with zero background telemetry, offline-capable playback, and complete transparency."
        },
        {
            icon: Heart,
            title: "Community Driven",
            description: "built for creators, modders, and enthusiasts who demand modern aesthetic controls without subscription paywalls."
        }
    ];

    return (
        <div className={`min-h-screen select-none ${isDark ? "bg-black text-white" : "bg-white text-black"} transition-colors duration-300`}>
            {/* background gradient accent glow */}
            <div className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto overflow-hidden">
                <div 
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[140px] rounded-full pointer-events-none" 
                    aria-hidden="true" 
                />

                {/* hero section banner */}
                <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-mono tracking-wider uppercase">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>The Story Behind ColorWall</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-outfit font-extralight tracking-tight leading-[1.08]">
                        Desktop Customization, <br />
                        <span className="font-semibold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                            Reimagined Without Bloat.
                        </span>
                    </h1>

                    <p className={`text-base md:text-lg leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>
                        ColorWall was born out of frustration with resource-heavy wallpaper engines that hog RAM and run intrusive processes. We set out to create a modern, blazingly fast, and gorgeous live wallpaper engine for Windows 10 and 11.
                    </p>

                    {/* dual call-to-action buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link
                            href="/?cinematic=true"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm tracking-wide shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Launch Cinematic Experience</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>

                        <Link
                            href="/download"
                            className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm tracking-wide border transition-all duration-300 hover:-translate-y-0.5 ${
                                isDark 
                                    ? "border-white/20 bg-white/5 hover:bg-white/10 text-white" 
                                    : "border-black/20 bg-black/5 hover:bg-black/10 text-black"
                            }`}
                        >
                            <Download className="w-4 h-4" />
                            <span>Download ColorWall</span>
                        </Link>
                    </div>
                </div>

                {/* pillars grid */}
                <div className="relative z-10 mt-24 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((item, index) => (
                        <div
                            key={index}
                            className={`p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                                isDark
                                    ? "bg-[#0d0d0d]/80 border-white/10 hover:border-purple-500/40"
                                    : "bg-gray-50 border-black/10 hover:border-purple-500/40"
                            }`}
                        >
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 text-purple-400">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-black/60"}`}>
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* open source callout section */}
                <div className={`mt-20 p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden ${
                    isDark ? "bg-gradient-to-b from-[#121216] to-[#0a0a0d] border-white/10" : "bg-gradient-to-b from-purple-50/50 to-indigo-50/50 border-black/10"
                }`}>
                    <div className="max-w-2xl mx-auto space-y-4">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Built for Creators & Open Source
                        </h2>
                        <p className={`text-sm md:text-base leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>
                            ColorWall is completely transparent and free to use. Explore the source code on GitHub, submit feature requests, or contribute custom web and shader wallpaper templates.
                        </p>
                        <div className="pt-2 flex justify-center">
                            <a
                                href="https://github.com/colorwall/colorwall"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 font-medium text-sm transition-all"
                            >
                                <Github className="w-4 h-4" />
                                <span>Star on GitHub</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* footer */}
            <Footer theme={theme} />
        </div>
    );
}