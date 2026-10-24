import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  FileText,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TalentBadge } from '../components/common/TalentBadge';
import { ConfidenceBadge } from '../components/common/ConfidenceBadge';
import { scoutService } from '../services/scoutService';
import { WatchlistRecord, WatchlistStage } from '../types';

const STAGES: WatchlistStage[] = [
  'Discovered',
  'Under review',
  'Shortlisted',
  'Contact planned',
  'Trial requested',
  'Decision pending',
  'Signed',
  'Archived',
];

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistRecord[]>(() => scoutService.getWatchlist());
  const [selectedStage, setSelectedStage] = useState<WatchlistStage | 'All'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const filteredList = useMemo(() => {
    if (selectedStage === 'All') return watchlist;
    return watchlist.filter(w => w.stage === selectedStage);
  }, [watchlist, selectedStage]);

  const handleStageChange = (recordId: string, newStage: WatchlistStage) => {
    const updated = scoutService.updateWatchlistStage(recordId, newStage);
    setWatchlist(updated);
  };

  const handleSaveNotes = (recordId: string) => {
    const list = watchlist.map(item => {
      if (item.id === recordId) {
        return { ...item, notes: noteText, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return item;
    });
    localStorage.setItem('scoutgrid_watchlist_v2', JSON.stringify(list));
    setWatchlist(list);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            Recruitment pipeline & watchlist
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Track prospective player transfers through formal stages from initial discovery to contract signing.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => navigate('/scouting')}>
          <Plus size={15} className="mr-1.5" />
          Discover candidates
        </Button>
      </div>

      {/* Stage Selector Pills (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border select-none">
        <button
          onClick={() => setSelectedStage('All')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedStage === 'All' ? 'bg-violet text-white' : 'bg-surface text-text-muted hover:text-text'
          }`}
        >
          All stages ({watchlist.length})
        </button>
        {STAGES.map(stage => {
          const count = watchlist.filter(w => w.stage === stage).length;
          return (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedStage === stage ? 'bg-violet text-white' : 'bg-surface text-text-muted hover:text-text'
              }`}
            >
              {stage} {count > 0 && <span className="ml-1 opacity-75 font-mono">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Pipeline Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted">
            No candidates currently in the {selectedStage === 'All' ? 'pipeline' : `"${selectedStage}" stage`}.
          </div>
        ) : (
          filteredList.map(item => (
            <Card key={item.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button
                    onClick={() => navigate(`/players/${item.playerId}`)}
                    className="font-bold text-text hover:text-lilac transition-colors text-base text-left font-heading"
                  >
                    {item.playerHandle}
                  </button>
                  <div className="text-xs text-text-muted mt-0.5">
                    {item.game} · {item.role}
                  </div>
                </div>

                <TalentBadge score={item.talentIndex} size="md" />
              </div>

              {/* Stage Dropdown Selector */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-text-muted">Pipeline stage:</span>
                <select
                  value={item.stage}
                  onChange={(e) => handleStageChange(item.id, e.target.value as WatchlistStage)}
                  className="h-7 px-2 bg-void border border-border rounded text-[11px] font-semibold text-text focus:border-lilac outline-none cursor-pointer"
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="p-2.5 bg-void rounded-control border border-border/60 text-xs text-text-muted">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      rows={3}
                      className="w-full p-2 bg-surface border border-border rounded text-xs text-text outline-none focus:border-lilac"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button variant="primary" size="sm" onClick={() => handleSaveNotes(item.id)}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-1 text-[10px] text-text-muted/70">
                      <span>SCOUTING LOG ({item.updatedAt})</span>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setNoteText(item.notes);
                        }}
                        className="hover:text-text"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                    <p className="text-text italic">{item.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                <ConfidenceBadge level={item.confidence} />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/players/${item.playerId}`)}
                >
                  Full profile
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
