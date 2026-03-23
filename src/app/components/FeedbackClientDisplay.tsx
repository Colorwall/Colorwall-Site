'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackCards, FeedbackGroup, FeedbackItem } from './FeedbackCards';
import { useTheme } from '@/app/contexts/ThemeContext';
import { GradientHeading } from '@/app/components/landing/GradientHeading';

interface FeedbackClientDisplayProps {
    feedbacks: FeedbackItem[];
}

export function FeedbackClientDisplay({ feedbacks }: FeedbackClientDisplayProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [items, setItems] = useState<FeedbackItem[]>(feedbacks || []);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingIndicator, setIsLoadingIndicator] = useState(false);
    const [initialLoad, setInitialLoad] = useState(!feedbacks || feedbacks.length === 0);

    useEffect(() => {
        const loadInitial = async () => {
            setIsLoadingIndicator(true);
            try {
                const res = await fetch(`/api/feedback?skip=0&limit=20`);
                const json = await res.json();
                if (json.success && json.data) {
                    setItems(json.data);
                    if (json.data.length < 20) setHasMore(false);
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
            setHasMore(feedbacks.length === 20);
        }
    }, [feedbacks]);

    // Infinite scroll observer
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
    }, [isLoadingIndicator, hasMore]);

    const loadMore = async () => {
        setIsLoadingIndicator(true);
        try {
            const res = await fetch(`/api/feedback?skip=${items.length}&limit=20`);
            const json = await res.json();
            if (json.success && json.data) {
                setItems(prev => [...prev, ...json.data]);
                if (json.data.length < 20) setHasMore(false);
            }
        } catch {
            setHasMore(false);
        }
        setIsLoadingIndicator(false);
    };

    // Grouping logic (ported from page.tsx)
    const groups: FeedbackGroup[] = [];
    for (const item of items) {
        const last = groups[groups.length - 1];
        if (last && last.username === item.username && last.source === item.source) {
            last.items.push(item);
        } else {
            groups.push({ username: item.username, source: item.source, items: [item] });
        }
    }

    return (
        <main
            className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#080809] text-zinc-100' : 'bg-slate-50 text-zinc-900'}`}
            style={{ fontFamily: "'DM Sans', 'Geist', sans-serif" }}
        >
            {/* Noise overlay */}
            <div className={`pointer-events-none fixed inset-0 z-0 ${isDark ? 'opacity-[0.035]' : 'opacity-[0.05]'}`}
                style={{
                    backgroundImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAABJz2zMAAAACHRSTlMzMzMzMzMzM8A/4eYAAACbSURBVDjLpZGxDQMwDASJ/y18q0L5K8zM4E5AAXqSBM4+M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO9c5M9d7+E7oO/8Bv9B6wT4CxcwAAAAASUVORK5CYII=")`,
                    backgroundRepeat: 'repeat', backgroundSize: '100px 100px',
                }} />

            {/* Ambient orbs */}
            <div className="pointer-events-none fixed top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full opacity-40"
                style={{ background: `radial-gradient(circle, ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'} 0%, transparent 70%)` }} />
            <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30"
                style={{ background: `radial-gradient(circle, ${isDark ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.06)'} 0%, transparent 70%)` }} />
            <div className="pointer-events-none fixed top-[40%] right-[20%] w-[30%] h-[30%] rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${isDark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.05)'} 0%, transparent 70%)` }} />

            {/* Top scan line */}
            <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent z-50" />

            <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-16 pt-28 pb-28">

                {/* ══════════ HEADER ══════════ */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-7">
                        <span className="relative flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                        </span>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-400">
                            Community · App/Web Feedback :3
                        </span>
                        <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-indigo-500/40 to-transparent" />
                    </div>

                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                        <div>
                            <h1 className={`text-[clamp(3rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.9] mb-0 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                What do
                            </h1>
                            <h1
                                className="text-[clamp(3rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.9] mb-6"
                                style={{ WebkitTextStroke: isDark ? '1px rgba(255,255,255,0.2)' : '1px rgba(0,0,0,0.15)', color: 'transparent' }}
                            >
                                you think?
                            </h1>
                            <GradientHeading
                                text="Tell us All About It!"
                                theme={theme as 'dark' | 'light'}
                                as="h1"
                                className="text-[clamp(3rem,8vw,7rem)] font-black tracking-[-0.04em] leading-[0.9] mb-0"
                            />
                            <p className={`text-[15px] max-w-lg leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                Unfiltered reports, feature requests, and bug logs, tell us anything related to {' '}
                                <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>ColorWall</span>.
                                Every voice shapes the next release. Don't be like me and post random stuff :3
                            </p>
                        </div>

                        {/* Moved the Feedback Form into the hero section, replacing the little stats blocks */}
                        <div className="w-full xl:max-w-md xl:flex-shrink-0">
                            <FeedbackForm defaultSource="Web" />
                        </div>
                    </div>
                </div>

                {/* ══════════ SINGLE-COLUMN FEED LAYOUT ══════════ */}
                <div className="max-w-4xl mx-auto mt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`h-px flex-1 bg-gradient-to-r to-transparent ${isDark ? 'from-white/10' : 'from-black/10'}`} />
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>Latest Reports</span>
                        <div className={`h-px flex-1 bg-gradient-to-l to-transparent ${isDark ? 'from-white/10' : 'from-black/10'}`} />
                    </div>

                    {initialLoad ? (
                        <div className={`flex flex-col items-center justify-center py-40 border border-dashed rounded-3xl ${isDark ? 'border-white/8' : 'border-black/5'}`}>
                            <Loader2 className={`w-8 h-8 animate-spin mb-4 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
                            <p className={`text-lg font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Loading feedback...</p>
                        </div>
                    ) : groups.length === 0 ? (
                        <div className={`flex flex-col items-center justify-center py-40 border border-dashed rounded-3xl ${isDark ? 'border-white/8' : 'border-black/5'}`}>
                            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-5 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-zinc-200 bg-white'}`}>
                                <MessageSquare className={`w-6 h-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
                            </div>
                            <p className={`text-lg font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Nothing yet.</p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>Be the first to leave feedback.</p>
                        </div>
                    ) : (
                        <FeedbackCards groups={groups as any} />
                    )}

                    {groups.length > 0 && (
                        <div 
                            ref={lastElementRef}
                            className={`mt-14 mb-10 flex items-center justify-center gap-3 text-[11px] font-mono ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}
                        >
                            <div className={`h-px w-16 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                            {isLoadingIndicator ? (
                                <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching more entries...</span>
                            ) : hasMore ? (
                                <span>Scroll down to log history</span>
                            ) : (
                                <span>End of history. Total {items.length} records.</span>
                            )}
                            <div className={`h-px w-16 ${isDark ? 'bg-white/5' : 'bg-black/5'}`} />
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
