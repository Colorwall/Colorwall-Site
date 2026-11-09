"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useProtection } from "@/hooks/use-protection";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { Footer } from "@/app/components/Footer";
import { ImmersiveModeHost } from "@/app/components/landing/ImmersiveModeHost";
import CinematicLoading from "@/app/components/fluid-gallery/CinematicLoading";

// dynamic client only import for interactive threejs wave canvas to avoid ssr window reference issues
const WigglyFeatureShowcase = dynamic(
  () => import("@/app/components/landing/updated/WigglyFeatureShowcase").then((mod) => mod.WigglyFeatureShowcase),
  { ssr: false }
);

export default function ColorWallLanding() {
  const { theme } = useTheme();
  useProtection();
  const [showLoading, setShowLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // trigger curtain opening shortly after hydration
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImmersiveModeHost>
      {showLoading && (
        <CinematicLoading
          isReady={isReady}
          onComplete={() => setShowLoading(false)}
          isDark={theme === "dark"}
        />
      )}
      <div className={`relative min-h-screen select-none ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
        <div className="relative z-10">
          <HeroSection />

          {/* signature tactile scrolly card slipping over the hero with threejs wiggly canvas */}
          <WigglyFeatureShowcase theme={theme} />

          <FAQSection theme={theme} />

          <Footer theme={theme} />
        </div>
      </div>
    </ImmersiveModeHost>
  );
}
