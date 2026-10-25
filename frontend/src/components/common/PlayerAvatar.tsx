import React, { useState } from 'react';
import { Shield, Swords, Compass, Cloud, Crown, User } from 'lucide-react';

interface PlayerAvatarProps {
  handle: string;
  name?: string;
  role?: string;
  game?: string;
  imageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rank?: number;
  showStatus?: boolean;
  className?: string;
}

// Curated high-resolution esports athlete and agent portraits from 4K asset pack
const CURATED_PRO_AVATARS: Record<string, string> = {
  'valyn': '/assets/golden-snitch/avatar-valyn.png',
  'TenZ': '/assets/4k/06_Player_Avatars/avatar_01.jpg',
  'Mirage': '/assets/4k/06_Player_Avatars/avatar_02.jpg',
  'Voltz': '/assets/4k/06_Player_Avatars/avatar_03.jpg',
  'Kairo': '/assets/4k/06_Player_Avatars/avatar_04.jpg',
  'Munchkin': '/assets/4k/06_Player_Avatars/avatar_05.jpg',
  'Dep': '/assets/4k/06_Player_Avatars/avatar_06.jpg',
  'cNed': '/assets/4k/06_Player_Avatars/avatar_07.jpg',
  'aspas': '/assets/4k/06_Player_Avatars/avatar_08.jpg',
  'Boaster': '/assets/4k/06_Player_Avatars/avatar_09.jpg',
  'Chronicle': '/assets/4k/06_Player_Avatars/avatar_10.jpg',
  'Derke': '/assets/4k/06_Player_Avatars/avatar_05.jpg',
  'johnqt': '/assets/4k/06_Player_Avatars/avatar_06.jpg',
  'Zellsis': '/assets/4k/06_Player_Avatars/avatar_07.jpg',
  'Sacy': '/assets/4k/06_Player_Avatars/avatar_08.jpg',
};

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  handle,
  name,
  role = 'Controller',
  game = 'VALORANT',
  imageUrl,
  size = 'md',
  rank,
  showStatus = true,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  // Deterministic 4K fallback for any player without explicit avatar
  const hash = Math.abs((handle || 'player').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const fallback4k = `/assets/4k/06_Player_Avatars/avatar_${String((hash % 10) + 1).padStart(2, '0')}.jpg`;
  const resolvedUrl = imageUrl || CURATED_PRO_AVATARS[handle] || fallback4k;

  // Normalized role color theme
  const getRoleTheme = (r: string) => {
    const lower = r.toLowerCase();
    if (lower.includes('duel') || lower.includes('entry') || lower.includes('awp')) {
      return {
        bg: 'from-[#3A1414] to-[#1C0E0E]',
        border: 'border-[#EF4444]/40',
        text: 'text-[#EF4444]',
        icon: Swords,
      };
    }
    if (lower.includes('control') || lower.includes('smoke')) {
      return {
        bg: 'from-[#102A30] to-[#0A1619]',
        border: 'border-[#82EAF4]/40',
        text: 'text-[#82EAF4]',
        icon: Cloud,
      };
    }
    if (lower.includes('initiat') || lower.includes('recon') || lower.includes('support')) {
      return {
        bg: 'from-[#0C2433] to-[#09151E]',
        border: 'border-[#38BDF8]/40',
        text: 'text-[#38BDF8]',
        icon: Compass,
      };
    }
    if (lower.includes('sentinel') || lower.includes('anchor') || lower.includes('tank')) {
      return {
        bg: 'from-[#2B2312] to-[#161208]',
        border: 'border-[#F59E0B]/40',
        text: 'text-[#F59E0B]',
        icon: Shield,
      };
    }
    if (lower.includes('igl') || lower.includes('captain')) {
      return {
        bg: 'from-[#2A1838] to-[#140B1C]',
        border: 'border-[#C084FC]/40',
        text: 'text-[#C084FC]',
        icon: Crown,
      };
    }
    return {
      bg: 'from-[#242424] to-[#161616]',
      border: 'border-[#353535]',
      text: 'text-[#82EAF4]',
      icon: User,
    };
  };

  const theme = getRoleTheme(role);
  const RoleIcon = theme.icon;

  const initials = handle
    ? handle.slice(0, 2).toUpperCase()
    : (name ? name.slice(0, 2).toUpperCase() : 'P');

  const rankStyle = () => {
    if (rank === 1) return 'bg-[#FFD700] text-[#0B0B0B] border-[#FFF] shadow-[0_0_10px_rgba(255,215,0,0.5)]';
    if (rank === 2) return 'bg-[#E0E0E0] text-[#0B0B0B] border-[#FFF]';
    if (rank === 3) return 'bg-[#CD7F32] text-[#FFF] border-[#D4A373]';
    return 'bg-[#18282E] text-[#82EAF4] border-[#82EAF4]/50';
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {/* Avatar Container */}
      <div
        className={`${SIZE_MAP[size]} rounded-xl overflow-hidden relative border ${theme.border} bg-gradient-to-br ${theme.bg} shadow-md flex items-center justify-center font-heading font-extrabold select-none transition-transform hover:scale-105`}
      >
        {resolvedUrl && !imageError ? (
          <img
            src={resolvedUrl}
            alt={handle}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-center relative">
            <span className={`tracking-tight font-mono ${theme.text}`}>
              {initials}
            </span>
            <RoleIcon size={size === 'xs' || size === 'sm' ? 8 : 10} className={`absolute bottom-0.5 right-0.5 ${theme.text} opacity-70`} />
          </div>
        )}
      </div>

      {/* Rank Indicator Badge */}
      {rank !== undefined && rank > 0 && (
        <span
          className={`absolute -top-1.5 -left-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-black flex items-center justify-center border shadow-md z-10 ${rankStyle()}`}
          title={`Rank #${rank}`}
        >
          #{rank}
        </span>
      )}

      {/* Online / LAN Active Status Dot */}
      {showStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#121212] shadow-[0_0_6px_#10B981]"
          title="Verified LAN Competitor"
        />
      )}
    </div>
  );
};
