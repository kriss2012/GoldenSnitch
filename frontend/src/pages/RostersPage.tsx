import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Compass,
  Zap,
  TrendingUp,
  Plus,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { TrendIndicator } from '../components/common/TrendIndicator';
import { scoutService } from '../services/scoutService';
import { Roster, RosterMember } from '../types';

export const RostersPage: React.FC = () => {
  const { rosterId } = useParams<{ rosterId?: string }>();
  const navigate = useNavigate();

  const rosters = useMemo(() => scoutService.getRosters(), []);
  const allPlayers = useMemo(() => scoutService.getPlayers(), []);

  // Selected roster (default to first or URL param)
  const [selectedRosterId, setSelectedRosterId] = useState<string>(
    rosterId || rosters[0]?.id || ''
  );

  const currentRoster = useMemo(() => {
    return rosters.find(r => r.id === selectedRosterId) || rosters[0];
  }, [rosters, selectedRosterId]);

  // Roster members with full player details
  const rosterMembers = useMemo(() => {
    if (!currentRoster) return [];
    return currentRoster.members.map(m => {
      const p = allPlayers.find(x => x.id === m.playerId);
      return {
        ...m,
        player: p,
      };
    });
  }, [currentRoster, allPlayers]);

  // Open vacancies for this roster
  const vacancies = useMemo(() => {
    if (!currentRoster) return [];
    return currentRoster.vacancies.filter(v => v.status === 'Open');
  }, [currentRoster]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            Multi-roster management
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Monitor squad synergy, active slot assignments, and recruitment vacancies across competitive titles.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => navigate('/synergy')}>
          <Zap size={15} className="mr-1.5" />
          Simulate roster changes
        </Button>
      </div>

      {/* Roster Layout (Left: Roster list, Right: Roster Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Roster Selector List */}
        <div className="lg:col-span-4 space-y-3">
          <Card title="Active rosters">
            <div className="space-y-2">
              {rosters.map(roster => {
                const isSelected = roster.id === selectedRosterId;
                return (
                  <div
                    key={roster.id}
                    onClick={() => setSelectedRosterId(roster.id)}
                    className={`p-3.5 rounded-control border cursor-pointer transition-all duration-140 ${
                      isSelected
                        ? 'bg-plum border-violet'
                        : 'bg-void border-border hover:border-lilac/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-text font-heading">{roster.name}</span>
                      <span className="text-xs font-mono font-bold text-text">{roster.synergyScore}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-text-muted mt-1">
                      <span>{roster.game} · {roster.tier}</span>
                      <span>{roster.members.length}/5 Slots</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <span className="text-text-muted">
                        {roster.vacancies.length ? (
                          <span className="text-warning">Open: {roster.vacancies.map(v=>v.role).join(', ')}</span>
                        ) : (
                          <span className="text-success">Squad complete</span>
                        )}
                      </span>
                      <TrendIndicator trend={roster.trend} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column (8 cols): Roster Detail & Members */}
        {currentRoster && (
          <div className="lg:col-span-8 space-y-6">
            {/* Roster Overview Top Card */}
            <div className="p-5 bg-surface border border-border rounded-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-text font-heading">{currentRoster.name}</h2>
                  <span className="px-2 py-0.5 rounded text-xs bg-void border border-border text-lilac font-medium">
                    {currentRoster.game}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-surface text-text-muted font-mono">
                    {currentRoster.tier}
                  </span>
                </div>
                <div className="text-xs text-text-muted mt-1.5 flex gap-4">
                  <span>Payroll: <strong className="text-text">${currentRoster.payrollK}k / ${currentRoster.payrollCapK}k</strong></span>
                  <span>Avg Rating: <strong className="text-text">{currentRoster.averageRating}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-text-muted uppercase tracking-wider block">Squad Synergy</span>
                <span className="text-3xl font-extrabold font-heading text-text">{currentRoster.synergyScore}%</span>
              </div>
            </div>

            {/* Lineup & Active Slots */}
            <Card title="Active roster lineup (5 Slots)">
              <div className="space-y-2.5">
                {rosterMembers.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-void border border-border rounded-control flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-plum text-text text-xs font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <div>
                        {m.player ? (
                          <>
                            <button
                              onClick={() => navigate(`/players/${m.player?.id}`)}
                              className="font-bold text-text hover:text-lilac transition-colors text-sm text-left font-heading"
                            >
                              {m.player.handle}
                            </button>
                            <span className="text-xs text-text-muted ml-2">({m.player.realName})</span>
                          </>
                        ) : (
                          <span className="text-sm text-text font-medium">Unassigned</span>
                        )}
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Assigned role: <strong className="text-text">{m.slotRole}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {m.player && (
                        <>
                          <TalentBadge score={m.player.talentIndex} size="sm" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/players/${m.player?.id}`)}
                          >
                            Profile
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Open Vacancies Rows */}
                {vacancies.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-surface/50 border border-dashed border-warning/50 rounded-control flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-warning/20 text-warning text-xs font-bold flex items-center justify-center font-mono">
                        !
                      </span>
                      <div>
                        <span className="font-bold text-warning text-sm">Open Vacancy: {v.role}</span>
                        <div className="text-[11px] text-text-muted mt-0.5">Priority: {v.priority}</div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/scouting')}
                    >
                      <Compass size={14} className="mr-1.5" />
                      Scout replacement
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trajectory Line Chart */}
            <Card title="Roster rating progression" subtitle="Historical 6-month competitive trajectory">
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentRoster.historyTrajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3B1A55" />
                    <XAxis dataKey="month" stroke="#B9A6CC" fontSize={12} />
                    <YAxis domain={[60, 95]} stroke="#B9A6CC" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#120019', borderColor: '#3B1A55', borderRadius: '8px' }}
                      itemStyle={{ color: '#F3E8FF', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="rating" stroke="#892CDC" strokeWidth={2.5} dot={{ fill: '#892CDC', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
