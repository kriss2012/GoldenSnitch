import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  layout?: 'icon-only' | 'horizontal' | 'vertical';
}

export const GoldenSnitchLogo: React.FC<LogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  layout = 'icon-only',
}) => {
  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Golden Snitch Logo"
    >
      <defs>
        <linearGradient id="gsRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFDE7A" />
          <stop offset="45%" stopColor="#F5B83D" />
          <stop offset="100%" stopColor="#C4881A" />
        </linearGradient>
        <filter id="gsGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.8" floodColor="#F5B83D" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Surrounding Celestial 4-Point Stars (matching reference image) */}
      <g fill="#F5B83D" filter="url(#gsGlow)">
        {/* 1. Top star (slightly left of center) */}
        <path d="M 45 9.5 Q 45 14 49.5 14 Q 45 14 45 18.5 Q 45 14 40.5 14 Q 45 14 45 9.5 Z" />
        {/* 2. Top-right small star */}
        <path d="M 60 19.5 Q 60 22 62.5 22 Q 60 22 60 24.5 Q 60 22 57.5 22 Q 60 22 60 19.5 Z" opacity="0.9" />
        {/* 3. Far-right tiny star */}
        <path d="M 73 25 Q 73 27 75 27 Q 73 27 73 29 Q 73 27 71 27 Q 73 27 73 25 Z" opacity="0.85" />
        {/* 4. Mid-left star */}
        <path d="M 31 45 Q 31 48 34 48 Q 31 48 31 51 Q 31 48 28 48 Q 31 48 31 45 Z" opacity="0.95" />
        {/* 5. Lower-left tiny star */}
        <path d="M 40 56.5 Q 40 58 41.5 58 Q 40 58 40 59.5 Q 40 58 38.5 58 Q 40 58 40 56.5 Z" opacity="0.8" />
        {/* 6. Bottom-right medium star */}
        <path d="M 69 56 Q 69 61 74 61 Q 69 61 69 66 Q 69 61 64 61 Q 69 61 69 56 Z" />
      </g>

      {/* Central Snitch Ring */}
      <circle
        cx="50"
        cy="50"
        r="27"
        stroke="url(#gsRingGrad)"
        strokeWidth="1.8"
        fill="#0C0D0E"
        fillOpacity="0.45"
        filter="url(#gsGlow)"
      />

      {/* Symmetrical Inner Filigree & Hourglass Wings */}
      <g
        stroke="url(#gsRingGrad)"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#gsGlow)"
      >
        {/* Vertical Hourglass Primary Seam (symmetric arches) */}
        <path d="M 50 23 C 43 32, 40 40, 48.5 50 C 40 60, 43 68, 50 77" strokeWidth="1.2" opacity="0.9" />
        <path d="M 50 23 C 57 32, 60 40, 51.5 50 C 60 60, 57 68, 50 77" strokeWidth="1.2" opacity="0.9" />

        {/* Center vertical teardrop / vesica core */}
        <path d="M 50 34 C 47.5 42, 47.5 58, 50 66" strokeWidth="1" opacity="0.8" />
        <path d="M 50 34 C 52.5 42, 52.5 58, 50 66" strokeWidth="1" opacity="0.8" />

        {/* Upper Wing Crest Arcs */}
        <path d="M 49 48 C 42 42, 33 39, 25 43" strokeWidth="1.2" opacity="0.85" />
        <path d="M 51 48 C 58 42, 67 39, 75 43" strokeWidth="1.2" opacity="0.85" />

        {/* Mid Wing Crest Arcs */}
        <path d="M 48 52 C 38 48, 29 48, 23.5 52" strokeWidth="1" opacity="0.75" />
        <path d="M 52 52 C 62 48, 71 48, 76.5 52" strokeWidth="1" opacity="0.75" />

        {/* Lower Horizontal & Base Arcs */}
        <path d="M 25 54 C 36 62, 64 62, 75 54" strokeWidth="1.1" opacity="0.85" />
        <path d="M 31 67 C 40 73, 60 73, 69 67" strokeWidth="1" opacity="0.7" />

        {/* Subtle Crown Top Arc */}
        <path d="M 42 30 C 47 33, 53 33, 58 30" strokeWidth="1" opacity="0.7" />
      </g>
    </svg>
  );

  // If icon-only
  if (layout === 'icon-only' || !showText) {
    return icon;
  }

  // Horizontal layout with icon + typography
  if (layout === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {icon}
        <div className="flex items-baseline font-heading tracking-tight select-none">
          <span className="font-black italic text-[#F5B83D] tracking-tighter" style={{ fontSize: size * 0.52 }}>
            GOLDEN
          </span>
          <span className="font-black italic text-[#F5F5F5] tracking-tighter ml-1.5" style={{ fontSize: size * 0.52 }}>
            SNITCH
          </span>
        </div>
      </div>
    );
  }

  // Vertical layout (stacked logo + large text)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {icon}
      <div className="mt-3 flex items-baseline font-heading tracking-tight">
        <span className="font-black italic text-[#F5B83D] tracking-wider text-2xl sm:text-3xl">
          GOLDEN
        </span>
        <span className="font-black italic text-[#F5F5F5] tracking-wider text-2xl sm:text-3xl ml-2">
          SNITCH
        </span>
      </div>
    </div>
  );
};

export default GoldenSnitchLogo;
