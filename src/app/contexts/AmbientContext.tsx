"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";

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
        ? AMBIENT_TRACKS.filter((t) => t.id !== excludingId)
        : AMBIENT_TRACKS;
    const pool = filtered.length > 0 ? filtered : AMBIENT_TRACKS;
    return pool[Math.floor(Math.random() * pool.length)];
};

// shared audio state across all ambient player instances
interface AmbientContextValue {
    isEnabled: boolean;
    currentTrack: AmbientTrack;
    tracks: AmbientTrack[];
    toggle: () => void;
    selectTrack: (track: AmbientTrack) => void;
}

const AmbientContext = createContext<AmbientContextValue | null>(null);

export function AmbientProvider({ children }: { children: ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<AmbientTrack>(() => pickRandomTrack());
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

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

    const toggle = useCallback(() => {
        if (isEnabled) {
            audioRef.current?.pause();
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
        const audio = audioRef.current;
        if (audio && isEnabled) {
            audio.src = track.src;
            audio.play().catch(() => setIsEnabled(false));
        }
    }, [isEnabled]);

    return (
        <AmbientContext.Provider value={{ isEnabled, currentTrack, tracks: AMBIENT_TRACKS, toggle, selectTrack }}>
            {children}
        </AmbientContext.Provider>
    );
}

export function useAmbient() {
    const ctx = useContext(AmbientContext);
    if (!ctx) throw new Error("useAmbient must be used within AmbientProvider");
    return ctx;
}
