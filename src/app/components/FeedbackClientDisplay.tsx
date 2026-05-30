'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';
import { FeedbackCards, FeedbackGroup, FeedbackItem } from './FeedbackCards';
import { useTheme } from '@/app/contexts/ThemeContext';
import { GradientHeading } from '@/app/components/landing/GradientHeading';
import { Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

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

    const [isAdmin, setIsAdmin] = useState(false);
    const [adminIp, setAdminIp] = useState('127.0.0.1');
    const [showAdminInput, setShowAdminInput] = useState(false);
    const [adminPasskey, setAdminPasskey] = useState('');

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

    // load more entries for infinite scroll
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

    // infinite scroll observer
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

    // map each issue to its own group
    const groups: FeedbackGroup[] = useMemo(() => {
        return items.map(item => ({
            username: item.username,
            source: item.source,
            items: [item]
        }));
    }, [items]);

    return (
        <main
            className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#080809] text-zinc-100' : 'bg-slate-50 text-zinc-900'}`}
            style={{ fontFamily: "'DM Sans', 'Geist', sans-serif" }}
        >
            <Toaster position="bottom-right" toastOptions={{ style: { background: isDark ? '#0d1117' : '#fff', color: isDark ? '#c9d1d9' : '#000', border: '1px solid #30363d' } }} />

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

                    <div className="flex flex-col gap-10 max-w-[900px] mx-auto">
                        <div className="text-center">
                             <GradientHeading text='FEATURE /' theme={isDark ? 'dark' : 'light'} className='text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase tracking-wide leading-[1.1] mb-2 text-blue-500'/>
                            <h1
                                className="text-[clamp(2.5rem,7vw,6rem)] font-extrabold uppercase tracking-wide leading-[1.1] mb-6"
                                style={{
                                    background: 'linear-gradient(to right, #60a5fa, #bfdbfe)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                BUG REPORTS
                            </h1>
                        </div>

                        <div className="w-full">
                            <FeedbackForm defaultSource="Web" onFeedbackSubmit={(newItem) => setItems(prev => [newItem, ...prev])} />
                        </div>
                    </div>
                </div>

                {/* ══════════ SINGLE-COLUMN FEED LAYOUT ══════════ */}
                <div className="max-w-4xl mx-auto mt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`h-px flex-1 bg-gradient-to-r to-transparent ${isDark ? 'from-white/10' : 'from-black/10'}`} />
                        <span className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-zinc-600' : 'text-zinc-500'}`}>
                            Latest Reports
                            {isAdmin ? (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold" title="Admin Verified">
                                    <CheckCircle className="w-3 h-3" />
                                    Moderator
                                </span>
                            ) : (
                                <button 
                                    onClick={() => setShowAdminInput(true)} 
                                    className="hover:text-indigo-400 transition-colors"
                                >
                                    <Lock className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                        <div className={`h-px flex-1 bg-gradient-to-l to-transparent ${isDark ? 'from-white/10' : 'from-black/10'}`} />
                    </div>

                    {showAdminInput && !isAdmin && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl shadow-2xl p-6 w-full max-w-sm relative">
                                <button onClick={() => setShowAdminInput(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </button>
                                <h3 className="text-xl font-semibold text-[#c9d1d9] mb-1 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-indigo-400" />
                                    Authenticate
                                </h3>
                                <p className="text-xs text-[#8b949e] mb-5">
                                    Logging in binds moderator access to your current IP (<span className="font-mono text-indigo-300">{adminIp}</span>). This access will last until your IP changes.
                                </p>
                                <input 
                                    type="password" 
                                    autoFocus
                                    placeholder="Enter passkey"
                                    className="w-full bg-[#010409] border border-[#30363d] px-3 py-2 rounded-md text-[#c9d1d9] outline-none focus:border-indigo-500 mb-4 font-mono text-sm"
                                    value={adminPasskey}
                                    onChange={(e) => setAdminPasskey(e.target.value)}
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            const toastId = toast.loading('Authenticating...');
                                            try {
                                                const res = await fetch('/api/auth/admin', { method: 'POST', body: JSON.stringify({ passkey: adminPasskey }), headers: { 'Content-Type': 'application/json' } });
                                                const data = await res.json();
                                                if (res.ok) {
                                                    toast.success('Moderator verified!', { id: toastId, icon: '✅' });
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
                                <div className="text-right">
                                    <button 
                                        onClick={() => setShowAdminInput(false)}
                                        className="text-xs font-semibold text-zinc-400 hover:text-white mr-4"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                        <FeedbackCards groups={groups as FeedbackGroup[]} isAdmin={isAdmin} />
                    )}

                    {groups.length > 0 && (
                        <div 
                            ref={lastElementRef}
                            className={`mt-14 mb-10 flex items-center justify-center gap-4 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                        >
                            <div className={`h-px w-24 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                            {isLoadingIndicator ? (
                                <span className="flex items-center gap-2"><Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} /> Fetching more entries...</span>
                            ) : hasMore ? (
                                <span>Scroll down to load history</span>
                            ) : (
                                <span>No more Reports!!! ...End of history!! Total {items.length} records.</span>
                            )}
                            <div className={`h-px w-24 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
