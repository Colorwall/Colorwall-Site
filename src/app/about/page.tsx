"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { Footer } from "@/app/components/Footer";
import { Github, ExternalLink, Code2, Globe, Heart } from "lucide-react";

// ─── data ─────────────────────────────────────────────────────────────────────

const REPOS = [
    { name: "ColorWall", lang: "Rust", desc: "8K live wallpaper & desktop customization engine for Windows — shaders, particles, store, library — 10mb.", href: "https://github.com/Colorwall", site: "https://colorwall.xyz" },
    { name: "MTS Migrator", lang: "TypeScript", desc: "full JS → TS codebase migrator with type inference and AST patching.", href: "https://github.com/LaxentaInc/Magikk-Typescript-Migrator", site: "https://www.npmjs.com/package/mts-migrator" },
    { name: "Aero-Chan", lang: "TypeScript", desc: "antiraid · music · moderation · tooling — discord bot, source code public.", href: "https://github.com/LaxentaInc/Aero-Chan" },
    { name: "Wallpaper Archive", lang: "CC0", desc: "public domain wallpaper archive used by colorwall. free for everyone.", href: "https://github.com/LaxentaInc/Wallpaper-Archive" },
    { name: "Colorwall Interactives", lang: "WebGL", desc: "community interactive wallpapers — one of colorwall's coolest features.", href: "https://github.com/LaxentaInc/Colorwall-Interactives" },
    { name: "ColorWall Linux", lang: "Rust", desc: "same engine, for linux. open source. coming mid june 2026.", href: "https://github.com/LaxentaInc/WallpaperEngine-Linux" },
    { name: "periodicwm", lang: "C++", desc: "custom X11 window manager + DE from scratch. collab w/ @periodicbrake63.", href: "https://github.com/periodicbrake63" },
    { name: "Colorwall Site", lang: "Next.js", desc: "this website you're looking at right now. yes it's mine.", href: "https://github.com/LaxentaInc/Colorwall-Site" },
];

const TECH = ["rust", "ts", "js", "react", "nextjs", "vite", "tauri", "electron", "mongodb", "kotlin", "nodejs", "git", "github", "vscode"];

const LINKS = {
    github: "https://github.com/LaxentaInc",
    discord: "https://discord.gg/cHVwPkBC7p",
    org: "https://github.com/Colorwall",
};

const LANG_COLORS: Record<string, string> = {
    "Rust": "bg-orange-400", "TypeScript": "bg-blue-400", "C++": "bg-pink-400",
    "CC0": "bg-emerald-400", "WebGL": "bg-purple-400", "Next.js": "bg-white",
    "Python": "bg-yellow-400",
};

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div
            className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#080809] text-zinc-100" : "bg-slate-50 text-zinc-900"}`}
            style={{ fontFamily: "'DM Sans', 'Geist', sans-serif" }}
        >
            {/* ─── ambient background (matches feedback/landing pages) ─── */}
            <div className={`pointer-events-none fixed inset-0 z-0 ${isDark ? "opacity-[0.035]" : "opacity-[0.05]"}`}
                style={{
                    backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAABJz2zMAAAACHRSTlMzMzMzMzMzM8A/4eYAAACbSURBVDjLpZGxDQMwDASJ/y18q0L5K8zM4E5AAXqSBM4+M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO/8Bv9B6wT4CxcwAAAAASUVORK5CYII=")`,
                    backgroundRepeat: "repeat", backgroundSize: "100px 100px",
                }} />
            <div className="pointer-events-none fixed top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full opacity-40"
                style={{ background: `radial-gradient(circle, ${isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)"} 0%, transparent 70%)` }} />
            <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30"
                style={{ background: `radial-gradient(circle, ${isDark ? "rgba(139,92,246,0.10)" : "rgba(139,92,246,0.06)"} 0%, transparent 70%)` }} />
            <div className="pointer-events-none fixed top-[40%] right-[20%] w-[30%] h-[30%] rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${isDark ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.05)"} 0%, transparent 70%)` }} />
            <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent z-50" />

            <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pt-32 pb-28">

                {/* ══════════ hero ══════════ */}
                <div className="mb-24">
                    <p className={`text-[11px] font-mono font-bold uppercase tracking-[0.25em] mb-5 ${isDark ? "text-cyan-400/70" : "text-cyan-600"}`}>
                        <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-2 align-middle" />
                        About · Laxenta Inc
                    </p>

                    <h1 className={`text-[clamp(3rem,8vw,6.5rem)] font-black tracking-[-0.05em] leading-[0.85] mb-8 ${isDark ? "text-white" : "text-zinc-900"}`}>
                        Built by one
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
                            stubborn dev.
                        </span>
                    </h1>

                    <p className={`text-lg sm:text-xl max-w-2xl leading-relaxed font-[350] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        ColorWall is a project by <strong className={isDark ? "text-white font-semibold" : "text-zinc-800 font-semibold"}>Uh... me!</strong> cz my dev friends have even worse adhd so they never helped much.
                        I am an 18-year-old hobbyist developer (since 15) who wanted to make something cooler than my ex&apos;s ArchiveTune.
                        Every line of code is written with love, well kinda i guess? ngl more out of coping from life, ehh ignore it
                    </p>
                </div>

                {/* ══════════ banner ══════════ */}
                <div className="mb-24 -mx-6 lg:-mx-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://github.com/user-attachments/assets/fd8574e6-3f1c-4386-9a81-0332f43f8bce"
                        alt="LaxentaInc Banner"
                        className="w-full h-auto"
                        loading="eager"
                    />
                </div>

                {/* ══════════ dev profile ══════════ */}
                <div className="flex flex-col sm:flex-row gap-8 items-start mb-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://github.com/LaxentaInc.png"
                        alt="Oliver Laxenta"
                        className={`w-28 h-28 rounded-3xl border-2 flex-shrink-0 ${isDark ? "border-white/10" : "border-zinc-200"}`}
                        loading="lazy"
                    />
                    <div>
                        <h2 className={`text-3xl sm:text-4xl font-black tracking-tight mb-1 ${isDark ? "text-white" : "text-zinc-900"}`}>
                            Oliver Laxenta
                        </h2>
                        <p className={`text-sm font-mono mb-4 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            @LaxentaInc · Laxenta Inc
                        </p>
                        <p className={`text-base leading-relaxed mb-5 max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            Nunca te amé, pero lo estaba intentando. Well i am not spainish but the quote is for a specific someone who is
                        </p>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            <a href={LINKS.github} target="_blank" rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${isDark ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/8" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 border border-zinc-200"}`}>
                                <Github className="w-3.5 h-3.5" /> GitHub
                            </a>
                            <a href={LINKS.org} target="_blank" rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${isDark ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/8" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 border border-zinc-200"}`}>
                                <Code2 className="w-3.5 h-3.5" /> Colorwall Org
                            </a>
                            <a href={LINKS.discord} target="_blank" rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5 ${isDark ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"}`}>
                                <Globe className="w-3.5 h-3.5" /> Dihcord
                            </a>
                        </div>
                    </div>
                </div>

                {/* ══════════ colorwall description ══════════ */}
                <div className="mb-24">
                    <h2 className={`text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[0.9] mb-6 ${isDark ? "text-white" : "text-zinc-900"}`}>
                        What is{" "}
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">ColorWall</span>
                    </h2>
                    <div className="max-w-3xl space-y-4">
                        <p className={`text-base sm:text-lg leading-[1.8] font-[350] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            A free desktop customization engine for Windows 10/11. Built in <strong className={isDark ? "text-white font-semibold" : "text-zinc-800 font-semibold"}>Rust + Tauri</strong> —
                            8K video wallpapers, real-time D3D11 shader effects, particle systems, audio-reactive visuals, desktop widgets,
                            and taskbar customization. All in ~10MB with near-zero CPU overhead.
                        </p>
                        <p className={`text-base sm:text-lg leading-[1.8] font-[350] ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            Built-in store aggregating wallpapers from 8+ sources, offline-first library,
                            node-based studio editor for scene compositions. No accounts, no subs, no telemetry.
                            <strong className={isDark ? "text-white font-semibold" : "text-zinc-800 font-semibold"}> 0/72 on VirusTotal.</strong>
                        </p>
                    </div>
                </div>

                {/* ══════════ repositories ══════════ */}
                <div className="mb-24">
                    <h2 className={`text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[0.9] mb-3 ${isDark ? "text-white" : "text-zinc-900"}`}>
                        Repositories
                    </h2>
                    <p className={`text-sm mb-10 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                        the ones that aren&apos;t private anyway :c
                    </p>

                    <div className="grid gap-px sm:grid-cols-2 rounded-2xl overflow-hidden">
                        {REPOS.map((repo) => (
                            <a
                                key={repo.name}
                                href={repo.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group block p-6 transition-all duration-200 cursor-pointer ${isDark ? "bg-white/[0.02] hover:bg-white/[0.06]" : "bg-white hover:bg-zinc-50"}`}
                            >
                                <div className="flex items-center gap-2.5 mb-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${LANG_COLORS[repo.lang] || "bg-zinc-400"}`} />
                                    <h3 className={`text-[15px] font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                                        {repo.name}
                                    </h3>
                                    <span className={`text-[10px] font-mono ml-auto ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                                        {repo.lang}
                                    </span>
                                    <ExternalLink className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity ${isDark ? "text-white" : "text-zinc-400"}`} />
                                </div>
                                <p className={`text-[13px] leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                                    {repo.desc}
                                </p>
                                {repo.site && (
                                    <span className={`inline-block text-[10px] font-mono mt-2 ${isDark ? "text-cyan-500/50" : "text-cyan-600/50"}`}>
                                        {repo.site.replace("https://", "")}
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                </div>

                {/* ══════════ stack ══════════ */}
                <div className="mb-24">
                    <h2 className={`text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[0.9] mb-8 ${isDark ? "text-white" : "text-zinc-900"}`}>
                        Stack
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {TECH.map((t) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={t} src={`https://skillicons.dev/icons?i=${t}`} alt={t} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl hover:scale-110 transition-transform duration-200" loading="lazy" />
                        ))}
                    </div>
                </div>

                {/* ══════════ stats ══════════ */}
                <div className="mb-24">
                    <h2 className={`text-[clamp(2rem,5vw,3.5rem)] font-black tracking-[-0.04em] leading-[0.9] mb-8 ${isDark ? "text-white" : "text-zinc-900"}`}>
                        Stats
                    </h2>
                    <div className="flex flex-wrap gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://awesome-github-stats.azurewebsites.net/user-stats/LaxentaInc?theme=dark&cardType=level" alt="GitHub Stats" className="h-[180px] rounded-xl" loading="lazy" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://github-readme-streak-stats-steel-pi.vercel.app/?user=LaxentaInc&private=true&theme=dark&hide_border=false&date_format=j%20M%5B%20Y%5D&mode=weekly" alt="GitHub Streak Weekly" className="h-[180px] rounded-xl" loading="lazy" />
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://streak-stats.demolab.com?user=LaxentaInc&hide_border=true&background=0d1117&stroke=1e2530&ring=00b4d8&fire=00b4d8&currStreakLabel=00b4d8&sideNums=e0eaff&sideLabels=8ca0c0&dates=8ca0c0&currStreakNum=e0eaff" alt="GitHub Streak" className="rounded-xl max-w-full" loading="lazy" />
                    </div>
                </div>

                {/* ══════════ bottom ══════════ */}
                <div className="text-center pt-1 pb-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://raw.githubusercontent.com/innng/innng/master/assets/kyubey.gif" width={32} alt="kyubey" className="mx-auto mb-4" />
                    <p className={`text-lg font-medium mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                        Well my bigger repos are private :c i promise i do stuff
                    </p>
                    <p className={`text-base mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                        Colorwall is a work in progress and may contain bugs. We are not responsible for any damages caused by the use of this website/app. or any illegal activities that may be performed by it's users.
                    </p>
                </div>

            </main>

            <Footer theme={theme as "dark" | "light"} />
        </div>
    );
}
