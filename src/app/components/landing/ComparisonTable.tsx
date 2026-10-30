"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
    Cpu, 
    Store, 
    Layout, 
    Palette, 
    Wand2, 
    Music,
    ArrowUpRight
} from "lucide-react";
import { BenchmarkShowcase } from "./BenchmarkShowcase";
import { GradientHeading } from "./GradientHeading";

const Antigravity = dynamic(() => import("../ui/Antigravity"), { ssr: false });

export const ComparisonTable = ({ 
    theme, 
    isDownloadPage = false 
}: { 
    theme: "dark" | "light"; 
    isDownloadPage?: boolean;
}) => {
    const isDark = theme === "dark";

    // comparison bento pillars structured with spaceship layout hierarchy
    const bentoCards = [
        {
            title: "Performance First",
            subtitle: "NEAR-ZERO IMPACT",
            desc: "This is not a gimmick. Colorwall actively sits around ~100 MB RAM on idle, with GPU overhead barely registering. Automatically pauses instantly during fullscreen games or battery mode.",
            icon: Cpu,
            badge: "< 1-5% GPU",
            gradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
            colSpan: "lg:col-span-6",
        },
        {
            title: "305,000+ Wallpapers",
            subtitle: "UNIFIED VAULT",
            desc: "Over 305,000 community wallpapers curated from 8+ sources. Native 4K/8K video loops, interactive WebGL canvases, and offline-first library indexing with one click.",
            icon: Store,
            badge: "8 Sources · 4K/8K",
            gradient: "from-purple-500/10 via-indigo-500/5 to-transparent",
            colSpan: "lg:col-span-6",
        },
        {
            title: "Shaders & Particles",
            subtitle: "GPU ACCELERATED",
            desc: "Real-time HLSL compute effects directly injected into wallpapers: chromatic aberration, bloom, rain drops, procedural sway, and optical lens blur.",
            icon: Wand2,
            badge: "HLSL · Compute",
            tag: "UNDER WORK",
            gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
            colSpan: "lg:col-span-4",
        },
        {
            title: "Audio Reactivity",
            subtitle: "WASAPI FFT HOOK",
            desc: "Hardware loopback system audio analysis transforms music and desktop sound into rhythmic pulses across live wallpaper shaders and widgets in real-time.",
            icon: Music,
            badge: "128-Band FFT",
            gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
            colSpan: "lg:col-span-4",
        },
        {
            title: "Desktop Widgets",
            subtitle: "HTML5 & JS PINNED",
            desc: "Pin responsive clocks, system telemetry, and custom web components directly onto the Windows desktop plane with less than 1.2ms input delay.",
            icon: Layout,
            badge: "Direct Plane Hook",
            gradient: "from-cyan-500/10 via-blue-500/5 to-transparent",
            colSpan: "lg:col-span-4",
        },
        {
            title: "Taskbar Styling",
            subtitle: "DWM ACRYLIC INJECTION",
            desc: "Transparent, acrylic blur, or fluid colorway gradients on your Windows taskbar. Operates completely independent of the wallpaper engine with zero CPU consumption.",
            icon: Palette,
            badge: "Independent DWM",
            gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
            colSpan: "lg:col-span-12",
        },
    ];

    return (
        <section className={`${isDownloadPage ? "py-16" : "py-32"} px-4 sm:px-8 relative overflow-hidden bg-transparent`}>
            <div className="max-w-7xl mx-auto relative z-10">

                <div className="relative mb-24 sm:mb-28">
                    {/* expanded antigravity canvas with smooth radial falloff mask */}
                    <div 
                        className="absolute -inset-x-16 -inset-y-20 sm:-inset-x-32 sm:-inset-y-28 lg:-inset-x-48 lg:-inset-y-36 z-0 pointer-events-none opacity-85 mix-blend-screen"
                        style={{
                            maskImage: "radial-gradient(ellipse 68% 60% at 50% 45%, black 25%, transparent 95%)",
                            WebkitMaskImage: "radial-gradient(ellipse 68% 60% at 50% 45%, black 25%, transparent 95%)"
                        }}
                    >
                        <Antigravity 
                            color={isDark ? "#00e5ff" : "#0284c7"} 
                            count={260}
                            particleSize={0.95}
                            waveAmplitude={2.2}
                            autoAnimate={true}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start"
                    >
                        {/* left column: 88px heading with tight tracking */}
                        <div className="lg:col-span-7">
                            {/* <div className="flex items-center gap-2 mb-6">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <p className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-medium">
                                    How we compare?
                                </p>
                            </div> */}

                            <h2 className="text-4xl sm:text-6xl md:text-7xl py-3 font-outfit font-[200] tracking-[-0.04em] leading-[1.02]">
                                They solve a slice.
                            </h2>
                            
                            <GradientHeading
                                text="We run the whole thing"
                                theme={theme}
                                className="text-3xl sm:text-5xl lg:text-6xl font-anurati tracking-widest uppercase block"
                            />
                        </div>

                        {/* right column: companion description with generous breathing room */}
                        <div className="lg:col-span-5 lg:pt-10 flex flex-col justify-between h-full">
                            <p className="text-base sm:text-lg leading-relaxed text-[#b3b3b4] font-spline max-w-lg mb-8">
                                Most wallpaper apps just loop video files and consume 20% of your GPU. Colorwall is an entire desktop runtime built from scratch in Rust and DirectX 11. It handles 8K video, audio reactivity, live widgets, and taskbar styling seamlessly.
                            </p>

                            <div className="flex items-center gap-6 pt-6 border-t border-white/10">
                                <div>
                                    <span className="block text-2xl sm:text-3xl font-outfit font-[700] text-white tracking-tight">
                                        ~100MB
                                    </span>
                                    <span className="block text-[11px] font-mono text-white/40 uppercase tracking-wider">
                                        Idle memory
                                    </span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10" />
                                <div>
                                    <span className="block text-2xl sm:text-3xl font-outfit font-[700] text-white tracking-tight">
                                        0% Load
                                    </span>
                                    <span className="block text-[11px] font-mono text-white/40 uppercase tracking-wider">
                                        Game auto-pause
                                    </span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10" />
                                <div>
                                    <span className="block text-2xl sm:text-3xl font-outfit font-[700] text-white tracking-tight">
                                        8K Ready
                                    </span>
                                    <span className="block text-[11px] font-mono text-white/40 uppercase tracking-wider">
                                        Hardware IMF
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* spaceship-style bento grid with 32px gaps and 80px scroll translation */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-20">
                    {bentoCards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 80 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ y: -6 }}
                                className={`group relative rounded-[32px] border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-8 sm:p-10 flex flex-col justify-between overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/25 ${card.colSpan}`}
                            >
                                {/* subtle ambient radial glow */}
                                <div className={`absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br ${card.gradient} blur-3xl pointer-events-none opacity-30 group-hover:opacity-100 transition-opacity duration-700`} />

                                <div>
                                    {/* card top badges and icon */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/80 group-hover:text-cyan-400 group-hover:border-cyan-400/40 group-hover:scale-105 transition-all duration-300">
                                            <Icon size={22} strokeWidth={1.5} />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {card.tag && (
                                                <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold">
                                                    {card.tag}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/70">
                                                {card.badge}
                                            </span>
                                        </div>
                                    </div>

                                    {/* card typography */}
                                    <span className="block text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 mb-2 font-medium">
                                        {card.subtitle}
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-outfit font-[700] tracking-tight text-[#f9f9f9] mb-4">
                                        {card.title}
                                    </h3>
                                    <p className="text-sm sm:text-base leading-relaxed text-[#b3b3b4] font-spline">
                                        {card.desc}
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-white/40 group-hover:text-cyan-300 transition-colors duration-300">
                                    <span>Engine component</span>
                                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* colorwall cta bar */}
                {!isDownloadPage && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="rounded-[32px] border border-white/15 bg-white/[0.02] hover:bg-white/[0.03] p-8 sm:p-12 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-8 max-w-5xl mx-auto transition-all duration-300"
                    >
                        <div className="flex items-center gap-5">
                            <img
                                src="/colorwall.png"
                                alt="ColorWall Logo"
                                className="w-14 h-14 object-contain shrink-0"
                            />
                            <div className="text-left">
                                <h3 className="text-2xl font-outfit font-[700] text-white tracking-tight">
                                    ColorWall Engine
                                </h3>
                                <p className="text-sm text-[#b3b3b4] font-spline mt-1">
                                    Free to install. Runs it all end to end with near-zero overhead.
                                </p>
                            </div>
                        </div>

                        <Link href="/download">
                            <button className="px-8 py-3.5 rounded-2xl text-xs font-mono uppercase tracking-widest bg-white text-black font-semibold hover:bg-cyan-300 transition-all duration-300 cursor-pointer shadow-lg active:scale-95">
                                Download Free
                            </button>
                        </Link>
                    </motion.div>
                )}

            </div>

            {/* benchmark showcase container with responsive width */}
            <div className="max-w-[100rem] mx-auto relative z-10 mt-20 px-2 lg:px-8">
                <BenchmarkShowcase theme={theme} isDownloadPage={isDownloadPage} />
            </div>
        </section>
    );
};
