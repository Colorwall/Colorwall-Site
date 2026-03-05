"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/app/contexts/ThemeContext";
import { Github, MessageCircle, Moon, Sun, Home, Download, FileText, Menu, X } from "lucide-react";

export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const isDark = theme === "dark";
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Auto-hide logic
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show if scrolling UP or at the very top
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                setIsVisible(true);
            } else {
                // Hide if scrolling DOWN and not at top
                setIsVisible(false);
                setIsMobileMenuOpen(false); // Close menu on scroll down
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "Download", href: "/download", icon: Download },
        { name: "Changelog", href: "/changelog", icon: FileText },
        { name: "Discussions", href: "https://github.com/orgs/Colorwall/discussions", icon: MessageCircle },
    ];

    return (
        <motion.div
            className="fixed top-4 z-[100] w-[calc(100%-2rem)] max-w-7xl left-1/2 -translate-x-1/2 flex justify-end md:justify-center"
            initial={{ y: -100, opacity: 0 }}
            animate={{
                y: isVisible || isHovered ? 0 : -100,
                opacity: isVisible || isHovered ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border overflow-hidden
                ${isMobileMenuOpen ? "px-4 py-4 rounded-[24px] w-full" : "px-2 py-2 sm:px-6 md:py-0 md:h-16 rounded-[32px] md:rounded-2xl w-[104px] md:w-full"} 
                ${isDark
                        ? "bg-[#161618]/90 border-white/10 shadow-black/50"
                        : "bg-white/90 border-black/10"}`}
            >
                <div className={`flex items-center h-[48px] sm:h-auto md:h-full ${isMobileMenuOpen ? 'justify-between w-full' : 'justify-center md:justify-between w-auto md:w-full'}`}>

                    {/* Left: Logo / Brand (Hidden on Mobile when Closed) */}
                    <div className={`flex-1 flex justify-start ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
                        <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center transition-opacity hover:opacity-80"
                        >
                            <img src="/colorwall.png" alt="ColorWall Logo" className="object-contain h-8 sm:h-10" />
                        </Link>
                    </div>

                    {/* Desktop: Center Nav Links */}
                    <nav className="hidden md:flex shrink-0 items-center gap-2 sm:gap-4">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const isExternal = link.href.startsWith("http");
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    target={isExternal ? "_blank" : undefined}
                                    rel={isExternal ? "noopener noreferrer" : undefined}
                                    className={`px-3 py-2 sm:px-4 rounded-xl transition-all duration-300 flex items-center gap-2 group
                                        ${isActive
                                            ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-black/5 text-black")
                                            : (isDark ? "text-white/85 hover:text-white hover:bg-white/10" : "text-black/70 hover:text-black hover:bg-black/5")}`}
                                >
                                    <link.icon size={18} className="transition-opacity group-hover:opacity-100" />
                                    <span className="text-sm font-medium transition-opacity group-hover:opacity-100">
                                        {link.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop: Right Socials & Settings */}
                    <div className="hidden md:flex flex-1 justify-end items-center gap-1 sm:gap-2">
                        <a href="https://github.com/colorwall/colorwall" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${isDark ? "text-white/85 hover:text-white hover:bg-white/10" : "text-black/70 hover:text-black hover:bg-black/5"}`} title="GitHub">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.153-1.11-1.46-1.11-1.46-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
                        </a>
                        <a href="https://discord.gg/cHVwPkBC7p" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${isDark ? "text-white/85 hover:text-[#5865F2] hover:bg-[#5865F2]/10" : "text-black/70 hover:text-[#5865F2] hover:bg-[#5865F2]/10"}`} title="Discord">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.08,65.69,84.69,65.69Z" /></svg>
                        </a>
                        <a href="https://x.com/colorwall_xyz" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${isDark ? "text-white/85 hover:text-white hover:bg-white/10" : "text-black/70 hover:text-black hover:bg-black/5"}`} title="X">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        <div className={`w-[1px] h-6 mx-2 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
                        <button onClick={toggleTheme} className={`p-2 rounded-xl transition-all duration-300 ${isDark ? "text-yellow-400 hover:bg-yellow-400/10" : "text-slate-600 hover:bg-slate-200"}`} title="Toggle Theme">
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    {/* Mobile: Pill Controls (Theme Toggle & Menu) */}
                    <div className={`md:hidden flex items-center gap-1 ${isMobileMenuOpen ? 'flex-1 justify-end' : ''}`}>
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-full transition-all duration-300 ${isDark ? "text-yellow-400 hover:bg-yellow-400/10" : "text-slate-600 hover:bg-slate-200"}`}
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className={`p-2.5 rounded-full transition-all duration-300 ${isDark ? "text-white bg-white/10 hover:bg-white/20" : "text-black bg-black/5 hover:bg-black/10"}`}
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu Expanded Content */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="flex flex-col pt-4 gap-2 border-t mt-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    const isExternal = link.href.startsWith("http");
                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            target={isExternal ? "_blank" : undefined}
                                            rel={isExternal ? "noopener noreferrer" : undefined}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3
                                            ${isActive
                                                    ? (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
                                                    : (isDark ? "text-white/85 hover:text-white hover:bg-white/10" : "text-black/70 hover:text-black hover:bg-black/5")}`}
                                        >
                                            <link.icon size={20} />
                                            <span className="font-medium text-base">{link.name}</span>
                                        </Link>
                                    );
                                })}

                                {/* Socials on Mobile */}
                                <div className="flex items-center gap-4 px-4 py-3">
                                    <a href="https://github.com/colorwall/colorwall" target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center transition-colors ${isDark ? "text-white/85 hover:text-white" : "text-black/70 hover:text-black"}`}>
                                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.153-1.11-1.46-1.11-1.46-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
                                    </a>
                                    <a href="https://discord.gg/cHVwPkBC7p" target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center transition-colors ${isDark ? "text-white/85 hover:text-[#5865F2]" : "text-black/70 hover:text-[#5865F2]"}`}>
                                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.33,46,96.22,53,91.08,65.69,84.69,65.69Z" /></svg>
                                    </a>
                                    <a href="https://x.com/colorwall_xyz" target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center transition-colors ${isDark ? "text-white/85 hover:text-white" : "text-black/70 hover:text-black"}`}>
                                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};
