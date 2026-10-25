import React from 'react';
import { X, RotateCcw, Brain, Eye, MousePointerClick, AlertCircle, Trophy } from 'lucide-react';
import { useSequenceMemoryTest } from '../hooks/useSequenceMemoryTest';
import { SequenceMemoryResults } from '../types';

interface SequenceMemoryViewProps {
  onClose: () => void;
  onCompleted: (results: SequenceMemoryResults) => void;
}

export const SequenceMemoryView: React.FC<SequenceMemoryViewProps> = ({ onClose, onCompleted }) => {
  const {
    phase,
    sequenceLength,
    userStep,
    activeTile,
    highestLevel,
    startTest,
    handleTileClick,
    resetTest,
  } = useSequenceMemoryTest(onCompleted);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080A0F] text-white select-none animate-fadeIn">
      {/* Top HUD */}
      <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-[#10141D]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-white">Sequence Memory Test</h2>
            <p className="text-[11px] text-gray-400">
              {phase === 'instruction' && 'Memorize and reproduce the sequence'}
              {phase === 'playback' && 'Watch pattern carefully...'}
              {phase === 'input' && `Input step ${userStep + 1} of ${sequenceLength}`}
              {phase === 'completed' && 'Run Completed'}
            </p>
          </div>
        </div>

        {/* Level Counter */}
        <div className="flex items-center gap-4">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-xs text-gray-400">Sequence:</span>
            <span className="text-sm font-bold text-white font-mono">{sequenceLength}</span>
          </div>

          {phase === 'playback' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold animate-pulse">
              <Eye className="w-3.5 h-3.5" /> Memorize
            </div>
          )}
          {phase === 'input' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <MousePointerClick className="w-3.5 h-3.5" /> Your Turn
            </div>
          )}
        </div>

        {/* Exit Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetTest}
            title="Reset Test"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Exit Test (Esc)"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Testing Playfield */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0B0E14] relative">
        {phase === 'instruction' && (
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-6 shadow-xl">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">Sequence Memory</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Watch the 3x3 grid light up in an increasingly long sequence. Once the playback finishes, reproduce the exact sequence by clicking the tiles in order.
            </p>
            <button
              onClick={startTest}
              className="px-8 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-[#F59E0B]/20"
            >
              Start Sequence Test
            </button>
          </div>
        )}

        {(phase === 'playback' || phase === 'input') && (
          <div className="w-full max-w-[380px] aspect-square grid grid-cols-3 gap-3 p-3 bg-[#10141D]/90 rounded-2xl border border-white/10 shadow-2xl">
            {Array.from({ length: 9 }).map((_, idx) => {
              const isActive = activeTile === idx;
              return (
                <button
                  key={idx}
                  disabled={phase !== 'input'}
                  onClick={() => handleTileClick(idx)}
                  className={`rounded-xl transition-all duration-150 border flex items-center justify-center ${
                    isActive
                      ? 'bg-cyan-400 border-white shadow-[0_0_35px_rgba(34,211,238,0.7)] scale-95'
                      : phase === 'input'
                      ? 'bg-[#161B26] border-white/10 hover:border-cyan-400/50 hover:bg-[#1E2536] active:scale-95 cursor-pointer'
                      : 'bg-[#161B26] border-white/5 opacity-80 cursor-default'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-white/20'}`} />
                </button>
              );
            })}
          </div>
        )}

        {phase === 'completed' && (
          <div className="max-w-md text-center p-8 bg-[#10141D] rounded-2xl border border-white/10 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Sequence Ended</h2>
            <p className="text-gray-400 text-xs mb-6">Incorrect tile chosen in the sequence</p>

            <div className="p-4 bg-black/40 rounded-xl border border-white/5 mb-6">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Highest Sequence Reached</div>
              <div className="text-4xl font-black text-cyan-400 font-mono">{highestLevel}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startTest}
                className="flex-1 py-3 px-4 rounded-xl bg-[#F59E0B] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-[#D97706]"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15"
              >
                Close & Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-12 px-6 bg-[#0B0E14] flex items-center justify-between text-xs text-gray-500 border-t border-white/5">
        <div>Tile Sequence Memory Module (Universal Benchmarking)</div>
        <div>Best: {highestLevel > 0 ? `${highestLevel} items` : '—'}</div>
      </div>
    </div>
  );
};
