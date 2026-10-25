"""
ScoutIQ — Universal Role Scoring Engine (Section 5.3)
Evaluates any competitive role across Valorant, CS2, LoL, and Dota 2
using config-driven metric weights from YAML, opponent adjustments,
Bayesian shrinkage, and risk flag profiling.
"""

from __future__ import annotations
import math
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from ..core.config_loader import get_game_config, RoleConfig
from .normalization import bayesian_shrinkage, compute_match_weight
from .igl_model import IGLScoringEngine


class UniversalRoleEngine:
    """Universal scoring engine driven by versioned game configs."""

    def __init__(self, game_id: str):
        self.game_id = game_id.lower()
        self.game_config = get_game_config(self.game_id)
        if not self.game_config:
            raise ValueError(f"Game configuration for '{game_id}' not found")

    def score_player(self, conn, player_id: str, role_id: str, custom_weights: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """Calculates role fit score, confidence, lower bound, and risk flags."""
        role_cfg = self.game_config.get_role(role_id)
        if not role_cfg:
            raise ValueError(f"Role '{role_id}' not found for game '{self.game_id}'")

        # If role is IGL in round-based FPS, delegate to flagship IGL model
        if role_id.upper() == "IGL" and self.game_config.data_type == "round_based":
            engine = IGLScoringEngine(weights=custom_weights or role_cfg.weights)
            res = engine.evaluate_igl_from_db(conn, player_id, game_id=self.game_id)
            return {
                "player_id": player_id,
                "game_id": self.game_id,
                "role": role_id,
                "role_fit": res["igl_score"],
                "final_score": res["igl_score"],
                "final_lb": res["final_lb"],
                "confidence": res["confidence"],
                "sample_maps": res["sample_maps"],
                "sub_scores": res["sub_scores"],
                "risk_flags": res["risk_flags"],
                "weights_used": res["weights_used"],
            }

        # For other roles, pull box scores from player_map_stats
        cursor = conn.cursor()
        pms_rows = cursor.execute("""
            SELECT kills, deaths, assists, adr_or_dpm, kast,
                   first_kills, first_deaths, clutches_won, clutches_attempted,
                   trades_given, trades_taken, utility_damage, flash_assists
            FROM player_map_stats
            WHERE player_id = ?
        """, (player_id,)).fetchall()

        n_maps = len(pms_rows)
        weights = custom_weights or role_cfg.weights

        if not pms_rows:
            # Cold-start fallback
            sub_scores = {m: 50.0 for m in weights}
            return {
                "player_id": player_id,
                "game_id": self.game_id,
                "role": role_id,
                "role_fit": 50.0,
                "final_score": 50.0,
                "final_lb": 35.0,
                "confidence": 0.0,
                "sample_maps": 0,
                "sub_scores": sub_scores,
                "risk_flags": ["LOW_SAMPLE", "PROVISIONAL"],
                "weights_used": weights,
            }

        # Calculate metrics from telemetry
        avg_kills = float(np.mean([r[0] for r in pms_rows]))
        avg_deaths = max(1.0, float(np.mean([r[1] for r in pms_rows])))
        avg_adr = float(np.mean([r[3] for r in pms_rows]))
        avg_kast = float(np.mean([r[4] for r in pms_rows]))
        
        total_first_kills = sum(r[5] for r in pms_rows)
        total_first_deaths = sum(r[6] for r in pms_rows)
        opening_win_rate = total_first_kills / max(1, total_first_kills + total_first_deaths)

        total_clutches_won = sum(r[7] for r in pms_rows)
        total_clutches_att = max(1, sum(r[8] for r in pms_rows))
        clutch_rate = total_clutches_won / total_clutches_att

        total_trades = sum(r[9] for r in pms_rows)
        trade_efficiency = total_trades / avg_deaths

        # Generate sub-metric percentiles
        sub_percentiles = {}
        for m in weights:
            # Map metric name to telemetry proxy
            m_lower = m.lower()
            if "opening_success" in m_lower or "opening_kill" in m_lower:
                p_raw = min(99.0, max(1.0, (opening_win_rate - 0.50) * 250.0 + 50.0))
            elif "opening_impact" in m_lower or "space_creation" in m_lower:
                fk_per_map = total_first_kills / max(1, n_maps)
                p_raw = min(99.0, max(1.0, (fk_per_map - 4.0) * 25.0 + 50.0))
            elif any(k in m_lower for k in ("adr", "dpm", "damage")):
                p_raw = min(99.0, max(1.0, (avg_adr - 135.0) * 1.5 + 50.0))
            elif "multikill" in m_lower:
                p_raw = min(99.0, max(1.0, (avg_kills - 16.0) * 6.0 + 50.0))
            elif any(k in m_lower for k in ("kast", "consistency", "survival")):
                p_raw = min(99.0, max(1.0, (avg_kast - 0.70) * 200.0 + 50.0))
            elif any(k in m_lower for k in ("trade", "entry_trade")):
                p_raw = min(99.0, max(1.0, (trade_efficiency - 0.8) * 50.0 + 50.0))
            elif any(k in m_lower for k in ("clutch", "retake")):
                p_raw = min(99.0, max(1.0, (clutch_rate - 0.20) * 180.0 + 50.0))
            elif any(k in m_lower for k in ("utility", "smoke", "vision", "flash")):
                avg_util = float(np.mean([r[11] for r in pms_rows]))
                p_raw = min(99.0, max(1.0, (avg_util - 140.0) * 0.8 + 50.0))
            else:
                p_raw = min(99.0, max(1.0, (avg_adr - 135.0) * 1.5 + 50.0))

            shrunk_p, conf = bayesian_shrinkage(p_raw, n_samples=n_maps, k=12.0)
            sub_percentiles[m] = shrunk_p

        overall_score = round(sum(weights[m] * sub_percentiles[m] for m in weights), 2)
        confidence = round(n_maps / (n_maps + 12.0), 4)

        # 80% credible lower bound
        sigma = 15.0
        bound_penalty = 1.28 * (sigma / math.sqrt(n_maps + 12.0))
        final_lb = round(max(0.0, min(100.0, overall_score - bound_penalty)), 2)

        risk_flags = []
        if n_maps < role_cfg.min_samples_maps:
            risk_flags.append("LOW_SAMPLE")

        return {
            "player_id": player_id,
            "game_id": self.game_id,
            "role": role_id,
            "role_fit": overall_score,
            "final_score": overall_score,
            "final_lb": final_lb,
            "confidence": confidence,
            "sample_maps": n_maps,
            "sub_scores": sub_percentiles,
            "risk_flags": risk_flags,
            "weights_used": weights,
        }
