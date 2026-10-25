import React from 'react';
import { getTalentBadgeClasses } from '../../utils/formatters';

interface TalentBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const TalentBadge: React.FC<TalentBadgeProps> = ({
  score,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const { bg, text, label } = getTalentBadgeClasses(score);

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 min-w-[38px] font-bold',
    md: 'text-sm px-3.5 py-0.5 min-w-[54px] font-black',
    lg: 'text-base px-4 py-1.5 min-w-[64px] font-black',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full tabular-nums font-mono transition-transform duration-140 ${bg} ${text} ${sizeClasses[size]} ${className}`}
      title={`Talent Index: ${score.toFixed(1)}/100 (${label})`}
    >
      <span>{score.toFixed(1)}</span>
      {showLabel && <span className="ml-1.5 text-[10px] uppercase font-sans tracking-wide opacity-80">{label}</span>}
    </span>
  );
};

export default TalentBadge;
