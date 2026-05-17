"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Footer } from "@/app/components/Footer";
import { Download, Search, X, Loader2, ImageIcon } from "lucide-react";

type Wallpaper = { url: string; title: string; tags: string[] };

const PAGE_SIZE = 40;

export default function WallpapersPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [items, setItems] = useState<Wallpaper[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [total, setTotal] = useState(0);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [activeTag, setActiveTag] = useState("");
    const [search, setSearch] = useState("");
    const [lightbox, setLightbox] = useState<Wallpaper | null>(null);

    const sentinelRef = useRef<HTMLDivElement>(null);

    // ─── fetch page ───────────────────────────────────────────────────────────
    const fetchPage = useCallback(async (p: number, tag: string, reset: boolean) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) });
            if (tag) params.set("tag", tag);
            const res = await fetch(`/api/wallpapers?${params}`);
            const data = await res.json();
            setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
            setHasMore(data.hasMore);
            setTotal(data.total);
            if (data.tags) setAllTags(data.tags);
        } catch (err) {
            console.error("failed to fetch wallpapers:", err);
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, []);

    // initial load
    useEffect(() => {
        fetchPage(1, "", true);
    }, [fetchPage]);

    // tag change
    useEffect(() => {
        setPage(1);
        fetchPage(1, activeTag, true);
    }, [activeTag, fetchPage]);

    // infinite scroll observer
    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage((p) => {
                        const next = p + 1;
                        fetchPage(next, activeTag, false);
                        return next;
                    });
                }
            },
            { rootMargin: "600px" }
        );
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading, activeTag, fetchPage]);

    // filter by search (client-side on loaded items)
    const displayed = search
        ? items.filter((w) => w.title.toLowerCase().includes(search.toLowerCase()))
        : items;

    return (
        <div
            className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#080809] text-zinc-100" : "bg-slate-50 text-zinc-900"}`}
            style={{ fontFamily: "'DM Sans', 'Geist', sans-serif" }}
        >
            {/* ─── ambient background ─── */}
            <div className={`pointer-events-none fixed inset-0 z-0 ${isDark ? "opacity-[0.035]" : "opacity-[0.05]"}`}
                style={{
                    backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAABJz2zMAAAACHRSTlMzMzMzMzMzM8A/4eYAAACbSURBVDjLpZGxDQMwDASJ/y18q0L5K8zM4E5AAXqSBM4+M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO/8Bv9B6wT4CxcwAAAAASUVORK5CYII=")`,
                    backgroundRepeat: "repeat", backgroundSize: "100px 100px",
                }} />
            <div className="pointer-events-none fixed top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full opacity-40"
                style={{ background: `radial-gradient(circle, ${isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)"} 0%, transparent 70%)` }} />
            <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30"
                style={{ background: `radial-gradient(circle, ${isDark ? "rgba(139,92,246,0.10)" : "rgba(139,92,246,0.06)"} 0%, transparent 70%)` }} />
            <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent z-50" />

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* ─── header ─── */}
                <div className="mb-12">
                    <p className={`text-[11px] font-mono font-bold uppercase tracking-[0.25em] mb-5 ${isDark ? "text-cyan-400/70" : "text-cyan-600"}`}>
                        <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-2 align-middle" />
                        Wallpaper Archive
                    </p>
                    <h1 className={`text-[clamp(2.5rem,6vw,5rem)] font-black tracking-[-0.04em] leading-[0.85] mb-4 ${isDark ? "text-white" : "text-zinc-900"}`}>
                        Free wallpapers,
                        <br />
                        <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                            no strings attached.
                        </span>
                    </h1>
                    <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                        {total > 0 ? `${total.toLocaleString()} wallpapers` : "loading..."} scraped from the web, stored on GitHub, served here. all public domain / CC0.
                        {" "}
                        <a href="https://github.com/LaxentaInc/Wallpaper-Archive" target="_blank" rel="noopener noreferrer"
                            className={`font-mono text-sm ${isDark ? "text-cyan-500/60 hover:text-cyan-400" : "text-cyan-600/50 hover:text-cyan-600"} transition-colors`}>
                            source repo →
                        </a>
                    </p>
                </div>

                {/* ─── controls ─── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                    {/* search */}
                    <div className={`relative flex-1 max-w-md rounded-xl border transition-colors ${isDark ? "border-white/10 bg-white/[0.03] focus-within:border-white/20" : "border-zinc-200 bg-white focus-within:border-zinc-300"}`}>
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
                        <input
                            type="text"
                            placeholder="search loaded wallpapers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="search wallpapers"
                            className={`w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none ${isDark ? "text-white placeholder:text-zinc-600" : "text-zinc-900 placeholder:text-zinc-400"}`}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} aria-label="clear search" className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-800"}`}>
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* tag filter */}
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => setActiveTag("")}
                            className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${!activeTag
                                ? isDark ? "bg-white/10 text-white" : "bg-zinc-900 text-white"
                                : isDark ? "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                                }`}
                        >
                            All
                        </button>
                        {allTags.slice(0, 20).map((t) => (
                            <button
                                key={t}
                                onClick={() => setActiveTag(t === activeTag ? "" : t)}
                                className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${t === activeTag
                                    ? isDark ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-violet-100 text-violet-700 border border-violet-300"
                                    : isDark ? "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── initial loading state ─── */}
                {initialLoad && (
                    <div className="flex flex-col items-center justify-center py-40">
                        <Loader2 className={`w-8 h-8 animate-spin mb-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
                        <p className={`text-sm ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>loading wallpaper archive...</p>
                    </div>
                )}

                {/* ─── masonry grid ─── */}
                {!initialLoad && (
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3">
                        {displayed.map((w, i) => (
                            <div
                                key={`${w.url}-${i}`}
                                className="break-inside-avoid mb-3 group cursor-pointer"
                                onClick={() => setLightbox(w)}
                            >
                                <div className={`rounded-xl overflow-hidden relative ${isDark ? "bg-white/[0.03]" : "bg-zinc-100"}`}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={w.url}
                                        alt={w.title}
                                        loading="lazy"
                                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                    {/* hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                        <p className="text-white text-[11px] font-semibold leading-snug line-clamp-2 mb-1">
                                            {w.title}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {w.tags.slice(0, 3).map((t) => (
                                                <span key={t} className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/15 text-white/80">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── empty state ─── */}
                {!initialLoad && displayed.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <ImageIcon className={`w-12 h-12 mb-4 ${isDark ? "text-zinc-700" : "text-zinc-300"}`} />
                        <p className={`text-lg font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>no wallpapers found</p>
                        <p className={`text-sm ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>try a different tag or search term</p>
                    </div>
                )}

                {/* ─── loading more ─── */}
                {loading && !initialLoad && (
                    <div className="flex justify-center py-8">
                        <Loader2 className={`w-5 h-5 animate-spin ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
                    </div>
                )}

                {/* ─── sentinel for infinite scroll ─── */}
                <div ref={sentinelRef} className="h-1" />

                {/* ─── end message ─── */}
                {!hasMore && items.length > 0 && (
                    <p className={`text-center text-xs font-mono py-8 ${isDark ? "text-zinc-700" : "text-zinc-400"}`}>
                        — thats all {total.toLocaleString()} wallpapers. scraped with love using wreq + rust bypassing cf xd —
                    </p>
                )}
            </main>

            {/* ─── lightbox ─── */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
                    onClick={() => setLightbox(null)}
                >
                    <div className="max-w-5xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lightbox.url} alt={lightbox.title} className="max-w-full max-h-[85vh] object-contain rounded-xl" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                            <p className="text-white text-sm font-semibold mb-2">{lightbox.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {lightbox.tags.map((t) => (
                                    <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/15 text-white/80">{t}</span>
                                ))}
                                <a
                                    href={lightbox.url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download className="w-3.5 h-3.5" /> Download
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={() => setLightbox(null)}
                            aria-label="close lightbox"
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <Footer theme={theme as "dark" | "light"} />
        </div>
    );
}
