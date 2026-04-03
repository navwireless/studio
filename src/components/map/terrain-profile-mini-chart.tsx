// src/components/map/terrain-profile-mini-chart.tsx
// Phase 11B — Small inline SVG elevation chart for terrain profile tool result

'use client';

import React from 'react';

interface ProfilePoint {
  distance: number;
  elevation: number;
}

interface TerrainProfileMiniChartProps {
  profile: ProfilePoint[];
  width?: number;
  height?: number;
  className?: string;
}

export function TerrainProfileMiniChart({
  profile,
  width = 320,
  height = 100,
  className = '',
}: TerrainProfileMiniChartProps) {
  if (!profile || profile.length < 2) return null;

  const padding = { top: 8, right: 8, bottom: 20, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxDist = profile[profile.length - 1].distance;
  const elevations = profile.map((p) => p.elevation);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = maxElev - minElev || 1;

  // Scale helpers
  const xScale = (d: number) => padding.left + (d / maxDist) * chartW;
  const yScale = (e: number) =>
    padding.top + chartH - ((e - minElev) / elevRange) * chartH;

  // Build SVG path
  const pathPoints = profile.map(
    (p) => `${xScale(p.distance).toFixed(1)},${yScale(p.elevation).toFixed(1)}`
  );
  const linePath = `M ${pathPoints.join(' L ')}`;

  // Fill path (close to bottom)
  const fillPath = `${linePath} L ${xScale(maxDist).toFixed(1)},${(
    padding.top + chartH
  ).toFixed(1)} L ${padding.left},${(padding.top + chartH).toFixed(1)} Z`;

  // Y-axis ticks (3 ticks)
  const yTicks = [minElev, minElev + elevRange / 2, maxElev];

  // X-axis ticks (start, mid, end)
  const xTicks = [0, maxDist / 2, maxDist];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Terrain elevation profile"
    >
      {/* Grid lines */}
      {yTicks.map((elev, i) => (
        <line
          key={`yg-${i}`}
          x1={padding.left}
          y1={yScale(elev)}
          x2={padding.left + chartW}
          y2={yScale(elev)}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}

      {/* Fill area */}
      <path d={fillPath} fill="rgba(236, 72, 153, 0.15)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#EC4899"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Y-axis labels */}
      {yTicks.map((elev, i) => (
        <text
          key={`yl-${i}`}
          x={padding.left - 4}
          y={yScale(elev) + 3}
          textAnchor="end"
          fill="rgba(255,255,255,0.5)"
          fontSize="8"
          fontFamily="monospace"
        >
          {elev.toFixed(0)}m
        </text>
      ))}

      {/* X-axis labels */}
      {xTicks.map((dist, i) => (
        <text
          key={`xl-${i}`}
          x={xScale(dist)}
          y={height - 4}
          textAnchor="middle"
          fill="rgba(255,255,255,0.5)"
          fontSize="8"
          fontFamily="monospace"
        >
          {dist < 1000
            ? `${dist.toFixed(0)}m`
            : `${(dist / 1000).toFixed(1)}km`}
        </text>
      ))}

      {/* Min/Max dots */}
      {profile.map((p, i) => {
        if (p.elevation === minElev || p.elevation === maxElev) {
          return (
            <circle
              key={`dot-${i}`}
              cx={xScale(p.distance)}
              cy={yScale(p.elevation)}
              r={2.5}
              fill={p.elevation === maxElev ? '#F59E0B' : '#3B82F6'}
              stroke="#ffffff"
              strokeWidth={0.5}
            />
          );
        }
        return null;
      })}
    </svg>
  );
}