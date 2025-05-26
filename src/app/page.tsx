
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
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

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
  const [, startTransition] = useTransition();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);
  const [isStale, setIsStale] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [hasFirstAnalysisCompleted, setHasFirstAnalysisCompleted] = useState(false);


  const { register, handleSubmit, formState: { errors: clientFormErrors, isValid, touchedFields }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onChange', 
  });

  const processSubmit = (data: PageAnalysisFormValues) => {
    if (isActionPending) return;

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
  };
  
  const watchedPointA = useWatch({ control, name: 'pointA' });
  const watchedPointB = useWatch({ control, name: 'pointB' });
  const watchedClearanceThreshold = useWatch({ control, name: 'clearanceThreshold' });


  useEffect(() => {
    if (!serverState) return;
  
    if ('error' in serverState && serverState.error) {
      const errorToSet = serverState.error;
      const suppressInitialMessage = errorToSet === "No analysis performed yet." && (analysisResult !== null || isActionPending);
  
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
      
      // Only update analysisResult if it's truly new data to prevent loops
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
  // Dependencies: serverState is the primary trigger. getValues is stable.
  // hasFirstAnalysisCompleted and setIsPanelOpen are for the one-time panel open.
  }, [serverState, getValues, hasFirstAnalysisCompleted, setIsPanelOpen]);


  useEffect(() => {
    if (!analysisResult) {
      setIsStale(false);
      return;
    }

    const currentFormValues = getValues();
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
    // setIsStale(true); // Optionally set stale immediately, or let the useEffect handle it
  }, []);


  const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
    setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    handleSubmit(processSubmit)();
  }, [setValue, handleSubmit]);

  const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
    setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    handleSubmit(processSubmit)();
  }, [setValue, handleSubmit]);

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
          onMarkerDragStartA={handleMarkerDragStart}
          onMarkerDragStartB={handleMarkerDragStart}
          onMarkerDragEndA={handleMarkerDragEndA}
          onMarkerDragEndB={handleMarkerDragEndB}
          isActionPending={isActionPending}
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
            isStale={isStale}   
          />
      </div>
    </div>
  );
}
    

    