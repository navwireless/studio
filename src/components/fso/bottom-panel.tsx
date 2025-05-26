
"use client";

import { type Control, type UseFormRegister, type UseFormHandleSubmit, type UseFormGetValues, type UseFormSetValue, type FieldErrors, Controller } from 'react-hook-form';
import type { AnalysisResult, AnalysisFormValues } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TowerHeightControl from './tower-height-control';
import ElevationProfileChart from './elevation-profile-chart';
import { ChevronDown, ChevronUp, Target, Settings, Zap, Loader2 } from 'lucide-react';


interface BottomPanelProps {
  analysisResult: AnalysisResult | null;
  isVisible: boolean;
  onToggle: () => void;
  
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

const SiteInputGroup: React.FC<{
  id: 'pointA' | 'pointB';
  title: string;
  control: Control<AnalysisFormValues>;
  register: UseFormRegister<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: any, serverError?: string[]) => string | undefined;
}> = ({ id, title, control, register, clientFormErrors, serverFormErrors, getCombinedError }) => (
  <Card className="bg-card/70 border-border shadow-md h-full flex flex-col">
    <CardHeader className="p-2">
      <CardTitle className="text-sm flex items-center">
        <Target className="mr-2 h-4 w-4 text-primary" /> {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-2 space-y-1.5 text-xs flex-grow overflow-y-auto pr-1">
      <div>
        <Label htmlFor={`${id}.name`} className="text-xs">Name</Label>
        <Input 
          id={`${id}.name`} 
          {...register(`${id}.name`)} 
          placeholder="e.g. Main Site" 
          className="mt-0.5 bg-input/70 h-8 text-xs" 
        />
        {(clientFormErrors[id]?.name || serverFormErrors?.[`${id}.name`]) && 
          <p className="text-xs text-destructive mt-0.5">{getCombinedError(clientFormErrors[id]?.name, serverFormErrors?.[`${id}.name`])}</p>}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <Label htmlFor={`${id}.lat`} className="text-xs">Latitude</Label>
          <Input 
            id={`${id}.lat`} 
            {...register(`${id}.lat`)} 
            placeholder="-90 to 90" 
            className="mt-0.5 bg-input/70 h-8 text-xs" 
          />
          {(clientFormErrors[id]?.lat || serverFormErrors?.[`${id}.lat`]) && 
            <p className="text-xs text-destructive mt-0.5">{getCombinedError(clientFormErrors[id]?.lat, serverFormErrors?.[`${id}.lat`])}</p>}
        </div>
        <div>
          <Label htmlFor={`${id}.lng`} className="text-xs">Longitude</Label>
          <Input 
            id={`${id}.lng`} 
            {...register(`${id}.lng`)} 
            placeholder="-180 to 180" 
            className="mt-0.5 bg-input/70 h-8 text-xs" 
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

// Renamed from AnalysisSettingsCard and props adapted
interface AnalysisSettingsProps {
  register: UseFormRegister<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>; // Assuming clientFormErrors is passed as 'errors'
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: any, serverError?: string[]) => string | undefined;
  isActionPending: boolean;
}

const AnalysisSettings: React.FC<AnalysisSettingsProps> = ({ 
  register, clientFormErrors, serverFormErrors, getCombinedError, isActionPending 
}) => (
  <div className="bg-card/70 border-border shadow-md mx-auto max-w-sm w-full my-auto p-3 rounded-md flex flex-col items-center justify-center h-full">
    <CardTitle className="text-sm flex items-center mb-2 text-primary">
      <Settings className="mr-1.5 h-4 w-4" /> Analysis Settings
    </CardTitle>
    <div className="w-full space-y-2">
      <div>
        <Label htmlFor="clearanceThreshold" className="text-xs">Min. Fresnel Clearance (m)</Label>
        <Input 
          id="clearanceThreshold" 
          type="number" 
          step="any" 
          {...register('clearanceThreshold')} 
          placeholder="e.g., 10" 
          className="mt-0.5 bg-input/70 h-8 text-xs w-full" 
        />
        {(clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) && 
          <p className="text-xs text-destructive mt-0.5">{getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)}</p>}
      </div>
      <Button type="submit" disabled={isActionPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs">
        {isActionPending ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Zap className="mr-1.5 h-3 w-3" />}
        Analyze LOS
      </Button>
    </div>
  </div>
);


export default function BottomPanel({ 
  analysisResult, 
  isVisible, 
  onToggle,
  control,
  register,
  handleSubmit,
  processSubmit,
  clientFormErrors,
  serverFormErrors,
  isActionPending,
  getValues,
}: BottomPanelProps) {
  
  const panelHeightClass = isVisible ? 'h-[38vh] md:h-[35vh]' : 'h-10';
  const contentVisibilityClass = isVisible ? 'opacity-100 visible' : 'opacity-0 invisible h-0';

  const getCombinedError = (clientFieldError?: { message?: string }, serverFieldError?: string[]) => {
    if (serverFieldError && serverFieldError.length > 0) return serverFieldError.join(', ');
    return clientFieldError?.message;
  };
  
  const pointAName = getValues('pointA.name') || (analysisResult?.pointA?.name || "Site A");
  const pointBName = getValues('pointB.name') || (analysisResult?.pointB?.name || "Site B");

  return (
    <form onSubmit={handleSubmit(processSubmit)} className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border shadow-2xl transition-all duration-300 ease-in-out ${panelHeightClass}`}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute top-1 left-1/2 -translate-x-1/2 z-40 bg-card hover:bg-accent text-xs px-2 py-1 h-auto"
        aria-label={isVisible ? "Hide Analysis Panel" : "Show Analysis Panel"}
      >
        {isVisible ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronUp className="mr-1 h-4 w-4" />}
        {isVisible ? 'Hide Panel' : 'Show Panel'}
      </Button>

      <div className={`pt-10 md:pt-8 p-2 md:p-3 transition-opacity duration-200 ease-in-out ${contentVisibilityClass} h-full`}>
        {isVisible && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full max-h-[calc(100%-2.5rem)]"> {/* Ensure gap-4 */}
            {/* Column 1: Site A Inputs */}
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

            {/* Column 2: Analysis Stats, Chart / Settings */}
            <div className="flex flex-col h-full overflow-hidden">
              {analysisResult && (
                <div className="flex flex-col items-center justify-center py-1 text-xs bg-background/50 rounded-t-md mb-1">
                  <div className={`font-semibold px-2 py-0.5 rounded-full text-xs mb-1 ${analysisResult.losPossible ? 'bg-los-success text-los-success-foreground' : 'bg-los-failure text-los-failure-foreground'}`}>
                    {analysisResult.losPossible ? 'LOS POSSIBLE' : 'LOS OBSTRUCTED'}
                  </div>
                  <div className="flex justify-evenly w-full">
                    <div className="flex flex-col items-center px-1">
                      <span className="uppercase tracking-wide text-muted-foreground text-[0.6rem]">Aerial Distance</span>
                      <span className="font-semibold text-foreground">
                        {analysisResult.distanceKm < 1
                          ? `${(analysisResult.distanceKm * 1000).toFixed(1)} m`
                          : `${analysisResult.distanceKm.toFixed(2)} km`}
                      </span>
                    </div>
                    <div className="flex flex-col items-center px-1">
                      <span className="uppercase tracking-wide text-muted-foreground text-[0.6rem]">Min. Clearance</span>
                      <span className={`font-semibold text-foreground ${
                        analysisResult.minClearance !== null && analysisResult.minClearance < analysisResult.clearanceThresholdUsed
                          ? 'text-los-failure'
                          : 'text-los-success'
                      }`}>
                        {analysisResult.minClearance !== null ? `${analysisResult.minClearance.toFixed(1)} m` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  {analysisResult.additionalHeightNeeded !== null && analysisResult.additionalHeightNeeded > 0 && (
                    <p className="text-[0.6rem] text-destructive mt-0.5">
                      Add. Height Needed: {analysisResult.additionalHeightNeeded.toFixed(1)}m (total)
                    </p>
                  )}
                </div>
              )}

              <div className="flex-1 min-h-0 bg-card/70 rounded-b-md"> {/* Added min-h-0 for flex child */}
                {analysisResult ? (
                  <ElevationProfileChart
                    data={analysisResult.profile}
                    pointAName={pointAName}
                    pointBName={pointBName}
                  />
                ) : (
                  <AnalysisSettings
                    register={register}
                    clientFormErrors={clientFormErrors} // Passed as errors
                    serverFormErrors={serverFormErrors}
                    getCombinedError={getCombinedError}
                    isActionPending={isActionPending}
                  />
                )}
              </div>
            </div>

            {/* Column 3: Site B Inputs */}
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
        )}
      </div>
    </form>
  );
}
