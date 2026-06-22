"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { GradientHeading } from "./GradientHeading";

interface ShowcaseCardProps {
    title: string;
    description: string;
    badge: string;
    imageSrc?: string;
    imageSrcs?: string[];
    index: number;
    theme: "dark" | "light";
    layout?: "grid" | "vertical";
    imageFit?: "cover" | "contain";
}

export const ShowcaseCard = ({
    title,
    description,
    badge,
    imageSrc,
    imageSrcs,
    index,
    theme,
    layout = "grid",
    imageFit = "cover",
}: ShowcaseCardProps) => {
    const ref = useRef(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    const currentIndexRef = useRef(currentImgIndex);
    const wheelAccumulator = useRef(0);

    // Sync state to ref for wheel event listener
    useEffect(() => {
        currentIndexRef.current = currentImgIndex;
    }, [currentImgIndex]);

    // Auto-scroll unless hovered
    useEffect(() => {
        if (!imageSrcs || imageSrcs.length <= 1 || isHovered) return;
        const interval = setInterval(() => {
            setCurrentImgIndex((prev) => (prev + 1) % imageSrcs.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [imageSrcs, isHovered]);

    // Wheel scroll interceptor for cycling images
    useEffect(() => {
        if (!imageSrcs || imageSrcs.length <= 1) return;
        const el = imageContainerRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                const sensitivity = 70; // Adjust for scroll speed
                wheelAccumulator.current += e.deltaY;
                
                if (wheelAccumulator.current > sensitivity) {
                    // Scrolling down
                    if (currentIndexRef.current < imageSrcs.length - 1) {
                        e.preventDefault();
                        setCurrentImgIndex(prev => prev + 1);
                        wheelAccumulator.current = 0;
                    } else {
                        wheelAccumulator.current = 0; // Release scroll
                    }
                } else if (wheelAccumulator.current < -sensitivity) {
                    // Scrolling up
                    if (currentIndexRef.current > 0) {
                        e.preventDefault();
                        setCurrentImgIndex(prev => prev - 1);
                        wheelAccumulator.current = 0;
                    } else {
                        wheelAccumulator.current = 0; // Release scroll
                    }
                } else {
                    // Still accumulating, prevent default to avoid jitter
                    if ((e.deltaY > 0 && currentIndexRef.current < imageSrcs.length - 1) ||
                        (e.deltaY < 0 && currentIndexRef.current > 0)) {
                        e.preventDefault();
                    }
                }
            }
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [imageSrcs]);

    const displayImages = imageSrcs && imageSrcs.length > 0 ? imageSrcs : (imageSrc ? [imageSrc] : []);

    return (
        <section
            ref={ref}
            className="flex items-center py-10 sm:py-16"
        >
            <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12">
                <div className={`
                    ${layout === "grid"
                        ? "grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
                        : "flex flex-col gap-16 w-full"}
                `}>
                    {/* Text Side */}
                    <motion.div
                        className={`
                            ${layout === "grid"
                                ? `${index % 2 === 0 ? "lg:order-1" : "lg:order-2"} lg:max-w-xl`
                                : "w-full max-w-4xl"}
                        `}
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Minimal Badge */}
                        <div className={`inline-flex items-center gap-2 mb-6 text-sm font-mono tracking-widest uppercase
                            ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}
                        >
                            <span className="w-8 h-[1px] bg-current opacity-50" />
                            {badge}
                        </div>

                        {/* Heading */}
                        <div className="mb-6">
                            <GradientHeading
                                text={title}
                                theme={theme}
                                className={`font-black leading-[0.9] tracking-tight
                                    ${layout === "grid" ? "text-5xl sm:text-6xl lg:text-7xl" : "text-5xl sm:text-7xl lg:text-8xl"}`}
                            />
                        </div>

                        {/* Description */}
                        <p className={`text-lg sm:text-xl leading-relaxed max-w-2xl
                            ${theme === "dark" ? "text-white/60" : "text-black/60"}`}
                        >
                            {description}
                        </p>
                    </motion.div>

                    {/* Image Side */}
                    <motion.div
                        className={`
                            ${layout === "grid"
                                ? `${index % 2 === 0 ? "lg:order-2" : "lg:order-1"} w-full`
                                : "w-full"}
                        `}
                        initial={{ opacity: 0, y: 60 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    >
                        {/* 
                           No "Card" Container anymore. 
                           Just the content floating in space. 
                        */}
                        <div 
                            ref={imageContainerRef}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className={`relative w-full group
                            ${layout === "grid" ? "aspect-video" : (imageFit === "contain" ? "aspect-video" : "aspect-[21/9] sm:aspect-[21/9]")}`}
                        >
                            {displayImages.map((src, i) => {
                                const active = i === currentImgIndex;

                                return (
                                    <div
                                        key={src}
                                        className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out
                                            ${active ? "opacity-100 translate-y-0 scale-100 z-10 pointer-events-auto" : "opacity-0 translate-y-4 scale-95 z-0 pointer-events-none"}`}
                                    >
                                        <div className={`relative w-full h-full 
                                            ${imageFit === "contain" ? "flex items-center justify-center" : `overflow-hidden rounded-2xl sm:rounded-[2rem] ${theme === "dark" ? "bg-white/5" : "bg-black/5"}`}`}>

                                            {/* For 'contain' mode (customization screenshots), we still want them to look good */}
                                            {imageFit === "contain" ? (
                                                <Image
                                                    src={src}
                                                    alt={title}
                                                    fill
                                                    className="object-contain drop-shadow-2xl rounded-2xl sm:rounded-[2rem]"
                                                    priority={index === 0}
                                                />
                                            ) : (
                                                <Image
                                                    src={src}
                                                    alt={title}
                                                    fill
                                                    className="object-cover"
                                                    priority={index === 0}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Indicators for multiple images */}
                            {displayImages.length > 1 && (
                                <div className="absolute -bottom-10 left-0 flex gap-3">
                                    {displayImages.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 transition-all duration-500 rounded-full
                                                ${i === currentImgIndex
                                                    ? `w-12 ${theme === "dark" ? "bg-white" : "bg-black"}`
                                                    : `w-4 ${theme === "dark" ? "bg-white/20" : "bg-black/20"}`}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
