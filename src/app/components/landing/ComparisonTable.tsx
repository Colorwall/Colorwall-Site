"use client";

import { motion } from "framer-motion";
import { GradientHeading } from "./GradientHeading";

export const ComparisonTable = ({ theme }: { theme: "dark" | "light" }) => {
    return (
        <section className="py-24 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <p className={`text-xs font-mono uppercase tracking-[0.2em] mb-3
                        ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
                        how it compares?
                    </p>
                    <GradientHeading
                        text="It's Built different"
                        theme={theme}
                        className="text-3xl sm:text-4xl font-black"
                    />
                    <p className="text-base sm:text-lg font-bold opacity-60 mt-2">Single snapshot values on i3-4th gen; Intel(R) Graphics HD 4600</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`rounded-2xl overflow-hidden border ${theme === "dark" ? "border-white/10" : "border-black/10"}`}
                >
                    <div className="w-full overflow-x-auto overscroll-x-contain">
                    <table className="w-full min-w-[680px] text-xs sm:text-sm">
                        <thead>
                            <tr className={theme === "dark" ? "bg-white/5" : "bg-black/5"}>
                                <th className="text-left p-3 sm:p-4 font-medium opacity-50" />
                                <th className={`p-3 sm:p-4 font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>ColorWall</th>
                                <th className="p-3 sm:p-4 font-medium opacity-40">Wallpaper Engine</th>
                                <th className="p-3 sm:p-4 font-medium opacity-40">Lively</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${theme === "dark" ? "divide-white/5" : "divide-black/5"}`}>
                            {[
                                ["Price", "Free", "$3.99", "Free"],
                                ["CPU (4K video)", "1.3%", "1.2%", "0.8%"],
                                ["GPU (4K video)", "19%", "74%", "83.8%"],
                                ["Open Source", "AGPL-3", "Closed Source", "GPL-3"],
                                ["Store", "Free Forever", "✗ Paid Workshop only", "✗ Self Upload"],
                                ["HTML Widgets", "Native", "✗ Third party", "✗ Limited"],
                                ["Interactive", "Canvas/WebGL", "Yes (Web)", "✗ Web only"],
                                ["Offline Mode", "Full", "Partial", "Full"],
                                ["Taskbar Effects", "Acrylic/Blur", "Even better", "Yes"],
                            ].map(([label, cw, we, lv]) => (
                                <tr key={label} className={`transition-colors ${theme === "dark" ? "hover:bg-white/[0.03]" : "hover:bg-black/[0.02]"}`}>
                                    <td className="p-3 sm:p-4 font-medium whitespace-nowrap">{label}</td>
                                    <td className={`p-3 sm:p-4 text-center font-semibold whitespace-nowrap ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>{cw}</td>
                                    <td className="p-3 sm:p-4 text-center opacity-50 whitespace-nowrap">{we}</td>
                                    <td className="p-3 sm:p-4 text-center opacity-50 whitespace-nowrap">{lv}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
