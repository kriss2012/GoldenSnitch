import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { GoldenSnitchLogo } from '../../components/common/GoldenSnitchLogo';

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
      navigate('/app/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. A user with this username may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#82EAF4]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header with official Golden Snitch logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block transition-transform hover:scale-105">
            <GoldenSnitchLogo layout="vertical" size={56} showText={true} />
          </Link>
          <p className="text-xs sm:text-sm text-[#B8B8B8] mt-2">
            Create an esports analyst or scout profile
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-[#242424] border border-[#353535] shadow-[0_16px_48px_rgba(0,0,0,0.6)] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold font-heading text-[#F5F5F5]">Register account</h2>
            <p className="text-xs text-[#B8B8B8]">Join the multi-roster scouting network.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#B8B8B8] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#788B8D]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full h-10 pl-9 pr-4 bg-[#1A1A1A] border border-[#353535] rounded-xl text-xs text-[#F5F5F5] placeholder-[#788B8D]/60 focus:border-[#82EAF4] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8B8B8] mb-1.5">
                Username / Call-handle
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#788B8D]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_scout"
                  className="w-full h-10 pl-9 pr-4 bg-[#1A1A1A] border border-[#353535] rounded-xl text-xs text-[#F5F5F5] placeholder-[#788B8D]/60 focus:border-[#82EAF4] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#B8B8B8] mb-1.5">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 px-3 bg-[#1A1A1A] border border-[#353535] rounded-xl text-xs text-[#F5F5F5] focus:border-[#82EAF4] outline-none cursor-pointer"
                >
                  <option value="ROLE_SCOUT">Talent Scout</option>
                  <option value="ROLE_COACH">Coach</option>
                  <option value="ROLE_MANAGER">Team Manager</option>
                  <option value="ROLE_GM">General Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B8B8] mb-1.5">Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Org name"
                  className="w-full h-10 px-3 bg-[#1A1A1A] border border-[#353535] rounded-xl text-xs text-[#F5F5F5] focus:border-[#82EAF4] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8B8B8] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#788B8D]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-10 pl-9 pr-4 bg-[#1A1A1A] border border-[#353535] rounded-xl text-xs text-[#F5F5F5] placeholder-[#788B8D]/60 focus:border-[#82EAF4] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B8B8B8] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#788B8D]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-10 pl-9 pr-4 bg-[#1A1A1A] border border-[#353535] rounded-xl text-xs text-[#F5F5F5] placeholder-[#788B8D]/60 focus:border-[#82EAF4] outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              className="w-full mt-2 bg-[#82EAF4] text-[#0B0B0B] hover:bg-[#82EAF4]/90 font-bold py-2.5 rounded-xl shadow-[0_0_15px_rgba(130,234,244,0.3)] transition-all"
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
        <p className="text-center text-xs text-[#B8B8B8]">
          Already registered?{' '}
          <Link to="/login" className="text-[#82EAF4] hover:underline font-medium">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
