'use client';

import { useEffect, useRef } from 'react';
import { SCROLL_NAV_COMPLETE_AT, SCROLL_NAV_SHOW_START } from '../scrollConfig';
import { fit, cubicOut } from '../mathLusion';

export function AboutScrollNav({
  scrollProgress,
  isDark,
}: {
  scrollProgress: { current: number };
  isDark: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const r = scrollProgress.current;
      const show = fit(r, SCROLL_NAV_SHOW_START, SCROLL_NAV_SHOW_START + 0.08, 0, 1, cubicOut);
      const bar = Math.min(1, r / SCROLL_NAV_COMPLETE_AT);

      if (rootRef.current) {
        rootRef.current.style.opacity = `${show}`;
        rootRef.current.style.transform = `translateX(${(1 - show) * 24}px)`;
        rootRef.current.style.pointerEvents = show > 0.5 ? 'auto' : 'none';
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${bar})`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollProgress]);

  const textColor = isDark ? 'text-white' : 'text-black';
  const mutedColor = isDark ? 'text-white/50' : 'text-black/50';
  const lineColor = isDark ? 'bg-white/20' : 'bg-black/20';
  const barColor = isDark ? 'bg-white' : 'bg-black';

  return (
    <div
      ref={rootRef}
      className="fixed right-6 md:right-10 top-1/2 z-40 -translate-y-1/2 opacity-0 pointer-events-none"
      style={{ transition: 'opacity 0.15s' }}
    >
      <div className={`flex flex-col items-end gap-6 max-w-[200px] ${textColor}`}>
        <p className={`text-xs md:text-sm leading-snug text-right ${mutedColor}`}>
          Keep Scrolling
          <br />
          to Learn More
        </p>

        <div className="w-full text-right">
          <p className="text-lg md:text-2xl font-medium tracking-wide">About</p>
        </div>

        <div className="w-full">
          <p className={`text-[10px] md:text-xs uppercase tracking-widest mb-2 ${mutedColor}`}>
            Next Section
          </p>
          <div className={`h-[2px] w-full ${lineColor} origin-left`}>
            <div
              ref={barRef}
              className={`h-full w-full ${barColor} origin-left`}
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase tracking-widest ${mutedColor}`}>Continue</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 20 20 4m0 0v14.096M20 4H5.904"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="flex gap-3 opacity-40">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={`block w-3 h-3 ${lineColor}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
