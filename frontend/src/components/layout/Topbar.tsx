import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, User, LogOut, ChevronDown, Gamepad2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { GameTitle } from '../../types';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenMobileNav: () => void;
  selectedGame: GameTitle;
  onSelectGame: (g: GameTitle) => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}

const SUPPORTED_GAMES: GameTitle[] = ['VALORANT', 'Counter-Strike 2', 'League of Legends', 'Dota 2'];

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileNav,
  selectedGame,
  onSelectGame,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse,
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
    <header className="h-[72px] px-4 md:px-6 bg-[#0E0E0E] border-b border-[#222222] flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0 select-none">
      {/* 1. Left: Sidebar Toggle + Golden Snitch Brand with Emblem */}
      <div className="flex items-center gap-3.5 shrink-0">
        {/* Sidebar Toggle (Mobile + Desktop) */}
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-[#B8B8B8] hover:text-[#F5F5F5] rounded-xl border border-[#2C2C2C] bg-[#181818] shrink-0 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu size={20} />
        </button>

        {onToggleDesktopCollapse && (
          <button
            onClick={onToggleDesktopCollapse}
            className="hidden lg:flex w-9 h-9 items-center justify-center text-[#999999] hover:text-[#82EAF4] hover:bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] transition-colors shrink-0"
            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={18} />
          </button>
        )}

        {/* Golden Snitch Logo & Brand Title */}
        <div 
          onClick={() => navigate('/app/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Golden Snitch — Esports Intelligence"
        >
          <img
            src="/assets/golden-snitch/golden-snitch-winged.png"
            alt="Golden Snitch"
            className="h-8 sm:h-9 w-auto max-w-[56px] object-contain drop-shadow-[0_0_12px_rgba(245,184,61,0.55)] group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-base font-extrabold italic text-[#F5B83D] tracking-wide font-heading leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              GOLDEN SNITCH
            </h1>
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#9E9E9E] uppercase block mt-0.5">
              ESPORTS INTELLIGENCE
            </span>
          </div>
        </div>
      </div>

      {/* 2. Center-Left: Game Navigation Switcher Pills */}
      <div className="hidden xl:flex items-center gap-1.5 p-1 rounded-full bg-[#141414] border border-[#262626]">
        {/* VALORANT */}
        <button
          onClick={() => onSelectGame('VALORANT')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedGame === 'VALORANT'
              ? 'bg-[#0E2024] border border-[#82EAF4] text-[#82EAF4] shadow-[0_0_12px_rgba(130,234,244,0.3)]'
              : 'text-[#B0B0B0] hover:text-[#FFFFFF] hover:bg-[#1C1C1C]'
          }`}
        >
          <img src="/assets/golden-snitch/icon-game-valorant-transparent.png" alt="Valorant" className="w-3.5 h-3.5 object-contain" />
          <span>VALORANT</span>
        </button>

        {/* Counter-Strike 2 */}
        <button
          onClick={() => onSelectGame('Counter-Strike 2')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedGame === 'Counter-Strike 2'
              ? 'bg-[#0E2024] border border-[#82EAF4] text-[#82EAF4] shadow-[0_0_12px_rgba(130,234,244,0.3)]'
              : 'text-[#B0B0B0] hover:text-[#FFFFFF] hover:bg-[#1C1C1C]'
          }`}
        >
          <img src="/assets/golden-snitch/icon-game-cs2-transparent.png" alt="CS2" className="w-3.5 h-3.5 object-contain" />
          <span>CS2</span>
        </button>

        {/* League of Legends */}
        <button
          onClick={() => onSelectGame('League of Legends')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedGame === 'League of Legends'
              ? 'bg-[#0E2024] border border-[#82EAF4] text-[#82EAF4] shadow-[0_0_12px_rgba(130,234,244,0.3)]'
              : 'text-[#B0B0B0] hover:text-[#FFFFFF] hover:bg-[#1C1C1C]'
          }`}
        >
          <img src="/assets/golden-snitch/icon-game-lol-transparent.png" alt="LoL" className="w-3.5 h-3.5 object-contain" />
          <span>League of Legends</span>
        </button>

        {/* Dota 2 */}
        <button
          onClick={() => onSelectGame('Dota 2')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedGame === 'Dota 2'
              ? 'bg-[#0E2024] border border-[#82EAF4] text-[#82EAF4] shadow-[0_0_12px_rgba(130,234,244,0.3)]'
              : 'text-[#B0B0B0] hover:text-[#FFFFFF] hover:bg-[#1C1C1C]'
          }`}
        >
          <img src="/assets/golden-snitch/icon-game-dota2-transparent.png" alt="Dota 2" className="w-3.5 h-3.5 object-contain" />
          <span>Dota 2</span>
        </button>
      </div>

      {/* Mobile Title Selector */}
      <div className="xl:hidden relative shrink-0">
        <select
          value={selectedGame}
          onChange={(e) => onSelectGame(e.target.value as GameTitle)}
          className="h-8.5 pl-2.5 pr-7 rounded-full bg-[#181818] border border-[#303030] text-xs font-bold text-[#82EAF4] focus:outline-none focus:border-[#82EAF4] appearance-none cursor-pointer"
          aria-label="Select game title"
        >
          {SUPPORTED_GAMES.map((g) => (
            <option key={g} value={g} className="bg-[#181818] text-white">{g}</option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-3 text-[#888888] pointer-events-none" />
      </div>

      {/* 3. Right: Wide Global Search Field + Notification Bell + User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Global Search Bar with Ctrl K Badge */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:flex items-center w-56 lg:w-72 xl:w-80">
          <div className="w-full h-10 pl-9 pr-14 rounded-full bg-[#161616] border border-[#2B2B2B] hover:border-[#3D3D3D] focus-within:border-[#82EAF4] focus-within:ring-1 focus-within:ring-[#82EAF4] transition-all flex items-center">
            <Search size={15} className="absolute left-3 text-[#777777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players, teams, rosters..."
              className="w-full bg-transparent text-xs text-[#F5F5F5] placeholder-[#777777] outline-none"
            />
            <div className="absolute right-2.5 flex items-center gap-1 bg-[#222222] border border-[#333333] text-[10px] text-[#888888] font-mono px-1.5 py-0.5 rounded shadow-sm">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          </div>
        </form>

        {/* Notification Bell */}
        <NotificationDropdown />

        {/* User Account Avatar & Name matching Image 1 (Maya Lin · GM) */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 pr-2 rounded-full bg-[#161616] border border-[#2B2B2B] hover:border-[#82EAF4]/50 transition-colors"
            aria-label="User account menu"
            aria-expanded={showUserMenu}
          >
            {/* Teal Circular Avatar with M */}
            <div className="w-8 h-8 rounded-full bg-[#0E7490] border border-[#22D3EE]/30 flex items-center justify-center text-[#FFFFFF] font-bold text-xs shadow-inner">
              {user?.name ? user.name[0].toUpperCase() : 'M'}
            </div>

            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-bold text-[#F5F5F5] block">
                {user?.name || 'Maya Lin'}
              </span>
              <span className="text-[10px] text-[#888888] font-semibold block mt-0.5">
                {user?.role ? user.role.replace('ROLE_', '') : 'GM'}
              </span>
            </div>

            <ChevronDown size={13} className="text-[#888888] ml-0.5" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#1A1A1A] border border-[#353535] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="p-2 border-b border-[#303030] mb-1">
                <p className="text-xs font-semibold text-[#F5F5F5] truncate">{user?.name || 'Maya Lin'}</p>
                <p className="text-[11px] font-mono text-[#888888] truncate">{user?.username || 'maya'}</p>
                <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#82EAF4]/15 text-[#82EAF4] border border-[#82EAF4]/30">
                  {user?.role || 'GM'}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#B8B8B8] hover:text-[#F5F5F5] hover:bg-[#252525] transition-colors"
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
