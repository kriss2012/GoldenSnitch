import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  Shield,
  Zap,
  BookmarkCheck,
  TrendingUp,
  ArrowRight,
  Clock,
  Swords,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { scoutService } from '../services/scoutService';
import { GameTitle } from '../types';

interface DashboardPageProps {
  selectedGame: GameTitle;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ selectedGame }) => {
  const navigate = useNavigate();

  const players = useMemo(() => scoutService.getPlayers(), []);
  const rosters = useMemo(() => scoutService.getRosters(), []);
  const watchlist = useMemo(() => scoutService.getWatchlist(), []);

  // Top recommended candidates
  const recommendedCandidates = useMemo(() => {
    return players
      .filter((p) => p.game === selectedGame && p.availability !== 'Contracted')
      .sort((a, b) => b.talentIndex - a.talentIndex)
      .slice(0, 3);
  }, [players, selectedGame]);

  // Aggregate trajectory data for chart
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            Executive scouting overview
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Real-time multi-roster intelligence, talent gap coverage, and predictive synergy analysis.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={() => navigate('/compare')}>
            Compare candidates
          </Button>
          <Button variant="primary" onClick={() => navigate('/scouting')}>
            <Compass size={16} className="mr-2" />
            Open scouting workspace
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Active rosters</span>
            <Shield size={16} className="text-violet" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-heading text-text">{rosters.length}</div>
          <div className="text-[11px] text-text-muted mt-0.5">Across 3 game titles</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Scouting pool</span>
            <Users size={16} className="text-lilac" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-heading text-text">{players.length}</div>
          <div className="text-[11px] text-text-muted mt-0.5">Verified players analyzed</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Shortlisted</span>
            <BookmarkCheck size={16} className="text-success" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-heading text-text">{watchlist.length}</div>
          <div className="text-[11px] text-text-muted mt-0.5">In active pipeline</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Open vacancies</span>
            <Compass size={16} className="text-warning" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-heading text-text">{totalVacancies}</div>
          <div className="text-[11px] text-text-muted mt-0.5">Priority recruiting gaps</div>
        </Card>

        <Card className="p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium">Average synergy</span>
            <Zap size={16} className="text-lilac" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-heading text-text">{avgSynergy}%</div>
          <div className="text-[11px] text-success mt-0.5 font-medium">↑ +3.2% vs last split</div>
        </Card>
      </div>

      {/* Main Analytical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recommended Candidates & Trajectory */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Recommended Candidates */}
          <Card
            title={`Leading candidate recommendations (${selectedGame})`}
            subtitle="Ranked deterministically by vacancy gap coverage, not surface combat stats"
            actions={
              <Button variant="ghost" size="sm" onClick={() => navigate('/scouting')}>
                View all ranked <ArrowRight size={14} className="ml-1" />
              </Button>
            }
          >
            <div className="space-y-3">
              {recommendedCandidates.map((cand, idx) => (
                <div
                  key={cand.id}
                  className="p-3.5 bg-void border border-border rounded-control flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-lilac/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-plum text-text text-xs font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/players/${cand.id}`)}
                          className="font-bold text-text hover:text-lilac transition-colors text-sm"
                        >
                          {cand.handle}
                        </button>
                        <span className="text-xs text-text-muted">· {cand.role}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-surface rounded text-text-muted font-mono">
                          {cand.nationality}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 max-w-md">
                        <strong className="text-success font-medium">Strength:</strong> {cand.primaryStrength}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 max-w-md">
                        <strong className="text-warning font-medium">Concern:</strong> {cand.keyConcern}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="text-right">
                      <TalentBadge score={cand.talentIndex} size="md" />
                      <div className="mt-1">
                        <ConfidenceBadge level={cand.confidence} />
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/players/${cand.id}`)}
                    >
                      Dossier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Trajectory Line Chart */}
          <Card
            title="Multi-roster performance trajectory (Last 6 months)"
            subtitle="Track team ratings across competitive international split windows"
          >
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trajectoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f1568" />
                  <XAxis dataKey="month" stroke="#c8b0e8" fontSize={12} />
                  <YAxis domain={[60, 95]} stroke="#c8b0e8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#140026', borderColor: '#6924aa', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8f0ff', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Sentinels"
                    stroke="#9b30ff"
                    strokeWidth={2.5}
                    dot={{ fill: '#9b30ff', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Fnatic CS2"
                    stroke="#d187ff"
                    strokeWidth={2}
                    dot={{ fill: '#d187ff', r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Apex Global LoL"
                    stroke="#5662f6"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ fill: '#5662f6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 text-xs text-text-muted mt-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-violet rounded" /> Sentinels (VAL)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-lilac rounded" /> Fnatic (CS2)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-text-muted rounded" /> Apex Global (LoL)</span>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Rosters & Recent Activity */}
        <div className="space-y-6">
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
                  className="p-3 bg-void border border-border hover:border-lilac/40 rounded-control cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text">{roster.name}</h4>
                      <span className="text-[11px] text-text-muted">{roster.game} · {roster.tier}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-text">{roster.synergyScore}%</span>
                      <span className="block text-[10px] text-text-muted">Synergy</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-border/40">
                    <span className="text-text-muted">{roster.members.length}/5 Players</span>
                    <TrendIndicator trend={roster.trend} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Match Intelligence */}
          <Card title="Recent match logs" subtitle="Competitive international fixtures">
            <div className="space-y-3">
              <div className="p-2.5 bg-void rounded-control border border-border text-xs">
                <div className="flex justify-between items-center text-text-muted">
                  <span className="font-semibold text-text">VCT Champions Seoul</span>
                  <span>Aug 20</span>
                </div>
                <div className="flex justify-between items-center mt-1 font-mono">
                  <span>vs Sentinels (Breeze)</span>
                  <span className="text-success font-bold">16-14 (W)</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 italic">
                  "Mirage called late-round rotation at 0:28 to bait B anchor"
                </p>
              </div>

              <div className="p-2.5 bg-void rounded-control border border-border text-xs">
                <div className="flex justify-between items-center text-text-muted">
                  <span className="font-semibold text-text">PGL Major Copenhagen</span>
                  <span>Mar 31</span>
                </div>
                <div className="flex justify-between items-center mt-1 font-mono">
                  <span>vs FaZe Clan (Mirage)</span>
                  <span className="text-success font-bold">13-11 (W)</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 italic">
                  "donk opening duel kill on mid connector + traded site anchor"
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
