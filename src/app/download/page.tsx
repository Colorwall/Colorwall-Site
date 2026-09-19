"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Download, ShieldCheck, MailCheck, AlertTriangle, Eye } from "lucide-react";
import { Footer } from "@/app/components/Footer";
import { SecurityReport } from "@/app/components/SecurityReport";
import { ComparisonTable } from "@/app/components/landing/ComparisonTable";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const SplashCursor = dynamic(() => import("@/app/components/ui/SplashCursor"), { ssr: false });

interface GitHubAsset {
    name: string;
    browser_download_url: string;
    size: number;
}

interface GitHubRelease {
    tag_name: string;
    assets: GitHubAsset[];
}


export default function DownloadPage() {
    const { theme } = useTheme();
    const [isDownloading, setIsDownloading] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [releaseMeta, setReleaseMeta] = useState<{ version: string; size: string } | null>(null);
    const [currentImage, setCurrentImage] = useState(1);
    const [views, setViews] = useState<number | null>(null);
    const [isIdle, setIsIdle] = useState(false);
    const [isWindows, setIsWindows] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showDownloadsMobile, setShowDownloadsMobile] = useState(false);
    
    // Email form state
    const [email, setEmail] = useState("");
    const [isEmailSending, setIsEmailSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [emailError, setEmailError] = useState("");
    
    const prevShowVideoModal = useRef(showVideoModal);

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        setIsWindows(ua.includes('win'));
        setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua));
    }, []);

    useEffect(() => {
        fetch("https://api.github.com/repos/colorwall/colorwall/releases/latest")
            .then(res => res.json())
            .then((data) => {
                const exeAsset = data.assets?.find((a: any) => a.name.endsWith('.exe'));
                if (exeAsset) {
                    const sizeMB = (exeAsset.size / (1024 * 1024)).toFixed(1);
                    setReleaseMeta({ version: data.tag_name || "Latest", size: `${sizeMB}MB` });
                }
            })
            .catch(err => console.error("Failed to fetch release meta", err));
    }, []);

    useEffect(() => {
        // probe webgl support before allowing splashcursor to mount.
        // creates a throwaway canvas to test if the browser can provide
        // a webgl context with the half-float texture formats that
        // splashcursor's fluid simulation requires.
        const checkWebGL = () => {
            try {
                const testCanvas = document.createElement("canvas");
                const ctx = testCanvas.getContext("webgl2") || testCanvas.getContext("webgl");
                if (!ctx) return false;
                // verify half-float render texture support (the exact check that was crashing)
                const ext = (ctx as WebGL2RenderingContext).getExtension?.("EXT_color_buffer_float");
                const floatLinear = (ctx as WebGL2RenderingContext).getExtension?.("OES_texture_float_linear");
                return !!(ctx && (ext || floatLinear));
            } catch {
                return false;
            }
        };

        if (!checkWebGL()) return;

        // only schedule the heavy webgl component if the device actually supports it
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => setIsIdle(true), { timeout: 2000 });
        } else {
            setTimeout(() => setIsIdle(true), 500);
        }
    }, []);

    useEffect(() => {
        // Increment and fetch view count
        fetch('/api/views?page=downloads', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.views !== undefined) setViews(data.views);
            })
            .catch(err => console.error("Failed to fetch views", err));
    }, []);

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

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsEmailSending(true);
        setEmailError("");
        
        try {
            const res = await fetch("/api/send-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            
            if (res.ok) {
                setEmailSent(true);
                setEmail("");
            } else {
                const data = await res.json();
                setEmailError(data.error || "Failed to send link. Please try again.");
            }
        } catch (err) {
            setEmailError("A network error occurred. Please try again.");
        } finally {
            setIsEmailSending(false);
        }
    };

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
        <div className={`min-h-screen ${bgColor} ${textColor} font-sans selection:bg-blue-500/30 relative`}>
            {/* Preload SmartScreen Images to avoid blink */}
            <div className="hidden">
                <Image src="/smartscreen1.png" alt="" width={10} height={10} priority />
                <Image src="/smartscreen2.png" alt="" width={10} height={10} priority />
            </div>

            {/* Global Water Background */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen">
                {isIdle && (
                    <SplashCursor
                        COLOR={isDark ? "#3b82f6" : "#2563eb"}
                        RAINBOW_MODE={false}
                        TRANSPARENT={true}
                        CURL={0.0}
                        DENSITY_DISSIPATION={6.0}
                        VELOCITY_DISSIPATION={4.0}
                        PRESSURE={0.05}
                        SPLAT_RADIUS={0.3}
                        SPLAT_FORCE={6000}
                    />
                )}
            </div>

            <main className="pt-28 pb-20 px-6 relative z-10">
                <div className="max-w-4xl mx-auto space-y-16">

                    {/* Unified Hero + Cards Wrapper */}
                    <div className="relative pt-10 w-full rounded-3xl">
                        {/* Hero / Main Download Area */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-6 relative z-10 mb-16"
                        >
                            <div className="relative w-28 h-28 mx-auto drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                                <Image
                                    src="/colorwall.png"
                                    alt="ColorWall Icon"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div> 

                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl lg:text-7xl font-outfit font-[200] tracking-tight">
                                    Download Colorwall
                                </h1>
                                <p
                                    className="text-lg md:text-xl font-bold bg-clip-text text-transparent animate-bg-pan bg-[length:200%_auto] max-w-xl mx-auto"
                                    style={{
                                        backgroundImage: isDark
                                            ? 'linear-gradient(110deg, #ffffff 35%, #f4f9ff 45%, #8bc5f8 50%, #f4f9ff 55%, #ffffff 65%)'
                                            : 'linear-gradient(110deg, #000000 35%, #111827 45%, #3b82f6 50%, #111827 55%, #000000 65%)'
                                    }}
                                >
                                    Desktop Customization Engine, Engineered in Rust
                                </p>
                            </div>
                        </motion.div>

                        {/* App UI Showcase wrong spot */}
                        {/* <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="w-full relative z-10 mb-32"
                        >
                            <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/5 bg-black/5 aspect-video flex items-center justify-center">
                                <Image
                                    src="/HOME.webp"
                                    alt="ColorWall in action"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t to-transparent pointer-events-none ${isDark ? "from-[#0a0a0a]" : "from-white"}`} />
                            </div>
                        </motion.div> */}

                        {/* Device-Specific CTA */}
                        {isMobile ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                                className="w-full relative z-10 mb-20 px-4 flex flex-col items-center text-center"
                            >
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-outfit font-[200] tracking-tight mb-6 leading-tight">
                                    Looks like you&apos;re on a <span className="italic font-[300] opacity-80">mobile</span> device.
                                </h2>
                                
                                <p className={`max-w-md mx-auto text-sm sm:text-base mb-10 ${mutedText}`}>
                                    ColorWall is a desktop customization engine designed for Windows. 
                                    Enter your email to send the download link to your PC.
                                </p>
                                
                                <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl ${borderColor} ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                                    {emailSent ? (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }} 
                                            animate={{ opacity: 1, scale: 1 }} 
                                            className="flex flex-col items-center justify-center space-y-5 py-6 px-4"
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                                                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                                    <MailCheck size={32} />
                                                </div>
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-500">Link Secured!</h3>
                                                <p className={`text-sm ${mutedText} leading-relaxed`}>We&apos;ve sent the download link to your inbox. Open it on your PC to get started.</p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
                                            <div className="space-y-2">
                                                <input 
                                                    type="email" 
                                                    placeholder="Enter your email address" 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    className={`w-full px-5 py-4 rounded-xl border ${borderColor} bg-transparent outline-none focus:border-blue-500 transition-colors text-base`}
                                                />
                                                {emailError && (
                                                    <p className="text-red-500 text-xs text-left px-1">{emailError}</p>
                                                )}
                                            </div>
                                            <button 
                                                type="submit"
                                                disabled={isEmailSending}
                                                className={`w-full group relative inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-300 ${isEmailSending ? "opacity-70 cursor-wait" : "hover:-translate-y-1 hover:shadow-xl"} ${isDark ? "bg-white text-black hover:shadow-white/10" : "bg-black text-white hover:shadow-black/10"}`}
                                            >
                                                {isEmailSending ? "Sending..." : "Send Link to Email"}
                                            </button>
                                        </form>
                                    )}
                                    
                                    {!showDownloadsMobile && (
                                        <div className={`mt-8 pt-6 border-t flex flex-col items-center ${isDark ? "border-white/10" : "border-black/10"}`}>
                                            <button 
                                                onClick={() => setShowDownloadsMobile(true)}
                                                className={`text-xs font-semibold underline decoration-transparent hover:decoration-current transition-colors opacity-60 hover:opacity-100 ${isDark ? "text-white" : "text-black"}`}
                                            >
                                                Download .exe to this device anyway
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : isWindows ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.08 }}
                                className="w-full relative z-10 mb-20 px-4 flex flex-col items-center text-center"
                            >
                                {/* will do something else of this later probably    */}
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-outfit font-[200] tracking-[-0.04em] mb-6 leading-tight">
                                    Ready to let go of old,{" "}
                                    <span className="italic font-[300] opacity-80">
                                        clunky
                                    </span>
                                    <br className="hidden sm:block" /> wallpaper engines?
                                </h2>
                                
                                <div className={`inline-flex flex-col sm:flex-row items-center gap-2 text-sm sm:text-base font-medium mb-10 ${mutedText}`}>
                                    <span>FYI: Colorwall only uses <span className={`font-bold ${isDark ? "text-white" : "text-black"}`}>~0.5% CPU</span></span>
                                    <span className="hidden sm:inline">&middot;</span>
                                    <span>Near-zero overhead even at 4K/8K 60FPS</span>
                                </div>
                                
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                        isDownloading 
                                            ? "opacity-70 cursor-wait" 
                                            : ""
                                    } ${isDark ? "bg-white text-black hover:shadow-white/10" : "bg-black text-white hover:shadow-black/10"}`}
                                >
                                    <Download size={20} className={isDownloading ? "animate-bounce" : ""} />
                                    <span>{isDownloading ? "Starting Download..." : "Download Colorwall for Windows"}</span>
                                </button>
                                
                                <div className="flex items-center justify-center gap-2 text-xs font-medium opacity-50 mt-6">
                                    {releaseMeta ? (
                                        <span>Version {releaseMeta.version} &middot; {releaseMeta.size}</span>
                                    ) : (
                                        <span className="animate-pulse">Fetching latest release...</span>
                                    )}
                                </div>
                            </motion.div>
                        ) : null}

                        {/* Platform Downloads */}
                        {(!isMobile || showDownloadsMobile) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="grid md:grid-cols-3 gap-6 w-full relative z-10"
                            >
                            {/* Windows */}
                            <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${borderColor} ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"}`}>
                                <div className="space-y-2 mb-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 87 87" fill="currentColor" className="w-[36px] h-[36px] inline-block mx-auto mb-4 opacity-80">
                                        <path d="M0 0h41.4v41.4H0zM45.6 0H87v41.4H45.6zM0 45.6h41.4V87H0zM45.6 45.6H87V87H45.6z" />
                                    </svg>
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

                                    <div className="flex items-center justify-center gap-2 text-xs font-medium opacity-70 mb-2">
                                        {releaseMeta ? (
                                            <span>{releaseMeta.version} • {releaseMeta.size}</span>
                                        ) : (
                                            <span className="animate-pulse">Fetching version info...</span>
                                        )}
                                    </div>

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
                            <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${borderColor} bg-transparent ${isDark ? "hover:border-white/30" : "hover:border-black/30"}`}>
                                <div className="space-y-2 mb-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="w-[36px] h-[36px] inline-block mx-auto mb-4 opacity-80"><path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM420 403.8c-3.6-4-5.3-11.6-7.2-19.7-1.8-8.1-3.9-16.8-10.5-22.4-1.3-1.1-2.6-2.1-4-2.9-1.3-.8-2.7-1.5-4.1-2 9.2-27.3 5.6-54.5-3.7-79.1-11.4-30.1-31.3-56.4-46.5-74.4-17.1-21.5-33.7-41.9-33.4-72C311.1 85.4 315.7.1 234.8 0 132.4-.2 158 103.4 156.9 135.2c-1.7 23.4-6.4 41.8-22.5 64.7-18.9 22.5-45.5 58.8-58.1 96.7-6 17.9-8.8 36.1-6.2 53.3-6.5 5.8-11.4 14.7-16.6 20.2-4.2 4.3-10.3 5.9-17 8.3s-14 6-18.5 14.5c-2.1 3.9-2.8 8.1-2.8 12.4 0 3.9.6 7.9 1.2 11.8 1.2 8.1 2.5 15.7.8 20.8-5.2 14.4-5.9 24.4-2.2 31.7 3.8 7.3 11.4 10.5 20.1 12.3 17.3 3.6 40.8 2.7 59.3 12.5 19.8 10.4 39.9 14.1 55.9 10.4 11.6-2.6 21.1-9.6 25.9-20.2 12.5-.1 26.3-5.4 48.3-6.6 14.9-1.2 33.6 5.3 55.1 4.1.6 2.3 1.4 4.6 2.5 6.7v.1c8.3 16.7 23.8 24.3 40.3 23 16.6-1.3 34.1-11 48.3-27.9 13.6-16.4 36-23.2 50.9-32.2 7.4-4.5 13.4-10.1 13.9-18.3.4-8.2-4.4-17.3-15.5-29.7zM223.7 87.3c9.8-22.2 34.2-21.8 44-.4 6.5 14.2 3.6 30.9-4.3 40.4-1.6-.8-5.9-2.6-12.6-4.9 1.1-1.2 3.1-2.7 3.9-4.6 4.8-11.8-.2-27-9.1-27.3-7.3-.5-13.9 10.8-11.8 23-4.1-2-9.4-3.5-13-4.4-1-6.9-.3-14.6 2.9-21.8zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1zm-13.6 60.7c6.2-4.6 13.6-10 14.1-10.5 4.7-4.4 13.5-14.2 27.9-14.2 7.1 0 15.6 2.3 25.9 8.9 6.3 4.1 11.3 4.4 22.6 9.3 8.4 3.5 13.7 9.7 10.5 18.2-2.6 7.1-11 14.4-22.7 18.1-11.1 3.6-19.8 16-38.2 14.9-3.9-.2-7-1-9.6-2.1-8-3.5-12.2-10.4-20-15-8.6-4.8-13.2-10.4-14.7-15.3-1.4-4.9 0-9 4.2-12.3zm3.3 334c-2.7 35.1-43.9 34.4-75.3 18-29.9-15.8-68.6-6.5-76.5-21.9-2.4-4.7-2.4-12.7 2.6-26.4v-.2c2.4-7.6.6-16-.6-23.9-1.2-7.8-1.8-15 .9-20 3.5-6.7 8.5-9.1 14.8-11.3 10.3-3.7 11.8-3.4 19.6-9.9 5.5-5.7 9.5-12.9 14.3-18 5.1-5.5 10-8.1 17.7-6.9 8.1 1.2 15.1 6.8 21.9 16l19.6 35.6c9.5 19.9 43.1 48.4 41 68.9zm-1.4-25.9c-4.1-6.6-9.6-13.6-14.4-19.6 7.1 0 14.2-2.2 16.7-8.9 2.3-6.2 0-14.9-7.4-24.9-13.5-18.2-38.3-32.5-38.3-32.5-13.5-8.4-21.1-18.7-24.6-29.9s-3-23.3-.3-35.2c5.2-22.9 18.6-45.2 27.2-59.2 2.3-1.7.8 3.2-8.7 20.8-8.5 16.1-24.4 53.3-2.6 82.4.6-20.7 5.5-41.8 13.8-61.5 12-27.4 37.3-74.9 39.3-112.7 1.1.8 4.6 3.2 6.2 4.1 4.6 2.7 8.1 6.7 12.6 10.3 12.4 10 28.5 9.2 42.4 1.2 6.2-3.5 11.2-7.5 15.9-9 9.9-3.1 17.8-8.6 22.3-15 7.7 30.4 25.7 74.3 37.2 95.7 6.1 11.4 18.3 35.5 23.6 64.6 3.3-.1 7 .4 10.9 1.4 13.8-35.7-11.7-74.2-23.3-84.9-4.7-4.6-4.9-6.6-2.6-6.5 12.6 11.2 29.2 33.7 35.2 59 2.8 11.6 3.3 23.7.4 35.7 16.4 6.8 35.9 17.9 30.7 34.8-2.2-.1-3.2 0-4.2 0 3.2-10.1-3.9-17.6-22.8-26.1-19.6-8.6-36-8.6-38.3 12.5-12.1 4.2-18.3 14.7-21.4 27.3-2.8 11.2-3.6 24.7-4.4 39.9-.5 7.7-3.6 18-6.8 29-32.1 22.9-76.7 32.9-114.3 7.2zm257.4-11.5c-.9 16.8-41.2 19.9-63.2 46.5-13.2 15.7-29.4 24.4-43.6 25.5s-26.5-4.8-33.7-19.3c-4.7-11.1-2.4-23.1 1.1-36.3 3.7-14.2 9.2-28.8 9.9-40.6.8-15.2 1.7-28.5 4.2-38.7 2.6-10.3 6.6-17.2 13.7-21.1.3-.2.7-.3 1-.5.8 13.2 7.3 26.6 18.8 29.5 12.6 3.3 30.7-7.5 38.4-16.3 9-.3 15.7-.9 22.6 5.1 9.9 8.5 7.1 30.3 17.1 41.6 10.6 11.6 14 19.5 13.7 24.6zM173.3 148.7c2 1.9 4.7 4.5 8 7.1 6.6 5.2 15.8 10.6 27.3 10.6 11.6 0 22.5-5.9 31.8-10.8 4.9-2.6 10.9-7 14.8-10.4s5.9-6.3 3.1-6.6-2.6 2.6-6 5.1c-4.4 3.2-9.7 7.4-13.9 9.8-7.4 4.2-19.5 10.2-29.9 10.2s-18.7-4.8-24.9-9.7c-3.1-2.5-5.7-5-7.7-6.9-1.5-1.4-1.9-4.6-4.3-4.9-1.4-.1-1.8 3.7 1.7 6.5z" /></svg>
                                    <h3 className="text-3xl font-black tracking-tight">Linux</h3>
                                    <p className={`text-sm ${mutedText} font-medium`}>Linux Wayland/X11</p>
                                </div>

                                <div className="space-y-3 w-full">
                                    <a
                                        href="https://github.com/LaxentaInc/WallpaperEngine-Linux"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-full group relative inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? "bg-white text-black hover:shadow-white/10" : "bg-black text-white hover:shadow-black/10"}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                                        <span>View on GitHub</span>
                                    </a>

                                    <div className="flex items-start gap-2 text-xs pt-4 opacity-70">
                                        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                                        <span className="leading-snug">For the open-source community. Contribute on GitHub.</span>
                                    </div>
                                </div>
                            </div>

                            {/* macOS */}
                            <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${borderColor} bg-transparent opacity-60 backdrop-grayscale hover:backdrop-grayscale-0`}>
                                <div className="space-y-2 mb-8 text-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-[36px] h-[36px] inline-block mx-auto mb-4 opacity-80 fill-current">
                                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                                    </svg>
                                    <h3 className="text-3xl font-black tracking-tight">macOS</h3>
                                    <p className={`text-sm ${mutedText} font-medium`}>Join the Waitlist</p>
                                </div>

                                <div className="space-y-3 w-full">
                                    <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for joining the macOS waitlist!"); }} className="flex flex-col gap-2">
                                        <input 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            required
                                            className={`w-full px-4 py-3 rounded-xl border ${borderColor} bg-transparent outline-none focus:border-blue-500 transition-colors text-sm`}
                                        />
                                        <button 
                                            type="submit"
                                            className={`w-full group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all duration-300 ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-black"}`}
                                        >
                                            Notify Me
                                        </button>
                                    </form>
                                </div>
                            </div>
                            </motion.div>
                        )}

                        {/* System Requirements */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full relative z-10 mt-16"
                        >
                            <div className={`p-6 sm:p-8 rounded-3xl border ${borderColor} ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                                <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-4">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight mb-2 text-center md:text-left">System Requirements</h3>
                                        <p className={`${mutedText} text-sm md:text-base text-center md:text-left`}>Ensure your system meets the minimum specifications to run ColorWall smoothly.</p>
                                    </div>
                                    <div className={`rounded-full text-xs font-bold tracking-widest uppercase ${borderColor} ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                                        Windows Only
                                    </div>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className={`border-b-2 ${borderColor} text-sm tracking-wider uppercase`}>
                                                <th className={`py-4 px-4 font-bold ${mutedText}`}>Hardware</th>
                                                <th className={`py-4 px-4 font-bold ${mutedText}`}>Minimum Requirements</th>
                                                <th className={`py-4 px-4 font-bold ${mutedText}`}>Recommended Specifications</th>
                                            </tr>
                                        </thead>
                                        <tbody className={`text-sm md:text-base divide-y ${borderColor}`}>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-semibold text-current">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"} flex items-center justify-center`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                                                        </div>
                                                        OS
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 font-medium">Windows 10 (64-bit)</td>
                                                <td className="py-4 px-4 font-medium">Windows 10 / 11 (64-bit)</td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-semibold text-current">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"} flex items-center justify-center`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                                                        </div>
                                                        Processor
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 font-medium">1.5 GHz Dual-Core (Intel i3 / AMD Ryzen 3)</td>
                                                <td className="py-4 px-4 font-medium">2.0 GHz+ Quad-Core (Intel i5 / AMD Ryzen 5)</td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-semibold text-current">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"} flex items-center justify-center`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 19v-3"/><path d="M10 19v-3"/><path d="M14 19v-3"/><path d="M18 19v-3"/><path d="M8 11V9"/><path d="M16 11V9"/><path d="M12 11V9"/><path d="M2 15h20"/><path d="M2 7h20"/><path d="M22 15V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z"/></svg>
                                                        </div>
                                                        Memory
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 font-medium">2 GB RAM</td>
                                                <td className="py-4 px-4 font-medium">4 GB RAM</td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-semibold text-current">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"} flex items-center justify-center`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
                                                        </div>
                                                        Graphics
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 font-medium">Intel HD Graphics 4000 or equivalent</td>
                                                <td className="py-4 px-4 font-medium">NVIDIA GeForce GTX 660 / AMD Radeon HD 7850</td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-semibold text-current">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"} flex items-center justify-center`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                                        </div>
                                                        DirectX
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 font-medium">Version 10</td>
                                                <td className="py-4 px-4 font-medium">Version 11 or higher</td>
                                            </tr>
                                            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="py-4 px-4 font-semibold text-current">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-white/10" : "bg-black/10"} flex items-center justify-center`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                                        </div>
                                                        Storage
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 font-medium">500 MB available space</td>
                                                <td className="py-4 px-4 font-medium">1 GB+ available space (SSD preferred)</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* comparison table intentionally disabled on download route to prevent layout fatigue when user already intends to download */}
                    {/*
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="w-full relative z-10"
                    >
                        <ComparisonTable theme={theme} isDownloadPage={true} />
                    </motion.div>
                    */}

                    {/* Security Report Section */}
                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="w-full relative z-10"
                    >
                        <SecurityReport theme={theme} isDownloadPage={true} />
                    </motion.div> */}
                      <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="w-full relative z-10 mb-32"
                        >
                            <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-500/10 border border-white/5 bg-black/5 aspect-video flex items-center justify-center">
                                <Image
                                    src="/HOME.webp"
                                    alt="ColorWall Home"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t to-transparent pointer-events-none ${isDark ? "from-[#0a0a0a]" : "from-white"}`} />
                            </div>
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
                        className={`relative w-full max-w-[480px] p-5 sm:p-6 rounded-[2rem] shadow-2xl border ${isDark ? "bg-[#0a0a0a] border-white/10" : "bg-white border-black/10"}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowVideoModal(false)}
                            className={`absolute top-4 right-4 p-2 rounded-xl transition-colors z-20 ${isDark ? "hover:bg-white/10 bg-white/5" : "hover:bg-black/10 bg-black/5"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                        
                        {/* Header */}
                        <div className="text-center mb-5 space-y-1">
                            <div className="flex flex-row items-center justify-center gap-2 mb-1">
                                <Image src="/colorwall.png" alt="ColorWall" width={24} height={24} className="w-6 h-6 object-contain" />
                                <h3 className="font-outfit font-black text-xl sm:text-2xl tracking-tight">
                                    Thank you for downloading
                                </h3>
                            </div>
                            <div className="flex flex-row items-center justify-center gap-1.5 text-xs font-medium">
                                <span className={mutedText}>Download didn&apos;t start?</span>
                                {downloadUrl ? (
                                    <a href={downloadUrl} className={`${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"} font-bold transition-colors`} target="_blank" rel="noopener noreferrer">Click here</a>
                                ) : (
                                    <span className="animate-pulse">Fetching...</span>
                                )}
                            </div>
                        </div>

                        {/* Large Image Preview for SmartScreen */}
                        <div className="mx-auto rounded-xl overflow-hidden border border-blue-500/20 drop-shadow-2xl mb-5 w-full grid bg-transparent">
                            <AnimatePresence mode="popLayout">
                                <motion.img
                                    key={currentImage}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.02 }}
                                    transition={{ duration: 0.3 }}
                                    src={`/smartscreen${currentImage}.png`}
                                    alt={`SmartScreen Bypass Step ${currentImage}`}
                                    className="w-full h-auto block"
                                    style={{ gridArea: '1 / 1 / 2 / 2' }}
                                    fetchPriority="high"
                                    loading="eager"
                                />
                            </AnimatePresence>
                        </div>

                        {/* Steps */}
                        <div className="relative mb-5 px-1">
                            {/* Connecting Line (hidden on smaller screens) */}
                            <div className={`hidden sm:block absolute top-4 left-[10%] right-[10%] h-[1px] -translate-y-1/2 z-0 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                            
                            <div className="grid grid-cols-4 gap-2 relative z-10">
                                {/* Step 1 */}
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center mb-1.5 shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                                        1
                                    </div>
                                    <h4 className="font-bold text-xs mb-0.5">Open</h4>
                                    <p className={`text-[10px] ${mutedText} leading-tight`}>
                                        <span className="font-semibold text-current">Double-click</span> file
                                    </p>
                                </div>
                                {/* Step 2 */}
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center mb-1.5 shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                                        2
                                    </div>
                                    <h4 className="font-bold text-xs mb-0.5">Launch</h4>
                                    <p className={`text-[10px] ${mutedText} leading-tight`}>
                                        From <span className="font-semibold text-current">Downloads</span>
                                    </p>
                                </div>
                                {/* Step 3 */}
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center mb-1.5 shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                                        3
                                    </div>
                                    <h4 className="font-bold text-xs mb-0.5">Confirm</h4>
                                    <p className={`text-[10px] ${mutedText} leading-tight`}>
                                        Click <span className="font-semibold text-current">More info</span>
                                    </p>
                                </div>
                                {/* Step 4 */}
                                <div className="flex flex-col items-center text-center group">
                                    <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center mb-1.5 shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
                                        4
                                    </div>
                                    <h4 className="font-bold text-xs mb-0.5">Install</h4>
                                    <p className={`text-[10px] ${mutedText} leading-tight`}>
                                        Click <span className="font-semibold text-current">Run anyway</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SmartScreen Info Box */}
                        <div className={`p-3 rounded-xl border ${isDark ? "bg-emerald-500/5 border-emerald-500/20" : "bg-emerald-50/50 border-emerald-200"} flex items-start gap-2.5 text-left w-full mx-auto`}>
                            <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5 flex-1">
                                <p className={`text-[11px] font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                                    Why am I seeing SmartScreen?
                                </p>
                                <p className={`text-[10px] ${isDark ? "text-emerald-400/80" : "text-emerald-600"} leading-snug`}>
                                    Windows flags new files without a long reputation. Colorwall is 100% clean.{" "}
                                    <a href="https://www.virustotal.com/gui/file/e4b28bc9a6b9e86ae370fec0f7193ba6b9d146be533e8dc5b980f1b6e409cc6b/detection" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-80 transition-opacity">
                                        View VirusTotal report
                                    </a>.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Simple View Counter - Fixed Bottom Right */}
            {views !== null && (
                <div className={`fixed bottom-6 right-8 text-[11px] font-mono tracking-widest uppercase z-[9999] ${isDark ? "text-white/40" : "text-black/40"}`}>
                    {views.toLocaleString()} Views
                </div>
            )}

            <Footer theme={theme} />
        </div>
    );
}