"use client";

import { motion } from "framer-motion";

export const ScrollArrow = ({ theme }: { theme: "dark" | "light" }) => (
    <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 group"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={() => {
            const el = document.getElementById("previews");
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            } else {
                window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
            }
        }}
    >
        <div className={`px-5 py-3 rounded-full border flex items-center gap-2 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95
            ${theme === "dark" ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-black/5 border-black/10 text-black hover:bg-black/10"}`}>
            <span className="text-xs sm:text-sm font-mono font-bold tracking-widest uppercase">
                See it in action
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    </motion.div>
);
