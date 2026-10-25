import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Brain,
  Crosshair,
  Grid,
  Trophy,
  Activity,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AssessmentType, CognitivePersonalBests, CognitiveProfileReport } from './types';
import { cognitiveService } from './cognitiveService';
import { AssessmentCard } from './components/AssessmentCard';
import { ReactionTimeView } from './components/ReactionTimeView';
import { SequenceMemoryView } from './components/SequenceMemoryView';
import { AimTrainerView } from './components/AimTrainerView';
import { VisualMemoryView } from './components/VisualMemoryView';
import { CognitiveReportView } from './components/CognitiveReportView';

export const CognitiveLabPage: React.FC = () => {
  const [activeTest, setActiveTest] = useState<AssessmentType | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [personalBests, setPersonalBests] = useState<CognitivePersonalBests>({});
  const [report, setReport] = useState<CognitiveProfileReport | null>(null);
  const [activeTab, setActiveTab] = useState<'assessments' | 'report'>('assessments');
  const [loading, setLoading] = useState<boolean>(true);

  // Load player data
  const loadPlayerData = useCallback(async () => {
    setLoading(true);
    try {
      const bests = await cognitiveService.getPersonalBests('current_user');
      setPersonalBests(bests);
      const rep = await cognitiveService.getPlayerReport('current_user');
      setReport(rep);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  // Launch assessment handler
  const handleLaunchAssessment = async (type: AssessmentType) => {
    try {
      const attempt = await cognitiveService.startAttempt('current_user', type, 'mouse');
      setActiveAttemptId(attempt.id);
      setActiveTest(type);
    } catch {
      setActiveAttemptId(`LOCAL-${type}`);
      setActiveTest(type);
    }
  };

  // Close assessment modal
  const handleCloseTest = () => {
    setActiveTest(null);
    setActiveAttemptId(null);
    loadPlayerData();
  };

  // Assessment completed callback
  const handleTestCompleted = async (rawResults: any) => {
    if (activeAttemptId) {
      await cognitiveService.finalizeAttempt(activeAttemptId, rawResults, 'mouse');
    }
    loadPlayerData();
  };

  const completedCount = Object.keys(personalBests).length;
  const completionPercent = Math.round((completedCount / 4) * 100);

  return (
    <div className="space-y-8 animate-fadeIn text-white p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Performance Assessment Lab
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-xs text-gray-400">Standardized Biometrics</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Cognitive Performance Lab</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Measure your reflexes. Challenge your memory. Demonstrate your precision.
          </p>
        </div>

        {/* Tab Switcher & Quick Launch */}
        <div className="flex items-center gap-3">
          <div className="bg-black/40 border border-white/10 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setActiveTab('assessments')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'assessments'
                  ? 'bg-[#F59E0B] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Assessments (4)
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'report'
                  ? 'bg-[#F59E0B] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Performance Report
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Overview Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Completion Card */}
        <div className="md:col-span-2 bg-[#10141D]/90 border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Assessment Suite Progress
              </div>
              <div className="text-2xl font-black text-white">
                {completedCount} of 4 Modules Completed
              </div>
            </div>
            <div className="text-3xl font-black text-[#F59E0B] font-mono">
              {completionPercent}%
            </div>
          </div>

          <div>
            {/* Progress Bar */}
            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden mb-3 border border-white/5">
              <div
                style={{ width: `${completionPercent}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-[#F59E0B] rounded-full transition-all duration-500"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{completedCount === 4 ? 'All benchmarks calibrated' : 'Complete remaining modules to finalize scout report'}</span>
              {completedCount < 4 && (
                <button
                  onClick={() => {
                    const nextType: AssessmentType = !personalBests.reaction_time
                      ? 'reaction_time'
                      : !personalBests.sequence_memory
                      ? 'sequence_memory'
                      : !personalBests.aim_trainer
                      ? 'aim_trainer'
                      : 'visual_memory';
                    handleLaunchAssessment(nextType);
                  }}
                  className="text-[#F59E0B] font-bold hover:underline flex items-center gap-1 text-xs"
                >
                  Resume Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fastest Reflex */}
        <div className="bg-[#10141D]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1 text-[#F59E0B]"><Zap className="w-3.5 h-3.5" /> Median Reflex</span>
              <span>Trial Best</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {personalBests.reaction_time ? `${personalBests.reaction_time.value} ms` : '—'}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 border-t border-white/5 pt-2">
            {personalBests.reaction_time ? 'Visual reaction calibrated' : 'Pending assessment'}
          </div>
        </div>

        {/* Aim Accuracy */}
        <div className="bg-[#10141D]/90 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1 text-emerald-400"><Crosshair className="w-3.5 h-3.5" /> Aim Speed</span>
              <span>30 Targets</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {personalBests.aim_trainer ? `${personalBests.aim_trainer.value} ms` : '—'}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 border-t border-white/5 pt-2">
            {personalBests.aim_trainer ? `${personalBests.aim_trainer.metrics?.accuracy_pct}% Hit Accuracy` : 'Pending assessment'}
          </div>
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'assessments' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#F59E0B]" /> Standardized Assessment Battery
            </h2>
            <div className="text-xs text-gray-400">Desktop mouse recommended for precision accuracy</div>
          </div>

          {/* 4 Assessment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Visual Reaction Time */}
            <AssessmentCard
              id="reaction_time"
              title="Reaction Time Test"
              subtitle="Measure the latency between visual stimulus presentation and registered player click across 5 scored trials."
              duration="~1 minute"
              icon={Zap}
              badge="5 Scored Trials"
              personalBest={personalBests.reaction_time}
              isCompleted={!!personalBests.reaction_time}
              onLaunch={handleLaunchAssessment}
            />

            {/* 2. Sequence Memory */}
            <AssessmentCard
              id="sequence_memory"
              title="Sequence Memory"
              subtitle="Observe, retain, and reproduce an increasingly complex pattern on a 3x3 tactical grid."
              duration="~2 minutes"
              icon={Brain}
              badge="Progressive Grid"
              personalBest={personalBests.sequence_memory}
              isCompleted={!!personalBests.sequence_memory}
              onLaunch={handleLaunchAssessment}
            />

            {/* 3. Esports Aim Trainer */}
            <AssessmentCard
              id="aim_trainer"
              title="Aim Acquisition"
              subtitle="Acquire and eliminate 30 randomized targets as fast and accurately as possible in a bounded training arena."
              duration="~1 minute"
              icon={Crosshair}
              badge="30 Targets"
              personalBest={personalBests.aim_trainer}
              isCompleted={!!personalBests.aim_trainer}
              onLaunch={handleLaunchAssessment}
            />

            {/* 4. Visual-Spatial Memory */}
            <AssessmentCard
              id="visual_memory"
              title="Visual Memory"
              subtitle="Recall the spatial coordinates of briefly flashed tile configurations with adaptive grid scaling."
              duration="~2 minutes"
              icon={Grid}
              badge="Adaptive Scaling"
              personalBest={personalBests.visual_memory}
              isCompleted={!!personalBests.visual_memory}
              onLaunch={handleLaunchAssessment}
            />
          </div>
        </div>
      ) : (
        /* Performance Report Tab */
        report && <CognitiveReportView report={report} onRetestModule={handleLaunchAssessment} />
      )}

      {/* Full-Screen Interactive Test Views */}
      {activeTest === 'reaction_time' && (
        <ReactionTimeView onClose={handleCloseTest} onCompleted={handleTestCompleted} />
      )}
      {activeTest === 'sequence_memory' && (
        <SequenceMemoryView onClose={handleCloseTest} onCompleted={handleTestCompleted} />
      )}
      {activeTest === 'aim_trainer' && (
        <AimTrainerView onClose={handleCloseTest} onCompleted={handleTestCompleted} />
      )}
      {activeTest === 'visual_memory' && (
        <VisualMemoryView onClose={handleCloseTest} onCompleted={handleTestCompleted} />
      )}
    </div>
  );
};
