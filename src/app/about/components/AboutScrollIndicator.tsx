'use client';

import { useEffect, useRef } from 'react';
import { SCROLL_MAX } from '../scrollConfig';

const FADE_DELAY_MS = 500;

export function AboutScrollIndicator({
  scrollProgress,
  isDark,
}: {
  scrollProgress: { current: number };
  isDark: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const lastScroll = useRef(scrollProgress.current);
  const lastActive = useRef(performance.now());

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const r = scrollProgress.current;
      const now = performance.now();

      if (Math.abs(r - lastScroll.current) > 0.0001) {
        lastActive.current = now;
        lastScroll.current = r;
      }

      const active = now - lastActive.current < FADE_DELAY_MS;
      const progress = Math.min(1, r / SCROLL_MAX);

      if (rootRef.current) {
        rootRef.current.style.opacity = active ? '1' : '0';
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleY(${progress})`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollProgress]);

  const trackColor = isDark ? 'bg-white/15' : 'bg-black/15';
  const barColor = isDark ? 'bg-white' : 'bg-black';

  return (
    <div
      ref={rootRef}
      className="fixed right-2 top-1/2 z-50 -translate-y-1/2 h-[120px] w-[3px] opacity-0 pointer-events-none transition-opacity duration-300"
    >
      <div className={`absolute inset-0 ${trackColor}`} />
      <div
        ref={barRef}
        className={`absolute bottom-0 left-0 w-full ${barColor} origin-bottom`}
        style={{ height: '100%', transform: 'scaleY(0)' }}
      />
    </div>
  );
}
