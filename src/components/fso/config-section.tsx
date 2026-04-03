"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import {
  getActiveDevices,
  getDeviceById,
  getDeviceCompatibility,
  type DeviceSpec,
} from '@/config/devices';
import {
  ChevronDown,
  Check,
  Signal,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

// ============================================
// Props
// ============================================

export interface ConfigSectionProps {
  /** Current clearance threshold value in meters */
  clearanceThreshold: number;
  /** Callback when clearance threshold changes */
  onClearanceThresholdChange: (value: number) => void;
  /** Currently selected device ID, or null for auto-detect */
  selectedDeviceId: string | null;
  /** Callback when device selection changes */
  onSelectDevice: (deviceId: string | null) => void;
  /** Current live distance between sites in km */
  currentDistanceKm: number | null;
  /** Whether an analysis result exists (for compatibility display) */
  hasAnalysisResult: boolean;
  /** Whether any action is pending */
  disabled?: boolean;
}

// ============================================
// Tooltip texts
// ============================================

const CLEARANCE_TOOLTIP =
  'Minimum vertical clearance required above terrain obstacles for a link to be considered feasible. Typical values: 5–20 meters. Higher values provide more safety against atmospheric effects.';

const DEVICE_TOOLTIP =
  "Select an OpticSpectra FSO device to check if its maximum operational range covers this link distance. 'Auto-detect' recommends the best compatible device after analysis.";

// ============================================
// Compact Device Dropdown
// ============================================

interface DeviceDropdownProps {
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string | null) => void;
  currentDistanceKm: number | null;
  disabled: boolean;
}

function DeviceDropdown({
  selectedDeviceId,
  onSelectDevice,
  currentDistanceKm,
  disabled,
}: DeviceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const activeDevices = useMemo(() => getActiveDevices(), []);
  const standardDevices = useMemo(
    () => activeDevices.filter((d) => !d.isPenta5Certified),
    [activeDevices]
  );

  const selectedDevice = useMemo(
    () => (selectedDeviceId ? getDeviceById(selectedDeviceId) : null),
    [selectedDeviceId]
  );

  const distanceMeters = useMemo(
    () =>
      currentDistanceKm != null && currentDistanceKm > 0
        ? currentDistanceKm * 1000
        : null,
    [currentDistanceKm]
  );

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleSelect = useCallback(
    (deviceId: string | null) => {
      onSelectDevice(deviceId);
      setIsOpen(false);
    },
    [onSelectDevice]
  );

  const toggleOpen = useCallback(() => {
    if (!disabled) setIsOpen((p) => !p);
  }, [disabled]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'h-8 px-3 rounded-md text-[0.75rem]',
          'bg-surface-card border border-surface-border',
          'text-text-brand-primary',
          'hover:border-surface-border-light',
          'focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500/40',
          'transition-colors duration-200 touch-manipulation',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">
          {selectedDevice ? selectedDevice.name : 'Auto-detect best device'}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-text-brand-muted flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 left-0 right-0 mt-1',
            'bg-surface-elevated border border-surface-border-light',
            'rounded-lg shadow-xl',
            'max-h-[280px] overflow-y-auto',
            'animate-in fade-in-0 slide-in-from-top-2 duration-150',
          )}
          style={{ scrollbarWidth: 'thin' }}
          role="listbox"
          aria-label="Select device"
        >
          {/* Auto-detect option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2.5 text-left',
              'hover:bg-surface-overlay transition-colors duration-150',
              selectedDeviceId === null && 'bg-brand-500/5',
            )}
            role="option"
            aria-selected={selectedDeviceId === null}
          >
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                selectedDeviceId === null
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-surface-border-light'
              )}
            >
              {selectedDeviceId === null && (
                <Check className="h-2.5 w-2.5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Signal className="h-3 w-3 text-brand-400" />
                <span className="text-xs font-medium text-text-brand-primary">
                  Auto-detect best device
                </span>
              </div>
              <p className="text-[0.6rem] text-text-brand-muted mt-0.5 ml-[18px]">
                Recommends optimal device after analysis
              </p>
            </div>
          </button>

          {/* Separator */}
          <div className="h-px bg-surface-border mx-2" />

          {/* Standard devices */}
          {standardDevices.map((device) => (
            <DeviceDropdownItem
              key={device.id}
              device={device}
              isSelected={selectedDeviceId === device.id}
              onSelect={() => handleSelect(device.id)}
              distanceMeters={distanceMeters}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Device Dropdown Item
// ============================================

interface DeviceDropdownItemProps {
  device: DeviceSpec;
  isSelected: boolean;
  onSelect: () => void;
  distanceMeters: number | null;
}

const DeviceDropdownItem = React.memo(function DeviceDropdownItem({
  device,
  isSelected,
  onSelect,
  distanceMeters,
}: DeviceDropdownItemProps) {
  const compatibility = useMemo(() => {
    if (distanceMeters === null || distanceMeters <= 0) return null;
    return getDeviceCompatibility(device, distanceMeters);
  }, [device, distanceMeters]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-left',
        'hover:bg-surface-overlay transition-colors duration-150',
        isSelected && 'bg-brand-500/5',
      )}
      role="option"
      aria-selected={isSelected}
    >
      <div
        className={cn(
          'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          isSelected
            ? 'border-brand-500 bg-brand-500'
            : 'border-surface-border-light'
        )}
      >
        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-brand-primary truncate">
            {device.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cn(
              'text-[0.55rem] px-1 py-0.5 rounded font-bold',
              device.bandwidthMbps >= 10000
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/20 text-blue-400'
            )}
          >
            {device.bandwidth}
          </span>
          <span className="text-[0.55rem] text-text-brand-muted">
            {device.maxRangeKm} km
          </span>
          {compatibility && (
            <span
              className={cn(
                'text-[0.55rem] font-medium ml-auto flex-shrink-0',
                compatibility.isCompatible
                  ? 'text-emerald-400'
                  : 'text-red-400'
              )}
            >
              {compatibility.isCompatible ? 'In range' : 'Out of range'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

// ============================================
// Inline Device Status
// ============================================

interface DeviceInlineStatusProps {
  device: DeviceSpec;
  distanceMeters: number | null;
}

function DeviceInlineStatus({ device, distanceMeters }: DeviceInlineStatusProps) {
  const compatibility = useMemo(() => {
    if (distanceMeters === null || distanceMeters <= 0) return null;
    return getDeviceCompatibility(device, distanceMeters);
  }, [device, distanceMeters]);

  return (
    <div className="space-y-1">
      {/* Spec line */}
      <p className="text-[0.65rem] text-text-brand-muted">
        {device.bandwidth} • {device.maxRangeKm} km range
      </p>

      {/* Compatibility status */}
      {compatibility && (
        <div
          className={cn(
            'flex items-center gap-1.5 text-[0.65rem] font-medium',
            compatibility.isCompatible ? 'text-emerald-400' : 'text-amber-400'
          )}
        >
          {compatibility.isCompatible ? (
            <>
              <CheckCircle className="h-3 w-3 flex-shrink-0" />
              <span>In range</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>
                Out of range ({((distanceMeters! / 1000) - device.maxRangeKm).toFixed(1)} km over)
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ConfigSection({
  clearanceThreshold,
  onClearanceThresholdChange,
  selectedDeviceId,
  onSelectDevice,
  currentDistanceKm,
  disabled = false,
}: ConfigSectionProps) {
  const selectedDevice = useMemo(
    () => (selectedDeviceId ? getDeviceById(selectedDeviceId) : null),
    [selectedDeviceId]
  );

  const distanceMeters = useMemo(
    () =>
      currentDistanceKm != null && currentDistanceKm > 0
        ? currentDistanceKm * 1000
        : null,
    [currentDistanceKm]
  );

  const handleClearanceInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        onClearanceThresholdChange(val);
      }
    },
    [onClearanceThresholdChange]
  );

  const handleClearanceBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (isNaN(val) || val < 0) {
        onClearanceThresholdChange(0);
      } else if (val > 100) {
        onClearanceThresholdChange(100);
      }
    },
    [onClearanceThresholdChange]
  );

  return (
    <div data-tour="config-section" className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
      {/* Section label */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-text-brand-muted">
          Configure
        </span>
      </div>

      <div className="space-y-3">
        {/* Clearance Threshold */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label
              htmlFor="config-clearance"
              className="text-[0.7rem] font-medium text-text-brand-secondary"
            >
              Clearance Threshold
            </label>
            <InfoTooltip text={CLEARANCE_TOOLTIP} side="right" />
          </div>
          <div className="flex items-center gap-1.5">
            <input
              id="config-clearance"
              type="number"
              value={clearanceThreshold}
              onChange={handleClearanceInput}
              onBlur={handleClearanceBlur}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              className={cn(
                'flex-1 h-8 px-3 rounded-md text-[0.75rem] font-medium',
                'bg-surface-card border border-surface-border',
                'text-text-brand-primary',
                'focus:outline-none focus:ring-1 focus:ring-brand-500/50 focus:border-brand-500/40',
                'transition-colors duration-200',
                '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                disabled && 'opacity-50 cursor-not-allowed',
              )}
              aria-label="Clearance threshold in meters"
            />
            <span className="text-[0.7rem] text-text-brand-muted">m</span>
          </div>
        </div>

        {/* Device Selector */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-[0.7rem] font-medium text-text-brand-secondary">
              Device
            </label>
            <InfoTooltip text={DEVICE_TOOLTIP} side="right" />
          </div>
          <DeviceDropdown
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={onSelectDevice}
            currentDistanceKm={currentDistanceKm}
            disabled={disabled}
          />

          {/* Inline device status */}
          {selectedDevice && (
            <div className="mt-1.5 pl-0.5">
              <DeviceInlineStatus
                device={selectedDevice}
                distanceMeters={distanceMeters}
              />
            </div>
          )}

          {/* Auto-detect note when no device selected */}
          {!selectedDevice && currentDistanceKm && currentDistanceKm > 0 && (
            <p className="mt-1.5 text-[0.6rem] text-text-brand-muted pl-0.5">
              Best device will be recommended after analysis
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfigSection;