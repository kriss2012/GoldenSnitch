"""Pydantic models and schemas for the Esports Cognitive & Performance Assessment Suite."""
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AssessmentType(str, Enum):
    REACTION_TIME = "reaction_time"
    SEQUENCE_MEMORY = "sequence_memory"
    AIM_TRAINER = "aim_trainer"
    VISUAL_MEMORY = "visual_memory"


class AssessmentStatus(str, Enum):
    INITIALIZED = "initialized"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    INTERRUPTED = "interrupted"
    INVALIDATED = "invalidated"


class InputMethod(str, Enum):
    MOUSE = "mouse"
    TOUCH = "touch"
    KEYBOARD = "keyboard"
    UNKNOWN = "unknown"


# Request / Response Models
class StartAttemptRequest(BaseModel):
    player_id: str = Field(..., description="Target player ID (e.g. ply_valorant_001 or current user)")
    assessment_type: AssessmentType
    input_method: InputMethod = InputMethod.MOUSE
    configuration: Optional[Dict[str, Any]] = Field(default_factory=dict)


class RecordEventRequest(BaseModel):
    event_type: str = Field(..., description="E.g. trial_start, stimulus_presented, click, false_start, target_hit, miss")
    event_timestamp: float = Field(..., description="High resolution timestamp in ms from performance.now()")
    event_payload: Optional[Dict[str, Any]] = Field(default_factory=dict)


class FinalizeAttemptRequest(BaseModel):
    raw_results: Dict[str, Any] = Field(..., description="Raw recorded trials, clicks, or sequence inputs")
    input_method: InputMethod = InputMethod.MOUSE
    browser_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    client_duration_ms: Optional[float] = None


# Metric Schemas per Test
class ReactionTimeMetrics(BaseModel):
    median_rt_ms: float
    mean_rt_ms: float
    fastest_rt_ms: float
    slowest_rt_ms: float
    consistency_stdev: float
    false_starts: int
    total_trials: int
    valid_trials: int
    trials: List[float]


class SequenceMemoryMetrics(BaseModel):
    highest_level_completed: int
    total_successful_rounds: int
    total_correct_inputs: int
    total_incorrect_inputs: int
    accuracy_pct: float
    avg_response_time_ms: float
    total_time_ms: float


class AimTrainerMetrics(BaseModel):
    total_completion_time_ms: float
    avg_time_per_target_ms: float
    median_time_per_target_ms: float
    fastest_target_ms: float
    targets_hit: int
    missed_clicks: int
    accuracy_pct: float
    targets_per_second: float


class VisualMemoryMetrics(BaseModel):
    highest_level_completed: int
    total_correct_tiles: int
    total_incorrect_tiles: int
    total_missed_tiles: int
    precision: float
    recall: float
    f1_score: float
    avg_response_time_ms: float


class PersonalBestItem(BaseModel):
    assessment_type: AssessmentType
    primary_metric_name: str
    primary_value: float
    unit: str
    achieved_at: str
    attempt_id: str
    metrics: Dict[str, Any]


class CognitiveProfileReport(BaseModel):
    player_id: str
    generated_at: str
    completion_percentage: float
    assessments_completed: int
    total_assessments: int = 4
    personal_bests: Dict[str, Any]
    latest_attempts: Dict[str, Any]
    reaction_profile: Optional[Dict[str, Any]] = None
    memory_profile: Optional[Dict[str, Any]] = None
    aim_profile: Optional[Dict[str, Any]] = None
    strengths: List[str]
    practice_areas: List[str]
    experimental_composite_index: Optional[float] = None
