import React, { useState, useEffect } from 'react';
import { X, Shield, Activity, Zap, TrendingUp, AlertTriangle, Crosshair, DollarSign, Layers } from 'lucide-react';
import { rankingsService, IglBreakdown, IglDecisionsResponse } from '../../services/rankingsService';

interface IglIntelligenceModalProps {
  playerId: string;
  playerHandle: string;
  gameId?: string;
  onClose: () => void;
}

export const IglIntelligenceModal: React.FC<IglIntelligenceModalProps> = ({
  playerId,
  playerHandle,
  gameId = 'valorant',
  onClose,
}) => {
  const [breakdown, setBreakdown] = useState<IglBreakdown | null>(null);
  const [decisions, setDecisions] = useState<IglDecisionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'radar' | 'decisions'>('radar');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [bd, dec] = await Promise.all([
          rankingsService.getIglBreakdown(playerId, gameId),
          rankingsService.getIglDecisions(playerId, 25),
        ]);
        if (mounted) {
          setBreakdown(bd);
          setDecisions(dec);
        }
      } catch (err) {
        console.error('Failed to load IGL intelligence', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [playerId, gameId]);

  // Generate SVG points for 8-axis radar
  const renderRadarChart = () => {
    if (!breakdown || !breakdown.radar) return null;
    const size = 320;
    const center = size / 2;
    const radius = 110;
    const numAxes = breakdown.radar.length;

    // Polygon coordinates
    const playerPoints = breakdown.radar.map((item, i) => {
      const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
      const r = (item.value / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    const peerPoints = breakdown.radar.map((item, i) => {
      const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
      const r = (item.peer / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="relative flex flex-col items-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background concentric rings */}
          {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="#353535"
              strokeDasharray={idx < 3 ? '3 3' : 'none'}
              strokeWidth="1"
            />
          ))}

          {/* Spokes */}
          {breakdown.radar.map((_, i) => {
            const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#2B2B2B"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Peer benchmark polygon */}
          <polygon
            points={peerPoints}
            fill="rgba(184, 184, 184, 0.1)"
            stroke="#777777"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Player metric polygon */}
          <polygon
            points={playerPoints}
            fill="rgba(130, 234, 244, 0.25)"
            stroke="#82EAF4"
            strokeWidth="2.5"
          />

          {/* Data points */}
          {breakdown.radar.map((item, i) => {
            const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
            const r = (item.value / 100) * radius;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4.5"
                fill="#82EAF4"
                stroke="#101010"
                strokeWidth="2"
              />
            );
          })}

          {/* Metric labels */}
          {breakdown.radar.map((item, i) => {
            const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
            const labelR = radius + 22;
            const x = center + labelR * Math.cos(angle);
            const y = center + labelR * Math.sin(angle);
            const anchor = Math.abs(Math.cos(angle)) < 0.2 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
            const shortName = item.metric.split('(')[1]?.replace(')', '') || item.metric.slice(0, 4);

            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="central"
                className="fill-[#B8B8B8] text-[10px] font-bold"
              >
                {shortName} ({item.value})
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#82EAF4]" />
            <span className="text-[#F5F5F5] font-semibold">{playerHandle}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 border-t border-dashed border-[#B8B8B8]" />
            <span className="text-[#B8B8B8]">Tier Peer Median (50th)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#181818] border border-[#353535] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#353535] flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#82EAF4]/15 border border-[#82EAF4]/30 flex items-center justify-center text-[#82EAF4]">
              <Crosshair size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#F5F5F5]">{playerHandle}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#82EAF4]/20 text-[#82EAF4] border border-[#82EAF4]/30">
                  IGL Flagship Intelligence
                </span>
                {breakdown?.risk_flags?.map(rf => (
                  <span key={rf} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {rf}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#B8B8B8] mt-0.5">
                Evaluated across {breakdown?.sample_maps || 0} maps ({breakdown?.sample_rounds || 0} rounds) via Call Win Delta, Mid-Round Adaptation & Win-Probability Added.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#242424] border border-[#353535] text-[#B8B8B8] hover:text-[#F5F5F5] hover:bg-[#2B2B2B] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-[#353535] px-6 bg-[#161616]">
          <button
            onClick={() => setActiveTab('radar')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'radar'
                ? 'border-[#82EAF4] text-[#82EAF4]'
                : 'border-transparent text-[#B8B8B8] hover:text-[#F5F5F5]'
            }`}
          >
            <Activity size={14} />
            8-Axis Tactical Radar & Adaptation
          </button>
          <button
            onClick={() => setActiveTab('decisions')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'decisions'
                ? 'border-[#82EAF4] text-[#82EAF4]'
                : 'border-transparent text-[#B8B8B8] hover:text-[#F5F5F5]'
            }`}
          >
            <Zap size={14} />
            Pivotal Macro Decisions & WPA Timeline
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-2 border-[#82EAF4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#B8B8B8]">Aggregating live round telemetry & WPA models...</p>
            </div>
          ) : activeTab === 'radar' && breakdown ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Overall score & Radar */}
              <div className="lg:col-span-6 bg-[#202020] border border-[#353535] rounded-xl p-5 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4 border-b border-[#303030] pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#B8B8B8] uppercase tracking-wider">IGL Impact Score</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-extrabold text-[#82EAF4]">{breakdown.igl_score}</span>
                      <span className="text-xs text-[#B8B8B8]">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#B8B8B8] uppercase tracking-wider">80% Credible Lower Bound</span>
                    <div className="mt-0.5">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#142e33] text-[#82EAF4] border border-[#82EAF4]/30">
                        Final_LB: {breakdown.final_lb}
                      </span>
                    </div>
                  </div>
                </div>

                {renderRadarChart()}
              </div>

              {/* Right Column: Breakdown Cards */}
              <div className="lg:col-span-6 space-y-4">
                {/* Side Splits */}
                <div className="bg-[#202020] border border-[#353535] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp size={14} className="text-[#82EAF4]" />
                    Call Win Delta by Side (Attack vs Defense)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#B8B8B8]">Attack Side Win Rate</span>
                        <span className="font-bold text-[#F5F5F5]">
                          {breakdown.side_splits.attack_win_rate}%
                          <span className={`ml-2 ${breakdown.side_splits.call_win_delta_attack >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ({breakdown.side_splits.call_win_delta_attack >= 0 ? '+' : ''}{breakdown.side_splits.call_win_delta_attack} CWD)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#2B2B2B] overflow-hidden">
                        <div
                          className="h-full bg-[#82EAF4] rounded-full"
                          style={{ width: `${Math.min(100, breakdown.side_splits.attack_win_rate)}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#B8B8B8]">Defense Side Win Rate</span>
                        <span className="font-bold text-[#F5F5F5]">
                          {breakdown.side_splits.defense_win_rate}%
                          <span className={`ml-2 ${breakdown.side_splits.call_win_delta_defense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ({breakdown.side_splits.call_win_delta_defense >= 0 ? '+' : ''}{breakdown.side_splits.call_win_delta_defense} CWD)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#2B2B2B] overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${Math.min(100, breakdown.side_splits.defense_win_rate)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adaptation Profile */}
                <div className="bg-[#202020] border border-[#353535] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Layers size={14} className="text-[#82EAF4]" />
                    Mid-Round Tactical Adaptation Curve
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-[#181818] p-2.5 rounded-lg border border-[#303030]">
                      <span className="text-[10px] text-[#B8B8B8] block">Switch Rate</span>
                      <span className="text-sm font-bold text-[#F5F5F5] mt-1 block">
                        {(breakdown.adaptation_profile.mid_round_switch_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-[#181818] p-2.5 rounded-lg border border-[#303030]">
                      <span className="text-[10px] text-[#B8B8B8] block">Audible Win %</span>
                      <span className="text-sm font-bold text-emerald-400 mt-1 block">
                        {breakdown.adaptation_profile.mid_round_win_rate}%
                      </span>
                    </div>
                    <div className="bg-[#181818] p-2.5 rounded-lg border border-[#303030]">
                      <span className="text-[10px] text-[#B8B8B8] block">Default Win %</span>
                      <span className="text-sm font-bold text-[#F5F5F5] mt-1 block">
                        {breakdown.adaptation_profile.default_plan_win_rate}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Economy Conversion */}
                <div className="bg-[#202020] border border-[#353535] rounded-xl p-4">
                  <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <DollarSign size={14} className="text-[#82EAF4]" />
                    Economy Conversion Matrix
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-[#181818] p-2.5 rounded-lg border border-[#303030]">
                      <span className="text-[10px] text-[#B8B8B8] block">Force Buy Win %</span>
                      <span className="text-sm font-bold text-[#F5F5F5] mt-1 block">
                        {breakdown.economy_conversion.force_buy_win_rate}%
                      </span>
                    </div>
                    <div className="bg-[#181818] p-2.5 rounded-lg border border-[#303030]">
                      <span className="text-[10px] text-[#B8B8B8] block">Eco Conversion</span>
                      <span className="text-sm font-bold text-[#82EAF4] mt-1 block">
                        {breakdown.economy_conversion.eco_round_conversion}%
                      </span>
                    </div>
                    <div className="bg-[#181818] p-2.5 rounded-lg border border-[#303030]">
                      <span className="text-[10px] text-[#B8B8B8] block">Thrifty Rate</span>
                      <span className="text-sm font-bold text-amber-300 mt-1 block">
                        {breakdown.economy_conversion.thrifty_rate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'decisions' && decisions ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#B8B8B8]">
                  Showing last {decisions.timeline.length} shotcalls with pre/post Win Probability Added (WPA)
                </span>
                <span className="text-[11px] font-semibold text-[#82EAF4]">
                  Empirical WPA Model
                </span>
              </div>

              {decisions.timeline.map((call, idx) => (
                <div
                  key={call.round_id || idx}
                  className="bg-[#202020] border border-[#353535] hover:border-[#82EAF4]/40 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-mono font-bold text-[#777777] w-6">
                      #{call.round_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          call.call_type === 'AUDIBLE'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : call.call_type === 'FORCE_BUY'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {call.call_type}
                        </span>
                        <span className="text-xs font-semibold text-[#F5F5F5]">{call.map_name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          call.won ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                        }`}>
                          {call.won ? 'ROUND WON' : 'ROUND LOST'}
                        </span>
                      </div>
                      <p className="text-xs text-[#B8B8B8] mt-1">{call.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-[11px] text-[#777777]">
                        {(call.p_before * 100).toFixed(0)}% → {(call.p_after * 100).toFixed(0)}%
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        call.wpa_delta >= 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {call.wpa_delta >= 0 ? '+' : ''}{(call.wpa_delta).toFixed(3)} WPA
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
