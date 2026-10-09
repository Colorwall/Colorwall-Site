"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

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

export function ImmersiveModeHost({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ImmersiveMode>("none");
  const [Experience, setExperience] = useState<ExperienceComponent | null>(null);
  const prefetched = useRef({ cinematic: false, gallery: false });
  const loadingRef = useRef(false);

  const loadExperience = useCallback(async (target: "cinematic" | "gallery") => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      // cinematic route loads the interactive fluid wallpaper experience while gallery loads the 3d scene
      const mod =
        target === "cinematic"
          ? await import("../fluid-gallery/FluidExperience")
          : await import("./CinematicExperience");
      setExperience(() => mod.default);
      setMode(target);
    } finally {
      loadingRef.current = false;
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

  // prefetch js chunks only when browser is idle without mounting webgl
  useEffect(() => {
    const prefetchChunks = () => {
      if (!prefetched.current.cinematic) {
        prefetched.current.cinematic = true;
        void import("../fluid-gallery/FluidExperience");
      }
      if (!prefetched.current.gallery) {
        prefetched.current.gallery = true;
        void import("./CinematicExperience");
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
    return () => {
      // guarantee cleanup of all cinematic and gallery flags when navigating away
      syncBodyDataset("none");
      clearQueryParam("cinematic");
      clearQueryParam("gallery");
    };
  }, [mode]);

  if (mode !== "none" && Experience) {
    return <Experience onExit={exit} />;
  }

  return <>{children}</>;
}
