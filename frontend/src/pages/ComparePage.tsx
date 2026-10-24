import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowRight, AlertTriangle, Download, BookmarkPlus, Plus, X } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { RadarChart } from '../components/common/RadarChart';
import { scoutService } from '../services/scoutService';
import { Player } from '../types';

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
        {comparedPlayers.map((p, idx) => (
          <Card key={p.id} className="relative">
            <button
              onClick={() => handleRemoveCandidate(p.id)}
              className="absolute top-3 right-3 text-text-muted hover:text-text p-1"
              title="Remove candidate"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-violet' : idx === 1 ? 'bg-lilac' : 'bg-text-muted'}`} />
              <span className="text-xs font-semibold text-text-muted uppercase">Candidate {idx + 1}</span>
            </div>
            <h3 className="text-lg font-bold text-text font-heading">{p.handle}</h3>
            <div className="text-xs text-text-muted mt-0.5">{p.game} · {p.role}</div>
            <div className="mt-3 flex items-center justify-between">
              <TalentBadge score={p.talentIndex} size="lg" />
              <ConfidenceBadge level={p.confidence} />
            </div>
          </Card>
        ))}

        {selectedIds.length < 3 && (
          <Card className="border-dashed border-border/80 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-xs text-text-muted mb-2">Add third candidate to matrix</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleAddCandidate(e.target.value);
              }}
              defaultValue=""
              className="h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
            >
              <option value="" disabled>Select candidate...</option>
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
          <Card title="Multi-candidate competency radar" subtitle="Violet (Primary) vs Lilac (Secondary) vs Muted (Tertiary)">
            <RadarChart
              data={radarData}
              series={comparedPlayers.map((p, idx) => ({
                name: p.handle,
                dataKey: p.handle,
                color: idx === 0 ? '#892CDC' : idx === 1 ? '#BC6FF1' : '#B9A6CC',
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
              variant="plum"
            >
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-void rounded-control border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-lilac uppercase tracking-wider font-mono">
                      Preferred Pick: {preferredCandidate.handle}
                    </span>
                    <TalentBadge score={preferredCandidate.talentIndex} size="sm" />
                  </div>
                  <p className="mt-1 text-text leading-relaxed">
                    {preferredCandidate.handle} provides superior gap coverage with {preferredCandidate.primaryStrength.toLowerCase()}. 
                    Evaluated with {preferredCandidate.matchesPlayed} verified match sample.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-text uppercase">Candidate Trade-Off Analysis:</h4>
                  {comparedPlayers.map(p => (
                    <div key={p.id} className="p-2.5 bg-surface rounded border border-border/50 text-[11px] space-y-1">
                      <div className="flex justify-between items-center font-bold text-text">
                        <span>{p.handle}</span>
                        <span className="font-mono">{p.talentIndex} Index</span>
                      </div>
                      <div className="text-success font-medium">✓ {p.primaryStrength}</div>
                      <div className="text-warning font-medium">⚠ {p.keyConcern}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <Card title="Full metric comparison table">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[600px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted uppercase text-[11px]">
                <th className="py-2.5 px-3">Metric Dimension</th>
                {comparedPlayers.map(p => (
                  <th key={p.id} className="py-2.5 px-3 font-bold text-text">{p.handle}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <tr>
                <td className="py-2.5 px-3 font-medium text-text-muted">Talent Index</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-2.5 px-3">
                    <TalentBadge score={p.talentIndex} size="sm" />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-text-muted">Evidence Confidence</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-2.5 px-3">
                    <ConfidenceBadge level={p.confidence} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-text-muted">Match Sample Size</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-2.5 px-3 font-mono">{p.matchesPlayed}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-text-muted">Performance Trend</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-2.5 px-3">
                    <TrendIndicator trend={p.trend} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-text-muted">Clutch Conversion Rate</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-2.5 px-3 font-mono font-bold text-text">{p.situational.clutchRate}%</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-text-muted">Shotcalling Impact</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-2.5 px-3 font-mono font-bold text-lilac">{p.situational.shotcallingImpact}/100</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-text-muted">Contract Availability</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-2.5 px-3">{p.availability}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-text-muted">Annual Salary</td>
                {comparedPlayers.map(p => (
                  <td key={p.id} className="py-2.5 px-3 font-mono text-text">${p.salaryK}k</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
