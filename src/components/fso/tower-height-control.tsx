
"use client";

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface TowerHeightControlProps {
  label: string;
  height: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  idSuffix: string;
}

const TowerHeightControl: React.FC<TowerHeightControlProps> = ({
  label,
  height,
  onChange,
  min = 0, 
  max = 100, 
  step = 1, // Changed step to 1 for integer values
  idSuffix,
}) => {
  const handleSliderChange = (value: number[]) => {
    onChange(Math.round(value[0])); // Ensure slider output is rounded
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (rawValue === "") {
        // Allow temporarily empty input, parent form validation will handle empty required field.
        // Or, set to min if that's preferred on empty.
        // For now, let parent validation catch it if empty is not allowed by schema.
        // If schema expects a number, this needs to be handled carefully.
        // onChange(min); // Or don't call onChange if empty string is typed.
        // Let's try to pass NaN or a placeholder that indicates "empty" if possible
        // For now, simplest is to revert to min or let validation handle.
        // For controlled number input, it's tricky. Let's pass parseFloat which becomes NaN.
        onChange(parseFloat(rawValue)); // This might become NaN
        return;
    }
    let newValue = parseFloat(rawValue);
    if (!isNaN(newValue)) {
        onChange(newValue); // Pass the float, rounding is done on blur or by chart.
    }
  };

  const validateAndSetHeight = (event: React.FocusEvent<HTMLInputElement>) => {
    let numValue = parseFloat(event.target.value);
    if (isNaN(numValue)) {
      numValue = min; // default to min if invalid or empty on blur
    }
    numValue = Math.round(numValue); // Round on blur
    if (numValue < min) numValue = min;
    if (numValue > max) numValue = max;
    onChange(numValue);
  }


  return (
    <div className="space-y-0.5"> 
      <div className="flex justify-between items-center">
        <Label htmlFor={`height-input-${idSuffix}`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal"> 
          {label} (m)
        </Label>
        <span className="text-[0.7rem] font-medium text-primary/80">{Number.isFinite(height) ? Math.round(height) : min}m</span> {/* Display rounded height or min if NaN */}
      </div>
      <div className="flex items-center space-x-1"> 
        <Input
          id={`height-input-${idSuffix}`}
          type="number"
          value={Number.isFinite(height) ? height.toString() : ""} // Show empty for NaN, or current value
          onChange={handleInputChange}
          onBlur={validateAndSetHeight}
          min={min}
          max={max}
          step={step} // Input step can be 1
          className="w-12 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 text-xs h-6 px-1 py-0.5 rounded-none focus:ring-0"
        />
        <Slider
          id={`height-slider-${idSuffix}`}
          value={[Number.isFinite(height) ? height : min]} // Slider needs a valid number
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step} // Slider step 1
          className="flex-1"
          aria-labelledby={`label-${idSuffix}-height`}
        />
      </div>
    </div>
  );
};

export default TowerHeightControl;
