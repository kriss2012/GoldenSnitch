import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Zap, Lock, User, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-void text-text flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-control bg-gradient-to-br from-violet to-lilac p-[2px] shadow-[0_0_20px_rgba(155,48,255,0.45)] mb-2">
            <div className="w-full h-full bg-[#18002e] rounded-[6px] flex items-center justify-center">
              <Zap size={24} className="text-lilac" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-text">
            Golden Snitch
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            Esports Multi-Roster Intelligence & Scouting Workspace
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-surface/90 border border-border shadow-[0_8px_32px_rgba(0,0,0,0.7)] rounded-panel p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-heading text-text">Account sign in</h2>
            <p className="text-xs text-text-muted">Enter your organizational credentials to continue.</p>
          </div>

          {error && (
            <div className="p-3 bg-danger/15 border border-danger/30 rounded-control text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. maya"
                  className="w-full h-10 pl-9 pr-4 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none transition-colors"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-text-muted">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-lilac hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none transition-colors"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-violet focus:ring-lilac bg-void cursor-pointer"
                />
                <span>Remember session</span>
              </label>
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
                  Verifying credentials...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-border/60 space-y-2">
            <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider block">
              Quick demo accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('maya', 'admin123')}
                className="p-2 rounded bg-void/60 border border-border hover:border-violet/60 text-left transition-colors"
              >
                <div className="font-bold text-text text-[11px]">Maya (GM)</div>
                <div className="text-[10px] text-text-muted">admin123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('dev', 'coach123')}
                className="p-2 rounded bg-void/60 border border-border hover:border-violet/60 text-left transition-colors"
              >
                <div className="font-bold text-text text-[11px]">Dev (Coach)</div>
                <div className="text-[10px] text-text-muted">coach123</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('arjun', 'scout123')}
                className="p-2 rounded bg-void/60 border border-border hover:border-violet/60 text-left transition-colors"
              >
                <div className="font-bold text-text text-[11px]">Arjun (Scout)</div>
                <div className="text-[10px] text-text-muted">scout123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-text-muted">
          Need an analyst account?{' '}
          <Link to="/register" className="text-lilac hover:underline font-medium">
            Register new scout
          </Link>
        </p>
      </div>
    </div>
  );
};
