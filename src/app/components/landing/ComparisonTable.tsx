"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BenchmarkShowcase } from "./BenchmarkShowcase";
import { GradientHeading } from "./GradientHeading";

// competitor data - factual, non-aggressive.
// favicon urls use google's favicon service for consistent rendering.
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

export const ComparisonTable = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    return (
        <section className="py-32 px-4 sm:px-8 relative overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">

                {/* ─── heading ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className="mb-24"
                >
                    <p className={`text-[11px] font-mono tracking-[0.3em] uppercase mb-8
                        ${isDark ? "text-white/25" : "text-black/25"}`}>
                        How we compare
                    </p>
                    <h2 className={`text-5xl md:text-7xl lg:text-8xl font-outfit font-[200] tracking-[-0.06em] leading-[0.95] max-w-3xl mb-3
                        ${isDark ? "text-white" : "text-black"}`}>
                        They solve a slice.
                    </h2>
                    <GradientHeading
                        text="We run the whole thing."
                        theme={theme}
                        className="text-4xl md:text-5xl lg:text-6xl font-anurati tracking-widest uppercase"
                    />
                    <p className={`text-[11px] font-mono tracking-wide mt-8
                        ${isDark ? "text-white/20" : "text-black/20"}`}>
                        Benchmarks on i7-4th Gen Haswell (2013) · Intel HD 4600 · 4K 60FPS video
                    </p>
                </motion.div>

                {/* ─── competitor breakdown ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-16 mb-20"
                >
                    {competitors.map((comp) => (
                        <div key={comp.name} className="cursor-target">
                            {/* name + favicon + price */}
                            <div className="flex items-center gap-2.5 mb-1.5">
                                {comp.favicon ? (
                                    <img
                                        src={comp.favicon}
                                        alt={comp.name}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-4 h-4 object-contain shrink-0 rounded-sm"
                                    />
                                ) : (
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] shrink-0
                                        ${isDark ? "bg-white/15 text-white/50" : "bg-black/10 text-black/50"}`}>
                                        ···
                                    </span>
                                )}
                                <h3 className={`text-[15px] font-bold tracking-tight
                                    ${isDark ? "text-white" : "text-[#1a1f36]"}`}>
                                    {comp.name}
                                </h3>
                                <span className={`text-[11px] font-mono
                                    ${isDark ? "text-white/30" : "text-black/30"}`}>
                                    {comp.price}
                                </span>
                            </div>

                            {/* tagline */}
                            <p className={`text-[14px] leading-relaxed mb-5
                                ${isDark ? "text-white/40" : "text-[#425466]"}`}>
                                {comp.tagline}
                            </p>

                            {/* limitations as inline prose */}
                            <ul className="flex flex-col gap-2.5">
                                {comp.limitations.map((lim) => (
                                    <li key={lim}
                                        className={`text-[13px] leading-snug flex items-start gap-2
                                            ${isDark ? "text-white/35" : "text-black/40"}`}
                                    >
                                        <span className="shrink-0 mt-[3px] text-[10px]">✕</span>
                                        {lim}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </motion.div>

                {/* ─── thin separator ─── */}
                <div className={`w-full h-px mb-20 ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />

                {/* ─── colorwall section ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                >
                    {/* colorwall header - left-aligned, editorial */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
                        <div className="flex items-center gap-5">
                            <img
                                src="/colorwall.png"
                                alt="ColorWall Logo"
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight
                                    ${isDark ? "text-white" : "text-[#1a1f36]"}`}>
                                    ColorWall
                                </h3>
                                <p className={`text-[13px] mt-0.5
                                    ${isDark ? "text-white/40" : "text-[#425466]"}`}>
                                    Free. Open source. Runs the whole thing.
                                </p>
                            </div>
                        </div>
                        <Link href="/download">
                            <button className={`px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-200
                                ${isDark
                                    ? "bg-white text-black hover:bg-white/90"
                                    : "bg-[#1a1f36] text-white hover:bg-[#2a2f46]"}`}>
                                Download Free
                            </button>
                        </Link>
                    </div>

                    {/* benchmark showcase */}
                    <BenchmarkShowcase theme={theme} />
                </motion.div>
            </div>
        </section>
    );
};
