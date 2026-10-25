import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { GameTitle } from '../../types';

interface AppShellProps {
  selectedGame: GameTitle;
  onSelectGame: (g: GameTitle) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ selectedGame, onSelectGame }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => {
    try {
      return localStorage.getItem('scoutgrid_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('scoutgrid_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0B0B] text-text font-sans select-none">
      {/* 1. Full-Width Topbar matching Image 1 */}
      <Topbar
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        selectedGame={selectedGame}
        onSelectGame={onSelectGame}
        isDesktopCollapsed={isDesktopCollapsed}
        onToggleDesktopCollapse={toggleDesktopCollapse}
      />

      {/* 2. Main Workspace (Sidebar + Content Canvas) */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Desktop Sidebar below Topbar */}
        <div className="hidden lg:flex shrink-0 h-full">
          <Sidebar
            isOpen={true}
            isCollapsed={isDesktopCollapsed}
            onToggleCollapse={toggleDesktopCollapse}
            selectedGame={selectedGame}
            onSelectGame={onSelectGame}
          />
        </div>

        {/* Mobile Drawer */}
        <Sidebar
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          isMobile={true}
          selectedGame={selectedGame}
          onSelectGame={onSelectGame}
        />

        {/* Main Dashboard / Page Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-6 bg-[#0B0B0B]">
          <div className="w-full min-w-0 max-w-[1700px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
