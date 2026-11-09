"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/lib/utils";

type TransitionPhase = "idle" | "initial" | "navigating" | "opening";

// global editorial slit curtain transition handling initial site load and cross route switching
export function GlobalLoadingCurtain() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === "dark";

  const [phase, setPhase] = useState<TransitionPhase>("initial");
  const previousPathnameRef = useRef<string>(pathname);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. handle initial mount curtain opening
  useEffect(() => {
    // wait a beat for initial dom hydration, then trigger curtain slide
    const t1 = setTimeout(() => {
      setPhase("opening");
    }, 450);

    const t2 = setTimeout(() => {
      setPhase("idle");
    }, 1750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // 2. handle pathname change (when nextjs route transition completes)
  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;

      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }

      // the new route has arrived, trigger the curtain reveal
      setPhase("opening");

      const t = setTimeout(() => {
        setPhase("idle");
      }, 1200);

      return () => clearTimeout(t);
    }
  }, [pathname]);

  // 3. capture all internal navigation clicks across navbar, buttons, and links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // find closest anchor tag
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // ignore external links, hash anchors, mailto, tel, or new tab links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // check if navigating to a different pathname
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;

        // start route transition immediately so user has zero latency feedback
        setPhase("navigating");

        // safety timeout: if route is cancelled or network completely fails, auto open after 6 seconds
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = setTimeout(() => {
          setPhase("opening");
          setTimeout(() => setPhase("idle"), 1200);
        }, 6000);
      } catch {
        // invalid url safety
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  if (phase === "idle") return null;

  const isOpening = phase === "opening";
  const isNavigating = phase === "navigating";

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden pointer-events-auto select-none"
      >
        {/* top curtain panel */}
        <motion.div
          className={cn(
            "absolute top-0 left-0 right-0 z-10",
            isDark ? "bg-[#08090e]" : "bg-white"
          )}
          initial={{ height: isNavigating ? "0%" : "50%" }}
          animate={{
            height: isOpening ? "0%" : "50%",
          }}
          transition={{
            duration: isNavigating ? 0.35 : 1.1,
            ease: isNavigating ? [0.22, 1, 0.36, 1] : [0.76, 0, 0.24, 1],
            delay: isOpening ? 0.05 : 0,
          }}
        />

        {/* bottom curtain panel */}
        <motion.div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-10",
            isDark ? "bg-[#08090e]" : "bg-white"
          )}
          initial={{ height: isNavigating ? "0%" : "50%" }}
          animate={{
            height: isOpening ? "0%" : "50%",
          }}
          transition={{
            duration: isNavigating ? 0.35 : 1.1,
            ease: isNavigating ? [0.22, 1, 0.36, 1] : [0.76, 0, 0.24, 1],
            delay: isOpening ? 0.05 : 0,
          }}
        />

        {/* center brand typography and animated accent progress line */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none px-6">
          <motion.div
            className={cn(
              "font-mono text-[10px] sm:text-xs tracking-[0.35em] sm:tracking-[0.55em] uppercase whitespace-nowrap mb-4",
              isDark ? "text-white/90" : "text-slate-900"
            )}
            initial={{ opacity: isNavigating ? 0 : 1, y: isNavigating ? 8 : 0 }}
            animate={{
              opacity: isOpening ? 0 : 1,
              y: isOpening ? -12 : 0,
            }}
            transition={{ duration: 0.35, ease: "easeOut" }}
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
              scaleX: isOpening ? 1 : 0.85,
              opacity: isOpening ? 0 : 1,
            }}
            transition={{
              scaleX: {
                duration: isNavigating ? 2.5 : 0.8,
                ease: isNavigating ? "easeOut" : [0.22, 1, 0.36, 1],
              },
              opacity: { duration: 0.25 },
            }}
          />
        </div>
      </div>
    </AnimatePresence>
  );
}

