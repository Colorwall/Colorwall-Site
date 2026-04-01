"use client";

import Image from "next/image";

export const HomeShowcase = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-16 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-black/5">
                    <Image
                        src="/HOME.PNG"
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

                <p className={`text-center mt-6 text-sm font-mono ${theme === "dark" ? "text-white/30" : "text-black/30"}`}>
                    Blazing fast cz it's in rust/tauri · live/static wallpapers · local wallpaper support <br />
                    <span className="text-xs text-white/20">more features coming soon... :3</span>
                </p>
            </div>
        </section>
    );
};
