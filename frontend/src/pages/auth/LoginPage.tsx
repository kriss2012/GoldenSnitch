import React, { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoldenSnitchLogo } from '../../components/common/GoldenSnitchLogo';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname || location.state?.from || '/app/dashboard';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both work email and password.');
      return;
    }

    setError('');
    setBusy(true);

    try {
      await login(email.trim(), password);
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      if (err?.status === 429) {
        setError('Too many attempts. Try again in a few minutes.');
      } else if (err?.status && err.status < 500) {
        setError('Incorrect email or password.');
      } else {
        setError(err?.message || 'Something went wrong. Please check your credentials and try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-[#0B0B0B] text-[#F5F5F5] select-none">
      {/* Left Branding Showcase Column */}
      <section className="hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-[#101010] border-r border-[#353535] relative overflow-hidden">
        {/* Ambient Subtle Glow */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#F5B83D]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-[#82EAF4]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <GoldenSnitchLogo size={42} layout="icon-only" />
            <div className="flex items-baseline font-heading tracking-tight">
              <span className="font-black italic text-[#F5B83D] text-2xl tracking-tighter">GOLDEN</span>
              <span className="font-black italic text-[#F5F5F5] text-2xl tracking-tighter ml-1.5">SNITCH</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#242424] border border-[#353535] text-xs font-mono text-[#82EAF4] mb-6">
            <span>✦</span> OFFICIAL ESPORTS INTELLIGENCE
          </div>
          <h2 className="font-heading text-4xl xl:text-5xl font-extrabold leading-tight text-[#F5F5F5]">
            Scout the player your team{' '}
            <span className="text-[#82EAF4]">actually needs.</span>
          </h2>
          <p className="mt-6 text-[#B8B8B8] text-base leading-relaxed">
            Multi-roster command center for elite esports organizations. Deterministic algorithmic fit scoring, 
            telemetry tracking, counterfactual synergy simulations, and cryptographically verified decision audit trails.
          </p>
        </div>

        <div className="relative z-10 pt-6 border-t border-[#353535] flex items-center justify-between text-xs text-[#777777] font-mono">
          <span>SECURE SYSTEM AUTHENTICATION</span>
          <span>ENTERPRISE RBAC ACTIVE</span>
        </div>
      </section>

      {/* Right Login Form Column */}
      <section className="flex flex-col justify-center items-center p-6 sm:p-10 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile Brand */}
          <div className="text-center lg:text-left space-y-4">
            <div className="flex justify-center lg:justify-start">
              <GoldenSnitchLogo size={64} layout="icon-only" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#F5F5F5] tracking-tight">
                Sign in
              </h1>
              <p className="text-xs sm:text-sm text-[#B8B8B8] mt-1.5">
                Access is restricted to authorized organizational personnel.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider">
                Work Email or Account
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type="text"
                  name="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@team.gg"
                  className="w-full h-11 pl-10 pr-4 bg-[#242424] border border-[#353535] rounded-xl text-sm text-[#F5F5F5] placeholder-[#555555] focus:border-[#82EAF4] focus:ring-1 focus:ring-[#82EAF4] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#82EAF4] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777777]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-12 bg-[#242424] border border-[#353535] rounded-xl text-sm text-[#F5F5F5] placeholder-[#555555] focus:border-[#82EAF4] focus:ring-1 focus:ring-[#82EAF4] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#82EAF4] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy || !email || !password}
              className="w-full h-12 bg-[#82EAF4] text-[#0B0B0B] font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-[#64E8F2] active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(130,234,244,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <Loader2 size={18} className="animate-spin text-[#0B0B0B]" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>

            <div className="pt-2 text-center space-y-3">
              <p className="text-xs text-[#777777]">
                Access is by invitation from your organisation's General Manager.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#B8B8B8] hover:text-[#82EAF4] transition-colors font-medium"
              >
                <ArrowLeft size={14} /> Back to overview
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
