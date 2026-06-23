'use client';

import { useEffect, useRef } from 'react';
import { DEFAULT_SCROLL, SCROLL_MAX } from '../scrollConfig';
import { INTRO_SCROLL_END } from '../mathUtils';

function saturateToMax(v: number) {
  return Math.max(0, Math.min(SCROLL_MAX, v));
}

/** Buffer ScrollPane — wheelEaseCoeff and viewport-normalized deltas. */
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
        let step = diff * (1 - Math.exp(-WHEEL_EASE_COEFF * dt));
        
        // clamp the maximum scroll step size to limit the peak velocity per frame.
        // this prevents the virtual scroll from going too fast if the user scrolls hard,
        // ensuring the webgl camera animation (c:\Users\MY-PC\Documents\Colorwall-Site\src\app\about\WebGLScene.tsx) stays smooth and controllable.
        const maxStep = 1.2 * dt; 
        step = Math.max(-maxStep, Math.min(maxStep, step));

        if (Math.abs(diff) < 0.00015) {
          scrollProgress.current = target;
          wheelScrolling.current = false;
        } else {
          scrollProgress.current = saturateToMax(current + step);
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
      
      // cap the target scroll so it can never be too far ahead of the current scroll position.
      // this stops the accumulated wheel delta from building up infinitely, which would 
      // otherwise cause an endless high-speed scroll after violent wheel spins.
      const maxLead = 0.08;
      const newTarget = saturateToMax(targetScroll.current + delta);
      targetScroll.current = Math.max(
        scrollProgress.current - maxLead,
        Math.min(scrollProgress.current + maxLead, newTarget)
      );
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
