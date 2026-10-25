"""
ScoutIQ — Recommendation & Head-to-Head API (Section 7 & 14, Phase 6)
Provides:
- POST & GET /api/recommendations (and /api/rosters/{id}/recommendations)
- GET /api/recommendations/head-to-head
"""

from __future__ import annotations
import sqlite3
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from ..db import connect
from ..recommend.engine import RecommendationEngine

router = APIRouter(tags=["Recommendations & Head-to-Head"])


class VacancyRecommendationRequest(BaseModel):
    roster_id: int
    target_role: str
    max_budget: float = 250000.0
    min_maps: int = 10
    limit: int = 15


@router.post("/recommendations")
@router.post("/api/recommendations")
def post_recommendations(b: VacancyRecommendationRequest):
    conn = connect()
    roster_row = conn.execute("SELECT id, name, game FROM rosters WHERE id = ?", (b.roster_id,)).fetchone()
    if not roster_row:
        raise HTTPException(status_code=404, detail=f"Roster #{b.roster_id} not found")

    rid, rname, rgame = roster_row
    rec_engine = RecommendationEngine(game_id=rgame)

    results = rec_engine.recommend_for_vacancy(
        conn=conn,
        roster_id=rid,
        target_role=b.target_role,
        max_budget_annual=b.max_budget,
        min_maps=b.min_maps,
        limit=b.limit
    )

    return {
        "roster_id": rid,
        "roster_name": rname,
        "game": rgame,
        "target_role": b.target_role,
        "max_budget": b.max_budget,
        "total_recommended": len(results),
        "candidates": results
    }


@router.get("/rosters/{roster_id}/recommendations")
@router.get("/api/rosters/{roster_id}/recommendations")
def get_roster_recommendations(
    roster_id: int,
    target_role: str = Query("IGL", description="Target role vacancy"),
    max_budget: float = Query(250000.0, description="Annual budget cap"),
    min_maps: int = Query(10, description="Minimum maps filter"),
    limit: int = Query(15, description="Max candidate suggestions")
):
    b = VacancyRecommendationRequest(
        roster_id=roster_id,
        target_role=target_role,
        max_budget=max_budget,
        min_maps=min_maps,
        limit=limit
    )
    return post_recommendations(b)


@router.get("/recommendations/head-to-head")
@router.get("/api/recommendations/head-to-head")
def get_head_to_head_comparison(
    cand_a: str = Query(..., description="First candidate ID"),
    cand_b: str = Query(..., description="Second candidate ID"),
    role: str = Query("IGL", description="Evaluated role"),
    roster_id: int = Query(0, description="Optional target roster ID"),
    game: str = Query("valorant", description="Game title")
):
    """
    Computes strictly additive head-to-head comparison:
    Delta = Final_A - Final_B = sum(w_i * (A_i - B_i))
    Yields zero hallucinated text; bullets derived directly from top component differences.
    """
    conn = connect()

    # Determine game from roster if provided
    active_game = game
    existing_members: List[tuple] = []
    if roster_id > 0:
        r_row = conn.execute("SELECT game FROM rosters WHERE id = ?", (roster_id,)).fetchone()
        if r_row:
            active_game = r_row[0]
            m_rows = conn.execute("SELECT player_id, slot_role FROM roster_members WHERE roster_id = ?", (roster_id,)).fetchall()
            existing_members = [(m[0], m[1]) for m in m_rows]

    rec_engine = RecommendationEngine(game_id=active_game)
    try:
        comparison = rec_engine.compare_head_to_head(
            conn=conn,
            cand_a_id=cand_a,
            cand_b_id=cand_b,
            target_role=role,
            existing_roster_members=existing_members
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "game": active_game,
        "evaluated_role": role,
        "roster_id": roster_id if roster_id > 0 else None,
        **comparison
    }
