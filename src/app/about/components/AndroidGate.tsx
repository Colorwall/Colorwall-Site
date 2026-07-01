'use client';

import { useEffect, useState } from 'react';

// detects android devices via user agent and renders a full-screen redirect page
// instead of the webgl-heavy about experience, which can not render on mobile gpus.
// links directly to patrons.colorwall.xyz as the fallback destination.
export function AndroidGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // slight delay so the css fade-in transition actually plays
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0a0a0a 0%, #111118 40%, #0d0d14 100%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease-out',
      }}
    >
      {/* animated subtle grain overlay for texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          mixBlendMode: 'overlay',
        }}
      />

      {/* floating ambient orbs for visual depth */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(120,80,255,0.08) 0%, transparent 70%)',
          top: '15%',
          left: '10%',
          filter: 'blur(80px)',
          animation: 'androidGateFloat 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(60,140,255,0.06) 0%, transparent 70%)',
          bottom: '20%',
          right: '5%',
          filter: 'blur(60px)',
          animation: 'androidGateFloat 10s ease-in-out infinite reverse',
        }}
      />

      {/* content wrapper */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-md">
        {/* branding */}
        <p
          className="text-white/30 text-[10px] uppercase tracking-[0.35em] mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.8s ease-out 0.2s',
          }}
        >
          Colorwall
        </p>

        {/* main icon - a stylized display/desktop svg */}
        <div
          className="mb-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
            transition: 'all 0.7s ease-out 0.3s',
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
        </div>

        {/* heading */}
        <h1
          className="text-white text-2xl font-medium tracking-wide mb-3"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.7s ease-out 0.4s',
          }}
        >
          Desktop Experience Only
        </h1>

        {/* description */}
        <p
          className="text-white/40 text-sm leading-relaxed mb-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.7s ease-out 0.5s',
          }}
        >
          This page uses real-time GPU rendering that requires a desktop browser.
          Visit our patrons page instead.
        </p>

        {/* cta button - glassmorphic style inspired by shapeblur aesthetics */}
        <a
          href="https://patrons.colorwall.xyz"
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(14px)',
            transition: 'all 0.7s ease-out 0.6s',
          }}
        >
          {/* hover glow layer */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(120,80,255,0.1) 0%, rgba(60,140,255,0.08) 100%)',
            }}
          />

          <span className="relative text-white/80 text-sm font-medium tracking-wide group-hover:text-white transition-colors duration-300">
            View Patrons Page
          </span>

          {/* arrow icon with hover slide animation */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="relative text-white/40 group-hover:text-white/80 transition-all duration-300 group-hover:translate-x-0.5"
          >
            <path
              d="M4 20 20 4m0 0v14.096M20 4H5.904"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        {/* subtle "go back" link */}
        <a
          href="/"
          className="mt-6 text-white/20 text-xs tracking-widest uppercase hover:text-white/40 transition-colors duration-300"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.7s ease-out 0.8s, color 0.3s',
          }}
        >
          ← Back to Home
        </a>
      </div>

    </div>
  );
}
