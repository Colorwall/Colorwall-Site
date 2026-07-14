"use client";

import { LogoLoop, LogoItem } from "../ui/LogoLoop";

// ─── styled text label for tech logos without iconic symbols ─────
// renders as a compact monospace badge, height-matched to the svg
// icons so the loop maintains visual rhythm.
const TextLogo = ({ children }: { children: string }) => (
    <span className="h-6 flex items-center font-mono text-[11px] font-bold tracking-wider uppercase opacity-60">
        {children}
    </span>
);

// ─── svg icon logos for recognizable brands ─────────────────────
// all monochrome, using currentColor so they adapt to theme.
// kept minimal - just enough detail to be instantly recognizable.

const ReactIcon = () => (
    <svg width="24" height="24" viewBox="-11 -11 22 22" fill="none" stroke="currentColor" strokeWidth="0.8">
        <circle r="2" fill="currentColor" stroke="none"/>
        <ellipse rx="10" ry="4.2"/>
        <ellipse rx="10" ry="4.2" transform="rotate(60)"/>
        <ellipse rx="10" ry="4.2" transform="rotate(120)"/>
    </svg>
);

const GitHubIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.337-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
    </svg>
);

// windows 4-pane logo
const WindowsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 5.548l7.065-.966v6.826H3V5.548zm0 12.904l7.065.966v-6.862H3v5.896zm7.834 1.072L22 21v-7.592H10.834v6.116zm0-14.048v6.116H22V3l-11.166 1.476z"/>
    </svg>
);

// tailwind css - the wind curves
const TailwindIcon = () => (
    <svg width="26" height="24" viewBox="0 0 54 33" fill="currentColor">
        <path d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.514-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.514-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" fillRule="evenodd" clipRule="evenodd"/>
    </svg>
);

// rust - simplified gear/cog with R
const RustIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l1.09 2.41L15 3l-.18 2.47L17.27 4.5l-1.09 2.41L18.59 6l-.73 2.37 2.47-.18-1.97 1.5L20.59 11l-2.41 1.09L19.5 14.27l-2.41-1.09L18 15.59l-2.37-.73.18 2.47-1.5-1.97L13.09 18 12 15.59 10.91 18 9.68 15.36l-1.5 1.97.18-2.47L6 15.59l.91-2.41L4.5 14.27l1.32-2.18L3.41 11l2.23-1.32L3.68 8.18l2.47.18L5.41 6l2.41.91L6.73 4.5l2.45.97L9 3l1.91 1.41L12 2zm0 6a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>
);

// mongodb - leaf shape
const MongoIcon = () => (
    <svg width="14" height="24" viewBox="0 0 15 32" fill="currentColor">
        <path d="M7.5 0S5 8 5 14c0 4 1.5 6 2.5 7v11h1V21c1-1 2.5-3 2.5-7C11 8 7.5 0 7.5 0z"/>
    </svg>
);

// chromium - simplified circle segments
const ChromiumIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="4"/>
        <line x1="12" y1="8" x2="12" y2="2"/>
        <line x1="8.54" y1="14" x2="3.07" y2="17"/>
        <line x1="15.46" y1="14" x2="20.93" y2="17"/>
    </svg>
);

// discord - game controller simplified
const DiscordIcon = () => (
    <svg width="26" height="24" viewBox="0 0 28 22" fill="currentColor">
        <path d="M23.7 1.84A23.3 23.3 0 0017.9 0a16.5 16.5 0 00-.75 1.54 21.6 21.6 0 00-6.3 0A15.7 15.7 0 0010.1 0 23.2 23.2 0 004.3 1.84 24.2 24.2 0 00.2 18.17a23.5 23.5 0 007.1 3.6 17 17 0 001.52-2.48 15.2 15.2 0 01-2.4-1.15c.2-.15.4-.3.59-.44a16.7 16.7 0 0014 0c.19.15.39.3.58.44a15.3 15.3 0 01-2.4 1.15 17 17 0 001.52 2.48 23.4 23.4 0 007.1-3.6A24.1 24.1 0 0023.7 1.84zM9.35 14.9c-1.25 0-2.28-1.15-2.28-2.56s1-2.56 2.28-2.56 2.3 1.15 2.28 2.56c0 1.41-1.01 2.56-2.28 2.56zm9.3 0c-1.25 0-2.28-1.15-2.28-2.56s1-2.56 2.28-2.56 2.3 1.15 2.28 2.56c0 1.41-1 2.56-2.28 2.56z"/>
    </svg>
);

// ─── complete tech stack used in colorwall ──────────────────────
// mix of svg icons for recognizable brands and monospace text
// labels for technologies without standard visual marks.
// order is intentionally varied so adjacent items contrast visually.
const techLogos: LogoItem[] = [
    { node: <ReactIcon />, title: "React" },
    { node: <TextLogo>Rust</TextLogo>, title: "Rust" },
    { node: <GitHubIcon />, title: "GitHub" },
    { node: <TextLogo>Tauri</TextLogo>, title: "Tauri" },
    { node: <WindowsIcon />, title: "Windows" },
    { node: <TextLogo>D3D11</TextLogo>, title: "Direct3D 11" },
    { node: <TailwindIcon />, title: "Tailwind CSS" },
    { node: <TextLogo>HLSL</TextLogo>, title: "HLSL" },
    { node: <MongoIcon />, title: "MongoDB" },
    { node: <TextLogo>Next.js</TextLogo>, title: "Next.js" },
    { node: <DiscordIcon />, title: "Discord RPC" },
    { node: <TextLogo>HTML</TextLogo>, title: "HTML" },
    { node: <RustIcon />, title: "Rust" },
    { node: <TextLogo>CSS</TextLogo>, title: "CSS" },
    { node: <ChromiumIcon />, title: "Chromium" },
    { node: <TextLogo>GLSL</TextLogo>, title: "GLSL" },
    { node: <TextLogo>JSON</TextLogo>, title: "JSON" },
    { node: <TextLogo>XML</TextLogo>, title: "XML" },
    { node: <TextLogo>TypeScript</TextLogo>, title: "TypeScript" },
    { node: <TextLogo>JPG</TextLogo>, title: "JPG" },
    { node: <TextLogo>MP3</TextLogo>, title: "MP3" },
];

export const TechStackStrip = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    return (
        <div className={`py-10 ${isDark ? "text-white/30" : "text-black/25"}`}>
            <LogoLoop
                logos={techLogos}
                speed={50}
                logoHeight={24}
                gap={48}
                fadeOut
                fadeOutColor={isDark ? "#000000" : "#ffffff"}
                pauseOnHover
                hoverSpeed={20}
                ariaLabel="Technologies used in ColorWall"
            />
        </div>
    );
};
