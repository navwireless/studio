
"use client";

import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import type { AnalysisFormValues } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface FresnelSettingsBarProps {
  control: Control<AnalysisFormValues>;
  // Add other props like clientFormErrors, serverFormErrors if needed for validation display
}

export default function FresnelSettingsBar({ control }: FresnelSettingsBarProps) {
  return (
    <div className="bg-slate-800/60 backdrop-blur-sm p-2 border-b border-slate-700/50 print:hidden">
      <div className="max-w-xs mx-auto flex items-center space-x-3">
        <Settings className="h-5 w-5 text-primary/80 flex-shrink-0" />
        <div className="flex-grow">
          <Label htmlFor="globalClearanceThreshold" className="text-[0.7rem] uppercase tracking-wider text-slate-300/80 font-normal block mb-0.5">
            Min. Fresnel Clearance (m)
          </Label>
          <Controller
            name="clearanceThreshold"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <>
                <Input
                  id="globalClearanceThreshold"
                  type="number"
                  step="any"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder="e.g., 10"
                  className="bg-slate-700/50 border-slate-600/70 focus:border-primary/70 text-slate-100/90 h-8 text-sm px-2 py-1 rounded-md focus:ring-1 focus:ring-primary/70 w-full"
                />
                {error && <p className="text-xs text-destructive/90 mt-1">{error.message}</p>}
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
