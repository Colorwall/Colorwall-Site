"use client";

import { motion } from "framer-motion";
import { Download, Github, Loader2, Package } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useEffect, useState } from "react";

interface ReleaseAsset {
    name: string;
    download_count: number;
    browser_download_url: string;
    size: number;
}

interface Release {
    id: number;
    name: string;
    tag_name: string;
    published_at: string;
    body: string;
    html_url: string;
    prerelease: boolean;
    assets: ReleaseAsset[];
}

export default function ChangelogPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const bgColor = isDark ? "bg-[#0a0a0a]" : "bg-white";
    const textColor = isDark ? "text-white" : "text-black";
    const mutedText = isDark ? "text-white/60" : "text-black/60";
    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const codeBg = isDark ? "bg-white/5" : "bg-black/5";

    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchReleases() {
            try {
                const res = await fetch("https://api.github.com/repos/colorwall/colorwall/releases");
                if (res.ok) {
                    const data = await res.json();
                    setReleases(data);
                }
            } catch (error) {
                console.error("Failed to fetch releases:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReleases();
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options).toUpperCase();
    };

    const renderMarkdown = (text: string) => {
        if (!text) return null;

        // Basic parser for GitHub Release body
        const lines = text.split('\n');

        return (
            <div className={`mt-6 flex flex-col gap-1.5 ${mutedText} text-sm leading-relaxed`}>
                {lines.map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;

                    if (trimmed === '---') {
                        return <div key={idx} className={`w-full h-px my-4 ${borderColor}`} />;
                    }

                    // Headers
                    if (trimmed.startsWith('### ')) {
                        return <h3 key={idx} className={`font-bold text-sm uppercase tracking-wide opacity-80 mt-6 mb-1 ${textColor}`}>{trimmed.replace('###', '').trim()}</h3>;
                    }
                    if (trimmed.startsWith('## ')) {
                        return <h2 key={idx} className={`font-bold text-base uppercase tracking-wide opacity-90 mt-8 mb-2 ${textColor}`}>{trimmed.replace('##', '').trim()}</h2>;
                    }
                    if (trimmed.startsWith('# ')) {
                        return <h1 key={idx} className={`font-bold text-lg uppercase tracking-wide mt-8 mb-2 ${textColor}`}>{trimmed.replace('#', '').trim()}</h1>;
                    }

                    // Lists
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                        let content = trimmed.substring(2);
                        const parts = content.split(/(\*\*.*?\*\*)/g);

                        return (
                            <div key={idx} className="flex gap-3 items-start ml-1 py-0.5">
                                <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-white/40' : 'bg-black/40'}`} />
                                <span className="opacity-90">
                                    {parts.map((part, i) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                            return <strong key={i} className={`font-bold opacity-100 ${textColor}`}>{part.slice(2, -2)}</strong>;
                                        }
                                        return part;
                                    })}
                                </span>
                            </div>
                        );
                    }

                    // HTML Images
                    if (trimmed.startsWith('<img')) {
                        return (
                            <div
                                key={idx}
                                className="my-6 rounded-xl overflow-hidden shadow-lg border border-current/10"
                                dangerouslySetInnerHTML={{ __html: trimmed }}
                            />
                        );
                    }

                    // Paragraphs
                    const parts = trimmed.split(/(\*\*.*?\*\*)/g);
                    return (
                        <p key={idx} className="mb-2 opacity-90">
                            {parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={i} className={`font-bold opacity-100 ${textColor}`}>{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            })}
                        </p>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${bgColor} ${textColor} font-sans selection:bg-blue-500/30`}>
            <main className="pt-28 pb-20 px-4 sm:px-6">
                <div className="w-[95%] sm:w-[90%] md:w-[85%] lg:w-[75%] xl:w-[65%] max-w-6xl mx-auto transition-all duration-500 ease-out">

                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                            Changelog
                        </h1>
                        <p className={`text-lg ${mutedText} mb-8`}>
                            Stay up to date with the latest releases, performance improvements, and bug fixes.
                        </p>

                        <a
                            href="https://github.com/colorwall/colorwall/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl
                                ${isDark ? "bg-white text-black hover:shadow-white/10" : "bg-black text-white hover:shadow-black/10"}`}
                        >
                            <Github size={18} />
                            View on GitHub
                        </a>
                    </motion.div>

                    {/* Releases Loading */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className={`animate-spin ${mutedText}`} size={32} />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-14">
                            {releases.length === 0 ? (
                                <p className={mutedText}>No releases found.</p>
                            ) : (
                                releases.map((release, index) => {
                                    const isLatest = index === 0;
                                    const isPreRelease = release.prerelease && !isLatest;

                                    const itemBorderColor = isLatest
                                        ? "border-blue-500"
                                        : isPreRelease
                                            ? "border-yellow-500/40 opacity-90"
                                            : "border-emerald-500/40 opacity-90";

                                    const badgeBg = isLatest
                                        ? "bg-blue-500/10 text-blue-500"
                                        : isPreRelease
                                            ? "bg-yellow-500/10 text-yellow-500"
                                            : "bg-emerald-500/10 text-emerald-500";

                                    const badgeText = isLatest ? "LATEST" : (isPreRelease ? "PRE-RELEASE" : "RELEASE");

                                    return (
                                        <motion.div
                                            key={release.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`border-l-2 ${itemBorderColor} pl-6`}
                                        >
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h2 className={`font-bold tracking-tight ${isLatest ? 'text-3xl' : 'text-xl'}`}>
                                                    {release.name || release.tag_name}
                                                </h2>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${badgeBg}`}>
                                                    {badgeText}
                                                </span>
                                            </div>

                                            <p className={`text-sm opacity-50 font-mono mb-4`}>
                                                {formatDate(release.published_at)}
                                            </p>

                                            {renderMarkdown(release.body)}

                                            {/* Downloads Section */}
                                            {release.assets && release.assets.length > 0 && (
                                                <div className="mt-8 pt-6 border-t border-current/10">
                                                    <h3 className="font-bold text-sm tracking-wide opacity-70 mb-4 flex items-center gap-2">
                                                        <Package size={16} /> ASSETS
                                                    </h3>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {release.assets.map(asset => (
                                                            <a
                                                                key={asset.id}
                                                                href={asset.browser_download_url}
                                                                className={`flex items-center justify-between p-3 rounded-xl border ${borderColor} ${codeBg} hover:opacity-80 transition-opacity`}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-black/10'} shrink-0`}>
                                                                        <Download size={14} />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-sm font-semibold truncate text-left">{asset.name}</div>
                                                                        <div className={`text-xs ${mutedText} font-mono truncate text-left`}>
                                                                            {formatBytes(asset.size)} • {asset.download_count} DLs
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer theme={theme} />
        </div>
    );
}
