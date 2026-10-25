"""Assessment Engine & Scoring Core for Esports Cognitive Performance Suite.
Calculates rigorous, tamper-resistant metrics from raw trial telemetry.
"""
import statistics
from typing import Any, Dict, List, Tuple
from .models import (
    AimTrainerMetrics,
    AssessmentType,
    ReactionTimeMetrics,
    SequenceMemoryMetrics,
    VisualMemoryMetrics,
)

# Reference population baselines for experimental normalization (Z-scores)
# Based on competitive esports player distributions
REFERENCE_DISTRIBUTIONS = {
    "reaction_time": {
        "mean": 215.0,     # ms
        "std": 35.0,
        "direction": -1,   # lower is better
    },
    "sequence_memory": {
        "mean": 9.5,       # sequence length
        "std": 2.8,
        "direction": 1,    # higher is better
    },
    "aim_trainer": {
        "mean": 430.0,     # ms per target
        "std": 75.0,
        "direction": -1,   # lower is better
    },
    "visual_memory": {
        "mean": 10.5,      # max level
        "std": 2.5,
        "direction": 1,    # higher is better
    },
}


class CognitiveScoringEngine:
    """Core mathematical engine for cognitive assessments."""

    @staticmethod
    def calculate_reaction_time(raw_data: Dict[str, Any]) -> Tuple[ReactionTimeMetrics, str, float]:
        """
        Processes 5 scored reaction time trials.
        Primary metric: Median reaction time (RT_median).
        """
        raw_trials: List[float] = [float(t) for t in raw_data.get("trials", []) if t is not None]
        false_starts: int = int(raw_data.get("false_starts", 0))

        if not raw_trials:
            raise ValueError("No reaction time trials provided")

        valid_trials = [t for t in raw_trials if t >= 100.0]  # Minimum human physiological threshold
        
        # Anti-cheat / Plausibility flags
        validation_status = "valid"
        if len(valid_trials) < len(raw_trials):
            validation_status = "flagged_sub_human_latency"
        elif len(valid_trials) >= 3 and statistics.pstdev(valid_trials) < 2.0:
            validation_status = "flagged_scripted_consistency"

        trials_to_use = valid_trials if valid_trials else raw_trials
        med_rt = round(float(statistics.median(trials_to_use)), 2)
        mean_rt = round(float(statistics.mean(trials_to_use)), 2)
        fastest_rt = round(float(min(trials_to_use)), 2)
        slowest_rt = round(float(max(trials_to_use)), 2)
        consistency = round(float(statistics.pstdev(trials_to_use)) if len(trials_to_use) > 1 else 0.0, 2)

        metrics = ReactionTimeMetrics(
            median_rt_ms=med_rt,
            mean_rt_ms=mean_rt,
            fastest_rt_ms=fastest_rt,
            slowest_rt_ms=slowest_rt,
            consistency_stdev=consistency,
            false_starts=false_starts,
            total_trials=len(raw_trials),
            valid_trials=len(valid_trials),
            trials=trials_to_use,
        )

        return metrics, validation_status, med_rt

    @staticmethod
    def calculate_sequence_memory(raw_data: Dict[str, Any]) -> Tuple[SequenceMemoryMetrics, str, float]:
        """
        Processes sequence memory progression.
        Primary metric: Highest sequence length completed.
        Formula: A_s = (C / T) * 100.
        """
        highest_completed = int(raw_data.get("highest_level_completed", 0))
        rounds = int(raw_data.get("total_successful_rounds", highest_completed))
        correct_inputs = int(raw_data.get("total_correct_inputs", 0))
        incorrect_inputs = int(raw_data.get("total_incorrect_inputs", 0))
        total_inputs = correct_inputs + incorrect_inputs
        total_time_ms = float(raw_data.get("total_time_ms", 0.0))

        accuracy = round((correct_inputs / total_inputs * 100.0) if total_inputs > 0 else 0.0, 2)
        avg_resp_time = round((total_time_ms / total_inputs) if total_inputs > 0 else 0.0, 2)

        validation_status = "valid"
        if correct_inputs < highest_completed * 2 and highest_completed > 3:
            validation_status = "flagged_input_inconsistency"

        metrics = SequenceMemoryMetrics(
            highest_level_completed=highest_completed,
            total_successful_rounds=rounds,
            total_correct_inputs=correct_inputs,
            total_incorrect_inputs=incorrect_inputs,
            accuracy_pct=accuracy,
            avg_response_time_ms=avg_resp_time,
            total_time_ms=round(total_time_ms, 2),
        )

        return metrics, validation_status, float(highest_completed)

    @staticmethod
    def calculate_aim_trainer(raw_data: Dict[str, Any]) -> Tuple[AimTrainerMetrics, str, float]:
        """
        Processes 30-target Esports Aim Trainer assessment.
        Primary metric: Average acquisition time per target (ms).
        Formula:
          T_avg = T_total / N_targets
          A_aim = (H / (H + M)) * 100
          TPS = H / T_elapsed_sec
        """
        target_times: List[float] = [float(t) for t in raw_data.get("target_times", [])]
        hits = int(raw_data.get("targets_hit", len(target_times)))
        misses = int(raw_data.get("missed_clicks", 0))
        total_time_ms = float(raw_data.get("total_completion_time_ms", sum(target_times)))
        
        target_count = len(target_times) if target_times else max(1, hits)
        avg_time = round(total_time_ms / target_count, 2)
        median_time = round(float(statistics.median(target_times)), 2) if target_times else avg_time
        fastest_target = round(float(min(target_times)), 2) if target_times else avg_time

        total_clicks = hits + misses
        accuracy = round((hits / total_clicks * 100.0) if total_clicks > 0 else 0.0, 2)
        elapsed_sec = total_time_ms / 1000.0
        tps = round((hits / elapsed_sec) if elapsed_sec > 0 else 0.0, 2)

        validation_status = "valid"
        if fastest_target < 80.0:  # Physically impossible sustained target acquisition
            validation_status = "flagged_instant_snap_anomaly"

        metrics = AimTrainerMetrics(
            total_completion_time_ms=round(total_time_ms, 2),
            avg_time_per_target_ms=avg_time,
            median_time_per_target_ms=median_time,
            fastest_target_ms=fastest_target,
            targets_hit=hits,
            missed_clicks=misses,
            accuracy_pct=accuracy,
            targets_per_second=tps,
        )

        return metrics, validation_status, avg_time

    @staticmethod
    def calculate_visual_memory(raw_data: Dict[str, Any]) -> Tuple[VisualMemoryMetrics, str, float]:
        """
        Processes Visual-Spatial Memory test.
        Primary metric: Highest level completed.
        Formulas:
          P = TP / (TP + FP)
          R = TP / (TP + FN)
          F1 = 2 * (P * R) / (P + R)
        """
        highest_level = int(raw_data.get("highest_level_completed", 0))
        tp = int(raw_data.get("total_correct_tiles", 0))
        fp = int(raw_data.get("total_incorrect_tiles", 0))
        fn = int(raw_data.get("total_missed_tiles", 0))
        total_time_ms = float(raw_data.get("total_response_time_ms", 0.0))

        precision = (tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        recall = (tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        if (precision + recall) > 0:
            f1 = 2.0 * (precision * recall) / (precision + recall)
        else:
            f1 = 0.0

        avg_resp_time = round(total_time_ms / max(1, highest_level), 2)

        validation_status = "valid"

        metrics = VisualMemoryMetrics(
            highest_level_completed=highest_level,
            total_correct_tiles=tp,
            total_incorrect_tiles=fp,
            total_missed_tiles=fn,
            precision=round(precision, 4),
            recall=round(recall, 4),
            f1_score=round(f1, 4),
            avg_response_time_ms=avg_resp_time,
        )

        return metrics, validation_status, float(highest_level)

    @classmethod
    def evaluate_attempt(
        cls,
        assessment_type: AssessmentType,
        raw_results: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], str, str, float]:
        """Routes raw telemetry to the appropriate validator and returns (computed_dict, status, primary_metric_name, primary_value)."""
        if assessment_type == AssessmentType.REACTION_TIME:
            metrics, status, val = cls.calculate_reaction_time(raw_results)
            return metrics.model_dump(), status, "median_rt_ms", val
        elif assessment_type == AssessmentType.SEQUENCE_MEMORY:
            metrics, status, val = cls.calculate_sequence_memory(raw_results)
            return metrics.model_dump(), status, "highest_level_completed", val
        elif assessment_type == AssessmentType.AIM_TRAINER:
            metrics, status, val = cls.calculate_aim_trainer(raw_results)
            return metrics.model_dump(), status, "avg_time_per_target_ms", val
        elif assessment_type == AssessmentType.VISUAL_MEMORY:
            metrics, status, val = cls.calculate_visual_memory(raw_results)
            return metrics.model_dump(), status, "highest_level_completed", val
        else:
            raise ValueError(f"Unknown assessment type: {assessment_type}")

    @classmethod
    def generate_player_report(
        cls,
        player_id: str,
        personal_bests: Dict[str, Any],
        recent_history: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Synthesizes assessment data into a professional Golden Snitch Performance Report.
        Computes experimental composite cognitive index:
          C = 0.25*R + 0.25*S + 0.25*A + 0.25*V
        """
        total_tests = 4
        completed_tests = len(personal_bests)
        completion_pct = round((completed_tests / total_tests) * 100.0, 1)

        strengths: List[str] = []
        practice_areas: List[str] = []
        z_scores: Dict[str, float] = {}

        for test_key, best in personal_bests.items():
            ref = REFERENCE_DISTRIBUTIONS.get(test_key)
            if not ref:
                continue
            val = float(best["value"])
            # Z-Score formula: z = (x - mean) / std * direction
            z = ((val - ref["mean"]) / ref["std"]) * ref["direction"]
            z_scores[test_key] = round(z, 2)

            if z >= 0.75:
                strengths.append(f"Exceptional {test_key.replace('_', ' ').title()} (+{z:.2f} SD vs peer tier)")
            elif z <= -0.5:
                practice_areas.append(f"{test_key.replace('_', ' ').title()} warmup & drill focus ({z:.2f} SD)")

        # Experimental Composite Score (Scaled to 0 - 100 where 50 is mean, 10 SD)
        composite_index = None
        if z_scores:
            mean_z = sum(z_scores.values()) / len(z_scores)
            composite_index = round(max(0.0, min(100.0, 50.0 + mean_z * 15.0)), 1)

        if not strengths and completed_tests > 0:
            strengths.append("Consistent baseline performance across all completed modules")
        if not practice_areas and completed_tests > 0:
            practice_areas.append("Maintain peak performance through standardized pre-match calibration")

        # Organize profile slices
        reaction_prof = personal_bests.get("reaction_time")
        aim_prof = personal_bests.get("aim_trainer")
        memory_prof = {
            "sequence": personal_bests.get("sequence_memory"),
            "visual": personal_bests.get("visual_memory"),
        }

        from datetime import datetime, timezone
        return {
            "player_id": player_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "completion_percentage": completion_pct,
            "assessments_completed": completed_tests,
            "total_assessments": total_tests,
            "personal_bests": personal_bests,
            "reaction_profile": reaction_prof,
            "aim_profile": aim_prof,
            "memory_profile": memory_prof,
            "relative_z_scores": z_scores,
            "strengths": strengths,
            "practice_areas": practice_areas,
            "experimental_composite_index": composite_index,
            "recent_attempts_count": len(recent_history),
        }
