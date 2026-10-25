"""
ScoutIQ — Core Differentiators API (Features 1–7, Section 8 & 14, Phase 7)
"""

from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..db import connect
from ..features.core_differentiators import CoreDifferentiatorsEngine

router = APIRouter(tags=["Features 1–7: Core Differentiators"])


class CounterfactualRequest(BaseModel):
    roster_id: int
    player_out_id: str
    candidate_in_id: str
    target_role: Optional[str] = None
    n_simulations: int = 5000


@router.post("/simulator/counterfactual")
@router.post("/api/simulator/counterfactual")
def post_counterfactual_simulation(b: CounterfactualRequest):
    conn = connect()
    engine = CoreDifferentiatorsEngine()
    try:
        return engine.simulate_counterfactual_roster(
            conn=conn,
            roster_id=b.roster_id,
            player_out_id=b.player_out_id,
            candidate_in_id=b.candidate_in_id,
            target_role=b.target_role,
            n_simulations=b.n_simulations
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/igl/{player_id}/replay-lab")
@router.get("/api/igl/{player_id}/replay-lab")
def get_replay_lab(player_id: str, limit: int = 40):
    conn = connect()
    engine = CoreDifferentiatorsEngine()
    return engine.get_igl_replay_lab(conn, player_id, limit=limit)


@router.get("/scouting/hidden-gems")
@router.get("/api/scouting/hidden-gems")
def get_hidden_gems(game: str = "valorant", min_maps: int = 15, limit: int = 15):
    conn = connect()
    engine = CoreDifferentiatorsEngine(game_id=game)
    gems = engine.find_hidden_gems(conn, min_maps=min_maps, limit=limit)
    return {
        "game": game,
        "total_gems_found": len(gems),
        "hidden_gems": gems
    }


@router.get("/scouting/stat-padders-and-hype")
@router.get("/api/scouting/stat-padders-and-hype")
def get_stat_padders_and_hype(game: str = "valorant", limit: int = 20):
    conn = connect()
    engine = CoreDifferentiatorsEngine(game_id=game)
    flagged = engine.detect_stat_padders_and_hype(conn, limit=limit)
    return {
        "game": game,
        "total_flagged": len(flagged),
        "profiles": flagged
    }


@router.get("/talent/cross-title-transfer")
@router.get("/api/talent/cross-title-transfer")
def get_cross_title_transfer(
    player_id: str = Query(..., description="Source player ID"),
    source_game: str = Query("cs2", description="Source game"),
    target_game: str = Query("valorant", description="Target game")
):
    conn = connect()
    engine = CoreDifferentiatorsEngine(game_id=source_game)
    try:
        return engine.compute_cross_title_transfer(conn, player_id, target_game)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/players/{player_id}/similar")
@router.get("/api/players/{player_id}/similar")
def get_similar_players(player_id: str, game: str = "valorant", k: int = 5):
    conn = connect()
    engine = CoreDifferentiatorsEngine(game_id=game)
    try:
        similar = engine.find_similar_players(conn, player_id, k=k)
        return {
            "target_player_id": player_id,
            "game": game,
            "similar_players": similar
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/rosters/{roster_id}/depth-chart")
@router.get("/api/rosters/{roster_id}/depth-chart")
def get_roster_depth_chart(roster_id: int):
    conn = connect()
    engine = CoreDifferentiatorsEngine()
    try:
        return engine.get_roster_depth_plan(conn, roster_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
