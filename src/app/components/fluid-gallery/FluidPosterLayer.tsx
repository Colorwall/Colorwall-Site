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
        __html: FLUID_SLIDES.map((slide, i) => `
          <img
            id="fluid-poster-${i}"
            src="${slide.poster}"
            alt=""
            ${i === 0 ? 'fetchpriority="high"' : 'loading="eager"'}
            class="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-out ${i === 0 ? 'opacity-100' : 'opacity-0'}"
          />
        `).join("") + `
          <div id="fluid-poster-veil" class="absolute inset-0 bg-black/25 pointer-events-none"></div>
        `,
      }}
    />
  ),
  () => true
);

FluidPosterLayer.displayName = "FluidPosterLayer";

/** Swap the memoized poster image when the active slide changes by toggling opacity. */
export function useFluidPosterSync(index: number) {
  const last = useRef(index);

  useEffect(() => {
    if (last.current === index) return;
    
    const oldImg = document.getElementById(`fluid-poster-${last.current}`);
    const newImg = document.getElementById(`fluid-poster-${index}`);
    
    if (oldImg) {
      oldImg.classList.remove("opacity-100");
      oldImg.classList.add("opacity-0");
    }
    
    if (newImg) {
      newImg.classList.remove("opacity-0");
      newImg.classList.add("opacity-100");
    }
    
    last.current = index;
  }, [index]);
}
