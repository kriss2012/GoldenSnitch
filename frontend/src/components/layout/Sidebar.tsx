import React from 'react';
import { NavLink } from 'react-router-dom';
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
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/scouting', label: 'Scout players', icon: Compass },
  { path: '/players', label: 'Player database', icon: Users },
  { path: '/compare', label: 'Compare players', icon: Scale },
  { path: '/rosters', label: 'Rosters', icon: Shield },
  { path: '/synergy', label: 'Team synergy', icon: Zap },
  { path: '/watchlist', label: 'Watchlist', icon: BookmarkCheck },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile = false }) => {
  const content = (
    <aside
      className={`h-full flex flex-col bg-surface border-r border-border transition-all duration-200 select-none ${isMobile ? 'w-72 shadow-2xl z-50' : 'w-64'
        }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-control bg-gradient-to-br from-violet via-[#892cdc] to-[#5662f6] p-[1.5px] shadow-[0_0_16px_rgba(155,48,255,0.45)] shrink-0">
            <div className="w-full h-full bg-[#18002e] rounded-[7px] flex items-center justify-center">
              <Zap size={20} className="text-lilac fill-violet/40 drop-shadow-[0_0_8px_rgba(155,48,255,0.8)]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-text font-heading leading-none truncate">
                Golden Snitch
              </h1>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-violet/25 text-lilac border border-violet/50 rounded-full shadow-[0_0_8px_rgba(155,48,255,0.3)]">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-lilac/90 font-semibold tracking-wider uppercase block mt-0.5">
              Esports Intelligence
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text rounded-control focus-visible:outline-lilac"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-control text-sm font-medium transition-colors duration-140 min-h-[40px]
                ${isActive
                  ? 'bg-plum text-text border-l-2 border-violet'
                  : 'text-text-muted hover:text-text hover:bg-surface/80'
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-border shrink-0 text-xs text-text-muted flex items-center justify-between bg-[#110022]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet animate-pulse shadow-[0_0_8px_rgba(155,48,255,0.8)]" />
          <span className="font-mono text-[11px] text-text font-medium">GS v2.0 · Live Hub</span>
        </div>
        <span className="text-[10px] font-mono text-lilac tracking-wider uppercase font-semibold">
          Broadcast Night
        </span>
      </div>
    </aside>
  );

  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-void/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative z-10">{content}</div>
      </div>
    );
  }

  return content;
};
