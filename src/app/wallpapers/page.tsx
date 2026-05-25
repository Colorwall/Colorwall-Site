"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Footer } from "@/app/components/Footer";
import { Download, Loader2, Search, X, ImageIcon } from "lucide-react";
import { GradientHeading } from "../components/landing/GradientHeading";

type Wallpaper = { url: string; title: string; tags: string[]; source?: "archive" | "yapude" };

const PAGE_SIZE = 20;

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

// ─── fuzzy search helper ──────────────────────────────────────────────────────
// Returns match score: 4 (exact title), 3 (exact tag), 2 (fuzzy title), 1 (fuzzy tag), 0 (no match)
function getMatchScore(query: string, text: string, isTag: boolean) {
    if (!query) return 0;
    const q = query.toLowerCase();
    const t = text.toLowerCase();

    // direct match
    if (t.includes(q)) return isTag ? 3 : 4;

    // fuzzy match (subsequence)
    let qIdx = 0;
    let tIdx = 0;
    while (qIdx < q.length && tIdx < t.length) {
        if (q[qIdx] === t[tIdx]) {
            qIdx++;
        }
        tIdx++;
    }
    return qIdx === q.length ? (isTag ? 1 : 2) : 0;
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
            <div className={`rounded-xl overflow-hidden relative ${isDark ? "bg-white/[0.03]" : "bg-zinc-100"}`}
                style={{ aspectRatio: loaded ? undefined : "16/10" }}>

                {/* skeleton placeholder while loading */}
                {!loaded && (
                    <div className={`absolute inset-0 animate-pulse ${isDark ? "bg-white/[0.04]" : "bg-zinc-200/60"}`} />
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={thumbUrl(w.url)}
                    alt={w.title}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    className={`w-full h-auto block transition-all duration-500 ${loaded ? "opacity-100 group-hover:scale-[1.03]" : "opacity-0"}`}
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
            <div className="max-w-5xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
                {/* full-res image — no wsrv proxy here, we want the real thing */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.url} alt={w.title} className="max-w-full max-h-[85vh] object-contain rounded-xl" />
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
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

export default function WallpapersPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [items, setItems] = useState<Wallpaper[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [total, setTotal] = useState(0);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [activeTag, setActiveTag] = useState("");
    const [search, setSearch] = useState("");
    const [lightbox, setLightbox] = useState<Wallpaper | null>(null);

    // refs to avoid stale closures in callbacks
    const nextTokenRef = useRef<string | null>(null);
    const currentPageRef = useRef(1);
    const loadingRef = useRef(false);
    const activeTagRef = useRef("");

    const sentinelRef = useRef<HTMLDivElement>(null);

    // keep tag ref in sync
    useEffect(() => { activeTagRef.current = activeTag; }, [activeTag]);

    // ─── fetch a page ─────────────────────────────────────────────────────────
    // uses refs for loading guard so the callback identity never changes
    const fetchPage = useCallback(async (page: number, tag: string, reset: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);

        try {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
            if (tag) params.set("tag", tag);
            // attach token for pages > 1
            if (page > 1 && nextTokenRef.current) {
                params.set("token", nextTokenRef.current);
            }

            const res = await fetch(`/api/wallpapers?${params}`);

            if (res.status === 403) {
                // token expired — silently re-fetch page 1 to get fresh token chain
                console.warn("token expired, refreshing from page 1");
                nextTokenRef.current = null;
                currentPageRef.current = 1;

                const freshParams = new URLSearchParams({ page: "1", limit: String(PAGE_SIZE) });
                if (tag) freshParams.set("tag", tag);
                const freshRes = await fetch(`/api/wallpapers?${freshParams}`);
                if (freshRes.ok) {
                    const freshData = await freshRes.json();
                    // don't reset items — just update the token so next scroll works
                    nextTokenRef.current = freshData.nextToken || null;
                    currentPageRef.current = 1;
                    setHasMore(freshData.hasMore);
                    if (freshData.tags) setAllTags(freshData.tags);
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
            if (data.tags) setAllTags(data.tags);
        } catch (err) {
            console.error("failed to fetch wallpapers:", err);
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setInitialLoad(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // no deps — uses refs for everything mutable

    // initial load
    useEffect(() => {
        fetchPage(1, "", true);
    }, [fetchPage]);

    // tag change — reset everything
    const handleTagChange = useCallback((tag: string) => {
        setActiveTag(tag);
        setItems([]);
        setHasMore(true);
        nextTokenRef.current = null;
        currentPageRef.current = 1;
        loadingRef.current = false; // force unlock in case it was stuck
        setLoading(false);
        setInitialLoad(true);
        // slight delay to let react flush state, then fetch fresh
        setTimeout(() => {
            fetchPage(1, tag, true);
        }, 0);
    }, [fetchPage]);

    // infinite scroll observer — stable deps, no loading in deps
    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(
            () => {
                // check refs directly — no stale closures
                if (!loadingRef.current) {
                    const nextPage = currentPageRef.current + 1;
                    fetchPage(nextPage, activeTagRef.current, false);
                }
            },
            { rootMargin: "600px" }
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

    // client-side search filter with categorization
    const displayGroups = (() => {
        const query = search.trim();
        if (!query) return { all: items };

        const scored = items.map(w => {
            let score = getMatchScore(query, w.title, false);
            if (score === 0) {
                for (const tag of w.tags) {
                    const tagScore = getMatchScore(query, tag, true);
                    if (tagScore > score) score = tagScore;
                }
            }
            return { w, score };
        }).filter(item => item.score > 0);

        // Sort by score descending (best matches first)
        scored.sort((a, b) => b.score - a.score);

        const exact = scored.filter(i => i.score >= 3).map(i => i.w);
        const fuzzy = scored.filter(i => i.score < 3).map(i => i.w);

        return { exact, fuzzy };
    })();

    const hasResults = search
        ? (displayGroups.exact!.length > 0 || displayGroups.fuzzy!.length > 0)
        : displayGroups.all!.length > 0;

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
                        <GradientHeading text="Static Wallpapers," theme="dark" as="span" className="inline-block px-1" />
                        <br />
                        <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-aqua-400 bg-clip-text text-transparent">
                            No strings attached!..
                        </span>
                    </h1>
                    <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                        {total > 0 ? `${total.toLocaleString()} wallpapers` : "loading..."} from multiple sources. We do not claim ownership, The repository is under Creative Commons Uni, If someone owns copyright to something and wishes it removed, just email or messages us! we are a small team!
                        {" "}
                        <a href="https://github.com/LaxentaInc/Wallpaper-Archive" target="_blank" rel="noopener noreferrer"
                            className={`font-mono text-sm ${isDark ? "text-cyan-500/60 hover:text-cyan-400" : "text-cyan-600/50 hover:text-cyan-600"} transition-colors`}>
                            Source1 →
                        </a>
                        {" "}
                        <a href="https://github.com/yapude/wallpapers" target="_blank" rel="noopener noreferrer"
                            className={`font-mono text-sm ${isDark ? "text-violet-500/60 hover:text-violet-400" : "text-violet-600/50 hover:text-violet-600"} transition-colors`}>
                            Source2 →
                        </a>
                    </p>
                </div>

                {/* ─── controls ─── */}
                <div className="flex flex-col gap-4 mb-10">
                    {/* search — full width */}
                    <div className={`relative w-full rounded-xl border transition-colors ${isDark ? "border-white/10 bg-white/[0.03] focus-within:border-white/20" : "border-zinc-200 bg-white focus-within:border-zinc-300"}`}>
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
                        <input
                            type="text"
                            placeholder="search loaded wallpapers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="search wallpapers"
                            className={`w-full pl-11 pr-4 py-3 bg-transparent text-sm outline-none ${isDark ? "text-white placeholder:text-zinc-600" : "text-zinc-900 placeholder:text-zinc-400"}`}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} aria-label="clear search"
                                className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-800"}`}>
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* tags — below search */}
                    <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                        <button
                            onClick={() => handleTagChange("")}
                            className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 shrink-0 ${!activeTag
                                ? isDark ? "bg-white/10 text-white" : "bg-zinc-900 text-white"
                                : isDark ? "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                                }`}
                        >
                            All
                        </button>
                        {allTags.slice(0, 20).map((t) => (
                            <button
                                key={t}
                                onClick={() => handleTagChange(t === activeTag ? "" : t)}
                                className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 shrink-0 ${t === activeTag
                                    ? isDark ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "bg-violet-100 text-violet-700 border border-violet-300"
                                    : isDark ? "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── skeleton initial state ─── */}
                {initialLoad && (
                    <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-2 gap-5">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <Skeleton key={i} isDark={isDark} />
                        ))}
                    </div>
                )}

                {/* ─── masonry grid (no search) ─── */}
                {!initialLoad && !search && displayGroups.all && displayGroups.all.length > 0 && (
                    <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-2 gap-5">
                        {displayGroups.all.map((w, i) => (
                            <WallpaperCard key={`${w.url}-${i}`} w={w} isDark={isDark} onClick={() => setLightbox(w)} />
                        ))}
                    </div>
                )}

                {/* ─── search results groups ─── */}
                {!initialLoad && search && hasResults && (
                    <div className="space-y-10">
                        {displayGroups.exact!.length > 0 && (
                            <div>
                                <h3 className={`text-xs font-mono font-bold tracking-widest uppercase mb-4 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Exact Matches</h3>
                                <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-2 gap-5">
                                    {displayGroups.exact!.map((w, i) => (
                                        <WallpaperCard key={`${w.url}-${i}`} w={w} isDark={isDark} onClick={() => setLightbox(w)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayGroups.exact!.length > 0 && displayGroups.fuzzy!.length > 0 && (
                            <hr className={`border-t ${isDark ? "border-white/10" : "border-zinc-200"}`} />
                        )}

                        {displayGroups.fuzzy!.length > 0 && (
                            <div>
                                <h3 className={`text-xs font-mono font-bold tracking-widest uppercase mb-4 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Related Matches</h3>
                                <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-2 gap-5">
                                    {displayGroups.fuzzy!.map((w, i) => (
                                        <WallpaperCard key={`${w.url}-${i}`} w={w} isDark={isDark} onClick={() => setLightbox(w)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── empty state ─── */}
                {!initialLoad && !hasResults && !loading && (
                    <div className="flex flex-col items-center justify-center py-32">
                        <ImageIcon className={`w-12 h-12 mb-4 ${isDark ? "text-zinc-700" : "text-zinc-300"}`} />
                        <p className={`text-lg font-semibold mb-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>no wallpapers found</p>
                        <p className={`text-sm ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>try a different tag or search term</p>
                    </div>
                )}

                {/* ─── loading more skeletons ─── */}
                {loading && !initialLoad && (
                    <div className="columns-1 sm:columns-2 lg:columns-2 xl:columns-2 gap-5 mt-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={`load-${i}`} isDark={isDark} />
                        ))}
                    </div>
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
