"use client";

import { motion } from "framer-motion";
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
    },
    {
        title: "HLSL Shaders & Particles",
        desc: "Apply real-time shader effects like reflections, sway, chromatic aberration, blur, and rain drops.",
        tag: "under dev",
    },
    {
        title: "Audio Reactive Ecosystem",
        desc: "Native system audio analysis injects rhythmic life into your wallpapers, particles, and widgets in real-time.",
    },
    {
        title: "Desktop Widgets",
        desc: "Pin interactive HTML5/React widgets - 3D clocks, visualizers, system monitors - directly to your desktop.",
    },
    {
        title: "Massive Workshop",
        desc: "Browse and download thousands of 4K videos, WebGL scenes, and community-made .colorwall projects.",
        tag: "under dev",
    },
    {
        title: "Taskbar Customization",
        desc: "Transform your taskbar with transparent, blur, or acrylic effects, completely independent of the wallpaper engine.",
    },
];

export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

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
                            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight whitespace-pre-wrap leading-[1.1]"
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
                                    <span className={`text-4xl sm:text-5xl font-black tracking-tighter leading-none
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
                    className="mb-8"
                >
                    <p className={`text-xs font-mono uppercase tracking-[0.25em] mb-3
                        ${isDark ? "text-blue-400/60" : "text-blue-600/60"}`}>
                        and there&apos;s more
                    </p>
                    <h3 className={`text-2xl sm:text-3xl font-black tracking-tight
                        ${isDark ? "text-white" : "text-black"}`}>
                        Everything else, built in.
                    </h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
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
                            <div className={`w-full h-px mb-6 transition-colors duration-500
                                ${isDark
                                    ? "bg-white/8 group-hover:bg-white/20"
                                    : "bg-black/8 group-hover:bg-black/20"
                                }`}
                            />

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
                                ${isDark ? "text-white/40" : "text-black/50"}`}>
                                {f.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
