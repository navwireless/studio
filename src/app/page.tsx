
"use client";

import React, { useState, useEffect, useActionState, useCallback, useTransition } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import InteractiveMap from '@/components/fso/interactive-map';
import BottomPanel from '@/components/fso/bottom-panel'; // This will be the refactored analysis panel

import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, PointCoordinates } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Keep for potential error display
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Info, PanelLeftOpen, PanelLeftClose, Eye, EyeOff } from 'lucide-react'; // Removed unused icons

// Zod schema for individual point
const StationPointSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  lat: z.string()
    .min(1, "Latitude is required")
    .refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Must be -90 to 90"),
  lng: z.string()
    .min(1, "Longitude is required")
    .refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Must be -180 to 180"),
  height: z.number().min(0, "Min 0m").max(100, "Max 100m"), // Range from previous spec. Revisit if 10-200m is new req.
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

  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(true); // Controls the new bottom panel

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
    // Keep analysisResult null until successful response to prevent showing old data with new inputs
    // setAnalysisResult(null); 

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
        setAnalysisResult(null); // Clear previous results on error
      } else if (!('error' in serverState)) {
        const resultData = serverState as AnalysisResult;
        const formValues = getValues();
        setAnalysisResult({
            ...resultData,
            pointA: { // Ensure point names and current form values are in the result
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


  const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
    setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true });
    setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true });
  }, [setValue]);

  const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
    setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true });
    setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true });
  }, [setValue]);
  
  // Map container height: if bottom panel is visible, map takes less height.
  // The bottom panel has a fixed height of 35vh when visible.
  const mapContainerHeightClass = isBottomPanelVisible && analysisResult ? 'h-[calc(100%-35vh)]' : 'h-full';

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Main content area: Map fills this, BottomPanel overlays it */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InteractiveMap
          pointA={watchedPointA ? { lat: parseFloat(watchedPointA.lat), lng: parseFloat(watchedPointA.lng), name: watchedPointA.name } : undefined}
          pointB={watchedPointB ? { lat: parseFloat(watchedPointB.lat), lng: parseFloat(watchedPointB.lng), name: watchedPointB.name } : undefined}
          losPossible={analysisResult?.losPossible}
          onMarkerDragEndA={handleMarkerDragEndA}
          onMarkerDragEndB={handleMarkerDragEndB}
          mapContainerClassName={`relative flex-grow ${mapContainerHeightClass} transition-all duration-300 ease-in-out`}
        />

        {/* Error display remains as an overlay for immediate feedback if not handled by bottom panel */}
        {clientError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-2">
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
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-2">
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

        {/* Render BottomPanel if there's an analysis result or if explicitly toggled for input */}
        {/* For now, let's always render it if analysisResult exists, or if no error and user wants to input */}
        {(analysisResult || !clientError) && (
          <BottomPanel
            analysisResult={analysisResult}
            isVisible={isBottomPanelVisible}
            onToggle={() => setIsBottomPanelVisible(!isBottomPanelVisible)}
            
            // Form related props
            control={control}
            register={register}
            handleSubmit={handleSubmit}
            processSubmit={processSubmit}
            clientFormErrors={clientFormErrors}
            serverFormErrors={formErrors}
            isActionPending={isActionPending}
            getValues={getValues} // Pass getValues to populate names in BottomPanel
            setValue={setValue} // Pass setValue for potential direct updates from panel
          />
        )}
         {/* Fallback toggle button if analysisResult is null but user might want to open panel for input */}
         {!analysisResult && clientError && (
             <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setIsBottomPanelVisible(!isBottomPanelVisible);
                    // If opening panel due to error, clear clientError so form can be tried again
                    if (!isBottomPanelVisible && clientError) setClientError(null);
                }}
                className="absolute bottom-4 right-4 z-40 bg-card hover:bg-accent md:hidden"
                >
                {isBottomPanelVisible ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {isBottomPanelVisible ? 'Hide Panel' : 'Show Panel'}
            </Button>
         )}
      </div>
    </div>
  );
}

    