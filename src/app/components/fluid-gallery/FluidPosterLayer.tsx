"use client";

import React, { useEffect, useRef } from "react";
import { FLUID_SLIDES } from "./slides";

/**
 * Instant LCP poster layer — same pattern as HeroBackground:
 * React.memo(never re-render) + dangerouslySetInnerHTML so the browser owns the DOM.
 * WebGL canvas fades in on top once the fragment shader gallery is ready.
 */
export const FluidPosterLayer = React.memo(
  () => (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
          <img
            id="fluid-poster"
            src="${FLUID_SLIDES[0].poster}"
            alt=""
            fetchpriority="high"
            class="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-[1200ms] ease-out"
          />
          <div id="fluid-poster-veil" class="absolute inset-0 bg-black/25 pointer-events-none"></div>
        `,
      }}
    />
  ),
  () => true
);

FluidPosterLayer.displayName = "FluidPosterLayer";

/** Swap the memoized poster image when the active slide changes (DOM-only, no React re-render). */
export function useFluidPosterSync(index: number) {
  const last = useRef(index);

  useEffect(() => {
    if (last.current === index) return;
    last.current = index;
    const img = document.getElementById("fluid-poster") as HTMLImageElement | null;
    const slide = FLUID_SLIDES[index];
    if (!img || !slide) return;
    img.src = slide.poster;
  }, [index]);
}
