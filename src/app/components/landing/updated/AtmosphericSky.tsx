"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AtmosphericSkyProps {
  theme?: "dark" | "light";
}

// deterministic star generator for zero hydration mismatch across initial server and client render
function generateStarField(count = 54) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const x = ((i * 41 + 17) % 98) + 1;
    const y = ((i * 67 + 31) % 96) + 2;
    const size = ((i * 13) % 2.5) + 1.5;
    const delay = ((i * 17) % 40) / 10;
    const duration = 2.4 + ((i * 29) % 25) / 10;
    stars.push({ id: i, x, y, size, delay, duration });
  }
  return stars;
}

// page wide atmospheric sky canvas rendering celestial body stars and floating 3d clouds
export function AtmosphericSky({ theme = "dark" }: AtmosphericSkyProps) {
  const isDark = theme === "dark";
  const starField = useMemo(() => generateStarField(54), []);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-700",
        isDark
          ? "bg-gradient-to-b from-[#0e0f24] via-[#141639] to-[#0b0c1c]"
          : "bg-gradient-to-b from-[#e3ecff] via-[#edf3ff] to-[#f7f9ff]"
      )}
    >
      {/* background starfield active only during dark mode */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden">
          {starField.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
              }}
              animate={{ opacity: [0.12, 0.85, 0.12], scale: [0.8, 1.25, 0.8] }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                delay: s.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* celestial body sun in light mode and moon in dark mode positioned in upper sky */}
      <div className="absolute top-10 right-8 sm:top-16 sm:right-16 lg:right-28 z-0">
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, y: -20, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex items-center justify-center"
        >
          {/* soft ambient halo glow */}
          <div
            className={cn(
              "absolute w-32 h-32 sm:w-44 sm:h-44 rounded-full blur-3xl pointer-events-none",
              isDark ? "bg-indigo-400/25" : "bg-amber-300/40"
            )}
          />

          <Image
            src={isDark ? "/editorial/moon.svg" : "/editorial/sun.svg"}
            alt={isDark ? "Moon Icon" : "Sun Icon"}
            width={72}
            height={72}
            className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 object-contain relative z-10 transition-transform duration-500",
              isDark
                ? "drop-shadow-[0_0_26px_rgba(180,205,255,0.45)]"
                : "drop-shadow-[0_0_30px_rgba(255,212,102,0.65)]"
            )}
          />
        </motion.div>
      </div>

      {/* floating 3d cloud asset 1 top left drifting */}
      <motion.div
        className="absolute top-12 -left-12 sm:left-6 lg:left-12 opacity-80 sm:opacity-90"
        animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/editorial/cloud1.png"
          alt="Atmospheric Cloud 1"
          width={300}
          height={150}
          className="w-52 sm:w-72 md:w-88 h-auto object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.22)]"
        />
      </motion.div>

      {/* floating 3d cloud asset 2 mid right drifting */}
      <motion.div
        className="absolute top-1/4 right-2 sm:right-16 lg:right-24 opacity-75 sm:opacity-85"
        animate={{ y: [0, 16, 0], x: [0, -12, 0] }}
        transition={{ duration: 10.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Image
          src="/editorial/cloud2.png"
          alt="Atmospheric Cloud 2"
          width={280}
          height={140}
          className="w-44 sm:w-64 md:w-80 h-auto object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.18)]"
        />
      </motion.div>

      {/* floating 3d cloud asset 3 lower altitude drifting */}
      <motion.div
        className="absolute top-2/3 left-10 sm:left-1/4 opacity-70 sm:opacity-80"
        animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
      >
        <Image
          src="/editorial/cloud3.png"
          alt="Atmospheric Cloud 3"
          width={340}
          height={170}
          className="w-60 sm:w-80 md:w-96 h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        />
      </motion.div>
    </div>
  );
}

