interface RadarProps {
  values: number[];
  target?: number[];
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
}

const LABELS = [
  { name: 'Firepower', short: 'FP' },
  { name: 'Utility', short: 'UT' },
  { name: 'Clutch', short: 'CL' },
  { name: 'Shotcall', short: 'SC' },
  { name: 'Objective', short: 'OBJ' },
];

function getCoordinates(vals: number[], r = 90, cx = 170, cy = 155) {
  return vals.map((v, i) => {
    const a = (Math.PI * 2 / vals.length) * i - Math.PI / 2;
    const clampedV = Math.max(10, Math.min(100, v));
    const dist = r * (clampedV / 100);
    return {
      x: cx + dist * Math.cos(a),
      y: cy + dist * Math.sin(a),
      angle: a,
      val: v,
    };
  });
}

function pointsString(coords: { x: number; y: number }[]) {
  return coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
}

export default function RadarSvg({
  values,
  target = [70, 70, 70, 70, 70],
  className = '',
  showLabels = true,
  showValues = true,
}: RadarProps) {
  const cx = 170;
  const cy = 155;
  const maxR = 92;

  const targetCoords = getCoordinates(target, maxR, cx, cy);
  const candidateCoords = getCoordinates(values, maxR, cx, cy);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 340 310"
        className="w-full h-auto overflow-visible filter drop-shadow-[0_0_20px_rgba(130,234,244,0.15)]"
        aria-label="Tactical Competency Radar Visualization"
      >
        <defs>
          {/* Glowing Neon Cyan Gradient */}
          <radialGradient id="radar-cyan-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#82EAF4" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#82EAF4" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#82EAF4" stopOpacity="0.05" />
          </radialGradient>

          {/* Target Golden Area */}
          <radialGradient id="radar-target-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5B83D" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#F5B83D" stopOpacity="0.02" />
          </radialGradient>

          {/* Node Glow Filter */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer subtle glow disk */}
        <circle cx={cx} cy={cy} r={maxR + 8} fill="none" stroke="#262626" strokeWidth="1" strokeDasharray="3 3" />

        {/* Concentric Polygonal Web Grid (25%, 50%, 75%, 100%) */}
        {[0.25, 0.5, 0.75, 1.0].map((level) => {
          const coords = getCoordinates([100, 100, 100, 100, 100], maxR * level, cx, cy);
          return (
            <g key={level}>
              <polygon
                points={pointsString(coords)}
                fill={level === 1.0 ? 'rgba(15, 23, 28, 0.6)' : 'none'}
                stroke={level === 1.0 ? '#404040' : '#282828'}
                strokeWidth={level === 1.0 ? '1.5' : '1'}
              />
              {/* Distance label on top axis */}
              <text
                x={cx + 3}
                y={cy - maxR * level + (level === 1.0 ? 9 : 3)}
                fill="#555"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="start"
              >
                {Math.round(level * 100)}
              </text>
            </g>
          );
        })}

        {/* Radial Spokes / Axis Lines */}
        {LABELS.map((_, i) => {
          const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
          const endX = cx + maxR * Math.cos(a);
          const endY = cy + maxR * Math.sin(a);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={endX}
              y2={endY}
              stroke="#353535"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Center Origin Mark */}
        <circle cx={cx} cy={cy} r="3" fill="#82EAF4" fillOpacity="0.4" />
        <circle cx={cx} cy={cy} r="1.5" fill="#82EAF4" />

        {/* Benchmark / Target Polygon (Sentinels Core / Gold) */}
        <polygon
          points={pointsString(targetCoords)}
          fill="url(#radar-target-grad)"
          stroke="#F5B83D"
          strokeWidth="1.75"
          strokeDasharray="4 3"
          strokeLinejoin="round"
        />

        {/* Candidate Evaluation Polygon (Live Profile / Cyan Neon) */}
        <polygon
          className="radar-shape"
          points={pointsString(candidateCoords)}
          pathLength={1}
          strokeDasharray={1}
          fill="url(#radar-cyan-grad)"
          stroke="#82EAF4"
          strokeWidth="2.5"
          strokeLinejoin="round"
          filter="drop-shadow(0 0 8px rgba(130,234,244,0.5))"
        />

        {/* Candidate Vertex Nodes (Glowing Data Anchors) */}
        {candidateCoords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r="4.5"
              fill="#0B0B0B"
              stroke="#82EAF4"
              strokeWidth="2"
              filter="url(#node-glow)"
            />
            <circle cx={c.x} cy={c.y} r="2" fill="#82EAF4" />
          </g>
        ))}

        {/* External Axis Labels & Value Badges (Properly Padded) */}
        {showLabels &&
          LABELS.map((item, i) => {
            const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
            // Generous label distance to ensure zero clipping
            const labelDist = maxR + 32;
            const lx = cx + labelDist * Math.cos(a);
            const ly = cy + labelDist * Math.sin(a);

            // Alignment tweaks based on angle
            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            let dy = 0;
            if (i === 0) {
              // Top (Firepower)
              dy = -6;
            } else if (i === 1) {
              // Top-right (Utility)
              textAnchor = 'start';
              dy = 0;
            } else if (i === 2) {
              // Bottom-right (Clutch)
              textAnchor = 'start';
              dy = 8;
            } else if (i === 3) {
              // Bottom-left (Shotcall)
              textAnchor = 'end';
              dy = 8;
            } else if (i === 4) {
              // Top-left (Objective)
              textAnchor = 'end';
              dy = 0;
            }

            const currentVal = values[i] ?? 0;
            const targetVal = target[i] ?? 70;
            const isDeficit = currentVal < targetVal;

            return (
              <g key={item.name} transform={`translate(${lx}, ${ly + dy})`}>
                {/* Metric Title */}
                <text
                  x="0"
                  y="0"
                  textAnchor={textAnchor}
                  fill="#E0E0E0"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Figtree, sans-serif"
                  letterSpacing="0.02em"
                >
                  {item.name}
                </text>

                {/* Metric Value & Target indicator */}
                {showValues && (
                  <text
                    x="0"
                    y="13"
                    textAnchor={textAnchor}
                    fill={isDeficit ? '#F5B83D' : '#82EAF4'}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {currentVal}{' '}
                    <tspan fill="#666" fontSize="9" fontWeight="400">
                      /{targetVal}
                    </tspan>
                  </text>
                )}
              </g>
            );
          })}
      </svg>

      {/* Sleek Legend Indicator Bar */}
      <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-charcoal-border/50 text-[11px] font-mono w-full px-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan shadow-[0_0_8px_#82EAF4]" />
          <span className="text-textPrimary font-medium">Candidate Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0 border-b-2 border-dashed border-gold" />
          <span className="text-gold font-medium">Roster Target (70)</span>
        </div>
      </div>
    </div>
  );
}
