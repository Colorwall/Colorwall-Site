"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, LoaderCircle } from "lucide-react";

export function HeroInteractive() {
    const router = useRouter();
    const [loadingButton, setLoadingButton] = useState<"download" | "discord" | "patreon" | "github" | null>(null);
    const [socialMetrics, setSocialMetrics] = useState({ discord: "...", github: "..." });

    // Fetch live social proof metrics
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // Simulate network request delay
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Placeholder API calls - replace with actual endpoints
                // const discordRes = await fetch('/api/metrics/discord');
                // const githubRes = await fetch('https://api.github.com/repos/your-org/colorwall');
                
                setSocialMetrics({
                    discord: "12.4k", // Example: await discordRes.json() -> members count
                    github: "4.8k"    // Example: await githubRes.json() -> stargazers_count
                });
            } catch (error) {
                console.error("Failed to fetch social metrics", error);
            }
        };
        fetchMetrics();
    }, []);

    const handleInternalNavigation = (
        event: React.MouseEvent<HTMLAnchorElement>,
        button: "download",
        href: string
    ) => {
        event.preventDefault();
        setLoadingButton(button);

        setTimeout(() => {
            router.push(href);
        }, 120);
    };

    return (
        <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
            {/* Primary CTA */}
            <div className="w-full">
                <div className="relative group flex w-full rounded-[12px] overflow-hidden p-[2px] hover:-translate-y-0.5 transition-transform duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
                    <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#60a5fa_50%,transparent_100%)] opacity-100 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <Link
                        href="/download"
                        onClick={(event) => handleInternalNavigation(event, "download", "/download")}
                        aria-busy={loadingButton === "download" ? "true" : "false"}
                        className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-[10px] bg-white text-black font-bold text-xs sm:text-sm tracking-wide w-full"
                    >
                        {loadingButton === "download" ? (
                            <LoaderCircle className="w-4 h-4 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Download
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md ml-0.5 bg-black/10 text-black/70 font-mono">
                            Win 10/11
                        </span>
                    </Link>
                </div>
            </div>

            {/* Secondary CTAs Grouped */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
                {/* discord */}
                <a
                    href="https://discord.gg/QYwhay7r2V"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setLoadingButton("discord")}
                    {...{ "aria-busy": loadingButton === "discord" ? "true" : "false" }}
                    className="relative flex justify-center items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-[10px] font-semibold text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 border border-white/20 text-white bg-black/30 hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-300"
                >
                    {loadingButton === "discord" ? (
                        <LoaderCircle className="w-[1em] h-[1em] inline-block animate-spin" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" className="w-[1em] h-[1em] inline-block"><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.276c3.2-4.375,6.233-8.855,9.117-13.435a1.889,1.889,0,0,0-1.026-2.822,331.066,331.066,0,0,1-47.533-22.385,1.884,1.884,0,0,1-.186-3.136,24.71,24.71,0,0,0,3.2-2.527,1.888,1.888,0,0,1,1.979-.315,348.608,348.608,0,0,0,175.762,35.882,348.4,348.4,0,0,0,175.525-35.882,1.884,1.884,0,0,1,1.979.315,22.065,22.065,0,0,0,3.242,2.566,1.887,1.887,0,0,1-.144,3.136,335.8,335.8,0,0,1-47.6,22.385,1.885,1.885,0,0,0-1.026,2.822c2.884,4.58,5.918,9.06,9.117,13.435a1.882,1.882,0,0,0,2.063.276A486.291,486.291,0,0,0,611.43,405.729a1.882,1.882,0,0,0,.765-1.354C624.4,269.175,584.288,159.224,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"/></svg>
                    )}
                    Discord
                </a>

                {/* github */}
                <a
                    href="https://github.com/colorwall"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setLoadingButton("github")}
                    {...{ "aria-busy": loadingButton === "github" ? "true" : "false" }}
                    className="relative flex justify-center items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-[10px] font-semibold text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 border border-white/20 text-white bg-black/30 hover:border-white/50 hover:bg-white/10 hover:text-white"
                >
                    {loadingButton === "github" ? (
                        <LoaderCircle className="w-[1em] h-[1em] inline-block animate-spin" />
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.1em] h-[1.1em] inline-block"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    )}
                    GitHub
                </a>

                {/* patreon */}
                <a
                    href="https://patron.colorwall.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setLoadingButton("patreon")}
                    {...{ "aria-busy": loadingButton === "patreon" ? "true" : "false" }}
                    className="relative flex justify-center items-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-[10px] font-semibold text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 border border-white/20 text-white bg-black/30 hover:border-[#ff424D]/50 hover:bg-[#ff424D]/20 hover:text-[#ff424D]"
                >
                    {loadingButton === "patreon" ? (
                        <LoaderCircle className="w-[1em] h-[1em] inline-block animate-spin" />
                    ) : (
                        <svg viewBox="0 0 512 512" fill="currentColor" className="w-[1em] h-[1em] inline-block"><path d="M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z"/></svg>
                    )}
                    Patreon
                </a>
            </div>

            <p className="text-white/50 text-[10px] sm:text-[11px] font-medium tracking-wide">
                Completely free to use, supported by the community.
            </p>
        </div>
    );
}
