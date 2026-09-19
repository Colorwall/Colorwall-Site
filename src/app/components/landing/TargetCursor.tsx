"use client";

import React, { useEffect, useRef, useState } from "react";

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hoverDuration?: number;
  parallaxOn?: boolean;
}

const TargetCursor: React.FC<TargetCursorProps> = ({}) => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent.toLowerCase()
    );
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    return isMobileUA || isCoarse || ("ontouchstart" in window && window.innerWidth <= 1024);
  });

  useEffect(() => {
    // bypass custom cursor on touch and coarse pointer devices to preserve native touch gestures
    if (isMobile) return;

    // inject global scoped style hiding the default os pointer only on desktop fine pointer devices
    const styleId = "colorwall-custom-cursor-style";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @media (hover: hover) and (pointer: fine) {
          body.custom-cursor-enabled,
          body.custom-cursor-enabled * {
            cursor: none !important;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
    document.body.classList.add("custom-cursor-enabled");

    let isVisible = false;
    let isMouseDown = false;
    let isHovering = false;
    let currentX = -100;
    let currentY = -100;
    const dot = dotRef.current;

    // update hardware translate and scale transform on state change
    const updateTransform = () => {
      if (!dot) return;
      const scale = isMouseDown ? 0.75 : isHovering ? 1.5 : 1;
      dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) scale(${scale})`;
    };

    const onMouseMove = (e: MouseEvent) => {
      currentX = e.clientX;
      currentY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        if (dot) dot.style.opacity = "1";
      }

      // detect hover over interactive elements to subtly scale the single dot
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, [role="button"], input, select, textarea, .cursor-pointer, [data-interactive="true"]'
        );
        isHovering = Boolean(interactive);
      }

      updateTransform();
    };

    const onMouseDown = () => {
      isMouseDown = true;
      updateTransform();
    };

    const onMouseUp = () => {
      isMouseDown = false;
      updateTransform();
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dot) dot.style.opacity = "0";
    };

    const onMouseEnter = () => {
      isVisible = true;
      if (dot) dot.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.body.classList.remove("custom-cursor-enabled");
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[99999] opacity-0 transition-transform duration-75 ease-out"
      style={{
        willChange: "transform, opacity",
        backgroundColor: "#ffffff",
        mixBlendMode: "difference",
      }}
    />
  );
};

export default TargetCursor;
