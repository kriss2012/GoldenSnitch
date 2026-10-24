import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Lock, User, Mail, Shield, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ROLE_SCOUT');
  const [organization, setOrganization] = useState('Logic Legend Esports');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await register(username.trim().toLowerCase(), name.trim(), password, role, organization);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. A user with this username may already exist.');
    } finally {
      setIsLoading(false);
    }
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
            Create an esports analyst or scout profile
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-surface/90 border border-border shadow-[0_8px_32px_rgba(0,0,0,0.7)] rounded-panel p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-heading text-text">Register account</h2>
            <p className="text-xs text-text-muted">Join the multi-roster scouting network.</p>
          </div>

          {error && (
            <div className="p-3 bg-danger/15 border border-danger/30 rounded-control text-xs text-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full h-10 pl-9 pr-4 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">
                Username / Call-handle
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_scout"
                  className="w-full h-10 pl-9 pr-4 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none cursor-pointer"
                >
                  <option value="ROLE_SCOUT">Talent Scout</option>
                  <option value="ROLE_COACH">Coach</option>
                  <option value="ROLE_MANAGER">Team Manager</option>
                  <option value="ROLE_GM">General Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Org name"
                  className="w-full h-10 px-3 bg-void border border-border rounded-control text-xs text-text focus:border-lilac outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-10 pl-9 pr-4 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
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
                  Creating account...
                </>
              ) : (
                <>
                  Complete registration <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-text-muted">
          Already registered?{' '}
          <Link to="/login" className="text-lilac hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
