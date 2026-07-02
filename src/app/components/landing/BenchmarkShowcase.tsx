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
    isOpen: boolean;
    onClose: () => void;
    theme: "dark" | "light";
}

export const BenchmarkShowcase = ({ isOpen, onClose, theme }: BenchmarkShowcaseProps) => {
    const isDark = theme === "dark";
    const overlayRef = useRef<HTMLDivElement>(null);
    // independent view index per column so left and right
    // can show different tabs simultaneously
    const [activeViews, setActiveViews] = useState<number[]>([0, 0]);

    // close on escape key press
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // prevent body scroll while modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // reset view selections when modal reopens
    useEffect(() => {
        if (isOpen) setActiveViews([0, 0]);
    }, [isOpen]);

    const setViewForColumn = (colIndex: number, viewIndex: number) => {
        setActiveViews(prev => {
            const next = [...prev];
            next[colIndex] = viewIndex;
            return next;
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[100] flex flex-col"
                    onClick={(e) => {
                        if (e.target === overlayRef.current) onClose();
                    }}
                >
                    {/* full-screen dark backdrop */}
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

                    {/* ─── top bar: title + close ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5 shrink-0"
                    >
                        <div>
                            <h3 className="text-white text-lg sm:text-xl font-bold tracking-tight">
                                Real Benchmarks
                            </h3>
                            <p className="text-white/30 text-xs font-mono mt-0.5">
                                Same wallpaper · Same hardware · Same conditions
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors duration-200"
                            aria-label="Close benchmark showcase"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </motion.div>

                    {/* ─── main content - fills remaining viewport ─── */}
                    <div className="relative z-10 flex-1 min-h-0 px-6 sm:px-10 pb-4 sm:pb-6 overflow-y-auto">
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
                                        {/* total gpu is the hero number - 24% vs 98% hits
                                            you in the face before you even look at the images */}
                                        <div className="mb-4 sm:mb-5">
                                            <div className="flex items-end gap-3 mb-1">
                                                <span className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-none">
                                                    {col.totalGpu}
                                                </span>
                                                <span className="text-white/30 text-sm sm:text-base font-mono mb-1.5">
                                                    total GPU
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <p className="text-white/50 text-sm font-mono">
                                                    {col.cpu} CPU · {col.gpu} GPU
                                                </p>
                                                <span className="text-white/20">—</span>
                                                <p className={`text-sm font-medium tracking-tight ${colIdx === 0 ? "text-emerald-400/80" : "text-red-400/60"}`}>
                                                    {col.verdict}
                                                </p>
                                            </div>
                                            <p className="text-white/60 text-base font-semibold tracking-tight mt-2">
                                                {col.label}
                                            </p>
                                        </div>

                                        {/* ─── view toggle tabs ─── */}
                                        {/* sits directly above the image so it's clear
                                            what you're switching between. each column
                                            has its own independent toggle state */}
                                        <div className="flex gap-1 mb-3">
                                            {col.views.map((view, viewIdx) => (
                                                <button
                                                    key={view.tabLabel}
                                                    onClick={() => setViewForColumn(colIdx, viewIdx)}
                                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all duration-200
                                                        ${currentView === viewIdx
                                                            ? "bg-white/15 text-white"
                                                            : "text-white/30 hover:text-white/60 hover:bg-white/5"
                                                        }`}
                                                >
                                                    {view.tabLabel}
                                                </button>
                                            ))}
                                        </div>

                                        {/* ─── image/video container ─── */}
                                        {/* fills remaining vertical space. animatepresence
                                            crossfades between process and hardware views */}
                                        <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden border border-white/8">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={media.src}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="absolute inset-0"
                                                >
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                        className="relative z-10 px-6 sm:px-10 pb-5 sm:pb-6 shrink-0"
                    >
                        <p className="text-white/15 text-[11px] font-mono text-center">
                            i7-4th Gen Haswell (2013) · Intel HD Graphics 4600 · 4K 60FPS video · Unedited Task Manager screenshots
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
