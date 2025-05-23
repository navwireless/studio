
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
  height: z.number().min(0, "Min 0m").max(100, "Max 100m"), // Updated range to 0-100m as per latest instructions for TowerHeightControl
});

// Zod schema for the whole form
const PageAnalysisFormSchema = z.object({
  pointA: StationPointSchema,
  pointB: StationPointSchema,
  clearanceThreshold: z.string().min(1, "Clearance is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
});

// Default values for initial load and auto-analysis
const defaultFormStateValues: PageAnalysisFormValues = {
  pointA: { name: 'Site A', lat: '32.23085', lng: '76.144608', height: 20 },
  pointB: { name: 'Site B', lat: '32.231875', lng: '76.151969', height: 58 },
  clearanceThreshold: '10',
};

export default function Home() {
  const initialState: AnalysisResult | { error: string; fieldErrors?: any } = { error: "No analysis performed yet." };
  const [serverState, formAction, isActionPending] = useActionState(performLosAnalysis, initialState);
  const [, startTransition] = useTransition();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);

  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(true); // Keep panel visible by default

  const { register, handleSubmit, formState: { errors: clientFormErrors }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: defaultFormStateValues,
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

  // Effect to process serverState and update local states like analysisResult, clientError, formErrors
  useEffect(() => {
    if (!serverState) return;

    if ('error' in serverState && serverState.error) {
      const errorToSet = serverState.error;
      const isSignificantError = errorToSet !== "No analysis performed yet.";
      
      // Display error if it's significant or an action was pending (user initiated)
      // or if there was a previous successful result being overwritten by an error.
      if (isSignificantError || isActionPending || (analysisResult !== null && errorToSet)) {
        setClientError(errorToSet);
      }

      if (serverState.fieldErrors) {
        setFormErrors(serverState.fieldErrors as Record<string, string[] | undefined>);
      } else {
        setFormErrors(undefined); // Clear previous field errors
      }

      // Clear analysisResult if a significant error occurred and there was a previous result or an action was pending.
      if (isSignificantError && (analysisResult !== null || isActionPending)) {
        setAnalysisResult(null);
      }
    } else if (!('error' in serverState)) { // serverState is AnalysisResult
      const resultDataFromServer = serverState as AnalysisResult;
      const currentFormValues = getValues(); // getValues is stable from react-hook-form

      const newAnalysisData = {
        ...resultDataFromServer,
        pointA: {
          ...(resultDataFromServer.pointA || {} as any), // Provide default empty object if pointA is missing
          name: currentFormValues.pointA.name,
          lat: parseFloat(currentFormValues.pointA.lat),
          lng: parseFloat(currentFormValues.pointA.lng),
          towerHeight: currentFormValues.pointA.height,
        },
        pointB: {
          ...(resultDataFromServer.pointB || {} as any), // Provide default empty object if pointB is missing
          name: currentFormValues.pointB.name,
          lat: parseFloat(currentFormValues.pointB.lat),
          lng: parseFloat(currentFormValues.pointB.lng),
          towerHeight: currentFormValues.pointB.height,
        },
      };
      
      // Only update if analysisResult is null or if the new data is different (simple check based on message or LOS status)
      // A more robust check might involve deep comparison or checking a unique ID from serverState if available.
      if (analysisResult === null || 
          analysisResult.losPossible !== newAnalysisData.losPossible ||
          analysisResult.message !== newAnalysisData.message ||
          analysisResult.distanceKm !== newAnalysisData.distanceKm) {
        setAnalysisResult(newAnalysisData);
      }
      
      setClientError(null);
      setFormErrors(undefined);
    }
    // Dependencies:
    // - serverState: The primary trigger from the server action.
    // - getValues: Stable function from RHF.
    // - isActionPending: To conditionally handle errors/updates.
    // - analysisResult: Used in conditions to determine if an error/update is "new".
    //   This is the tricky one. By checking if the new data is meaningfully different
    //   before calling setAnalysisResult, we aim to avoid the loop.
  }, [serverState, getValues, isActionPending, analysisResult, setAnalysisResult, setClientError, setFormErrors]);

  // Effect to manage bottom panel visibility based on analysisResult
  useEffect(() => {
    if (analysisResult && !isBottomPanelVisible) {
      setIsBottomPanelVisible(true);
    }
    // Optional: Hide panel if analysisResult becomes null (e.g. due to a new error)
    // else if (!analysisResult && isBottomPanelVisible && clientError && clientError !== "No analysis performed yet.") {
    //   setIsBottomPanelVisible(false); // Or keep it open to show errors
    // }
  }, [analysisResult, isBottomPanelVisible, setIsBottomPanelVisible, clientError]);


  // Effect to auto-trigger analysis on initial load
  useEffect(() => {
    if (!analysisResult && !isActionPending && serverState?.error?.includes("No analysis performed yet.")) {
      const formData = new FormData();
      formData.append('pointA.name', defaultFormStateValues.pointA.name);
      formData.append('pointA.lat', defaultFormStateValues.pointA.lat);
      formData.append('pointA.lng', defaultFormStateValues.pointA.lng);
      formData.append('pointA.height', String(defaultFormStateValues.pointA.height));
      formData.append('pointB.name', defaultFormStateValues.pointB.name);
      formData.append('pointB.lat', defaultFormStateValues.pointB.lat);
      formData.append('pointB.lng', defaultFormStateValues.pointB.lng);
      formData.append('pointB.height', String(defaultFormStateValues.pointB.height));
      formData.append('clearanceThreshold', defaultFormStateValues.clearanceThreshold);

      startTransition(() => {
        formAction(formData);
      });
    }
    // This effect should run once on mount.
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

        {/* Error Display Area */}
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

        {/* Loading Skeleton: Show if action is pending AND there's no current result OR if it's the initial "no analysis" state */}
         {isActionPending && (!analysisResult || (serverState?.error?.includes("No analysis performed yet."))) && (
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

        {/* Bottom Panel: Show if there's an analysis result OR if there's no significant client error forcing it to hide */}
        {/* This logic ensures panel remains for inputs even if initial auto-analysis hasn't finished or if user clears results by making invalid inputs */}
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
         {/* Mobile Toggle Button for Panel when there's an error and no result */}
         {!analysisResult && clientError && clientError !== "No analysis performed yet." && (
             <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    setIsBottomPanelVisible(!isBottomPanelVisible);
                    // Optionally clear client error when showing panel to re-input
                    // if (!isBottomPanelVisible && clientError) setClientError(null);
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
