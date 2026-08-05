"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/app/contexts/ThemeContext";

type ImmersiveMode = "none" | "cinematic" | "gallery";
type ExperienceComponent = React.ComponentType<{ onExit: () => void }>;

function clearQueryParam(key: string) {
  if (typeof window === "undefined" || !window.history.replaceState) return;
  const url = new URL(window.location.href);
  url.searchParams.delete(key);
  window.history.replaceState({}, "", url.pathname + url.search);
}

function syncBodyDataset(mode: ImmersiveMode) {
  if (typeof document === "undefined") return;
  if (mode === "cinematic") {
    document.body.dataset.cinematic = "true";
    delete document.body.dataset.fluidGallery;
  } else if (mode === "gallery") {
    document.body.dataset.fluidGallery = "true";
    delete document.body.dataset.cinematic;
  } else {
    delete document.body.dataset.cinematic;
    delete document.body.dataset.fluidGallery;
  }
  window.dispatchEvent(new Event("cinematic-change"));
}

/** Fixed portal pills — survive homepage HMR / parent rerenders. */
const ImmersiveModeTriggers = React.memo(function ImmersiveModeTriggers({
  theme,
  loading,
  onCinematic,
  onGallery,
}: {
  theme: string;
  loading: boolean;
  onCinematic: () => void;
  onGallery: () => void;
}) {
  const pill =
    theme === "dark"
      ? "bg-white/10 hover:bg-white/20 border-white/10 text-white/60 hover:text-white"
      : "bg-black/10 hover:bg-black/20 border-black/10 text-black/60 hover:text-black";

  return (
    <div
      data-immersive-triggers
      className="fixed bottom-5 left-14 z-[9990] flex items-center gap-2 pointer-events-auto"
    >
      <button
        onClick={onCinematic}
        disabled={loading}
        type="button"
        title="Cinematic Mode"
        aria-label="Toggle Cinematic Mode"
        className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-md border disabled:opacity-40 disabled:pointer-events-none ${pill}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <span className="text-[11px] font-mono tracking-wider lowercase">cinematic</span>
      </button>
      <button
        onClick={onGallery}
        disabled={loading}
        type="button"
        title="Fluid Gallery"
        aria-label="Toggle Fluid Gallery"
        className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-md border disabled:opacity-40 disabled:pointer-events-none ${pill}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12c1.5-3 6.5-3 8 0" />
          <path d="M8 12c1.5 3 6.5 3 8 0" />
        </svg>
        <span className="text-[11px] font-mono tracking-wider lowercase">gallery</span>
      </button>
    </div>
  );
});

function TriggersPortal(props: React.ComponentProps<typeof ImmersiveModeTriggers>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<ImmersiveModeTriggers {...props} />, document.body);
}

export function ImmersiveModeHost({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<ImmersiveMode>("none");
  const [Experience, setExperience] = useState<ExperienceComponent | null>(null);
  const [loading, setLoading] = useState(false);
  const prefetched = useRef({ cinematic: false, gallery: false });
  const deepLinked = useRef(false);
  const loadingRef = useRef(false);

  const loadExperience = useCallback(async (target: "cinematic" | "gallery") => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const mod =
        target === "cinematic"
          ? await import("./CinematicExperience")
          : await import("../fluid-gallery/FluidExperience");
      setExperience(() => mod.default);
      setMode(target);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const exit = useCallback(() => {
    clearQueryParam("cinematic");
    clearQueryParam("gallery");
    setMode("none");
    setExperience(null);
  }, []);

  // deep-link and handle url parameter changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("cinematic") === "true") void loadExperience("cinematic");
      else if (params.get("gallery") === "true") void loadExperience("gallery");
    };

    handleUrlChange();
    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [loadExperience]);

  // prefetch JS chunks only when browser is idle — no WebGL mount
  useEffect(() => {
    const prefetchChunks = () => {
      if (!prefetched.current.cinematic) {
        prefetched.current.cinematic = true;
        void import("./CinematicExperience");
      }
      if (!prefetched.current.gallery) {
        prefetched.current.gallery = true;
        void import("../fluid-gallery/FluidExperience");
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetchChunks, { timeout: 12000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(prefetchChunks, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    syncBodyDataset(mode);
  }, [mode]);

  if (mode !== "none" && Experience) {
    return <Experience onExit={exit} />;
  }

  return (
    <>
      {children}
      <TriggersPortal
        theme={theme}
        loading={loading}
        onCinematic={() => void loadExperience("cinematic")}
        onGallery={() => void loadExperience("gallery")}
      />
    </>
  );
}
