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
    <div className="flex h-screen w-screen overflow-hidden bg-void text-text font-sans">
      {/* Desktop Sidebar (hidden on screens < 1024px) */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar
          isOpen={true}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={toggleDesktopCollapse}
          selectedGame={selectedGame}
          onSelectGame={onSelectGame}
        />
      </div>

      {/* Mobile Drawer (visible only when opened on < 1024px) */}
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        isMobile={true}
        selectedGame={selectedGame}
        onSelectGame={onSelectGame}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Topbar
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          selectedGame={selectedGame}
          onSelectGame={onSelectGame}
          isDesktopCollapsed={isDesktopCollapsed}
          onToggleDesktopCollapse={toggleDesktopCollapse}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-5 md:p-7">
          <div className="max-w-container mx-auto w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
