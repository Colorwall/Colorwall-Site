"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GradientHeading } from "./GradientHeading";
import ScrollExpand from "../ui/ScrollEXP";

// headline stat cards
// the most impressive at a glance proof points for colorwall tech
// these sit above the main showcase and are visually distinct from it
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

// primary features with screenshot showcases
// these 5 features are rendered as scroll-expand cards linked into the landing flow
const showcaseFeatures = [
    {
        id: "widgets",
        title: "WIDGETS",
        description: "desktop widgets powered by modern web tech. add calendars, clocks, or custom information directly to your desktop. clean, fast, and fully customizable.",
        badge: "HTML · JS · PINNED",
        imageSrcs: ["/widgets.webp"]
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
        imageSrcs: ["/multi.webp", "/PEAKmodalpreview.webp", "/taskbar.webp", "/ADV.webp", "/perf.webp"]
    },
    {
        id: "store",
        title: "STORE",
        description: "Access thousands of wallpapers from 8+ sources. One unified search bar, infinite inspiration - no account needed.",
        badge: "8 SOURCES · 4K · UNIFIED",
        imageSrcs: ["/STORE.webp", "/modal.webp"]
    },
    {
        id: "studio",
        title: "STUDIO",
        description: "build your own native scene wallpapers using our built-in node editor. combine images, video layers, real-time audio-reactive shaders, and particle systems effortlessly.",
        badge: "NODE-BASED · D3D11 · PARTICLES",
        imageSrcs: ["/studio.webp"]
    }
];

export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    // smooth scroll handler to quickly jump to any feature section card
    const handleJumpToFeature = (featureId: string) => {
        const el = document.getElementById(`feature-${featureId}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <section className="relative w-full">
            {/* headline and stat cards */}
            <div className="pt-32 pb-14 px-4 sm:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* top header with title left and architectural description right */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.7 }}
                        className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 lg:gap-16"
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
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-14"
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

            {/* quick jump category pill navigation bar */}
            <div className="sticky top-4 z-40 px-4 mb-10 pointer-events-auto">
                <div className="max-w-fit mx-auto flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-full bg-black/75 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {showcaseFeatures.map((feat) => (
                        <button
                            key={feat.id}
                            type="button"
                            onClick={() => handleJumpToFeature(feat.id)}
                            className="px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-mono tracking-wider uppercase transition-all duration-300 text-white/70 hover:text-white hover:bg-white/15 whitespace-nowrap cursor-pointer active:scale-95"
                        >
                            {feat.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* responsive scroll-expand card showcases powered by scrollexp */}
            <div className="flex flex-col gap-12 sm:gap-20 w-full">
                {showcaseFeatures.map((feature) => (
                    <div
                        key={feature.id}
                        id={`feature-${feature.id}`}
                        className="relative w-full scroll-mt-20"
                    >
                        <ScrollExpand
                            src={feature.imageSrcs[0]}
                            alt={feature.title}
                            title={feature.title}
                            scrollHint="scroll to expand"
                            useWindowScroll={true}
                            scrollDistance={0.7}
                            holdDistance={0.25}
                            startWidth={64}
                            startHeight={64}
                            mobileStartWidth={92}
                            mobileStartHeight={50}
                            startRadius={28}
                            endRadius={0}
                            overlayScrim={0.55}
                            smoothing={0.08}
                            mediaZoom={1.15}
                        >
                            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 flex flex-col items-center justify-center text-center select-text pointer-events-auto">
                                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md text-[10px] sm:text-xs font-mono tracking-widest uppercase text-blue-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    {feature.badge}
                                </div>

                                <h3 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-[0.95] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)] font-anurati uppercase">
                                    {feature.title}
                                </h3>

                                <p className="text-xs sm:text-base lg:text-lg leading-relaxed text-white/85 font-spline max-w-2xl drop-shadow-md">
                                    {feature.description}
                                </p>

                                {feature.imageSrcs.length > 1 && (
                                    <div className="mt-4 flex items-center gap-2">
                                        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-white/70 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                                            +{feature.imageSrcs.length - 1} more previews available
                                        </span>
                                    </div>
                                )}
                            </div>
                        </ScrollExpand>
                    </div>
                ))}
            </div>

        </section>
    );
};