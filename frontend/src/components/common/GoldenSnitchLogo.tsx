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
    <img
      src="/assets/golden-snitch/golden-snitch-winged.png"
      alt="Golden Snitch Logo"
      style={{
        height: size,
        width: 'auto',
        maxWidth: size * 1.6,
      }}
      className={`shrink-0 object-contain drop-shadow-[0_0_10px_rgba(245,184,61,0.55)] ${className}`}
    />
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
