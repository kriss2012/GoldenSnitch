import { useState, useRef, useEffect, useCallback } from 'react';
import { SequenceMemoryResults } from '../types';

export type SequencePhase = 'instruction' | 'playback' | 'input' | 'completed';

export function useSequenceMemoryTest(onComplete?: (results: SequenceMemoryResults) => void) {
  const [phase, setPhase] = useState<SequencePhase>('instruction');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState<number>(0);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [highestLevel, setHighestLevel] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [totalIncorrect, setTotalIncorrect] = useState<number>(0);

  const startTimeRef = useRef<number>(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimeouts();
  }, []);

  const playSequence = useCallback((seq: number[]) => {
    clearAllTimeouts();
    setPhase('playback');
    setUserStep(0);
    setActiveTile(null);

    // Dynamic speed based on sequence length (500ms down to 280ms)
    const flashDuration = Math.max(250, 480 - seq.length * 15);
    const stepInterval = flashDuration + 140;

    seq.forEach((tileIdx, i) => {
      // Light up
      const t1 = setTimeout(() => {
        setActiveTile(tileIdx);
      }, (i + 1) * stepInterval);

      // Light down
      const t2 = setTimeout(() => {
        setActiveTile(null);
      }, (i + 1) * stepInterval + flashDuration);

      timeoutsRef.current.push(t1, t2);
    });

    // Switch to user input after playback completes
    const tEnd = setTimeout(() => {
      setPhase('input');
    }, (seq.length + 1) * stepInterval + 100);

    timeoutsRef.current.push(tEnd);
  }, []);

  const startTest = useCallback(() => {
    clearAllTimeouts();
    startTimeRef.current = performance.now();
    setTotalCorrect(0);
    setTotalIncorrect(0);
    setHighestLevel(0);

    // Start with 3 tiles
    const initialSeq = [
      Math.floor(Math.random() * 9),
      Math.floor(Math.random() * 9),
      Math.floor(Math.random() * 9),
    ];
    setSequence(initialSeq);
    playSequence(initialSeq);
  }, [playSequence]);

  const handleTileClick = useCallback(
    (tileIndex: number) => {
      if (phase !== 'input') return;

      // Brief flash on click
      setActiveTile(tileIndex);
      setTimeout(() => setActiveTile(null), 160);

      const expectedTile = sequence[userStep];

      if (tileIndex === expectedTile) {
        // Correct input
        const nextStep = userStep + 1;
        setTotalCorrect((prev) => prev + 1);

        if (nextStep >= sequence.length) {
          // Completed current sequence round!
          const currentLevel = sequence.length;
          setHighestLevel(currentLevel);

          // Add next random tile (0-8)
          const nextTile = Math.floor(Math.random() * 9);
          const nextSeq = [...sequence, nextTile];
          setSequence(nextSeq);

          // Short pause then play next sequence
          setTimeout(() => {
            playSequence(nextSeq);
          }, 800);
        } else {
          setUserStep(nextStep);
        }
      } else {
        // Mistake! End run
        setTotalIncorrect((prev) => prev + 1);
        setPhase('completed');

        const totalTime = Math.round(performance.now() - startTimeRef.current);
        const finalCorrect = totalCorrect;
        const finalInputs = finalCorrect + 1;
        const accuracy = Math.round((finalCorrect / finalInputs) * 100);

        const results: SequenceMemoryResults = {
          highest_level_completed: highestLevel,
          total_successful_rounds: Math.max(0, highestLevel - 2),
          total_correct_inputs: finalCorrect,
          total_incorrect_inputs: 1,
          accuracy_pct: accuracy,
          avg_response_time_ms: Math.round(totalTime / Math.max(1, finalInputs)),
          total_time_ms: totalTime,
        };

        if (onComplete) {
          onComplete(results);
        }
      }
    },
    [phase, sequence, userStep, totalCorrect, highestLevel, playSequence, onComplete]
  );

  const resetTest = useCallback(() => {
    clearAllTimeouts();
    setPhase('instruction');
    setSequence([]);
    setUserStep(0);
    setActiveTile(null);
    setHighestLevel(0);
  }, []);

  return {
    phase,
    sequenceLength: sequence.length,
    userStep,
    activeTile,
    highestLevel,
    startTest,
    handleTileClick,
    resetTest,
  };
}
