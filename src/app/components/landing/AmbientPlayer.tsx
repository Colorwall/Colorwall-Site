"use client";

import { useEffect, useRef, useState } from "react";
import { VolumeX, ChevronDown, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAmbient } from "@/app/contexts/AmbientContext";
import { cn } from "@/lib/utils";

// animated equalizer bars shown when ambient soundtrack is active
const EqualizerBars = () => (
    <div className="eq-bars flex items-end gap-[2px] h-3.5 w-3.5">
        <span className="eq-bar inline-block w-[2.5px] rounded-full bg-current" />
        <span className="eq-bar inline-block w-[2.5px] rounded-full bg-current" />
        <span className="eq-bar inline-block w-[2.5px] rounded-full bg-current" />
        <span className="eq-bar inline-block w-[2.5px] rounded-full bg-current" />
        <style>{`
            @keyframes eqBounce {
                0%   { height: 20%; }
                100% { height: 100%; }
            }
            .eq-bar { animation: eqBounce 0.8s ease-in-out infinite alternate; }
            .eq-bar:nth-child(2) { animation-delay: 0.15s; }
            .eq-bar:nth-child(3) { animation-delay: 0.3s; }
            .eq-bar:nth-child(4) { animation-delay: 0.45s; }
        `}</style>
    </div>
);

interface AmbientPlayerProps {
    theme: string;
    className?: string;
    direction?: "up" | "down" | "auto";
    align?: "left" | "right" | "center" | "auto";
}

// adaptive ambient music pill with viewport collision detection and smooth framer-motion dropdown
export const AmbientPlayer = ({
    theme,
    className = "",
    direction = "auto",
    align = "auto",
}: AmbientPlayerProps) => {
    const { isEnabled, currentTrack, tracks, toggle, selectTrack } = useAmbient();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [computedDir, setComputedDir] = useState<"up" | "down">("down");
    const [computedAlign, setComputedAlign] = useState<"left" | "right" | "center">("center");

    const isDark = theme === "dark";

    // compute optimal direction and alignment when opening to prevent offscreen clipping
    useEffect(() => {
        if (!isOpen || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // vertical placement: if pill is near bottom edge, flip upward
        if (direction === "auto") {
            const spaceBelow = window.innerHeight - rect.bottom;
            setComputedDir(spaceBelow < 330 ? "up" : "down");
        } else {
            setComputedDir(direction);
        }

        // horizontal placement: clamp to nearest screen boundary
        if (align === "auto") {
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;
            if (spaceRight < 160) {
                setComputedAlign("right");
            } else if (spaceLeft < 160) {
                setComputedAlign("left");
            } else {
                setComputedAlign("center");
            }
        } else {
            setComputedAlign(align);
        }
    }, [isOpen, direction, align]);

    // close dropdown on outside clicks
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    return (
        <div className={cn("relative select-none", className)} ref={containerRef}>
            <div className="flex items-center justify-center">
                <div className="relative">
                    {/* main interactive pill */}
                    <div
                        className={cn(
                            "relative flex items-center rounded-full overflow-hidden transition-all duration-300 backdrop-blur-md border",
                            isEnabled
                                ? isDark
                                    ? "bg-white/[0.08] shadow-[0_0_20px_rgba(96,165,250,0.15)] border-white/15"
                                    : "bg-black/[0.06] shadow-[0_0_20px_rgba(59,130,246,0.1)] border-black/15"
                                : isDark
                                    ? "bg-white/[0.05] border-white/10"
                                    : "bg-black/[0.04] border-black/10"
                        )}
                    >
                        {/* play and pause toggle */}
                        <button
                            type="button"
                            onClick={toggle}
                            {...{ "aria-pressed": isEnabled ? "true" : "false" }}
                            aria-label={isEnabled ? "Pause ambient music" : "Play ambient music"}
                            className={cn(
                                "flex items-center gap-2 pl-4 pr-3 py-2 text-xs font-medium tracking-wide transition-colors duration-200 cursor-pointer",
                                isDark
                                    ? "text-white/80 hover:text-white"
                                    : "text-black/70 hover:text-black"
                            )}
                        >
                            {isEnabled ? (
                                <EqualizerBars />
                            ) : (
                                <VolumeX className="w-3.5 h-3.5 opacity-60" />
                            )}
                            <span className="hidden sm:inline">
                                {isEnabled ? currentTrack.label : "Ambient"}
                            </span>
                            <span className="sm:hidden">
                                {isEnabled ? "On" : "Off"}
                            </span>
                        </button>

                        {/* separator line */}
                        <div className={cn("w-px h-4", isDark ? "bg-white/10" : "bg-black/10")} />

                        {/* track drawer trigger */}
                        <button
                            type="button"
                            onClick={() => setIsOpen((prev) => !prev)}
                            aria-label="Select ambient track"
                            {...{ "aria-expanded": isOpen ? "true" : "false" }}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 text-xs font-medium tracking-wide cursor-pointer transition-colors duration-200",
                                isDark
                                    ? "text-white/60 hover:text-white/90"
                                    : "text-black/50 hover:text-black/80"
                            )}
                        >
                            <Music className="w-3 h-3" />
                            <ChevronDown
                                className={cn(
                                    "w-3 h-3 transition-transform duration-300",
                                    isOpen ? "rotate-180" : ""
                                )}
                            />
                        </button>
                    </div>

                    {/* track dropdown menu anchored with hardware accelerated framer-motion */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: computedDir === "up" ? 6 : -6,
                                    scale: 0.97,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: computedDir === "up" ? 6 : -6,
                                    scale: 0.97,
                                }}
                                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                                className={cn(
                                    "absolute z-[100] min-w-[210px] max-h-[min(340px,75vh)] overflow-y-auto rounded-2xl border p-1.5 backdrop-blur-2xl shadow-2xl",
                                    computedDir === "up"
                                        ? "bottom-full mb-2 origin-bottom"
                                        : "top-full mt-2 origin-top",
                                    computedAlign === "right" && "right-0 origin-top-right",
                                    computedAlign === "left" && "left-0 origin-top-left",
                                    computedAlign === "center" && "left-1/2 -translate-x-1/2",
                                    isDark
                                        ? "bg-[#0b0d14]/95 border-white/10 text-white shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
                                        : "bg-white/95 border-black/10 text-slate-900 shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
                                )}
                            >
                                <div className="flex flex-col gap-0.5">
                                    {tracks.map((track) => {
                                        const isActive = currentTrack.id === track.id;
                                        return (
                                            <button
                                                key={track.id}
                                                type="button"
                                                onClick={() => {
                                                    selectTrack(track);
                                                    setIsOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer text-left",
                                                    isActive
                                                        ? isDark
                                                            ? "bg-white/10 text-white"
                                                            : "bg-black/8 text-black"
                                                        : isDark
                                                            ? "text-white/70 hover:bg-white/[0.06] hover:text-white"
                                                            : "text-black/60 hover:bg-black/[0.04] hover:text-black"
                                                )}
                                            >
                                                {isActive && isEnabled ? (
                                                    <EqualizerBars />
                                                ) : (
                                                    <Music className="w-3 h-3 opacity-50 shrink-0" />
                                                )}
                                                <span className="truncate">{track.label}</span>
                                                {isActive && (
                                                    <span
                                                        className={cn(
                                                            "ml-auto text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider shrink-0",
                                                            isDark
                                                                ? "bg-white/10 text-white/60"
                                                                : "bg-black/8 text-black/50"
                                                        )}
                                                    >
                                                        {isEnabled ? "playing" : "selected"}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
