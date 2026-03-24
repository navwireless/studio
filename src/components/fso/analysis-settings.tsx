
"use client";

import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Settings, Cable, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AnalysisSettingsProps {
  isFiberPathEnabled: boolean;
  onToggleFiberPath: (enabled: boolean) => void;
  snapRadius: number;
  onSnapRadiusChange: (value: string) => void;
  onApplySnapRadius: () => void;
  clearanceThreshold: number;
  onClearanceThresholdChange: (value: number[]) => void;
  isPending: boolean;
}

export const AnalysisSettings = React.memo(function AnalysisSettings({
  isFiberPathEnabled, onToggleFiberPath, snapRadius, onSnapRadiusChange,
  onApplySnapRadius, clearanceThreshold, onClearanceThresholdChange, isPending
}: AnalysisSettingsProps) {
  return (
    <TooltipProvider>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 left-4 z-10 h-10 w-10 rounded-full shadow-lg"
          aria-label="Analysis Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)]" side="top" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Analysis Parameters</h4>
            <p className="text-sm text-muted-foreground">
              Adjust LOS and Fiber Path settings.
            </p>
          </div>
          <div className="grid gap-4">
            {/* Fresnel Zone Clearance */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <Label htmlFor="fresnel-slider">Required Clearance (m)</Label>
                    <span className="text-sm font-medium text-primary">{Math.round(clearanceThreshold)}m</span>
                </div>
                <Slider
                    id="fresnel-slider"
                    value={[clearanceThreshold]}
                    onValueChange={onClearanceThresholdChange}
                    max={100}
                    step={1}
                    disabled={isPending}
                />
            </div>
            {/* Fiber Path Toggle */}
            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="fiber-path-toggle-popover" className="flex items-center gap-2 cursor-pointer">
                    <Cable className="h-4 w-4" />
                    <span>Calculate Fiber Path</span>
                </Label>
                 <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0 m-0" onClick={(e) => e.preventDefault()} aria-label="Fiber path calculation info">
                           <HelpCircle className="h-4 w-4 text-muted-foreground/70 cursor-help" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs p-2 bg-popover text-popover-foreground border border-border shadow-lg">
                      <p>Calculates estimated fiber optic cable path length using road networks. Requires Line-of-Sight (LOS) to be feasible.</p>
                      <p className="mt-1">Automatically re-calculates if this is toggled ON, or if Snap Radius is Applied while this is ON.</p>
                  </TooltipContent>
              </Tooltip>
                <Switch
                    id="fiber-path-toggle-popover"
                    checked={isFiberPathEnabled}
                    onCheckedChange={onToggleFiberPath}
                    disabled={isPending}
                />
            </div>
            {/* Snap Radius Input */}
            {isFiberPathEnabled && (
              <div className="space-y-1">
                <Label htmlFor="snap-radius">Snap Radius (m)</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="snap-radius"
                        type="number"
                        value={snapRadius.toString()} // Use string for input value
                        onChange={(e) => onSnapRadiusChange(e.target.value)}
                        className="h-8"
                        disabled={isPending}
                        min={1}
                        max={10000}
                    />
                    <Button size="sm" onClick={onApplySnapRadius} disabled={isPending}>Apply</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
    </TooltipProvider>
  );
});
