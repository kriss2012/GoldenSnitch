import React from 'react';
import { ChevronRight, Award, Flame, Star, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlayerAvatar } from './PlayerAvatar';
import { RoleBadge } from './RoleBadge';

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
  { id: 'VAL-LAN-4B30D9', name: 'Munchkin', role: 'Controller (IGL)', hours: 85, score: 82.0, progressPercent: 82, badge: 'LAN Captain' },
];

export const CompareProgressCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const navigate = useNavigate();

  return (
    <div className={`bg-[#242424] border border-[#353535] rounded-2xl p-5 sm:p-6 text-[#F5F5F5] ${className}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#353535]">
        <div>
          <h3 className="text-base font-semibold font-heading text-[#F5F5F5] tracking-tight">
            Compare progress
          </h3>
          <p className="text-xs text-[#B8B8B8] mt-0.5">Benchmarking candidate fit vs vacancy</p>
        </div>
        <button
          onClick={() => navigate('/compare')}
          className="w-8 h-8 rounded-full bg-[#2B2B2B] border border-[#353535] flex items-center justify-center text-[#B8B8B8] hover:text-[#82EAF4] hover:border-[#82EAF4]/50 transition-colors"
          title="Open Comparison Matrix"
        >
          <ChevronRight size={16} />
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
