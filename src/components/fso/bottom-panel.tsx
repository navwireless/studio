
"use client";

import type { Control, UseFormRegister, UseFormHandleSubmit, UseFormGetValues, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import type { AnalysisResult, AnalysisFormValues } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TowerHeightControl from './tower-height-control';
import ElevationProfileChart from './elevation-profile-chart';
import { ChevronDown, Target, Settings, Loader2, Info } from 'lucide-react';
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
  analysisResult 
}) => (
  <Card className="bg-transparent backdrop-blur-sm shadow-none border-0 h-full flex flex-col p-1">
    <CardHeader className="p-1.5">
      <CardTitle className="text-sm flex items-center text-slate-100 uppercase tracking-wider font-medium">
        <Target className="mr-1.5 h-3.5 w-3.5 text-primary/80" /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-1.5 space-y-1 text-xs flex-grow overflow-y-auto pr-1 flex flex-col justify-between">
      <div className="space-y-1.5">
        <div>
          <Label htmlFor={`${id}.name`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/80 font-normal">Name</Label>
          <Input 
            id={`${id}.name`} 
            {...register(`${id}.name`)} 
            placeholder="e.g. Main Site" 
            className="mt-0.5 bg-slate-700/30 border-b border-slate-500/70 focus:border-primary placeholder:text-slate-400/70 text-slate-100 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0" 
          />
          {(clientFormErrors[id]?.name || serverFormErrors?.[`${id}.name`]) && 
            <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.name, serverFormErrors?.[`${id}.name`])}</p>}
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <Label htmlFor={`${id}.lat`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/80 font-normal">Latitude</Label>
            <Input 
              id={`${id}.lat`} 
              {...register(`${id}.lat`)} 
              placeholder="-90 to 90" 
              className="mt-0.5 bg-slate-700/30 border-b border-slate-500/70 focus:border-primary placeholder:text-slate-400/70 text-slate-100 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0" 
            />
            {(clientFormErrors[id]?.lat || serverFormErrors?.[`${id}.lat`]) && 
              <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors[id]?.lat, serverFormErrors?.[`${id}.lat`])}</p>}
          </div>
          <div>
            <Label htmlFor={`${id}.lng`} className="text-[0.7rem] uppercase tracking-wider text-slate-300/80 font-normal">Longitude</Label>
            <Input 
              id={`${id}.lng`} 
              {...register(`${id}.lng`)} 
              placeholder="-180 to 180" 
              className="mt-0.5 bg-slate-700/30 border-b border-slate-500/70 focus:border-primary placeholder:text-slate-400/70 text-slate-100 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0" 
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
      <div className={cn("pt-1.5", id === 'pointA' ? 'self-start' : 'self-end')}>
        <Button
          type="submit"
          disabled={isActionPending}
          variant="outline"
          size="sm"
          className="bg-slate-700/40 hover:bg-slate-600/60 backdrop-blur-sm text-slate-100/90 hover:text-white text-[0.7rem] font-medium px-2.5 py-1 h-7 rounded-md shadow-none border border-slate-600/70 hover:border-slate-500/90 transition-all duration-200"
        >
          <Loader2 className={cn("mr-1 h-3 w-3", !isActionPending && "hidden", isActionPending && "animate-spin" )} />
          {analysisResult ? "Re-Analyze LOS" : "Analyze LOS"}
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface AnalysisSettingsProps {
  register: UseFormRegister<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: any, serverError?: string[]) => string | undefined;
  isActionPending: boolean;
}

const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({ 
  register, 
  clientFormErrors, 
  serverFormErrors, 
  getCombinedError,
  isActionPending 
}) => (
  <div className="h-full flex flex-col items-center justify-center p-1 bg-transparent backdrop-blur-sm rounded-lg"> 
    <CardTitle className="text-sm flex items-center mb-2 text-primary/80 uppercase tracking-wider font-medium">
      <Settings className="mr-1.5 h-4 w-4" /> Analysis Settings
    </CardTitle>
    <div className="w-full space-y-1 max-w-[180px] mx-auto"> 
      <div>
        <Label htmlFor="clearanceThreshold" className="text-[0.7rem] uppercase tracking-wider text-slate-300/80 font-normal">Min. Fresnel Cl (m)</Label>
        <Input
          id="clearanceThreshold"
          type="number"
          step="any"
          {...register('clearanceThreshold')}
          placeholder="e.g., 10"
          className="mt-0.5 bg-slate-700/30 border-b border-slate-500/70 focus:border-primary placeholder:text-slate-400/70 text-slate-100 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0 w-full"
        />
        {(clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) &&
          <p className="text-xs text-destructive/80 mt-0.5">{getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)}</p>}
      </div>
    </div>
    <div className="pt-2">
      <Button
        type="submit"
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
}

export default function BottomPanel({ 
  analysisResult, 
  isOpen, 
  onToggle,
  isStale,
  control,
  register,
  handleSubmit,
  processSubmit, 
  clientFormErrors,
  serverFormErrors,
  isActionPending,
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
      className="fixed bottom-0 left-0 right-0 z-30 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/60 rounded-t-2xl transition-all duration-200 hover:bg-slate-800/90"
    >
      <div className="absolute top-1 right-1 z-10">
        <button
          type="button" 
          onClick={onToggle}
          className="p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/70 backdrop-blur-sm text-slate-200/80 hover:text-white transition-all duration-200"
          aria-label={isOpen ? "Hide Analysis Panel" : "Show Analysis Panel"}
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
            
            <div className="flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-sm rounded-lg">
              
              {analysisResult && (
                <>
                  <div className="pt-1.5 pb-1 flex justify-center">
                    <Button
                      type="submit"
                      disabled={isActionPending}
                      className="bg-primary/80 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 h-7 rounded-md shadow-none transition-all duration-200"
                    >
                      <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")} />
                      Re-Analyze LOS
                    </Button>
                  </div>
                  <div className="flex justify-evenly items-center py-1 px-2 text-xs bg-transparent">
                    {isStale ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[0.65rem] font-medium bg-yellow-600/30 text-yellow-400/90">
                          NEEDS RE-ANALYZE
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full text-[0.65rem] font-medium",
                            isClearBasedOnAnalysis
                              ? "bg-emerald-500/30 text-emerald-300/90"
                              : "bg-rose-500/30 text-rose-300/90"
                          )}
                        >
                          {isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"}
                        </span>
                      )}
                    
                    <div className="flex flex-col items-center">
                      <span className="uppercase tracking-wider text-slate-300/80 text-[0.6rem] font-normal">Aerial Distance</span>
                      <span className="font-medium text-slate-100 text-[0.7rem]">
                        {analysisResult.distanceKm < 1
                          ? `${(analysisResult.distanceKm * 1000).toFixed(1)} m`
                          : `${analysisResult.distanceKm.toFixed(2)} km`}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="uppercase tracking-wider text-slate-300/80 text-[0.6rem] font-normal">Min. Clearance</span>
                      <span className={cn(
                        "font-medium text-[0.7rem]",
                        isStale ? "text-slate-400/80" : (isClearBasedOnAnalysis ? "text-emerald-300/90" : "text-rose-300/90")
                      )}>
                        {actualMinClearance.toFixed(1)} m
                      </span>
                    </div>
                  </div>
                </>
              )}
              {analysisResult && !isClearBasedOnAnalysis && analysisResult.minClearance !== null && (
                <div className="text-center text-rose-300/80 text-[0.7rem] py-0.5"> 
                  Add&nbsp;
                  <span className="font-semibold">{deficit} m</span>
                  &nbsp;to tower(s) for clearance.
                </div>
              )}
              
              <div className={cn(
                "flex-1 min-h-0 p-0.5", 
                isStale && analysisResult && "opacity-60 pointer-events-none" 
              )}>
                {analysisResult ? (
                  <ElevationProfileChart
                    data={analysisResult.profile}
                    pointAName={pointAName}
                    pointBName={pointBName}
                    isStale={isStale}
                  />
                ) : (
                  <AnalysisSettings
                    register={register}
                    clientFormErrors={clientFormErrors}
                    serverFormErrors={serverFormErrors}
                    getCombinedError={getCombinedError}
                    isActionPending={isActionPending}
                  />
                )}
              </div>
            </div>

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
    </form>
  );
}


    