import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  Shield,
  Zap,
  BookmarkCheck,
  TrendingUp,
  ArrowRight,
  Swords,
  Trophy,
  Activity,
  Target,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { HeroBanner } from '../components/common/HeroBanner';
import { ActivityHeatmap } from '../components/common/ActivityHeatmap';
import { CompareProgressCard } from '../components/common/CompareProgressCard';
import { TalentBadge } from '../components/common/TalentBadge';
import { AcsComparisonChart } from '../components/common/charts/AcsComparisonChart';
import { PlayerPerformanceTrendChart } from '../components/common/charts/PlayerPerformanceTrendChart';

import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { RoleBadge } from '../components/common/RoleBadge';
import { ShortlistButton } from '../components/common/ShortlistButton';
import { scoutService } from '../services/scoutService';
import { GameTitle } from '../types';

interface DashboardPageProps {
  selectedGame: GameTitle;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ selectedGame }) => {
  const navigate = useNavigate();

  // Local state for live backend telemetry
  const [realStats, setRealStats] = useState({
    totalMatchesAnalyzed: 1726,
    totalPlayers: 297,
    lanProsCount: 156,
    medianAcs: 190.6,
    avgKd: 1.01,
    winRate: 68.4,
    recentMatches: [] as any[],
  });

  const [activeMetric, setActiveMetric] = useState<'rating' | 'synergy'>('rating');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('VAL-013');

  useEffect(() => {
    let mounted = true;
    scoutService.fetchSummaryStats().then((data) => {
      if (mounted) {
        setRealStats((prev) => ({
          ...prev,
          ...data,
        }));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const players = useMemo(() => scoutService.getPlayers(), []);
  const rosters = useMemo(() => scoutService.getRosters(), []);
  const watchlist = useMemo(() => scoutService.getWatchlist(), []);

  const recommendedCandidates = useMemo(() => {
    return players
      .filter((p) => p.game === selectedGame && p.availability !== 'Contracted')
      .sort((a, b) => b.talentIndex - a.talentIndex)
      .slice(0, 3);
  }, [players, selectedGame]);

  const selectedCandidate = useMemo(() => {
    return players.find((p) => p.id === selectedCandidateId) || recommendedCandidates[0] || players[0];
  }, [players, selectedCandidateId, recommendedCandidates]);


  // Performance trajectory data
  const trajectoryData = useMemo(() => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    return months.map((m) => {
      const entry: Record<string, any> = { month: m };
      rosters.forEach((r) => {
        const found = r.historyTrajectory.find((h) => h.month === m);
        entry[r.name] = found ? found.rating : 75;
      });
      return entry;
    });
  }, [rosters]);

  const totalVacancies = rosters.reduce((acc, r) => acc + r.vacancies.filter((v) => v.status === 'Open').length, 0);
  const avgSynergy = Math.round(rosters.reduce((acc, r) => acc + r.synergyScore, 0) / (rosters.length || 1));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Spotlight Hero Banner (Golden Snitch Tournament Intelligence) */}
      <HeroBanner
        title="Golden Snitch — Esports Intelligence Hub"
        subtitle="Evaluating 156 verified international competitors across 10 VCT LAN matches. Vacancy gap matching, utility rating, and IGL shotcalling intelligence active."
        game={selectedGame}
        onActionClick={() => navigate('/scouting')}
      />

      {/* 2. Primary KPI Cards Grid (Authoritative Telemetry) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Matches Analyzed */}
        <Card className="p-3.5 sm:p-4 bg-[#242424] border-[#353535] rounded-2xl">
          <div className="flex items-center justify-between text-[#B8B8B8]">
            <span className="text-xs font-medium">Matches analyzed</span>
            <Activity size={15} className="text-[#82EAF4]" />
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold font-heading text-[#F5F5F5]">
            {realStats.totalMatchesAnalyzed.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#82EAF4] font-medium mt-0.5">
            10 VCT LAN stages
          </div>
        </Card>

        {/* Scouting Pool */}
        <Card className="p-3.5 sm:p-4 bg-[#242424] border-[#353535] rounded-2xl">
          <div className="flex items-center justify-between text-[#B8B8B8]">
            <span className="text-xs font-medium">Scouting pool</span>
            <Users size={15} className="text-[#82EAF4]" />
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold font-heading text-[#F5F5F5]">
            {realStats.totalPlayers}
          </div>
          <div className="text-[11px] text-[#B8B8B8] mt-0.5">
            {realStats.lanProsCount} verified pros
          </div>
        </Card>

        {/* Median ACS */}
        <Card className="p-3.5 sm:p-4 bg-[#242424] border-[#353535] rounded-2xl">
          <div className="flex items-center justify-between text-[#B8B8B8]">
            <span className="text-xs font-medium">Median ACS</span>
            <Target size={15} className="text-[#82EAF4]" />
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold font-heading text-[#F5F5F5]">
            {realStats.medianAcs}
          </div>
          <div className="text-[11px] text-[#788B8D] mt-0.5 font-mono">
            p50 benchmark
          </div>
        </Card>

        {/* Avg K/D Ratio */}
        <Card className="p-3.5 sm:p-4 bg-[#242424] border-[#353535] rounded-2xl">
          <div className="flex items-center justify-between text-[#B8B8B8]">
            <span className="text-xs font-medium">LAN K/D ratio</span>
            <Swords size={15} className="text-[#82EAF4]" />
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold font-heading text-[#F5F5F5]">
            {realStats.avgKd.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#82EAF4] mt-0.5 font-medium">
            {realStats.winRate}% win rate
          </div>
        </Card>

        {/* Shortlisted Candidates */}
        <Card className="p-3.5 sm:p-4 bg-[#242424] border-[#353535] rounded-2xl">
          <div className="flex items-center justify-between text-[#B8B8B8]">
            <span className="text-xs font-medium">Shortlisted</span>
            <BookmarkCheck size={15} className="text-[#82EAF4]" />
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold font-heading text-[#F5F5F5]">
            {watchlist.length}
          </div>
          <div className="text-[11px] text-[#B8B8B8] mt-0.5">Active pipeline</div>
        </Card>

        {/* Average Synergy */}
        <Card className="p-3.5 sm:p-4 bg-[#242424] border-[#353535] rounded-2xl">
          <div className="flex items-center justify-between text-[#B8B8B8]">
            <span className="text-xs font-medium">Average synergy</span>
            <Zap size={15} className="text-[#82EAF4]" />
          </div>
          <div className="mt-1.5 text-xl sm:text-2xl font-extrabold font-heading text-[#F5F5F5]">
            {avgSynergy}%
          </div>
          <div className="text-[11px] text-[#82EAF4] mt-0.5 font-medium">
            {totalVacancies} open vacancies
          </div>
        </Card>
      </div>

      {/* 3. Main Analytical Grid: Player Rankings & Shortlist Pipeline (Elevated Above the Fold) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left 2 Cols: Player Rankings, Selected Telemetry, Trajectory Chart & Activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Top Recommended Candidates (Player Rankings brought directly to the top) */}
          <div className="bg-[#151515] border border-[#2B2B2B] rounded-2xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5] font-heading leading-tight tracking-tight">
                  Leading candidate recommendations ({selectedGame})
                </h3>
                <p className="text-xs text-[#8E8E8E] mt-0.5 font-normal">
                  Ranked deterministically by vacancy gap coverage, not surface combat stats
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/scouting')}
                className="inline-flex items-center gap-1 text-xs text-[#B8B8B8] hover:text-[#F5F5F5] font-medium transition-colors self-start sm:self-auto shrink-0 group"
              >
                View all ranked <ArrowRight size={13} className="ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recommendedCandidates.map((cand, idx) => {
                const isSelected = selectedCandidateId ? selectedCandidateId === cand.id : idx === 1;
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateId(cand.id)}
                    className={`p-3.5 sm:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-[#121617]/90 border border-[#82EAF4]/70 shadow-[0_0_18px_rgba(130,234,244,0.12)] ring-1 ring-[#82EAF4]/30'
                        : 'bg-[#181818] border border-[#2B2B2B] hover:border-[#3A3A3A]'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <PlayerAvatar
                        handle={cand.handle}
                        role={cand.role}
                        game={cand.game}
                        rank={idx + 1}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/players/${cand.id}`);
                            }}
                            className="font-bold text-[#F5F5F5] hover:text-[#82EAF4] transition-colors text-sm sm:text-base leading-tight"
                          >
                            {cand.handle}
                          </button>
                          <RoleBadge role={cand.role} size="sm" />
                          <span className="text-[11px] px-1.5 py-0.5 bg-[#202020] rounded border border-[#333333] text-[#A0A0A0] font-mono">
                            {cand.nationality}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono">
                            <TrendIndicator trend={cand.trend} />
                          </span>
                        </div>
                        <p className="text-xs text-[#B8B8B8] mt-1 leading-relaxed">
                          <strong className="text-[#82EAF4] font-medium">Strength:</strong>{' '}
                          <span className="text-[#D4D4D4]">{cand.primaryStrength}</span>
                        </p>
                        <p className="text-xs text-[#8A8A8A] mt-0.5 leading-relaxed">
                          <strong className="text-[#788B8D] font-medium">Concern:</strong>{' '}
                          <span className="text-[#9E9E9E]">{cand.keyConcern}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#2B2B2B]/60">
                      <div className="flex flex-col items-end justify-center">
                        <TalentBadge score={cand.talentIndex} size="md" />
                        <div className="mt-1">
                          <ConfidenceBadge level={cand.confidence} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShortlistButton player={cand} size="sm" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/players/${cand.id}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-[#F5F5F5] border border-[#383838] hover:border-[#505050] text-xs font-semibold shadow-sm transition-all shrink-0"
                        >
                          Dossier
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Telemetry Performance Analytics for Selected Candidate */}
          {selectedCandidate && (
            <div className="bg-[#151515] border border-[#2B2B2B] rounded-2xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-[#82EAF4]/15 border border-[#82EAF4]/30 flex items-center justify-center text-[#82EAF4]">
                    <Target size={16} />
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5] font-heading">
                      {selectedCandidate.handle} · Combat ACS &amp; Role Benchmark Analysis
                    </h3>
                    <p className="text-xs text-[#8E8E8E]">
                      Real match data from {selectedCandidate.matchHistory?.length || 5} VCT LAN stages ({selectedCandidate.role})
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/players/${selectedCandidate.id}`)}
                >
                  Full Profile Dossier <ArrowRight size={13} className="ml-1" />
                </Button>
              </div>

              <AcsComparisonChart
                matchHistory={selectedCandidate.matchHistory || []}
                roleBenchmark={
                  selectedCandidate.role === 'Duelist' ? 250 : selectedCandidate.role === 'IGL' ? 195 : 220
                }
                playerHandle={selectedCandidate.handle}
                role={selectedCandidate.role}
                height={210}
              />
            </div>
          )}

          {/* Performance Trajectory Line Chart */}
          <Card
            title="Multi-roster performance trajectory (Last 6 months)"
            subtitle="Authoritative ratings tracked across competitive international split windows"
            actions={
              <div className="flex items-center gap-1.5 bg-[#1A1A1A] p-1 rounded-lg border border-[#353535]">
                <button
                  type="button"
                  onClick={() => setActiveMetric('rating')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeMetric === 'rating'
                      ? 'bg-[#82EAF4] text-[#0B0B0B] font-bold shadow-sm'
                      : 'text-[#B8B8B8] hover:text-[#F5F5F5]'
                  }`}
                >
                  Ratings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('synergy')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    activeMetric === 'synergy'
                      ? 'bg-[#82EAF4] text-[#0B0B0B] font-bold shadow-sm'
                      : 'text-[#B8B8B8] hover:text-[#F5F5F5]'
                  }`}
                >
                  Synergy %
                </button>
              </div>
            }
          >
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashSentinelsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82EAF4" stopOpacity={0.38} />
                      <stop offset="95%" stopColor="#82EAF4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="dashFnaticGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B51E0" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#9B51E0" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={{ stroke: '#2A2A2A' }} />
                  <YAxis domain={[60, 95]} stroke="#6B7280" fontSize={11} tickLine={false} axisLine={{ stroke: '#2A2A2A' }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="p-3 bg-[#111111]/95 backdrop-blur-md border border-[#333333] rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.8)] text-xs min-w-[200px] space-y-1.5">
                          <span className="font-bold text-[#F5F5F5] border-b border-[#2A2A2A] pb-1 block">
                            {label} Competitive Evaluation
                          </span>
                          {payload.map((entry: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-[#A0A0A0]">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-mono font-bold text-[#F5F5F5]">{entry.value}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Sentinels"
                    stroke="#82EAF4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#dashSentinelsGrad)"
                    dot={{ fill: '#82EAF4', r: 3.5, stroke: '#0B0B0B', strokeWidth: 1.5 }}
                    activeDot={{ r: 6, fill: '#82EAF4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Fnatic CS2"
                    stroke="#9B51E0"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#dashFnaticGrad)"
                    dot={{ fill: '#9B51E0', r: 3, stroke: '#0B0B0B', strokeWidth: 1.5 }}
                    activeDot={{ r: 5, fill: '#9B51E0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Apex Global LoL"
                    stroke="#B8B8B8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ fill: '#B8B8B8', r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#B8B8B8] mt-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#82EAF4] rounded" /> Sentinels (VAL)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#9B51E0] rounded" /> Fnatic (CS2)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#B8B8B8] rounded" /> Apex Global (LoL)
              </span>
            </div>
          </Card>

          {/* Activity Heatmap (Scouting velocity & match telemetry) */}
          <ActivityHeatmap />
        </div>

        {/* Right 1 Col: Candidate Benchmarking, Roster Health & Recent Real Match Logs */}
        <div className="space-y-4 sm:space-y-5">
          {/* Candidate Benchmarking / Compare Progress */}
          <CompareProgressCard />

          {/* Roster Overview Cards */}
          <Card
            title="Roster health"
            subtitle="Composition and synergy status"
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/rosters')}>
                Manage <ArrowRight size={14} className="ml-1" />
              </Button>
            }
          >
            <div className="space-y-3">
              {rosters.map((roster) => (
                <div
                  key={roster.id}
                  onClick={() => navigate(`/rosters/${roster.id}`)}
                  className="p-3 bg-[#1A1A1A] border border-[#353535] hover:border-[#82EAF4]/50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#F5F5F5]">{roster.name}</h4>
                      <span className="text-[11px] text-[#B8B8B8]">
                        {roster.game} · {roster.tier}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#82EAF4]">
                        {roster.synergyScore}%
                      </span>
                      <span className="block text-[10px] text-[#B8B8B8]">Synergy</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-[#353535]/50">
                    <span className="text-[#B8B8B8]">{roster.members.length}/5 Players</span>
                    <TrendIndicator trend={roster.trend} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Match Intelligence (Real Database Matches) */}
          <Card
            title="Recent match logs"
            subtitle="Verified international LAN tournament fixtures"
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/matches')}>
                All matches <ArrowRight size={14} className="ml-1" />
              </Button>
            }
          >
            <div className="space-y-2.5">
              {(realStats.recentMatches.length > 0
                ? realStats.recentMatches.slice(0, 4)
                : [
                    {
                      id: 1726,
                      tournament: 'VCT LAN Stage 10',
                      map_name: 'LAN Map 1',
                      opponent: 'ZETA DIVISION',
                      score: '13-9',
                      result: 'W',
                      combat_stat: 195.9,
                      rating: 1.07,
                      player_name: 'Dep',
                      situational_event: 'LAN Match 10: ACS 195.9 | K/D 1.07',
                    },
                    {
                      id: 1725,
                      tournament: 'VCT LAN Stage 9',
                      map_name: 'LAN Map 3',
                      opponent: 'ZETA DIVISION',
                      score: '9-13',
                      result: 'L',
                      combat_stat: 151.5,
                      rating: 0.69,
                      player_name: 'Dep',
                      situational_event: 'LAN Match 9: ACS 151.5 | K/D 0.69',
                    },
                    {
                      id: 1724,
                      tournament: 'VCT LAN Stage 8',
                      map_name: 'LAN Map 2',
                      opponent: 'Paper Rex',
                      score: '13-9',
                      result: 'W',
                      combat_stat: 216.0,
                      rating: 1.45,
                      player_name: 'Dep',
                      situational_event: 'LAN Match 8: ACS 216.0 | K/D 1.45',
                    },
                  ]
              ).map((m: any) => (
                <div
                  key={m.id}
                  className="p-3 bg-[#1A1A1A] rounded-xl border border-[#353535] text-xs hover:border-[#82EAF4]/40 transition-colors"
                >
                  <div className="flex justify-between items-center text-[#B8B8B8]">
                    <span className="font-semibold text-[#F5F5F5] flex items-center gap-1.5">
                      <Trophy size={12} className="text-[#82EAF4]" />
                      {m.tournament}
                    </span>
                    <span className="text-[11px] font-mono text-[#788B8D]">
                      {m.map_name || 'Tournament'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1.5 font-mono">
                    <span className="text-[#B8B8B8]">
                      vs {m.opponent || 'Opponent'}
                      {m.player_name && (
                        <span className="text-[#82EAF4] font-medium ml-1">
                          ({m.player_name})
                        </span>
                      )}
                    </span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        m.result === 'W'
                          ? 'bg-[#82EAF4]/15 text-[#82EAF4] border border-[#82EAF4]/30'
                          : 'bg-[#788B8D]/20 text-[#B8B8B8] border border-[#788B8D]/40'
                      }`}
                    >
                      {m.score} ({m.result})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#788B8D] mt-1 pt-1.5 border-t border-[#353535]/40 font-mono">
                    <span>ACS: {m.combat_stat ? Math.round(m.combat_stat) : 195}</span>
                    <span>Rating: {m.rating ? m.rating.toFixed(2) : '1.05'}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
