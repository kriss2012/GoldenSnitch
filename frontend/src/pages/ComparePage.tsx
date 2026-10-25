import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowRight, AlertTriangle, Download, BookmarkPlus, Plus, X } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { RadarChart } from '../components/common/RadarChart';
import { PlayerAvatar } from '../components/common/PlayerAvatar';
import { RoleBadge } from '../components/common/RoleBadge';
import { ShortlistButton } from '../components/common/ShortlistButton';
import { scoutService } from '../services/scoutService';
import { Player } from '../types';
import { AcsComparisonChart } from '../components/common/charts/AcsComparisonChart';


export const ComparePage: React.FC = () => {
  const navigate = useNavigate();
  const allPlayers = useMemo(() => scoutService.getPlayers(), []);

  // Compare up to 3 candidate IDs (default: Mirage and Voltz)
  const [selectedIds, setSelectedIds] = useState<string[]>(['VAL-002', 'VAL-003']);

  const comparedPlayers = useMemo(() => {
    return selectedIds
      .map(id => allPlayers.find(p => p.id === id))
      .filter((p): p is Player => p !== undefined);
  }, [selectedIds, allPlayers]);

  // Check compatibility warning
  const hasGameMismatch = useMemo(() => {
    if (comparedPlayers.length < 2) return false;
    return new Set(comparedPlayers.map(p => p.game)).size > 1;
  }, [comparedPlayers]);

  const hasRoleMismatch = useMemo(() => {
    if (comparedPlayers.length < 2) return false;
    return new Set(comparedPlayers.map(p => p.role)).size > 1;
  }, [comparedPlayers]);

  // Combine factors for Radar Chart
  const radarData = useMemo(() => {
    if (comparedPlayers.length === 0) return [];
    const factorNames = Array.from(
      new Set(comparedPlayers.flatMap(p => p.factors.map(f => f.name)))
    );

    return factorNames.map(name => {
      const entry: { subject: string; [key: string]: any } = { subject: name.split(' ')[0] };
      comparedPlayers.forEach(p => {
        const found = p.factors.find(f => f.name === name);
        entry[p.handle] = found ? found.score : 50;
      });
      return entry;
    });
  }, [comparedPlayers]);

  // Preferred candidate evaluation
  const preferredCandidate = useMemo(() => {
    if (comparedPlayers.length === 0) return null;
    return [...comparedPlayers].sort((a, b) => b.talentIndex - a.talentIndex)[0];
  }, [comparedPlayers]);

  const handleAddCandidate = (id: string) => {
    if (selectedIds.length < 3 && !selectedIds.includes(id)) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveCandidate = (id: string) => {
    setSelectedIds(selectedIds.filter(x => x !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            Side-by-side player comparison
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Evaluate 2 to 3 candidate profiles simultaneously across role factors and tactical telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const rows = comparedPlayers.map(p => ({
                Handle: p.handle,
                Game: p.game,
                Role: p.role,
                TalentIndex: p.talentIndex,
                Confidence: p.confidence,
                Matches: p.matchesPlayed,
                PrimaryStrength: p.primaryStrength,
                Concern: p.keyConcern,
              }));
              scoutService.exportCSV('goldensnitch_candidate_comparison', rows);
            }}
          >
            <Download size={15} className="mr-1.5" />
            Export comparison
          </Button>
        </div>
      </div>

      {/* Warnings if mismatched game/role */}
      {(hasGameMismatch || hasRoleMismatch) && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-control flex items-start gap-2.5 text-xs text-warning">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Comparison notice:</strong> Selected candidates belong to different {hasGameMismatch ? 'game ecosystems' : 'competitive roles'}. Direct numerical normalization is role-dependent.
          </div>
        </div>
      )}

      {/* Candidate Selector Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {comparedPlayers.map((p, idx) => {
          const isTopPick = preferredCandidate?.id === p.id;
          return (
            <Card key={p.id} className="relative p-4 sm:p-5 border-[#353535] bg-[#1A1A1A] hover:border-[#82EAF4]/50 transition-all shadow-lg">
              <button
                onClick={() => handleRemoveCandidate(p.id)}
                className="absolute top-3 right-3 text-[#B8B8B8] hover:text-[#EF4444] p-1 rounded-lg hover:bg-[#252525] transition-colors"
                title="Remove candidate from comparison"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3">
                <PlayerAvatar
                  handle={p.handle}
                  role={p.role}
                  game={p.game}
                  rank={idx + 1}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5] font-heading truncate">
                      {p.handle}
                    </h3>
                    {isTopPick && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#82EAF4]/15 text-[#82EAF4] border border-[#82EAF4]/40 flex items-center gap-1">
                        ★ Top Pick
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <RoleBadge role={p.role} size="sm" />
                    <span className="text-xs text-[#9E9E9E] font-mono">{p.nationality}</span>
                  </div>
                </div>
              </div>

              {/* Metrics & Performance Trend */}
              <div className="mt-3.5 pt-3 border-t border-[#2E2E2E] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block font-medium">Talent Index</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <TalentBadge score={p.talentIndex} size="md" />
                    <ConfidenceBadge level={p.confidence} />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider block font-medium">Performance Trend</span>
                  <div className="mt-0.5">
                    <TrendIndicator trend={p.trend} />
                  </div>
                </div>
              </div>

              {/* Prominent Shortlist & Dossier Action */}
              <div className="mt-3.5 pt-3 border-t border-[#2E2E2E] flex items-center justify-between gap-2">
                <ShortlistButton player={p} size="sm" className="flex-1 justify-center" />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/players/${p.id}`)}
                  className="px-3 text-xs"
                >
                  Dossier <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </Card>
          );
        })}

        {selectedIds.length < 3 && (
          <Card className="border-dashed border-[#353535] bg-[#141414]/60 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs font-medium text-[#B8B8B8] mb-2.5">Add third candidate to comparison</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleAddCandidate(e.target.value);
              }}
              defaultValue=""
              className="h-9 px-3 bg-[#1A1A1A] border border-[#353535] rounded-xl text-xs text-[#F5F5F5] focus:border-[#82EAF4] outline-none cursor-pointer"
            >
              <option value="" disabled>Select candidate to compare...</option>
              {allPlayers
                .filter(p => !selectedIds.includes(p.id))
                .map(p => (
                  <option key={p.id} value={p.id}>{p.handle} ({p.game} - {p.role})</option>
                ))}
            </select>
          </Card>
        )}
      </div>

      {/* Radar Overlay & Preferred Candidate Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Overlay (6 cols) */}
        <div className="lg:col-span-6">
          <Card title="Multi-candidate competency radar" subtitle="Cyan (Primary) vs Muted Blue-Grey (Secondary) vs Neutral (Tertiary)">
            <RadarChart
              data={radarData}
              series={comparedPlayers.map((p, idx) => ({
                name: p.handle,
                dataKey: p.handle,
                color: idx === 0 ? '#82EAF4' : idx === 1 ? '#788B8D' : '#B8B8B8',
                isDashed: idx === 2,
              }))}
              height={300}
            />
          </Card>
        </div>

        {/* Strategic Recommendation Explanation (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {preferredCandidate && (
            <Card
              title="Strategic recommendation verdict"
              subtitle="Analytical justification based on roster gap coverage"
            >
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#353535]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#82EAF4] uppercase tracking-wider font-mono">
                      Preferred Pick: {preferredCandidate.handle}
                    </span>
                    <TalentBadge score={preferredCandidate.talentIndex} size="sm" />
                  </div>
                  <p className="mt-1 text-[#F5F5F5] leading-relaxed">
                    {preferredCandidate.handle} provides superior gap coverage with {preferredCandidate.primaryStrength.toLowerCase()}. 
                    Evaluated with {preferredCandidate.matchesPlayed} verified match sample.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-[#F5F5F5] uppercase">Candidate Trade-Off Analysis:</h4>
                  {comparedPlayers.map(p => (
                    <div key={p.id} className="p-2.5 bg-[#2B2B2B] rounded-xl border border-[#353535] text-[11px] space-y-1">
                      <div className="flex justify-between items-center font-bold text-[#F5F5F5]">
                        <span>{p.handle}</span>
                        <span className="font-mono text-[#82EAF4]">{p.talentIndex} Index</span>
                      </div>
                      <div className="text-[#82EAF4] font-medium">✓ {p.primaryStrength}</div>
                      <div className="text-[#788B8D] font-medium">⚠ {p.keyConcern}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Real Candidate Combat ACS & Performance Comparison */}
      {comparedPlayers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {comparedPlayers.map((p) => (
            <Card
              key={p.id}
              title={`${p.handle} · Combat ACS & Benchmark`}
              subtitle={`Match-by-match telemetry across ${p.matchHistory?.length || 5} LAN fixtures (${p.role})`}
            >
              <AcsComparisonChart
                matchHistory={p.matchHistory || []}
                roleBenchmark={p.role === 'Duelist' ? 250 : p.role === 'IGL' ? 195 : 220}
                playerHandle={p.handle}
                role={p.role}
                height={220}
              />
            </Card>
          ))}
        </div>
      )}

      {/* Side-by-Side Comparison Table */}
      <Card
        title="Full metric comparison table"
        subtitle="Leading benchmark values highlighted in electric cyan for rapid scanning"
      >
        {/* Mobile Swipe Notice */}
        <div className="sm:hidden flex items-center justify-between text-[11px] text-[#82EAF4] bg-[#142326] px-3.5 py-2 -mx-5 mb-3 border-b border-[#2A3F45]">
          <span>← Swipe horizontally to compare all candidate metrics →</span>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[650px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#353535] text-[#8E8E8E] uppercase text-[11px]">
                <th className="py-3 px-3 min-w-[180px]">Metric Dimension</th>
                {comparedPlayers.map((p, idx) => (
                  <th key={p.id} className="py-3 px-3 font-bold text-[#F5F5F5]">
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar handle={p.handle} role={p.role} game={p.game} rank={idx + 1} size="sm" />
                      <div>
                        <div className="text-sm font-bold text-[#F5F5F5]">{p.handle}</div>
                        <div className="mt-0.5">
                          <RoleBadge role={p.role} size="sm" />
                        </div>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2B2B]">
              <tr>
                <td className="py-3 px-3 font-medium text-[#B8B8B8]">Talent Index</td>
                {comparedPlayers.map(p => {
                  const isLeader = p.talentIndex === Math.max(...comparedPlayers.map(x => x.talentIndex));
                  return (
                    <td key={p.id} className="py-3 px-3">
                      <div className={`inline-flex items-center gap-1.5 p-1 rounded-lg ${isLeader ? 'bg-[#82EAF4]/15 border border-[#82EAF4]/40 px-2' : ''}`}>
                        <TalentBadge score={p.talentIndex} size="sm" />
                        {isLeader && <span className="text-[10px] font-bold text-[#82EAF4]">Leader</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#B8B8B8]">Evidence Confidence</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-3 px-3">
                    <ConfidenceBadge level={p.confidence} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#B8B8B8]">LAN Match Sample</td>
                {comparedPlayers.map(p => {
                  const isLeader = p.matchesPlayed === Math.max(...comparedPlayers.map(x => x.matchesPlayed));
                  return (
                    <td key={p.id} className="py-3 px-3">
                      <span className={`font-mono text-xs px-2 py-1 rounded-md ${isLeader ? 'bg-[#82EAF4]/15 text-[#82EAF4] border border-[#82EAF4]/30 font-bold' : 'text-[#B8B8B8]'}`}>
                        {p.matchesPlayed} matches {isLeader && '★'}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#B8B8B8]">Performance Trend</td>
                {comparedPlayers.map(p => {
                  const isLeader = p.trend === Math.max(...comparedPlayers.map(x => x.trend));
                  return (
                    <td key={p.id} className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <TrendIndicator trend={p.trend} />
                        {isLeader && <span className="text-[10px] text-[#82EAF4] font-mono font-bold">Top Trend</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#B8B8B8]">Clutch Conversion Rate</td>
                {comparedPlayers.map(p => {
                  const isLeader = p.situational.clutchRate === Math.max(...comparedPlayers.map(x => x.situational.clutchRate));
                  return (
                    <td key={p.id} className="py-3 px-3">
                      <span className={`font-mono font-bold text-xs px-2 py-1 rounded-md ${isLeader ? 'bg-[#82EAF4]/15 text-[#82EAF4] border border-[#82EAF4]/30' : 'text-[#F5F5F5]'}`}>
                        {p.situational.clutchRate}% {isLeader && '✓'}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#B8B8B8]">Shotcalling Impact</td>
                {comparedPlayers.map(p => {
                  const isLeader = p.situational.shotcallingImpact === Math.max(...comparedPlayers.map(x => x.situational.shotcallingImpact));
                  return (
                    <td key={p.id} className="py-3 px-3">
                      <span className={`font-mono font-bold text-xs px-2 py-1 rounded-md ${isLeader ? 'bg-[#C084FC]/20 text-[#C084FC] border border-[#C084FC]/40' : 'text-[#B8B8B8]'}`}>
                        {p.situational.shotcallingImpact}/100 {isLeader && '★'}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#B8B8B8]">Contract Availability</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-3 px-3 text-[#E0E0E0]">
                    <span className="px-2 py-0.5 rounded bg-[#202020] border border-[#333] text-[11px]">
                      {p.availability}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium text-[#B8B8B8]">Annual Salary</td>
                {comparedPlayers.map(p => {
                  const isLowest = p.salaryK === Math.min(...comparedPlayers.map(x => x.salaryK || 999));
                  return (
                    <td key={p.id} className="py-3 px-3">
                      <span className={`font-mono text-xs px-2 py-1 rounded-md ${isLowest ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-bold' : 'text-[#F5F5F5]'}`}>
                        ${p.salaryK}k {isLowest && '(Best Value)'}
                      </span>
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-[#1C1C1C]">
                <td className="py-3 px-3 font-semibold text-[#F5F5F5]">Shortlist &amp; Actions</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <ShortlistButton player={p} size="sm" />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/players/${p.id}`)}
                        className="px-2.5 py-1 text-xs"
                      >
                        Dossier
                      </Button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
