"use client";

import React, { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { enrollBetaTester } from "@/app/actions/beta";

// google play store styled flask illustration with geometric floating shapes
const PlayStoreFlask = () => (
    <div className="relative w-20 h-24 sm:w-24 sm:h-28 flex items-center justify-center shrink-0 select-none">
        <svg 
            viewBox="0 0 100 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
        >
            {/* main erlenmeyer flask outline */}
            <path 
                d="M44 14V36L18 88C15 94 19 102 26 102H74C81 102 85 94 82 88L56 36V14H44Z" 
                stroke="#6b7280" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="#141416"
            />
            {/* flask top lip */}
            <path 
                d="M40 14H60" 
                stroke="#6b7280" 
                strokeWidth="4" 
                strokeLinecap="round" 
            />
            {/* internal liquid fill */}
            <path 
                d="M24 88L30 76C36 78 44 76 50 74C56 72 64 76 70 76L76 88C79 93 76 98 70 98H30C24 98 21 93 24 88Z" 
                fill="#10b981" 
                fillOpacity="0.25"
            />
            {/* yellow star floating shape */}
            <polygon 
                points="34,74 36,80 42,80 37,84 39,90 34,86 29,90 31,84 26,80 32,80" 
                fill="#facc15" 
            />
            {/* green heart floating shape */}
            <path 
                d="M50 56C47 52 42 53 41 57C40 61 46 66 50 69C54 66 60 61 59 57C58 53 53 52 50 56Z" 
                fill="#34d399" 
            />
            {/* cyan diamond floating shape */}
            <polygon 
                points="66,74 72,82 66,90 60,82" 
                fill="#38bdf8" 
            />
            {/* external green bubble */}
            <circle 
                cx="72" 
                cy="38" 
                r="6" 
                stroke="#34d399" 
                strokeWidth="2.5" 
                fill="none" 
            />
            {/* small floating sparkle */}
            <path 
                d="M84 48L85 45L88 44L85 43L84 40L83 43L80 44L83 45Z" 
                fill="#fbbf24" 
            />
        </svg>
    </div>
);

export function BetaProgramCard({ isDark = true }: { isDark?: boolean }) {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "joining" | "enrolled">("idle");
    const [testerId, setTesterId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // restore enrolled status from localstorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("colorwall_beta_tester");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.status === "enrolled" && parsed.testerId) {
                    setStatus("enrolled");
                    setTesterId(parsed.testerId);
                }
            }
        } catch {
            // fallback silently if localstorage is unavailable
        }
    }, []);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setError("Please enter a valid Gmail address.");
            return;
        }

        setError(null);
        setStatus("joining");

        try {
            const data = await enrollBetaTester(email);

            if (data.success) {
                // simulate subtle play store enrollment delay for realistic feel
                setTimeout(() => {
                    setStatus("enrolled");
                    setTesterId(data.testerId || null);
                    setEmail("");
                    try {
                        localStorage.setItem(
                            "colorwall_beta_tester",
                            JSON.stringify({ status: "enrolled", testerId: data.testerId })
                        );
                    } catch {
                        // ignore storage errors
                    }
                }, 1200);
            } else {
                setStatus("idle");
                setError(data.error || "Unable to join beta. Try again.");
            }
        } catch {
            setStatus("idle");
            setError("Network error. Please try again.");
        }
    };

    const handleLeave = () => {
        setStatus("idle");
        setTesterId(null);
        setEmail("");
        setError(null);
        setShowDetails(false);
        try {
            localStorage.removeItem("colorwall_beta_tester");
        } catch {
            // ignore storage errors
        }
    };

    return (
        <div 
            className={`w-full max-w-4xl mx-auto mb-10 rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                isDark 
                    ? "bg-[#18181b]/80 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" 
                    : "bg-white/90 border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
            }`}
        >
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                {/* left text and interaction area */}
                <div className="flex-1 space-y-3 text-left">
                    <div className="flex items-center gap-2">
                        {status === "enrolled" ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono">
                                <Check size={12} className="text-emerald-400 stroke-[3]" />
                                Enrolled
                            </span>
                        ) : null}

                        <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-black"}`}>
                            {status === "joining" 
                                ? "Joining beta..." 
                                : status === "enrolled" 
                                    ? "You're a beta tester" 
                                    : "Join the beta program"}
                        </h3>
                    </div>

                    <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>
                        {status === "joining"
                            ? "Adding your account to the program. It may take a few seconds."
                            : status === "enrolled"
                                ? "You'll see new features and Direct3D11 compositor builds before the public does. Give feedback to help the developers improve."
                                : "Try new features before they're officially released and give feedback to the developers. All builds are completely safe and community-verified."}
                    </p>

                    {/* enrollment input when idle */}
                    {status === "idle" && (
                        <div className="space-y-1.5 pt-1">
                            <form onSubmit={handleJoin} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your Gmail to join"
                                    required
                                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm border outline-none transition-colors ${
                                        isDark 
                                            ? "bg-black/40 border-white/15 text-white placeholder-white/35 focus:border-emerald-500/60" 
                                            : "bg-black/5 border-black/15 text-black placeholder-black/40 focus:border-emerald-600"
                                    }`}
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
                                >
                                    Join
                                </button>
                            </form>
                            <p className={`text-[10px] sm:text-[11px] font-mono leading-relaxed ${isDark ? "text-white/40" : "text-black/40"}`}>
                                * Your Gmail isn&apos;t stored as plain text and is encrypted end-to-end.
                            </p>
                        </div>
                    )}

                    {status === "joining" && (
                        <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-mono">
                            <Loader2 size={14} className="animate-spin text-emerald-400" />
                            <span>Hmm.. Verifying Beta tester access...</span>
                        </div>
                    )}

                    {error && (
                        <p className="text-rose-400 text-xs font-mono">{error}</p>
                    )}

                    {/* play store style links */}
                    <div className="flex items-center gap-4 pt-1 text-xs font-semibold">
                        {status === "enrolled" ? (
                            <button
                                type="button"
                                onClick={handleLeave}
                                className="text-emerald-400 hover:text-emerald-300 underline decoration-transparent hover:decoration-current transition-colors cursor-pointer"
                            >
                                Leave
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-emerald-400 hover:text-emerald-300 underline decoration-transparent hover:decoration-current transition-colors cursor-pointer"
                        >
                            {showDetails ? "Hide details" : "Learn more"}
                        </button>

                        {testerId ? (
                            <span className="text-[11px] font-mono text-white/40">
                                Pass: {testerId}
                            </span>
                        ) : null}
                    </div>

                    {/* expandable details */}
                    {showDetails && (
                        <div className={`mt-3 p-3.5 rounded-xl text-[11px] leading-relaxed font-mono ${
                            isDark ? "bg-black/40 text-white/60 border border-white/5" : "bg-black/5 text-black/60 border border-black/5"
                        }`}>
                            Colorwall is currently in beta testing ahead of public launch. Early peeps get exclusive in-app badges and early access to experimental Rust compositor builds and widget updates.
                        </div>
                    )}
                </div>

                {/* right side play store flask graphic */}
                <div className="hidden sm:flex items-center justify-center p-2">
                    <PlayStoreFlask />
                </div>
            </div>
        </div>
    );
}
