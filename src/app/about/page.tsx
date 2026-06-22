'use client';

import { useTheme } from "@/app/contexts/ThemeContext";
import { LiquidLens } from "@/app/components/ui/LiquidLens";

export default function AboutPage() {
  const { theme } = useTheme();

  return (
    <div className={`relative min-h-screen w-full overflow-hidden select-none ${theme === "dark" ? "bg-black" : "bg-[#f4f4f6]"}`}>
      {/* The WebGL Canvas that handles both the Text and the Fluid Refraction */}
      <LiquidLens theme={theme} />

      {/* 
        This is an invisible HTML overlay that matches the WebGL text exactly.
        We do this so search engines and screen readers can still read the content,
        while humans see the beautiful WebGL refraction underneath. 
      */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-0">
        <h1 className="text-8xl font-bold tracking-tighter">Bold Ideas,</h1>
        <h2 className="text-8xl font-bold tracking-tighter">Brought to Life</h2>
      </div>

      {/* A tiny minimalist return button */}
      <a 
        href="/" 
        className={`absolute top-8 left-8 z-50 text-sm font-medium tracking-tight hover:opacity-50 transition-opacity ${theme === 'dark' ? 'text-white' : 'text-black'}`}
      >
        ← Back
      </a>
    </div>
  );
}
