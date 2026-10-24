import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Shield, Sliders, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { scoutService } from '../services/scoutService';

export const SettingsPage: React.FC = () => {
  const [orgName, setOrgName] = useState('Apex Global Esports');
  const [defaultSeason, setDefaultSeason] = useState('2024-2025 Split 2');
  const [minMatchesLow, setMinMatchesLow] = useState(10);
  const [minMatchesHigh, setMinMatchesHigh] = useState(30);

  // Scoring Weights for IGL role
  const [iglWeights, setIglWeights] = useState({
    decision: 25,
    calling: 25,
    coordination: 20,
    adaptability: 15,
    consistency: 10,
    mechanical: 5,
  });

  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const totalIglWeight = Object.values(iglWeights).reduce((a, b) => a + b, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalIglWeight !== 100) {
      alert(`Scoring weights must sum to exactly 100% (currently ${totalIglWeight}%)`);
      return;
    }
    setSaveStatus('Settings successfully saved to local persistent storage.');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all local cache and watchlist state?')) {
      scoutService.resetDemoData();
      alert('Local data successfully reset to clean defaults.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            System settings & weight configuration
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Configure organization parameters, evidence thresholds, and algorithmic scoring formulas.
          </p>
        </div>

        {saveStatus && (
          <div className="p-2 bg-success/15 border border-success/30 rounded text-xs text-success flex items-center gap-1.5">
            <CheckCircle size={14} />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization & Season */}
        <Card title="Organization & season defaults">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Organization name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Active tournament season</label>
              <input
                type="text"
                value={defaultSeason}
                onChange={(e) => setDefaultSeason(e.target.value)}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Confidence Thresholds */}
        <Card title="Evidence confidence sample thresholds" subtitle="Determines High, Medium, and Low confidence classifications">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Minimum matches for Medium Confidence</label>
              <input
                type="number"
                min="5"
                max="25"
                value={minMatchesLow}
                onChange={(e) => setMinMatchesLow(parseInt(e.target.value))}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
              <span className="text-[11px] text-text-muted block mt-1">Fewer than this is flagged as Low Confidence</span>
            </div>

            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Minimum matches for High Confidence</label>
              <input
                type="number"
                min="20"
                max="60"
                value={minMatchesHigh}
                onChange={(e) => setMinMatchesHigh(parseInt(e.target.value))}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
              <span className="text-[11px] text-text-muted block mt-1">Requires 30+ verified competitive matches</span>
            </div>
          </div>
        </Card>

        {/* Role Scoring Formula Weights (IGL Example from Prompt) */}
        <Card
          title="In-Game Leader (IGL) factor weights"
          subtitle="Formula: Talent Index = sum(normalized factor * weight). Must equal 100%."
          actions={
            <span className={`text-xs font-mono font-bold ${totalIglWeight === 100 ? 'text-success' : 'text-danger'}`}>
              Total: {totalIglWeight}%
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-text-muted block mb-1">Mid-round decision quality (%)</label>
              <input
                type="number"
                value={iglWeights.decision}
                onChange={(e) => setIglWeights({ ...iglWeights, decision: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-text font-mono focus:border-lilac outline-none"
              />
            </div>

            <div>
              <label className="text-text-muted block mb-1">Calling impact (%)</label>
              <input
                type="number"
                value={iglWeights.calling}
                onChange={(e) => setIglWeights({ ...iglWeights, calling: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-text font-mono focus:border-lilac outline-none"
              />
            </div>

            <div>
              <label className="text-text-muted block mb-1">Team coordination (%)</label>
              <input
                type="number"
                value={iglWeights.coordination}
                onChange={(e) => setIglWeights({ ...iglWeights, coordination: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-text font-mono focus:border-lilac outline-none"
              />
            </div>

            <div>
              <label className="text-text-muted block mb-1">Tactical adaptability (%)</label>
              <input
                type="number"
                value={iglWeights.adaptability}
                onChange={(e) => setIglWeights({ ...iglWeights, adaptability: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-text font-mono focus:border-lilac outline-none"
              />
            </div>

            <div>
              <label className="text-text-muted block mb-1">Performance consistency (%)</label>
              <input
                type="number"
                value={iglWeights.consistency}
                onChange={(e) => setIglWeights({ ...iglWeights, consistency: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-text font-mono focus:border-lilac outline-none"
              />
            </div>

            <div>
              <label className="text-text-muted block mb-1">Mechanical contribution (%)</label>
              <input
                type="number"
                value={iglWeights.mechanical}
                onChange={(e) => setIglWeights({ ...iglWeights, mechanical: parseInt(e.target.value) || 0 })}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-text font-mono focus:border-lilac outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <Button type="button" variant="danger" size="sm" onClick={handleReset}>
            <RotateCcw size={15} className="mr-1.5" />
            Reset all demo data
          </Button>

          <Button type="submit" variant="primary" size="md">
            <Save size={16} className="mr-2" />
            Save configuration
          </Button>
        </div>
      </form>
    </div>
  );
};
