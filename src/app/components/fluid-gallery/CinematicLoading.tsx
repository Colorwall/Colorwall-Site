"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  isReady: boolean;
  onComplete: () => void;
  isDark?: boolean;
};

// cinematic split curtain loading transition for site entry and fluid gallery
export default function CinematicLoading({ isReady, onComplete, isDark = true }: Props) {
  const [phase, setPhase] = useState<"loading" | "opening" | "done">("loading");

  useEffect(() => {
    if (!isReady) return;

    // once assets and dom are ready, wait a beat then slide open the top and bottom curtain panels
    const timer1 = setTimeout(() => {
      setPhase("opening");
    }, 450);

    // curtain split takes 1.1s, then mark done and fire oncomplete to unmount cleanly
    const timer2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 1750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isReady, onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden pointer-events-auto select-none"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        {/* top curtain panel that slides up */}
        <motion.div
          className={cn(
            "absolute top-0 left-0 right-0 z-10",
            isDark ? "bg-[#08090e]" : "bg-white"
          )}
          initial={{ height: "50%" }}
          animate={{ height: phase === "opening" ? "0%" : "50%" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        />

        {/* bottom curtain panel that slides down */}
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-10",
            isDark ? "bg-[#08090e]" : "bg-white"
          )}
          initial={{ height: "50%" }}
          animate={{ height: phase === "opening" ? "0%" : "50%" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        />

        {/* center brand typography and animated accent progress line */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6">
          <motion.div
            className={cn(
              "font-mono text-[10px] sm:text-xs tracking-[0.35em] sm:tracking-[0.55em] uppercase whitespace-nowrap mb-4",
              isDark ? "text-white/90" : "text-slate-900"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: phase === "opening" ? 0 : 1,
              y: phase === "opening" ? -12 : 0,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            COLORWALL &nbsp;&bull;&nbsp; BY LAXENTA LLC
          </motion.div>

          {/* horizontal loading progress line */}
          <motion.div
            className={cn(
              "w-40 sm:w-56 h-[1px] origin-center",
              isDark ? "bg-white/40" : "bg-slate-900/40"
            )}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: 1,
              opacity: phase === "opening" ? 0 : 1,
            }}
            transition={{
              scaleX: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.3 },
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
