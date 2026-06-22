"use client";

import { useEffect, useRef } from "react";
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
import { GradientHeading } from "./components/landing/GradientHeading";

export default function ColorWallLanding() {
    const { theme } = useTheme();
    // Protect against inspection shortcuts if desired
    useProtection();

    return (
        <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>

            {/* ════ Hero Section ════ */}
            <HeroSection />

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

                {/* ════ Breather Section ════ */}
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-24 flex flex-col items-center">
                    <p className={`text-xl sm:text-2xl font-semibold italic mb-8 ${theme === "dark" ? "text-violet-200" : "text-violet-800"} drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]`}>
                        Take a break, let the engine do the work.
                    </p>
                    <div className="relative w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500">
                        <Image 
                            src="/MillenniumEvent.webp"
                            alt="Millennium Event Chibi"
                            width={1920}
                            height={1080}
                            className="w-full h-auto object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                </div>

            </div>

            <ComparisonTable theme={theme} />

            <SecurityReport theme={theme} className="py-24" />

            <FAQSection theme={theme} />

            {/* <BottomCTA theme={theme} /> */}

            <Footer theme={theme} />

        </div>
    );
}
