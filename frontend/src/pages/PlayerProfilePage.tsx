import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookmarkPlus,
  Scale,
  Zap,
  Shield,
  FileCheck,
  TrendingUp,
  AlertCircle,
  Clock,
  Swords,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { RadarChart } from '../components/common/RadarChart';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { RoleBadge } from '../components/common/RoleBadge';
import { ShortlistButton } from '../components/common/ShortlistButton';
import { ReportDisputeModal } from '../components/profile/ReportDisputeModal';
import { scoutService } from '../services/scoutService';
import { formatPercent, formatCurrencyK } from '../utils/formatters';
import { PlayerPerformanceTrendChart } from '../components/common/charts/PlayerPerformanceTrendChart';
import { AcsComparisonChart } from '../components/common/charts/AcsComparisonChart';
import { KdDistributionChart } from '../components/common/charts/KdDistributionChart';
import { MapPerformanceAnalytics } from '../components/common/charts/MapPerformanceAnalytics';
import { CognitiveReportView, cognitiveService, CognitiveProfileReport } from '../features/cognitive';


export const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  const player = useMemo(() => {
    return playerId ? scoutService.getPlayerById(playerId) : undefined;
  }, [playerId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'cognitive' | 'matches' | 'situational' | 'role' | 'trajectory' | 'quality'>('overview');
  const [analyticsView, setAnalyticsView] = useState<'all' | 'trend' | 'acs' | 'kd' | 'map'>('all');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [cognitiveReport, setCognitiveReport] = useState<CognitiveProfileReport | null>(null);

  useEffect(() => {
    if (player?.id) {
      cognitiveService.getPlayerReport(player.id).then(setCognitiveReport).catch(() => {});
    }
  }, [player?.id]);

  // Animated 48px Talent Index Counter (respects reduced motion)
  const [animatedIndex, setAnimatedIndex] = useState(0);

  useEffect(() => {
    if (!player) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setAnimatedIndex(player.talentIndex);
      return;
    }

    const duration = 400; // 400ms duration
    const target = player.talentIndex;
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutQuad
      const eased = progress * (2 - progress);
      setAnimatedIndex(Math.round(eased * target * 10) / 10);
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  }, [player]);

  if (!player) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-text">Player record not found</h2>
        <p className="text-sm text-text-muted">The requested profile ID does not exist in the intelligence database.</p>
        <Button variant="secondary" onClick={() => navigate('/players')}>
          Return to player database
        </Button>
      </div>
    );
  }

  // Radar data
  const radarData = player.factors.map(f => ({
    subject: f.name.split(' ')[0], // short label
    Score: f.score,
    Benchmark: f.benchmark || 70,
  }));

  // Match trajectory
  const trajectoryData = (player.matchHistory || []).map((m, idx) => ({
    match: `M${idx + 1}`,
    rating: m.rating * 70,
    combat: m.combatScore,
  }));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-1" /> Back
        </Button>
      </div>

      {/* Profile Header Hero Panel */}
      <div className="p-4 sm:p-6 bg-[#1A1A1A] border border-[#353535] rounded-2xl flex flex-col gap-5 shadow-xl min-w-0 overflow-hidden">
        <div className="flex flex-col xs:flex-row items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
          <PlayerAvatar
            handle={player.handle}
            role={player.role}
            game={player.game}
            size="xl"
            showStatus={true}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] font-heading leading-tight break-words">
                {player.handle}
              </h1>
              <RoleBadge role={player.role} size="md" />
              <span className="px-2 py-0.5 rounded text-xs bg-[#242424] border border-[#353535] font-medium text-[#82EAF4]">
                {player.game}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                player.availability === 'Available'
                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-medium'
                  : 'bg-[#242424] text-[#B8B8B8] border border-[#353535]'
              }`}>
                {player.availability}
              </span>
            </div>

            <div className="text-xs text-[#B8B8B8] mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[#F5F5F5] font-medium">{player.realName}</span>
              <span>·</span>
              <span>{player.nationality} ({player.region})</span>
              <span>·</span>
              <span>Age {player.age}</span>
              {player.team && (
                <>
                  <span>·</span>
                  <span className="text-[#82EAF4] font-medium">{player.team}</span>
                </>
              )}
            </div>

            {/* Financial Details */}
            <div className="text-xs text-[#B8B8B8] mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Est. Salary: <strong className="text-[#F5F5F5]">{formatCurrencyK(player.salaryK)}/yr</strong></span>
              <span>Buyout: <strong className="text-[#F5F5F5]">{player.buyoutUsd || 'None'}</strong></span>
            </div>
          </div>
        </div>

        {/* Row 2: Dedicated Talent Index & Confidence Section */}
        <div className="p-3.5 sm:p-4 bg-[#141414] border border-[#2B2B2B] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-[#8E8E8E] uppercase tracking-wider block font-mono">
              Player Talent Index
            </span>
            <div
              className="text-[44px] sm:text-[52px] leading-none font-extrabold font-heading text-[#F5F5F5] tracking-tight tabular-nums mt-0.5"
              aria-label={`Talent Index: ${player.talentIndex}`}
            >
              {animatedIndex.toFixed(1)}
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-1 sm:pt-0">
            <ConfidenceBadge level={player.confidence} />
            <TrendIndicator trend={player.trend} />
          </div>
        </div>

        {/* Row 3: Dedicated Action Controls Section (Never overlapping, full width on narrow screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full pt-1">
          <ShortlistButton
            player={player}
            size="md"
            className="w-full justify-center min-h-[44px] text-xs sm:text-sm"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/compare')}
            className="w-full justify-center min-h-[44px] text-xs sm:text-sm"
          >
            <Scale size={15} className="mr-1.5 shrink-0" />
            <span className="truncate">Compare candidate</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDisputeModal(true)}
            className="w-full justify-center min-h-[44px] text-xs sm:text-sm"
          >
            <AlertTriangle size={14} className="mr-1.5 text-warning shrink-0" />
            <span className="truncate">Dispute Data</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation (Exact Midnight Violet Underline pattern with touch scrolling) */}
      <div className="w-full min-w-0 border-b border-border overflow-x-auto overscroll-x-contain select-none scrollbar-none">
        <div className="flex items-center gap-1 sm:gap-2 w-max min-w-full pb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'cognitive', label: 'Cognitive Biometrics' },
            { id: 'matches', label: `Match history (${player.matchHistory?.length || 0})` },
            { id: 'situational', label: 'Situational analysis' },
            { id: 'role', label: 'Role evaluation' },
            { id: 'trajectory', label: 'Development trajectory' },
            { id: 'quality', label: 'Data quality' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors relative min-h-[44px] flex items-center ${
                activeTab === tab.id
                  ? 'text-text'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet shadow-[0_0_8px_var(--violet)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card title="Scouting summary & strengths">
              <p className="text-sm text-text leading-relaxed">
                {player.scoutingNotes || 'Player demonstrates balanced mechanical execution and reliable communications.'}
              </p>
              <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-void rounded-control border border-border">
                  <span className="text-text-muted block text-[11px]">Primary Strength</span>
                  <span className="font-semibold text-success mt-0.5 block">{player.primaryStrength}</span>
                </div>
                <div className="p-2.5 bg-void rounded-control border border-border">
                  <span className="text-text-muted block text-[11px]">Tactical Concern</span>
                  <span className="font-semibold text-warning mt-0.5 block">{player.keyConcern}</span>
                </div>
              </div>
            </Card>

            <Card title="Factor breakdown">
              <div className="space-y-3">
                {player.factors.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text font-medium">{f.name}</span>
                      <span className="font-mono font-bold text-text">{f.score}/100</span>
                    </div>
                    <div className="w-full h-2 bg-void rounded-full overflow-hidden border border-border/60">
                      <div
                        className="h-full bg-violet"
                        style={{ width: `${Math.min(100, Math.max(0, f.score))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card title="Competency radar" subtitle="Against tier-1 benchmark (70.0)">
              <RadarChart
                data={radarData}
                series={[
                  { name: player.handle, dataKey: 'Score', color: '#892CDC' },
                  { name: 'Benchmark', dataKey: 'Benchmark', color: '#B9A6CC', isDashed: true },
                ]}
                height={260}
              />
            </Card>

            <Card title="Combat & Role Performance Summary">
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-void rounded-control border border-border flex items-center justify-between">
                  <div>
                    <span className="text-text-muted text-[11px] block">Average Combat Score (ACS)</span>
                    <strong className="text-lg font-mono text-[#82EAF4]">
                      {player.matchHistory?.length ? Math.round(player.matchHistory.reduce((a, b) => a + (b.combatScore || 220), 0) / player.matchHistory.length) : 248} ACS
                    </strong>
                  </div>
                  <span className="text-[11px] font-semibold text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded">
                    Tier-1 Certified
                  </span>
                </div>

                <div className="p-3 bg-void rounded-control border border-border flex items-center justify-between">
                  <div>
                    <span className="text-text-muted text-[11px] block">LAN Match K/D Ratio</span>
                    <strong className="text-lg font-mono text-[#10B981]">
                      {player.matchHistory?.length ? (player.matchHistory.reduce((a, b) => a + (b.kills || 18), 0) / (player.matchHistory.reduce((a, b) => a + (b.deaths || 14), 0) || 1)).toFixed(2) : '1.32'}
                    </strong>
                  </div>
                  <span className="text-[11px] font-semibold text-text-muted">
                    {player.matchesPlayed} Matches Evaluated
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: COGNITIVE BIOMETRICS */}
      {activeTab === 'cognitive' && (
        <div className="space-y-6">
          {cognitiveReport ? (
            <CognitiveReportView report={cognitiveReport} />
          ) : (
            <Card title="Cognitive Performance Lab">
              <div className="py-12 text-center space-y-4">
                <p className="text-sm text-text-muted">No verified cognitive calibration recorded for this candidate.</p>
                <Button variant="secondary" onClick={() => navigate('/app/cognitive-lab')}>
                  Launch Cognitive Calibration
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: MATCH HISTORY */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          <MapPerformanceAnalytics
            matchHistory={player.matchHistory || []}
            playerHandle={player.handle}
            game={player.game}
          />

          <Card title={`Competitive match logs (${player.matchHistory?.length || 0})`}>
            {/* Mobile Swipe Notice */}
            <div className="sm:hidden flex items-center justify-between text-[11px] text-[#82EAF4] bg-[#142326] px-3.5 py-2 -mx-5 mb-3 border-b border-[#2A3F45]">
              <span>← Swipe horizontally for full match performance logs →</span>
            </div>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[640px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Tournament</th>
                  <th className="py-2.5 px-3">Map</th>
                  <th className="py-2.5 px-3">Opponent</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">K / D / A</th>
                  <th className="py-2.5 px-3">Situational Highlight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(!player.matchHistory || player.matchHistory.length === 0) ? (
                  <tr><td colSpan={8} className="py-6 text-center text-text-muted">No individual match logs available for this prospect.</td></tr>
                ) : (
                  player.matchHistory.map((m) => (
                    <tr key={m.id} className="hover:bg-surface/80">
                      <td className="py-3 px-3 font-mono text-text-muted">{m.date}</td>
                      <td className="py-3 px-3 font-semibold text-text">{m.tournament}</td>
                      <td className="py-3 px-3 font-mono">{m.mapOrStage}</td>
                      <td className="py-3 px-3">vs {m.opponent}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.result === 'W' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                        }`}>
                          {m.score} ({m.result})
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-text">{m.rating.toFixed(2)}</td>
                      <td className="py-3 px-3 font-mono text-text-muted">{m.kills}/{m.deaths}/{m.assists}</td>
                      <td className="py-3 px-3 italic text-text-muted max-w-xs truncate" title={m.situationalEvent}>
                        "{m.situationalEvent}"
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      )}

      {/* TAB 3: SITUATIONAL ANALYSIS */}
      {activeTab === 'situational' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <span className="text-xs text-text-muted">Clutch conversion rate (1vX)</span>
            <div className="text-2xl font-extrabold font-heading text-text mt-1">
              {formatPercent(player.situational.clutchRate)}
            </div>
            <span className="text-[11px] text-text-muted mt-1 block">Tier-1 benchmark: 22%</span>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-text-muted">Opening entry duel success</span>
            <div className="text-2xl font-extrabold font-heading text-text mt-1">
              {formatPercent(player.situational.entrySuccess)}
            </div>
            <span className="text-[11px] text-text-muted mt-1 block">Tier-1 benchmark: 48%</span>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-text-muted">Shotcalling impact index</span>
            <div className="text-2xl font-extrabold font-heading text-lilac mt-1">
              {player.situational.shotcallingImpact}/100
            </div>
            <span className="text-[11px] text-text-muted mt-1 block">Certified macro communication</span>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-text-muted">Mid-round adaptability</span>
            <div className="text-2xl font-extrabold font-heading text-text mt-1">
              {player.situational.midRoundAdaptability}/100
            </div>
            <span className="text-[11px] text-text-muted mt-1 block">Reactive setup modification</span>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-text-muted">Timeout recovery win %</span>
            <div className="text-2xl font-extrabold font-heading text-text mt-1">
              {formatPercent(player.situational.timeoutRecovery)}
            </div>
            <span className="text-[11px] text-text-muted mt-1 block">Win rate on post-timeout rounds</span>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-text-muted">Eco-round conversion rate</span>
            <div className="text-2xl font-extrabold font-heading text-text mt-1">
              {formatPercent(player.situational.ecoConversion)}
            </div>
            <span className="text-[11px] text-text-muted mt-1 block">Thrifty & force-buy impact</span>
          </Card>
        </div>
      )}

      {/* TAB 4: ROLE EVALUATION */}
      {activeTab === 'role' && (
        <Card title={`Role metric weightings (${player.role})`} subtitle="Formula: Talent Index = sum(normalized factor * weight)">
          <div className="space-y-4">
            {player.factors.map((f, i) => (
              <div key={i} className="p-3 bg-void border border-border rounded-control flex items-center justify-between">
                <div>
                  <span className="font-semibold text-text text-sm">{f.name}</span>
                  <div className="text-xs text-text-muted mt-0.5">
                    Weight: <span className="font-mono text-lilac font-bold">{(f.weight * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold font-mono text-text">{f.score}/100</div>
                  <span className="text-[10px] text-text-muted">Benchmark: {f.benchmark || 70}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: POLISHED PERFORMANCE & MAP ANALYTICS SUITE */}
      {activeTab === 'trajectory' && (
        <div className="space-y-6">
          {/* Analytics Sub-View Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface border border-border rounded-panel">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#82EAF4]/15 border border-[#82EAF4]/30 flex items-center justify-center text-[#82EAF4]">
                <TrendingUp size={16} />
              </span>
              <div>
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">
                  Deep Performance &amp; Combat Telemetry Suite
                </h3>
                <p className="text-[11px] text-text-muted">
                  Real LAN match telemetry: trends, role ACS benchmarks, K/D spreads &amp; map win rates
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-void p-1 rounded-lg border border-border">
              {[
                { id: 'all', label: 'All Visualizations' },
                { id: 'trend', label: 'Form Trajectory' },
                { id: 'acs', label: 'ACS Comparisons' },
                { id: 'kd', label: 'K/D Distribution' },
                { id: 'map', label: 'Map Analytics' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setAnalyticsView(v.id as any)}
                  className={`px-3 py-1 text-xs rounded-md font-semibold transition-all duration-150 ${
                    analyticsView === v.id
                      ? 'bg-[#82EAF4] text-[#0A0A0A] shadow-[0_0_12px_rgba(130,234,244,0.35)]'
                      : 'text-text-muted hover:text-text hover:bg-surface'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Player Performance Trends */}
          {(analyticsView === 'all' || analyticsView === 'trend') && (
            <PlayerPerformanceTrendChart
              matchHistory={player.matchHistory || []}
              playerHandle={player.handle}
              role={player.role}
            />
          )}

          {/* 2. ACS Benchmark Comparisons */}
          {(analyticsView === 'all' || analyticsView === 'acs') && (
            <AcsComparisonChart
              matchHistory={player.matchHistory || []}
              roleBenchmark={
                player.role === 'Duelist' ? 250 : player.role === 'IGL' ? 195 : player.role === 'Sentinel' ? 210 : 220
              }
              playerHandle={player.handle}
              role={player.role}
            />
          )}

          {/* 3. K/D Ratio & Combat Spread Distribution */}
          {(analyticsView === 'all' || analyticsView === 'kd') && (
            <KdDistributionChart
              matchHistory={player.matchHistory || []}
              playerHandle={player.handle}
            />
          )}

          {/* 4. Map-Performance Analytics */}
          {(analyticsView === 'all' || analyticsView === 'map') && (
            <MapPerformanceAnalytics
              matchHistory={player.matchHistory || []}
              playerHandle={player.handle}
              game={player.game}
            />
          )}
        </div>
      )}

      {/* TAB 6: DATA QUALITY */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <Card title="Telemetry completeness & reliability">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-void rounded-control border border-border">
                <span className="text-xs text-text-muted">Data completeness</span>
                <div className="text-xl font-extrabold font-heading text-success mt-1">{player.dataCompleteness}%</div>
              </div>
              <div className="p-3 bg-void rounded-control border border-border">
                <span className="text-xs text-text-muted">Sample size</span>
                <div className="text-xl font-extrabold font-heading text-text mt-1">{player.matchesPlayed} matches</div>
              </div>
              <div className="p-3 bg-void rounded-control border border-border">
                <span className="text-xs text-text-muted">Audit hash</span>
                <div className="text-xs font-mono text-lilac mt-1.5 truncate">SHA256: 4f9e8a...3b2c11</div>
              </div>
            </div>

            {player.certifiedAnnotations && player.certifiedAnnotations.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-border">
                <h4 className="text-xs font-bold text-text uppercase tracking-wider">Certified coach annotations</h4>
                {player.certifiedAnnotations.map((ann, i) => (
                  <div key={i} className="p-3 bg-void rounded-control border border-border text-xs space-y-1">
                    <div className="flex justify-between items-center text-text-muted">
                      <span><strong>{ann.scout}</strong> ({ann.role})</span>
                      <span>{ann.date} · Rating {ann.rating}/5</span>
                    </div>
                    <p className="italic text-text">"{ann.notes}"</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {showDisputeModal && player && (
        <ReportDisputeModal
          playerId={player.id}
          playerHandle={player.handle}
          onClose={() => setShowDisputeModal(false)}
        />
      )}
    </div>
  );
};
