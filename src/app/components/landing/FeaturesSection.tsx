"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, type MotionValue } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GradientHeading } from "./GradientHeading";
import { ScrollTransitionCanvas } from "../three/ScrollTransitionCanvas";

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
// these are the 7 major features rendered as fullscreen scroll-driven slides.
// each slide occupies 100vh and crossfades into the next via scroll progress.
const showcaseFeatures = [
    {
        id: "store",
        title: "STORE",
        description: "Access thousands of wallpapers from 8+ sources. One unified search bar, infinite inspiration \u2014 no account needed.",
        badge: "8 SOURCES \u00b7 4K \u00b7 UNIFIED",
        imageSrcs: ["/STORE.webp", "/modal.webp"]
    },
    {
        id: "library",
        title: "LIBRARY",
        description: "Your personal collection. Offline-first with automatic thumbnails and instant previews. Upload your own, link local files, or save from the store.",
        badge: "LOCAL \u00b7 OFFLINE \u00b7 CUTE",
        imageSrcs: ["/Library.webp"]
    },
    {
        id: "customise",
        title: "CUSTOMISE",
        description: "unmatched performance and control. built on rust & tauri for near-zero impact. style your taskbar with blur/acrylic effects, control multi-monitor setups, and tweak renderer presets.",
        badge: "RUST \u00b7 TAURI \u00b7 LOW OVERHEAD",
        imageSrcs: ["/multi.webp", "/PEAKmodalpreview.webp", "/taskbar.webp", "/ADV.webp", "/perf.webp"]
    },
    {
        id: "widgets",
        title: "WIDGETS",
        description: "desktop widgets powered by modern web tech. add calendars, clocks, or custom information directly to your desktop. clean, fast, and fully customizable.",
        badge: "HTML \u00b7 JS \u00b7 PINNED",
        imageSrcs: ["/widgets.webp"]
    },
    {
        id: "studio",
        title: "STUDIO",
        description: "build your own native scene wallpapers using our built-in node editor. combine images, video layers, real-time audio-reactive shaders, and particle systems effortlessly.",
        badge: "NODE-BASED \u00b7 D3D11 \u00b7 PARTICLES",
        imageSrcs: ["/studio.webp"]
    },
    {
        id: "interactive",
        title: "INTERACTIVE",
        description: "wallpapers that come alive. fully interactive html5 canvases and webgl shaders that respond to your mouse movements and clicks. your desktop is now a playground.",
        badge: "WEBGL \u00b7 DYNAMIC \u00b7 INTERACTIVE",
        imageSrcs: ["/INTERACTIVES.webp"]
    },
    {
        id: "discordrpc",
        title: "DISCORD RPC",
        description: "show off your current wallpaper or project to your friends on discord. automatically syncs your active scene or widget directly to your profile.",
        badge: "SYNCED \u00b7 SOCIAL \u00b7 FLEX",
        imageSrcs: ["/discordrpc.webp"]
    }
];

// ─── secondary features ─────────────────────────────────────────
// features without dedicated screenshots. rendered as a simple grid
// below the scroll showcase. always visible, no toggle.


// ─── fullscreen feature slide ───────────────────────────────────
// Renders inside a single sticky container. All slides sit on top
// of each other (absolute). Opacity is driven by scroll progress.
const FeatureSlide = ({
    feature,
    index,
    total,
    activeIndex,
    isStatic = false,
}: {
    feature: typeof showcaseFeatures[0];
    index: number;
    total: number;
    activeIndex: number;
    isStatic?: boolean;
}) => {
    // sharp boolean text opacity to sync with webgl physics engine
    const isActive = isStatic || activeIndex === index;
    const textOpacity = isActive ? 1 : 0;

    return (
        <motion.div className="absolute inset-0 pointer-events-none">
            {/* text content with framer motion opacity animation */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-20 z-10 pointer-events-none will-change-[opacity]"
                animate={{ opacity: textOpacity }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                initial={false}
            >
                <div className="max-w-3xl">
                    <div className="flex items-center gap-2.5 mb-4">
                        <span className="w-6 h-[1px] bg-blue-400/50" />
                        <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-blue-400/80">
                            {feature.badge}
                        </span>
                    </div>

                    <h3 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white mb-3 sm:mb-5 leading-[0.95] drop-shadow-2xl">
                        {feature.title}
                    </h3>

                    <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-white/70 max-w-xl font-spline drop-shadow-lg">
                        {feature.description}
                    </p>
                </div>
            </motion.div>

            {/* slide counter */}
            <motion.div
                className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 lg:bottom-20 lg:right-20 z-10 pointer-events-none will-change-[opacity]"
                style={{ opacity: textOpacity }}
            >
                <span className="text-xs font-mono tracking-widest text-white/30">
                    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
            </motion.div>
        </motion.div>
    );
};


export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";
    const containerRef = useRef<HTMLDivElement>(null);
    const [isExited, setIsExited] = useState(false);
    const [showExit, setShowExit] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLocked, setIsLocked] = useState(false);

    // track when the section enters near top of viewport to lock wheel inputs
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            // section locks when top reaches near top of viewport
            const locked = rect.top <= 120 && rect.bottom >= 120;
            setIsLocked(locked);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // handle slide change from webgl canvas and align active index state without triggering window scroll lag
    const handleSlideChange = (index: number) => {
        setActiveIndex(index);
    };

    // scroll page smoothly past the showcase section into the sections below
    const handleExitDown = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const targetY = window.scrollY + rect.bottom + 20;
            window.scrollTo({ top: targetY, behavior: "smooth" });
        }
    };

    // scroll page smoothly above the showcase section into the hero section above
    const handleExitUp = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const targetY = window.scrollY + rect.top - window.innerHeight - 20;
            window.scrollTo({ top: targetY, behavior: "smooth" });
        }
    };

    // This handles the crossfade once it is locked at the top
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // show exit button when active inside showcase beyond first slide
    useEffect(() => {
        setShowExit(isLocked && activeIndex > 0);
    }, [isLocked, activeIndex]);

    // This handles the entry animation (the card scaling up into fullscreen)
    const { scrollYProgress: entryProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "start start"],
    });

    // This handles the exit animation (the fullscreen scaling down into a card)
    const { scrollYProgress: exitProgress } = useScroll({
        target: containerRef,
        offset: ["end end", "end start"],
    });

    const scale = useTransform(() => {
        if (isExited) return 0.85;
        const e = entryProgress.get();
        const x = exitProgress.get();
        if (e < 1) return 0.85 + (e * 0.15);
        if (x > 0) return 1 - (x * 0.15);
        return 1;
    });

    const borderRadius = useTransform(() => {
        if (isExited) return "40px";
        const e = entryProgress.get();
        const x = exitProgress.get();
        // Starts at 40px, shrinks to 24px when fully "zoomed in"
        if (e < 1) return `${40 - (e * 16)}px`;
        if (x > 0) return `${24 + (x * 16)}px`;
        return "24px";
    });

    const handleExit = () => {
        setIsExited(true);
        if (containerRef.current) {
            // Jump scroll exactly to the top of the container so the user 
            // is looking at the collapsed card, avoiding jarring height skips.
            const top = containerRef.current.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top, behavior: "instant" });
        }
    };

    return (
        <section>
            {/* ═══ header + stat cards (constrained width) ═══ */}
            <div className="pt-32 pb-16 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* top header: heading left, blurb right */}
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
                                <span className={`text-xs ${isDark ? "text-white/15" : "text-black/15"}`}>&middot;</span>
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
                                    Supported by patrons &#9829;
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
                            <span className={isDark ? "text-white/80" : "text-black/80"}>Rust &amp; Tauri</span>{" "}
                            with a{" "}
                            <span className={isDark ? "text-white/80" : "text-black/80"}>Direct3D11 compositor</span>.
                            {" "}It doesn&apos;t guess. It&apos;s engineered to perform.
                        </p>
                    </motion.div>

                    {/* stat cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-20"
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
                                                &rarr;
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

                </div>
            </div>


            {/* ═══ MOBILE VIEW: simple list instead of scroll-jacking ═══ */}
            <div className="md:hidden flex flex-col gap-8 px-4 pb-20">
                {showcaseFeatures.map((feature) => (
                    <div key={feature.id} className="relative rounded-[2rem] overflow-hidden aspect-[4/5] flex flex-col justify-end bg-black border border-white/10 shadow-2xl">
                        <Image
                            src={feature.imageSrcs[0]}
                            alt={feature.title}
                            fill
                            className="object-cover opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                        <div className="relative z-10 p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-5 h-[1px] bg-blue-400/50" />
                                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-blue-400/80">
                                    {feature.badge}
                                </span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3 leading-[1.1] drop-shadow-lg">
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-white/70 font-spline drop-shadow-md">
                                {feature.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ═══ DESKTOP VIEW: fullscreen scroll-driven showcase ═══════════════════
                uses a tall container with a sticky viewport-height inner
                div. as the user scrolls, each slide crossfades in/out
                based on scroll progress.
            ═══════════════════════════════════════════════════════════ */}
            <div
                ref={containerRef}
                className="relative hidden md:block h-screen"
                style={{ height: "100vh" }}
            >
                <motion.div
                    className={isExited ? "relative h-[90vh] sm:h-[calc(100vh-24px)] w-[calc(100%-24px)] mx-auto overflow-hidden bg-black" : "sticky top-3 h-[calc(100vh-24px)] w-[calc(100%-24px)] mx-auto overflow-hidden bg-black"}
                    style={{ scale, borderRadius }}
                >
                    {/* Inject Scroll-driven WebGL Canvas */}
                    <ScrollTransitionCanvas 
                        features={showcaseFeatures} 
                        onSlideChange={handleSlideChange} 
                        onExitDown={handleExitDown}
                        onExitUp={handleExitUp}
                        isLocked={isLocked}
                    />
                    
                    {/* Global gradient overlay so text is always readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-0" />

                    {/* render crisp HTML feature slide typography overlay synchronized with activeIndex */}
                    {showcaseFeatures.map((feature, idx) => (
                        <FeatureSlide 
                            key={feature.id}
                            feature={feature}
                            index={idx}
                            total={showcaseFeatures.length}
                            activeIndex={activeIndex}
                        />
                    ))}

                    <AnimatePresence>
                        {showExit && !isExited && (
                            <motion.button
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                onClick={handleExit}
                                className="absolute top-6 right-6 sm:top-10 sm:right-10 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-md bg-black/80 hover:bg-black border border-white/10 text-xs font-mono uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors duration-300"
                            >
                                <span>Skip</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </motion.button>
                        )}
                    </AnimatePresence>


                </motion.div>
            </div>



        </section>
    );
}
