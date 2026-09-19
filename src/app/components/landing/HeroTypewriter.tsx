"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = [
    "Your Desktop Called, It wants Personality!!!",
    "Free to Use · No Arbitrary limits, no subscriptions",
    "A Wallpaper Engine built for performance and You!",
    "Built in Rust + Tauri · DirectX 11/IMF/MPV/WEB2",
    "8K Video · Workshop/Studio · Advanced D3D11 Shader Effects",
    "Desktop Widgets · Taskbar Customization · Audio Reactive",
];

export function HeroTypewriter() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % WORDS.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-[2.25rem] sm:min-h-[2.5rem] flex items-center justify-start text-xs sm:text-sm md:text-base font-mono font-medium tracking-wider text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative w-full overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 15, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -15, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute text-left w-full flex items-center gap-2"
                >
                    <span className="text-cyan-400 font-mono text-sm sm:text-base">›</span>
                    <motion.span
                        initial={{ backgroundPosition: "200% center" }}
                        animate={{ backgroundPosition: "-200% center" }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                        className="inline-block font-sans font-medium text-white/90"
                        style={{
                            backgroundImage: "linear-gradient(110deg, rgba(255,255,255,0.9) 35%, #38bdf8 50%, rgba(255,255,255,0.9) 65%)",
                            backgroundSize: "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            color: "transparent"
                        }}
                    >
                        {WORDS[index]}
                    </motion.span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
