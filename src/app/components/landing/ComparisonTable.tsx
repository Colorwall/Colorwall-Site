"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BenchmarkShowcase } from "./BenchmarkShowcase";
import { GradientHeading } from "./GradientHeading";

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

export const ComparisonTable = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    return (
        <>
            <section className="py-32 px-4 sm:px-8 relative overflow-hidden">
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
                        <GradientHeading
                            text="how we compare, you ask?"
                            theme={theme}
                            className="text-sm sm:text-base font-mono uppercase tracking-[0.25em] mb-5"
                        />
                        <div className="flex flex-col w-full max-w-4xl mx-auto mt-10 mb-12">
                            <h2 className={`text-left text-5xl md:text-7xl lg:text-8xl font-outfit font-[200] tracking-[-0.06em] leading-[0.95] mb-2 md:mb-0
                                ${isDark ? "text-white" : "text-black"}`}>
                                They solve a slice.
                            </h2>
                            <GradientHeading 
                                text="We run the whole thing."
                                theme={theme}
                                className="text-right text-4xl md:text-5xl lg:text-6xl font-outfit font-[200] tracking-[-0.06em] leading-[0.95]"
                            />
                        </div>
                        <p className={`text-xs font-mono
                            ${isDark ? "text-white" : "text-black"}`}>
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
                        className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 mb-12"
                    >
                        {competitors.map((comp) => (
                            <div
                                key={comp.name}
                                className="flex flex-col cursor-target relative p-4 -m-4 rounded-xl"
                            >
                                {/* competitor name with favicon + price tag */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2.5">
                                        {/* favicon */}
                                        {comp.favicon ? (
                                            <img
                                                src={comp.favicon}
                                                alt={comp.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-5 h-5 object-contain shrink-0 rounded-sm"
                                            />
                                        ) : (
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0
                                                ${isDark ? "bg-white/20 text-white" : "bg-black/20 text-black"}`}>
                                                ···
                                            </span>
                                        )}
                                        <h3 className={`text-base font-semibold tracking-tight
                                            ${isDark ? "text-white" : "text-black"}`}>
                                            {comp.name}
                                        </h3>
                                    </div>
                                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full
                                        ${isDark
                                            ? "bg-white/10 text-white"
                                            : "bg-black/10 text-black"
                                        }`}>
                                        {comp.price}
                                    </span>
                                </div>

                                <p className={`text-sm mb-6 font-spline ml-[30px]
                                    ${isDark ? "text-white/70" : "text-black/70"}`}>
                                    {comp.tagline}
                                </p>

                                {/* limitation list */}
                                <ul className="flex flex-col gap-3 ml-[30px]">
                                    {comp.limitations.map((lim) => (
                                        <li
                                            key={lim}
                                            className={`flex items-start gap-2.5 text-sm leading-snug
                                                ${isDark ? "text-white/60" : "text-black/60"}`}
                                        >
                                            <span className={`text-xs mt-0.5 shrink-0 font-mono font-bold
                                                ${isDark ? "text-white/40" : "text-black/40"}`}>
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
                                ? "bg-white/5 border-white/20 text-white"
                                : "bg-black/5 border-black/20 text-black"
                            }`}>
                            vs
                        </div>
                    </motion.div>

                    {/* ─── colorwall hero section ─── */}
                    {/* card styling removed to blend seamlessly into the page */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                    >
                        <div className="py-8 sm:py-8 mt-8">
                            <div className={`cursor-target relative p-6 -m-6 rounded-3xl flex flex-col items-center justify-center gap-6 mb-16 pb-8 border-b text-center
                                ${isDark ? "border-white/10" : "border-black/10"}`}>
                                <div className="flex flex-col items-center gap-4">
                                    <img
                                        src="/colorwall.png"
                                        alt="ColorWall Logo"
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                                    />
                                    <div>
                                        <h3 className={`text-3xl sm:text-4xl font-anurati tracking-widest uppercase
                                            ${isDark ? "text-white" : "text-black"}`}>
                                            ColorWall
                                        </h3>
                                        <p className={`text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] mt-2 ${isDark ? "text-white/70" : "text-black/70"}`}>
                                            Runs the whole thing, end to end.
                                        </p>
                                    </div>
                                </div>
                                <Link href="/download">
                                    <button className={`px-8 py-3 rounded-full text-sm font-medium transition-all
                                        ${isDark 
                                            ? "bg-white text-black hover:bg-white/90" 
                                            : "bg-black text-white hover:bg-black/90"}`}>
                                        Download Free
                                    </button>
                                </Link>
                            </div>

                            {/* embed the benchmark showcase directly */}
                            <div className="mt-8">
                                <BenchmarkShowcase theme={theme} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
};
