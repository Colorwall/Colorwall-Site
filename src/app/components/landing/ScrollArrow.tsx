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
        <span className={`text-[10px] sm:text-xs font-mono font-semibold tracking-widest uppercase transition-colors duration-300 ${theme === "dark" ? "text-white/50 group-hover:text-white" : "text-black/50 group-hover:text-black"}`}>
            See it in action
        </span>
        <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path
                d="M18 6v24M8 22l10 10 10-10"
                stroke={theme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-colors duration-300 group-hover:stroke-current"
            />
        </svg>
    </motion.div>
);
