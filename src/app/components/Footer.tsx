"use client";

import { motion } from "framer-motion";
import { Github, Twitter, MessageCircle, Heart, Mail } from "lucide-react";

export const Footer = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    // Blue Archive Colors
    const baBlue = "#00A4FF";
    const baDark = "#1A1A1A"; // Dark grey background for dark theme
    const baLight = "#FFFFFF"; // White background for light theme
    const baText = isDark ? "#FFFFFF" : "#4B5563";
    const baTextLight = isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.4)";

    return (
        <footer className="relative mt-20 overflow-hidden">
            {/* ════ Blurred Background Banner ════ */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <div className={`absolute inset-0 ${isDark ? "bg-[#0a0a0a]/90" : "bg-slate-50/90"} z-10`} />
                <div
                    className="absolute inset-0 w-full h-full opacity-30 transform scale-105 blur-xl"
                    style={{
                        backgroundImage: "url('/LxColorWall.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? "from-[#0a0a0a]" : "from-slate-50"} to-transparent z-20`} />
            </div>

            <div className="relative z-30 max-w-7xl mx-auto px-6 py-12 sm:py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-8">
                    {/* ════ Branding ════ */}
                    <div className="col-span-1 md:col-span-1 space-y-6">
                        <div className="flex items-center">
                            <img src="/LxColorWall.png" alt="ColorWall Logo" className="h-8 w-auto object-contain pointer-events-none select-none" />
                        </div>
                        <p className={`text-sm leading-relaxed font-mono ${isDark ? "text-white/40" : "text-slate-500"}`}>
                            PRODUCED BY LAXENTA INC <br />
                            @laxenta.me
                        </p>
                    </div>

                    {/* ════ Links ════ */}
                    {[
                        {
                            title: "Product", links: [
                                // { name: "Features", href: "/#features" },
                                { name: "Download", href: "/download" },
                                { name: "Changelog", href: "/changelog" }
                            ]
                        },
                        {
                            title: "Community", links: [
                                { name: "Discord", href: "https://discord.gg/QYwhay7r2V" },
                                { name: "GitHub", href: "https://github.com/shelleyloosespatience/WallpaperEngine" },
                                { name: "Issues", href: "https://github.com/shelleyloosespatience/WallpaperEngine/issues" }
                            ]
                        },
                        {
                            title: "Legal", links: [
                                { name: "Privacy", href: "/privacy" },
                                { name: "Terms", href: "/terms" }
                            ]
                        },
                        {
                            title: "Support", links: [
                                { name: "help.colorwall@gmail.com", href: "mailto:help.colorwall@gmail.com" }
                            ]
                        }
                    ].map((section) => (
                        <div key={section.title} className="col-span-1">
                            <h3 className={`font-bold text-xs uppercase tracking-widest mb-6 flex items-center gap-2 opacity-50
                                ${isDark ? "text-white" : "text-slate-800"}`}>
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.name}>
                                        <a
                                            href={link.href}
                                            target={link.href.startsWith("http") ? "_blank" : "_self"}
                                            rel={link.href.startsWith("http") ? "noopener noreferrer" : ""}
                                            className={`text-sm font-medium transition-all duration-200 flex items-center gap-2 group
                                                ${isDark ? "text-white/60 hover:text-[#00A4FF]" : "text-slate-500 hover:text-[#00A4FF]"}`}
                                        >
                                            <span className="w-0 group-hover:w-1.5 h-[1px] bg-[#00A4FF] transition-all duration-300" />
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* ════ Bottom Info ════ */}
                <div className={`mt-16 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4
                    ${isDark ? "border-white/5" : "border-slate-200"}`}>

                    <div className={`text-xs font-mono opacity-40 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-600"}`}>
                        <span>© 2026 LAXENTA INC.</span>
                        <span className="w-1 h-1 bg-[#00A4FF] rounded-full" />
                        <span className="uppercase">All rights reserved.</span>
                    </div>

                    <div className="flex gap-4">
                        {[
                            { icon: Github, href: "https://github.com/shelleyloosespatience" },
                            { icon: MessageCircle, href: "https://discord.gg/QYwhay7r2V" },
                            { icon: Mail, href: "mailto:help.colorwall@gmail.com" }
                        ].map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-2 rounded-lg transition-colors duration-200
                                    ${isDark
                                        ? "bg-white/5 text-white/60 hover:bg-[#00A4FF] hover:text-white"
                                        : "bg-slate-100 text-slate-500 hover:bg-[#00A4FF] hover:text-white"}`}
                            >
                                <item.icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};
