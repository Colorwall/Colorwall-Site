"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";
import Image from "next/image";
export const CommunityReviews = ({ theme }: { theme: "dark" | "light" }) => {
    const isDark = theme === "dark";

    const textColor = isDark ? "text-white" : "text-black";
    const mutedText = isDark ? "text-white/60" : "text-black/60";

    // Using a subtle grid pattern on the background
    return (
        <section className="py-24 px-4 sm:px-8 relative w-full flex justify-center overflow-hidden">
            <div className={`absolute inset-0 pointer-events-none ${isDark ? "opacity-10" : "opacity-[0.03]"}`}
                style={{
                    backgroundImage: `linear-gradient(${isDark ? 'white' : 'black'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'white' : 'black'} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 80%)'
                }}
            />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">

                {/* ════ Left: Text Content ════ */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col justify-center max-w-lg"
                >
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
                        <span className={theme === "dark" ? "text-white" : "text-black"}>What does our</span><br />
                        <span className="text-[#00A4FF] drop-shadow-sm">community</span>{" "}
                        <span className={theme === "dark" ? "text-white" : "text-black"}>think?</span>
                    </h2>

                    <p className={`text-base sm:text-lg leading-relaxed mb-10 ${mutedText}`}>
                        Our community is passionate and reviews us with a significant amount of positive feedback. We take great pride in our high rating, which reflects our commitment to improving ColorWall. (we dont have a community, my friend wrote ts for glaze i swear)
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-[#00b67a] text-white px-3 py-1.5 rounded-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={18} className="fill-white text-white" />
                            ))}
                        </div>
                        <span className={`font-bold text-sm sm:text-base ${textColor}`}>
                            Many Positive reviews
                        </span>
                    </div>
                </motion.div>

                {/* ════ Right: Cards ════ */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative flex flex-col sm:block lg:pl-10 items-center justify-center lg:justify-end gap-6 sm:gap-0"
                >
                    {/* Main Review Card */}
                    <div className={`rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-[420px] relative z-10 border transform rotate-1 hover:rotate-0 transition-transform duration-300 ${isDark ? "bg-[#0f0f12] border-white/10" : "bg-white border-black/5"}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isDark ? "bg-white/10 text-white" : "bg-[#1e1e1e] text-white"}`}>
                                TS
                            </div>
                            <div>
                                <h4 className={`font-bold text-base ${isDark ? "text-white" : "text-black"}`}>Tuhin Sarkar</h4>
                                <p className={`text-xs ${isDark ? "text-white/50" : "text-black/50"}`}>4 days ago</p>
                            </div>
                        </div>

                        <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={16} className="fill-[#00b67a] text-[#00b67a]" />
                            ))}
                        </div>

                        <h5 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-black"}`}>Honest review</h5>
                        <p className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-black/70"}`}>
                            ColorWall made my desktop so much better. I used to run Lively and it was so heavy for my PC. ColorWall is super lightweight!
                        </p>

                        {/* Discord Icon Floating Decoration - using text icon if image not available */}
                        <div className="absolute -right-6 -bottom-6 sm:-right-10 sm:-bottom-8 w-24 h-24 sm:w-28 sm:h-28 bg-[#5865F2] rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_30px_rgba(88,101,242,0.4)] z-20 overflow-hidden transform hover:scale-105 hover:rotate-6 transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="text-white" viewBox="0 0 16 16">
                                <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                            </svg>
                        </div>
                    </div>

                    {/* Secondary Metrics Card */}
                    <div className={`sm:absolute sm:-left-16 sm:-bottom-8 rounded-2xl p-5 shadow-2xl w-full max-w-[320px] z-30 transform sm:-rotate-1 sm:hover:rotate-0 transition-transform duration-300 border
                        ${isDark ? "bg-[#0f0f12] border-white/10" : "bg-white border-black/10"}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden relative border border-[#00A4FF]/20 shadow-inner">
                                <Image src="/ColorWall.png" alt="Colorwall Logo" fill className="object-contain p-2" />
                            </div>

                            <div className="flex flex-col">
                                <h4 className={`font-bold text-lg ${isDark ? "text-white" : "text-black"}`}>Colorwall</h4>
                                <p className={`text-xs mt-0.5 ${isDark ? "text-white/60" : "text-black/60"}`}>Reviews - Excellent</p>

                                <div className="flex gap-1 mt-1.5 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} size={14} className="fill-[#00b67a] text-[#00b67a]" />
                                    ))}
                                </div>

                                <div className="flex items-center gap-1.5 bg-[#00b67a]/15 text-[#00b67a] px-2 py-1 rounded text-[10px] font-bold tracking-wide w-fit">
                                    <ShieldCheck size={12} />
                                    HIGHLY RATED PROJECT
                                </div>
                            </div>
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
};
