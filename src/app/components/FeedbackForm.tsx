'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Send, X, ImagePlus, FileText, Loader2,
    CheckCircle2, AlertCircle, Pencil,
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
    appVersion?: string;
}

type Stage = 'form' | 'submitting' | 'success' | 'error';

export function FeedbackForm({ defaultUsername, defaultSource = 'Web', appVersion }: FeedbackFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [stage,    setStage]    = useState<Stage>('form');
    const [username, setUsername] = useState('');
    const [text,     setText]     = useState('');
    const [images,   setImages]   = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [logFiles, setLogFiles] = useState<File[]>([]);
    const [errMsg,   setErrMsg]   = useState('');
    const [charLeft, setCharLeft] = useState(2000);
    const [nameShake, setNameShake] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const logInputRef   = useRef<HTMLInputElement>(null);
    const textareaRef   = useRef<HTMLTextAreaElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);

    // ── On mount: restore username from localStorage or network ──
    useEffect(() => {
        if (defaultUsername) {
            setUsername(defaultUsername);
            return;
        }
        
        const fetchIdentity = async () => {
            const saved = localStorage.getItem('cw_username');
            if (saved) { 
                setUsername(saved); 
                return; 
            }

            try {
                const res = await fetch('/api/identify');
                const data = await res.json();
                
                if (data.username && data.username !== 'Anonymous User' && data.username !== 'Anonymous') {
                    setUsername(data.username);
                    localStorage.setItem('cw_username', data.username);
                }
            } catch (err) {
                // Ignore network errors
            }
        };

        fetchIdentity();
    }, [defaultUsername]);

    useEffect(() => {
        usernameInputRef.current?.focus();
    }, []);

    const processImage = (file: File): Promise<{ file: File, preview: string }> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_DIM = 1920;
                
                if (width > MAX_DIM || height > MAX_DIM) {
                    const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
                    width *= ratio;
                    height *= ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve({ file, preview: url });
                
                ctx.drawImage(img, 0, 0, width, height);
                const preview = canvas.toDataURL('image/webp', 0.8);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return resolve({ file, preview });
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        resolve({ 
                            file: new File([blob], newName, { type: 'image/webp' }), 
                            preview 
                        });
                    },
                    'image/webp',
                    0.8
                );
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({ file, preview: url });
            };
            img.src = url;
        });
    };

    const addImages = useCallback(async (files: FileList | null) => {
        if (!files) return;
        const allowed = 2 - images.length;
        const next = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, allowed);
        
        const processed = await Promise.all(next.map(processImage));
        
        setImages(prev => [...prev, ...processed.map(p => p.file)]);
        setPreviews(prev => [...prev, ...processed.map(p => p.preview)]);
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

    const handleUsernameChange = (value: string) => {
        setUsername(value);
        if (value.trim().length >= 2) {
            localStorage.setItem('cw_username', value.trim());
        }
    };

    const handleSubmit = async () => {
        const trimmedUsername = username.trim();
        if (trimmedUsername.length < 2) {
            setErrMsg('Add your name before sending feedback.');
            setNameShake(true);
            setTimeout(() => setNameShake(false), 500);
            usernameInputRef.current?.focus();
            return;
        }

        if (!text.trim() && images.length === 0 && logFiles.length === 0) {
            setErrMsg('Write something, attach an image, or upload a log.');
            return;
        }
        setStage('submitting');
        setErrMsg('');

        localStorage.setItem('cw_username', trimmedUsername);
        fetch('/api/identify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: trimmedUsername }),
        }).catch(() => {/* ignore */});

        const fd = new FormData();
        fd.append('username', trimmedUsername);
        fd.append('text',     text.trim());
        fd.append('source',   defaultSource);
        if (appVersion) fd.append('appVersion', appVersion);
        images.forEach(img => fd.append('images', img));
        
        for (const log of logFiles) {
            const MAX_LOG_SIZE = 500 * 1024;
            if (log.size > MAX_LOG_SIZE) {
                const textContent = await log.text();
                const truncatedText = textContent.slice(-MAX_LOG_SIZE);
                const finalContent = `[...LOG TRUNCATED FOR SIZE...]\n${truncatedText}`;
                fd.append('logFiles', new File([finalContent], log.name, { type: 'text/plain' }));
            } else {
                fd.append('logFiles', log);
            }
        }

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

    const color = getUserColor(username.trim() || 'Anonymous', isDark);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {(stage === 'form' || stage === 'submitting' || stage === 'error') && (
                <div className={`w-full rounded-2xl border overflow-hidden ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-zinc-100 bg-white'}`} style={{
                    boxShadow: isDark 
                        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px -10px rgba(99, 102, 241, 0.15)'
                        : '0 25px 50px -12px rgba(0, 0, 0, 0.1)'
                }}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-white/6' : 'border-zinc-100'}`}>
                        <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-600'}`}>Feedback</h3>
                    </div>

                    <div className="px-4 py-4 space-y-4">
                        <div>
                            <p className={`text-[11px] font-mono uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Name</p>
                            <input
                                ref={usernameInputRef}
                                value={username}
                                onChange={e => handleUsernameChange(e.target.value)}
                                maxLength={64}
                                placeholder="e.g. xKirito99"
                                className={`mt-2 w-full rounded-xl px-4 py-3 text-base outline-none transition-all font-mono tracking-wide ${
                                    isDark
                                        ? 'bg-white/[0.04] border border-white/10 text-white placeholder-zinc-600 focus:border-indigo-500/50 focus:bg-white/[0.06]'
                                        : 'bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-indigo-500/50 focus:bg-zinc-100'
                                }`}
                            />
                        </div>

                        <div>
                            <p className={`text-[11px] font-mono uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Your feedback</p>
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={e => handleTextChange(e.target.value)}
                                maxLength={2000}
                                rows={12}
                                placeholder="Report a bug, request a feature, or just say something…"
                                className={`mt-2 w-full h-72 rounded-xl px-4 py-4 text-[13.5px] resize-none outline-none transition-all leading-relaxed font-[450] ${
                                    isDark
                                        ? 'bg-white/[0.04] border border-white/10 text-zinc-300 placeholder-zinc-600 focus:border-indigo-500/50 focus:bg-white/[0.06]'
                                        : 'bg-zinc-50 border border-zinc-200 text-zinc-700 placeholder-zinc-400 focus:border-indigo-500/50 focus:bg-zinc-100'
                                }`}
                                style={{ fontFamily: 'inherit' }}
                            />
                        </div>

                        {/* Image previews */}
                        {previews.length > 0 && (
                            <div className="px-4 pb-3 flex gap-2 flex-wrap">
                                {previews.map((src, i) => (
                                    <ImagePreview key={i} src={src} isDark={isDark} onRemove={() => removeImage(i)} />
                                ))}
                            </div>
                        )}

                        {/* Log file indicator */}
                        {logFiles.length > 0 && (
                            <div className="px-4 pb-3 flex flex-col gap-2">
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
                            <div className={`mx-4 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-lg border ${
                                isDark ? 'bg-rose-500/8 border-rose-500/20' : 'bg-rose-50 border-rose-200'
                            }`}>
                                <AlertCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
                                <p className={`text-[11px] font-mono ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>{errMsg}</p>
                            </div>
                        )}

                        <div className={`px-4 py-3 border-t flex items-center justify-between ${isDark ? 'border-white/6' : 'border-zinc-100'}`}>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className={`p-2 rounded-lg ${isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'}`}
                                    title="Attach images (max 2)"
                                >
                                    <ImagePlus className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => logInputRef.current?.click()}
                                    className={`p-2 rounded-lg ${isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'}`}
                                    title="Attach logs (max 5)"
                                >
                                    <FileText className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={`text-[12px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{charLeft}</span>
                                <button
                                    onClick={handleSubmit}
                                    disabled={stage === 'submitting' || (!text.trim() && images.length === 0 && logFiles.length === 0)}
                                    className={`flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/90 text-white font-bold text-sm transition-all duration-200 disabled:opacity-40`}
                                >
                                    <Send className="w-4 h-4" />
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
                    {/* Hidden file inputs wired to the attach buttons */}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => { addImages(e.target.files); (e.currentTarget as HTMLInputElement).value = ''; }}
                        style={{ display: 'none' }}
                    />

                    <input
                        ref={logInputRef}
                        type="file"
                        accept=",.log,.txt,text/plain"
                        multiple
                        onChange={(e) => { addLogs(e.target.files); (e.currentTarget as HTMLInputElement).value = ''; }}
                        style={{ display: 'none' }}
                    />

        </>
    );
}

// Hidden file inputs are placed after the component so refs are available for the buttons
