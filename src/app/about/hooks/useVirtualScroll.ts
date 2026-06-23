'use client';

import { useEffect, useRef } from 'react';
import { DEFAULT_SCROLL } from '../scrollConfig';
import { INTRO_SCROLL_END, saturate } from '../mathLusion';

/** Lusion ScrollPane — wheelEaseCoeff and viewport-normalized deltas. */
const WHEEL_EASE_COEFF = 12;
const SCROLL_PER_VIEWPORT = INTRO_SCROLL_END / (3.5 + 1.75);

function normalizeWheelPixels(e: WheelEvent) {
  let delta = e.deltaY;
  if (e.deltaMode === 1) delta *= 40;
  else if (e.deltaMode === 2) delta *= 800;
  return delta;
}

export function useVirtualScroll() {
  const scrollProgress = useRef(DEFAULT_SCROLL);
  const targetScroll = useRef(DEFAULT_SCROLL);
  const wheelScrolling = useRef(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const current = scrollProgress.current;
      const target = targetScroll.current;
      const diff = target - current;

      if (wheelScrolling.current) {
        const step = diff * (1 - Math.exp(-WHEEL_EASE_COEFF * dt));
        if (Math.abs(diff) < 0.00015) {
          scrollProgress.current = target;
          wheelScrolling.current = false;
        } else {
          scrollProgress.current = saturate(current + step);
        }
      } else if (Math.abs(diff) > 0.00015) {
        scrollProgress.current += diff * (1 - Math.exp(-8 * dt));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const vh = window.innerHeight || 1;
      const delta = (normalizeWheelPixels(e) / vh) * SCROLL_PER_VIEWPORT;
      targetScroll.current = saturate(targetScroll.current + delta);
      wheelScrolling.current = true;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return scrollProgress;
}
