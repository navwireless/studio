// src/components/map/solar-charts.tsx
// Phase 12C — SVG chart components for Solar Interference Analyzer
// - SunPathDiagram: Rectangular azimuth vs altitude chart
// - InterferenceHeatmap: Month × Hour grid
// Both render as pure SVG for crisp rendering at any scale.

'use client';

import React from 'react';

// ─── Sun Path Diagram ───────────────────────────────────────────────

interface SunPathDiagramProps {
  /** Heatmap data [month][hour] = risk 0-1 */
  heatmap: number[][];
  /** Device pointing azimuth */
  pointingAzimuth: number;
  /** Device pointing elevation */
  pointingElevation: number;
  /** FOV threshold in degrees */
  fovThreshold: number;
}

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
// Sun path key dates: solstices and equinoxes
const SUN_TRACK_COLORS = [
  { month: 'Jun 21', color: '#FACC15', dash: 'none' },
  { month: 'Mar 21', color: '#F97316', dash: '4,2' },
  { month: 'Dec 21', color: '#60A5FA', dash: '4,2' },
];

export function SunPathDiagram({
  pointingAzimuth,
  pointingElevation,
  fovThreshold,
}: SunPathDiagramProps) {
  const W = 420;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Azimuth range: 0-360, Altitude range: 0-90
  const azToX = (az: number) => PAD.left + (az / 360) * chartW;
  const altToY = (alt: number) => PAD.top + chartH - (alt / 90) * chartH;

  // Generate sun tracks for key dates using simplified declinations
  const declinations = [23.44, 0, -23.44]; // Jun, Equinox, Dec
  const latitude = 20; // Approximate — doesn't need to be exact for the diagram

  const sunTracks = declinations.map((decl) => {
    const points: { az: number; alt: number }[] = [];
    const latRad = (latitude * Math.PI) / 180;
    const declRad = (decl * Math.PI) / 180;

    for (let ha = -180; ha <= 180; ha += 3) {
      const haRad = (ha * Math.PI) / 180;
      const sinAlt =
        Math.sin(latRad) * Math.sin(declRad) +
        Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
      const alt = (Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180) / Math.PI;
      if (alt < 0) continue;

      const cosAz =
        (Math.sin(declRad) - Math.sin(latRad) * sinAlt) /
        (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)));
      let az = (Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180) / Math.PI;
      if (ha > 0) az = 360 - az;

      points.push({ az, alt });
    }
    return points;
  });

  // Danger zone rectangle (device pointing direction ± FOV)
  const dzLeft = pointingAzimuth - fovThreshold * 2;
  const dzRight = pointingAzimuth + fovThreshold * 2;
  const dzTop = Math.min(90, pointingElevation + fovThreshold * 2);
  const dzBottom = Math.max(0, pointingElevation - fovThreshold * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: '200px' }}>
      {/* Background */}
      <rect x={PAD.left} y={PAD.top} width={chartW} height={chartH} fill="#0F172A" rx="4" />

      {/* Grid lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315, 360].map((az) => (
        <line
          key={`az-${az}`}
          x1={azToX(az)} y1={PAD.top}
          x2={azToX(az)} y2={PAD.top + chartH}
          stroke="#1E293B" strokeWidth="0.5"
        />
      ))}
      {[0, 15, 30, 45, 60, 75, 90].map((alt) => (
        <line
          key={`alt-${alt}`}
          x1={PAD.left} y1={altToY(alt)}
          x2={PAD.left + chartW} y2={altToY(alt)}
          stroke="#1E293B" strokeWidth="0.5"
        />
      ))}

      {/* Danger zone */}
      <rect
        x={azToX(Math.max(0, dzLeft))}
        y={altToY(dzTop)}
        width={azToX(Math.min(360, dzRight)) - azToX(Math.max(0, dzLeft))}
        height={altToY(dzBottom) - altToY(dzTop)}
        fill="#EF4444"
        fillOpacity="0.12"
        stroke="#EF4444"
        strokeWidth="1"
        strokeDasharray="3,2"
        rx="2"
      />

      {/* Device pointing crosshair */}
      <circle
        cx={azToX(pointingAzimuth)}
        cy={altToY(Math.max(0, pointingElevation))}
        r="4"
        fill="#3B82F6"
        stroke="white"
        strokeWidth="1.5"
      />
      <text
        x={azToX(pointingAzimuth) + 7}
        y={altToY(Math.max(0, pointingElevation)) + 3}
        fill="#94A3B8"
        fontSize="7"
        fontFamily="Inter, sans-serif"
      >
        DEVICE
      </text>

      {/* Sun tracks */}
      {sunTracks.map((track, i) => (
        <polyline
          key={i}
          points={track.map((p) => `${azToX(p.az)},${altToY(p.alt)}`).join(' ')}
          fill="none"
          stroke={SUN_TRACK_COLORS[i].color}
          strokeWidth="1.5"
          strokeDasharray={SUN_TRACK_COLORS[i].dash}
          opacity="0.7"
        />
      ))}

      {/* Axis labels */}
      {['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'].map((dir, i) => (
        <text
          key={dir + i}
          x={azToX(i * 45)}
          y={H - 5}
          textAnchor="middle"
          fill="#64748B"
          fontSize="8"
          fontFamily="Inter, sans-serif"
        >
          {dir}
        </text>
      ))}
      {[0, 30, 60, 90].map((alt) => (
        <text
          key={alt}
          x={PAD.left - 5}
          y={altToY(alt) + 3}
          textAnchor="end"
          fill="#64748B"
          fontSize="7"
          fontFamily="Inter, sans-serif"
        >
          {alt}°
        </text>
      ))}

      {/* Legend */}
      {SUN_TRACK_COLORS.map((st, i) => (
        <g key={i} transform={`translate(${PAD.left + 5 + i * 70}, ${PAD.top + 5})`}>
          <line x1="0" y1="5" x2="14" y2="5" stroke={st.color} strokeWidth="1.5" strokeDasharray={st.dash} />
          <text x="18" y="8" fill={st.color} fontSize="7" fontFamily="Inter, sans-serif">{st.month}</text>
        </g>
      ))}

      {/* Title */}
      <text x={PAD.left} y={12} fill="#94A3B8" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">
        SUN PATH vs DEVICE AXIS
      </text>
    </svg>
  );
}

// ─── Interference Heatmap ───────────────────────────────────────────

interface InterferenceHeatmapProps {
  /** Heatmap data [month][hour] = risk 0-1 */
  heatmap: number[][];
}

function riskColor(risk: number): string {
  if (risk <= 0.01) return '#0F172A';
  if (risk < 0.15) return '#1E3A5F';
  if (risk < 0.33) return '#854D0E';
  if (risk < 0.66) return '#D97706';
  return '#DC2626';
}

export function InterferenceHeatmap({ heatmap }: InterferenceHeatmapProps) {
  const W = 420;
  const H = 220;
  const PAD = { top: 20, right: 10, bottom: 20, left: 30 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const cellW = chartW / 12;
  const hourStart = 5;
  const hourEnd = 20;
  const hourRange = hourEnd - hourStart;
  const cellH = chartH / hourRange;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: '220px' }}>
      {/* Title */}
      <text x={PAD.left} y={12} fill="#94A3B8" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600">
        ANNUAL INTERFERENCE HEATMAP
      </text>

      {/* Grid cells */}
      {heatmap.map((monthData, month) =>
        monthData.map((risk, hour) => {
          if (hour < hourStart || hour >= hourEnd) return null;
          const x = PAD.left + month * cellW;
          const y = PAD.top + (hour - hourStart) * cellH;
          return (
            <rect
              key={`${month}-${hour}`}
              x={x + 0.5}
              y={y + 0.5}
              width={cellW - 1}
              height={cellH - 1}
              fill={riskColor(risk)}
              rx="1.5"
            >
              <title>
                {MONTH_LABELS[month]} {hour}:00 — Risk: {(risk * 100).toFixed(0)}%
              </title>
            </rect>
          );
        })
      )}

      {/* Month labels */}
      {MONTH_LABELS.map((label, i) => (
        <text
          key={label + i}
          x={PAD.left + i * cellW + cellW / 2}
          y={H - 4}
          textAnchor="middle"
          fill="#64748B"
          fontSize="7"
          fontFamily="Inter, sans-serif"
        >
          {label}
        </text>
      ))}

      {/* Hour labels */}
      {Array.from({ length: hourRange }, (_, i) => hourStart + i).filter((h) => h % 2 === 0).map((hour) => (
        <text
          key={hour}
          x={PAD.left - 4}
          y={PAD.top + (hour - hourStart) * cellH + cellH / 2 + 3}
          textAnchor="end"
          fill="#64748B"
          fontSize="7"
          fontFamily="Inter, sans-serif"
        >
          {hour}h
        </text>
      ))}

      {/* Legend */}
      {[
        { color: '#DC2626', label: 'High' },
        { color: '#D97706', label: 'Medium' },
        { color: '#854D0E', label: 'Low' },
        { color: '#0F172A', label: 'Safe' },
      ].map((item, i) => (
        <g key={i} transform={`translate(${W - 75}, ${PAD.top + 5 + i * 14})`}>
          <rect x="0" y="0" width="8" height="8" fill={item.color} rx="1" />
          <text x="12" y="7" fill="#94A3B8" fontSize="7" fontFamily="Inter, sans-serif">{item.label}</text>
        </g>
      ))}
    </svg>
  );
}
