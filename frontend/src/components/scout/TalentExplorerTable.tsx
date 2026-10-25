import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sliders, Shield, Zap, Search, Filter, ArrowUpDown, ChevronDown, 
  ExternalLink, CheckSquare, Square, Eye, Activity, Info 
} from 'lucide-react';
import { rankingsService, RankedPlayer } from '../../services/rankingsService';
import { IglIntelligenceModal } from './IglIntelligenceModal';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { ShortlistButton } from '../common/ShortlistButton';

interface TalentExplorerTableProps {
  initialGame?: string;
}

export const TalentExplorerTable: React.FC<TalentExplorerTableProps> = ({
  initialGame = 'valorant'
}) => {
  const navigate = useNavigate();
  const [isPending, startTransition] = useTransition();

  // Filters
  const [game, setGame] = useState<string>(initialGame.toLowerCase());
  const [role, setRole] = useState<string>('All');
  const [preset, setPreset] = useState<string>('balanced');
  const [tier, setTier] = useState<string>('All');
  const [region, setRegion] = useState<string>('All');
  const [minMaps, setMinMaps] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('final_score');

  // Custom Weight Sliders State
  const [showSliders, setShowSliders] = useState<boolean>(false);
  const [weights, setWeights] = useState<Record<string, number>>({
    cwd: 0.22,
    mra: 0.20,
    eco: 0.15,
    conv: 0.10,
    coord: 0.13,
    lrd: 0.08,
    fp: 0.07,
    con: 0.05
  });

  // Data & Selection
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [inspectingIgl, setInspectingIgl] = useState<{ id: string; handle: string } | null>(null);

  // Load rankings from backend
  const loadRankings = async () => {
    setLoading(true);
    try {
      const res = await rankingsService.getRankings({
        game,
        role: role === 'All' ? undefined : role,
        preset: showSliders ? undefined : preset,
        custom_weights: showSliders ? weights : undefined,
        tier: tier === 'All' ? undefined : tier,
        region: region === 'All' ? undefined : region,
        min_maps: minMaps,
        sort_by: sortBy,
        limit: 50
      });
      setPlayers(res.rankings || []);
    } catch (err) {
      console.error('Failed to load rankings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, [game, role, preset, tier, region, minMaps, sortBy, showSliders]);

  // Handle Preset change
  const handlePresetSelect = (p: string) => {
    setPreset(p);
    setShowSliders(false);
    if (p === 'balanced') {
      setWeights({ cwd: 0.22, mra: 0.20, eco: 0.15, conv: 0.10, coord: 0.13, lrd: 0.08, fp: 0.07, con: 0.05 });
    } else if (p === 'aggressive') {
      setWeights({ cwd: 0.25, mra: 0.22, eco: 0.10, conv: 0.12, coord: 0.11, lrd: 0.08, fp: 0.08, con: 0.04 });
    } else if (p === 'economy_focused') {
      setWeights({ cwd: 0.18, mra: 0.18, eco: 0.25, conv: 0.12, coord: 0.12, lrd: 0.07, fp: 0.04, con: 0.04 });
    } else if (p === 'mentor') {
      setWeights({ cwd: 0.20, mra: 0.22, eco: 0.14, conv: 0.08, coord: 0.18, lrd: 0.08, fp: 0.04, con: 0.06 });
    }
  };

  const handleWeightSlider = (metric: string, val: number) => {
    const updated = { ...weights, [metric]: val };
    // Normalize to sum 1.0
    const sum = Object.values(updated).reduce((a, b) => a + b, 0);
    const normalized: Record<string, number> = {};
    for (const [k, v] of Object.entries(updated)) {
      normalized[k] = Math.round((v / sum) * 100) / 100;
    }
    setWeights(normalized);
  };

  const toggleCompare = (pid: string) => {
    setSelectedForCompare(prev => 
      prev.includes(pid) ? prev.filter(x => x !== pid) : (prev.length < 4 ? [...prev, pid] : prev)
    );
  };

  // Filter local search text
  const displayedPlayers = players.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.handle.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Control Bar: Game, Presets, Filters, Weight Sliders Toggle */}
      <div className="bg-[#181818] border border-[#353535] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#82EAF4] animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-[#F5F5F5] font-heading">
              ScoutIQ Live Talent Explorer
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#82EAF4]/20 text-[#82EAF4] border border-[#82EAF4]/30 font-semibold">
              Bayesian Credible Ranks
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Presets dropdown */}
            <div className="flex items-center gap-1.5 bg-[#202020] border border-[#353535] rounded-xl px-2.5 py-1">
              <span className="text-[11px] font-medium text-[#B8B8B8]">Preset:</span>
              <select
                value={preset}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="bg-transparent text-xs text-[#82EAF4] font-bold focus:outline-none cursor-pointer"
              >
                <option value="balanced" className="bg-[#202020] text-[#F5F5F5]">Balanced Tactical (Default)</option>
                <option value="aggressive" className="bg-[#202020] text-[#F5F5F5]">Aggressive Early-Round</option>
                <option value="economy_focused" className="bg-[#202020] text-[#F5F5F5]">Economy & Conversion</option>
                <option value="mentor" className="bg-[#202020] text-[#F5F5F5]">Veteran Mentor & Comms</option>
              </select>
            </div>

            {/* Sliders reveal button */}
            <button
              onClick={() => setShowSliders(!showSliders)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                showSliders
                  ? 'bg-[#82EAF4] text-[#101010] border-[#82EAF4] shadow-[0_0_10px_rgba(130,234,244,0.3)]'
                  : 'bg-[#242424] text-[#B8B8B8] border-[#353535] hover:text-[#F5F5F5] hover:border-[#82EAF4]/40'
              }`}
            >
              <Sliders size={13} />
              {showSliders ? 'Lock Weights' : 'Adjust Weights'}
            </button>
          </div>
        </div>

        {/* Dynamic Weight Sliders Drawer */}
        {showSliders && (
          <div className="bg-[#202020] border border-[#353535] rounded-xl p-4 animate-in slide-in-from-top-2 duration-150 space-y-3">
            <div className="flex items-center justify-between border-b border-[#303030] pb-2">
              <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1.5">
                <Sliders size={14} className="text-[#82EAF4]" />
                Role Metric Weight Tuning (Live Bayesian Recalibration)
              </span>
              <span className="text-[11px] text-[#B8B8B8]">
                Weights sum automatically to 1.00 ± 0.01
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(weights).map(([k, w]) => (
                <div key={k} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#B8B8B8] uppercase font-bold">{k}</span>
                    <span className="font-mono text-[#82EAF4]">{(w * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.02"
                    max="0.40"
                    step="0.01"
                    value={w}
                    onChange={(e) => handleWeightSlider(k, parseFloat(e.target.value))}
                    className="w-full accent-[#82EAF4] cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={loadRankings}
                className="px-4 py-1.5 rounded-lg bg-[#82EAF4] text-[#101010] text-xs font-bold hover:bg-[#97f0fa] transition-all shadow-md"
              >
                Apply Custom Weights
              </button>
            </div>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Search */}
          <div>
            <label className="text-[11px] font-medium text-[#B8B8B8] block mb-1">Search Handle</label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777777]" />
              <input
                type="text"
                placeholder="Find player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-7 pr-2.5 bg-[#202020] border border-[#353535] rounded-lg text-xs text-[#F5F5F5] placeholder-[#777777] focus:border-[#82EAF4] outline-none"
              />
            </div>
          </div>

          {/* Game Title */}
          <div>
            <label className="text-[11px] font-medium text-[#B8B8B8] block mb-1">Game Title</label>
            <select
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-full h-8 px-2 bg-[#202020] border border-[#353535] rounded-lg text-xs text-[#F5F5F5] focus:border-[#82EAF4] outline-none cursor-pointer"
            >
              <option value="valorant">Valorant</option>
              <option value="cs2">Counter-Strike 2</option>
              <option value="lol">League of Legends</option>
              <option value="dota2">Dota 2</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="text-[11px] font-medium text-[#B8B8B8] block mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-8 px-2 bg-[#202020] border border-[#353535] rounded-lg text-xs text-[#F5F5F5] focus:border-[#82EAF4] outline-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="IGL">IGL (Flagship)</option>
              <option value="Duelist">Duelist / Carry</option>
              <option value="Initiator">Initiator / Mid</option>
              <option value="Controller">Controller / Support</option>
              <option value="Sentinel">Sentinel / Offlane</option>
              <option value="Flex">Flex / Sixth Man</option>
            </select>
          </div>

          {/* Tier */}
          <div>
            <label className="text-[11px] font-medium text-[#B8B8B8] block mb-1">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full h-8 px-2 bg-[#202020] border border-[#353535] rounded-lg text-xs text-[#F5F5F5] focus:border-[#82EAF4] outline-none cursor-pointer"
            >
              <option value="All">All Tiers</option>
              <option value="T1">Tier 1 (Major League)</option>
              <option value="T2">Tier 2 (Challengers)</option>
              <option value="T3">Tier 3 (Open Circuit)</option>
              <option value="academy">Academy Roster</option>
            </select>
          </div>

          {/* Min Maps */}
          <div>
            <div className="flex justify-between items-center text-[11px] mb-1">
              <span className="text-[#B8B8B8]">Min Maps</span>
              <span className="font-mono text-[#82EAF4]">{minMaps}</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={minMaps}
              onChange={(e) => setMinMaps(parseInt(e.target.value))}
              className="w-full accent-[#82EAF4] cursor-pointer"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[11px] font-medium text-[#B8B8B8] block mb-1">Sort Metric</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-8 px-2 bg-[#202020] border border-[#353535] rounded-lg text-xs text-[#F5F5F5] focus:border-[#82EAF4] outline-none cursor-pointer"
            >
              <option value="final_score">Overall Score</option>
              <option value="final_lb">80% Credible Lower Bound</option>
              <option value="sample_maps">Sample Maps</option>
              <option value="confidence">Confidence Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Compare Floating Drawer */}
      {selectedForCompare.length > 0 && (
        <div className="bg-[#142e33] border border-[#82EAF4]/50 rounded-xl p-3 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#82EAF4]">
              {selectedForCompare.length} candidates selected for head-to-head comparison
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedForCompare([])}
              className="px-2.5 py-1 text-[#B8B8B8] hover:text-[#F5F5F5]"
            >
              Clear
            </button>
            <button
              onClick={() => navigate(`/compare?ids=${selectedForCompare.join(',')}`)}
              className="px-4 py-1 rounded-lg bg-[#82EAF4] text-[#101010] font-bold shadow-md hover:bg-[#9bf1fa]"
            >
              Launch Head-to-Head Comparison
            </button>
          </div>
        </div>
      )}

      {/* Main Talent Table */}
      <div className="bg-[#181818] border border-[#353535] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-[#82EAF4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#B8B8B8]">Scoring candidates from database telemetry...</p>
          </div>
        ) : displayedPlayers.length === 0 ? (
          <div className="py-20 text-center text-[#B8B8B8] text-sm">
            No players matched the current filters. Try lowering the minimum maps threshold.
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile swipe indicator */}
            <div className="sm:hidden flex items-center justify-between text-[11px] text-[#82EAF4] bg-[#142326] px-3.5 py-2 border-b border-[#2A3F45]">
              <span className="flex items-center gap-1.5 font-medium">
                <span>←</span> Swipe horizontally to inspect full metrics &amp; shortlist <span>→</span>
              </span>
              <span className="text-[10px] text-[#8E8E8E] font-mono">{displayedPlayers.length} pros</span>
            </div>

            <div className="overflow-x-auto -mx-0">
              <table className="w-full min-w-[760px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#303030] bg-[#121212] text-[#B8B8B8] uppercase text-[10px] tracking-wider select-none">
                    <th className="py-3 px-3 w-10 text-center">
                      <span className="sr-only">Compare</span>
                    </th>
                    <th className="py-3 px-3 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Player / Team</th>
                    <th className="py-3 px-3 text-center">Role</th>
                    <th className="py-3 px-3 text-center">Tier</th>
                    <th className="py-3 px-4 text-center">Role Fit Score</th>
                    <th className="py-3 px-4 text-center">80% Credible Range</th>
                    <th className="py-3 px-3 text-center">Sample Maps</th>
                    <th className="py-3 px-4">Risk Profiling</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B2B2B]">
                  {displayedPlayers.map((player) => {
                    const isSelected = selectedForCompare.includes(player.player_id);
                    const isIgl = player.role.toUpperCase() === 'IGL';

                    return (
                      <tr
                        key={player.player_id}
                        className="hover:bg-[#202020]/80 transition-colors group"
                      >
                        {/* Checkbox for compare */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleCompare(player.player_id)}
                            className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-[#777777] hover:text-[#82EAF4] transition-colors"
                            title="Select for head-to-head comparison"
                          >
                            {isSelected ? (
                              <CheckSquare size={17} className="text-[#82EAF4]" />
                            ) : (
                              <Square size={17} />
                            )}
                          </button>
                        </td>

                        {/* Rank */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#B8B8B8]">
                          #{player.rank}
                        </td>

                        {/* Player Avatar, Handle & Team */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <PlayerAvatar
                              handle={player.handle}
                              role={player.role}
                              game={game}
                              size="sm"
                              rank={player.rank <= 3 ? player.rank : undefined}
                            />
                            <div>
                              <div className="font-bold text-[#F5F5F5] group-hover:text-[#82EAF4] transition-colors flex items-center gap-1.5">
                                {player.handle}
                                {isIgl && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#82EAF4]/20 text-[#82EAF4] border border-[#82EAF4]/30">
                                    IGL
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#777777] mt-0.5">
                                {player.team} • {player.region}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3 text-center font-medium text-[#F5F5F5]">
                          <span className="px-2 py-0.5 rounded-md bg-[#242424] border border-[#353535]">
                            {player.role}
                          </span>
                        </td>

                        {/* Tier */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            player.tier === 'T1'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : player.tier === 'T2'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {player.tier}
                          </span>
                        </td>

                        {/* Role Fit Score */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-baseline gap-1">
                            <span className="text-base font-extrabold text-[#82EAF4]">
                              {player.overall_score.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-[#777777]">/100</span>
                          </div>
                        </td>

                        {/* 80% Credible Range */}
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-[#122326] text-[#82EAF4] border border-[#82EAF4]/30">
                            [{player.final_lb.toFixed(1)} – {player.overall_score.toFixed(1)}]
                          </span>
                        </td>

                        {/* Sample Maps & Confidence */}
                        <td className="py-3 px-3 text-center font-mono text-xs text-[#B8B8B8]">
                          <div>{player.sample_maps} maps</div>
                          <div className="text-[10px] text-[#777777]">{(player.confidence * 100).toFixed(0)}% conf</div>
                        </td>

                        {/* Risk Profiling Chips */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {player.risk_flags.length === 0 ? (
                              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                <Shield size={11} /> Clean Profile
                              </span>
                            ) : (
                              player.risk_flags.map((rf) => (
                                <span
                                  key={rf}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                >
                                  {rf}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Actions: Shortlist + IGL Intel + Profile */}
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <ShortlistButton
                            player={{
                              id: player.player_id,
                              handle: player.handle,
                              realName: player.handle,
                              game: 'VALORANT',
                              role: player.role,
                              team: player.team,
                              talentIndex: player.overall_score,
                              confidence: 'High confidence',
                              matchesPlayed: player.sample_maps,
                              trend: 3.2,
                              nationality: player.region,
                              region: player.region,
                              age: 21,
                              availability: 'Available',
                              salaryK: player.contract?.salary ? Math.round(player.contract.salary / 1000) : 180,
                              lastAnalyzed: 'Today',
                              primaryStrength: 'Mechanics',
                              keyConcern: 'None',
                            }}
                            size="sm"
                          />
                          {isIgl && (
                            <button
                              onClick={() => setInspectingIgl({ id: player.player_id, handle: player.handle })}
                              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#82EAF4]/15 hover:bg-[#82EAF4]/25 text-[#82EAF4] border border-[#82EAF4]/30 font-semibold text-[11px] transition-all inline-flex items-center gap-1"
                            >
                              <Activity size={13} />
                              IGL Intel
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/players/${player.player_id}`)}
                            className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2B2B2B] text-[#B8B8B8] hover:text-[#F5F5F5] border border-[#353535] font-semibold text-[11px] transition-all inline-flex items-center gap-1"
                          >
                            <Eye size={13} />
                            Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal for IGL Intelligence */}
      {inspectingIgl && (
        <IglIntelligenceModal
          playerId={inspectingIgl.id}
          playerHandle={inspectingIgl.handle}
          gameId={game}
          onClose={() => setInspectingIgl(null)}
        />
      )}
    </div>
  );
};
