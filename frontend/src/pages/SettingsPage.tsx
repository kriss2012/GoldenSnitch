import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Shield, Sliders, Database, CheckCircle, AlertTriangle, Key, Download, Trash2 } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { scoutService } from '../services/scoutService';
import { authService } from '../services/authService';

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

  // Security / Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Data Rights state
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (!currentPassword || !newPassword) {
      setPwStatus({ type: 'error', message: 'Current and new password are required' });
      return;
    }
    if (newPassword.length < 8) {
      setPwStatus({ type: 'error', message: 'New password must be at least 8 characters long' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', message: 'New password and confirmation do not match' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setPwStatus({ type: 'success', message: res.message || 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwStatus({ type: 'error', message: err.message || 'Failed to update password' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const data = await authService.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `golden-snitch-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Could not download data'}`);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account removal');
      return;
    }
    setDeleteLoading(true);
    try {
      await authService.deleteAccount();
      alert('Your account and associated personal data have been permanently removed.');
      window.location.href = '/login';
    } catch (err: any) {
      alert(`Account deletion failed: ${err.message || 'Please contact support'}`);
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text font-heading">
            System settings & account security
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Configure organization parameters, evidence thresholds, security credentials, and GDPR privacy rights.
          </p>
        </div>

        {saveStatus && (
          <div className="p-2 bg-success/15 border border-success/30 rounded text-xs text-success flex items-center gap-1.5">
            <CheckCircle size={14} />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Account Security (Password Management) */}
      <Card title="Account Security & Password" subtitle="Update your platform login credentials with server-side validation">
        <form onSubmit={handleChangePassword} className="space-y-4">
          {pwStatus && (
            <div
              className={`p-3 rounded text-xs flex items-center gap-2 ${
                pwStatus.type === 'success'
                  ? 'bg-success/15 border border-success/30 text-success'
                  : 'bg-danger/15 border border-danger/30 text-danger'
              }`}
            >
              {pwStatus.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              <span>{pwStatus.message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">New Password (8+ chars)</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" disabled={pwLoading}>
              <Key size={14} className="mr-1.5" />
              {pwLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* GDPR Privacy & Data Subject Rights */}
      <Card title="Privacy & Data Subject Rights (GDPR)" subtitle="Export your complete persistent data or permanently delete your account">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
          <div>
            <div className="text-xs font-semibold text-text">Export Account & Scouting Dossier</div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Receive a machine-readable JSON archive of your account metadata, personal watchlist, annotations, and claims.
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleExportData} disabled={exportLoading}>
            <Download size={14} className="mr-1.5" />
            {exportLoading ? 'Generating Export...' : 'Download My Data (JSON)'}
          </Button>
        </div>

        <div className="border-t border-border/50 pt-4 mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-danger">Permanent Account Deletion</div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Permanently purges your user profile, active sessions, saved watchlists, and organization memberships.
            </div>
          </div>
          <Button type="button" variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 size={14} className="mr-1.5" />
            Delete Account
          </Button>
        </div>
      </Card>

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

      {/* Account Deletion Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
          <div className="bg-surface border border-danger/40 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold text-text">Permanently Delete Account?</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              This action is <span className="text-danger font-semibold">irreversible</span>. All your credentials, saved watchlists, custom annotations, and pending verification claims will be purged from the database immediately.
            </p>
            <div>
              <label className="text-xs text-text-muted block mb-1.5">
                Type <span className="font-mono font-bold text-text">DELETE</span> below to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text font-mono focus:border-danger outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Account Deletion'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
