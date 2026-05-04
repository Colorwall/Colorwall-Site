"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GradientHeading } from "./GradientHeading";
import { Check } from "lucide-react";

export const ComparisonTable = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";
    const [hoveredCol, setHoveredCol] = useState<number | null>(null);

    const features = [
        { label: "Price", cw: "Free", we: "$3.99", lv: "Free" },
        { label: "CPU (4K Video)", cw: "1.3%", we: "1.2%", lv: "0.8%" },
        { label: "GPU (4K Video)", cw: "22.9%", we: "74%", lv: "83.8%" },
        { label: "Rendering Engine", cw: "DirectX 11", we: "DirectX / Web", lv: "CefSharp" },
        { label: "Scene Editor", cw: "Yes", we: "Yes", lv: "None" },
        { label: "Audio Reactivity", cw: "Native", we: "Native", lv: "Base Level" },
        { label: "HTML Widgets", cw: "Native", we: "Third-party", lv: "Limited" },
        { label: "Taskbar Effects", cw: "Acrylic / Blur", we: "Slightly Advanced", lv: "Yes" },
        { label: "Open Source", cw: "Closed Source", we: "Closed Source", lv: "Yes (GPL-3)" },
    ];

    const renderValue = (val: string, isCw: boolean) => {
        if (val === "Yes" || val.includes("Built-in") || val.includes("Native")) {
            return (
                <div className={`flex items-center justify-center gap-2 whitespace-nowrap ${isCw ? "text-emerald-400 font-bold" : (isDark ? "text-emerald-400/80" : "text-emerald-600")}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" fill="currentColor" fillOpacity="0.15"/>
                        <path d="M7.75 12L10.58 14.83L16.25 9.17004" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{val}</span>
                </div>
            );
        }
        
        // Default text
        return <span className={`whitespace-nowrap ${isCw ? (isDark ? "text-white font-bold" : "text-black font-bold") : (isDark ? "text-white/60" : "text-black/60")}`}>{val}</span>;
    };

    return (
        <section className="py-32 px-4 sm:px-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full opacity-10 pointer-events-none ${isDark ? "bg-blue-600" : "bg-blue-400"}`} />

            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-16"
                >
                    <p className={`text-xs font-mono uppercase tracking-[0.2em] mb-4
                        ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                        how it compares??
                    </p>
                    <GradientHeading
                        text="Built different."
                        theme={theme}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
                    />
                    <p className={`text-sm font-medium mt-6 max-w-2xl mx-auto ${isDark ? "text-white/50" : "text-black/60"}`}>
                        Performance benchmarks represent a single snapshot on an i3-4th Gen with Intel(R) HD 4600 Graphics running a 4K 60FPS video.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative"
                >
                    <div className="w-full overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="w-full min-w-[600px] border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 sm:p-6 text-left" />
                                    <th className="p-0 align-bottom">
                                        <div className={`p-4 sm:p-6 rounded-t-xl border-t border-x relative
                                            ${isDark ? "bg-white/[0.02] border-white/10" : "bg-black/[0.02] border-black/10"}`}>
                                            <div className="flex flex-col items-center gap-2">
                                                <img src="/colorwall.png" alt="ColorWall" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                                                <span className={`text-lg sm:text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-black"}`}>ColorWall</span>
                                            </div>
                                        </div>
                                    </th>
                                    <th 
                                        className={`p-4 sm:p-6 align-bottom pb-6 text-center font-bold text-base sm:text-lg transition-colors cursor-default ${isDark ? (hoveredCol === 2 ? "text-white/90" : "text-white/60") : (hoveredCol === 2 ? "text-black/90" : "text-black/60")}`}
                                        onMouseEnter={() => setHoveredCol(2)}
                                        onMouseLeave={() => setHoveredCol(null)}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <img 
                                                src="https://www.google.com/s2/favicons?domain=wallpaperengine.io&sz=128" 
                                                alt="Wallpaper Engine" 
                                                loading="lazy" 
                                                decoding="async"
                                                className={`w-6 h-6 sm:w-8 sm:h-8 object-contain transition-all duration-300 ${hoveredCol === 2 ? "grayscale-0 opacity-100" : "grayscale opacity-50"}`} 
                                            />
                                            <span>Wallpaper Engine</span>
                                        </div>
                                    </th>
                                    <th 
                                        className={`p-4 sm:p-6 align-bottom pb-6 text-center font-bold text-base sm:text-lg transition-colors cursor-default ${isDark ? (hoveredCol === 3 ? "text-white/90" : "text-white/60") : (hoveredCol === 3 ? "text-black/90" : "text-black/60")}`}
                                        onMouseEnter={() => setHoveredCol(3)}
                                        onMouseLeave={() => setHoveredCol(null)}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <img 
                                                src="https://www.google.com/s2/favicons?domain=rocksdanister.github.io/lively&sz=128" 
                                                alt="Lively Wallpaper" 
                                                loading="lazy" 
                                                decoding="async"
                                                className={`w-6 h-6 sm:w-8 sm:h-8 object-contain transition-all duration-300 ${hoveredCol === 3 ? "grayscale-0 opacity-100" : "grayscale opacity-50"}`} 
                                            />
                                            <span>Lively</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((feature, i) => (
                                    <tr key={feature.label} className="group">
                                        <td className={`p-5 font-mono text-sm tracking-wide border-y transition-colors
                                            ${isDark ? "border-white/5 text-white/80 group-hover:bg-white/[0.02]" : "border-black/5 text-black/80 group-hover:bg-black/[0.02]"}`}>
                                            {feature.label}
                                        </td>
                                        <td className="p-0 border-y-0">
                                            <div className={`px-4 sm:px-6 py-4 sm:py-5 text-center transition-colors h-full flex flex-col justify-center
                                                ${isDark 
                                                    ? "bg-white/[0.02] border-x border-white/10 group-hover:bg-white/[0.04]" 
                                                    : "bg-black/[0.02] border-x border-black/10 group-hover:bg-black/[0.04]"}
                                                ${i === features.length - 1 ? "rounded-b-xl border-b pb-6" : "border-b border-b-white/5"}`}>
                                                {renderValue(feature.cw, true)}
                                            </div>
                                        </td>
                                        <td 
                                            className={`p-5 text-center border-y transition-colors
                                            ${isDark ? "border-white/5 group-hover:bg-white/[0.02]" : "border-black/5 group-hover:bg-black/[0.02]"}`}
                                            onMouseEnter={() => setHoveredCol(2)}
                                            onMouseLeave={() => setHoveredCol(null)}
                                        >
                                            {renderValue(feature.we, false)}
                                        </td>
                                        <td 
                                            className={`p-5 text-center border-y transition-colors
                                            ${isDark ? "border-white/5 group-hover:bg-white/[0.02]" : "border-black/5 group-hover:bg-black/[0.02]"}`}
                                            onMouseEnter={() => setHoveredCol(3)}
                                            onMouseLeave={() => setHoveredCol(null)}
                                        >
                                            {renderValue(feature.lv, false)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
