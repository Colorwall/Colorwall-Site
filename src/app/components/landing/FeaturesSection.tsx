"use client";

import { motion } from "framer-motion";
import { GradientHeading } from "./GradientHeading";
// Custom Animated Premium Icons
const FastIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-125 transition-all duration-500 origin-center group-hover:-translate-y-1 group-hover:translate-x-1">
        <defs>
            <linearGradient id="fastGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
        </defs>
        {/* Rocket Flame */}
        <path d="M10 24L2 30L8 20Z" fill="#fbbf24" opacity="0.9" className="group-hover:scale-110 origin-bottom-left transition-transform duration-300" />
        {/* Rocket Body */}
        <path d="M14 18L10 24L12 28L18 24C18 24 28 14 28 6C28 6 20 6 12 14L6 14L8 20L14 18Z" fill="url(#fastGrad)" />
        {/* Window */}
        <circle cx="20" cy="12" r="2.5" fill="#ffffff" opacity="0.9" />
    </svg>
);

const EngineIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-all duration-500 origin-center">
        <defs>
            <linearGradient id="engineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
        </defs>
        {/* Bottom Layer */}
        <path d="M16 30 L4 24 L16 18 L28 24 Z" fill="url(#engineGrad1)" opacity="0.4" className="group-hover:translate-y-1 transition-transform duration-500" />
        {/* Middle Layer */}
        <path d="M16 22 L4 16 L16 10 L28 16 Z" fill="url(#engineGrad1)" opacity="0.7" />
        {/* Top Layer */}
        <path d="M16 14 L4 8 L16 2 L28 8 Z" fill="#ffffff" opacity="0.95" className="group-hover:-translate-y-1 transition-transform duration-500" />
    </svg>
);

const EditorIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-125 transition-all duration-500 origin-center">
        <defs>
            <linearGradient id="editorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
        </defs>
        <path d="M26 6L6 26a4 4 0 01-4-4L22 2a4 4 0 014 4z" fill="url(#editorGrad)" />
        <circle cx="8" cy="24" r="4" fill="#ffffff" opacity="0.8" />
        <path d="M22 2l-6 6 4 4 6-6-4-4z" fill="#ffffff" opacity="0.3" />
    </svg>
);

const ShaderIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] group-hover:scale-125 transition-all duration-700 origin-center">
        <defs>
            <linearGradient id="shaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
        </defs>
        <path d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12L16 2Z" fill="url(#shaderGrad)" />
        <path d="M16 8L18 14L24 16L18 18L16 24L14 18L8 16L14 14L16 8Z" fill="#ffffff" opacity="0.8" />
    </svg>
);

const AudioIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-all duration-500 origin-center group-hover:-translate-y-2">
        <defs>
            <linearGradient id="audioGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
        </defs>
        <rect x="4" y="16" width="4" height="12" rx="2" fill="url(#audioGrad)" className="group-hover:animate-pulse" />
        <rect x="10" y="8" width="4" height="20" rx="2" fill="url(#audioGrad)" className="group-hover:animate-pulse" style={{ animationDelay: "100ms" }} />
        <rect x="16" y="2" width="4" height="26" rx="2" fill="url(#audioGrad)" className="group-hover:animate-pulse" style={{ animationDelay: "200ms" }} />
        <rect x="22" y="12" width="4" height="16" rx="2" fill="url(#audioGrad)" className="group-hover:animate-pulse" style={{ animationDelay: "150ms" }} />
    </svg>
);

const WidgetIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:scale-125 transition-all duration-500 origin-center">
        <defs>
            <linearGradient id="widgetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
        </defs>
        <rect x="2" y="2" width="12" height="12" rx="3" fill="url(#widgetGrad)" />
        <rect x="18" y="2" width="12" height="12" rx="3" fill="url(#widgetGrad)" opacity="0.6" />
        <rect x="2" y="18" width="12" height="12" rx="3" fill="url(#widgetGrad)" opacity="0.8" />
        <rect x="18" y="18" width="12" height="12" rx="3" fill="#ffffff" opacity="0.9" />
    </svg>
);

const MonitorIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-125 group-hover:translate-x-1 transition-all duration-500 origin-center">
        <defs>
            <linearGradient id="monGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
        </defs>
        <rect x="2" y="6" width="20" height="14" rx="2" fill="url(#monGrad)" opacity="0.6" />
        <rect x="10" y="10" width="20" height="14" rx="2" fill="url(#monGrad)" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
        <path d="M16 24l-2 4h12l-2-4" fill="url(#monGrad)" opacity="0.8" />
    </svg>
);

const WorkshopIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:scale-125 transition-all duration-500 origin-center">
        <defs>
            <linearGradient id="workGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
        </defs>
        <path d="M16 2L2 10l14 8 14-8L16 2z" fill="#ffffff" opacity="0.8" />
        <path d="M2 10v12l14 8v-12L2 10z" fill="url(#workGrad)" />
        <path d="M30 10v12l-14 8v-12l14-8z" fill="url(#workGrad)" opacity="0.6" />
    </svg>
);

const TaskbarIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] group-hover:scale-125 group-hover:-translate-y-1 transition-all duration-500 origin-center">
        <defs>
            <linearGradient id="taskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
        </defs>
        <rect x="2" y="20" width="28" height="8" rx="4" fill="url(#taskGrad)" />
        <circle cx="8" cy="24" r="2" fill="#ffffff" />
        <circle cx="16" cy="24" r="2" fill="#ffffff" opacity="0.8" />
        <circle cx="24" cy="24" r="2" fill="#ffffff" opacity="0.5" />
        <path d="M4 14l8-8 4 4 12-12" stroke="url(#taskGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" className="group-hover:translate-y-[-2px] transition-transform duration-300" />
    </svg>
);

// -- feature data --
const features = [
    {
        id: "01",
        icon: FastIcon,
        title: "Blazing Fast",
        desc: "Built in Rust & Tauri. Negligible performance impact (~0.5% CPU, 1-2% GPU) even at 4K 60FPS.",
    },
    {
        id: "02",
        icon: EngineIcon,
        title: "D3D11 Compositor Engine",
        desc: "Hardware-accelerated DirectX 11 rendering/ Multiple Renderers and zero-latency scene composition.",
    },
    {
        id: "03",
        icon: EditorIcon,
        title: "Interactive Studio Editor",
        desc: "Build your own dynamic scenes with a professional visual editor. Mix videos, images, and particle emitters seamlessly.",
    },
    {
        id: "04",
        icon: ShaderIcon,
        title: "HLSL Shaders/Particles(under dev)",
        desc: "Apply real-time, customizable shader effects like Reflections, Sway, Rays, Chromatic Aberration, Blur, and Rain Drops.",
    },
    {
        id: "05",
        icon: AudioIcon,
        title: "Audio Reactive Ecosystem",
        desc: "Native system audio analysis injects rhythmic life into your wallpapers, particles, and widgets in real-time.",
    },
    {
        id: "06",
        icon: WidgetIcon,
        title: "Desktop Widgets",
        desc: "Pin interactive HTML5/React widgets—like 3D clocks, visualizers, and system monitors—directly to your desktop.",
    },
    {
        id: "07",
        icon: MonitorIcon,
        title: "Multi-Monitor Support",
        desc: "Flawless multi-display support. Run different engines per screen and permanently save widget layouts.",
    },
    {
        id: "08",
        icon: WorkshopIcon,
        title: "Massive Workshop",
        desc: "Browse and download thousands of 4K videos, webgl scenes, and community-made .colorwall projects instantly.",
    },
    {
        id: "09",
        icon: TaskbarIcon,
        title: "Taskbar Customization",
        desc: "Transform your taskbar with transparent, blur, or acrylic effects, completely independent of the wallpaper engine.",
    }
];

export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-32 px-4 sm:px-8">
            {/* <p className={`text-center mt-6 text-sm font-mono ${theme === "dark" ? "text-white/30" : "text-black/30"}`}>
                Blazing fast cz it's in rust/tauri · live/static wallpapers · local wallpaper support <br />
                <span className="text-xs text-white/20">more features coming soon... :3</span>
            </p> */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    className="mb-24"
                >
                    <p className={`text-xs font-mono uppercase tracking-[0.2em] mb-4 ml-1
                        ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                        system_capabilities
                    </p>
                    <GradientHeading
                        text={"Performance\nwithout compromise"}
                        theme={theme}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight whitespace-pre-wrap leading-[1.1]"
                    />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group relative"
                        >
                            {/* "tech spec" top line */}
                            <div className={`w-full h-[1px] mb-6 transition-all duration-500 origin-left
                                ${theme === "dark"
                                    ? "bg-white/10 group-hover:bg-blue-500/50 group-hover:w-full"
                                    : "bg-black/10 group-hover:bg-blue-500/50 group-hover:w-full"}`}
                            />

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-4xl font-mono font-light tracking-tighter opacity-20 group-hover:opacity-40 transition-opacity duration-300
                                        ${theme === "dark" ? "text-white" : "text-black"}`}>
                                        {f.id}
                                    </span>
                                    <f.icon />
                                </div>

                                <div>
                                    <h3 className={`text-xl font-mono font-bold mb-3 tracking-wide group-hover:-translate-y-0.5 transition-transform duration-300
                                        ${theme === "dark" ? "text-white" : "text-black"}`}>
                                        {f.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed max-w-[90%]
                                        ${theme === "dark" ? "text-white/50" : "text-black/60"}`}>
                                        {f.desc}
                                    </p>

                                </div>
                            </div>



                        </motion.div>

                    ))}
                </div>
            </div>

        </section>
    );
}
