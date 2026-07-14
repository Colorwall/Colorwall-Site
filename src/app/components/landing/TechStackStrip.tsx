"use client";

import { LogoLoop, LogoItem } from "../ui/LogoLoop";

// ─── styled text label for genuinely niche tech without icons ───
const TextLogo = ({ children }: { children: string }) => (
    <span className="h-12 flex items-center font-mono text-[15px] font-bold tracking-wider uppercase opacity-60">
        {children}
    </span>
);

// ─── custom inline svgs for icons that failed to load externally ─
const WindowsIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
        <path d="M3 5.548l7.065-.966v6.826H3V5.548zm0 12.904l7.065.966v-6.862H3v5.896zm7.834 1.072L22 21v-7.592H10.834v6.116zm0-14.048v6.116H22V3l-11.166 1.476z"/>
    </svg>
);

// ─── complete tech stack used in colorwall ──────────────────────
// order alternates between official SVG icons (loaded from /tech/) 
// and text to create visual rhythm in the scrolling strip.
const techLogos: LogoItem[] = [
    { src: "/tech/react.svg", alt: "React", title: "React" },
    { src: "/tech/nextdotjs.svg", alt: "Next.js", title: "Next.js" },
    { src: "/tech/typescript.svg", alt: "TypeScript", title: "TypeScript" },
    { src: "/tech/rust.svg", alt: "Rust", title: "Rust" },
    { src: "/tech/tauri.svg", alt: "Tauri", title: "Tauri" },
    { src: "/tech/github.svg", alt: "GitHub", title: "GitHub" },
    // { node: <TextLogo>D3D11</TextLogo>, title: "Direct3D 11" },
    { node: <WindowsIcon />, title: "Windows" },
    { src: "/tech/tailwindcss.svg", alt: "Tailwind CSS", title: "Tailwind CSS" },
    { node: <TextLogo>HLSL</TextLogo>, title: "HLSL" },
    { src: "/tech/mongodb.svg", alt: "MongoDB", title: "MongoDB" },
    { src: "/tech/html5.svg", alt: "HTML5", title: "HTML5" },
    { src: "/tech/discord.svg", alt: "Discord RPC", title: "Discord RPC" },
    { src: "/tech/json.svg", alt: "JSON", title: "JSON" },
    // { node: <TextLogo>GLSL</TextLogo>, title: "GLSL" },
];

export const TechStackStrip = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    return (
        <div className={`py-16 tech-strip ${isDark ? "text-white/30" : "text-black/25"}`}>
            {/* Global style to apply opacity and dark mode inversion to the loaded SVG images */}
            <style jsx global>{`
                .tech-strip img {
                    opacity: 0.6;
                    filter: ${isDark ? 'invert(1)' : 'none'};
                }
            `}</style>
            
            <LogoLoop
                logos={techLogos}
                speed={50}
                logoHeight={48}
                gap={64}
                fadeOut
                fadeOutColor={isDark ? "#000000" : "#ffffff"}
                pauseOnHover
                hoverSpeed={20}
                ariaLabel="Technologies used in ColorWall"
            />
        </div>
    );
};
