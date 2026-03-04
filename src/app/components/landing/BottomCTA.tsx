"use client";

import { motion } from "framer-motion";
import { Download, Github } from "lucide-react";
import { GradientHeading } from "./GradientHeading";

export const BottomCTA = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-24 px-4 sm:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`max-w-3xl mx-auto text-center space-y-8 p-10 sm:p-14 rounded-3xl border
                    ${theme === "dark"
                        ? "border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01]"
                        : "border-black/10 bg-gradient-to-b from-black/[0.03] to-transparent"}`}
            >
                <GradientHeading
                    text="Ready to upgrade your desktop?"
                    theme={theme}
                    className="text-3xl sm:text-4xl font-black"
                />
                <p className={`max-w-lg mx-auto ${theme === "dark" ? "text-white/50" : "text-black/50"}`}>
                    free, soon to be open source, no signup. just download and start Configuring your desktop! Please make sure to report bugs! :D my discord/instagram @laxenta.me
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <a
                        href="/download"
                        className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "bg-white text-black hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
                                : "bg-black text-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"}`}
                    >
                        <Download size={18} />
                        Download for Windows
                    </a>

                    {/* <a
                        href="https://github.com/shelleyloosespatience/WallpaperEngine"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5
                            ${theme === "dark"
                                ? "border border-white/15 text-white/70 hover:border-white/30 hover:bg-white/5"
                                : "border border-black/15 text-black/60 hover:border-black/30 hover:bg-black/5"}`}
                    >
                        <Github size={16} />
                        Source Code
                    </a> */}
                </div>
            </motion.div>
        </section>
    );
};
