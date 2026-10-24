import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, BookmarkPlus, ArrowUpDown, Download, Upload, Shield, CheckCircle, AlertTriangle, X, FileText } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { scoutService } from '../services/scoutService';
import { GameTitle, Player } from '../types';

export const PlayerDatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const players = useMemo(() => scoutService.getPlayers(), []);

  // Filter state
  const [search, setSearch] = useState(initialQuery);
  const [selectedGame, setSelectedGame] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [minTalent, setMinTalent] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'talentIndex' | 'matchesPlayed' | 'trend'>('talentIndex');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // CSV Import State (PRD §5 User Journey B & F1/F15)
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [isDryRun, setIsDryRun] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Available roles for filter
  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    players.forEach(p => {
      if (selectedGame === 'All' || p.game === selectedGame) {
        roles.add(p.role);
      }
    });
    return Array.from(roles);
  }, [players, selectedGame]);

  const filteredPlayers = useMemo(() => {
    let result = players.filter(p => {
      if (selectedGame !== 'All' && p.game !== selectedGame) return false;
      if (selectedRole !== 'All' && p.role !== selectedRole) return false;
      if (selectedRegion !== 'All' && p.region !== selectedRegion) return false;
      if (selectedAvailability !== 'All' && p.availability !== selectedAvailability) return false;
      if (p.talentIndex < minTalent) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.handle.toLowerCase().includes(q) || p.realName.toLowerCase().includes(q) || (p.team && p.team.toLowerCase().includes(q));
      }
      return true;
    });

    result.sort((a, b) => {
      const vA = a[sortBy];
      const vB = b[sortBy];
      return sortAsc ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1);
    });

    return result;
  }, [players, search, selectedGame, selectedRole, selectedRegion, selectedAvailability, minTalent, sortBy, sortAsc]);

  const handleExportCSV = () => {
    const rows = filteredPlayers.map(p => ({
      ID: p.id,
      Handle: p.handle,
      RealName: p.realName,
      Game: p.game,
      Role: p.role,
      Team: p.team || 'None',
      TalentIndex: p.talentIndex,
      Confidence: p.confidence,
      Matches: p.matchesPlayed,
      Trend: p.trend,
      Availability: p.availability,
      SalaryK: p.salaryK,
      LastAnalyzed: p.lastAnalyzed,
    }));
    scoutService.exportCSV('goldensnitch_player_database', rows);
  };

  const handleUploadCSV = async () => {
    if (!csvText.trim()) return;
    setIsUploading(true);
    setImportResult(null);
    setImportError(null);
    try {
      const res = await fetch(`/api/imports?dry_run=${isDryRun}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv',
          ...(localStorage.getItem('gs_token') ? { 'Authorization': `Bearer ${localStorage.getItem('gs_token')}` } : {})
        },
        body: csvText
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data?.error?.message || 'CSV ingestion failed');
      } else {
        setImportResult(data);
      }
    } catch (err: any) {
      setImportError(err?.message || 'Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const loadSampleTemplate = () => {
    const sample = `player_name,game,role,matches_played,rounds_played,acs,kast,adr,hs_pct
Chronos,valorant,Duelist,120,120,245.5,78.2,162.0,28.4
Valkyrie,valorant,Initiator,95,95,210.0,74.5,138.5,22.1
BadPlayer@Inj,=cmd|' /C calc'!A0,Duelist,50,50,999.0,120.0,-5.0,15.0`;
    setCsvText(sample);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            Global player database
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Browse, filter, and inspect verified profiles across international ecosystems.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload size={15} className="mr-1.5" />
            Ingest verified CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download size={15} className="mr-1.5" />
            Export dataset CSV
          </Button>
        </div>
      </div>

      {/* Filter Surface Panel */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="text-xs font-medium text-text-muted block mb-1">Search handle</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Filter players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none"
              />
            </div>
          </div>

          {/* Game Title */}
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Title</label>
            <select
              value={selectedGame}
              onChange={(e) => {
                setSelectedGame(e.target.value);
                setSelectedRole('All');
              }}
              className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none cursor-pointer"
            >
              <option value="All">All games</option>
              <option value="VALORANT">VALORANT</option>
              <option value="Counter-Strike 2">CS2</option>
              <option value="League of Legends">LoL</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none cursor-pointer"
            >
              <option value="All">All roles</option>
              {roleOptions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="text-xs font-medium text-text-muted block mb-1">Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none cursor-pointer"
            >
              <option value="All">All statuses</option>
              <option value="Available">Free Agent</option>
              <option value="Contracted">Contracted</option>
            </select>
          </div>

          {/* Min Talent Index */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-text-muted">Min Talent Index</span>
              <span className="font-mono font-bold text-text">{minTalent}</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minTalent}
              onChange={(e) => setMinTalent(parseInt(e.target.value))}
              className="w-full accent-violet mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Players Table */}
      <Card
        title={`Players (${filteredPlayers.length})`}
        subtitle="Sorted by role evaluation criteria"
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full min-w-[700px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-text-muted uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Player</th>
                <th className="py-2.5 px-3">Title & Role</th>
                <th className="py-2.5 px-3">Current Team</th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-text select-none"
                  onClick={() => {
                    if (sortBy === 'talentIndex') setSortAsc(!sortAsc);
                    else { setSortBy('talentIndex'); setSortAsc(false); }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Talent Index</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-2.5 px-3">Confidence</th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-text select-none"
                  onClick={() => {
                    if (sortBy === 'matchesPlayed') setSortAsc(!sortAsc);
                    else { setSortBy('matchesPlayed'); setSortAsc(false); }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Matches</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-2.5 px-3">Trend</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-text-muted">
                    No players found matching the current query. Try clearing filters.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/80 transition-colors">
                    {/* Handle & Name */}
                    <td className="py-3 px-3">
                      <div>
                        <button
                          onClick={() => navigate(`/players/${p.id}`)}
                          className="font-bold text-text hover:text-lilac transition-colors text-sm text-left font-heading"
                        >
                          {p.handle}
                        </button>
                        <div className="text-[11px] text-text-muted">{p.realName} · {p.nationality}</div>
                      </div>
                    </td>

                    {/* Game & Role */}
                    <td className="py-3 px-3">
                      <span className="font-medium text-text">{p.game}</span>
                      <div className="text-[11px] text-text-muted">{p.role}</div>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-3 text-text font-medium">
                      {p.team || <span className="text-text-muted italic">Unsigned</span>}
                    </td>

                    {/* Talent Index */}
                    <td className="py-3 px-3">
                      <TalentBadge score={p.talentIndex} size="md" />
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3">
                      <ConfidenceBadge level={p.confidence} />
                    </td>

                    {/* Matches */}
                    <td className="py-3 px-3 font-mono text-text-muted">
                      {p.matchesPlayed}
                    </td>

                    {/* Trend */}
                    <td className="py-3 px-3">
                      <TrendIndicator trend={p.trend} />
                    </td>

                    {/* Availability */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        p.availability === 'Available'
                          ? 'bg-success/15 text-success border border-success/30'
                          : 'bg-surface text-text-muted border border-border'
                      }`}>
                        {p.availability}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          scoutService.addToWatchlist(p, 'Discovered');
                          navigate('/watchlist');
                        }}
                        className="p-1.5 text-text-muted hover:text-lilac rounded hover:bg-void transition-colors"
                        title="Add to Watchlist"
                      >
                        <BookmarkPlus size={15} />
                      </button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/players/${p.id}`)}
                      >
                        Dossier
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CSV Ingestion & Authenticity Modal (PRD §5 User Journey B, F1, F15) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface-header sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <Shield className="text-brand" size={18} />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text">
                    Multi-layer CSV data ingestion & verification
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    PRD §8 bound validation, formula injection protection, and cryptographic SHA-256 provenance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-text-muted hover:text-text rounded-control hover:bg-void transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-text">Paste CSV text or edit template</label>
                <Button variant="ghost" size="sm" onClick={loadSampleTemplate}>
                  <FileText size={13} className="mr-1" />
                  Load test sample (with injection test)
                </Button>
              </div>

              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="player_name,game,role,matches_played,rounds_played,acs,kast,adr,hs_pct&#10;Mirage,valorant,Controller,120,120,226.0,76.5,145.0,24.0"
                className="w-full h-40 p-3 bg-void border border-border rounded-control font-mono text-xs text-text placeholder-text-muted/50 focus:border-lilac outline-none"
              />

              {/* Mode Toggle & Actions */}
              <div className="p-3 bg-void/60 border border-border rounded-control flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDryRun}
                    onChange={(e) => setIsDryRun(e.target.checked)}
                    className="accent-brand rounded"
                  />
                  <span>
                    <strong>Dry run validation only</strong> (does not persist to database)
                  </span>
                </label>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUploadCSV}
                  disabled={isUploading || !csvText.trim()}
                >
                  <Upload size={14} className="mr-1.5" />
                  {isUploading ? 'Validating...' : isDryRun ? 'Validate CSV' : 'Commit to database'}
                </Button>
              </div>

              {/* Error Alert */}
              {importError && (
                <div className="p-3 bg-danger/10 border border-danger/30 rounded-control flex items-start gap-2 text-danger">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Ingestion Results Display */}
              {importResult && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">Ingestion summary</span>
                    <span className="font-mono text-[11px] text-lilac">
                      SHA-256: {importResult.dataset_sha256?.slice(0, 16)}...
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-void rounded border border-border">
                      <div className="text-[10px] text-text-muted">Total Rows</div>
                      <div className="text-sm font-bold text-text">{importResult.rows_total}</div>
                    </div>
                    <div className="p-2 bg-void rounded border border-success/30 text-success">
                      <div className="text-[10px] text-text-muted">Accepted</div>
                      <div className="text-sm font-bold">{importResult.accepted}</div>
                    </div>
                    <div className="p-2 bg-void rounded border border-danger/30 text-danger">
                      <div className="text-[10px] text-text-muted">Rejected</div>
                      <div className="text-sm font-bold">{importResult.rejected}</div>
                    </div>
                    <div className="p-2 bg-void rounded border border-warning/30 text-warning">
                      <div className="text-[10px] text-text-muted">Duplicates</div>
                      <div className="text-sm font-bold">{importResult.duplicates}</div>
                    </div>
                  </div>

                  {/* Row-level errors if any */}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="p-3 bg-void rounded border border-danger/30 space-y-1.5">
                      <span className="font-semibold text-danger block">Row-level rejections:</span>
                      {importResult.errors.map((err: any, i: number) => (
                        <div key={i} className="text-[11px] text-text-muted">
                          • Line {err.row} (<span className="text-text font-mono">{err.field}</span>): {err.message}
                        </div>
                      ))}
                    </div>
                  )}

                  {!importResult.dry_run && importResult.accepted > 0 && (
                    <div className="p-2.5 bg-success/10 border border-success/30 rounded text-success text-[11px] flex items-center gap-2">
                      <CheckCircle size={14} className="shrink-0" />
                      Successfully committed {importResult.accepted} verified players to SQLite database with provenance tagging.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex justify-end bg-surface-header sticky bottom-0 z-10">
              <Button variant="secondary" size="sm" onClick={() => setShowImportModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
