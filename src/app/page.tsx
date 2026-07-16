"use client";

import { useState } from "react";
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
// import { TechStackStrip } from "./components/landing/TechStackStrip";
import { ScrollSpiralArrow } from "@/app/components/ui/ScrollSpiralArrow";

const TargetCursor = dynamic(() => import("./components/landing/TargetCursor"), { ssr: false });

export default function ColorWallLanding() {
    const { theme } = useTheme();
    const [cinematicMode, setCinematicMode] = useState(false);
    const [showCinematicMenu, setShowCinematicMenu] = useState(false);
    // individual shader toggles within cinematic mode.
    // both default to true so they activate the moment the user flips cinematic on
    const [cinematicConfig, setCinematicConfig] = useState({
        sideRays: true
    });
    // protect against inspection shortcuts if desired
    useProtection();

    return (
        <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
            <TargetCursor 
                cursorColor={theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} 
                cursorColorOnTarget="#0078d4" 
            />

            {/* hero section */}
            <HeroSection />

            {/* features - unified section with stat cards, tab showcase, 
               video background, and inline extras */}
            <div className="relative w-full">
                <div className="relative z-10">
                    <FeaturesSection theme={theme} />
                </div>
            </div>

            {/* Hand-drawn animated SVGs separator */}
            <div className="relative -mt-10 -mb-10 lg:-mb-16">
                <ScrollSpiralArrow theme={theme} />
            </div>

            {/* interstitial - big statement that breaks up the feature 
               density before the comparison table */}
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

            {/* tech stack logo loop - scrolling strip of every technology
               used in colorwall. acts as a visual differentiator between
               the interstitial and the comparison section below. */}
            {/* <TechStackStrip theme={theme} /> */}

            <ComparisonTable theme={theme} />

            <SecurityReport theme={theme} className="py-24 lg:pl-[20%] lg:pr-[10%]" />

            <FAQSection theme={theme} />

            <Footer theme={theme} />

            {/* cinematic mode toggle + shader config drawer.
                fixed to bottom-right. the shaders themselves are lazy-loaded
                via dynamic() so this UI is the only thing in the initial bundle */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
                {showCinematicMenu && (
                    <div className={`p-4 rounded-2xl shadow-2xl border mb-2 w-64
                        ${theme === 'dark' ? 'bg-black/90 border-white/10' : 'bg-white/90 border-black/10'}`}
                    >
                        <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            Cinematic Shaders
                        </h3>
                        <div className="flex flex-col gap-3">

                            <label className="flex items-center justify-between text-xs cursor-pointer group">
                                <span className={theme === 'dark' ? 'text-white/70 group-hover:text-white' : 'text-black/70 group-hover:text-black'}>Side Rays (Features)</span>
                                <input type="checkbox" className="accent-violet-500 w-4 h-4" checked={cinematicConfig.sideRays} onChange={(e) => setCinematicConfig(c => ({...c, sideRays: e.target.checked}))} disabled={!cinematicMode} />
                            </label>
                        </div>
                        {!cinematicMode && (
                            <div className="mt-3 text-[10px] text-amber-500 text-center font-medium bg-amber-500/10 py-1.5 rounded-lg">
                                Enable Cinematic Mode to view
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCinematicMenu(!showCinematicMenu)}
                        className={`p-2.5 rounded-full shadow-lg border transition-colors duration-200
                            ${showCinematicMenu
                                ? (theme === 'dark' ? 'bg-white/20 border-white/20 text-white' : 'bg-black/10 border-black/20 text-black')
                                : (theme === 'dark' ? 'bg-black/50 border-white/10 text-white/70' : 'bg-white/50 border-black/10 text-black/70')}
                        `}
                        aria-label="Shader Settings"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button
                        onClick={() => {
                            setCinematicMode(!cinematicMode);
                            if (!cinematicMode && !showCinematicMenu) {
                                setShowCinematicMenu(true);
                            }
                        }}
                        className={`px-4 py-2 rounded-full font-semibold shadow-lg transition-colors duration-200 border
                            ${cinematicMode
                                ? (theme === 'dark' ? 'bg-violet-600/80 text-white border-violet-400' : 'bg-violet-500/80 text-white border-violet-300')
                                : (theme === 'dark' ? 'bg-black/50 text-white/70 border-white/10 hover:bg-white/10' : 'bg-white/50 text-black/70 border-black/10 hover:bg-black/5')}
                        `}
                    >
                        {cinematicMode ? 'Cinematic: ON' : 'Cinematic: OFF'}
                    </button>
                </div>
            </div>

        </div>
    );
}
