"""FastAPI router for the Esports Cognitive & Performance Assessment Suite.
Endpoints for session orchestration, telemetry recording, and reporting.
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from ..db import connect
from .engine import CognitiveScoringEngine
from .models import (
    AssessmentType,
    FinalizeAttemptRequest,
    RecordEventRequest,
    StartAttemptRequest,
)
from .storage import (
    create_attempt,
    finalize_attempt,
    get_attempt,
    get_player_history,
    get_player_personal_bests,
    record_event,
)

router = APIRouter(prefix="/api/cognitive", tags=["Cognitive Assessment Lab"])


@router.post("/attempts/start")
def api_start_attempt(req: StartAttemptRequest):
    """Initializes a new cognitive assessment attempt."""
    conn = connect()
    try:
        attempt = create_attempt(
            conn=conn,
            player_id=req.player_id,
            assessment_type=req.assessment_type,
            input_method=req.input_method,
            configuration=req.configuration,
        )
        return attempt
    finally:
        conn.close()


@router.post("/attempts/{attempt_id}/event")
def api_record_event(attempt_id: str, req: RecordEventRequest):
    """Records a single telemetry event during an interactive assessment."""
    conn = connect()
    try:
        attempt = get_attempt(conn, attempt_id)
        if not attempt:
            raise HTTPException(status_code=404, detail=f"Attempt {attempt_id} not found")
        if attempt["status"] == "completed":
            raise HTTPException(status_code=400, detail="Cannot record events on a completed attempt")

        evt = record_event(
            conn=conn,
            attempt_id=attempt_id,
            event_type=req.event_type,
            event_timestamp=req.event_timestamp,
            event_payload=req.event_payload,
        )
        return evt
    finally:
        conn.close()


@router.post("/attempts/{attempt_id}/finalize")
def api_finalize_attempt(attempt_id: str, req: FinalizeAttemptRequest):
    """
    Validates client raw events, computes verifiable metrics, and persists the completed assessment.
    Guarantees idempotency and rejects tampering.
    """
    conn = connect()
    try:
        attempt = get_attempt(conn, attempt_id)
        if not attempt:
            raise HTTPException(status_code=404, detail=f"Attempt {attempt_id} not found")
        if attempt["status"] == "completed":
            raise HTTPException(status_code=409, detail="Attempt has already been finalized")

        a_type = AssessmentType(attempt["assessment_type"])
        computed_metrics, validation_status, primary_metric, primary_value = CognitiveScoringEngine.evaluate_attempt(
            assessment_type=a_type,
            raw_results=req.raw_results,
        )

        finalized = finalize_attempt(
            conn=conn,
            attempt_id=attempt_id,
            raw_results=req.raw_results,
            computed_metrics=computed_metrics,
            primary_metric=primary_metric,
            primary_value=primary_value,
            validation_status=validation_status,
            input_method=req.input_method.value,
        )
        return finalized
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()


@router.get("/attempts/{attempt_id}")
def api_get_attempt(attempt_id: str):
    """Retrieves attempt details and computed results."""
    conn = connect()
    try:
        attempt = get_attempt(conn, attempt_id)
        if not attempt:
            raise HTTPException(status_code=404, detail=f"Attempt {attempt_id} not found")
        return attempt
    finally:
        conn.close()


@router.get("/players/{player_id}/history")
def api_get_history(
    player_id: str,
    assessment_type: Optional[str] = Query(None, description="Optional filter by test type"),
    limit: int = Query(50, ge=1, le=200),
):
    """Retrieves historical completed assessments for a player."""
    conn = connect()
    try:
        history = get_player_history(conn, player_id=player_id, assessment_type=assessment_type, limit=limit)
        return {
            "player_id": player_id,
            "total_attempts": len(history),
            "history": history,
        }
    finally:
        conn.close()


@router.get("/players/{player_id}/personal-bests")
def api_get_personal_bests(player_id: str):
    """Retrieves all-time personal best scores for a player across all 4 cognitive tests."""
    conn = connect()
    try:
        bests = get_player_personal_bests(conn, player_id=player_id)
        return {
            "player_id": player_id,
            "personal_bests": bests,
        }
    finally:
        conn.close()


@router.get("/players/{player_id}/report")
def api_get_player_report(player_id: str):
    """Synthesizes all completed cognitive assessments into a comprehensive performance report."""
    conn = connect()
    try:
        bests = get_player_personal_bests(conn, player_id=player_id)
        history = get_player_history(conn, player_id=player_id, limit=20)
        report = CognitiveScoringEngine.generate_player_report(
            player_id=player_id,
            personal_bests=bests,
            recent_history=history,
        )
        return report
    finally:
        conn.close()
