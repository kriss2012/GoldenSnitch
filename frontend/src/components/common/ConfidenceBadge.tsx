import React from 'react';
import { ConfidenceLevel } from '../../types';

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, className = '' }) => {
  const getDotColor = () => {
    switch (level) {
      case 'High confidence':
        return 'bg-success';
      case 'Medium confidence':
        return 'bg-warning';
      case 'Low confidence':
      default:
        return 'bg-danger';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-text-muted select-none ${className}`}
      title={level}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${getDotColor()}`} aria-hidden="true" />
      <span className="font-medium whitespace-nowrap">{level}</span>
    </span>
  );
};
