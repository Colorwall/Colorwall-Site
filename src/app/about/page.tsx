'use client';

import { useTheme } from "@/app/contexts/ThemeContext";
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Environment } from '@react-three/drei';
import { WebGLAboutScene } from "./WebGLScene";
import { LiquidLens } from "@/app/components/ui/LiquidLens";

export default function AboutPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={`relative min-h-screen w-full overflow-hidden select-none ${isDark ? "bg-[#080809]" : "bg-slate-50"}`}>
            
            {/* The entire page is now a single WebGL Canvas */}
            <Canvas camera={{ position: [0, 0, 10], fov: 35 }} style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0 }}>
                <ambientLight intensity={isDark ? 0.5 : 2} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                
                {/* ScrollControls creates a native HTML scrollbar and maps the scroll progress to 3D space */}
                <ScrollControls pages={4} damping={0.25}>
                    {/* The 3D layout (Hero, Dev Card, Projects, Stack) */}
                    <WebGLAboutScene theme={theme as 'dark' | 'light'} />
                </ScrollControls>

                {/* The watery cursor remains fixed to the camera, refracting whatever is behind it! */}
                <LiquidLens theme={theme as 'dark' | 'light'} />
                
                <Environment preset={isDark ? "city" : "studio"} />
            </Canvas>

            {/* A tiny minimalist return button (HTML overlay on top of Canvas) */}
            <a 
                href="/" 
                className={`fixed top-8 left-8 z-50 text-sm font-medium tracking-tight hover:opacity-50 transition-opacity ${isDark ? "text-white" : "text-black"}`}
            >
                ← Back
            </a>
        </div>
    );
}
