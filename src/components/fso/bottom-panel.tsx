
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
}

const SiteInputGroup: React.FC<SiteInputGroupProps> = ({ id, title, control, register, clientFormErrors, serverFormErrors, getCombinedError }) => (
  <Card className="bg-transparent shadow-none border-0 h-full flex flex-col">
    <CardHeader className="p-1.5"> {/* Reduced padding */}
      <CardTitle className="text-sm flex items-center text-slate-100/90 uppercase tracking-wider">
        <Target className="mr-2 h-4 w-4 text-primary/80" /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-1.5 space-y-1 text-xs flex-grow overflow-y-auto pr-1"> {/* Reduced padding and spacing */}
      <div>
        <Label htmlFor={`${id}.name`} className="text-xs uppercase tracking-wider text-slate-400/80">Name</Label>
        <Input 
          id={`${id}.name`} 
          {...register(`${id}.name`)} 
          placeholder="e.g. Main Site" 
          className="mt-0.5 bg-slate-800/50 border-slate-700 placeholder:text-slate-400/60 text-slate-100/90 h-8 text-xs" 
        />
        {(clientFormErrors[id]?.name || serverFormErrors?.[`${id}.name`]) && 
          <p className="text-xs text-destructive mt-0.5">{getCombinedError(clientFormErrors[id]?.name, serverFormErrors?.[`${id}.name`])}</p>}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <Label htmlFor={`${id}.lat`} className="text-xs uppercase tracking-wider text-slate-400/80">Latitude</Label>
          <Input 
            id={`${id}.lat`} 
            {...register(`${id}.lat`)} 
            placeholder="-90 to 90" 
            className="mt-0.5 bg-slate-800/50 border-slate-700 placeholder:text-slate-400/60 text-slate-100/90 h-8 text-xs" 
          />
          {(clientFormErrors[id]?.lat || serverFormErrors?.[`${id}.lat`]) && 
            <p className="text-xs text-destructive mt-0.5">{getCombinedError(clientFormErrors[id]?.lat, serverFormErrors?.[`${id}.lat`])}</p>}
        </div>
        <div>
          <Label htmlFor={`${id}.lng`} className="text-xs uppercase tracking-wider text-slate-400/80">Longitude</Label>
          <Input 
            id={`${id}.lng`} 
            {...register(`${id}.lng`)} 
            placeholder="-180 to 180" 
            className="mt-0.5 bg-slate-800/50 border-slate-700 placeholder:text-slate-400/60 text-slate-100/90 h-8 text-xs" 
          />
          {(clientFormErrors[id]?.lng || serverFormErrors?.[`${id}.lng`]) && 
            <p className="text-xs text-destructive mt-0.5">{getCombinedError(clientFormErrors[id]?.lng, serverFormErrors?.[`${id}.lng`])}</p>}
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
        <p className="text-xs text-destructive mt-0.5">{getCombinedError(clientFormErrors[id]?.height, serverFormErrors?.[`${id}.height`])}</p>}
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

const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({ register, clientFormErrors, serverFormErrors, getCombinedError, isActionPending }) => (
  <div className="h-full flex flex-col items-center justify-center p-1.5"> {/* Reduced padding */}
    <CardTitle className="text-sm flex items-center mb-2 text-primary/80 uppercase tracking-wider">
      <Settings className="mr-1.5 h-4 w-4" /> Analysis Settings
    </CardTitle>
    <div className="w-full space-y-2 max-w-xs mx-auto">
      <div>
        <Label htmlFor="clearanceThreshold" className="text-xs uppercase tracking-wider text-slate-400/80">Min. Fresnel Clearance (m)</Label>
        <Input
          id="clearanceThreshold"
          type="number"
          step="any"
          {...register('clearanceThreshold')}
          placeholder="e.g., 10"
          className="mt-0.5 bg-slate-800/50 border-slate-700 placeholder:text-slate-400/60 text-slate-100/90 h-8 text-xs w-full"
        />
        {(clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) &&
          <p className="text-xs text-destructive mt-0.5">{getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)}</p>}
      </div>
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
    // Use the clearance threshold from the analysis result for determination, if available
    // Fallback to the form's current threshold if not (e.g. initial state or error)
    const thresholdUsedForComparison = analysisResult.clearanceThresholdUsed ?? minRequiredClearance;
    isClearBasedOnAnalysis = actualMinClearance >= thresholdUsedForComparison;
    deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(thresholdUsedForComparison - actualMinClearance);
  }

  return (
    <form 
      onSubmit={handleSubmit(processSubmit)} 
      className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/70 backdrop-blur-lg rounded-t-2xl border-t border-slate-700/50 transition-all duration-200 hover:bg-slate-900/80"
    >
      <div className="flex items-center justify-center py-0.5 relative z-10"> {/* Reduced padding */}
        <button
          type="button" 
          onClick={onToggle}
          className="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-300/70 hover:text-slate-100/90 px-2 py-0.5 transition-all duration-200"
          aria-label={isOpen ? "Hide Analysis Panel" : "Show Analysis Panel"}
        >
          <ChevronDown 
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-300", // Smaller icon
              !isOpen && "rotate-180" 
            )} 
          />
          {/* Text removed for icon-only feel, but can be added back if desired */}
          {/* {isOpen ? "Hide Panel" : "Show Panel"} */}
        </button>
      </div>

      <div 
        className={cn(
          "w-full overflow-hidden transition-[height] duration-500 ease-in-out",
          isOpen ? "h-[45vh]" : "h-0"
        )}
      >
        <div className="p-1.5 md:p-2 h-full overflow-y-auto"> {/* Reduced padding */}
           <div className="grid grid-cols-1 md:grid-cols-[25%_minmax(0,1fr)_25%] gap-2 h-full"> {/* Adjusted grid and reduced gap */}
            <div className="h-full overflow-hidden"> 
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

            <div className="flex flex-col h-full overflow-hidden"> {/* Center column flex container */}
              {!analysisResult && !isActionPending && ( 
                <div className="pt-1 pb-0.5 flex justify-center"> {/* Reduced padding */}
                  <Button
                    type="submit"
                    disabled={isActionPending}
                    className="bg-primary/80 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 h-7 rounded-md shadow-none transition-all duration-200"
                  >
                    <Loader2 className={cn("mr-1.5 h-3 w-3", isActionPending && "animate-spin" )} />
                    Analyze LOS
                  </Button>
                </div>
              )}

              {analysisResult && (
                <>
                  <div className="flex flex-col items-center justify-center py-1 text-xs bg-transparent rounded-t-md"> {/* Transparent bg */}
                    {isStale ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold bg-amber-500/30 text-amber-300/90 mb-0.5"> {/* Pill badge */}
                          NEEDS RE-ANALYZE
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold mb-0.5", // Pill badge
                            isClearBasedOnAnalysis
                              ? "bg-emerald-500/30 text-emerald-300/90"
                              : "bg-rose-500/30 text-rose-300/90"
                          )}
                        >
                          {isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"}
                        </span>
                      )}
                    <div className="flex justify-evenly w-full">
                      <div className="flex flex-col items-center px-1">
                        <span className="uppercase tracking-wider text-slate-400/80 text-[0.6rem]">Aerial Distance</span>
                        <span className="font-medium text-slate-100/90">
                          {analysisResult.distanceKm < 1
                            ? `${(analysisResult.distanceKm * 1000).toFixed(1)} m`
                            : `${analysisResult.distanceKm.toFixed(2)} km`}
                        </span>
                      </div>
                      <div className="flex flex-col items-center px-1">
                        <span className="uppercase tracking-wider text-slate-400/80 text-[0.6rem]">Min. Clearance</span>
                        <span className={cn(
                          "font-medium",
                          isStale ? "text-slate-400/80" : (isClearBasedOnAnalysis ? "text-emerald-300/90" : "text-rose-300/90")
                        )}>
                          {actualMinClearance.toFixed(1)} m
                        </span>
                      </div>
                    </div>
                  </div>
                  {analysisResult && !isStale && !isClearBasedOnAnalysis && analysisResult.minClearance !== null && (
                    <div className="text-center text-rose-300/90 text-xs py-0.5"> 
                      Add&nbsp;
                      <span className="font-semibold">{deficit} m</span>
                      &nbsp;to one or both towers to meet clearance.
                    </div>
                  )}
                </>
              )}
              
              <div className={cn(
                "flex-1 min-h-0 bg-transparent rounded-md p-0.5", // Transparent bg, reduced padding
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

              <div className="pt-1 pb-1 flex justify-center border-t border-slate-700/50 bg-transparent mt-auto"> {/* Transparent bg, mt-auto */}
                <Button
                  type="submit"
                  disabled={isActionPending}
                  className="bg-primary/80 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 h-7 rounded-md shadow-none transition-all duration-200"
                >
                  <Loader2 className={cn("mr-1.5 h-3 w-3", !isActionPending && "hidden", isActionPending && "animate-spin" )} />
                  {analysisResult ? "Re-Analyze LOS" : "Analyze LOS"}
                </Button>
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
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}


    