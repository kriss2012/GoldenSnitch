import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Users,
  Scale,
  Shield,
  Zap,
  BookmarkCheck,
  FileText,
  Settings,
  Building2,
  Database,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Gamepad2
} from 'lucide-react';

import { GoldenSnitchLogo } from '../common/GoldenSnitchLogo';
import { GameTitle } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  selectedGame?: GameTitle;
  onSelectGame?: (g: GameTitle) => void;
}

const NAV_ITEMS = [
  { path: '/app/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/app/scouting', label: 'Scout Players', icon: Compass },
  { path: '/app/players', label: 'Player Database', icon: Users },
  { path: '/app/compare', label: 'Comparison', icon: Scale },
  { path: '/app/rosters', label: 'Rosters & Vacancies', icon: Shield },
  { path: '/app/synergy', label: 'Roster Synergy', icon: Zap },
  { path: '/app/watchlist', label: 'Watchlist', icon: BookmarkCheck },
  { path: '/app/reports', label: 'Scouting Reports', icon: FileText },
  { path: '/app/organization', label: 'Organization', icon: Building2 },
  { path: '/app/data-sources', label: 'Data Sources & LAN', icon: Database },
  { path: '/app/settings', label: 'Settings', icon: Settings },
];

const SUPPORTED_GAMES: GameTitle[] = ['VALORANT', 'Counter-Strike 2', 'League of Legends', 'Dota 2'];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse,
  selectedGame,
  onSelectGame,
}) => {
  const content = (
    <aside
      className={`h-full flex flex-col bg-[#101010] border-r border-[#353535] transition-all duration-200 select-none ${
        isMobile ? 'w-72 shadow-2xl z-50' : isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className={`h-16 px-3.5 flex items-center border-b border-[#353535] shrink-0 ${
        isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
      }`}>
        <Link to="/app/dashboard" className="flex items-center gap-2.5 min-w-0" title="Golden Snitch Esports Intelligence">
          <GoldenSnitchLogo size={isCollapsed && !isMobile ? 32 : 36} layout="icon-only" />
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black italic tracking-tight text-[#F5F5F5] font-heading leading-none truncate">
                  <span className="text-[#F5B83D]">GOLDEN</span> SNITCH
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#82EAF4]/15 text-[#82EAF4] border border-[#82EAF4]/40 rounded-full">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-[#B8B8B8] font-semibold tracking-wider uppercase block mt-0.5">
                Esports Intelligence
              </span>
            </div>
          )}
        </Link>

        {isMobile && (
          <button
            onClick={onClose}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#B8B8B8] hover:text-[#F5F5F5] rounded-xl hover:bg-[#2B2B2B] transition-colors"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        )}

        {!isMobile && onToggleCollapse && !isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center text-[#8E8E8E] hover:text-[#82EAF4] hover:bg-[#202020] rounded-lg transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Mobile-Only Game Switcher */}
      {isMobile && selectedGame && onSelectGame && (
        <div className="p-3 border-b border-[#353535] bg-[#141414]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#888888] block mb-1.5">
            Select Competitive Title
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {SUPPORTED_GAMES.map((g) => {
              const isSelected = selectedGame === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => onSelectGame(g)}
                  className={`px-2.5 py-2 text-xs font-semibold rounded-lg text-left transition-colors min-h-[38px] ${
                    isSelected
                      ? 'bg-[#82EAF4]/20 border border-[#82EAF4] text-[#82EAF4]'
                      : 'bg-[#202020] text-[#B8B8B8] border border-[#303030] hover:text-[#F5F5F5]'
                  }`}
                >
                  <span className="truncate block">{g}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              title={isCollapsed && !isMobile ? item.label : undefined}
              className={({ isActive }) => `
                relative flex items-center ${isCollapsed && !isMobile ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px]
                ${isActive
                  ? 'bg-[#2B2B2B] text-[#82EAF4] border border-[#82EAF4]/30 font-semibold shadow-[0_0_12px_rgba(130,234,244,0.15)]'
                  : 'text-[#B8B8B8] hover:text-[#F5F5F5] hover:bg-[#242424]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#82EAF4]" />
                  )}
                  <Icon size={18} className="shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Desktop Collapse Toggle Footer */}
      {!isMobile && onToggleCollapse && isCollapsed && (
        <div className="p-2 border-t border-[#353535] flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 flex items-center justify-center text-[#8E8E8E] hover:text-[#82EAF4] hover:bg-[#202020] rounded-xl transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      )}

      {/* System Status Footer */}
      <div className={`p-3.5 border-t border-[#353535] shrink-0 text-xs text-[#B8B8B8] flex items-center ${
        isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
      } bg-[#0B0B0B]/80`}>
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#82EAF4] animate-pulse shadow-[0_0_8px_rgba(130,234,244,0.9)] shrink-0"
            title="10 VCT LAN Stages Live Sync"
          />
          {(!isCollapsed || isMobile) && (
            <span className="font-mono text-[11px] text-[#F5F5F5] font-medium truncate">
              10 VCT LAN Stages
            </span>
          )}
        </div>
        {(!isCollapsed || isMobile) && (
          <span className="text-[10px] font-mono text-[#82EAF4] tracking-wider uppercase font-semibold shrink-0">
            Live
          </span>
        )}
      </div>
    </aside>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-[#0B0B0B]/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative z-10 animate-in slide-in-from-left duration-200">{content}</div>
      </div>
    );
  }

  return content;
};
