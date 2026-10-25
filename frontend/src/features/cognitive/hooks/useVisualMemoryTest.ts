import { useState, useRef, useEffect, useCallback } from 'react';
import { VisualMemoryResults } from '../types';

export type VisualPhase = 'instruction' | 'memorize' | 'recall' | 'level_success' | 'completed';

export function useVisualMemoryTest(onComplete?: (results: VisualMemoryResults) => void) {
  const [phase, setPhase] = useState<VisualPhase>('instruction');
  const [level, setLevel] = useState<number>(1);
  const [gridSize, setGridSize] = useState<number>(3); // 3x3, 4x4, 5x5
  const [targetTiles, setTargetTiles] = useState<Set<number>>(new Set());
  const [selectedTiles, setSelectedTiles] = useState<Set<number>>(new Set());
  const [wrongTiles, setWrongTiles] = useState<Set<number>>(new Set());
  const [strikes, setStrikes] = useState<number>(0);

  // Cumulative metrics
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [totalIncorrect, setTotalIncorrect] = useState<number>(0);
  const [totalMissed, setTotalMissed] = useState<number>(0);

  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupTimer();
  }, []);

  const generateRound = useCallback((currentLevel: number) => {
    cleanupTimer();
    setSelectedTiles(new Set());
    setWrongTiles(new Set());

    // Grid dimension: 3x3 for lv 1-3, 4x4 for lv 4-7, 5x5 for lv 8+
    const dim = currentLevel <= 3 ? 3 : currentLevel <= 7 ? 4 : 5;
    const tileCount = currentLevel + 2; // e.g. level 1 has 3 tiles, level 5 has 7 tiles
    const totalCells = dim * dim;

    // Pick random unique tiles
    const chosen = new Set<number>();
    while (chosen.size < tileCount && chosen.size < totalCells) {
      chosen.add(Math.floor(Math.random() * totalCells));
    }

    setGridSize(dim);
    setTargetTiles(chosen);
    setPhase('memorize');

    // Memorization display duration (1200ms)
    timeoutRef.current = setTimeout(() => {
      setPhase('recall');
    }, 1200);
  }, []);

  const startTest = useCallback(() => {
    setLevel(1);
    setStrikes(0);
    setTotalCorrect(0);
    setTotalIncorrect(0);
    setTotalMissed(0);
    startTimeRef.current = performance.now();
    generateRound(1);
  }, [generateRound]);

  const handleTileClick = useCallback(
    (index: number) => {
      if (phase !== 'recall') return;
      if (selectedTiles.has(index) || wrongTiles.has(index)) return;

      if (targetTiles.has(index)) {
        // Correct tile guess
        const newSelected = new Set(selectedTiles);
        newSelected.add(index);
        setSelectedTiles(newSelected);
        setTotalCorrect((prev) => prev + 1);

        // Check if all highlighted tiles for this level are found
        if (newSelected.size === targetTiles.size) {
          setPhase('level_success');
          const nextLevel = level + 1;
          setLevel(nextLevel);
          timeoutRef.current = setTimeout(() => {
            generateRound(nextLevel);
          }, 900);
        }
      } else {
        // Wrong tile guess
        const newWrong = new Set(wrongTiles);
        newWrong.add(index);
        setWrongTiles(newWrong);
        setTotalIncorrect((prev) => prev + 1);
        const newStrikes = strikes + 1;
        setStrikes(newStrikes);

        if (newStrikes >= 3) {
          // 3 strikes: test complete!
          setPhase('completed');
          const totalElapsed = Math.round(performance.now() - startTimeRef.current);
          const finalLevel = Math.max(0, level - 1);
          const finalTP = totalCorrect;
          const finalFP = totalIncorrect + 1;
          const missed = targetTiles.size - selectedTiles.size;
          const finalFN = totalMissed + missed;

          const precision = finalTP + finalFP > 0 ? finalTP / (finalTP + finalFP) : 0;
          const recall = finalTP + finalFN > 0 ? finalTP / (finalTP + finalFN) : 0;
          const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

          const results: VisualMemoryResults = {
            highest_level_completed: finalLevel,
            total_correct_tiles: finalTP,
            total_incorrect_tiles: finalFP,
            total_missed_tiles: finalFN,
            precision: parseFloat(precision.toFixed(4)),
            recall: parseFloat(recall.toFixed(4)),
            f1_score: parseFloat(f1.toFixed(4)),
            avg_response_time_ms: Math.round(totalElapsed / Math.max(1, finalLevel)),
          };

          if (onComplete) {
            onComplete(results);
          }
        }
      }
    },
    [
      phase,
      selectedTiles,
      wrongTiles,
      targetTiles,
      level,
      strikes,
      totalCorrect,
      totalIncorrect,
      totalMissed,
      generateRound,
      onComplete,
    ]
  );

  const resetTest = useCallback(() => {
    cleanupTimer();
    setPhase('instruction');
    setLevel(1);
    setStrikes(0);
    setSelectedTiles(new Set());
    setWrongTiles(new Set());
    setTargetTiles(new Set());
  }, []);

  return {
    phase,
    level,
    gridSize,
    targetTiles,
    selectedTiles,
    wrongTiles,
    strikes,
    maxStrikes: 3,
    startTest,
    handleTileClick,
    resetTest,
  };
}
