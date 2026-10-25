import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DayActivity {
  dayOfWeek: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  week: number;      // 0 to 4
  hours: number;     // 0, 2, 5, 9, etc.
  matches: number;
  dateStr: string;
}

// Generate realistic esports tournament activity for the month
const DEFAULT_AUGUST_ACTIVITY: DayActivity[] = [
  // Week 1
  { week: 0, dayOfWeek: 2, hours: 0, matches: 0, dateStr: 'Aug 1' },
  { week: 0, dayOfWeek: 3, hours: 2.5, matches: 3, dateStr: 'Aug 2' },
  { week: 0, dayOfWeek: 4, hours: 4.5, matches: 6, dateStr: 'Aug 3' },
  { week: 0, dayOfWeek: 5, hours: 9.0, matches: 12, dateStr: 'Aug 4' },
  { week: 0, dayOfWeek: 6, hours: 0, matches: 0, dateStr: 'Aug 5' },

  // Week 2
  { week: 1, dayOfWeek: 0, hours: 8.5, matches: 11, dateStr: 'Aug 6' },
  { week: 1, dayOfWeek: 1, hours: 0, matches: 0, dateStr: 'Aug 7' },
  { week: 1, dayOfWeek: 2, hours: 3.0, matches: 4, dateStr: 'Aug 8' },
  { week: 1, dayOfWeek: 3, hours: 4.2, matches: 5, dateStr: 'Aug 9' },
  { week: 1, dayOfWeek: 4, hours: 9.5, matches: 14, dateStr: 'Aug 10' },
  { week: 1, dayOfWeek: 5, hours: 0, matches: 0, dateStr: 'Aug 11' },
  { week: 1, dayOfWeek: 6, hours: 0, matches: 0, dateStr: 'Aug 12' },

  // Week 3
  { week: 2, dayOfWeek: 0, hours: 4.0, matches: 5, dateStr: 'Aug 13' },
  { week: 2, dayOfWeek: 1, hours: 4.0, matches: 5, dateStr: 'Aug 14' },
  { week: 2, dayOfWeek: 2, hours: 4.5, matches: 6, dateStr: 'Aug 15' },
  { week: 2, dayOfWeek: 3, hours: 0, matches: 0, dateStr: 'Aug 16' },
  { week: 2, dayOfWeek: 4, hours: 0, matches: 0, dateStr: 'Aug 17' },
  { week: 2, dayOfWeek: 5, hours: 0, matches: 0, dateStr: 'Aug 18' },
  { week: 2, dayOfWeek: 6, hours: 9.0, matches: 12, dateStr: 'Aug 19' },

  // Week 4
  { week: 3, dayOfWeek: 0, hours: 3.5, matches: 4, dateStr: 'Aug 20' },
  { week: 3, dayOfWeek: 1, hours: 8.5, matches: 10, dateStr: 'Aug 21' },
  { week: 3, dayOfWeek: 2, hours: 4.0, matches: 5, dateStr: 'Aug 22' },
  { week: 3, dayOfWeek: 3, hours: 3.5, matches: 4, dateStr: 'Aug 23' },
  { week: 3, dayOfWeek: 4, hours: 4.5, matches: 6, dateStr: 'Aug 24' },
  { week: 3, dayOfWeek: 5, hours: 0, matches: 0, dateStr: 'Aug 25' },
  { week: 3, dayOfWeek: 6, hours: 0, matches: 0, dateStr: 'Aug 26' },

  // Week 5
  { week: 4, dayOfWeek: 0, hours: 4.2, matches: 5, dateStr: 'Aug 27' },
  { week: 4, dayOfWeek: 1, hours: 0, matches: 0, dateStr: 'Aug 28' },
  { week: 4, dayOfWeek: 2, hours: 3.8, matches: 5, dateStr: 'Aug 29' },
  { week: 4, dayOfWeek: 3, hours: 9.2, matches: 13, dateStr: 'Aug 30' },
  { week: 4, dayOfWeek: 4, hours: 0, matches: 0, dateStr: 'Aug 31' },
];

export const ActivityHeatmap: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  const daysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getTileStyle = (hours: number) => {
    if (hours === 0) {
      return 'bg-striped-pattern border border-[#353535] text-transparent hover:border-[#788B8D]';
    }
    if (hours <= 2) {
      return 'bg-[#2B2B2B] border border-[#353535] hover:border-[#82EAF4]/40';
    }
    if (hours <= 4.5) {
      return 'bg-[#788B8D]/40 border border-[#788B8D]/60 hover:border-[#82EAF4]/60';
    }
    // Peak activity (> 8h): Vivid Electric Cyan Pill
    return 'bg-[#82EAF4] text-[#0B0B0B] font-semibold shadow-[0_0_14px_rgba(130,234,244,0.45)] hover:bg-[#64E8F2] border-none';
  };

  return (
    <div className={`bg-[#242424] border border-[#353535] rounded-2xl p-5 sm:p-6 text-[#F5F5F5] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold font-heading text-[#F5F5F5] tracking-tight">
            Activity in {selectedMonth}
          </h3>
          <p className="text-xs text-[#B8B8B8] mt-0.5">LAN Tournament Scrims & Match VODs</p>
        </div>

        {/* Month Selector Pill */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2B2B2B] border border-[#353535] text-xs font-medium text-[#F5F5F5] hover:border-[#82EAF4]/50 hover:text-[#82EAF4] transition-colors"
            onClick={() => setSelectedMonth(m => m === 'October' ? 'August' : 'October')}
          >
            <span>{selectedMonth}</span>
            <ChevronDown size={14} className="text-[#B8B8B8]" />
          </button>
        </div>
      </div>

      {/* Legend (Inspired by Reference Screenshot) */}
      <div className="flex items-center gap-4 text-xs text-[#B8B8B8] mb-5 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-4 h-4 rounded-full bg-striped-pattern border border-[#353535]" />
          <span>0h</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-4 h-4 rounded-full bg-[#2B2B2B] border border-[#353535]" />
          <span>&gt; 2h</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-4 h-4 rounded-full bg-[#788B8D]/50 border border-[#788B8D]" />
          <span>&gt; 4h</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-4 h-4 rounded-full bg-[#82EAF4] shadow-[0_0_8px_rgba(130,234,244,0.6)]" />
          <span className="text-[#82EAF4] font-medium">&gt; 8h</span>
        </div>
      </div>

      {/* Squircle Heatmap Grid */}
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map(weekIdx => (
          <div key={weekIdx} className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
              const item = DEFAULT_AUGUST_ACTIVITY.find(
                a => a.week === weekIdx && a.dayOfWeek === dayIdx
              );

              if (!item) {
                return (
                  <div
                    key={dayIdx}
                    className="h-8 sm:h-9 rounded-xl opacity-0 pointer-events-none"
                  />
                );
              }

              return (
                <div
                  key={dayIdx}
                  className={`h-8 sm:h-9 rounded-xl cursor-pointer transition-all duration-150 transform hover:scale-105 flex items-center justify-center ${getTileStyle(item.hours)}`}
                  onMouseEnter={() => setHoveredDay(item)}
                  onMouseLeave={() => setHoveredDay(null)}
                  title={`${item.dateStr}: ${item.hours}h active (${item.matches} matches)`}
                />
              );
            })}
          </div>
        ))}

        {/* Days of week footer */}
        <div className="grid grid-cols-7 gap-2 pt-2 border-t border-[#353535] text-center text-[11px] font-mono text-[#B8B8B8]">
          {daysLabels.map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>

      {/* Hover Info Tooltip Preview */}
      <div className="mt-4 pt-3 border-t border-[#353535] flex items-center justify-between text-xs min-h-[32px]">
        {hoveredDay ? (
          <>
            <span className="text-[#F5F5F5] font-medium">
              {hoveredDay.dateStr}: <span className="text-[#82EAF4]">{hoveredDay.hours} hours logged</span>
            </span>
            <span className="text-[#B8B8B8] font-mono">
              {hoveredDay.matches} LAN scrim matches analyzed
            </span>
          </>
        ) : (
          <span className="text-[#777777]">
            Hover over a day squircle to inspect match history details
          </span>
        )}
      </div>
    </div>
  );
};
