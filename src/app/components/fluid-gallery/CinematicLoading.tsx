"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onComplete: () => void;
};

export default function CinematicLoading({ onComplete }: Props) {
  const [phase, setPhase] = useState<"loading" | "opening" | "done">("loading");

  useEffect(() => {
    // 1. Stay in 'loading' phase for 2.5 seconds as the line draws
    const timer1 = setTimeout(() => {
      setPhase("opening");
    }, 2500);

    // 2. The opening phase takes about 1.5 seconds, then unmount
    const timer2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden pointer-events-auto"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Top white panel that slides up */}
        <motion.div
          className="absolute top-0 left-0 right-0 bg-white z-10 origin-top"
          initial={{ height: "50%" }}
          animate={{ height: phase === "opening" ? "0%" : "50%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
        />

        {/* Bottom white panel that slides down */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-white z-10 origin-bottom"
          initial={{ height: "50%" }}
          animate={{ height: phase === "opening" ? "0%" : "50%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
        />

        {/* Center Slit container (always behind the panels, revealed as they move) */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-center z-0">
          <motion.div 
            className="w-full bg-black flex items-center justify-center overflow-hidden"
            initial={{ height: 1 }}
            animate={{ 
              height: phase === "opening" ? "100vh" : 1 
            }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
          >
            {/* The text inside the slit, fades out as it opens */}
            <motion.div
              className="text-white font-fluid-serif text-sm tracking-[0.5em] whitespace-nowrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: phase === "opening" ? 0 : 1,
                y: phase === "opening" ? -10 : 0 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              C O L O R W A L L
            </motion.div>
          </motion.div>
        </div>

        {/* Loading progress bar overlaying the slit initially */}
        {phase === "loading" && (
          <motion.div
            className="absolute top-1/2 left-0 right-0 h-[1px] bg-black z-20 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
