import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface RadarSeries {
  name: string;
  dataKey: string;
  color?: string;
  strokeWidth?: number;
  isDashed?: boolean;
}

interface RadarChartProps {
  data: Array<{ subject: string; [key: string]: any }>;
  series: RadarSeries[];
  height?: number;
  className?: string;
  showLegend?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  series,
  height = 280,
  className = '',
  showLegend = true,
}) => {
  // Pre-configured Gamified Bright Violet series colors
  const defaultColors = [
    { stroke: '#9b30ff', fill: '#9b30ff', fillOpacity: 0.38 }, // Primary: Bright Violet #9B30FF
    { stroke: '#d187ff', fill: '#d187ff', fillOpacity: 0.28 }, // Secondary: Luminous Lilac
    { stroke: '#5662f6', fill: '#5662f6', fillOpacity: 0.22 }, // Tertiary: Cyber Iris
  ];

  return (
    <div className={`w-full h-[${height}px] min-h-[${height}px] flex flex-col items-center justify-center ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#3f1568" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#c8b0e8', fontSize: 11, fontFamily: 'Figtree' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="#3f1568"
            tick={{ fill: '#c8b0e8', fontSize: 9 }}
          />
          {series.map((s, idx) => {
            const palette = defaultColors[idx % defaultColors.length];
            return (
              <Radar
                key={s.dataKey}
                name={s.name}
                dataKey={s.dataKey}
                stroke={s.color || palette.stroke}
                fill={s.color || palette.fill}
                fillOpacity={palette.fillOpacity}
                strokeWidth={s.strokeWidth || 2}
                strokeDasharray={s.isDashed ? '4 4' : undefined}
              />
            );
          })}
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontSize: '12px',
                fontFamily: 'Figtree',
                paddingTop: '8px',
                color: '#F3E8FF',
              }}
            />
          )}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
