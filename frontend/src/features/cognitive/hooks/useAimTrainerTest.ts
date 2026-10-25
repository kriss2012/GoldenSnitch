import { useState, useRef, useCallback } from 'react';
import { AimTrainerResults } from '../types';

export type AimPhase = 'instruction' | 'active' | 'completed';

export interface TargetPosition {
  x: number; // percentage (5% to 92%)
  y: number; // percentage (8% to 90%)
  size: number; // px diameter
}

export function useAimTrainerTest(onComplete?: (results: AimTrainerResults) => void) {
  const [phase, setPhase] = useState<AimPhase>('instruction');
  const [currentTargetIndex, setCurrentTargetIndex] = useState<number>(0);
  const [targetPosition, setTargetPosition] = useState<TargetPosition>({ x: 50, y: 50, size: 60 });
  const [targetTimes, setTargetTimes] = useState<number[]>([]);
  const [misses, setMisses] = useState<number>(0);

  const totalTargets = 30;
  const targetSpawnTimeRef = useRef<number>(0);
  const testStartTimeRef = useRef<number>(0);

  const spawnNextTarget = useCallback(() => {
    // Generate safe coordinates avoiding edge clippings
    const x = Math.floor(Math.random() * 84) + 8;
    const y = Math.floor(Math.random() * 80) + 10;
    setTargetPosition({ x, y, size: 56 });
    targetSpawnTimeRef.current = performance.now();
  }, []);

  const startTest = useCallback(() => {
    setPhase('active');
    setCurrentTargetIndex(0);
    setTargetTimes([]);
    setMisses(0);
    testStartTimeRef.current = performance.now();
    spawnNextTarget();
  }, [spawnNextTarget]);

  const handleTargetHit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Avoid triggering background miss click
      if (phase !== 'active') return;

      const hitTime = performance.now();
      const acquisitionTime = Math.round(hitTime - targetSpawnTimeRef.current);
      const updatedTimes = [...targetTimes, acquisitionTime];
      setTargetTimes(updatedTimes);

      const nextIndex = currentTargetIndex + 1;
      setCurrentTargetIndex(nextIndex);

      if (nextIndex >= totalTargets) {
        // Test completed!
        setPhase('completed');
        const totalDuration = Math.round(hitTime - testStartTimeRef.current);
        const avgTime = Math.round(totalDuration / totalTargets);
        const sorted = [...updatedTimes].sort((a, b) => a - b);
        const medianTime = sorted[Math.floor(sorted.length / 2)];
        const fastest = sorted[0];
        const totalClicks = totalTargets + misses;
        const accuracy = Math.round((totalTargets / Math.max(1, totalClicks)) * 100);
        const tps = parseFloat(((totalTargets / (totalDuration / 1000))).toFixed(2));

        const results: AimTrainerResults = {
          total_completion_time_ms: totalDuration,
          avg_time_per_target_ms: avgTime,
          median_time_per_target_ms: medianTime,
          fastest_target_ms: fastest,
          targets_hit: totalTargets,
          missed_clicks: misses,
          accuracy_pct: accuracy,
          targets_per_second: tps,
        };

        if (onComplete) {
          onComplete(results);
        }
      } else {
        spawnNextTarget();
      }
    },
    [phase, targetTimes, currentTargetIndex, misses, totalTargets, spawnNextTarget, onComplete]
  );

  const handleArenaBackgroundClick = useCallback(() => {
    if (phase === 'active') {
      setMisses((prev) => prev + 1);
    }
  }, [phase]);

  const resetTest = useCallback(() => {
    setPhase('instruction');
    setCurrentTargetIndex(0);
    setTargetTimes([]);
    setMisses(0);
  }, []);

  return {
    phase,
    currentTargetIndex,
    totalTargets,
    targetPosition,
    misses,
    remainingTargets: totalTargets - currentTargetIndex,
    startTest,
    handleTargetHit,
    handleArenaBackgroundClick,
    resetTest,
  };
}
