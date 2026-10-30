"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
    Cpu, 
    Store, 
    Layout, 
    Palette, 
    Wand2, 
    Music
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

    // deferred idle state to load editorial background art only when browser is idle
    const [idleLoaded, setIdleLoaded] = useState(false);

    useEffect(() => {
        // defer card background images until browser completes primary tasks
        if (typeof window !== "undefined") {
            if ("requestIdleCallback" in window) {
                const id = (window as any).requestIdleCallback(() => setIdleLoaded(true), { timeout: 2000 });
                return () => (window as any).cancelIdleCallback(id);
            } else {
                const timer = setTimeout(() => setIdleLoaded(true), 300);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    // flat bento cards with static styling and no hover or blur overhead
    const bentoCards = [
        {
            title: "Performance First",
            desc: "This is not a gimmick. Colorwall actively sits around ~100 MB RAM on idle, with GPU overhead barely registering. Automatically pauses instantly during fullscreen games or battery mode.",
            icon: Cpu,
            bgImage: "/editorial/performance.webp",
            colSpan: "lg:col-span-6",
        },
        {
            title: "305,000+ Wallpapers",
            desc: "Over 305,000 community wallpapers curated from 8+ sources. Native 4K/8K video loops, interactive WebGL canvases, and offline-first library indexing with one click.",
            icon: Store,
            bgImage: "/editorial/store.webp",
            colSpan: "lg:col-span-6",
        },
        {
            title: "Shaders & Particles",
            desc: "Real-time HLSL compute effects directly injected into wallpapers: chromatic aberration, bloom, rain drops, procedural sway, and optical lens blur.",
            icon: Wand2,
            tag: "UNDER WORK",
            bgImage: "/editorial/shaders.svg",
            colSpan: "lg:col-span-4",
        },
        {
            title: "Audio Reactivity",
            desc: "Hardware loopback system audio analysis transforms music and desktop sound into rhythmic pulses across live wallpaper shaders and widgets in real-time.",
            icon: Music,
            bgImage: "/editorial/audio_reactive.webp",
            colSpan: "lg:col-span-4",
        },
        {
            title: "Desktop Widgets",
            desc: "Pin responsive clocks, system telemetry, and custom web components directly onto the Windows desktop plane with less than 1.2ms input delay.",
            icon: Layout,
            bgImage: "/editorial/widgets.svg",
            colSpan: "lg:col-span-4",
        },
        {
            title: "Taskbar Styling",
            desc: "Transparent, acrylic blur, or fluid colorway gradients on your Windows taskbar. Operates completely independent of the wallpaper engine with zero CPU consumption.",
            icon: Palette,
            bgImage: "/editorial/taskbarstyle.webp",
            colSpan: "lg:col-span-12",
        },
    ];

    return (
        <section className={`py-24 sm:py-32 px-4 sm:px-8 relative overflow-hidden ${
            isDark ? "bg-black text-white" : "bg-white text-black"
        }`}>
            <div className="max-w-7xl mx-auto relative z-10">

                {/* breathy two-column heading with contained antigravity backdrop */}
                <div className="relative mb-20 sm:mb-24">
                    {/* expanded antigravity canvas with smooth radial falloff mask */}
                    <div 
                        className="absolute -inset-x-16 -inset-y-20 sm:-inset-x-32 sm:-inset-y-28 lg:-inset-x-48 lg:-inset-y-36 z-0 pointer-events-none opacity-80 mix-blend-screen"
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
                            <div className="flex items-center gap-2 mb-6">
                                <span className={`w-2 h-2 rounded-full ${isDark ? "bg-cyan-400" : "bg-blue-600"} animate-pulse`} />
                                <p className={`text-xs font-mono uppercase tracking-[0.25em] font-medium ${
                                    isDark ? "text-cyan-400" : "text-blue-600"
                                }`}>
                                    How we compare?
                                </p>
                            </div>

                            <h2 className={`text-5xl sm:text-7xl lg:text-[88px] font-outfit font-[700] tracking-[-0.6px] leading-[0.96] mb-4 ${
                                isDark ? "text-white" : "text-black"
                            }`}>
                                They solve a slice.
                            </h2>
                            
                            <GradientHeading
                                text="We run the whole thing."
                                theme={theme}
                                className="text-3xl sm:text-5xl lg:text-6xl font-anurati tracking-widest uppercase block"
                            />
                        </div>

                        {/* right column: companion description with proper theme contrast */}
                        <div className="lg:col-span-5 lg:pt-10 flex flex-col justify-between h-full">
                            <p className={`text-base sm:text-lg leading-relaxed font-spline max-w-lg mb-8 ${
                                isDark ? "text-[#b3b3b4]" : "text-[#52525b]"
                            }`}>
                                Most wallpaper apps just loop video files and consume 20% of your GPU. Colorwall is an entire desktop runtime built from scratch in Rust and DirectX 11. It handles 8K video, audio reactivity, live widgets, and taskbar styling seamlessly.
                            </p>

                            <div className={`flex items-center gap-6 pt-6 border-t ${
                                isDark ? "border-white/10" : "border-black/10"
                            }`}>
                                <div>
                                    <span className={`block text-2xl sm:text-3xl font-outfit font-[700] tracking-tight ${
                                        isDark ? "text-white" : "text-black"
                                    }`}>
                                        ~100MB
                                    </span>
                                    <span className={`block text-[11px] font-mono uppercase tracking-wider ${
                                        isDark ? "text-white/40" : "text-black/40"
                                    }`}>
                                        Idle memory
                                    </span>
                                </div>
                                <div className={`w-[1px] h-8 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                                <div>
                                    <span className={`block text-2xl sm:text-3xl font-outfit font-[700] tracking-tight ${
                                        isDark ? "text-white" : "text-black"
                                    }`}>
                                        0% Load
                                    </span>
                                    <span className={`block text-[11px] font-mono uppercase tracking-wider ${
                                        isDark ? "text-white/40" : "text-black/40"
                                    }`}>
                                        Game auto-pause
                                    </span>
                                </div>
                                <div className={`w-[1px] h-8 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                                <div>
                                    <span className={`block text-2xl sm:text-3xl font-outfit font-[700] tracking-tight ${
                                        isDark ? "text-white" : "text-black"
                                    }`}>
                                        8K Ready
                                    </span>
                                    <span className={`block text-[11px] font-mono uppercase tracking-wider ${
                                        isDark ? "text-white/40" : "text-black/40"
                                    }`}>
                                        Hardware IMF
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* solid bento cards: zero hover animations, zero blur, zero shadows */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 mb-20">
                    {bentoCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.title}
                                className={`relative rounded-[28px] sm:rounded-[32px] border p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[280px] sm:min-h-[320px] ${
                                    card.colSpan
                                } ${
                                    isDark
                                        ? "bg-[#111113] border-white/10"
                                        : "bg-[#f5f5f7] border-black/10"
                                }`}
                            >
                                {/* static full-bleed background image with zero hover scaling */}
                                {idleLoaded && card.bgImage && (
                                    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                                        <Image
                                            src={card.bgImage}
                                            alt=""
                                            aria-hidden="true"
                                            fill
                                            loading="lazy"
                                            fetchPriority="low"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className={`object-cover object-center ${
                                                isDark ? "opacity-75" : "opacity-85"
                                            }`}
                                        />

                                        {/* static smooth directional fade on text side with zero blur */}
                                        <div 
                                            className={`absolute inset-0 pointer-events-none ${
                                                isDark 
                                                    ? "bg-gradient-to-r from-[#111113] via-[#111113]/60 to-transparent" 
                                                    : "bg-gradient-to-r from-[#f5f5f7] via-[#f5f5f7]/60 to-transparent"
                                            }`}
                                        />
                                    </div>
                                )}

                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    {/* card top icon and status tag with zero blur */}
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                                            isDark 
                                                ? "bg-black/60 border-white/15 text-white" 
                                                : "bg-white/80 border-black/15 text-black"
                                        }`}>
                                            <Icon size={22} strokeWidth={1.5} />
                                        </div>

                                        {card.tag && (
                                            <span className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full font-semibold border ${
                                                isDark
                                                    ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
                                                    : "bg-amber-500/20 border-amber-500/40 text-amber-700"
                                            }`}>
                                                {card.tag}
                                            </span>
                                        )}
                                    </div>

                                    {/* card typography with zero drop-shadows */}
                                    <div>
                                        <h3 className={`text-2xl sm:text-3xl font-outfit font-[700] tracking-tight mb-3 ${
                                            isDark ? "text-white" : "text-[#111111]"
                                        }`}>
                                            {card.title}
                                        </h3>
                                        <p className={`text-sm sm:text-base leading-relaxed font-spline max-w-lg ${
                                            isDark ? "text-[#b3b3b4]" : "text-[#3f3f46]"
                                        }`}>
                                            {card.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* colorwall cta bar without shadows or blurs */}
                {!isDownloadPage && (
                    <div
                        className={`rounded-[28px] sm:rounded-[32px] border p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-8 max-w-5xl mx-auto ${
                            isDark
                                ? "bg-[#111113] border-white/10"
                                : "bg-[#f5f5f7] border-black/10"
                        }`}
                    >
                        <div className="flex items-center gap-5">
                            <img
                                src="/colorwall.png"
                                alt="ColorWall Logo"
                                className="w-14 h-14 object-contain shrink-0"
                            />
                            <div className="text-left">
                                <h3 className={`text-2xl font-outfit font-[700] tracking-tight ${
                                    isDark ? "text-white" : "text-black"
                                }`}>
                                    ColorWall Engine
                                </h3>
                                <p className={`text-sm font-spline mt-1 ${
                                    isDark ? "text-[#a1a1aa]" : "text-[#52525b]"
                                }`}>
                                    Free to install. Runs it all end to end with near-zero overhead.
                                </p>
                            </div>
                        </div>

                        <Link href="/download">
                            <button className={`px-8 py-3.5 rounded-2xl text-xs font-mono uppercase tracking-widest font-semibold cursor-pointer active:scale-95 ${
                                isDark
                                    ? "bg-white text-black hover:bg-neutral-200"
                                    : "bg-black text-white hover:bg-neutral-800"
                            }`}>
                                Download Free
                            </button>
                        </Link>
                    </div>
                )}

            </div>

            {/* benchmark showcase container with responsive width */}
            <div className="max-w-[100rem] mx-auto relative z-10 mt-20 px-2 lg:px-8">
                <BenchmarkShowcase theme={theme} isDownloadPage={isDownloadPage} />
            </div>
        </section>
    );
};
