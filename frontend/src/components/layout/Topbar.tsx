import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, User, LogOut, ChevronDown, Gamepad2 } from 'lucide-react';
import { GameTitle } from '../../types';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenMobileNav: () => void;
  selectedGame: GameTitle;
  onSelectGame: (g: GameTitle) => void;
}

const SUPPORTED_GAMES: GameTitle[] = ['VALORANT', 'Counter-Strike 2', 'League of Legends', 'Dota 2'];

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileNav,
  selectedGame,
  onSelectGame,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/players?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-[#101010] border-b border-[#353535] flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0 select-none">
      {/* Left: Mobile Menu Toggle + User Greeting */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-[#B8B8B8] hover:text-[#F5F5F5] rounded-xl border border-[#353535] bg-[#242424] shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-[#F5F5F5]">
              Hi, {user?.name || 'Analyst'}!
            </span>
            <span className="hidden sm:inline-block text-xs text-[#B8B8B8]">
              Golden Snitch live esports intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Center: Game Switcher Pills */}
      <div className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#242424] border border-[#353535]">
        {SUPPORTED_GAMES.map((g) => {
          const isSelected = selectedGame === g;
          return (
            <button
              key={g}
              onClick={() => onSelectGame(g)}
              className={`px-3.5 py-1 text-xs font-semibold rounded-full transition-all duration-150 ${
                isSelected
                  ? 'bg-[#2B2B2B] text-[#82EAF4] border border-[#82EAF4]/40 shadow-[0_0_10px_rgba(130,234,244,0.25)]'
                  : 'text-[#B8B8B8] hover:text-[#F5F5F5] hover:bg-[#2B2B2B]/50'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Right: Search + Notifications + User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players, rosters..."
            className="w-full h-9 pl-9 pr-3 rounded-full bg-[#242424] border border-[#353535] text-xs text-[#F5F5F5] placeholder-[#777777] focus:border-[#82EAF4] focus:outline-none focus:ring-1 focus:ring-[#82EAF4] transition-all"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[#777777]" />
        </form>

        {/* Live Notification Dropdown */}
        <NotificationDropdown />

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-[#242424] border border-[#353535] hover:border-[#82EAF4]/50 transition-colors"
            aria-label="User account menu"
            aria-expanded={showUserMenu}
          >
            <div className="w-7 h-7 rounded-full bg-[#82EAF4]/20 border border-[#82EAF4]/40 flex items-center justify-center text-[#82EAF4] font-bold text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-semibold text-[#F5F5F5] block leading-none">
                {user?.name || 'Staff User'}
              </span>
              <span className="text-[10px] text-[#82EAF4] font-mono block mt-0.5">
                {user?.role ? user.role.replace('ROLE_', '') : 'Analyst'}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#B8B8B8]" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#242424] border border-[#353535] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="p-2 border-b border-[#353535] mb-1">
                <p className="text-xs font-semibold text-[#F5F5F5] truncate">{user?.name || 'Staff User'}</p>
                <p className="text-[11px] font-mono text-[#B8B8B8] truncate">{user?.username || 'user'}</p>
                <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#82EAF4]/15 text-[#82EAF4] border border-[#82EAF4]/30">
                  {user?.role || 'ROLE_ANALYST'}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#B8B8B8] hover:text-[#F5F5F5] hover:bg-[#2B2B2B] transition-colors"
              >
                <User size={14} className="text-[#82EAF4]" />
                <span>Account & Rights</span>
              </button>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors mt-1"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
