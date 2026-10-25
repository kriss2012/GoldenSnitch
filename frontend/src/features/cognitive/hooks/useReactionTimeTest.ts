import { useState, useRef, useEffect, useCallback } from 'react';
import { ReactionTimeResults } from '../types';

export type ReactionPhase = 'instruction' | 'waiting' | 'ready' | 'clicked' | 'false_start' | 'completed';

export function useReactionTimeTest(onComplete?: (results: ReactionTimeResults) => void) {
  const [phase, setPhase] = useState<ReactionPhase>('instruction');
  const [trials, setTrials] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState<number>(0);
  const [currentTrialRt, setCurrentTrialRt] = useState<number | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const totalTrialsNeeded = 5;

  const cleanupTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupTimer();
  }, []);

  const startNextTrial = useCallback(() => {
    cleanupTimer();
    setPhase('waiting');
    setCurrentTrialRt(null);

    // Random delay between 1500ms and 4000ms
    const randomDelay = Math.floor(Math.random() * 2500) + 1500;

    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhase('ready');
    }, randomDelay);
  }, []);

  const handleClick = useCallback(() => {
    if (phase === 'instruction') {
      startNextTrial();
    } else if (phase === 'waiting') {
      // User clicked before stimulus appeared: False start
      cleanupTimer();
      setFalseStarts((prev) => prev + 1);
      setPhase('false_start');
    } else if (phase === 'ready') {
      // Valid stimulus click
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setCurrentTrialRt(elapsed);

      setTrials((prevTrials) => {
        const updated = [...prevTrials, elapsed];
        if (updated.length >= totalTrialsNeeded) {
          setPhase('completed');
          // Calculate summary metrics
          const sorted = [...updated].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          const mean = Math.round(updated.reduce((a, b) => a + b, 0) / updated.length);
          const fastest = sorted[0];
          const slowest = sorted[sorted.length - 1];
          const variance =
            updated.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / updated.length;
          const consistency = Math.round(Math.sqrt(variance));

          const results: ReactionTimeResults = {
            median_rt_ms: median,
            mean_rt_ms: mean,
            fastest_rt_ms: fastest,
            slowest_rt_ms: slowest,
            consistency_stdev: consistency,
            false_starts: falseStarts,
            total_trials: updated.length,
            valid_trials: updated.length,
            trials: updated,
          };

          if (onComplete) {
            onComplete(results);
          }
        } else {
          setPhase('clicked');
        }
        return updated;
      });
    } else if (phase === 'false_start' || phase === 'clicked') {
      startNextTrial();
    }
  }, [phase, startNextTrial, falseStarts, onComplete]);

  const resetTest = useCallback(() => {
    cleanupTimer();
    setTrials([]);
    setFalseStarts(0);
    setCurrentTrialRt(null);
    setPhase('instruction');
  }, []);

  return {
    phase,
    trials,
    falseStarts,
    currentTrialRt,
    currentTrialNumber: trials.length + 1,
    totalTrials: totalTrialsNeeded,
    handleClick,
    resetTest,
  };
}
