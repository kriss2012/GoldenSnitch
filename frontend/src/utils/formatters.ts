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
      bg: 'bg-[#242424] border border-[#353535]',
      text: 'text-[#B8B8B8] font-medium',
      label: 'Developing',
    };
  }
  if (s < 60) {
    return {
      bg: 'bg-[#F5B83D] shadow-[0_0_14px_rgba(245,184,61,0.6)]',
      text: 'text-black font-bold',
      label: 'Starter',
    };
  }
  if (s < 75) {
    return {
      bg: 'bg-[#82EAF4] shadow-[0_0_16px_rgba(130,234,244,0.8)]',
      text: 'text-black font-black',
      label: 'Elite',
    };
  }
  return {
    bg: 'bg-white shadow-[0_0_18px_rgba(255,255,255,0.85)]',
    text: 'text-black font-black',
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
