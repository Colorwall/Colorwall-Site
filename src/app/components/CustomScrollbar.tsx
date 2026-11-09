"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/lib/utils";

// lusion creative studio inspired interactive custom scrollbar
export function CustomScrollbar() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const trackRef = useRef<HTMLDivElement>(null);
  const [thumbHeight, setThumbHeight] = useState(60);
  const [thumbTop, setThumbTop] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartYRef = useRef(0);
  const dragStartScrollRef = useRef(0);

  // awaken scrollbar visibility and schedule fade out timer when scrolling ceases
  const wakeScrollbar = useCallback(() => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 1800);
  }, []);

  // update thumb geometry and normalized scroll progression
  const updateScroll = useCallback(() => {
    if (!trackRef.current) return;

    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const maxScroll = docHeight - winHeight;

    if (maxScroll <= 0) return;

    const trackHeight = trackRef.current.clientHeight;
    // dynamically size thumb relative to viewport ratio clamped within ergonomic bounds
    const computedThumbHeight = Math.max(
      40,
      Math.min(trackHeight * 0.4, (winHeight / docHeight) * trackHeight)
    );
    setThumbHeight(computedThumbHeight);

    const availableTrack = trackHeight - computedThumbHeight;
    const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
    setScrollProgress(Math.round(progress * 100));
    setThumbTop(progress * availableTrack);
  }, []);

  // listen to window scroll and resize events
  useEffect(() => {
    const handleScroll = () => {
      wakeScrollbar();
      updateScroll();
    };

    const handleResize = () => {
      updateScroll();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [wakeScrollbar, updateScroll]);

  // handle direct track clicks to jump smoothly to targeted position
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = rect.height;
    const targetRatio = Math.max(0, Math.min(1, clickY / trackHeight));
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const maxScroll = docHeight - winHeight;

    window.scrollTo({
      top: targetRatio * maxScroll,
      behavior: "smooth",
    });
  };

  // initialize dragging physics when pointer engages the thumb
  const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    wakeScrollbar();

    dragStartYRef.current = e.clientY;
    dragStartScrollRef.current = window.scrollY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current) return;
      const trackHeight = trackRef.current.clientHeight;
      const availableTrack = trackHeight - thumbHeight;
      if (availableTrack <= 0) return;

      const deltaY = moveEvent.clientY - dragStartYRef.current;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = docHeight - winHeight;

      const scrollDelta = (deltaY / availableTrack) * maxScroll;
      window.scrollTo({
        top: Math.max(0, Math.min(maxScroll, dragStartScrollRef.current + scrollDelta)),
        behavior: "auto",
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
        wakeScrollbar();
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden md:flex fixed right-2 sm:right-3.5 top-8 bottom-8 z-[9999] items-center pointer-events-auto select-none"
      aria-hidden="true"
    >
      {/* interactive vertical track with hover hit area */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className={cn(
          "relative h-full transition-all duration-300 flex items-center justify-center cursor-pointer",
          isHovered || isDragging ? "w-4" : "w-2"
        )}
      >
        {/* subtle center background rail line */}
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isHovered || isDragging
              ? "w-[3px] opacity-100"
              : "w-[2px] opacity-40",
            isDark ? "bg-white/10" : "bg-black/10"
          )}
        />

        {/* custom floating scroll thumb with lusion inspired glow and expansion */}
        <div
          onPointerDown={handleThumbPointerDown}
          style={{
            height: `${thumbHeight}px`,
            transform: `translate3d(0, ${thumbTop}px, 0)`,
          }}
          className={cn(
            "absolute top-0 rounded-full cursor-grab active:cursor-grabbing transition-all duration-150 ease-out will-change-transform flex items-center justify-center",
            isHovered || isDragging
              ? "w-[8px] sm:w-[9px] shadow-[0_0_16px_rgba(112,214,255,0.7)]"
              : "w-[4px] sm:w-[5px] shadow-[0_0_8px_rgba(255,255,255,0.25)]",
            isVisible || isHovered || isDragging ? "opacity-100" : "opacity-25",
            isDark
              ? "bg-gradient-to-b from-[#ffffff] via-[#c3caff] to-[#70d6ff]"
              : "bg-gradient-to-b from-[#1b1f48] via-[#3d4585] to-[#545ebb]"
          )}
        >
          {/* floating percentage readout pill shown on hover or drag */}
          {(isHovered || isDragging) && (
            <div
              className={cn(
                "absolute right-full mr-3.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider shadow-lg pointer-events-none whitespace-nowrap transition-opacity duration-200",
                isDark
                  ? "bg-[#1b1f48]/90 text-white border border-white/20 backdrop-blur-md"
                  : "bg-white/95 text-[#13163a] border border-black/10 backdrop-blur-md"
              )}
            >
              {scrollProgress}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

