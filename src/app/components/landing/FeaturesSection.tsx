"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GradientHeading } from "./GradientHeading";
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


// ─── bento card image component ─────────────────────────────────
// handles rendering screenshot backgrounds for each bento card.
// for features with multiple images (like customise with 5 screenshots),
// it automatically crossfades between them on a 3.5s interval.
// for single-image features, it's just a static next/image fill.
const BentoCardImages = ({ srcs, alt, imageClassName = "object-cover" }: { srcs: string[]; alt: string; imageClassName?: string }) => {
    const [currentIdx, setCurrentIdx] = useState(0);

    useEffect(() => {
        if (srcs.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIdx(prev => (prev + 1) % srcs.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [srcs]);

    return (
        <div className="absolute inset-0 z-0 transition-transform duration-700 ease-out group-hover:scale-[1.04] transform-gpu">
            {srcs.map((src, i) => {
                // To save memory/rendering on laggy devices, only render the image if it's 
                // the current one, or if there's only one. For multiple images, keep them
                // loaded but heavily hint the browser to GPU-accelerate them.
                return (
                    <Image
                        key={src}
                        src={src}
                        alt={alt}
                        fill
                        className={`${imageClassName} transition-opacity duration-1000 ease-in-out transform-gpu will-change-opacity
                            ${i === currentIdx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                    />
                );
            })}
        </div>
    );
};


export const FeaturesSection = ({ theme, enableSideRays = false }: { theme: "dark" | "light"; enableSideRays?: boolean }) => {
    const isDark = theme === "dark";
    const [activeModal, setActiveModal] = useState<typeof showcaseFeatures[0] | null>(null);
    const [showExtras, setShowExtras] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    // close modal on escape key
    useEffect(() => {
        if (!activeModal) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setActiveModal(null);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [activeModal]);

    // prevent body scroll when modal is open
    useEffect(() => {
        if (activeModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [activeModal]);


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
                <div className="relative">

                    {/* background & siderays layer - safely clipped here without affecting content layer */}
                    <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden transform-gpu">
                        <div className={`absolute inset-0 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#15171e]'}`}>
                            <div className={`absolute inset-0 
                                ${isDark 
                                    ? 'bg-gradient-to-b from-black/30 via-transparent to-black/50' 
                                    : 'bg-gradient-to-b from-black/20 via-transparent to-black/40'}`} 
                            />
                        </div>

                        {/* siderays shader overlay (cinematic mode only) */}
                        {enableSideRays && (
                            <div
                                className="absolute inset-0 z-[1] pointer-events-none transform-gpu"
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
                    </div>

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

                        {/* ─── bento grid showcase ──────────────────────────
                            replaces the old tab-based layout. every feature
                            is simultaneously visible as its own card with
                            a screenshot background and text overlay. grid
                            uses asymmetric row/col spans per feature for
                            a masonry-like bento feel. */}
                        <div className="px-6 sm:px-10 lg:px-16 pb-16 pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[280px] sm:auto-rows-[320px]">
                                {showcaseFeatures.map((feature, idx) => {
                                    // grid placement rules - specific features
                                    // get larger cells to create bento asymmetry
                                    const spanClass = (() => {
                                        switch (feature.id) {
                                            case "store": return "md:col-span-2 lg:col-span-2";
                                            case "customise": return "md:col-span-2 lg:col-span-2 lg:row-span-2";
                                            case "studio": return "md:col-span-1 lg:row-span-2";
                                            default: return "";
                                        }
                                    })();

                                    return (
                                        <motion.div
                                            key={feature.id}
                                            onClick={() => setActiveModal(feature)}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-40px" }}
                                            transition={{ delay: idx * 0.06, duration: 0.5 }}
                                            className={`relative rounded-3xl overflow-hidden group cursor-pointer ${spanClass}`}
                                        >
                                            {/* screenshot background with crossfade support.
                                                for features with multiple images, the
                                                BentoCardImage component handles the cycling.
                                                for single-image features, it's just a
                                                static next/image fill. */}
                                            <BentoCardImages
                                                srcs={feature.imageSrcs}
                                                alt={feature.title}
                                                imageClassName={
                                                    feature.id === "store" || feature.id === "customise"
                                                        ? "object-contain p-4" // padding added so it doesn't hug the very edge of the card
                                                        : "object-cover"
                                                }
                                            />


                                            {/* gradient overlay - ensures text readability
                                                over any screenshot content. heavier at
                                                the bottom where the text sits. */}
                                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

                                            {/* content layer - badge, title, description */}
                                            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-7">
                                                {/* tiny mono badge */}
                                                <div className="flex items-center gap-2 mb-2.5">
                                                    <span className="w-3 h-[1px] bg-blue-400/50" />
                                                    <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-blue-400/80">
                                                        {feature.badge}
                                                    </span>
                                                </div>

                                                {/* feature title - large, bold */}
                                                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2 leading-tight">
                                                    {feature.title}
                                                </h3>

                                                {/* description - subtle, only visible on hover
                                                    for smaller cards to save space. always
                                                    visible on larger spanned cards. */}
                                                <p className={`text-[13px] sm:text-sm leading-relaxed text-white/50 max-w-md
                                                    ${feature.id === "store" || feature.id === "customise"
                                                        ? ""
                                                        : "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    }`}>
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>


                        {/* ─── extras: inline prose, stripe-style ────────
                            no cards, no icon boxes. each feature is a 
                            single flowing statement: bold name, period,
                            then lighter description text. tags sit inline 
                            as tiny mono badges. the whole thing reads
                            like editorial copy, not a feature matrix. */}
                        <div className={`border-t mx-8 sm:mx-14 lg:mx-20 border-white/[0.06]`} />

                        <div className="px-8 sm:px-14 lg:px-20 pt-14 pb-20 flex flex-col items-center text-center">
                            <button
                                onClick={() => setShowExtras(!showExtras)}
                                className={`group flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300 shadow-sm hover:shadow-md
                                    ${isDark 
                                        ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 text-white/60 hover:text-white" 
                                        : "bg-black/[0.03] border-black/10 hover:bg-black/[0.06] hover:border-black/20 text-black/60 hover:text-black"}`}
                            >
                                <p className="text-[11px] font-mono tracking-[0.2em] uppercase">
                                    {showExtras ? "Show less" : "And there's more"}
                                </p>
                                <motion.div
                                    animate={{ rotate: showExtras ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease: "backOut" }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {showExtras && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="overflow-hidden w-full"
                                    >
                                        <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 text-left">
                                            {extras.map((f, i) => (
                                                <motion.div
                                                    key={f.name}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                                    className={`p-6 sm:p-8 rounded-2xl border transition-colors
                                                        ${isDark 
                                                            ? "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]" 
                                                            : "bg-black/[0.02] border-black/[0.05] hover:bg-black/[0.04]"}`}
                                                >
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h4 className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                                                            {f.name}
                                                        </h4>
                                                        {f.tag && (
                                                            <span className="text-[9px] font-mono tracking-[0.1em] uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                                                                {f.tag}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-[14px] sm:text-[15px] leading-relaxed
                                                        ${isDark ? "text-white/50" : "text-black/50"}`}>
                                                        {f.desc}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>

            </div>

            {/* ─── Image Modal ────────────────────────────────────────────── */}
            {mounted && createPortal(
                <AnimatePresence>
                    {activeModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[9999] overflow-hidden"
                        >
                            <div
                                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                                onClick={() => setActiveModal(null)}
                            />

                            <button
                                onClick={() => setActiveModal(null)}
                                className="fixed top-4 right-4 sm:top-8 sm:right-8 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors z-[210]"
                                aria-label="Close modal"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>

                            <motion.div
                                data-lenis-prevent
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 30, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative z-[205] h-full overflow-y-auto overscroll-contain px-4 sm:px-8 py-16 sm:py-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                            >
                                <div className="max-w-5xl mx-auto mb-12 text-center">
                                    <div className="inline-flex items-center gap-2 mb-3">
                                        <span className="w-4 h-[1px] bg-blue-400" />
                                        <span className="text-xs font-mono tracking-widest uppercase text-blue-400">
                                            {activeModal.badge}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl sm:text-4xl font-outfit font-[200] tracking-[0.1em] uppercase text-white mb-4">
                                        {activeModal.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto">
                                        {activeModal.description}
                                    </p>
                                </div>

                                <div className="max-w-6xl mx-auto flex flex-col gap-12">
                                    {activeModal.imageSrcs.map((src, i) => (
                                        <div key={src} className="relative w-full aspect-video sm:aspect-auto sm:min-h-[600px] rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-2xl">
                                            <Image
                                                src={src}
                                                alt={`${activeModal.title} screenshot ${i + 1}`}
                                                fill
                                                className="object-contain p-2 sm:p-4"
                                                sizes="100vw"
                                                quality={100}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-16" />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </section>
    );
}
