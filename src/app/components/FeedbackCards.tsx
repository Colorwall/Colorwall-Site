'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Trash2, Loader2, Edit3, Image as ImageIcon, Check, X, BadgeCheck, MessageCircle, Send, FileText
} from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface FeedbackItem {
    id: string;
    username: string;
    text: string;
    images: string[];
    logFiles?: { name: string; content: string }[];
    appVersion?: string;
    source: 'App' | 'Web';
    labels?: string[];
    isVerified?: boolean;
    createdAt: Date | string;
    replies?: { id: string; username: string; text: string; createdAt: Date | string; isVerified?: boolean }[];
}

export interface FeedbackGroup {
    username: string;
    source: 'App' | 'Web';
    items: FeedbackItem[];
}

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

function timeAgo(date: Date | string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${Math.max(diff, 0)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getLabelStyle(label: string, isDark: boolean) {
    const map: Record<string, string> = {
        'bug': 'border-rose-500/30 text-rose-400 bg-rose-500/10',
        'enhancement': 'border-[#00a4ff]/30 text-[#00a4ff] bg-[#00a4ff]/10',
        'question': 'border-amber-500/30 text-amber-400 bg-amber-500/10',
        'help wanted': 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
        'App': isDark ? 'border-white/15 text-white/70 bg-white/5' : 'border-black/15 text-slate-600 bg-black/5',
        'Web': isDark ? 'border-white/15 text-white/70 bg-white/5' : 'border-black/15 text-slate-600 bg-black/5',
    };
    return map[label] || (isDark ? 'border-white/10 text-white/50' : 'border-black/10 text-slate-500');
}

// renders attached screenshots and triggers floaty editorial lightbox on click
function ExpandableImageGrid({ images, onOpenImage }: { images: string[]; onOpenImage: (src: string) => void }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const validImages = images.filter(Boolean);
    if (validImages.length === 0) return null;

    return (
        <div className={cn("mt-3.5 grid gap-2.5", validImages.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-2 max-w-lg")}>
            {validImages.map((src, idx) => {
                const safeSrc = typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http')) ? src : '';
                if (!safeSrc) return null;
                return (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => onOpenImage(safeSrc)}
                        className={cn(
                            "relative block overflow-hidden rounded-xl border transition-transform duration-200 hover:scale-[1.01] cursor-zoom-in text-left",
                            isDark ? "border-white/10 bg-black/30" : "border-black/10 bg-slate-100"
                        )}
                        style={{ aspectRatio: validImages.length === 1 ? '16/9' : '1/1' }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={safeSrc} alt="Feedback attachment" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                );
            })}
        </div>
    );
}

// single comment or nested reply block with moderator inline edit and delete
function CommentEntry({
    username,
    createdAt,
    body,
    images,
    logFiles,
    isMain,
    itemId,
    isAdmin,
    isVerified,
    onOpenImage
}: {
    username: string;
    createdAt: Date | string;
    body: string;
    images?: string[];
    logFiles?: { name: string; content: string }[];
    isMain?: boolean;
    itemId: string;
    isAdmin: boolean;
    isVerified?: boolean;
    onOpenImage: (src: string) => void;
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const avatar = getUserAvatar(username);

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(body);
    const [isSaving, setIsSaving] = useState(false);
    const [currentBody, setCurrentBody] = useState(body);

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/feedback/${itemId}/edit?type=${isMain ? 'issue' : 'reply'}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: editText,
                    originalText: currentBody,
                    adminName: typeof window !== 'undefined' ? localStorage.getItem('cw_username') : ''
                })
            });
            if (res.ok) {
                setCurrentBody(editText);
                setIsEditing(false);
            } else {
                alert('Failed to save edit.');
            }
        } catch {
            alert('Error saving edit.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={cn(!isMain && "pt-3.5 mt-3.5 border-t", !isMain && (isDark ? "border-white/10" : "border-black/10"))}>
            {!isMain && (
                <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px] shrink-0", avatar.color)}>
                            {avatar.initial}
                        </div>
                        <span className={cn("text-xs font-medium truncate", isDark ? "text-white/90" : "text-slate-800")}>{username}</span>
                        {isVerified && (
                            <span className="text-[#00a4ff]" title="Verified Moderator">
                                <BadgeCheck className="w-3.5 h-3.5" />
                            </span>
                        )}
                        <span className={cn("font-mono text-[10px]", isDark ? "text-white/35" : "text-slate-400")}>
                            {timeAgo(createdAt)}
                        </span>
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-1">
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className={cn("p-1 rounded transition-colors", isDark ? "text-white/40 hover:text-[#00a4ff]" : "text-slate-400 hover:text-[#00a4ff]")}
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={async () => {
                                    if (confirm('Delete reply?')) {
                                        await fetch(`/api/feedback/${itemId}?type=reply`, { method: 'DELETE' });
                                        window.location.reload();
                                    }
                                }}
                                className={cn("p-1 rounded transition-colors", isDark ? "text-white/40 hover:text-rose-400" : "text-slate-400 hover:text-rose-500")}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isMain && isAdmin && !isEditing && (
                <div className="flex justify-end mb-1">
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className={cn("inline-flex items-center gap-1 text-[11px] font-mono transition-colors", isDark ? "text-white/40 hover:text-[#00a4ff]" : "text-slate-400 hover:text-[#00a4ff]")}
                    >
                        <Edit3 className="w-3 h-3" /> Edit
                    </button>
                </div>
            )}

            {isEditing ? (
                <div className="flex flex-col gap-2.5 mt-2">
                    <textarea
                        className={cn(
                            "w-full min-h-[100px] rounded-xl border p-3 text-sm outline-none resize-y",
                            isDark ? "bg-black/40 border-white/15 text-white focus:border-[#00a4ff]" : "bg-slate-50 border-black/15 text-slate-900 focus:border-[#00a4ff]"
                        )}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => { setIsEditing(false); setEditText(currentBody); }}
                            className={cn("px-3 py-1.5 rounded-full text-xs font-mono", isDark ? "text-white/60 hover:bg-white/10" : "text-slate-600 hover:bg-black/5")}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#00a4ff] text-white hover:bg-[#0090e0] flex items-center gap-1.5"
                        >
                            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className={cn(
                    "prose prose-sm max-w-none break-words overflow-x-hidden leading-relaxed",
                    isDark ? "prose-invert text-white/80" : "prose-slate text-slate-700"
                )}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            img: ({ node, ...props }) => {
                                if (!props.src) return null;
                                const safeSrc = typeof props.src === 'string' && (props.src.startsWith('blob:') || props.src.startsWith('data:') || props.src.startsWith('http')) ? props.src : '';
                                return <img {...props} src={safeSrc} alt={props.alt || ''} />;
                            }
                        }}
                    >
                        {currentBody}
                    </ReactMarkdown>
                </div>
            )}

            {images && <ExpandableImageGrid images={images} onOpenImage={onOpenImage} />}

            {logFiles && logFiles.map((log, idx) => (
                <div key={idx} className={cn("mt-3 rounded-xl border overflow-hidden", isDark ? "border-white/10 bg-black/40" : "border-black/10 bg-slate-50")}>
                    <div className={cn("px-3 py-1.5 border-b flex items-center gap-2 text-[11px] font-mono", isDark ? "border-white/10 text-white/50" : "border-black/10 text-slate-500")}>
                        <FileText className="w-3 h-3 text-[#00a4ff]" />
                        <span>{log.name}</span>
                    </div>
                    <pre className={cn("p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap max-h-44", isDark ? "text-white/75" : "text-slate-700")}>
                        {log.content}
                    </pre>
                </div>
            ))}
        </div>
    );
}

// collapsible reply thread posting multipart replies to /api/feedback/reply
function ReplySection({
    threadId,
    initialReplies,
    isAdmin,
    onOpenImage
}: {
    threadId: string;
    initialReplies: any[];
    isAdmin: boolean;
    onOpenImage: (src: string) => void;
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [replyText, setReplyText] = useState('');
    const [localReplies, setLocalReplies] = useState<{ id: string; text: string; username: string; createdAt: Date | string; isVerified?: boolean }[]>(initialReplies || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComposing, setIsComposing] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const addImages = (files: FileList | null) => {
        if (!files) return;
        const allowed = 5 - images.length;
        const next = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, allowed);
        setImages(prev => [...prev, ...next]);
        const newPreviews = next.map(f => URL.createObjectURL(f));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
        setPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const handleReply = async () => {
        if ((!replyText.trim() && images.length === 0) || isSubmitting) return;
        setIsSubmitting(true);
        const username = typeof window !== 'undefined' ? (localStorage.getItem('cw_username') || 'Anonymous') : 'Anonymous';

        const fd = new FormData();
        fd.append('threadId', threadId);
        fd.append('username', username);
        fd.append('text', replyText.trim());
        images.forEach(img => fd.append('images', img));

        try {
            const res = await fetch('/api/feedback/reply', {
                method: 'POST',
                body: fd
            });
            const data = await res.json();

            if (data.success && data.reply) {
                setLocalReplies([...localReplies, data.reply]);
                setReplyText('');
                setImages([]);
                setPreviews([]);
                setIsComposing(false);
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch {
            alert('Failed to post reply.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4">
            {localReplies.length > 0 && (
                <div className={cn("pl-4 border-l ml-1 mt-3", isDark ? "border-white/10" : "border-black/10")}>
                    {localReplies.map(reply => (
                        <CommentEntry
                            key={reply.id}
                            itemId={reply.id}
                            username={reply.username}
                            createdAt={reply.createdAt}
                            body={reply.text}
                            isAdmin={isAdmin}
                            isVerified={reply.isVerified}
                            onOpenImage={onOpenImage}
                        />
                    ))}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                {!isComposing ? (
                    <button
                        type="button"
                        onClick={() => setIsComposing(true)}
                        className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-mono transition-colors",
                            isDark ? "text-white/45 hover:text-[#00a4ff]" : "text-slate-500 hover:text-[#00a4ff]"
                        )}
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reply</span>
                    </button>
                ) : (
                    <div className={cn(
                        "w-full rounded-xl border p-3 flex flex-col gap-2.5",
                        isDark ? "bg-black/30 border-white/10" : "bg-slate-50 border-black/10"
                    )}>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            ref={imageInputRef}
                            onChange={e => addImages(e.target.files)}
                        />
                        <textarea
                            autoFocus
                            className={cn(
                                "w-full min-h-[76px] bg-transparent text-sm outline-none resize-y",
                                isDark ? "text-white/90 placeholder:text-white/30" : "text-slate-800 placeholder:text-slate-400"
                            )}
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                        />

                        {previews.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {previews.map((src, i) => {
                                    const safeSrc = typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http')) ? src : '';
                                    return (
                                        <div key={i} className={cn("relative w-12 h-12 rounded-lg border overflow-hidden group", isDark ? "border-white/15" : "border-black/15")}>
                                            <img src={safeSrc} alt="" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                <X className="w-3.5 h-3.5 text-white" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className={cn("p-1.5 rounded-lg transition-colors", isDark ? "text-white/45 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-800 hover:bg-black/5")}
                                title="Attach image"
                            >
                                <ImageIcon className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsComposing(false)}
                                    className={cn("px-3 py-1 rounded-full text-xs font-mono", isDark ? "text-white/50 hover:text-white" : "text-slate-500 hover:text-slate-800")}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReply}
                                    disabled={(!replyText.trim() && images.length === 0) || isSubmitting}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors",
                                        (!replyText.trim() && images.length === 0) || isSubmitting
                                            ? isDark ? "bg-white/10 text-white/30 cursor-not-allowed" : "bg-black/10 text-slate-400 cursor-not-allowed"
                                            : "bg-[#00a4ff] text-white hover:bg-[#0090e0]"
                                    )}
                                >
                                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <><span>Send</span><Send className="w-3 h-3" /></>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// single editorial feedback card displaying report, tags, attachments, and replies
function EditorialReportCard({
    group,
    isAdmin,
    onOpenImage
}: {
    group: FeedbackGroup;
    isAdmin: boolean;
    onOpenImage: (src: string) => void;
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const first = group.items[0];
    const labels = first.labels && first.labels.length > 0 ? first.labels : [group.source];
    const avatar = getUserAvatar(group.username);

    const handleDeleteThread = async () => {
        if (!confirm('Admin: Delete this entire report?')) return;
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
        <article
            className={cn(
                "rounded-2xl sm:rounded-3xl border p-5 sm:p-6 transition-colors duration-300",
                isDark
                    ? "bg-white/[0.02] border-white/10 hover:border-white/15"
                    : "bg-white border-black/10 hover:border-black/15 shadow-sm"
            )}
        >
            {/* card header: author, verified badge, timestamp, labels, and admin delete */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center font-mono text-xs font-medium shrink-0", avatar.color)}>
                        {avatar.initial}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className={cn("font-outfit text-sm sm:text-base font-normal truncate", isDark ? "text-white" : "text-slate-900")}>
                                {group.username}
                            </span>
                            {first.isVerified && (
                                <span className="text-[#00a4ff]" title="Verified Moderator">
                                    <BadgeCheck className="w-4 h-4" />
                                </span>
                            )}
                        </div>
                        <div className={cn("flex items-center gap-2 font-mono text-[11px]", isDark ? "text-white/40" : "text-slate-400")}>
                            <span>{timeAgo(first.createdAt)}</span>
                            <span>·</span>
                            <span>#{first.id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {labels.map(label => (
                        <span
                            key={label}
                            className={cn("px-2.5 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider", getLabelStyle(label, isDark))}
                        >
                            {label}
                        </span>
                    ))}
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={handleDeleteThread}
                            title="Delete report"
                            className={cn(
                                "p-1.5 rounded-full border transition-colors ml-1",
                                isDark
                                    ? "border-white/10 text-rose-400 hover:bg-rose-500/10"
                                    : "border-black/10 text-rose-500 hover:bg-rose-50"
                            )}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* main report content */}
            <CommentEntry
                itemId={first.id}
                username={group.username}
                createdAt={first.createdAt}
                body={first.text}
                images={first.images}
                logFiles={first.logFiles}
                isMain={true}
                isAdmin={isAdmin}
                isVerified={first.isVerified}
                onOpenImage={onOpenImage}
            />

            {/* additional grouped entries if present */}
            {group.items.slice(1).map(item => (
                <CommentEntry
                    key={item.id}
                    itemId={item.id}
                    username={item.username}
                    createdAt={item.createdAt}
                    body={item.text}
                    images={item.images}
                    logFiles={item.logFiles}
                    isAdmin={isAdmin}
                    isVerified={item.isVerified}
                    onOpenImage={onOpenImage}
                />
            ))}

            <ReplySection
                threadId={first.id}
                initialReplies={first.replies || []}
                isAdmin={isAdmin}
                onOpenImage={onOpenImage}
            />
        </article>
    );
}

// feed container managing shared floaty editorial image lightbox
export function FeedbackCards({ groups, isAdmin }: { groups: FeedbackGroup[]; isAdmin?: boolean }) {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    useEffect(() => {
        if (!lightboxSrc) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxSrc(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [lightboxSrc]);

    return (
        <>
            <div className="flex flex-col gap-5 w-full">
                {groups.map((group, i) => (
                    <EditorialReportCard
                        key={`${group.items[0]?.id ?? group.username}-${i}`}
                        group={group}
                        isAdmin={!!isAdmin}
                        onOpenImage={(src) => setLightboxSrc(src)}
                    />
                ))}
            </div>

            {/* floaty editorial lightbox for inspecting attached feedback screenshots */}
            <AnimatePresence>
                {lightboxSrc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={() => setLightboxSrc(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-[92vw] max-w-[1400px] h-[84vh] rounded-2xl sm:rounded-3xl bg-[#07080f] border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={lightboxSrc} alt="Expanded attachment" className="max-w-full max-h-full object-contain p-3 sm:p-5" />
                            <button
                                type="button"
                                onClick={() => setLightboxSrc(null)}
                                aria-label="Close image"
                                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white/75 hover:text-white border border-white/10 backdrop-blur-md transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
