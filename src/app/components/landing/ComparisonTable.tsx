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
    MonitorCheck,
    Music,
    Zap
} from "lucide-react";
import { BenchmarkShowcase } from "./BenchmarkShowcase";
import { GradientHeading } from "./GradientHeading";

const Antigravity = dynamic(() => import("../ui/Antigravity"), { ssr: false });


export const ComparisonTable = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    const features = [
        {
            title: "Discover",
            desc: "Over 105,000 wallpapers. 4K videos, WebGL scenes, and community .colorwall projects. One click to download.",
            icon: Store,
            tag: "UNDER DEV",
            colSpan: "lg:col-span-2",
        },
        {
            title: "Performance First",
            desc: "Auto-pauses on fullscreen games and battery mode. Built to step out of your way.",
            icon: Zap,
            colSpan: "lg:col-span-1",
        },
        {
            title: "Shaders & Particles",
            desc: "Real-time HLSL effects — reflections, sway, chromatic aberration, blur, and rain drops. All GPU-accelerated.",
            icon: Wand2,
            tag: "UNDER DEV",
            colSpan: "lg:col-span-1",
        },
        {
            title: "Audio Reactive",
            desc: "Native system audio analysis injects rhythmic life into wallpapers, particles, and widgets in real-time.",
            icon: Music,
            colSpan: "lg:col-span-1",
        },
        {
            title: "Desktop Widgets",
            desc: "Add clocks, system monitors, and custom elements right to your desktop.",
            icon: Layout,
            colSpan: "lg:col-span-1",
        },
        {
            title: "Taskbar",
            desc: "Transparent, blur, or acrylic effects on your taskbar — completely independent of the wallpaper engine.",
            icon: Palette,
            colSpan: "lg:col-span-3 md:col-span-2",
        },
    ];

    return (
        <section className="py-32 px-4 sm:px-8 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">

                <div className="flex flex-col items-center justify-center text-center mb-24 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="flex flex-col items-center w-full"
                    >
                        {/* main statement with antigravity background */}
                        <div className="relative w-full">
                            {/* The 3D particle background */}
                            <div className="absolute inset-0 -mx-32 -my-32 z-0 pointer-events-none opacity-80 mix-blend-screen">
                                <Antigravity 
                                    color={isDark ? "#00e5ff" : "#0284c7"} 
                                    count={200}
                                    particleSize={1.0}
                                    waveAmplitude={2.0}
                                    autoAnimate={true}
                                />
                            </div>
                            
                            <div className="relative z-10 pointer-events-none">
                                <p className={`text-[11px] font-mono tracking-[0.3em] uppercase mb-8
                                    ${isDark ? "text-white/75" : "text-black/75"}`}>
                                  How we compare?
                                </p>
                                <h2 className={`text-5xl md:text-7xl lg:text-8xl font-outfit font-[200] tracking-[-0.06em] leading-[0.95] mb-3
                                    ${isDark ? "text-white" : "text-black"}`}>
                                    They solve a slice.
                                </h2>
                                <GradientHeading
                                    text="We run the whole thing."
                                    theme={theme}
                                    className="text-4xl md:text-5xl lg:text-6xl font-anurati tracking-widest uppercase"
                                />
                            </div>
                        </div>

                        {/* Modern Feature Grid (Bento Box style) */}
                        <div className="w-full mt-24 mb-16 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {features.map((feature, i) => {
                                    const Icon = feature.icon;
                                    return (
                                        <motion.div
                                            key={feature.title}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-50px" }}
                                            transition={{ delay: i * 0.1, duration: 0.5 }}
                                            className={`p-6 md:p-8 rounded-3xl border flex flex-col justify-between text-left group transition-all duration-300 hover:-translate-y-1
                                                ${feature.colSpan}
                                                ${isDark 
                                                    ? "bg-white/[0.02] hover:bg-white/[0.04] border-white/10 hover:border-white/20" 
                                                    : "bg-black/[0.02] hover:bg-black/[0.04] border-black/10 hover:border-black/20"}`}
                                        >
                                            <div className="flex items-center gap-4 mb-5">
                                                <Icon size={20} strokeWidth={1.5} className={`shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${isDark ? "text-white" : "text-black"}`} />
                                                <h3 className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                                                    {feature.title}
                                                </h3>
                                                {feature.tag && (
                                                    <span className={`text-[9px] font-mono tracking-[0.15em] uppercase px-2 py-0.5 rounded-full
                                                        ${isDark ? "bg-white/10 text-white/50" : "bg-black/10 text-black/50"}`}>
                                                        {feature.tag}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-[14px] leading-relaxed ${isDark ? "text-white/50" : "text-black/50"}`}>
                                                    {feature.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* colorwall cta */}
                        <div className={`mt-12 pt-10 border-t w-full
                            ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-2xl mx-auto">
                                <div className="flex items-center gap-4">
                                    <img
                                        src="/colorwall.png"
                                        alt="ColorWall Logo"
                                        className="w-11 h-11 object-contain"
                                    />
                                    <div className="text-left">
                                        <h3 className={`text-xl font-bold tracking-tight
                                            ${isDark ? "text-white" : "text-[#1a1f36]"}`}>
                                            ColorWall
                                        </h3>
                                        <p className={`text-[13px] mt-0.5
                                            ${isDark ? "text-white/40" : "text-[#425466]"}`}>
                                            Free to Install. Runs it all End to end. Actively maintained!
                                        </p>
                                    </div>
                                </div>
                                <Link href="/download">
                                    <button className={`px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-200
                                        ${isDark
                                            ? "bg-white text-black hover:bg-white/90"
                                            : "bg-[#1a1f36] text-white hover:bg-[#2a2f46]"}`}>
                                        Download Free
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══ benchmark showcase - wider container ═══ */}
            <div className="max-w-[100rem] mx-auto relative z-10 mt-12 px-2 lg:px-8">
                <BenchmarkShowcase theme={theme} />
            </div>
        </section>
    );
};
