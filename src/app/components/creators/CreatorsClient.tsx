"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { LoginWall } from "@/app/components/auth/LoginWall";
import {
    Check,
    CheckCircle2,
    Copy,
    ExternalLink,
    Link2,
    Loader2,
    AlertCircle,
    ArrowRight,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CREATOR_SPECIALTIES, type PublicCreatorProfile } from "@/lib/creator-types";

// unboxed editorial creator handle claim page gated behind global login wall
export function CreatorsClient({
    initialTotal,
    initialRecent,
}: {
    initialTotal: number;
    initialRecent: PublicCreatorProfile[];
}) {
    const { theme } = useTheme();
    const { user, loading: authLoading, logout } = useAuth();
    const isDark = theme === "dark";
    const searchParams = useSearchParams();

    const [handleInput, setHandleInput] = useState("");
    const [specialty, setSpecialty] = useState<string>(CREATOR_SPECIALTIES[0]);

    const [checkState, setCheckState] = useState<{
        status: "idle" | "checking" | "available" | "unavailable";
        message?: string;
    }>({ status: "idle" });

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [reservedCreator, setReservedCreator] = useState<PublicCreatorProfile | null>(null);
    const [copied, setCopied] = useState(false);

    void initialTotal;
    void initialRecent;

    useEffect(() => {
        const prefill = searchParams.get("handle");
        if (prefill && !handleInput) {
            setHandleInput(prefill.replace(/^@+/, ""));
        }
    }, [searchParams, handleInput]);

    // debounced live handle availability check against /api/creators/check
    useEffect(() => {
        const cleaned = handleInput.trim().replace(/^@+/, "");
        if (!cleaned) {
            setCheckState({ status: "idle" });
            return;
        }

        setCheckState({ status: "checking" });
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/creators/check?handle=${encodeURIComponent(cleaned)}`);
                const data = await res.json();
                if (data.available) {
                    setCheckState({
                        status: "available",
                        message: `@${data.handle} is available`,
                    });
                } else {
                    setCheckState({
                        status: "unavailable",
                        message: data.reason || `@${cleaned} is unavailable`,
                    });
                }
            } catch {
                setCheckState({ status: "idle" });
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [handleInput]);

    // render login wall immediately without blanking the screen while session cookie resolves
    if (!user) {
        return (
            <LoginWall
                returnTo="/creators"
                title="Sign in to ColorWall"
                subtitle="Sign in with Google or Discord to claim your @handle and link your desktop app."
                isLoading={authLoading}
            />
        );
    }

    const handleReserve = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitError("");
        setSubmitting(true);

        try {
            const res = await fetch("/api/creators/reserve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    handle: handleInput,
                    specialty,
                    source: "Web",
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setSubmitError(data.error || "Unable to reserve handle.");
                setSubmitting(false);
                return;
            }

            setReservedCreator(data.creator);
        } catch {
            setSubmitError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopyUrl = async () => {
        if (!reservedCreator) return;
        try {
            await navigator.clipboard.writeText(reservedCreator.profileUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // ignore clipboard errors when permissions are restricted
        }
    };

    const normalizedPreview = handleInput.trim().replace(/^@+/, "").toLowerCase() || "oliver";
    const textColor = isDark ? "text-white" : "text-black";
    const borderColor = isDark ? "border-white/15" : "border-black/15";
    const mutedText = isDark ? "text-white/60" : "text-black/60";

    return (
        <div className={cn("min-h-screen bg-transparent font-sans relative", textColor)}>
            <main className="pt-28 pb-24 px-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-16">
                    {/* centered hero matching download/page.tsx typography scale */}
                    <div className="pt-10 text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-outfit font-[200] tracking-tight">
                            ColorWall Creators
                        </h1>
                        <p
                            className="text-lg md:text-xl font-bold bg-clip-text text-transparent animate-bg-pan bg-[length:200%_auto] max-w-xl mx-auto"
                            style={{
                                backgroundImage: isDark
                                    ? "linear-gradient(110deg, #ffffff 35%, #f4f9ff 45%, #8bc5f8 50%, #f4f9ff 55%, #ffffff 65%)"
                                    : "linear-gradient(110deg, #000000 35%, #111827 45%, #3b82f6 50%, #111827 55%, #000000 65%)",
                            }}
                        >
                            Claim your @handle and publish to the Marketplace
                        </p>
                    </div>

                    {/* unboxed open editorial handle reservation flow */}
                    <div id="waitlist" className="w-full max-w-2xl mx-auto space-y-8">
                        {/* clean signed-in bar without heavy box */}
                        <div className={cn("flex items-center justify-between gap-4 pb-4 border-b", borderColor)}>
                            <div className="flex items-center gap-3 min-w-0">
                                {user.avatar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#00a4ff]/20 text-[#00a4ff] flex items-center justify-center font-mono text-xs shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex items-baseline gap-2.5 flex-wrap">
                                    <span className="font-outfit text-sm font-medium truncate">{user.name}</span>
                                    <span className={cn("font-mono text-xs truncate", mutedText)}>{user.email}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={logout}
                                className={cn(
                                    "cursor-pointer inline-flex items-center gap-1.5 font-mono text-xs transition-colors shrink-0",
                                    isDark ? "text-white/55 hover:text-rose-400" : "text-black/55 hover:text-rose-600"
                                )}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Sign out</span>
                            </button>
                        </div>

                        {!reservedCreator ? (
                            <form onSubmit={handleReserve} className="space-y-7">
                                {/* large open underline handle input */}
                                <div>
                                    <div
                                        className={cn(
                                            "flex items-center border-b pb-3 transition-colors",
                                            checkState.status === "available"
                                                ? "border-emerald-400"
                                                : checkState.status === "unavailable"
                                                    ? "border-rose-400"
                                                    : cn(borderColor, "focus-within:border-[#00a4ff]")
                                        )}
                                    >
                                        <span className="font-outfit text-2xl sm:text-3xl font-[200] text-[#00a4ff] mr-1.5">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            value={handleInput}
                                            onChange={(e) => setHandleInput(e.target.value)}
                                            placeholder="yourhandle"
                                            maxLength={24}
                                            required
                                            className={cn(
                                                "w-full bg-transparent outline-none font-outfit text-2xl sm:text-3xl font-[200] tracking-tight",
                                                isDark ? "placeholder:text-white/25" : "placeholder:text-black/25"
                                            )}
                                        />
                                        {checkState.status === "checking" && (
                                            <Loader2 className="w-5 h-5 animate-spin text-[#00a4ff] shrink-0" />
                                        )}
                                        {checkState.status === "available" && (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                        )}
                                    </div>

                                    <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
                                        <span className={cn("font-mono", mutedText)}>
                                            colorwall.xyz/<span className="text-[#00a4ff]">@{normalizedPreview}</span>
                                        </span>
                                        {checkState.message && (
                                            <span
                                                className={cn(
                                                    "font-mono text-xs",
                                                    checkState.status === "available" ? "text-emerald-400" : "text-rose-400"
                                                )}
                                            >
                                                {checkState.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* clean specialty selection + submit row */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
                                    <div className="flex flex-wrap gap-2">
                                        {CREATOR_SPECIALTIES.map((item) => {
                                            const active = specialty === item;
                                            return (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => setSpecialty(item)}
                                                    className={cn(
                                                        "cursor-pointer px-3 py-1.5 rounded-full font-mono text-xs border transition-colors",
                                                        active
                                                            ? "bg-[#00a4ff]/15 text-[#00a4ff] border-[#00a4ff]/40"
                                                            : cn(borderColor, isDark ? "text-white/60 hover:text-white" : "text-black/60 hover:text-black")
                                                    )}
                                                >
                                                    {item}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || checkState.status === "unavailable"}
                                        className={cn(
                                            "cursor-pointer px-6 py-3 rounded-full text-sm font-medium transition-all inline-flex items-center justify-center gap-2 shrink-0",
                                            submitting || checkState.status === "unavailable"
                                                ? isDark
                                                    ? "bg-white/10 text-white/35 cursor-not-allowed"
                                                    : "bg-black/10 text-black/35 cursor-not-allowed"
                                                : "bg-[#00a4ff] text-white hover:bg-[#0090e0] shadow-lg shadow-[#00a4ff]/20"
                                        )}
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Reserve @{normalizedPreview}</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {submitError && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{submitError}</span>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="inline-flex items-center gap-2 font-mono text-xs text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Reserved
                                    </span>
                                    <span className="font-mono text-xs text-[#00a4ff]">
                                        {reservedCreator.creatorId}
                                    </span>
                                </div>

                                <div>
                                    <h2 className="font-outfit text-4xl font-[200] tracking-tight">
                                        @{reservedCreator.handle}
                                    </h2>
                                    <p className={cn("text-sm mt-1", mutedText)}>
                                        {reservedCreator.displayName} · {reservedCreator.specialty}
                                    </p>
                                </div>

                                <div className={cn("flex items-center justify-between gap-3 py-3 border-y", borderColor)}>
                                    <span className="font-mono text-xs truncate">{reservedCreator.profileUrl}</span>
                                    <button
                                        type="button"
                                        onClick={handleCopyUrl}
                                        className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a4ff]/15 text-[#00a4ff] font-mono text-[11px] shrink-0"
                                    >
                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        <span>{copied ? "Copied" : "Copy"}</span>
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={`/@${reservedCreator.handle}`}
                                        className={cn(
                                            "cursor-pointer py-2.5 px-5 rounded-full border text-xs font-medium inline-flex items-center gap-2 transition-colors",
                                            borderColor,
                                            isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                        )}
                                    >
                                        <span>View Profile</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>

                                    <a
                                        href={reservedCreator.deepLinkUrl}
                                        className="cursor-pointer py-2.5 px-5 rounded-full bg-[#00a4ff] hover:bg-[#0090e0] text-white text-xs font-medium inline-flex items-center gap-2 transition-colors"
                                    >
                                        <Link2 className="w-3.5 h-3.5" />
                                        <span>Open in App</span>
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* clean unboxed workshop and app sync details */}
                    <div id="workshop" className={cn("pt-10 border-t grid grid-cols-1 md:grid-cols-2 gap-10", borderColor)}>
                        <div className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-outfit font-[200] tracking-tight">
                                Studio Publishing
                            </h2>
                            <p className={cn("text-sm leading-relaxed", mutedText)}>
                                Publish interactive HTML5 widgets, Live2D scenes, audio-reactive WebGL shaders, and
                                4K/8K video loops straight to the ColorWall Marketplace.
                            </p>
                        </div>

                        <div id="sync" className="space-y-2">
                            <h2 className="text-2xl md:text-3xl font-outfit font-[200] tracking-tight">
                                Desktop App Sync
                            </h2>
                            <p className={cn("text-sm leading-relaxed", mutedText)}>
                                Reserved handles connect directly to your ColorWall desktop app over{" "}
                                <span className="font-mono text-[#00a4ff]">colorwall://</span> deep links.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
