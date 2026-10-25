import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Zap, Shield, Users, Award, TrendingUp, Sparkles } from 'lucide-react';

export interface SynergyDimension {
  name: string;
  current: number; // 0-100
  projected?: number; // 0-100
  benchmark: number;
  description: string;
}

interface RosterSynergyBreakdownProps {
  rosterName: string;
  game?: string;
  synergyScore: number;
  projectedScore?: number;
  dimensions?: SynergyDimension[];
  candidateHandle?: string;
  height?: number;
}

export const RosterSynergyBreakdown: React.FC<RosterSynergyBreakdownProps> = ({
  rosterName,
  game = 'VALORANT',
  synergyScore,
  projectedScore,
  dimensions,
  candidateHandle,
  height = 250,
}) => {
  // Default dimensions if none supplied
  const dimensionData = useMemo(() => {
    if (dimensions && dimensions.length) return dimensions;

    const baseScore = synergyScore || 82;
    const isSimulated = projectedScore !== undefined;

    return [
      {
        name: 'Role Balance',
        current: Math.min(100, Math.round(baseScore * 1.05)),
        projected: isSimulated ? Math.min(100, Math.round(projectedScore * 1.08)) : undefined,
        benchmark: 80,
        description: 'Covers 5 core competitive tactical roles with 0 slot overlap',
      },
      {
        name: 'Shotcalling Comms',
        current: Math.min(100, Math.round(baseScore * 0.95)),
        projected: isSimulated ? Math.min(100, Math.round(projectedScore * 1.12)) : undefined,
        benchmark: 75,
        description: 'Mid-round audible cohesion and timeout recovery discipline',
      },
      {
        name: 'Agent Pool Depth',
        current: Math.min(100, Math.round(baseScore * 1.02)),
        projected: isSimulated ? Math.min(100, Math.round(projectedScore * 1.04)) : undefined,
        benchmark: 78,
        description: 'Multi-map utility flexibility across international pick rates',
      },
      {
        name: 'Playstyle Synergy',
        current: Math.min(100, Math.round(baseScore * 0.98)),
        projected: isSimulated ? Math.min(100, Math.round(projectedScore * 1.06)) : undefined,
        benchmark: 75,
        description: 'Aggressive entry space created is paired with trade coverage',
      },
      {
        name: 'Eco Discipline',
        current: Math.min(100, Math.round(baseScore * 0.92)),
        projected: isSimulated ? Math.min(100, Math.round(projectedScore * 1.01)) : undefined,
        benchmark: 70,
        description: 'Thrifty conversion rates and save-round weapon preservation',
      },
    ];
  }, [dimensions, synergyScore, projectedScore]);

  const delta = projectedScore !== undefined ? projectedScore - synergyScore : null;

  return (
    <div className="space-y-4">
      {/* Synergy Overview Card */}
      <div className="p-4 bg-[#171717] border border-[#2B2B2B] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#82EAF4]/15 border border-[#82EAF4]/30 flex items-center justify-center text-[#82EAF4]">
              <Zap size={16} />
            </span>
            <div>
              <h4 className="text-sm font-bold text-[#F5F5F5] font-heading">
                {rosterName} · Tactical Synergy Index
              </h4>
              <p className="text-[11px] text-[#8E8E8E]">
                {game} · 5-Axis Deterministic Chemistry Modeling
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">
              {projectedScore !== undefined ? 'Current Synergy' : 'Overall Synergy Score'}
            </span>
            <div className="text-2xl font-extrabold font-heading text-[#82EAF4] leading-tight">
              {synergyScore}%
            </div>
          </div>

          {projectedScore !== undefined && (
            <div className="pl-4 border-l border-[#2B2B2B] text-right">
              <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">
                With {candidateHandle || 'Target'}
              </span>
              <div className="text-2xl font-extrabold font-heading text-[#10B981] flex items-center gap-1">
                <span>{projectedScore}%</span>
                <span className={`text-xs font-mono font-bold ${delta && delta >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  ({delta && delta >= 0 ? `+${delta}` : delta}%)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dimension Progress Bars */}
      <div className="p-4 bg-[#141414] border border-[#242424] rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-semibold text-[#D4D4D4] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#82EAF4]" />
            5-Axis Squad Complementarity Breakdown
          </span>
          <span className="text-[11px] text-[#8E8E8E]">Benchmark Par: 75%</span>
        </div>

        <div className="space-y-3">
          {dimensionData.map((dim, idx) => {
            const hasProjected = dim.projected !== undefined;
            const isGain = hasProjected && (dim.projected || 0) > dim.current;

            return (
              <div key={idx} className="p-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div>
                    <span className="font-bold text-[#F5F5F5]">{dim.name}</span>
                    <span className="text-[11px] text-[#8E8E8E] ml-2 font-normal hidden sm:inline">
                      — {dim.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-[#82EAF4] font-bold">{dim.current}%</span>
                    {hasProjected && (
                      <span className={`font-bold flex items-center ${isGain ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                        → {dim.projected}% ({isGain ? '+' : ''}{(dim.projected || 0) - dim.current}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Dual / Single Progress Bar */}
                <div className="w-full h-2 bg-[#0E0E0E] rounded-full overflow-hidden border border-[#262626] relative">
                  {/* Current Bar */}
                  <div
                    className="h-full bg-[#82EAF4] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, dim.current))}%` }}
                  />
                  {/* Projected Difference Glow */}
                  {hasProjected && isGain && (
                    <div
                      className="absolute top-0 bottom-0 bg-[#10B981] opacity-75 rounded-r-full"
                      style={{
                        left: `${dim.current}%`,
                        width: `${Math.min(100 - dim.current, (dim.projected || 0) - dim.current)}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
