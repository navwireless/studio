
"use client";

import type { Control, UseFormRegister, UseFormHandleSubmit, UseFormGetValues, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import type { AnalysisResult, AnalysisFormValues } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TowerHeightControl from './tower-height-control';
import CustomProfileChart from './custom-profile-chart';
import { Target, Settings, Loader2, AlertTriangle, X, Download, Cable, Router, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'; // Added ChevronDown, ChevronUp
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveAs } from 'file-saver';
import { generateSingleAnalysisPdfReportAction } from '@/app/actions';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface SiteInputGroupProps {
  id: 'pointA' | 'pointB';
  title: string;
  control: Control<AnalysisFormValues>;
  register: UseFormRegister<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: any, serverError?: string[]) => string | undefined;
}

const SiteInputGroup: React.FC<SiteInputGroupProps> = ({
  id,
  title,
  control,
  register,
  clientFormErrors,
  serverFormErrors,
  getCombinedError,
}) => (
  <Card className="bg-transparent backdrop-blur-2px shadow-none border-0 h-full flex flex-col p-1 md:p-2 w-full">
    <CardHeader className="p-1">
      <CardTitle className="text-xs flex items-center text-slate-100/90 uppercase tracking-wider font-medium">
        <Target className="mr-1.5 h-3.5 w-3.5 text-primary/70" /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-1 space-y-1.5 text-xs flex-grow overflow-y-auto pr-1 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div>
          <Label htmlFor={`${id}.name`} className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal">Name</Label>
          <Input
            id={`${id}.name`}
            {...register(`${id}.name`)}
            placeholder="e.g. Main Site"
            className="mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
          />
          {(clientFormErrors[id]?.name || serverFormErrors?.[`${id}.name`]) &&
            <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.name, serverFormErrors?.[`${id}.name`])}</p>}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <Label htmlFor={`${id}.lat`} className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal">Latitude</Label>
            <Input
              id={`${id}.lat`}
              {...register(`${id}.lat`)}
              placeholder="-90 to 90"
              className="mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
            />
            {(clientFormErrors[id]?.lat || serverFormErrors?.[`${id}.lat`]) &&
              <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.lat, serverFormErrors?.[`${id}.lat`])}</p>}
          </div>
          <div>
            <Label htmlFor={`${id}.lng`} className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal">Longitude</Label>
            <Input
              id={`${id}.lng`}
              {...register(`${id}.lng`)}
              placeholder="-180 to 180"
              className="mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
            />
            {(clientFormErrors[id]?.lng || serverFormErrors?.[`${id}.lng`]) &&
              <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.lng, serverFormErrors?.[`${id}.lng`])}</p>}
          </div>
        </div>
        <Controller
          name={`${id}.height`}
          control={control}
          defaultValue={20}
          render={({ field }) => (
            <TowerHeightControl
              label="Tower Height"
              height={field.value}
              onChange={field.onChange}
              min={0}
              max={100}
              idSuffix={id}
            />
          )}
        />
        {(clientFormErrors[id]?.height || serverFormErrors?.[`${id}.height`]) &&
          <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.height, serverFormErrors?.[`${id}.height`])}</p>}
      </div>
    </CardContent>
  </Card>
);

interface ProfilePanelMiddleColumnProps {
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  isActionPending: boolean; // LOS analysis pending
  control: Control<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: any, serverError?: string[]) => string | undefined;
  handleSubmit: UseFormHandleSubmit<AnalysisFormValues>;
  processSubmit: (data: AnalysisFormValues) => void;
  pointAName: string;
  pointBName: string;
  onTowerHeightChangeFromGraph: (siteId: 'pointA' | 'pointB', newHeight: number) => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  // Fiber Path Props
  calculateFiberPathEnabled: boolean;
  onToggleFiberPath: (checked: boolean) => void;
  fiberRadiusMeters: number;
  onFiberRadiusChange: (value: string) => void; // string due to input type
  fiberPathResult: FiberPathResult | null;
  isFiberCalculating: boolean;
  fiberPathError: string | null;
}

const ProfilePanelMiddleColumn: React.FC<ProfilePanelMiddleColumnProps> = ({
  analysisResult,
  isStale,
  isActionPending,
  control,
  clientFormErrors,
  serverFormErrors,
  getCombinedError,
  handleSubmit,
  processSubmit,
  pointAName,
  pointBName,
  onTowerHeightChangeFromGraph,
  onDownloadPdf,
  isGeneratingPdf,
  // Fiber Path Props
  calculateFiberPathEnabled,
  onToggleFiberPath,
  fiberRadiusMeters,
  onFiberRadiusChange,
  fiberPathResult,
  isFiberCalculating,
  fiberPathError,
}) => {
  const watchedClearanceThresholdString = useWatch({ control, name: 'clearanceThreshold', defaultValue: "10" });
  const minRequiredClearance = parseFloat(watchedClearanceThresholdString);

  let isClearBasedOnAnalysis = false;
  let deficit = 0;
  let actualMinClearance = analysisResult?.minClearance ?? null;

  if (analysisResult && analysisResult.minClearance !== null && !isNaN(minRequiredClearance)) {
    isClearBasedOnAnalysis = analysisResult.minClearance >= minRequiredClearance;
    deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(minRequiredClearance - analysisResult.minClearance);
  }

  const chartKey = React.useMemo(() => {
    if (!analysisResult) return 'no-result';
    const profileDataSignature = analysisResult.profile.length > 0
      ? `${analysisResult.profile[0].distance}-${analysisResult.profile[0].terrainElevation}-${analysisResult.profile[0].losHeight}-${analysisResult.profile[analysisResult.profile.length-1].distance}-${analysisResult.profile[analysisResult.profile.length-1].terrainElevation}-${analysisResult.profile[analysisResult.profile.length-1].losHeight}`
      : 'empty-profile';
    return `${analysisResult.distanceKm}-${analysisResult.pointA?.towerHeight}-${analysisResult.pointB?.towerHeight}-${profileDataSignature}-${minRequiredClearance}`;
  }, [analysisResult, minRequiredClearance]);

  const buttonText = isActionPending
    ? "Analyzing..."
    : (isStale || !analysisResult ? "Analyze Link" : "Re-Analyze");

  const handleFiberRadiusInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiberRadiusChange(event.target.value);
  };

  return (
    <TooltipProvider>
    {/* Root div: REMOVED overflow-y-auto, space-y-*, and p-1 */}
    <div className="w-full flex flex-col h-full bg-transparent backdrop-blur-2px rounded-lg">

      {/* Top Controls Section (will take ~20% height based on its content, or we can be more explicit if needed) */}
      <div className="flex-none p-2 space-y-1"> {/* MODIFIED: Removed overflow, custom-scrollbar, changed space-y-2 to space-y-1 */}
        {/* Section 1: Main Status & Actions */}
        <div className="space-y-1.5">
          {/* LOS Status Display - Copied and adapted from previous card structure */}
          {isStale ? (
            <div className="px-2 py-1 rounded-md text-xs font-semibold bg-yellow-500/80 text-yellow-900 flex items-center justify-center shadow">
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" /> NEEDS RE-ANALYZE
            </div>
          ) : analysisResult ? (
            <div
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold shadow-md text-center",
                isClearBasedOnAnalysis
                  ? "bg-los-success text-los-success-foreground"
                  : "bg-los-failure text-los-failure-foreground"
              )}
            >
              {isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"}
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground italic text-center">
              Perform analysis
            </div>
          )}

          {/* Key Metrics - more compact */}
          {analysisResult && !isStale && (
            <div className="flex justify-around items-center text-xs pt-0.5">
              <div className="text-center">
                <span className="block uppercase tracking-wider text-muted-foreground text-[0.6rem] font-medium">Aerial Dist.</span>
                <span className="block font-bold text-foreground text-[0.7rem]">
                  {analysisResult.distanceKm < 1
                    ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m`
                    : `${analysisResult.distanceKm.toFixed(1)}km`}
                </span>
              </div>
              <div className="text-center">
                <span className="block uppercase tracking-wider text-muted-foreground text-[0.6rem] font-medium">Min. Clear.</span>
                <span className={cn(
                  "block font-bold text-[0.7rem]",
                  actualMinClearance !== null && actualMinClearance >= (minRequiredClearance || 0) ? "text-los-success" : "text-los-failure"
                )}>
                  {actualMinClearance !== null ? actualMinClearance.toFixed(1) + "m" : "N/A"}
                </span>
              </div>
            </div>
          )}

          {/* Deficit Message (if applicable) */}
          {analysisResult && !isClearBasedOnAnalysis && actualMinClearance !== null && !isNaN(minRequiredClearance) && !isStale && (
            <div className="text-center text-los-failure text-[0.65rem] py-0.5">
              Add&nbsp;<span className="font-semibold">{deficit.toFixed(0)}m</span>&nbsp;to tower(s) for clearance.
            </div>
          )}

          {/* Action Buttons - more compact */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <Button
              type="submit"
              onClick={handleSubmit(processSubmit)}
              disabled={isActionPending || isGeneratingPdf || isFiberCalculating}
              size="sm" // Keep sm, but it will be tight. Consider "xs" if available and appropriate.
              className="bg-primary/90 hover:bg-primary text-primary-foreground text-[0.7rem] font-semibold px-2.5 py-1 h-auto min-h-7 rounded shadow-none transition-all duration-200 whitespace-nowrap leading-tight flex-grow sm:flex-grow-0"
            >
              <Loader2 className={cn("mr-1 h-3 w-3", !isActionPending && "hidden", isActionPending && "animate-spin" )} />
              {buttonText}
            </Button>
            {analysisResult && !isStale && (
              <Button
                type="button"
                onClick={onDownloadPdf}
                disabled={isActionPending || isGeneratingPdf || !analysisResult || isStale || isFiberCalculating}
                size="sm" // Keep sm
                variant="outline"
                className="text-[0.7rem] font-semibold px-2.5 py-1 h-auto min-h-7 rounded shadow-none transition-all duration-200 whitespace-nowrap leading-tight border-primary/50 hover:bg-primary/10 flex-grow sm:flex-grow-0"
              >
                <Loader2 className={cn("mr-1 h-3 w-3", !isGeneratingPdf && "hidden", isGeneratingPdf && "animate-spin" )} />
                <Download className={cn("mr-1 h-3 w-3", isGeneratingPdf && "hidden")} />
                PDF
              </Button>
            )}
          </div>
        </div>

        {/* Divider (optional, for visual separation) */}
        <hr className="border-border/50 my-1" />

        {/* Section 2: Link Parameters */}
        <div className="space-y-1">
          <div className="flex items-center justify-between space-x-1">
            <Label htmlFor="clearanceThresholdProfileCompact" className="text-[0.65rem] text-muted-foreground whitespace-nowrap shrink-0">Req. Fresnel (m):</Label>
            <Controller
              name="clearanceThreshold"
              control={control}
              render={({ field }) => (
                <Input
                  id="clearanceThresholdProfileCompact"
                  type="number"
                  step="any"
                  {...field}
                  className="bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-16 text-center" // w-16 from before
                />
              )}
            />
          </div>
          {(clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) &&
            <p className="text-xs text-destructive/90 mt-0.5 text-right"> {/* Adjusted to text-right for better alignment with input */}
              {getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)}
            </p>
          }
        </div>

        {/* Divider (optional) */}
        <hr className="border-border/50 my-1" />

        {/* Section 3: Fiber Optic Path */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5"> {/* Reduced space-x-2 to space-x-1.5 */}
              <Switch
                id="fiber-path-toggle-compact" // New ID for compact version
                checked={calculateFiberPathEnabled}
                onCheckedChange={onToggleFiberPath}
                disabled={isActionPending}
                className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3.5" // Custom scale for Switch
              />
              <Label htmlFor="fiber-path-toggle-compact" className="text-xs text-muted-foreground flex items-center">
                <Cable className="mr-1 h-3.5 w-3.5" /> Fiber Path
              </Label>
            </div>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-4 w-4 p-0 m-0" onClick={(e) => e.preventDefault()} aria-label="Fiber path calculation info">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs p-2 bg-popover text-popover-foreground border border-border shadow-lg">
                <p>Calculates estimated fiber optic cable path length using road networks within a specified radius from each site. Requires Line-of-Sight (LOS) to be feasible. Results include offsets from sites to roads and the road route distance.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {calculateFiberPathEnabled && (
            <div className="flex items-center justify-between space-x-1 pl-1"> {/* Added pl-1 to align with switch indent */}
              <Label htmlFor="fiber-radius-input-compact" className="text-[0.65rem] text-muted-foreground whitespace-nowrap shrink-0">Snap Radius (m):</Label>
              <Input
                id="fiber-radius-input-compact"
                type="number"
                value={fiberRadiusMeters.toString()}
                onChange={handleFiberRadiusInputChange} // Ensure this prop is passed correctly
                min={0}
                step={50}
                className="bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-16 text-center" // w-16 from before
                disabled={isActionPending || isFiberCalculating}
              />
            </div>
          )}

          {/* Fiber Path Results/Status/Error - Copied and adapted */}
          {isFiberCalculating && (
            <div className="text-xs text-primary flex items-center justify-center py-0.5">
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Calculating...
            </div>
          )}
          {fiberPathResult && !isFiberCalculating && (
            <div className="text-[0.7rem] p-1 rounded-md bg-muted/30 space-y-0.5"> {/* MODIFIED: rounded-sm to rounded-md */}
              <p>
                <span className="font-semibold">Fiber Status:</span>{' '}
                <span className={cn(
                  fiberPathResult.status === 'success' ? 'text-los-success' :
                  (fiberPathResult.status === 'los_not_feasible' || fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'no_route_between_roads' || fiberPathResult.status === 'radius_too_small') ? 'text-amber-500' :
                  'text-los-failure'
                )}>
                  {fiberPathResult.status === 'success' ? 'Calculated' :
                   fiberPathResult.status === 'los_not_feasible' ? 'LOS N/A' : // Shorter text
                   fiberPathResult.status === 'no_road_for_a' ? 'No Road (A)' :
                   fiberPathResult.status === 'no_road_for_b' ? 'No Road (B)' :
                   fiberPathResult.status === 'no_route_between_roads' ? 'No Route' :
                   fiberPathResult.status === 'radius_too_small' ? 'Small Radius' :
                   'Error'}
                </span>
              </p>
              {fiberPathResult.totalDistanceMeters !== undefined && fiberPathResult.status === 'success' && (
                <p><span className="font-semibold">Total Fiber Dist:</span> {fiberPathResult.totalDistanceMeters.toFixed(0)} m</p>
              )}
              {fiberPathError && <p className="text-destructive/90">{fiberPathError}</p>}
              {fiberPathResult.errorMessage && fiberPathResult.status !== 'success' && !fiberPathError && (
                  <p className="text-muted-foreground/80 italic">{fiberPathResult.errorMessage}</p>
              )}
              {fiberPathResult.status === 'success' && (
                  <div className="text-[0.6rem] text-muted-foreground/70">
                     (A: {fiberPathResult.offsetDistanceA_meters?.toFixed(0)}m
                     + R: {fiberPathResult.roadRouteDistanceMeters?.toFixed(0)}m
                     + B: {fiberPathResult.offsetDistanceB_meters?.toFixed(0)}m)
                  </div>
              )}
            </div>
          )}
          {fiberPathResult && (fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'radius_too_small') && !isFiberCalculating && (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 text-center">
                  <AlertTriangle className="inline h-3 w-3 mr-0.5" />
                  {fiberPathResult.status === 'radius_too_small' ? "Radius too small. " : "No road found. "} Try increasing radius.
              </p>
          )}
          {fiberPathResult && fiberPathResult.status === 'no_route_between_roads' && !isFiberCalculating && (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 text-center">
                  <AlertTriangle className="inline h-3 w-3 mr-0.5" />
                  Cannot route between sites. Disconnected road networks?
              </p>
          )}
        </div>
      </div>

      {/* Bottom Chart Section (will take ~80% height) */}
      <div className="relative flex-1 p-0.5 min-h-0"> {/* Added relative positioning */}
        {analysisResult ? (
          <CustomProfileChart
            key={chartKey}
            data={analysisResult.profile}
            pointAName={pointAName}
            pointBName={pointBName}
            isStale={isStale}
            totalDistanceKm={analysisResult.distanceKm}
            isActionPending={isActionPending || isFiberCalculating} 
            onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
          />
        ) : isActionPending ? (
            <div className="h-full flex items-center justify-center p-2 bg-muted/30 rounded-md">
                <p className="text-muted-foreground text-xs text-center">Loading analysis data...</p>
            </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-2 text-xs text-muted-foreground">
            <p>Perform analysis to see profile.</p>
          </div>
        )}

        {/* NEW Fiber Data Overlay Div */}
        {(calculateFiberPathEnabled || isFiberCalculating) && (fiberPathResult || isFiberCalculating) && (
          <div className="absolute bottom-1 left-1 right-1 z-10">
            {(() => {
              if (isFiberCalculating) {
                return <div className="text-center p-1 rounded bg-slate-900/70 backdrop-blur-sm"><p className="text-xs text-primary animate-pulse">Calculating Fiber...</p></div>;
              }
              if (!fiberPathResult) return null;

              let statusText = fiberPathResult.status;
              let statusColorClass = "text-white"; // Default
              if (fiberPathResult.status === 'success') { statusText = "Calculated"; statusColorClass = "text-green-400"; }
              else if (fiberPathResult.status === 'los_not_feasible') { statusText = "LOS Not Feasible"; statusColorClass = "text-yellow-400"; }
              else if (fiberPathResult.status === 'no_road_for_a') { statusText = "No Road Near Site A"; statusColorClass = "text-yellow-400"; }
              else if (fiberPathResult.status === 'no_road_for_b') { statusText = "No Road Near Site B"; statusColorClass = "text-yellow-400"; }
              else if (fiberPathResult.status === 'no_route_between_roads') { statusText = "No Route Between Roads"; statusColorClass = "text-yellow-400"; }
              else if (fiberPathResult.status === 'radius_too_small') { statusText = "Snap Radius Too Small"; statusColorClass = "text-yellow-400"; }
              else if (fiberPathResult.status !== 'success') { statusText = fiberPathResult.errorMessage || "Error"; statusColorClass = "text-red-400"; }

              return (
                <div className="p-1.5 rounded bg-slate-900/80 backdrop-blur-sm text-xs space-y-0.5 shadow-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-300">Fiber Path:</p>
                    <p className={cn("font-semibold", statusColorClass)}>{statusText}</p>
                  </div>
                  {fiberPathResult.status === 'success' && fiberPathResult.totalDistanceMeters !== undefined && (
                    <p className="text-slate-300">
                      <span className="font-bold text-white">{fiberPathResult.totalDistanceMeters.toFixed(0)}m</span> total
                      <span className="text-slate-400 text-[0.65rem]"> (A: {fiberPathResult.offsetDistanceA_meters?.toFixed(0)}m, R: {fiberPathResult.roadRouteDistanceMeters?.toFixed(0)}m, B: {fiberPathResult.offsetDistanceB_meters?.toFixed(0)}m)</span>
                    </p>
                  )}
                  {(fiberPathError && fiberPathResult.status !== 'success') && ( // Show general error if specific error message for status is not already shown
                     <p className={cn("text-xs", statusColorClass)}>{fiberPathError}</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};


interface BottomPanelProps {
  analysisResult: AnalysisResult | null;
  isPanelGloballyVisible: boolean;
  onToggleGlobalVisibility: () => void;
  // isContentExpanded prop is removed as it's no longer used for height logic here
  // onToggleContentExpansion prop is removed
  isStale?: boolean;

  control: Control<AnalysisFormValues>;
  register: UseFormRegister<AnalysisFormValues>;
  handleSubmit: UseFormHandleSubmit<AnalysisFormValues>;
  processSubmit: (data: AnalysisFormValues) => void;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  isActionPending: boolean;
  getValues: UseFormGetValues<AnalysisFormValues>;
  setValue: UseFormSetValue<AnalysisFormValues>;
  onTowerHeightChangeFromGraph: (siteId: 'pointA' | 'pointB', newHeight: number) => void;

  // Fiber Path Props
  calculateFiberPathEnabled: boolean;
  onToggleFiberPath: (checked: boolean) => void;
  fiberRadiusMeters: number;
  onFiberRadiusChange: (value: string) => void; 
  fiberPathResult: FiberPathResult | null;
  isFiberCalculating: boolean;
  fiberPathError: string | null;
}

export default function BottomPanel({
  analysisResult,
  isPanelGloballyVisible,
  onToggleGlobalVisibility,
  // isContentExpanded, // Prop removed
  // onToggleContentExpansion, // Prop removed
  isStale,
  control,
  register,
  handleSubmit,
  processSubmit,
  clientFormErrors,
  serverFormErrors,
  isActionPending,
  getValues,
  setValue,
  onTowerHeightChangeFromGraph,
  // Fiber Path Props
  calculateFiberPathEnabled,
  onToggleFiberPath,
  fiberRadiusMeters,
  onFiberRadiusChange,
  fiberPathResult,
  isFiberCalculating,
  fiberPathError,
}: BottomPanelProps) {
  const { toast } = useToast();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'Site A' | 'Analysis' | 'Site B'>('Analysis');
  const [isInternallyCollapsed, setIsInternallyCollapsed] = useState(false);

  const getCombinedError = (clientFieldError?: { message?: string }, serverFieldError?: string[]) => {
    if (serverFieldError && serverFieldError.length > 0) return serverFieldError.join(', ');
    return clientFieldError?.message;
  };

  const pointAName = useWatch({ control, name: 'pointA.name', defaultValue: analysisResult?.pointA?.name || "Site A" });
  const pointBName = useWatch({ control, name: 'pointB.name', defaultValue: analysisResult?.pointB?.name || "Site B" });

  const handleDownloadPdf = async () => {
    if (!analysisResult) {
      toast({ title: "Error", description: "No analysis data available to generate PDF.", variant: "destructive" });
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const response = await generateSingleAnalysisPdfReportAction(analysisResult, {});

      if (response.success) {
        const { base64Pdf, fileName } = response.data;
        const byteCharacters = atob(base64Pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        saveAs(blob, fileName);
        toast({ title: "Success", description: "PDF report downloaded." });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error generating PDF.";
      console.error("PDF Generation Error:", error);
      toast({ title: "PDF Generation Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(processSubmit)}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-slate-700/60 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out print:hidden",
        isPanelGloballyVisible ? "transform translate-y-0" : "transform translate-y-full",
        "z-[50]"
      )}
    >
      {/* Content Area with new height logic and internal structure */}
      <div
        className={cn(
          "w-full overflow-hidden transition-all duration-300 ease-in-out",
          isPanelGloballyVisible
            ? (isInternallyCollapsed ? "h-12" : "h-[40vh]")
            : "h-0"
        )}
      >
        {/* Header for the collapse button, always visible if panel is globally visible */}
        <div className="h-12 flex justify-end items-center p-2 border-b border-border bg-slate-800/90 rounded-t-2xl"> {/* MODIFIED: Added rounded-t-2xl */}
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsInternallyCollapsed(!isInternallyCollapsed)}
                aria-label={isInternallyCollapsed ? "Expand Panel Content" : "Collapse Panel Content"}
                className="text-muted-foreground hover:text-foreground"
             >
                 {isInternallyCollapsed ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
             </Button>
        </div>

        {/* Conditionally rendered actual content (tabs, grid, etc.) */}
        {!isInternallyCollapsed && (
            <div className="p-1.5 md:p-2 h-[calc(100%-3rem)] overflow-y-auto"> {/* calc(100% - h-12) */}
                {/* Tab Navigation for Mobile - visible only on <md screens */}
                <div className="md:hidden flex justify-around mb-2 border-b border-border sticky top-0 bg-slate-800/90 z-10 py-1">
                    {(['Site A', 'Analysis', 'Site B'] as const).map((tab) => (
                    <Button
                key={tab}
                variant={activeTab === tab ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-xs px-3 py-1 h-auto",
                  activeTab === tab ? "font-semibold" : "font-normal text-muted-foreground"
                )}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Container for the three sections - adjusted classes for new layout */}
          <div className="h-full md:grid md:grid-cols-[minmax(200px,_1fr)_minmax(300px,_2fr)_minmax(200px,_1fr)] md:gap-1.5">

            {/* Site A Input Group - Conditional Rendering */}
            <div className={cn("w-full", activeTab === 'Site A' ? 'block' : 'hidden', 'md:block')}>
              <SiteInputGroup
                id="pointA"
                title={pointAName || "Site A"}
                control={control}
                register={register}
                clientFormErrors={clientFormErrors}
                serverFormErrors={serverFormErrors}
                getCombinedError={getCombinedError}
              />
            </div>

            {/* Profile Panel Middle Column - Conditional Rendering */}
            <div className={cn("w-full", activeTab === 'Analysis' ? 'block' : 'hidden', 'md:block')}>
              <ProfilePanelMiddleColumn
                analysisResult={analysisResult}
                isStale={isStale}
              isActionPending={isActionPending}
              control={control}
              clientFormErrors={clientFormErrors}
              serverFormErrors={serverFormErrors}
              getCombinedError={getCombinedError}
              handleSubmit={handleSubmit}
              processSubmit={processSubmit}
              pointAName={pointAName || "Site A"}
              pointBName={pointBName || "Site B"}
              onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
              onDownloadPdf={handleDownloadPdf}
              isGeneratingPdf={isGeneratingPdf}
              // Fiber Path Props
              calculateFiberPathEnabled={calculateFiberPathEnabled}
              onToggleFiberPath={onToggleFiberPath}
              fiberRadiusMeters={fiberRadiusMeters}
              onFiberRadiusChange={onFiberRadiusChange}
              fiberPathResult={fiberPathResult}
              isFiberCalculating={isFiberCalculating}
              fiberPathError={fiberPathError}
            />
            </div>

            {/* Site B Input Group - Conditional Rendering */}
            <div className={cn("w-full", activeTab === 'Site B' ? 'block' : 'hidden', 'md:block')}>
              <SiteInputGroup
                id="pointB"
                title={pointBName || "Site B"}
                control={control}
                register={register}
                clientFormErrors={clientFormErrors}
                serverFormErrors={serverFormErrors}
                getCombinedError={getCombinedError}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Chevron toggle element removed as per requirement */}
    </form>
  );
}

