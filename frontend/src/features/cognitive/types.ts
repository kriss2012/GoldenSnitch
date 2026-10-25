/**
 * Types and interfaces for Golden Snitch Esports Cognitive & Performance Assessment Suite
 */

export type AssessmentType = 'reaction_time' | 'sequence_memory' | 'aim_trainer' | 'visual_memory';

export type AssessmentStatus = 'idle' | 'instruction' | 'active' | 'completed' | 'interrupted' | 'false_start';

export type InputMethod = 'mouse' | 'touch' | 'keyboard' | 'unknown';

export interface ReactionTimeResults {
  median_rt_ms: number;
  mean_rt_ms: number;
  fastest_rt_ms: number;
  slowest_rt_ms: number;
  consistency_stdev: number;
  false_starts: number;
  total_trials: number;
  valid_trials: number;
  trials: number[];
}

export interface SequenceMemoryResults {
  highest_level_completed: number;
  total_successful_rounds: number;
  total_correct_inputs: number;
  total_incorrect_inputs: number;
  accuracy_pct: number;
  avg_response_time_ms: number;
  total_time_ms: number;
}

export interface AimTrainerResults {
  total_completion_time_ms: number;
  avg_time_per_target_ms: number;
  median_time_per_target_ms: number;
  fastest_target_ms: number;
  targets_hit: number;
  missed_clicks: number;
  accuracy_pct: number;
  targets_per_second: number;
}

export interface VisualMemoryResults {
  highest_level_completed: number;
  total_correct_tiles: number;
  total_incorrect_tiles: number;
  total_missed_tiles: number;
  precision: number;
  recall: number;
  f1_score: number;
  avg_response_time_ms: number;
}

export interface PersonalBestRecord {
  attempt_id: string;
  primary_metric: string;
  value: number;
  unit: string;
  achieved_at: string;
  metrics: any;
}

export interface CognitivePersonalBests {
  reaction_time?: PersonalBestRecord;
  sequence_memory?: PersonalBestRecord;
  aim_trainer?: PersonalBestRecord;
  visual_memory?: PersonalBestRecord;
}

export interface CognitiveProfileReport {
  player_id: string;
  generated_at: string;
  completion_percentage: number;
  assessments_completed: number;
  total_assessments: number;
  personal_bests: CognitivePersonalBests;
  reaction_profile?: PersonalBestRecord;
  aim_profile?: PersonalBestRecord;
  memory_profile?: {
    sequence?: PersonalBestRecord;
    visual?: PersonalBestRecord;
  };
  relative_z_scores?: Record<string, number>;
  strengths: string[];
  practice_areas: string[];
  experimental_composite_index?: number;
  recent_attempts_count: number;
}

export interface AssessmentAttempt {
  id: string;
  player_id: string;
  assessment_type: AssessmentType;
  status: string;
  started_at: string;
  completed_at?: string;
  input_method: InputMethod;
  computed_results?: any;
  validation_status?: string;
}
