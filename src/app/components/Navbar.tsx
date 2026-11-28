"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/app/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    Coffee,
    MessageSquare,
    Menu,
    X,
    Home,
    Download,
    Loader2,
    Wallpaper,
    ChevronDown,
    AtSign,
    Sparkles,
    Layers,
    UserCheck,
    Link2,
    ArrowRight,
    Sun,
    Moon,
} from "lucide-react";
import GooeyNav from "./ui/GooeyNav";
import { cn } from "@/lib/utils";

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
    <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const NAV_LINKS = [
    { name: "Home", href: "/", icon: Home },
    { name: "Download", href: "/download", icon: Download },
    { name: "Wallpapers", href: "/wallpapers", icon: Wallpaper },
    { name: "Feedback", href: "/feedback", icon: MessageSquare },
    { name: "Support", href: "/about", icon: Coffee },
];

const CREATOR_ITEMS = [
    {
        title: "Reserve Handle",
        desc: "Claim your colorwall.xyz/@handle before launch",
        href: "/creators",
        icon: AtSign,
    },
    {
        title: "Creator Workshop",
        desc: "Publish Live2D scenes, widgets, and WebGL shaders",
        href: "/creators#workshop",
        icon: Layers,
    },
    {
        title: "Verified Waitlist",
        desc: "Unlock the verified publisher badge across listings",
        href: "/creators#waitlist",
        icon: Sparkles,
    },
    {
        title: "Desktop App Sync",
        desc: "Link your handle directly to the ColorWall app",
        href: "/creators#sync",
        icon: Link2,
    },
];

// floating translucent navbar pairing gooeynav physics with a gpu-composited creators dropdown
export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const router = useRouter();
    const isDark = theme === "dark";

    const [isVisible, setIsVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCreatorsOpen, setIsCreatorsOpen] = useState(false);
    const [loadingRoute, setLoadingRoute] = useState<string | null>(null);
    const [isCinematicActive, setIsCinematicActive] = useState(false);

    const lastScrollY = useRef(0);
    const isHovered = useRef(false);
    const headerRef = useRef<HTMLElement>(null);
    const openedByHoverRef = useRef(false);
    const creatorsCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // unmount navbar when 3d webgl cinematic mode is active to prevent accidental route triggers
    useEffect(() => {
        const handleCinematicChange = () => {
            const active =
                typeof document !== "undefined" &&
                (document.body.dataset.cinematic === "true" ||
                    document.body.dataset.fluidGallery === "true");
            setIsCinematicActive(active);
        };

        handleCinematicChange();
        window.addEventListener("cinematic-change", handleCinematicChange);
        return () => window.removeEventListener("cinematic-change", handleCinematicChange);
    }, []);

    // hide navbar on scroll down, restore on scroll up or top
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
                setIsVisible(true);
            } else if (!isHovered.current) {
                setIsVisible(false);
                setIsMobileMenuOpen(false);
                setIsCreatorsOpen(false);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // close creators dropdown on outside click or escape key
    useEffect(() => {
        if (!isCreatorsOpen) return;

        const handleOutsideClick = (e: globalThis.MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
                setIsCreatorsOpen(false);
                openedByHoverRef.current = false;
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsCreatorsOpen(false);
                openedByHoverRef.current = false;
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("keydown", handleKey);
        };
    }, [isCreatorsOpen]);

    useEffect(() => {
        setLoadingRoute(null);
        setIsCreatorsOpen(false);
        setIsMobileMenuOpen(false);
        openedByHoverRef.current = false;
        if (pathname !== "/") {
            setIsCinematicActive(false);
            setIsVisible(true);
        }
    }, [pathname]);

    const handleNavClick = (
        event: MouseEvent<HTMLAnchorElement>,
        href: string,
        isExternal: boolean,
        closeMobileMenu?: boolean
    ) => {
        if (closeMobileMenu) {
            setIsMobileMenuOpen(false);
        }
        setIsCreatorsOpen(false);
        openedByHoverRef.current = false;

        if (isExternal || pathname === href) {
            return;
        }

        if (href.includes("#") && pathname === href.split("#")[0]) {
            return;
        }

        event.preventDefault();
        setLoadingRoute(href);
        setTimeout(() => router.push(href), 50);
    };

    const openCreatorsByHover = () => {
        if (creatorsCloseTimer.current) clearTimeout(creatorsCloseTimer.current);
        if (!isCreatorsOpen) {
            openedByHoverRef.current = true;
            setIsCreatorsOpen(true);
        }
    };

    const closeCreatorsDelayed = () => {
        creatorsCloseTimer.current = setTimeout(() => {
            setIsCreatorsOpen(false);
            openedByHoverRef.current = false;
        }, 140);
    };

    // ensure clicking creators always opens or keeps open on first click, then toggles cleanly
    const handleCreatorsClick = () => {
        if (creatorsCloseTimer.current) clearTimeout(creatorsCloseTimer.current);
        if (isCreatorsOpen && openedByHoverRef.current) {
            openedByHoverRef.current = false;
            return;
        }
        openedByHoverRef.current = false;
        setIsCreatorsOpen((prev) => !prev);
    };

    if (isCinematicActive) {
        return null;
    }

    const activeGooeyIndex = NAV_LINKS.findIndex((l) => l.href === pathname);
    const isCreatorsRoute = pathname.startsWith("/creators");

    return (
        <header
            ref={headerRef}
            className="fixed top-2 md:top-4 z-[100] w-[calc(100%-1.5rem)] md:w-[calc(100%-2rem)] max-w-7xl left-1/2 -translate-x-1/2 transition-all duration-300"
            style={{
                transform: !isVisible ? "translateY(-150%)" : "translateY(0)",
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? "auto" : "none",
            }}
            onMouseEnter={() => {
                isHovered.current = true;
                setIsVisible(true);
            }}
            onMouseLeave={() => {
                isHovered.current = false;
                closeCreatorsDelayed();
            }}
        >
            {/* primary translucent glass bar */}
            <div
                className={cn(
                    "backdrop-blur-xl shadow-xl border rounded-[20px] transition-colors duration-300",
                    isDark
                        ? "bg-[#0a0a0a]/50 border-white/10 text-white"
                        : "bg-white/55 border-black/10 text-slate-900"
                )}
            >
                <div className="flex items-center justify-between h-14 md:h-16 px-3 sm:px-5 lg:px-6 gap-2">
                    {/* brand logo */}
                    <Link
                        href="/"
                        className="hidden sm:flex group items-center gap-2.5 opacity-95 hover:opacity-100 transition-opacity shrink-0"
                    >
                        <img src="/colorwall.png" alt="ColorWall logo" className="h-6 md:h-7 object-contain" />
                        <span className="hidden lg:inline font-outfit text-[15px] font-medium tracking-tight">
                            ColorWall
                        </span>
                    </Link>

                    {/* desktop center: gooeynav + clean creators trigger */}
                    <div className="hidden md:flex items-center justify-center flex-1 gap-1 lg:gap-2">
                        <GooeyNav
                            items={NAV_LINKS.map((l) => ({ label: l.name, href: l.href, icon: l.icon }))}
                            initialActiveIndex={Math.max(0, activeGooeyIndex)}
                            particleCount={12}
                            particleDistances={[60, 10]}
                            particleR={80}
                            animationTime={500}
                            timeVariance={200}
                            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                            isDark={isDark}
                        />

                        <button
                            type="button"
                            onMouseEnter={openCreatorsByHover}
                            onClick={handleCreatorsClick}
                            className={cn(
                                "outline-none py-[0.6em] px-[1em] inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-widest uppercase transition-colors duration-150 shrink-0 cursor-pointer",
                                isCreatorsOpen || isCreatorsRoute
                                    ? "text-[#00a4ff]"
                                    : isDark
                                        ? "text-white hover:text-[#00a4ff]"
                                        : "text-black hover:text-[#00a4ff]"
                            )}
                        >
                            <UserCheck size={16} strokeWidth={2} />
                            <span>Creators</span>
                            <ChevronDown
                                size={14}
                                strokeWidth={2}
                                className={cn(
                                    "transition-transform duration-200",
                                    isCreatorsOpen && "rotate-180"
                                )}
                            />
                        </button>
                    </div>

                    {/* mobile compact icon nav */}
                    <nav className="flex md:hidden items-center justify-evenly gap-1 flex-1 mx-1">
                        {NAV_LINKS.slice(0, 4).map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleNavClick(e, link.href, false)}
                                    title={link.name}
                                    className={cn(
                                        "p-2.5 rounded-xl transition-all duration-200 flex items-center",
                                        isActive
                                            ? isDark ? "bg-white/15 text-white" : "bg-black/10 text-black"
                                            : isDark ? "text-white/75 hover:text-white hover:bg-white/10" : "text-black/70 hover:text-black hover:bg-black/5"
                                    )}
                                >
                                    {loadingRoute === link.href ? (
                                        <Loader2 size={18} strokeWidth={2} className="animate-spin" />
                                    ) : (
                                        <link.icon size={18} strokeWidth={2} />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* right utilities */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <div className="hidden lg:flex items-center gap-0.5">
                            <a
                                href="https://github.com/colorwall/colorwall"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="GitHub"
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-black/5"
                                )}
                            >
                                <GithubIcon />
                            </a>
                            <a
                                href="https://discord.gg/QYwhay7r2V"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Discord"
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isDark ? "text-white/70 hover:text-[#5865F2] hover:bg-[#5865F2]/10" : "text-slate-600 hover:text-[#5865F2] hover:bg-[#5865F2]/10"
                                )}
                            >
                                <DiscordIcon />
                            </a>
                            <a
                                href="https://x.com/colorwall_xyz"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="X"
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isDark ? "text-white/70 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-black/5"
                                )}
                            >
                                <XIcon />
                            </a>
                            <div className={cn("w-px h-5 mx-1.5", isDark ? "bg-white/15" : "bg-black/15")} />
                        </div>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                            className={cn(
                                "p-2.5 sm:p-2 rounded-xl transition-colors",
                                isDark ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-slate-900 hover:bg-black/5"
                            )}
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        <Link
                            href="/creators"
                            onClick={(e) => handleNavClick(e, "/creators", false)}
                            className={cn(
                                "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-150 shadow-sm",
                                isDark
                                    ? "bg-white text-black hover:bg-[#00a4ff] hover:text-white"
                                    : "bg-slate-900 text-white hover:bg-[#00a4ff]"
                            )}
                        >
                            <AtSign className="w-3.5 h-3.5" />
                            <span>Claim Handle</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                            className={cn(
                                "md:hidden p-2.5 rounded-xl transition-colors",
                                isDark ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-slate-900 hover:bg-black/5"
                            )}
                        >
                            {isMobileMenuOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
                        </button>
                    </div>
                </div>

                {/* mobile drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.16 }}
                            className="md:hidden"
                        >
                            <div className={cn("px-3 pb-4 pt-2 flex flex-col gap-1 border-t", isDark ? "border-white/10" : "border-black/10")}>
                                {NAV_LINKS.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={(e) => handleNavClick(e, link.href, false, true)}
                                            className={cn(
                                                "px-4 py-3 rounded-xl text-xs font-mono font-semibold tracking-widest uppercase transition-all flex items-center gap-3",
                                                isActive
                                                    ? isDark ? "bg-white/15 text-white" : "bg-black/10 text-black"
                                                    : isDark ? "text-white/80 hover:text-white hover:bg-white/10" : "text-slate-700 hover:text-black hover:bg-black/5"
                                            )}
                                        >
                                            {loadingRoute === link.href ? (
                                                <Loader2 size={17} strokeWidth={2} className="animate-spin text-[#00a4ff]" />
                                            ) : (
                                                <link.icon size={17} strokeWidth={2} />
                                            )}
                                            {link.name}
                                        </Link>
                                    );
                                })}

                                <div className={cn("mt-2 pt-2 border-t", isDark ? "border-white/10" : "border-black/10")}>
                                    <div className="px-4 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#00a4ff] font-semibold">
                                        Creators
                                    </div>
                                    {CREATOR_ITEMS.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            onClick={(e) => handleNavClick(e, item.href, false, true)}
                                            className={cn(
                                                "px-4 py-2.5 rounded-xl text-xs font-mono font-semibold tracking-wider uppercase flex items-center gap-3 transition-colors",
                                                isDark ? "text-white/85 hover:text-white hover:bg-white/10" : "text-slate-800 hover:text-black hover:bg-black/5"
                                            )}
                                        >
                                            <item.icon className="w-4 h-4 text-[#00a4ff]" />
                                            <span>{item.title}</span>
                                        </Link>
                                    ))}
                                </div>

                                <div className={cn("flex items-center gap-2 px-3 pt-2 mt-1 border-t", isDark ? "border-white/10" : "border-black/10")}>
                                    <a href="https://github.com/colorwall/colorwall" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-2 opacity-75 hover:opacity-100">
                                        <GithubIcon />
                                    </a>
                                    <a href="https://discord.gg/QYwhay7r2V" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="p-2 opacity-75 hover:opacity-100 hover:text-[#5865F2]">
                                        <DiscordIcon />
                                    </a>
                                    <a href="https://x.com/colorwall_xyz" target="_blank" rel="noopener noreferrer" aria-label="X" className="p-2 opacity-75 hover:opacity-100">
                                        <XIcon />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* separate gpu-composited mega-dropdown panel below navbar to eliminate blur resize lag */}
            <AnimatePresence>
                {isCreatorsOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.985 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={openCreatorsByHover}
                        onMouseLeave={closeCreatorsDelayed}
                        className={cn(
                            "hidden md:grid mt-2 rounded-[20px] border backdrop-blur-xl shadow-2xl px-6 lg:px-10 py-6 grid-cols-12 gap-8 items-start will-change-transform",
                            isDark
                                ? "bg-[#0a0a0a]/65 border-white/10 text-white shadow-black/50"
                                : "bg-white/75 border-black/10 text-slate-900 shadow-slate-900/10"
                        )}
                    >
                        <div className="col-span-3 flex flex-col gap-2 pt-0.5">
                            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#00a4ff] font-semibold">
                                Creators
                            </span>
                            <p className={cn("text-xs leading-relaxed", isDark ? "text-white/70" : "text-slate-600")}>
                                Reserve your vanity URL and publish directly to the ColorWall Marketplace.
                            </p>
                        </div>

                        <div className="col-span-9 grid grid-cols-2 gap-2.5">
                            {CREATOR_ITEMS.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item.href, false)}
                                    className={cn(
                                        "group flex items-center justify-between gap-4 px-4 py-3 rounded-xl transition-colors duration-150",
                                        isDark ? "hover:bg-white/[0.07]" : "hover:bg-black/[0.04]"
                                    )}
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <item.icon className="w-4 h-4 text-[#00a4ff] mt-0.5 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="font-outfit text-sm font-medium tracking-tight">
                                                {item.title}
                                            </div>
                                            <div className={cn("text-xs mt-0.5 leading-snug", isDark ? "text-white/65" : "text-slate-600")}>
                                                {item.desc}
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-[#00a4ff] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
