"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GradientHeading } from "./GradientHeading";
import ScrollStack, { ScrollStackItem } from "../ui/ScrollStack";

// Custom Animated Premium Icons
const FastIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] overflow-visible">
        <defs>
            <linearGradient id="fastGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
        </defs>
        {/* Rocket Flame */}
        <path d="M10 24L2 30L8 20Z" fill="#fbbf24" opacity="0.9" className="group-hover:scale-110 origin-bottom-left transition-transform duration-300 group-hover:animate-pulse" />
        {/* Rocket Body */}
        <path d="M14 18L10 24L12 28L18 24C18 24 28 14 28 6C28 6 20 6 12 14L6 14L8 20L14 18Z" fill="url(#fastGrad)" className="group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform duration-700 ease-out" />
        {/* Window */}
        <circle cx="20" cy="12" r="2.5" fill="#ffffff" opacity="0.9" className="group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform duration-700 ease-out" />
    </svg>
);

const EngineIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] overflow-visible">
        <defs>
            <linearGradient id="engineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
        </defs>
        
        {/* Subtle background glow/shape */}
        <rect x="6" y="8" width="20" height="16" rx="4" fill="url(#engineGrad1)" opacity="0.25" className="group-hover:scale-110 transition-transform duration-500 delay-100" />
        
        {/* Left Bracket */}
        <path d="M13 10 L7 16 L13 22" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-2 group-hover:scale-110 transition-transform duration-500 ease-out" />
        
        {/* Right Bracket */}
        <path d="M19 10 L25 16 L19 22" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-2 group-hover:scale-110 transition-transform duration-500 ease-out" />
        
        {/* Hidden Slash that appears on hover */}
        <path d="M18 8 L14 24" fill="none" stroke="url(#engineGrad1)" strokeWidth="3" strokeLinecap="round" className="opacity-0 group-hover:opacity-100 group-hover:rotate-[15deg] transition-all duration-500 origin-center" />
    </svg>
);

const EditorIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
        <defs>
            <linearGradient id="editorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
            </linearGradient>
        </defs>
        
        {/* Full Mountain Fill */}
        <path d="M5 26 L12 6 L18 16 L24 10 L29 26 Z" fill="url(#editorGrad)" opacity="0.5" className="group-hover:-translate-y-1 transition-transform duration-500" />
        
        {/* Lower Mountain Fill (adds darker tint to bottom) */}
        <path d="M5 26 L6.75 21 Q 11.9 16 17.1 21 T 27.44 21 L 29 26 Z" fill="url(#editorGrad)" opacity="0.6" className="group-hover:translate-y-1 transition-transform duration-500" />

        {/* Outline */}
        <path d="M5 26 L12 6 L18 16 L24 10 L29 26 Z" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" opacity="0.95" className="group-hover:-translate-y-1 transition-transform duration-500" />
        
        {/* Wavy Line */}
        <path d="M6.75 21 Q 11.9 16 17.1 21 T 27.44 21" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" className="group-hover:translate-y-1 transition-transform duration-500" />
    </svg>
);

const ShaderIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] overflow-visible">
        <defs>
            <linearGradient id="shaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
        </defs>
        
        {/* Top Bubble */}
        <g className="group-hover:-translate-y-3 group-hover:-translate-x-1 transition-transform duration-[800ms] ease-out">
            <circle cx="12.5" cy="10" r="3" fill="url(#shaderGrad)" opacity="0.6" />
            <circle cx="12.5" cy="10" r="3" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
        </g>
        
        {/* Right Bubble */}
        <g className="group-hover:-translate-y-2 group-hover:translate-x-1.5 transition-transform duration-[600ms] ease-out delay-75">
            <circle cx="21.5" cy="13" r="4.5" fill="url(#shaderGrad)" opacity="0.5" />
            <circle cx="21.5" cy="13" r="4.5" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
        </g>
        
        {/* Large Bottom Bubble */}
        <g className="group-hover:-translate-y-1 group-hover:-translate-x-0.5 transition-transform duration-[700ms] ease-out delay-150">
            <circle cx="12.5" cy="20" r="6.5" fill="url(#shaderGrad)" opacity="0.4" />
            <circle cx="12.5" cy="20" r="6.5" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
            {/* Highlight */}
            <circle cx="10" cy="17.5" r="1.5" fill="#ffffff" opacity="0.95" />
        </g>
    </svg>
);

const AudioIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] overflow-visible">
        <defs>
            <linearGradient id="audioGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
        </defs>
        <rect x="4" y="16" width="4" height="12" rx="2" fill="url(#audioGrad)" className="origin-bottom transition-transform duration-300 group-hover:scale-y-150" />
        <rect x="10" y="8" width="4" height="20" rx="2" fill="url(#audioGrad)" className="origin-bottom transition-transform duration-300 group-hover:scale-y-125 delay-75" />
        <rect x="16" y="2" width="4" height="26" rx="2" fill="url(#audioGrad)" className="origin-bottom transition-transform duration-300 group-hover:scale-y-[0.4] delay-150" />
        <rect x="22" y="12" width="4" height="16" rx="2" fill="url(#audioGrad)" className="origin-bottom transition-transform duration-300 group-hover:scale-y-110 delay-100" />
    </svg>
);

const WidgetIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] overflow-visible">
        <defs>
            <linearGradient id="widgetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
        </defs>
        <rect x="2" y="2" width="12" height="12" rx="3" fill="url(#widgetGrad)" className="group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:-rotate-1 transition-transform duration-500 origin-bottom-right" />
        <rect x="18" y="2" width="12" height="12" rx="3" fill="url(#widgetGrad)" opacity="0.6" className="group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-1 transition-transform duration-500 origin-bottom-left" />
        <rect x="2" y="18" width="12" height="12" rx="3" fill="url(#widgetGrad)" opacity="0.8" className="group-hover:-translate-x-1 group-hover:translate-y-1 group-hover:-rotate-1 transition-transform duration-500 origin-top-right" />
        <rect x="18" y="18" width="12" height="12" rx="3" fill="#ffffff" opacity="0.9" className="group-hover:translate-x-1 group-hover:translate-y-1 group-hover:rotate-1 transition-transform duration-500 origin-top-left" />
    </svg>
);

const MonitorIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] overflow-visible">
        <defs>
            <linearGradient id="monGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
        </defs>
        {/* Stand */}
        <path d="M16 24l-2 4h12l-2-4" fill="url(#monGrad)" opacity="0.8" />
        {/* Outer Monitor Frame */}
        <rect x="2" y="6" width="20" height="14" rx="2" fill="url(#monGrad)" opacity="0.6" className="group-hover:-translate-y-1 transition-transform duration-300" />
        {/* Inner Screen popping out */}
        <rect x="10" y="10" width="20" height="14" rx="2" fill="url(#monGrad)" className="group-hover:translate-x-2 group-hover:-translate-y-3 group-hover:scale-110 transition-transform duration-500 shadow-xl" />
    </svg>
);

const WorkshopIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] overflow-visible">
        <defs>
            <linearGradient id="workGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
        </defs>
        {/* Top Face */}
        <path d="M16 2L2 10l14 8 14-8L16 2z" fill="#ffffff" opacity="0.8" className="group-hover:-translate-y-2 transition-transform duration-500" />
        {/* Left Face */}
        <path d="M2 10v12l14 8v-12L2 10z" fill="url(#workGrad)" className="group-hover:-translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500" />
        {/* Right Face */}
        <path d="M30 10v12l-14 8v-12l14-8z" fill="url(#workGrad)" opacity="0.6" className="group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500" />
    </svg>
);

const TaskbarIcon = () => (
    <svg viewBox="0 0 32 32" className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)] overflow-visible">
        <defs>
            <linearGradient id="taskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
        </defs>
        
        <g className="origin-[10px_26px] transition-transform duration-[600ms] ease-out group-hover:rotate-[35deg] group-hover:-translate-y-1 group-hover:scale-110">
            {/* 45-degree rotation container for upright drawing */}
            <g transform="rotate(45 16 16)">
                {/* Handle Fill */}
                <rect x="14" y="10" width="4" height="15" rx="1.5" fill="url(#taskGrad)" opacity="0.3" />
                {/* Handle Outline */}
                <rect x="14" y="10" width="4" height="15" rx="1.5" fill="none" stroke="#ffffff" strokeWidth="2" />
                
                {/* Wrap Fill */}
                <rect x="13" y="12" width="6" height="4" rx="1" fill="url(#taskGrad)" opacity="0.6" />
                {/* Wrap Outline */}
                <rect x="13" y="12" width="6" height="4" rx="1" fill="none" stroke="#ffffff" strokeWidth="2" />
                
                {/* Head Fill */}
                <path d="M 8 15 C 10 7, 22 7, 24 15 A 1 1 0 0 1 22 16.5 C 19 11, 13 11, 10 16.5 A 1 1 0 0 1 8 15 Z" fill="url(#taskGrad)" opacity="0.5" />
                
                {/* Head Outline */}
                <path d="M 8 15 C 10 7, 22 7, 24 15 A 1 1 0 0 1 22 16.5 C 19 11, 13 11, 10 16.5 A 1 1 0 0 1 8 15 Z" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" />
            </g>
        </g>
    </svg>
);

// -- feature data --
const features = [
    {
        id: "01",
        icon: FastIcon,
        title: "Blazing Fast",
        desc: "Built in Rust & Tauri. Negligible performance impact (~0.5% CPU, 2-5% GPU usage) even at 4K or 8k 60FPS. Unbelievably efficient is it not? ",
    },
    {
        id: "02",
        icon: EngineIcon,
        title: "Direct3D11 Compositor Engine",
        desc: "Hardware-accelerated DirectX11 Rendering/Providing Multiple Renderers -> IMF for Zero-Copy Rendering & MPV for 8k Video/Scenes, & Webview2 for widgets.",
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
        desc: "Native system audio analysis injects rhythmic life into your wallpapers(available in widgets for now), particles, and widgets in real-time.",
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
        desc: "Flawless multi-display support. Run different Videos/Scenes/Widgets per screen and permanently save widget layouts.",
    },
    {
        id: "08",
        icon: WorkshopIcon,
        title: "Massive Workshop",
        desc: "Browse and download thousands of 4K videos, webgl scenes, and community-made .colorwall projects (UNDER DEV)",
    },
    {
        id: "09",
        icon: TaskbarIcon,
        title: "Taskbar Customization",
        desc: "Transform your taskbar with transparent, blur, or acrylic effects, completely independent of the wallpaper engine.",
    }
];

export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    const [activeView, setActiveView] = useState<'stack' | 'grid'>('grid');

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
                    className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
                >
                    <div>
                        <p className={`text-xs font-mono uppercase tracking-[0.2em] mb-4 ml-1
                            ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                            the app is still under development and constantly updates! 
                            Read capablities below:
                        </p>
                        <GradientHeading
                            text={"Performance\nwithout compromise"}
                            theme={theme}
                            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight whitespace-pre-wrap leading-[1.1]"
                        />
                    </div>
                    
                    {/* View Toggle */}
                    <div className={`flex p-1 rounded-full border shrink-0 ${theme === 'dark' ? 'border-white/10 bg-[#0f0f11]' : 'border-black/10 bg-[#fafafa]'}`}>
                        <button 
                            onClick={() => setActiveView('stack')} 
                            className={`px-4 py-2 rounded-full text-sm font-mono transition-colors ${activeView === 'stack' ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black') : (theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black')}`}
                        >
                            Stack View
                        </button>
                        <button 
                            onClick={() => setActiveView('grid')} 
                            className={`px-4 py-2 rounded-full text-sm font-mono transition-colors ${activeView === 'grid' ? (theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/10 text-black') : (theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black')}`}
                        >
                            Grid View
                        </button>
                    </div>
                </motion.div>

                {activeView === 'grid' ? (
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
                                        <h3 className={`text-xl font-quicksand font-semibold mb-3 tracking-wide group-hover:-translate-y-0.5 transition-transform duration-300
                                            ${theme === "dark" ? "text-white" : "text-black"}`}>
                                            {f.title}
                                        </h3>
                                        <p className={`text-sm leading-relaxed max-w-[90%] font-spline
                                            ${theme === "dark" ? "text-white/50" : "text-black/60"}`}>
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full relative">
                        <ScrollStack 
                            useWindowScroll={true} 
                            itemDistance={80}
                            itemStackDistance={40}
                            itemScale={0.05}
                        >
                            {features.map((f, i) => (
                                <ScrollStackItem 
                                    key={f.title} 
                                    itemClassName={`border ${theme === 'dark' ? 'bg-[#0f0f11] border-white/10' : 'bg-[#fafafa] border-black/10'}`}
                                >
                                    <div className="group relative h-full flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-4xl sm:text-5xl lg:text-7xl font-mono font-light tracking-tighter opacity-10 group-hover:opacity-30 transition-opacity duration-300
                                                ${theme === "dark" ? "text-white" : "text-black"}`}>
                                                {f.id}
                                            </span>
                                            <div className="scale-150 origin-right">
                                                <f.icon />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className={`text-2xl sm:text-3xl font-quicksand font-semibold mb-4 tracking-wide group-hover:-translate-y-1 transition-transform duration-300
                                                ${theme === "dark" ? "text-white" : "text-black"}`}>
                                                {f.title}
                                            </h3>
                                            <p className={`text-lg leading-relaxed max-w-2xl font-spline
                                                ${theme === "dark" ? "text-white/60" : "text-black/60"}`}>
                                                {f.desc}
                                            </p>
                                        </div>
                                    </div>
                                </ScrollStackItem>
                            ))}
                        </ScrollStack>
                    </div>
                )}
            </div>

        </section>
    );
}
