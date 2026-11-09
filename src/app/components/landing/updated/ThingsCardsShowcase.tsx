"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAmbient } from "@/app/contexts/AmbientContext";
import { cn } from "@/lib/utils";

interface ThingsCardsShowcaseProps {
  isDark?: boolean;
}

// things inc inspired performance metric showcase bento grid with periwinkle card backgrounds
export function ThingsCardsShowcase({ isDark = true }: ThingsCardsShowcaseProps) {
  const ambient = useAmbient();

  // launch full screen 3d webgl gallery overlay and activate ambient sound track
  const handleLaunchGallery = () => {
    try {
      ambient.forcePlay();
    } catch {
      // audio play safeguard
    }
    const url = new URL(window.location.href);
    url.searchParams.set("gallery", "true");
    window.history.pushState({}, "", url.pathname + url.search);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <div className="mt-10 sm:mt-14 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* card 1 (left big card): 8k ready - clicking launches the live 3d scene */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleLaunchGallery}
          className={cn(
            "group relative lg:col-span-7 rounded-[2.2rem] sm:rounded-[2.8rem] border-2 border-[#545ebb] bg-[#545ebb] overflow-hidden min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex flex-col justify-between p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:border-[#6f7ae0] hover:shadow-[0_24px_60px_rgba(84,94,187,0.4)]"
          )}
        >
          {/* vivid 8k panoramic background image - no mask, full brightness */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Image
              src="/videos/posters/Windmills_Battlefield_1_Dawn_of_War_Live_Wallpaper.webp"
              alt="8K Wallpaper Preview"
              fill
              className="object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700 ease-out"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>

          {/* top row: 3d scene incentive badge on left and things squircle dot button on right */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-mono font-medium text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="w-1.5 h-1.5 rounded-full bg-[#70d6ff] animate-pulse" />
              <span className="uppercase tracking-wider">3D Scene</span>
              <span className="text-sm leading-none ml-0.5">→</span>
            </div>

            {/* signature things squircle pill with center dot */}
            <div className="w-11 h-11 rounded-[1.2rem] bg-[#c3caff]/80 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1b1f48]" />
            </div>
          </div>

          {/* bottom floating lavender pill card */}
          <div className="relative z-10 max-w-md rounded-[1.6rem] bg-[#dbe0ff] text-[#13163a] p-6 sm:p-7 shadow-[0_12px_36px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:-translate-y-1">
            <h3 className="font-outfit text-2xl sm:text-3xl font-[700] tracking-tight text-[#13163a]">
              8K Ready
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm font-sans text-[#2c3367] leading-relaxed">
              Hardware IMF with native 8K display support and independent monitor scaling. Click to launch the live 3D gallery.
            </p>
          </div>
        </motion.div>

        {/* right column: cards 2 and 3 stacked */}
        <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
          {/* card 2 (top right): memory load - solid periwinkle bg like things.inc */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "group relative rounded-[2.2rem] sm:rounded-[2.8rem] border-2 border-[#545ebb] bg-[#545ebb] overflow-hidden min-h-[300px] sm:min-h-[330px] lg:min-h-[350px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#6f7ae0]"
            )}
          >
            {/* voxel desk asset in top right corner */}
            <div className="absolute right-3 top-3 w-32 sm:w-40 h-32 sm:h-40 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-500">
              <Image
                src="/editorial/homepage/Desk_things_new-p-800.png"
                alt="Memory Efficiency Graphic"
                fill
                className="object-contain"
              />
            </div>

            {/* top row: just the signature things squircle, no label */}
            <div className="relative z-10 flex items-end justify-end w-full">
              <div className="w-10 h-10 rounded-[1.1rem] bg-[#c3caff] flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#1b1f48]" />
              </div>
            </div>

            {/* bottom floating lavender pill card - not full span */}
            <div className="relative z-10 max-w-sm rounded-[1.5rem] bg-[#dbe0ff] text-[#13163a] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              <div className="flex items-baseline gap-2.5">
                <span className="font-outfit text-2xl sm:text-3xl font-[700] tracking-tight text-[#13163a]">
                  ~100MB
                </span>
                <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#343b78] font-semibold">
                  Idle memory
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-sans text-[#2c3367] leading-relaxed">
                Rust runtime memory footprint with zero background bloat, handle leaks, or garbage collection spikes.
              </p>
            </div>
          </motion.div>

          {/* card 3 (bottom right): gpu load - solid periwinkle bg like things.inc */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "group relative rounded-[2.2rem] sm:rounded-[2.8rem] border-2 border-[#545ebb] bg-[#545ebb] overflow-hidden min-h-[220px] sm:min-h-[245px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#6f7ae0]"
            )}
          >
            {/* retro tv voxel asset in top right corner */}
            <div className="absolute right-4 top-2 w-32 sm:w-36 h-32 sm:h-36 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-500">
              <Image
                src="/editorial/homepage/670f18f95e251b5a9c8be968_Retro_TV_On2.png"
                alt="GPU Auto-pause Graphic"
                fill
                className="object-contain"
              />
            </div>

            {/* top row: just the signature things squircle, no label */}
            <div className="relative z-10 flex items-end justify-end w-full">
              <div className="w-10 h-10 rounded-[1.1rem] bg-[#c3caff] flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#1b1f48]" />
              </div>
            </div>

            {/* bottom floating lavender pill card - not full span */}
            <div className="relative z-10 max-w-sm rounded-[1.5rem] bg-[#dbe0ff] text-[#13163a] p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
              <div className="flex items-baseline gap-2.5">
                <span className="font-outfit text-2xl sm:text-3xl font-[700] tracking-tight text-[#13163a]">
                  0% Load
                </span>
                <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#343b78] font-semibold">
                  Game auto-pause
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-sans text-[#2c3367] leading-relaxed">
                Direct hardware swapchain bypass when full-screen 3D games or GPU-heavy applications are detected.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
