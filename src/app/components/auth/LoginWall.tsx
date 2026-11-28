"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
        <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
    </svg>
);

const DiscordIcon = () => (
    <svg width="18" height="18" fill="currentColor" viewBox="0 0 127.14 96.36" aria-hidden="true">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

const ERROR_MESSAGES: Record<string, string> = {
    missing_google_config: "Google sign in is not configured yet.",
    missing_discord_config: "Discord sign in is not configured yet.",
    discord_no_email: "Please verify an email address on your Discord account to continue.",
    oauth_cancelled: "Sign in was cancelled.",
    invalid_state: "Session check expired. Please try again.",
    token_exchange_failed: "Could not verify login. Please try again.",
    profile_fetch_failed: "Could not read your profile.",
    oauth_failed: "Authentication failed. Please try again.",
};

// full-bleed depth card (~72% viewport) rendering login controls directly over expanded colorwall artwork
export function LoginWall({
    returnTo = "/creators",
    title = "Sign in to ColorWall",
    subtitle = "Claim your @handle, publish to the Marketplace, and sync with your desktop app.",
    isLoading = false,
}: {
    returnTo?: string;
    title?: string;
    subtitle?: string;
    isLoading?: boolean;
}) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const searchParams = useSearchParams();

    const effectiveReturnTo = searchParams.get("returnTo") || returnTo;
    const fromApp = searchParams.get("from") === "app";
    const errorCode = searchParams.get("error");
    const errorMessage = errorCode ? ERROR_MESSAGES[errorCode] || "Sign in failed." : null;

    const googleHref = `/api/auth/google?returnTo=${encodeURIComponent(effectiveReturnTo)}${fromApp ? "&from=app" : ""}`;
    const discordHref = `/api/auth/discord?returnTo=${encodeURIComponent(effectiveReturnTo)}${fromApp ? "&from=app" : ""}`;

    return (
        <div className="relative min-h-screen w-full overflow-hidden font-sans flex items-center pt-24 pb-16">
            {/* full-bleed 100% viewport background artwork */}
            <Image
                src="/loginwall.webp"
                alt="ColorWall Login backdrop"
                fill
                sizes="100vw"
                className="object-cover scale-[1.02]"
                priority
            />

            {/* directional gradient scrim creating depth and keeping foreground text crisp */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080f]/95 via-[#07080f]/78 to-[#07080f]/30 backdrop-blur-[2px]" />

            {/* foreground login content aligned inside container over full-screen depth backdrop */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10">
                <div className="w-full max-w-md space-y-7 text-white">
                    <div className="space-y-2.5">
                        <h1 className="text-4xl sm:text-5xl font-outfit font-[200] tracking-tight leading-[1.08]">
                            {title}
                        </h1>
                        <p className="text-sm sm:text-base font-light text-white/70 leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="space-y-3 pt-1">
                        <a
                            href={isLoading ? undefined : googleHref}
                            aria-disabled={isLoading}
                            className={cn(
                                "w-full py-3.5 px-6 rounded-full text-sm font-medium flex items-center justify-center gap-3 transition-all shadow-lg bg-white text-black hover:bg-white/90",
                                isLoading && "pointer-events-none opacity-75"
                            )}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                            <span>{isLoading ? "Checking session..." : "Continue with Google"}</span>
                        </a>

                        <a
                            href={isLoading ? undefined : discordHref}
                            aria-disabled={isLoading}
                            className={cn(
                                "w-full py-3.5 px-6 rounded-full text-sm font-medium flex items-center justify-center gap-3 border border-white/20 bg-[#5865F2]/85 hover:bg-[#5865F2] backdrop-blur-md text-white transition-all shadow-lg",
                                isLoading && "pointer-events-none opacity-75"
                            )}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DiscordIcon />}
                            <span>{isLoading ? "Checking session..." : "Continue with Discord"}</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
