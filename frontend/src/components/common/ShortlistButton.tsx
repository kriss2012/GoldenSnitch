import React, { useState, useEffect } from 'react';
import { Star, Check, BookmarkPlus } from 'lucide-react';
import { Player } from '../../types';
import { scoutService } from '../../services/scoutService';

interface ShortlistButtonProps {
  player: Player | (Partial<Player> & { id: string; handle: string; game?: any; role?: string; team?: string; talentIndex?: number });
  size?: 'sm' | 'md';
  onToggle?: (isShortlisted: boolean) => void;
  className?: string;
}

export const ShortlistButton: React.FC<ShortlistButtonProps> = ({
  player,
  size = 'sm',
  onToggle,
  className = '',
}) => {
  const [isShortlisted, setIsShortlisted] = useState<boolean>(() => {
    return scoutService.isInWatchlist(player.id);
  });

  useEffect(() => {
    const handleSync = () => {
      setIsShortlisted(scoutService.isInWatchlist(player.id));
    };

    window.addEventListener('scoutgrid_watchlist_changed', handleSync);
    return () => window.removeEventListener('scoutgrid_watchlist_changed', handleSync);
  }, [player.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = scoutService.toggleWatchlist(player as Player, 'Shortlisted');
    setIsShortlisted(newState);
    window.dispatchEvent(new CustomEvent('scoutgrid_watchlist_changed'));
    if (onToggle) onToggle(newState);
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all duration-150 active:scale-95 ${
        isSmall ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
      } ${
        isShortlisted
          ? 'bg-[#82EAF4]/20 border border-[#82EAF4] text-[#82EAF4] shadow-[0_0_12px_rgba(130,234,244,0.25)] hover:bg-[#82EAF4]/30'
          : 'bg-[#222222] border border-[#3A3A3A] text-[#D4D4D4] hover:border-[#82EAF4]/70 hover:text-[#82EAF4]'
      } ${className}`}
      title={isShortlisted ? 'Click to remove from shortlist' : 'Add candidate to scouting shortlist'}
    >
      <Star
        size={isSmall ? 13 : 15}
        className={isShortlisted ? 'fill-[#82EAF4] text-[#82EAF4]' : 'text-[#A0A0A0]'}
      />
      <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
    </button>
  );
};
