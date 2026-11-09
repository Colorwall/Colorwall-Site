"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useProtection } from "@/hooks/use-protection";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { Footer } from "@/app/components/Footer";
import { ImmersiveModeHost } from "@/app/components/landing/ImmersiveModeHost";

// dynamic client only import for interactive threejs wave canvas to avoid ssr window reference issues
const WigglyFeatureShowcase = dynamic(
  () => import("@/app/components/landing/updated/WigglyFeatureShowcase").then((mod) => mod.WigglyFeatureShowcase),
  { ssr: false }
);

export default function ColorWallLanding() {
  const { theme } = useTheme();
  useProtection();

  return (
    <ImmersiveModeHost>
      <div className={`relative min-h-screen select-none ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
        <HeroSection />

        {/* split screen interactive threejs showcase with thin breathy outfit typography */}
        <WigglyFeatureShowcase theme={theme} />

        <FAQSection theme={theme} />

        <Footer theme={theme} />
      </div>
    </ImmersiveModeHost>
  );
}
