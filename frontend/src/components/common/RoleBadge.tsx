import React from 'react';
import { Shield, Swords, Compass, Cloud, Crown, Zap } from 'lucide-react';

interface RoleBadgeProps {
  role: string;
  secondaryRoles?: string[];
  size?: 'sm' | 'md';
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  secondaryRoles = [],
  size = 'sm',
  className = '',
}) => {
  const normalized = role.toLowerCase();

  let colorClasses = 'bg-[#1F1F1F] text-[#B8B8B8] border-[#353535]';
  let Icon = Zap;

  if (normalized.includes('duel') || normalized.includes('entry') || normalized.includes('awp')) {
    colorClasses = 'bg-[#2A1414] text-[#F87171] border-[#5E2424]/60 shadow-[0_0_8px_rgba(239,68,68,0.12)]';
    Icon = Swords;
  } else if (normalized.includes('control') || normalized.includes('smoke')) {
    colorClasses = 'bg-[#0E2429] text-[#82EAF4] border-[#1D4E57]/60 shadow-[0_0_8px_rgba(130,234,244,0.12)]';
    Icon = Cloud;
  } else if (normalized.includes('initiat') || normalized.includes('recon') || normalized.includes('support')) {
    colorClasses = 'bg-[#0F222F] text-[#38BDF8] border-[#1C435A]/60 shadow-[0_0_8px_rgba(56,189,248,0.12)]';
    Icon = Compass;
  } else if (normalized.includes('sentinel') || normalized.includes('anchor') || normalized.includes('tank')) {
    colorClasses = 'bg-[#261E0E] text-[#FBBF24] border-[#553E17]/60 shadow-[0_0_8px_rgba(245,158,11,0.12)]';
    Icon = Shield;
  } else if (normalized.includes('igl') || normalized.includes('captain')) {
    colorClasses = 'bg-[#251433] text-[#C084FC] border-[#552777]/60 shadow-[0_0_8px_rgba(192,132,252,0.15)]';
    Icon = Crown;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 11 : 12;

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span
        className={`inline-flex items-center gap-1 rounded-md font-semibold border ${paddingClass} ${colorClasses}`}
      >
        <Icon size={iconSize} />
        <span>{role}</span>
      </span>

      {secondaryRoles.length > 0 &&
        secondaryRoles.map((sec, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#1E1E1E] text-[#9E9E9E] border border-[#303030]"
            title={`Secondary Role: ${sec}`}
          >
            +{sec}
          </span>
        ))}
    </div>
  );
};
