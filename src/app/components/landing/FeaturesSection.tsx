"use client";

import { motion } from "framer-motion";
import { Zap, Monitor, Search, HardDrive, Paintbrush, Shield } from "lucide-react";
import { GradientHeading } from "./GradientHeading";

// -- feature data --
const features = [
    {
        id: "01",
        icon: Zap,
        title: "Made in Rust/Tauri",
        desc: "Insanely fast even on slow systems, >10mb APP; Community Driven!",
    },
    {
        id: "02",
        icon: Zap,
        title: "Negligible Performance Impact",
        desc: "~0.5% CPU, 1-2% GPU for 4K 60fps. Hardware-decoded via Windows Media Foundation.",
    },
    {
        id: "03",
        icon: Monitor,
        title: "4K Live Wallpapers",
        desc: "Stunning video wallpapers at native resolution with buttery smooth playback.",
    },
    {
        id: "04",
        icon: Search,
        title: "8 Sources, One Store",
        desc: "Third party store, we do not scrape anyone — unified search, zero effort.",
    },
    {
        id: "05",
        icon: HardDrive,
        title: "Smart Loading",
        desc: "Thumbnails load instantly. Previews on click. 4K only downloads when you confirm.",
    },
    {
        id: "06",
        icon: Paintbrush,
        title: "Taskbar Effects",
        desc: "Transparent, blur, or acrylic taskbar with custom colors and opacity controls.",
    },
    // {
    //     id: "07",
    //     icon: Shield,
    //     title: "Offline & Private",
    //     desc: "Everything cached locally. No cloud, no tracking, no accounts, no bullshit.",
    // },
];

export const FeaturesSection = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-32 px-4 sm:px-8">
            {/* <p className={`text-center mt-6 text-sm font-mono ${theme === "dark" ? "text-white/30" : "text-black/30"}`}>
                Blazing fast cz it's in rust/tauri · live/static wallpapers · local wallpaper support <br />
                <span className="text-xs text-white/20">more features coming soon... :3</span>
            </p> */}
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    className="mb-24"
                >
                    <p className={`text-xs font-mono uppercase tracking-[0.2em] mb-4 ml-1
                        ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                        system_capabilities
                    </p>
                    <GradientHeading
                        text="Performance without compromise"
                        theme={theme}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
                    />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            className="group relative"
                        >
                            {/* "tech spec" top line */}
                            <div className={`w-full h-[1px] mb-6 transition-all duration-500 origin-left
                                ${theme === "dark"
                                    ? "bg-white/10 group-hover:bg-blue-500/50 group-hover:w-full"
                                    : "bg-black/10 group-hover:bg-blue-500/50 group-hover:w-full"}`}
                            />

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className={`text-4xl font-mono font-light tracking-tighter opacity-20 group-hover:opacity-40 transition-opacity duration-300
                                        ${theme === "dark" ? "text-white" : "text-black"}`}>
                                        {f.id}
                                    </span>
                                    <f.icon
                                        size={28}
                                        strokeWidth={1.5}
                                        className={`transition-colors duration-300
                                            ${theme === "dark"
                                                ? "text-white/40 group-hover:text-blue-400"
                                                : "text-black/40 group-hover:text-blue-600"}`}
                                    />
                                </div>

                                <div>
                                    <h3 className={`text-xl font-bold mb-3 tracking-wide group-hover:-translate-y-0.5 transition-transform duration-300
                                        ${theme === "dark" ? "text-white" : "text-black"}`}>
                                        {f.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed max-w-[90%]
                                        ${theme === "dark" ? "text-white/50" : "text-black/60"}`}>
                                        {f.desc}
                                    </p>

                                </div>
                            </div>



                        </motion.div>

                    ))}
                </div>
            </div>

            <p className="text-center mt-18">
                <span className={`${theme === "dark" ? "text-white/70" : "text-black/70"} block text-2xl font-bold`}>
                    Seems too good to be true?
                </span>

                <span className={`${theme === "dark" ? "text-violet-300/80" : "text-violet-600/80"} block mt-2 text-lg font-semibold italic`}>
                    It is :D That's why I built it
                </span>
            </p>


        </section>
    );
}
