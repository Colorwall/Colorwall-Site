"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FluidPosterLayer, useFluidPosterSync } from "./FluidPosterLayer";
import { FLUID_SLIDES } from "./slides";
import CinematicLoading from "./CinematicLoading";
import type { FluidGalleryHandle } from "./FluidGalleryCanvas";

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
    prev: `${prev.index} / ${prev.title}`,
    next: `${next.index} / ${next.title}`,
  };
}

/**
 * Text layer uses a single memoized host + innerHTML swaps so slide copy
 * fades without React reconciling the tree (same idea as HeroBackground).
 */
const FluidTextHost = React.memo(
  () => (
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="absolute left-8 top-[38%] max-w-md md:left-14 lg:left-20 md:max-w-lg">
        <p
          id="fluid-meta"
          className="font-outfit mb-3 text-[11px] font-light tracking-[0.22em] text-white/70 uppercase"
        />
        <h2
          id="fluid-title"
          className="font-fluid-serif mb-5 text-4xl font-light leading-[1.05] tracking-wide text-white md:text-5xl lg:text-6xl"
        />
        <p
          id="fluid-body"
          className="font-fluid-serif max-w-sm text-[15px] font-light leading-relaxed text-white/80 md:text-base"
        />
      </div>

      <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-6 md:bottom-10 md:left-14 md:right-14 lg:left-20 lg:right-20">
        <p
          id="fluid-prev"
          className="font-fluid-serif max-w-[40%] text-left text-sm font-light tracking-wide text-white/75 md:text-base"
        />
        <p
          id="fluid-next"
          className="font-fluid-serif max-w-[40%] text-right text-sm font-light tracking-wide text-white/75 md:text-base"
        />
      </div>
    </div>
  ),
  () => true
);
FluidTextHost.displayName = "FluidTextHost";

function writeSlideText(index: number, animate: boolean) {
  const html = slideHtml(index);
  const ids = ["fluid-meta", "fluid-title", "fluid-body", "fluid-prev", "fluid-next"] as const;
  const values = [html.meta, html.title, html.body, html.prev, html.next];

  ids.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (animate) {
      el.style.transition = "opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.opacity = "0";
      el.style.transform = "translate3d(0, 8px, 0)";

      setTimeout(() => {
        el.innerHTML = values[i];
        el.style.opacity = "1";
        el.style.transform = "translate3d(0, 0, 0)";
      }, 100);
    } else {
      el.innerHTML = values[i];
      el.style.opacity = "1";
      el.style.transform = "translate3d(0, 0, 0)";
    }
  });
}

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

  useEffect(() => {
    const boot = () => {
      if (!textBooted.current) {
        writeSlideText(index, false);
        textBooted.current = true;
        return;
      }
      writeSlideText(index, true);
    };
    // ensure DOM from memo host exists after mount / HMR
    const id = requestAnimationFrame(boot);
    return () => cancelAnimationFrame(id);
  }, [index]);

  const onChange = useCallback((i: number) => setIndex(i), []);
  const onReady = useCallback(() => setGlReady(true), []);

  const goPrev = () => galleryRef.current?.step(-1);
  const goNext = () => galleryRef.current?.step(1);

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden bg-black text-white select-none">
      {!introDone && <CinematicLoading onComplete={() => setIntroDone(true)} />}
      
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

      <FluidTextHost />

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
