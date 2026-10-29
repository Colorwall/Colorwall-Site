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
        label: "gpu",
        detail: "Hardware Accel, Low GPU overhead even at 4K/8K 60FPS and Widgets. Built for performance.",
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
        detail: "Full 8K resolution support with multi-monitor layouts, studio, and never before seen performance.",
        accent: true,
        href: "/download",
    },
];

// features registry mapping interactive capabilities to respective image assets and telemetry specifications
const showcaseFeatures = [
    {
        id: "widgets",
        title: "WIDGETS",
        subtitle: "html5 desktop overlay engine",
        description: "desktop widgets powered by modern web tech. add calendars, clocks, or custom information directly to your desktop. clean, fast, and fully customizable.",
        badge: "HTML · JS · PINNED",
        thumbnailSrc: "/widgets.webp",
        imageSrcs: ["/widgets.webp"],
        techSpecs: [
            { label: "runtime", value: "webview2 / chromium" },
            { label: "latency", value: "< 1.2ms input delay" },
            { label: "placement", value: "direct desktop plane hook" },
            { label: "telemetry", value: "0.2% cpu idle" }
        ]
    },
    {
        id: "library",
        title: "LIBRARY",
        subtitle: "offline first asset manager",
        description: "your personal collection. offline-first with automatic thumbnails and instant previews. upload your own, link local files, or save from the store.",
        badge: "LOCAL · OFFLINE · CUTE",
        thumbnailSrc: "/Library.webp",
        imageSrcs: ["/Library.webp"],
        techSpecs: [
            { label: "storage", value: "sqlite local cache" },
            { label: "indexing", value: "asynchronous thumbnail thread" },
            { label: "format support", value: "mp4, webm, gif, shaders, exe" },
            { label: "sync", value: "zero telemetry offline mode" }
        ]
    },
    {
        id: "customise",
        title: "CUSTOMISE",
        subtitle: "hardware compositor control",
        description: "unmatched performance and control. built on rust & tauri for near-zero impact. style your taskbar with blur/acrylic effects, control multi-monitor setups, and tweak renderer presets.",
        badge: "RUST · TAURI · LOW OVERHEAD",
        thumbnailSrc: "/PEAKmodalpreview.webp",
        imageSrcs: ["/multi.webp", "/PEAKmodalpreview.webp", "/taskbar.webp", "/ADV.webp", "/perf.webp"],
        techSpecs: [
            { label: "core", value: "tauri v2 / rust core" },
            { label: "rendering", value: "directx11 swapchain" },
            { label: "monitors", value: "independent multi-display clocking" },
            { label: "taskbar", value: "dwm acrylic backdrop hook" }
        ]
    },
    {
        id: "store",
        title: "STORE",
        subtitle: "unified community repository",
        description: "access thousands of wallpapers from 8+ sources. one unified search bar, infinite inspiration without an account requirement.",
        badge: "8 SOURCES · 4K · UNIFIED",
        thumbnailSrc: "/STORE.webp",
        imageSrcs: ["/STORE.webp", "/modal.webp"],
        techSpecs: [
            { label: "sources", value: "8 aggregated registries" },
            { label: "resolution", value: "up to native 8k masters" },
            { label: "cdn", value: "edge cached multi-source proxy" },
            { label: "indexing", value: "prebuilt json dictionary" }
        ]
    },
    {
        id: "studio",
        title: "STUDIO",
        subtitle: "node graph scene authoring",
        description: "build your own native scene wallpapers using our built-in node editor. combine images, video layers, real-time audio-reactive shaders, and particle systems effortlessly.",
        badge: "NODE-BASED · D3D11 · PARTICLES",
        thumbnailSrc: "/studio.webp",
        imageSrcs: ["/studio.webp"],
        techSpecs: [
            { label: "graph engine", value: "acyclic node evaluation" },
            { label: "audio hook", value: "wasapi loopback fft 128-band" },
            { label: "shaders", value: "hlsl / glsl realtime transpiler" },
            { label: "particles", value: "gpu compute directx11 compute shader" }
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
        const scrollAmount = 300;
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
                                    under active development
                                </p>
                                <span className={`text-xs ${isDark ? "text-white/15" : "text-black/15"}`}>&middot;</span>
                                <a
                                    href="https://patron.colorwall.xyz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs font-mono uppercase tracking-[0.2em] transition-colors duration-300 ${
                                        isDark ? "text-white/25 hover:text-white/60" : "text-black/25 hover:text-black/60"
                                    }`}
                                >
                                    Supported by patrons &#9829;
                                </a>
                            </div>
                            <GradientHeading
                                text={"Performance\nwithout compromise."}
                                theme={theme}
                                className="text-4xl sm:text-5xl md:text-6xl font-anurati tracking-widest uppercase whitespace-pre-wrap leading-[1.1]"
                            />
                        </div>

                        <p className={`cursor-target relative p-4 -m-4 max-w-md text-base sm:text-lg leading-relaxed font-spline lg:text-right ${
                            isDark ? "text-white/50" : "text-black/50"
                        }`}>
                            Colorwall performs with minimal resource usage, It isn&apos;t a crutch. It&apos;s engineered to perform.
                        </p>
                    </motion.div>

                    {/* stat cards row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-14"
                    >
                        {statCards.map((card) => {
                            const cardClasses = `cursor-target group relative rounded-2xl p-7 sm:p-8 transition-all duration-500 overflow-hidden ${
                                card.accent
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
                                        <span className={`text-4xl sm:text-5xl font-anurati tracking-widest uppercase leading-none ${
                                            card.accent ? "text-white" : isDark ? "text-white" : "text-black"
                                        }`}>
                                            {card.stat}
                                            <span className={`text-lg font-medium ml-1 ${card.accent ? "text-white/70" : isDark ? "text-white/40" : "text-black/40"}`}>
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
                                    <p className={`text-sm leading-relaxed font-spline ${
                                        card.accent ? "text-white/70" : isDark ? "text-white/40" : "text-black/50"
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

                            {/* expand video modal button */}
                            {/* <button
                                type="button"
                                onClick={() => setIsVideoModalOpen(true)}
                                aria-label="expand showcase video"
                                className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 cursor-pointer active:scale-95"
                            >
                                <Maximize2 className="w-4 h-4" />
                                <span>expand?</span>
                            </button> */}
                        </div>

                        {/* flagship editorial description on the right with patreon link */}
                        <div className="lg:col-span-4 p-8 sm:p-10 flex flex-col justify-between h-full border-t lg:border-t-0 lg:border-l border-white/10">
                            <div>
                                <div className="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 mb-2">
                                    The Next-gen wallpaper runtime
                                </div>
                                <h3 className="text-3xl sm:text-4xl font-anurati tracking-wider text-white uppercase mb-4">
                                    COLORWALL
                                </h3>
                                <p className="text-sm sm:text-base leading-relaxed text-white/70 font-spline mb-6">
                                    A next-generation desktop experience engineered in Rust and DirectX 11. Zero compromise on performance, infinite customization, and native fluid shaders built for high-refresh displays.
                                </p>
                            </div>

                            <div>
                                <div className="grid grid-cols-2 gap-2.5 mb-6">
                                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                                        <span className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-0.5">
                                            architecture
                                        </span>
                                        <span className="block text-xs font-mono font-medium text-white/90">
                                            rust + d3d11
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                                        <span className="block text-[10px] font-mono uppercase tracking-wider text-white/40 mb-0.5">
                                            overhead
                                        </span>
                                        <span className="block text-xs font-mono font-medium text-white/90">
                                            &lt; 1-5% gpu
                                        </span>
                                    </div>
                                </div>

                                {/* patreon support button with official patreon brand svg */}
                                <a
                                    href="https://patron.colorwall.xyz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 px-5 rounded-2xl border border-white/20 bg-black/40 hover:border-[#ff424D]/60 hover:bg-[#ff424D]/20 text-white hover:text-[#ff424D] text-xs font-mono uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-98"
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
                    <span className="text-xs font-mono uppercase text-white/40  ">
                        More WLittle Features you will see in app c:
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleStepCarousel("left")}
                            aria-label="previous card"
                            className="w-9 h-9 rounded-full border border-white/10 bg-black/50 backdrop-blur-xl text-white/70 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleStepCarousel("right")}
                            aria-label="next card"
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

                            {/* card content summary */}
                            <div className="p-4">
                                <h4 className="text-base sm:text-lg font-anurati tracking-wider text-white uppercase mb-1">
                                    {feat.title}
                                </h4>
                                <p className="text-[11px] leading-relaxed text-white/60 font-spline line-clamp-2">
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
                                aria-label="close video modal"
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
                                    className="absolute bottom-4 right-4 z-10 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                                >
                                    {isMuted ? (
                                        <>
                                            <VolumeX className="w-4 h-4" />
                                            <span>unmute audio</span>
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-4 h-4 text-cyan-400" />
                                            <span>sound active</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h3 className="text-xl font-anurati text-white uppercase tracking-wider">
                                        COLORWALL EDITORIAL FILM
                                    </h3>
                                    <p className="text-xs text-white/50 font-mono">
                                        1080P 60FPS · HARDWARE ACCELERATED DIRECTX 11
                                    </p>
                                </div>
                                <a
                                    href="https://patron.colorwall.xyz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-[#ff424D]/20 hover:border-[#ff424D]/60 hover:text-[#ff424D] text-white text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
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
                                aria-label="close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* modal header */}
                            <div>
                                <div className="flex items-center gap-2 text-xs font-mono tracking-[0.25em] text-cyan-400 uppercase mb-2">
                                    <span>{modalFeature.badge}</span>
                                    <span className="text-white/20">&middot;</span>
                                    <span className="text-white/50">{modalFeature.subtitle}</span>
                                </div>
                                <h2 className="text-3xl sm:text-5xl font-anurati tracking-wider text-white uppercase mb-3">
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
                                <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-white/40 mb-4">
                                    architectural telemetry
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {modalFeature.techSpecs.map((spec) => (
                                        <div
                                            key={spec.label}
                                            className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between"
                                        >
                                            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
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
                                    <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-white/40 mb-4">
                                        interface previews
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
