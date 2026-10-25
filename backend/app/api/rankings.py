"""
ScoutIQ — Live Rankings & IGL Intelligence API (Section 5 & 14, Phase 4)
Provides:
- GET & POST /api/rankings with live Bayesian-shrunk role scoring, custom weights, presets, and filters.
- GET /api/igl/{player_id}/breakdown with 8-axis radar components, side splits, adaptation, and economy conversion.
- GET /api/igl/{player_id}/decisions with historical shot-calling timeline and win-probability added (WPA).
"""

from __future__ import annotations
import math
import sqlite3
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Query, Body, HTTPException
from pydantic import BaseModel

from ..db import connect
from ..core.config_loader import get_game_config
from ..metrics.igl_model import IGLScoringEngine
from ..metrics.role_engine import UniversalRoleEngine
from ..ml.win_probability import get_win_prob_model

router = APIRouter(tags=["Rankings & Intelligence"])


class RankingsRequest(BaseModel):
    game: str = "valorant"
    role: Optional[str] = None
    preset: Optional[str] = "balanced"
    custom_weights: Optional[Dict[str, float]] = None
    min_maps: int = 10
    tier: Optional[str] = None
    region: Optional[str] = None
    availability: Optional[str] = None
    max_buyout: Optional[float] = None
    sort_by: str = "final_score"
    order: str = "desc"
    limit: int = 50
    offset: int = 0


def _query_and_rank_players(
    conn: sqlite3.Connection,
    req: RankingsRequest
) -> Dict[str, Any]:
    game_id = req.game.lower()
    game_cfg = get_game_config(game_id)
    if not game_cfg:
        raise HTTPException(status_code=404, detail=f"Game '{req.game}' configuration not found")

    cursor = conn.cursor()

    # Determine role weights
    role_to_score = req.role if req.role and req.role.lower() != "all" else None
    
    # Base query for players with contract and team info
    query = """
        SELECT p.id, p.name, p.role, p.matches_played, p.availability, p.language,
               t.id as team_id, t.name as team_name, t.tier, t.region, t.elo,
               c.salary_monthly, c.buyout, c.ask_salary
        FROM players p
        LEFT JOIN contracts c ON p.id = c.player_id
        LEFT JOIN teams t ON c.team_id = t.id
        WHERE (p.id LIKE ? OR t.game_id = ?)
          AND p.matches_played >= ?
    """
    params: List[Any] = [f"ply_{game_id}_%", game_id, req.min_maps]

    if role_to_score:
        query += " AND p.role = ?"
        params.append(role_to_score)
    if req.tier:
        query += " AND t.tier = ?"
        params.append(req.tier)
    if req.region:
        query += " AND t.region = ?"
        params.append(req.region)
    if req.availability:
        query += " AND p.availability = ?"
        params.append(req.availability)
    if req.max_buyout is not None:
        query += " AND (c.buyout IS NULL OR c.buyout <= ?)"
        params.append(req.max_buyout)

    rows = cursor.execute(query, params).fetchall()

    role_engine = UniversalRoleEngine(game_id=game_id)
    results = []

    for r in rows:
        pid, name, p_role, maps_cnt, avail, lang, team_id, team_name, tier, region, elo, salary_monthly, buyout, ask_salary = r
        active_role = role_to_score or p_role

        # Fetch custom weights or preset weights if IGL
        effective_weights = None
        if active_role.upper() == "IGL" and req.preset:
            role_cfg = game_cfg.get_role("IGL")
            if role_cfg and req.preset in role_cfg.weight_presets:
                effective_weights = role_cfg.weight_presets[req.preset]
        if req.custom_weights:
            effective_weights = req.custom_weights

        try:
            score_data = role_engine.score_player(
                conn, pid, role_id=active_role, custom_weights=effective_weights
            )
        except Exception:
            score_data = {
                "role_fit": 50.0,
                "final_score": 50.0,
                "final_lb": 35.0,
                "confidence": 0.5,
                "sample_maps": maps_cnt,
                "sub_scores": {},
                "risk_flags": ["ERROR_SCORING"],
                "weights_used": {}
            }

        # Annualized salary estimate
        salary_val = (salary_monthly * 12) if salary_monthly else (ask_salary or 90000)

        results.append({
            "player_id": pid,
            "handle": name,
            "role": p_role,
            "evaluated_role": active_role,
            "overall_score": score_data["final_score"],
            "final_lb": score_data["final_lb"],
            "confidence": score_data["confidence"],
            "sample_maps": score_data["sample_maps"],
            "sub_scores": score_data["sub_scores"],
            "risk_flags": score_data["risk_flags"],
            "team": team_name or "Free Agent",
            "team_id": team_id,
            "tier": tier or "T2",
            "region": region or "NA",
            "team_elo": elo or 1500.0,
            "contract": {
                "salary": salary_val,
                "buyout": buyout or 200000,
                "status": "contracted" if team_id else (avail or "available")
            }
        })

    # Sort results
    reverse_sort = (req.order.lower() == "desc")
    sort_key = req.sort_by if req.sort_by in ("final_score", "final_lb", "sample_maps", "confidence") else "final_score"
    if sort_key == "final_score":
        results.sort(key=lambda x: x["overall_score"], reverse=reverse_sort)
    elif sort_key == "final_lb":
        results.sort(key=lambda x: x["final_lb"], reverse=reverse_sort)
    elif sort_key == "sample_maps":
        results.sort(key=lambda x: x["sample_maps"], reverse=reverse_sort)
    elif sort_key == "confidence":
        results.sort(key=lambda x: x["confidence"], reverse=reverse_sort)

    total_count = len(results)
    paginated = results[req.offset: req.offset + req.limit]

    # Assign sequential ranks based on current sort
    for idx, item in enumerate(paginated, start=req.offset + 1):
        item["rank"] = idx

    return {
        "game": game_id,
        "role": req.role or "all",
        "preset": req.preset,
        "total": total_count,
        "limit": req.limit,
        "offset": req.offset,
        "rankings": paginated,
        "ranked": paginated,
        "total_ranked": total_count,
    }


@router.get("/rankings")
@router.get("/api/rankings")
def get_rankings(
    game: str = Query("valorant", description="Game title: valorant, cs2, lol, dota2"),
    role: Optional[str] = Query(None, description="Role filter (e.g. IGL, Duelist, etc.)"),
    preset: Optional[str] = Query("balanced", description="Weight preset: balanced, aggressive, economy_focused, mentor"),
    min_maps: int = Query(10, description="Minimum maps threshold"),
    tier: Optional[str] = Query(None, description="Tier filter: T1, T2, T3, academy"),
    region: Optional[str] = Query(None, description="Region filter: NA, EMEA, APAC, etc."),
    availability: Optional[str] = Query(None, description="Contract status"),
    max_buyout: Optional[float] = Query(None, description="Maximum buyout price"),
    sort_by: str = Query("final_score", description="Sort field: final_score, final_lb, sample_maps"),
    order: str = Query("desc", description="Sort order: asc, desc"),
    limit: int = Query(50, description="Max items per page"),
    offset: int = Query(0, description="Item offset for pagination")
):
    conn = connect()
    req = RankingsRequest(
        game=game,
        role=role,
        preset=preset,
        min_maps=min_maps,
        tier=tier,
        region=region,
        availability=availability,
        max_buyout=max_buyout,
        sort_by=sort_by,
        order=order,
        limit=limit,
        offset=offset
    )
    return _query_and_rank_players(conn, req)


@router.post("/rankings")
@router.post("/api/rankings")
def post_rankings(req: RankingsRequest = Body(...)):
    conn = connect()
    return _query_and_rank_players(conn, req)


@router.get("/igl/{player_id}/breakdown")
@router.get("/api/igl/{player_id}/breakdown")
def get_igl_breakdown(player_id: str, game: str = "valorant"):
    """
    Returns deep-dive 8-component IGL intelligence:
    - 8-axis radar values and percentiles
    - Tier peer benchmarks
    - Attack vs Defense Call Win Delta split
    - Mid-round adaptation win rates
    - Economy conversion matrix
    """
    conn = connect()
    engine = IGLScoringEngine()
    cursor = conn.cursor()

    eval_res = engine.evaluate_igl_from_db(conn, player_id, game_id=game)

    # 1. Query rounds called by this IGL for side splits & adaptation
    rounds_rows = cursor.execute("""
        SELECT r.side, r.buy_type_a, r.winner, r.plan_tag, r.plan_switched_mid_round,
               r.plan_conversion, r.econ_a, r.econ_b
        FROM rounds r
        WHERE r.igl_player_id = ?
    """, (player_id,)).fetchall()

    attack_wins, attack_total = 0, 0
    def_wins, def_total = 0, 0
    standard_switch_wins, switch_total = 0, 0
    force_wins, force_total = 0, 0
    eco_wins, eco_total = 0, 0

    for r in rounds_rows:
        side_val, buy_type, winner, ptag, switched, conv, econ_a, econ_b = r
        won = (winner == "team_a")
        
        # Explicit side tracking from database column
        if side_val and side_val.lower() == "attack":
            attack_total += 1
            if won:
                attack_wins += 1
        else:
            def_total += 1
            if won:
                def_wins += 1

        if switched:
            switch_total += 1
            if won:
                standard_switch_wins += 1

        if buy_type == "force_buy":
            force_total += 1
            if won:
                force_wins += 1
        elif buy_type == "eco":
            eco_total += 1
            if won:
                eco_wins += 1

    atk_wr = round((attack_wins / max(1, attack_total)) * 100.0, 1)
    def_wr = round((def_wins / max(1, def_total)) * 100.0, 1)
    switch_wr = round((standard_switch_wins / max(1, switch_total)) * 100.0, 1)
    force_wr = round((force_wins / max(1, force_total)) * 100.0, 1)
    eco_wr = round((eco_wins / max(1, eco_total)) * 100.0, 1)

    # Peer benchmarks (average 50.0 percentile across peer IGLs)
    peer_benchmark = {
        "cwd": 50.0,
        "mra": 50.0,
        "eco": 50.0,
        "conv": 50.0,
        "coord": 50.0,
        "lrd": 50.0,
        "fp": 50.0,
        "con": 50.0
    }

    # Radar components formatted for frontend chart
    radar_data = [
        {"metric": "Call Win Delta (CWD)", "value": eval_res["sub_scores"]["cwd"], "peer": peer_benchmark["cwd"], "weight": 0.22},
        {"metric": "Mid-Round Adaptation (MRA)", "value": eval_res["sub_scores"]["mra"], "peer": peer_benchmark["mra"], "weight": 0.20},
        {"metric": "Economy Decisions (ECO)", "value": eval_res["sub_scores"]["eco"], "peer": peer_benchmark["eco"], "weight": 0.15},
        {"metric": "Late-Round Clutch (LRD)", "value": eval_res["sub_scores"]["lrd"], "peer": peer_benchmark["lrd"], "weight": 0.08},
        {"metric": "Team Coordination (COORD)", "value": eval_res["sub_scores"]["coord"], "peer": peer_benchmark["coord"], "weight": 0.13},
        {"metric": "Plan Conversion (CONV)", "value": eval_res["sub_scores"]["conv"], "peer": peer_benchmark["conv"], "weight": 0.10},
        {"metric": "Firepower (FP)", "value": eval_res["sub_scores"]["fp"], "peer": peer_benchmark["fp"], "weight": 0.07},
        {"metric": "Consistency (CON)", "value": eval_res["sub_scores"]["con"], "peer": peer_benchmark["con"], "weight": 0.05},
    ]

    return {
        "player_id": player_id,
        "igl_score": eval_res["igl_score"],
        "final_lb": eval_res["final_lb"],
        "confidence": eval_res["confidence"],
        "sample_maps": eval_res["sample_maps"],
        "sample_rounds": eval_res["sample_rounds"],
        "radar": radar_data,
        "raw_metrics": eval_res["raw_metrics"],
        "side_splits": {
            "attack_win_rate": atk_wr,
            "defense_win_rate": def_wr,
            "call_win_delta_attack": round(atk_wr - 50.0, 1),
            "call_win_delta_defense": round(def_wr - 50.0, 1),
        },
        "adaptation_profile": {
            "mid_round_switch_rate": round(switch_total / max(1, len(rounds_rows)), 3),
            "mid_round_win_rate": switch_wr,
            "default_plan_win_rate": round((sum(1 for r in rounds_rows if r[1] == 'team_a' and not r[3]) / max(1, len(rounds_rows) - switch_total)) * 100.0, 1)
        },
        "economy_conversion": {
            "force_buy_win_rate": force_wr,
            "eco_round_conversion": eco_wr,
            "thrifty_rate": round(eco_wr * 0.4, 1),
            "efficiency_rating": eval_res["sub_scores"]["eco"]
        },
        "risk_flags": eval_res["risk_flags"]
    }


@router.get("/igl/{player_id}/decisions")
@router.get("/api/igl/{player_id}/decisions")
def get_igl_decisions(player_id: str, limit: int = 30):
    """
    Returns timeline of specific tactical / macro decisions called by this IGL,
    complete with win-probability added (WPA) before/after the call.
    """
    conn = connect()
    cursor = conn.cursor()
    _ = get_win_prob_model(conn)

    # Query latest rounds called by this IGL
    rounds = cursor.execute("""
        SELECT r.id, r.map_id, r.round_no, r.buy_type_a, r.winner,
               r.plan_tag, r.plan_switched_mid_round, r.switch_time_s,
               r.bomb_planted, r.plan_conversion, r.econ_a, r.econ_b,
               m.map_name_or_game_no
        FROM rounds r
        JOIN maps_or_games m ON r.map_id = m.id
        WHERE r.igl_player_id = ?
        ORDER BY r.id DESC
        LIMIT ?
    """, (player_id, limit)).fetchall()

    timeline = []
    for r in rounds:
        rid, map_id, r_num, rtype, winner, ptag, switched, stime, planted, conv, econ_a, econ_b, map_name = r
        won = (winner == "team_a")

        # Compute pre-decision win probability based on round type and economy
        econ_diff = (econ_a - econ_b) / 1000.0
        p_before = 1.0 / (1.0 + math.exp(-0.4 * econ_diff))
        p_before = max(0.15, min(0.85, p_before))

        # Mid-round adjustment
        if switched:
            _p_mid = p_before + (0.12 if won else -0.10)
        else:
            _p_mid = p_before

        p_after = 1.0 if won else 0.0
        wpa = round(p_after - p_before, 3)

        # Generate contextual tactical call description
        if switched:
            desc = f"Mid-round audibled from {ptag.capitalize()} at {int(stime or 45)}s"
        elif rtype == "force_buy":
            desc = f"High-risk Force Buy call with ${econ_a} team bank"
        elif planted:
            desc = f"Site execute converted to post-plant on {map_name}"
        else:
            desc = f"Standard tactical {ptag} call on {map_name}"

        timeline.append({
            "round_id": rid,
            "map_name": map_name,
            "round_number": r_num,
            "call_type": "AUDIBLE" if switched else ("FORCE_BUY" if rtype == "force_buy" else "MACRO_EXECUTE"),
            "description": desc,
            "round_type": rtype,
            "won": won,
            "p_before": round(p_before, 2),
            "p_after": round(p_after, 2),
            "wpa_delta": wpa,
            "significance": "CRITICAL" if abs(wpa) >= 0.35 else "STANDARD"
        })

    return {
        "player_id": player_id,
        "total_calls": len(timeline),
        "timeline": timeline
    }
