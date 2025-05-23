
"use client";

import React, { useState, useEffect, useActionState, useCallback, useTransition } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// import ResultsDisplay from '@/components/fso/results-display'; // Replaced by BottomPanel
import InteractiveMap from '@/components/fso/interactive-map';
// import ElevationProfileChart from '@/components/fso/elevation-profile-chart'; // Now part of BottomPanel
import BottomPanel from '@/components/fso/bottom-panel';
import TowerHeightControl from '@/components/fso/tower-height-control';
import ProductCatalog from '@/components/fso/product-catalog';
import BulkAnalysisView from '@/components/fso/bulk-analysis-view';


import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, PointCoordinates } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Zap, Target, Info, MapPinned, Settings, SlidersHorizontal, Eye, EyeOff, ShoppingCart, PanelLeftClose, PanelLeftOpen, BarChart3 } from 'lucide-react';

// Zod schema for individual point
const StationPointSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  lat: z.string()
    .min(1, "Latitude is required")
    .refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Must be -90 to 90"),
  lng: z.string()
    .min(1, "Longitude is required")
    .refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Must be -180 to 180"),
  height: z.number().min(0, "Min 0m").max(100, "Max 100m"),
});

// Updated Zod schema for the whole form
const PageAnalysisFormSchema = z.object({
  pointA: StationPointSchema,
  pointB: StationPointSchema,
  clearanceThreshold: z.string().min(1, "Clearance is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
});

type PageAnalysisFormValues = z.infer<typeof PageAnalysisFormSchema>;

export default function Home() {
  const initialState: AnalysisResult | { error: string; fieldErrors?: any } = { error: "No analysis performed yet." };
  const [serverState, formAction, isActionPending] = useActionState(performLosAnalysis, initialState);
  const [, startTransition] = useTransition();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);

  const [isInputPanelOpen, setIsInputPanelOpen] = useState(true);
  const [activeMainTool, setActiveMainTool] = useState<'singleLink' | 'bulkAnalysis'>('singleLink');
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(true);


  const { register, handleSubmit, formState: { errors: clientFormErrors }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: {
      pointA: { name: 'Site A', lat: '32.23085', lng: '76.144608', height: 20 },
      pointB: { name: 'Site B', lat: '32.231875', lng: '76.151969', height: 20 },
      clearanceThreshold: '10',
    },
  });

  const watchedPointA = useWatch({ control, name: 'pointA' });
  const watchedPointB = useWatch({ control, name: 'pointB' });

  const processSubmit = (data: PageAnalysisFormValues) => {
    setClientError(null);
    setFormErrors(undefined);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('pointA.name', data.pointA.name);
    formData.append('pointA.lat', data.pointA.lat);
    formData.append('pointA.lng', data.pointA.lng);
    formData.append('pointA.height', String(data.pointA.height));
    formData.append('pointB.name', data.pointB.name);
    formData.append('pointB.lat', data.pointB.lat);
    formData.append('pointB.lng', data.pointB.lng);
    formData.append('pointB.height', String(data.pointB.height));
    formData.append('clearanceThreshold', data.clearanceThreshold);

    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (serverState) {
      if ('error' in serverState && serverState.error) {
        setClientError(serverState.error);
        if (serverState.fieldErrors) {
          setFormErrors(serverState.fieldErrors as Record<string, string[] | undefined>);
        } else {
          setFormErrors(undefined);
        }
        setAnalysisResult(null);
      } else if (!('error' in serverState)) {
        const resultData = serverState as AnalysisResult;
        const formValues = getValues();
        setAnalysisResult({
            ...resultData,
            pointA: {
                ...resultData.pointA,
                name: formValues.pointA.name,
                lat: parseFloat(formValues.pointA.lat),
                lng: parseFloat(formValues.pointA.lng),
                towerHeight: formValues.pointA.height
            },
            pointB: {
                ...resultData.pointB,
                name: formValues.pointB.name,
                lat: parseFloat(formValues.pointB.lat),
                lng: parseFloat(formValues.pointB.lng),
                towerHeight: formValues.pointB.height
            }
        });
        setClientError(null);
        setFormErrors(undefined);
        if (!isBottomPanelVisible) setIsBottomPanelVisible(true); // Show panel on new result
      }
    }
  }, [serverState, getValues, isBottomPanelVisible]);

  const getCombinedError = (clientFieldError?: { message?: string }, serverFieldError?: string[]) => {
    if (serverFieldError && serverFieldError.length > 0) return serverFieldError.join(', ');
    return clientFieldError?.message;
  };

  const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
    setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true });
    setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true });
  }, [setValue]);

  const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
    setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true });
    setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true });
  }, [setValue]);

  const renderSiteInputGroup = (id: 'pointA' | 'pointB', title: string) => (
    <Card className="bg-card/70 border-none shadow-none">
      <CardHeader className="p-3">
        <CardTitle className="text-lg flex items-center">
          <Target className="mr-2 h-5 w-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div>
          <Label htmlFor={`${id}.name`} className="text-xs">Name</Label>
          <Input id={`${id}.name`} {...register(`${id}.name`)} placeholder="e.g. Main Site" className="mt-1 bg-input/70 h-9 text-sm" />
          {(clientFormErrors[id]?.name || formErrors?.[`${id}.name`]) && <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.name, formErrors?.[`${id}.name`])}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <Label htmlFor={`${id}.lat`} className="text-xs">Latitude</Label>
            <Input id={`${id}.lat`} {...register(`${id}.lat`)} placeholder="-90 to 90" className="mt-1 bg-input/70 h-9 text-sm" />
            {(clientFormErrors[id]?.lat || formErrors?.[`${id}.lat`]) && <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.lat, formErrors?.[`${id}.lat`])}</p>}
          </div>
          <div>
            <Label htmlFor={`${id}.lng`} className="text-xs">Longitude</Label>
            <Input id={`${id}.lng`} {...register(`${id}.lng`)} placeholder="-180 to 180" className="mt-1 bg-input/70 h-9 text-sm" />
            {(clientFormErrors[id]?.lng || formErrors?.[`${id}.lng`]) && <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.lng, formErrors?.[`${id}.lng`])}</p>}
          </div>
        </div>
        <Controller
          name={`${id}.height`}
          control={control}
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
        {(clientFormErrors[id]?.height || formErrors?.[`${id}.height`]) && <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.height, formErrors?.[`${id}.height`])}</p>}
      </CardContent>
    </Card>
  );

  const mapContainerHeightClass = isBottomPanelVisible ? 'h-[calc(100%-35vh)]' : 'h-full';

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className={`bg-card border-r border-border transition-all duration-300 ease-in-out ${isInputPanelOpen ? 'w-full md:w-[380px]' : 'w-0 md:w-[0px]'} overflow-hidden relative`}>
        <ScrollArea className="h-full">
          <div className="p-1">
             <div className="p-3 sticky top-0 bg-card z-20 border-b border-border">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold flex items-center">
                        <MapPinned className="mr-2 h-6 w-6 text-primary"/> Configuration
                    </h2>
                     <Button variant="ghost" size="icon" onClick={() => setIsInputPanelOpen(false)} className="md:hidden">
                        <PanelLeftClose className="h-5 w-5"/>
                    </Button>
                </div>
            </div>

            {activeMainTool === 'singleLink' ? (
              <form onSubmit={handleSubmit(processSubmit)} className="space-y-4 p-3">
                {renderSiteInputGroup('pointA', "Site A Parameters")}
                <Separator className="my-3"/>
                {renderSiteInputGroup('pointB', "Site B Parameters")}
                <Separator className="my-3"/>
                <Card className="bg-card/70 border-none shadow-none">
                  <CardHeader className="p-3">
                    <CardTitle className="text-lg flex items-center">
                      <Settings className="mr-2 h-5 w-5 text-primary" /> Analysis Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div>
                      <Label htmlFor="clearanceThreshold" className="text-xs">Min. Fresnel Clearance (m)</Label>
                      <Input id="clearanceThreshold" type="number" step="any" {...register('clearanceThreshold')} placeholder="e.g., 10" className="mt-1 bg-input/70 h-9 text-sm" />
                      {(clientFormErrors.clearanceThreshold || formErrors?.clearanceThreshold) && <p className="text-xs text-destructive mt-1">{getCombinedError(clientFormErrors.clearanceThreshold, formErrors?.clearanceThreshold)}</p>}
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" disabled={isActionPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-base">
                  {isActionPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                  Analyze Line of Sight
                </Button>
              </form>
            ) : (
                <BulkAnalysisView />
            )}
             <div className="p-3 mt-4">
                <ProductCatalog />
             </div>
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
         {!isInputPanelOpen && (
            <Button variant="outline" size="icon" onClick={() => setIsInputPanelOpen(true)} className="absolute top-2 left-2 z-20 bg-card hover:bg-accent md:hidden">
                <PanelLeftOpen className="h-5 w-5"/>
            </Button>
        )}
        <InteractiveMap
          pointA={watchedPointA ? { lat: parseFloat(watchedPointA.lat), lng: parseFloat(watchedPointA.lng), name: watchedPointA.name } : undefined}
          pointB={watchedPointB ? { lat: parseFloat(watchedPointB.lat), lng: parseFloat(watchedPointB.lng), name: watchedPointB.name } : undefined}
          losPossible={analysisResult?.losPossible}
          onMarkerDragEndA={handleMarkerDragEndA}
          onMarkerDragEndB={handleMarkerDragEndB}
          mapContainerClassName={`relative flex-grow ${mapContainerHeightClass} transition-all duration-300 ease-in-out`}
        />

        {/* Error display remains as an overlay for immediate feedback */}
        {clientError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-2">
                <Card className="shadow-lg border-destructive bg-destructive/20 backdrop-blur-sm">
                    <CardHeader className="py-2 px-4 flex-row items-center justify-between">
                        <CardTitle className="text-destructive text-sm flex items-center"><Info className="mr-2 h-4 w-4" /> Error</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                        <p className="text-sm text-destructive-foreground">{clientError}</p>
                        {formErrors && Object.keys(formErrors).length > 0 && (
                        <ul className="list-disc list-inside mt-1 text-xs text-destructive-foreground/80">
                            {Object.entries(formErrors).map(([field, errors]) =>
                                errors?.map((error, index) => <li key={`${field}-${index}`}>{`${field.replace('pointA.','A: ').replace('pointB.','B: ')}: ${error}`}</li>)
                            )}
                        </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}
         {isActionPending && !analysisResult && !clientError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-sm px-2">
                <Card className="shadow-lg bg-card/80 backdrop-blur-sm animate-pulse">
                    <CardHeader className="py-3 px-4"><Skeleton className="h-5 w-3/4" /></CardHeader>
                    <CardContent className="px-4 pb-3 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            </div>
        )}

        {analysisResult && !clientError && (
          <BottomPanel
            analysisResult={analysisResult}
            isVisible={isBottomPanelVisible}
            onToggle={() => setIsBottomPanelVisible(!isBottomPanelVisible)}
            pointAName={getValues('pointA.name') || 'Site A'}
            pointBName={getValues('pointB.name') || 'Site B'}
          />
        )}
        {/* Button to toggle panel if it's not part of the panel itself, or for alternative control */}
        {/* This button could be removed if the panel's internal button is sufficient */}
         <Button
          variant="outline"
          size="sm"
          onClick={() => setIsBottomPanelVisible(!isBottomPanelVisible)}
          className="absolute bottom-4 right-4 z-40 bg-card hover:bg-accent md:hidden" // Hide on md+ if panel has its own toggle
          // Consider visibility based on whether analysisResult exists
        >
          {isBottomPanelVisible ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {isBottomPanelVisible ? 'Hide' : 'Show'} Panel
        </Button>
      </div>
    </div>
  );
}
