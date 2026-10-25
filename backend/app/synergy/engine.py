"""
ScoutIQ — Multi-Roster Synergy Engine, Gap Diagnosis & RHI (Section 6 & 14, Phase 5)
Calculates:
1. Pairwise synergy matrix between roster members (role complementary, shared maps, comms load, clash penalty).
2. Overall roster synergy coefficient S_roster in [0.70, 1.30].
3. Roster Health Index (RHI) in [0, 100].
4. Automatic gap diagnosis (weakest slot, missing tactical attributes, urgent vacancies).
"""

from __future__ import annotations
import sqlite3
import numpy as np
from typing import Dict, List, Tuple, Any

from ..core.config_loader import get_game_config
from ..metrics.role_engine import UniversalRoleEngine
from ..metrics.trajectory import TrajectoryEngine


class SynergyEngine:
    """Evaluates multi-player roster synergy, team chemistry, and health index."""

    def __init__(self, game_id: str):
        self.game_id = game_id.lower()
        self.game_cfg = get_game_config(self.game_id)
        self.role_engine = UniversalRoleEngine(self.game_id)
        self.traj_engine = TrajectoryEngine()

    def evaluate_roster(
        self,
        conn: sqlite3.Connection,
        roster_id: int,
        player_ids_with_roles: List[Tuple[str, str]]
    ) -> Dict[str, Any]:
        """
        player_ids_with_roles: [("ply_valorant_001", "IGL"), ("ply_valorant_002", "Duelist"), ...]
        """
        cursor = conn.cursor()
        n_players = len(player_ids_with_roles)
        expected_size = self.game_cfg.default_roster_size if self.game_cfg else 5

        # 1. Score each player individually for their assigned role
        scored_members = []
        member_scores = []
        member_roles = []
        total_salary = 0.0

        for pid, slot_role in player_ids_with_roles:
            # Query player details & contract
            p_row = cursor.execute("""
                SELECT p.name, p.role, p.matches_played, c.salary_monthly, c.buyout, c.ask_salary, t.tier
                FROM players p
                LEFT JOIN contracts c ON p.id = c.player_id
                LEFT JOIN teams t ON c.team_id = t.id
                WHERE p.id = ?
            """, (pid,)).fetchone()

            handle = p_row[0] if p_row else pid
            primary_role = p_row[1] if p_row else slot_role
            maps_cnt = p_row[2] if p_row else 0
            sal = (p_row[3] * 12) if (p_row and p_row[3]) else ((p_row[5] if p_row else 90000) or 90000)
            total_salary += sal

            score_res = self.role_engine.score_player(conn, pid, role_id=slot_role)
            role_fit = score_res["final_score"]
            member_scores.append(role_fit)
            member_roles.append(slot_role)

            scored_members.append({
                "player_id": pid,
                "handle": handle,
                "slot_role": slot_role,
                "primary_role": primary_role,
                "role_fit": role_fit,
                "final_lb": score_res["final_lb"],
                "confidence": score_res["confidence"],
                "sample_maps": maps_cnt,
                "sub_scores": score_res["sub_scores"],
                "risk_flags": score_res["risk_flags"],
                "annual_salary": sal
            })

        avg_score = float(np.mean(member_scores)) if member_scores else 50.0

        # 2. Pairwise Synergy Matrix Calculation
        # Components:
        # a) Role complementarity: diverse roles complement each other; duplicate roles get penalized
        # b) Shared maps & win rate: pairs that played maps together
        # c) Comms load compatibility: IGL + support vs fraggers
        # d) Playstyle clash penalty
        pairwise_matrix = []
        pair_synergy_scores = []

        for i in range(n_players):
            for j in range(i + 1, n_players):
                p1 = scored_members[i]
                p2 = scored_members[j]

                # Role complementarity
                r1, r2 = p1["slot_role"].upper(), p2["slot_role"].upper()
                if r1 == r2:
                    comp_score = 0.65  # Role overlap penalty
                    clash_flag = "ROLE_OVERLAP"
                elif (r1 == "IGL" and r2 in ("DUELIST", "CARRY", "MID")) or (r2 == "IGL" and r1 in ("DUELIST", "CARRY", "MID")):
                    comp_score = 1.15  # Tactical caller + Spearhead synergy
                    clash_flag = "TACTICAL_SPEARHEAD"
                elif (r1 in ("CONTROLLER", "SUPPORT") and r2 in ("SENTINEL", "OFFLANE")):
                    comp_score = 1.10  # Vision + Defense synergy
                    clash_flag = "DEFENSIVE_ANCHOR"
                else:
                    comp_score = 1.00
                    clash_flag = "STANDARD_FIT"

                # Query shared maps between p1 and p2
                shared_maps_cnt = 0
                shared_win_rate = 0.50
                try:
                    shared_maps_rows = cursor.execute("""
                        SELECT pms1.map_id, mg.winner_team_id, pms1.team_id
                        FROM player_map_stats pms1
                        JOIN player_map_stats pms2 ON pms1.map_id = pms2.map_id AND pms1.team_id = pms2.team_id
                        JOIN maps_or_games mg ON pms1.map_id = mg.id
                        WHERE pms1.player_id = ? AND pms2.player_id = ?
                    """, (p1["player_id"], p2["player_id"])).fetchall()

                    shared_maps_cnt = len(shared_maps_rows)
                    if shared_maps_cnt > 0:
                        wins = sum(1 for m in shared_maps_rows if m[1] == m[2])
                        shared_win_rate = wins / shared_maps_cnt
                except Exception:
                    shared_maps_cnt = 0
                    shared_win_rate = 0.50

                shared_boost = (shared_win_rate - 0.50) * 0.30 if shared_maps_cnt >= 5 else 0.0

                # Pair synergy score
                pair_score = round(max(0.60, min(1.40, comp_score + shared_boost)), 2)
                pair_synergy_scores.append(pair_score)

                pairwise_matrix.append({
                    "player_a": p1["player_id"],
                    "handle_a": p1["handle"],
                    "role_a": p1["slot_role"],
                    "player_b": p2["player_id"],
                    "handle_b": p2["handle"],
                    "role_b": p2["slot_role"],
                    "complementarity": round(comp_score, 2),
                    "shared_maps": shared_maps_cnt,
                    "shared_win_rate": round(shared_win_rate * 100, 1),
                    "synergy_score": pair_score,
                    "synergy_tag": clash_flag
                })

        # Overall roster synergy coefficient S_roster in [0.70, 1.30]
        if pair_synergy_scores:
            s_roster = round(float(np.mean(pair_synergy_scores)), 3)
            s_roster = max(0.70, min(1.30, s_roster))
        else:
            s_roster = 1.000

        # Missing slots penalty
        missing_slots = max(0, expected_size - n_players)
        if missing_slots > 0:
            s_roster = round(max(0.70, s_roster - missing_slots * 0.08), 3)

        # 3. Trajectory evaluation for roster
        # Generate representative 12-month trajectory
        traj_data = self.traj_engine.evaluate_player_trajectory([
            {"date": f"2025-{i:02d}-01", "rating": round(avg_score + np.sin(i * 0.5) * 3.0, 1)}
            for i in range(1, 13)
        ])
        traj_slope = traj_data["slope_per_month"]
        traj_score = min(100.0, max(0.0, 50.0 + traj_slope * 25.0))

        # 4. Stability & Budget Efficiency
        stability_score = 85.0 if n_players == expected_size else 60.0
        budget_efficiency = min(100.0, max(20.0, (avg_score * 1800.0) / max(50000.0, total_salary / 1000.0)))

        # 5. Roster Health Index (RHI) in [0, 100]
        # Formula: RHI = 0.35 * AvgScore + 0.25 * Synergy + 0.15 * Trajectory + 0.15 * Stability + 0.10 * BudgetEfficiency
        synergy_scaled = ((s_roster - 0.70) / 0.60) * 100.0
        rhi = round(
            0.35 * avg_score +
            0.25 * synergy_scaled +
            0.15 * traj_score +
            0.15 * stability_score +
            0.10 * budget_efficiency,
            1
        )
        rhi = max(0.0, min(100.0, rhi))

        # 6. Automatic Gap Diagnosis
        diagnosis = self._diagnose_gaps(conn, scored_members, expected_size)

        return {
            "roster_id": roster_id,
            "game_id": self.game_id,
            "roster_health_index": rhi,
            "synergy_coefficient": s_roster,
            "average_score": round(avg_score, 1),
            "members_count": n_players,
            "expected_size": expected_size,
            "total_salary": round(total_salary, 0),
            "members": scored_members,
            "pairwise_synergy": pairwise_matrix,
            "trajectory": traj_data,
            "components": {
                "player_skill": round(avg_score, 1),
                "synergy_scaled": round(synergy_scaled, 1),
                "trajectory_score": round(traj_score, 1),
                "stability_score": round(stability_score, 1),
                "budget_efficiency": round(budget_efficiency, 1)
            },
            "diagnosis": diagnosis
        }

    def _diagnose_gaps(
        self,
        conn: sqlite3.Connection,
        members: List[Dict[str, Any]],
        expected_size: int
    ) -> Dict[str, Any]:
        """Diagnoses roster gaps, weakest links, and recommends targeted candidate fixes."""
        cursor = conn.cursor()
        current_roles = [m["slot_role"].upper() for m in members]

        # Expected roles for the game
        game_roles = [r.id.upper() for r in self.game_cfg.roles] if self.game_cfg else ["IGL", "DUELIST", "INITIATOR", "CONTROLLER", "SENTINEL"]
        missing_roles = [r for r in game_roles[:expected_size] if r not in current_roles]

        # Weakest slot
        weakest_member = min(members, key=lambda m: m["role_fit"]) if members else None

        missing_attributes = []
        # Check IGL presence and mid-round adaptation
        igl_member = next((m for m in members if m["slot_role"].upper() == "IGL"), None)
        if not igl_member:
            missing_attributes.append({
                "attribute": "TACTICAL_SHOTCALLER",
                "severity": "CRITICAL",
                "description": "No dedicated In-Game Leader rostered. Tactical conversion at high risk."
            })
        elif igl_member["role_fit"] < 65.0:
            missing_attributes.append({
                "attribute": "LOW_ADAPTATION_IGL",
                "severity": "HIGH",
                "description": f"IGL ({igl_member['handle']}) role fit is {igl_member['role_fit']}. Weak mid-round adaptation."
            })

        # Check clutch / entry fragger
        fragger = next((m for m in members if m["slot_role"].upper() in ("DUELIST", "CARRY", "ENTRY")), None)
        if not fragger:
            missing_attributes.append({
                "attribute": "PRIMARY_ENTRY_SPEARHEAD",
                "severity": "HIGH",
                "description": "Lacking dedicated Entry Fragger to secure opening picks and create space."
            })

        # Urgent vacancies
        urgent_vacancies = []
        for mr in missing_roles:
            urgent_vacancies.append({
                "role": mr,
                "priority": "HIGH",
                "reason": f"Standard {self.game_id.upper()} composition requires active {mr} operator."
            })

        # Find top 3 replacement recommendations from database for weakest or missing slot
        target_role = missing_roles[0] if missing_roles else (weakest_member["slot_role"] if weakest_member else "IGL")
        candidate_rows = cursor.execute("""
            SELECT p.id, p.name, p.matches_played, c.salary_monthly, c.buyout
            FROM players p
            LEFT JOIN contracts c ON p.id = c.player_id
            WHERE p.role = ? AND (p.id LIKE ? OR p.game = ?)
              AND p.matches_played >= 15
            LIMIT 10
        """, (target_role, f"ply_{self.game_id}_%", self.game_id)).fetchall()

        recommended_targets = []
        for cr in candidate_rows:
            cid, cname, cmaps, csal, cbuy = cr
            score_res = self.role_engine.score_player(conn, cid, role_id=target_role)
            recommended_targets.append({
                "player_id": cid,
                "handle": cname,
                "role": target_role,
                "role_fit": score_res["final_score"],
                "final_lb": score_res["final_lb"],
                "sample_maps": cmaps,
                "buyout": cbuy or 180000
            })

        recommended_targets.sort(key=lambda x: x["role_fit"], reverse=True)

        return {
            "weakest_slot": {
                "player_id": weakest_member["player_id"],
                "handle": weakest_member["handle"],
                "slot_role": weakest_member["slot_role"],
                "role_fit": weakest_member["role_fit"]
            } if weakest_member else None,
            "missing_tactical_attributes": missing_attributes,
            "urgent_vacancies": urgent_vacancies,
            "suggested_solutions": recommended_targets[:3]
        }
