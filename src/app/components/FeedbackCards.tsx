'use client';

import { useState, useRef } from 'react';
import { Tag, Trash2, Loader2, PlaySquare, Eye, Edit3, Image as ImageIcon, Smile, Paperclip, Check, X, BadgeCheck } from 'lucide-react';
import { useTheme } from '@/app/contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface FeedbackItem {
    id:        string;
    username:  string;
    text:      string;
    images:    string[];
    logFiles?: { name: string, content: string }[];
    appVersion?: string;
    source:    'App' | 'Web';
    labels?:   string[];
    isVerified?: boolean;
    createdAt: Date | string;
    replies?:  { id: string; username: string; text: string; createdAt: Date | string, isVerified?: boolean }[];
}

export interface FeedbackGroup {
    username: string;
    source:   'App' | 'Web';
    items:    FeedbackItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUserAvatar(name: string) {
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const colors = [
        'bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 
        'bg-rose-600', 'bg-amber-600', 'bg-fuchsia-600'
    ];
    return {
        color: colors[hash % colors.length],
        initial: name.charAt(0).toUpperCase()
    };
}

function timeAgo(date: Date | string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60)     return `${diff} seconds ago`;
    if (diff < 3600)   return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getLabelColor(label: string) {
    const map: Record<string, string> = {
        'bug': 'border-rose-500/30 text-rose-400',
        'enhancement': 'border-sky-500/30 text-sky-400',
        'question': 'border-fuchsia-500/30 text-fuchsia-400',
        'help wanted': 'border-emerald-500/30 text-emerald-400',
        'App': 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
        'Web': 'border-teal-500/30 text-teal-400 bg-teal-500/10',
        'feedback': 'border-zinc-500/30 text-zinc-400'
    };
    return map[label] || 'border-zinc-500/30 text-zinc-400';
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ExpandableImageGrid({ images }: { images: string[] }) {
    const validImages = images.filter(Boolean);
    if (validImages.length === 0) return null;
    return (
        <div className={`mt-3 grid gap-2 ${validImages.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-2 max-w-md'}`}>
            {validImages.map((src, idx) => (
                <a key={idx} href={src} target="_blank" rel="noreferrer"
                    className="relative block overflow-hidden rounded-lg border border-[#30363d]"
                    style={{ aspectRatio: validImages.length === 1 ? '16/9' : '1/1' }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http')) ? src : ''} alt="" className="w-full h-full object-cover" loading="lazy" />
                </a>
            ))}
        </div>
    );
}

function CommentBox({ 
    username, 
    createdAt, 
    body, 
    images, 
    logFiles, 
    isMain,
    itemId,
    isAdmin,
    isVerified
}: { 
    username: string, 
    createdAt: Date | string, 
    body: string, 
    images?: string[], 
    logFiles?: { name: string, content: string }[],
    isMain?: boolean,
    itemId: string,
    isAdmin: boolean,
    isVerified?: boolean
}) {
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
                alert("Failed to save edit.");
            }
        } catch {
            alert("Error saving edit.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex gap-4 relative">
            {/* Vertical Thread Line */}
            <div className="absolute left-4 top-8 bottom-[-24px] w-[2px] bg-[#21262d] -translate-x-1/2 z-0" />
            
            {/* Avatar */}
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${avatar.color}`}>
                {avatar.initial}
            </div>

            {/* Comment Body */}
            <div className="flex-1 relative mb-6 min-w-0">
                {/* Pointer Arrow */}
                <div className="absolute left-[-6px] top-3 w-3 h-3 bg-[#161b22] border-l border-t border-[#30363d] rotate-[-45deg]" />
                
                <div className={`border border-[#30363d] rounded-md overflow-hidden ${isMain ? 'bg-[#0d1117]' : 'bg-[#0d1117]'}`}>
                    <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
                        <div className="flex flex-wrap items-center gap-1.5 text-[#8b949e] min-w-0">
                            <span className="font-semibold text-[#c9d1d9] truncate max-w-[120px] sm:max-w-none">{username}</span>
                            {isVerified && (
                                <span className="text-blue-500" title="Verified Moderator">
                                    <BadgeCheck className="w-4 h-4 fill-blue-500 text-[#161b22]" />
                                </span>
                            )}
                            <span>commented</span>
                            <span>{timeAgo(createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {isMain && (
                                <span className="border border-[#30363d] text-[#8b949e] px-2 py-0.5 rounded-full text-xs font-semibold">
                                    Author
                                </span>
                            )}
                            {isAdmin && !isEditing && (
                                <button onClick={() => setIsEditing(true)} className="text-[#8b949e] hover:text-indigo-400 p-1 rounded-md hover:bg-[#30363d] transition-colors">
                                    <Edit3 className="w-3.5 h-3.5" />
                                </button>
                            )}
                            {isAdmin && !isMain && (
                                <button onClick={async () => {
                                    if(confirm('Delete reply?')) {
                                        await fetch(`/api/feedback/${itemId}?type=reply`, { method: 'DELETE' });
                                        window.location.reload();
                                    }
                                }} className="text-[#8b949e] hover:text-rose-400 p-1 rounded-md hover:bg-[#30363d] transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="p-4 text-[14px] leading-relaxed text-[#c9d1d9] font-sans">
                        {isEditing ? (
                            <div className="flex flex-col gap-3">
                                <textarea 
                                    className="w-full min-h-[120px] bg-[#0d1117] border border-[#30363d] rounded-md p-3 text-[#c9d1d9] focus:border-indigo-500 outline-none"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setIsEditing(false); setEditText(currentBody); }} className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#8b949e] hover:text-white bg-[#21262d] border border-[#30363d]">Cancel</button>
                                    <button onClick={handleSaveEdit} disabled={isSaving} className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] flex items-center gap-1">
                                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-sm max-w-none break-words overflow-x-hidden">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        img: ({node, ...props}) => {
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
                        
                        {images && <ExpandableImageGrid images={images} />}
                        {logFiles && logFiles.map((log, idx) => (
                            <div key={idx} className="mt-3 rounded-md border border-[#30363d] overflow-hidden">
                                <div className="bg-[#161b22] border-b border-[#30363d] px-3 py-2 text-xs font-mono text-[#8b949e]">
                                    {log.name}
                                </div>
                                <div className="p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-48 bg-[#0d1117] text-[#c9d1d9]">
                                    {log.content}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReplySection({ threadId, initialReplies, isAdmin }: { threadId: string, initialReplies: any[], isAdmin: boolean }) {
    const [replyText, setReplyText] = useState('');
    const [localReplies, setLocalReplies] = useState<{id: string, text: string, username: string, createdAt: Date, isVerified?: boolean}[]>(initialReplies || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
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
                setActiveTab('write');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch {
            alert('Failed to post reply.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const myAvatar = typeof window !== 'undefined' ? getUserAvatar(localStorage.getItem('cw_username') || 'A') : getUserAvatar('A');

    return (
        <div className="mt-2">
            {/* Show Replies */}
            {localReplies.map(reply => (
                <CommentBox 
                    key={reply.id} 
                    itemId={reply.id}
                    username={reply.username} 
                    createdAt={reply.createdAt} 
                    body={reply.text} 
                    isAdmin={isAdmin}
                    isVerified={reply.isVerified}
                />
            ))}

            {/* Reply Input */}
            <div className="flex gap-4 relative mt-6">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${myAvatar.color}`}>
                    {myAvatar.initial}
                </div>
                <div className="flex-1 relative min-w-0">
                    <div className="absolute left-[-6px] top-3 w-3 h-3 bg-[#0d1117] border-l border-t border-[#30363d] rotate-[-45deg] z-10" />
                    <div className="border border-[#30363d] rounded-md bg-[#0d1117] flex flex-col">
                        <div className="bg-[#161b22] border-b border-[#30363d] rounded-t-md">
                            <div className="flex px-2 pt-2 gap-1">
                                <button 
                                    onClick={() => setActiveTab('write')}
                                    className={`px-4 py-2 text-sm rounded-t-md transition-colors ${activeTab === 'write' ? 'bg-[#0d1117] text-[#c9d1d9] border border-b-0 border-[#30363d]' : 'text-[#8b949e] hover:text-[#c9d1d9] border border-transparent'}`}
                                >
                                    Write
                                </button>
                                <button 
                                    onClick={() => setActiveTab('preview')}
                                    className={`px-4 py-2 text-sm rounded-t-md transition-colors ${activeTab === 'preview' ? 'bg-[#0d1117] text-[#c9d1d9] border border-b-0 border-[#30363d]' : 'text-[#8b949e] hover:text-[#c9d1d9] border border-transparent'}`}
                                >
                                    Preview
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-2 relative bg-[#0d1117]">
                            <div 
                                className={`bg-[#0d1117] border rounded-md transition-colors ${isDragging ? 'border-indigo-500 bg-[#161b22]' : 'border-[#30363d] focus-within:border-[#8b949e]'}`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                        addImages(e.dataTransfer.files);
                                    }
                                }}
                            >
                                <input type="file" multiple accept="image/*" className="hidden" ref={imageInputRef} onChange={e => addImages(e.target.files)} />
                                <div className="px-2 py-1.5 flex gap-1 border-b border-[#30363d] bg-[#0d1117] rounded-t-md">
                                    <button className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] rounded hover:bg-[#21262d]"><Edit3 className="w-4 h-4" /></button>
                                    <button onClick={() => imageInputRef.current?.click()} className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] rounded hover:bg-[#21262d]"><ImageIcon className="w-4 h-4" /></button>
                                </div>
                                {activeTab === 'write' ? (
                                    <textarea 
                                        className="w-full min-h-[100px] bg-transparent text-[14px] text-[#c9d1d9] p-3 resize-y outline-none"
                                        placeholder="Leave a comment"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                ) : (
                                    <div className="w-full min-h-[100px] p-4 text-[14px] text-[#c9d1d9] font-sans">
                                        {replyText ? (
                                            <div className="prose prose-invert prose-sm max-w-none break-words overflow-x-hidden">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        img: ({node, ...props}) => {
                                                            if (!props.src) return null;
                                                            const safeSrc = typeof props.src === 'string' && (props.src.startsWith('blob:') || props.src.startsWith('data:') || props.src.startsWith('http')) ? props.src : '';
                                                            return <img {...props} src={safeSrc} alt={props.alt || ''} />;
                                                        }
                                                    }}
                                                >
                                                    {replyText}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="text-[#8b949e]">Nothing to preview</div>
                                        )}
                                    </div>
                                )}
                                
                                {previews.length > 0 && (
                                    <div className="px-3 pb-3 flex flex-wrap gap-2">
                                        {previews.map((src, i) => (
                                            <div key={i} className="relative w-16 h-16 rounded border border-[#30363d] overflow-hidden group">
                                                {/* CodeQL fix: sanitize image src */}
                                                <img src={typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http')) ? src : ''} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between px-3 py-2 border-t border-[#30363d] border-dashed">
                                    <span className="text-xs text-[#8b949e] flex items-center gap-1"><Paperclip className="w-3 h-3"/> Attach files by dragging & dropping</span>
                                    <button className="text-[#8b949e] hover:text-[#c9d1d9]"><Smile className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-2 flex justify-end gap-2 bg-[#0d1117] rounded-b-md">
                            <button 
                                onClick={handleReply}
                                disabled={(!replyText.trim() && images.length === 0) || isSubmitting}
                                className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                                    (!replyText.trim() && images.length === 0) || isSubmitting 
                                        ? 'bg-[#238636]/50 text-white/50 cursor-not-allowed' 
                                        : 'bg-[#238636] text-white hover:bg-[#2ea043]'
                                }`}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Comment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** 
 * Github Issue Thread Card
 */
function IssueCard({ group, index, isAdmin }: { group: FeedbackGroup; index: number; isAdmin: boolean }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const first = group.items[0];
    const labels = first.labels || ['feedback', group.source];

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
        <div 
            className={`mb-12 rounded-xl overflow-hidden text-[#c9d1d9] font-sans bg-[#010409] border-[6px] p-2 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both ${isDark ? 'border-white/5 shadow-xl shadow-black/50' : 'border-indigo-50/80 shadow-xl shadow-indigo-900/10'}`}
            style={{ animationDelay: `${(index % 5) * 100}ms` }}
        >
            {/* Header */}
            <div className="p-5 border-b border-[#30363d] bg-[#0d1117]">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-normal tracking-tight flex flex-wrap items-center gap-2 mb-2 break-words">
                            Feedback from <span className="truncate max-w-[150px] sm:max-w-none">{group.username}</span>
                            <span className="text-[#8b949e] font-light text-sm sm:text-base">#{first.id}</span>
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-[#238636] text-white px-3 py-1 rounded-full text-[13px] font-medium flex items-center gap-1.5 flex-shrink-0">
                                <PlaySquare className="w-3.5 h-3.5" />
                                Open
                            </span>
                            <span className="text-[#8b949e] text-[13px] break-words">
                                <span className="font-semibold text-[#c9d1d9]">{group.username}</span> opened this issue {timeAgo(first.createdAt)}
                            </span>
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={handleDeleteThread} className="text-rose-500 hover:text-rose-400 p-2 border border-[#30363d] rounded-md bg-[#21262d] transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-5">
                {/* Main Issue Comment */}
                <CommentBox 
                    itemId={first.id}
                    username={group.username} 
                    createdAt={first.createdAt} 
                    body={first.text} 
                    images={first.images} 
                    logFiles={first.logFiles} 
                    isMain={true}
                    isAdmin={isAdmin}
                    isVerified={first.isVerified}
                />

                {/* Timeline Tag Event */}
                {labels.length > 0 && (
                    <div className="flex gap-4 relative mb-6">
                        <div className="absolute left-4 top-0 bottom-[-24px] w-[2px] bg-[#21262d] -translate-x-1/2 z-0" />
                        <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#21262d] border border-[#30363d]">
                            <Tag className="w-3.5 h-3.5 text-[#8b949e]" />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#8b949e] py-1.5 min-w-0">
                            <span className="font-semibold text-[#c9d1d9] truncate max-w-[120px] sm:max-w-none">{group.username}</span>
                            added
                            <div className="flex flex-wrap gap-1">
                                {labels.map(label => (
                                    <span key={label} className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getLabelColor(label)} whitespace-nowrap`}>
                                        {label}
                                    </span>
                                ))}
                            </div>
                            <span>{timeAgo(first.createdAt)}</span>
                        </div>
                    </div>
                )}

                {/* Additional Comments by Author (if grouped) */}
                {group.items.slice(1).map(item => (
                    <CommentBox 
                        key={item.id}
                        itemId={item.id}
                        username={item.username} 
                        createdAt={item.createdAt} 
                        body={item.text} 
                        images={item.images} 
                        logFiles={item.logFiles} 
                        isAdmin={isAdmin}
                        isVerified={item.isVerified}
                    />
                ))}

                {/* Replies / Comments */}
                <ReplySection 
                    threadId={first.id} 
                    initialReplies={first.replies || []} 
                    isAdmin={isAdmin}
                />
            </div>
        </div>
    );
}

// ─── Feed ──────────────────────────────────────────────────────────────────────

export function FeedbackCards({ groups, isAdmin }: { groups: FeedbackGroup[], isAdmin?: boolean }) {
    return (
        <div className="flex flex-col gap-6 max-w-[900px] mx-auto w-full">
            {groups.map((group, i) => (
                <IssueCard key={`${group.username}-${i}`} group={group} index={i} isAdmin={!!isAdmin} />
            ))}
        </div>
    );
}
