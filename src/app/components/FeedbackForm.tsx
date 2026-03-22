'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Send, X, ImagePlus, FileText, Loader2,
    CheckCircle2, ChevronRight, AlertCircle, Pencil,
    Monitor, Globe
} from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';

// ─── Helpers ────────────────────────────────────────────────────────────────

function getUserColor(name: string, isDark: boolean) {
    const palette = [
        { 
            bg: isDark ? 'from-violet-500/20 to-indigo-500/20' : 'from-violet-500/5 to-indigo-500/5',
            border: isDark ? 'border-violet-500/30' : 'border-violet-500/20',
            text: isDark ? 'text-violet-300' : 'text-violet-600',
            dot: 'bg-violet-400', accent: '#8b5cf6' 
        },
        { 
            bg: isDark ? 'from-cyan-500/20 to-sky-500/20' : 'from-cyan-500/5 to-sky-500/5',
            border: isDark ? 'border-cyan-500/30' : 'border-cyan-500/20',
            text: isDark ? 'text-cyan-300' : 'text-cyan-600',
            dot: 'bg-cyan-400',   accent: '#06b6d4' 
        },
        { 
            bg: isDark ? 'from-emerald-500/20 to-teal-500/20' : 'from-emerald-500/5 to-teal-500/5',
            border: isDark ? 'border-emerald-500/30' : 'border-emerald-500/20',
            text: isDark ? 'text-emerald-300' : 'text-emerald-600',
            dot: 'bg-emerald-400', accent: '#10b981' 
        },
        { 
            bg: isDark ? 'from-amber-500/20 to-orange-500/20' : 'from-amber-500/5 to-orange-500/5',
            border: isDark ? 'border-amber-500/30' : 'border-amber-500/20',
            text: isDark ? 'text-amber-300' : 'text-amber-600',
            dot: 'bg-amber-400',  accent: '#f59e0b' 
        },
        { 
            bg: isDark ? 'from-rose-500/20 to-pink-500/20' : 'from-rose-500/5 to-pink-500/5',
            border: isDark ? 'border-rose-500/30' : 'border-rose-500/20',
            text: isDark ? 'text-rose-300' : 'text-rose-600',
            dot: 'bg-rose-400',   accent: '#f43f5e' 
        },
        { 
            bg: isDark ? 'from-fuchsia-500/20 to-purple-500/20' : 'from-fuchsia-500/5 to-purple-500/5',
            border: isDark ? 'border-fuchsia-500/30' : 'border-fuchsia-500/20',
            text: isDark ? 'text-fuchsia-300' : 'text-fuchsia-600',
            dot: 'bg-fuchsia-400', accent: '#d946ef' 
        },
    ];
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return palette[hash % palette.length];
}

// ─── Username Gate ────────────────────────────────────────────────────────────

function UsernameGate({ onConfirm, isDark }: { onConfirm: (name: string) => void, isDark: boolean }) {
    const [value, setValue] = useState('');
    const [shake, setShake]  = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const confirm = () => {
        const name = value.trim();
        if (!name || name.length < 2) { setShake(true); setTimeout(() => setShake(false), 500); return; }
        onConfirm(name);
    };

    return (
        <div className="flex flex-col items-center justify-center py-6 px-2">
            <div className="w-full max-w-sm">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 mx-auto ${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
                    <Pencil className="w-5 h-5 text-indigo-500" />
                </div>

                <h2 className={`text-xl font-black tracking-tight text-center mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    What should we call you?
                </h2>
                <p className="text-[12px] text-zinc-500 text-center mb-6 font-mono">
                    This will be saved and linked to your feedback.
                </p>

                <div className={`relative transition-all duration-150 ${shake ? 'translate-x-1' : ''}`}>
                    <input
                        ref={inputRef}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && confirm()}
                        maxLength={64}
                        placeholder="e.g. xKirito99"
                        className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all font-mono tracking-wide ${
                            isDark 
                                ? 'bg-white/[0.04] border border-white/10 text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:bg-white/[0.06]' 
                                : 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500/50 focus:bg-zinc-100'
                        }`}
                    />
                    {value.trim().length >= 2 && (
                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center`}
                            style={{ background: getUserColor(value.trim(), isDark).accent + '30', border: `1px solid ${getUserColor(value.trim(), isDark).accent}40` }}>
                            <span className="text-[9px] font-black" style={{ color: getUserColor(value.trim(), isDark).accent }}>
                                {value.trim().charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {value.trim().length > 0 && value.trim().length < 2 && (
                    <p className={`text-[11px] font-mono mt-2 ml-1 ${isDark ? 'text-rose-400/80' : 'text-rose-500/90'}`}>At least 2 characters.</p>
                )}

                <button
                    onClick={confirm}
                    disabled={value.trim().length < 2}
                    className="mt-4 w-full py-3 rounded-xl bg-indigo-500/90 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(99,102,241,0.3)]"
                >
                    Continue <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// ─── Image Preview ────────────────────────────────────────────────────────────

function ImagePreview({ src, onRemove, isDark }: { src: string; onRemove: () => void, isDark: boolean }) {
    return (
        <div className={`relative group flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
                onClick={onRemove}
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isDark ? 'bg-black/60' : 'bg-black/40'}`}
            >
                <X className="w-4 h-4 text-white" />
            </button>
        </div>
    );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export interface FeedbackFormProps {
    defaultUsername?: string;
    defaultSource?: 'App' | 'Web';
}

type Stage = 'username' | 'form' | 'submitting' | 'success' | 'error';

export function FeedbackForm({ defaultUsername, defaultSource = 'Web' }: FeedbackFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [stage,    setStage]    = useState<Stage>('username');
    const [username, setUsername] = useState('');
    const [text,     setText]     = useState('');
    const [images,   setImages]   = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [logFiles, setLogFiles] = useState<File[]>([]);
    const [errMsg,   setErrMsg]   = useState('');
    const [charLeft, setCharLeft] = useState(2000);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const logInputRef   = useRef<HTMLInputElement>(null);
    const textareaRef   = useRef<HTMLTextAreaElement>(null);

    // ── On mount: restore username from localStorage or network ──
    useEffect(() => {
        if (defaultUsername) {
            setUsername(defaultUsername);
            setStage('form');
            return;
        }
        
        const fetchIdentity = async () => {
            const saved = localStorage.getItem('cw_username');
            if (saved) { 
                setUsername(saved); 
                setStage('form'); 
                return; 
            }

            try {
                const res = await fetch('/api/identify');
                const data = await res.json();
                
                if (data.username && data.username !== 'Anonymous User' && data.username !== 'Anonymous') {
                    setUsername(data.username);
                    localStorage.setItem('cw_username', data.username);
                    setStage('form');
                }
            } catch (err) {
                // Ignore network errors
            }
        };

        fetchIdentity();
    }, [defaultUsername]);

    const confirmUsername = useCallback((name: string) => {
        setUsername(name);
        localStorage.setItem('cw_username', name);
        setStage('form');
        fetch('/api/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: name }),
        }).catch(() => {/* ignore */});
    }, []);

    const addImages = useCallback((files: FileList | null) => {
        if (!files) return;
        const allowed = 5 - images.length;
        const next = Array.from(files).slice(0, allowed);
        setImages(prev => [...prev, ...next]);
        next.forEach(f => {
            const reader = new FileReader();
            reader.onload = e => setPreviews(prev => [...prev, e.target!.result as string]);
            reader.readAsDataURL(f);
        });
    }, [images.length]);

    const removeImage = useCallback((idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
        setPreviews(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const addLogs = useCallback((files: FileList | null) => {
        if (!files) return;
        const allowed = 5 - logFiles.length;
        const next = Array.from(files).slice(0, allowed);
        setLogFiles(prev => [...prev, ...next]);
    }, [logFiles.length]);

    const removeLog = useCallback((idx: number) => {
        setLogFiles(prev => prev.filter((_, i) => i !== idx));
    }, []);

    const handleTextChange = (v: string) => {
        setText(v);
        setCharLeft(2000 - v.length);
    };

    const handleSubmit = async () => {
        if (!text.trim() && images.length === 0 && logFiles.length === 0) {
            setErrMsg('Write something, attach an image, or upload a log.');
            return;
        }
        setStage('submitting');
        setErrMsg('');

        const fd = new FormData();
        fd.append('username', username);
        fd.append('text',     text.trim());
        fd.append('source',   defaultSource);
        images.forEach(img => fd.append('images', img));
        logFiles.forEach(log => fd.append('logFiles', log));

        try {
            const res  = await fetch('/api/feedback', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) { setErrMsg(data.error ?? 'Something went wrong.'); setStage('form'); return; }
            setStage('success');
            setText(''); setImages([]); setPreviews([]); setLogFiles([]); setCharLeft(2000);
        } catch {
            setErrMsg('Network error. Please try again.');
            setStage('form');
        }
    };

    const color = username ? getUserColor(username, isDark) : null;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`w-full rounded-2xl border backdrop-blur-xl overflow-hidden ${
            isDark ? 'border-white/8 bg-[#0d0d0f]/90 shadow-none' : 'border-zinc-200 bg-white/90 shadow-sm'
        }`}>

            {stage === 'username' && (
                <div className="p-6">
                    <UsernameGate onConfirm={confirmUsername} isDark={isDark} />
                </div>
            )}

            {(stage === 'form' || stage === 'submitting' || stage === 'error') && color && (
                <>
                    {/* Header */}
                    <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/6' : 'border-zinc-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color.bg} border ${color.border} flex items-center justify-center`}>
                                <span className={`text-[11px] font-black ${color.text}`}>
                                    {username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{username}</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    {defaultSource === 'App'
                                        ? <Monitor className="w-2.5 h-2.5 text-blue-500" />
                                        : <Globe    className="w-2.5 h-2.5 text-emerald-500" />}
                                    <span className={`text-[10px] font-mono ${defaultSource === 'App' ? (isDark ? 'text-blue-400/70' : 'text-blue-600/70') : (isDark ? 'text-emerald-400/70' : 'text-emerald-600/70')}`}>
                                        {defaultSource === 'App' ? 'Desktop App' : 'Web'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text area */}
                    <div className="px-5 pt-4 pb-2">
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={e => handleTextChange(e.target.value)}
                            maxLength={2000}
                            rows={4}
                            placeholder="Report a bug, request a feature, or just say something…"
                            className={`w-full bg-transparent text-[13.5px] resize-none outline-none leading-relaxed font-[450] ${
                                isDark ? 'text-zinc-300 placeholder-zinc-600' : 'text-zinc-700 placeholder-zinc-400'
                            }`}
                            style={{ fontFamily: 'inherit' }}
                        />
                    </div>

                    {/* Image previews */}
                    {previews.length > 0 && (
                        <div className="px-5 pb-3 flex gap-2 flex-wrap">
                            {previews.map((src, i) => (
                                <ImagePreview key={i} src={src} isDark={isDark} onRemove={() => removeImage(i)} />
                            ))}
                        </div>
                    )}

                    {/* Log file indicator */}
                    {logFiles.length > 0 && (
                        <div className="px-5 pb-3 flex flex-col gap-2">
                            {logFiles.map((file, idx) => (
                                <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                    isDark ? 'bg-white/[0.03] border-white/8' : 'bg-zinc-50 border-zinc-200'
                                }`}>
                                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                                    <span className="text-[11px] font-mono text-zinc-500 flex-1 truncate">{file.name}</span>
                                    <button onClick={() => removeLog(idx)}>
                                        <X className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-400 transition-colors" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {errMsg && (
                        <div className={`mx-5 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-lg border ${
                            isDark ? 'bg-rose-500/8 border-rose-500/20' : 'bg-rose-50 border-rose-200'
                        }`}>
                            <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                            <p className={`text-[11px] font-mono ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>{errMsg}</p>
                        </div>
                    )}

                    {/* Footer toolbar */}
                    <div className={`flex items-center justify-between px-5 py-3 border-t ${isDark ? 'border-white/6' : 'border-zinc-100'}`}>
                        <div className="flex items-center gap-1">
                            {/* Image attach */}
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                disabled={images.length >= 5}
                                title="Attach images (max 5)"
                                className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all ${
                                    isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
                                }`}
                            >
                                <ImagePlus className="w-4 h-4" />
                            </button>
                            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={e => addImages(e.target.files)} />

                            {/* Log attach */}
                            <button
                                onClick={() => logInputRef.current?.click()}
                                disabled={logFiles.length >= 5}
                                title="Attach log files (max 5)"
                                className={`p-2 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all ${
                                    isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                            <input ref={logInputRef} type="file" accept=".log,.txt" multiple hidden onChange={e => addLogs(e.target.files)} />

                            {logFiles.length > 0 && (
                                <span className={`text-[10px] font-mono ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    {logFiles.length}/5 Logs
                                </span>
                            )}

                            {images.length > 0 && (
                                <span className={`text-[10px] font-mono ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{images.length}/5</span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-mono tabular-nums transition-colors ${charLeft < 100 ? 'text-amber-500' : charLeft < 20 ? 'text-rose-500' : 'text-zinc-500'}`}>
                                {charLeft}
                            </span>
                            <button
                                onClick={handleSubmit}
                                disabled={stage === 'submitting' || (!text.trim() && images.length === 0 && logFiles.length === 0)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/90 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-[12px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(99,102,241,0.35)]"
                            >
                                {stage === 'submitting'
                                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                                    : <><Send className="w-3.5 h-3.5" /> Send</>}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ── Success ── */}
            {stage === 'success' && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-500/5 border border-emerald-500/10'}`}>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className={`text-base font-black mb-1 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>Received.</h3>
                    <p className={`text-[12px] font-mono mb-6 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Your feedback is now live in the feed.</p>
                    <button
                        onClick={() => setStage('form')}
                        className={`text-[11px] font-mono transition-colors underline underline-offset-2 ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}
                    >
                        Submit another
                    </button>
                </div>
            )}
        </div>
    );
}