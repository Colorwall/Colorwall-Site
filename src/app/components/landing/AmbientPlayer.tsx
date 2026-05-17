"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, ChevronDown, Music } from "lucide-react";

type AmbientTrack = {
    id: string;
    label: string;
    src: string;
};

const AMBIENT_TRACKS: AmbientTrack[] = [
    { id: "instrumental", label: "Instrumental", src: "/instrumental.mp3" },
    { id: "crypto-dreams", label: "Crypto Dreams", src: "/crypto-dreams.mp3" },
];

const pickRandomTrack = (excludingId?: string): AmbientTrack => {
    const filtered = excludingId
        ? AMBIENT_TRACKS.filter((track) => track.id !== excludingId)
        : AMBIENT_TRACKS;
    const pool = filtered.length > 0 ? filtered : AMBIENT_TRACKS;
    return pool[Math.floor(Math.random() * pool.length)];
};

// animated equalizer bars shown when music is playing
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

export const AmbientPlayer = ({ theme }: { theme: string }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<AmbientTrack>(() => pickRandomTrack());
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const isDark = theme === "dark";

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // close dropdown when clicking outside
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

    const ensureAudio = useCallback(() => {
        if (!audioRef.current) {
            const audio = new Audio();
            audio.loop = true;
            audio.volume = 0.7;
            audio.preload = "none";
            audioRef.current = audio;
        }
        return audioRef.current;
    }, []);

    const toggleAudio = useCallback(() => {
        if (isEnabled) {
            const audio = audioRef.current;
            if (!audio) return;
            audio.pause();
            setIsEnabled(false);
            return;
        }

        const audio = ensureAudio();
        if (audio.src !== new URL(currentTrack.src, window.location.origin).href) {
            audio.src = currentTrack.src;
        }

        audio.play()
            .then(() => setIsEnabled(true))
            .catch(() => setIsEnabled(false));
    }, [isEnabled, currentTrack, ensureAudio]);

    const selectTrack = useCallback((track: AmbientTrack) => {
        setCurrentTrack(track);
        setIsOpen(false);
        const audio = audioRef.current;
        if (audio && isEnabled) {
            audio.src = track.src;
            audio.play().catch(() => setIsEnabled(false));
        }
    }, [isEnabled]);

    return (
        <div className="w-full px-8 sm:px-0" ref={containerRef}>
            <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
                <div className="relative">
                    {/* main pill */}
                    <div
                        className={`
                            relative flex items-center rounded-full overflow-hidden
                            transition-all duration-500
                            ${isEnabled
                                ? isDark
                                    ? "bg-white/[0.08] shadow-[0_0_20px_rgba(96,165,250,0.15),0_0_40px_rgba(96,165,250,0.05)]"
                                    : "bg-black/[0.06] shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                : isDark
                                    ? "bg-white/[0.05]"
                                    : "bg-black/[0.04]"
                            }
                            backdrop-blur-md border
                            ${isDark ? "border-white/10" : "border-black/10"}
                        `}
                    >
                        {/* play/pause toggle */}
                        <button
                            type="button"
                            onClick={toggleAudio}
                            {...{ "aria-pressed": isEnabled ? "true" : "false" }}
                            aria-label={isEnabled ? "Pause ambient music" : "Play ambient music"}
                            className={`
                                flex items-center gap-2 pl-4 pr-3 py-2.5
                                text-xs font-medium tracking-wide
                                transition-colors duration-300 cursor-pointer
                                ${isDark
                                    ? "text-white/80 hover:text-white"
                                    : "text-black/70 hover:text-black"
                                }
                            `}
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

                        {/* separator */}
                        <div className={`w-px h-5 ${isDark ? "bg-white/10" : "bg-black/10"}`} />

                        {/* track selector toggle */}
                        <button
                            type="button"
                            onClick={() => setIsOpen((prev) => !prev)}
                            aria-label="Select ambient track"
                            {...{ "aria-expanded": isOpen ? "true" : "false" }}
                            className={`
                                flex items-center gap-1 px-3 py-2.5
                                text-xs font-medium tracking-wide cursor-pointer
                                transition-colors duration-300
                                ${isDark
                                    ? "text-white/60 hover:text-white/90"
                                    : "text-black/50 hover:text-black/80"
                                }
                            `}
                        >
                            <Music className="w-3 h-3" />
                            <ChevronDown
                                className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                    </div>

                    {/* track dropdown */}
                    {isOpen && (
                        <div
                            className={`
                                absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50
                                min-w-[200px] rounded-xl overflow-hidden
                                backdrop-blur-xl border
                                animate-[fadeSlideIn_0.2s_ease-out]
                                ${isDark
                                    ? "bg-black/80 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                                    : "bg-white/90 border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                                }
                            `}
                        >
                            <div className="p-1.5">
                                {AMBIENT_TRACKS.map((track) => {
                                    const isActive = currentTrack.id === track.id;
                                    return (
                                        <button
                                            key={track.id}
                                            type="button"
                                            onClick={() => selectTrack(track)}
                                            className={`
                                                w-full flex items-center gap-2.5 rounded-lg px-3 py-2
                                                text-xs font-medium transition-colors duration-200 cursor-pointer
                                                ${isActive
                                                    ? isDark
                                                        ? "bg-white/10 text-white"
                                                        : "bg-black/8 text-black"
                                                    : isDark
                                                        ? "text-white/70 hover:bg-white/[0.06] hover:text-white"
                                                        : "text-black/60 hover:bg-black/[0.04] hover:text-black"
                                                }
                                            `}
                                        >
                                            {isActive && isEnabled ? (
                                                <EqualizerBars />
                                            ) : (
                                                <Music className="w-3 h-3 opacity-50" />
                                            )}
                                            {track.label}
                                            {isActive && (
                                                <span
                                                    className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
                                                        isDark ? "bg-white/10 text-white/50" : "bg-black/8 text-black/40"
                                                    }`}
                                                >
                                                    {isEnabled ? "playing" : "selected"}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <style>{`
                        @keyframes fadeSlideIn {
                            from {
                                opacity: 0;
                                transform: translateX(-50%) translateY(-4px);
                            }
                            to {
                                opacity: 1;
                                transform: translateX(-50%) translateY(0);
                            }
                        }
                    `}</style>
                </div>
            </div>
        </div>
    );
};
