import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, User, LogOut } from 'lucide-react';
import { GameTitle } from '../../types';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenMobileNav: () => void;
  selectedGame: GameTitle;
  onSelectGame: (g: GameTitle) => void;
}

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

  // Compute breadcrumb/title from path
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.startsWith('/scouting')) return 'Scouting workspace';
    if (p.startsWith('/players/')) return 'Player profile';
    if (p.startsWith('/players')) return 'Player database';
    if (p.startsWith('/compare')) return 'Player comparison';
    if (p.startsWith('/rosters')) return 'Multi-roster management';
    if (p.startsWith('/synergy')) return 'Squad synergy simulator';
    if (p.startsWith('/watchlist')) return 'Recruitment pipeline';
    if (p.startsWith('/reports')) return 'Scouting reports';
    if (p.startsWith('/settings')) return 'System settings';
    return 'Analyst overview';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/players?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-surface border-b border-border flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0 select-none">
      {/* Left: Mobile Menu Toggle + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-text-muted hover:text-text rounded-control border border-border bg-surface shrink-0 focus-visible:outline-lilac"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-bold text-text truncate font-heading">
              {getPageTitle()}
            </h2>
            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-violet/20 border border-violet/40 text-lilac shadow-[0_0_10px_rgba(155,48,255,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
              Golden Snitch Engine
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Global Search (Responsive) */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players, handles, or roles..."
            className="w-full h-9 pl-9 pr-4 bg-void border border-border rounded-control text-xs text-text placeholder-text-muted/60 focus:border-lilac outline-none transition-colors"
          />
        </form>
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Game Selector */}
        <select
          value={selectedGame}
          onChange={(e) => onSelectGame(e.target.value as GameTitle)}
          className="h-9 px-2.5 bg-void border border-border rounded-control text-xs font-medium text-text focus:border-lilac outline-none cursor-pointer"
          aria-label="Select competitive game title"
        >
          <option value="VALORANT">VALORANT</option>
          <option value="Counter-Strike 2">CS2</option>
          <option value="League of Legends">LoL</option>
          <option value="Dota 2">Dota 2</option>
          <option value="Apex Legends">Apex Legends</option>
        </select>

        {/* Notifications Dropdown (Critical Issue A) */}
        <NotificationDropdown />

        {/* User Profile Menu with Dynamic Auth & Logout */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 h-9 px-2 rounded-control border border-border hover:border-violet/40 hover:bg-surface transition-colors"
            aria-label="User profile menu"
          >
            <div className="w-6 h-6 rounded-full bg-violet text-white flex items-center justify-center text-xs font-bold shadow-[0_0_8px_rgba(155,48,255,0.4)]">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={13} />}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-text">
              {user ? user.name : 'Sign in'}
            </span>
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-surface/95 backdrop-blur-md border border-border rounded-panel shadow-[0_8px_32px_rgba(0,0,0,0.8)] p-2 z-50 text-xs"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-3 py-2 border-b border-border/60">
                <p className="font-semibold text-text truncate">{user?.name || 'Guest User'}</p>
                <p className="text-text-muted text-[11px] truncate">
                  {user?.organization || 'Logic Legend Esports'}
                </p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-violet/20 border border-violet/40 text-lilac font-mono">
                  {user?.role || 'ROLE_ANALYST'}
                </span>
              </div>
              <div className="pt-1 space-y-0.5">
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-3 py-1.5 text-text-muted hover:text-text hover:bg-void rounded-control transition-colors"
                >
                  System settings
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="w-full text-left px-3 py-1.5 text-text-muted hover:text-text hover:bg-void rounded-control transition-colors"
                >
                  Compliance audit
                </button>
                <div className="border-t border-border/50 my-1" />
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-1.5 text-danger hover:bg-danger/10 rounded-control flex items-center gap-1.5 transition-colors font-medium"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
