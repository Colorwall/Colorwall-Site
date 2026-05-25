"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { AmbientPlayer } from "@/app/components/landing/AmbientPlayer";

// global ambient player — fixed at bottom center, persists across all pages
export function GlobalAmbientPlayer() {
    const { theme } = useTheme();

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90]">
            <AmbientPlayer theme={theme} />
        </div>
    );
}
