"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GradientHeading } from "./GradientHeading";
import ShapeBlur from "../ui/ShapeBlur";
import BorderGlow from "../ui/BorderGlow";
import SideRays from "../ui/SideRays";

// ─── headline stat cards ────────────────────────────────────────
// the most impressive at-a-glance proof points for colorwall's tech.
// these sit above the main showcase and are visually distinct from it.
const statCards = [
    {
        stat: "~0.5%",
        label: "CPU",
        detail: "Near-zero CPU overhead even at 4K/8K 60FPS. Built entirely in Rust & Tauri.",
        accent: false,
    },
    {
        stat: "D3D11",
        label: "Engine",
        detail: "Hardware-accelerated DirectX11 compositor. Zero-copy rendering via IMF, MPV for 8K video.",
        accent: false,
    },
    {
        stat: "8K",
        label: "Ready",
        detail: "Full 8K resolution support with multi-monitor layouts and permanent widget saves.",
        accent: true,
        href: "/download",
    },
];

// ─── primary features with screenshot showcases ─────────────────
// these are the 6 major features that have dedicated screenshots.
// rendered as interactive tabs with a large image preview.
const showcaseFeatures = [
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
    },
    {
        id: "discordrpc",
        title: "DISCORD RPC",
        description: "show off your current wallpaper or project to your friends on discord. automatically syncs your active scene or widget directly to your profile.",
        badge: "SYNCED · SOCIAL · FLEX",
        imageSrcs: ["/discordrpc.webp"]
    }
];

// ─── secondary features ─────────────────────────────────────────
// features without dedicated screenshots. rendered as inline prose
// in a stripe-style "bold name + description" format.
const extras: { name: string; desc: string; tag?: string }[] = [
    {
        name: "Shaders & Particles",
        desc: "Real-time HLSL effects — reflections, sway, chromatic aberration, blur, and rain drops. All GPU-accelerated.",
        tag: "under dev"
    },
    {
        name: "Audio Reactive",
        desc: "Native system audio analysis injects rhythmic life into wallpapers, particles, and widgets in real-time."
    },
    {
        name: "Workshop",
        desc: "Thousands of 4K videos, WebGL scenes, and community .colorwall projects. One click to download.",
        tag: "under dev"
    },
    {
        name: "Taskbar",
        desc: "Transparent, blur, or acrylic effects on your taskbar — completely independent of the wallpaper engine."
    },
];


export const FeaturesSection = ({ theme, enableSideRays = false }: { theme: "dark" | "light"; enableSideRays?: boolean }) => {
    const isDark = theme === "dark";
    const [activeTab, setActiveTab] = useState(0);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoReady, setVideoReady] = useState(false);

    // ─── deferred video loading ──────────────────────────────────
    // waits for browser idle before switching preload from "none" to
    // "auto", then listens for canplay before calling play(). this
    // prevents the video from competing with critical paint resources.
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const startLoad = () => {
            video.preload = "auto";
            video.load();
            const onCanPlay = () => {
                video.play().catch(() => {});
                setVideoReady(true);
                video.removeEventListener("canplay", onCanPlay);
            };
            video.addEventListener("canplay", onCanPlay);
        };

        if ("requestIdleCallback" in window) {
            const id = window.requestIdleCallback(startLoad, { timeout: 3000 });
            return () => window.cancelIdleCallback(id);
        } else {
            const t = setTimeout(startLoad, 1000);
            return () => clearTimeout(t);
        }
    }, []);

    // rotate through screenshots for features with multiple images
    useEffect(() => {
        const feature = showcaseFeatures[activeTab];
        if (feature.imageSrcs.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImgIndex(prev => (prev + 1) % feature.imageSrcs.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [activeTab]);

    // reset carousel position when switching tabs
    useEffect(() => { setCurrentImgIndex(0); }, [activeTab]);

    return (
        <section className="py-32 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">

                {/* ═══ top header: heading left, blurb right ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7 }}
                    className="mb-20 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-16"
                >
                    <div className="flex-shrink-0">
                        <div className="flex items-center gap-3 mb-4 ml-1 flex-wrap">
                            <p className={`text-xs font-mono uppercase tracking-[0.2em]
                                ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                under active development
                            </p>
                            <span className={`text-xs ${isDark ? "text-white/15" : "text-black/15"}`}>·</span>
                            <a
                                href="https://patron.colorwall.xyz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-xs font-mono uppercase tracking-[0.2em] transition-colors duration-300
                                    ${isDark
                                        ? "text-white/25 hover:text-white/60"
                                        : "text-black/25 hover:text-black/60"
                                    }`}
                            >
                                Supported by patrons ♥
                            </a>
                        </div>
                        <GradientHeading
                            text={"Performance\nwithout compromise."}
                            theme={theme}
                            className="text-4xl sm:text-5xl md:text-6xl font-anurati tracking-widest uppercase whitespace-pre-wrap leading-[1.1]"
                        />
                    </div>

                    <p className={`cursor-target relative p-4 -m-4 max-w-md text-base sm:text-lg leading-relaxed font-spline lg:text-right
                        ${isDark ? "text-white/50" : "text-black/50"}`}>
                        A desktop engine built from scratch in{" "}
                        <span className={isDark ? "text-white/80" : "text-black/80"}>Rust & Tauri</span>{" "}
                        with a{" "}
                        <span className={isDark ? "text-white/80" : "text-black/80"}>Direct3D11 compositor</span>.
                        {" "}It doesn&apos;t guess. It&apos;s engineered to perform.
                    </p>
                </motion.div>

                {/* ═══ stat cards ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-32"
                >
                    {statCards.map((card) => {
                        const cardClasses = `cursor-target group relative rounded-2xl p-7 sm:p-8 transition-all duration-500 overflow-hidden
                            ${card.accent
                                ? (isDark
                                    ? "bg-[#0078d4] text-white hover:bg-[#006cbd]"
                                    : "bg-[#111111] text-white hover:bg-[#1a1a1a]")
                                : (isDark
                                    ? "border border-white/10 bg-white/[0.02]"
                                    : "border border-black/10 bg-black/[0.02]")
                            }`;

                        const cardContent = (
                            <>
                                <div className="flex items-start justify-between mb-4">
                                    <span className={`text-4xl sm:text-5xl font-anurati tracking-widest uppercase leading-none
                                        ${card.accent
                                            ? "text-white"
                                            : (isDark ? "text-white" : "text-black")
                                        }`}>
                                        {card.stat}
                                        <span className={`text-lg font-medium ml-1 ${card.accent ? "text-white/70" : (isDark ? "text-white/40" : "text-black/40")}`}>
                                            {card.label}
                                        </span>
                                    </span>
                                    {card.accent ? (
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white text-lg mt-1 group-hover:scale-110 group-hover:translate-x-0.5 transition-transform duration-300">
                                            →
                                        </span>
                                    ) : (
                                        <span className={`text-xl mt-1 ${isDark ? "text-white/20" : "text-black/20"}`}>
                                            +
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm leading-relaxed font-spline
                                    ${card.accent
                                        ? "text-white/70"
                                        : (isDark ? "text-white/40" : "text-black/50")
                                    }`}>
                                    {card.detail}
                                </p>
                            </>
                        );

                        return card.href ? (
                            <Link
                                key={card.label}
                                href={card.href}
                                className={`${cardClasses} block no-underline cursor-pointer`}
                            >
                                {cardContent}
                            </Link>
                        ) : (
                            <div key={card.label} className={cardClasses}>
                                {cardContent}
                            </div>
                        );
                    })}
                </motion.div>


                {/* ═══════════════════════════════════════════════════════
                    main showcase - video background, tab navigation,
                    screenshot previews, and inline extras.
                    
                    replaces both the old "everything else" accordion
                    and the separate featuretabs component. one unified
                    section with varied typography throughout.
                ═══════════════════════════════════════════════════════ */}
                <div className="relative rounded-3xl overflow-hidden">

                    {/* video background - deferred via requestIdleCallback.
                        preload="none" prevents any fetch until our idle 
                        callback fires. the video is a night sky so text 
                        reads fine over it without heavy overlays. */}
                    <div className={`absolute inset-0 z-0 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#eef1f5]'}`}>
                        <video
                            ref={videoRef}
                            loop
                            muted
                            playsInline
                            preload="none"
                            className={`w-full h-full object-cover transition-opacity duration-1000
                                ${videoReady ? (isDark ? 'opacity-30' : 'opacity-40') : 'opacity-0'}`}
                        >
                            <source src="/videos/everything.webm" type="video/webm" />
                        </video>
                        {/* subtle bottom gradient to anchor the section */}
                        <div className={`absolute inset-0 
                            ${isDark 
                                ? 'bg-gradient-to-b from-black/30 via-transparent to-black/50' 
                                : 'bg-gradient-to-b from-white/30 via-transparent to-white/50'}`} 
                        />
                    </div>

                    {/* siderays shader overlay (cinematic mode only) */}
                    {enableSideRays && (
                        <div
                            className="absolute inset-0 z-[1] pointer-events-none"
                            style={{
                                maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
                                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)"
                            }}
                        >
                            <SideRays
                                speed={1.5}
                                rayColor1={isDark ? '#00d8ff' : '#0ea5e9'}
                                rayColor2={isDark ? '#6d28d9' : '#8b5cf6'}
                                intensity={isDark ? 2.5 : 1.5}
                                spread={2.5}
                                origin="top-right"
                                tilt={-5}
                                saturation={1.0}
                                blend={0.5}
                                falloff={0.6}
                                opacity={1.0}
                            />
                        </div>
                    )}

                    {/* ─── content layer ─── */}
                    <div className="relative z-10">

                        {/* section heading - anurati gradient, massive */}
                        <div className="pt-20 sm:pt-28 pb-6 px-8 sm:px-14 lg:px-20">
                            {/* <p className={`text-sm font-mono tracking-widest uppercase mb-5
                                ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                Discover Capabilities
                            </p> */}
                            <GradientHeading
                                text="Everything you need."
                                theme={theme}
                                className="text-4xl sm:text-5xl lg:text-7xl font-anurati tracking-widest uppercase leading-tight"
                            />
                        </div>

                        {/* ─── tab showcase ──────────────────────────────── */}
                        <div className="px-8 sm:px-14 lg:px-20 pb-16 pt-8 grid lg:grid-cols-[1fr_1.5fr] xl:grid-cols-[1fr_2fr] gap-12 lg:gap-16 items-center">

                            {/* left: tab navigation with connecting line */}
                            <div className="flex flex-col gap-3 relative">
                                {/* vertical connecting line for visual rhythm */}
                                <div className={`absolute left-0 top-4 bottom-4 w-px 
                                    ${isDark ? "bg-white/10" : "bg-black/10"}`}
                                />

                                {showcaseFeatures.map((feature, idx) => {
                                    const isActive = activeTab === idx;
                                    return (
                                        <button
                                            key={feature.id}
                                            onClick={() => setActiveTab(idx)}
                                            className={`relative pl-6 py-4 pr-4 text-left transition-all duration-300 rounded-r-2xl border-l-[3px] border-transparent group
                                                ${isActive ? (isDark ? 'shadow-[0_0_40px_rgba(255,255,255,0.05)]' : 'shadow-[0_0_40px_rgba(0,0,0,0.05)]') : ''}
                                            `}
                                        >
                                            {/* shapeblur background on active tab */}
                                            {isActive && (
                                                <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 ${isDark ? 'opacity-30' : 'opacity-10 invert'}`}>
                                                    <ShapeBlur variation={0} shapeSize={0.98} roundness={0.15} borderSize={0.02} circleSize={0.4} circleEdge={0.8} />
                                                </div>
                                            )}

                                            <div className="relative z-10">
                                                <h3 className={`text-xl sm:text-2xl font-black mb-2 tracking-tight transition-colors duration-300
                                                    ${isActive
                                                        ? (isDark ? "text-white" : "text-black")
                                                        : (isDark ? "text-white/70 group-hover:text-white" : "text-black/70 group-hover:text-black")
                                                    }
                                                `}>
                                                    {feature.title}
                                                </h3>

                                                {/* expandable description - only visible on active tab */}
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
                                                                ${isDark ? "text-blue-400" : "text-blue-600"}`}
                                                            >
                                                                <span className="w-4 h-[1px] bg-current opacity-50" />
                                                                {feature.badge}
                                                            </div>
                                                            <p className={`text-sm sm:text-base leading-relaxed
                                                                ${isDark ? "text-white/60" : "text-black/60"}`}
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

                            {/* right: screenshot showcase with borderglow */}
                            <BorderGlow
                                className="cursor-target relative w-full aspect-video lg:aspect-[4/3] xl:aspect-video overflow-hidden group shadow-2xl"
                                borderRadius={32}
                                backgroundColor={isDark ? '#0f0f11' : '#f4f4f5'}
                                glowColor={isDark ? '220 100 60' : '220 80 50'}
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
                                        {showcaseFeatures[activeTab].imageSrcs.map((src, i) => (
                                            <Image
                                                key={src}
                                                src={src}
                                                alt={showcaseFeatures[activeTab].title}
                                                fill
                                                className={`object-cover transition-opacity duration-1000 ease-in-out
                                                    ${i === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                                                priority={activeTab === 0 && i === 0}
                                            />
                                        ))}
                                    </motion.div>
                                </AnimatePresence>

                                {/* dot indicators for multi-image features */}
                                {showcaseFeatures[activeTab].imageSrcs.length > 1 && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                        {showcaseFeatures[activeTab].imageSrcs.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1.5 transition-all duration-500 rounded-full
                                                    ${i === currentImgIndex
                                                        ? `w-8 ${isDark ? "bg-white" : "bg-black"}`
                                                        : `w-2 ${isDark ? "bg-white/30" : "bg-black/30"}`}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </BorderGlow>
                        </div>


                        {/* ─── extras: inline prose, stripe-style ────────
                            no cards, no icon boxes. each feature is a 
                            single flowing statement: bold name, period,
                            then lighter description text. tags sit inline 
                            as tiny mono badges. the whole thing reads
                            like editorial copy, not a feature matrix. */}
                        <div className={`border-t mx-8 sm:mx-14 lg:mx-20
                            ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`} />

                        <div className="px-8 sm:px-14 lg:px-20 pt-14 pb-20">
                            <p className={`text-[11px] font-mono tracking-[0.3em] uppercase mb-12
                                ${isDark ? 'text-white/25' : 'text-black/25'}`}>
                                And there&apos;s more
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-10">
                                {extras.map((f, i) => (
                                    <motion.div
                                        key={f.name}
                                        initial={{ opacity: 0, y: 8 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05, duration: 0.4 }}
                                    >
                                        <p className="text-[15px] sm:text-base leading-[1.7]">
                                            <span className={`font-bold ${isDark ? 'text-white' : 'text-[#1a1f36]'}`}>
                                                {f.name}.
                                            </span>
                                            {" "}
                                            <span className={isDark ? 'text-white/45' : 'text-[#425466]'}>
                                                {f.desc}
                                            </span>
                                            {f.tag && (
                                                <span className={`ml-2 text-[10px] font-semibold tracking-wide align-middle px-1.5 py-0.5 rounded
                                                    ${isDark ? 'bg-amber-500/15 text-amber-300/80' : 'bg-amber-100 text-amber-700'}`}>
                                                    {f.tag}
                                                </span>
                                            )}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
