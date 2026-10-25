"""
ScoutIQ — Trajectory & Trend Engine (Section 5.4 & 14, Phase 5)
Calculates:
1. Theil-Sen robust linear slope over 12 months of match history.
2. Mann-Kendall non-parametric monotonic trend test (Z-score, p-value, trend direction: improving, stable, declining).
3. Exponentially Weighted Moving Average (EWMA, alpha = 0.20).
"""

from __future__ import annotations
import math
from typing import Dict, List, Any
import numpy as np
from scipy import stats


def compute_theil_sen_slope(x: List[float], y: List[float]) -> float:
    """
    Computes Theil-Sen estimator (median of all pairwise slopes).
    Robust against outliers and small sample noise.
    """
    n = len(x)
    if n < 2:
        return 0.0

    slopes = []
    for i in range(n - 1):
        for j in range(i + 1, n):
            dx = x[j] - x[i]
            if abs(dx) > 1e-9:
                slopes.append((y[j] - y[i]) / dx)

    if not slopes:
        return 0.0

    return float(np.median(slopes))


def compute_mann_kendall_test(y: List[float]) -> Dict[str, Any]:
    """
    Computes Mann-Kendall trend test for monotonic direction.
    Returns:
    - S: Kendall score
    - z_score: standard normal test statistic
    - p_value: two-sided p-value
    - trend: 'improving' | 'stable' | 'declining'
    """
    n = len(y)
    if n < 4:
        return {
            "s_statistic": 0,
            "z_score": 0.0,
            "p_value": 1.0,
            "trend": "stable"
        }

    # Calculate Kendall S statistic
    s = 0
    for i in range(n - 1):
        for j in range(i + 1, n):
            diff = y[j] - y[i]
            if diff > 1e-9:
                s += 1
            elif diff < -1e-9:
                s -= 1

    # Variance of S under H0 (no trend)
    var_s = (n * (n - 1) * (2 * n + 5)) / 18.0

    if var_s == 0:
        z = 0.0
    elif s > 0:
        z = (s - 1) / math.sqrt(var_s)
    elif s < 0:
        z = (s + 1) / math.sqrt(var_s)
    else:
        z = 0.0

    # Two-sided p-value from standard normal
    p_value = float(2 * (1.0 - stats.norm.cdf(abs(z))))

    # Trend direction categorization
    if p_value < 0.10:
        if z > 0:
            trend = "improving"
        else:
            trend = "declining"
    else:
        trend = "stable"

    return {
        "s_statistic": s,
        "z_score": round(z, 3),
        "p_value": round(p_value, 4),
        "trend": trend
    }


def compute_ewma(y: List[float], alpha: float = 0.20) -> List[float]:
    """
    Computes Exponentially Weighted Moving Average (EWMA, alpha = 0.20).
    EWMA_0 = y_0
    EWMA_t = alpha * y_t + (1 - alpha) * EWMA_{t-1}
    """
    if not y:
        return []

    ewma_values = [y[0]]
    for val in y[1:]:
        prev = ewma_values[-1]
        curr = alpha * val + (1.0 - alpha) * prev
        ewma_values.append(round(curr, 2))

    return ewma_values


class TrajectoryEngine:
    """Analyzes 12-month match and rating trajectories for players and rosters."""

    def evaluate_player_trajectory(self, ratings_series: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Accepts list of historical records sorted chronologically:
        [{"date": "2025-01-15", "rating": 78.5}, ...]
        """
        if not ratings_series:
            return {
                "slope_per_month": 0.0,
                "mann_kendall": {"trend": "stable", "p_value": 1.0, "z_score": 0.0},
                "ewma_current": 50.0,
                "trend_label": "stable",
                "trajectory_points": []
            }

        y = [float(r["rating"]) for r in ratings_series]
        x = [float(i) for i in range(len(y))]

        slope = compute_theil_sen_slope(x, y)
        mk_res = compute_mann_kendall_test(y)
        ewma_series = compute_ewma(y, alpha=0.20)

        # Build trajectory points with date, raw rating, and smoothed EWMA
        points = []
        for i, r in enumerate(ratings_series):
            points.append({
                "date": r.get("date", f"M{i+1}"),
                "rating": round(y[i], 1),
                "ewma": ewma_series[i]
            })

        return {
            "slope_per_month": round(slope, 3),
            "mann_kendall": mk_res,
            "ewma_current": ewma_series[-1] if ewma_series else 50.0,
            "trend_label": mk_res["trend"],
            "trajectory_points": points
        }
