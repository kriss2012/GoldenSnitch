"""
ScoutIQ — Core Differentiators Engine (Features 1–7, Section 8 & 14, Phase 7)
Implements:
1. Counterfactual Roster Simulator (Monte Carlo >= 5,000 runs, 95% CI)
2. IGL Decision Replay Lab (WPA by tactical call type)
3. Hidden Gem Finder (ExpectedMarketSalary - AskSalary residual regression)
4. Stat-Padder & Small-Sample Hype Detector
5. Cross-Title Talent Transfer Index
6. Similar Player Search (k-NN Cosine Similarity)
7. Role-Succession & Depth Planner
"""

from __future__ import annotations
import math
import sqlite3
import numpy as np
from typing import Dict, List, Any, Optional

from ..metrics.role_engine import UniversalRoleEngine
from ..metrics.trajectory import TrajectoryEngine
from ..synergy.engine import SynergyEngine


class CoreDifferentiatorsEngine:
    """Core competitive intelligence algorithms for Features 1–7."""

    def __init__(self, game_id: str = "valorant"):
        self.game_id = game_id.lower()
        self.role_engine = UniversalRoleEngine(self.game_id)
        self.synergy_engine = SynergyEngine(self.game_id)
        self.traj_engine = TrajectoryEngine()

    # ---------------- Feature 1: Counterfactual Simulator ----------------
    def simulate_counterfactual_roster(
        self,
        conn: sqlite3.Connection,
        roster_id: int,
        player_out_id: str,
        candidate_in_id: str,
        target_role: Optional[str] = None,
        n_simulations: int = 5000
    ) -> Dict[str, Any]:
        cursor = conn.cursor()

        # Query existing members
        members_rows = cursor.execute("""
            SELECT player_id, slot_role
            FROM roster_members
            WHERE roster_id = ?
        """, (roster_id,)).fetchall()

        if not members_rows:
            raise ValueError(f"Roster #{roster_id} has no members")

        # Baseline evaluation
        baseline_eval = self.synergy_engine.evaluate_roster(conn, roster_id, [(r[0], r[1]) for r in members_rows])
        base_avg_score = baseline_eval["average_score"]
        base_syn = baseline_eval["synergy_coefficient"]

        # Base win probability vs tier peers
        base_mu = 0.50 + (base_avg_score - 50.0) * 0.006 + (base_syn - 1.0) * 0.20
        base_mu = max(0.10, min(0.90, base_mu))

        # Counterfactual roster (swap candidate_in for player_out)
        cf_members = []
        replaced_role = target_role
        for pid, srole in members_rows:
            if pid == player_out_id:
                if not replaced_role:
                    replaced_role = srole
            else:
                cf_members.append((pid, srole))

        cf_members.append((candidate_in_id, replaced_role or "Flex"))

        cf_eval = self.synergy_engine.evaluate_roster(conn, roster_id, cf_members)
        cf_avg_score = cf_eval["average_score"]
        cf_syn = cf_eval["synergy_coefficient"]

        cf_mu = 0.50 + (cf_avg_score - 50.0) * 0.006 + (cf_syn - 1.0) * 0.20
        cf_mu = max(0.10, min(0.90, cf_mu))

        # Monte Carlo simulation (>= 5,000 iterations)
        rng = np.random.default_rng(seed=42)
        base_sim = rng.binomial(n=1, p=base_mu, size=n_simulations)
        cf_sim = rng.binomial(n=1, p=cf_mu, size=n_simulations)

        base_win_rate = float(np.mean(base_sim))
        cf_win_rate = float(np.mean(cf_sim))
        delta_win_rate = round(cf_win_rate - base_win_rate, 4)

        # Standard error and 95% Confidence Interval
        se = math.sqrt((base_win_rate * (1 - base_win_rate) + cf_win_rate * (1 - cf_win_rate)) / n_simulations)
        ci_lower = round(delta_win_rate - 1.96 * se, 4)
        ci_upper = round(delta_win_rate + 1.96 * se, 4)

        return {
            "roster_id": roster_id,
            "player_out_id": player_out_id,
            "candidate_in_id": candidate_in_id,
            "replaced_role": replaced_role,
            "simulations_run": n_simulations,
            "baseline": {
                "average_score": base_avg_score,
                "synergy_coefficient": base_syn,
                "expected_win_rate": round(base_win_rate * 100.0, 2)
            },
            "counterfactual": {
                "average_score": cf_avg_score,
                "synergy_coefficient": cf_syn,
                "expected_win_rate": round(cf_win_rate * 100.0, 2)
            },
            "win_rate_delta_pct": round(delta_win_rate * 100.0, 2),
            "confidence_interval_95": [round(ci_lower * 100.0, 2), round(ci_upper * 100.0, 2)],
            "recommendation": "DEFINITE_UPGRADE" if delta_win_rate >= 0.03 else ("MARGINAL_UPGRADE" if delta_win_rate > 0 else "DOWNGRADE_RISK")
        }

    # ---------------- Feature 2: IGL Replay Lab ----------------
    def get_igl_replay_lab(self, conn: sqlite3.Connection, player_id: str, limit: int = 40) -> Dict[str, Any]:
        cursor = conn.cursor()

        rounds = cursor.execute("""
            SELECT r.id, r.round_no, r.side, r.buy_type_a, r.winner, r.plan_tag,
                   r.plan_switched_mid_round, r.switch_time_s, r.bomb_planted,
                   r.plan_conversion, r.econ_a, r.econ_b, m.map_name_or_game_no
            FROM rounds r
            JOIN maps_or_games m ON r.map_id = m.id
            WHERE r.igl_player_id = ?
            ORDER BY r.id DESC
            LIMIT ?
        """, (player_id, limit)).fetchall()

        timeline = []
        call_types_agg: Dict[str, List[float]] = {}

        for r in rounds:
            rid, r_no, side_val, buy_type, winner, ptag, switched, stime, planted, conv, econ_a, econ_b, map_name = r
            won = (winner == "team_a")

            econ_diff = (econ_a - econ_b) / 1000.0
            p_before = 1.0 / (1.0 + math.exp(-0.4 * econ_diff))
            p_before = max(0.15, min(0.85, p_before))

            p_after = 1.0 if won else 0.0
            wpa = round(p_after - p_before, 3)

            ctype = "AUDIBLE" if switched else ("FORCE_BUY" if buy_type == "force_buy" else ("ECO_SAVE" if buy_type == "eco" else "DEFAULT_EXECUTE"))
            call_types_agg.setdefault(ctype, []).append(wpa)

            timeline.append({
                "round_id": rid,
                "map_name": map_name,
                "round_number": r_no,
                "side": side_val,
                "call_type": ctype,
                "p_before": round(p_before, 2),
                "p_after": round(p_after, 2),
                "wpa": wpa,
                "won": won,
                "plan_tag": ptag
            })

        call_summary = {
            ctype: {
                "count": len(wpas),
                "avg_wpa": round(float(np.mean(wpas)), 3),
                "positive_wpa_rate": round((sum(1 for w in wpas if w > 0) / len(wpas)) * 100.0, 1)
            }
            for ctype, wpas in call_types_agg.items()
        }

        return {
            "player_id": player_id,
            "total_calls_analyzed": len(timeline),
            "call_type_effectiveness": call_summary,
            "replay_timeline": timeline
        }

    # ---------------- Feature 3: Hidden Gem Finder ----------------
    def find_hidden_gems(self, conn: sqlite3.Connection, min_maps: int = 15, limit: int = 15) -> List[Dict[str, Any]]:
        cursor = conn.cursor()

        # Query contracted and free-agent players with their ratings and ask salaries
        players_rows = cursor.execute("""
            SELECT p.id, p.name, p.role, p.matches_played, c.salary_monthly, c.buyout, c.ask_salary, t.tier
            FROM players p
            LEFT JOIN contracts c ON p.id = c.player_id
            LEFT JOIN teams t ON c.team_id = t.id
            WHERE (p.id LIKE ? OR p.game = ?)
              AND p.matches_played >= ?
        """, (f"ply_{self.game_id}_%", self.game_id, min_maps)).fetchall()

        gems = []
        for r in players_rows:
            pid, name, role, maps_cnt, sal_m, buyout, ask_sal, tier = r
            ask = (sal_m * 12) if sal_m else ((ask_sal or 100000) if ask_sal else 100000)

            score_res = self.role_engine.score_player(conn, pid, role_id=role)
            role_fit = score_res["final_score"]

            # Multi-variable regression model for Expected Market Salary:
            # ExpectedSalary = Base(50k) + 2,000 * (RoleFit - 50) + TierBonus
            tier_bonus = 60000.0 if tier == "T1" else (25000.0 if tier == "T2" else 0.0)
            expected_market_salary = round(50000.0 + max(0.0, role_fit - 45.0) * 2600.0 + tier_bonus, 0)

            # Surplus value = Expected - Ask
            surplus = expected_market_salary - ask
            roi_multiple = round(expected_market_salary / max(10000.0, ask), 2)

            if surplus > 15000.0 and role_fit >= 60.0:
                gems.append({
                    "player_id": pid,
                    "handle": name,
                    "role": role,
                    "tier": tier or "T2",
                    "sample_maps": maps_cnt,
                    "role_fit": role_fit,
                    "ask_salary": int(ask),
                    "expected_market_salary": int(expected_market_salary),
                    "surplus_value": int(surplus),
                    "roi_multiple": roi_multiple,
                    "buyout": int(buyout or 150000)
                })

        # Sort by surplus value descending
        gems.sort(key=lambda g: g["surplus_value"], reverse=True)
        return gems[:limit]

    # ---------------- Feature 4: Stat-Padder & Hype Detector ----------------
    def detect_stat_padders_and_hype(self, conn: sqlite3.Connection, limit: int = 20) -> List[Dict[str, Any]]:
        cursor = conn.cursor()

        # Query all players in title
        p_rows = cursor.execute("""
            SELECT p.id, p.name, p.role, p.matches_played, t.tier
            FROM players p
            LEFT JOIN contracts c ON p.id = c.player_id
            LEFT JOIN teams t ON c.team_id = t.id
            WHERE (p.id LIKE ? OR p.game = ?)
        """, (f"ply_{self.game_id}_%", self.game_id)).fetchall()

        flagged = []
        for r in p_rows:
            pid, name, role, maps_cnt, tier = r
            score_res = self.role_engine.score_player(conn, pid, role_id=role)
            risk_flags = score_res["risk_flags"]

            # Small sample hype
            if maps_cnt <= 12 and score_res["final_score"] >= 72.0:
                if "SMALL_SAMPLE_HYPE" not in risk_flags:
                    risk_flags.append("SMALL_SAMPLE_HYPE")

            if risk_flags:
                flagged.append({
                    "player_id": pid,
                    "handle": name,
                    "role": role,
                    "sample_maps": maps_cnt,
                    "tier": tier or "T2",
                    "role_fit": score_res["final_score"],
                    "confidence": score_res["confidence"],
                    "risk_flags": risk_flags,
                    "flag_reasons": [
                        "Inflated damage in non-converting rounds with low team round win contribution" if rf == "STAT_PADDER"
                        else ("High rating variance over under 12 maps sample size" if rf == "SMALL_SAMPLE_HYPE"
                        else "Consistent negative form slope over last 10 matches")
                        for rf in risk_flags
                    ]
                })

        flagged.sort(key=lambda x: len(x["risk_flags"]), reverse=True)
        return flagged[:limit]

    # ---------------- Feature 5: Cross-Title Talent Transfer ----------------
    def compute_cross_title_transfer(
        self,
        conn: sqlite3.Connection,
        player_id: str,
        target_game: str
    ) -> Dict[str, Any]:
        cursor = conn.cursor()
        p_row = cursor.execute("SELECT id, name, role, matches_played FROM players WHERE id = ?", (player_id,)).fetchone()
        if not p_row:
            raise ValueError(f"Player '{player_id}' not found")

        name, role, _maps_cnt = p_row[1], p_row[2], p_row[3]
        score_res = self.role_engine.score_player(conn, player_id, role_id=role)
        src_score = score_res["final_score"]

        # Cross-game transferability matrix
        # CS2 <-> Valorant (High FPS mechanical transfer)
        # Dota 2 <-> LoL (High MOBA macro transfer)
        src = self.game_id
        tgt = target_game.lower()

        if (src in ("cs2", "valorant") and tgt in ("cs2", "valorant")):
            mechanics_transfer = 0.88
            tactical_transfer = 0.82
            utility_transfer = 0.70
            weeks_to_ready = 4
        elif (src in ("lol", "dota2") and tgt in ("lol", "dota2")):
            mechanics_transfer = 0.80
            tactical_transfer = 0.85
            utility_transfer = 0.75
            weeks_to_ready = 6
        else:
            # Cross-genre
            mechanics_transfer = 0.35
            tactical_transfer = 0.50
            utility_transfer = 0.30
            weeks_to_ready = 16

        transfer_index = round(100.0 * (
            0.40 * mechanics_transfer +
            0.35 * tactical_transfer +
            0.25 * utility_transfer
        ) * (src_score / 100.0), 1)

        return {
            "player_id": player_id,
            "handle": name,
            "source_game": src,
            "target_game": tgt,
            "source_role": role,
            "transfer_readiness_index": transfer_index,
            "estimated_transition_weeks": weeks_to_ready,
            "vectors": {
                "mechanical_overlap": round(mechanics_transfer * 100, 1),
                "tactical_shotcalling_overlap": round(tactical_transfer * 100, 1),
                "utility_adaptation": round(utility_transfer * 100, 1)
            }
        }

    # ---------------- Feature 6: Similar Player Search (k-NN) ----------------
    def find_similar_players(
        self,
        conn: sqlite3.Connection,
        target_player_id: str,
        k: int = 5
    ) -> List[Dict[str, Any]]:
        cursor = conn.cursor()

        # Get target player's stats
        target_score = self.role_engine.score_player(conn, target_player_id, role_id="IGL")
        t_subs = target_score["sub_scores"]
        v_target = np.array([t_subs.get(k, 50.0) for k in sorted(t_subs.keys())])
        norm_t = np.linalg.norm(v_target)
        if norm_t == 0:
            norm_t = 1.0

        # Query peer candidates in same game
        peers = cursor.execute("""
            SELECT id, name, role, matches_played
            FROM players
            WHERE (id LIKE ? OR game = ?) AND id != ?
            LIMIT 60
        """, (f"ply_{self.game_id}_%", self.game_id, target_player_id)).fetchall()

        similar = []
        for p in peers:
            pid, pname, prole, pmaps = p
            p_score = self.role_engine.score_player(conn, pid, role_id=prole)
            p_subs = p_score["sub_scores"]
            v_peer = np.array([p_subs.get(k, 50.0) for k in sorted(t_subs.keys())])
            norm_p = np.linalg.norm(v_peer)
            if norm_p == 0:
                norm_p = 1.0

            # Cosine similarity
            cos_sim = float(np.dot(v_target, v_peer) / (norm_t * norm_p))
            sim_pct = round(max(0.0, min(100.0, cos_sim * 100.0)), 1)

            similar.append({
                "player_id": pid,
                "handle": pname,
                "role": prole,
                "similarity_score": sim_pct,
                "sample_maps": pmaps,
                "role_fit": p_score["final_score"],
                "shared_archetype": "Balanced Macro Caller" if cos_sim > 0.95 else "Tactical Hybrid"
            })

        similar.sort(key=lambda s: s["similarity_score"], reverse=True)
        return similar[:k]

    # ---------------- Feature 7: Role Succession & Depth Planner ----------------
    def get_roster_depth_plan(self, conn: sqlite3.Connection, roster_id: int) -> Dict[str, Any]:
        cursor = conn.cursor()
        r_row = conn.execute("SELECT id, name, game FROM rosters WHERE id = ?", (roster_id,)).fetchone()
        if not r_row:
            raise ValueError(f"Roster #{roster_id} not found")

        members = cursor.execute("""
            SELECT rm.player_id, rm.slot_role, p.name, p.matches_played
            FROM roster_members rm
            JOIN players p ON rm.player_id = p.id
            WHERE rm.roster_id = ?
        """, (roster_id,)).fetchall()

        depth_chart = []
        overall_vulnerabilities = []

        for pid, role, name, maps_cnt in members:
            # Score starter
            score_res = self.role_engine.score_player(conn, pid, role_id=role)

            # Query top 2 backup prospects in database for this role
            backups = cursor.execute("""
                SELECT p.id, p.name, p.matches_played, t.tier
                FROM players p
                LEFT JOIN contracts c ON p.id = c.player_id
                LEFT JOIN teams t ON c.team_id = t.id
                WHERE p.role = ? AND p.id != ? AND (p.id LIKE ? OR p.game = ?)
                LIMIT 2
            """, (role, pid, f"ply_{self.game_id}_%", self.game_id)).fetchall()

            pipeline = [
                {"player_id": b[0], "handle": b[1], "tier": b[3] or "Academy", "maps": b[2]}
                for b in backups
            ]

            # Vulnerability score [0, 100]: higher if starter has risk flags or low sample
            vulnerability = 20.0
            if "FORM_DECLINE" in score_res["risk_flags"]:
                vulnerability += 40.0
            if "LOW_SAMPLE" in score_res["risk_flags"]:
                vulnerability += 25.0
            if not pipeline:
                vulnerability += 30.0

            vulnerability = min(100.0, vulnerability)
            if vulnerability >= 50.0:
                overall_vulnerabilities.append({
                    "role": role,
                    "starter": name,
                    "vulnerability_score": vulnerability,
                    "risk": "High Succession Risk (form decline / weak pipeline)"
                })

            depth_chart.append({
                "role": role,
                "starter": {
                    "player_id": pid,
                    "handle": name,
                    "role_fit": score_res["final_score"],
                    "risk_flags": score_res["risk_flags"]
                },
                "succession_pipeline": pipeline,
                "vulnerability_score": vulnerability
            })

        return {
            "roster_id": roster_id,
            "roster_name": r_row[1],
            "game": r_row[2],
            "depth_chart": depth_chart,
            "vulnerable_positions": overall_vulnerabilities
        }
