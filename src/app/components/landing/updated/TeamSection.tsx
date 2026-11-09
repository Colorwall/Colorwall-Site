"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LaxentaRunner } from "@/app/components/LaxentaRunner";

interface TeamBreathingSectionProps {
  isDark?: boolean;
}

// things inc inspired breathing team identity section with laxenta brand mark
export function TeamBreathingSection({ isDark = true }: TeamBreathingSectionProps) {
  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex flex-col items-center justify-center my-10 sm:my-16 overflow-hidden select-none">
      {/* retro tv voxel asset: anchored to the physical left screen edge */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-2 sm:left-6 md:left-10 lg:left-14 bottom-6 sm:bottom-12 md:bottom-16 z-0 pointer-events-none"
      >
        <Image
          src="/editorial/homepage/670f18f95e251b5a9c8be968_Retro_TV_On2.png"
          alt="Retro TV Voxel Asset"
          width={450}
          height={450}
          loading="lazy"
          decoding="async"
          className="w-44 sm:w-56 md:w-72 lg:w-84 xl:w-96 h-auto object-contain"
        />
      </motion.div>

      {/* train voxel asset: pushed back to clear text column, overflowing off physical right edge */}
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-0 top-6 sm:top-10 md:top-14 translate-x-[42%] lg:translate-x-[46%] xl:translate-x-[50%] z-0 pointer-events-none"
      >
        <Image
          src="/editorial/homepage/train.png"
          alt="Train Voxel Asset"
          width={1000}
          height={1000}
          loading="lazy"
          decoding="async"
          className="w-[360px] sm:w-[520px] md:w-[680px] lg:w-[840px] xl:w-[980px] h-auto object-contain"
        />
      </motion.div>

      {/* wide horizontal text block distributed across the viewport */}
      <div className="relative z-10 w-full max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center">
        {/* laxenta signature brand lockup matching footer typography */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 select-none"
        >
          <LaxentaRunner isDark={isDark} />
          <div className="flex flex-col text-left">
            <span
              className={cn(
                "text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none select-none",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Presented to you by Laxenta LLC.
            </span>
            <span
              className={cn(
                "text-[10px] sm:text-xs font-mono tracking-widest uppercase mt-1",
                isDark ? "text-white/50" : "text-slate-500"
              )}
            >
              Under active development.
            </span>
          </div>
        </motion.div>

        {/* 3 wide horizontally distributed quote lines in roobert mono */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "font-['RoobertMono'] text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-[3.25rem] font-normal leading-[1.38] tracking-tight flex flex-col items-center gap-2.5 sm:gap-3.5 md:gap-4 w-full",
            isDark ? "text-white/90" : "text-slate-800"
          )}
        >
          {/* line 1: wide single line with arcade lever */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap sm:flex-nowrap">
            <span className="whitespace-nowrap">We are us, we make cool stuff</span>
            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 relative shrink-0 align-middle -mt-1 sm:-mt-2">
              <Image
                src="/editorial/homepage/alever.png"
                alt="Arcade Lever Asset"
                fill
                loading="lazy"
                decoding="async"
                className="object-contain hover:rotate-12 transition-transform duration-300"
              />
            </span>
            <span className="whitespace-nowrap">when we feel bored,</span>
          </div>

          {/* line 2: wide single line with voxel gem */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap sm:flex-nowrap">
            <span className="whitespace-nowrap">and get bored</span>
            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 relative shrink-0 align-middle -mt-1 sm:-mt-2">
              <Image
                src="/editorial/homepage/portal-item_gem.png"
                alt="Gem Asset"
                fill
                loading="lazy"
                decoding="async"
                className="object-contain hover:scale-110 transition-transform duration-300"
              />
            </span>
            <span className="whitespace-nowrap">when we make cool stuff,</span>
          </div>

          {/* line 3: clean impactful conclusion */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap sm:flex-nowrap">
            <span className="whitespace-nowrap">it is a cycle</span>
            <span className="whitespace-nowrap">but atleast we make cool stuff</span>
          </div>
        </motion.div>

        {/* learn more button in things inc rounded lavender pill style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9 sm:mt-11"
        >
          <a
            href="https://github.com/orgs/Colorwall/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-[1.3rem] bg-[#dbe0ff] text-[#13163a] font-['RoobertMono'] text-sm sm:text-base font-medium hover:scale-105 hover:bg-white transition-all duration-300 cursor-pointer"
          >
            <span>Learn more about us</span>
            <span className="w-2 h-2 rounded-full bg-[#13163a] group-hover:scale-125 transition-transform duration-300" />
          </a>
        </motion.div>

        {/* clean contact email only */}
        <div className="mt-2 sm:mt-2">
          <a
            href="mailto:help.colorwall@gmail.com"
            className={cn(
              "font-mono text-xs sm:text-sm tracking-widest transition-colors duration-200",
              isDark ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-900"
            )}
          >
            help.colorwall@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
