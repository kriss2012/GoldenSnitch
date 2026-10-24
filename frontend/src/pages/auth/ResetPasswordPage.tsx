import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Zap, Lock, Key, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const qToken = searchParams.get('token');
    if (qToken) {
      setToken(qToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide a valid password reset token.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await authService.resetPassword(token.trim(), newPassword);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Password reset failed. The token may be expired or already used.');
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
            Set new password
          </h1>
          <p className="text-xs text-text-muted">
            Enter your token and choose a secure password
          </p>
        </div>

        <div className="bg-surface/90 border border-border shadow-[0_8px_32px_rgba(0,0,0,0.7)] rounded-panel p-6 sm:p-8 space-y-6">
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-success/15 border border-success/30 rounded-control text-xs text-success flex flex-col items-center gap-2">
                <CheckCircle size={28} className="text-success" />
                <p className="font-bold text-sm">Password updated successfully</p>
                <p className="text-[11px] opacity-80">
                  Redirecting you to the sign-in screen in 3 seconds...
                </p>
              </div>
              <Link to="/login" className="inline-flex items-center text-xs text-lilac font-semibold hover:underline">
                Sign in now <ArrowRight size={14} className="ml-1" />
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
                <label className="block text-xs font-medium text-text-muted mb-1.5">Reset Token</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="rst_..."
                    className="w-full h-10 pl-9 pr-4 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none font-mono transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full h-10 pl-9 pr-4 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
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
                className="w-full mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Updating password...
                  </>
                ) : (
                  'Confirm new password'
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
