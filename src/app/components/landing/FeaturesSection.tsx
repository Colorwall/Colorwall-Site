"use client";

import { motion } from "framer-motion";
import { Zap, Monitor, Search, Paintbrush, Shield, Layout, MousePointer2, Cpu, Wand2 } from "lucide-react";
import { GradientHeading } from "./GradientHeading";

// -- feature data --
const features = [
    {
        id: "01",
        icon: Zap,
        title: "Ultra-Lightweight Core",
        desc: "Built in Rust & Tauri. Negligible performance impact (~0.5% CPU, 1-2% GPU) even at 4K 60FPS.",
    },
    {
        id: "02",
        icon: Cpu,
        title: "D3D11 Compositor Engine",
        desc: "Hardware-accelerated DirectX 11 rendering for buttery smooth playback and zero-latency scene composition.",
    },
    {
        id: "03",
        icon: Paintbrush,
        title: "Interactive Studio Editor",
        desc: "Build your own dynamic scenes with a professional visual editor. Mix videos, images, and particle emitters seamlessly.",
    },
    {
        id: "04",
        icon: Shield,
        title: "Advanced HLSL Shaders",
        desc: "Apply real-time, customizable shader effects like God Rays, Chromatic Aberration, Blur, and Rain Drops.",
    },
    {
        id: "05",
        icon: MousePointer2,
        title: "Audio Reactive Ecosystem",
        desc: "Native system audio analysis injects rhythmic life into your wallpapers, particles, and widgets in real-time.",
    },
    {
        id: "06",
        icon: Layout,
        title: "Desktop Widgets",
        desc: "Pin interactive HTML5/React widgets—like 3D clocks, visualizers, and system monitors—directly to your desktop.",
    },
    {
        id: "07",
        icon: Monitor,
        title: "Multi-Monitor Mastery",
        desc: "Flawless multi-display support. Run different engines per screen and permanently save widget layouts.",
    },
    {
        id: "08",
        icon: Search,
        title: "Massive Workshop",
        desc: "Browse and download thousands of 4K videos, webgl scenes, and community-made .colorwall projects instantly.",
    },
    {
        id: "09",
        icon: Wand2,
        title: "Taskbar Customization",
        desc: "Transform your taskbar with transparent, blur, or acrylic effects, completely independent of the wallpaper engine.",
    }
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
                        text={"Performance\nwithout compromise"}
                        theme={theme}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight whitespace-pre-wrap leading-[1.1]"
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
                                    <h3 className={`text-xl font-mono font-bold mb-3 tracking-wide group-hover:-translate-y-0.5 transition-transform duration-300
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

        </section>
    );
}
