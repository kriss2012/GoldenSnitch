import React from 'react';
import { ChevronRight, BarChart3, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlayerAvatar } from './PlayerAvatar';

interface ComparePlayer {
  id: string;
  name: string;
  role: string;
  hours: number;
  score: number;
  progressPercent: number;
  badge?: string;
  isTop?: boolean;
}

const DEFAULT_COMPARISON: ComparePlayer[] = [
  { id: 'VAL-002', name: 'Mirage', role: 'Controller (IGL)', hours: 102, score: 74.8, progressPercent: 78, badge: 'Top 1 Fit', isTop: true },
  { id: 'VAL-003', name: 'Voltz', role: 'Duelist', hours: 232, score: 49.3, progressPercent: 49, badge: 'High ACS' },
  { id: 'VAL-001', name: 'TenZ', role: 'Initiator/Duelist', hours: 77, score: 88.5, progressPercent: 88, badge: 'Star Player' },
];

export const CompareProgressCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`bg-[#151515] border border-[#262626] rounded-2xl p-4 sm:p-5 text-[#F5F5F5] shadow-[0_4px_24px_rgba(0,0,0,0.5)] ${className}`}>
      {/* Card Header matching Image 1 */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#222222]">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-[#82EAF4]/15 border border-[#82EAF4]/30 flex items-center justify-center text-[#82EAF4] shrink-0">
            <BarChart3 size={16} />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-[#F5F5F5] tracking-tight">
              Compare progress
            </h3>
            <p className="text-[11px] text-[#8E8E8E] mt-0.5">Benchmarking candidate fit vs vacancy</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/compare')}
          className="w-7 h-7 rounded-full bg-[#1F1F1F] border border-[#2B2B2B] flex items-center justify-center text-[#B8B8B8] hover:text-[#82EAF4] hover:border-[#82EAF4]/50 transition-colors"
          title="Open Comparison Matrix"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Players List */}
      <div className="space-y-4">
        {DEFAULT_COMPARISON.map((p, idx) => (
          <div
            key={p.id}
            onClick={() => navigate(`/players/${p.id}`)}
            className="group cursor-pointer p-2 rounded-xl hover:bg-[#2B2B2B] transition-all duration-150"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <PlayerAvatar
                  handle={p.name}
                  role={p.role}
                  rank={idx + 1}
                  size="sm"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[#F5F5F5] group-hover:text-[#82EAF4] transition-colors truncate">
                      {p.name}
                    </span>
                    {p.isTop && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#82EAF4]/15 text-[#82EAF4] border border-[#82EAF4]/40">
                        <Star size={8} className="fill-[#82EAF4]" />
                        Top Fit
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-[#A0A0A0] truncate">
                      {p.role}
                    </span>
                    <span className="text-[10px] text-[#707070]">·</span>
                    <span className="text-[10px] text-[#82EAF4] font-mono">
                      {p.hours}h LAN
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-[#82EAF4]">
                  {p.score} Fit
                </span>
                <span className="text-[10px] text-[#B8B8B8] block font-mono">
                  {p.progressPercent}% coverage
                </span>
              </div>
            </div>

            {/* Progress bar with electric cyan */}
            <div className="w-full h-1.5 rounded-full bg-[#101010] overflow-hidden border border-[#353535]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#82EAF4]/70 to-[#82EAF4] shadow-[0_0_8px_rgba(130,234,244,0.5)] transition-all duration-300"
                style={{ width: `${p.progressPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
