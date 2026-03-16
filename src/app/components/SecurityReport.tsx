"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    useEffect(() => {
        fetch("/api/virustotal")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) setVtReport(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

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
            className={`py-24 px-4 sm:px-8 relative w-full flex justify-center overflow-hidden ${className}`}
        >

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start relative z-10">
                {/* ════ left: heading + status ════ */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col justify-center"
                >
                    <p
                        className={`text-xs font-mono uppercase tracking-[0.2em] mb-4 ml-1 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                    >
                        uhuh security verification?
                    </p>
                    <GradientHeading
                        text="Verified & Transparent"
                        theme={theme}
                        className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight"
                    />

                    <p
                        className={`text-base leading-relaxed mt-6 ${mutedText}`}
                    >
                        Every release is automatically scanned via the
                        VirusTotal API. Hashes are computed from the live
                        binary and verified against 70+ antivirus engines in
                        real time — zero manual work, zero trust-me-bro.
                    </p>

                    {/* live status badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className={`mt-8 inline-flex items-center gap-4 self-start px-5 py-3 rounded-xl border ${borderColor} ${cardBg}`}
                    >
                        {isLoading ? (
                            <Loader2
                                size={20}
                                className={`animate-spin ${isDark ? "text-blue-400" : "text-blue-600"}`}
                            />
                        ) : isClean ? (
                            <ShieldCheck
                                size={20}
                                className="text-emerald-400"
                            />
                        ) : (
                            <ShieldAlert
                                size={20}
                                className="text-red-400"
                            />
                        )}

                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span
                                    className={`text-sm font-bold ${isDark ? "text-white" : "text-black"}`}
                                >
                                    {isLoading
                                        ? "Scanning..."
                                        : isClean
                                          ? "All Clear"
                                          : "Threat Detected"}
                                </span>
                                {!isLoading && vtReport?.stats && (
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                            isClean
                                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                                : "bg-red-500/15 text-red-400 border border-red-500/20"
                                        }`}
                                    >
                                        {vtReport.stats.harmless}/
                                        {totalEngines} CLEAN
                                    </span>
                                )}
                            </div>
                            <p
                                className={`text-xs mt-0.5 ${mutedText}`}
                            >
                                {isLoading
                                    ? "fetching virustotal report…"
                                    : isClean
                                      ? "0 engines detected any threat"
                                      : `${vtReport?.stats?.malicious} engine(s) flagged this file`}
                            </p>
                        </div>
                    </motion.div>

                    {/* cta button */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25 }}
                        className="mt-6"
                    >
                        <a
                            href={vtReport?.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                                isDark
                                    ? "bg-white text-black hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
                                    : "bg-black text-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
                            }`}
                        >
                            <ExternalLink size={16} />
                            View Full VirusTotal Report
                        </a>
                    </motion.div>
                </motion.div>

                {/* ════ right: hashes + details card ════ */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl overflow-hidden border ${borderColor} shadow-2xl flex flex-col`}
                >
                    {/* ── hashes section ── */}
                    <div
                        className={`p-6 border-b ${borderColor} ${isDark ? "bg-[#0f0f11]" : "bg-slate-50"}`}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <span
                                className={`text-[10px] font-mono font-bold uppercase tracking-widest ${mutedText}`}
                            >
                                Cryptographic Hashes
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {hashes.map(({ key, value }) => (
                                <div
                                    key={key}
                                    onClick={() =>
                                        !isLoading &&
                                        value &&
                                        copy(value, key)
                                    }
                                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl border ${borderColor} ${cardBg} ${hoverBg} transition-all duration-200 ${
                                        !isLoading && value
                                            ? "cursor-pointer active:scale-[0.995]"
                                            : "cursor-not-allowed opacity-40"
                                    }`}
                                >
                                    <span
                                        className={`text-[10px] font-mono font-bold w-14 shrink-0 ${isDark ? "text-blue-400/70" : "text-blue-600/70"}`}
                                    >
                                        {key}
                                    </span>
                                    <span
                                        className={`text-xs font-mono flex-1 truncate ${isDark ? "text-white/80" : "text-black/80"}`}
                                    >
                                        {isLoading
                                            ? "————————————————————"
                                            : (value ?? "—")}
                                    </span>

                                    <AnimatePresence mode="wait">
                                        {copiedHash === key ? (
                                            <motion.span
                                                key="check"
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{ opacity: 0 }}
                                                className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0"
                                            >
                                                <CheckCircle2 size={12} />{" "}
                                                Copied
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="copy"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 0.3 }}
                                                exit={{ opacity: 0 }}
                                                className="shrink-0 group-hover:opacity-60 transition-opacity"
                                            >
                                                <Copy size={13} />
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── binary details section ── */}
                    <div className={`p-6 border-b ${borderColor}`}>
                        <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-widest ${mutedText} block mb-5`}
                        >
                            Binary Signature
                        </span>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {details.map(({ label, value }) => (
                                <div key={label}>
                                    <div
                                        className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${mutedText}`}
                                    >
                                        {label}
                                    </div>
                                    <div
                                        className={`text-xs font-mono font-medium truncate ${isDark ? "text-white" : "text-black"}`}
                                    >
                                        {isLoading ? "…" : value}
                                    </div>
                                </div>
                            ))}
                            <div className="col-span-2">
                                <div
                                    className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${mutedText}`}
                                >
                                    Code Signing
                                </div>
                                <div className="flex items-center gap-2 text-xs font-mono font-medium text-amber-400">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                    </span>
                                    Unsigned — Community Release
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── smartscreen notice ── */}
                    <div className={`p-5 ${isDark ? "bg-amber-500/[0.03]" : "bg-amber-50"}`}>
                        <div className="flex gap-3">
                            <AlertTriangle
                                size={14}
                                className="text-amber-500 shrink-0 mt-0.5"
                            />
                            <div>
                                <p
                                    className={`text-xs font-bold mb-1 ${isDark ? "text-amber-400" : "text-amber-700"}`}
                                >
                                    SmartScreen Warning
                                </p>
                                <p
                                    className={`text-xs leading-relaxed ${mutedText}`}
                                >
                                    Windows flags unsigned apps. Verify
                                    it&apos;s clean above, then click{" "}
                                    <span
                                        className={`font-semibold ${isDark ? "text-white/70" : "text-black/70"}`}
                                    >
                                        &ldquo;More Info&rdquo; →
                                        &ldquo;Run Anyway&rdquo;
                                    </span>{" "}
                                    to proceed.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};