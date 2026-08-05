"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FluidPosterLayer, useFluidPosterSync } from "./FluidPosterLayer";
import { FLUID_SLIDES } from "./slides";
import CinematicLoading from "./CinematicLoading";
import type { FluidGalleryHandle } from "./FluidGalleryCanvas";
import StrokeText from "../ui/StrokeText";
import { motion, AnimatePresence } from "framer-motion";

// Three.js + shaders load only after this shell mounts (gallery opened)
const FluidGalleryCanvas = dynamic(
  () => import("./FluidGalleryCanvas").then((m) => ({ default: m.FluidGalleryCanvas })),
  { ssr: false }
);

type Props = {
  onExit: () => void;
};

function slideHtml(index: number) {
  const s = FLUID_SLIDES[index];
  const prev = FLUID_SLIDES[(index - 1 + FLUID_SLIDES.length) % FLUID_SLIDES.length];
  const next = FLUID_SLIDES[(index + 1) % FLUID_SLIDES.length];
  
  return {
    meta: `${s.index} / ${s.tag}`,
    title: s.title,
    body: s.description,
    prev: `‹  ${prev.index} / ${prev.title}`,
    next: `${next.index} / ${next.title}  ›`,
  };
}

const pseudoRand = (seed: number) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

const FluidTextHost = ({ index, visible }: { index: number; visible: boolean }) => {
  const html = slideHtml(index);
  const isIntro = index === 0;

  // Generate deterministic offsets based on index
  const rx = (pseudoRand(index * 2) - 0.5) * 30; // -15vw to +15vw
  const ry = (pseudoRand(index * 2 + 1) - 0.5) * 20; // -10vh to +10vh

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            className="absolute px-6 w-full max-w-md md:max-w-lg lg:max-w-xl pointer-events-auto"
            style={{
              left: `calc(50% + ${rx}vw)`,
              top: `calc(45% + ${ry}vh)`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-outfit mb-4 text-[11px] font-light tracking-[0.22em] text-white/70 uppercase"
            >
              {html.meta}
            </motion.p>
            
            <div className="font-fluid-serif mb-6 flex h-20 items-center text-4xl font-light leading-[1.05] tracking-wide text-white md:text-5xl lg:text-6xl">
              <StrokeText
                key={`title-${index}`}
                text={html.title}
                strokeColor="rgba(255,255,255,0.8)"
                fillColor="#ffffff"
                strokeWidth={1}
                drawDuration={1.2}
                fillDelay={0.4}
                fontSize={isIntro ? 64 : 56}
                letterSpacing={0}
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="font-fluid-serif text-[15px] font-light leading-relaxed text-white/80 md:text-base max-w-sm md:max-w-md"
            >
              {html.body}
            </motion.p>

            {isIntro && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="font-outfit mt-6 text-[10px] tracking-[0.3em] uppercase text-white/40"
              >
                from laxenta inc,
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`nav-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-6 md:bottom-10 md:left-14 md:right-14 lg:left-20 lg:right-20"
          >
            <p className="font-fluid-serif max-w-[40%] text-left text-sm font-light tracking-wide text-white/75 md:text-base">
              {html.prev}
            </p>
            <p className="font-fluid-serif max-w-[40%] text-right text-sm font-light tracking-wide text-white/75 md:text-base">
              {html.next}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FluidExperience({ onExit }: Props) {
  const galleryRef = useRef<FluidGalleryHandle>(null);
  const [index, setIndex] = useState(0);
  const [glReady, setGlReady] = useState(false);
  const [mountCanvas, setMountCanvas] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const textBooted = useRef(false);

  useFluidPosterSync(index);

  // poster + UI first; arm WebGL canvas after first paint / idle
  useEffect(() => {
    const arm = () => setMountCanvas(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(arm, { timeout: 400 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(arm, 120);
    return () => clearTimeout(t);
  }, []);

  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    if (introDone) {
      setTextVisible(false);
      const t = setTimeout(() => setTextVisible(true), 150);
      return () => clearTimeout(t);
    }
  }, [index, introDone]);

  const onChange = useCallback((i: number) => setIndex(i), []);
  const onReady = useCallback(() => setGlReady(true), []);

  const goPrev = () => galleryRef.current?.step(-1);
  const goNext = () => galleryRef.current?.step(1);

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-black text-white select-none">
      {!introDone && <CinematicLoading isReady={glReady} onComplete={() => setIntroDone(true)} />}
      
      <FluidPosterLayer />

      {mountCanvas && (
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-[1400ms] ease-out ${
            glReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <FluidGalleryCanvas
            ref={galleryRef}
            startAt={0}
            onChange={onChange}
            onReady={onReady}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />
        </div>
      )}

      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-8 pt-7 md:px-14 lg:px-20">
        <div className="font-fluid-serif pointer-events-auto flex items-center gap-2 text-sm tracking-wide text-white/90 md:text-base">
          <button
            type="button"
            onClick={onExit}
            className="hover:text-white transition-colors cursor-pointer"
            aria-label="Exit gallery"
          >
            COLORWALL
          </button>
          <span className="text-white/40">/</span>
          <Link href="/about" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
            About
            <span aria-hidden className="text-[10px]">›</span>
          </Link>
        </div>
        <div className="font-fluid-serif pointer-events-auto text-sm tracking-wide text-white/70 md:text-base">
          <Link href="/wallpapers" className="hover:text-white transition-colors">
            wallpapers
          </Link>
          <span className="mx-2 text-white/35">/</span>
          <Link href="/download" className="hover:text-white transition-colors">
            download
          </Link>
        </div>
      </header>

      <button
        type="button"
        onClick={onExit}
        className="absolute left-5 top-1/2 z-30 -translate-y-1/2 flex flex-col gap-[5px] p-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer md:left-7"
        aria-label="Exit to home"
        title="Exit gallery"
      >
        <span className="block h-px w-5 bg-white" />
        <span className="block h-px w-5 bg-white" />
        <span className="block h-px w-5 bg-white" />
      </button>

      <FluidTextHost index={index} visible={textVisible} />

      <div className="absolute right-10 top-1/2 z-30 -translate-y-1/2 md:right-16 lg:right-24">
        <Link
          href="/download"
          className="font-fluid-serif group flex h-28 w-28 items-center justify-center rounded-full border border-white/50 bg-white/10 text-lg tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-500 hover:bg-white/20 hover:border-white/80 hover:scale-105 md:h-32 md:w-32 md:text-xl"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }}
        >
          <span className="pl-1">
            PLAY <span className="opacity-70 group-hover:opacity-100">›</span>
          </span>
        </Link>
      </div>

      <button
        type="button"
        onClick={goPrev}
        className="absolute bottom-0 left-0 z-30 h-24 w-[42%] cursor-pointer bg-transparent"
        aria-label="Previous slide"
      />
      <button
        type="button"
        onClick={goNext}
        className="absolute bottom-0 right-0 z-30 h-24 w-[42%] cursor-pointer bg-transparent"
        aria-label="Next slide"
      />

      <div className="pointer-events-none absolute bottom-[4.5rem] left-8 right-8 z-20 flex items-center gap-3 md:left-14 md:right-14 lg:left-20 lg:right-20">
        <span className="text-white/50 text-xs" aria-hidden>
          ‹
        </span>
        <div className="relative h-px flex-1 bg-white/20">
          <div
            className="absolute top-0 left-0 h-px bg-white/70 transition-all duration-500"
            style={{ width: `${((index + 1) / FLUID_SLIDES.length) * 100}%` }}
          />
        </div>
        <span className="text-white/50 text-xs" aria-hidden>
          ›
        </span>
      </div>

      <p className="font-outfit pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-[10px] tracking-[0.35em] uppercase text-white/35">
        scroll
      </p>
    </div>
  );
}
