'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import {
    X, FileText, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, Send
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export interface FeedbackFormProps {
    defaultUsername?: string;
    defaultSource?: 'App' | 'Web';
    appVersion?: string;
    onFeedbackSubmit?: (item: any) => void;
}

type Stage = 'form' | 'submitting' | 'success' | 'error';

const AVAILABLE_LABELS = [
    { name: 'bug', desc: 'Something is broken' },
    { name: 'enhancement', desc: 'Feature or idea' },
    { name: 'question', desc: 'Need clarification' },
    { name: 'help wanted', desc: 'Needs attention' }
];

// deterministic avatar tint derived from username characters
function getUserAvatar(name: string) {
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const colors = [
        'bg-[#00a4ff]/20 text-[#00a4ff] border-[#00a4ff]/30',
        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        'bg-amber-500/20 text-amber-400 border-amber-500/30',
        'bg-rose-500/20 text-rose-400 border-rose-500/30',
        'bg-sky-500/20 text-sky-400 border-sky-500/30',
    ];
    return {
        color: colors[hash % colors.length],
        initial: (name.trim().charAt(0) || 'A').toUpperCase()
    };
}

// editorial feedback composer posting multipart formdata to /api/feedback
export function FeedbackForm({ defaultUsername, defaultSource = 'Web', appVersion, onFeedbackSubmit }: FeedbackFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [stage, setStage] = useState<Stage>('form');
    const [username, setUsername] = useState('');
    const [text, setText] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [logFiles, setLogFiles] = useState<File[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [errMsg, setErrMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const [isDragging, setIsDragging] = useState(false);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const logInputRef = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);

    // hydrate username from prop, localstorage, or /api/identify endpoint
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
            } catch {
                // fallback silently to empty username input
            }
        };
        fetchIdentity();
    }, [defaultUsername]);

    const addImages = useCallback(async (files: FileList | null) => {
        if (!files) return;
        const allowed = 2 - images.length;
        const next = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, allowed);

        setImages(prev => [...prev, ...next]);
        const newPreviews = next.map(f => URL.createObjectURL(f));
        setPreviews(prev => [...prev, ...newPreviews]);
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

    const toggleLabel = (label: string) => {
        setSelectedLabels(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    // submit multipart feedback payload and prepend returned item to parent feed
    const handleSubmit = async () => {
        const trimmedUsername = username.trim() || 'Anonymous';

        if (!text.trim() && images.length === 0 && logFiles.length === 0) {
            setErrMsg('Write a note, attach a screenshot, or upload a log.');
            return;
        }
        setStage('submitting');
        setErrMsg('');

        localStorage.setItem('cw_username', trimmedUsername);

        const fd = new FormData();
        fd.append('username', trimmedUsername);
        fd.append('text', text.trim());
        fd.append('source', defaultSource);
        if (appVersion) fd.append('appVersion', appVersion);
        images.forEach(img => fd.append('images', img));
        selectedLabels.forEach(label => fd.append('labels', label));
        logFiles.forEach(log => fd.append('logFiles', log));

        try {
            const res = await fetch('/api/feedback', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) {
                setErrMsg(data.error ?? 'Something went wrong.');
                setStage('form');
                return;
            }
            if (data.data && onFeedbackSubmit) {
                onFeedbackSubmit(data.data);
            }
            setStage('success');
            setText('');
            setImages([]);
            setPreviews([]);
            setLogFiles([]);
            setSelectedLabels([]);
            setActiveTab('write');
        } catch {
            setErrMsg('Network error. Please try again.');
            setStage('form');
        }
    };

    const myAvatar = getUserAvatar(username || 'A');
    const canSubmit = (text.trim().length > 0 || images.length > 0 || logFiles.length > 0) && stage !== 'submitting';

    return (
        <div
            className={cn(
                "w-full rounded-2xl sm:rounded-3xl border p-5 sm:p-6 transition-colors duration-300",
                isDark
                    ? "bg-white/[0.02] border-white/10 text-white"
                    : "bg-white border-black/10 text-slate-900 shadow-sm"
            )}
        >
            {(stage === 'form' || stage === 'submitting' || stage === 'error') && (
                <div className="flex flex-col gap-5">
                    {/* author identity row */}
                    <div className="flex items-center gap-3">
                        <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center font-mono text-xs font-medium shrink-0", myAvatar.color)}>
                            {myAvatar.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <input
                                ref={usernameInputRef}
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                maxLength={64}
                                placeholder="Your handle (e.g. oliver)"
                                className={cn(
                                    "w-full bg-transparent text-sm font-outfit outline-none border-b py-1.5 transition-colors",
                                    isDark
                                        ? "border-white/10 focus:border-[#00a4ff] text-white placeholder:text-white/30"
                                        : "border-black/10 focus:border-[#00a4ff] text-slate-900 placeholder:text-slate-400"
                                )}
                            />
                        </div>
                    </div>

                    {/* compact category label pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {AVAILABLE_LABELS.map(label => {
                            const isSelected = selectedLabels.includes(label.name);
                            return (
                                <button
                                    key={label.name}
                                    type="button"
                                    onClick={() => toggleLabel(label.name)}
                                    title={label.desc}
                                    className={cn(
                                        "px-2.5 py-1 rounded-full text-[11px] font-mono transition-all duration-150 border",
                                        isSelected
                                            ? "bg-[#00a4ff]/15 text-[#00a4ff] border-[#00a4ff]/40"
                                            : isDark
                                                ? "bg-white/[0.02] text-white/50 border-white/10 hover:text-white/80 hover:border-white/20"
                                                : "bg-slate-50 text-slate-500 border-black/10 hover:text-slate-800 hover:border-black/20"
                                    )}
                                >
                                    {label.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* message composer with drag-and-drop asset zone */}
                    <div
                        className={cn(
                            "rounded-xl border transition-colors overflow-hidden",
                            isDragging
                                ? "border-[#00a4ff] bg-[#00a4ff]/5"
                                : isDark
                                    ? "bg-black/30 border-white/10 focus-within:border-white/25"
                                    : "bg-slate-50/70 border-black/10 focus-within:border-black/25"
                        )}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                const imgFiles = new DataTransfer();
                                const logFs = new DataTransfer();
                                Array.from(e.dataTransfer.files).forEach(f => {
                                    if (f.type.startsWith('image/')) imgFiles.items.add(f);
                                    else logFs.items.add(f);
                                });
                                if (imgFiles.files.length > 0) addImages(imgFiles.files);
                                if (logFs.files.length > 0) addLogs(logFs.files);
                            }
                        }}
                    >
                        {/* minimal tab and attachment toolbar */}
                        <div className={cn(
                            "flex items-center justify-between px-3 py-2 border-b",
                            isDark ? "border-white/10" : "border-black/10"
                        )}>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('write')}
                                    className={cn(
                                        "font-mono text-[11px] uppercase tracking-wider transition-colors",
                                        activeTab === 'write'
                                            ? "text-[#00a4ff]"
                                            : isDark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-700"
                                    )}
                                >
                                    Write
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('preview')}
                                    className={cn(
                                        "font-mono text-[11px] uppercase tracking-wider transition-colors",
                                        activeTab === 'preview'
                                            ? "text-[#00a4ff]"
                                            : isDark ? "text-white/40 hover:text-white/70" : "text-slate-400 hover:text-slate-700"
                                    )}
                                >
                                    Preview
                                </button>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isDark ? "text-white/45 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-800 hover:bg-black/5"
                                    )}
                                    title="Attach screenshots (max 2)"
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => logInputRef.current?.click()}
                                    className={cn(
                                        "p-1.5 rounded-lg transition-colors",
                                        isDark ? "text-white/45 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-800 hover:bg-black/5"
                                    )}
                                    title="Attach log files"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {activeTab === 'write' ? (
                            <textarea
                                className={cn(
                                    "w-full min-h-[160px] bg-transparent text-sm p-3.5 resize-y outline-none font-sans leading-relaxed",
                                    isDark ? "text-white/90 placeholder:text-white/30" : "text-slate-800 placeholder:text-slate-400"
                                )}
                                placeholder="Describe a bug, request a feature, or drop screenshots/logs here..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        ) : (
                            <div className={cn(
                                "w-full min-h-[160px] p-3.5 text-sm leading-relaxed",
                                isDark ? "text-white/85" : "text-slate-800"
                            )}>
                                {text ? (
                                    <div className={cn("prose prose-sm max-w-none break-words overflow-x-hidden", isDark ? "prose-invert" : "prose-slate")}>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                img: ({ node, ...props }) => {
                                                    if (!props.src) return null;
                                                    return <img {...props} alt={props.alt || ''} />;
                                                }
                                            }}
                                        >
                                            {text}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <span className={isDark ? "text-white/30" : "text-slate-400"}>Nothing to preview yet.</span>
                                )}
                            </div>
                        )}

                        {/* attached image and log previews */}
                        {(previews.length > 0 || logFiles.length > 0) && (
                            <div className="px-3.5 pb-3 flex flex-wrap gap-2">
                                {previews.map((src, i) => (
                                    <div key={i} className={cn("relative w-14 h-14 rounded-lg border overflow-hidden group", isDark ? "border-white/15" : "border-black/15")}>
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            <X className="w-3.5 h-3.5 text-white" />
                                        </button>
                                    </div>
                                ))}
                                {logFiles.map((f, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono",
                                            isDark ? "bg-white/5 border-white/10 text-white/75" : "bg-white border-black/10 text-slate-700"
                                        )}
                                    >
                                        <FileText className="w-3 h-3 text-[#00a4ff]" />
                                        <span className="truncate max-w-[110px]">{f.name}</span>
                                        <button type="button" onClick={() => removeLog(i)} className="opacity-60 hover:opacity-100">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {errMsg && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errMsg}</span>
                        </div>
                    )}

                    {/* footer action row */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                        <span className={cn("font-mono text-[10px] uppercase tracking-wider", isDark ? "text-white/35" : "text-slate-400")}>
                            Markdown · Drag & drop supported
                        </span>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className={cn(
                                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200",
                                canSubmit
                                    ? "bg-[#00a4ff] text-white hover:bg-[#0090e0] shadow-sm shadow-[#00a4ff]/20"
                                    : isDark
                                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                                        : "bg-black/10 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {stage === 'submitting' ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <>
                                    <span>Submit</span>
                                    <Send className="w-3 h-3" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {stage === 'success' && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#00a4ff]/15 border border-[#00a4ff]/30 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-5 h-5 text-[#00a4ff]" />
                    </div>
                    <h3 className="font-outfit text-lg font-light mb-1">Report submitted</h3>
                    <p className={cn("text-xs mb-5", isDark ? "text-white/50" : "text-slate-500")}>
                        Your feedback is live on the board.
                    </p>
                    <button
                        type="button"
                        onClick={() => setStage('form')}
                        className="font-mono text-xs text-[#00a4ff] hover:underline"
                    >
                        Submit another
                    </button>
                </div>
            )}

            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => { addImages(e.target.files); e.currentTarget.value = ''; }}
                className="hidden"
            />
            <input
                ref={logInputRef}
                type="file"
                accept=",.log,.txt,text/plain"
                multiple
                onChange={(e) => { addLogs(e.target.files); e.currentTarget.value = ''; }}
                className="hidden"
            />
        </div>
    );
}
