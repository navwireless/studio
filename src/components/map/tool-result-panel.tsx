// src/components/map/tool-result-panel.tsx
// Phase 13 — Formatted result renderers for all Phase 12B tools

'use client';

import React, { useCallback } from 'react';
import {
  X,
  Copy,
  Ruler,
  Pentagon,
  MapPin,
  Mountain,
  Crosshair,
  Circle,
  Camera,
  BarChart3,
  Grid3x3,
  Compass,
  Target,
} from 'lucide-react';
import type { ToolResult } from '@/types/map-tools';
import { MAP_TOOLS } from '@/types/map-tools';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ruler, Pentagon, MapPin, Mountain, Crosshair, Circle, Camera, BarChart3, Grid3x3, Compass, Target,
};

interface ToolResultPanelProps {
  result: ToolResult | null;
  onClose: () => void;
  isMobile: boolean;
}

export function ToolResultPanel({ result, onClose, isMobile }: ToolResultPanelProps) {
  if (!result) return null;

  // Don't show panel for grid toggle or screenshot (those have their own feedback)
  if (result.toolId === 'grid-overlay' || result.toolId === 'map-screenshot') {
    return null;
  }

  const toolDef = MAP_TOOLS.find((t) => t.id === result.toolId);
  const Icon = toolDef ? ICON_MAP[toolDef.icon] : null;

  return (
    <div
      className={cn(
        'absolute z-30',
        isMobile
          ? 'bottom-24 left-3 right-3'
          : 'bottom-6 right-16',
        'animate-in fade-in slide-in-from-bottom-2 duration-200'
      )}
    >
      <div
        className={cn(
          'rounded-xl border border-surface-border',
          'bg-surface-card/95 backdrop-blur-xl shadow-xl',
          isMobile ? 'p-3' : 'p-3 max-w-[360px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-6 h-6 rounded-md bg-brand-500/15 flex items-center justify-center">
                <Icon className="h-3.5 w-3.5 text-brand-400" />
              </div>
            )}
            <span className="text-xs font-semibold text-text-brand-primary">
              {toolDef?.name ?? 'Tool Result'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-text-brand-muted hover:text-text-brand-secondary transition-colors touch-manipulation"
            aria-label="Close result"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content — tool-specific rendering */}
        <div className="space-y-1.5">
          <ToolResultContent result={result} />
        </div>
      </div>
    </div>
  );
}

function ToolResultContent({ result }: { result: ToolResult }) {
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  const data = result.data;

  switch (result.toolId) {
    // ═══════════════════════════════════════════════
    // Phase 12B Tools
    // ═══════════════════════════════════════════════

    case 'multi-measure':
      return (
        <div className="space-y-1.5">
          <ResultRow label="Total Distance" value={data.totalDistance as string} large copyable onCopy={copyToClipboard} />
          <ResultRow label="Points" value={String(data.pointCount)} />
          <ResultRow label="Segments" value={String(data.segmentCount)} />
          {(data.segments as Array<{ index: number; distance: string; bearing: string; compass: string }>)?.length > 0 && (
            <div className="pt-1 border-t border-surface-border">
              <div className="text-[0.6rem] text-text-brand-muted mb-1">Segments</div>
              <div className="space-y-0.5 max-h-28 overflow-y-auto">
                {(data.segments as Array<{ index: number; distance: string; bearing: string; compass: string }>).map((seg) => (
                  <div key={seg.index} className="flex justify-between text-[0.6rem] text-text-brand-secondary">
                    <span>Leg {seg.index}</span>
                    <span className="font-mono">{seg.distance} · {seg.bearing} {seg.compass}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {typeof data.elevation === 'object' && data.elevation !== null && (
            <div className="pt-1 border-t border-surface-border">
              <div className="text-[0.6rem] text-text-brand-muted mb-1">Elevation</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                <ResultRow label="Min" value={(data.elevation as Record<string, string>).minElevation} compact />
                <ResultRow label="Max" value={(data.elevation as Record<string, string>).maxElevation} compact />
                <ResultRow label="Gain" value={(data.elevation as Record<string, string>).elevationGain} compact />
                <ResultRow label="Slope" value={(data.elevation as Record<string, string>).slopePercent} compact />
              </div>
              {Array.isArray((data.elevation as Record<string, unknown>).profile) && (
                <ElevationSparkline
                  profile={(data.elevation as Record<string, unknown>).profile as Array<{ elevation: number }>}
                />
              )}
            </div>
          )}
        </div>
      );

    case 'measure-area':
      return (
        <div className="space-y-1.5">
          <ResultRow label="Area" value={data.area as string} large copyable onCopy={copyToClipboard} />
          <ResultRow label="Acres" value={data.areaAcres as string} />
          <ResultRow label="Perimeter" value={data.perimeter as string} copyable onCopy={copyToClipboard} />
          <ResultRow label="Vertices" value={String(data.vertexCount)} />
        </div>
      );

    case 'placemark': {
      const dmsStr = data.dms as string;
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: data.color as string }} />
            <span className="text-xs font-semibold text-text-brand-primary">Placemark {data.label as string}</span>
          </div>
          <ResultRow label="DD" value={data.dd as string} large copyable onCopy={copyToClipboard} />
          <ResultRow label="DMS" value={dmsStr} copyable onCopy={copyToClipboard} />
          <ResultRow label="UTM" value={data.utm as string} copyable onCopy={copyToClipboard} />
          <ResultRow label="Total Marks" value={String(data.totalPlacemarks)} />
        </div>
      );
    }

    case 'elevation-probe': {
      const points = data.points as Array<{ label: string; elevation: string; elevationRaw: number | null }>;
      const stats = data.stats as { highest: string; lowest: string; average: string; range: string } | null;
      return (
        <div className="space-y-1.5">
          {stats && (
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mb-1">
              <ResultRow label="▲ Highest" value={stats.highest} compact />
              <ResultRow label="▼ Lowest" value={stats.lowest} compact />
              <ResultRow label="Average" value={stats.average} compact />
              <ResultRow label="Range" value={stats.range} compact />
            </div>
          )}
          {points?.length > 0 && (
            <div className="pt-1 border-t border-surface-border">
              <div className="text-[0.6rem] text-text-brand-muted mb-1">Probes ({points.length})</div>
              <div className="space-y-0.5 max-h-28 overflow-y-auto">
                {points.map((p) => (
                  <div key={p.label} className="flex justify-between text-[0.6rem] text-text-brand-secondary">
                    <span className="font-semibold">{p.label}</span>
                    <span className="font-mono">{p.elevation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    case 'coord-tool':
      return (
        <div className="space-y-1.5">
          {data.source !== 'click' && (
            <div className="text-[0.55rem] text-text-brand-muted">
              Parsed from <span className="uppercase font-semibold">{data.source as string}</span>
            </div>
          )}
          <ResultRow label="DD" value={data.dd as string} large copyable onCopy={copyToClipboard} />
          <ResultRow label="DMS Lat" value={data.dmsLat as string} copyable onCopy={copyToClipboard} />
          <ResultRow label="DMS Lng" value={data.dmsLng as string} copyable onCopy={copyToClipboard} />
          <ResultRow label="UTM" value={data.utm as string} copyable onCopy={copyToClipboard} />
        </div>
      );

    case 'range-rings': {
      return (
        <div className="space-y-1.5">
          <ResultRow label="Radius" value={data.radius as string} large copyable onCopy={copyToClipboard} />
          <ResultRow label="Diameter" value={data.diameter as string} copyable onCopy={copyToClipboard} />
          <ResultRow label="Center" value={data.center as string} copyable onCopy={copyToClipboard} />
          <ResultRow label="Edge" value={data.edge as string} copyable onCopy={copyToClipboard} />
          <ResultRow label="Area" value={data.area as string} />
        </div>
      );
    }

    case 'weather-probe': {
      if (data.error) {
        return <ResultRow label="Error" value={String(data.error)} />;
      }
      const weather = (data.weather as Record<string, string>) ?? {};
      const impact = (data.fsoImpact as { level?: string; note?: string }) ?? {};
      return (
        <div className="space-y-1.5">
          <ResultRow label="Location" value={data.location as string} copyable onCopy={copyToClipboard} />
          <ResultRow label="Condition" value={weather.condition ?? 'N/A'} large />
          <ResultRow label="Temp" value={weather.temperature ?? 'N/A'} compact />
          <ResultRow label="Humidity" value={weather.humidity ?? 'N/A'} compact />
          <ResultRow label="Wind" value={weather.wind ?? 'N/A'} compact />
          <ResultRow label="Cloud Cover" value={weather.cloudCover ?? 'N/A'} compact />
          <div className="pt-1 border-t border-surface-border">
            <ResultRow label="FSO Impact" value={(impact.level ?? 'unknown').toUpperCase()} compact />
            <p className="text-[0.6rem] text-text-brand-muted mt-1 leading-relaxed">{impact.note ?? 'No impact assessment available.'}</p>
          </div>
        </div>
      );
    }

    default:
      // Fallback: show key-value pairs nicely instead of raw JSON
      return (
        <div className="space-y-0.5 max-h-32 overflow-y-auto">
          {Object.entries(data).map(([key, value]) => {
            if (key === 'isFinal' || key === 'overlays' || typeof value === 'object') return null;
            return (
              <ResultRow
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                value={String(value)}
                compact
              />
            );
          })}
        </div>
      );
  }
}

function ElevationSparkline({ profile }: { profile: Array<{ elevation: number }> }) {
  if (!profile.length) return null;

  const values = profile.map((p) => p.elevation);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const points = values
    .map((value, i) => {
      const x = (i / Math.max(1, values.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mt-2 rounded-md border border-surface-border bg-surface-overlay/50 p-1.5">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-14">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-brand-400"
          points={points}
        />
      </svg>
      <div className="flex justify-between text-[0.55rem] text-text-brand-muted mt-1">
        <span>{min.toFixed(1)} m</span>
        <span>{max.toFixed(1)} m</span>
      </div>
    </div>
  );
}

// Reusable result row
function ResultRow({
  label,
  value,
  large,
  compact,
  copyable,
  onCopy,
}: {
  label: string;
  value: string;
  large?: boolean;
  compact?: boolean;
  copyable?: boolean;
  onCopy?: (text: string) => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2',
        compact ? 'py-0' : 'py-0.5'
      )}
    >
      <span
        className={cn(
          'text-text-brand-muted flex-shrink-0',
          compact ? 'text-[0.55rem]' : 'text-[0.65rem]'
        )}
      >
        {label}
      </span>
      <div className="flex items-center gap-1 min-w-0">
        <span
          className={cn(
            'font-mono truncate',
            large
              ? 'text-xs font-semibold text-text-brand-primary'
              : compact
                ? 'text-[0.6rem] text-text-brand-secondary'
                : 'text-[0.65rem] text-text-brand-secondary'
          )}
          title={value}
        >
          {value}
        </span>
        {copyable && onCopy && (
          <button
            onClick={() => onCopy(value)}
            className="text-text-brand-muted hover:text-brand-400 transition-colors flex-shrink-0 touch-manipulation"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}