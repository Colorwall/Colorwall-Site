"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { GradientHeading } from "./GradientHeading";
import ShapeBlur from "../ui/ShapeBlur";
import BorderGlow from "../ui/BorderGlow";
import SideRays from "../ui/SideRays";

interface Feature {
    id: string;
    title: string;
    description: string;
    badge: string;
    imageSrcs: string[];
}

const features: Feature[] = [
    {
        id: "store",
        title: "STORE",
        description: "Access thousands of wallpapers from 8+ sources. One unified search bar, infinite inspiration — no account needed.",
        badge: "8 SOURCES · 4K · UNIFIED",
        imageSrcs: ["/STORE.webp", "/modal.webp"]
    },
    {
        id: "library",
        title: "LIBRARY",
        description: "Your personal collection. Offline-first with automatic thumbnails and instant previews. Upload your own, link local files, or save from the store.",
        badge: "LOCAL · OFFLINE · CUTE",
        imageSrcs: ["/Library.webp"]
    },
    {
        id: "customise",
        title: "CUSTOMISE",
        description: "unmatched performance and control. built on rust & tauri for near-zero impact. style your taskbar with blur/acrylic effects, control multi-monitor setups, and tweak renderer presets.",
        badge: "RUST · TAURI · LOW OVERHEAD",
        imageSrcs: ["/PEAKmodalpreview.webp", "/multi.webp", "/taskbar.webp", "/ADV.webp", "/perf.webp"]
    },
    {
        id: "widgets",
        title: "WIDGETS",
        description: "desktop widgets powered by modern web tech. add calendars, clocks, or custom information directly to your desktop. clean, fast, and fully customizable.",
        badge: "HTML · JS · PINNED",
        imageSrcs: ["/widgets.webp"]
    },
    {
        id: "studio",
        title: "STUDIO",
        description: "build your own native scene wallpapers using our built-in node editor. combine images, video layers, real-time audio-reactive shaders, and particle systems effortlessly.",
        badge: "NODE-BASED · D3D11 · PARTICLES",
        imageSrcs: ["/studio.webp"]
    },
    {
        id: "interactive",
        title: "INTERACTIVE",
        description: "wallpapers that come alive. fully interactive html5 canvases and webgl shaders that respond to your mouse movements and clicks. your desktop is now a playground.",
        badge: "WEBGL · DYNAMIC · INTERACTIVE",
        imageSrcs: ["/INTERACTIVES.webp"]
    }
];

export const FeatureTabs = ({ theme, enableSideRays = false }: { theme: "dark" | "light", enableSideRays?: boolean }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    
    // Auto-rotate images if multiple are present
    useEffect(() => {
        const activeFeature = features[activeTab];
        if (activeFeature.imageSrcs.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentImgIndex((prev) => (prev + 1) % activeFeature.imageSrcs.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [activeTab]);

    // Reset image index when switching tabs
    useEffect(() => {
        setCurrentImgIndex(0);
    }, [activeTab]);

    return (
        <section className="relative py-16 sm:py-24 px-4 sm:px-8 w-full max-w-[1400px] mx-auto min-h-[80vh] flex items-center">
            {enableSideRays && (
                <div 
                    className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[100vw] z-0 pointer-events-none" 
                    style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)" }}
                >
                    <SideRays 
                        speed={1.5}
                        rayColor1={theme === 'dark' ? '#00d8ff' : '#0ea5e9'} // Electric Cyan
                        rayColor2={theme === 'dark' ? '#6d28d9' : '#8b5cf6'} // Deep Violet
                        intensity={theme === 'dark' ? 2.5 : 1.5}
                        spread={2.5}
                        origin="top-right"
                        tilt={-5}
                        saturation={theme === 'dark' ? 1.0 : 1.0}
                        blend={0.5}
                        falloff={0.6}
                        opacity={1.0}
                    />
                </div>
            )}
            <div className="relative z-10 grid lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr] gap-12 lg:gap-16 w-full items-center">
                
                {/* Left Side: Tabs Navigation */}
                <div className="flex flex-col gap-4">
                    {/* Title Area */}
                    <div className="mb-8">
                        <p className={`text-sm font-mono tracking-widest uppercase mb-4
                            ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                            Discover Capabilities
                        </p>
                        <GradientHeading 
                            text="Everything you need."
                            theme={theme}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight"
                        />
                    </div>

                    {/* Tab List */}
                    <div className="flex flex-col gap-3 relative">
                        {/* Connecting Line for design aesthetics */}
                        <div className={`absolute left-0 top-4 bottom-4 w-px 
                            ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`} 
                        />

                        {features.map((feature, idx) => {
                            const isActive = activeTab === idx;
                            return (
                                <button
                                    key={feature.id}
                                    onClick={() => setActiveTab(idx)}
                                    className={`relative pl-6 py-4 pr-4 text-left transition-all duration-300 rounded-r-2xl border-l-[3px] border-transparent group
                                        ${isActive ? (theme === 'dark' ? 'shadow-[0_0_40px_rgba(255,255,255,0.05)]' : 'shadow-[0_0_40px_rgba(0,0,0,0.05)]') : ''}
                                    `}
                                >
                                    {isActive && (
                                        <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ${theme === 'dark' ? 'opacity-30' : 'opacity-10 invert'}`}>
                                            <ShapeBlur variation={0} shapeSize={0.98} roundness={0.15} borderSize={0.02} circleSize={0.4} circleEdge={0.8} />
                                        </div>
                                    )}

                                    <div className="relative z-10">
                                        <h3 className={`text-xl sm:text-2xl font-black mb-2 tracking-tight transition-colors duration-300
                                            ${isActive 
                                                ? (theme === "dark" ? "text-white" : "text-black") 
                                                : (theme === "dark" ? "text-white/70 group-hover:text-white" : "text-black/70 group-hover:text-black")
                                            }
                                        `}>
                                            {feature.title}
                                        </h3>
                                        
                                        <AnimatePresence initial={false}>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className={`inline-flex items-center gap-2 mb-3 text-[10px] sm:text-xs font-mono tracking-widest uppercase
                                                        ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                                                    >
                                                        <span className="w-4 h-[1px] bg-current opacity-50" />
                                                        {feature.badge}
                                                    </div>
                                                    <p className={`text-sm sm:text-base leading-relaxed
                                                        ${theme === "dark" ? "text-white/60" : "text-black/60"}`}
                                                    >
                                                        {feature.description}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side: Image Showcase */}
                <BorderGlow 
                    className="cursor-target relative w-full aspect-video lg:aspect-[4/3] xl:aspect-video overflow-hidden group shadow-2xl"
                    borderRadius={32}
                    backgroundColor={theme === 'dark' ? '#0f0f11' : '#f4f4f5'}
                    glowColor={theme === 'dark' ? '220 100 60' : '220 80 50'}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute inset-0 w-full h-full bg-black/5"
                        >
                            {features[activeTab].imageSrcs.map((src, i) => (
                                <Image
                                    key={src}
                                    src={src}
                                    alt={features[activeTab].title}
                                    fill
                                    className={`object-cover transition-opacity duration-1000 ease-in-out
                                        ${i === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                                    priority={activeTab === 0 && i === 0}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Indicators for multiple images */}
                    {features[activeTab].imageSrcs.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {features[activeTab].imageSrcs.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 transition-all duration-500 rounded-full
                                        ${i === currentImgIndex
                                            ? `w-8 ${theme === "dark" ? "bg-white" : "bg-black"}`
                                            : `w-2 ${theme === "dark" ? "bg-white/30" : "bg-black/30"}`}`}
                                />
                            ))}
                        </div>
                    )}
                </BorderGlow>

            </div>
        </section>
    );
};
