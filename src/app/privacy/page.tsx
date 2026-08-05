"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useTheme } from "@/app/contexts/ThemeContext";

export default function PrivacyPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const bgColor = isDark ? "bg-[#0a0a0a]" : "bg-white";
    const textColor = isDark ? "text-white" : "text-black";
    const mutedText = isDark ? "text-white/60" : "text-black/60";
    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const proseClass = isDark ? "prose-invert" : "";

    return (
        <div className={`min-h-screen ${bgColor} ${textColor} font-sans selection:bg-blue-500/30`}>
            <div className="h-16" />

            <main className="pt-24 pb-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                <Shield size={32} />
                            </div>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black mb-6 tracking-tight">Privacy Architecture</h1>
                        <p className={`text-xl ${mutedText} font-light leading-relaxed max-w-2xl`}>
                            We build high-performance software, not spyware. ColorWall is engineered from the ground up to respect your digital boundary.
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
                            <h3 className="text-2xl font-bold mb-4">Zero Telemetry Promise</h3>
                            <p className="font-light text-lg opacity-80 leading-relaxed">
                                ColorWall does not track your usage habits, screen time, or hardware fingerprints. Your desktop is your personal space. We have deliberately omitted analytics engines from our core rendering pipeline to ensure absolute performance and privacy.
                            </p>
                        </section>

                        <section className="relative">
                            <div className="absolute -left-8 top-2 hidden md:block">
                                <span className={`text-sm font-mono tracking-widest ${mutedText} uppercase`}>02</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Local-First Storage</h3>
                            <p className="font-light text-lg opacity-80 leading-relaxed">
                                Every configuration, scene preset, and downloaded asset remains strictly on your local disk. We do not sync your custom wallpapers to our servers, nor do we require an account to unlock the full power of the engine.
                            </p>
                        </section>

                        <section className="relative">
                            <div className="absolute -left-8 top-2 hidden md:block">
                                <span className={`text-sm font-mono tracking-widest ${mutedText} uppercase`}>03</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Network Activity</h3>
                            <p className="font-light text-lg opacity-80 leading-relaxed">
                                ColorWall only connects to external servers under two explicit conditions: when you actively search for wallpapers in the Store, and when the engine checks for critical software updates. These connections are direct and encrypted.
                            </p>
                        </section>

                        <div className={`mt-16 p-8 rounded-3xl border ${borderColor} ${isDark ? "bg-white/[0.02]" : "bg-black/[0.02]"}`}>
                            <p className="text-sm m-0 font-mono opacity-60 uppercase tracking-widest">
                                Maintained by Laxenta Inc. <br />
                                Last Updated: August 2026 <br />
                                Support: legal@laxenta.com
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>

            <Footer theme={theme} />
        </div>
    );
}
