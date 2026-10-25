import React from 'react';
import { Play, BarChart2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  game?: string;
  hoursPlayed?: number | string;
  onActionClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  subtitle = "Evaluating 156 verified international competitors across 10 VCT LAN matches. Vacancy gap matching, utility rating, and IGL shotcalling intelligence active.",
  game = "VALORANT",
  onActionClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#242424] bg-[#141414] shadow-2xl min-h-[190px]">
      {/* Background ambient lighting and subtle cyan energy glow */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#82EAF4]/8 via-transparent to-transparent pointer-events-none" />

      {/* Right: Character Artwork from Asset Pack & Reference */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-full sm:w-3/4 md:w-3/5 lg:w-1/2 overflow-hidden pointer-events-none z-0"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,1) 55%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,1) 55%)',
        }}
      >
        <img
          src="/assets/golden-snitch/hero-cyber-squad.png"
          alt="Esports Operator"
          className="h-full w-full object-cover object-center sm:object-right md:object-center opacity-95 transition-opacity"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/golden-snitch/hero-character-exact.png';
          }}
        />
        {/* Soft edge gradients */}
        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#141414] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none" />
      </div>

      {/* Left: Content Wrapper */}
      <div className="relative z-10 py-5 px-5 sm:px-7 max-w-2xl">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1C1C] border border-[#2C2C2C] text-xs font-mono text-[#D4D4D4]">
            <Sparkles size={12} className="text-[#82EAF4]" />
            Last analyzed: 10 VCT LAN Matches
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#0E2225] border border-[#82EAF4]/40 text-xs font-bold text-[#82EAF4]">
            {game} Masters
          </span>
        </div>

        {/* Title matching Image 1: Golden Snitch — in gold, Esports Intelligence Hub in white */}
        <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black tracking-tight font-heading leading-tight mb-2">
          <span className="text-[#F5B83D]">Golden Snitch — </span>
          <span className="text-[#FFFFFF]">Esports Intelligence Hub</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#A8A8A8] leading-relaxed max-w-xl mb-4 font-normal">
          {subtitle}
        </p>

        {/* Action Buttons matching Image 1 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Continue Scouting: Cyan glowing pill button */}
          <Link
            to="/scouting"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#82EAF4] hover:bg-[#64E8F2] text-[#0A0A0A] font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-[0_0_18px_rgba(130,234,244,0.35)]"
            onClick={onActionClick}
          >
            <Play size={13} className="fill-[#0A0A0A]" />
            <span>Continue Scouting</span>
          </Link>

          {/* View Analysis: Dark pill button */}
          <button
            onClick={() => navigate('/scouting')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1C1C] hover:bg-[#252525] text-[#F5F5F5] font-semibold text-xs sm:text-sm border border-[#2E2E2E] transition-colors"
          >
            <BarChart2 size={14} className="text-[#82EAF4]" />
            <span>View Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};
