"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  isReady: boolean;
  onComplete: () => void;
};

export default function CinematicLoading({ isReady, onComplete }: Props) {
  const [phase, setPhase] = useState<"loading" | "opening" | "done">("loading");

  useEffect(() => {
    if (!isReady) return;

    // Once WebGL shaders are ready, wait a beat then open the slit
    const timer1 = setTimeout(() => {
      setPhase("opening");
    }, 500);

    // The opening phase takes about 1.5 seconds, then unmount
    const timer2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isReady, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden pointer-events-auto"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.1, delay: 1.2 } }}
      >
        {/* Top white panel that slides up */}
        <motion.div
          className="absolute top-0 left-0 right-0 bg-white z-10"
          initial={{ height: "50%" }}
          animate={{ height: phase === "opening" ? "0%" : "50%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
        />

        {/* Bottom white panel that slides down */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-white z-10"
          initial={{ height: "50%" }}
          animate={{ height: phase === "opening" ? "0%" : "50%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
        />

        {/* Center UI elements (text and line) that sit on top of the panels */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          {/* Text */}
          <motion.div
            className="text-black font-fluid-serif text-[10px] md:text-xs tracking-[0.4em] md:tracking-[0.6em] whitespace-nowrap mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: phase === "opening" ? 0 : 1,
              y: phase === "opening" ? -10 : 0 
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            C O L O R W A L L &nbsp;&nbsp;B Y &nbsp;&nbsp;L A X E N T A &nbsp;&nbsp;I N C
          </motion.div>

          {/* Loading line */}
          <motion.div
            className="w-1/3 md:w-1/4 h-[1px] bg-black origin-left"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ 
              scaleX: phase === "loading" ? 1 : 1, // Slow fill until ready
              opacity: phase === "opening" ? 0 : 1
            }}
            transition={{ 
              scaleX: { duration: 8, ease: "circOut" }, 
              opacity: { duration: 0.3 } 
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
