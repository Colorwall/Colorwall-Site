"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { AmbientPlayer } from "@/app/components/landing/AmbientPlayer";

// the ambient player floats at the bottom of the screen on all pages.
// on the homepage, when the hero's "ambient-dock" element is visible,
// it smoothly animates up into that dock position instead of floating.

export function GlobalAmbientPlayer() {
    const { theme } = useTheme();
    const pathname = usePathname();
    const isHome = pathname === "/";

    const playerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>(0);
    const [isDocked, setIsDocked] = useState(false);
    const [dockRect, setDockRect] = useState<DOMRect | null>(null);

    // watch the dock target on homepage
    const updateDockPosition = useCallback(() => {
        if (!isHome) {
            setIsDocked(false);
            setDockRect(null);
            return;
        }

        const dock = document.getElementById("ambient-dock");
        if (!dock) {
            setIsDocked(false);
            setDockRect(null);
            return;
        }

        const rect = dock.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;

        if (inView) {
            setIsDocked(true);
            setDockRect(rect);
        } else {
            setIsDocked(false);
            setDockRect(null);
        }
    }, [isHome]);

    // update on scroll + resize using raf for smooth tracking
    useEffect(() => {
        if (!isHome) {
            setIsDocked(false);
            return;
        }

        const onFrame = () => {
            updateDockPosition();
            rafRef.current = requestAnimationFrame(onFrame);
        };

        // slight delay to let the page render the dock element
        const timer = setTimeout(() => {
            rafRef.current = requestAnimationFrame(onFrame);
        }, 100);

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(rafRef.current);
        };
    }, [isHome, updateDockPosition]);

    // calculate position styles
    const getPositionStyle = (): React.CSSProperties => {
        if (isDocked && dockRect) {
            // dock into the hero section position
            const playerWidth = playerRef.current?.offsetWidth || 200;
            const centerX = dockRect.left + dockRect.width / 2 - playerWidth / 2;
            const centerY = dockRect.top + dockRect.height / 2 - 24; // roughly center vertically

            return {
                position: "fixed",
                left: `${centerX}px`,
                top: `${centerY}px`,
                transform: "none",
                transition: "left 0.5s cubic-bezier(0.4, 0, 0.2, 1), top 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
                zIndex: 90,
                opacity: 1,
            };
        }

        // floating at bottom center (default)
        return {
            position: "fixed",
            left: "50%",
            bottom: "16px",
            top: "auto",
            transform: "translateX(-50%)",
            transition: "left 0.5s cubic-bezier(0.4, 0, 0.2, 1), top 0.5s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
            zIndex: 90,
            opacity: 1,
        };
    };

    return (
        <>
            {/* ambient glow ring when docked — subtle svg animation */}
            {isDocked && (
                <div
                    className="pointer-events-none fixed"
                    style={{
                        left: dockRect ? `${dockRect.left + dockRect.width / 2}px` : "50%",
                        top: dockRect ? `${dockRect.top + dockRect.height / 2}px` : "auto",
                        transform: "translate(-50%, -50%)",
                        zIndex: 89,
                        transition: "left 0.5s ease, top 0.5s ease, opacity 0.6s ease",
                        opacity: 1,
                    }}
                >
                    <svg width="160" height="60" viewBox="0 0 160 60" fill="none" className="animate-pulse">
                        <ellipse cx="80" cy="30" rx="70" ry="25"
                            stroke="url(#ambient-glow-grad)"
                            strokeWidth="1"
                            opacity="0.4"
                        />
                        <ellipse cx="80" cy="30" rx="55" ry="18"
                            stroke="url(#ambient-glow-grad)"
                            strokeWidth="0.5"
                            opacity="0.25"
                        />
                        <defs>
                            <linearGradient id="ambient-glow-grad" x1="0" y1="30" x2="160" y2="30">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                                <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.6" />
                                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
                                <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.6" />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            )}

            {/* the actual player */}
            <div ref={playerRef} style={getPositionStyle()}>
                <AmbientPlayer theme={theme} />
            </div>
        </>
    );
}
