'use client';

import { ReactNode, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { motion, useScroll, useVelocity, useSpring, useTransform } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function SmoothScroller({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    setLenis(lenisInstance);

    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);

    return () => {
      lenisInstance.destroy();
    };
  }, []);

  // Reset scroll on route change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  return (
    <div className="w-full min-h-screen origin-center bg-[var(--background)]">
      {children}
    </div>
  );
}
