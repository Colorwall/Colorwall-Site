"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Footer } from "@/app/components/Footer";
import { 
    ExternalLink, 
    Cpu, 
    Monitor, 
    ShieldCheck, 
    Terminal, 
    Compass, 
    Code2, 
    Bot,
    ArrowRight
} from "lucide-react";

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // base styling tokens ensuring consistent contrast and borders across themes
    const textBase = isDark ? "text-white/80" : "text-[#1a1a24]";
    const textMuted = isDark ? "text-white/50" : "text-[#4b5563]";
    const borderSubtle = isDark ? "border-white/10" : "border-[#e5e7eb]";
    const bgSubtle = isDark ? "bg-white/[0.02]" : "bg-[#f9fafb]";
    
    // vibrant accent tokens inspired by stripe aesthetic for controlled pops of color
    const iconWrapper = isDark ? "bg-indigo-500/15 text-indigo-400" : "bg-indigo-50 text-indigo-600";
    const primaryBtn = "bg-[#635BFF] hover:bg-[#4B44D4] text-white"; // stripe-like purple/blue

    return (
        <div className={`min-h-screen select-none ${isDark ? "bg-[#0a0a0f] text-white" : "bg-white text-black"}`}>
            
            {/* main page container with expansive typography */}
            <main className="max-w-5xl mx-auto px-6 pt-32 pb-24 space-y-24">
                
                {/* hero section */}
                <section className="max-w-3xl">
                    <h1 className="text-5xl md:text-6xl font-outfit font-[200] tracking-tight leading-[1.1] mb-6">
                        Building the ultimate <br />
                        <span className="font-[400] text-[#635BFF]">desktop customization</span> engine.
                    </h1>
                    <p className={`text-lg md:text-xl font-outfit font-[300] leading-relaxed mb-8 ${textMuted}`}>
                        ColorWall is a blazingly fast, native spatial compositor for Windows 10 and 11. 
                        It renders 8K live wallpapers, audio-reactive shaders, and interactive web scenes directly on your desktop, all while consuming near-zero system resources.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/download"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors ${primaryBtn}`}
                        >
                            Download ColorWall <ArrowRight className="w-4 h-4" />
                        </Link>
                        {/* <a
                            href="https://github.com/Colorwall/Colorwall"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors border ${borderSubtle} hover:bg-black/5 dark:hover:bg-white/5`}
                        >
                            View Source Code
                        </a> */}
                    </div>
                </section>

                {/* stripe-style architecture grid */}
                <section className={`pt-16 border-t ${borderSubtle}`}>
                    <h2 className="text-3xl font-outfit font-[300] tracking-tight mb-12">
                        Architected for absolute performance.
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                        {/* feature block 1 */}
                        <div>
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-5 ${iconWrapper}`}>
                                <Cpu className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-base mb-2">Rust & Tauri Core</h3>
                            <p className={`text-sm leading-[1.6] ${textMuted}`}>
                                engineered with low-level rust bindings. deeply integrated with win32 apis to achieve hardware-accelerated video decoding and idle cpu usage under 0.1%.
                            </p>
                        </div>
                        {/* feature block 2 */}
                        <div>
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-5 ${iconWrapper}`}>
                                <Monitor className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-base mb-2">Multi-Monitor Mastery</h3>
                            <p className={`text-sm leading-[1.6] ${textMuted}`}>
                                seamlessly spans ultra-wide, vertical, and dual-monitor displays with dynamic aspect ratio scaling and per-display distinct wallpaper assignment.
                            </p>
                        </div>
                        {/* feature block 3 */}
                        <div>
                            <div className={`w-10 h-10 rounded-md flex items-center justify-center mb-5 ${iconWrapper}`}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-base mb-2">Zero Telemetry</h3>
                            <p className={`text-sm leading-[1.6] ${textMuted}`}>
                                completely open source with no background tracking, no analytics, and no mandatory cloud connectivity. runs completely offline.
                            </p>
                        </div>
                    </div>
                </section>

                {/* the team / developer section with github integration */}
                <section className={`pt-16 border-t ${borderSubtle}`}>
                    <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-outfit font-[300] tracking-tight mb-6">
                                The Developer
                            </h2>
                            <p className={`text-base leading-[1.7] mb-6 ${textBase}`}>
                                ColorWall is developed entirely by Oliver Laxenta (@LaxentaInc), a 19-year-old solo developer and student currently studying for law enforcement. What started as a hobbyist endeavor to build a better wallpaper engine has grown into a highly optimized, fully-featured desktop customization suite.
                            </p>
                            <p className={`text-base leading-[1.7] mb-8 ${textBase}`}>
                                The ecosystem now spans across Rust, TypeScript, React, and native C++ integrations, proving that modern web technologies paired with systems programming can yield incredible performance.
                            </p>
                            <a
                                href="https://patron.colorwall.xyz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border ${borderSubtle} hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30`}
                            >
                                Support development on Patreon
                            </a>
                        </div>
                        
                        {/* github profile visual card */}
                        <div className={`p-6 rounded-2xl border ${borderSubtle} ${bgSubtle} w-full max-w-sm shrink-0 flex flex-col items-center text-center`}>
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-indigo-500/20">
                                <Image 
                                    src="https://github.com/LaxentaInc.png" 
                                    alt="Oliver Laxenta GitHub Avatar" 
                                    width={96} 
                                    height={96}
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="font-semibold text-lg">Oliver Laxenta</h3>
                            <p className={`text-sm font-mono mt-1 ${textMuted}`}>@LaxentaInc</p>
                            <p className={`text-sm mt-4 leading-relaxed ${textMuted}`}>
                                "Competition, huh? All I see is MEE!"
                            </p>
                            <div className="flex items-center gap-4 mt-6">
                                <a href="https://github.com/LaxentaInc" target="_blank" rel="noopener noreferrer" className={`text-sm hover:text-[#635BFF] transition-colors ${textBase}`}>
                                    GitHub
                                </a>
                                <a href="https://discord.gg/QYwhay7r2V" target="_blank" rel="noopener noreferrer" className={`text-sm hover:text-[#635BFF] transition-colors ${textBase}`}>
                                    Discord
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* expansive open source ecosystem list */}
                <section className={`pt-16 border-t ${borderSubtle}`}>
                    <h2 className="text-3xl font-outfit font-[300] tracking-tight mb-8">
                        The broader ecosystem.
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                title: "Colorwall Linux",
                                status: "Active Dev",
                                icon: Terminal,
                                desc: "the upcoming open-source wallpaper engine tailored specifically for linux. zero copy rendering and fully native.",
                                href: "https://github.com/Colorwall/WallpaperEngine-Linux"
                            },
                            {
                                title: "ArchiveWalls",
                                status: "Upcoming",
                                icon: Compass,
                                desc: "browser new tab extension featuring live wallpapers, customizable widgets, and focus music integration.",
                                href: "https://github.com/LaxentaInc/ArchiveWalls"
                            },
                            {
                                title: "MTS Migrator",
                                status: "NPM Package",
                                icon: Code2,
                                desc: "cli utility to instantly migrate legacy javascript codebases to typescript with intelligent ast parsing.",
                                href: "https://github.com/LaxentaInc/Magikk-Typescript-Migrator"
                            },
                            {
                                title: "Aero-Chan",
                                status: "Public Bot",
                                icon: Bot,
                                desc: "powerful anti-raid, moderation, and music tooling infrastructure for discord communities built in typescript.",
                                href: "https://github.com/LaxentaInc/Aero-Chan"
                            }
                        ].map((proj) => (
                            <a
                                key={proj.title}
                                href={proj.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group p-6 rounded-xl border ${borderSubtle} ${bgSubtle} hover:border-[#635BFF]/30 hover:bg-[#635BFF]/5 transition-all flex flex-col justify-between`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center ${iconWrapper} group-hover:bg-[#635BFF] group-hover:text-white transition-colors`}>
                                            <proj.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex items-center justify-between flex-1">
                                            <span className="font-semibold text-sm">{proj.title}</span>
                                            <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded border ${borderSubtle} ${textMuted}`}>
                                                {proj.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className={`text-sm leading-relaxed ${textMuted}`}>
                                        {proj.desc}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

            </main>

            <Footer theme={theme} />
        </div>
    );
}