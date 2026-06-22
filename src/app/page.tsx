"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useProtection } from "@/hooks/use-protection";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FeaturesSection } from "@/app/components/landing/FeaturesSection";
import { FeatureTabs } from "@/app/components/landing/FeatureTabs";
import Image from "next/image";
import { ComparisonTable } from "@/app/components/landing/ComparisonTable";
import { SecurityReport } from "@/app/components/SecurityReport";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { BottomCTA } from "@/app/components/landing/BottomCTA";
import { Footer } from "@/app/components/Footer";
// lazy-load linewaves so the ogl webgl library stays out of the initial bundle
const LineWaves = dynamic(() => import("@/app/components/ui/LineWaves"), {
    ssr: false,
    loading: () => <div className="w-full h-full" />,
});
const LightPillar = dynamic(() => import("@/app/components/ui/LightPillar"), {
    ssr: false,
});
import { GradientHeading } from "./components/landing/GradientHeading";

export default function ColorWallLanding() {
    const { theme } = useTheme();
    const [cinematicMode, setCinematicMode] = useState(false);
    const [showCinematicMenu, setShowCinematicMenu] = useState(false);
    const [cinematicConfig, setCinematicConfig] = useState({
        lightPillar: true,
        lineWaves: true,
        sideRays: true
    });
    // Protect against inspection shortcuts if desired
    useProtection();

    return (
        <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>

            {/* ════ Hero Section ════ */}
            <HeroSection />

            {/* ════ Cross-Section Background Wrapper ════ */}
            <div className="relative w-full">
                {/* The global diagonal LightPillar */}
                {cinematicMode && cinematicConfig.lightPillar && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="sticky top-0 w-full h-screen overflow-hidden"
                             style={{ 
                                 maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)", 
                                 WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)" 
                             }}>
                            <LightPillar 
                                topColor={theme === 'dark' ? '#5227FF' : '#4f46e5'} 
                                bottomColor={theme === 'dark' ? '#FF9FFC' : '#db2777'} 
                                mixBlendMode={theme === 'dark' ? 'screen' : 'normal'}
                                intensity={theme === 'dark' ? 0.7 : 0.4}
                                pillarRotation={-20} // Slight diagonal crossing the screen
                                pillarWidth={3.0} // Restored to default since shader was restored
                            />
                        </div>
                    </div>
                )}

                <div className="relative z-10">
                    {/* ════ Content Sections ════ */}
                    <FeaturesSection theme={theme} />

                    {/* ════ Previews / Screenshots ════ */}
                    <div id="previews" className="pb-12 -mt-48 pt-48 relative z-0">
                        <div className="relative w-full overflow-hidden flex items-center justify-center py-40 mb-16">
                            <div className="absolute inset-0 z-0" style={{ maskImage: "linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 35%, black 65%, transparent)" }}>
                                {(!cinematicMode || cinematicConfig.lineWaves) && (
                                    <LineWaves
                                        color1={theme === "dark" ? "#4c1d95" : "#ffb6ff"}
                                        color2={theme === "dark" ? "#00d8ff" : "#e100ff"}
                                        color3={theme === "dark" ? "#1e1b4b" : "#fdf4ff"}
                                        brightness={theme === "dark" ? 0.8 : 1.2}
                                        enableMouseInteraction={true}
                                        mouseInfluence={5.0}
                                        innerLineCount={12}
                                        outerLineCount={14}
                                    />
                                )}
                            </div>
                            <div className="text-center px-4 relative z-10 pointer-events-none">
                                <div className={`${theme === "dark" ? "text-white" : "text-black"} flex justify-center block text-3xl sm:text-4xl font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]`}>
                                  <GradientHeading text="Seems too good to be true?" theme={"dark"} />
                                </div>

                                <div className={`${theme === "dark" ? "text-violet-200" : "text-violet-800"} block mt-3 text-xl sm:text-2xl font-semibold italic drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]`}>
                                    It is &lt;3 That's why I built it!
                                </div>
                            </div>
                        </div>

                        <FeatureTabs theme={theme} enableSideRays={cinematicMode && cinematicConfig.sideRays} />
                    </div>
                </div>
            </div>

            <ComparisonTable theme={theme} />

            <SecurityReport theme={theme} className="py-24" />

            <FAQSection theme={theme} />

            {/* <BottomCTA theme={theme} /> */}

            <Footer theme={theme} />

            {/* Cinematic Mode Toggle & Drawer */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
                {showCinematicMenu && (
                    <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-xl border mb-2 w-64 animate-in slide-in-from-bottom-4 fade-in duration-200
                        ${theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10'}`}
                    >
                        <h3 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                            Cinematic Shaders
                        </h3>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center justify-between text-xs cursor-pointer group">
                                <span className={theme === 'dark' ? 'text-white/70 group-hover:text-white' : 'text-black/70 group-hover:text-black'}>Light Pillar (Global)</span>
                                <input type="checkbox" className="accent-violet-500 w-4 h-4" checked={cinematicConfig.lightPillar} onChange={(e) => setCinematicConfig(c => ({...c, lightPillar: e.target.checked}))} disabled={!cinematicMode} />
                            </label>
                            <label className="flex items-center justify-between text-xs cursor-pointer group">
                                <span className={theme === 'dark' ? 'text-white/70 group-hover:text-white' : 'text-black/70 group-hover:text-black'}>Side Rays (Features)</span>
                                <input type="checkbox" className="accent-violet-500 w-4 h-4" checked={cinematicConfig.sideRays} onChange={(e) => setCinematicConfig(c => ({...c, sideRays: e.target.checked}))} disabled={!cinematicMode} />
                            </label>
                            <label className="flex items-center justify-between text-xs cursor-pointer group">
                                <span className={theme === 'dark' ? 'text-white/70 group-hover:text-white' : 'text-black/70 group-hover:text-black'}>Line Waves (Previews)</span>
                                <input type="checkbox" className="accent-violet-500 w-4 h-4" checked={cinematicConfig.lineWaves} onChange={(e) => setCinematicConfig(c => ({...c, lineWaves: e.target.checked}))} disabled={!cinematicMode} />
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
                        className={`p-2.5 rounded-full shadow-lg backdrop-blur-md border transition-all hover:scale-105 active:scale-95
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
                        className={`px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-300 backdrop-blur-md border 
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
