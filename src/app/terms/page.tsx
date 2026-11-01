"use client";

import React from "react";
import Link from "next/link";
import { Footer } from "@/app/components/Footer";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function TermsPage() {
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
                        <Link 
                            href="/privacy" 
                            className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-colors ${
                                isDark ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black"
                            }`}
                        >
                            &larr; Privacy Policy
                        </Link>
                   
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-outfit font-[200] tracking-[-0.04em] leading-[1.05] mb-4">
                        Terms of Service
                    </h1>
                    <p className={`text-base sm:text-lg leading-relaxed font-spline ${mutedText}`}>
                        Operational guidelines, proprietary licensing, widget runtime safety, and marketplace terms for the ColorWall ecosystem.
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
                                Closed-Source Proprietary License
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Ownership & Anti-Tamper Protections
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            ColorWall, its composite rendering pipeline, the proprietary <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">.colorwall</code> scene specification, and associated binaries (<code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">colorwall.exe</code>, <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">cw-player.exe</code>, <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">cw-render.exe</code>) are proprietary, closed-source intellectual property owned and operated by Laxenta LLC (@LaxentaInc).
                        </p>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            The application employs hardened compile-time tokens and encrypted inter-process pipe channels. You are granted a personal, revocable, non-exclusive license to use the software for customizing personal computing environments.
                        </p>
                        <ul className={`list-disc pl-5 space-y-2 text-sm sm:text-base font-spline ${bodyText}`}>
                            <li>You may not decompile, reverse engineer, disassemble, or attempt to extract source code from the engine binaries.</li>
                            <li>You may not redistribute, repackage, sub-license, or sell modified engine binaries without explicit written authorization from Laxenta LLC.</li>
                        </ul>
                    </section>

                    {/* section 02 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 2.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                Format Spectrum & Content Rights
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Videos, Scenes, Widgets & User Assets
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            ColorWall orchestrates multiple distinct desktop customization mediums:
                        </p>
                        <ul className={`list-disc pl-5 space-y-2 text-sm sm:text-base font-spline mb-4 ${bodyText}`}>
                            <li><strong>Video Loops:</strong> Standard video files (MP4, WebM) imported from local files or community sources. Users are solely responsible for ensuring they possess rights to any media imported.</li>
                            <li><strong>.colorwall Scene Packages:</strong> Proprietary composite node scenes encapsulating real-time shaders, audio visualizers, and visual parameters created in ColorWall Studio.</li>
                            <li><strong>Widgets & Interactive Canvases:</strong> Web-standard components built with HTML, CSS, and JavaScript utilizing ColorWall's native desktop JavaScript API.</li>
                        </ul>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline ${bodyText}`}>
                            Creators retain full intellectual property ownership of their original visual artwork, shaders, and widget code.
                        </p>
                    </section>

                    {/* section 03 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 3.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                Widget Runtime Security & Code Policies
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Third-Party Code & Sandbox Policy
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            ColorWall isolates desktop widgets and interactive canvases within managed container windows. However, because widgets execute user-generated web code, <strong>ColorWall does not warrant the absolute security or integrity of third-party community scripts</strong>.
                        </p>
                        <div className="pl-4 py-1 border-l-2 border-red-500/80 my-4">
                            <p className="text-xs font-mono leading-relaxed text-red-300/90">
                                <strong>Strictly Prohibited:</strong> Any widget or interactive package containing cryptominers, keystroke loggers, token stealers, unprompted executable downloads, malicious redirects, or denial-of-service payloads will be immediately banned.
                            </p>
                        </div>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline ${bodyText}`}>
                            Laxenta LLC actively scans community marketplace submissions and reserves the unilateral right to quarantine, disable, or delete any asset and revoke creator privileges upon receipt of abuse reports or security violations.
                        </p>
                    </section>

                    {/* section 04 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 4.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                Store & Creator Commerce
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Marketplace Transactions & Commercial Distribution
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            ColorWall is currently in public beta. As community marketplace features expand, creators may optionally offer premium <code className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">.colorwall</code> scenes, custom widgets, or exclusive shader packs for commercial purchase.
                        </p>
                        <ul className={`list-disc pl-5 space-y-2 text-sm sm:text-base font-spline ${bodyText}`}>
                            <li>Digital goods distributed on the marketplace are delivered as non-refundable licenses upon download, subject to platform policies.</li>
                            <li>Creator payouts, platform service fees, and billing processing will be handled via third-party PCI-compliant payment gateways.</li>
                            <li>Laxenta LLC reserves the right to moderate commercial listings to protect consumer security and legal compliance.</li>
                        </ul>
                    </section>

                    {/* section 05 */}
                    <section className={`pt-12 border-t ${borderColor}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-mono text-cyan-400 tracking-widest font-semibold uppercase">
                                § 5.0
                            </span>
                            <span className="text-xs font-mono text-white/30 tracking-wider uppercase">
                                System Modifications & Disclaimer
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-outfit font-[300] tracking-tight mb-4">
                            Low-Level Desktop APIs & "As Is" Warranty
                        </h2>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline mb-4 ${bodyText}`}>
                            ColorWall utilizes low-level operating system interfaces (DirectX 11 swapchains, Desktop Window Manager acrylic taskbar backdrop injection, and media session hooks) to accomplish seamless hardware-accelerated desktop integration.
                        </p>
                        <p className={`text-sm sm:text-base leading-relaxed font-spline ${bodyText}`}>
                            The software is provided "as is", without warranty of any kind. While engineered for zero resource overhead and system stability, Laxenta LLC shall not be held liable for any system instability, driver conflicts, third-party software interference, or data loss arising from usage of the software.
                        </p>
                    </section>

                    {/* section 06: copyright & contact */}
                    <div className={`pt-12 border-t ${borderColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6`}>
                        <div>
                            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block mb-1">
                                DMCA & Copyright Claims
                            </span>
                            <span className={`text-sm font-mono ${mutedText}`}>
                                Contact: help.colorwall@gmail.com &middot; Laxenta LLC
                            </span>
                        </div>
                        <div className={`text-xs font-mono ${mutedText} sm:text-right`}>
                            Runtime: v4.4.2<br />
                            Last Revised: November 2026
                        </div>
                    </div>

                </div>
            </main>

            <Footer theme={theme} />
        </div>
    );
}
