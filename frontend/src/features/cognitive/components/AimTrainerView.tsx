import React from 'react';
import { X, RotateCcw, Crosshair, Target, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAimTrainerTest } from '../hooks/useAimTrainerTest';
import { AimTrainerResults } from '../types';

interface AimTrainerViewProps {
  onClose: () => void;
  onCompleted: (results: AimTrainerResults) => void;
}

export const AimTrainerView: React.FC<AimTrainerViewProps> = ({ onClose, onCompleted }) => {
  const {
    phase,
    currentTargetIndex,
    totalTargets,
    targetPosition,
    misses,
    remainingTargets,
    startTest,
    handleTargetHit,
    handleArenaBackgroundClick,
    resetTest,
  } = useAimTrainerTest(onCompleted);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080A0F] text-white select-none animate-fadeIn">
      {/* Top HUD */}
      <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-[#10141D]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-white">Esports Aim Trainer</h2>
            <p className="text-[11px] text-gray-400">Target Acquisition Speed & Accuracy (30 Targets)</p>
          </div>
        </div>

        {/* Live HUD Counters */}
        {phase === 'active' && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs text-gray-400">Remaining:</span>
              <span className="text-sm font-bold text-white font-mono">{remainingTargets}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-gray-400">Misses:</span>
              <span className="text-sm font-bold text-rose-400 font-mono">{misses}</span>
            </div>
          </div>
        )}

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
        onClick={handleArenaBackgroundClick}
        className="flex-1 bg-[#090C12] relative overflow-hidden cursor-crosshair border-b border-white/5 select-none"
      >
        {/* Subtle tactical grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {phase === 'instruction' && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm z-20">
            <div className="max-w-md text-center p-8 bg-[#10141D] rounded-2xl border border-white/10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-xl">
                <Crosshair className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-3">Esports Aim Trainer</h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Click 30 targets as quickly and accurately as possible. Clicks on the empty arena count as misses.
              </p>
              <button
                onClick={startTest}
                className="px-8 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-[#F59E0B]/20"
              >
                Launch Aim Arena
              </button>
            </div>
          </div>
        )}

        {phase === 'active' && (
          <div
            onClick={handleTargetHit}
            style={{
              position: 'absolute',
              left: `${targetPosition.x}%`,
              top: `${targetPosition.y}%`,
              width: `${targetPosition.size}px`,
              height: `${targetPosition.size}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="rounded-full bg-gradient-to-tr from-cyan-500 to-[#F59E0B] p-[3px] shadow-[0_0_25px_rgba(6,182,212,0.6)] cursor-pointer active:scale-90 transition-transform flex items-center justify-center z-10 animate-scaleIn"
          >
            <div className="w-full h-full rounded-full bg-[#0B0E14] flex items-center justify-center relative">
              <div className="w-4 h-4 rounded-full bg-[#F59E0B] animate-ping opacity-75 absolute" />
              <div className="w-3.5 h-3.5 rounded-full bg-white z-10" />
            </div>
          </div>
        )}

        {phase === 'completed' && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm z-20">
            <div className="max-w-md text-center p-8 bg-[#10141D] rounded-2xl border border-white/10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Aim Session Complete</h2>
              <p className="text-gray-400 text-xs mb-6">All 30 targets acquired</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[10px] uppercase text-gray-500">Targets Hit</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">30 / 30</div>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="text-[10px] uppercase text-gray-500">Missed Clicks</div>
                  <div className="text-2xl font-black text-rose-400 font-mono">{misses}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startTest}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#F59E0B] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-[#D97706]"
                >
                  Retest Aim
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15"
                >
                  View Performance
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-12 px-6 bg-[#0B0E14] flex items-center justify-between text-xs text-gray-500">
        <div>Desktop Mouse & Hand-Eye Coordination Assessment</div>
        <div>Standardized 30-Target Baseline</div>
      </div>
    </div>
  );
};
