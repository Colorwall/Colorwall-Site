"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Download, ShieldCheck, AlertTriangle } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { SecurityReport } from "@/app/components/SecurityReport";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";

interface GitHubAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    assets: GitHubAsset[];
}


export default function DownloadPage() {
    const { theme } = useTheme();
    const [isDownloading, setIsDownloading] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState(1);
    const prevShowVideoModal = useRef(showVideoModal);

    useEffect(() => {
        const wasOpen = prevShowVideoModal.current;
        prevShowVideoModal.current = showVideoModal;

        if (!showVideoModal) {
            if (wasOpen) {
                // Only reset when modal closes, driven by external state
                const timeout = setTimeout(() => setCurrentImage(1), 0);
                return () => clearTimeout(timeout);
            }
            return;
        }

        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev === 1 ? 2 : 1));
        }, 2000);
        return () => clearInterval(interval);
    }, [showVideoModal]);

    const handleDownload = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        setShowVideoModal(true);
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const res = await fetch("https://api.github.com/repos/colorwall/colorwall/releases/latest");
            const data: GitHubRelease = await res.json();
            const exeAsset = data.assets?.find((a) => a.name.endsWith('.exe'));
            const url = exeAsset?.browser_download_url || "https://github.com/colorwall/colorwall/releases/latest";
            setDownloadUrl(url);
            setTimeout(() => {
                if (exeAsset?.browser_download_url) {
                    window.location.href = exeAsset.browser_download_url;
                } else {
                    window.open(url, "_blank");
                }
                setIsDownloading(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to fetch latest release", error);
            const fallbackUrl = "https://github.com/colorwall/colorwall/releases/latest";
            setDownloadUrl(fallbackUrl);
            setTimeout(() => {
                window.open(fallbackUrl, "_blank");
                setIsDownloading(false);
            }, 2000);
        }
    };

    const isDark = theme === "dark";

    const bgColor = isDark ? "bg-[#0a0a0a]" : "bg-white";
    const textColor = isDark ? "text-white" : "text-black";
    const mutedText = isDark ? "text-white/60" : "text-black/60";
    const borderColor = isDark ? "border-white/10" : "border-black/10";
    const cardBg = isDark ? "bg-white/5" : "bg-black/5";

    return (
        <div className={`min-h-screen ${bgColor} ${textColor} font-sans selection:bg-blue-500/30`}>
            <main className="pt-28 pb-20 px-6">
                <div className="max-w-4xl mx-auto space-y-16">

                    {/* Hero / Main Download Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <div className="relative w-32 h-32 mx-auto drop-shadow-2xl">
                            <Image
                                src="/colorwall.png"
                                alt="ColorWall Icon"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        <div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                                Download Colorwall
                            </h1>
                            <p className={`text-lg ${mutedText} max-w-xl mx-auto`}>
                                A Lightweight Wallpaper Engine in Rust
                            </p>
                        </div>
                    </motion.div>

                    {/* Platform Downloads */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto"
                    >
                        {/* Windows */}
                        <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between ${borderColor} ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                            <div className="space-y-2 mb-8 text-center">
                                <i className="fa-brands fa-microsoft text-[36px] mx-auto mb-4 opacity-80"></i>
                                <h3 className="text-3xl font-black tracking-tight">Windows</h3>
                                <p className={`text-sm ${mutedText} font-medium`}>Windows 10/11 (64-bit)</p>
                            </div>

                            <div className="space-y-3 w-full">
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className={`w-full group relative inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${isDownloading ? "opacity-70 cursor-wait" : "hover:-translate-y-1 hover:shadow-xl"} ${isDark ? "bg-white text-black hover:shadow-white/10" : "bg-black text-white hover:shadow-black/10"}`}
                                >
                                    <Download size={20} className={isDownloading ? "animate-bounce" : ""} />
                                    <span>{isDownloading ? "Starting..." : "Download Now"}</span>
                                </button>

                                <button
                                    disabled
                                    className={`w-full group relative inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold border transition-all duration-300 bg-black/5 dark:bg-white/5 ${borderColor} opacity-50 grayscale cursor-not-allowed`}
                                >
                                    <Image src="/microsoftstore.svg" alt="Microsoft Store" width={20} height={20} className="w-5 h-5" />
                                    <span>Microsoft Store</span>
                                </button>

                                <div className="flex items-start gap-2 text-xs pt-4 opacity-70">
                                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                                    <span className="leading-snug">SmartScreen may appear. Select &ldquo;Run anyway&rdquo;.</span>
                                </div>
                            </div>
                        </div>

                        {/* Linux */}
                        <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between ${borderColor} bg-transparent opacity-80 backdrop-grayscale hover:backdrop-grayscale-0 transition-all`}>
                            <div className="space-y-2 mb-8 text-center opacity-60">
                                <i className="fa-brands fa-linux text-[36px] mx-auto mb-4"></i>
                                <h3 className="text-3xl font-black tracking-tight">Linux</h3>
                                <p className={`text-sm ${mutedText} font-medium`}>Coming Soon</p>
                            </div>

                            <div className="space-y-3 w-full opacity-60">
                                <div className={`w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold border ${borderColor} cursor-not-allowed bg-black/5 dark:bg-white/5`}>
                                    <span>Not Available</span>
                                </div>
                            </div>
                        </div>

                        {/* macOS */}
                        <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between ${borderColor} bg-transparent opacity-80 backdrop-grayscale hover:backdrop-grayscale-0 transition-all`}>
                            <div className="space-y-2 mb-8 text-center opacity-60">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 384 512" className="mx-auto mb-4 fill-current">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                </svg>
                                <h3 className="text-3xl font-black tracking-tight">macOS</h3>
                                <p className={`text-sm ${mutedText} font-medium`}>Not Supported Yet</p>
                            </div>

                            <div className="space-y-3 w-full opacity-60">
                                <div className={`w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold border ${borderColor} cursor-not-allowed bg-black/5 dark:bg-white/5`}>
                                    <span>Not Available</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Security Report Section */}
                    <SecurityReport theme={theme} />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`text-center p-8 rounded-3xl border ${borderColor} ${cardBg}`}
                    >
                        <p className={`text-sm md:text-base ${mutedText} max-w-3xl mx-auto leading-relaxed`}>
                            We are actively working to bring ColorWall to more storefronts. In the future, we plan to add support for the Microsoft Store, Steam, and Epic Games Store to make downloading and updating as seamless as possible. Stay tuned!
                        </p>
                    </motion.div>
                </div>
            </main>

            {/* Video Modal */}
            {showVideoModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setShowVideoModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className={`relative w-full max-w-md overflow-hidden p-5 sm:p-6 rounded-3xl shadow-2xl border ${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-black/10"}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4 sm:mb-5">
                            <h3 className="font-bold text-lg sm:text-xl flex items-center gap-3">
                                <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                                Downloading ColorWall...
                            </h3>
                            <button
                                onClick={() => setShowVideoModal(false)}
                                className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10 bg-white/5" : "hover:bg-black/10 bg-black/5"}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>

                        <div className={`w-full rounded-2xl overflow-hidden relative border border-transparent mb-4 sm:mb-5 drop-shadow-2xl grid`}>
                            <AnimatePresence mode="popLayout">
                                <motion.img
                                    key={currentImage}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                    src={`/smartscreen${currentImage}.png`}
                                    alt={`SmartScreen Bypass Step ${currentImage}`}
                                    className="w-full h-auto block grid-area-1"
                                    style={{ gridArea: '1 / 1 / 2 / 2' }}
                                />
                            </AnimatePresence>
                        </div>

                        <div className="text-center space-y-3 sm:space-y-4">
                            <div className={`p-3 rounded-xl border ${isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200"} flex items-start gap-3 text-left`}>
                                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                <div className="space-y-1.5">
                                    <p className={`text-sm font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                                        Why am I seeing SmartScreen?
                                    </p>
                                    <p className={`text-xs ${isDark ? "text-emerald-400/80" : "text-emerald-600"} leading-relaxed`}>
                                        Windows flags new, unsigned executable files that haven&apos;t built a long reputation yet. ColorWall is 100% clean.{" "}
                                        <a href="https://www.virustotal.com/gui/file/e4b28bc9a6b9e86ae370fec0f7193ba6b9d146be533e8dc5b980f1b6e409cc6b/detection" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-80 transition-opacity">
                                            View our VirusTotal report
                                        </a> to verify.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm md:text-base font-medium">Your download will begin automatically shortly.</p>
                                <p className={`text-xs md:text-sm ${mutedText}`}>
                                    If it doesn&apos;t start,{" "}
                                    {downloadUrl ? (
                                        <a href={downloadUrl} className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-[#394eff] hover:text-blue-800"} hover:underline font-semibold transition-colors`} target="_blank" rel="noopener noreferrer">click here to download</a>
                                    ) : (
                                        <span>please wait...</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            <Footer theme={theme} />
        </div>
    );
}