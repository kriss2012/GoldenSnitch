import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { esportsIntelligenceService } from '../../services/esportsIntelligenceService';

interface ReportDisputeModalProps {
  playerId: string;
  playerHandle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportDisputeModal: React.FC<ReportDisputeModalProps> = ({
  playerId,
  playerHandle,
  onClose,
  onSuccess,
}) => {
  const [issueType, setIssueType] = useState('incorrect_stats');
  const [fieldName, setFieldName] = useState('');
  const [reportedValue, setReportedValue] = useState('');
  const [correctValue, setCorrectValue] = useState('');
  const [justification, setJustification] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) {
      setStatus({ type: 'error', message: 'Please provide a clear justification or explanation of the inaccuracy.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await esportsIntelligenceService.submitCorrectionRequest(playerId, {
        issue_type: issueType,
        field_name: fieldName || undefined,
        reported_value: reportedValue || undefined,
        correct_value: correctValue || undefined,
        justification,
        evidence_url: evidenceUrl || undefined,
      });
      setStatus({ type: 'success', message: res.message || 'Correction dispute submitted for review.' });
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to submit correction request' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dispute-modal-title"
        className="relative w-full max-w-lg bg-surface border border-violet/30 rounded-xl shadow-2xl p-6 text-text"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors p-1.5 rounded-lg hover:bg-surface-elevated"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-warning/15 text-warning border border-warning/30">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 id="dispute-modal-title" className="text-lg font-bold text-text">Report Data Inaccuracy or Dispute</h2>
            <p className="text-xs text-text-muted">
              Submit a formal correction request for candidate <span className="text-lilac font-semibold">{playerHandle}</span>
            </p>
          </div>
        </div>

        {status && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 mb-4 ${
              status.type === 'success'
                ? 'bg-success/15 border border-success/30 text-success'
                : 'bg-danger/15 border border-danger/30 text-danger'
            }`}
          >
            {status.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">Issue Category</label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
            >
              <option value="incorrect_stats">Inaccurate Statistics or Match Telemetry</option>
              <option value="wrong_affiliation">Outdated or Incorrect Team Roster Affiliation</option>
              <option value="impersonation">Impersonation or Mismatched Account Identity</option>
              <option value="stale_data">Data Significantly Outdated / Missing Recent Matches</option>
              <option value="other">Other Inquiry / Profile Dispute</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Metric or Field Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. ADR, KAST, Current Team"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1">Claimed Correct Value (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 165.4 ADR or Sentinels"
                value={correctValue}
                onChange={(e) => setCorrectValue(e.target.value)}
                className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">
              Justification & Detailed Notes <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Explain why the current data is inaccurate with supporting competitive context..."
              className="w-full p-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none resize-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted block mb-1">Evidence or Match URL (Optional)</label>
            <input
              type="url"
              placeholder="https://www.vlr.gg/match/... or official tournament link"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="w-full h-9 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
