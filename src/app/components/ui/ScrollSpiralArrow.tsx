'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export const ScrollSpiralArrow = ({ theme }: { theme: 'dark' | 'light' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isDark = theme === 'dark';

    // Track scroll progress strictly within this container's bounding box
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    // Map scroll progress to pathLength (0 to 1)
    const draw = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
    
    // Map scroll progress to arrow head opacity so it appears at the end
    const arrowHeadOpacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1]);

    return (
        <div ref={containerRef} className="w-full flex justify-center items-center relative z-20 pointer-events-none">
            <svg 
                width="200" 
                height="100" 
                viewBox="0 0 300 150" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
            >
                <defs>
                    <mask id="spiral-mask">
                        {/* 
                            This solid white stroke serves as a mask. 
                            It dynamically draws itself via framer-motion's pathLength. 
                        */}
                        <motion.path
                            d="M 20 20 C 100 -20, 250 0, 150 80 C 100 120, 80 40, 160 40 C 240 40, 260 100, 280 130"
                            stroke="white"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="transparent"
                            style={{ pathLength: draw }}
                        />
                    </mask>
                </defs>

                {/* The main swirling, scissor-like spiral path (background track) */}
                <path
                    d="M 20 20 C 100 -20, 250 0, 150 80 C 100 120, 80 40, 160 40 C 240 40, 260 100, 280 130"
                    stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 8"
                    fill="transparent"
                />
                
                {/* The animated stroke that is revealed by the mask */}
                <path
                    d="M 20 20 C 100 -20, 250 0, 150 80 C 100 120, 80 40, 160 40 C 240 40, 260 100, 280 130"
                    stroke={isDark ? "#60a5fa" : "#3b82f6"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="6 8"
                    fill="transparent"
                    mask="url(#spiral-mask)"
                />

                {/* The arrowhead at the end of the line */}
                <motion.path
                    d="M -15 -12 L 0 0 L -15 12"
                    transform="translate(280, 130) rotate(56.3)"
                    stroke={isDark ? "#60a5fa" : "#3b82f6"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="transparent"
                    style={{ opacity: arrowHeadOpacity }}
                />
            </svg>
        </div>
    );
};
