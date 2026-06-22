'use client';
import { type ReactNode } from 'react';

interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number; 
  glowIntensity?: number; 
  coneSpread?: number; 
  colors?: string[];
}

function parseHSL(hslStr: string): { h: number; s: number; l: number } {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  glowColor = '220 100 60',
  backgroundColor = '#120F17',
  borderRadius = 32,
  glowRadius = 35,
  glowIntensity = 1.0,
  coneSpread = 180, // Thicker spread (180 degrees out of 360)
  colors,
}) => {
  
  let conicGradient = '';
  if (colors && colors.length > 0) {
      conicGradient = `conic-gradient(from 0deg, transparent 0%, ${colors[0]} ${coneSpread * 0.5}%, ${colors[1] || colors[0]} ${coneSpread}%, ${colors[2] || colors[0]} ${coneSpread * 1.5}%, transparent ${coneSpread * 2}%)`;
  } else {
      const { h, s, l } = parseHSL(glowColor);
      // Fixed syntax: using hsla for comma-separated alpha values
      const color1 = `hsla(${h}, ${s}%, ${l}%, 1.0)`;
      const color2 = `hsla(${h}, ${s}%, ${l}%, 0.5)`;
      conicGradient = `conic-gradient(from 0deg, transparent 0%, ${color2} ${coneSpread * 0.5}%, ${color1} ${coneSpread}%, ${color2} ${coneSpread * 1.5}%, transparent ${coneSpread * 2}%)`;
  }

  return (
    <div
      className={`relative isolate ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.1)`,
      }}
    >
      {/* 
        Outer Glow Layer: Blurred and positioned underneath.
        To prevent the blur from looking weirdly cropped, we don't clip it with overflow-hidden on the parent.
      */}
      <div 
        className="absolute inset-0 z-[-1] rounded-[inherit]"
      >
        <div 
          className="absolute inset-[-100%] animate-spin"
          style={{
            animationDuration: '5s',
            background: conicGradient,
            opacity: glowIntensity * 0.7,
            filter: `blur(${glowRadius}px)`,
          }}
        />
      </div>

      {/* 
        Sharp Border Layer: Clipped to the rounded corners
      */}
      <div 
        className="absolute inset-0 z-0 rounded-[inherit] overflow-hidden"
      >
        <div 
          className="absolute inset-[-100%] animate-spin"
          style={{
            animationDuration: '5s',
            background: conicGradient,
            opacity: glowIntensity,
          }}
        />
      </div>

      {/* 
        Inner Card Fill: covers the center, leaving a 3px border!
      */}
      <div 
        className="absolute inset-[3px] z-[1] rounded-[inherit]"
        style={{
          background: backgroundColor,
        }}
      />

      {/* Content */}
      <div className="flex flex-col relative z-[2] w-full h-full rounded-[inherit]">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
