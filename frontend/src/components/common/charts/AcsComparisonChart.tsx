import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import { MatchRecord } from '../../../types';
import { Target, Zap, ShieldAlert, Award } from 'lucide-react';

interface AcsComparisonChartProps {
  matchHistory: MatchRecord[];
  roleBenchmark?: number;
  playerHandle: string;
  role?: string;
  height?: number;
}

export const AcsComparisonChart: React.FC<AcsComparisonChartProps> = ({
  matchHistory = [],
  roleBenchmark = 220,
  playerHandle,
  role = 'Pro Player',
  height = 280,
}) => {
  const chartData = useMemo(() => {
    if (!matchHistory.length) {
      return [
        { match: 'M1 Ascent', acs: 255, opponent: 'Fnatic', diff: 35, result: 'W' },
        { match: 'M2 Sunset', acs: 260, opponent: 'Liquid', diff: 40, result: 'W' },
        { match: 'M3 Lotus', acs: 248, opponent: 'LOUD', diff: 28, result: 'W' },
        { match: 'M4 Haven', acs: 258, opponent: 'PRX', diff: 38, result: 'W' },
        { match: 'M5 Breeze', acs: 242, opponent: 'Gen.G', diff: 22, result: 'L' },
      ];
    }

    return matchHistory.map((m, idx) => {
      const acs = m.combatScore || 220;
      const diff = acs - roleBenchmark;
      return {
        match: `${m.mapOrStage || `M${idx + 1}`}`,
        matchIdx: `M${idx + 1}`,
        acs,
        diff,
        opponent: m.opponent || 'Opponent',
        result: m.result || 'W',
        score: m.score || '13-9',
        tournament: m.tournament || 'VCT LAN',
      };
    });
  }, [matchHistory, roleBenchmark]);

  // Aggregate metrics
  const stats = useMemo(() => {
    if (!chartData.length) return { avgAcs: 252, diffAvg: 32, abovePct: 100, maxAcs: 260 };
    const avgAcs = Math.round(chartData.reduce((acc, d) => acc + d.acs, 0) / chartData.length);
    const diffAvg = avgAcs - roleBenchmark;
    const aboveCount = chartData.filter(d => d.acs >= roleBenchmark).length;
    const abovePct = Math.round((aboveCount / chartData.length) * 100);
    const maxAcs = Math.max(...chartData.map(d => d.acs));
    return { avgAcs, diffAvg, abovePct, maxAcs };
  }, [chartData, roleBenchmark]);

  return (
    <div className="space-y-4">
      {/* Overview Stat Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">Average Combat ACS</span>
          <div className="text-xl font-bold font-mono text-[#82EAF4] mt-0.5">{stats.avgAcs}</div>
          <span className={`text-[10px] font-semibold ${stats.diffAvg >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {stats.diffAvg >= 0 ? `+${stats.diffAvg}` : stats.diffAvg} vs Role Benchmark
          </span>
        </div>

        <div className="p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">Role Par Target</span>
          <div className="text-xl font-bold font-mono text-[#D4D4D4] mt-0.5">{roleBenchmark}</div>
          <span className="text-[10px] text-[#8E8E8E]">{role} Tier-1 Expectancy</span>
        </div>

        <div className="p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">Benchmark Exceed Rate</span>
          <div className="text-xl font-bold font-mono text-[#10B981] mt-0.5">{stats.abovePct}%</div>
          <span className="text-[10px] text-[#8E8E8E]">{chartData.filter(d => d.acs >= roleBenchmark).length}/{chartData.length} Matches Above Par</span>
        </div>

        <div className="p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block">Peak Match ACS</span>
          <div className="text-xl font-bold font-mono text-[#9B51E0] mt-0.5">{stats.maxAcs}</div>
          <span className="text-[10px] text-[#9B51E0] font-medium">Tournament Ceiling</span>
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="p-4 bg-[#141414] border border-[#242424] rounded-2xl relative min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-[#82EAF4]" />
            <h4 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
              Match-by-Match ACS vs Tier-1 Role Benchmark ({roleBenchmark})
            </h4>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#8E8E8E]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#82EAF4]" /> &gt; Benchmark
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#4B5563]" /> &lt; Benchmark
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height }} className="pt-2 min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis
                dataKey="match"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
              />
              <YAxis
                domain={[150, 320]}
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
              />
              <ReferenceLine
                y={roleBenchmark}
                stroke="#82EAF4"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Benchmark (${roleBenchmark})`,
                  fill: '#82EAF4',
                  fontSize: 10,
                  position: 'top',
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  const isPositive = data.diff >= 0;
                  return (
                    <div className="p-3 bg-[#111111]/95 backdrop-blur-md border border-[#333333] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.8)] text-xs min-w-[200px] space-y-1.5">
                      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-1.5">
                        <span className="font-bold text-[#F5F5F5]">{data.match} ({data.matchIdx})</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          data.result === 'W' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                        }`}>
                          {data.result === 'W' ? 'WIN' : 'LOSS'} {data.score}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#8E8E8E]">
                        <span>Opponent:</span>
                        <span className="font-medium text-[#F5F5F5]">{data.opponent}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#222]">
                        <span className="text-[#8E8E8E]">Match ACS:</span>
                        <span className="font-mono font-bold text-[#82EAF4] text-sm">{data.acs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E8E8E]">Delta vs Target:</span>
                        <span className={`font-mono font-bold ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {isPositive ? `+${data.diff}` : data.diff} ACS
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="acs" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => {
                  const isHighImpact = entry.acs >= roleBenchmark;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isHighImpact ? '#82EAF4' : '#4B5563'}
                      fillOpacity={isHighImpact ? 0.9 : 0.6}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
