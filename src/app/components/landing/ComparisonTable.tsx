"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BenchmarkShowcase } from "./BenchmarkShowcase";

// -- competitor cards: short, factual, non-aggressive --
// each card highlights what the competitor provides and where
// colorwall goes further, without being confrontational.
// favicon urls use google's favicon service for consistent rendering
const competitors = [
    {
        name: "Wallpaper Engine",
        price: "$3.99",
        favicon: "https://www.google.com/s2/favicons?domain=wallpaperengine.io&sz=128",
        tagline: "The industry standard.",
        limitations: [
            "74% GPU usage on 4K video",
            "No native widget support",
            "Closed source",
        ],
    },
    {
        name: "Lively Wallpaper",
        price: "Free",
        favicon: "https://www.google.com/s2/favicons?domain=rocksdanister.github.io/lively&sz=128",
        tagline: "A solid open-source option.",
        limitations: [
            "98% GPU usage on 4K video",
            "No scene editor",
            "Limited audio reactivity",
        ],
    },
    {
        name: "Others",
        price: "Varies",
        favicon: null,
        tagline: "Rainmeter, DesktopHut, etc.",
        limitations: [
            "No hardware-accelerated rendering",
            "Basic or no video support",
            "Fragmented ecosystem",
        ],
    },
];

// -- colorwall's key differentiators shown in the hero card --
// taskbar row removed since the comparison numbers don't translate
// cleanly when the other apps handle it differently
const colorwallWins = [
    { label: "GPU Usage (4K)", value: "~24%" },
    { label: "CPU Usage (4K)", value: "~3.6%" },
    { label: "Rendering", value: "DirectX 11" },
    { label: "Scene Editor", value: "Built-in" },
    { label: "Audio Reactive", value: "Native" },
    { label: "Desktop Widgets", value: "HTML5/React" },
    { label: "Taskbar Effects", value: "Acrylic/Blur" },
    { label: "Price", value: "Free" },
];

export const ComparisonTable = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";
    const [showBenchmarks, setShowBenchmarks] = useState(false);

    return (
        <>
            <section className="py-32 px-4 sm:px-8 relative overflow-hidden">
                {/* background glow - kept from original. subtle radial wash
                    behind the section adds depth without being distracting */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full opacity-10 pointer-events-none ${isDark ? "bg-blue-600" : "bg-blue-400"}`} />

                <div className="max-w-6xl mx-auto relative z-10">

                    {/* ─── heading block ─── */}
                    {/* uses the same large, tight-tracked heading style as the
                        "seems too good to be true?" block in page.tsx for consistency */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-20"
                    >
                        <p className={`text-xs font-mono uppercase tracking-[0.25em] mb-5
                            ${isDark ? "text-white/30" : "text-black/30"}`}>
                            how we compare
                        </p>
                        <h2 className={`text-5xl md:text-7xl font-medium tracking-tighter leading-none mb-5
                            ${isDark ? "text-white" : "text-black"}`}>
                            They solve a slice.
                        </h2>
                        <p className={`text-2xl md:text-3xl tracking-tight mb-6
                            ${isDark ? "text-white/50" : "text-black/50"}`}>
                            We run the whole thing.
                        </p>
                        <p className={`text-xs font-mono
                            ${isDark ? "text-white/20" : "text-black/30"}`}>
                            Benchmarks: i7-4th Gen Haswell (2013) · Intel HD 4600 · 4K 60FPS video
                        </p>
                    </motion.div>

                    {/* ─── competitor cards row ─── */}
                    {/* 3 cards in a row on desktop, stacking on mobile.
                        each card now includes the competitor's favicon for
                        brand recognition, restored from the original table design */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
                    >
                        {competitors.map((comp) => (
                            <div
                                key={comp.name}
                                className={`rounded-2xl p-6 sm:p-7 border transition-colors duration-300
                                    ${isDark
                                        ? "border-white/8 bg-white/[0.02] hover:border-white/15"
                                        : "border-black/8 bg-black/[0.02] hover:border-black/15"
                                    }`}
                            >
                                {/* competitor name with favicon + price tag */}
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2.5">
                                        {/* favicon - shows the competitor's brand icon.
                                            for "others" category we render a generic dot instead */}
                                        {comp.favicon ? (
                                            <img
                                                src={comp.favicon}
                                                alt={comp.name}
                                                loading="lazy"
                                                decoding="async"
                                                className={`w-5 h-5 object-contain shrink-0 rounded-sm
                                                    ${isDark ? "opacity-50" : "opacity-60"}`}
                                            />
                                        ) : (
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0
                                                ${isDark ? "bg-white/10 text-white/30" : "bg-black/10 text-black/30"}`}>
                                                ···
                                            </span>
                                        )}
                                        <h3 className={`text-base font-semibold tracking-tight
                                            ${isDark ? "text-white/80" : "text-black/80"}`}>
                                            {comp.name}
                                        </h3>
                                    </div>
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full
                                        ${isDark
                                            ? "bg-white/5 text-white/40"
                                            : "bg-black/5 text-black/40"
                                        }`}>
                                        {comp.price}
                                    </span>
                                </div>

                                <p className={`text-sm mb-5 font-spline ml-[30px]
                                    ${isDark ? "text-white/30" : "text-black/30"}`}>
                                    {comp.tagline}
                                </p>

                                {/* limitation list - styled as neutral bullet points
                                    with a subtle × prefix instead of aggressive red icons */}
                                <ul className="flex flex-col gap-2.5">
                                    {comp.limitations.map((lim) => (
                                        <li
                                            key={lim}
                                            className={`flex items-start gap-2.5 text-sm leading-snug
                                                ${isDark ? "text-white/40" : "text-black/45"}`}
                                        >
                                            <span className={`text-xs mt-0.5 shrink-0 font-mono
                                                ${isDark ? "text-white/20" : "text-black/20"}`}>
                                                ×
                                            </span>
                                            {lim}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </motion.div>

                    {/* ─── vs divider ─── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex justify-center my-2"
                    >
                        <div className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase border
                            ${isDark
                                ? "bg-white/5 border-white/10 text-white/50"
                                : "bg-black/5 border-black/10 text-black/50"
                            }`}>
                            vs
                        </div>
                    </motion.div>

                    {/* ─── colorwall hero card ─── */}
                    {/* monochrome treatment: dark uses a soft white/5 glass card,
                        light uses deep black. no more aqua blue - the card
                        derives its visual weight from contrast and content instead.
                        clicking anywhere on the card opens the benchmark showcase */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        <div
                            onClick={() => setShowBenchmarks(true)}
                            className={`rounded-2xl p-8 sm:p-10 transition-all duration-300 cursor-pointer
                                ${isDark
                                    ? "bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                                    : "bg-[#111111] text-white hover:bg-[#1a1a1a]"
                                }`}
                        >
                            {/* card header: logo + name + tagline + actions */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                                <div className="flex items-center gap-3">
                                    <img
                                        src="/colorwall.png"
                                        alt="ColorWall"
                                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                    />
                                    <div>
                                        <h3 className={`text-xl sm:text-2xl font-bold tracking-tight
                                            ${isDark ? "text-white" : "text-white"}`}>
                                            ColorWall
                                        </h3>
                                        <p className={`text-sm ${isDark ? "text-white/40" : "text-white/60"}`}>
                                            Runs the whole thing, end to end.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* "see the proof" button - opens the benchmark modal.
                                        stopPropagation isn't needed since the parent card
                                        also triggers the same action */}
                                    <button
                                        onClick={() => setShowBenchmarks(true)}
                                        className={`px-4 py-2 rounded-full text-sm font-mono tracking-tight transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border
                                            ${isDark
                                                ? "border-white/15 text-white/60 hover:text-white hover:border-white/30"
                                                : "border-white/20 text-white/70 hover:text-white hover:border-white/40"
                                            }`}
                                    >
                                        See the proof →
                                    </button>

                                    <Link
                                        href="/download"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`px-5 py-2 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shrink-0
                                            ${isDark
                                                ? "bg-white text-black hover:bg-white/90"
                                                : "bg-white text-black hover:bg-white/90"
                                            }`}
                                    >
                                        Download Free
                                    </Link>
                                </div>
                            </div>

                            {/* stats grid - 4 columns on desktop, 2 on mobile.
                                monochrome glass cells that adapt to the card's
                                background without needing a specific accent color */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                {colorwallWins.map((win) => (
                                    <div
                                        key={win.label}
                                        className={`rounded-xl px-4 py-3.5 sm:px-5 sm:py-4
                                            ${isDark
                                                ? "bg-white/[0.04] border border-white/5"
                                                : "bg-white/10"
                                            }`}
                                    >
                                        <p className={`text-[11px] font-mono uppercase tracking-wider mb-1
                                            ${isDark ? "text-white/30" : "text-white/50"}`}>
                                            {win.label}
                                        </p>
                                        <p className={`text-lg sm:text-xl font-bold tracking-tight
                                            ${isDark ? "text-white" : "text-white"}`}>
                                            {win.value}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* click hint */}
                            <div className="flex justify-center mt-6">
                                <p className={`text-[11px] font-mono
                                    ${isDark ? "text-white/15" : "text-white/30"}`}>
                                    Click to see real Task Manager benchmarks
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* benchmark showcase modal - renders outside the section's
                overflow:hidden boundary so it covers the full viewport */}
            <BenchmarkShowcase
                isOpen={showBenchmarks}
                onClose={() => setShowBenchmarks(false)}
                theme={theme}
            />
        </>
    );
};
