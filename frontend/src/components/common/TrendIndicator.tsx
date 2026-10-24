import React from 'react';
import { formatTrend } from '../../utils/formatters';

interface TrendIndicatorProps {
  trend: number;
  className?: string;
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, className = '' }) => {
  const { text, isPositive, isNeutral } = formatTrend(trend);

  const colorClass = isNeutral
    ? 'text-text-muted'
    : isPositive
    ? 'text-success'
    : 'text-danger';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums ${colorClass} ${className}`}
      title={`Performance trend: ${text}`}
    >
      {text}
    </span>
  );
};
