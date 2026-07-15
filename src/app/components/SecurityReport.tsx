"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
    ShieldCheck,
    ShieldAlert,
    Copy,
    CheckCircle2,
    ExternalLink,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { GradientHeading } from "./landing/GradientHeading";

interface VTReport {
    status: string;
    name: string;
    size: number;
    date: string;
    sha256: string;
    md5: string;
    sha1: string;
    stats?: {
        harmless: number;
        malicious: number;
        suspicious: number;
        undetected: number;
        timeout: number;
    } | null;
    link: string;
}

export const SecurityReport = ({
    theme = "dark",
    className = "",
}: {
    theme?: "dark" | "light";
    className?: string;
}) => {
    const [vtReport, setVtReport] = useState<VTReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedHash, setCopiedHash] = useState<string | null>(null);

    const isDark = theme === "dark";

    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, margin: "200px" });

    useEffect(() => {
        if (!isInView) return;

        const cached = sessionStorage.getItem("vtReportCache");
        if (cached) {
            setVtReport(JSON.parse(cached));
            setIsLoading(false);
            return;
        }

        fetch("/api/virustotal")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) {
                    setVtReport(data);
                    sessionStorage.setItem("vtReportCache", JSON.stringify(data));
                }
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [isInView]);

    const isClean =
        !vtReport?.stats?.malicious && !vtReport?.stats?.suspicious;
    const totalEngines = vtReport?.stats
        ? vtReport.stats.harmless +
          vtReport.stats.malicious +
          vtReport.stats.suspicious +
          vtReport.stats.undetected
        : 0;

    const copy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedHash(key);
        setTimeout(() => setCopiedHash(null), 2000);
    };

    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const mutedText = isDark ? "text-white/50" : "text-black/60";
    const cardBg = isDark ? "bg-white/[0.03]" : "bg-black/[0.03]";
    const hoverBg = isDark
        ? "hover:bg-white/[0.06]"
        : "hover:bg-black/[0.06]";

    const hashes = [
        { key: "SHA-256", value: vtReport?.sha256 },
        { key: "MD5", value: vtReport?.md5 },
        { key: "SHA-1", value: vtReport?.sha1 },
    ];

    const details = [
        {
            label: "File",
            value: vtReport?.name ?? "—",
        },
        {
            label: "Size",
            value: vtReport
                ? `${(vtReport.size / 1024 / 1024).toFixed(2)} MB`
                : "—",
        },
        { label: "Format", value: "Win32 EXE · NSIS" },
        {
            label: "Published",
            value: vtReport?.date
                ? new Date(vtReport.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  })
                : "—",
        },
    ];

    return (
        <section
            ref={ref}
            className={`py-24 px-4 sm:px-8 relative w-full flex justify-center overflow-hidden ${className}`}
        >

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-20 items-start relative z-10">
                {/* ════ left: heading + status ════ */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col justify-center"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className={`h-[1px] w-8 ${isDark ? "bg-emerald-500/50" : "bg-emerald-600/50"}`}></span>
                        <p className={`text-[10px] font-mono uppercase tracking-[0.3em] ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                            Verification System
                        </p>
                    </div>

                    <h2 className={`text-5xl md:text-6xl lg:text-7xl font-outfit font-[200] tracking-[-0.06em] leading-[0.95] mb-3 ${isDark ? "text-white" : "text-black"}`}>
                        Zero trust.
                    </h2>
                    <GradientHeading
                        text="100% Verified."
                        theme={theme}
                        className="text-4xl sm:text-5xl lg:text-6xl font-anurati tracking-widest uppercase leading-tight"
                    />

                    <p className={`text-[15px] leading-relaxed mt-6 max-w-md ${mutedText}`}>
                        Every release is automatically scanned via the VirusTotal API. Hashes are computed directly from the live binary and verified against 70+ antivirus engines in real time.
                    </p>

                    {/* live status badge - premium glass styling */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className={`mt-10 relative group inline-flex self-start`}
                    >
                        <div className={`absolute -inset-1 rounded-2xl blur-md opacity-20 transition-opacity group-hover:opacity-40 ${
                            isClean ? "bg-emerald-500" : "bg-red-500"
                        }`}></div>
                        
                        <div className={`relative flex items-center gap-5 px-6 py-4 rounded-2xl border backdrop-blur-xl transition-colors
                            ${isDark ? 'bg-black/50 border-white/10 hover:border-white/20' : 'bg-white/50 border-black/10 hover:border-black/20'}
                        `}>
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                                isClean ? (isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-500/10 text-emerald-600") 
                                        : (isDark ? "bg-red-500/10 text-red-400" : "bg-red-500/10 text-red-600")
                            }`}>
                                {isLoading ? <Loader2 size={24} className="animate-spin" /> 
                                           : isClean ? <ShieldCheck size={24} /> 
                                                     : <ShieldAlert size={24} />}
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[15px] font-bold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                                        {isLoading ? "Scanning Payload..." : isClean ? "All Clear" : "Threat Detected"}
                                    </span>
                                    {!isLoading && vtReport?.stats && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                            isClean ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                                    : "bg-red-500/15 text-red-400 border border-red-500/20"
                                        }`}>
                                            {vtReport.stats.harmless}/{totalEngines} Clean
                                        </span>
                                    )}
                                </div>
                                <p className={`text-[11px] font-mono mt-1 ${mutedText}`}>
                                    {isLoading ? "Awaiting API response..." 
                                               : isClean ? "0 engines detected any threat" 
                                                         : `${vtReport?.stats?.malicious} engines flagged this file`}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* cta button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 }}
                        className="mt-8"
                    >
                        <a
                            href={vtReport?.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
                                isDark ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black"
                            }`}
                        >
                            <ExternalLink size={14} />
                            View VirusTotal Report
                        </a>
                    </motion.div>
                </motion.div>

                {/* ════ right: hashes + details (Dom layout, no overarching card) ════ */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-12 lg:pt-4"
                >
                    {/* ── binary details section ── */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${isDark ? "text-white/60" : "text-black/60"}`}>
                                Binary Signature
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                            {details.map(({ label, value }) => (
                                <div key={label} className="flex flex-col">
                                    <span className={`text-[10px] font-mono uppercase tracking-[0.1em] mb-1.5 ${isDark ? "text-white/50" : "text-black/50"}`}>
                                        {label}
                                    </span>
                                    <span className={`text-sm font-outfit font-[300] tracking-wide truncate ${isDark ? "text-white" : "text-black"}`}>
                                        {isLoading ? "…" : value}
                                    </span>
                                </div>
                            ))}
                            <div className="col-span-2 flex flex-col">
                                <span className={`text-[10px] font-mono uppercase tracking-[0.1em] mb-1.5 ${isDark ? "text-white/50" : "text-black/50"}`}>
                                    Code Signing
                                </span>
                                <div className="flex items-center gap-2.5 text-sm font-outfit font-[300] tracking-wide text-amber-400">
                                    {/* <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                    </span> */}
                                    Unsigned Community Release
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── hashes section ── */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${isDark ? "text-white/60" : "text-black/60"}`}>
                                Cryptographic Hashes
                            </span>
                        </div>

                        <div className="space-y-3">
                            {hashes.map(({ key, value }) => (
                                <div
                                    key={key}
                                    onClick={() => !isLoading && value && copy(value, key)}
                                    className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 overflow-hidden ${
                                        !isLoading && value
                                            ? `cursor-pointer hover:-translate-y-0.5 ${isDark ? "bg-white/[0.04] hover:bg-white/[0.08] border-white/10" : "bg-black/[0.04] hover:bg-black/[0.08] border-black/10"}`
                                            : `cursor-not-allowed opacity-50 ${isDark ? "bg-white/[0.02] border-white/5" : "bg-black/[0.02] border-black/5"}`
                                    }`}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <span className={`text-[10px] font-mono font-bold tracking-widest w-16 shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                                            {key}
                                        </span>
                                        <span className={`text-[11px] font-mono truncate ${isDark ? "text-white/80 group-hover:text-white" : "text-black/80 group-hover:text-black"} transition-colors`}>
                                            {isLoading ? "————————————————————" : (value ?? "—")}
                                        </span>
                                    </div>

                                    <div className="shrink-0 ml-4">
                                        <AnimatePresence mode="wait">
                                            {copiedHash === key ? (
                                                <motion.span
                                                    key="check"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex items-center text-emerald-400"
                                                >
                                                    <CheckCircle2 size={16} />
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="copy"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className={`opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? "text-white/40" : "text-black/40"}`}
                                                >
                                                    <Copy size={16} />
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── smartscreen notice ── */}
                    <div className={`p-5 rounded-2xl flex gap-4 items-start border ${
                        isDark ? "bg-amber-500/[0.05] border-amber-500/20" : "bg-amber-500/[0.08] border-amber-500/20"
                    }`}>
                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className={`text-sm font-bold tracking-tight mb-1.5 ${isDark ? "text-amber-400" : "text-amber-600"}`}>
                                Windows SmartScreen
                            </p>
                            <p className={`text-[13px] leading-relaxed ${isDark ? "text-amber-500/80" : "text-amber-700/90"}`}>
                                Windows flags all new unsigned indie software. After verifying the clean report above, click{" "}
                                <span className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-800"}`}>
                                    "More Info" → "Run Anyway"
                                </span>{" "}
                                to install.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};