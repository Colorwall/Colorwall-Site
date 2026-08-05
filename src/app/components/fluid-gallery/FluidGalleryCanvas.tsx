"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { FLUID_VIDEO_URLS } from "./slides";

export type FluidGalleryHandle = {
  step: (dir: 1 | -1) => void;
};

type EngineInstance = {
  update: () => void;
  render: () => void;
  resize: () => void;
  onScroll: (deltaY: number) => void;
  step: (dir: 1 | -1) => void;
  dispose: () => void;
  currentSlideIndex: number;
};

type Props = {
  startAt?: number;
  onChange?: (index: number) => void;
  onReady?: () => void;
  className?: string;
};

export const FluidGalleryCanvas = forwardRef<FluidGalleryHandle, Props>(
  function FluidGalleryCanvas({ startAt = 0, onChange, onReady, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<EngineInstance | null>(null);
    const currentRef = useRef(startAt);
    const onChangeRef = useRef(onChange);
    const onReadyRef = useRef(onReady);
    const touchY = useRef<number | null>(null);

    onChangeRef.current = onChange;
    onReadyRef.current = onReady;

    useImperativeHandle(ref, () => ({
      step: (dir) => engineRef.current?.step(dir),
    }));

    const bindSize = useCallback(() => {
      const el = containerRef.current;
      const canvas = canvasRef.current;
      if (!el || !canvas) return;
      const { clientWidth: w, clientHeight: h } = el;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.width = w;
      canvas.height = h;
      engineRef.current?.resize();
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let cancelled = false;
      let raf = 0;
      let readyFallback = 0;

      bindSize();

      void import("./FluidGalleryEngine").then(({ FluidGalleryEngine }) => {
        if (cancelled || !canvasRef.current) return;

        const engine = new FluidGalleryEngine({
          canvas: canvasRef.current,
          slides: FLUID_VIDEO_URLS,
          current: startAt,
          onReady: () => onReadyRef.current?.(),
        });
        engineRef.current = engine;
        currentRef.current = startAt;

        const tick = () => {
          if (cancelled) return;
          engine.update();
          engine.render();
          if (currentRef.current !== engine.activeIndex) {
            currentRef.current = engine.activeIndex;
            onChangeRef.current?.(currentRef.current);
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        readyFallback = window.setTimeout(() => onReadyRef.current?.(), 1800);
      });

      const onResize = () => bindSize();
      window.addEventListener("resize", onResize);

      const ro = new ResizeObserver(() => bindSize());
      if (containerRef.current) ro.observe(containerRef.current);

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        window.clearTimeout(readyFallback);
        window.removeEventListener("resize", onResize);
        ro.disconnect();
        engineRef.current?.dispose();
        engineRef.current = null;
      };
    }, [bindSize, startAt]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        engineRef.current?.onScroll(e.deltaY);
      };

      const onTouchStart = (e: TouchEvent) => {
        touchY.current = e.touches[0]?.clientY ?? null;
      };

      const onTouchMove = (e: TouchEvent) => {
        if (touchY.current == null) return;
        const y = e.touches[0]?.clientY ?? touchY.current;
        const delta = touchY.current - y;
        touchY.current = y;
        engineRef.current?.onScroll(delta * 2.5);
        e.preventDefault();
      };

      const onTouchEnd = () => {
        touchY.current = null;
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend", onTouchEnd);

      return () => {
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
      };
    }, []);

    return (
      <div ref={containerRef} className={className ?? "absolute inset-0"}>
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    );
  }
);
