
"use client";

// Ensure all UI components are explicitly imported to avoid ReferenceError
import React from 'react';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Target, Cable, HelpCircle } from 'lucide-react';
import type { BulkAnalysisFormValues } from '@/app/bulk-los-analyzer/page';
import { Separator } from '@/components/ui/separator';
import { Button } from "@/components/ui/button"; // Import Button component

interface BulkAnalysisParametersProps {
  control: Control<BulkAnalysisFormValues>;
  register: UseFormRegister<BulkAnalysisFormValues>;
  errors: FieldErrors<BulkAnalysisFormValues>;
  calculateFiberPathBulkEnabled: boolean;
  onToggleFiberPathBulk: (checked: boolean) => void;
  fiberRadiusMetersBulk: number;
  onFiberRadiusMetersBulkChange: (value: string) => void;
}

const BulkAnalysisParameters: React.FC<BulkAnalysisParametersProps> = ({ 
  control, 
  register, 
  errors,
  calculateFiberPathBulkEnabled,
  onToggleFiberPathBulk,
  fiberRadiusMetersBulk,
  onFiberRadiusMetersBulkChange
}) => {

  const handleFiberRadiusInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiberRadiusMetersBulkChange(event.target.value);
  };

  return (
    <TooltipProvider>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Target className="mr-2 h-5 w-5 text-primary" />
            Analysis Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="globalTowerHeight">Global Tower Height (meters)</Label>
            <Input 
              id="globalTowerHeight" 
              type="number" 
              {...register("globalTowerHeight")} 
              className="mt-1 bg-input/70" 
              placeholder="e.g., 20"
            />
            {errors.globalTowerHeight && <p className="text-destructive text-sm mt-1">{errors.globalTowerHeight.message}</p>}
          </div>
          <div>
            <Label htmlFor="globalFresnelHeight">Global Fresnel/Clearance Height (meters)</Label>
            <Input 
              id="globalFresnelHeight" 
              type="number" 
              {...register("globalFresnelHeight")} 
              className="mt-1 bg-input/70"
              placeholder="e.g., 10"
            />
            {errors.globalFresnelHeight && <p className="text-destructive text-sm mt-1">{errors.globalFresnelHeight.message}</p>}
          </div>
          <div>
            <Label htmlFor="losCheckRadiusKm">LOS Check Radius (kilometers)</Label>
            <Input 
              id="losCheckRadiusKm" 
              type="number" 
              step="0.1" 
              {...register("losCheckRadiusKm")} 
              className="mt-1 bg-input/70"
              placeholder="e.g., 10"
            />
            {errors.losCheckRadiusKm && <p className="text-destructive text-sm mt-1">{errors.losCheckRadiusKm.message}</p>}
          </div>

          <Separator className="my-6" />

          <div>
             <CardTitle className="text-base flex items-center mb-3">
                <Cable className="mr-2 h-5 w-5 text-primary/80" />
                Fiber Path Settings
            </CardTitle>
            <div className="flex items-center justify-between space-x-2 mb-4">
                <div className="flex items-center space-x-2">
                    <Switch
                        id="fiber-path-toggle-bulk"
                        checked={calculateFiberPathBulkEnabled}
                        onCheckedChange={onToggleFiberPathBulk}
                    />
                    <Label htmlFor="fiber-path-toggle-bulk" className="text-sm cursor-pointer">
                        Calculate Fiber Path for Feasible Links
                    </Label>
                </div>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0 m-0" onClick={(e) => e.preventDefault()} aria-label="Fiber path calculation info for bulk analysis">
                            <HelpCircle className="h-4 w-4 text-muted-foreground/70 cursor-help" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs p-2 bg-popover text-popover-foreground border border-border shadow-lg">
                        <p>If enabled, calculates estimated fiber optic cable path length using road networks for links where Line-of-Sight is feasible.</p>
                        <p className="mt-1">Requires the "Google Directions API" key to be configured on the server.</p>
                        <p className="mt-1">The Snap Radius determines how far from a site the tool will search for a road.</p>
                    </TooltipContent>
                </Tooltip>
            </div>

            {calculateFiberPathBulkEnabled && (
                <div>
                    <Label htmlFor="fiberRadiusMetersBulk">Fiber Snap Radius (meters)</Label>
                    <Input 
                        id="fiberRadiusMetersBulk" 
                        type="number" 
                        value={fiberRadiusMetersBulk.toString()}
                        onChange={handleFiberRadiusInputChange}
                        min={0}
                        step={50}
                        className="mt-1 bg-input/70"
                        placeholder="e.g., 500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max distance from a site to snap to a road. (e.g., 500 for 500m)</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default BulkAnalysisParameters;
