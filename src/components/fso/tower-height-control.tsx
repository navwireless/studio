
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
      return;
    }
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    onChange(newValue);
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Label htmlFor={`height-input-${idSuffix}`} className="text-xs uppercase tracking-wider text-slate-400/80"> 
          {label} (m)
        </Label>
        <span className="text-xs font-medium text-primary/90">{height}m</span> 
      </div>
      <div className="flex items-center space-x-1.5"> {/* Reduced space */}
        <Input
          id={`height-input-${idSuffix}`}
          type="number"
          value={height}
          onChange={handleInputChange}
          onBlur={(e) => { 
            let val = parseFloat(e.target.value);
            if (isNaN(val)) val = height; 
            if (val < min) val = min;
            if (val > max) val = max;
            onChange(val);
          }}
          min={min}
          max={max}
          step={step}
          className="w-16 bg-slate-800/50 border-slate-700 text-slate-100/90 text-xs h-7" /* Adjusted size & style */
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
