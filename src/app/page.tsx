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
    // Protect against inspection shortcuts if desired
    useProtection();

    return (
        <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>

            {/* ════ Hero Section ════ */}
            <HeroSection />

            {/* ════ Cross-Section Background Wrapper ════ */}
            <div className="relative w-full">
                {/* The global diagonal LightPillar */}
                {cinematicMode && (
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

                        <FeatureTabs theme={theme} />
                    </div>
                </div>
            </div>

            <ComparisonTable theme={theme} />

            <SecurityReport theme={theme} className="py-24" />

            <FAQSection theme={theme} />

            {/* <BottomCTA theme={theme} /> */}

            <Footer theme={theme} />

            {/* Cinematic Mode Toggle Button */}
            <button
                onClick={() => setCinematicMode(!cinematicMode)}
                className={`fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-300 backdrop-blur-md border 
                    ${cinematicMode 
                        ? (theme === 'dark' ? 'bg-violet-600/80 text-white border-violet-400' : 'bg-violet-500/80 text-white border-violet-300')
                        : (theme === 'dark' ? 'bg-black/50 text-white/70 border-white/10 hover:bg-white/10' : 'bg-white/50 text-black/70 border-black/10 hover:bg-black/5')}
                `}
            >
                {cinematicMode ? 'Cinematic: ON' : 'Cinematic: OFF'}
            </button>

        </div>
    );
}
