import React, { useEffect } from 'react';
import { X, RotateCcw, Zap, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useReactionTimeTest } from '../hooks/useReactionTimeTest';
import { ReactionTimeResults } from '../types';

interface ReactionTimeViewProps {
  onClose: () => void;
  onCompleted: (results: ReactionTimeResults) => void;
}

export const ReactionTimeView: React.FC<ReactionTimeViewProps> = ({ onClose, onCompleted }) => {
  const {
    phase,
    trials,
    falseStarts,
    currentTrialRt,
    currentTrialNumber,
    totalTrials,
    handleClick,
    resetTest,
  } = useReactionTimeTest(onCompleted);

  // Keyboard spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
      } else if (e.code === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick, onClose]);

  // Dynamic background styling based on testing phase
  let bgStyle = 'bg-[#0B0E14]';
  if (phase === 'waiting') bgStyle = 'bg-[#181D2A] border-amber-500/20';
  if (phase === 'ready') bgStyle = 'bg-emerald-600 cursor-pointer shadow-[inset_0_0_80px_rgba(16,185,129,0.5)]';
  if (phase === 'false_start') bgStyle = 'bg-rose-950 border-rose-500/40';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080A0F] text-white select-none animate-fadeIn">
      {/* Top HUD */}
      <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-[#10141D]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-white">Visual Reaction Time Test</h2>
            <p className="text-[11px] text-gray-400">Trial {Math.min(currentTrialNumber, totalTrials)} of {totalTrials}</p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalTrials }).map((_, idx) => (
            <div
              key={idx}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx < trials.length
                  ? 'bg-emerald-400 shadow-md shadow-emerald-500/40'
                  : idx === trials.length
                  ? 'bg-[#F59E0B] animate-pulse'
                  : 'bg-white/10'
              }`}
            />
          ))}
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
      <div
        onClick={handleClick}
        className={`flex-1 flex flex-col items-center justify-center p-8 transition-colors duration-150 relative border-b border-white/5 cursor-pointer ${bgStyle}`}
      >
        {phase === 'instruction' && (
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mx-auto mb-6 shadow-xl">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">Visual Reaction Time</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              When the screen turns <span className="text-emerald-400 font-semibold">GREEN</span>, click anywhere or press <kbd className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs">SPACE</kbd> as quickly as you can.
            </p>
            <button className="px-8 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-[#F59E0B]/20">
              Click to Begin Trial 1
            </button>
          </div>
        )}

        {phase === 'waiting' && (
          <div className="text-center animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-wider text-amber-400 mb-2">Wait for Green...</h2>
            <p className="text-gray-400 text-xs">Do not click yet. Stay focused.</p>
          </div>
        )}

        {phase === 'ready' && (
          <div className="text-center">
            <h1 className="text-6xl font-black uppercase tracking-tight text-white drop-shadow-md">
              CLICK NOW!
            </h1>
            <p className="text-white/80 text-sm mt-3 font-medium">Click mouse or press Space</p>
          </div>
        )}

        {phase === 'false_start' && (
          <div className="max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-rose-400 mb-2">Too Early!</h2>
            <p className="text-gray-300 text-sm mb-6">
              You clicked before the target turned green. This trial has been reset.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider">
              Click Anywhere to Retry
            </div>
          </div>
        )}

        {phase === 'clicked' && (
          <div className="max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div className="text-6xl font-black text-white tracking-tight font-mono mb-2">
              {currentTrialRt} <span className="text-2xl font-normal text-gray-400">ms</span>
            </div>
            <p className="text-gray-400 text-xs mb-6">
              Trial {trials.length} of {totalTrials} recorded
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F59E0B] text-black font-bold text-xs uppercase tracking-wider shadow-lg">
              Click to Continue <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {phase === 'completed' && (
          <div className="max-w-md text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Completed</h2>
            <p className="text-gray-400 text-xs mb-6">All 5 trials logged successfully</p>
            <div className="flex justify-center gap-2">
              {trials.map((t, idx) => (
                <div key={idx} className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-center min-w-[60px]">
                  <div className="text-[10px] text-gray-500">#{idx + 1}</div>
                  <div className="text-xs font-bold font-mono text-white">{t}ms</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="h-12 px-6 bg-[#0B0E14] flex items-center justify-between text-xs text-gray-500">
        <div>High-precision monotonic clock (performance.now)</div>
        <div>False starts: {falseStarts}</div>
      </div>
    </div>
  );
};
