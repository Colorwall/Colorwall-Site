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
    const hasInitializedTrack = useRef(false);

    const initializeRandomTrackIfNeeded = useCallback((audio: HTMLAudioElement) => {
        if (hasInitializedTrack.current) return null;
        hasInitializedTrack.current = true;

        const randomPoolIds = ["default", "atmosphere", "hue-sparkles", "spacetype-track"];
        const randomId = randomPoolIds[Math.floor(Math.random() * randomPoolIds.length)];
        const track = AMBIENT_TRACKS.find(t => t.id === randomId) || AMBIENT_TRACKS[0];
        
        setCurrentTrack(track);
        audio.src = track.src;
        return track;
    }, []);

    const ensureAudio = useCallback(() => {
        if (!audioRef.current) {
            const audio = new Audio();
            audio.loop = true;
            audio.volume = 0.8;
            audio.preload = "none";
            audioRef.current = audio;
        }
        return audioRef.current;
    }, []);

    // Wait for user interaction or attempt deferred autoplay
    useEffect(() => {
        const userPaused = localStorage.getItem("ambient-paused") === "true";
        if (userPaused) return;

        let idleId: number;
        let timeoutId: NodeJS.Timeout;

        const startOnInteraction = () => {
            const isStillPaused = localStorage.getItem("ambient-paused") === "true";
            const audio = ensureAudio();
            
            if (!isStillPaused) {
                if (!hasInitializedTrack.current) {
                    const newTrack = initializeRandomTrackIfNeeded(audio);
                    if (newTrack && audio.src !== new URL(newTrack.src, window.location.origin).href) {
                        audio.src = newTrack.src;
                    }
                }
                audio.play()
                    .then(() => setIsEnabled(true))
                    .catch(() => {});
            }
            
            document.removeEventListener("pointerdown", startOnInteraction, true);
            document.removeEventListener("keydown", startOnInteraction, true);
            document.removeEventListener("touchstart", startOnInteraction, true);
            document.removeEventListener("click", startOnInteraction, true);
            document.removeEventListener("scroll", startOnInteraction, true);
            document.removeEventListener("wheel", startOnInteraction, true);
            document.removeEventListener("mousemove", startOnInteraction, true);
        };
        
        const attemptAutoplay = () => {
            const audio = ensureAudio();
            if (!hasInitializedTrack.current) {
                const newTrack = initializeRandomTrackIfNeeded(audio);
                if (newTrack && audio.src !== new URL(newTrack.src, window.location.origin).href) {
                    audio.src = newTrack.src;
                }
            }
            
            audio.play().then(() => {
                setIsEnabled(true);
            }).catch(() => {
                // If autoplay is blocked by browser policies, fall back to interaction listeners
                document.addEventListener("pointerdown", startOnInteraction, { capture: true });
                document.addEventListener("keydown", startOnInteraction, { capture: true });
                document.addEventListener("touchstart", startOnInteraction, { capture: true });
                document.addEventListener("click", startOnInteraction, { capture: true });
                document.addEventListener("scroll", startOnInteraction, { capture: true, passive: true });
                document.addEventListener("wheel", startOnInteraction, { capture: true, passive: true });
                document.addEventListener("mousemove", startOnInteraction, { capture: true, passive: true });
            });
        };

        // Delay autoplay attempt until the page is fully loaded to reduce LCP overhead
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            idleId = window.requestIdleCallback(() => attemptAutoplay(), { timeout: 2000 });
        } else {
            timeoutId = setTimeout(() => attemptAutoplay(), 1000);
        }

        return () => {
            if (idleId) window.cancelIdleCallback(idleId);
            if (timeoutId) clearTimeout(timeoutId);
            
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            document.removeEventListener("pointerdown", startOnInteraction, true);
            document.removeEventListener("keydown", startOnInteraction, true);
            document.removeEventListener("touchstart", startOnInteraction, true);
            document.removeEventListener("click", startOnInteraction, true);
            document.removeEventListener("scroll", startOnInteraction, true);
            document.removeEventListener("wheel", startOnInteraction, true);
            document.removeEventListener("mousemove", startOnInteraction, true);
        };
    }, [ensureAudio, initializeRandomTrackIfNeeded]);

    const toggle = useCallback(() => {
        if (isEnabled) {
            audioRef.current?.pause();
            setIsEnabled(false);
            localStorage.setItem("ambient-paused", "true");
            return;
        }

        const audio = ensureAudio();
        const newTrack = initializeRandomTrackIfNeeded(audio);
        const trackToPlay = newTrack || currentTrack;

        if (audio.src !== new URL(trackToPlay.src, window.location.origin).href) {
            audio.src = trackToPlay.src;
        }

        audio.play()
            .then(() => {
                setIsEnabled(true);
                localStorage.setItem("ambient-paused", "false");
            })
            .catch(() => setIsEnabled(false));
    }, [isEnabled, currentTrack, ensureAudio, initializeRandomTrackIfNeeded]);

    const forcePlay = useCallback(() => {
        const audio = ensureAudio();
        const newTrack = initializeRandomTrackIfNeeded(audio);
        const trackToPlay = newTrack || currentTrack;

        if (audio.src !== new URL(trackToPlay.src, window.location.origin).href) {
            audio.src = trackToPlay.src;
        }
        audio.play()
            .then(() => {
                setIsEnabled(true);
                localStorage.setItem("ambient-paused", "false");
            })
            .catch(() => {});
    }, [currentTrack, ensureAudio, initializeRandomTrackIfNeeded]);

    const selectTrack = useCallback((track: AmbientTrack) => {
        hasInitializedTrack.current = true;
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
