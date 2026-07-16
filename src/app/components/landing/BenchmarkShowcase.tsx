"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// -- benchmark data stays the same, just consumed differently now --
// each entry represents one screenshot from task manager with its metadata.
// the modal scrolls through all of them vertically instead of jamming
// two columns side by side.
interface BenchmarkEntry {
    app: string;
    tab: string;
    src: string;
    alt: string;
    gpu: string;
    verdict: string;
    verdictColor: string;
}

const entries: BenchmarkEntry[] = [
    {
        app: "ColorWall",
        tab: "Processes",
        src: "/colorwall-perf.webp",
        alt: "ColorWall processes in Task Manager - 3.6% CPU, 20.9% GPU Video Decode",
        gpu: "24%",
        verdict: "Barely a whisper.",
        verdictColor: "text-emerald-500",
    },
    {
        app: "ColorWall",
        tab: "Hardware",
        src: "/colorwall-hardware.webp",
        alt: "GPU Performance tab while running ColorWall - 20% 3D, 21% Video Decode on Intel HD 4600",
        gpu: "24%",
        verdict: "Barely a whisper.",
        verdictColor: "text-emerald-500",
    },
    {
        app: "Lively Wallpaper",
        tab: "Processes",
        src: "/lively-perf.webp",
        alt: "Lively Wallpaper processes in Task Manager - mpv at 86.5% GPU, 98% total",
        gpu: "98%",
        verdict: "Maxed out.",
        verdictColor: "text-red-500",
    },
    {
        app: "Lively Wallpaper",
        tab: "Hardware",
        src: "/lively-hardware.webp",
        alt: "GPU Performance tab while running Lively - 94% 3D on Intel HD 4600",
        gpu: "98%",
        verdict: "Maxed out.",
        verdictColor: "text-red-500",
    },
];

interface BenchmarkShowcaseProps {
    theme: "dark" | "light";
}

export const BenchmarkShowcase = ({ theme }: BenchmarkShowcaseProps) => {
    const isDark = theme === "dark";
    const [modalOpen, setModalOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // close modal on escape key
    useEffect(() => {
        if (!modalOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setModalOpen(false);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [modalOpen]);

    // prevent body scroll when modal is open
    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [modalOpen]);

    // preload all benchmark images via idle callback so
    // the modal images appear instantly when opened
    useEffect(() => {
        const preloadImages = () => {
            entries.forEach(entry => {
                const img = new window.Image();
                img.src = entry.src;
            });
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(preloadImages, { timeout: 2000 });
        } else {
            setTimeout(preloadImages, 1000);
        }
    }, []);

    return (
        <div className="flex flex-col w-full">
            {/* ─── section header ─── */}
            <div className="flex flex-col items-center justify-center mb-10 text-center">
                <h3 className={`text-xl sm:text-2xl font-outfit font-[300] tracking-[0.3em] uppercase
                    ${isDark ? "text-white" : "text-black"}`}>
                   Quick Performance Comparison
                </h3>
                <p className={`text-[11px] font-mono mt-4 uppercase tracking-[0.2em]
                    ${isDark ? "text-white/40" : "text-black/40"}`}>
                    i7-4th Gen Haswell (2013) · Intel HD 4600 · 4K 60FPS video
                </p>
            </div>

            {/* ─── inline stat comparison above the preview ─── */}
            <div className="flex items-center justify-center gap-12 sm:gap-20 mb-8">
                <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-mono uppercase tracking-[0.15em] mb-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
                        ColorWall
                    </span>
                    <span className={`text-4xl sm:text-5xl font-outfit font-[200] tracking-tight leading-none text-emerald-500`}>
                        24%
                    </span>
                    <span className={`text-[10px] font-mono mt-1 text-emerald-500/70`}>GPU</span>
                </div>

                <span className={`text-sm font-mono ${isDark ? "text-white/20" : "text-black/20"}`}>vs</span>

                <div className="flex flex-col items-center">
                    <span className={`text-[10px] font-mono uppercase tracking-[0.15em] mb-1 ${isDark ? "text-white/40" : "text-black/40"}`}>
                        Lively
                    </span>
                    <span className={`text-4xl sm:text-5xl font-outfit font-[200] tracking-tight leading-none text-red-500`}>
                        98%
                    </span>
                    <span className={`text-[10px] font-mono mt-1 text-red-500/70`}>GPU</span>
                </div>
            </div>

            {/* ─── single large clickable preview ─── */}
            {/* shows the colorwall processes screenshot as the hero image.
                clicking opens the full modal with all benchmark screenshots. */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative w-full max-w-4xl mx-auto cursor-pointer group"
                onClick={() => setModalOpen(true)}
            >
                <div className={`relative w-full aspect-video rounded-2xl overflow-hidden border transition-all duration-300
                    group-hover:shadow-2xl group-hover:scale-[1.01]
                    ${isDark ? "border-white/10 group-hover:border-white/20" : "border-black/10 group-hover:border-black/15"}`}>
                    <Image
                        src="/colorwall-perf.webp"
                        alt="ColorWall benchmark - click to view full comparison"
                        fill
                        className="object-cover object-left-top"
                        sizes="(max-width: 768px) 100vw, 900px"
                        quality={90}
                        loading="lazy"
                    />

                    {/* hover overlay prompting the user to click */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/60 backdrop-blur-md text-white rounded-full px-5 py-2.5 text-sm font-medium">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="11" y1="8" x2="11" y2="14" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                            </svg>
                            View Full Benchmarks
                        </div>
                    </div>
                </div>

                {/* caption under the preview */}
                <p className={`text-center text-[11px] font-mono mt-4 ${isDark ? "text-white/30" : "text-black/30"}`}>
                    Click to view full benchmark comparison · Unedited Task Manager screenshots
                </p>
            </motion.div>

            {/* ─── scrollable modal ─── */}
            {mounted && createPortal(
                <AnimatePresence>
                    {modalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[9999] overflow-hidden"
                        >
                        {/* backdrop - separate from scroll container so it
                            doesn't intercept scroll events meant for the content */}
                        <div
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                            onClick={() => setModalOpen(false)}
                        />

                        {/* close button - sits above everything */}
                        <button
                            onClick={() => setModalOpen(false)}
                            className="fixed top-4 right-4 sm:top-8 sm:right-8 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors z-[210]"
                            aria-label="Close benchmarks"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        {/* scrollable content - positioned above the backdrop via z-index,
                            takes full viewport height so overflow-y-auto works correctly.
                            pointer-events on this div ensure scroll is captured here. */}
                        <motion.div
                            data-lenis-prevent
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative z-[205] h-full overflow-y-auto overscroll-contain px-4 sm:px-8 py-16 sm:py-20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {/* modal header */}
                            <div className="max-w-4xl mx-auto mb-12 text-center">
                                <h3 className="text-2xl sm:text-3xl font-outfit font-[200] tracking-[0.2em] uppercase text-white mb-3">
                                    Benchmark Comparison
                                </h3>
                                <p className="text-[11px] font-mono text-white/40 uppercase tracking-[0.15em]">
                                    i7-4th Gen Haswell (2013) · Intel HD 4600 · 4K 60FPS video · Unedited Task Manager screenshots
                                </p>
                            </div>

                            {/* benchmark entries stacked vertically */}
                            <div className="max-w-4xl mx-auto flex flex-col gap-16">
                                {entries.map((entry, i) => (
                                    <div key={`${entry.app}-${entry.tab}`} className="flex flex-col">
                                        {/* entry header: app name, tab, and gpu stat */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-white text-lg font-bold tracking-tight">
                                                    {entry.app}
                                                </span>
                                                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider px-2 py-0.5 rounded border border-white/10">
                                                    {entry.tab}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-2xl font-outfit font-[200] ${entry.verdictColor}`}>
                                                    {entry.gpu}
                                                </span>
                                                <span className={`text-[11px] font-mono ${entry.verdictColor} opacity-70`}>
                                                    {entry.verdict}
                                                </span>
                                            </div>
                                        </div>

                                        {/* full-width screenshot */}
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                                            <Image
                                                src={entry.src}
                                                alt={entry.alt}
                                                fill
                                                className="object-cover object-left-top"
                                                sizes="900px"
                                                quality={95}
                                                priority={i < 2}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* bottom spacer so the last image doesn't hug the viewport edge */}
                            <div className="h-16" />
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};
