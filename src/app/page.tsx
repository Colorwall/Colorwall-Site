"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useProtection } from "@/hooks/use-protection";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FAQSection } from "@/app/components/landing/FAQSection";
import { Footer } from "@/app/components/Footer";
import { ImmersiveModeHost } from "@/app/components/landing/ImmersiveModeHost";
import { AtmosphericSky } from "@/app/components/landing/updated/AtmosphericSky";

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
      <div className={`relative min-h-screen select-none ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
        {/* page wide atmospheric sky canvas rendering celestial body stars and floating 3d clouds */}
        <AtmosphericSky theme={theme} />

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
