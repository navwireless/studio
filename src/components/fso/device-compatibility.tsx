// src/components/fso/device-compatibility.tsx
"use client";

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { DeviceCompatibilityData } from '@/types';
import { getDeviceById } from '@/config/devices';
import { CheckCircle, XCircle, Wifi, Star, AlertTriangle } from 'lucide-react';

// ============================================
// Props
// ============================================

export interface DeviceCompatibilityProps {
    /** Device compatibility data from analysis result */
    deviceCompatibility: DeviceCompatibilityData;
    /** Link distance in km */
    distanceKm: number;
    /** Whether the link is feasible */
    isFeasible: boolean;
}

// ============================================
// Sub-components
// ============================================

/** Single compatible device entry in the list — binary compatible/not, no percentages */
interface CompatibleDeviceItemProps {
    deviceId: string;
    deviceName: string;
    bandwidth: string;
    maxRangeKm: number;
    isRecommended: boolean;
}

const CompatibleDeviceItem = React.memo(function CompatibleDeviceItem({
    deviceName,
    bandwidth,
    maxRangeKm,
    isRecommended,
}: CompatibleDeviceItemProps) {
    return (
        <div
            className={cn(
                'rounded-lg border p-2.5 space-y-1.5 transition-colors',
                isRecommended
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-slate-700/20 bg-slate-800/20'
            )}
        >
            <div className="flex items-center gap-1.5">
                {isRecommended && (
                    <Star className="h-3 w-3 text-primary flex-shrink-0" aria-label="Recommended" />
                )}
                <span className="text-xs font-semibold text-slate-200 truncate">
                    {deviceName}
                </span>
                <span className="text-[0.55rem] px-1.5 py-0.5 rounded bg-slate-700/40 text-slate-400 font-medium flex-shrink-0 ml-auto">
                    {bandwidth}
                </span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[0.55rem] text-muted-foreground/60">
                    Max Range: {maxRangeKm} km
                </span>
                <span className="text-[0.55rem] font-medium text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle className="h-2.5 w-2.5" />
                    Compatible
                </span>
            </div>
        </div>
    );
});

// ============================================
// Main Component
// ============================================

/**
 * Displays device compatibility results after a LOS analysis.
 * Binary compatible/not-compatible. No percentages, no utilization bars, no ratings.
 *
 * When a specific device was selected: shows detailed compatibility for that device.
 * When auto-detect: shows all compatible standard devices with the recommended one highlighted.
 * Defence/restricted devices are filtered out unless explicitly selected.
 *
 * @param props - DeviceCompatibilityProps
 * @returns Device compatibility display, or null if no data
 */
const DeviceCompatibility = React.memo(function DeviceCompatibility({
    deviceCompatibility,
    distanceKm,
    isFeasible,
}: DeviceCompatibilityProps) {
    const { selectedDevice, recommendation } = deviceCompatibility;

    const selectedDeviceSpec = useMemo(
        () => (selectedDevice ? getDeviceById(selectedDevice.deviceId) : null),
        [selectedDevice]
    );

    // Filter out restricted devices from compatible list (unless explicitly selected)
    const filteredCompatibleDevices = useMemo(() => {
        return recommendation.compatibleDevices.filter(d => {
            if (selectedDevice && d.deviceId === selectedDevice.deviceId) return true;
            const spec = getDeviceById(d.deviceId);
            return spec ? !spec.isPenta5Certified : true;
        });
    }, [recommendation.compatibleDevices, selectedDevice]);

    // ── Selected device mode ──
    if (selectedDevice) {
        const shortfall = !selectedDevice.isCompatible && selectedDeviceSpec
            ? distanceKm - selectedDeviceSpec.maxRangeKm
            : 0;

        return (
            <div className="space-y-2.5">
                {/* Compatibility status */}
                <div
                    className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg',
                        selectedDevice.isCompatible
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'bg-red-500/10 border border-red-500/20'
                    )}
                >
                    {selectedDevice.isCompatible ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                        <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                        <span
                            className={cn(
                                'text-xs font-bold',
                                selectedDevice.isCompatible ? 'text-emerald-400' : 'text-red-400'
                            )}
                        >
                            {selectedDevice.isCompatible ? 'Compatible' : 'Not Compatible'}
                        </span>
                        <p className="text-[0.6rem] text-muted-foreground/70 truncate">
                            {selectedDevice.deviceName}
                        </p>
                    </div>
                </div>

                {/* Device specs summary */}
                {selectedDeviceSpec && (
                    <div className="bg-slate-800/30 rounded-md px-3 py-2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Bandwidth</span>
                            <span className="text-foreground font-medium">{selectedDeviceSpec.bandwidth}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Max Range</span>
                            <span className="text-foreground font-medium">{selectedDeviceSpec.maxRangeKm} km</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Link Distance</span>
                            <span className="text-foreground font-medium">{distanceKm.toFixed(2)} km</span>
                        </div>
                        {!selectedDevice.isCompatible && shortfall > 0 && (
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Shortfall</span>
                                <span className="text-red-400 font-medium">
                                    {shortfall.toFixed(1)} km
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Suggestion when incompatible */}
                {!selectedDevice.isCompatible && recommendation.recommendedDeviceName && isFeasible && (
                    <div className="flex items-start gap-1.5 text-[0.65rem] text-primary/80 bg-primary/5 rounded-md px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                            Try <span className="font-bold">{recommendation.recommendedDeviceName}</span> —
                            it covers this {distanceKm.toFixed(1)} km link.
                        </span>
                    </div>
                )}
            </div>
        );
    }

    // ── Auto-detect mode ──
    const { reasoning, recommendedDeviceId } = recommendation;

    return (
        <div className="space-y-2.5">
            {/* Summary */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/20">
                <Wifi className="h-4 w-4 text-primary/70 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-200">
                        {filteredCompatibleDevices.length > 0
                            ? `${filteredCompatibleDevices.length} device${filteredCompatibleDevices.length !== 1 ? 's' : ''} compatible`
                            : 'No devices in range'}
                    </span>
                    <p className="text-[0.55rem] text-muted-foreground/60 mt-0.5">
                        {distanceKm.toFixed(1)} km link distance
                    </p>
                </div>
            </div>

            {/* Compatible devices list */}
            {filteredCompatibleDevices.length > 0 && (
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {filteredCompatibleDevices.map((d) => (
                        <CompatibleDeviceItem
                            key={d.deviceId}
                            deviceId={d.deviceId}
                            deviceName={d.deviceName}
                            bandwidth={d.bandwidth}
                            maxRangeKm={d.maxRangeKm}
                            isRecommended={d.deviceId === recommendedDeviceId}
                        />
                    ))}
                </div>
            )}

            {/* No compatible devices */}
            {filteredCompatibleDevices.length === 0 && (
                <div className="text-center py-3">
                    <XCircle className="h-6 w-6 mx-auto mb-1.5 text-red-400/50" />
                    <p className="text-xs text-red-400/80 font-medium">No devices support this distance</p>
                    <p className="text-[0.55rem] text-muted-foreground/50 mt-0.5">
                        {distanceKm.toFixed(1)} km exceeds all available device ranges
                    </p>
                </div>
            )}

            {/* Reasoning */}
            {reasoning && (
                <p className="text-[0.55rem] text-muted-foreground/50 leading-relaxed px-0.5">
                    {reasoning}
                </p>
            )}
        </div>
    );
});

export default DeviceCompatibility;