
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
  min = 0, // Default min as per previous implementation
  max = 100, // Default max as per previous implementation
  step = 1,
  idSuffix,
}) => {
  const handleSliderChange = (value: number[]) => {
    onChange(value[0]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(event.target.value);
    if (isNaN(newValue)) {
      // If input is not a number, don't change, or reset to min/current. For now, retain current.
      // Potentially set to min or max if out of bounds on blur.
      return;
    }
    // Clamp value only on change if needed, or let validation handle it.
    // For direct feedback, clamping here is fine.
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    onChange(newValue);
  };

  return (
    <div className="space-y-1"> {/* Reduced spacing */}
      <div className="flex justify-between items-center">
        <Label htmlFor={`height-input-${idSuffix}`} className="text-xs"> {/* Label font size */}
          {label} (m)
        </Label>
        <span className="text-xs font-medium text-primary">{height}m</span> {/* Value font size */}
      </div>
      <div className="flex items-center space-x-2">
        <Input
          id={`height-input-${idSuffix}`}
          type="number"
          value={height}
          onChange={handleInputChange}
          onBlur={(e) => { // Ensure value is clamped on blur
            let val = parseFloat(e.target.value);
            if (isNaN(val)) val = height; // Revert to old if invalid
            if (val < min) val = min;
            if (val > max) val = max;
            onChange(val);
          }}
          min={min}
          max={max}
          step={step}
          className="w-16 bg-input/70 text-xs h-8" /* Adjusted size */
        />
        <Slider
          id={`height-slider-${idSuffix}`}
          value={[height]}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          className="flex-1"
          aria-labelledby={`label-${idSuffix}-height`}
        />
      </div>
    </div>
  );
};

export default TowerHeightControl;

    