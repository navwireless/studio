
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
import { ChevronDown, ChevronUp, Target, Settings, Loader2, AlertTriangle, X, Download, Cable, Router, HelpCircle, Check, ArrowRightLeft } from 'lucide-react'; // Added ArrowRightLeft
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useCallback } from 'react';
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
  isActionPending: boolean;
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
  calculateFiberPathEnabled: boolean;
  onToggleFiberPath: (checked: boolean) => void;
  fiberRadiusMeters: number;
  onFiberRadiusChange: (value: number) => void;
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
  calculateFiberPathEnabled,
  onToggleFiberPath,
  fiberRadiusMeters,
  onFiberRadiusChange,
  fiberPathResult,
  isFiberCalculating,
  fiberPathError,
}) => {
  const { toast } = useToast();
  const watchedClearanceThresholdString = useWatch({ control, name: 'clearanceThreshold', defaultValue: "10" });
  const minRequiredClearance = parseFloat(watchedClearanceThresholdString);

  const [localSnapRadiusInput, setLocalSnapRadiusInput] = useState<string>(fiberRadiusMeters.toString());

  useEffect(() => {
    // Sync local input if prop changes from parent (e.g. initial load, reset)
    if (fiberRadiusMeters.toString() !== localSnapRadiusInput) {
      setLocalSnapRadiusInput(fiberRadiusMeters.toString());
    }
  }, [fiberRadiusMeters, localSnapRadiusInput]);

  const handleApplySnapRadiusForProfilePanel = () => {
    const newRadiusNum = parseInt(localSnapRadiusInput, 10);
    if (!isNaN(newRadiusNum) && newRadiusNum >= 1 && newRadiusNum <= 10000) {
      onFiberRadiusChange(newRadiusNum); // This will trigger recalculation in page.tsx if toggle is ON
    } else {
      toast({
        title: "Invalid Snap Radius",
        description: "Radius must be a whole number between 1 and 10000.",
        variant: "destructive",
      });
      setLocalSnapRadiusInput(fiberRadiusMeters.toString()); // Revert to last valid value
    }
  };


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

  const anyOperationPending = isActionPending || isGeneratingPdf || isFiberCalculating;

  return (
    <TooltipProvider>
    <div className="flex-shrink-0 w-full md:w-auto snap-start flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-2px rounded-lg p-1 md:p-0">
      {/* Main controls row: LOS Status, Distances, Buttons, Fresnel Input, AND Fiber Toggle/Radius */}
      {/* This div will hold all primary interactive controls and key info display items. */}
      {/* Using flex-nowrap and overflow-x-auto for single-line scrollable controls */}
      <div className="flex flex-nowrap items-center justify-start gap-x-3 gap-y-2 py-1 md:py-1.5 px-2 md:px-3 border-b border-border mb-1 overflow-x-auto custom-scrollbar">
        
        {/* Group 1: LOS Status */}
        <div className="flex-shrink-0 order-1 min-w-[130px] text-center">
          {isStale ? (
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-yellow-500/80 text-yellow-900 flex items-center shadow whitespace-nowrap">
              <AlertTriangle className="mr-1 h-3 w-3" /> NEEDS RE-ANALYZE
            </span>
          ) : analysisResult ? (
            <span
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold shadow-md whitespace-nowrap",
                isClearBasedOnAnalysis
                  ? "bg-los-success text-los-success-foreground"
                  : "bg-los-failure text-los-failure-foreground"
              )}
            >
              {isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground italic whitespace-nowrap">
                Perform analysis
            </span>
          )}
        </div>

        {/* Group 2: Aerial Distance */}
        <div className="flex-shrink-0 flex flex-col items-center order-2 min-w-[100px] text-center">
          <span className="uppercase tracking-wider text-muted-foreground text-[0.6rem] md:text-[0.65rem] font-medium whitespace-nowrap">Aerial Dist.</span>
          <span className="font-bold text-foreground text-xs md:text-sm whitespace-nowrap">
            {analysisResult && !isStale
              ? (analysisResult.distanceKm < 1
                ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m`
                : `${analysisResult.distanceKm.toFixed(1)}km`)
              : "N/A"}
          </span>
        </div>
        
        {/* Group 3: Min Clearance */}
        <div className="flex-shrink-0 flex flex-col items-center order-3 min-w-[100px] text-center">
          <span className="uppercase tracking-wider text-muted-foreground text-[0.6rem] md:text-[0.65rem] font-medium whitespace-nowrap">Min. Clear.</span>
          <span className={cn(
            "font-bold text-xs md:text-sm whitespace-nowrap",
            isStale ? "text-muted-foreground" : (actualMinClearance !== null && actualMinClearance >= (minRequiredClearance || 0) ? "text-los-success" : "text-los-failure")
          )}>
            {analysisResult && !isStale && actualMinClearance !== null ? actualMinClearance.toFixed(1) + "m" : "N/A"}
          </span>
        </div>

        {/* Group 4: Buttons: Analyze/Re-Analyze and PDF Download */}
        <div className="order-4 flex items-center gap-2 flex-shrink-0 min-w-[160px]">
             <Button
                type="submit"
                onClick={handleSubmit(processSubmit)}
                disabled={anyOperationPending}
                size="sm"
                className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight flex-1"
            >
                <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin" )} />
                {buttonText}
            </Button>
            {analysisResult && !isStale && (
                 <Button
                    type="button"
                    onClick={onDownloadPdf}
                    disabled={anyOperationPending}
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold px-2 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight border-primary/50 hover:bg-primary/10 flex-shrink-0"
                >
                    <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isGeneratingPdf && "hidden", isGeneratingPdf && "animate-spin" )} />
                    <Download className={cn("mr-1.5 h-3.5 w-3.5", isGeneratingPdf && "hidden")} />
                    PDF
                </Button>
            )}
        </div>

        {/* Group 5: Required Fresnel Input */}
        <div className="flex-shrink-0 flex items-center space-x-1 order-5 min-w-[150px]">
          <Label htmlFor="clearanceThresholdProfile" className="text-[0.65rem] text-muted-foreground whitespace-nowrap">Req. Fresnel (m):</Label>
          <Controller
              name="clearanceThreshold"
              control={control}
              render={({ field, fieldState: { error } }) => (
                  <Input
                  id="clearanceThresholdProfile"
                  type="number"
                  step="any"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-14 text-center"
                  disabled={anyOperationPending}
                  />
              )}
          />
        </div>

        {/* Group 6: Fiber Path Toggle and Tooltip */}
        <div className="flex-shrink-0 flex items-center space-x-1 order-6 min-w-[110px]">
          <Switch
            id="fiber-path-toggle"
            checked={calculateFiberPathEnabled}
            onCheckedChange={onToggleFiberPath}
            disabled={anyOperationPending}
            className="data-[state=checked]:bg-appAccent data-[state=unchecked]:bg-input h-5 w-9 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4"
          />
          <Label htmlFor="fiber-path-toggle" className="text-xs text-muted-foreground flex items-center cursor-pointer whitespace-nowrap">
            <Cable className="mr-1 h-3.5 w-3.5" /> Fiber
          </Label>
          <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-4 w-4 p-0 m-0" onClick={(e) => e.preventDefault()} aria-label="Fiber path calculation info">
                       <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
                  </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs p-2 bg-popover text-popover-foreground border border-border shadow-lg">
                  <p>Calculates estimated fiber optic cable path length using road networks. Requires Line-of-Sight (LOS) to be feasible.</p>
                  <p className="mt-1">Automatically re-calculates if LOS is feasible and this toggle is switched ON, or if Snap Radius is Applied.</p>
              </TooltipContent>
          </Tooltip>
        </div>

        {/* Group 7: Snap Radius Input and Apply Button (Conditional) */}
        {calculateFiberPathEnabled && (
          <div className="flex-shrink-0 flex items-center space-x-1 order-7 min-w-[200px]">
            <Label htmlFor="fiber-radius-input-bottom-panel" className="text-[0.65rem] text-muted-foreground whitespace-nowrap">Snap Radius (m):</Label>
            <Input
              id="fiber-radius-input-bottom-panel"
              type="number"
              value={localSnapRadiusInput}
              onChange={(e) => setLocalSnapRadiusInput(e.target.value)}
              min={1}
              max={10000}
              step={50}
              className="bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-16 text-center"
              disabled={anyOperationPending} // Input itself is not disabled by operations to allow editing
            />
            <Button
              type="button"
              onClick={handleApplySnapRadiusForProfilePanel}
              disabled={anyOperationPending || localSnapRadiusInput === fiberRadiusMeters.toString()}
              size="sm"
              className="h-6 px-2 text-[0.65rem] leading-tight"
              variant="outline"
            >
              <Check className="h-3 w-3 sm:mr-1" /> <span className="hidden sm:inline">Apply</span>
            </Button>
          </div>
        )}
      </div> {/* End of main controls flex container */}

      {/* Error for Clearance Threshold (remains below controls row) */}
      {(clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) &&
        <p className="text-xs text-destructive mt-0.5 text-center px-2">
          {getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)}
        </p>
      }
      {/* Message for additional height needed (remains below controls row) */}
       {analysisResult && !isClearBasedOnAnalysis && actualMinClearance !== null && !isNaN(minRequiredClearance) && !isStale && (
          <div className="text-center text-los-failure text-[0.7rem] py-0.5">
            Add&nbsp;
            <span className="font-semibold">{deficit.toFixed(0)}m</span>
            &nbsp;to tower(s) for clearance.
          </div>
        )}

      {/* Fiber Path Status/Results - Rendered as block elements below the controls row */}
      {/* This section remains, ensuring elevation profile is not hidden by it */}
      <div className="px-2 md:px-3 mt-1 text-xs">
        {isFiberCalculating && (
          <div className="text-primary flex items-center justify-center py-1">
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Calculating fiber path...
          </div>
        )}
        {fiberPathResult && !isFiberCalculating && (
          <div className="p-1.5 rounded-sm bg-muted/50 space-y-0.5">
            <p>
              <span className="font-semibold">Fiber Route Status:</span>{' '}
              <span className={cn(
                fiberPathResult.status === 'success' ? 'text-los-success' :
                (fiberPathResult.status === 'los_not_feasible' || fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'no_route_between_roads' || fiberPathResult.status === 'radius_too_small') ? 'text-amber-500' :
                'text-los-failure'
              )}>
                {fiberPathResult.status === 'success' ? 'Calculated' :
                 fiberPathResult.status === 'los_not_feasible' ? 'LOS Not Feasible' :
                 fiberPathResult.status === 'no_road_for_a' ? 'No Road Near Site A' :
                 fiberPathResult.status === 'no_road_for_b' ? 'No Road Near Site B' :
                 fiberPathResult.status === 'no_route_between_roads' ? 'No Road Route' :
                 fiberPathResult.status === 'radius_too_small' ? 'Snap Radius Too Small' :
                 'Error'}
              </span>
            </p>
            {fiberPathResult.totalDistanceMeters !== undefined && fiberPathResult.status === 'success' && (
              <p><span className="font-semibold">Total Fiber Distance:</span> {fiberPathResult.totalDistanceMeters.toFixed(0)} m</p>
            )}
            {fiberPathError && <p className="text-destructive">{fiberPathError}</p>}
            {fiberPathResult.errorMessage && fiberPathResult.status !== 'success' && !fiberPathError && (
                <p className="text-muted-foreground italic">{fiberPathResult.errorMessage}</p>
            )}
            {fiberPathResult.status === 'success' && (
                <div className="text-[0.65rem] text-muted-foreground/80">
                   (Offset A: {fiberPathResult.offsetDistanceA_meters?.toFixed(0)}m
                   + Road: {fiberPathResult.roadRouteDistanceMeters?.toFixed(0)}m
                   + Offset B: {fiberPathResult.offsetDistanceB_meters?.toFixed(0)}m)
                </div>
            )}
          </div>
        )}
        {fiberPathResult && (fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'radius_too_small') && !isFiberCalculating && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 text-center">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {fiberPathResult.status === 'radius_too_small' ? "Snap radius is too small. " : "No road found near one or both sites. "}
                Try increasing the Snap Radius and click Apply.
            </p>
        )}
        {fiberPathResult && fiberPathResult.status === 'no_route_between_roads' && !isFiberCalculating && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 text-center">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                Could not find a road route between the snapped points for Site A and Site B. They might be on disconnected road networks.
            </p>
        )}
      </div>

      {/* Elevation Profile Chart - ALWAYS VISIBLE */}
      <div className={cn("flex-1 min-h-0 p-0.5")}>
        {analysisResult || isActionPending ? ( // Render chart if there's a result OR if an action is pending (shows "Analyzing...")
          <CustomProfileChart
            key={chartKey}
            data={analysisResult?.profile || []} // Pass empty array if no profile yet but action pending
            pointAName={pointAName || "Site A"}
            pointBName={pointBName || "Site B"}
            isStale={isStale}
            totalDistanceKm={analysisResult?.distanceKm}
            isActionPending={anyOperationPending} // Pass this to chart to show loading state
            onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
          />
        ) : ( // Initial state, no analysis done, no action pending
          <div className="h-full flex flex-col items-center justify-center p-2 text-xs text-muted-foreground">
            <ArrowRightLeft className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p>Perform analysis to see link profile.</p>
            <p className="mt-1 text-[0.7rem]">Click on the map to set site locations or enter coordinates manually.</p>
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
  isContentExpanded: boolean;
  onToggleContentExpansion: () => void;
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

  calculateFiberPathEnabled: boolean;
  onToggleFiberPath: (checked: boolean) => void; // Logic for this is in page.tsx
  fiberRadiusMeters: number; // Authoritative value from page.tsx
  onFiberRadiusChange: (value: number) => void; // Callback to page.tsx to update radius & trigger recalc
  fiberPathResult: FiberPathResult | null;
  isFiberCalculating: boolean;
  fiberPathError: string | null;
}

export default function BottomPanel({
  analysisResult,
  isPanelGloballyVisible,
  onToggleGlobalVisibility,
  isContentExpanded,
  onToggleContentExpansion,
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
      <div
        className={cn(
          "w-full overflow-hidden transition-[height] duration-500 ease-in-out",
          isContentExpanded && isPanelGloballyVisible ? "h-[40vh] md:h-[35vh]" : "h-0" // Height is managed here
        )}
      >
        {/* Content wrapper for the panel's three main columns */}
        <div className="p-1.5 md:p-2 h-full overflow-y-hidden md:overflow-y-auto">
           {/* Using flex for columns. On mobile, middle column (ProfilePanelMiddleColumn) will be primary view due to snap scroll. */}
           <div className="flex md:grid md:grid-cols-[minmax(200px,_1fr)_minmax(300px,_2fr)_minmax(200px,_1fr)] gap-1.5 h-full overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none custom-scrollbar">

            {/* Left Column: Site A Input */}
            <div className="flex-shrink-0 w-full md:w-auto snap-start p-1 md:p-0">
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

            {/* Middle Column: Controls and Elevation Profile Chart */}
            {/* This ProfilePanelMiddleColumn now handles the responsive control row and always visible chart */}
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
              calculateFiberPathEnabled={calculateFiberPathEnabled}
              onToggleFiberPath={onToggleFiberPath}
              fiberRadiusMeters={fiberRadiusMeters}
              onFiberRadiusChange={onFiberRadiusChange}
              fiberPathResult={fiberPathResult}
              isFiberCalculating={isFiberCalculating}
              fiberPathError={fiberPathError}
            />

            {/* Right Column: Site B Input */}
            <div className="flex-shrink-0 w-full md:w-auto snap-start p-1 md:p-0">
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
      {isPanelGloballyVisible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 p-1.5 bg-card rounded-t-lg border-t border-x border-border shadow-lg cursor-pointer hover:bg-muted group"
          onClick={onToggleContentExpansion}
          aria-label={isContentExpanded ? "Collapse Panel Content" : "Expand Panel Content"}
        >
          {isContentExpanded ?
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" /> :
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />}
        </div>
      )}
    </form>
  );
}

