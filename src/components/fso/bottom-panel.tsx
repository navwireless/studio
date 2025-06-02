
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
import { ChevronDown, ChevronUp, Target, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  <Card className="bg-transparent backdrop-blur-2px shadow-none border-0 h-full flex flex-col p-1 md:p-2 w-full"> {/* Ensure full width for scroll item */}
    <CardHeader className="p-1">
      <CardTitle className="text-xs flex items-center text-slate-100/90 uppercase tracking-wider font-medium">
        <Target className="mr-1.5 h-3.5 w-3.5 text-primary/70" /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-1 space-y-1.5 text-xs flex-grow overflow-y-auto pr-1 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div>
          <Label htmlFor={`${id}.name`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal">Name</Label>
          <Input 
            id={`${id}.name`} 
            {...register(`${id}.name`)} 
            placeholder="e.g. Main Site" 
            className="mt-0.5 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0" 
          />
          {(clientFormErrors[id]?.name || serverFormErrors?.[`${id}.name`]) && 
            <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.name, serverFormErrors?.[`${id}.name`])}</p>}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <Label htmlFor={`${id}.lat`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal">Latitude</Label>
            <Input 
              id={`${id}.lat`} 
              {...register(`${id}.lat`)} 
              placeholder="-90 to 90" 
              className="mt-0.5 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0" 
            />
            {(clientFormErrors[id]?.lat || serverFormErrors?.[`${id}.lat`]) && 
              <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.lat, serverFormErrors?.[`${id}.lat`])}</p>}
          </div>
          <div>
            <Label htmlFor={`${id}.lng`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal">Longitude</Label>
            <Input 
              id={`${id}.lng`} 
              {...register(`${id}.lng`)} 
              placeholder="-180 to 180" 
              className="mt-0.5 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0" 
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

interface AnalysisActionProps { // Renamed from AnalysisSettings as Fresnel input is moved
  isActionPending: boolean;
  handleSubmit: UseFormHandleSubmit<AnalysisFormValues>;
  processSubmit: (data: AnalysisFormValues) => void;
}

const AnalysisAction: React.FC<AnalysisActionProps> = ({ 
  isActionPending,
  handleSubmit,
  processSubmit
}) => (
  <div className="h-full flex flex-col items-center justify-center p-1 bg-transparent backdrop-blur-2px rounded-lg w-full"> {/* Ensure full width for scroll item */}
    <CardTitle className="text-sm flex items-center mb-2 text-primary/80 uppercase tracking-wider font-medium">
      <Settings className="mr-1.5 h-4 w-4" /> Actions
    </CardTitle>
    {/* Fresnel input removed from here */}
    <div className="pt-2">
      <Button
        type="submit"
        onClick={handleSubmit(processSubmit)}
        disabled={isActionPending}
        className="bg-primary/80 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-normal text-center leading-tight"
      >
        <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin" )} />
        Analyze LOS
      </Button>
    </div>
  </div>
);


interface BottomPanelProps {
  analysisResult: AnalysisResult | null;
  isPanelGloballyVisible: boolean; // New prop to control overall visibility
  onToggleGlobalVisibility: () => void; // New prop
  isContentExpanded: boolean; // Renamed from isOpen for clarity
  onToggleContentExpansion: () => void; // Renamed from onToggle
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
  onTowerHeightChangeFromGraph,
}: BottomPanelProps) {
  
  const getCombinedError = (clientFieldError?: { message?: string }, serverFieldError?: string[]) => {
    if (serverFieldError && serverFieldError.length > 0) return serverFieldError.join(', ');
    return clientFieldError?.message;
  };
  
  const pointAName = useWatch({ control, name: 'pointA.name', defaultValue: analysisResult?.pointA?.name || "Site A" });
  const pointBName = useWatch({ control, name: 'pointB.name', defaultValue: analysisResult?.pointB?.name || "Site B" });
  
  const watchedClearanceThresholdString = useWatch({ control, name: 'clearanceThreshold', defaultValue: analysisResult?.clearanceThresholdUsed?.toString() || "10" });
  const minRequiredClearance = parseFloat(watchedClearanceThresholdString) || 0;

  let isClearBasedOnAnalysis = false;
  let deficit = 0;
  let actualMinClearance = 0;

  if (analysisResult && analysisResult.minClearance !== null) {
    actualMinClearance = analysisResult.minClearance;
    const thresholdUsedForComparison = analysisResult.clearanceThresholdUsed ?? minRequiredClearance;
    isClearBasedOnAnalysis = actualMinClearance >= thresholdUsedForComparison;
    deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(thresholdUsedForComparison - actualMinClearance);
  }

  return (
    <form 
      onSubmit={handleSubmit(processSubmit)} 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/60 rounded-t-2xl transition-transform duration-300 ease-in-out hover:bg-slate-800/90 print:hidden",
        isPanelGloballyVisible ? "transform translate-y-0" : "transform translate-y-full"
      )}
    >
      <div className="absolute top-1 right-1 z-40"> {/* Ensure button is above content */}
        <button
          type="button" 
          onClick={onToggleGlobalVisibility} // Use new prop to hide/show whole panel
          className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/70 backdrop-blur-sm text-slate-200/80 hover:text-white transition-all duration-200"
          aria-label={isPanelGloballyVisible ? "Hide Analysis Panel" : "Show Analysis Panel"}
        >
          {isPanelGloballyVisible ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div 
        className={cn(
          "w-full overflow-hidden transition-[height] duration-500 ease-in-out",
          isContentExpanded ? "h-[45vh]" : "h-0" // This controls the content area's height
        )}
      >
        {/* Responsive container for sections: Grid on md+, Flex row with horizontal scroll on smaller screens */}
        <div className="p-1.5 md:p-2 h-full overflow-y-hidden md:overflow-y-auto"> {/* Hide y-scroll on mobile for x-scroll */}
           <div className="flex md:grid md:grid-cols-[23%_minmax(0,1fr)_23%] gap-1.5 h-full overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none custom-scrollbar">
            
            <div className="flex-shrink-0 w-full md:w-auto snap-start p-1 md:p-0">
              <SiteInputGroup 
                id="pointA" 
                title={pointAName} 
                control={control} 
                register={register}
                clientFormErrors={clientFormErrors}
                serverFormErrors={serverFormErrors}
                getCombinedError={getCombinedError}
              />
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto snap-start flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-2px rounded-lg p-1 md:p-0">
              
              {analysisResult && (
                <div className="flex flex-col md:flex-row items-center justify-around py-1 md:py-2 px-2 md:px-3 border-b border-slate-700/50 mb-1">
                  <div className="flex-shrink-0 mb-1 md:mb-0">
                    {isStale ? (
                      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-yellow-600/30 text-yellow-400/90"> 
                        NEEDS RE-ANALYZE
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-semibold",
                          isClearBasedOnAnalysis
                            ? "bg-emerald-500/30 text-emerald-300/90"
                            : "bg-rose-500/30 text-rose-300/90"
                        )}
                      >
                        {isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"}
                      </span>
                    )}
                  </div>

                  {/* Re-Analyze button made smaller and less prominent in this middle section for mobile */}
                  <div className="flex-grow flex justify-center my-1 md:my-0 md:mx-2">
                    <Button
                      type="submit"
                      disabled={isActionPending}
                      className="bg-primary/80 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none hover:shadow-md transition-all duration-200"
                    >
                      <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")} />
                      Re-Analyze
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 md:space-x-4 text-xs">
                    <div className="flex flex-col items-center">
                      <span className="uppercase tracking-wider text-slate-400/90 text-[0.6rem] md:text-[0.65rem] font-medium">Aerial Dist.</span>
                      <span className="font-bold text-slate-100 text-xs md:text-sm">
                        {analysisResult.distanceKm < 1
                          ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m`
                          : `${analysisResult.distanceKm.toFixed(1)}km`}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="uppercase tracking-wider text-slate-400/90 text-[0.6rem] md:text-[0.65rem] font-medium">Min. Clear.</span>
                      <span className={cn(
                        "font-bold text-xs md:text-sm",
                        isStale ? "text-slate-400" : (isClearBasedOnAnalysis ? "text-emerald-400" : "text-rose-400")
                      )}>
                        {actualMinClearance.toFixed(1)}m
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {analysisResult && !isClearBasedOnAnalysis && analysisResult.minClearance !== null && (
                <div className="text-center text-rose-300/80 text-[0.7rem] py-0.5"> 
                  Add&nbsp;
                  <span className="font-semibold">{deficit}m</span>
                  &nbsp;to tower(s) for clearance.
                </div>
              )}
              
              <div className={cn(
                "flex-1 min-h-0 p-0.5", 
                analysisResult && isStale && "opacity-60 pointer-events-none" 
              )}>
                {analysisResult && !isActionPending ? ( 
                  <CustomProfileChart
                    data={analysisResult.profile}
                    pointAName={pointAName}
                    pointBName={pointBName}
                    isStale={isStale}
                    totalDistanceKm={analysisResult.distanceKm}
                    isActionPending={false} 
                    onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
                  />
                ) : isActionPending ? ( 
                    <div className="h-full flex items-center justify-center p-2 bg-muted/30 rounded-md">
                        <p className="text-muted-foreground text-xs text-center">Loading analysis data...</p>
                    </div>
                ) : ( // Show AnalysisAction (re-analyze button area) if no result and not pending
                  <AnalysisAction
                    isActionPending={isActionPending}
                    handleSubmit={handleSubmit}
                    processSubmit={processSubmit}
                  />
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto snap-start p-1 md:p-0">
              <SiteInputGroup 
                id="pointB" 
                title={pointBName} 
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
      {/* Button to toggle content expansion, shown when panel is globally visible */}
      {isPanelGloballyVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 md:hidden">
             <button
                type="button"
                onClick={onToggleContentExpansion}
                className="p-1.5 rounded-full bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 hover:text-white transition-all"
                aria-label={isContentExpanded ? "Collapse Panel Content" : "Expand Panel Content"}
             >
                {isContentExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
             </button>
        </div>
      )}
    </form>
  );
}
