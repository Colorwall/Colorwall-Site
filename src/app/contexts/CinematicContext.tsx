"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CinematicConfig {
    isMasterEnabled: boolean;
    enableLightPillar: boolean;
    enableSideRays: boolean;
}

interface CinematicContextType {
    config: CinematicConfig;
    toggleMaster: () => void;
    toggleShader: (shader: keyof Omit<CinematicConfig, 'isMasterEnabled'>) => void;
}

const defaultConfig: CinematicConfig = {
    isMasterEnabled: false,
    enableLightPillar: true,
    enableSideRays: true,
};

const CinematicContext = createContext<CinematicContextType | undefined>(undefined);

export function CinematicProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<CinematicConfig>(defaultConfig);

    const toggleMaster = () => {
        setConfig(prev => ({ ...prev, isMasterEnabled: !prev.isMasterEnabled }));
    };

    const toggleShader = (shader: keyof Omit<CinematicConfig, 'isMasterEnabled'>) => {
        setConfig(prev => ({ ...prev, [shader]: !prev[shader] }));
    };

    return (
        <CinematicContext.Provider value={{ config, toggleMaster, toggleShader }}>
            {children}
        </CinematicContext.Provider>
    );
}

export function useCinematic() {
    const context = useContext(CinematicContext);
    if (context === undefined) {
        throw new Error("useCinematic must be used within a CinematicProvider");
    }
    return context;
}
