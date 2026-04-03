"use client";

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { AnalysisResult, DeviceCompatibilityData } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator/types';
import { AnimatedNumber } from '@/components/animated-number';
import { getDeviceById } from '@/config/devices';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  AlertTriangle,
  Star,
  Cable,
  Loader2,
} from 'lucide-react';

// ============================================
// Props
// ============================================

export interface ResultsCardProps {
  /** The analysis result */
  result: AnalysisResult;
  /** Clearance threshold used */
  clearanceThreshold: number;
  /** Fiber path result if available */
  fiberPathResult?: FiberPathResult | null;
  /** Whether fiber path is being calculated */
  isFiberCalculating?: boolean;
  /** Fiber path error if any */
  fiberPathError?: string | null;
  /** Optional render prop for elevation chart */
  renderChart?: () => React.ReactNode;
}

// ============================================
// Expandable Section
// ============================================

interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function ExpandableSection({
  title,
  icon,
  defaultOpen = false,
  children,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-surface-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((p) => !p)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-left',
          'hover:bg-surface-overlay transition-colors duration-150',
          'touch-manipulation',
        )}
      >
        <span className="text-text-brand-muted">{icon}</span>
        <span className="text-[0.7rem] font-medium text-text-brand-secondary flex-1">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-text-brand-muted transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-3 pb-3 pt-1 border-t border-surface-border">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Status Banner
// ============================================

interface StatusBannerProps {
  losPossible: boolean;
  additionalHeightNeeded: number | null;
}

function StatusBanner({ losPossible, additionalHeightNeeded }: StatusBannerProps) {
  if (losPossible) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 rounded-lg',
          'bg-success-bg border-l-4 border-l-success',
        )}
      >
        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
        <div>
          <span className="text-xs font-bold text-success">
            PASS — LINE OF SIGHT CLEAR
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg',
        'bg-danger-bg border-l-4 border-l-danger',
      )}
    >
      <XCircle className="h-4 w-4 text-danger flex-shrink-0" />
      <div>
        <span className="text-xs font-bold text-danger">
          FAIL — LINE OF SIGHT BLOCKED
        </span>
        {additionalHeightNeeded != null && additionalHeightNeeded > 0 && (
          <p className="text-[0.65rem] text-danger-light mt-0.5">
            +{additionalHeightNeeded.toFixed(1)}m additional tower height needed
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// Device Compatibility Inline
// ============================================

interface DeviceCompactProps {
  deviceCompatibility: DeviceCompatibilityData;
  distanceKm: number;
}

function DeviceCompact({ deviceCompatibility, distanceKm }: DeviceCompactProps) {
  const { selectedDevice, recommendation } = deviceCompatibility;

  // Selected device mode
  if (selectedDevice) {
    const spec = getDeviceById(selectedDevice.deviceId);
    const shortfall = !selectedDevice.isCompatible && spec
      ? distanceKm - spec.maxRangeKm
      : 0;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-text-brand-muted">Device</span>
          <span className="text-text-brand-primary font-medium truncate">
            {selectedDevice.deviceName}
          </span>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 text-[0.65rem] font-medium',
            selectedDevice.isCompatible ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {selectedDevice.isCompatible ? (
            <>
              <CheckCircle className="h-3 w-3 flex-shrink-0" />
              In range
              {spec && (
                <span className="text-text-brand-muted font-normal">
                  • {spec.bandwidth} • {spec.maxRangeKm} km
                </span>
              )}
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 flex-shrink-0" />
              Out of range
              {shortfall > 0 && (
                <span className="font-normal">
                  ({shortfall.toFixed(1)} km over)
                </span>
              )}
            </>
          )}
        </div>

        {/* Recommendation when incompatible */}
        {!selectedDevice.isCompatible && recommendation.recommendedDeviceName && (
          <div className="flex items-start gap-1.5 text-[0.6rem] text-brand-400 mt-1">
            <Star className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <span>
              Try{' '}
              <span className="font-bold">{recommendation.recommendedDeviceName}</span>
            </span>
          </div>
        )}
      </div>
    );
  }

  // Auto-detect mode
  const compatCount = recommendation.compatibleDevices.filter((d) => {
    const spec = getDeviceById(d.deviceId);
    return spec ? !spec.isPenta5Certified : true;
  }).length;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-text-brand-muted">Device</span>
      <span
        className={cn(
          'font-medium',
          compatCount > 0 ? 'text-emerald-400' : 'text-red-400'
        )}
      >
        {compatCount > 0
          ? `${compatCount} compatible`
          : 'None in range'}
      </span>
      {recommendation.recommendedDeviceName && (
        <span className="text-text-brand-muted">
          • Best: {recommendation.recommendedDeviceName}
        </span>
      )}
    </div>
  );
}

// ============================================
// Fiber Path Compact
// ============================================

interface FiberCompactProps {
  fiberPathResult: FiberPathResult | null;
  isFiberCalculating: boolean;
  fiberPathError: string | null;
}

function FiberCompact({
  fiberPathResult,
  isFiberCalculating,
  fiberPathError,
}: FiberCompactProps) {
  if (isFiberCalculating) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-brand-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Calculating fiber path...</span>
      </div>
    );
  }

  if (!fiberPathResult) return null;

  if (fiberPathResult.status === 'success' && fiberPathResult.totalDistanceMeters != null) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Cable className="h-3 w-3 text-cyan-400 flex-shrink-0" />
        <span className="text-text-brand-muted">Fiber</span>
        <span className="text-cyan-400 font-bold">
          <AnimatedNumber
            value={fiberPathResult.totalDistanceMeters}
            decimals={0}
            suffix=" m"
          />
        </span>
      </div>
    );
  }

  if (fiberPathResult.status === 'los_not_feasible') {
    return (
      <div className="flex items-center gap-1.5 text-[0.65rem] text-text-brand-muted">
        <Cable className="h-3 w-3 flex-shrink-0" />
        <span>Fiber: LOS needed</span>
      </div>
    );
  }

  if (fiberPathError || fiberPathResult.errorMessage) {
    return (
      <div className="flex items-center gap-1.5 text-[0.65rem] text-amber-400">
        <Cable className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">
          Fiber: {fiberPathResult.errorMessage || fiberPathError}
        </span>
      </div>
    );
  }

  return null;
}

// ============================================
// Main Component
// ============================================

/**
 * Compact results display card with:
 * - Full-width PASS/FAIL status banner
 * - Two-column metrics grid (distance, clearance, towers, threshold)
 * - Device compatibility inline
 * - Fiber path summary
 * - Expandable elevation profile chart
 * - Expandable analysis details
 *
 * Animates in with slide + fade (300ms).
 */
export function ResultsCard({
  result,
  clearanceThreshold,
  fiberPathResult = null,
  isFiberCalculating = false,
  fiberPathError = null,
  renderChart,
}: ResultsCardProps) {
  const actualMinClearance = result.minClearance;
  const isClear =
    actualMinClearance !== null ? actualMinClearance >= clearanceThreshold : false;

  // Profile analysis
  const profileStats = useMemo(() => {
    if (!result.profile || result.profile.length === 0) {
      return null;
    }

    const elevations = result.profile.map((p) => p.terrainElevation);
    const maxElevation = Math.max(...elevations);
    const minElevation = Math.min(...elevations);

    // Find obstruction point (worst clearance)
    let worstIdx = 0;
    let worstClearance = Infinity;
    result.profile.forEach((p, i) => {
      if (p.clearance < worstClearance) {
        worstClearance = p.clearance;
        worstIdx = i;
      }
    });

    const obstructionDistance = result.profile[worstIdx]?.distance ?? null;

    return {
      samples: result.profile.length,
      maxElevation,
      minElevation,
      obstructionDistanceKm: obstructionDistance
        ? obstructionDistance / 1000
        : null,
    };
  }, [result.profile]);

  return (
    <div data-tour="results-area" className="animate-in fade-in-0 slide-in-from-bottom-3 duration-300 space-y-3">
      {/* Section label */}
      <div className="flex items-center gap-1.5">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-text-brand-muted">
          Results
        </span>
      </div>

      {/* Status Banner */}
      <StatusBanner
        losPossible={result.losPossible}
        additionalHeightNeeded={result.additionalHeightNeeded}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCell
          label="Distance"
          value={
            result.distanceKm < 1
              ? `${(result.distanceKm * 1000).toFixed(0)} m`
              : `${result.distanceKm.toFixed(2)} km`
          }
        />
        <MetricCell
          label="Min Clearance"
          value={
            actualMinClearance !== null
              ? `${actualMinClearance.toFixed(1)} m`
              : 'N/A'
          }
          valueColor={isClear ? 'text-emerald-400' : 'text-red-400'}
        />
        <MetricCell
          label="Towers"
          value={`${result.pointA?.towerHeight}m / ${result.pointB?.towerHeight}m`}
        />
        <MetricCell label="Threshold" value={`${clearanceThreshold}m`} />
      </div>

      {/* Height deficit warning */}
      {!isClear && actualMinClearance !== null && (
        <div className="flex items-center gap-1.5 text-[0.7rem] text-red-400 bg-danger-bg rounded-lg px-3 py-2">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>
            Add{' '}
            <span className="font-bold">
              {Math.ceil(clearanceThreshold - actualMinClearance)}m
            </span>{' '}
            to tower(s) for clearance.
          </span>
        </div>
      )}

      {/* Device Compatibility */}
      {result.deviceCompatibility && (
        <div className="bg-surface-elevated rounded-lg px-3 py-2.5 border border-surface-border">
          <DeviceCompact
            deviceCompatibility={result.deviceCompatibility}
            distanceKm={result.distanceKm}
          />
        </div>
      )}

      {/* Fiber Path */}
      {(fiberPathResult || isFiberCalculating) && (
        <div className="bg-surface-elevated rounded-lg px-3 py-2.5 border border-surface-border">
          <FiberCompact
            fiberPathResult={fiberPathResult}
            isFiberCalculating={isFiberCalculating}
            fiberPathError={fiberPathError}
          />
        </div>
      )}

      {/* Expandable: Elevation Profile */}
      {renderChart && (
        <ExpandableSection
          title="Elevation Profile"
          icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18L9 12L13 16L21 8" /><path d="M21 8V14" /><path d="M21 8H15" /></svg>}
          defaultOpen={false}
        >
          <div className="h-[200px] w-full">{renderChart()}</div>
        </ExpandableSection>
      )}

      {/* Expandable: Analysis Details */}
      <ExpandableSection
        title="Analysis Details"
        icon={<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>}
        defaultOpen={false}
      >
        <div className="space-y-1.5 text-xs">
          {/* Site A */}
          <div>
            <p className="font-medium text-text-brand-secondary">
              Site A: {result.pointA?.name || 'Site A'}
            </p>
            <p className="text-text-brand-muted text-[0.65rem] font-mono">
              {result.pointA?.lat.toFixed(6)}, {result.pointA?.lng.toFixed(6)} •{' '}
              {result.pointA?.towerHeight}m
            </p>
          </div>

          {/* Site B */}
          <div>
            <p className="font-medium text-text-brand-secondary">
              Site B: {result.pointB?.name || 'Site B'}
            </p>
            <p className="text-text-brand-muted text-[0.65rem] font-mono">
              {result.pointB?.lat.toFixed(6)}, {result.pointB?.lng.toFixed(6)} •{' '}
              {result.pointB?.towerHeight}m
            </p>
          </div>

          {/* Profile stats */}
          {profileStats && (
            <>
              <div className="h-px bg-surface-border my-1.5" />
              <div className="grid grid-cols-2 gap-1.5">
                <DetailRow label="Samples" value={`${profileStats.samples}`} />
                <DetailRow
                  label="Max Elevation"
                  value={`${profileStats.maxElevation.toFixed(0)}m`}
                />
                <DetailRow
                  label="Min Elevation"
                  value={`${profileStats.minElevation.toFixed(0)}m`}
                />
                {!result.losPossible && profileStats.obstructionDistanceKm && (
                  <DetailRow
                    label="Obstruction at"
                    value={`${profileStats.obstructionDistanceKm.toFixed(1)} km`}
                  />
                )}
              </div>
              {!result.losPossible && result.additionalHeightNeeded != null && (
                <DetailRow
                  label="Additional height"
                  value={`+${result.additionalHeightNeeded.toFixed(1)}m`}
                  valueColor="text-red-400"
                />
              )}
            </>
          )}

          {/* Fresnel zone */}
          {result.fresnelZoneRadiusAtWorstPoint != null && (
            <DetailRow
              label="Fresnel radius (worst)"
              value={`${result.fresnelZoneRadiusAtWorstPoint.toFixed(1)}m`}
            />
          )}

          {/* K-factor */}
          {result.kFactor != null && (
            <DetailRow
              label="K-factor"
              value={`${result.kFactor.toFixed(3)}`}
            />
          )}
        </div>
      </ExpandableSection>
    </div>
  );
}

// ============================================
// Metric Cell
// ============================================

interface MetricCellProps {
  label: string;
  value: string;
  valueColor?: string;
}

function MetricCell({ label, value, valueColor }: MetricCellProps) {
  return (
    <div className="bg-surface-elevated rounded-lg px-3 py-2 border border-surface-border">
      <span className="text-[0.55rem] uppercase tracking-wider text-text-brand-muted block">
        {label}
      </span>
      <span
        className={cn(
          'font-bold text-sm',
          valueColor || 'text-text-brand-primary'
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ============================================
// Detail Row
// ============================================

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

function DetailRow({ label, value, valueColor }: DetailRowProps) {
  return (
    <div className="flex justify-between text-[0.65rem]">
      <span className="text-text-brand-muted">{label}</span>
      <span className={cn('font-medium', valueColor || 'text-text-brand-primary')}>
        {value}
      </span>
    </div>
  );
}

export default ResultsCard;