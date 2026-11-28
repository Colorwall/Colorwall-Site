'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { MessageSquare, Loader2, Lock, CheckCircle, X } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackCards, FeedbackGroup, FeedbackItem } from './FeedbackCards';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Toaster, toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface FeedbackClientDisplayProps {
    feedbacks: FeedbackItem[];
}

const FILTER_OPTIONS = ['all', 'bug', 'enhancement', 'question', 'help wanted'] as const;

// main feedback page shell with sticky editorial composer and infinite-scroll report stream
export function FeedbackClientDisplay({ feedbacks }: FeedbackClientDisplayProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [items, setItems] = useState<FeedbackItem[]>(feedbacks || []);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingIndicator, setIsLoadingIndicator] = useState(false);
    const [initialLoad, setInitialLoad] = useState(!feedbacks || feedbacks.length === 0);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const [isAdmin, setIsAdmin] = useState(false);
    const [adminIp, setAdminIp] = useState('127.0.0.1');
    const [showAdminInput, setShowAdminInput] = useState(false);
    const [adminPasskey, setAdminPasskey] = useState('');

    // verify moderator session and fetch initial feedback batch on mount
    useEffect(() => {
        fetch('/api/auth/admin')
            .then(res => res.json())
            .then(data => {
                setIsAdmin(!!data.isAdmin);
                if (data.ip) setAdminIp(data.ip);
            })
            .catch(() => {});

        const loadInitial = async () => {
            setIsLoadingIndicator(true);
            try {
                const res = await fetch(`/api/feedback?skip=0&limit=5`);
                const json = await res.json();
                if (json.success && json.data) {
                    setItems(json.data);
                    if (json.data.length < 5) setHasMore(false);
                } else {
                    setHasMore(false);
                }
            } catch {
                setHasMore(false);
            }
            setIsLoadingIndicator(false);
            setInitialLoad(false);
        };

        if (!feedbacks || feedbacks.length === 0) {
            loadInitial();
        } else {
            setInitialLoad(false);
            setHasMore(feedbacks.length === 5);
        }
    }, [feedbacks]);

    // load next page of feedback items for infinite scroll
    const loadMore = useCallback(async () => {
        setIsLoadingIndicator(true);
        try {
            const res = await fetch(`/api/feedback?skip=${items.length}&limit=5`);
            const json = await res.json();
            if (json.success && json.data) {
                setItems(prev => [...prev, ...json.data]);
                if (json.data.length < 5) setHasMore(false);
            }
        } catch {
            setHasMore(false);
        }
        setIsLoadingIndicator(false);
    }, [items.length]);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingIndicator) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoadingIndicator, hasMore, loadMore]);

    // filter and map items into card groups
    const groups: FeedbackGroup[] = useMemo(() => {
        const filtered = activeFilter === 'all'
            ? items
            : items.filter(item => item.labels?.includes(activeFilter));

        return filtered.map(item => ({
            username: item.username,
            source: item.source,
            items: [item]
        }));
    }, [items, activeFilter]);

    return (
        <main
            className={cn(
                "min-h-screen relative transition-colors duration-500",
                isDark ? "bg-[#0a0b14] text-white" : "bg-[#f8f9fc] text-slate-900"
            )}
        >
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: isDark ? '#0c0d16' : '#ffffff',
                        color: isDark ? '#ffffff' : '#0f172a',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    }
                }}
            />

            <div className="relative z-10 w-full max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-10 pt-28 sm:pt-32 pb-24">
                {/* editorial page header */}
                <div className={cn(
                    "pb-8 sm:pb-10 mb-10 sm:mb-12 border-b flex flex-col md:flex-row md:items-end justify-between gap-6",
                    isDark ? "border-white/10" : "border-black/10"
                )}>
                    <div>
                        
                        <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-[300] tracking-[-0.03em] leading-[1.04]">
                            Feedback &{' '}
                            <span className={isDark ? "text-white/50 font-[200]" : "text-slate-500 font-[200]"}>
                                bug reports.
                            </span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <p className={cn("text-xs sm:text-sm font-light max-w-xs leading-relaxed", isDark ? "text-white/50" : "text-slate-600")}>
                            Report bugs, request features, or drop logs directly from your workflow.
                        </p>

                        {isAdmin ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a4ff]/10 text-[#00a4ff] border border-[#00a4ff]/25 font-mono text-[11px] shrink-0">
                                <CheckCircle className="w-3 h-3" />
                                Moderator
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowAdminInput(true)}
                                title="Moderator sign in"
                                className={cn(
                                    "p-2 rounded-full border transition-colors shrink-0",
                                    isDark
                                        ? "border-white/10 text-white/40 hover:text-white hover:border-white/25"
                                        : "border-black/10 text-slate-400 hover:text-slate-800 hover:border-black/25"
                                )}
                            >
                                <Lock className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 2-column editorial split: sticky composer on left, live feed on right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                    <div className="lg:col-span-5 lg:sticky lg:top-28">
                        <FeedbackForm
                            defaultSource="Web"
                            onFeedbackSubmit={(newItem) => setItems(prev => [newItem, ...prev])}
                        />
                    </div>

                    <div className="lg:col-span-7">
                        {/* feed filter pills and report count */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {FILTER_OPTIONS.map(filter => {
                                    const isActive = activeFilter === filter;
                                    return (
                                        <button
                                            key={filter}
                                            type="button"
                                            onClick={() => setActiveFilter(filter)}
                                            className={cn(
                                                "px-3 py-1 rounded-full font-mono text-[11px] uppercase tracking-wider transition-colors border",
                                                isActive
                                                    ? "bg-[#00a4ff]/15 text-[#00a4ff] border-[#00a4ff]/35"
                                                    : isDark
                                                        ? "border-transparent text-white/45 hover:text-white/80 hover:bg-white/5"
                                                        : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-black/5"
                                            )}
                                        >
                                            {filter}
                                        </button>
                                    );
                                })}
                            </div>

                            <span className={cn("font-mono text-[11px]", isDark ? "text-white/35" : "text-slate-400")}>
                                {groups.length} {groups.length === 1 ? 'report' : 'reports'}
                            </span>
                        </div>

                        {initialLoad ? (
                            <div className={cn("flex flex-col items-center justify-center py-32 border border-dashed rounded-3xl", isDark ? "border-white/10" : "border-black/10")}>
                                <Loader2 className="w-6 h-6 animate-spin mb-3 text-[#00a4ff]" />
                                <p className={cn("font-outfit text-base font-light", isDark ? "text-white/50" : "text-slate-500")}>
                                    Loading reports...
                                </p>
                            </div>
                        ) : groups.length === 0 ? (
                            <div className={cn("flex flex-col items-center justify-center py-32 border border-dashed rounded-3xl text-center", isDark ? "border-white/10" : "border-black/10")}>
                                <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center mb-4", isDark ? "border-white/10 bg-white/[0.02]" : "border-black/10 bg-white")}>
                                    <MessageSquare className={cn("w-5 h-5", isDark ? "text-white/40" : "text-slate-400")} />
                                </div>
                                <p className={cn("font-outfit text-lg font-light", isDark ? "text-white/70" : "text-slate-700")}>
                                    Nothing here yet.
                                </p>
                                <p className={cn("text-xs mt-1", isDark ? "text-white/40" : "text-slate-500")}>
                                    {activeFilter === 'all' ? 'Be the first to leave feedback.' : `No reports tagged "${activeFilter}".`}
                                </p>
                            </div>
                        ) : (
                            <FeedbackCards groups={groups} isAdmin={isAdmin} />
                        )}

                        {items.length > 0 && (
                            <div
                                ref={lastElementRef}
                                className={cn("mt-10 flex items-center justify-center gap-4 font-mono text-[11px]", isDark ? "text-white/35" : "text-slate-400")}
                            >
                                <div className={cn("h-px w-16", isDark ? "bg-white/10" : "bg-black/10")} />
                                {isLoadingIndicator ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00a4ff]" />
                                        Loading more
                                    </span>
                                ) : hasMore ? (
                                    <span>Scroll for more</span>
                                ) : (
                                    <span>End of feed · {items.length} total</span>
                                )}
                                <div className={cn("h-px w-16", isDark ? "bg-white/10" : "bg-black/10")} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* moderator passkey modal */}
            {showAdminInput && !isAdmin && (
                <div
                    onClick={() => setShowAdminInput(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "rounded-2xl sm:rounded-3xl border shadow-2xl p-6 w-full max-w-sm relative",
                            isDark ? "bg-[#0c0d16]/95 border-white/10 text-white" : "bg-white border-black/10 text-slate-900"
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => setShowAdminInput(false)}
                            className={cn("absolute top-4 right-4 p-1.5 rounded-full transition-colors", isDark ? "text-white/40 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-800 hover:bg-black/5")}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <h3 className="font-outfit text-xl font-light mb-1 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-[#00a4ff]" />
                            Moderator access
                        </h3>
                        <p className={cn("text-xs mb-5 leading-relaxed", isDark ? "text-white/50" : "text-slate-500")}>
                            Binds moderator permissions to your IP (<span className="font-mono text-[#00a4ff]">{adminIp}</span>).
                        </p>

                        <input
                            type="password"
                            autoFocus
                            placeholder="Enter passkey"
                            className={cn(
                                "w-full border px-3.5 py-2.5 rounded-xl outline-none font-mono text-sm transition-colors",
                                isDark
                                    ? "bg-black/40 border-white/10 text-white focus:border-[#00a4ff] placeholder:text-white/30"
                                    : "bg-slate-50 border-black/10 text-slate-900 focus:border-[#00a4ff] placeholder:text-slate-400"
                            )}
                            value={adminPasskey}
                            onChange={(e) => setAdminPasskey(e.target.value)}
                            onKeyDown={async (e) => {
                                if (e.key === 'Enter') {
                                    const toastId = toast.loading('Authenticating...');
                                    try {
                                        const res = await fetch('/api/auth/admin', {
                                            method: 'POST',
                                            body: JSON.stringify({ passkey: adminPasskey }),
                                            headers: { 'Content-Type': 'application/json' }
                                        });
                                        const data = await res.json();
                                        if (res.ok) {
                                            toast.success('Moderator verified!', { id: toastId });
                                            setIsAdmin(true);
                                            if (data.ip) setAdminIp(data.ip);
                                            setShowAdminInput(false);
                                        } else {
                                            toast.error('Invalid passkey', { id: toastId });
                                        }
                                    } catch {
                                        toast.error('Network error', { id: toastId });
                                    }
                                } else if (e.key === 'Escape') {
                                    setShowAdminInput(false);
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}
