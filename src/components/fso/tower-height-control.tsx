
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
  step = 1,
  idSuffix,
}) => {
  const handleSliderChange = (value: number[]) => {
    onChange(value[0]);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseFloat(event.target.value);
    if (isNaN(newValue)) {
      // Allow empty input for clearing, but don't change if invalid
      if (event.target.value === "") {
         onChange(min); // Or some default, or just don't call onChange
         return;
      }
      return; 
    }
    // No immediate clamping here, let react-hook-form validation handle it on blur/submit
    // if (newValue < min) newValue = min;
    // if (newValue > max) newValue = max;
    onChange(newValue);
  };

  const validateAndSetHeight = (value: string) => {
    let numValue = parseFloat(value);
    if (isNaN(numValue)) {
      numValue = min; // default to min if invalid
    }
    if (numValue < min) numValue = min;
    if (numValue > max) numValue = max;
    onChange(numValue);
  }


  return (
    <div className="space-y-0.5"> {/* Reduced space */}
      <div className="flex justify-between items-center">
        <Label htmlFor={`height-input-${idSuffix}`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal"> 
          {label} (m)
        </Label>
        <span className="text-[0.7rem] font-medium text-primary/80">{height}m</span> 
      </div>
      <div className="flex items-center space-x-1"> {/* Reduced space */}
        <Input
          id={`height-input-${idSuffix}`}
          type="number"
          value={height} // Keep it controlled
          onChange={handleInputChange}
          onBlur={(e) => validateAndSetHeight(e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-12 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 text-xs h-6 px-1 py-0.5 rounded-none focus:ring-0"
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
