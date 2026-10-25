"""
ScoutIQ — Metric Normalization & Bayesian Shrinkage Pipeline (Section 5.1)
Implements:
1. Per-unit rate conversion.
2. Opponent strength, recency, and tier match weighting.
3. Role-peer percentile ranking with min-peer fallback.
4. Bayesian shrinkage toward league mean (k=12) with sample confidence C.
5. Patch resilience computation.
"""

from __future__ import annotations
import math
from typing import List, Tuple
import numpy as np
from scipy.stats import percentileofscore

TIER_WEIGHTS = {
    "T1": 1.0,
    "T2": 0.75,
    "T3": 0.50,
    "academy": 0.40,
}


def compute_match_weight(opp_elo: float, mean_elo: float = 1600.0, age_days: float = 0.0, tier: str = "T1") -> float:
    """Computes compound match weight: opponent Elo multiplier × recency decay × tier weight."""
    ratio = opp_elo / mean_elo if mean_elo > 0 else 1.0
    w_match = max(0.7, min(1.3, ratio))
    w_time = math.pow(0.5, max(0.0, age_days) / 120.0)
    w_tier = TIER_WEIGHTS.get(tier, 0.75)
    return w_match * w_time * w_tier


def bayesian_shrinkage(percentile: float, n_samples: float, k: float = 12.0) -> Tuple[float, float]:
    """
    Computes Bayesian shrunk percentile and sample confidence (Section 5.1).
    shrunk_P = (n * P + k * 50) / (n + k)
    Confidence C = n / (n + k)
    """
    shrunk_p = (n_samples * percentile + k * 50.0) / (n_samples + k)
    confidence = n_samples / (n_samples + k)
    return round(shrunk_p, 2), round(confidence, 4)


def compute_peer_percentiles(values: List[float], higher_is_better: bool = True) -> List[float]:
    """Computes exact percentile ranks [0, 100] within a peer group."""
    if not values:
        return []
    if len(values) == 1:
        return [50.0]

    arr = np.array(values, dtype=float)
    if not higher_is_better:
        arr = -arr

    # Compute percentile of score for each element
    ranks = [float(percentileofscore(arr, v, kind="rank")) for v in arr]
    return [round(r, 2) for r in ranks]


def compute_patch_resilience(p_current: float, p_prior: float) -> float:
    """
    Computes patch resilience: patch_resilience = 1 - |P_current - P_prior| / 100 (clamped 0 to 1).
    """
    delta = abs(p_current - p_prior) / 100.0
    return round(max(0.0, min(1.0, 1.0 - delta)), 4)
