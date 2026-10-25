import React from 'react';
import { ConfidenceLevel } from '../../types';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, className = '' }) => {
  const getStyles = () => {
    switch (level) {
      case 'High confidence':
        return {
          dot: 'bg-[#4EFAAC] shadow-[0_0_6px_#4EFAAC]',
          text: 'text-[#4EFAAC]',
        };
      case 'Medium confidence':
        return {
          dot: 'bg-[#F5B83D] shadow-[0_0_6px_#F5B83D]',
          text: 'text-[#F5B83D]',
        };
      case 'Low confidence':
      default:
        return {
          dot: 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.6)]',
          text: 'text-rose-400',
        };
    }
  };

  const { dot, text } = getStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs select-none ${text} ${className}`}
      title={level}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      <span className="font-medium whitespace-nowrap">{level}</span>
    </span>
  );
};
