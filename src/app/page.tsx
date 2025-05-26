
"use client";

import React, { useState, useEffect, useActionState, useCallback, useTransition } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import InteractiveMap from '@/components/fso/interactive-map';
import BottomPanel from '@/components/fso/bottom-panel';

import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, PointCoordinates, AnalysisFormValues as PageAnalysisFormValues } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Info, Eye, EyeOff } from 'lucide-react';

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

// Zod schema for the whole form
const PageAnalysisFormSchema = z.object({
  pointA: StationPointSchema,
  pointB: StationPointSchema,
  clearanceThreshold: z.string().min(1, "Clearance is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
});

const defaultFormStateValues: PageAnalysisFormValues = {
  pointA: { name: 'Site A', lat: '32.23085', lng: '76.144608', height: 20 },
  pointB: { name: 'Site B', lat: '32.231875', lng: '76.151969', height: 58 },
  clearanceThreshold: '10',
};

// Debounce utility function
const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolve(func(...args));
      }, delay);
    });
  };
};


export default function Home() {
  const initialState: AnalysisResult | { error: string; fieldErrors?: any } = { error: "No analysis performed yet." };
  const [serverState, formAction, isActionPending] = useActionState(performLosAnalysis, initialState);
  const [, startTransition] = useTransition();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);

  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const { register, handleSubmit, formState: { errors: clientFormErrors, isValid, touchedFields }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onChange', // Important for reactive validation and triggering effects on valid changes
  });

  // Function to prepare FormData and call the server action
  const triggerAnalysis = useCallback((valuesToSubmit: PageAnalysisFormValues) => {
    if (isActionPending) return; // Don't trigger if already pending

    const formData = new FormData();
    formData.append('pointA.name', valuesToSubmit.pointA.name);
    formData.append('pointA.lat', valuesToSubmit.pointA.lat);
    formData.append('pointA.lng', valuesToSubmit.pointA.lng);
    formData.append('pointA.height', String(valuesToSubmit.pointA.height));
    formData.append('pointB.name', valuesToSubmit.pointB.name);
    formData.append('pointB.lat', valuesToSubmit.pointB.lat);
    formData.append('pointB.lng', valuesToSubmit.pointB.lng);
    formData.append('pointB.height', String(valuesToSubmit.pointB.height));
    formData.append('clearanceThreshold', valuesToSubmit.clearanceThreshold);

    startTransition(() => {
      formAction(formData);
    });
  }, [formAction, isActionPending, startTransition]);

  // Debounced version of triggerAnalysis
  const debouncedTriggerAnalysis = useCallback(debounce(triggerAnalysis, 300), [triggerAnalysis]);

  // Watch all relevant form values
  const watchedPointA = useWatch({ control, name: 'pointA' });
  const watchedPointB = useWatch({ control, name: 'pointB' });
  const watchedClearanceThreshold = useWatch({ control, name: 'clearanceThreshold' });

  // Effect for reactive analysis on form value changes
  useEffect(() => {
    const currentValues = getValues();
    // Ensure all critical values are present and the form is valid (or becoming valid)
    if (
      !currentValues.pointA?.lat || !currentValues.pointA?.lng || currentValues.pointA?.height === undefined ||
      !currentValues.pointB?.lat || !currentValues.pointB?.lng || currentValues.pointB?.height === undefined ||
      !currentValues.clearanceThreshold ||
      !isValid // Only proceed if the form is currently valid
    ) {
      return;
    }
    
    if (isActionPending) {
      return;
    }

    // Smart initial load: if it's the first time and matches defaults, trigger directly
    // Otherwise, for subsequent changes, use debounce.
    const isActuallyDefault = 
      currentValues.pointA.lat === defaultFormStateValues.pointA.lat &&
      currentValues.pointA.lng === defaultFormStateValues.pointA.lng &&
      // Compare other fields as needed if strict default check is required
      analysisResult === null &&
      (!serverState || (serverState && 'error' in serverState && serverState.error === "No analysis performed yet."));

    if (isActuallyDefault) {
      triggerAnalysis(currentValues);
    } else {
      // Check if any of the watched fields were actually touched/changed by the user or programmatically
      // This helps prevent triggering on initial default value setting if not intended
      const relevantFieldsTouched = 
        touchedFields.pointA?.lat || touchedFields.pointA?.lng || touchedFields.pointA?.height ||
        touchedFields.pointB?.lat || touchedFields.pointB?.lng || touchedFields.pointB?.height ||
        touchedFields.clearanceThreshold;

      if(relevantFieldsTouched || analysisResult !== null) { // Trigger if fields touched or if there's already a result (implies change from previous)
         debouncedTriggerAnalysis(currentValues);
      }
    }
  }, [
    watchedPointA, watchedPointB, watchedClearanceThreshold, // These trigger the effect
    getValues, isValid, isActionPending, analysisResult, serverState, touchedFields, // Used inside
    triggerAnalysis, debouncedTriggerAnalysis // Stable functions
  ]);


  // For the manual "Analyze LOS" button click
  const processSubmit = (data: PageAnalysisFormValues) => {
    setClientError(null);
    setFormErrors(undefined);
    triggerAnalysis(data); // Use the common non-debounced trigger function for immediate action
  };

  useEffect(() => {
    if (!serverState) return;

    if ('error' in serverState && serverState.error) {
      const errorToSet = serverState.error;
      // Don't set "No analysis performed yet" as a client error if an analysis is about to run or is pending
      const suppressInitialMessage = errorToSet === "No analysis performed yet." && (isActionPending || analysisResult === null);

      if (!suppressInitialMessage) {
        setClientError(errorToSet);
      }
      
      if (serverState.fieldErrors) {
        setFormErrors(serverState.fieldErrors as Record<string, string[] | undefined>);
      } else if (!suppressInitialMessage) { // Clear form errors only if not suppressed
        setFormErrors(undefined); 
      }

      if (errorToSet !== "No analysis performed yet." && analysisResult !== null) {
         setAnalysisResult(null); 
      }
    } else if (!('error' in serverState)) { 
      const resultDataFromServer = serverState as AnalysisResult;
      const currentFormValues = getValues();

      const newAnalysisData = {
        ...resultDataFromServer,
        pointA: {
          ...(resultDataFromServer.pointA || {} as any),
          name: currentFormValues.pointA.name,
          lat: parseFloat(currentFormValues.pointA.lat),
          lng: parseFloat(currentFormValues.pointA.lng),
          towerHeight: currentFormValues.pointA.height,
        },
        pointB: {
          ...(resultDataFromServer.pointB || {} as any), 
          name: currentFormValues.pointB.name,
          lat: parseFloat(currentFormValues.pointB.lat),
          lng: parseFloat(currentFormValues.pointB.lng),
          towerHeight: currentFormValues.pointB.height,
        },
      };
      
      if (analysisResult === null || 
          analysisResult.losPossible !== newAnalysisData.losPossible ||
          analysisResult.message !== newAnalysisData.message ||
          analysisResult.distanceKm !== newAnalysisData.distanceKm ||
          analysisResult.minClearance !== newAnalysisData.minClearance ||
          JSON.stringify(analysisResult.profile) !== JSON.stringify(newAnalysisData.profile)
          ) {
        setAnalysisResult(newAnalysisData);
      }
      
      setClientError(null);
      setFormErrors(undefined);
    }
  }, [serverState, getValues, isActionPending, analysisResult]);

  useEffect(() => {
    if (analysisResult && !isPanelOpen) {
      setIsPanelOpen(true); 
    }
  }, [analysisResult, isPanelOpen]);

  const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
    setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true });
    setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true });
  }, [setValue]);

  const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
    setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true });
    setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true });
  }, [setValue]);

  const mapContainerHeightClass = isPanelOpen && analysisResult ? 'h-[calc(100%_-_45vh)]' : 'h-full';

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InteractiveMap
          pointA={watchedPointA ? { lat: parseFloat(watchedPointA.lat), lng: parseFloat(watchedPointA.lng), name: watchedPointA.name } : undefined}
          pointB={watchedPointB ? { lat: parseFloat(watchedPointB.lat), lng: parseFloat(watchedPointB.lng), name: watchedPointB.name } : undefined}
          losPossible={analysisResult?.losPossible}
          onMarkerDragEndA={handleMarkerDragEndA}
          onMarkerDragEndB={handleMarkerDragEndB}
          mapContainerClassName={`relative flex-grow ${mapContainerHeightClass} transition-all duration-500 ease-in-out`}
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

        {(isActionPending && (!analysisResult || (analysisResult && clientError && clientError !== "No analysis performed yet.") ) ) && (
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
        
          <BottomPanel
            analysisResult={analysisResult}
            isOpen={isPanelOpen}
            onToggle={() => setIsPanelOpen(!isPanelOpen)}
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
      </div>
    </div>
  );
}
