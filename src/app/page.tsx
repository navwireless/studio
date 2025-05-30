"use client";

import React, { useState, useEffect, useActionState, useCallback, useTransition } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dynamic from 'next/dynamic'; // Import dynamic

import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, PointCoordinates, AnalysisFormValues, PointInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import components
const InteractiveMap = dynamic(() => import('@/components/fso/interactive-map'), {
  loading: () => <div className="w-full h-full flex items-center justify-center bg-muted"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Loading Map...</p></div>,
  ssr: false 
});

const BottomPanel = dynamic(() => import('@/components/fso/bottom-panel'), {
  loading: () => <div className="fixed bottom-0 left-0 right-0 h-[50px] flex items-center justify-center bg-slate-800/80 backdrop-blur-md z-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>,
  ssr: false 
});

const PointInputSchema = z.object({
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
  pointA: PointInputSchema,
  pointB: PointInputSchema,
  clearanceThreshold: z.string().min(1, "Clearance is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
});

const defaultFormStateValues: AnalysisFormValues = {
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
  
  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true); 
  
  const [hasFirstAnalysisCompleted, setHasFirstAnalysisCompleted] = useState(false);
  // const [initialAnalysisPerformed, setInitialAnalysisPerformed] = useState(false); // Removed: No auto-analysis on load

  const { register, handleSubmit, formState: { errors: clientFormErrors, isValid }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onChange', 
  });

  const processSubmit = useCallback((data: AnalysisFormValues) => {
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

  useEffect(() => {
    if (!serverState) return;
  
    if ('error' in serverState && serverState.error) {
      const errorToSet = serverState.error;
      // Avoid showing "No analysis performed yet" as an error if we just clicked the main button
      const suppressInitialMessage = errorToSet === "No analysis performed yet." && isAnalysisPanelGloballyOpen && !analysisResult;

      if (!suppressInitialMessage) {
        setClientError(errorToSet);
      }
      
      if (serverState.fieldErrors) {
        setFormErrors(serverState.fieldErrors as Record<string, string[] | undefined>);
      } else if (!suppressInitialMessage && errorToSet !== "No analysis performed yet.") { 
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
        // Panel is already opened by button click, ensure content is expanded
        setIsBottomPanelContentExpanded(true); 
        setHasFirstAnalysisCompleted(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverState, getValues, hasFirstAnalysisCompleted, isAnalysisPanelGloballyOpen ]);


  useEffect(() => {
    if (!analysisResult) {
      setIsStale(false);
      return;
    }
    
    const currentFormValues = getValues();
    if (
        !currentFormValues?.pointA?.lat || !currentFormValues?.pointA?.lng || currentFormValues?.pointA?.height === undefined ||
        !currentFormValues?.pointB?.lat || !currentFormValues?.pointB?.lng || currentFormValues?.pointB?.height === undefined ||
        !currentFormValues?.clearanceThreshold ||
        !analysisResult?.pointA?.lat || !analysisResult?.pointA?.lng || analysisResult?.pointA?.towerHeight === undefined ||
        !analysisResult?.pointB?.lat || !analysisResult?.pointB?.lng || analysisResult?.pointB?.towerHeight === undefined
    ) {
        setIsStale(false); 
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
    setAnalysisResult(null); // Clears previous analysis line from map
    setClientError(null);
  }, []);

  const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
    setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    // Analysis only on button click
  }, [setValue]);

  const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
    setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    // Analysis only on button click
  }, [setValue]);
  
  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
      if (isActionPending) {
        return;
      }
      const clampedHeight = Math.max(0, Math.min(100, parseFloat(newHeight.toFixed(1))));
      setValue(siteId === 'pointA' ? 'pointA.height' : 'pointB.height', clampedHeight, {
        shouldValidate: true,
        shouldTouch: true,
        shouldDirty: true,
      });
    }, [setValue, isActionPending ]);


  const mapContainerHeightClass = isAnalysisPanelGloballyOpen ? 'h-[calc(100%_-_45vh)]' : 'h-full';
  
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
    <div className="flex-1 flex flex-col overflow-hidden relative">
      
      <div className={`${mapContainerHeightClass} transition-all duration-300 ease-in-out`}>
        <InteractiveMap
          pointA={formPointAForMap} 
          pointB={formPointBForMap} 
          analyzedData={analyzedDataForMap} 
          isStale={isStale} // Pass isStale for map to decide on preview line
          isActionPending={isActionPending}
          onMarkerDragStartA={handleMarkerDragStart}
          onMarkerDragStartB={handleMarkerDragStart}
          onMarkerDragEndA={handleMarkerDragEndA}
          onMarkerDragEndB={handleMarkerDragEndB}
          mapContainerClassName="w-full h-full"
        />
      </div>

      {!isAnalysisPanelGloballyOpen && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <Button
            size="lg"
            className="px-8 py-4 text-lg font-semibold shadow-xl bg-primary hover:bg-primary/90 pointer-events-auto animate-pulse"
            onClick={() => {
              console.log("Check Feasibility button clicked, setting isAnalysisPanelGloballyOpen to true");
              setIsAnalysisPanelGloballyOpen(true);
              setIsBottomPanelContentExpanded(true); // Ensure content area is expanded when panel opens
            }}
          >
            Check OpticSpectra FSO Link Feasibility
          </Button>
        </div>
      )}
      
      {isActionPending && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-slate-200 text-lg font-medium">Loading Analysis Data...</p>
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
        
      {isAnalysisPanelGloballyOpen && ( // Conditionally render BottomPanel
        <BottomPanel
          analysisResult={analysisResult}
          isPanelGloballyVisible={isAnalysisPanelGloballyOpen} // This prop already controls slide-in/out
          isOpen={isBottomPanelContentExpanded} 
          onToggle={() => setIsBottomPanelContentExpanded(!isBottomPanelContentExpanded)}
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
      )}
    </div>
  );
}