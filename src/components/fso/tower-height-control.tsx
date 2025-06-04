
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface TowerHeightControlProps {
  label: string;
  height: number; // Value from React Hook Form (can be float from input, or NaN)
  onChange: (value: number) => void; // RHF's field.onChange
  min?: number;
  max?: number;
  step?: number; // Slider step, defaults to 1
  idSuffix: string;
}

const TowerHeightControl: React.FC<TowerHeightControlProps> = ({
  label,
  height, // This is field.value from RHF Controller
  onChange, // This is field.onChange from RHF Controller
  min = 0,
  max = 100,
  step = 1, // Default Slider step is 1, meaning integer values
  idSuffix,
}) => {

  // Value for the Slider's thumb position. Always an integer.
  // Derives from RHF's `height`. If `height` is not a finite number, defaults to `min`.
  const sliderValueForProp = Number.isFinite(height) ? Math.round(height) : min;
  const currentRoundedRhfHeight = Number.isFinite(height) ? Math.round(height) : min;


  // Handler for when the user finishes interacting with the slider
  const handleSliderValueCommit = (newSliderValues: number[]) => {
    const committedIntValue = Math.round(newSliderValues[0]);
    // Only call onChange if the committed integer value is different from the current rounded RHF height.
    if (currentRoundedRhfHeight !== committedIntValue) {
      onChange(committedIntValue);
    }
  };

  // Handler for direct input field changes
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (rawValue === "") {
      // If input is cleared, send NaN to RHF. Schema validation can handle if it's required.
      // Check if current RHF height is already effectively NaN (or represented by min) before calling onChange
      if (Number.isFinite(height)) { // Only change if it wasn't already NaN/defaulted
          onChange(NaN);
      }
      return;
    }
    const numValue = parseFloat(rawValue);
    // Send the parsed float (or NaN if parsing fails) to RHF.
    // This allows temporary float values in the form state from direct input.
    // Avoid calling onChange if numValue is the same as current height to prevent loops during typing
    if (height !== numValue) {
        onChange(numValue);
    }
  };

  // Handler for when the input field loses focus
  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    let numValue = parseFloat(event.target.value);
    let finalClampedIntValue: number;

    if (isNaN(numValue)) {
      finalClampedIntValue = min; // Default to min if input is invalid or empty on blur
    } else {
      // On blur, round to the nearest integer and clamp it.
      finalClampedIntValue = Math.max(min, Math.min(max, Math.round(numValue)));
    }
    
    // Only call onChange if the final clamped integer value is different from the current rounded RHF height.
    if (currentRoundedRhfHeight !== finalClampedIntValue) {
      onChange(finalClampedIntValue);
    } else if (!Number.isFinite(height) && finalClampedIntValue !== min) {
      // If original RHF height was NaN and now it's a valid number different from min default
      onChange(finalClampedIntValue);
    }
  };

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <Label htmlFor={`height-input-${idSuffix}`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal">
          {label} (m)
        </Label>
        {/* The text display always shows the rounded integer version of the height */}
        <span className="text-[0.7rem] font-medium text-primary/80">
          {Number.isFinite(height) ? Math.round(height) : min}m
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <Input
          id={`height-input-${idSuffix}`}
          type="number"
          // The input field shows the RHF height directly (can be float temporarily)
          // or an empty string if height is NaN (e.g., after clearing the input).
          value={Number.isFinite(height) ? height.toString() : ""}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={min}
          max={max}
          step="any" // Allow any decimal input, rounding happens on blur or slider interaction
          className="w-12 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 text-xs h-6 px-1 py-0.5 rounded-none focus:ring-0"
        />
        <Slider
          id={`height-slider-${idSuffix}`}
          value={[sliderValueForProp]} // Slider always receives a rounded integer value
          onValueCommit={handleSliderValueCommit} // Use onValueCommit
          min={min}
          max={max}
          step={step} // Slider step is 1
          className="flex-1"
          aria-labelledby={`label-${idSuffix}-height`}
        />
      </div>
    </div>
  );
};

export default TowerHeightControl;
