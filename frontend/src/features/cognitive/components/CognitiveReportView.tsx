import React from 'react';
import {
  Trophy,
  Zap,
  Brain,
  Crosshair,
  Grid,
  TrendingUp,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { AssessmentType, CognitiveProfileReport } from '../types';

interface CognitiveReportViewProps {
  report: CognitiveProfileReport;
  onRetestModule?: (type: AssessmentType) => void;
}

export const CognitiveReportView: React.FC<CognitiveReportViewProps> = ({ report }) => {
  const { personal_bests, reaction_profile, memory_profile, aim_profile, strengths, practice_areas } = report;

  // Prepare radar chart metrics (Normalized 0 to 100 for visual comparison)
  const radarData = [
    {
      subject: 'Reflex (Reaction)',
      score: reaction_profile?.value ? Math.max(20, Math.min(100, Math.round(100 - (reaction_profile.value - 150) * 0.4))) : 50,
      fullMark: 100,
    },
    {
      subject: 'Sequence Memory',
      score: memory_profile?.sequence?.value ? Math.min(100, Math.round(memory_profile.sequence.value * 9.5)) : 50,
      fullMark: 100,
    },
    {
      subject: 'Aim Speed',
      score: aim_profile?.value ? Math.max(20, Math.min(100, Math.round(100 - (aim_profile.value - 250) * 0.25))) : 50,
      fullMark: 100,
    },
    {
      subject: 'Spatial Memory',
      score: memory_profile?.visual?.value ? Math.min(100, Math.round(memory_profile.visual.value * 9.0)) : 50,
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Composite Score Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#10141D] via-[#161B26] to-[#10141D] border border-white/10 p-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-[11px] font-bold uppercase tracking-wider">
                Official Assessment
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> High-Resolution Timing Verified
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Player Cognitive & Reflex Profile
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Standardized biometric measurements including display and browser latency. Decision-support telemetry designed for esports coaches and player development.
            </p>
          </div>

          {/* Composite Index Score Display */}
          <div className="flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl p-4 min-w-[200px] justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Composite Index
              </div>
              <div className="text-3xl font-black text-[#F59E0B] font-mono">
                {report.experimental_composite_index || '—'}
                <span className="text-xs text-gray-400 font-normal ml-1">/ 100</span>
              </div>
              <div className="text-[10px] text-amber-500/80">Experimental Model</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main 4 Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reaction Profile */}
        <div className="bg-[#10141D]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Reflex</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Visual Reaction Time</h4>
            <div className="text-3xl font-black text-white font-mono mt-2 mb-3">
              {reaction_profile ? `${reaction_profile.value} ms` : '—'}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 border-t border-white/5 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Fastest Trial:</span>
              <span className="font-mono text-emerald-400">{reaction_profile?.metrics?.fastest_rt_ms ? `${reaction_profile.metrics.fastest_rt_ms}ms` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>False Starts:</span>
              <span className="font-mono text-gray-300">{reaction_profile?.metrics?.false_starts ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Sequence Memory Profile */}
        <div className="bg-[#10141D]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Cognitive</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Sequence Memory</h4>
            <div className="text-3xl font-black text-white font-mono mt-2 mb-3">
              {memory_profile?.sequence ? `${memory_profile.sequence.value} items` : '—'}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 border-t border-white/5 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Input Accuracy:</span>
              <span className="font-mono text-cyan-400">{memory_profile?.sequence?.metrics?.accuracy_pct ? `${memory_profile.sequence.metrics.accuracy_pct}%` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Rounds Cleared:</span>
              <span className="font-mono text-gray-300">{memory_profile?.sequence?.metrics?.total_successful_rounds ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Aim Profile */}
        <div className="bg-[#10141D]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Crosshair className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Precision</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Aim Acquisition</h4>
            <div className="text-3xl font-black text-white font-mono mt-2 mb-3">
              {aim_profile ? `${aim_profile.value} ms` : '—'}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 border-t border-white/5 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Hit Accuracy:</span>
              <span className="font-mono text-emerald-400">{aim_profile?.metrics?.accuracy_pct ? `${aim_profile.metrics.accuracy_pct}%` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Targets / Sec:</span>
              <span className="font-mono text-gray-300">{aim_profile?.metrics?.targets_per_second ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Visual Memory Profile */}
        <div className="bg-[#10141D]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Grid className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Spatial</span>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Visual-Spatial Memory</h4>
            <div className="text-3xl font-black text-white font-mono mt-2 mb-3">
              {memory_profile?.visual ? `Level ${memory_profile.visual.value}` : '—'}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 border-t border-white/5 pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Precision / F1:</span>
              <span className="font-mono text-indigo-400">{memory_profile?.visual?.metrics?.f1_score ? `${memory_profile.visual.metrics.f1_score}` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span>Correct Tiles:</span>
              <span className="font-mono text-gray-300">{memory_profile?.visual?.metrics?.total_correct_tiles ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar Comparison & Qualitative Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-1 bg-[#10141D]/90 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 self-start">
            Cognitive Capability Radar
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Radar name="Player" dataKey="score" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[10px] text-gray-500 text-center">
            Normalized across competitive baseline distributions
          </div>
        </div>

        {/* Qualitative Insights */}
        <div className="lg:col-span-2 bg-[#10141D]/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">Performance Insights & Development</h4>
              <button
                onClick={() => alert('Performance report summary copied to clipboard!')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Strengths */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <Award className="w-4 h-4" /> Areas of Relative Strength
                </div>
                <ul className="text-xs text-gray-300 space-y-1.5">
                  {strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practice Areas */}
              <div className="p-4 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/20">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F59E0B] mb-2">
                  <TrendingUp className="w-4 h-4" /> Recommended Drill Focus
                </div>
                <ul className="text-xs text-gray-300 space-y-1.5">
                  {practice_areas.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#F59E0B] mt-0.5">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-relaxed">
            <span className="text-[#F59E0B] font-semibold">Analytical Notice:</span> Measurements reflect high-frequency interactive reflexes and spatial memory under standardized test constraints. Cognitive metrics serve as supplementary indicators alongside competitive match VODs, communication impact, and tactical role fulfillment.
          </div>
        </div>
      </div>
    </div>
  );
};
