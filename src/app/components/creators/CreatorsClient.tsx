"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { LoginWall } from "@/app/components/auth/LoginWall";
import {
    CheckCircle2,
    Loader2,
    AlertCircle,
    ArrowRight,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type PublicCreatorProfile } from "@/lib/creator-types";

// one-time welcome onboarding page that redirects existing creators straight to /@handle
export function CreatorsClient({
    initialTotal,
    initialRecent,
}: {
    initialTotal: number;
    initialRecent: PublicCreatorProfile[];
}) {
    const { theme } = useTheme();
    const { user, loading: authLoading, refresh, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isDark = theme === "dark";

    const [handleInput, setHandleInput] = useState("");
    const [checkState, setCheckState] = useState<{
        status: "idle" | "checking" | "available" | "unavailable";
        message?: string;
    }>({ status: "idle" });

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    void initialTotal;
    void initialRecent;

    // redirect straight to /@handle if this user already completed onboarding
    useEffect(() => {
        if (user?.creatorHandle) {
            router.replace(`/@${user.creatorHandle}`);
        }
    }, [user?.creatorHandle, router]);

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

    // brief redirect state for already-onboarded creators
    if (user.creatorHandle) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#00a4ff]" />
            </div>
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
                    source: "Web",
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setSubmitError(data.error || "Unable to reserve handle.");
                setSubmitting(false);
                return;
            }

            await refresh();
            router.replace(`/@${data.creator.handle}`);
        } catch {
            setSubmitError("Network error. Please try again.");
            setSubmitting(false);
        }
    };

    const normalizedPreview = handleInput.trim().replace(/^@+/, "").toLowerCase() || "oliver";
    const textColor = isDark ? "text-white" : "text-black";
    const borderColor = isDark ? "border-white/15" : "border-black/15";
    const mutedText = isDark ? "text-white/60" : "text-black/60";
    const firstName = user.name.split(" ")[0] || user.name;

    return (
        <div className={cn("min-h-screen bg-transparent font-sans relative flex items-center", textColor)}>
            <main className="w-full pt-28 pb-20 px-6 relative z-10">
                <div className="max-w-3xl mx-auto space-y-12">
                    {/* personal welcome header */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                {user.avatar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-9 h-9 rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-[#00a4ff]/20 text-[#00a4ff] flex items-center justify-center font-mono text-xs shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className={cn("font-mono text-xs truncate", mutedText)}>
                                    {user.email}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={logout}
                                className={cn(
                                    "cursor-pointer inline-flex items-center gap-1.5 font-mono text-xs transition-colors shrink-0",
                                    isDark ? "text-white/50 hover:text-rose-400" : "text-black/50 hover:text-rose-600"
                                )}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Sign out</span>
                            </button>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-outfit font-[200] tracking-tight leading-[1.06]">
                            Welcome, {firstName}.
                        </h1>
                        <p className={cn("text-base sm:text-lg font-light max-w-xl leading-relaxed", mutedText)}>
                            Pick your permanent <span className="font-mono text-[#00a4ff]">@handle</span> to set up your
                            ColorWall Creator space. Once claimed, you will go straight to your page next time.
                        </p>
                    </div>

                    {/* single clean inline handle input + claim cta */}
                    <form onSubmit={handleReserve} className="space-y-4">
                        <div
                            className={cn(
                                "flex flex-col sm:flex-row sm:items-center gap-4 border-b pb-4 transition-colors",
                                checkState.status === "available"
                                    ? "border-emerald-400"
                                    : checkState.status === "unavailable"
                                        ? "border-rose-400"
                                        : cn(borderColor, "focus-within:border-[#00a4ff]")
                            )}
                        >
                            <div className="flex items-center flex-1 min-w-0">
                                <span className="font-outfit text-2xl sm:text-4xl font-[200] text-[#00a4ff] mr-1.5">
                                    @
                                </span>
                                <input
                                    type="text"
                                    autoFocus
                                    value={handleInput}
                                    onChange={(e) => setHandleInput(e.target.value)}
                                    placeholder="yourhandle"
                                    maxLength={24}
                                    required
                                    className={cn(
                                        "w-full bg-transparent outline-none font-outfit text-2xl sm:text-4xl font-[200] tracking-tight",
                                        isDark ? "placeholder:text-white/25" : "placeholder:text-black/25"
                                    )}
                                />
                                {checkState.status === "checking" && (
                                    <Loader2 className="w-5 h-5 animate-spin text-[#00a4ff] shrink-0 mr-2" />
                                )}
                                {checkState.status === "available" && (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mr-2" />
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || checkState.status === "unavailable"}
                                className={cn(
                                    "cursor-pointer px-7 py-3.5 rounded-full text-sm font-medium transition-all inline-flex items-center justify-center gap-2 shrink-0",
                                    submitting || checkState.status === "unavailable"
                                        ? isDark
                                            ? "bg-white/10 text-white/35 cursor-not-allowed"
                                            : "bg-black/10 text-black/35 cursor-not-allowed"
                                        : "bg-[#00a4ff] text-white hover:bg-[#0090e0] shadow-lg shadow-[#00a4ff]/25"
                                )}
                            >
                                {submitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Continue</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
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

                        {submitError && (
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{submitError}</span>
                            </div>
                        )}
                    </form>

                    {/* subtle editorial overview */}
                    <div className={cn("pt-8 border-t grid grid-cols-1 sm:grid-cols-3 gap-8", borderColor)}>
                        <div className="space-y-1.5">
                            <div className="font-mono text-[11px] text-[#00a4ff]">01</div>
                            <h2 className="font-outfit text-lg font-[300]">Your Creator Space</h2>
                            <p className={cn("text-xs leading-relaxed", mutedText)}>
                                Every wallpaper, widget, and shader you publish lives at your handle.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <div className="font-mono text-[11px] text-[#00a4ff]">02</div>
                            <h2 className="font-outfit text-lg font-[300]">Studio Publishing</h2>
                            <p className={cn("text-xs leading-relaxed", mutedText)}>
                                Ship Live2D, HTML5 overlays, and 8K loops straight from ColorWall Studio.
                            </p>
                        </div>
                        <div className="space-y-1.5">
                            <div className="font-mono text-[11px] text-[#00a4ff]">03</div>
                            <h2 className="font-outfit text-lg font-[300]">App Connected</h2>
                            <p className={cn("text-xs leading-relaxed", mutedText)}>
                                Links directly with your desktop app via colorwall:// deep links.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
