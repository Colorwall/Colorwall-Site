"use client";

import Link from "next/link";
import { useTheme } from "@/app/contexts/ThemeContext";
import { AtSign, ArrowLeft, BadgeCheck, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicCreatorProfile } from "@/lib/creator-types";

// theme-aware vanity profile view for colorwall.xyz/@handle
export function CreatorHandleClient({
    creator,
    cleanHandle,
    isValid,
    validationReason,
}: {
    creator: PublicCreatorProfile | null;
    cleanHandle: string;
    isValid: boolean;
    validationReason?: string;
}) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const cardBg = isDark ? "bg-white/5" : "bg-white/70";
    const mutedText = isDark ? "text-white/60" : "text-black/60";

    return (
        <main
            className={cn(
                "min-h-screen bg-transparent flex items-center justify-center px-4 py-32 font-sans",
                isDark ? "text-white" : "text-black"
            )}
        >
            <div
                className={cn(
                    "w-full max-w-xl rounded-3xl border backdrop-blur-md p-8 sm:p-10 shadow-2xl",
                    borderColor,
                    cardBg
                )}
            >
                <Link
                    href="/creators"
                    className={cn(
                        "inline-flex items-center gap-2 font-mono text-xs transition-colors mb-8",
                        isDark ? "text-white/50 hover:text-white" : "text-black/50 hover:text-black"
                    )}
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Creators</span>
                </Link>

                {creator ? (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between gap-3">
                            <span className="inline-flex items-center py-1 text-[#00a4ff] font-outfit text-[15px]">
                                This handle is reserved to you, how cool!!!
                            </span>
                            <span className={cn("font-mono text-xs shrink-0", isDark ? "text-white/40" : "text-black/40")}>
                                {creator.creatorId}
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-outfit text-4xl font-light tracking-tight">
                                    @{creator.handle}
                                </h1>
                                {creator.verified && (
                                    <BadgeCheck className="w-6 h-6 text-[#00a4ff]" />
                                )}
                            </div>
                            <p className={cn("text-sm mt-1", mutedText)}>
                                {creator.displayName}
                            </p>
                        </div>

                        <p className={cn("text-sm font-light leading-relaxed", mutedText)}>
                            This creator portfolio handle is reserved for the upcoming ColorWall Marketplace launch.
                        </p>

                        <a
                            href={creator.deepLinkUrl}
                            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#00a4ff] hover:bg-[#0090e0] text-white text-xs font-medium transition-colors"
                        >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Open in ColorWall App</span>
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div
                            className={cn(
                                "w-11 h-11 rounded-2xl border flex items-center justify-center text-[#00a4ff]",
                                borderColor,
                                isDark ? "bg-white/[0.03]" : "bg-black/[0.03]"
                            )}
                        >
                            <AtSign className="w-5 h-5" />
                        </div>
                        <h1 className="font-outfit text-3xl sm:text-4xl font-light tracking-tight">
                            @{cleanHandle.toLowerCase()} is unclaimed
                        </h1>
                        <p className={cn("text-sm font-light leading-relaxed", mutedText)}>
                            {isValid
                                ? "Nobody has reserved this vanity handle yet. Claim it now before the Creator Marketplace opens."
                                : validationReason || "This handle is not eligible for reservation."}
                        </p>
                        {isValid && (
                            <Link
                                href={`/creators?handle=${encodeURIComponent(cleanHandle.toLowerCase())}`}
                                className="inline-flex items-center justify-center py-3 px-6 rounded-full bg-[#00a4ff] hover:bg-[#0090e0] text-white text-xs font-medium transition-colors w-fit"
                            >
                                Claim @{cleanHandle.toLowerCase()}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
