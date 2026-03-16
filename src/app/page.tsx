"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { useProtection } from "@/hooks/use-protection";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FeaturesSection } from "@/app/components/landing/FeaturesSection";
import { ShowcaseCard } from "@/app/components/landing/ShowcaseCard";
import { HomeShowcase } from "@/app/components/landing/HomeShowcase";
import { ComparisonTable } from "@/app/components/landing/ComparisonTable";
import { PlannedOpenSource } from "@/app/components/landing/PlannedOpenSource";
import { SecurityReport } from "@/app/components/SecurityReport";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { BottomCTA } from "@/app/components/landing/BottomCTA";
import { Footer } from "@/app/components/Footer";

export default function ColorWallLanding() {
    const { theme } = useTheme();

    // Protect against inspection shortcuts if desired
    useProtection();

    return (
        <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>

            {/* ════ Hero Section ════ */}
            <HeroSection theme={theme} />

            {/* ════ Content Sections ════ */}
            <FeaturesSection theme={theme} />

            <ShowcaseCard
                title="STORE"
                description="Access thousands of wallpapers from 8+ sources. One unified search bar, infinite inspiration — all free."
                badge="8 SOURCES · 4K · FREE"
                imageSrc="/Store.PNG"
                index={0}
                theme={theme}
            />

            <ShowcaseCard
                title="LIBRARY"
                description="Your personal collection. Offline-first with automatic thumbnails and instant previews. Upload your own, link local files, or save from the store."
                badge="LOCAL · OFFLINE · CUTE"
                imageSrc="/Library.PNG"
                index={1}
                theme={theme}
            />

            <ShowcaseCard
                title="CUSTOMIZATION"
                description="Deep integration. Style your taskbar with blur/acrylic effects, configure auto-start behavior hidden in tray, and tweak performance settings."
                badge="TASKBAR · AUTOSTART · TWEAKS"
                imageSrcs={["/Video.PNG", "/multi.PNG", "/taskbar.PNG", "/ADV.PNG", "/perf.PNG"]}
                index={2}
                theme={theme}
                layout="vertical"
                imageFit="contain"
            />

            <HomeShowcase theme={theme} />

            <ComparisonTable theme={theme} />

            <SecurityReport theme={theme} className="py-24" />

            <PlannedOpenSource theme={theme} />

            <FAQSection theme={theme} />

            {/* <BottomCTA theme={theme} /> */}

            <Footer theme={theme} />

        </div>
    );
}
