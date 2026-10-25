import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { MatchRecord } from '../../../types';
import { TrendingUp, Award, Zap, Crosshair } from 'lucide-react';

interface PlayerPerformanceTrendChartProps {
  matchHistory: MatchRecord[];
  playerHandle: string;
  role?: string;
  height?: number;
}

export const PlayerPerformanceTrendChart: React.FC<PlayerPerformanceTrendChartProps> = ({
  matchHistory = [],
  playerHandle,
  role = 'Pro Player',
  height = 290,
}) => {
  const [metric, setMetric] = useState<'rating' | 'combat' | 'kd'>('rating');

  // Format real application data
  const chartData = useMemo(() => {
    if (!matchHistory.length) {
      return [
        { matchLabel: 'M1', map: 'Ascent', rating: 1.15, combat: 245, kd: 1.35, result: 'W', score: '13-9', opponent: 'Fnatic', date: '2024-08-10' },
        { matchLabel: 'M2', map: 'Lotus', rating: 1.28, combat: 268, kd: 1.55, result: 'W', score: '13-7', opponent: 'Sentinels', date: '2024-08-14' },
        { matchLabel: 'M3', map: 'Haven', rating: 1.05, combat: 220, kd: 1.08, result: 'L', score: '11-13', opponent: 'DRX', date: '2024-08-18' },
        { matchLabel: 'M4', map: 'Sunset', rating: 1.34, combat: 278, kd: 1.72, result: 'W', score: '13-8', opponent: 'Liquid', date: '2024-08-22' },
      ];
    }

    return matchHistory.map((m, idx) => {
      const kdValue = m.deaths > 0 ? Number((m.kills / m.deaths).toFixed(2)) : m.kills;
      return {
        matchLabel: `M${idx + 1}`,
        map: m.mapOrStage || 'Map',
        rating: Number((m.rating > 5 ? m.rating / 70 : m.rating).toFixed(2)),
        combat: m.combatScore || Math.round(m.rating * 200),
        kd: kdValue,
        kills: m.kills,
        deaths: m.deaths,
        assists: m.assists,
        result: m.result,
        score: m.score,
        opponent: m.opponent,
        tournament: m.tournament,
        date: m.date,
        event: m.situationalEvent,
      };
    });
  }, [matchHistory]);

  // Compute key stats
  const stats = useMemo(() => {
    if (!chartData.length) return { avgRating: 1.2, peakCombat: 285, winRate: 75, avgKd: 1.32 };
    const avgRating = (chartData.reduce((acc, d) => acc + d.rating, 0) / chartData.length).toFixed(2);
    const peakCombat = Math.max(...chartData.map(d => d.combat));
    const winCount = chartData.filter(d => d.result === 'W').length;
    const winRate = Math.round((winCount / chartData.length) * 100);
    const avgKd = (chartData.reduce((acc, d) => acc + d.kd, 0) / chartData.length).toFixed(2);
    return { avgRating, peakCombat, winRate, avgKd };
  }, [chartData]);

  const activeConfig = {
    rating: {
      dataKey: 'rating',
      label: 'Performance Rating',
      unit: '',
      color: '#82EAF4',
      gradientId: 'ratingGrad',
      domain: [0.7, 1.6],
      refLine: 1.0,
      refLabel: 'Tier-1 Par (1.00)',
    },
    combat: {
      dataKey: 'combat',
      label: 'Combat Score (ACS/ADR)',
      unit: ' ACS',
      color: '#9B51E0',
      gradientId: 'combatGrad',
      domain: [160, 320],
      refLine: 215,
      refLabel: 'VLR Median (215)',
    },
    kd: {
      dataKey: 'kd',
      label: 'Match K/D Ratio',
      unit: ' K/D',
      color: '#10B981',
      gradientId: 'kdGrad',
      domain: [0.5, 2.2],
      refLine: 1.0,
      refLabel: '1.00 Even K/D',
    },
  }[metric];

  return (
    <div className="space-y-4">
      {/* Metric Selector & Quick Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#82EAF4]/10 border border-[#82EAF4]/30 flex items-center justify-center text-[#82EAF4]">
            <TrendingUp size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
              {playerHandle} · Form Trajectory
            </h4>
            <span className="text-[11px] text-[#8E8E8E]">{role} · {chartData.length} VCT Matches Sample</span>
          </div>
        </div>

        {/* Metric Switches */}
        <div className="flex items-center gap-1.5 bg-[#0E0E0E] p-1 rounded-lg border border-[#2B2B2B] self-start sm:self-auto">
          {(['rating', 'combat', 'kd'] as const).map((key) => {
            const labels = { rating: 'Rating 2.0', combat: 'Combat ACS', kd: 'K/D Ratio' };
            const isActive = metric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                className={`px-3 py-1 text-xs rounded-md font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#82EAF4] text-[#0A0A0A] shadow-[0_0_12px_rgba(130,234,244,0.35)]'
                    : 'text-[#8E8E8E] hover:text-[#F5F5F5] hover:bg-[#1E1E1E]'
                }`}
              >
                {labels[key]}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">Average Rating</span>
          <div className="text-lg font-bold font-mono text-[#82EAF4] mt-0.5">{stats.avgRating}</div>
          <span className="text-[10px] text-[#10B981] font-medium">+8.2% vs league</span>
        </div>
        <div className="p-2.5 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">Peak Combat Score</span>
          <div className="text-lg font-bold font-mono text-[#9B51E0] mt-0.5">{stats.peakCombat} ACS</div>
          <span className="text-[10px] text-[#8E8E8E]">Tournament high</span>
        </div>
        <div className="p-2.5 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">Average K/D Ratio</span>
          <div className="text-lg font-bold font-mono text-[#10B981] mt-0.5">{stats.avgKd}</div>
          <span className="text-[10px] text-[#10B981] font-medium">Positive delta</span>
        </div>
        <div className="p-2.5 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">Match Win Rate</span>
          <div className="text-lg font-bold font-mono text-[#F5F5F5] mt-0.5">{stats.winRate}%</div>
          <span className="text-[10px] text-[#8E8E8E]">Sample efficiency</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-4 bg-[#141414] border border-[#242424] rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-[#D4D4D4] flex items-center gap-1.5">
            <Crosshair size={13} className="text-[#82EAF4]" />
            Sequential Match Performance Progression
          </span>
          <div className="flex items-center gap-3 text-[11px] text-[#8E8E8E]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Win
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Defeat
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height }} className="pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={activeConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeConfig.color} stopOpacity={0.42} />
                  <stop offset="95%" stopColor={activeConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis
                dataKey="matchLabel"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
              />
              <YAxis
                domain={activeConfig.domain}
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
              />
              <ReferenceLine
                y={activeConfig.refLine}
                stroke="#4B5563"
                strokeDasharray="4 4"
                label={{ value: activeConfig.refLabel, fill: '#9CA3AF', fontSize: 10, position: 'right' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-[#111111]/95 backdrop-blur-md border border-[#333333] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.8)] text-xs min-w-[210px] space-y-2">
                      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-1.5">
                        <span className="font-bold text-[#F5F5F5]">{data.matchLabel} · {data.map}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          data.result === 'W' ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30' : 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                        }`}>
                          {data.result === 'W' ? 'VICTORY' : 'DEFEAT'} {data.score}
                        </span>
                      </div>
                      <div className="space-y-1 text-[#D4D4D4]">
                        <div className="flex justify-between">
                          <span className="text-[#8E8E8E]">Opponent:</span>
                          <span className="font-semibold text-[#F5F5F5]">{data.opponent}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8E8E8E]">Tournament:</span>
                          <span className="font-mono text-[11px] text-[#A78BFA]">{data.tournament || 'LAN Stage'}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[#222]">
                          <span className="text-[#82EAF4] font-medium">{activeConfig.label}:</span>
                          <span className="font-mono font-bold text-[#F5F5F5]">{data[activeConfig.dataKey]}{activeConfig.unit}</span>
                        </div>
                        {data.kills !== undefined && (
                          <div className="flex justify-between text-[11px] text-[#8E8E8E]">
                            <span>Combat Spread:</span>
                            <span className="font-mono text-[#D4D4D4]">{data.kills}K / {data.deaths}D / {data.assists}A ({data.kd} K/D)</span>
                          </div>
                        )}
                      </div>
                      {data.event && (
                        <div className="pt-1.5 border-t border-[#222] text-[10px] text-[#9CA3AF] italic">
                          "{data.event}"
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey={activeConfig.dataKey}
                stroke={activeConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${activeConfig.gradientId})`}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const dotColor = payload.result === 'W' ? '#10B981' : '#EF4444';
                  return (
                    <circle
                      key={`dot-${props.index}`}
                      cx={cx}
                      cy={cy}
                      r={4.5}
                      fill={dotColor}
                      stroke="#0E0E0E"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{ r: 7, fill: activeConfig.color, stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
