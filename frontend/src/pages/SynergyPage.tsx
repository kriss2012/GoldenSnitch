import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  Shield,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { scoutService } from '../services/scoutService';
import { Player, Roster } from '../types';
import { RosterSynergyBreakdown } from '../components/common/charts/RosterSynergyBreakdown';


export const SynergyPage: React.FC = () => {
  const navigate = useNavigate();
  const rosters = useMemo(() => scoutService.getRosters(), []);
  const allPlayers = useMemo(() => scoutService.getPlayers(), []);

  // Selected Roster & Candidate for simulation
  const [selectedRosterId, setSelectedRosterId] = useState<string>(rosters[0]?.id || '');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('VAL-002'); // Mirage

  const currentRoster = useMemo(() => {
    return rosters.find(r => r.id === selectedRosterId) || rosters[0];
  }, [rosters, selectedRosterId]);

  // Filter candidates relevant to the current roster's game
  const availableCandidates = useMemo(() => {
    if (!currentRoster) return [];
    return allPlayers.filter(p => p.game === currentRoster.game);
  }, [allPlayers, currentRoster]);

  // Run simulation
  const simulationResult = useMemo(() => {
    if (!currentRoster || !selectedCandidateId) return null;
    return scoutService.simulateRosterRecruitment(currentRoster.id, selectedCandidateId);
  }, [currentRoster, selectedCandidateId]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            Squad synergy & recruitment simulator
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Simulate the impact of prospective acquisitions on squad chemistry, role balance, and win expectancy.
          </p>
        </div>

        <div className="p-2.5 bg-void border border-border rounded-control flex items-center gap-2 text-xs text-text-muted">
          <Info size={14} className="text-lilac shrink-0" />
          <span>Simulations reflect deterministic tactical models, not guaranteed outcomes.</span>
        </div>
      </div>

      {/* Simulator Controls Bar */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          {/* Target Roster */}
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Target competitive roster</label>
            <select
              value={selectedRosterId}
              onChange={(e) => {
                setSelectedRosterId(e.target.value);
                const r = rosters.find(x => x.id === e.target.value);
                const firstCand = allPlayers.find(p => p.game === r?.game);
                if (firstCand) setSelectedCandidateId(firstCand.id);
              }}
              className="w-full h-10 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none cursor-pointer"
            >
              {rosters.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.game}) · Synergy {r.synergyScore}%</option>
              ))}
            </select>
          </div>

          {/* Prospective Candidate */}
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1.5">Simulate signing candidate</label>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full h-10 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none cursor-pointer"
            >
              {availableCandidates.map(c => (
                <option key={c.id} value={c.id}>
                  {c.handle} ({c.role}) · Index {c.talentIndex} · {c.availability}
                </option>
              ))}
            </select>
          </div>

          {/* Quick preset switches (e.g. Mirage vs Voltz) */}
          {currentRoster?.game === 'VALORANT' && (
            <div className="flex gap-2">
              <Button
                variant={selectedCandidateId === 'VAL-002' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
                onClick={() => setSelectedCandidateId('VAL-002')}
              >
                Test Mirage (Fit 74.8)
              </Button>
              <Button
                variant={selectedCandidateId === 'VAL-003' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1"
                onClick={() => setSelectedCandidateId('VAL-003')}
              >
                Test Voltz (Decoy 49.3)
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Simulation Results Grid */}
      {simulationResult && (
        <div className="space-y-6">
          {/* Polished 5-Axis Synergy Breakdown */}
          <RosterSynergyBreakdown
            rosterName={currentRoster.name}
            game={currentRoster.game}
            synergyScore={simulationResult.currentSynergy}
            projectedScore={simulationResult.newSynergy}
            candidateHandle={simulationResult.candidate.handle}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Before vs After Metrics */}
          <div className="lg:col-span-5 space-y-4">
            <Card title="Synergy delta projection" variant="plum">
              <div className="grid grid-cols-2 gap-3 my-2">
                <div className="p-3 bg-void rounded-control border border-border">
                  <span className="text-[11px] text-text-muted block uppercase">Current Synergy</span>
                  <div className="text-3xl font-extrabold font-heading text-text mt-1">
                    {simulationResult.currentSynergy}%
                  </div>
                </div>

                <div className="p-3 bg-void rounded-control border border-border">
                  <span className="text-[11px] text-text-muted block uppercase">Projected Synergy</span>
                  <div className="text-3xl font-extrabold font-heading text-text mt-1 flex items-center gap-1.5">
                    <span>{simulationResult.newSynergy}%</span>
                    <span className={`text-sm ${simulationResult.synergyDelta >= 0 ? 'text-success' : 'text-danger'}`}>
                      ({simulationResult.synergyDelta >= 0 ? '+' : ''}{simulationResult.synergyDelta}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Win Rate Expectancy Delta */}
              <div className="p-3 bg-void rounded-control border border-border/80 mt-3 text-xs flex justify-between items-center">
                <span className="text-text-muted">Estimated match round win delta:</span>
                <span className={`font-mono font-bold text-sm ${simulationResult.winRateImpact >= 0 ? 'text-success' : 'text-danger'}`}>
                  {simulationResult.winRateImpact >= 0 ? '+' : ''}{simulationResult.winRateImpact}% per map
                </span>
              </div>

              {/* Role Coverage */}
              <div className="p-3 bg-void rounded-control border border-border/80 mt-3 text-xs flex justify-between items-center">
                <span className="text-text-muted">Squad role coverage:</span>
                <span className="font-mono font-bold text-text">
                  {simulationResult.roleCoverageBefore}% → <span className="text-success">{simulationResult.roleCoverageAfter}% (Complete)</span>
                </span>
              </div>
            </Card>

            {/* Financial Impact Card */}
            <Card title="Financial & payroll implications">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-void rounded-control border border-border">
                  <span className="text-text-muted text-[10px] block">Added Salary</span>
                  <strong className="text-text font-mono">${simulationResult.financialImpact.addedSalaryK}k</strong>
                </div>
                <div className="p-2.5 bg-void rounded-control border border-border">
                  <span className="text-text-muted text-[10px] block">Buyout Cost</span>
                  <strong className="text-text truncate block">{simulationResult.financialImpact.buyout}</strong>
                </div>
                <div className="p-2.5 bg-void rounded-control border border-border">
                  <span className="text-text-muted text-[10px] block">New Payroll</span>
                  <strong className="text-text font-mono">${simulationResult.financialImpact.newPayrollK}k</strong>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column (7 cols): Tactical Improvements & Remaining Weaknesses */}
          <div className="lg:col-span-7 space-y-4">
            <Card title="Tactical impact breakdown" subtitle={`Evaluating recruitment of ${simulationResult.candidate.handle} (${simulationResult.candidate.role})`}>
              <div className="space-y-4 text-xs">
                {/* Improved Factors */}
                <div>
                  <h4 className="font-semibold text-success uppercase text-[11px] mb-2 flex items-center gap-1.5">
                    <CheckCircle size={14} /> Tactical Improvements:
                  </h4>
                  <ul className="space-y-1.5 pl-2">
                    {simulationResult.improvedFactors.map((imp, idx) => (
                      <li key={idx} className="p-2 bg-void rounded border border-border text-text">
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Remaining Weaknesses */}
                <div>
                  <h4 className="font-semibold text-warning uppercase text-[11px] mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Remaining Risks / Weaknesses:
                  </h4>
                  <ul className="space-y-1.5 pl-2">
                    {simulationResult.remainingWeaknesses.map((weak, idx) => (
                      <li key={idx} className="p-2 bg-void rounded border border-border text-text-muted">
                        {weak}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Candidate Overview Snippet */}
                <div className="p-3 bg-surface rounded border border-border/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TalentBadge score={simulationResult.candidate.talentIndex} size="md" />
                    <div>
                      <span className="font-bold text-text text-sm">{simulationResult.candidate.handle}</span>
                      <div className="text-[11px] text-text-muted">{simulationResult.candidate.role} · {simulationResult.candidate.matchesPlayed} matches</div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/players/${simulationResult.candidate.id}`)}
                  >
                    View profile dossier
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
