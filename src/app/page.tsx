
"use client";

import React, { useState, useEffect, useActionState, useCallback, useTransition } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import InteractiveMap from '@/components/fso/interactive-map';
import BottomPanel from '@/components/fso/bottom-panel'; 

import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, PointCoordinates, AnalysisFormValues as PageAnalysisFormValues } from '@/types'; // Use existing PageAnalysisFormValues
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Info, Eye, EyeOff } from 'lucide-react';

// Zod schema for individual point (remains the same)
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

// Updated Zod schema for the whole form (remains the same)
const PageAnalysisFormSchema = z.object({
  pointA: StationPointSchema,
  pointB: StationPointSchema,
  clearanceThreshold: z.string().min(1, "Clearance is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
});


export default function Home() {
  const initialState: AnalysisResult | { error: string; fieldErrors?: any } = { error: "No analysis performed yet." };
  const [serverState, formAction, isActionPending] = useActionState(performLosAnalysis, initialState);
  const [, startTransition] = useTransition();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);

  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(true);

  const { register, handleSubmit, formState: { errors: clientFormErrors }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: {
      pointA: { name: 'Site A', lat: '32.23085', lng: '76.144608', height: 20 },
      pointB: { name: 'Site B', lat: '32.231875', lng: '76.151969', height: 58 }, // Updated Point B height
      clearanceThreshold: '10',
    },
  });

  const watchedPointA = useWatch({ control, name: 'pointA' });
  const watchedPointB = useWatch({ control, name: 'pointB' });

  const processSubmit = (data: PageAnalysisFormValues) => {
    setClientError(null);
    setFormErrors(undefined);

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
        // Only set clientError if it's not the initial "No analysis" message,
        // or if an analysis was actually attempted (isActionPending was true or analysisResult exists)
        if (serverState.error !== "No analysis performed yet." || analysisResult || isActionPending) {
            setClientError(serverState.error);
        }
        if (serverState.fieldErrors) {
          setFormErrors(serverState.fieldErrors as Record<string, string[] | undefined>);
        } else {
          setFormErrors(undefined);
        }
        // Don't clear analysisResult if the error is the initial "No analysis" message
        // and no analysis was actually run.
        if (serverState.error !== "No analysis performed yet.") {
            setAnalysisResult(null);
        }
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
        if (!isBottomPanelVisible) setIsBottomPanelVisible(true);
      }
    }
  // getValues and isBottomPanelVisible are stable or setters, including them minimally.
  // serverState is the primary trigger. analysisResult and isActionPending are for conditional logic.
  }, [serverState, getValues, isBottomPanelVisible, analysisResult, isActionPending]);


  // Effect to auto-trigger analysis on initial load
  useEffect(() => {
    // Only auto-trigger if no analysis has been done yet (analysisResult is null)
    // and no action is currently pending, and the server state is the initial one.
    if (!analysisResult && !isActionPending && serverState?.error?.includes("No analysis performed yet.")) {
      const defaultFormValues = getValues(); // Get default values from the form
      const formData = new FormData();
      formData.append('pointA.name', defaultFormValues.pointA.name);
      formData.append('pointA.lat', defaultFormValues.pointA.lat);
      formData.append('pointA.lng', defaultFormValues.pointA.lng);
      formData.append('pointA.height', String(defaultFormValues.pointA.height));
      formData.append('pointB.name', defaultFormValues.pointB.name);
      formData.append('pointB.lat', defaultFormValues.pointB.lat);
      formData.append('pointB.lng', defaultFormValues.pointB.lng);
      formData.append('pointB.height', String(defaultFormValues.pointB.height));
      formData.append('clearanceThreshold', defaultFormValues.clearanceThreshold);

      startTransition(() => {
        formAction(formData);
      });
    }
    // Dependencies:
    // analysisResult: to check if analysis already ran
    // isActionPending: to avoid triggering if something is already running
    // serverState: to check the initial message
    // getValues, formAction, startTransition: stable functions from hooks
    // Empty array [] is usually for "on mount", but since we read state, it's better to list dependencies.
    // However, we want this to run truly once on initial load logic.
    // So, we use an eslint-disable for a controlled single run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
    setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true });
    setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true });
  }, [setValue]);

  const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
    setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true });
    setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true });
  }, [setValue]);
  
  const mapContainerHeightClass = isBottomPanelVisible && analysisResult ? 'h-[calc(100%-35vh)]' : 'h-full';

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InteractiveMap
          pointA={watchedPointA ? { lat: parseFloat(watchedPointA.lat), lng: parseFloat(watchedPointA.lng), name: watchedPointA.name } : undefined}
          pointB={watchedPointB ? { lat: parseFloat(watchedPointB.lat), lng: parseFloat(watchedPointB.lng), name: watchedPointB.name } : undefined}
          losPossible={analysisResult?.losPossible}
          onMarkerDragEndA={handleMarkerDragEndA}
          onMarkerDragEndB={handleMarkerDragEndB}
          mapContainerClassName={`relative flex-grow ${mapContainerHeightClass} transition-all duration-300 ease-in-out`}
        />

        {clientError && clientError !== "No analysis performed yet." && (
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

         {isActionPending && !analysisResult && (!clientError || clientError === "No analysis performed yet.") && (
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

        {(analysisResult || (!clientError || clientError === "No analysis performed yet.")) && (
          <BottomPanel
            analysisResult={analysisResult}
            isVisible={isBottomPanelVisible}
            onToggle={() => setIsBottomPanelVisible(!isBottomPanelVisible)}
            
            control={control}
            register={register}
            handleSubmit={handleSubmit}
            processSubmit={processSubmit}
            clientFormErrors={clientFormErrors}
            serverFormErrors={formErrors}
            isActionPending={isActionPending}
            getValues={getValues}
            setValue={setValue}
          />
        )}
         {!analysisResult && clientError && clientError !== "No analysis performed yet." && (
             <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setIsBottomPanelVisible(!isBottomPanelVisible);
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
    

    