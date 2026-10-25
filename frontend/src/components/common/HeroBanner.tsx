import React from 'react';
import { Play, Settings, Info, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  game?: string;
  hoursPlayed?: number | string;
  onActionClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title = "Sentinels — VCT Champions Roster Hub",
  subtitle = "Evaluating 156 verified international competitors across 10 VCT LAN matches. Vacancy gap matching, utility rating, and IGL shotcalling intelligence active.",
  game = "VALORANT",
  hoursPlayed = "102 hrs",
  onActionClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#353535] bg-gradient-to-r from-[#101010] via-[#171717] to-[#222222] py-3.5 px-4 sm:py-4.5 sm:px-6 lg:py-4.5 lg:px-7 shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#82EAF4]/10 blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-12 w-56 h-56 rounded-full bg-[#788B8D]/15 blur-3xl pointer-events-none" />

      {/* Content wrapper with responsive horizontal flex on medium/large screens */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        {/* Left: Badges, Title, Subtitle */}
        <div className="max-w-3xl">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F1F1F] border border-[#353535] text-[11px] font-mono text-[#B8B8B8]">
              <Sparkles size={11} className="text-[#82EAF4]" />
              Last analyzed: 10 VCT LAN Matches
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#82EAF4]/10 border border-[#82EAF4]/30 text-[11px] font-semibold text-[#82EAF4]">
              <ShieldCheck size={11} />
              {game} Masters
            </span>
          </div>

          {/* Title & Description */}
          <h1 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-[#F5F5F5] tracking-tight font-heading leading-tight mb-1">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A8A8] leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Right: Actions & Telemetry indicator */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-0.5 lg:pt-0">
          <Link
            to="/scouting"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#82EAF4] text-[#0B0B0B] font-semibold text-xs sm:text-sm hover:bg-[#64E8F2] active:scale-95 transition-all shadow-[0_0_16px_rgba(130,234,244,0.3)]"
            onClick={onActionClick}
          >
            <Play size={14} className="fill-[#0B0B0B]" />
            <span>Continue Scouting</span>
          </Link>

          <Link
            to="/settings"
            className="w-8.5 h-8.5 rounded-full bg-[#202020] border border-[#353535] flex items-center justify-center text-[#B8B8B8] hover:text-[#F5F5F5] hover:border-[#82EAF4]/50 transition-colors"
            title="Settings & Telemetry Configuration"
          >
            <Settings size={15} />
          </Link>

          <Link
            to="/data-sources"
            className="w-8.5 h-8.5 rounded-full bg-[#202020] border border-[#353535] flex items-center justify-center text-[#B8B8B8] hover:text-[#82EAF4] hover:border-[#82EAF4]/50 transition-colors"
            title="Data Sources & Health"
          >
            <Info size={15} />
          </Link>

          <div className="hidden xl:flex items-center gap-1.5 ml-1 pl-3 border-l border-[#353535] text-[11px] font-mono text-[#B8B8B8]">
            <span>Active:</span>
            <span className="text-[#82EAF4] font-bold">156 Pros</span>
          </div>
        </div>
      </div>
    </div>
  );
};
