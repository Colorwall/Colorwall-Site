"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

interface LaxentaRunnerProps {
  isDark?: boolean;
}

// dynamic client side lottie animation component rendering the pixel running man silhouette
export function LaxentaRunner({ isDark = true }: LaxentaRunnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    // dynamically import lottie web to avoid server side rendering evaluation during nextjs build
    import("lottie-web").then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;
      const lottie = lottieModule.default || lottieModule;

      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/editorial/runman02.json",
      });
    });

    return () => {
      isMounted = false;
      animRef.current?.destroy();
    };
  }, []);

  return (
    // applies monochrome brightness filters to adapt vector silhouette across dark and light themes
    <div
      ref={containerRef}
      className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 pointer-events-none select-none transition-all duration-300 ${
        isDark ? "[filter:brightness(0)_invert(1)] opacity-90" : "[filter:brightness(0)] opacity-90"
      }`}
      aria-hidden="true"
    />
  );
}

