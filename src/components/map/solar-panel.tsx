// src/components/map/solar-panel.tsx
// Phase 12C — Solar Interference Analyzer Panel
// 3-view UI: Sun Path, Heatmap, Summary Cards
// Appears as a slide-up panel when solar analysis is triggered

'use client';

import React, { useState, useMemo } from 'react';
import {
  Sun,
  X,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Clock,
  Calendar,
  Target,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import type { SolarAnalysisResult, DeviceInterferenceResult } from '@/lib/solar-position';
import { SunPathDiagram, InterferenceHeatmap } from './solar-charts';
import { cn } from '@/lib/utils';

interface SolarPanelProps {
  result: SolarAnalysisResult;
  onClose: () => void;
  isMobile: boolean;
}

type ViewTab = 'summary' | 'sunpath' | 'heatmap';
type DeviceTab = 'A' | 'B';

const RISK_STYLES = {
  none: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: CheckCircle2, label: 'No Risk' },
  low: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: AlertTriangle, label: 'Low Risk' },
  moderate: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: AlertTriangle, label: 'Moderate' },
  high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: AlertTriangle, label: 'High Risk' },
};

function formatHour(h: number): string {
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function SolarPanel({ result, onClose, isMobile }: SolarPanelProps) {
  const [viewTab, setViewTab] = useState<ViewTab>('summary');
  const [deviceTab, setDeviceTab] = useState<DeviceTab>('A');
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const activeDevice: DeviceInterferenceResult = deviceTab === 'A' ? result.deviceA : result.deviceB;
  const overallStyle = RISK_STYLES[result.overallRisk];
  const OverallIcon = overallStyle.icon;

  return (
    <div
      className={cn(
        'absolute bottom-0 left-0 right-0 z-40',
        'bg-surface-card/98 backdrop-blur-xl',
        'border-t border-surface-border shadow-2xl',
        'transition-all duration-300',
        isExpanded
          ? isMobile ? 'max-h-[80vh]' : 'max-h-[50vh]'
          : 'max-h-[48px]',
      )}
    >
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-border/50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sun className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-brand-primary">Solar Interference</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full', overallStyle.bg, overallStyle.border, overallStyle.text, 'border')}>
                <OverallIcon className="h-2.5 w-2.5 inline mr-0.5 -mt-0.5" />
                {overallStyle.label}
              </span>
              <span className="text-[0.55rem] text-text-brand-muted">
                {result.deviceA.summary.annualHours.toFixed(0)}h + {result.deviceB.summary.annualHours.toFixed(0)}h annual
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded((p) => !p)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-brand-muted hover:text-text-brand-secondary hover:bg-white/[0.04] transition"
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-brand-muted hover:text-red-400 hover:bg-red-500/10 transition"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ═══ Body ═══ */}
      {isExpanded && (
        <div className={cn('overflow-y-auto', isMobile ? 'max-h-[70vh]' : 'max-h-[44vh]')} style={{ scrollbarWidth: 'thin' }}>
          {/* Device tabs */}
          <div className="flex items-center px-4 py-2 gap-2 border-b border-surface-border/30">
            <DeviceTabButton
              active={deviceTab === 'A'}
              onClick={() => setDeviceTab('A')}
              label={result.deviceA.label}
              risk={result.deviceA.summary.riskLevel}
            />
            <DeviceTabButton
              active={deviceTab === 'B'}
              onClick={() => setDeviceTab('B')}
              label={result.deviceB.label}
              risk={result.deviceB.summary.riskLevel}
            />

            {/* View tabs */}
            <div className="ml-auto flex items-center bg-surface-overlay/40 rounded-lg p-0.5 gap-0.5">
              <ViewTabButton active={viewTab === 'summary'} onClick={() => setViewTab('summary')} label="Summary" />
              <ViewTabButton active={viewTab === 'sunpath'} onClick={() => setViewTab('sunpath')} label="Sun Path" />
              <ViewTabButton active={viewTab === 'heatmap'} onClick={() => setViewTab('heatmap')} label="Heatmap" />
            </div>
          </div>

          {/* View content */}
          <div className={cn('p-4', isMobile && 'px-3')}>
            {viewTab === 'summary' && <SummaryView device={activeDevice} />}
            {viewTab === 'sunpath' && (
              <SunPathDiagram
                heatmap={activeDevice.heatmap}
                pointingAzimuth={activeDevice.pointingAzimuth}
                pointingElevation={activeDevice.pointingElevation}
                fovThreshold={activeDevice.fovThreshold}
              />
            )}
            {viewTab === 'heatmap' && (
              <InterferenceHeatmap heatmap={activeDevice.heatmap} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary View ───────────────────────────────────────────────────

function SummaryView({ device }: { device: DeviceInterferenceResult }) {
  const style = RISK_STYLES[device.summary.riskLevel];
  const RiskIcon = style.icon;

  return (
    <div className="space-y-4">
      {/* Pointing info */}
      <div className="flex items-center gap-4 flex-wrap">
        <InfoChip icon={<Target className="h-3 w-3" />} label="Azimuth" value={`${device.pointingAzimuth.toFixed(1)}°`} />
        <InfoChip icon={<Target className="h-3 w-3 rotate-90" />} label="Elevation" value={`${device.pointingElevation >= 0 ? '+' : ''}${device.pointingElevation.toFixed(1)}°`} />
        <InfoChip icon={<Sun className="h-3 w-3" />} label="FOV" value={`±${device.fovThreshold}°`} />
      </div>

      {/* Risk badge + stats */}
      <div className={cn('rounded-xl p-4', style.bg, 'border', style.border)}>
        <div className="flex items-center gap-2 mb-3">
          <RiskIcon className={cn('h-5 w-5', style.text)} />
          <span className={cn('text-sm font-bold', style.text)}>{style.label}</span>
        </div>

        {device.hasInterference ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={<Clock className="h-3.5 w-3.5" />} label="Annual" value={`${device.summary.annualHours.toFixed(1)} hrs`} />
            <StatCard icon={<Calendar className="h-3.5 w-3.5" />} label="Days affected" value={`${device.summary.affectedDays}`} />
            <StatCard icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Closest approach" value={`${device.summary.minAngularDelta.toFixed(1)}°`} />
            {device.summary.worstDay && (
              <StatCard
                icon={<Sun className="h-3.5 w-3.5" />}
                label="Worst day"
                value={`${device.summary.worstDay.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`}
                detail={`${device.summary.worstDayMinutes} min`}
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-emerald-400/80">
            Sun passes {device.summary.minAngularDelta > 90 ? 'far' : `>${device.summary.minAngularDelta.toFixed(1)}°`} from device axis year-round. No mitigation needed.
          </p>
        )}
      </div>

      {/* Interference periods */}
      {device.hasInterference && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {device.summary.morningPeriod && (
            <PeriodCard
              title="Morning Risk"
              period={device.summary.morningPeriod}
            />
          )}
          {device.summary.eveningPeriod && (
            <PeriodCard
              title="Evening Risk"
              period={device.summary.eveningPeriod}
            />
          )}
        </div>
      )}

      {/* Mitigation */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-overlay/40 border border-surface-border/50">
        <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-[0.6rem] text-text-brand-muted uppercase tracking-wider font-semibold">Mitigation</span>
          <p className="text-xs text-text-brand-secondary mt-0.5">{device.summary.mitigation}</p>
        </div>
      </div>

      {/* Top interference days table */}
      {device.hasInterference && <TopInterferenceDays device={device} />}
    </div>
  );
}

// ─── Top Interference Days ──────────────────────────────────────────

function TopInterferenceDays({ device }: { device: DeviceInterferenceResult }) {
  const topDays = useMemo(() => {
    return device.dailyData
      .filter((d) => d.totalMinutes > 0)
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 10);
  }, [device]);

  if (topDays.length === 0) return null;

  return (
    <div>
      <h4 className="text-[0.6rem] text-text-brand-muted uppercase tracking-wider font-semibold mb-2">
        Top Interference Days
      </h4>
      <div className="rounded-lg border border-surface-border/50 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-surface-overlay/30">
              <th className="text-left px-3 py-1.5 text-text-brand-muted font-medium">Date</th>
              <th className="text-left px-3 py-1.5 text-text-brand-muted font-medium">Windows</th>
              <th className="text-right px-3 py-1.5 text-text-brand-muted font-medium">Duration</th>
              <th className="text-right px-3 py-1.5 text-text-brand-muted font-medium">Min Δ</th>
            </tr>
          </thead>
          <tbody>
            {topDays.map((day, i) => (
              <tr key={day.dayOfYear} className={cn('border-t border-surface-border/30', i % 2 === 0 && 'bg-surface-overlay/10')}>
                <td className="px-3 py-1.5 text-text-brand-secondary tabular-nums">
                  {day.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </td>
                <td className="px-3 py-1.5 text-text-brand-muted">
                  {day.windows.map((w) => `${formatHour(w.startHour)}–${formatHour(w.endHour)}`).join(', ')}
                </td>
                <td className="px-3 py-1.5 text-right text-text-brand-secondary tabular-nums">
                  {day.totalMinutes} min
                </td>
                <td className="px-3 py-1.5 text-right text-text-brand-secondary tabular-nums">
                  {Math.min(...day.windows.map((w) => w.minDelta)).toFixed(1)}°
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function DeviceTabButton({
  active,
  onClick,
  label,
  risk,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  risk: string;
}) {
  const riskStyle = RISK_STYLES[risk as keyof typeof RISK_STYLES] || RISK_STYLES.none;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
        active
          ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
          : 'text-text-brand-muted hover:text-text-brand-secondary hover:bg-white/[0.04] border border-transparent',
      )}
    >
      <div className={cn('w-1.5 h-1.5 rounded-full', riskStyle.text.replace('text-', 'bg-'))} />
      <span className="truncate max-w-[120px]">{label}</span>
    </button>
  );
}

function ViewTabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-md text-[0.6rem] font-medium transition-all',
        active
          ? 'bg-brand-500/20 text-brand-400'
          : 'text-text-brand-muted hover:text-text-brand-secondary',
      )}
    >
      {label}
    </button>
  );
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-text-brand-muted">{icon}</span>
      <span className="text-text-brand-muted">{label}:</span>
      <span className="text-text-brand-primary font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="bg-surface-overlay/30 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-text-brand-muted">{icon}</span>
        <span className="text-[0.55rem] text-text-brand-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-bold text-text-brand-primary tabular-nums">{value}</div>
      {detail && <div className="text-[0.55rem] text-text-brand-muted mt-0.5">{detail}</div>}
    </div>
  );
}

function PeriodCard({
  title,
  period,
}: {
  title: string;
  period: { startDate: string; endDate: string; avgMinutes: number };
}) {
  return (
    <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Sun className="h-3.5 w-3.5 text-orange-400" />
        <span className="text-xs font-semibold text-orange-400">{title}</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-brand-muted">Period</span>
          <span className="text-text-brand-secondary tabular-nums">{period.startDate} – {period.endDate}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-brand-muted">Avg. duration</span>
          <span className="text-text-brand-secondary tabular-nums">{period.avgMinutes} min/day</span>
        </div>
      </div>
    </div>
  );
}
