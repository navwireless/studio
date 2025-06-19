
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
import { Target, Settings, Loader2, AlertTriangle, X, Download, Cable, Router, HelpCircle } from 'lucide-react'; // Removed ChevronDown, ChevronUp
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
    {/* Root div: vertical scroll, space-y, padding */}
    <div className="w-full flex flex-col h-full overflow-y-auto space-y-2 md:space-y-3 p-1 bg-transparent backdrop-blur-2px rounded-lg">

      {/* Group 1: Analysis Summary & Actions */}
      <Card className="p-0 bg-card/60">
        <CardHeader className="p-2 pt-1.5 pb-1">
          <CardTitle className="text-sm font-semibold text-foreground">Summary & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-2 pt-1">
          {/* LOS Status Display */}
          <div className="w-full text-center p-2 rounded-md text-sm font-semibold">
            {isStale ? (
              <div className="bg-yellow-500/80 text-yellow-900 p-2 rounded-md flex items-center justify-center">
                <AlertTriangle className="mr-2 h-4 w-4" /> NEEDS RE-ANALYZE
              </div>
            ) : analysisResult ? (
              <div className={cn("p-2 rounded-md", isClearBasedOnAnalysis ? "bg-los-success text-los-success-foreground" : "bg-los-failure text-los-failure-foreground")}>
                {isClearBasedOnAnalysis ? "LINE OF SIGHT POSSIBLE" : "LINE OF SIGHT BLOCKED"}
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground p-2 rounded-md italic">
                Perform analysis to see status
              </div>
            )}
          </div>

          {/* Key Metrics */}
          {analysisResult && !isStale && (
            <div className="flex justify-around items-center text-center">
              <div>
                <Label className="text-xs text-muted-foreground font-normal uppercase tracking-wider">Aerial Dist.</Label>
                <p className="font-semibold text-sm text-foreground">
                  {analysisResult.distanceKm < 1
                    ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m`
                    : `${analysisResult.distanceKm.toFixed(1)}km`}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-normal uppercase tracking-wider">Min. Clearance</Label>
                <p className={cn(
                  "font-semibold text-sm",
                  isStale ? "text-muted-foreground" : (actualMinClearance !== null && actualMinClearance >= (minRequiredClearance || 0) ? "text-los-success" : "text-los-failure")
                )}>
                  {actualMinClearance !== null ? actualMinClearance.toFixed(1) + "m" : "N/A"}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              type="submit"
              onClick={handleSubmit(processSubmit)}
              disabled={isActionPending || isGeneratingPdf || isFiberCalculating}
              size="sm"
              className="flex-grow bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 h-auto min-h-8 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight"
            >
              <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")} />
              {buttonText}
            </Button>
            {analysisResult && !isStale && (
              <Button
                type="button"
                onClick={onDownloadPdf}
                disabled={isActionPending || isGeneratingPdf || !analysisResult || isStale || isFiberCalculating}
                size="sm"
                variant="outline"
                className="flex-grow text-xs font-semibold px-3 py-1 h-auto min-h-8 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight border-primary/50 hover:bg-primary/10"
              >
                <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isGeneratingPdf && "hidden", isGeneratingPdf && "animate-spin")} />
                <Download className={cn("mr-1.5 h-3.5 w-3.5", isGeneratingPdf && "hidden")} />
                PDF Report
              </Button>
            )}
          </div>

          {/* Deficit Message */}
          {analysisResult && !isClearBasedOnAnalysis && actualMinClearance !== null && !isNaN(minRequiredClearance) && !isStale && (
            <div className="text-center text-los-failure text-xs p-1 bg-destructive/10 rounded-md">
              Add&nbsp;
              <span className="font-semibold">{deficit.toFixed(0)}m</span>
              &nbsp;to tower(s) for clearance.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group 2: Link Parameters */}
      <Card className="p-0 bg-card/60">
        <CardHeader className="p-2 pt-1.5 pb-1">
          <CardTitle className="text-sm font-semibold text-foreground">Link Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-2 pt-1">
          <div className="flex items-center space-x-2 justify-between">
            <Label htmlFor="clearanceThresholdProfile" className="text-xs text-muted-foreground whitespace-nowrap">Required Fresnel Clearance (m):</Label>
            <Controller
                name="clearanceThreshold"
                control={control}
                render={({ field }) => (
                    <Input
                    id="clearanceThresholdProfile"
                    type="number"
                    step="any"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="bg-input border-border focus:border-primary/70 text-foreground h-7 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-20 text-center"
                    />
                )}
            />
          </div>
          {(clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) &&
            <p className="text-xs text-destructive text-right px-1">
              {getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)}
            </p>
          }
        </CardContent>
      </Card>

      {/* Group 3: Fiber Optic Analysis */}
      <Card className="p-0 bg-card/60">
        <CardHeader className="p-2 pt-1.5 pb-1">
          <CardTitle className="text-sm font-semibold text-foreground">Fiber Optic Path</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-2 pt-1">
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
          {fiberPathResult && (fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'radius_too_small') && !isFiberCalculating && (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 text-center">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  {fiberPathResult.status === 'radius_too_small' ? "Snap radius is too small. " : "No road found near one or both sites. "}
                  Try increasing the Snap Radius.
              </p>
          )}
          {fiberPathResult && fiberPathResult.status === 'no_route_between_roads' && !isFiberCalculating && (
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1 text-center">
                  <AlertTriangle className="inline h-3 w-3 mr-1" />
                  Could not find a road route between the snapped points for Site A and Site B. They might be on disconnected road networks.
              </p>
          )}
        </CardContent>
      </Card>

      {/* Elevation Profile Chart */}
      <div className={cn("flex-1 min-h-0 p-0.5")}> {/* mt-2 or mt-3 could be added here if space-y is not enough */}
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
  const [activeTab, setActiveTab] = useState<'Site A' | 'Analysis' | 'Site B'>('Analysis');

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
      {/* Content Area with adjusted height and overflow for mobile */}
      <div
        className={cn(
          "w-full overflow-hidden transition-[height] duration-500 ease-in-out",
          isContentExpanded && isPanelGloballyVisible ? "h-auto max-h-[60vh] md:max-h-[35vh] md:h-[35vh]" : "h-0"
        )}
      >
        {/* Main content div - now always allows y-scroll */}
        <div className="p-1.5 md:p-2 h-full overflow-y-auto">
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

