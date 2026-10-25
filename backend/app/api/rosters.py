"""
ScoutIQ — Multi-Roster Management & Synergy API (Section 6 & 14, Phase 5)
Provides:
- GET & POST /api/rosters
- GET /api/rosters/{id}
- POST /api/rosters/{id}/members
- DELETE /api/rosters/{id}/members/{player_id}
- GET /api/rosters/{id}/synergy
- GET /api/rosters/{id}/diagnosis
- GET /api/rosters/{id}/trajectory
"""

from __future__ import annotations
import sqlite3
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException, Body, Query
from pydantic import BaseModel, Field

from ..db import connect
from ..synergy.engine import SynergyEngine

router = APIRouter(tags=["Rosters & Synergy"])


class CreateRosterRequest(BaseModel):
    name: str
    game: str = "valorant"
    target_profile: Optional[Dict[str, Any]] = None


class AddMemberRequest(BaseModel):
    player_id: str
    slot_role: str


def _get_roster_or_404(conn: sqlite3.Connection, roster_id: int):
    row = conn.execute("SELECT id, name, game, target_profile FROM rosters WHERE id = ?", (roster_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail=f"Roster #{roster_id} not found")
    return row


@router.get("/rosters")
@router.get("/api/rosters")
def list_rosters(game: Optional[str] = None):
    conn = connect()
    cursor = conn.cursor()

    query = "SELECT id, name, game, target_profile FROM rosters"
    params = []
    if game:
        query += " WHERE LOWER(game) = LOWER(?)"
        params.append(game)
    query += " ORDER BY id ASC"

    roster_rows = cursor.execute(query, params).fetchall()
    results = []

    for rid, name, rgame, target_profile in roster_rows:
        members_rows = cursor.execute("""
            SELECT rm.player_id, rm.slot_role, p.name, p.role
            FROM roster_members rm
            JOIN players p ON rm.player_id = p.id
            WHERE rm.roster_id = ?
        """, (rid,)).fetchall()

        # Evaluate synergy and RHI
        engine = SynergyEngine(game_id=rgame)
        members_tuples = [(r[0], r[1]) for r in members_rows]
        eval_data = engine.evaluate_roster(conn, rid, members_tuples)

        results.append({
            "id": rid,
            "name": name,
            "game": rgame,
            "members_count": len(members_rows),
            "expected_size": eval_data["expected_size"],
            "roster_health_index": eval_data["roster_health_index"],
            "synergy_coefficient": eval_data["synergy_coefficient"],
            "average_score": eval_data["average_score"],
            "total_salary": eval_data["total_salary"],
            "members": [
                {"player_id": r[0], "slot_role": r[1], "handle": r[2], "role": r[3]}
                for r in members_rows
            ]
        })

    return {
        "total": len(results),
        "rosters": results
    }


@router.post("/rosters")
@router.post("/api/rosters")
def create_roster(b: CreateRosterRequest):
    conn = connect()
    cursor = conn.cursor()
    import json
    from ..catalog import normalize_game_name
    norm_game = normalize_game_name(b.game)
    target_json = json.dumps(b.target_profile or {})

    cursor.execute("""
        INSERT INTO rosters (name, game, target_profile) VALUES (?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET game=excluded.game, target_profile=excluded.target_profile
    """, (b.name, norm_game, target_json))
    conn.commit()
    rid = cursor.execute("SELECT id FROM rosters WHERE name = ?", (b.name,)).fetchone()[0]

    return {
        "id": rid,
        "name": b.name,
        "game": norm_game,
        "status": "created"
    }


@router.get("/rosters/{roster_id}")
@router.get("/api/rosters/{roster_id}")
def get_roster_details(roster_id: int):
    conn = connect()
    row = _get_roster_or_404(conn, roster_id)
    rid, name, rgame, target_profile = row

    members_rows = conn.execute("""
        SELECT rm.player_id, rm.slot_role
        FROM roster_members rm
        WHERE rm.roster_id = ?
    """, (roster_id,)).fetchall()

    engine = SynergyEngine(game_id=rgame)
    members_tuples = [(r[0], r[1]) for r in members_rows]
    eval_data = engine.evaluate_roster(conn, roster_id, members_tuples)

    return {
        "id": rid,
        "name": name,
        "game": rgame,
        **eval_data
    }


@router.post("/rosters/{roster_id}/members")
@router.post("/api/rosters/{roster_id}/members")
def add_roster_member(roster_id: int, b: AddMemberRequest):
    conn = connect()
    _get_roster_or_404(conn, roster_id)
    cursor = conn.cursor()

    # Check player exists
    player_row = cursor.execute("SELECT id FROM players WHERE id = ?", (b.player_id,)).fetchone()
    if not player_row:
        raise HTTPException(status_code=404, detail=f"Player '{b.player_id}' not found")

    try:
        cursor.execute("""
            INSERT OR REPLACE INTO roster_members (roster_id, player_id, slot_role)
            VALUES (?, ?, ?)
        """, (roster_id, b.player_id, b.slot_role))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "roster_id": roster_id,
        "player_id": b.player_id,
        "slot_role": b.slot_role,
        "status": "added"
    }


@router.delete("/rosters/{roster_id}/members/{player_id}")
@router.delete("/api/rosters/{roster_id}/members/{player_id}")
def remove_roster_member(roster_id: int, player_id: str):
    conn = connect()
    _get_roster_or_404(conn, roster_id)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM roster_members WHERE roster_id = ? AND player_id = ?", (roster_id, player_id))
    conn.commit()

    return {
        "roster_id": roster_id,
        "player_id": player_id,
        "status": "removed"
    }


@router.get("/rosters/{roster_id}/synergy")
@router.get("/api/rosters/{roster_id}/synergy")
def get_roster_synergy(roster_id: int):
    """
    Returns pairwise synergy matrix, role complementary scores,
    and overall roster synergy coefficient S_roster in [0.70, 1.30].
    """
    conn = connect()
    row = _get_roster_or_404(conn, roster_id)
    rid, name, rgame, _ = row

    members_rows = conn.execute("""
        SELECT rm.player_id, rm.slot_role
        FROM roster_members rm
        WHERE rm.roster_id = ?
    """, (roster_id,)).fetchall()

    engine = SynergyEngine(game_id=rgame)
    members_tuples = [(r[0], r[1]) for r in members_rows]
    eval_data = engine.evaluate_roster(conn, roster_id, members_tuples)

    return {
        "roster_id": rid,
        "roster_name": name,
        "game": rgame,
        "synergy_coefficient": eval_data["synergy_coefficient"],
        "roster_health_index": eval_data["roster_health_index"],
        "pairwise_synergy": eval_data["pairwise_synergy"],
        "components": eval_data["components"]
    }


@router.get("/rosters/{roster_id}/diagnosis")
@router.get("/api/rosters/{roster_id}/diagnosis")
def get_roster_diagnosis(roster_id: int):
    """
    Automatically diagnoses roster gaps:
    - Weakest slot
    - Missing role attributes (e.g. Low Adaptation IGL, No Entry Fragger)
    - Urgent vacancies
    - Suggested candidate solutions
    """
    conn = connect()
    row = _get_roster_or_404(conn, roster_id)
    rid, name, rgame, _ = row

    members_rows = conn.execute("""
        SELECT rm.player_id, rm.slot_role
        FROM roster_members rm
        WHERE rm.roster_id = ?
    """, (roster_id,)).fetchall()

    engine = SynergyEngine(game_id=rgame)
    members_tuples = [(r[0], r[1]) for r in members_rows]
    eval_data = engine.evaluate_roster(conn, roster_id, members_tuples)

    return {
        "roster_id": rid,
        "roster_name": name,
        "game": rgame,
        "diagnosis": eval_data["diagnosis"]
    }


@router.get("/rosters/{roster_id}/trajectory")
@router.get("/api/rosters/{roster_id}/trajectory")
def get_roster_trajectory(roster_id: int):
    """
    Returns 12-month trajectory with Theil-Sen slope, Mann-Kendall monotonic test, and EWMA series.
    """
    conn = connect()
    row = _get_roster_or_404(conn, roster_id)
    rid, name, rgame, _ = row

    members_rows = conn.execute("""
        SELECT rm.player_id, rm.slot_role
        FROM roster_members rm
        WHERE rm.roster_id = ?
    """, (roster_id,)).fetchall()

    engine = SynergyEngine(game_id=rgame)
    members_tuples = [(r[0], r[1]) for r in members_rows]
    eval_data = engine.evaluate_roster(conn, roster_id, members_tuples)

    return {
        "roster_id": rid,
        "roster_name": name,
        "game": rgame,
        "trajectory": eval_data["trajectory"]
    }
