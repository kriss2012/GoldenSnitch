"""
ScoutIQ — Operational Intelligence API (Features 8–14, Section 9 & 14, Phase 8)
"""

from __future__ import annotations
import sqlite3
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field

from ..db import connect
from ..features.operational_intelligence import OperationalIntelligenceEngine

router = APIRouter(tags=["Features 8–14: Operational Intelligence"])


class OptimizerRequest(BaseModel):
    game: str = "valorant"
    budget_usd: float = 600000.0
    target_roles: Optional[List[str]] = None


class MetaShiftRequest(BaseModel):
    game: str = "valorant"
    roster_id: int
    weight_adjustments: Dict[str, float] = Field(default_factory=dict)


class NLSearchRequest(BaseModel):
    query: str
    game: str = "valorant"


class ScoutingReportRequest(BaseModel):
    player_id: str
    game: str = "valorant"
    target_role: Optional[str] = None


@router.post("/optimizer/roster")
@router.post("/api/optimizer/roster")
def post_optimizer_roster(b: OptimizerRequest):
    conn = connect()
    engine = OperationalIntelligenceEngine(game_id=b.game)
    return engine.optimize_roster_ilp(
        conn=conn,
        budget_usd=b.budget_usd,
        target_roles=b.target_roles
    )


@router.post("/simulation/meta-shift")
@router.post("/api/simulation/meta-shift")
def post_meta_shift_simulation(b: MetaShiftRequest):
    conn = connect()
    engine = OperationalIntelligenceEngine(game_id=b.game)
    try:
        return engine.simulate_meta_shift(
            conn=conn,
            roster_id=b.roster_id,
            weight_adjustments=b.weight_adjustments
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/players/{player_id}/workload")
@router.get("/api/players/{player_id}/workload")
def get_player_workload(player_id: str, game: str = "valorant"):
    conn = connect()
    engine = OperationalIntelligenceEngine(game_id=game)
    try:
        return engine.monitor_workload_and_fatigue(conn, player_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reports/scouting")
@router.post("/api/reports/scouting")
def post_scouting_report(b: ScoutingReportRequest):
    conn = connect()
    engine = OperationalIntelligenceEngine(game_id=b.game)
    try:
        return engine.generate_scouting_report(
            conn=conn,
            player_id=b.player_id,
            target_role=b.target_role
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/search/nl")
@router.post("/api/search/nl")
def post_natural_language_search(b: NLSearchRequest):
    conn = connect()
    engine = OperationalIntelligenceEngine(game_id=b.game)
    return engine.parse_and_execute_nl_search(conn, b.query)


@router.get("/audit/fairness")
@router.get("/api/audit/fairness")
def get_fairness_audit(game: str = "valorant"):
    conn = connect()
    engine = OperationalIntelligenceEngine(game_id=game)
    return engine.audit_fairness_and_bias(conn)


@router.get("/talent/pipeline-readiness")
@router.get("/api/talent/pipeline-readiness")
def get_pipeline_readiness(game: str = "valorant", limit: int = 15):
    conn = connect()
    engine = OperationalIntelligenceEngine(game_id=game)
    prospects = engine.evaluate_pipeline_readiness(conn, limit=limit)
    return {
        "game": game,
        "total_prospects": len(prospects),
        "prospects": prospects
    }
