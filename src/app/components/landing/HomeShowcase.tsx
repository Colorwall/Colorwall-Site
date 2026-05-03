"use client";

import Image from "next/image";

export const HomeShowcase = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-16 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="relative rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-black/5">
                    <Image
                        src="/HOME.webp"
                        alt="colorwall full interface"
                        width={1920}
                        height={1080}
                        className="w-full h-auto"
                        style={{ height: 'auto' }}
                        priority
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t to-transparent pointer-events-none
                        ${theme === "dark" ? "from-black/30" : "from-white/20"}`}
                    />
                </div>

                <p className={`text-center mt-6 text-sm font-mono ${theme === "dark" ? "text-white/50" : "text-black/50"}`}>
                    Blazing fast cz it&apos;s in rust/tauri · Workshop/shaders · Widgets 4k/8k live wallpapers  <br />
                    <span className={`text-xs ${theme === "dark" ? "text-white/40" : "text-black/40"}`}>LEARN MORE BELOW!</span>
                </p>
            </div>
        </section>
    );
};
