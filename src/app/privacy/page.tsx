"use client";

import React from "react";
import Link from "next/link";
import { Footer } from "@/app/components/Footer";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function PrivacyPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const mutedText = isDark ? "text-white/60" : "text-black/60";
    const bodyText = isDark ? "text-white/80" : "text-black/80";

    return (
        <div className={`min-h-screen ${isDark ? "bg-[#070709] text-white" : "bg-[#fafafa] text-black"} font-sans selection:bg-cyan-500/30`}>
            {/* top subtle ambient light with clean heading */}
            <div className="relative overflow-hidden pt-32 pb-16 px-6 sm:px-12">
                <div 
                    aria-hidden="true" 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" 
                />

                <div className="max-w-3xl mx-auto relative z-10">
                    {/* page navigation tab switcher */}
                    <div className="flex items-center gap-3 mb-8">
                        {/* <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            Privacy Policy
                        </span> */}
                        <Link 
                            href="/terms" 
                            className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors ${
                                isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
                            }`}
                        >
                            Terms of Service &rarr;
                        </Link>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-outfit font-[200] tracking-[-0.04em] leading-[1.05] mb-4">
                        Privacy Policy
                    </h1>
                    <p className={`text-base sm:text-lg leading-relaxed font-spline ${mutedText}`}>
                        Transparent legal and technical boundaries for the ColorWall desktop engine, runtime processes, and connected community ecosystem.
                    </p>
                </div>
            </div>

            {/* main legal document flow without card boxes */}
            <main className="pb-28 px-6 sm:px-12">
                <div className="max-w-3xl mx-auto space-y-16">

                    {/* section 01 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 1.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                Application Runtime Architecture
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Local Engine Isolation & Storage
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            ColorWall executes on your machine via three dedicated native processes: the primary shell (<code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">colorwall.exe</code>), the media player (<code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">cw-player.exe</code>), and the DirectX 11 compositor (<code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">cw-render.exe</code>).
                        </p>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline ${bodyText}`}>
                            These processes communicate exclusively via local encrypted named pipes. All your downloaded wallpapers, custom node scenes, caches, and application configurations remain strictly on your local disk at <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">%LOCALAPPDATA%\ColorWall</code>. We never scan, index, or inspect non-ColorWall files on your filesystem.
                        </p>
                    </section>

                    {/* section 02 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 2.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                Telemetry & Error Reporting
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Diagnostic Logs & Settings Opt-Out
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            ColorWall does not collect personal surveillance data, keystrokes, viewing habits, or device identity. To maintain engine stability across diverse graphics drivers and Windows versions, ColorWall incorporates standard Sentry crash reporting for runtime panics, stack traces, and GPU device resets.
                        </p>
                        <div className="pl-4 py-1 border-l-2 border-cyan-400/80 my-4">
                            <p className="text-xs font-mono leading-relaxed text-cyan-300/90">
                                <strong>User Control:</strong> You can completely disable Sentry telemetry and error diagnostic reporting at any time by toggling off crash reporting directly in <em>ColorWall &rarr; Settings &rarr; Privacy</em>.
                            </p>
                        </div>
                    </section>

                    {/* section 03 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 3.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                Network Connectivity
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Connected Services, Store & Auto-Updates
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            While rendering occurs entirely on your local hardware, ColorWall interfaces with our official backend servers (<code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">colorwall.xyz</code>) and edge content delivery networks under explicit scenarios:
                        </p>
                        <ul className={`list-disc pl-5 space-y-2 text-sm sm:text-base font-spline ${bodyText}`}>
                            <li><strong>Automatic Engine Updates:</strong> Checking version manifests and pulling binary updates into the <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">updates/</code> directory.</li>
                            <li><strong>Store & Discover Repositories:</strong> Querying search terms, tags, and downloading wallpaper video assets, interactive scenes, or widget packages.</li>
                            <li><strong>Cloud Authentication & Accounts:</strong> Managing user sessions, creator profiles, and sync preferences when signed in.</li>
                        </ul>
                    </section>

                    {/* section 04 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 4.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                Audio Reactivity Disclosure
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Windows WASAPI Loopback Privacy
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline ${bodyText}`}>
                            ColorWall features a hardware-hooked audio visualizer engine utilizing the Windows Audio Session API (WASAPI) loopback hook. This process calculates 128-band Fast Fourier Transform (FFT) frequencies solely to drive dynamic visualizer waveforms and shader parameters. <strong>Audio streams are processed strictly in volatile RAM and are never recorded, cached to disk, listened to, or transmitted over the internet.</strong>
                        </p>
                    </section>

                    {/* section 05 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 5.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                Widgets & Third-Party APIs
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            HTML5 Desktop Widgets & Sandbox Environment
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            ColorWall exposes a comprehensive JavaScript API allowing creators to craft desktop widgets and interactive canvases using HTML, CSS, and JS. These run within managed, isolated host windows.
                        </p>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline ${bodyText}`}>
                            Third-party widgets may make outbound requests to external web APIs (such as Spotify, OpenWeather, or cryptocurrency feeds) according to the code written by the widget creator. Any credentials or API keys you configure inside community widgets are subject to that widget's respective network endpoints.
                        </p>
                    </section>

                    {/* contact info and timestamp */}
                    <div className={`pt-12 border-t ${borderColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6`}>
                        <div>
                            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block mb-1">
                                Questions or Concerns?
                            </span>
                            <span className={`text-sm font-mono ${mutedText}`}>
                                Contact: help.colorwall@gmail.com &middot; Laxenta LLC
                            </span>
                        </div>
                        <div className={`text-xs font-mono ${mutedText} sm:text-right`}>
                            Engine Revision: v4.4.2<br />
                            Last Revised: November 2026
                        </div>
                    </div>

                </div>
            </main>

            <Footer theme={theme} />
        </div>
    );
}
