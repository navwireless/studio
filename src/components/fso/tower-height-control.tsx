
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
      newValue = min; // Or some other default/error handling
    }
    if (newValue < min) newValue = min;
    if (newValue > max) newValue = max;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={`height-input-${idSuffix}`} className="text-sm">
          {label} (m)
        </Label>
        <span className="text-sm font-medium text-primary">{height}m</span>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          id={`height-input-${idSuffix}`}
          type="number"
          value={height}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          className="w-20 bg-input/70 text-sm h-9"
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
