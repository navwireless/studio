
"use client";

import type { Control, UseFormRegister, UseFormHandleSubmit, UseFormGetValues, UseFormSetValue, FieldErrors, UseFormReset } from 'react-hook-form';
import { Controller, useWatch, useFormContext } from 'react-hook-form'; 
import type { AnalysisResult, AnalysisFormValues, LOSLinkPoint } from '@/types'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomProfileChart from './custom-profile-chart';
import { ChevronDown, ChevronUp, Target, Settings, Loader2, AlertTriangle, X, FileText, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface SiteInputGroupProps {
  id: 'pointA' | 'pointB';
}

const SiteInputGroup: React.FC<SiteInputGroupProps> = ({ id }) => {
  const { register, control, formState: { errors: clientFormErrors } } = useFormContext<AnalysisFormValues>();
  
  const cardStaticTitle = id === 'pointA' ? 'Point A' : 'Point B';

  return (
    <Card className="bg-transparent backdrop-blur-2px shadow-none border-0 h-full flex flex-col p-1 md:p-2 w-full min-w-[280px] md:min-w-0">
      <CardHeader className="p-1">
        <CardTitle className="text-xs flex items-center text-slate-100/90 uppercase tracking-wider font-medium">
          <Target className="mr-1.5 h-3.5 w-3.5 text-primary/70" /> {cardStaticTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-1 space-y-1.5 text-xs flex-grow overflow-y-auto pr-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div>
            <Label htmlFor={`${id}.name`} className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal">Name</Label>
            <Input
              id={`${id}.name`}
              {...register(`${id}.name`)}
              placeholder={`e.g. ${id === 'pointA' ? 'Site A Building' : 'Site B Tower'}`}
              className="mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
            />
            {clientFormErrors[id]?.name &&
              <p className="text-xs text-destructive/80 mt-0.5">{clientFormErrors[id]?.name?.message}</p>}
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
              {clientFormErrors[id]?.lat &&
                <p className="text-xs text-destructive/80 mt-0.5">{clientFormErrors[id]?.lat?.message}</p>}
            </div>
            <div>
              <Label htmlFor={`${id}.lng`} className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal">Longitude</Label>
              <Input
                id={`${id}.lng`}
                {...register(`${id}.lng`)}
                placeholder="-180 to 180"
                className="mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
              />
              {clientFormErrors[id]?.lng &&
                <p className="text-xs text-destructive/80 mt-0.5">{clientFormErrors[id]?.lng?.message}</p>}
            </div>
          </div>
          {/* Tower height display and control removed from here */}
          {/* Hidden input for tower height to keep RHF happy, value is managed by chart */}
           <Controller
            name={`${id}.height`}
            control={control}
            render={({ field }) => (
              <input type="hidden" {...field} />
            )}
          />
          {clientFormErrors[id]?.height && !clientFormErrors[id]?.height?.message?.includes("Maximum tower height") && !clientFormErrors[id]?.height?.message?.includes("Minimum tower height") && // Only show general errors not specific to chart
            <p className="text-xs text-destructive/80 mt-0.5">{clientFormErrors[id]?.height?.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

interface ProfilePanelMiddleColumnProps {
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  isActionPending: boolean;
  onAnalyzeSubmit: () => void; 
  pointANameWatch: string; 
  pointBNameWatch: string; 
  onTowerHeightChangeFromGraph: (siteId: 'pointA' | 'pointB', newHeight: number) => void;
  onOpenReportDialog: () => void;
  onAddNewLink: () => void; 
  currentDistanceKm: number | null;
  selectedLinkClearanceThreshold?: number; 
}

const ProfilePanelMiddleColumn: React.FC<ProfilePanelMiddleColumnProps> = ({
  analysisResult,
  isStale,
  isActionPending,
  onAnalyzeSubmit,
  pointANameWatch,
  pointBNameWatch,
  onTowerHeightChangeFromGraph,
  onOpenReportDialog,
  onAddNewLink,
  currentDistanceKm,
  selectedLinkClearanceThreshold,
}) => {
  const { control, formState: { errors: clientFormErrors } } = useFormContext<AnalysisFormValues>();
  const watchedClearanceThresholdString = useWatch({ control, name: 'clearanceThreshold' });
  
  const minRequiredClearance = selectedLinkClearanceThreshold ?? parseFloat(watchedClearanceThresholdString || "0");

  let isClearBasedOnAnalysis = false;
  let deficit = 0;
  let actualMinClearance = analysisResult?.minClearance ?? null;

  if (analysisResult && analysisResult.minClearance !== null && !isNaN(minRequiredClearance)) {
    isClearBasedOnAnalysis = analysisResult.minClearance >= minRequiredClearance;
    deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(minRequiredClearance - (analysisResult.minClearance || 0));
  }

  const chartKey = React.useMemo(() => {
    if (!analysisResult) return 'no-result';
    const profileDataSignature = analysisResult.profile.length > 0
      ? `${analysisResult.profile[0].distance}-${analysisResult.profile[0].terrainElevation}-${analysisResult.profile[0].losHeight}-${analysisResult.profile[analysisResult.profile.length - 1].distance}-${analysisResult.profile[analysisResult.profile.length - 1].terrainElevation}-${analysisResult.profile[analysisResult.profile.length - 1].losHeight}`
      : 'empty-profile';
    return `${analysisResult.distanceKm}-${analysisResult.pointA?.towerHeight}-${analysisResult.pointB?.towerHeight}-${profileDataSignature}-${minRequiredClearance}`;
  }, [analysisResult, minRequiredClearance]);

  const buttonText = isActionPending
    ? "Analyzing..."
    : (isStale || !analysisResult ? "Analyze Link" : "Re-Analyze");
    
  const pointANameDisplay = analysisResult?.pointA?.name || pointANameWatch || "Site A";
  const pointBNameDisplay = analysisResult?.pointB?.name || pointBNameWatch || "Site B";


  return (
    <div className="flex-shrink-0 w-full md:w-auto snap-start flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-2px rounded-lg p-1 md:p-0 min-w-[320px] md:min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 py-1 md:py-1.5 px-2 md:px-3 border-b border-border mb-1">
        <div className="flex-shrink-0 order-1">
          {(isStale && !isActionPending && analysisResult) || (isStale && !analysisResult) ? (
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
            !isActionPending && (
              <span className="px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground italic">
                Perform analysis
              </span>
            )
          )}
        </div>

        {analysisResult && !isStale && (
          <>
            <div className="flex flex-col items-center order-2">
              <span className="uppercase tracking-wider text-muted-foreground text-[0.6rem] md:text-[0.65rem] font-medium">Aerial Dist.</span>
              <span className="font-bold text-foreground text-xs md:text-sm">
                {currentDistanceKm !== null ? (currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)}m` : `${currentDistanceKm.toFixed(1)}km`) : "N/A"}
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

        <div className="order-3 flex-grow-0 md:flex-grow-0 text-center">
          <Button
            type="button" 
            onClick={onAnalyzeSubmit}
            disabled={isActionPending}
            size="sm"
            className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight"
          >
            <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")} />
            {buttonText}
          </Button>
        </div>
        
        <div className="order-5 flex items-center space-x-1">
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
                className="bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-14 text-center"
              />
            )}
          />
        </div>

        {(analysisResult && !isStale) && (
          <div className="order-6 flex-grow-0 md:flex-grow-0 text-center">
            <Button
              type="button"
              onClick={onOpenReportDialog}
              size="sm"
              variant="outline"
              className="text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight"
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Make Report
            </Button>
          </div>
        )}
        
        {(analysisResult && !isStale) && (
           <div className="order-7 flex-grow-0 md:flex-grow-0 text-center">
            <Button
              type="button"
              onClick={onAddNewLink}
              size="sm"
              variant="outline"
              className="text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight border-primary/50 text-primary/90 hover:bg-primary/10"
            >
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Add Another Link
            </Button>
          </div>
        )}

      </div>
      {clientFormErrors.clearanceThreshold &&
        <p className="text-xs text-destructive mt-0.5 text-center px-2">
          {clientFormErrors.clearanceThreshold.message}
        </p>
      }
      {analysisResult && !isClearBasedOnAnalysis && actualMinClearance !== null && !isNaN(minRequiredClearance) && !isStale && (
        <div className="text-center text-los-failure text-[0.7rem] py-0.5">
          Add&nbsp;
          <span className="font-semibold">{deficit.toFixed(0)}m</span>
          &nbsp;to tower(s) for clearance.
        </div>
      )}

      <div className={cn("flex-1 min-h-0 p-0.5")}>
        {analysisResult ? (
          <CustomProfileChart
            key={chartKey}
            data={analysisResult.profile}
            pointAName={pointANameDisplay}
            pointBName={pointBNameDisplay}
            isStale={isStale}
            totalDistanceKm={analysisResult.distanceKm}
            isActionPending={isActionPending}
            onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
          />
        ) : isActionPending ? (
          <div className="h-full flex items-center justify-center p-2 bg-muted/30 rounded-md">
            <p className="text-muted-foreground text-xs text-center">Loading analysis data...</p>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-2 text-xs text-muted-foreground">
            <p>Select a link and perform analysis to see profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface BottomPanelProps {
  analysisResult: AnalysisResult | null;
  isPanelGloballyVisible: boolean;
  onToggleGlobalVisibility: () => void;
  isContentExpanded: boolean;
  onToggleContentExpansion: () => void;
  isStale?: boolean;
  onAnalyzeSubmit: () => void; 
  isActionPending: boolean;
  onTowerHeightChangeFromGraph: (siteId: 'pointA' | 'pointB', newHeight: number) => void;
  onOpenReportDialog: () => void;
  onAddNewLink: () => void; 
  currentDistanceKm: number | null;
  selectedLinkClearanceThreshold?: number;
  selectedLinkPointA?: LOSLinkPoint;
  selectedLinkPointB?: LOSLinkPoint;
}

export default function BottomPanel({
  analysisResult,
  isPanelGloballyVisible,
  onToggleGlobalVisibility,
  isContentExpanded,
  onToggleContentExpansion,
  isStale,
  onAnalyzeSubmit,
  isActionPending,
  onTowerHeightChangeFromGraph,
  onOpenReportDialog,
  onAddNewLink,
  currentDistanceKm,
  selectedLinkClearanceThreshold,
  selectedLinkPointA,
  selectedLinkPointB,
}: BottomPanelProps) {

  const { control } = useFormContext<AnalysisFormValues>(); 
  const pointANameWatch = useWatch({ control, name: 'pointA.name', defaultValue: selectedLinkPointA?.name || "Site A" });
  const pointBNameWatch = useWatch({ control, name: 'pointB.name', defaultValue: selectedLinkPointB?.name || "Site B" });


  return (
    <form 
      noValidate
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-slate-700/60 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out print:hidden",
        isPanelGloballyVisible ? "transform translate-y-0" : "transform translate-y-full",
        "z-[50]"
      )}
    >
      <div
        className={cn(
          "w-full overflow-hidden transition-[height] duration-500 ease-in-out",
          isContentExpanded && isPanelGloballyVisible ? "h-[33vh]" : "h-0"
        )}
      >
        <div className="p-1.5 md:p-2 h-full overflow-hidden">
          <div className="flex flex-row md:grid md:grid-cols-[minmax(200px,_1fr)_minmax(300px,_2fr)_minmax(200px,_1fr)] gap-1.5 h-full overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none custom-scrollbar">
            <div className="flex-shrink-0 w-auto md:w-auto snap-start p-1 md:p-0 order-1">
              <SiteInputGroup id="pointA" />
            </div>
            <div className="flex-shrink-0 w-auto md:w-auto snap-start order-2">
              <ProfilePanelMiddleColumn
                analysisResult={analysisResult}
                isStale={isStale}
                isActionPending={isActionPending}
                onAnalyzeSubmit={onAnalyzeSubmit}
                pointANameWatch={pointANameWatch}
                pointBNameWatch={pointBNameWatch}
                onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
                onOpenReportDialog={onOpenReportDialog}
                onAddNewLink={onAddNewLink}
                currentDistanceKm={currentDistanceKm}
                selectedLinkClearanceThreshold={selectedLinkClearanceThreshold}
              />
            </div>
            <div className="flex-shrink-0 w-auto md:w-auto snap-start p-1 md:p-0 order-3">
              <SiteInputGroup id="pointB" />
            </div>
          </div>
        </div>
      </div>
      {isPanelGloballyVisible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-0 p-1.5 bg-slate-800/50 backdrop-blur-sm rounded-t-lg border-t border-x border-slate-700/50 shadow-lg cursor-pointer hover:bg-slate-700/70 group"
          onClick={onToggleContentExpansion}
          aria-label={isContentExpanded ? "Collapse Panel Content" : "Expand Panel Content"}
        >
          {isContentExpanded ?
            <ChevronDown className="h-4 w-4 text-slate-300 group-hover:text-slate-100" /> :
            <ChevronUp className="h-4 w-4 text-slate-300 group-hover:text-slate-100" />}
        </div>
      )}
    </form>
  );
}


    
