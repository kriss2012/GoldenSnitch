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
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { RadarChart } from '../components/common/RadarChart';
import { scoutService } from '../services/scoutService';
import { formatPercent, formatCurrencyK } from '../utils/formatters';

export const PlayerProfilePage: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  const player = useMemo(() => {
    return playerId ? scoutService.getPlayerById(playerId) : undefined;
  }, [playerId]);

  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'situational' | 'role' | 'trajectory' | 'quality'>('overview');

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
      <div className="p-6 bg-surface border border-border rounded-panel flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-control bg-plum border border-violet flex items-center justify-center text-text font-heading text-2xl font-bold shrink-0">
            {player.handle.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text font-heading">
                {player.handle}
              </h1>
              <span className="px-2 py-0.5 rounded text-xs bg-void border border-border font-medium text-lilac">
                {player.game}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                player.availability === 'Available'
                  ? 'bg-success/15 text-success border border-success/30'
                  : 'bg-surface text-text-muted border border-border'
              }`}>
                {player.availability}
              </span>
            </div>

            <div className="text-xs text-text-muted mt-1.5 flex flex-wrap items-center gap-2">
              <span>{player.realName}</span>
              <span>·</span>
              <span>{player.role}</span>
              <span>·</span>
              <span>{player.nationality} ({player.region})</span>
              <span>·</span>
              <span>Age {player.age}</span>
              {player.team && (
                <>
                  <span>·</span>
                  <span className="text-text font-medium">{player.team}</span>
                </>
              )}
            </div>

            {/* Financial Details */}
            <div className="text-xs text-text-muted mt-2 flex items-center gap-4">
              <span>Est. Salary: <strong className="text-text">{formatCurrencyK(player.salaryK)}/yr</strong></span>
              <span>Buyout: <strong className="text-text">{player.buyoutUsd || 'None'}</strong></span>
            </div>
          </div>
        </div>

        {/* 48px Talent Index Display */}
        <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-border/50">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
              Player Talent Index
            </span>
            <div
              className="text-[48px] sm:text-[52px] leading-none font-extrabold font-heading text-text tracking-tight tabular-nums"
              aria-label={`Talent Index: ${player.talentIndex}`}
            >
              {animatedIndex.toFixed(1)}
            </div>
            <div className="mt-1 flex items-center justify-end gap-2">
              <ConfidenceBadge level={player.confidence} />
              <TrendIndicator trend={player.trend} />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                scoutService.addToWatchlist(player, 'Shortlisted');
                navigate('/watchlist');
              }}
            >
              <BookmarkPlus size={15} className="mr-1.5" />
              Shortlist
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/compare')}
            >
              <Scale size={15} className="mr-1.5" />
              Compare
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Exact Midnight Violet Underline pattern) */}
      <div className="border-b border-border flex items-center gap-2 overflow-x-auto select-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'matches', label: `Match history (${player.matchHistory?.length || 0})` },
          { id: 'situational', label: 'Situational analysis' },
          { id: 'role', label: 'Role evaluation' },
          { id: 'trajectory', label: 'Development trajectory' },
          { id: 'quality', label: 'Data quality' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors relative ${
              activeTab === tab.id
                ? 'text-text'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet" />
            )}
          </button>
        ))}
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
          </div>
        </div>
      )}

      {/* TAB 2: MATCH HISTORY */}
      {activeTab === 'matches' && (
        <Card title={`Competitive match logs (${player.matchHistory?.length || 0})`}>
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

      {/* TAB 5: DEVELOPMENT TRAJECTORY */}
      {activeTab === 'trajectory' && (
        <Card title="Performance trajectory over match sample" subtitle="Historical match ratings">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData.length ? trajectoryData : [{ match: 'M1', rating: 75 }, { match: 'M2', rating: 78 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3B1A55" />
                <XAxis dataKey="match" stroke="#B9A6CC" fontSize={12} />
                <YAxis domain={[50, 100]} stroke="#B9A6CC" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#120019', borderColor: '#3B1A55', borderRadius: '8px' }}
                  itemStyle={{ color: '#F3E8FF', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="rating" stroke="#892CDC" strokeWidth={2.5} dot={{ fill: '#892CDC', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
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
    </div>
  );
};
