// src/components/fso/device-selector.tsx
"use client";

import React, { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
    getActiveDevices,
    getDeviceById,
    getDeviceCompatibility,
    type DeviceSpec,
} from '@/config/devices';
import { Lock, Wifi, Signal, Check, RotateCcw } from 'lucide-react';

// ============================================
// Props
// ============================================

export interface DeviceSelectorProps {
    /** Currently selected device ID, or null for auto-detect */
    selectedDeviceId: string | null;
    /** Callback when user selects a device */
    onSelectDevice: (deviceId: string | null) => void;
    /** Current link distance in km (for live compatibility hints) */
    currentDistanceKm?: number | null;
    /** Whether an analysis result exists */
    hasAnalysisResult?: boolean;
    /** Whether the current analysis is stale */
    isStale?: boolean;
    /** Whether an action is currently pending */
    disabled?: boolean;
}

// ============================================
// Constants
// ============================================

const BANDWIDTH_STYLES: Record<string, { bg: string; text: string }> = {
    '10 Gbps': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    '1 Gbps': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

// ============================================
// Device Card (memoized)
// ============================================

interface DeviceCardProps {
    device: DeviceSpec;
    isSelected: boolean;
    onSelect: () => void;
    distanceMeters: number | null;
    disabled: boolean;
}

const DeviceCard = React.memo(function DeviceCard({
    device,
    isSelected,
    onSelect,
    distanceMeters,
    disabled,
}: DeviceCardProps) {
    const bwStyle = BANDWIDTH_STYLES[device.bandwidth] ?? { bg: 'bg-slate-500/20', text: 'text-slate-400' };
    const isRestricted = device.isPenta5Certified;

    const compatibility = useMemo(() => {
        if (distanceMeters === null || distanceMeters <= 0) return null;
        return getDeviceCompatibility(device, distanceMeters);
    }, [device, distanceMeters]);

    const handleClick = useCallback(() => {
        if (!isRestricted && !disabled) {
            onSelect();
        }
    }, [isRestricted, disabled, onSelect]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isRestricted && !disabled) {
                e.preventDefault();
                onSelect();
            }
        },
        [isRestricted, disabled, onSelect]
    );

    return (
        <div
            role="radio"
            aria-checked={isSelected}
            aria-disabled={isRestricted || disabled}
            aria-label={`${device.name}, ${device.bandwidth}, max range ${device.maxRangeKm} km${isRestricted ? ', restricted' : ''}`}
            tabIndex={isRestricted || disabled ? -1 : 0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={cn(
                'relative flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer touch-manipulation',
                isRestricted && 'opacity-50 cursor-not-allowed border-dashed border-slate-700/30',
                !isRestricted && isSelected && 'border-primary/50 bg-primary/5 ring-1 ring-primary/20',
                !isRestricted && !isSelected && 'border-slate-700/20 hover:border-slate-600/40 hover:bg-slate-800/30',
                disabled && !isRestricted && 'opacity-60 pointer-events-none'
            )}
        >
            {/* Selection indicator */}
            <div
                className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected ? 'border-primary bg-primary' : 'border-slate-600'
                )}
            >
                {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
            </div>

            {/* Device info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                        {device.name}
                    </span>
                    {isRestricted && (
                        <span className="flex items-center gap-0.5 text-[0.5rem] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium flex-shrink-0">
                            <Lock className="h-2.5 w-2.5" />
                            Restricted
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                    <span
                        className={cn(
                            'text-[0.6rem] px-1.5 py-0.5 rounded font-bold flex-shrink-0',
                            bwStyle.bg,
                            bwStyle.text
                        )}
                    >
                        {device.bandwidth}
                    </span>
                    <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-400 font-medium flex-shrink-0">
                        {device.maxRangeKm} km
                    </span>
                    {/* Binary compatible/not-compatible hint — no percentages, no ratings */}
                    {compatibility && !isRestricted && (
                        <span
                            className={cn(
                                'text-[0.55rem] font-medium flex-shrink-0 ml-auto',
                                compatibility.isCompatible ? 'text-emerald-400' : 'text-red-400'
                            )}
                        >
                            {compatibility.isCompatible ? 'In range' : 'Out of range'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

// ============================================
// Main Component
// ============================================

/**
 * Device selection component for the side panel.
 * Shows all active OpticSpectra devices with bandwidth, range, and live compatibility hints.
 * Defence/restricted devices are shown but disabled with a lock icon.
 *
 * Compatibility is binary: distance <= maxRange → "In range", otherwise "Out of range".
 * No percentages, no utilization bars, no reliability ratings.
 *
 * @param props - DeviceSelectorProps
 * @returns Device selector radio group
 */
const DeviceSelector = React.memo(function DeviceSelector({
    selectedDeviceId,
    onSelectDevice,
    currentDistanceKm,
    hasAnalysisResult,
    isStale,
    disabled = false,
}: DeviceSelectorProps) {
    const activeDevices = useMemo(() => getActiveDevices(), []);
    const distanceMeters = useMemo(
        () => (currentDistanceKm != null && currentDistanceKm > 0 ? currentDistanceKm * 1000 : null),
        [currentDistanceKm]
    );

    const selectedDevice = useMemo(
        () => (selectedDeviceId ? getDeviceById(selectedDeviceId) : null),
        [selectedDeviceId]
    );

    const standardDevices = useMemo(
        () => activeDevices.filter((d) => !d.isPenta5Certified),
        [activeDevices]
    );

    const restrictedDevices = useMemo(
        () => activeDevices.filter((d) => d.isPenta5Certified),
        [activeDevices]
    );

    const handleSelectAuto = useCallback(() => {
        onSelectDevice(null);
    }, [onSelectDevice]);

    const handleSelectDevice = useCallback(
        (deviceId: string) => {
            onSelectDevice(selectedDeviceId === deviceId ? null : deviceId);
        },
        [selectedDeviceId, onSelectDevice]
    );

    const showStaleHint = hasAnalysisResult && !isStale && selectedDeviceId !== null;
    // We show the stale hint when there IS an analysis, it's NOT already stale,
    // and a device IS selected — meaning changing device selection would make it stale

    return (
        <div className="space-y-2" role="radiogroup" aria-label="Device selection">
            {/* Auto-detect option */}
            <div
                role="radio"
                aria-checked={selectedDeviceId === null}
                tabIndex={disabled ? -1 : 0}
                onClick={disabled ? undefined : handleSelectAuto}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.preventDefault();
                        handleSelectAuto();
                    }
                }}
                className={cn(
                    'flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer touch-manipulation',
                    selectedDeviceId === null
                        ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                        : 'border-slate-700/20 hover:border-slate-600/40 hover:bg-slate-800/30',
                    disabled && 'opacity-60 pointer-events-none'
                )}
            >
                <div
                    className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        selectedDeviceId === null ? 'border-primary bg-primary' : 'border-slate-600'
                    )}
                >
                    {selectedDeviceId === null && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <Signal className="h-3.5 w-3.5 text-primary/70" />
                        <span className="text-xs font-semibold text-slate-200">Auto-detect best device</span>
                    </div>
                    <p className="text-[0.6rem] text-muted-foreground/60 mt-0.5 ml-5">
                        Automatically recommends the optimal device after analysis
                    </p>
                </div>
            </div>

            {/* Standard devices */}
            <div className="space-y-1.5">
                <p className="text-[0.55rem] uppercase tracking-wider text-muted-foreground/50 font-semibold px-0.5">
                    Standard
                </p>
                {standardDevices.map((device) => (
                    <DeviceCard
                        key={device.id}
                        device={device}
                        isSelected={selectedDeviceId === device.id}
                        onSelect={() => handleSelectDevice(device.id)}
                        distanceMeters={distanceMeters}
                        disabled={disabled}
                    />
                ))}
            </div>

            {/* Restricted devices */}
            {restrictedDevices.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[0.55rem] uppercase tracking-wider text-muted-foreground/50 font-semibold px-0.5">
                        Defence / JSS 55555
                    </p>
                    {restrictedDevices.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            isSelected={false}
                            onSelect={() => { }}
                            distanceMeters={distanceMeters}
                            disabled={true}
                        />
                    ))}
                </div>
            )}

            {/* Stale hint */}
            {showStaleHint && (
                <div className="flex items-center gap-1.5 text-[0.6rem] text-amber-400/80 bg-amber-500/5 rounded-md px-2.5 py-1.5">
                    <RotateCcw className="h-3 w-3 flex-shrink-0" />
                    <span>Device change requires re-analysis</span>
                </div>
            )}

            {/* Selected device summary when collapsed */}
            {selectedDevice && (
                <div className="flex items-center gap-1.5 text-[0.6rem] text-muted-foreground/60 px-0.5">
                    <Wifi className="h-3 w-3 flex-shrink-0" />
                    <span>
                        Selected: <span className="text-slate-300 font-medium">{selectedDevice.name}</span>
                    </span>
                </div>
            )}
        </div>
    );
});

export default DeviceSelector;