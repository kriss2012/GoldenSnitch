import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { Button } from '../common/Button';
import { esportsIntelligenceService } from '../../services/esportsIntelligenceService';

interface ClaimProfileModalProps {
  playerId: string;
  playerHandle: string;
  game: string;
  onClose: () => void;
  onClaimSuccess?: () => void;
}

export const ClaimProfileModal: React.FC<ClaimProfileModalProps> = ({
  playerId,
  playerHandle,
  game,
  onClose,
  onClaimSuccess,
}) => {
  const [method, setMethod] = useState<'riot_oauth' | 'steam_openid' | 'manual_review'>(
    game.toLowerCase().includes('cs') ? 'steam_openid' : 'riot_oauth'
  );
  const [verificationCode, setVerificationCode] = useState(
    `${game.toUpperCase().slice(0, 3)}-VERIFY-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [evidenceText, setEvidenceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await esportsIntelligenceService.submitClaim(playerId, {
        verification_method: method,
        verification_code: verificationCode,
        evidence_text: evidenceText,
      });
      setSuccessMsg(res.message || 'Ownership claim submitted for review.');
      if (onClaimSuccess) onClaimSuccess();
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit verification claim. Profile may already be claimed.');
    } finally {
      setIsLoading(false);
    }
  };

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
        aria-labelledby="claim-modal-title"
        className="relative w-full max-w-lg bg-surface border border-violet/30 rounded-xl shadow-2xl p-6 text-text animate-in fade-in zoom-in duration-200"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-text-muted hover:text-text hover:bg-surface-elevated p-1.5 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-violet/20 border border-violet/40 text-electric">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 id="claim-modal-title" className="text-lg font-bold text-text">Claim Competitive Profile</h3>
            <p className="text-xs text-text-muted">
              Verify ownership of <span className="text-electric font-semibold">{playerHandle}</span> ({playerId})
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-crimson/15 border border-crimson/30 rounded-lg text-crimson text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald/15 border border-emerald/30 rounded-lg text-emerald text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Verification Protocol
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('riot_oauth')}
                className={`p-2.5 text-xs rounded-lg border text-center transition-all ${
                  method === 'riot_oauth'
                    ? 'bg-violet/30 border-electric text-electric font-bold'
                    : 'bg-surface-elevated border-border text-text-muted hover:border-violet/40'
                }`}
              >
                Riot OAuth
              </button>
              <button
                type="button"
                onClick={() => setMethod('steam_openid')}
                className={`p-2.5 text-xs rounded-lg border text-center transition-all ${
                  method === 'steam_openid'
                    ? 'bg-violet/30 border-electric text-electric font-bold'
                    : 'bg-surface-elevated border-border text-text-muted hover:border-violet/40'
                }`}
              >
                Steam OpenID
              </button>
              <button
                type="button"
                onClick={() => setMethod('manual_review')}
                className={`p-2.5 text-xs rounded-lg border text-center transition-all ${
                  method === 'manual_review'
                    ? 'bg-violet/30 border-electric text-electric font-bold'
                    : 'bg-surface-elevated border-border text-text-muted hover:border-violet/40'
                }`}
              >
                Scout Review
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Deterministic Verification Token
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-elevated border border-border px-3 py-2 rounded-lg font-mono text-sm text-electric flex items-center justify-between">
                <span>{verificationCode}</span>
                <KeyRound size={16} className="text-text-muted" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setVerificationCode(
                    `${game.toUpperCase().slice(0, 3)}-VERIFY-${Math.floor(1000 + Math.random() * 9000)}`
                  )
                }
              >
                Regenerate
              </Button>
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              Add this token to your verified Riot bio or Steam profile summary during verification.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Proof & Supporting Evidence
            </label>
            <textarea
              rows={3}
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              placeholder="e.g. VCT Tracker profile link, official contract reference, or social media confirmation..."
              className="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-xs text-text focus:outline-none focus:border-violet placeholder:text-text-muted/50"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isLoading || !!successMsg}>
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" /> Submitting...
                </>
              ) : (
                'Submit Ownership Claim'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
