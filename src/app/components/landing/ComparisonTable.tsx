"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BenchmarkShowcase } from "./BenchmarkShowcase";
import { GradientHeading } from "./GradientHeading";

const Antigravity = dynamic(() => import("../ui/Antigravity"), { ssr: false });

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

                {/* ═══ two-column layout: competitors left, statement right ═══
                    competitors are stacked vertically on the left as a "list
                    of what exists". the right side gets the bold heading and
                    colorwall cta - visually claiming the dominant position. */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-20 mb-24">

                    {/* ─── left: competitors stacked ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex flex-col gap-10 order-2 lg:order-1"
                    >
                        {competitors.map((comp, i) => (
                            <motion.div
                                key={comp.name}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.4 }}
                                className="cursor-target"
                            >
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
                                <p className={`text-[14px] leading-relaxed mb-4
                                    ${isDark ? "text-white/40" : "text-[#425466]"}`}>
                                    {comp.tagline}
                                </p>

                                {/* limitations */}
                                <ul className="flex flex-col gap-2">
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

                                {/* subtle separator between competitor entries */}
                                {i < competitors.length - 1 && (
                                    <div className={`mt-10 h-px ${isDark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`} />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* ─── right: heading + colorwall cta ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7 }}
                        className="flex flex-col justify-between order-1 lg:order-2"
                    >
                        {/* main statement with antigravity background */}
                        <div className="relative">
                            {/* The 3D particle background */}
                            <div className="absolute inset-0 -mx-32 -my-32 z-0 pointer-events-none opacity-80 mix-blend-screen">
                                <Antigravity 
                                    color={isDark ? "#00e5ff" : "#0284c7"} 
                                    count={200}
                                    particleSize={1.0}
                                    waveAmplitude={2.0}
                                    autoAnimate={true}
                                />
                            </div>
                            
                            <div className="relative z-10 pointer-events-none">
                                <p className={`text-[11px] font-mono tracking-[0.3em] uppercase mb-8
                                    ${isDark ? "text-white/75" : "text-black/75"}`}>
                                  How we compare?
                                </p>
                                <h2 className={`text-5xl md:text-7xl lg:text-8xl font-outfit font-[200] tracking-[-0.06em] leading-[0.95] mb-3
                                    ${isDark ? "text-white" : "text-black"}`}>
                                    They solve a slice.
                                </h2>
                                <GradientHeading
                                    text="We run the whole thing."
                                    theme={theme}
                                    className="text-4xl md:text-5xl lg:text-6xl font-anurati tracking-widest uppercase"
                                />
                            </div>
                        </div>

                        {/* Hand-drawn SVG arrow pointing to ColorWall CTA */}
                        <div className="hidden lg:flex justify-end pr-32 -mt-4 mb-4 relative z-10 pointer-events-none opacity-60">
                            <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={isDark ? "text-white" : "text-black"}>
                                <path d="M10 10 Q 50 10 70 80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" strokeLinecap="round" />
                                <path d="M60 70 L 70 80 L 80 65" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        {/* colorwall cta - anchored to bottom of right column */}
                        <div className={`mt-8 pt-10 border-t
                            ${isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <img
                                        src="/colorwall.png"
                                        alt="ColorWall Logo"
                                        className="w-11 h-11 object-contain"
                                    />
                                    <div>
                                        <h3 className={`text-xl font-bold tracking-tight
                                            ${isDark ? "text-white" : "text-[#1a1f36]"}`}>
                                            ColorWall
                                        </h3>
                                        <p className={`text-[13px] mt-0.5
                                            ${isDark ? "text-white/40" : "text-[#425466]"}`}>
                                            Free to Install. Runs it all End to end. Actively maintained!
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
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══ benchmark showcase - wider container ═══ */}
            <div className="max-w-[100rem] mx-auto relative z-10 mt-12 px-2 lg:px-8">
                <BenchmarkShowcase theme={theme} />
            </div>
        </section>
    );
};
