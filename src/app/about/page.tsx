"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Footer } from "@/app/components/Footer";
import { motion, type Variants } from "framer-motion";
import { 
    Cpu, 
    Monitor, 
    ShieldCheck, 
    Terminal, 
    Compass, 
    Code2, 
    Bot,
    ArrowRight
} from "lucide-react";
import { GradientHeading } from "@/app/components/landing/GradientHeading";

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const bgColor = isDark ? "bg-black" : "bg-white";
    const textColor = isDark ? "text-white" : "text-black";
    const textMuted = isDark ? "text-white/60" : "text-black/60";
    const borderSubtle = isDark ? "border-white/10" : "border-black/10";
    const bgSubtle = isDark ? "bg-white/[0.02]" : "bg-black/[0.02]";
    const bgHover = isDark ? "hover:bg-white/[0.04]" : "hover:bg-black/[0.04]";

    // framer motion stagger configuration for sequential section reveal
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // cubic-bezier easing requires 'as const' tuple assertion so typescript infers bezierdefinition rather than number[]
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
    };

    return (
        <div className={`min-h-screen select-none ${bgColor} ${textColor} relative overflow-hidden`}>
            <main className="max-w-[85rem] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 pt-40 pb-24 relative z-10 space-y-40">
                
                {/* Hero Section */}
                <motion.section 
                    className="max-w-5xl space-y-10"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
                        <span className={`inline-block w-2 h-2 rounded-full ${isDark ? "bg-white" : "bg-black"}`} />
                        <span className={`font-mono text-xs tracking-[0.2em] uppercase ${textMuted} font-medium`}>
                            About ColorWall
                        </span>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-outfit uppercase tracking-[-0.04em] leading-[0.95]">
                            <span className="font-[300]">BUILDING THE ULTIMATE</span>
                            <br />
                            <span className="font-[200] opacity-90">CUSTOMIZATION ENGINE.</span>
                        </h1>
                    </motion.div>
                    
                    <motion.p variants={itemVariants} className={`text-lg md:text-xl font-light leading-relaxed max-w-2xl ${textMuted}`}>
                        ColorWall is a blazingly fast, native spatial compositor for Windows 10 and 11. 
                        It renders 8K live wallpapers, audio-reactive shaders, and interactive web scenes directly on your desktop, all while consuming near-zero system resources.
                    </motion.p>
                    
                    <motion.div variants={itemVariants} className="pt-4">
                        <Link
                            href="/download"
                            className={`group inline-flex items-center gap-2 text-sm font-mono font-medium ${textColor} uppercase tracking-wider transition-opacity hover:opacity-70`}
                        >
                            <span>Download ColorWall</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </motion.section>

                {/* Architecture Grid */}
                <motion.section 
                    className="relative"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="mb-16">
                        <h2 className="text-4xl md:text-6xl font-outfit font-[300] tracking-[-0.04em] mb-4 uppercase">
                            Architected for performance.
                        </h2>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Cpu,
                                title: "Rust & Tauri Core",
                                desc: "Engineered with low-level rust bindings and the tauri framework. Deeply integrated with native D3D11 compositor to achieve astonishing idle CPU overhead of just ~0.5%."
                            },
                            {
                                icon: Monitor,
                                title: "Multi-Monitor Mastery",
                                desc: "Seamlessly spans ultra-wide, vertical, and dual-monitor displays with dynamic aspect ratio scaling and per-display distinct wallpaper assignment."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Zero Telemetry",
                                desc: "Completely open source with no background tracking, no analytics, and no mandatory cloud connectivity. Runs completely offline."
                            }
                        ].map((feature, i) => (
                            <motion.div 
                                key={i}
                                variants={itemVariants}
                                className={`flex flex-col gap-4 p-8 border ${borderSubtle} rounded-3xl ${bgHover} transition-colors`}
                            >
                                <feature.icon className={`w-5 h-5 ${textMuted}`} />
                                <h3 className="text-lg font-medium font-outfit tracking-tight">{feature.title}</h3>
                                <p className={`leading-relaxed text-sm ${textMuted}`}>
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                        <motion.div 
                            variants={itemVariants}
                            className={`p-10 border ${borderSubtle} rounded-3xl ${bgSubtle} flex flex-col justify-center items-center text-center`}
                        >
                            <div className="text-5xl md:text-7xl font-outfit font-[200] tracking-tighter mb-4">~38K</div>
                            <div className={`text-xs font-mono ${textMuted} uppercase tracking-widest`}>Lines of Rust Code</div>
                        </motion.div>
                        <motion.div 
                            variants={itemVariants}
                            className={`p-10 border ${borderSubtle} rounded-3xl ${bgSubtle} flex flex-col justify-center items-center text-center`}
                        >
                            <div className="text-5xl md:text-7xl font-outfit font-[200] tracking-tighter mb-4">12+</div>
                            <div className={`text-xs font-mono ${textMuted} uppercase tracking-widest`}>Native Extensions</div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Developer Section */}
                <motion.section 
                    className={`relative py-20 border-t border-b ${borderSubtle}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    <div className="flex flex-col md:flex-row gap-16 items-start justify-between">
                        <motion.div variants={itemVariants} className="max-w-xl">
                            <h2 className="text-4xl md:text-5xl font-outfit font-[300] tracking-[-0.04em] mb-8 uppercase">
                                The Developer
                            </h2>
                            <p className={`text-lg font-light leading-relaxed mb-6 ${textMuted}`}>
                                ColorWall is developed by a collective of developers and artists. What started as a hobbyist endeavor to build a better wallpaper engine has grown into a highly optimized, fully-featured desktop customization suite.
                            </p>
                            <p className={`text-lg font-light leading-relaxed mb-10 ${textMuted}`}>
                                The ecosystem now spans across Rust, TypeScript, React, and native C++ integrations, proving that modern web technologies paired with systems programming can yield incredible performance.
                            </p>
                            <a
                                href="https://patron.colorwall.xyz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 text-sm font-mono font-medium ${textColor} uppercase tracking-wider transition-opacity hover:opacity-70`}
                            >
                                <span>Support development</span>
                                <ArrowRight className="w-4 h-4" />
                            </a>
                        </motion.div>
                        
                        <motion.div variants={itemVariants} className="flex flex-col items-start w-full max-w-sm shrink-0">
                            <div className={`w-full aspect-square border ${borderSubtle} rounded-3xl relative p-6 flex flex-col items-center justify-center`}>
                                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 grayscale opacity-80">
                                    <Image 
                                        src="https://avatars.githubusercontent.com/u/204142083?v=4" 
                                        alt="Laxenta" 
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h3 className="font-outfit font-medium tracking-wide text-2xl mb-1">Colorwall Inc</h3>
                                <p className={`font-mono text-xs uppercase tracking-widest ${textMuted}`}>@LaxentaInc</p>
                                
                                <div className="flex items-center gap-6 mt-10">
                                    <a href="https://github.com/LaxentaInc" target="_blank" rel="noopener noreferrer" className={`text-sm font-mono font-medium uppercase tracking-wider ${textMuted} hover:${textColor} transition-colors`}>
                                        GitHub
                                    </a>
                                    <span className={`text-xs ${textMuted}`}>·</span>
                                    <a href="https://discord.gg/QYwhay7r2V" target="_blank" rel="noopener noreferrer" className={`text-sm font-mono font-medium uppercase tracking-wider ${textMuted} hover:${textColor} transition-colors`}>
                                        Discord
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Ecosystem Section */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="mb-12">
                        <GradientHeading
                            text="The broader ecosystem."
                            theme={theme}
                            className="text-4xl md:text-5xl font-outfit font-[300] tracking-[-0.04em] mb-4 uppercase"
                        />
                        <p className={`text-lg font-light ${textMuted} max-w-2xl`}>Explore other open-source projects built with the same level of performance and craft.</p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Colorwall Linux",
                                status: "Active Dev",
                                icon: Terminal,
                                desc: "The upcoming open-source wallpaper engine tailored specifically for linux. Zero copy rendering and fully native.",
                                href: "https://github.com/Colorwall/WallpaperEngine-Linux"
                            },
                            {
                                title: "ArchiveWalls",
                                status: "Upcoming",
                                icon: Compass,
                                desc: "Browser new tab extension featuring live wallpapers, customizable widgets, and focus music integration.",
                                href: "https://github.com/LaxentaInc/ArchiveWalls"
                            },
                            {
                                title: "MTS Migrator",
                                status: "NPM Package",
                                icon: Code2,
                                desc: "CLI utility to instantly migrate legacy javascript codebases to typescript with intelligent AST parsing.",
                                href: "https://github.com/LaxentaInc/Magikk-Typescript-Migrator"
                            },
                            {
                                title: "Aero-Chan",
                                status: "Public Bot",
                                icon: Bot,
                                desc: "Powerful anti-raid, moderation, and music tooling infrastructure for discord communities built in typescript.",
                                href: "https://github.com/LaxentaInc/Aero-Chan"
                            }
                        ].map((proj, i) => (
                            <motion.a
                                variants={itemVariants}
                                key={proj.title}
                                href={proj.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group flex flex-col justify-between p-8 border ${borderSubtle} rounded-3xl ${bgHover} transition-colors`}
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <proj.icon className={`w-5 h-5 ${textMuted}`} />
                                            <span className="font-outfit font-medium text-xl tracking-tight">{proj.title}</span>
                                        </div>
                                        <span className={`text-[10px] font-mono font-medium uppercase tracking-[0.2em] px-2 py-1 border ${borderSubtle} ${textMuted}`}>
                                            {proj.status}
                                        </span>
                                    </div>
                                    <p className={`text-sm font-light leading-relaxed ${textMuted}`}>
                                        {proj.desc}
                                    </p>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </motion.section>

            </main>

            <div className="relative z-10">
                <Footer theme={theme} />
            </div>
        </div>
    );
}