import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { MatchRecord } from '../../../types';
import { Swords, ShieldCheck, Skull, HeartPulse } from 'lucide-react';

interface KdDistributionChartProps {
  matchHistory: MatchRecord[];
  playerHandle: string;
  height?: number;
}

export const KdDistributionChart: React.FC<KdDistributionChartProps> = ({
  matchHistory = [],
  playerHandle,
  height = 290,
}) => {
  const chartData = useMemo(() => {
    if (!matchHistory.length) {
      return [
        { match: 'M1 Breeze', kills: 22, deaths: 16, assists: 14, kd: 1.38, net: 6, result: 'W' },
        { match: 'M2 Sunset', kills: 20, deaths: 11, assists: 12, kd: 1.82, net: 9, result: 'W' },
        { match: 'M3 Lotus', kills: 18, deaths: 15, assists: 15, kd: 1.20, net: 3, result: 'W' },
        { match: 'M4 Haven', kills: 19, deaths: 12, assists: 11, kd: 1.58, net: 7, result: 'W' },
        { match: 'M5 Ascent', kills: 16, deaths: 17, assists: 10, kd: 0.94, net: -1, result: 'L' },
      ];
    }

    return matchHistory.map((m, idx) => {
      const kills = m.kills || 18;
      const deaths = m.deaths || 14;
      const assists = m.assists || 10;
      const kd = deaths > 0 ? Number((kills / deaths).toFixed(2)) : kills;
      const net = kills - deaths;
      return {
        match: m.mapOrStage || `M${idx + 1}`,
        matchIdx: `M${idx + 1}`,
        kills,
        deaths,
        assists,
        kd,
        net,
        opponent: m.opponent || 'Opponent',
        result: m.result || 'W',
        score: m.score || '13-9',
      };
    });
  }, [matchHistory]);

  const summary = useMemo(() => {
    const totalKills = chartData.reduce((acc, d) => acc + d.kills, 0);
    const totalDeaths = chartData.reduce((acc, d) => acc + d.deaths, 0);
    const totalAssists = chartData.reduce((acc, d) => acc + d.assists, 0);
    const overallKd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills.toFixed(2);
    const netDiff = totalKills - totalDeaths;
    return { totalKills, totalDeaths, totalAssists, overallKd, netDiff };
  }, [chartData]);

  return (
    <div className="space-y-4">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-[10px] uppercase tracking-wider">Overall K/D</span>
            <Swords size={14} className="text-[#82EAF4]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#82EAF4] mt-1">{summary.overallKd}</div>
          <span className="text-[10px] text-[#10B981] font-medium">
            {summary.netDiff >= 0 ? `+${summary.netDiff}` : summary.netDiff} Net Frags
          </span>
        </div>

        <div className="p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-[10px] uppercase tracking-wider">Total Kills</span>
            <Skull size={14} className="text-[#10B981]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#10B981] mt-1">{summary.totalKills}</div>
          <span className="text-[10px] text-[#8E8E8E]">Across {chartData.length} LAN maps</span>
        </div>

        <div className="p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-[10px] uppercase tracking-wider">Total Deaths</span>
            <HeartPulse size={14} className="text-[#EF4444]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#EF4444] mt-1">{summary.totalDeaths}</div>
          <span className="text-[10px] text-[#8E8E8E]">
            {(summary.totalDeaths / chartData.length).toFixed(1)} Deaths/map
          </span>
        </div>

        <div className="p-3 bg-[#171717] border border-[#2B2B2B] rounded-xl">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-[10px] uppercase tracking-wider">Utility Assists</span>
            <ShieldCheck size={14} className="text-[#9B51E0]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#9B51E0] mt-1">{summary.totalAssists}</div>
          <span className="text-[10px] text-[#9B51E0] font-medium">Teamplay contributor</span>
        </div>
      </div>

      {/* Composed Chart */}
      <div className="p-4 bg-[#141414] border border-[#242424] rounded-2xl relative min-w-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Swords size={15} className="text-[#10B981]" />
            <h4 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
              {playerHandle} · Kills vs Deaths Distribution &amp; Match K/D Ratio
            </h4>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#8E8E8E]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#10B981]" /> Kills
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#EF4444]" /> Deaths
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#9B51E0]" /> Assists
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-[#82EAF4]" /> K/D Ratio (Right Axis)
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height }} className="pt-2 min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis
                dataKey="match"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
              />
              <YAxis
                yAxisId="left"
                stroke="#6B7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0.5, 2.5]}
                stroke="#82EAF4"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#2A2A2A' }}
              />
              <ReferenceLine
                yAxisId="right"
                y={1.0}
                stroke="#6B7280"
                strokeDasharray="4 4"
                label={{ value: '1.00 Par', fill: '#9CA3AF', fontSize: 10, position: 'left' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-[#111111]/95 backdrop-blur-md border border-[#333333] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.8)] text-xs min-w-[210px] space-y-1.5">
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
                      <div className="pt-1.5 border-t border-[#222] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#10B981] font-semibold">Kills:</span>
                          <span className="font-mono font-bold text-[#F5F5F5]">{data.kills}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#EF4444] font-semibold">Deaths:</span>
                          <span className="font-mono font-bold text-[#F5F5F5]">{data.deaths}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#9B51E0] font-semibold">Assists:</span>
                          <span className="font-mono font-bold text-[#F5F5F5]">{data.assists}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[#2A2A2A]">
                          <span className="text-[#82EAF4] font-bold">Match K/D:</span>
                          <span className="font-mono font-bold text-[#82EAF4] text-sm">{data.kd}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar yAxisId="left" dataKey="kills" fill="#10B981" fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar yAxisId="left" dataKey="deaths" fill="#EF4444" fillOpacity={0.85} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar yAxisId="left" dataKey="assists" fill="#9B51E0" fillOpacity={0.75} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="kd"
                stroke="#82EAF4"
                strokeWidth={2.5}
                dot={{ fill: '#82EAF4', r: 4, stroke: '#0B0B0B', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#82EAF4' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
