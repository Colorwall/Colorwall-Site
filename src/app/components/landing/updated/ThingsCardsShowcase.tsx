"use client";

import React from "react";
import Image from "next/image";
import { useAmbient } from "@/app/contexts/AmbientContext";
import { cn } from "@/lib/utils";

interface ThingsCardsShowcaseProps {
  isDark?: boolean;
}

// lightweight high performance things inc inspired bento grid with zero blurs or heavy box shadows
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
    <div className="mt-10 sm:mt-14 w-full select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* card 1 (left big card): 8k ready with zero blurs and zero shadows */}
        <div
          onClick={handleLaunchGallery}
          className={cn(
            "group relative lg:col-span-7 rounded-[2.2rem] sm:rounded-[2.8rem] border-2 border-[#545ebb] bg-[#545ebb] overflow-hidden min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex flex-col justify-between p-6 sm:p-8 cursor-pointer transition-colors duration-200 hover:border-[#737ee6]"
          )}
        >
          {/* vivid 8k background image with async decoding and lazy loading */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <Image
              src="/videos/posters/Windmills_Battlefield_1_Dawn_of_War_Live_Wallpaper.webp"
              alt="8K Wallpaper Preview"
              fill
              loading="lazy"
              decoding="async"
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>

          {/* top row: 3d scene incentive badge on left and things squircle dot button on right */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/20 text-[11px] sm:text-xs font-mono font-medium text-white">
              <span className="uppercase tracking-wider">Click for magic!</span>
            </div>

            {/* signature things squircle pill with center dot */}
            <div className="w-11 h-11 rounded-[1.2rem] bg-[#c3caff] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1b1f48]" />
            </div>
          </div>

          {/* bottom floating lavender pill card with zero blur or shadow */}
          <div className="relative z-10 max-w-md rounded-[1.6rem] bg-[#dbe0ff] text-[#13163a] p-6 sm:p-7">
            <h3 className="font-outfit text-2xl sm:text-3xl font-[700] tracking-tight text-[#13163a]">
              8K Ready
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm font-sans text-[#2c3367] leading-relaxed">
              Hardware IMF with native 8K display support and independent monitor scaling. Click to launch the live 3D animation.
            </p>
          </div>
        </div>

        {/* right column: cards 2 and 3 stacked */}
        <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
          {/* card 2 (top right): memory load */}
          <div
            className={cn(
              "group relative rounded-[2.2rem] sm:rounded-[2.8rem] border-2 border-[#545ebb] bg-[#545ebb] overflow-hidden min-h-[300px] sm:min-h-[330px] lg:min-h-[350px] p-6 sm:p-7 flex flex-col justify-between transition-colors duration-200 hover:border-[#737ee6]"
            )}
          >
            {/* voxel desk asset in top right corner */}
            <div className="absolute right-5 sm:right-8 top-12 sm:top-14 w-32 sm:w-44 h-24 sm:h-32 pointer-events-none opacity-85">
              <Image
                src="/editorial/homepage/Desk_things_cropped.png"
                alt="Memory Efficiency Graphic"
                fill
                loading="lazy"
                decoding="async"
                className="object-contain"
              />
            </div>

            {/* top row: just the signature things squircle */}
            <div className="relative z-10 flex items-end justify-end w-full">
              <div className="w-10 h-10 rounded-[1.1rem] bg-[#c3caff] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <div className="w-2 h-2 rounded-full bg-[#1b1f48]" />
              </div>
            </div>

            {/* bottom floating lavender pill card */}
            <div className="relative z-10 max-w-sm rounded-[1.5rem] bg-[#dbe0ff] text-[#13163a] p-5 sm:p-6">
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
          </div>

          {/* card 3 (bottom right): gpu load */}
          <div
            className={cn(
              "group relative rounded-[2.2rem] sm:rounded-[2.8rem] border-2 border-[#545ebb] bg-[#545ebb] overflow-hidden min-h-[220px] sm:min-h-[245px] p-6 sm:p-7 flex flex-col justify-between transition-colors duration-200 hover:border-[#737ee6]"
            )}
          >
            {/* retro tv voxel asset in top right corner */}
            <div className="absolute right-4 top-2 w-32 sm:w-36 h-32 sm:h-36 pointer-events-none opacity-80">
              <Image
                src="/editorial/homepage/670f18f95e251b5a9c8be968_Retro_TV_On2.png"
                alt="GPU Auto-pause Graphic"
                fill
                loading="lazy"
                decoding="async"
                className="object-contain"
              />
            </div>

            {/* top row: signature things squircle */}
            <div className="relative z-10 flex items-end justify-end w-full">
              <div className="w-10 h-10 rounded-[1.1rem] bg-[#c3caff] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <div className="w-2 h-2 rounded-full bg-[#1b1f48]" />
              </div>
            </div>

            {/* bottom floating lavender pill card */}
            <div className="relative z-10 max-w-sm rounded-[1.5rem] bg-[#dbe0ff] text-[#13163a] p-5 sm:p-6">
              <div className="flex items-baseline gap-2.5">
                <span className="font-outfit text-2xl sm:text-3xl font-[700] tracking-tight text-[#13163a]">
                  0% Load
                </span>
                <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[#343b78] font-semibold">
                  Game auto-pause
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-sans text-[#2c3367] leading-relaxed">
                Direct hardware swapchain pause when full-screen 3D games or GPU-heavy applications are detected. Built to step out of your way &lt;3
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
