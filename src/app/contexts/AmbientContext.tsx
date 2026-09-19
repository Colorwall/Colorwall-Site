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
            audio.volume = 0.9;
            audio.preload = "none";
            audioRef.current = audio;
        }
        return audioRef.current;
    }, []);

    // Aggressive initialization and forced autoplay
    useEffect(() => {
        const audio = ensureAudio();
        
        // 1. Force the audio to initialize and load immediately so it shows up in network tab
        if (!hasInitializedTrack.current) {
            const newTrack = initializeRandomTrackIfNeeded(audio);
            if (newTrack && audio.src !== new URL(newTrack.src, window.location.origin).href) {
                audio.src = newTrack.src;
            }
        }
        
        // If the user explicitly paused it before, we still preload it, but we respect the pause state
        const userPaused = localStorage.getItem("ambient-paused") === "true";
        if (userPaused) return;

        // 2. The Brute Force trigger
        const brutalForcePlay = () => {
            audio.play().then(() => {
                setIsEnabled(true);
            }).catch(console.error);

            // Clean up all listeners once it fires
            window.removeEventListener("pointerdown", brutalForcePlay, true);
            window.removeEventListener("touchstart", brutalForcePlay, true);
            window.removeEventListener("keydown", brutalForcePlay, true);
            window.removeEventListener("click", brutalForcePlay, true);
        };

        // 3. Attempt immediate play
        audio.play().then(() => {
            setIsEnabled(true);
        }).catch(() => {
            // 4. If blocked, set bulletproof traps for any valid user gesture
            window.addEventListener("pointerdown", brutalForcePlay, { capture: true, once: true });
            window.addEventListener("touchstart", brutalForcePlay, { capture: true, once: true });
            window.addEventListener("keydown", brutalForcePlay, { capture: true, once: true });
            window.addEventListener("click", brutalForcePlay, { capture: true, once: true });
        });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            window.removeEventListener("pointerdown", brutalForcePlay, true);
            window.removeEventListener("touchstart", brutalForcePlay, true);
            window.removeEventListener("keydown", brutalForcePlay, true);
            window.removeEventListener("click", brutalForcePlay, true);
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
