"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/app/contexts/ThemeContext";

const TargetCursor = dynamic(() => import("./landing/TargetCursor"), { ssr: false });

export function GlobalCursor() {
    const { theme } = useTheme();

    return (
        <TargetCursor 
            cursorColor={theme === 'dark' ? '#ffffff' : '#111111'} 
            cursorColorOnTarget="#ffffff" 
        />
    );
}
