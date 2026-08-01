"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useProtection } from "@/hooks/use-protection";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FeaturesSection } from "@/app/components/landing/FeaturesSection";
import { ComparisonTable } from "@/app/components/landing/ComparisonTable";
import { SecurityReport } from "@/app/components/SecurityReport";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { Footer } from "@/app/components/Footer";
import { GradientHeading } from "./components/landing/GradientHeading";
import { ScrollSpiralArrow } from "@/app/components/ui/ScrollSpiralArrow";

// dynamically import target cursor with ssr disabled to prevent hydration mismatch
const TargetCursor = dynamic(() => import("./components/landing/TargetCursor"), { ssr: false });

// dynamically import heavy webgl cinematic experience so zero three.js or canvas code loads on standard page view
const CinematicExperience = dynamic(
    () => import("./components/landing/CinematicExperience"),
    { ssr: false }
);

export default function ColorWallLanding() {
    const { theme } = useTheme();
    // state flag controlling active cinematic webgl mode takeover
    const [isCinematic, setIsCinematic] = useState(false);

    // protect against inspection shortcuts if desired
    useProtection();

    // synchronize cinematic state to document body dataset and dispatch custom event so global components like navbar can unmount
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (isCinematic) {
                document.body.dataset.cinematic = "true";
            } else {
                delete document.body.dataset.cinematic;
            }
            window.dispatchEvent(new Event("cinematic-change"));
        }
    }, [isCinematic]);

    // check if query param ?cinematic=true is present on initial load to auto launch cinematic mode
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("cinematic") === "true") {
                setIsCinematic(true);
            }
        }
    }, []);

    // when cinematic mode is toggled on, unmount all standard homepage react components and render webgl experience
    if (isCinematic) {
        return (
            <CinematicExperience 
                onExit={() => {
                    setIsCinematic(false);
                    // clean query param from URL without triggering hard page reload
                    if (typeof window !== "undefined" && window.history.replaceState) {
                        const url = new URL(window.location.href);
                        url.searchParams.delete("cinematic");
                        window.history.replaceState({}, "", url.pathname);
                    }
                }} 
            />
        );
    }

    return (
        <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
            <TargetCursor 
                cursorColor={theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} 
                cursorColorOnTarget="#0078d4" 
            />

            {/* hero section */}
            <HeroSection />

            {/* features section */}
            <div className="relative w-full">
                <div className="relative z-10">
                    <FeaturesSection theme={theme} />
                </div>
            </div>

            {/* animated spiral arrow divider */}
            <div className="relative -mt-10 -mb-10 lg:-mb-16">
                <ScrollSpiralArrow theme={theme} />
            </div>

            <ComparisonTable theme={theme} />

            {/* interstitial headline */}
            <div className="relative w-full overflow-hidden flex items-center justify-center py-20 lg:py-24">
                <div className="text-center px-4 relative z-10 pointer-events-none">
                    <div className={`${theme === "dark" ? "text-white" : "text-black"} flex justify-center text-5xl md:text-7xl lg:text-8xl font-outfit font-[200] tracking-[-0.06em] leading-[0.95] mb-4`}>
                        Seems too good to be true?
                    </div>
                    <GradientHeading
                        text="It is. That's why I built it."
                        theme={theme}
                        className="block mt-2 text-2xl md:text-3xl tracking-tight"
                    />
                </div>
            </div>

            <SecurityReport theme={theme} className="py-24 lg:pl-[20%] lg:pr-[10%]" />

            <FAQSection theme={theme} />

            <Footer theme={theme} />

            {/* minimal fixed bottom-left cinematic mode trigger button.
               combines a video svg icon with inline "cinematic" text in a subtle translucent pill container.
               positioned at z-[95] to sit above normal page content while staying below fixed header navigation (z-[100]). */}
            <button
                onClick={() => setIsCinematic(true)}
                type="button"
                title="Cinematic Mode"
                aria-label="Toggle Cinematic Mode"
                className={`fixed bottom-5 left-14 z-[95] px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-md border ${
                    theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white/60 hover:text-white'
                        : 'bg-black/10 hover:bg-black/20 border-black/10 text-black/60 hover:text-black'
                }`}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span className="text-[11px] font-mono tracking-wider lowercase">cinematic</span>
            </button>
        </div>
    );
}

