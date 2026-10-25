"""SQLite persistence layer for the Cognitive Assessment Suite.
Manages attempts, raw event telemetry, and summary metrics.
"""
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from .models import AssessmentStatus, AssessmentType, InputMethod


COGNITIVE_SCHEMA = """
CREATE TABLE IF NOT EXISTS cognitive_attempts (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    assessment_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'initialized',
    started_at TEXT NOT NULL,
    completed_at TEXT,
    input_method TEXT NOT NULL DEFAULT 'mouse',
    assessment_version TEXT NOT NULL DEFAULT '1.0.0',
    configuration TEXT NOT NULL DEFAULT '{}',
    raw_results TEXT NOT NULL DEFAULT '{}',
    computed_results TEXT NOT NULL DEFAULT '{}',
    validation_status TEXT NOT NULL DEFAULT 'valid'
);

CREATE TABLE IF NOT EXISTS cognitive_events (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL REFERENCES cognitive_attempts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_timestamp REAL NOT NULL,
    event_payload TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cognitive_summaries (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    attempt_id TEXT NOT NULL UNIQUE REFERENCES cognitive_attempts(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL,
    primary_metric TEXT NOT NULL,
    primary_value REAL NOT NULL,
    metric_values TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cog_attempts_player ON cognitive_attempts(player_id);
CREATE INDEX IF NOT EXISTS idx_cog_attempts_type ON cognitive_attempts(assessment_type);
CREATE INDEX IF NOT EXISTS idx_cog_summaries_player ON cognitive_summaries(player_id);
"""


def init_cognitive_db(conn: sqlite3.Connection) -> None:
    """Ensures cognitive assessment tables exist."""
    conn.executescript(COGNITIVE_SCHEMA)
    conn.commit()


def create_attempt(
    conn: sqlite3.Connection,
    player_id: str,
    assessment_type: AssessmentType,
    input_method: InputMethod = InputMethod.MOUSE,
    configuration: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    init_cognitive_db(conn)
    attempt_id = f"ATT-{assessment_type.value[:3].upper()}-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc).isoformat()
    config_json = json.dumps(configuration or {})

    conn.execute(
        """
        INSERT INTO cognitive_attempts (
            id, player_id, assessment_type, status, started_at, input_method,
            assessment_version, configuration, raw_results, computed_results, validation_status
        ) VALUES (?, ?, ?, ?, ?, ?, '1.0.0', ?, '{}', '{}', 'valid')
        """,
        (attempt_id, player_id, assessment_type.value, AssessmentStatus.IN_PROGRESS.value, now, input_method.value, config_json)
    )
    conn.commit()

    return {
        "id": attempt_id,
        "player_id": player_id,
        "assessment_type": assessment_type.value,
        "status": AssessmentStatus.IN_PROGRESS.value,
        "started_at": now,
        "input_method": input_method.value,
        "configuration": configuration or {},
    }


def record_event(
    conn: sqlite3.Connection,
    attempt_id: str,
    event_type: str,
    event_timestamp: float,
    event_payload: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    init_cognitive_db(conn)
    event_id = f"EVT-{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc).isoformat()
    payload_json = json.dumps(event_payload or {})

    conn.execute(
        """
        INSERT INTO cognitive_events (id, attempt_id, event_type, event_timestamp, event_payload, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (event_id, attempt_id, event_type, event_timestamp, payload_json, now)
    )
    conn.commit()

    return {
        "id": event_id,
        "attempt_id": attempt_id,
        "event_type": event_type,
        "event_timestamp": event_timestamp,
        "created_at": now,
    }


def finalize_attempt(
    conn: sqlite3.Connection,
    attempt_id: str,
    raw_results: Dict[str, Any],
    computed_metrics: Dict[str, Any],
    primary_metric: str,
    primary_value: float,
    validation_status: str = "valid",
    input_method: Optional[str] = None,
) -> Dict[str, Any]:
    init_cognitive_db(conn)
    row = conn.execute("SELECT * FROM cognitive_attempts WHERE id = ?", (attempt_id,)).fetchone()
    if not row:
        raise ValueError(f"Assessment attempt '{attempt_id}' not found")
    
    if row["status"] == AssessmentStatus.COMPLETED.value:
        raise ValueError(f"Attempt '{attempt_id}' has already been finalized")

    now = datetime.now(timezone.utc).isoformat()
    player_id = row["player_id"]
    assessment_type = row["assessment_type"]
    effective_input = input_method or row["input_method"]

    conn.execute(
        """
        UPDATE cognitive_attempts
        SET status = ?, completed_at = ?, input_method = ?, raw_results = ?,
            computed_results = ?, validation_status = ?
        WHERE id = ?
        """,
        (
            AssessmentStatus.COMPLETED.value,
            now,
            effective_input,
            json.dumps(raw_results),
            json.dumps(computed_metrics),
            validation_status,
            attempt_id
        )
    )

    # Insert or update summary record for fast queries
    summary_id = f"SUM-{attempt_id}"
    conn.execute(
        """
        INSERT OR REPLACE INTO cognitive_summaries (
            id, player_id, attempt_id, assessment_type, primary_metric, primary_value, metric_values, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            summary_id,
            player_id,
            attempt_id,
            assessment_type,
            primary_metric,
            primary_value,
            json.dumps(computed_metrics),
            now
        )
    )
    conn.commit()

    return {
        "id": attempt_id,
        "player_id": player_id,
        "assessment_type": assessment_type,
        "status": AssessmentStatus.COMPLETED.value,
        "started_at": row["started_at"],
        "completed_at": now,
        "input_method": effective_input,
        "validation_status": validation_status,
        "primary_metric": primary_metric,
        "primary_value": primary_value,
        "computed_results": computed_metrics,
        "raw_results": raw_results,
    }


def get_attempt(conn: sqlite3.Connection, attempt_id: str) -> Optional[Dict[str, Any]]:
    init_cognitive_db(conn)
    row = conn.execute("SELECT * FROM cognitive_attempts WHERE id = ?", (attempt_id,)).fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "player_id": row["player_id"],
        "assessment_type": row["assessment_type"],
        "status": row["status"],
        "started_at": row["started_at"],
        "completed_at": row["completed_at"],
        "input_method": row["input_method"],
        "configuration": json.loads(row["configuration"]) if row["configuration"] else {},
        "raw_results": json.loads(row["raw_results"]) if row["raw_results"] else {},
        "computed_results": json.loads(row["computed_results"]) if row["computed_results"] else {},
        "validation_status": row["validation_status"],
    }


def get_player_history(
    conn: sqlite3.Connection,
    player_id: str,
    assessment_type: Optional[str] = None,
    limit: int = 50,
) -> List[Dict[str, Any]]:
    init_cognitive_db(conn)
    if assessment_type:
        rows = conn.execute(
            """
            SELECT * FROM cognitive_attempts
            WHERE player_id = ? AND assessment_type = ? AND status = 'completed'
            ORDER BY completed_at DESC LIMIT ?
            """,
            (player_id, assessment_type, limit)
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT * FROM cognitive_attempts
            WHERE player_id = ? AND status = 'completed'
            ORDER BY completed_at DESC LIMIT ?
            """,
            (player_id, limit)
        ).fetchall()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "player_id": r["player_id"],
            "assessment_type": r["assessment_type"],
            "status": r["status"],
            "started_at": r["started_at"],
            "completed_at": r["completed_at"],
            "input_method": r["input_method"],
            "computed_results": json.loads(r["computed_results"]) if r["computed_results"] else {},
            "validation_status": r["validation_status"],
        })
    return results


def get_player_personal_bests(conn: sqlite3.Connection, player_id: str) -> Dict[str, Any]:
    init_cognitive_db(conn)
    # Mapping of assessment type to optimal direction:
    # reaction_time: MIN(primary_value)
    # sequence_memory: MAX(primary_value)
    # aim_trainer: MIN(primary_value) or MAX(targets_per_second)
    # visual_memory: MAX(primary_value)
    bests = {}

    # 1. Reaction Time (Lower is better)
    rt_row = conn.execute(
        """
        SELECT * FROM cognitive_summaries
        WHERE player_id = ? AND assessment_type = 'reaction_time'
        ORDER BY primary_value ASC LIMIT 1
        """,
        (player_id,)
    ).fetchone()
    if rt_row:
        bests["reaction_time"] = {
            "attempt_id": rt_row["attempt_id"],
            "primary_metric": rt_row["primary_metric"],
            "value": rt_row["primary_value"],
            "unit": "ms",
            "achieved_at": rt_row["created_at"],
            "metrics": json.loads(rt_row["metric_values"]),
        }

    # 2. Sequence Memory (Higher is better)
    seq_row = conn.execute(
        """
        SELECT * FROM cognitive_summaries
        WHERE player_id = ? AND assessment_type = 'sequence_memory'
        ORDER BY primary_value DESC LIMIT 1
        """,
        (player_id,)
    ).fetchone()
    if seq_row:
        bests["sequence_memory"] = {
            "attempt_id": seq_row["attempt_id"],
            "primary_metric": seq_row["primary_metric"],
            "value": int(seq_row["primary_value"]),
            "unit": "sequence length",
            "achieved_at": seq_row["created_at"],
            "metrics": json.loads(seq_row["metric_values"]),
        }

    # 3. Aim Trainer (Higher accuracy & lower avg time; primary metric avg time ASC)
    aim_row = conn.execute(
        """
        SELECT * FROM cognitive_summaries
        WHERE player_id = ? AND assessment_type = 'aim_trainer'
        ORDER BY primary_value ASC LIMIT 1
        """,
        (player_id,)
    ).fetchone()
    if aim_row:
        bests["aim_trainer"] = {
            "attempt_id": aim_row["attempt_id"],
            "primary_metric": aim_row["primary_metric"],
            "value": aim_row["primary_value"],
            "unit": "ms/target",
            "achieved_at": aim_row["created_at"],
            "metrics": json.loads(aim_row["metric_values"]),
        }

    # 4. Visual Memory (Higher level is better)
    vm_row = conn.execute(
        """
        SELECT * FROM cognitive_summaries
        WHERE player_id = ? AND assessment_type = 'visual_memory'
        ORDER BY primary_value DESC LIMIT 1
        """,
        (player_id,)
    ).fetchone()
    if vm_row:
        bests["visual_memory"] = {
            "attempt_id": vm_row["attempt_id"],
            "primary_metric": vm_row["primary_metric"],
            "value": int(vm_row["primary_value"]),
            "unit": "level",
            "achieved_at": vm_row["created_at"],
            "metrics": json.loads(vm_row["metric_values"]),
        }

    return bests
