"use client";

import React from "react";
import { Typewriter } from "react-simple-typewriter";

export function HeroTypewriter() {
    return (
        <div className="min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center text-xs sm:text-sm md:text-base lg:text-lg font-mono text-white/90 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            <Typewriter
                words={[
                    "< Your Desktop Called, It wants Personality!!! >",
                    "< Free to Use · No Arbitary limits, no subscriptions >",
                    "< A Wallpaper Engine built for performance and You!>",
                    "< Built in Rust + Tauri · DirectX 11/IMF/MPV/WEB2 · Hardware Accelerated >",
                    "< 8K Video · Workshop/Studio · Advanced D3D11 Shader Effects >",
                    "< Desktop Widgets · Taskbar Customization · Audio Reactive >",
                    
                ]}
                loop={0}
                cursor
                cursorStyle={
                    <svg 
                        width="0.6em" 
                        height="1em" 
                        viewBox="0 0 12 24" 
                        fill="currentColor" 
                        className="inline-block align-middle ml-1 text-cyan-400/90"
                    >
                        <path d="M10 2 L12 2 L4 22 L2 22 Z" />
                    </svg>
                }
                typeSpeed={35}
                deleteSpeed={15}
                delaySpeed={5200}
            />
        </div>
    );
}
