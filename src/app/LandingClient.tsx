"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useProtection } from "@/hooks/use-protection";
import { HeroSection, HeroVideo } from "@/app/components/landing/HeroSection";
import { FeaturesSection } from "@/app/components/landing/FeaturesSection";
import { SecurityReport } from "@/app/components/SecurityReport";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { Footer } from "@/app/components/Footer";
import { GradientHeading } from "./components/landing/GradientHeading";
import { ScrollSpiralArrow } from "@/app/components/ui/ScrollSpiralArrow";
import { ImmersiveModeHost } from "@/app/components/landing/ImmersiveModeHost";


export function LandingClient({ heroVideos }: { heroVideos?: HeroVideo[] }) {
    const { theme } = useTheme();
    useProtection();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <ImmersiveModeHost>
            <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "What does ColorWall cost?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "ColorWall is completely free to download and use from our website without arbitrary limits. Future releases on storefronts like Steam or Epic Games may be premium to help fund long-term development and code signing."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Does it affect gaming performance?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Not at all. ColorWall's engine automatically pauses all rendering and video playback the second you launch a full-screen application or game, ensuring zero background GPU usage while you play."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Can I create my own interactive wallpapers?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Absolutely. ColorWall features a built-in node-based Studio Scene Editor. You can combine custom images, video layers, and native D3D11 shaders to build high-performance dynamic scenes."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Does it support audio-reactive effects?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Yes. Our native engine includes real-time audio frequency analysis, allowing your wallpapers, shaders, and particle systems to react dynamically to your system's audio playback."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Which Windows versions are supported?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "ColorWall is optimized exclusively for Windows 10 and Windows 11 (64-bit). We deeply integrate with native Windows APIs to achieve the lowest possible resource footprint."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Can I use web-based interactive wallpapers?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Yes. ColorWall fully supports HTML, CSS, and JavaScript based wallpapers via a lightweight WebView, allowing you to run complex web scenes natively on your desktop."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Does it support multiple monitors?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Yes, multi-monitor setups are fully supported. You can either span a single high-resolution wallpaper across all your displays or set different individual wallpapers for each screen."
                                    }
                                }
                            ]
                        })
                    }}
                />

                <HeroSection videos={heroVideos} />

                {!isMobile && (
                    <>
                        <div className="hidden md:block relative w-full">
                            <div className="relative z-10">
                                <FeaturesSection theme={theme} />
                            </div>
                        </div>

                        <div className="hidden md:block relative -mt-10 -mb-10 lg:-mb-16">
                            <ScrollSpiralArrow theme={theme} />
                        </div>
                    </>
                )}

                <div className="relative w-full overflow-hidden flex items-center justify-center py-20 lg:py-24">
                    <div className="text-center px-4 relative z-10 pointer-events-none">
                        <div className={`${theme === "dark" ? "text-white" : "text-black"} flex justify-center text-5xl md:text-7xl lg:text-8xl font-outfit font-[200] tracking-[-0.06em] leading-[0.95] mb-4`}>
                            Seems too good to be true?
                        </div>
                        <GradientHeading
                            text="It isn't. That's why we built it."
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
