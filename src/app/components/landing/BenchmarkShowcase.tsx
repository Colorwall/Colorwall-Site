"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// -- each benchmark column has two views: process list and hardware tab --
// the user toggles between them via a dropdown under each image.
// this structure supports future video entries by checking `type`
type MediaEntry = {
    type: "image" | "video";
    src: string;
    alt: string;
    tabLabel: string;
};

interface BenchmarkColumn {
    label: string;
    cpu: string;
    gpu: string;
    totalGpu: string;
    verdict: string;
    views: MediaEntry[];
}

// -- benchmark data for both apps --
// views[0] = processes (task manager process list)
// views[1] = hardware (task manager performance/gpu tab)
const benchmarks: BenchmarkColumn[] = [
    {
        label: "ColorWall",
        cpu: "3.6%",
        gpu: "20.9%",
        totalGpu: "24%",
        verdict: "Barely a whisper.",
        views: [
            {
                type: "image",
                src: "/colorwall-perf.webp",
                alt: "ColorWall processes in Task Manager - 3.6% CPU, 20.9% GPU Video Decode",
                tabLabel: "Processes",
            },
            {
                type: "image",
                src: "/colorwall-hardware.webp",
                alt: "GPU Performance tab while running ColorWall - 20% 3D, 21% Video Decode on Intel HD 4600",
                tabLabel: "Hardware",
            },
        ],
    },
    {
        label: "Lively Wallpaper",
        cpu: "0.2%",
        gpu: "86.5%",
        totalGpu: "98%",
        verdict: "Maxed out.",
        views: [
            {
                type: "image",
                src: "/lively-perf.webp",
                alt: "Lively Wallpaper processes in Task Manager - mpv at 86.5% GPU, 98% total",
                tabLabel: "Processes",
            },
            {
                type: "image",
                src: "/lively-hardware.webp",
                alt: "GPU Performance tab while running Lively - 94% 3D on Intel HD 4600",
                tabLabel: "Hardware",
            },
        ],
    },
];

interface BenchmarkShowcaseProps {
    theme: "dark" | "light";
}

export const BenchmarkShowcase = ({ theme }: BenchmarkShowcaseProps) => {
    const isDark = theme === "dark";
    // independent view index per column so left and right
    // can show different tabs simultaneously
    const [activeViews, setActiveViews] = useState<number[]>([0, 0]);
    // track which media is currently zoomed in
    const [zoomedMedia, setZoomedMedia] = useState<MediaEntry | null>(null);

    // close zoom on escape key
    useEffect(() => {
        if (!zoomedMedia) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setZoomedMedia(null);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [zoomedMedia]);

    // prevent body scroll when zoomed
    useEffect(() => {
        if (zoomedMedia) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [zoomedMedia]);

    // low priority idle callback load to preload all benchmark images
    // this ensures the high-res images are in cache for instant zoom,
    // without blocking the main thread during initial page load
    useEffect(() => {
        const preloadImages = () => {
            benchmarks.forEach(col => {
                col.views.forEach(view => {
                    if (view.type === "image") {
                        const img = new window.Image();
                        img.src = view.src;
                    }
                });
            });
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(preloadImages, { timeout: 2000 });
        } else {
            // fallback for safari
            setTimeout(preloadImages, 1000);
        }
    }, []);

    const setViewForColumn = (colIndex: number, viewIndex: number) => {
        setActiveViews(prev => {
            const next = [...prev];
            next[colIndex] = viewIndex;
            return next;
        });
    };

    return (
        <div className="flex flex-col w-full">

                    {/* ─── top bar: title ─── */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                        <div>
                            <h3 className={`text-lg sm:text-xl font-bold tracking-tight
                                ${isDark ? "text-white" : "text-black"}`}>
                                Real Benchmarks
                            </h3>
                            <p className={`text-xs font-mono mt-0.5
                                ${isDark ? "text-white/40" : "text-black/40"}`}>
                                Same wallpaper · Same hardware · Same conditions
                            </p>
                        </div>
                    </div>

                    {/* ─── main content ─── */}
                    <div className="relative z-10 flex-1 min-h-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 h-full">
                            {benchmarks.map((col, colIdx) => {
                                const currentView = activeViews[colIdx];
                                const media = col.views[currentView];

                                return (
                                    <motion.div
                                        key={col.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 + colIdx * 0.1, duration: 0.4 }}
                                        className="flex flex-col h-full min-h-0"
                                    >
                                        {/* ─── big stat callout ─── */}
                                        <div className="mb-4 sm:mb-5">
                                            <div className="flex items-end gap-3 mb-1">
                                                <span className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none
                                                    ${isDark ? "text-white" : "text-black"}`}>
                                                    {col.totalGpu}
                                                </span>
                                                <span className={`text-sm sm:text-base font-mono mb-1.5
                                                    ${isDark ? "text-white/40" : "text-black/40"}`}>
                                                    total GPU
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <p className={`text-sm font-mono
                                                    ${isDark ? "text-white/50" : "text-black/50"}`}>
                                                    {col.cpu} CPU · {col.gpu} GPU
                                                </p>
                                                <span className={isDark ? "text-white/20" : "text-black/20"}>—</span>
                                                <p className={`text-sm font-medium tracking-tight ${colIdx === 0 ? "text-emerald-500" : "text-red-500"}`}>
                                                    {col.verdict}
                                                </p>
                                            </div>
                                            <p className={`text-base font-semibold tracking-tight mt-2
                                                ${isDark ? "text-white/80" : "text-black/80"}`}>
                                                {col.label}
                                            </p>
                                        </div>

                                        {/* ─── view toggle tabs ─── */}
                                        <div className="flex gap-1 mb-3">
                                            {col.views.map((view, viewIdx) => (
                                                <button
                                                    key={view.tabLabel}
                                                    onClick={() => setViewForColumn(colIdx, viewIdx)}
                                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all duration-200
                                                        ${currentView === viewIdx
                                                            ? (isDark ? "bg-white/15 text-white" : "bg-black/10 text-black")
                                                            : (isDark ? "text-white/40 hover:text-white/80 hover:bg-white/5" : "text-black/40 hover:text-black/80 hover:bg-black/5")
                                                        }`}
                                                >
                                                    {view.tabLabel}
                                                </button>
                                            ))}
                                        </div>

                                        {/* ─── image/video container ─── */}
                                        <div className={`relative w-full aspect-video rounded-xl overflow-hidden border
                                            ${isDark ? "border-white/10" : "border-black/10"}`}>
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={media.src}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute inset-0 cursor-zoom-in group"
                                                    onClick={() => setZoomedMedia(media)}
                                                >
                                                    {/* subtle hover overlay to indicate it's clickable */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10 flex items-center justify-center">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-md text-white rounded-full p-2">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                                <circle cx="11" cy="11" r="8"></circle>
                                                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                                                <line x1="8" y1="11" x2="14" y2="11"></line>
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {media.type === "image" ? (
                                                        <Image
                                                            src={media.src}
                                                            alt={media.alt}
                                                            fill
                                                            className="object-cover object-left-top"
                                                            sizes="(max-width: 768px) 100vw, 50vw"
                                                            quality={90}
                                                            loading="lazy"
                                                            priority={false}
                                                        />
                                                    ) : (
                                                        // future video support - swap in a video
                                                        // element when type === "video"
                                                        <video
                                                            src={media.src}
                                                            className="w-full h-full object-cover"
                                                            controls
                                                            playsInline
                                                            muted
                                                        />
                                                    )}
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─── bottom bar ─── */}
                    <div className="mt-8 text-center">
                        <p className={`text-[11px] font-mono
                            ${isDark ? "text-white/20" : "text-black/30"}`}>
                            i7-4th Gen Haswell (2013) · Intel HD Graphics 4600 · 4K 60FPS video · Unedited Task Manager screenshots
                        </p>
                    </div>

                    {/* ─── zoomed overlay ─── */}
                    <AnimatePresence>
                        {zoomedMedia && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 cursor-zoom-out"
                                onClick={() => setZoomedMedia(null)}
                            >
                                {/* Close button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setZoomedMedia(null);
                                    }}
                                    className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors z-10"
                                    aria-label="Close zoom"
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>

                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.95, opacity: 0 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className="relative w-full max-w-7xl h-full max-h-[90vh] rounded-xl overflow-hidden shadow-2xl"
                                    onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
                                >
                                    {zoomedMedia.type === "image" ? (
                                        <Image
                                            src={zoomedMedia.src}
                                            alt={zoomedMedia.alt}
                                            fill
                                            className="object-contain"
                                            sizes="100vw"
                                            quality={100}
                                            priority
                                        />
                                    ) : (
                                        <video
                                            src={zoomedMedia.src}
                                            className="w-full h-full object-contain"
                                            controls
                                            autoPlay
                                        />
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
        </div>
    );
};
