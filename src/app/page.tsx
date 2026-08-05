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
import { ImmersiveModeHost } from "@/app/components/landing/ImmersiveModeHost";

const TargetCursor = dynamic(() => import("./components/landing/TargetCursor"), { ssr: false });

export default function ColorWallLanding() {
    const { theme } = useTheme();
    useProtection();

    return (
        <ImmersiveModeHost>
            <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
                <TargetCursor 
                    cursorColor={theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'} 
                    cursorColorOnTarget="#0078d4" 
                />

                <HeroSection />

                <div className="relative w-full">
                    <div className="relative z-10">
                        <FeaturesSection theme={theme} />
                    </div>
                </div>

                <div className="relative -mt-10 -mb-10 lg:-mb-16">
                    <ScrollSpiralArrow theme={theme} />
                </div>

                <ComparisonTable theme={theme} />

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
            </div>
        </ImmersiveModeHost>
    );
}
