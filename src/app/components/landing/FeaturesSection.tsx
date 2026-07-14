"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { GradientHeading } from "./GradientHeading";

// -- the 3 headline stat cards that anchor the section --
// these represent the most impressive, at-a-glance proof points
// for colorwall's technical foundation
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

// -- remaining features displayed as a clean two-column spec list --
// stripped of numbers and icons to reduce visual clutter and let
// the descriptions speak for themselves
const featureList = [
    {
        title: "Interactive Studio Editor",
        desc: "Build dynamic scenes with a professional visual editor. Mix videos, images, and particle emitters seamlessly.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                <path d="M8 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 12H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 16H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="18" cy="14" r="2" fill="currentColor" />
            </svg>
        )
    },
    {
        title: "HLSL Shaders & Particles",
        desc: "Apply real-time shader effects like reflections, sway, chromatic aberration, blur, and rain drops.",
        tag: "under dev",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="18" cy="5" r="1.5" fill="currentColor" opacity="0.6"/>
                <circle cx="5" cy="18" r="1" fill="currentColor" opacity="0.3"/>
                <circle cx="19" cy="19" r="2" fill="currentColor" opacity="0.4"/>
            </svg>
        )
    },
    {
        title: "Audio Reactive Ecosystem",
        desc: "Native system audio analysis injects rhythmic life into your wallpapers, particles, and widgets in real-time.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 12V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 8V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M12 4V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M20 12V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        )
    },
    {
        title: "Desktop Widgets",
        desc: "Pin interactive HTML5/React widgets - 3D clocks, visualizers, system monitors - directly to your desktop.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="13" y="4" width="7" height="10" rx="2" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="4" y="14" width="7" height="6" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="13" y="17" width="7" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
        )
    },
    {
        title: "Massive Workshop",
        desc: "Browse and download thousands of 4K videos, WebGL scenes, and community-made .colorwall projects.",
        tag: "under dev",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 19H7C4.23858 19 2 16.7614 2 14C2 11.2386 4.23858 9 7 9C7.5 5 11.5 4 14 6C16 4 20 5 21 8.5C22.5 9.5 23 11 22 13C21 16 19 19 17 19Z" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinejoin="round"/>
                <path d="M12 12V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9.5 14L12 16.5L14.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7.5" r="1.5" fill="currentColor" />
            </svg>
        )
    },
    {
        title: "Taskbar Customization",
        desc: "Transform your taskbar with transparent, blur, or acrylic effects, completely independent of the wallpaper engine.",
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                <path d="M3 16H21" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="9" y="17" width="6" height="2" rx="1" fill="currentColor"/>
                <circle cx="5.5" cy="18" r="0.5" fill="currentColor"/>
            </svg>
        )
    },
];

export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="py-32 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">

                {/* ─── header row: big heading left, descriptive blurb right ─── */}
                {/* mirrors the fypro layout where the heading carries visual weight
                    and the paragraph provides context without competing for attention */}
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
                            {/* patron link - subtle dot separator + link in the same
                                mono style so it reads as a secondary label rather
                                than a loud cta. sits alongside the dev status badge */}
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

                    {/* right-side blurb - smaller type, max-width constrained so it
                        doesn't stretch across the full remaining space */}
                    <p className={`cursor-target relative p-4 -m-4 max-w-md text-base sm:text-lg leading-relaxed font-spline lg:text-right
                        ${isDark ? "text-white/50" : "text-black/50"}`}>
                        A desktop engine built from scratch in{" "}
                        <span className={isDark ? "text-white/80" : "text-black/80"}>Rust & Tauri</span>{" "}
                        with a{" "}
                        <span className={isDark ? "text-white/80" : "text-black/80"}>Direct3D11 compositor</span>.
                        {" "}It doesn&apos;t guess. It&apos;s engineered to perform.
                    </p>
                </motion.div>

                {/* ─── stat cards row ─── */}
                {/* 3 cards in a row. the last one (accent=true) gets a dark/inverted
                    treatment to create visual rhythm, matching the fypro pattern
                    where one card breaks the visual monotony */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-32"
                >
                    {statCards.map((card, i) => {
                        // shared class string for both linked and static cards
                        const cardClasses = `cursor-target group relative rounded-2xl p-7 sm:p-8 transition-all duration-500 overflow-hidden
                            ${card.accent
                                ? (isDark
                                    ? "bg-[#0078d4] text-white hover:bg-[#006cbd]"
                                    : "bg-[#111111] text-white hover:bg-[#1a1a1a]")
                                : (isDark
                                    ? "border border-white/10 bg-white/[0.02]"
                                    : "border border-black/10 bg-black/[0.02]")
                            }`;

                        // inner card content extracted so it can be shared between
                        // the linked (accent) and non-linked (regular) card wrappers
                        const cardContent = (
                            <>
                                {/* stat value and decorative plus/arrow on the same line */}
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

                                    {/* arrow on accent card hints at clickability,
                                        plus sign on regular cards is purely decorative */}
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

                        // accent card wraps in a next/link to /download so clicking
                        // routes the user to grab the app. regular cards stay inert.
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

                {/* ─── "the rest" feature list ─── */}
                {/* clean two-column layout with generous vertical spacing.
                    no icons, no numbers -- just title + description.
                    the divider line on top of each item creates rhythm
                    without adding visual weight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className={`mb-8 w-full cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 rounded-2xl border transition-all duration-500 relative
                        ${isExpanded 
                            ? (isDark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.03] border-black/10')
                            : (isDark ? 'bg-transparent border-white/10 hover:bg-white/[0.03]' : 'bg-transparent border-black/10 hover:bg-black/[0.03]')
                        }`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="relative z-10">
                        <p className={`text-xs font-mono uppercase tracking-[0.25em] mb-2 transition-colors
                            ${isDark ? "text-blue-400/60 group-hover:text-blue-400/90" : "text-blue-600/60 group-hover:text-blue-600/90"}`}>
                            and there&apos;s more
                        </p>
                        <h3 className={`text-2xl sm:text-3xl font-black tracking-tight transition-colors
                            ${isDark ? "text-white/80 group-hover:text-white" : "text-black/80 group-hover:text-black"}`}>
                            Everything else, built in.
                        </h3>
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-4 mt-6 sm:mt-0">
                        <span className={`text-xs font-bold tracking-widest uppercase font-mono transition-colors
                            ${isDark ? 'text-white/40 group-hover:text-white/90' : 'text-black/40 group-hover:text-black/90'}`}>
                            {isExpanded ? "Hide features" : "Explore features"}
                        </span>
                        <motion.div 
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.5, ease: "backOut" }}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex flex-shrink-0 items-center justify-center border transition-all duration-300 
                                ${isDark ? 'border-white/10 group-hover:bg-white/10 group-hover:border-white/30 text-white' : 'border-black/10 group-hover:bg-black/10 group-hover:border-black/30 text-black'}`}
                        >
                            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.div>
                    </div>
                </motion.div>

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0 pt-2">
                                {featureList.map((f, i) => (
                                    <motion.div
                                        key={f.title}
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.06, duration: 0.5 }}
                                        className="group py-8"
                                    >
                                        {/* top divider line that subtly highlights on hover */}
                                        <div className={`w-full h-px mb-8 transition-colors duration-500
                                            ${isDark
                                                ? "bg-white/5 group-hover:bg-white/20"
                                                : "bg-black/5 group-hover:bg-black/20"
                                            }`}
                                        />

                                        <div className="flex items-start gap-5">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                                                ${isDark 
                                                    ? "bg-white/[0.02] text-white/40 border border-white/5 group-hover:bg-white/[0.08] group-hover:text-white group-hover:border-white/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                                                    : "bg-black/[0.02] text-black/40 border border-black/5 group-hover:bg-black/[0.08] group-hover:text-black group-hover:border-black/20 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.05)]"
                                                }`}
                                            >
                                                {f.icon}
                                            </div>
                                            
                                            <div className="flex-1 mt-0.5">
                                                <div className="flex items-start gap-3">
                                                    <h4 className={`text-lg font-semibold tracking-tight font-quicksand
                                                        group-hover:-translate-y-px transition-transform duration-300
                                                        ${isDark ? "text-white" : "text-black"}`}>
                                                        {f.title}
                                                    </h4>

                                                    {/* optional "under dev" tag rendered inline next to the title */}
                                                    {f.tag && (
                                                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 mt-1
                                                            ${isDark
                                                                ? "bg-amber-500/10 text-amber-400/80 border border-amber-500/20"
                                                                : "bg-amber-500/10 text-amber-600/80 border border-amber-500/20"
                                                            }`}>
                                                            {f.tag}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className={`text-sm leading-relaxed mt-2 max-w-md font-spline
                                                    ${isDark ? "text-white/40 group-hover:text-white/60" : "text-black/50 group-hover:text-black/70"} transition-colors duration-300`}>
                                                    {f.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
