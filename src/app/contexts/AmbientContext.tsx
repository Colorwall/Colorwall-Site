"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";

type AmbientTrack = {
    id: string;
    label: string;
    src: string;
};

const AMBIENT_TRACKS: AmbientTrack[] = [
    { id: "default", label: "Default", src: "/audio/default.mp3" },
    { id: "crypto-dreams", label: "Crypto Dreams", src: "/audio/crypto-dreams.mp3" },
    { id: "atmosphere", label: "Atmosphere", src: "/audio/atmosphere.mp3" },
    { id: "burialthumping", label: "Burial Thumping", src: "/audio/burialthumping.mp3" },
    { id: "hue-sparkles", label: "Hue Sparkles", src: "/audio/hueSparkles.mp3" },
    { id: "humm-plus-bass", label: "Humm Plus Bass", src: "/audio/hummplusbass.mp3" },
    { id: "spacetype-track", label: "Spacetype Track", src: "/audio/SPACETYPEtrack.mp3" },
];

const getDefaultTrack = (): AmbientTrack => {
    return AMBIENT_TRACKS.find(t => t.id === "default") || AMBIENT_TRACKS[0];
};

// shared audio state across all ambient player instances
interface AmbientContextValue {
    isEnabled: boolean;
    currentTrack: AmbientTrack;
    tracks: AmbientTrack[];
    toggle: () => void;
    forcePlay: () => void;
    selectTrack: (track: AmbientTrack) => void;
}

const AmbientContext = createContext<AmbientContextValue | null>(null);

export function AmbientProvider({ children }: { children: ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<AmbientTrack>(getDefaultTrack);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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

    // Initial setup, autoplay and cleanup
    useEffect(() => {
        const userPaused = localStorage.getItem("ambient-paused") === "true";
        if (userPaused) return;

        const audio = ensureAudio();
        if (audio.src !== new URL(currentTrack.src, window.location.origin).href) {
            audio.src = currentTrack.src;
        }

        // Attempt autoplay
        audio.play().then(() => {
            setIsEnabled(true);
        }).catch(() => {
            // Autoplay blocked. Wait for user interaction.
            const startOnInteraction = () => {
                const isStillPaused = localStorage.getItem("ambient-paused") === "true";
                if (!isStillPaused && audioRef.current) {
                    audioRef.current.play()
                        .then(() => setIsEnabled(true))
                        .catch(() => {});
                }
                document.removeEventListener("pointerdown", startOnInteraction, true);
                document.removeEventListener("keydown", startOnInteraction, true);
                document.removeEventListener("touchstart", startOnInteraction, true);
                document.removeEventListener("click", startOnInteraction, true);
            };
            
            document.addEventListener("pointerdown", startOnInteraction, { capture: true });
            document.addEventListener("keydown", startOnInteraction, { capture: true });
            document.addEventListener("touchstart", startOnInteraction, { capture: true });
            document.addEventListener("click", startOnInteraction, { capture: true });
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [currentTrack, ensureAudio]);

    const toggle = useCallback(() => {
        if (isEnabled) {
            audioRef.current?.pause();
            setIsEnabled(false);
            localStorage.setItem("ambient-paused", "true");
            return;
        }

        const audio = ensureAudio();
        if (audio.src !== new URL(currentTrack.src, window.location.origin).href) {
            audio.src = currentTrack.src;
        }

        audio.play()
            .then(() => {
                setIsEnabled(true);
                localStorage.setItem("ambient-paused", "false");
            })
            .catch(() => setIsEnabled(false));
    }, [isEnabled, currentTrack, ensureAudio]);

    const forcePlay = useCallback(() => {
        const audio = ensureAudio();
        if (audio.src !== new URL(currentTrack.src, window.location.origin).href) {
            audio.src = currentTrack.src;
        }
        audio.play()
            .then(() => {
                setIsEnabled(true);
                localStorage.setItem("ambient-paused", "false");
            })
            .catch(() => {});
    }, [currentTrack, ensureAudio]);

    const selectTrack = useCallback((track: AmbientTrack) => {
        setCurrentTrack(track);
        const audio = audioRef.current;
        if (audio && isEnabled) {
            audio.src = track.src;
            audio.play().catch(() => setIsEnabled(false));
        }
    }, [isEnabled]);

    return (
        <AmbientContext.Provider value={{ isEnabled, currentTrack, tracks: AMBIENT_TRACKS, toggle, forcePlay, selectTrack }}>
            {children}
        </AmbientContext.Provider>
    );
}

export function useAmbient() {
    const ctx = useContext(AmbientContext);
    if (!ctx) throw new Error("useAmbient must be used within AmbientProvider");
    return ctx;
}
