/**
 * Number and string formatters for ScoutGrid
 */

export function formatScore(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return '—';
  return (Math.round(val * 10) / 10).toFixed(1);
}

export function formatPercent(val: number | null | undefined): string {
  if (val == null || isNaN(val)) return '—';
  return `${Math.round(val)}%`;
}

export function formatCurrencyK(amountK: number | null | undefined): string {
  if (amountK == null) return '—';
  return `$${amountK.toLocaleString()}k`;
}

/**
 * Returns Tailwind class names for Talent Index badges based on exact PRD tiers:
 * Below 40: Plum background, primary text
 * 40–59: Violet background, white text
 * 60–74: Lilac background, black text
 * 75–100: Primary text background (#F3E8FF), black text
 */
export function getTalentBadgeClasses(score: number): { bg: string; text: string; label: string } {
  const s = Math.max(0, Math.min(100, score || 0));
  if (s < 40) {
    return {
      bg: 'bg-plum border border-border',
      text: 'text-text',
      label: 'Developing',
    };
  }
  if (s < 60) {
    return {
      bg: 'bg-violet shadow-[0_0_10px_rgba(155,48,255,0.4)]',
      text: 'text-white font-semibold',
      label: 'Starter',
    };
  }
  if (s < 75) {
    return {
      bg: 'bg-lilac shadow-[0_0_12px_rgba(209,135,255,0.5)]',
      text: 'text-black font-bold',
      label: 'Elite',
    };
  }
  return {
    bg: 'bg-text shadow-[0_0_14px_rgba(255,255,255,0.6)]',
    text: 'text-black font-extrabold',
    label: 'Franchise',
  };
}

/**
 * Formats trend into signed string with arrow
 */
export function formatTrend(trend: number): { text: string; isPositive: boolean; isNeutral: boolean } {
  if (trend === 0) {
    return { text: '— 0.0', isPositive: false, isNeutral: true };
  }
  const isPositive = trend > 0;
  const sign = isPositive ? '+' : '';
  const arrow = isPositive ? '↑' : '↓';
  return {
    text: `${arrow} ${sign}${trend.toFixed(1)}`,
    isPositive,
    isNeutral: false,
  };
}
