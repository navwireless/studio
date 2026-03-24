
"use client";

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Cable, HelpCircle, Ruler, Radio } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AnalysisSettingsProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
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
  isOpen, onClose,
  isFiberPathEnabled, onToggleFiberPath, snapRadius, onSnapRadiusChange,
  onApplySnapRadius, clearanceThreshold, onClearanceThresholdChange, isPending
}: AnalysisSettingsProps) {
  return (
    <TooltipProvider>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[60vh] pb-8">
          <SheetHeader className="pb-3">
            <SheetTitle className="text-base">Analysis Settings</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Adjust LOS clearance and fiber path parameters
            </SheetDescription>
          </SheetHeader>

          <div className="grid gap-5 py-2">
            {/* Clearance Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="fresnel-slider" className="text-sm font-medium">Required Clearance</Label>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <button type="button" className="p-0" aria-label="Clearance info">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs p-2">
                      <p>Minimum vertical clearance required above terrain for the line-of-sight path. Higher values provide better signal quality but may require taller towers.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-sm font-bold text-primary tabular-nums">{Math.round(clearanceThreshold)}m</span>
              </div>
              <Slider
                id="fresnel-slider"
                value={[clearanceThreshold]}
                onValueChange={onClearanceThresholdChange}
                max={100}
                step={1}
                disabled={isPending}
                className="py-1"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Fiber Path Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cable className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="fiber-path-toggle" className="text-sm font-medium cursor-pointer">
                    Calculate Fiber Path
                  </Label>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <button type="button" className="p-0" aria-label="Fiber path info">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs p-2">
                      <p>Estimates fiber optic cable path length using road networks. Requires LOS to be feasible first.</p>
                      <p className="mt-1">Auto-recalculates when toggled ON or when Snap Radius is changed.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id="fiber-path-toggle"
                  checked={isFiberPathEnabled}
                  onCheckedChange={onToggleFiberPath}
                  disabled={isPending}
                />
              </div>

              {/* Snap Radius */}
              {isFiberPathEnabled && (
                <div className="space-y-1.5 pl-6">
                  <div className="flex items-center gap-2">
                    <Radio className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label htmlFor="snap-radius" className="text-xs font-medium">Snap Radius (m)</Label>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <button type="button" className="p-0" aria-label="Snap radius info">
                          <HelpCircle className="h-3 w-3 text-muted-foreground/60 cursor-help" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs text-xs p-2">
                        <p>Maximum distance to search for the nearest road from each site. Increase this if sites are far from roads.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      id="snap-radius"
                      type="number"
                      value={snapRadius.toString()}
                      onChange={(e) => onSnapRadiusChange(e.target.value)}
                      className="h-8 flex-1"
                      disabled={isPending}
                      min={1}
                      max={10000}
                    />
                    <Button size="sm" onClick={onApplySnapRadius} disabled={isPending} className="h-8">
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
});
