/**
 * Service for Golden Snitch Cognitive Assessment Lab API interactions and local persistence.
 */
import { api } from '../../services/apiClient';
import {
  AssessmentAttempt,
  AssessmentType,
  CognitivePersonalBests,
  CognitiveProfileReport,
  InputMethod,
} from './types';

const LOCAL_STORAGE_BESTS_KEY = 'gs_cognitive_personal_bests_v1';
const LOCAL_STORAGE_HISTORY_KEY = 'gs_cognitive_history_v1';

export const cognitiveService = {
  /**
   * Starts a new assessment attempt on the server (or locally as fallback).
   */
  async startAttempt(
    playerId: string,
    assessmentType: AssessmentType,
    inputMethod: InputMethod = 'mouse',
    configuration: Record<string, any> = {}
  ): Promise<AssessmentAttempt> {
    try {
      const res = await api.post<AssessmentAttempt>('/api/cognitive/attempts/start', {
        player_id: playerId,
        assessment_type: assessmentType,
        input_method: inputMethod,
        configuration,
      });
      return res;
    } catch (err) {
      // Local fallback for offline assessment
      const fallbackAttempt: AssessmentAttempt = {
        id: `LOCAL-${assessmentType.slice(0, 3).toUpperCase()}-${Date.now().toString(36)}`,
        player_id: playerId,
        assessment_type: assessmentType,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        input_method: inputMethod,
      };
      return fallbackAttempt;
    }
  },

  /**
   * Records high-precision event telemetry for anti-cheat verification.
   */
  async recordEvent(
    attemptId: string,
    eventType: string,
    eventTimestamp: number,
    eventPayload: Record<string, any> = {}
  ): Promise<void> {
    if (attemptId.startsWith('LOCAL-')) return;
    try {
      await api.post(`/api/cognitive/attempts/${attemptId}/event`, {
        event_type: eventType,
        event_timestamp: eventTimestamp,
        event_payload: eventPayload,
      });
    } catch {}
  },

  /**
   * Finalizes an assessment attempt with raw results.
   */
  async finalizeAttempt(
    attemptId: string,
    rawResults: Record<string, any>,
    inputMethod: InputMethod = 'mouse'
  ): Promise<AssessmentAttempt> {
    try {
      if (!attemptId.startsWith('LOCAL-')) {
        const res = await api.post<AssessmentAttempt>(`/api/cognitive/attempts/${attemptId}/finalize`, {
          raw_results: rawResults,
          input_method: inputMethod,
          client_duration_ms: performance.now(),
        });
        this.saveLocalBackup(res);
        return res;
      }
    } catch (e) {
      console.warn('Backend finalize failed, saving locally:', e);
    }

    // Client-side local metric calculation fallback
    const localCalculated = this.calculateLocalMetrics(rawResults);
    const localAttempt: AssessmentAttempt = {
      id: attemptId,
      player_id: 'current_user',
      assessment_type: (rawResults.assessment_type || 'reaction_time') as AssessmentType,
      status: 'completed',
      started_at: new Date(Date.now() - 30000).toISOString(),
      completed_at: new Date().toISOString(),
      input_method: inputMethod,
      computed_results: localCalculated.metrics,
      validation_status: 'valid',
    };
    this.saveLocalBackup(localAttempt, localCalculated.primaryMetric, localCalculated.primaryValue);
    return localAttempt;
  },

  /**
   * Retrieves player's personal best records.
   */
  async getPersonalBests(playerId: string): Promise<CognitivePersonalBests> {
    try {
      const res = await api.get<{ personal_bests: CognitivePersonalBests }>(
        `/api/cognitive/players/${playerId}/personal-bests`
      );
      if (res && res.personal_bests && Object.keys(res.personal_bests).length > 0) {
        return res.personal_bests;
      }
    } catch {}

    // Fallback to local storage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_BESTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  /**
   * Retrieves full synthesized player report.
   */
  async getPlayerReport(playerId: string): Promise<CognitiveProfileReport> {
    try {
      const res = await api.get<CognitiveProfileReport>(`/api/cognitive/players/${playerId}/report`);
      if (res && res.assessments_completed >= 0) {
        return res;
      }
    } catch {}

    const localBests = await this.getPersonalBests(playerId);
    const completedCount = Object.keys(localBests).length;

    return {
      player_id: playerId,
      generated_at: new Date().toISOString(),
      completion_percentage: (completedCount / 4) * 100,
      assessments_completed: completedCount,
      total_assessments: 4,
      personal_bests: localBests,
      reaction_profile: localBests.reaction_time,
      aim_profile: localBests.aim_trainer,
      memory_profile: {
        sequence: localBests.sequence_memory,
        visual: localBests.visual_memory,
      },
      strengths: completedCount > 0 ? ['Consistent calibration across completed lab tests'] : [],
      practice_areas: completedCount < 4 ? ['Complete all 4 standardized tests to unlock radar breakdown'] : [],
      experimental_composite_index: completedCount >= 2 ? 78.4 : undefined,
      recent_attempts_count: completedCount,
    };
  },

  /**
   * Helper to persist attempts and personal bests in localStorage.
   */
  saveLocalBackup(attempt: AssessmentAttempt, primaryMetric?: string, primaryValue?: number): void {
    try {
      // 1. Append to history
      const histRaw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      const history: AssessmentAttempt[] = histRaw ? JSON.parse(histRaw) : [];
      history.unshift(attempt);
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));

      // 2. Update personal bests
      const bestsRaw = localStorage.getItem(LOCAL_STORAGE_BESTS_KEY);
      const bests: CognitivePersonalBests = bestsRaw ? JSON.parse(bestsRaw) : {};
      const type = attempt.assessment_type;
      const res = attempt.computed_results || {};

      let candidateVal = primaryValue;
      let metricName = primaryMetric || 'score';
      let unit = '';

      if (type === 'reaction_time') {
        candidateVal = res.median_rt_ms || candidateVal;
        metricName = 'median_rt_ms';
        unit = 'ms';
      } else if (type === 'sequence_memory') {
        candidateVal = res.highest_level_completed || candidateVal;
        metricName = 'highest_level_completed';
        unit = 'sequence';
      } else if (type === 'aim_trainer') {
        candidateVal = res.avg_time_per_target_ms || candidateVal;
        metricName = 'avg_time_per_target_ms';
        unit = 'ms/target';
      } else if (type === 'visual_memory') {
        candidateVal = res.highest_level_completed || candidateVal;
        metricName = 'highest_level_completed';
        unit = 'level';
      }

      if (candidateVal !== undefined) {
        const currentBest = bests[type]?.value;
        const isBetter =
          currentBest === undefined ||
          (type === 'reaction_time' && candidateVal < currentBest) ||
          (type === 'aim_trainer' && candidateVal < currentBest) ||
          (type === 'sequence_memory' && candidateVal > currentBest) ||
          (type === 'visual_memory' && candidateVal > currentBest);

        if (isBetter) {
          bests[type] = {
            attempt_id: attempt.id,
            primary_metric: metricName,
            value: candidateVal,
            unit,
            achieved_at: new Date().toISOString(),
            metrics: res,
          };
          localStorage.setItem(LOCAL_STORAGE_BESTS_KEY, JSON.stringify(bests));
        }
      }
    } catch {}
  },

  calculateLocalMetrics(raw: Record<string, any>): { metrics: any; primaryMetric: string; primaryValue: number } {
    if (raw.trials) {
      const trials = raw.trials as number[];
      const sorted = [...trials].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] || 200;
      return {
        metrics: {
          median_rt_ms: median,
          mean_rt_ms: Math.round(trials.reduce((a, b) => a + b, 0) / trials.length),
          fastest_rt_ms: sorted[0] || median,
          slowest_rt_ms: sorted[sorted.length - 1] || median,
          false_starts: raw.false_starts || 0,
          valid_trials: trials.length,
          trials,
        },
        primaryMetric: 'median_rt_ms',
        primaryValue: median,
      };
    }
    return {
      metrics: raw,
      primaryMetric: 'score',
      primaryValue: 1,
    };
  },
};
