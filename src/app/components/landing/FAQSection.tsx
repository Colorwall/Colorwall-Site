"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GradientHeading } from "./GradientHeading";

export const FAQSection = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "What does ColorWall cost?",
            answer: "ColorWall is completely free to download and use from our website without arbitrary limits. Future releases on storefronts like Steam or Epic Games may be premium to help fund long-term development and code signing."
        },
        {
            question: "Does it affect gaming performance?",
            answer: "Not at all. ColorWall's engine automatically pauses all rendering and video playback the second you launch a full-screen application or game, ensuring zero background GPU usage while you play."
        },
        {
            question: "Can I create my own interactive wallpapers?",
            answer: "Absolutely. ColorWall features a built-in node-based Studio Scene Editor. You can combine custom images, video layers, and native D3D11 shaders to build high-performance dynamic scenes."
        },
        {
            question: "Does it support audio-reactive effects?",
            answer: "Yes. Our native engine includes real-time audio frequency analysis, allowing your wallpapers, shaders, and particle systems to react dynamically to your system's audio playback."
        },
        {
            question: "Which Windows versions are supported?",
            answer: "ColorWall is optimized exclusively for Windows 10 and Windows 11 (64-bit). We deeply integrate with native Windows APIs to achieve the lowest possible resource footprint."
        },
        {
            question: "Can I use web-based interactive wallpapers?",
            answer: "Yes. ColorWall fully supports HTML, CSS, and JavaScript based wallpapers via a lightweight WebView, allowing you to run complex web scenes natively on your desktop."
        },
        {
            question: "Does it support multiple monitors?",
            answer: "Yes, multi-monitor setups are fully supported. You can either span a single high-resolution wallpaper across all your displays or set different individual wallpapers for each screen."
        }
    ];

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 px-4 sm:px-8 relative w-full flex justify-center overflow-hidden">
            <div className="max-w-4xl w-full relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h3 className="text-[#00A4FF] font-bold tracking-widest text-sm uppercase mb-3">FAQ</h3>
                    <GradientHeading
                        as="h2"
                        text="Frequently asked questions"
                        theme={theme}
                        className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]"
                    />
                </motion.div>

                <div className="w-full flex flex-col gap-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                key={index}
                                className={`rounded-xl border overflow-hidden ${isDark
                                    ? "bg-black border-white/5"
                                    : "bg-gray-50 border-black/5"
                                    }`}
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                                >
                                    <span className={`font-bold text-base sm:text-lg ${isDark ? "text-white" : "text-black"}`}>
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`shrink-0 transition-transform duration-300 ${isDark ? "text-white/50" : "text-black/50"} ${isOpen ? "rotate-180" : ""}`}
                                        size={20}
                                    />
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className={`px-6 pb-4 pt-1 text-sm sm:text-base leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
