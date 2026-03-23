'use client';

import { useState, useEffect } from 'react';
import { Monitor, Globe, ChevronDown, ChevronUp, FileText, MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeedbackItem {
    id:        string;
    username:  string;
    text:      string;
    images:    string[];
    logFiles?: { name: string, content: string }[];
    appVersion?: string;
    source:    'App' | 'Web';
    createdAt: Date | string;
}

export interface FeedbackGroup {
    username: string;
    source:   'App' | 'Web';
    items:    FeedbackItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUserColor(name: string, theme: string) {
    const isDark = theme === 'dark';
    const palette = [
        { 
            bg: isDark ? 'from-violet-500/20 to-indigo-500/20' : 'from-violet-500/5 to-indigo-500/5',
            border: isDark ? 'border-violet-500/30' : 'border-violet-500/20',
            text: isDark ? 'text-violet-300' : 'text-violet-600',
            dot: 'bg-violet-400',   accent: '#8b5cf6' 
        },
        { 
            bg: isDark ? 'from-cyan-500/20 to-sky-500/20' : 'from-cyan-500/5 to-sky-500/5',
            border: isDark ? 'border-cyan-500/30' : 'border-cyan-500/20',
            text: isDark ? 'text-cyan-300' : 'text-cyan-600',
            dot: 'bg-cyan-400',     accent: '#06b6d4' 
        },
        { 
            bg: isDark ? 'from-emerald-500/20 to-teal-500/20' : 'from-emerald-500/5 to-teal-500/5',
            border: isDark ? 'border-emerald-500/30' : 'border-emerald-500/20',
            text: isDark ? 'text-emerald-300' : 'text-emerald-600',
            dot: 'bg-emerald-400',  accent: '#10b981' 
        },
        { 
            bg: isDark ? 'from-amber-500/20 to-orange-500/20' : 'from-amber-500/5 to-orange-500/5',
            border: isDark ? 'border-amber-500/30' : 'border-amber-500/20',
            text: isDark ? 'text-amber-300' : 'text-amber-600',
            dot: 'bg-amber-400',    accent: '#f59e0b' 
        },
        { 
            bg: isDark ? 'from-rose-500/20 to-pink-500/20' : 'from-rose-500/5 to-pink-500/5',
            border: isDark ? 'border-rose-500/30' : 'border-rose-500/20',
            text: isDark ? 'text-rose-300' : 'text-rose-600',
            dot: 'bg-rose-400',     accent: '#f43f5e' 
        },
        { 
            bg: isDark ? 'from-fuchsia-500/20 to-purple-500/20' : 'from-fuchsia-500/5 to-purple-500/5',
            border: isDark ? 'border-fuchsia-500/30' : 'border-fuchsia-500/20',
            text: isDark ? 'text-fuchsia-300' : 'text-fuchsia-600',
            dot: 'bg-fuchsia-400',  accent: '#d946ef' 
        },
    ];
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return palette[hash % palette.length];
}

function timeAgo(date: Date | string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60)     return `${diff}s ago`;
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ExpandableImageGrid({ images, theme }: { images: string[], theme: string }) {
    if (images.length === 0) return null;
    const isDark = theme === 'dark';

    return (
        <div className={`mt-3 grid gap-2 ${images.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-2 max-w-md'}`}>
            {images.map((src, idx) => (
                <a key={idx} href={src} target="_blank" rel="noreferrer"
                    className={`relative block overflow-hidden rounded-lg border ${
                        isDark ? 'border-white/8' : 'border-zinc-200'
                    }`}
                    style={{ aspectRatio: images.length === 1 ? '16/9' : '1/1' }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                </a>
            ))}
        </div>
    );
}

function MessagesList({ items, isExpanded, theme }: { items: FeedbackItem[], isExpanded: boolean, theme: string }) {
    const isDark = theme === 'dark';
    const displayItems = isExpanded ? items : [items[0]];

    return (
        <div className="space-y-3 mt-1 pl-[44px]">
            {displayItems.map((item, i) => {
                const isTruncated = !isExpanded && item.text.length > 250;
                const displayText = isTruncated ? item.text.slice(0, 250) + '...' : item.text;

                return (
                    <div key={item.id} className={i > 0 ? `pt-3 border-t ${isDark ? 'border-white/[0.04]' : 'border-zinc-100'}` : ''}>
                        {i > 0 && (
                            <span className={`block text-[10px] font-mono mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{timeAgo(item.createdAt)}</span>
                        )}
                        {item.text && (
                            <p className={`text-[13px] leading-[1.6] whitespace-pre-wrap font-[450] select-text cursor-text ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                {displayText}
                            </p>
                        )}
                        {(isExpanded || i === 0) && <ExpandableImageGrid images={item.images} theme={theme} />}
                        {item.logFiles && item.logFiles.map((log, idx) => (
                            <div key={idx} className={`mt-3 rounded-lg border overflow-hidden ${isDark ? 'border-indigo-500/20' : 'border-indigo-200'}`}>
                                <div className={`flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider font-mono border-b ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
                                    <FileText size={12} /> {log.name}
                                </div>
                                <div className={`p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap max-h-48 select-text cursor-text ${
                                    isDark ? 'bg-black/40 text-indigo-100/70' : 'bg-white text-indigo-900/80'
                                }`}>
                                    {log.content}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}

function ReplySection({ theme, isApp, threadId, initialReplies }: { theme: string, isApp?: boolean, threadId: string, initialReplies: any[] }) {
    const isDark = theme === 'dark';
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [localReplies, setLocalReplies] = useState<{id: string, text: string, username: string, createdAt: Date}[]>(initialReplies || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slowmode, setSlowmode] = useState(0);

    useEffect(() => {
        if (slowmode <= 0) return;
        const timer = setInterval(() => setSlowmode(s => s - 1), 1000);
        return () => clearInterval(timer);
    }, [slowmode]);

    const handleDeleteReply = async (id: string) => {
        if (!confirm('Admin: Delete this reply?')) return;
        try {
            const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setLocalReplies(prev => prev.filter(r => r.id !== id));
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch {
            alert('Delete failed.');
        }
    };

    const handleReply = async () => {
        if (!replyText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        const username = typeof window !== 'undefined' ? (localStorage.getItem('cw_username') || 'Anonymous') : 'Anonymous';

        try {
            const res = await fetch('/api/feedback/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ threadId, username, text: replyText.trim() })
            });
            const data = await res.json();
            
            if (res.status === 429) {
                setSlowmode(60);
            } else if (data.success && data.reply) {
                setLocalReplies([...localReplies, data.reply]);
                setReplyText('');
                setIsReplying(false);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (e) {
            alert('Failed to post reply.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/[0.04]' : 'border-zinc-100'} pl-[44px]`}>
            {/* Show local replies */}
            {localReplies.length > 0 && (
                <div className="space-y-4 mb-4">
                    {localReplies.map(reply => (
                        <div key={reply.id} className="flex gap-3">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${isDark ? 'from-indigo-500/20 to-purple-500/20 border border-indigo-500/30' : 'from-indigo-100 to-purple-100 border border-indigo-200'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <span className={`text-[10px] font-black ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{reply.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between gap-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-[12px] font-bold ${isDark ? 'text-white/90' : 'text-zinc-800'}`}>{reply.username}</span>
                                        <span className={`text-[9px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{timeAgo(reply.createdAt)}</span>
                                    </div>
                                    <button onClick={() => handleDeleteReply(reply.id)} className={`opacity-40 hover:opacity-100 transition-opacity p-1 ${isDark ? 'text-rose-500/50 hover:text-rose-400' : 'text-rose-600/50 hover:text-rose-600'}`}>
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <p className={`text-[12px] leading-relaxed mt-0.5 whitespace-pre-wrap select-text cursor-text ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                    {reply.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply Actions */}
            {!isReplying ? (
                <button 
                    onClick={() => setIsReplying(true)}
                    className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
                        isApp 
                            ? (isDark ? 'text-blue-400/60 hover:text-blue-400' : 'text-blue-600/70 hover:text-blue-600')
                            : (isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800')
                    }`}
                >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reply to thread
                </button>
            ) : (
                <div className="flex flex-col gap-2 relative">
                    <textarea 
                        className={`w-full min-h-[70px] resize-none rounded-xl p-3 text-[12px] outline-none border transition-colors ${
                            isDark 
                                ? 'bg-white/[0.02] border-white/10 text-white placeholder-zinc-600 focus:border-indigo-500/50' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500/50'
                        }`}
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-1">
                        <button 
                            onClick={() => setIsReplying(false)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-colors ${
                                isDark ? 'text-zinc-400 hover:bg-white/5' : 'text-zinc-500 hover:bg-zinc-100'
                            }`}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleReply}
                            disabled={!replyText.trim() || isSubmitting || slowmode > 0}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-50 transition-colors shadow-sm ${
                                slowmode > 0 ? (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-500') : 'bg-indigo-500 text-white hover:bg-indigo-600'
                            }`}
                        >
                            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : slowmode > 0 ? null : <Send className="w-3" />}
                            {slowmode > 0 ? `Wait ${slowmode}s` : isSubmitting ? 'Posting...' : 'Submit Reply'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/** Web submission — warm card, chat-bubble feel */
function WebCard({ group, index, theme }: { group: FeedbackGroup; index: number; theme: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isDark = theme === 'dark';
    
    const color    = getUserColor(group.username, theme);
    const initials = group.username.slice(0, 2).toUpperCase();
    const first    = group.items[0];

    const needsExpansion = group.items.length > 1 || (first.text && first.text.length > 250) || (first.logFiles && first.logFiles.length > 0);

    const handleDeleteThread = async () => {
        if (!confirm('Admin: Delete this ENTIRE thread?')) return;
        try {
            const res = await fetch(`/api/feedback/${first.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) window.location.reload();
            else alert(`Error: ${data.error}`);
        } catch {
            alert('Delete failed.');
        }
    };

    return (
        <div className={`relative rounded-xl border overflow-hidden ${
            isDark ? 'border-white/8 bg-[#0d0d0f]/90 shadow-none' : 'border-zinc-200 bg-white shadow-sm'
        }`}>

            <div className="relative z-10 p-5">
                {/* User row */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color.bg} border ${color.border} flex items-center justify-center flex-shrink-0`}>
                            <span className={`text-[10px] font-black ${color.text}`}>{initials}</span>
                        </div>
                        <div>
                            <span className={`text-[13px] font-bold tracking-wide ${isDark ? 'text-white' : 'text-zinc-900'}`}>{group.username}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Globe className={`w-2.5 h-2.5 ${isDark ? 'text-emerald-500/70' : 'text-emerald-600/70'}`} />
                                <span className={`text-[10px] font-mono ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/70'}`}>Web</span>
                                <span className={`text-[10px] ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>·</span>
                                <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{timeAgo(first.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleDeleteThread} className={`opacity-40 hover:opacity-100 transition-opacity p-1 ${isDark ? 'text-rose-500/50 hover:text-rose-400' : 'text-rose-600/50 hover:text-rose-600'}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className={`text-[9px] font-mono tabular-nums py-1 px-2 rounded ${isDark ? 'text-zinc-600 bg-white/[0.02]' : 'text-zinc-400 bg-zinc-50'}`}>#{String(index + 1).padStart(4, '0')}</span>
                    </div>
                </div>

                <MessagesList items={group.items} isExpanded={isExpanded} theme={theme} />

                {needsExpansion && (
                    <div className="mt-3 pl-[44px]">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`flex items-center gap-1 text-[11px] font-mono transition-colors ${
                                isDark ? 'text-indigo-400/60 hover:text-indigo-300' : 'text-indigo-600/80 hover:text-indigo-600'
                            }`}
                        >
                            {isExpanded ? (
                                <><ChevronUp className="w-3 h-3" /> Show less</>
                            ) : (
                                <><ChevronDown className="w-3 h-3" /> Show more {group.items.length > 1 && `(${group.items.length - 1} earlier)`}</>
                            )}
                        </button>
                    </div>
                )}
                <ReplySection theme={theme} isApp={false} threadId={first.id} initialReplies={(first as any).replies || []} />
            </div>
        </div>
    );
}

/** App submission — monochrome, terminal / system-log feel */
function AppCard({ group, index, theme }: { group: FeedbackGroup; index: number; theme: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isDark = theme === 'dark';
    const first = group.items[0];

    const needsExpansion = group.items.length > 1 || (first.text && first.text.length > 250) || (first.logFiles && first.logFiles.length > 0);

    const handleDeleteThread = async () => {
        if (!confirm('Admin: Delete this ENTIRE thread?')) return;
        try {
            const res = await fetch(`/api/feedback/${first.id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) window.location.reload();
            else alert(`Error: ${data.error}`);
        } catch {
            alert('Delete failed.');
        }
    };

    return (
        <div className={`relative rounded-xl border overflow-hidden ${
            isDark ? 'border-blue-500/10 bg-[#08090d]/95 shadow-none' : 'border-blue-600/10 bg-slate-50 shadow-sm'
        }`}>

            <div className="relative z-10 p-5">
                {/* Header row */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-500/8 border-blue-500/15' : 'bg-blue-500/5 border-blue-500/10'}`}>
                            <Monitor className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400/80' : 'text-blue-600/80'}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[13px] font-bold tracking-wide font-mono ${isDark ? 'text-white/90' : 'text-zinc-800'}`}>{group.username}</span>
                                <span className={`text-[9px] font-mono font-bold px-1 py-[1px] rounded border ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-500/5 border-blue-500/15 text-blue-600'}`}>DESKTOP</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{timeAgo(first.createdAt)}</span>
                                <span className={`text-[10px] ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>·</span>
                                <span className={`text-[10px] font-mono ${isDark ? 'text-blue-500/50' : 'text-blue-600/60'}`}>
                                    {first.appVersion ? `Engine v${first.appVersion.replace(/^v/i, '')}` : 'Engine V1'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleDeleteThread} className={`opacity-40 hover:opacity-100 transition-opacity p-1 ${isDark ? 'text-rose-500/50 hover:text-rose-400' : 'text-rose-600/50 hover:text-rose-600'}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className={`text-[9px] font-mono tabular-nums py-1 px-2 rounded ${isDark ? 'text-zinc-600 bg-white/[0.02]' : 'text-zinc-400 bg-zinc-100/50'}`}>#{String(index + 1).padStart(4, '0')}</span>
                    </div>
                </div>

                <div className="space-y-3 font-mono mt-3 pl-[44px]">
                    {/* Log-line style messages */}
                    {(isExpanded ? group.items : [first]).map((item, i) => {
                        const isTruncated = !isExpanded && item.text.length > 250;
                        const displayText = isTruncated ? item.text.slice(0, 250) + '...' : item.text;

                        return (
                            <div key={item.id} className={i > 0 ? `pt-3 border-t ${isDark ? 'border-white/[0.04]' : 'border-blue-500/5'}` : ''}>
                                {item.text && (
                                    <p className={`text-[12px] leading-[1.6] whitespace-pre-wrap select-text cursor-text ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                        {/* Prefix message with a › prompt symbol */}
                                        <span className={`select-none mr-2 ${isDark ? 'text-blue-500/40' : 'text-blue-600/30'}`}>›</span>
                                        {displayText}
                                    </p>
                                )}
                                {(isExpanded || i === 0) && <ExpandableImageGrid images={item.images} theme={theme} />}
                                {item.logFiles && item.logFiles.map((log, idx) => (
                                    <div key={idx} className={`mt-3 rounded-lg border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                                        <div className={`flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider font-mono border-b ${isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-slate-100 border-slate-200 text-zinc-500'}`}>
                                            <FileText size={12} /> {log.name}
                                        </div>
                                        <div className={`p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap max-h-48 select-text cursor-text ${
                                            isDark ? 'bg-black/30 text-zinc-300' : 'bg-white text-zinc-700'
                                        }`}>
                                            {log.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>

                {needsExpansion && (
                    <div className="mt-3 pl-[44px]">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`flex items-center gap-1 text-[11px] font-mono transition-colors ${
                                isDark ? 'text-blue-400/50 hover:text-blue-400' : 'text-blue-600/70 hover:text-blue-600'
                            }`}
                        >
                            {isExpanded ? (
                                <><ChevronUp className="w-3 h-3" /> Hide trace</>
                            ) : (
                                <><ChevronDown className="w-3 h-3" /> Expand trace {group.items.length > 1 && `(${group.items.length - 1} logs)`}</>
                            )}
                        </button>
                    </div>
                )}
                <ReplySection theme={theme} isApp={true} threadId={first.id} initialReplies={(first as any).replies || []} />
            </div>
        </div>
    );
}

// ─── Feed ──────────────────────────────────────────────────────────────────────

export function FeedbackCards({ groups }: { groups: FeedbackGroup[] }) {
    const { theme } = useTheme();

    return (
        <div className="flex flex-col gap-5">
            {groups.map((group, i) =>
                group.source === 'App'
                    ? <AppCard key={`${group.username}-${i}`} group={group} index={i} theme={theme} />
                    : <WebCard key={`${group.username}-${i}`} group={group} index={i} theme={theme} />
            )}
        </div>
    );
}
