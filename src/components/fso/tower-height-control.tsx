// src/components/fso/tower-height-control.tsx
"use client";

import React, { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ============================================
// Props
// ============================================

interface TowerHeightControlProps {
  /** Label displayed above the control */
  label: string;
  /** Current tower height in meters */
  height: number;
  /** Callback when height changes */
  onChange: (value: number) => void;
  /** Minimum allowed height (default: 0) */
  min?: number;
  /** Maximum allowed height (default: 100) */
  max?: number;
  /** Step increment (default: 1) */
  step?: number;
  /** Unique suffix for input/slider IDs */
  idSuffix: string;
}

// ============================================
// Preset Buttons
// ============================================

const PRESETS = [10, 20, 30, 50, 100] as const;

interface PresetButtonProps {
  value: number;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const PresetButton = React.memo(function PresetButton({
  value,
  isActive,
  onClick,
  disabled,
}: PresetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Set tower height to ${value} meters`}
      className={cn(
        'px-2 py-1 rounded-md text-[0.6rem] font-semibold transition-all touch-manipulation',
        isActive
          ? 'bg-primary/20 text-primary border border-primary/30'
          : 'bg-slate-800/40 text-muted-foreground/70 border border-slate-700/20 hover:bg-slate-700/40 hover:text-slate-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {value}m
    </button>
  );
});

// ============================================
// Main Component
// ============================================

/**
 * Tower height input control with slider, text input, and quick preset buttons.
 * Presets allow one-tap selection of common tower heights (10m, 20m, 30m, 50m, 100m).
 *
 * @param props - TowerHeightControlProps
 * @returns Tower height control with slider, input, and presets
 */
const TowerHeightControl: React.FC<TowerHeightControlProps> = React.memo(({
  label,
  height,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  idSuffix,
}) => {
  const safeHeight = Number.isFinite(height) ? height : min;
  const roundedDisplay = Math.round(safeHeight);

  const handleSliderChange = useCallback(
    (value: number[]) => {
      onChange(Math.round(value[0]));
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = event.target.value;
      if (rawValue === '') {
        onChange(parseFloat(rawValue)); // NaN — let blur fix it
        return;
      }
      const newValue = parseFloat(rawValue);
      if (!isNaN(newValue)) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handleInputBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      let numValue = parseFloat(event.target.value);
      if (isNaN(numValue)) {
        numValue = min;
      }
      numValue = Math.round(numValue);
      if (numValue < min) numValue = min;
      if (numValue > max) numValue = max;
      onChange(numValue);
    },
    [onChange, min, max]
  );

  const handlePresetClick = useCallback(
    (presetValue: number) => {
      onChange(presetValue);
    },
    [onChange]
  );

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Label
          htmlFor={`height-input-${idSuffix}`}
          className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal"
        >
          {label} (m)
        </Label>
        <span className="text-[0.7rem] font-medium text-primary/80">
          {roundedDisplay}m
        </span>
      </div>

      {/* Slider + Input row */}
      <div className="flex items-center space-x-1">
        <Input
          id={`height-input-${idSuffix}`}
          type="number"
          value={Number.isFinite(height) ? height.toString() : ''}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={min}
          max={max}
          step={step}
          className="w-12 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 text-xs h-6 px-1 py-0.5 rounded-none focus:ring-0"
        />
        <Slider
          id={`height-slider-${idSuffix}`}
          value={[safeHeight]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="flex-1"
          aria-label={`${label} in meters`}
        />
      </div>

      {/* Preset buttons */}
      <div className="flex items-center gap-1 pt-0.5">
        {PRESETS.map((preset) => (
          <PresetButton
            key={preset}
            value={preset}
            isActive={roundedDisplay === preset}
            onClick={() => handlePresetClick(preset)}
            disabled={preset > max}
          />
        ))}
      </div>
    </div>
  );
});

TowerHeightControl.displayName = 'TowerHeightControl';
export default TowerHeightControl;