import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; dev_reset_token?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username or email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.forgotPassword(username.trim());
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Unable to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-text flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-control bg-gradient-to-br from-violet to-lilac p-[2px] shadow-[0_0_20px_rgba(155,48,255,0.45)] mb-2">
            <div className="w-full h-full bg-[#18002e] rounded-[6px] flex items-center justify-center">
              <Zap size={24} className="text-lilac" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-heading text-text">
            Reset password
          </h1>
          <p className="text-xs text-text-muted">
            Recover access to your Golden Snitch account
          </p>
        </div>

        <div className="bg-surface/90 border border-border shadow-[0_8px_32px_rgba(0,0,0,0.7)] rounded-panel p-6 sm:p-8 space-y-6">
          {result ? (
            <div className="space-y-4">
              <div className="p-3 bg-success/15 border border-success/30 rounded-control text-xs text-success flex items-start gap-2">
                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{result.message}</p>
                  <p className="text-[11px] opacity-80 mt-1">
                    An expiring security token has been generated for your account.
                  </p>
                </div>
              </div>

              {result.dev_reset_token && (
                <div className="p-3 bg-void/80 border border-border rounded-control space-y-2">
                  <div className="text-[11px] text-lilac font-mono uppercase font-bold">
                    Development Reset Token
                  </div>
                  <code className="block p-2 bg-black/60 rounded text-[11px] font-mono break-all text-text-muted">
                    {result.dev_reset_token}
                  </code>
                  <Link
                    to={`/reset-password?token=${encodeURIComponent(result.dev_reset_token)}`}
                    className="inline-flex items-center gap-1.5 text-xs text-lilac font-semibold hover:underline"
                  >
                    Proceed to reset password <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-2 text-xs text-text-muted hover:text-text"
              >
                <ArrowLeft size={14} className="mr-1" /> Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-danger/15 border border-danger/30 rounded-control text-xs text-danger">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Account Username or Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. arjun"
                    className="w-full h-10 pl-9 pr-4 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Generating token...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs text-text-muted hover:text-text transition-colors"
                >
                  <ArrowLeft size={14} className="mr-1.5" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
