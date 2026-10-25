import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Download,
  Scale,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  BookmarkPlus,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { scoutService } from '../services/scoutService';
import { api } from '../services/apiClient';
import { GameTitle, Player, VacancyFilter } from '../types';

interface ScoutingPageProps {
  selectedGame: GameTitle;
  onSelectGame: (g: GameTitle) => void;
}

export const ScoutingPage: React.FC<ScoutingPageProps> = ({ selectedGame, onSelectGame }) => {
  const navigate = useNavigate();
  const rosters = useMemo(() => scoutService.getRosters(), []);

  // Filter state
  const [filter, setFilter] = useState<VacancyFilter>({
    game: selectedGame,
    rosterId: rosters.find(r => r.game === selectedGame)?.id || rosters[0].id,
    role: selectedGame === 'VALORANT' ? 'Controller' : selectedGame === 'Counter-Strike 2' ? 'Entry Fragger' : 'Jungler',
    region: 'All',
    availability: 'All',
    minMatches: 10,
    desiredStrengths: ['Utility delay', 'Shotcalling'],
    preferredPlaystyle: 'Disciplined Macro',
    riskTolerance: 'Balanced',
  });

  const [searchHandle, setSearchHandle] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(['VAL-002', 'VAL-003']);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Sync selected game with filter
  React.useEffect(() => {
    setFilter(prev => ({
      ...prev,
      game: selectedGame,
      rosterId: rosters.find(r => r.game === selectedGame)?.id || rosters[0].id,
      role: selectedGame === 'VALORANT' ? 'Controller' : selectedGame === 'Counter-Strike 2' ? 'Entry Fragger' : 'Jungler',
    }));
  }, [selectedGame, rosters]);

  // Execute ranking
  const rankedCandidates = useMemo(() => {
    let list = scoutService.rankPlayers(filter);
    if (searchHandle.trim()) {
      const q = searchHandle.toLowerCase();
      list = list.filter(p => p.handle.toLowerCase().includes(q) || p.realName.toLowerCase().includes(q));
    }
    return list;
  }, [filter, searchHandle]);

  // Leading candidate explanation
  const topCandidate = rankedCandidates[0];
  const explanation = useMemo(() => {
    if (!topCandidate) return null;
    return scoutService.getRecommendation(topCandidate.id, filter.role);
  }, [topCandidate, filter.role]);

  // Role options per game
  const roleOptions = useMemo(() => {
    switch (filter.game) {
      case 'VALORANT':
        return ['Controller', 'Duelist', 'Initiator', 'Sentinel', 'IGL'];
      case 'Counter-Strike 2':
        return ['Entry Fragger', 'AWPer', 'Support', 'Lurker', 'IGL'];
      case 'League of Legends':
        return ['Top Laner', 'Jungler', 'Mid Laner', 'ADC', 'Support'];
      case 'Dota 2':
        return ['Carry', 'Mid', 'Offlane', 'Support', 'Hard Support'];
      case 'Apex Legends':
      default:
        return ['Fragger', 'Anchor', 'Recon', 'Support'];
    }
  }, [filter.game]);

  const handleToggleSelect = (id: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const handleExportCSV = () => {
    const exportRows = rankedCandidates.map((c, idx) => ({
      Rank: idx + 1,
      Handle: c.handle,
      Game: c.game,
      Role: c.role,
      TalentIndex: c.talentIndex,
      Confidence: c.confidence,
      Matches: c.matchesPlayed,
      Trend: c.trend,
      PrimaryStrength: c.primaryStrength,
      Availability: c.availability,
    }));
    scoutService.exportCSV(`goldensnitch_ranked_${filter.game}_${filter.role}`, exportRows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            Talent scouting workspace
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Configure vacancy requirements, rank eligible candidates, and inspect transparent evidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            title="Export candidate list as CSV"
          >
            <Download size={15} className="mr-1.5" />
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/compare')}
            disabled={selectedCandidates.length < 2}
          >
            <Scale size={15} className="mr-1.5" />
            Compare ({selectedCandidates.length})
          </Button>
        </div>
      </div>

      {/* PRD §10.3 Worked Example Banner for Sentinels Controller */}
      {filter.game === 'VALORANT' && filter.role === 'Controller' && (
        <div className="p-4 bg-gradient-to-r from-[#181818] via-[#222222] to-[#181818] border border-[#353535] hover:border-cyan/40 rounded-panel relative overflow-hidden shadow-lg transition-colors">
          {/* Subtle Left Accent Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan via-gold to-cyan" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 pl-2">
              <span className="w-9 h-9 rounded-xl bg-cyan/15 border border-cyan/30 text-cyan flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_12px_rgba(130,234,244,0.25)]">
                <Sparkles size={18} />
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan font-mono">
                    [ PRD §10.3 CASE STUDY · VACANCY GAP ANALYSIS ]
                  </span>
                  <span className="px-2 py-0.5 bg-gold/15 text-gold border border-gold/40 text-[10px] rounded font-mono font-bold">
                    Deterministic
                  </span>
                </div>
                <h3 className="text-sm font-bold text-textPrimary font-heading flex items-center gap-2">
                  <span>Mirage (Fit 74.8) vs Voltz Decoy (Fit 49.3)</span>
                </h3>
                <p className="text-xs text-textSecondary leading-relaxed max-w-4xl">
                  Sentinels suffers from a severe <strong className="text-rose-400 font-semibold font-mono">Utility deficit (35 vs 70 target)</strong> left by incumbent Kairo. 
                  While <strong className="text-textPrimary font-semibold">Voltz</strong> leads surface combat leaderboards with 285 raw ACS, his Utility score is merely 30. 
                  Golden Snitch ranks <strong className="text-cyan font-bold font-mono">Mirage #1</strong> because Mirage covers 100% of the Utility gap (80 rating) and brings certified Tier-1 IGL calling!
                </p>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex sm:flex-col gap-2 shrink-0 sm:text-right pl-14 sm:pl-0">
              <div className="px-2.5 py-1 rounded bg-[#142A2E] border border-cyan/40 text-[11px] font-mono text-cyan">
                <span className="text-textDim text-[10px] block sm:inline mr-1">Gap Coverage:</span>
                <b>100% (80 Utl)</b>
              </div>
              <div className="px-2.5 py-1 rounded bg-[#2A2314] border border-gold/40 text-[11px] font-mono text-gold">
                <span className="text-textDim text-[10px] block sm:inline mr-1">Leadership:</span>
                <b>Tier-1 Certified</b>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Vacancy Configuration Panel */}
        <div className="lg:col-span-4 space-y-4">
          <Card
            title={
              <div className="flex items-center justify-between w-full">
                <span>Vacancy configuration</span>
                <button
                  onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                  className="lg:hidden p-1 text-text-muted hover:text-text"
                >
                  {showFiltersMobile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            }
            subtitle="Configure role requirements and team weights"
          >
            <div className={`space-y-4 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
              {/* Game Title */}
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Esports title</label>
                <select
                  value={filter.game}
                  onChange={(e) => {
                    const g = e.target.value as GameTitle;
                    onSelectGame(g);
                  }}
                  className="w-full h-9 px-3 bg-charcoal-main border border-charcoal-border rounded-control text-xs text-textPrimary focus:border-cyan outline-none transition-colors"
                >
                  <option value="VALORANT">VALORANT</option>
                  <option value="Counter-Strike 2">Counter-Strike 2</option>
                  <option value="League of Legends">League of Legends</option>
                  <option value="Dota 2">Dota 2</option>
                  <option value="Apex Legends">Apex Legends</option>
                </select>
              </div>

              {/* Target Roster */}
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Target roster</label>
                <select
                  value={filter.rosterId}
                  onChange={(e) => setFilter(prev => ({ ...prev, rosterId: e.target.value }))}
                  className="w-full h-9 px-3 bg-charcoal-main border border-charcoal-border rounded-control text-xs text-textPrimary focus:border-cyan outline-none transition-colors"
                >
                  {rosters
                    .filter(r => r.game === filter.game)
                    .map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.tier})</option>
                    ))}
                </select>
              </div>

              {/* Vacancy Role */}
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Vacancy role</label>
                <select
                  value={filter.role}
                  onChange={(e) => setFilter(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full h-9 px-3 bg-charcoal-main border border-charcoal-border rounded-control text-xs text-textPrimary focus:border-cyan outline-none transition-colors"
                >
                  {roleOptions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Region</label>
                  <select
                    value={filter.region}
                    onChange={(e) => setFilter(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full h-9 px-2.5 bg-charcoal-main border border-charcoal-border rounded-control text-xs text-textPrimary focus:border-cyan outline-none transition-colors"
                  >
                    <option value="All">All regions</option>
                    <option value="Americas">Americas</option>
                    <option value="EMEA">EMEA / Europe</option>
                    <option value="LCK">LCK / Asia</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-text-muted block mb-1">Availability</label>
                  <select
                    value={filter.availability}
                    onChange={(e) => setFilter(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full h-9 px-2.5 bg-charcoal-main border border-charcoal-border rounded-control text-xs text-textPrimary focus:border-cyan outline-none transition-colors"
                  >
                    <option value="All">All contracts</option>
                    <option value="Available">Free agents only</option>
                    <option value="Contracted">Contracted buyout</option>
                  </select>
                </div>
              </div>

              {/* Minimum Matches Requirement */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-text-muted">Minimum matches analyzed</span>
                  <span className="font-mono font-bold text-textPrimary">{filter.minMatches}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={filter.minMatches}
                  onChange={(e) => setFilter(prev => ({ ...prev, minMatches: parseInt(e.target.value) }))}
                  className="w-full accent-cyan"
                />
                <span className="text-[11px] text-text-muted/70 block mt-0.5">
                  Fewer than 10 matches flagged as Low Confidence
                </span>
              </div>

              {/* Risk Tolerance */}
              <div>
                <label className="text-xs font-medium text-text-muted block mb-1">Recruitment risk tolerance</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-charcoal-main rounded-control border border-charcoal-border">
                  {(['Low', 'Balanced', 'High'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFilter(prev => ({ ...prev, riskTolerance: lvl }))}
                      className={`text-xs py-1.5 rounded-control font-semibold transition-all ${
                        filter.riskTolerance === lvl
                          ? 'bg-cyan text-charcoal-main shadow-[0_0_10px_rgba(130,234,244,0.3)]'
                          : 'text-text-muted hover:text-textPrimary'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant="primary"
                className="w-full mt-2"
                onClick={() => {
                  setFilter({ ...filter });
                  // Seal decision snapshot in backend SQLite database
                  const rid = filter.game === 'VALORANT' ? 4 : filter.game === 'Counter-Strike 2' ? 5 : 1;
                  api.post('/api/v1/scouting/rank', {
                    roster_id: rid,
                    role: filter.role,
                    top_n: 10,
                    min_matches: filter.minMatches,
                  }).catch(() => {});
                }}
              >
                <SlidersHorizontal size={15} className="mr-2" />
                Rank candidates
              </Button>
            </div>
          </Card>

          {/* Leading Candidate Transparency Explanation Panel */}
          {explanation && (
            <Card
              title={
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-cyan" />
                  <span>Recommendation transparency</span>
                </div>
              }
              subtitle="Auditable justification for top recommendation"
              variant="elevated"
            >
              <div className="space-y-3 text-xs">
                <div className="p-2.5 bg-charcoal-main rounded-control border border-charcoal-border">
                  <span className="text-text-muted block text-[11px]">Primary fit reasoning:</span>
                  <p className="font-medium text-textPrimary mt-1 leading-relaxed">
                    {explanation.whyFit}
                  </p>
                </div>

                <div>
                  <span className="text-text-muted block font-medium mb-1.5">Top contributing factors:</span>
                  <div className="space-y-1.5">
                    {explanation.topFactors.map((tf, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-charcoal-main rounded border border-charcoal-border/60">
                        <span className="text-text-muted truncate max-w-[160px]">{tf.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-cyan">{tf.score}</span>
                          <span className="text-[10px] text-text-muted">(bm: {tf.benchmark})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {explanation.comparisonVersusAlternatives.length > 0 && (
                  <div>
                    <span className="text-text-muted block font-medium mb-1">Decoy / Alternative comparison:</span>
                    <div className="space-y-1 text-[11px]">
                      {explanation.comparisonVersusAlternatives.map((alt, i) => (
                        <div key={i} className="p-2 bg-charcoal-main rounded border border-charcoal-border/50 text-text-muted">
                          <strong className="text-textPrimary">{alt.altName}</strong> ({alt.altScore} fit): {alt.differentialText}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-charcoal-border text-[10px] text-text-muted flex justify-between items-center font-mono">
                  <span>Formula: {explanation.formulaVersion}</span>
                  <span className="text-cyan">Confidence: {explanation.confidence}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (8 cols): Candidate Table & Actions */}
        <div className="lg:col-span-8 space-y-4">
          <Card
            title={`Ranked candidates (${rankedCandidates.length})`}
            subtitle={`Filtered for ${filter.game} · ${filter.role} vacancy`}
            actions={
              <div className="w-48 sm:w-60">
                <input
                  type="text"
                  placeholder="Filter by handle..."
                  value={searchHandle}
                  onChange={(e) => setSearchHandle(e.target.value)}
                  className="w-full h-8 px-2.5 bg-charcoal-main border border-charcoal-border rounded-control text-xs text-textPrimary placeholder-text-muted/60 focus:border-cyan outline-none transition-colors"
                />
              </div>
            }
          >
            {/* Table Container with Responsive Scrolling */}
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-charcoal-border text-text-muted uppercase text-[11px] font-semibold tracking-wider">
                    <th className="py-2.5 px-3 w-10">Select</th>
                    <th className="py-2.5 px-3 w-14">Rank</th>
                    <th className="py-2.5 px-3">Player</th>
                    <th className="py-2.5 px-3">Talent Index</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Matches</th>
                    <th className="py-2.5 px-3">Primary Strength</th>
                    <th className="py-2.5 px-3">Trend</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-border/50">
                  {rankedCandidates.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-text-muted">
                        No candidates match the selected vacancy parameters. Try lowering the minimum match count.
                      </td>
                    </tr>
                  ) : (
                    rankedCandidates.map((p, idx) => {
                      const isSelected = selectedCandidates.includes(p.id);
                      const isTopRanked = idx === 0;

                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors duration-140 ${
                            isTopRanked
                              ? 'bg-cyan/[0.08] hover:bg-cyan/[0.14]'
                              : isSelected
                              ? 'bg-charcoal-elevated/80 hover:bg-charcoal-hover'
                              : 'hover:bg-charcoal-elevated/40'
                          }`}
                        >
                          {/* Checkbox for Comparison Selection */}
                          <td className="py-3 px-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(p.id)}
                              className="w-4 h-4 rounded accent-cyan cursor-pointer"
                              aria-label={`Select ${p.handle} for comparison`}
                            />
                          </td>

                          {/* Rank Marker */}
                          <td className="py-3 px-3 font-mono font-bold">
                            <span className={isTopRanked ? 'text-cyan' : 'text-text-muted'}>
                              #{idx + 1}
                            </span>
                          </td>

                          {/* Player Identity */}
                          <td className="py-3 px-3">
                            <div>
                              <button
                                onClick={() => navigate(`/players/${p.id}`)}
                                className="font-bold text-textPrimary hover:text-cyan transition-colors text-sm text-left font-heading"
                              >
                                {p.handle}
                              </button>
                              <div className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
                                <span>{p.role}</span>
                                <span>·</span>
                                <span>{p.nationality}</span>
                                {p.availability === 'Available' ? (
                                  <span className="text-emerald-400 text-[10px] font-medium">Free Agent</span>
                                ) : (
                                  <span className="text-gold text-[10px] font-medium">Buyout</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Talent Index */}
                          <td className="py-3 px-3">
                            <TalentBadge score={p.talentIndex} size="md" />
                          </td>

                          {/* Confidence */}
                          <td className="py-3 px-3">
                            <ConfidenceBadge level={p.confidence} />
                          </td>

                          {/* Match Count */}
                          <td className="py-3 px-3 font-mono text-text-muted">
                            {p.matchesPlayed}
                          </td>

                          {/* Primary Strength */}
                          <td className="py-3 px-3 max-w-[180px] truncate text-text-muted" title={p.primaryStrength}>
                            {p.primaryStrength}
                          </td>

                          {/* Trend */}
                          <td className="py-3 px-3">
                            <TrendIndicator trend={p.trend} />
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right space-x-1.5">
                            <button
                              onClick={() => {
                                scoutService.addToWatchlist(p, 'Shortlisted');
                                navigate('/watchlist');
                              }}
                              className="p-1.5 text-text-muted hover:text-cyan rounded hover:bg-charcoal-elevated transition-colors"
                              title="Shortlist to Watchlist"
                            >
                              <BookmarkPlus size={15} />
                            </button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/players/${p.id}`)}
                            >
                              Profile
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
