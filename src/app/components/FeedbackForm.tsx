'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import {
    X, ImagePlus, FileText, Loader2,
    CheckCircle2, AlertCircle, Edit3, Image as ImageIcon, Smile, Paperclip, Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface FeedbackFormProps {
    defaultUsername?: string;
    defaultSource?: 'App' | 'Web';
    appVersion?: string;
    onFeedbackSubmit?: (item: any) => void;
}

type Stage = 'form' | 'submitting' | 'success' | 'error';

const AVAILABLE_LABELS = [
    { name: 'bug', desc: 'Something isn\'t working' },
    { name: 'enhancement', desc: 'New feature or request' },
    { name: 'question', desc: 'Further information is requested' },
    { name: 'help wanted', desc: 'Extra attention is needed' }
];

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

export function FeedbackForm({ defaultUsername, defaultSource = 'Web', appVersion, onFeedbackSubmit }: FeedbackFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [stage,    setStage]    = useState<Stage>('form');
    const [username, setUsername] = useState('');
    const [text,     setText]     = useState('');
    const [images,   setImages]   = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [logFiles, setLogFiles] = useState<File[]>([]);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [errMsg,   setErrMsg]   = useState('');
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

    const imageInputRef = useRef<HTMLInputElement>(null);
    const logInputRef   = useRef<HTMLInputElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);

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
            } catch (err) {}
        };
        fetchIdentity();
    }, [defaultUsername]);

    const addImages = useCallback(async (files: FileList | null) => {
        if (!files) return;
        const allowed = 2 - images.length;
        const next = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, allowed);
        
        // Simulating image process since we don't have the canvas code here for brevity
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
        if (selectedLabels.includes(label)) {
            setSelectedLabels(prev => prev.filter(l => l !== label));
        } else {
            setSelectedLabels(prev => [...prev, label]);
        }
    };

    const handleSubmit = async () => {
        const trimmedUsername = username.trim() || 'Anonymous';
        
        if (!text.trim() && images.length === 0 && logFiles.length === 0) {
            setErrMsg('Write something, attach an image, or upload a log.');
            return;
        }
        setStage('submitting');
        setErrMsg('');

        localStorage.setItem('cw_username', trimmedUsername);
        
        const fd = new FormData();
        fd.append('username', trimmedUsername);
        fd.append('text',     text.trim());
        fd.append('source',   defaultSource);
        if (appVersion) fd.append('appVersion', appVersion);
        images.forEach(img => fd.append('images', img));
        selectedLabels.forEach(label => fd.append('labels', label));
        logFiles.forEach(log => fd.append('logFiles', log));

        try {
            const res  = await fetch('/api/feedback', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok) { setErrMsg(data.error ?? 'Something went wrong.'); setStage('form'); return; }
            if (data.data && onFeedbackSubmit) {
                onFeedbackSubmit(data.data);
            }
            setStage('success');
            setText(''); setImages([]); setPreviews([]); setLogFiles([]); setSelectedLabels([]);
        } catch {
            setErrMsg('Network error. Please try again.');
            setStage('form');
        }
    };

    const myAvatar = getUserAvatar(username || 'A');

    return (
        <div className={`text-[#c9d1d9] font-sans w-full max-w-[900px] mx-auto rounded-xl bg-[#010409] border-[6px] p-6 sm:p-8 ${isDark ? 'border-white/5 shadow-xl shadow-black/50' : 'border-indigo-50/80 shadow-xl shadow-indigo-900/10'}`}>
            {(stage === 'form' || stage === 'submitting' || stage === 'error') && (
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Main Form Area */}
                    <div className="flex-1 flex gap-4">
                        <div className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center flex-shrink-0 text-white font-bold text-sm ${myAvatar.color}`}>
                            {myAvatar.initial}
                        </div>
                        <div className="flex-1 border border-[#30363d] rounded-md bg-[#0d1117] flex flex-col relative">
                            {/* Pointer Arrow */}
                            <div className="hidden sm:block absolute left-[-6px] top-4 w-3 h-3 bg-[#0d1117] border-l border-t border-[#30363d] rotate-[-45deg] z-10" />
                            
                            <div className="bg-[#161b22] border-b border-[#30363d] rounded-t-md">
                                <div className="p-3 border-b border-[#30363d]">
                                    <input
                                        ref={usernameInputRef}
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        maxLength={64}
                                        placeholder="Enter Any Username (ex. CuteChud911)"
                                        className="w-full bg-transparent text-[16px] text-[#c9d1d9] outline-none placeholder-[#8b949e] font-semibold"
                                    />
                                </div>
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
                                <div className="bg-[#0d1117] border border-[#30363d] rounded-md focus-within:border-[#8b949e]">
                                    <div className="px-2 py-1.5 flex gap-1 border-b border-[#30363d] bg-[#0d1117] rounded-t-md">
                                        <button className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] rounded hover:bg-[#21262d]"><Edit3 className="w-4 h-4" /></button>
                                        <button onClick={() => imageInputRef.current?.click()} className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] rounded hover:bg-[#21262d]" title="Upload images"><ImageIcon className="w-4 h-4" /></button>
                                        <button onClick={() => logInputRef.current?.click()} className="p-1.5 text-[#8b949e] hover:text-[#c9d1d9] rounded hover:bg-[#21262d]" title="Upload logs"><FileText className="w-4 h-4" /></button>
                                    </div>
                                    {activeTab === 'write' ? (
                                        <textarea 
                                            className="w-full min-h-[200px] bg-transparent text-[14px] text-[#c9d1d9] p-3 resize-y outline-none font-sans"
                                            placeholder="Leave a comment"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                        />
                                    ) : (
                                        <div className="w-full min-h-[200px] p-4 text-[14px] text-[#c9d1d9] font-sans">
                                            {text ? (
                                                <div className="prose prose-invert prose-sm max-w-none break-words overflow-x-hidden">
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            img: ({node, ...props}) => {
                                                                if (!props.src) return null;
                                                                return <img {...props} alt={props.alt || ''} />;
                                                            }
                                                        }}
                                                    >
                                                        {text}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div className="text-[#8b949e]">Nothing to preview</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Previews */}
                                    {(previews.length > 0 || logFiles.length > 0) && (
                                        <div className="px-3 pb-3 flex flex-wrap gap-2">
                                            {previews.map((src, i) => (
                                                <div key={i} className="relative w-16 h-16 rounded border border-[#30363d] overflow-hidden group">
                                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                                    <button onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            {logFiles.map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9]">
                                                    <FileText className="w-3 h-3" />
                                                    <span className="truncate max-w-[100px]">{f.name}</span>
                                                    <button onClick={() => removeLog(i)} className="text-[#8b949e] hover:text-white"><X className="w-3 h-3" /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between px-3 py-2 border-t border-[#30363d] border-dashed">
                                        <span className="text-xs text-[#8b949e] flex items-center gap-1"><Paperclip className="w-3 h-3"/> Attach files by clicking the toolbar icons</span>
                                        <button className="text-[#8b949e] hover:text-[#c9d1d9]"><Smile className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                {errMsg && (
                                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-400 text-sm">
                                        <AlertCircle className="w-4 h-4" /> {errMsg}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-2 flex justify-between items-center bg-[#0d1117] rounded-b-md border-t border-[#30363d]">
                                <span className="text-[#8b949e] text-xs flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Markdown supported</span>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={(!text.trim() && images.length === 0 && logFiles.length === 0) || stage === 'submitting'}
                                    className={`px-4 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                                        (!text.trim() && images.length === 0 && logFiles.length === 0) || stage === 'submitting'
                                            ? 'bg-[#238636]/50 text-white/50 cursor-not-allowed' 
                                            : 'bg-[#238636] text-white hover:bg-[#2ea043]'
                                    }`}
                                >
                                    {stage === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit new issue'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Labels */}
                    <div className="w-full md:w-56 flex-shrink-0">
                        <div className="border-b border-[#30363d] pb-2 mb-2">
                            <span className="text-[#8b949e] text-xs font-semibold flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5" /> Labels
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {AVAILABLE_LABELS.map(label => {
                                const isSelected = selectedLabels.includes(label.name);
                                return (
                                    <button 
                                        key={label.name}
                                        onClick={() => toggleLabel(label.name)}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors ${isSelected ? 'bg-[#21262d] text-white' : 'text-[#8b949e] hover:bg-[#161b22]'}`}
                                    >
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ 
                                            backgroundColor: label.name === 'bug' ? '#d73a49' : label.name === 'enhancement' ? '#a2eeef' : label.name === 'question' ? '#d876e3' : '#008672'
                                        }} />
                                        <div>
                                            <div className={isSelected ? 'font-semibold' : ''}>{label.name}</div>
                                            {isSelected && <div className="text-[10px] text-[#8b949e]">{label.desc}</div>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {stage === 'success' && (
                <div className="flex flex-col items-center justify-center py-20 border border-[#30363d] rounded-xl bg-[#0d1117]">
                    <CheckCircle2 className="w-12 h-12 text-[#238636] mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Issue submitted!</h3>
                    <p className="text-[#8b949e] text-sm mb-6">Your feedback is now live on the board.</p>
                    <button 
                        onClick={() => setStage('form')}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                        Submit another issue
                    </button>
                </div>
            )}

            <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={(e) => { addImages(e.target.files); e.currentTarget.value = ''; }} className="hidden" />
            <input ref={logInputRef} type="file" accept=",.log,.txt,text/plain" multiple onChange={(e) => { addLogs(e.target.files); e.currentTarget.value = ''; }} className="hidden" />
        </div>
    );
}
