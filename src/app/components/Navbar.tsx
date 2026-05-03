"use client";
import { useEffect, useRef, useState, useCallback, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { MessageCircle, MessageSquare, FileText, Menu, X, Home, Download, Loader2 } from "lucide-react";

const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const GithubIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.153-1.11-1.46-1.11-1.46-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
    </svg>
);

const DiscordIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 127.14 96.36">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.08,65.69,84.69,65.69Z" />
    </svg>
);

const XIcon = () => (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const SoundOnIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);

const SoundOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);

export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const isDark = theme === "dark";
    const [isVisible, setIsVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSoundOn, setIsSoundOn] = useState(false);
    const [loadingRoute, setLoadingRoute] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastScrollY = useRef(0);
    const isHovered = useRef(false);

    useEffect(() => {
        audioRef.current = new Audio("/temp_recording.wav");
        audioRef.current.loop = true;
        audioRef.current.volume = 1.0;
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const toggleSound = useCallback(() => {
        if (!audioRef.current) return;
        if (isSoundOn) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(() => {/* autoplay may be blocked */});
        }
        setIsSoundOn(prev => !prev);
    }, [isSoundOn]);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
                setIsVisible(true);
            } else if (!isHovered.current) {
                setIsVisible(false);
                setIsMobileMenuOpen(false);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setLoadingRoute(null);
    }, [pathname]);

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "Download", href: "/download", icon: Download },
        { name: "Changelog", href: "/changelog", icon: FileText },
        { name: "Feedback", href: "/feedback", icon: MessageSquare },
        { name: "Discussions", href: "https://github.com/orgs/Colorwall/discussions", icon: MessageCircle },
    ];

    const handleNavClick = (
        event: MouseEvent<HTMLAnchorElement>,
        href: string,
        isExternal: boolean,
        closeMobileMenu?: boolean
    ) => {
        if (closeMobileMenu) {
            setIsMobileMenuOpen(false);
        }

        if (isExternal || pathname === href) {
            return;
        }

        event.preventDefault();
        setLoadingRoute(href);
        setTimeout(() => router.push(href), 50);
    };

    const base = isDark
        ? "bg-[#0a0a0a]/50 border-white/10 text-white/80"
        : "bg-white/50 border-black/10 text-black/80";
    const iconBtn = isDark
        ? "hover:text-white hover:bg-white/8 text-white/50"
        : "hover:text-black hover:bg-black/5 text-black/40";

    return (
        <div
            className="fixed top-2 z-[100] w-[calc(100%-1.5rem)] max-w-5xl left-1/2 -translate-x-1/2 transition-all duration-200"
            style={{
                transform: !isVisible ? "translateY(-100px)" : "translateY(0)",
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? "auto" : "none",
            }}
            onMouseEnter={() => {
                isHovered.current = true;
                setIsVisible(true);
            }}
            onMouseLeave={() => {
                isHovered.current = false;
            }}
        >
            <div
                className={`backdrop-blur-md shadow-xl border rounded-2xl overflow-hidden transition-all duration-200 ${base}`}
            >
                <div className="flex items-center h-14 px-4 gap-2">
                    <Link href="/" className="group flex items-center mr-1 opacity-90 hover:opacity-100 transition-opacity shrink-0 relative">
                        <img src="/colorwall.png" alt="ColorWall logo" className="h-7 object-contain" />
                        <span className={`absolute left-[76px] top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-widest uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 shadow-xl transition-all pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
              ${isDark ? "bg-[#0a0a0a]/90 border border-white/10 text-white" : "bg-white/90 border border-black/10 text-black"}`}>
                            ColorWall
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center justify-center gap-0.5 flex-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const isExternal = link.href.startsWith("http");
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target={isExternal ? "_blank" : undefined}
                                    rel={isExternal ? "noopener noreferrer" : undefined}
                                    onClick={(event) => handleNavClick(event, link.href, isExternal)}
                                    className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-mono font-semibold tracking-widest uppercase transition-all duration-200 flex items-center gap-2
                    ${isActive
                                            ? isDark ? "bg-white/10 text-white" : "bg-black/6 text-black"
                                            : isDark ? "text-white/55 hover:text-white hover:bg-white/7" : "text-black/50 hover:text-black hover:bg-black/4"
                                        }`}
                                >
                                    {loadingRoute === link.href ? (
                                        <Loader2 size={16} strokeWidth={1.8} className="animate-spin" />
                                    ) : (
                                        <link.icon size={16} strokeWidth={1.8} />
                                    )}
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex-1 md:flex-none" />
                    <div className="hidden md:flex items-center gap-0.5">
                        <a href="https://github.com/colorwall/colorwall" target="_blank" rel="noopener noreferrer"
                            aria-label="GitHub" className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}>
                            <GithubIcon />
                        </a>
                        <a href="https://discord.gg/cHVwPkBC7p" target="_blank" rel="noopener noreferrer"
                            aria-label="Discord" className={`p-2 rounded-lg transition-all duration-200 ${isDark ? "text-white/50 hover:text-[#5865F2] hover:bg-[#5865F2]/10" : "text-black/40 hover:text-[#5865F2] hover:bg-[#5865F2]/8"}`}>
                            <DiscordIcon />
                        </a>
                        <a href="https://x.com/colorwall_xyz" target="_blank" rel="noopener noreferrer"
                            aria-label="X (Twitter)" className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}>
                            <XIcon />
                        </a>
                        <div className={`w-px h-5 mx-1.5 ${isDark ? "bg-white/10" : "bg-black/8"}`} />
                        <button onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}
                            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                            title="Toggle theme">
                            {isDark ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <button
                            onClick={toggleSound}
                            className={`p-2 rounded-lg transition-all duration-200 ${isSoundOn
                                ? isDark ? "text-white bg-white/10 hover:bg-white/15" : "text-black bg-black/8 hover:bg-black/12"
                                : iconBtn}`}
                            title={isSoundOn ? "Mute ambient sound" : "Play ambient sound"}
                        >
                            {isSoundOn ? <SoundOnIcon /> : <SoundOffIcon />}
                        </button>
                    </div>
                    <div className="md:hidden flex items-center gap-1">
                        <button onClick={toggleTheme} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"} className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}>
                            {isDark ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}
                        >
                            {isMobileMenuOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
                        </button>
                    </div>
                </div>
                {isMobileMenuOpen && (
                    <div
                        className="md:hidden overflow-hidden transition-all duration-200"
                        style={{
                            maxHeight: "500px",
                            opacity: 1,
                        }}
                    >
                        <div className={`px-2 pb-2 pt-1 flex flex-col gap-0.5 border-t ${isDark ? "border-white/8" : "border-black/6"}`}>
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const isExternal = link.href.startsWith("http");
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        target={isExternal ? "_blank" : undefined}
                                        rel={isExternal ? "noopener noreferrer" : undefined}
                                        onClick={(event) => handleNavClick(event, link.href, isExternal, true)}
                                        className={`px-3 py-2 rounded-xl text-[11px] sm:text-xs font-mono font-semibold tracking-widest uppercase transition-all duration-200 flex items-center gap-2.5
                        ${isActive
                                            ? isDark ? "bg-white/10 text-white" : "bg-black/6 text-black"
                                            : isDark ? "text-white/55 hover:text-white hover:bg-white/7" : "text-black/50 hover:text-black hover:bg-black/4"
                                        }`}
                                    >
                                        {loadingRoute === link.href ? (
                                            <Loader2 size={16} strokeWidth={1.8} className="animate-spin" />
                                        ) : (
                                            <link.icon size={16} strokeWidth={1.8} />
                                        )}
                                        {link.name}
                                    </Link>
                                );
                            })}
                            <div className={`flex items-center gap-2 px-3 pt-1.5 mt-0.5 border-t ${isDark ? "border-white/8" : "border-black/6"}`}>
                                <a href="https://github.com/colorwall/colorwall" target="_blank" rel="noopener noreferrer"
                                    aria-label="GitHub" className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}>
                                    <GithubIcon />
                                </a>
                                <a href="https://discord.gg/cHVwPkBC7p" target="_blank" rel="noopener noreferrer"
                                    aria-label="Discord" className={`p-2 rounded-lg transition-all duration-200 ${isDark ? "text-white/50 hover:text-[#5865F2] hover:bg-[#5865F2]/10" : "text-black/40 hover:text-[#5865F2] hover:bg-[#5865F2]/8"}`}>
                                    <DiscordIcon />
                                </a>
                                <a href="https://x.com/colorwall_xyz" target="_blank" rel="noopener noreferrer"
                                    aria-label="X (Twitter)" className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}>
                                    <XIcon />
                                </a>
                                <button
                                    onClick={toggleSound}
                                    className={`p-2 rounded-lg transition-all duration-200 ml-auto ${isSoundOn
                                        ? isDark ? "text-white bg-white/10" : "text-black bg-black/8"
                                        : iconBtn}`}
                                    title={isSoundOn ? "Mute ambient sound" : "Play ambient sound"}
                                >
                                    {isSoundOn ? <SoundOnIcon /> : <SoundOffIcon />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
