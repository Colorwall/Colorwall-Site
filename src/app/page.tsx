"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useProtection } from "@/hooks/use-protection";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FeaturesSection } from "@/app/components/landing/FeaturesSection";
import { ShowcaseCard } from "@/app/components/landing/ShowcaseCard";
import { HomeShowcase } from "@/app/components/landing/HomeShowcase";
import { ComparisonTable } from "@/app/components/landing/ComparisonTable";
import { SecurityReport } from "@/app/components/SecurityReport";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { BottomCTA } from "@/app/components/landing/BottomCTA";
import { Footer } from "@/app/components/Footer";

export default function ColorWallLanding() {
    const { theme } = useTheme();
    const carouselRef = useRef<HTMLDivElement>(null);

    // Protect against inspection shortcuts if desired
    useProtection();

    // Horizontal wheel scroll interceptor for the carousel
    useEffect(() => {
        const el = carouselRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                const isScrollingDown = e.deltaY > 0;
                const maxScrollLeft = el.scrollWidth - el.clientWidth;
                
                // Allow a tiny margin of error for float values
                if (isScrollingDown && el.scrollLeft < maxScrollLeft - 2) {
                    e.preventDefault();
                    el.scrollBy({ left: e.deltaY * 1.5, behavior: 'auto' });
                } else if (!isScrollingDown && el.scrollLeft > 2) {
                    e.preventDefault();
                    el.scrollBy({ left: e.deltaY * 1.5, behavior: 'auto' });
                }
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    const scrollCarousel = (dir: "left" | "right") => {
        if (!carouselRef.current) return;
        const scrollAmount = carouselRef.current.clientWidth * 0.8;
        carouselRef.current.scrollBy({
            left: dir === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        });
    };

    return (
        <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>

            {/* ════ Hero Section ════ */}
            <HeroSection />

            {/* ════ Content Sections ════ */}
            <FeaturesSection theme={theme} />

            {/* ════ Previews / Screenshots ════ */}
            <div id="previews" className="pt-24 pb-12">
                <p className="text-center mb-16 px-4">
                    <span className={`${theme === "dark" ? "text-white/70" : "text-black/70"} block text-2xl font-bold`}>
                        Seems too good to be true?
                    </span>

                    <span className={`${theme === "dark" ? "text-violet-300/80" : "text-violet-600/80"} block mt-2 text-lg font-semibold italic`}>
                        It is :D That's why I built it
                    </span>
                </p>

                <HomeShowcase theme={theme} />

                <ShowcaseCard
                    title="STORE"
                    description="Access thousands of wallpapers from 8+ sources. One unified search bar, infinite inspiration — no account needed."
                    badge="8 SOURCES · 4K · UNIFIED"
                    imageSrcs={["/STORE.webp", "/modal.webp"]}
                    index={0}
                    theme={theme}
                />

                <ShowcaseCard
                    title="LIBRARY"
                    description="Your personal collection. Offline-first with automatic thumbnails and instant previews. Upload your own, link local files, or save from the store."
                    badge="LOCAL · OFFLINE · CUTE"
                    imageSrc="/Library.webp"
                    index={1}
                    theme={theme}
                />

                <ShowcaseCard
                    title="CUSTOMIZATION"
                    description="unmatched performance and control. built on rust & tauri for near-zero impact. style your taskbar with blur/acrylic effects, control multi-monitor setups, and tweak renderer presets."
                    badge="RUST · TAURI · LOW OVERHEAD"
                    imageSrcs={["/PEAKmodalpreview.webp", "/multi.webp", "/taskbar.webp", "/ADV.webp", "/perf.webp"]}
                    index={2}
                    theme={theme}
                    layout="vertical"
                    imageFit="contain"
                />

                <ShowcaseCard
                    title="WIDGETS"
                    description="desktop widgets powered by modern web tech. add calendars, clocks, or custom information directly to your desktop. clean, fast, and fully customizable."
                    badge="HTML · JS · PINNED"
                    imageSrcs={["/widgets.webp"]}
                    index={3}
                    theme={theme}
                    layout="vertical"
                    imageFit="contain"
                />

                {/* ════ Scrollable Carousel for Studio & Interactive ════ */}
                <div className="w-full relative group max-w-[1400px] mx-auto">
                    
                    {/* Navigation Buttons */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-20 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={() => scrollCarousel("left")}
                            className={`p-3 rounded-full backdrop-blur-md border shadow-lg transition-transform hover:scale-110 active:scale-95
                                ${theme === "dark" ? "bg-black/50 border-white/10 text-white hover:bg-black/80" : "bg-white/50 border-black/10 text-black hover:bg-white/80"}`}
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-20 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={() => scrollCarousel("right")}
                            className={`p-3 rounded-full backdrop-blur-md border shadow-lg transition-transform hover:scale-110 active:scale-95
                                ${theme === "dark" ? "bg-black/50 border-white/10 text-white hover:bg-black/80" : "bg-white/50 border-black/10 text-black hover:bg-white/80"}`}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div 
                        ref={carouselRef}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 px-4 sm:px-8 hide-scrollbar scroll-smooth" 
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {/* Slide 1: Studio Editor */}
                        <div className="w-full min-w-[90vw] md:min-w-[75vw] lg:min-w-[60vw] snap-center shrink-0">
                            <ShowcaseCard
                                title="STUDIO"
                                description="build your own native scene wallpapers using our built-in node editor. combine images, video layers, real-time audio-reactive shaders, and particle systems effortlessly."
                                badge="NODE-BASED · D3D11 · PARTICLES"
                                imageSrcs={["/studio.webp"]}
                                index={4}
                                theme={theme}
                                layout="vertical"
                                imageFit="contain"
                            />
                        </div>

                        {/* Slide 2: Interactive */}
                        <div className="w-full min-w-[90vw] md:min-w-[75vw] lg:min-w-[60vw] snap-center shrink-0">
                            <ShowcaseCard
                                title="INTERACTIVE"
                                description="wallpapers that come alive. fully interactive html5 canvases and webgl shaders that respond to your mouse movements and clicks. your desktop is now a playground."
                                badge="WEBGL · DYNAMIC · INTERACTIVE"
                                imageSrcs={["/INTERACTIVES.webp"]}
                                index={5}
                                theme={theme}
                                layout="vertical"
                                imageFit="contain"
                            />
                        </div>
                    </div>
                    {/* Visual hint for scrollability */}
                    <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-mono flex items-center gap-2 opacity-50 ${theme === "dark" ? "text-white" : "text-black"}`}>
                        <span className="animate-pulse">← hover to scroll or use arrows →</span>
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
