
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
import { ChevronDown, Target, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SiteInputGroupProps {
  id: 'pointA' | 'pointB';
  title: string;
  control: Control<AnalysisFormValues>;
  register: UseFormRegister<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: any, serverError?: string[]) => string | undefined;
  isActionPending: boolean;
  analysisResult: AnalysisResult | null; 
}

const SiteInputGroup: React.FC<SiteInputGroupProps> = ({ 
  id, 
  title, 
  control, 
  register, 
  clientFormErrors, 
  serverFormErrors, 
  getCombinedError,
  isActionPending,
  analysisResult,
}) => (
  <Card className="bg-transparent backdrop-blur-2px shadow-none border-0 h-full flex flex-col p-1">
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
            disabled={isActionPending}
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
              disabled={isActionPending}
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
              disabled={isActionPending}
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
              disabled={isActionPending}
            />
          )}
        />
        {(clientFormErrors[id]?.height || serverFormErrors?.[`${id}.height`]) && 
          <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.height, serverFormErrors?.[`${id}.height`])}</p>}
      </div>
    </CardContent>
  </Card>
);

interface AnalysisSettingsProps {
  control: Control<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: any, serverError?: string[]) => string | undefined;
  isActionPending: boolean;
}

const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({ 
  control,
  clientFormErrors, 
  serverFormErrors, 
  getCombinedError,
  isActionPending,
}) => (
  <div className="h-full flex flex-col items-center justify-center p-1 bg-transparent backdrop-blur-2px rounded-lg"> 
    <CardTitle className="text-sm flex items-center mb-2 text-primary/80 uppercase tracking-wider font-medium">
      <Settings className="mr-1.5 h-4 w-4" /> Analysis Settings
    </CardTitle>
    <div className="w-full space-y-1 max-w-[180px] mx-auto"> 
      <div>
        <Label htmlFor="clearanceThreshold" className="text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal">Min. Fresnel Cl (m)</Label>
        <Controller
            name="clearanceThreshold"
            control={control}
            render={({ field }) => (
                <Input
                    id="clearanceThreshold"
                    type="number"
                    step="any"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="e.g., 10"
                    className="mt-0.5 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0 w-full"
                    disabled={isActionPending}
                />
            )}
        />
        {(clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) &&
          <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)}</p>}
      </div>
    </div>
    <div className="pt-2">
      <Button
        type="submit" // This button will submit the form
        disabled={isActionPending}
        className="bg-primary/80 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 h-7 rounded-md shadow-none transition-all duration-200"
      >
        <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin" )} />
        Analyze LOS
      </Button>
    </div>
  </div>
);


interface BottomPanelProps {
  analysisResult: AnalysisResult | null;
  isOpen: boolean; 
  onToggle: () => void; 
  isPanelGloballyVisible: boolean; 
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
  onTowerHeightChangeFromGraph?: (siteId: 'pointA' | 'pointB', newHeight: number) => void;
}

export default function BottomPanel({ 
  analysisResult, 
  isOpen, 
  onToggle, 
  isPanelGloballyVisible, 
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
  onTowerHeightChangeFromGraph
}: BottomPanelProps) {
  
  const getCombinedError = (clientFieldError?: { message?: string }, serverFieldError?: string[]) => {
    if (serverFieldError && serverFieldError.length > 0) return serverFieldError.join(', ');
    return clientFieldError?.message;
  };
  
  const pointAName = useWatch({ control, name: 'pointA.name', defaultValue: "Site A" });
  const pointBName = useWatch({ control, name: 'pointB.name', defaultValue: "Site B" });
  
  const watchedClearanceThresholdString = useWatch({ control, name: 'clearanceThreshold', defaultValue: "10" });
  const clearanceThresholdValue = parseFloat(watchedClearanceThresholdString) || 0;

  let isClearBasedOnAnalysis = false;
  let deficit = 0;
  let actualMinClearance = 0;

  if (analysisResult && analysisResult.minClearance !== null) {
    actualMinClearance = analysisResult.minClearance;
    const thresholdUsedForComparison = analysisResult.clearanceThresholdUsed ?? clearanceThresholdValue;
    isClearBasedOnAnalysis = actualMinClearance >= thresholdUsedForComparison;
    deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(thresholdUsedForComparison - actualMinClearance);
  }

  return (
    <form 
      onSubmit={handleSubmit(processSubmit)} 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/60 rounded-t-2xl transition-transform duration-500 ease-in-out transform",
        isPanelGloballyVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="absolute top-1 right-1 z-10">
        <button
          type="button" 
          onClick={onToggle} 
          className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/70 backdrop-blur-sm text-slate-200/80 hover:text-white transition-all duration-200"
          aria-label={isOpen ? "Hide Analysis Details" : "Show Analysis Details"}
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", !isOpen && "rotate-180")} />
        </button>
      </div>

      <div 
        className={cn(
          "w-full overflow-hidden transition-[height] duration-500 ease-in-out",
          isOpen ? "h-[45vh]" : "h-0" 
        )}
      >
        <div className="p-1.5 md:p-2 h-full overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-[23%_minmax(0,1fr)_23%] gap-1.5 h-full">
            
            <div className="h-full overflow-hidden">
              <SiteInputGroup 
                id="pointA" 
                title={pointAName} 
                control={control} 
                register={register}
                clientFormErrors={clientFormErrors}
                serverFormErrors={serverFormErrors}
                getCombinedError={getCombinedError}
                isActionPending={isActionPending}
                analysisResult={analysisResult}
              />
            </div>
            
            <div className="flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-2px rounded-lg">
              
              {analysisResult && (
                <div className="flex items-center justify-around py-2 px-3 border-b border-slate-700/50 mb-1">
                  <div className="flex-shrink-0">
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

                  <div className="flex-grow flex justify-center">
                    <Button
                      type="submit"
                      disabled={isActionPending}
                      className="bg-primary/90 hover:bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 h-8 rounded-md shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Loader2 className={cn("mr-2 h-4 w-4", !isActionPending && "hidden", isActionPending && "animate-spin")} />
                      Re-Analyze LOS
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex flex-col items-center">
                      <span className="uppercase tracking-wider text-slate-400/90 text-[0.65rem] font-medium">Aerial Distance</span>
                      <span className="font-bold text-slate-100 text-sm">
                        {analysisResult.distanceKm < 1
                          ? `${(analysisResult.distanceKm * 1000).toFixed(1)} m`
                          : `${analysisResult.distanceKm.toFixed(2)} km`}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="uppercase tracking-wider text-slate-400/90 text-[0.65rem] font-medium">Min. Clearance</span>
                      <span className={cn(
                        "font-bold text-sm",
                        isStale ? "text-slate-400" : (isClearBasedOnAnalysis ? "text-emerald-400" : "text-rose-400")
                      )}>
                        {actualMinClearance.toFixed(1)} m
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {analysisResult && !isClearBasedOnAnalysis && analysisResult.minClearance !== null && deficit > 0 && (
                <div className="text-center text-rose-300/80 text-[0.7rem] py-0.5"> 
                  Add&nbsp;
                  <span className="font-semibold">{deficit.toFixed(1)} m</span>
                  &nbsp;to tower(s) for clearance.
                </div>
              )}
              
              <div className={cn(
                "flex-1 min-h-0 p-0.5", 
                analysisResult && isStale && "opacity-60 pointer-events-none" 
              )}>
                {analysisResult ? ( 
                  <CustomProfileChart
                    data={analysisResult.profile}
                    pointAName={pointAName}
                    pointBName={pointBName}
                    isStale={isStale}
                    totalDistanceKm={analysisResult.distanceKm}
                    isActionPending={isActionPending} 
                    onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
                  />
                ) : isActionPending ? ( 
                    <div className="h-full flex flex-col items-center justify-center p-2 bg-muted/30 rounded-md">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                        <p className="text-muted-foreground text-sm">Performing analysis...</p>
                    </div>
                ) : ( 
                  <AnalysisSettings
                    control={control} 
                    clientFormErrors={clientFormErrors}
                    serverFormErrors={serverFormErrors}
                    getCombinedError={getCombinedError}
                    isActionPending={isActionPending}
                  />
                )}
              </div>
            </div>

            <div className="h-full overflow-hidden">
              <SiteInputGroup 
                id="pointB" 
                title={pointBName} 
                control={control} 
                register={register}
                clientFormErrors={clientFormErrors}
                serverFormErrors={serverFormErrors}
                getCombinedError={getCombinedError}
                isActionPending={isActionPending}
                analysisResult={analysisResult}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
