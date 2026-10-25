import React from 'react';
import { LucideIcon, Play, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import { AssessmentType, PersonalBestRecord } from '../types';

interface AssessmentCardProps {
  id: AssessmentType;
  title: string;
  subtitle: string;
  duration: string;
  icon: LucideIcon;
  badge: string;
  personalBest?: PersonalBestRecord;
  isCompleted?: boolean;
  onLaunch: (id: AssessmentType) => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  id,
  title,
  subtitle,
  duration,
  icon: Icon,
  badge,
  personalBest,
  isCompleted,
  onLaunch,
}) => {
  return (
    <div className="relative group bg-[#10141D]/90 border border-white/10 hover:border-[#F59E0B]/50 rounded-2xl p-6 transition-all duration-300 shadow-lg hover:shadow-[#F59E0B]/10 flex flex-col justify-between overflow-hidden">
      {/* Decorative tactical background glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-2xl group-hover:bg-[#F59E0B]/10 transition-colors pointer-events-none" />

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#161B26] border border-white/10 flex items-center justify-center text-[#F59E0B] group-hover:scale-105 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
              {badge}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight group-hover:text-[#FBBF24] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed mb-5">
          {subtitle}
        </p>
      </div>

      {/* Stats & Actions Footer */}
      <div>
        <div className="grid grid-cols-2 gap-2 p-3 bg-black/40 rounded-xl border border-white/5 mb-5">
          <div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
              <Trophy className="w-3 h-3 text-[#F59E0B]" />
              Personal Best
            </div>
            <div className="text-sm font-bold text-white">
              {personalBest ? (
                <span>
                  {personalBest.value} <span className="text-[11px] font-normal text-gray-400">{personalBest.unit}</span>
                </span>
              ) : (
                <span className="text-gray-500 font-normal text-xs">Unranked</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              Duration
            </div>
            <div className="text-xs font-semibold text-gray-300">
              {duration}
            </div>
          </div>
        </div>

        <button
          onClick={() => onLaunch(id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-[#F59E0B]/20 active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          {isCompleted ? 'Retest Module' : 'Start Assessment'}
        </button>
      </div>
    </div>
  );
};
