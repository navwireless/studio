
"use client";

import React, { useState, useEffect, useActionState, useCallback, useTransition, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

import InteractiveMap from '@/components/fso/interactive-map';
import BottomPanel from '@/components/fso/bottom-panel';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, PointCoordinates, AnalysisFormValues as PageAnalysisFormValues, PointInput } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';

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

function pointsEqual(p1?: PointCoordinates, p2?: PointCoordinates, precision = 6) {
  if (!p1 || !p2) return false;
  const p1Lat = Number(p1.lat);
  const p1Lng = Number(p1.lng);
  const p2Lat = Number(p2.lat);
  const p2Lng = Number(p2.lng);

  if (isNaN(p1Lat) || isNaN(p1Lng) || isNaN(p2Lat) || isNaN(p2Lng)) return false;

  return (
    p1Lat.toFixed(precision) === p2Lat.toFixed(precision) &&
    p1Lng.toFixed(precision) === p2Lng.toFixed(precision)
  );
}

export default function Home() {
  const initialState: AnalysisResult | { error: string; fieldErrors?: any } = { error: "No analysis performed yet." };
  const [serverState, formAction, isActionPending] = useActionState(performLosAnalysis, initialState);
  const [startTransition, isTransitionPending] = useTransition(); // Added isTransitionPending for clarity if needed

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);
  const [isStale, setIsStale] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true); 
  const [hasFirstAnalysisCompleted, setHasFirstAnalysisCompleted] = useState(false);
  const [initialAnalysisPerformed, setInitialAnalysisPerformed] = useState(false);


  const { register, handleSubmit, formState: { errors: clientFormErrors, isValid }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onChange', 
  });

  const processSubmit = useCallback((data: PageAnalysisFormValues) => {
    if (isActionPending) return;

    console.log("[page.tsx] processSubmit called with data:", data);
    setAnalysisResult(null); 
    setClientError(null);
    setFormErrors(undefined);
    setIsStale(false); 

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
  }, [isActionPending, formAction, startTransition]);
  
  const watchedPointA = useWatch({ control, name: 'pointA' });
  const watchedPointB = useWatch({ control, name: 'pointB' });
  const watchedClearanceThreshold = useWatch({ control, name: 'clearanceThreshold' });


  // Effect for initial analysis on mount
  useEffect(() => {
    if (!initialAnalysisPerformed && !isActionPending) {
      console.log("page.tsx: Triggering initial LOS analysis on mount...");

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
      
      setInitialAnalysisPerformed(true); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAnalysisPerformed, formAction, isActionPending, startTransition]);


  useEffect(() => {
    if (!serverState) return;
  
    if ('error' in serverState && serverState.error) {
      const errorToSet = serverState.error;
      const suppressInitialMessage = errorToSet === "No analysis performed yet." && (analysisResult !== null || isActionPending || initialAnalysisPerformed);
  
      if (!suppressInitialMessage) {
        setClientError(errorToSet);
      }
      
      if (serverState.fieldErrors) {
        setFormErrors(serverState.fieldErrors as Record<string, string[] | undefined>);
      } else if (!suppressInitialMessage) { 
        setFormErrors(undefined); 
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
      
      if (JSON.stringify(analysisResult) !== JSON.stringify(newAnalysisData)) {
        setAnalysisResult(newAnalysisData);
      }
      
      setClientError(null);
      setFormErrors(undefined);
      setIsStale(false); 
  
      if (newAnalysisData && !hasFirstAnalysisCompleted) {
        setIsPanelOpen(true); 
        setHasFirstAnalysisCompleted(true);
      }
    }
  }, [serverState, getValues, hasFirstAnalysisCompleted, setIsPanelOpen, analysisResult, isActionPending, initialAnalysisPerformed]);


  useEffect(() => {
    if (!analysisResult) {
      setIsStale(false);
      return;
    }

    const currentFormValues = getValues();
    // Ensure all parts of pointA and pointB are defined before parsing
    if (!currentFormValues.pointA?.lat || !currentFormValues.pointA?.lng || currentFormValues.pointA?.height === undefined ||
        !currentFormValues.pointB?.lat || !currentFormValues.pointB?.lng || currentFormValues.pointB?.height === undefined ||
        !currentFormStateValues.clearanceThreshold) {
      setIsStale(false); // Not enough data to compare, assume not stale
      return;
    }

    const formLatA = parseFloat(currentFormValues.pointA.lat);
    const formLngA = parseFloat(currentFormValues.pointA.lng);
    const formHeightA = currentFormValues.pointA.height;

    const formLatB = parseFloat(currentFormValues.pointB.lat);
    const formLngB = parseFloat(currentFormValues.pointB.lng);
    const formHeightB = currentFormValues.pointB.height;
    
    const formClearance = parseFloat(currentFormValues.clearanceThreshold);

    const formPointAForCompare: PointCoordinates = { lat: formLatA, lng: formLngA };
    const formPointBForCompare: PointCoordinates = { lat: formLatB, lng: formLngB };

    const analyzedPointA = analysisResult.pointA;
    const analyzedPointB = analysisResult.pointB;

    if (!analyzedPointA || !analyzedPointB) { // Should not happen if analysisResult is set
        setIsStale(false);
        return;
    }

    const pointsAEqualResult = pointsEqual(formPointAForCompare, analyzedPointA);
    const pointsBEqualResult = pointsEqual(formPointBForCompare, analyzedPointB);

    const heightAEqual = formHeightA === analyzedPointA?.towerHeight;
    const heightBEqual = formHeightB === analyzedPointB?.towerHeight;
    const clearanceEqual = formClearance === analysisResult.clearanceThresholdUsed;
    
    if (!pointsAEqualResult || !pointsBEqualResult || !heightAEqual || !heightBEqual || !clearanceEqual) {
      setIsStale(true);
    } else {
      setIsStale(false);
    }
  }, [watchedPointA, watchedPointB, watchedClearanceThreshold, analysisResult, getValues]);

  const handleMarkerDragStart = useCallback(() => {
    setAnalysisResult(null);
    setClientError(null);
  }, []);

  const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
    setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    handleSubmit(processSubmit)();
  }, [setValue, handleSubmit, processSubmit]);

  const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
    setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    handleSubmit(processSubmit)();
  }, [setValue, handleSubmit, processSubmit]);
  
  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    if (isActionPending) {
      console.log("Drag update skipped: An action is already pending.");
      return;
    }
    console.log(`[page.tsx] handleTowerHeightChangeFromGraph called for ${siteId} with new height: ${newHeight}`);

    const clampedHeight = Math.max(0, Math.min(100, parseFloat(newHeight.toFixed(1))));

    setValue(siteId === 'pointA' ? 'pointA.height' : 'pointB.height', clampedHeight, {
      shouldValidate: true,
      shouldTouch: true,
      shouldDirty: true,
    });
    
    console.log(`[page.tsx] Form value for ${siteId}.height set to:`, clampedHeight);
    
    const currentValues = getValues();
    console.log("[page.tsx] Triggering re-analysis with current form values from tower drag:", currentValues);
    processSubmit(currentValues);
  }, [setValue, isActionPending, getValues, processSubmit]);


  const mapContainerHeightClass = isPanelOpen && analysisResult ? 'h-[calc(100%_-_45vh)]' : 'h-full';

  const formPointAForMap = watchedPointA && !isNaN(parseFloat(watchedPointA.lat)) && !isNaN(parseFloat(watchedPointA.lng))
    ? { lat: parseFloat(watchedPointA.lat), lng: parseFloat(watchedPointA.lng), name: watchedPointA.name }
    : undefined;
  const formPointBForMap = watchedPointB && !isNaN(parseFloat(watchedPointB.lat)) && !isNaN(parseFloat(watchedPointB.lng))
    ? { lat: parseFloat(watchedPointB.lat), lng: parseFloat(watchedPointB.lng), name: watchedPointB.name }
    : undefined;

  const analyzedDataForMap = analysisResult ? {
    pointA: { lat: analysisResult.pointA.lat, lng: analysisResult.pointA.lng },
    pointB: { lat: analysisResult.pointB.lat, lng: analysisResult.pointB.lng },
    losPossible: analysisResult.losPossible
  } : null;

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <InteractiveMap
          pointA={formPointAForMap} 
          pointB={formPointBForMap} 
          analyzedData={analyzedDataForMap} 
          isStale={isStale}
          isActionPending={isActionPending}
          onMarkerDragStartA={handleMarkerDragStart}
          onMarkerDragStartB={handleMarkerDragStart}
          onMarkerDragEndA={handleMarkerDragEndA}
          onMarkerDragEndB={handleMarkerDragEndB}
          mapContainerClassName={`relative flex-grow ${mapContainerHeightClass} transition-all duration-300 ease-in-out`}
        />

        {isActionPending && (
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-40">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-slate-200 text-lg font-medium">Loading Analysis Data...</p>
                <p className="text-slate-400 text-sm">Please wait a moment.</p>
            </div>
        )}

        {clientError && clientError !== "No analysis performed yet." && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-2">
                <Card className="shadow-lg border-destructive bg-destructive/30 backdrop-blur-md text-destructive-foreground">
                    <CardHeader className="py-2 px-4 flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center"><Info className="mr-2 h-4 w-4" /> Error</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                        <p className="text-sm">{clientError}</p>
                        {formErrors && Object.keys(formErrors).length > 0 && (
                        <ul className="list-disc list-inside mt-1 text-xs opacity-80">
                            {Object.entries(formErrors).map(([field, errors]) =>
                                errors?.map((error, index) => <li key={`${field}-${index}`}>{`${field.replace('pointA.','A: ').replace('pointB.','B: ')}: ${error}`}</li>)
                            )}
                        </ul>
                        )}
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
            isStale={isStale}
            onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
          />
      </div>
    </div>
  );
}

    