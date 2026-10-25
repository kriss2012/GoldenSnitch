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
  Gamepad2,
  Activity
} from 'lucide-react';

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
  { path: '/app/cognitive-lab', label: 'Cognitive Lab', icon: Activity },
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
      className={`h-full flex flex-col bg-[#101010] border-r border-[#222222] transition-all duration-200 select-none ${
        isMobile ? 'w-72 shadow-2xl z-50' : isCollapsed ? 'w-20' : 'w-[280px]'
      }`}
    >
      {/* Mobile-Only Header with Brand and Close */}
      {isMobile && (
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#262626] shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/golden-snitch/golden-snitch-winged.png"
              alt="Golden Snitch"
              className="h-6 w-auto object-contain drop-shadow-[0_0_8px_rgba(245,184,61,0.5)]"
            />
            <span className="text-sm font-extrabold italic text-[#F5B83D]">
              GOLDEN SNITCH
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[#B8B8B8] hover:text-[#F5F5F5] rounded-xl hover:bg-[#202020] transition-colors"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              title={isCollapsed && !isMobile ? item.label : undefined}
              className={({ isActive }) => `
                relative flex items-center ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 min-h-[44px]
                ${isActive
                  ? 'bg-[#0E2225] border border-[#82EAF4]/50 text-[#82EAF4] font-bold shadow-[0_0_14px_rgba(130,234,244,0.14)]'
                  : 'text-[#B0B0B0] hover:text-[#FFFFFF] hover:bg-[#181818] border border-transparent'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'gap-3.5'} min-w-0`}>
                    <Icon size={18} className={`shrink-0 ${isActive ? 'text-[#82EAF4]' : 'text-[#8E8E8E]'}`} />
                    {(!isCollapsed || isMobile) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {(!isCollapsed || isMobile) && isActive && (
                    <ChevronRight size={15} className="text-[#82EAF4] shrink-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footer: 10 VCT LAN Stages · LIVE matching Image 1 */}
      <div className={`p-3.5 border-t border-[#222222] bg-[#0E0E0E] shrink-0 flex items-center ${
        isCollapsed && !isMobile ? 'justify-center' : 'justify-between'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="text-xs text-[#B8B8B8] font-medium tracking-tight">
              10 VCT LAN Stages
            </span>
          )}
        </div>

        {(!isCollapsed || isMobile) && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#82EAF4] bg-[#82EAF4]/15 border border-[#82EAF4]/30 tracking-wider">
            LIVE
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
