"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { GradientHeading } from "./GradientHeading";

// hardware verification cards highlighting directx11 imf compositor metrics and gpu telemetry
const statCards = [
    {
        stat: "~1-5%",
        label: "GPU",
        detail: "Hardware acceleration with near-zero overhead, even running multi-monitor 8K 60FPS setups.",
        accent: false,
    },
    {
        stat: "D3D11",
        label: "Engine",
        detail: "DirectX 11 compositor architecture with zero-copy rendering via IMF and MPV for smooth playback.",
        accent: false,
    },
    {
        stat: "8K",
        label: "Ready",
        detail: "Full native 8K display support, independent monitor scaling, and real-time audio reactivity.",
        accent: true,
        href: "/download",
    },
];

// features registry mapping interactive capabilities to respective image assets and telemetry specifications
const showcaseFeatures = [
    {
        id: "widgets",
        title: "Widgets",
        subtitle: "HTML5 Desktop Overlay Engine",
        description: "Desktop widgets powered by modern web technology. Add live calendars, clocks, or custom system information directly onto your desktop.",
        badge: "HTML · JS · Pinned",
        thumbnailSrc: "/widgets.webp",
        imageSrcs: ["/widgets.webp"],
        techSpecs: [
            { label: "Runtime", value: "WebView2 / Chromium" },
            { label: "Input Latency", value: "< 1.2ms input delay" },
            { label: "Hook Type", value: "Direct desktop plane hook" },
            { label: "Idle Telemetry", value: "0.2% CPU idle" }
        ]
    },
    {
        id: "library",
        title: "Library",
        subtitle: "Offline-First Asset Manager",
        description: "Your personal collection. Completely offline-first with automatic thumbnails and instant previews. Link local files or save directly from the store.",
        badge: "Local · Offline · Instant",
        thumbnailSrc: "/Library.webp",
        imageSrcs: ["/Library.webp"],
        techSpecs: [
            { label: "Database", value: "SQLite local cache" },
            { label: "Indexing", value: "Async thumbnail thread" },
            { label: "Formats", value: "MP4, WebM, GIF, Shaders, EXE" },
            { label: "Privacy", value: "Zero telemetry offline mode" }
        ]
    },
    {
        id: "customise",
        title: "Customise",
        subtitle: "Hardware Compositor Control",
        description: "Unmatched performance and deep desktop control. Style your Windows taskbar with acrylic blur, configure multi-monitor setups, and tweak renderer presets.",
        badge: "Rust · Tauri · Low Overhead",
        thumbnailSrc: "/PEAKmodalpreview.webp",
        imageSrcs: ["/multi.webp", "/PEAKmodalpreview.webp", "/taskbar.webp", "/ADV.webp", "/perf.webp"],
        techSpecs: [
            { label: "Core", value: "Tauri v2 / Rust native" },
            { label: "Compositor", value: "DirectX 11 swapchain" },
            { label: "Displays", value: "Independent multi-display clocking" },
            { label: "Taskbar Hook", value: "DWM acrylic backdrop injection" }
        ]
    },
    {
        id: "store",
        title: "Store",
        subtitle: "Unified Community Repository",
        description: "Access thousands of wallpapers curated from 8+ sources through one unified search bar. Discover infinite inspiration without needing an account.",
        badge: "8 Sources · 4K/8K · Unified",
        thumbnailSrc: "/STORE.webp",
        imageSrcs: ["/STORE.webp", "/modal.webp"],
        techSpecs: [
            { label: "Catalog", value: "8 aggregated registries" },
            { label: "Resolution", value: "Up to native 8K masters" },
            { label: "Delivery", value: "Edge-cached multi-source proxy" },
            { label: "Search Index", value: "Prebuilt JSON dictionary" }
        ]
    },
    {
        id: "studio",
        title: "Studio",
        subtitle: "Node Graph Scene Authoring",
        description: "Build your own native scene wallpapers using our visual node editor. Combine image layers, video, real-time audio-reactive shaders, and particle systems effortlessly.",
        badge: "Node-Based · D3D11 · Particles",
        thumbnailSrc: "/studio.webp",
        imageSrcs: ["/studio.webp"],
        techSpecs: [
            { label: "Graph Engine", value: "Acyclic node evaluation" },
            { label: "Audio Reactive", value: "WASAPI loopback FFT 128-band" },
            { label: "Shaders", value: "HLSL / GLSL realtime pipeline" },
            { label: "Compute", value: "DirectX 11 compute particles" }
        ]
    }
];

export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    // active modal feature state for screenshot and telemetry inspection
    const [activeModalFeature, setActiveModalFeature] = useState<number | null>(null);

    // full video demo modal toggle state
    const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

    // video modal mute toggle state
    const [isMuted, setIsMuted] = useState<boolean>(true);

    // reference to horizontal card scroller track for programmatic category navigation
    const carouselRef = useRef<HTMLDivElement | null>(null);

    // step horizontal carousel left or right
    const handleStepCarousel = (direction: "left" | "right") => {
        if (!carouselRef.current) return;
        const scrollAmount = 320;
        carouselRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    // body scroll lock synchronizer when inspection modal is active
    useEffect(() => {
        if (activeModalFeature !== null || isVideoModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [activeModalFeature, isVideoModalOpen]);

    // keyboard escape listener for modal dismissal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setActiveModalFeature(null);
                setIsVideoModalOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const modalFeature = activeModalFeature !== null ? showcaseFeatures[activeModalFeature] : null;

    return (
        <section className="hidden md:block relative w-full overflow-hidden">
            {/* headline and architectural proof points */}
            <div className="pt-28 pb-8 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7 }}
                        className="mb-14 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-16"
                    >
                        <div className="flex-shrink-0">
                            <div className="flex items-center gap-3 mb-4 ml-1 flex-wrap">
                                <p className={`text-xs font-mono uppercase tracking-[0.2em] ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                    Under Active Development
                                </p>
                                <span className={`text-xs ${isDark ? "text-white/15" : "text-black/15"}`}>&middot;</span>
                                <a
                                    href="https://patron.colorwall.xyz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs font-mono tracking-wider transition-colors duration-300 ${isDark ? "text-white/35 hover:text-white/80" : "text-black/35 hover:text-black/80"
                                        }`}
                                >
                                    Supported by patrons &#9829;
                                </a>
                            </div>
                            <h2 className="text-4xl sm:text-6xl md:text-7xl font-outfit font-[200] tracking-[-0.04em] leading-[1.02]">
                                <GradientHeading
                                    text="Performance"
                                    theme={theme}
                                    as="span"
                                    className="inline-block font-outfit font-[200]"
                                />
                                <br />
                                <span className={isDark ? "text-white/40" : "text-black/40"}>
                                    without compromise.
                                </span>
                            </h2>
                        </div>

                        <p className={`cursor-target relative p-4 -m-4 max-w-md text-base sm:text-lg leading-relaxed font-spline lg:text-right ${isDark ? "text-white/50" : "text-black/50"
                            }`}>
                            Colorwall delivers smooth dynamic motion with minimal resource usage. It isn&apos;t a compromise—it&apos;s engineered to perform.
                        </p>
                    </motion.div>

                    {/* stat cards row with outfit typography */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-14"
                    >
                        {statCards.map((card) => {
                            const cardClasses = `cursor-target group relative rounded-2xl p-7 sm:p-8 transition-all duration-500 overflow-hidden ${card.accent
                                ? isDark
                                    ? "bg-[#0078d4] text-white hover:bg-[#006cbd]"
                                    : "bg-[#111111] text-white hover:bg-[#1a1a1a]"
                                : isDark
                                    ? "border border-white/10 bg-white/[0.02]"
                                    : "border border-black/10 bg-black/[0.02]"
                                }`;

                            const cardContent = (
                                <>
                                    <div className="flex items-start justify-between mb-4">
                                        <span className={`text-4xl sm:text-5xl font-outfit font-[200] tracking-tight leading-none ${card.accent ? "text-white" : isDark ? "text-white" : "text-black"
                                            }`}>
                                            {card.stat}
                                            <span className={`text-base font-normal ml-2 tracking-normal ${card.accent ? "text-white/70" : isDark ? "text-white/40" : "text-black/40"}`}>
                                                {card.label}
                                            </span>
                                        </span>
                                        {card.accent ? (
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white text-lg mt-1 group-hover:scale-110 group-hover:translate-x-0.5 transition-transform duration-300">
                                                &rarr;
                                            </span>
                                        ) : (
                                            <span className={`text-xl mt-1 ${isDark ? "text-white/20" : "text-black/20"}`}>
                                                +
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm leading-relaxed font-spline ${card.accent ? "text-white/80" : isDark ? "text-white/45" : "text-black/55"
                                        }`}>
                                        {card.detail}
                                    </p>
                                </>
                            );

                            return card.href ? (
                                <Link key={card.label} href={card.href} className={`${cardClasses} block no-underline cursor-pointer`}>
                                    {cardContent}
                                </Link>
                            ) : (
                                <div key={card.label} className={cardClasses}>
                                    {cardContent}
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* flagship cinematic showcase hero card spanning the video demo and patron conversion hook */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-8">
                <div className="group relative w-full rounded-3xl overflow-hidden border border-white/15 bg-[#0b0c10] shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                        {/* video viewport on the left */}
                        <div className="lg:col-span-8 relative aspect-video w-full bg-black overflow-hidden">
                            <video
                                src="/editorial/editorialtest.webm"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                            >
                                <source src="/editorial/editorialtest.mp4" type="video/mp4" />
                            </video>

                            {/* top subtle overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                            {/* editorial film badge */}
                            {/* <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[11px] font-mono tracking-wider text-cyan-300">
                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                <span>Showcase Film · 1080p 60FPS</span>
                            </div> */}

                            {/* expand video modal button */}
                            {/* <button
                                type="button"
                                onClick={() => setIsVideoModalOpen(true)}
                                aria-label="Expand showcase video"
                                className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono tracking-wider hover:bg-white hover:text-black transition-all duration-300 cursor-pointer active:scale-95"
                            >
                                <Maximize2 className="w-4 h-4" />
                                <span>Expand Film</span>
                            </button> */}
                        </div>

                        {/* flagship editorial description on the right with patreon link */}
                        <div className="lg:col-span-4 p-8 sm:p-10 flex flex-col justify-between h-full border-t lg:border-t-0 lg:border-l border-white/10">
                            <div>
                                <div className="text-xs tracking-wider text-cyan-400 mb-2 font-medium">
                                    Performance first runtime. Comes With Non-chalant Aura.
                                </div>
                                <h3 className="text-4xl sm:text-5xl font-outfit font-[200] tracking-[-0.03em] text-white mb-4 leading-tight">
                                    Colorwall
                                </h3>
                                <p className="text-sm sm:text-base leading-relaxed text-white/70 font-spline mb-6">
                                    A next-generation desktop experience engineered in Rust and DirectX 11. Zero compromise on performance, infinite customization, and native fluid shaders built for high-refresh displays.
                                </p>
                            </div>

                            <div>
                                <div className="grid grid-cols-2 gap-2.5 mb-6">
                                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                                        <span className="block text-[11px] font-mono text-white/40 mb-0.5">
                                            Architecture
                                        </span>
                                        <span className="block text-xs font-mono font-medium text-white/90">
                                            Rust + D3D11
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                                        <span className="block text-[11px] font-mono text-white/40 mb-0.5">
                                            Overhead
                                        </span>
                                        <span className="block text-xs font-mono font-medium text-white/90">
                                            &lt; 1-5% GPU
                                        </span>
                                    </div>
                                </div>

                                {/* patreon support button with official patreon brand svg */}
                                <a
                                    href="https://patron.colorwall.xyz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 px-5 rounded-2xl border border-white/20 bg-black/40 hover:border-[#ff424D]/60 hover:bg-[#ff424D]/20 text-white hover:text-[#ff424D] text-xs font-mono tracking-wider transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-98"
                                >
                                    <svg viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4 inline-block">
                                        <path d="M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z" />
                                    </svg>
                                    <span>Become a Patron &#9829;</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* respective feature cards rendered horizontally in contained viewport deck */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-16">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs tracking-wider text-white/40">
                        *Does not represent everything. Just a Quick Feature Deck, One will find more in app, remember you are an beta tester.
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleStepCarousel("left")}
                            aria-label="Previous feature card"
                            className="w-9 h-9 rounded-full border border-white/10 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleStepCarousel("right")}
                            aria-label="Next feature card"
                            className="w-9 h-9 rounded-full border border-white/10 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* horizontal row of smaller cards containing their respective images */}
                <div
                    ref={carouselRef}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none"
                >
                    {showcaseFeatures.map((feat, index) => (
                        <motion.div
                            key={feat.id}
                            id={`small-card-${feat.id}`}
                            whileHover={{ y: -4 }}
                            onClick={() => setActiveModalFeature(index)}
                            className="cursor-pointer group relative shrink-0 w-64 sm:w-72 snap-start rounded-2xl overflow-hidden border border-white/10 bg-[#0d0e12]/80 hover:border-cyan-400/60 hover:bg-white/[0.04] transition-all duration-300 shadow-lg"
                        >
                            {/* respective screenshot image container */}
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/50">
                                <Image
                                    src={feat.thumbnailSrc}
                                    alt={feat.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                {/* inspect hint */}
                                {/* <div className="absolute bottom-2.5 right-2.5 z-10 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white/70 group-hover:text-cyan-300 group-hover:border-cyan-400/40 uppercase transition-colors duration-300">
                                    inspect &rarr;
                                </div> */}
                            </div>

                            {/* card content summary with outfit thin typography */}
                            <div className="p-4">
                                <h4 className="text-lg sm:text-xl font-outfit font-[300] tracking-tight text-white mb-1">
                                    {feat.title}
                                </h4>
                                <p className="text-xs leading-relaxed text-white/60 font-spline line-clamp-2">
                                    {feat.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* video film expand modal */}
            <AnimatePresence>
                {isVideoModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsVideoModalOpen(false)}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl rounded-3xl border border-white/15 bg-black shadow-2xl overflow-hidden p-4 sm:p-6"
                        >
                            <button
                                type="button"
                                onClick={() => setIsVideoModalOpen(false)}
                                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
                                aria-label="Close video modal"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black mb-4">
                                <video
                                    src="/editorial/editorialtest.webm"
                                    autoPlay
                                    loop
                                    muted={isMuted}
                                    playsInline
                                    className="w-full h-full object-cover"
                                >
                                    <source src="/editorial/editorialtest.mp4" type="video/mp4" />
                                </video>

                                <button
                                    type="button"
                                    onClick={() => setIsMuted((prev) => !prev)}
                                    className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-mono tracking-wider hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                                >
                                    {isMuted ? (
                                        <>
                                            <VolumeX className="w-4 h-4" />
                                            <span>Unmute Audio</span>
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-4 h-4 text-cyan-400" />
                                            <span>Sound Active</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h3 className="text-2xl font-outfit font-[200] text-white tracking-tight">
                                        Colorwall
                                    </h3>
                                    <p className="text-xs text-white/50 font-mono">
                                        1080p 60FPS · Hardware-Accelerated DirectX 11
                                    </p>
                                </div>
                                <a
                                    href="https://patron.colorwall.xyz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-[#ff424D]/20 hover:border-[#ff424D]/60 hover:text-[#ff424D] text-white text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-2"
                                >
                                    <svg viewBox="0 0 512 512" fill="currentColor" className="w-3.5 h-3.5 inline-block">
                                        <path d="M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z" />
                                    </svg>
                                    <span>Patreon</span>
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* feature deep inspection modal where vertical scrolling takes place */}
            <AnimatePresence>
                {modalFeature && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActiveModalFeature(null)}
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#0b0c10] shadow-[0_25px_80px_rgba(0,0,0,0.9)] p-6 sm:p-10 flex flex-col gap-8 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]"
                        >
                            {/* modal close button */}
                            <button
                                type="button"
                                onClick={() => setActiveModalFeature(null)}
                                className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* modal header with outfit thin typography */}
                            <div>
                                <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-cyan-400 mb-2 font-medium">
                                    <span>{modalFeature.badge}</span>
                                    <span className="text-white/20">&middot;</span>
                                    <span className="text-white/50">{modalFeature.subtitle}</span>
                                </div>
                                <h2 className="text-4xl sm:text-6xl font-outfit font-[200] tracking-[-0.03em] text-white mb-3">
                                    {modalFeature.title}
                                </h2>
                                <p className="text-sm sm:text-base leading-relaxed text-white/80 font-spline max-w-2xl">
                                    {modalFeature.description}
                                </p>
                            </div>

                            {/* feature primary screenshot showcase */}
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                                <Image
                                    src={modalFeature.thumbnailSrc}
                                    alt={modalFeature.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* technical specifications grid */}
                            <div>
                                <h4 className="text-xs font-mono tracking-wider text-white/40 mb-4 font-medium uppercase">
                                    Architectural Telemetry
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {modalFeature.techSpecs.map((spec) => (
                                        <div
                                            key={spec.label}
                                            className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between"
                                        >
                                            <span className="text-[11px] font-mono text-white/40 mb-1">
                                                {spec.label}
                                            </span>
                                            <span className="text-xs font-mono font-medium text-white/90">
                                                {spec.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* gallery of respective screenshot assets */}
                            {modalFeature.imageSrcs.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-mono tracking-wider text-white/40 mb-4 font-medium uppercase">
                                        Interface Previews
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {modalFeature.imageSrcs.map((imgSrc, imgIndex) => (
                                            <div
                                                key={imgSrc}
                                                className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40 group"
                                            >
                                                <Image
                                                    src={imgSrc}
                                                    alt={`${modalFeature.title} preview ${imgIndex + 1}`}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
