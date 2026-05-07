"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

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

export const AmbientPlayer = ({ theme }: { theme: string }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<AmbientTrack>(() => pickRandomTrack());
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const isDark = theme === "dark";

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const ensureAudio = () => {
        if (!audioRef.current) {
            const audio = new Audio();
            audio.loop = true;
            audio.volume = 0.7;
            audio.preload = "none";
            audioRef.current = audio;
        }
        return audioRef.current;
    };

    const toggleAudio = () => {
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
    };

    return (
        <div className="w-full px-8 sm:px-0">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
                <div className="relative w-full sm:w-auto">
                <div className={`flex w-full sm:w-auto items-stretch rounded-xl border ${
                    isDark ? "border-white/20 bg-black/30" : "border-black/20 bg-white/60"
                }`}>
                        <button
                            type="button"
                            onClick={toggleAudio}
                            aria-pressed={isEnabled}
                            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3 rounded-l-xl font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 border-r ${
                                isEnabled
                                    ? isDark
                                        ? "border-white/20 border-r-white/20 text-white bg-white/12 hover:bg-white/20"
                                        : "border-black/20 border-r-black/20 text-black bg-black/10 hover:bg-black/15"
                                    : isDark
                                        ? "border-white/20 border-r-white/20 text-white bg-black/30 hover:bg-black/50"
                                        : "border-black/20 border-r-black/20 text-black bg-white/50 hover:bg-white/80"
                            }`}
                        >
                            {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            Music {isEnabled ? "On" : "Off"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsExpanded((prev) => !prev)}
                            aria-label={isExpanded ? "Collapse track selector" : "Expand track selector"}
                            className={`inline-flex items-center justify-center px-3 rounded-r-xl transition-colors ${
                                isDark
                                    ? "text-white hover:bg-black/50"
                                    : "text-black hover:bg-white/90"
                            }`}
                        >
                            {isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                </div>

                {isExpanded && (
                    <>
                    <div className="mt-2 w-full rounded-xl border border-white/20 bg-[#0a0a0a] px-2 py-2 sm:hidden">
                        <div className="flex min-w-[220px] flex-col">
                            {AMBIENT_TRACKS.map((track) => (
                                <button
                                    key={track.id}
                                    type="button"
                                    onClick={() => {
                                        setCurrentTrack(track);
                                        const audio = audioRef.current;
                                        if (audio && isEnabled) {
                                            audio.src = track.src;
                                            audio.play().catch(() => setIsEnabled(false));
                                        }
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium text-white transition-colors hover:bg-white/10"
                                >
                                    {track.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="hidden sm:block absolute left-[calc(100%+0.5rem)] top-0 w-[240px] rounded-xl border border-white/20 bg-[#0a0a0a] px-2 py-2">
                        <div className="flex flex-col">
                            {AMBIENT_TRACKS.map((track) => (
                                <button
                                    key={track.id}
                                    type="button"
                                    onClick={() => {
                                        setCurrentTrack(track);
                                        const audio = audioRef.current;
                                        if (audio && isEnabled) {
                                            audio.src = track.src;
                                            audio.play().catch(() => setIsEnabled(false));
                                        }
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium text-white transition-colors hover:bg-white/10"
                                >
                                    {track.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    </>
                )}
                </div>
            </div>
        </div>
    );
};
