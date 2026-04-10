'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Target, Navigation, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──
interface AlignmentTarget {
  linkId: string;
  linkName: string;
  direction: 'A→B' | 'B→A';
  azimuth: number;      // Target azimuth (0-360°)
  elevation: number;    // Target elevation (degrees from horizontal)
}

interface SensorReading {
  alpha: number;   // Compass heading (0-360°)
  beta: number;    // Front-to-back tilt (-180 to 180°)
  gamma: number;   // Left-to-right tilt (-90 to 90°)
}

interface AlignmentPanelProps {
  /** The target to align to */
  target: AlignmentTarget;
  /** Close the panel */
  onClose: () => void;
  /** Tolerance for azimuth alignment (degrees) */
  azimuthTolerance?: number;
  /** Tolerance for elevation alignment (degrees) */
  elevationTolerance?: number;
}

// ── Helpers ──
function getCompassDirection(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(degrees / 22.5) % 16;
  return dirs[idx];
}

function normalizeAngleDelta(target: number, current: number): number {
  let delta = target - current;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

function getAdjustmentText(azDelta: number, elDelta: number): string {
  const parts: string[] = [];
  if (Math.abs(azDelta) > 1) {
    parts.push(azDelta > 0 ? `Pan RIGHT ${Math.abs(azDelta).toFixed(1)}°` : `Pan LEFT ${Math.abs(azDelta).toFixed(1)}°`);
  }
  if (Math.abs(elDelta) > 0.5) {
    parts.push(elDelta > 0 ? `Tilt UP ${Math.abs(elDelta).toFixed(1)}°` : `Tilt DOWN ${Math.abs(elDelta).toFixed(1)}°`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Hold steady';
}

// ── Main Component ──
export function AlignmentPanel({
  target,
  onClose,
  azimuthTolerance = 2.0,
  elevationTolerance = 1.0,
}: AlignmentPanelProps) {
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listenerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);

  // Check sensor availability
  useEffect(() => {
    setSensorAvailable('DeviceOrientationEvent' in window);
  }, []);

  // Request permissions on iOS
  const requestPermission = useCallback(async () => {
    try {
      const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (DOE.requestPermission) {
        const perm = await DOE.requestPermission();
        if (perm === 'granted') {
          setPermissionGranted(true);
        } else {
          setError('Permission denied. Enable motion access in Settings.');
        }
      } else {
        // No permission needed (Android/desktop)
        setPermissionGranted(true);
      }
    } catch {
      setError('Unable to access device sensors.');
    }
  }, []);

  // Auto-request on non-iOS or start listening
  useEffect(() => {
    if (!sensorAvailable) return;

    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (!DOE.requestPermission) {
      setPermissionGranted(true);
    }
  }, [sensorAvailable]);

  // Start listening to sensor
  useEffect(() => {
    if (!permissionGranted) return;

    const handler = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
        setReading({
          alpha: event.alpha,
          beta: event.beta,
          gamma: event.gamma,
        });
      }
    };

    listenerRef.current = handler;
    window.addEventListener('deviceorientation', handler, true);

    return () => {
      if (listenerRef.current) {
        window.removeEventListener('deviceorientation', listenerRef.current, true);
        listenerRef.current = null;
      }
    };
  }, [permissionGranted]);

  // Calculate alignment status
  const currentAzimuth = reading ? reading.alpha : null;
  const currentElevation = reading ? -reading.beta : null; // beta is inverted for tilt
  const azDelta = currentAzimuth !== null ? normalizeAngleDelta(target.azimuth, currentAzimuth) : null;
  const elDelta = currentElevation !== null ? normalizeAngleDelta(target.elevation, currentElevation) : null;
  const isAzAligned = azDelta !== null && Math.abs(azDelta) <= azimuthTolerance;
  const isElAligned = elDelta !== null && Math.abs(elDelta) <= elevationTolerance;
  const isFullyAligned = isAzAligned && isElAligned;

  // Compass rose rotation
  const compassRotation = currentAzimuth !== null ? -currentAzimuth : 0;
  const targetRotation = target.azimuth;

  return (
    <div className="fixed inset-0 z-[500] bg-surface-base/98 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-brand-400" />
          <div>
            <h2 className="text-sm font-bold text-text-brand-primary">Device Alignment</h2>
            <p className="text-[0.6rem] text-text-brand-muted">{target.linkName} ({target.direction})</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-surface-overlay text-text-brand-muted transition-colors touch-manipulation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        {!sensorAvailable ? (
          <div className="text-center space-y-3">
            <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto" />
            <p className="text-sm text-text-brand-primary font-medium">Sensors Not Available</p>
            <p className="text-xs text-text-brand-muted">
              Device orientation sensors are required for alignment. Use a mobile device with accelerometer/gyroscope.
            </p>
          </div>
        ) : !permissionGranted ? (
          <div className="text-center space-y-4">
            <Navigation className="h-12 w-12 text-brand-400 mx-auto" />
            <p className="text-sm text-text-brand-primary font-medium">Motion Sensor Access Required</p>
            <p className="text-xs text-text-brand-muted max-w-xs">
              Allow access to your device&apos;s motion sensors for real-time alignment guidance.
            </p>
            <button
              onClick={requestPermission}
              className="px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors touch-manipulation active:scale-95"
            >
              Enable Sensors
            </button>
          </div>
        ) : error ? (
          <div className="text-center space-y-3">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-sm text-text-brand-primary font-medium">Sensor Error</p>
            <p className="text-xs text-text-brand-muted">{error}</p>
          </div>
        ) : (
          <>
            {/* Compass visualization */}
            <div className="relative w-56 h-56">
              {/* Compass ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-surface-border transition-transform duration-100"
                style={{ transform: `rotate(${compassRotation}deg)` }}
              >
                {/* N/S/E/W labels */}
                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold text-red-400">N</span>
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold text-text-brand-muted">S</span>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-text-brand-muted">E</span>
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-text-brand-muted">W</span>
              </div>

              {/* Target indicator */}
              <div
                className="absolute inset-4 rounded-full"
                style={{ transform: `rotate(${targetRotation + compassRotation}deg)` }}
              >
                <div className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-4 h-4 rounded-full border-2 transition-colors",
                  isAzAligned ? 'bg-emerald-500 border-emerald-400' : 'bg-brand-500 border-brand-400'
                )} />
              </div>

              {/* Center crosshair (current heading) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                  "w-3 h-3 rounded-full border-2 transition-colors",
                  isFullyAligned ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : 'bg-white/80 border-white/60'
                )} />
              </div>

              {/* Current heading line */}
              <div className="absolute top-4 left-1/2 w-0.5 h-[calc(50%-16px)] bg-white/40 origin-bottom" />
            </div>

            {/* Alignment status */}
            <div className={cn(
              "w-full max-w-sm px-5 py-4 rounded-2xl text-center transition-all",
              isFullyAligned
                ? 'bg-emerald-500/15 border border-emerald-500/30'
                : 'bg-surface-overlay border border-surface-border'
            )}>
              {isFullyAligned ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-400">Aligned!</span>
                </div>
              ) : (
                <p className="text-sm font-medium text-text-brand-secondary">
                  {azDelta !== null && elDelta !== null ? getAdjustmentText(azDelta, elDelta) : 'Initializing sensors...'}
                </p>
              )}
            </div>

            {/* Readings grid */}
            <div className="w-full max-w-sm grid grid-cols-2 gap-3">
              {/* Azimuth */}
              <div className="rounded-xl bg-surface-overlay border border-surface-border p-3">
                <p className="text-[0.55rem] uppercase tracking-wider text-text-brand-muted mb-1">Azimuth</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tabular-nums text-text-brand-primary">
                    {currentAzimuth !== null ? currentAzimuth.toFixed(1) : '—'}
                  </span>
                  <span className="text-xs text-text-brand-muted">°</span>
                  {currentAzimuth !== null && (
                    <span className="text-xs text-text-brand-muted ml-auto">{getCompassDirection(currentAzimuth)}</span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[0.55rem] text-text-brand-muted">Target:</span>
                  <span className={cn(
                    "text-[0.55rem] font-semibold",
                    isAzAligned ? 'text-emerald-400' : 'text-brand-400'
                  )}>
                    {target.azimuth.toFixed(1)}° {getCompassDirection(target.azimuth)}
                  </span>
                </div>
              </div>

              {/* Elevation */}
              <div className="rounded-xl bg-surface-overlay border border-surface-border p-3">
                <p className="text-[0.55rem] uppercase tracking-wider text-text-brand-muted mb-1">Elevation</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold tabular-nums text-text-brand-primary">
                    {currentElevation !== null ? currentElevation.toFixed(1) : '—'}
                  </span>
                  <span className="text-xs text-text-brand-muted">°</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[0.55rem] text-text-brand-muted">Target:</span>
                  <span className={cn(
                    "text-[0.55rem] font-semibold",
                    isElAligned ? 'text-emerald-400' : 'text-brand-400'
                  )}>
                    {target.elevation.toFixed(1)}°
                  </span>
                </div>
              </div>

              {/* Delta indicators */}
              {azDelta !== null && (
                <div className="rounded-xl bg-surface-overlay border border-surface-border p-3">
                  <p className="text-[0.55rem] uppercase tracking-wider text-text-brand-muted mb-1">Az. Delta</p>
                  <span className={cn(
                    "text-lg font-bold tabular-nums",
                    isAzAligned ? 'text-emerald-400' : Math.abs(azDelta) > 10 ? 'text-red-400' : 'text-amber-400'
                  )}>
                    {azDelta > 0 ? '+' : ''}{azDelta.toFixed(1)}°
                  </span>
                </div>
              )}
              {elDelta !== null && (
                <div className="rounded-xl bg-surface-overlay border border-surface-border p-3">
                  <p className="text-[0.55rem] uppercase tracking-wider text-text-brand-muted mb-1">El. Delta</p>
                  <span className={cn(
                    "text-lg font-bold tabular-nums",
                    isElAligned ? 'text-emerald-400' : Math.abs(elDelta) > 5 ? 'text-red-400' : 'text-amber-400'
                  )}>
                    {elDelta > 0 ? '+' : ''}{elDelta.toFixed(1)}°
                  </span>
                </div>
              )}
            </div>

            {/* Tolerance info */}
            <p className="text-[0.55rem] text-text-brand-disabled text-center">
              Tolerance: ±{azimuthTolerance}° azimuth, ±{elevationTolerance}° elevation
            </p>
          </>
        )}
      </div>
    </div>
  );
}
