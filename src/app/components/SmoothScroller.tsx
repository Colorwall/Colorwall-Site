"use client";

import React, { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

// maximum pixels the scroll target can advance per single wheel tick
const MAX_DELTA = 400;

// multiplier applied to raw wheel delta y before clamping for rapid momentum
const SCROLL_MULTIPLIER = 1.5;

// exponential decay factor per frame for smooth momentum glide
const LERP_FACTOR = 0.12;

// pixel threshold below which we snap to target to prevent infinite asymptotic decay
const SNAP_THRESHOLD = 0.5;

export function SmoothScroller({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // bypass custom wheel interception on touch devices to preserve native gesture physics
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let rafId: number;
    let isOurScroll = false;

    const getMaxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const onWheel = (e: WheelEvent) => {
      // allow native wheel inside nested scrollable containers with overflow auto
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-lenis-prevent], .overflow-y-auto, textarea")) {
        return;
      }

      e.preventDefault();

      // amplify wheel delta and clamp to max delta threshold
      const amplified = e.deltaY * SCROLL_MULTIPLIER;
      const clampedDelta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, amplified));

      targetScroll = Math.max(
        0,
        Math.min(getMaxScroll(), targetScroll + clampedDelta)
      );
    };

    // synchronize target when user scrubs scrollbar or navigates via keyboard
    const onScroll = () => {
      if (isOurScroll) {
        isOurScroll = false;
        return;
      }
      targetScroll = window.scrollY;
      currentScroll = window.scrollY;
    };

    const loop = () => {
      const dist = targetScroll - currentScroll;

      if (Math.abs(dist) > SNAP_THRESHOLD) {
        currentScroll += dist * LERP_FACTOR;

        if (Math.abs(targetScroll - currentScroll) < SNAP_THRESHOLD) {
          currentScroll = targetScroll;
        }

        isOurScroll = true;
        window.scrollTo(0, currentScroll);
      }

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // reset scroll position and release any lingering locks on route change
  useEffect(() => {
    if (typeof window !== "undefined" && pathname !== "/") {
      delete document.body.dataset.cinematic;
      delete document.body.dataset.fluidGallery;
      delete document.body.dataset.showcaseLocked;
      window.dispatchEvent(new Event("cinematic-change"));
    }
  }, [pathname]);

  return <>{children}</>;
}
