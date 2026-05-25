"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { AmbientPlayer } from "@/app/components/landing/AmbientPlayer";

// homepage = docked inline in the hero dock target
// any other page = fixed float at bottom center
// no scroll detection, no animations, just pathname

export function GlobalAmbientPlayer() {
    const { theme } = useTheme();
    const pathname = usePathname();
    const isHome = pathname === "/";

    if (isHome) {
        // on homepage — render nothing here, the hero dock handles it via portal
        return null;
    }

    // other pages — simple fixed bottom float
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90]">
            <AmbientPlayer theme={theme} />
        </div>
    );
}
