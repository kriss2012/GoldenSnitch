import React from 'react';
import { X, RotateCcw, Grid, Eye, Shield, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useVisualMemoryTest } from '../hooks/useVisualMemoryTest';
import { VisualMemoryResults } from '../types';

interface VisualMemoryViewProps {
  onClose: () => void;
  onCompleted: (results: VisualMemoryResults) => void;
}

export const VisualMemoryView: React.FC<VisualMemoryViewProps> = ({ onClose, onCompleted }) => {
  const {
    phase,
    level,
    gridSize,
    targetTiles,
    selectedTiles,
    wrongTiles,
    strikes,
    maxStrikes,
    startTest,
    handleTileClick,
    resetTest,
  } = useVisualMemoryTest(onCompleted);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080A0F] text-white select-none animate-fadeIn">
      {/* Top HUD */}
      <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-[#10141D]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-white">Visual Memory Test</h2>
            <p className="text-[11px] text-gray-400">
              {phase === 'instruction' && 'Recall spatial tile patterns'}
              {phase === 'memorize' && 'Memorize the highlighted tiles...'}
              {phase === 'recall' && `Select the ${targetTiles.size} target tiles`}
              {phase === 'level_success' && 'Level Cleared! Advancing...'}
              {phase === 'completed' && 'Assessment Finished'}
            </p>
          </div>
        </div>

        {/* Level and Lives HUD */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Level:</span>
            <span className="text-sm font-bold text-indigo-400 font-mono">{level}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 mr-1">Strikes:</span>
            {Array.from({ length: maxStrikes }).map((_, i) => (
              <Shield
                key={i}
                className={`w-4 h-4 transition-colors ${
                  i < strikes ? 'text-rose-500 fill-rose-500' : 'text-gray-600'
                }`}
              />
            ))}
          </div>

          {phase === 'memorize' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold animate-pulse">
              <Eye className="w-3.5 h-3.5" /> Memorize
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
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-6 shadow-xl">
              <Grid className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">Visual Memory</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              A pattern of tiles will be flashed for 1.2 seconds. When they flip back over, click all tiles that were highlighted. You have 3 strikes before the run ends.
            </p>
            <button
              onClick={startTest}
              className="px-8 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-[#F59E0B]/20"
            >
              Start Visual Memory Test
            </button>
          </div>
        )}

        {(phase === 'memorize' || phase === 'recall' || phase === 'level_success') && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: '100%',
              maxWidth: `${gridSize * 76 + 24}px`,
            }}
            className="aspect-square gap-3 p-4 bg-[#10141D]/90 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300"
          >
            {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
              const isTarget = targetTiles.has(idx);
              const isSelected = selectedTiles.has(idx);
              const isWrong = wrongTiles.has(idx);

              let tileStyle = 'bg-[#161B26] border-white/10 hover:border-indigo-400/50 hover:bg-[#1E2536]';

              if (phase === 'memorize' && isTarget) {
                tileStyle = 'bg-indigo-500 border-white shadow-[0_0_25px_rgba(99,102,241,0.6)] scale-[0.98]';
              } else if (isSelected) {
                tileStyle = 'bg-emerald-500 border-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[0.98]';
              } else if (isWrong) {
                tileStyle = 'bg-rose-600 border-white shadow-[0_0_20px_rgba(225,29,72,0.5)] scale-[0.98]';
              }

              return (
                <button
                  key={idx}
                  disabled={phase !== 'recall' || isSelected || isWrong}
                  onClick={() => handleTileClick(idx)}
                  className={`rounded-xl transition-all duration-200 border flex items-center justify-center cursor-pointer active:scale-95 ${tileStyle}`}
                >
                  <span className="w-2 h-2 rounded-full bg-white/20" />
                </button>
              );
            })}
          </div>
        )}

        {phase === 'completed' && (
          <div className="max-w-md text-center p-8 bg-[#10141D] rounded-2xl border border-white/10 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Test Completed</h2>
            <p className="text-gray-400 text-xs mb-6">3 strikes reached</p>

            <div className="p-4 bg-black/40 rounded-xl border border-white/5 mb-6">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Highest Level Completed</div>
              <div className="text-4xl font-black text-indigo-400 font-mono">{Math.max(0, level - 1)}</div>
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
                View Analytics
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-12 px-6 bg-[#0B0E14] flex items-center justify-between text-xs text-gray-500">
        <div>Spatial-Visual Memory Pattern Retention</div>
        <div>Standardized Adaptive Grid</div>
      </div>
    </div>
  );
};
