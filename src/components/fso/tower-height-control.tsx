
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
  // Local state for the input field's string value for responsive typing
  const [inputValue, setInputValue] = React.useState<string>(
    Number.isFinite(height) ? Math.round(height).toString() : ""
  );

  // Effect to synchronize local inputValue when the RHF height prop changes externally
  React.useEffect(() => {
    const currentRHFHeightRounded = Number.isFinite(height) ? Math.round(height) : min;
    if (inputValue !== currentRHFHeightRounded.toString() && parseFloat(inputValue) !== currentRHFHeightRounded) {
         setInputValue(currentRHFHeightRounded.toString());
    }
  }, [height, min]);


  // Handler for when the user finishes interacting with the slider
  const handleSliderValueCommit = (newSliderValues: number[]) => {
    const committedIntValue = Math.round(newSliderValues[0]);
    const currentRhfIntValue = Number.isFinite(height) ? Math.round(height) : min;

    if (currentRhfIntValue !== committedIntValue) {
      onChange(committedIntValue); // Update RHF
      // No need to setInputValue here if useEffect handles it, but can be explicit:
      // setInputValue(committedIntValue.toString());
    }
  };

  // Handler for direct input field changes - updates local state only
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Handler for when the input field loses focus - commit to RHF
  const handleInputBlur = () => {
    let numValue = parseFloat(inputValue);
    let finalClampedIntValue: number;

    if (isNaN(numValue)) {
      finalClampedIntValue = min; // Default to min if input is invalid or empty on blur
    } else {
      finalClampedIntValue = Math.max(min, Math.min(max, Math.round(numValue)));
    }
    
    // Update local input to reflect clamped and rounded value
    // This will also be caught by useEffect if RHF was already at this value,
    // but good to keep input consistent.
    setInputValue(finalClampedIntValue.toString()); 

    const currentRhfIntValue = Number.isFinite(height) ? Math.round(height) : min;
    if (currentRhfIntValue !== finalClampedIntValue) {
      onChange(finalClampedIntValue); // Update RHF
    }
  };
  
  // Value for the Slider's thumb position. Always an integer from RHF.
  const sliderValueForDisplay = Number.isFinite(height) ? Math.round(height) : min;
  // Text display always shows the rounded integer version of the RHF height.
  const textDisplayHeight = sliderValueForDisplay;


  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <Label htmlFor={`height-input-${idSuffix}`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal">
          {label} (m)
        </Label>
        <span className="text-[0.7rem] font-medium text-primary/80">
          {textDisplayHeight}m
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <Input
          id={`height-input-${idSuffix}`}
          type="number" // Keeps browser native number input behavior (arrows, etc.)
          value={inputValue} // Controlled by local inputValue state
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={min} // For browser validation hints
          max={max} // For browser validation hints
          step="any" // Allows decimal typing
          className="w-12 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 text-xs h-6 px-1 py-0.5 rounded-none focus:ring-0"
        />
        <Slider
          id={`height-slider-${idSuffix}`}
          value={[sliderValueForDisplay]} // Slider always receives a rounded integer value from RHF
          onValueCommit={handleSliderValueCommit}
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
