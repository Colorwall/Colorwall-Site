"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { motion } from "framer-motion";

// client side routing portal component replacing the static about view
// orchestrates a clean editorial handoff to the webgl patron experience at patron.colorwall.xyz
export default function AboutPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // triggers window navigation to the patron subdomain after a graceful 2.5 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://patron.colorwall.xyz";
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-[85vh] flex flex-col justify-center items-center px-6 select-none transition-colors duration-300 ${
        isDark ? "text-white" : "text-neutral-900"
      }`}
    >
      <motion.a
        href="https://patron.colorwall.xyz"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-4 max-w-2xl cursor-pointer group"
      >
        <h1 className="font-outfit font-[200] text-5xl sm:text-7xl md:text-8xl tracking-[-0.04em] leading-[0.95] group-hover:opacity-80 transition-opacity">
          Well that seems awesome!
        </h1>
        <p
          className={`font-mono text-xs sm:text-sm uppercase tracking-[0.25em] ${
            isDark ? "text-white/40" : "text-black/40"
          }`}
        >
          A moment please..
        </p>
      </motion.a>
    </div>
  );
}
