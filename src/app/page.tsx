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
                description="Access thousands of wallpapers from 8+ sources. One unified search bar, infinite inspiration — no account needed."
                badge="8 SOURCES · 4K · UNIFIED"
                imageSrcs={["/Store.PNG", "/modal.PNG"]}
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
                description="unmatched performance and control. built on rust & tauri for near-zero impact. style your taskbar with blur/acrylic effects, control multi-monitor setups, and tweak renderer presets."
                badge="RUST · TAURI · LOW OVERHEAD"
                imageSrcs={["/PEAKmodalpreview.PNG", "/multi.PNG", "/taskbar.PNG", "/ADV.PNG", "/perf.PNG"]}
                index={2}
                theme={theme}
                layout="vertical"
                imageFit="contain"
            />

            <ShowcaseCard
                title="WIDGETS"
                description="desktop widgets powered by modern web tech. add calendars, clocks, or custom information directly to your desktop. clean, fast, and fully customizable."
                badge="HTML · JS · PINNED"
                imageSrcs={["/widgets.PNG"]}
                index={3}
                theme={theme}
                layout="vertical"
                imageFit="contain"
            />

            <ShowcaseCard
                title="INTERACTIVE"
                description="wallpapers that come alive. fully interactive html5 canvases and webgl shaders that respond to your mouse movements and clicks. your desktop is now a playground."
                badge="WEBGL · DYNAMIC · INTERACTIVE"
                imageSrcs={["/INTERACTIVES.PNG"]}
                index={4}
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
