"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Footer } from "@/app/components/Footer";
import { Download, Loader2, Search, X, ImageIcon } from "lucide-react";
import { GradientHeading } from "../components/landing/GradientHeading";
import React from "react";
import Masonry from "react-masonry-css";

type Wallpaper = { url: string; title: string; tags: string[]; source?: "archive" | "yapude" };

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

// ─── wsrv.nl thumbnail proxy ──────────────────────────────────────────────────
// routes images through wsrv.nl for resized thumbnails in the grid,
// full-res only loads when the user clicks into the lightbox
function thumbUrl(originalUrl: string, width = 600): string {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=${width}&q=80&output=webp`;
}

// ─── auto-download helper ─────────────────────────────────────────────────────
// fetches the full-res image as a blob and triggers a real browser download
async function autoDownload(url: string, filename: string): Promise<void> {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename || "wallpaper.jpg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (err) {
        // fallback — open in new tab if fetch fails (cors etc)
        console.error("auto-download failed, opening in new tab:", err);
        window.open(url, "_blank");
    }
}


// ─── skeleton card (fixed aspect ratio, no layout shift) ──────────────────────
function Skeleton({ isDark }: { isDark: boolean }) {
    return (
        <div className="break-inside-avoid mb-4">
            <div className={`rounded-xl overflow-hidden animate-pulse ${isDark ? "bg-white/[0.04]" : "bg-zinc-200/60"}`}
                style={{ aspectRatio: "16/10" }} />
        </div>
    );
}

// ─── single wallpaper card ────────────────────────────────────────────────────
function WallpaperCard({ w, isDark, onClick }: { w: Wallpaper; isDark: boolean; onClick: () => void }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    if (error) return null;

    return (
        <div className="break-inside-avoid mb-4 group cursor-pointer" onClick={onClick}>
            {/* always keep aspect-ratio so the grid never reflows when images load */}
            <div className={`rounded-xl overflow-hidden relative ${isDark ? "bg-white/[0.03]" : "bg-zinc-100"}`}
                style={{ aspectRatio: "16/10" }}>

                {/* skeleton placeholder while loading */}
                {!loaded && (
                    <div className={`absolute inset-0 animate-pulse ${isDark ? "bg-white/[0.04]" : "bg-zinc-200/60"}`} />
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={thumbUrl(w.url)}
                    alt={w.title}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`w-full h-full object-cover block transition-all duration-500 ${loaded ? "opacity-100 group-hover:scale-[1.03]" : "opacity-0"}`}
                />

                {/* hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-xs font-semibold leading-snug line-clamp-2 mb-1">
                        {w.title}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {w.tags.slice(0, 4).map((t) => (
                            <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/15 text-white/80">{t}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── lightbox with full-res + auto download ──────────────────────────────────
function Lightbox({ w, onClose }: { w: Wallpaper; onClose: () => void }) {
    const [downloading, setDownloading] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);

    // extract a filename from the url
    const filename = w.url.split("/").pop() || "wallpaper.jpg";

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (downloading) return;
        setDownloading(true);
        await autoDownload(w.url, filename);
        setDownloading(false);
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={onClose}
        >
            {/* fixed dimensions so tags/title don't float before image loads */}
            <div className="relative w-full max-w-5xl" style={{ minHeight: "60vh" }} onClick={(e) => e.stopPropagation()}>
                {/* loading skeleton */}
                {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                    </div>
                )}
                {/* full-res image — no wsrv proxy here, we want the real thing */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={w.url}
                    alt={w.title}
                    onLoad={() => setImgLoaded(true)}
                    className={`w-full max-h-[85vh] object-contain rounded-xl transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
                />
                <div className={`absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}>
                    <p className="text-white text-sm font-semibold mb-2">{w.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {w.tags.map((t) => (
                            <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/15 text-white/80">{t}</span>
                        ))}
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-60"
                        >
                            {downloading
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...</>
                                : <><Download className="w-3.5 h-3.5" /> Download</>
                            }
                        </button>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    aria-label="close lightbox"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ─── page ─────────────────────────────────────────────────────────────────────

const masonryBreakpoints = {
    default: 2,
    640: 1 // 1 column on mobile (sm in tailwind is 640px)
};

export default function WallpaperClient({ initialItems, initialTotal, initialNextToken }: { initialItems: Wallpaper[], initialTotal: number, initialNextToken: string | null }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [items, setItems] = useState<Wallpaper[]>(initialItems);
    const [hasMore, setHasMore] = useState(initialItems.length < initialTotal);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(false);
    const [total, setTotal] = useState(initialTotal);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [lightbox, setLightbox] = useState<Wallpaper | null>(null);

    // random suggestions for empty search
    const randomSuggestions = React.useMemo(() => {
        if (!showAutocomplete || search || allTags.length === 0) return [];
        return [...allTags].sort(() => Math.random() - 0.5).slice(0, 8);
    }, [showAutocomplete, search, allTags]);

    // refs to avoid stale closures in callbacks
    const nextTokenRef = useRef<string | null>(initialNextToken);
    const currentPageRef = useRef(1);
    const loadingRef = useRef(false);
    const currentQueryRef = useRef("");

    const sentinelRef = useRef<HTMLDivElement>(null);

    // ─── debounce search input ────────────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search]);

    // ─── fetch a page (server-side search) ────────────────────────────────────
    const fetchPage = useCallback(async (page: number, query: string, reset: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
            if (query) params.set("q", query);
            // attach token for pages > 1
            if (page > 1 && nextTokenRef.current) {
                params.set("token", nextTokenRef.current);
            }

            const res = await fetch(`/api/wallpapers?${params}`);

            if (res.status === 403) {
                // token expired — quietly re-fetch page 1 to get fresh token chain
                console.warn("token expired, refreshing from page 1");
                const freshParams = new URLSearchParams({ page: "1", limit: String(PAGE_SIZE), _t: String(Date.now()) });
                if (query) freshParams.set("q", query);
                const freshRes = await fetch(`/api/wallpapers?${freshParams}`, { cache: "no-store" });
                if (freshRes.ok) {
                    const freshData = await freshRes.json();
                    nextTokenRef.current = freshData.nextToken || null;
                    // retry original page fetch with the fresh token
                    loadingRef.current = false;
                    return fetchPage(page, query, reset);
                }
                return;
            }

            if (!res.ok) throw new Error(`api returned ${res.status}`);

            const data = await res.json();
            setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
            setHasMore(data.hasMore);
            setTotal(data.total);
            nextTokenRef.current = data.nextToken || null;
            currentPageRef.current = page;
            currentQueryRef.current = query;
        } catch (err) {
            console.error("failed to fetch wallpapers:", err);
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setInitialLoad(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // no deps — uses refs for everything mutable

    // initial load tags
    useEffect(() => {
        fetch("/tags.json")
            .then(res => res.json())
            .then(tags => setAllTags(tags))
            .catch(err => console.error("failed to fetch tags.json:", err));
    }, []);

    // ─── re-fetch when debounced search changes ──────────────────────────────
    // sends search to server for full-index filtering
    const prevSearchRef = useRef("");
    useEffect(() => {
        // skip the initial empty search (handled by initial load)
        if (debouncedSearch === prevSearchRef.current) return;
        prevSearchRef.current = debouncedSearch;

        // reset pagination and fetch from page 1 with new query
        nextTokenRef.current = null;
        currentPageRef.current = 1;
        setHasMore(true);
        fetchPage(1, debouncedSearch, true);
    }, [debouncedSearch, fetchPage]);

    // infinite scroll observer — stable deps, no loading in deps
    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0].isIntersecting) return;
                // check refs directly — no stale closures
                if (!loadingRef.current) {
                    const nextPage = currentPageRef.current + 1;
                    fetchPage(nextPage, currentQueryRef.current, false);
                }
            },
            { rootMargin: "3000px" }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [fetchPage]);

    // close lightbox on escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightbox(null);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <div
            className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#080809] text-zinc-100" : "bg-slate-50 text-zinc-900"}`}
            style={{ fontFamily: "'DM Sans', 'Geist', sans-serif" }}
        >
            {/* ─── subtle ambient bg ─── */}
            <div className={`pointer-events-none fixed inset-0 z-0 ${isDark ? "opacity-[0.03]" : "opacity-[0.04]"}`}
                style={{
                    backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAABJz2zMAAAACHRSTlMzMzMzMzMzM8A/4eYAAACbSURBVDjLpZGxDQMwDASJ/y18q0L5K8zM4E5AAXqSBM4+M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO/8Bv9B6wT4CxcwAAAAASUVORK5CYII=")`,
                    backgroundRepeat: "repeat", backgroundSize: "100px 100px",
                }} />
            <div className={`fixed top-0 left-0 right-0 h-px z-50 ${isDark ? "bg-white/[0.06]" : "bg-zinc-200"}`} />

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">

                {/* ─── header (staircase, gradient) ─── */}
                <div className="mb-10">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-wide leading-[1.1] mb-3">
                        <GradientHeading text="Desktop" theme="dark" as="span" className="block" />
                        <span className="block pl-8 sm:pl-14 md:pl-20">
                            <GradientHeading text="Wallpapers" theme="dark" as="span" className="inline-block" />
                        </span>
                    </h1>
                    <div className={`flex items-center gap-2 text-xs pl-1 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        <a href="/" className={`${isDark ? "hover:text-white" : "hover:text-zinc-800"} transition-colors`}>Home</a>
                        <span className={isDark ? "text-zinc-600" : "text-zinc-300"}>/</span>
                        <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>Desktop Wallpapers</span>
                        {total > 0 && (
                            <>
                                <span className={isDark ? "text-zinc-600" : "text-zinc-300"}>·</span>
                                <span className={`font-mono ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>{total.toLocaleString()}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* ─── divider ─── */}
                <div className={`h-px mb-6 ${isDark ? "bg-white/[0.08]" : "bg-zinc-200"}`} />

                {/* ─── tag bar (pill chips, ranked by frequency) ─── */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    <button
                        onClick={() => setSearch("")}
                        className={`text-[11px] font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full transition-all duration-200 ${!search
                            ? isDark
                                ? "bg-white text-zinc-900"
                                : "bg-zinc-900 text-white"
                            : isDark
                                ? "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14] hover:text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                            }`}
                    >
                        Show All
                    </button>
                    {allTags.slice(0, 40).map((t) => (
                        <button
                            key={t}
                            onClick={() => {
                                // toggle: click again to clear
                                if (search.toLowerCase() === t.toLowerCase()) {
                                    setSearch("");
                                } else {
                                    setSearch(t);
                                }
                            }}
                            className={`text-[11px] font-semibold uppercase tracking-wide px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 ${search.toLowerCase() === t.toLowerCase()
                                ? isDark
                                    ? "bg-white text-zinc-900"
                                    : "bg-zinc-900 text-white"
                                : isDark
                                    ? "bg-white/[0.08] text-zinc-300 hover:bg-white/[0.14] hover:text-white"
                                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* ─── search ─── */}
                <div className={`relative w-full mb-8 rounded-full border transition-colors ${isDark ? "border-white/[0.12] bg-white/[0.06] focus-within:border-white/25 focus-within:bg-white/[0.08]" : "border-zinc-200 bg-zinc-50 focus-within:border-zinc-400 focus-within:bg-white"}`}>
                    <Search className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? "text-zinc-400" : "text-zinc-400"}`} />
                    <input
                        type="text"
                        placeholder="search wallpapers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setShowAutocomplete(true)}
                        onBlur={() => { setTimeout(() => setShowAutocomplete(false), 150); }}
                        aria-label="search wallpapers"
                        className={`w-full pl-14 pr-14 py-5 bg-transparent text-base outline-none rounded-full ${isDark ? "text-white placeholder:text-zinc-500" : "text-zinc-900 placeholder:text-zinc-400"}`}
                    />
                    {search && (
                        <button onClick={() => setSearch("")} aria-label="clear search"
                            className={`absolute right-6 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-400 hover:text-zinc-800"} transition-colors`}>
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* server-side search indicator */}
                    {search && loading && (
                        <div className="absolute right-14 top-1/2 -translate-y-1/2">
                            <Loader2 className={`w-4 h-4 animate-spin ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                        </div>
                    )}
                    
                    {/* autocomplete dropdown */}
                    {showAutocomplete && (search || randomSuggestions.length > 0) && (
                        <div className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border p-2 z-[60] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 ${isDark ? "bg-[#0d1117] border-[#30363d]" : "bg-white border-zinc-200"}`}>
                            {!search && <h4 className={`text-[10px] font-bold uppercase tracking-widest px-4 pt-3 pb-2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Random Suggestions</h4>}
                            
                            {(search ? allTags.filter(t => t.toLowerCase().includes(search.toLowerCase())).slice(0, 8) : randomSuggestions).map(t => (
                                <button
                                    key={t}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        setSearch(t);
                                        setShowAutocomplete(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-colors font-medium flex items-center justify-between group ${isDark ? "text-zinc-300 hover:bg-white/5" : "text-zinc-700 hover:bg-zinc-100"}`}
                                >
                                    <span>{t}</span>
                                    <span className={`text-[10px] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Filter Tag</span>
                                </button>
                            ))}
                            {search && allTags.filter(t => t.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                                <div className={`px-4 py-3 text-sm text-center ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                    No matching tags found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ─── search info bar ─── */}
                {debouncedSearch && !loading && items.length > 0 && (
                    <div className={`flex items-center gap-2 mb-6 text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        <Search className="w-3.5 h-3.5" />
                        <span>
                            showing <span className="font-mono font-semibold">{total.toLocaleString()}</span> results for &ldquo;<span className={`font-medium ${isDark ? "text-white" : "text-zinc-800"}`}>{debouncedSearch}</span>&rdquo;
                        </span>
                        <button onClick={() => setSearch("")}
                            className={`ml-2 px-2 py-0.5 rounded-md transition-colors ${isDark ? "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"}`}>
                            clear
                        </button>
                    </div>
                )}

                {/* ─── skeleton initial state ─── */}
                {initialLoad && (
                    <Masonry
                        breakpointCols={masonryBreakpoints}
                        className="flex w-auto -ml-4"
                        columnClassName="pl-4 bg-clip-padding"
                    >
                        {Array.from({ length: 20 }).map((_, i) => (
                            <Skeleton key={i} isDark={isDark} />
                        ))}
                    </Masonry>
                )}

                {/* ─── masonry grid ─── */}
                {!initialLoad && items.length > 0 && (
                    <Masonry
                        breakpointCols={masonryBreakpoints}
                        className="flex w-auto -ml-4"
                        columnClassName="pl-4 bg-clip-padding"
                    >
                        {items.map((w, i) => (
                            <WallpaperCard key={`${w.url}-${i}`} w={w} isDark={isDark} onClick={() => setLightbox(w)} />
                        ))}
                    </Masonry>
                )}

                {/* ─── empty state ─── */}
                {!initialLoad && items.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <ImageIcon className={`w-12 h-12 mb-4 ${isDark ? "text-zinc-700" : "text-zinc-300"}`} />
                        <p className={`text-lg font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>no wallpapers found</p>
                        <p className={`text-sm ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>try a different tag or search term</p>
                    </div>
                )}

                {/* ─── loading more skeletons ─── */}
                {loading && !initialLoad && (
                    <Masonry
                        breakpointCols={masonryBreakpoints}
                        className="flex w-auto -ml-4 mt-4"
                        columnClassName="pl-4 bg-clip-padding"
                    >
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={`load-${i}`} isDark={isDark} />
                        ))}
                    </Masonry>
                )}

                {/* ─── infinite scroll sentinel ─── */}
                <div ref={sentinelRef} className="h-1" />

                {/* ─── end message ─── */}
                {!hasMore && items.length > 0 && !initialLoad && (
                    <p className={`text-center text-xs font-mono py-8 ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
                        — thats all {total.toLocaleString()} wallpapers · dual sourced from archive + yapude · scraped with wreq + rust bypassing cf —
                    </p>
                )}
            </main>

            {/* ─── lightbox ─── */}
            {lightbox && <Lightbox w={lightbox} onClose={() => setLightbox(null)} />}

            <Footer theme={theme as "dark" | "light"} />
        </div>
    );
}
