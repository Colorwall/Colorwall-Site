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
        <div className="min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center text-xs sm:text-sm md:text-base lg:text-lg font-mono text-white/90 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] relative w-full overflow-hidden px-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute text-center w-full"
                >
                    <motion.span
                        initial={{ backgroundPosition: "200% center" }}
                        animate={{ backgroundPosition: "-200% center" }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                        className="inline-block"
                        style={{
                            backgroundImage: "linear-gradient(110deg, rgba(255,255,255,0.8) 40%, #22d3ee 50%, rgba(255,255,255,0.8) 60%)",
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
