"use client";

import React from "react";
import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function TermsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const bgColor = isDark ? "bg-[#0a0a0a]" : "bg-white";
    const textColor = isDark ? "text-white" : "text-black";
    const mutedText = isDark ? "text-white/60" : "text-black/60";
    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const proseClass = isDark ? "prose-invert" : "";

    return (
        <div className={`min-h-screen ${bgColor} ${textColor} font-sans selection:bg-purple-500/30`}>
            <div className="h-16" />

            <main className="pt-24 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                                <ScrollText size={32} />
                            </div>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tight">Terms of Service</h1>
                        <p className={`text-xl ${mutedText} font-light leading-relaxed max-w-2xl`}>
                            The rules of engagement. By downloading and using the ColorWall engine, you agree to these foundational terms.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`prose prose-lg ${proseClass} max-w-none space-y-12`}
                    >
                        <section className="relative">
                            <div className="absolute -left-8 top-2 hidden md:block">
                                <span className={`text-sm font-mono tracking-widest ${mutedText} uppercase`}>01</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Proprietary Software License</h3>
                            <p className="font-light text-lg opacity-80 leading-relaxed">
                                ColorWall is a proprietary desktop application developed and maintained by Laxenta Inc. You are granted a personal, non-exclusive license to use the software for customizing your desktop environment.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 mt-4 text-sm opacity-70 font-light">
                                <li>You may not decompile, reverse engineer, or attempt to extract the source code.</li>
                                <li>You may not redistribute, sub-license, or sell the software or its core components.</li>
                            </ul>
                        </section>

                        <section className="relative">
                            <div className="absolute -left-8 top-2 hidden md:block">
                                <span className={`text-sm font-mono tracking-widest ${mutedText} uppercase`}>02</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">User Content & Scenes</h3>
                            <p className="font-light text-lg opacity-80 leading-relaxed">
                                Any wallpapers, widgets, or scenes you create using the ColorWall Studio remain entirely your property. You are responsible for ensuring you have the necessary rights to use any third-party images or videos you import into the engine.
                            </p>
                        </section>

                        <section className="relative">
                            <div className="absolute -left-8 top-2 hidden md:block">
                                <span className={`text-sm font-mono tracking-widest ${mutedText} uppercase`}>03</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Liability</h3>
                            <p className="font-light text-lg opacity-80 leading-relaxed">
                                The software is provided "as is". While we engineer ColorWall for absolute stability and performance, Laxenta Inc. is not liable for any system instability, hardware issues, or data loss that occurs while using the engine.
                            </p>
                        </section>

                        <div className={`p-6 rounded-2xl border ${borderColor} ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                            <p className="text-sm m-0 font-mono opacity-70">
                                Last Updated: August, 2026 <br />
                                Contact: help.colorwall@gmail.com
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer theme={theme} />
        </div>
    );
}
