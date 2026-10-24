import { ConfidenceLevel, PerformanceFactor, Player, RecommendationExplanation } from '../types';

export const ROLE_FORMULAS: Record<string, { name: string; weight: number }[]> = {
  // In-Game Leader (Valorant & CS2)
  'IGL': [
    { name: 'Mid-round decision quality', weight: 0.25 },
    { name: 'Calling impact', weight: 0.25 },
    { name: 'Team coordination', weight: 0.20 },
    { name: 'Tactical adaptability', weight: 0.15 },
    { name: 'Performance consistency', weight: 0.10 },
    { name: 'Mechanical contribution', weight: 0.05 },
  ],
  // Controller / Smokes (Valorant)
  'Controller': [
    { name: 'Utility effectiveness & delay', weight: 0.35 },
    { name: 'Site-control contribution', weight: 0.25 },
    { name: 'Assists & smoke uptime', weight: 0.20 },
    { name: 'Tactical execution', weight: 0.20 },
  ],
  // Duelist (Valorant) / Entry Fragger (CS2)
  'Duelist': [
    { name: 'Entry success rate', weight: 0.35 },
    { name: 'First-duel conversion', weight: 0.25 },
    { name: 'Opening frag impact', weight: 0.20 },
    { name: 'Survival after entry', weight: 0.20 },
  ],
  'Entry Fragger': [
    { name: 'Opening duel win rate', weight: 0.35 },
    { name: 'First kill conversion', weight: 0.25 },
    { name: 'Damage per round', weight: 0.20 },
    { name: 'Trade frag availability', weight: 0.20 },
  ],
  // Initiator (Valorant) / Support (CS2)
  'Initiator': [
    { name: 'Flash assists & recon efficiency', weight: 0.30 },
    { name: 'Assists per round', weight: 0.25 },
    { name: 'Trade participation', weight: 0.25 },
    { name: 'Site execute coordination', weight: 0.20 },
  ],
  'Support': [
    { name: 'Flash assist rate', weight: 0.30 },
    { name: 'Trade kill success', weight: 0.25 },
    { name: 'Utility damage per round', weight: 0.25 },
    { name: 'Round survival / KAST', weight: 0.20 },
  ],
  // Sentinel (Valorant) / Lurker (CS2)
  'Sentinel': [
    { name: 'Site anchor hold success', weight: 0.35 },
    { name: 'Clutch conversion under pressure', weight: 0.25 },
    { name: 'Defensive utility denial', weight: 0.20 },
    { name: 'Anti-flank security', weight: 0.20 },
  ],
  'Lurker': [
    { name: 'Clutch win rate', weight: 0.35 },
    { name: 'Late-round positioning & timing', weight: 0.25 },
    { name: 'Damage per round', weight: 0.20 },
    { name: 'Round survival rate', weight: 0.20 },
  ],
  // AWPer (CS2)
  'AWPer': [
    { name: 'Opening sniper duel rate', weight: 0.35 },
    { name: 'AWP kills per round', weight: 0.25 },
    { name: 'Sightline denial & map control', weight: 0.20 },
    { name: 'Damage per round', weight: 0.20 },
  ],
  // Default fallback
  'Default': [
    { name: 'Combat firepower', weight: 0.30 },
    { name: 'Utility contribution', weight: 0.25 },
    { name: 'Clutch composure', weight: 0.25 },
    { name: 'Team coordination', weight: 0.20 },
  ],
};

/**
 * Calculates Talent Index: sum(normalized factor score * factor weight)
 * Returns a score clamped between 0 and 100 with 1 decimal precision.
 */
export function calculateTalentIndex(factors: PerformanceFactor[]): number {
  if (!factors || factors.length === 0) return 0;
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (totalWeight <= 0) return 0;

  const scoreSum = factors.reduce((sum, f) => {
    const clamped = Math.max(0, Math.min(100, f.score));
    return sum + clamped * f.weight;
  }, 0);

  return Math.round((scoreSum / totalWeight) * 10) / 10;
}

/**
 * Calculates Confidence separately from Talent Index.
 * Low: < 10 matches
 * Medium: 10-29 matches
 * High: >= 30 matches
 */
export function calculateConfidence(matchesPlayed: number, dataCompleteness = 100): ConfidenceLevel {
  if (matchesPlayed < 10 || dataCompleteness < 60) {
    return 'Low confidence';
  }
  if (matchesPlayed < 30 || dataCompleteness < 85) {
    return 'Medium confidence';
  }
  return 'High confidence';
}

/**
 * Generates transparent, metric-linked recommendation justification.
 */
export function generateRecommendationExplanation(
  leadingPlayer: Player,
  alternatives: Player[],
  vacancyRole: string
): RecommendationExplanation {
  const sortedFactors = [...leadingPlayer.factors].sort((a, b) => b.score - a.score);
  const top3 = sortedFactors.slice(0, 3).map(f => ({
    name: f.name,
    score: f.score,
    benchmark: f.benchmark || 70,
  }));

  const comparisons = alternatives.slice(0, 2).map(alt => {
    const diff = Math.round((leadingPlayer.talentIndex - alt.talentIndex) * 10) / 10;
    let diffText = '';
    if (diff > 0) {
      diffText = `+${diff} higher fit index, providing superior role coverage and utility synergy`;
    } else if (diff === 0) {
      diffText = `Identical index, but preferred due to communication alignment and higher match confidence`;
    } else {
      diffText = `Decoy raw stats: despite higher raw fragging, lacks vacancy-specific tactical attributes`;
    }
    return {
      altName: alt.handle,
      altScore: alt.talentIndex,
      differentialText: diffText,
    };
  });

  const risks: string[] = [];
  if (leadingPlayer.confidence !== 'High confidence') {
    risks.push(`Sample size (${leadingPlayer.matchesPlayed} matches) requires monitoring in tier-1 scrims`);
  }
  if (leadingPlayer.availability === 'Contracted') {
    risks.push(`Active contract buyout required (${leadingPlayer.buyoutUsd || 'Negotiable'})`);
  }
  if (leadingPlayer.situational.clutchRate < 20) {
    risks.push(`Clutch conversion under high round-pressure is below tier-1 playoff median`);
  }
  if (risks.length === 0) {
    risks.push(`Role transition timeline from secondary agent pool needs 2-week boot-camp`);
  }

  return {
    candidateId: leadingPlayer.id,
    candidateName: leadingPlayer.handle,
    role: vacancyRole,
    fitScore: leadingPlayer.talentIndex,
    whyFit: `${leadingPlayer.handle} delivers decisive vacancy gap coverage for the ${vacancyRole} position with exceptional ${top3[0]?.name.toLowerCase()} (${top3[0]?.score}/100) and structured comms integration.`,
    topFactors: top3,
    comparisonVersusAlternatives: comparisons,
    keyRisks: risks,
    confidence: leadingPlayer.confidence,
    sampleSize: leadingPlayer.matchesPlayed,
    formulaVersion: 'SG-v2.4-deterministic',
  };
}
