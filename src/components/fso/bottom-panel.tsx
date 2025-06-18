
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
import { ChevronDown, ChevronUp, Target, Settings, Loader2, AlertTriangle, X, Download, Cable, Router, HelpCircle } from 'lucide-react';
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
    <div className="flex-shrink-0 w-full md:w-auto snap-start flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-2px rounded-lg p-1 md:p-0">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 py-1 md:py-1.5 px-2 md:px-3 border-b border-border mb-1">
        <div className="flex-shrink-0 order-1">
          {isStale ? (
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-yellow-500/80 text-yellow-900 flex items-center shadow">
              <AlertTriangle className="mr-1 h-3 w-3" /> NEEDS RE-ANALYZE
            </span>
          ) : analysisResult ? (
            <span
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold shadow-md",
                isClearBasedOnAnalysis
                  ? "bg-los-success text-los-success-foreground"
                  : "bg-los-failure text-los-failure-foreground"
              )}
            >
              {isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground italic">
                Perform analysis
            </span>
          )}
        </div>

        {analysisResult && !isStale && (
          <>
            <div className="flex flex-col items-center order-2">
              <span className="uppercase tracking-wider text-muted-foreground text-[0.6rem] md:text-[0.65rem] font-medium">Aerial Dist.</span>
              <span className="font-bold text-foreground text-xs md:text-sm">
                {analysisResult.distanceKm < 1
                  ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m`
                  : `${analysisResult.distanceKm.toFixed(1)}km`}
              </span>
            </div>

            <div className="flex flex-col items-center order-4">
              <span className="uppercase tracking-wider text-muted-foreground text-[0.6rem] md:text-[0.65rem] font-medium">Min. Clear.</span>
              <span className={cn(
                "font-bold text-xs md:text-sm",
                isStale ? "text-muted-foreground" : (actualMinClearance !== null && actualMinClearance >= (minRequiredClearance || 0) ? "text-los-success" : "text-los-failure")
              )}>
                {actualMinClearance !== null ? actualMinClearance.toFixed(1) + "m" : "N/A"}
              </span>
            </div>
          </>
        )}

        <div className="order-3 flex-grow-0 md:flex-grow-0 text-center flex items-center gap-2">
             <Button
                type="submit" // This button triggers LOS analysis via form submission
                onClick={handleSubmit(processSubmit)}
                disabled={isActionPending || isGeneratingPdf || isFiberCalculating}
                size="sm"
                className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight"
            >
                <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin" )} />
                {buttonText}
            </Button>
            {analysisResult && !isStale && (
                 <Button
                    type="button"
                    onClick={onDownloadPdf}
                    disabled={isActionPending || isGeneratingPdf || !analysisResult || isStale || isFiberCalculating}
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight border-primary/50 hover:bg-primary/10"
                >
                    <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isGeneratingPdf && "hidden", isGeneratingPdf && "animate-spin" )} />
                    <Download className={cn("mr-1.5 h-3.5 w-3.5", isGeneratingPdf && "hidden")} />
                    PDF
                </Button>
            )}
        </div>

        <div className="flex items-center space-x-1 order-5">
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
                  />
              )}
          />
        </div>
      </div>
      {(clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) &&
        <p className="text-xs text-destructive mt-0.5 text-center px-2">
          {getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)}
        </p>
      }
       {analysisResult && !isClearBasedOnAnalysis && actualMinClearance !== null && !isNaN(minRequiredClearance) && !isStale && (
          <div className="text-center text-los-failure text-[0.7rem] py-0.5">
            Add&nbsp;
            <span className="font-semibold">{deficit.toFixed(0)}m</span>
            &nbsp;to tower(s) for clearance.
          </div>
        )}

      {/* Fiber Path Controls and Results Section */}
      <div className="py-1 px-2 md:px-3 border-t border-border mt-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="fiber-path-toggle"
              checked={calculateFiberPathEnabled}
              onCheckedChange={onToggleFiberPath}
              disabled={isActionPending}
            />
            <Label htmlFor="fiber-path-toggle" className="text-xs text-muted-foreground flex items-center">
              <Cable className="mr-1.5 h-3.5 w-3.5" /> Calculate Fiber Path
            </Label>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0 m-0" onClick={(e) => e.preventDefault()} aria-label="Fiber path calculation info">
                         <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs p-2 bg-popover text-popover-foreground border border-border shadow-lg">
                    <p>Calculates estimated fiber optic cable path length using road networks within a specified radius from each site.</p>
                    <p className="mt-1">Requires Line-of-Sight (LOS) to be feasible.</p>
                    <p className="mt-1">Results include offsets from sites to roads and the road route distance.</p>
                </TooltipContent>
            </Tooltip>
          </div>
          {calculateFiberPathEnabled && (
            <div className="flex items-center space-x-1">
              <Label htmlFor="fiber-radius-input" className="text-[0.65rem] text-muted-foreground whitespace-nowrap">Snap Radius (m):</Label>
              <Input
                id="fiber-radius-input"
                type="number"
                value={fiberRadiusMeters.toString()}
                onChange={handleFiberRadiusInputChange}
                min={0}
                step={50}
                className="bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-16 text-center"
                disabled={isActionPending || isFiberCalculating}
              />
            </div>
          )}
        </div>
        {isFiberCalculating && (
          <div className="text-xs text-primary flex items-center justify-center py-1">
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Calculating fiber path...
          </div>
        )}
        {fiberPathResult && !isFiberCalculating && (
          <div className="text-xs p-1.5 rounded-sm bg-muted/50 space-y-0.5">
            <p>
              <span className="font-semibold">Fiber Path Status:</span>{' '}
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
        {/* Display suggestion if fiber calculation failed due to no road found or radius too small */}
        {fiberPathResult && (fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'radius_too_small') && !isFiberCalculating && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 text-center">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {fiberPathResult.status === 'radius_too_small' ? "Snap radius is too small. " : "No road found near one or both sites. "}
                Try increasing the Snap Radius.
            </p>
        )}
         {/* Display suggestion if no route between snapped points */}
        {fiberPathResult && fiberPathResult.status === 'no_route_between_roads' && !isFiberCalculating && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 text-center">
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                Could not find a road route between the snapped points for Site A and Site B. They might be on disconnected road networks.
            </p>
        )}
      </div>


      <div className={cn("flex-1 min-h-0 p-0.5")}>
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
          isContentExpanded && isPanelGloballyVisible ? "h-[40vh] md:h-[35vh]" : "h-0"
        )}
      >
        <div className="p-1.5 md:p-2 h-full overflow-y-hidden md:overflow-y-auto">
           <div className="flex md:grid md:grid-cols-[minmax(200px,_1fr)_minmax(300px,_2fr)_minmax(200px,_1fr)] gap-1.5 h-full overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none custom-scrollbar">

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

