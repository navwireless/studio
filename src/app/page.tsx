
"use client";

import React, { useState, useEffect, useActionState, useCallback, useTransition, useRef } from 'react';
// import { useForm, Controller, useWatch } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { cn } from '@/lib/utils';

// import InteractiveMap from '@/components/fso/interactive-map';
// import BottomPanel from '@/components/fso/bottom-panel';
// import { performLosAnalysis } from '@/app/actions';
// import type { AnalysisResult, PointCoordinates, AnalysisFormValues as PageAnalysisFormValues, PointInput } from '@/types';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Loader2, Info } from 'lucide-react';

// const StationPointSchema = z.object({
//   name: z.string().min(1, "Name is required").max(50, "Name too long"),
//   lat: z.string()
//     .min(1, "Latitude is required")
//     .refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Must be -90 to 90"),
//   lng: z.string()
//     .min(1, "Longitude is required")
//     .refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Must be -180 to 180"),
//   height: z.number().min(0, "Min 0m").max(100, "Max 100m"),
// });

// const PageAnalysisFormSchema = z.object({
//   pointA: StationPointSchema,
//   pointB: StationPointSchema,
//   clearanceThreshold: z.string().min(1, "Clearance is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
// });

// const defaultFormStateValues: PageAnalysisFormValues = {
//   pointA: { name: 'Site A', lat: '32.23085', lng: '76.144608', height: 20 },
//   pointB: { name: 'Site B', lat: '32.231875', lng: '76.151969', height: 58 },
//   clearanceThreshold: '10',
// };

// function pointsEqual(p1?: PointCoordinates, p2?: PointCoordinates, precision = 6) {
//   if (!p1 || !p2) return false;
//   const p1Lat = Number(p1.lat);
//   const p1Lng = Number(p1.lng);
//   const p2Lat = Number(p2.lat);
//   const p2Lng = Number(p2.lng);

//   if (isNaN(p1Lat) || isNaN(p1Lng) || isNaN(p2Lat) || isNaN(p2Lng)) return false;

//   return (
//     p1Lat.toFixed(precision) === p2Lat.toFixed(precision) &&
//     p1Lng.toFixed(precision) === p2Lng.toFixed(precision)
//   );
// }

export default function Home() {
  // const initialState: AnalysisResult | { error: string; fieldErrors?: any } = { error: "No analysis performed yet." };
  // const [serverState, formAction, isActionPending] = useActionState(performLosAnalysis, initialState);
  // const [, startTransition] = useTransition();

  // const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  // const [clientError, setClientError] = useState<string | null>(null);
  // const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);
  
  // const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
  // const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true); 
  
  // const [hasFirstAnalysisCompleted, setHasFirstAnalysisCompleted] = useState(false);
  // // const [initialAnalysisPerformed, setInitialAnalysisPerformed] = useState(false); // Removed as per last instruction set
  // const [isStale, setIsStale] = useState(false);


  // const { register, handleSubmit, formState: { errors: clientFormErrors, isValid }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
  //   resolver: zodResolver(PageAnalysisFormSchema),
  //   defaultValues: defaultFormStateValues,
  //   mode: 'onChange', 
  // });

  // const processSubmit = useCallback((data: PageAnalysisFormValues) => {
  //   if (isActionPending) return;

  //   console.log("[page.tsx] processSubmit called with data:", data);
  //   setAnalysisResult(null); 
  //   setClientError(null);
  //   setFormErrors(undefined);
  //   setIsStale(false); 

  //   const formData = new FormData();
  //   formData.append('pointA.name', data.pointA.name);
  //   formData.append('pointA.lat', data.pointA.lat);
  //   formData.append('pointA.lng', data.pointA.lng);
  //   formData.append('pointA.height', String(data.pointA.height));
  //   formData.append('pointB.name', data.pointB.name);
  //   formData.append('pointB.lat', data.pointB.lat);
  //   formData.append('pointB.lng', data.pointB.lng);
  //   formData.append('pointB.height', String(data.pointB.height));
  //   formData.append('clearanceThreshold', data.clearanceThreshold);

  //   startTransition(() => {
  //     formAction(formData);
  //   });
  // }, [isActionPending, formAction, startTransition]);
  
  // const watchedPointA = useWatch({ control, name: 'pointA' });
  // const watchedPointB = useWatch({ control, name: 'pointB' });
  // const watchedClearanceThreshold = useWatch({ control, name: 'clearanceThreshold' });

  // // useEffect for initial analysis (REMOVED as per last instructions for landing page)
  // /*
  // useEffect(() => {
  //   if (!initialAnalysisPerformed && !isActionPending) {
  //     // ... logic for initial analysis ...
  //     // setInitialAnalysisPerformed(true); 
  //   }
  // }, [initialAnalysisPerformed, formAction, isActionPending, startTransition]);
  // */


  // // This effect processes the result from the server action
  // useEffect(() => {
  //   if (!serverState) return;
  
  //   const currentAnalysisResultFromScope = analysisResult; 
  
  //   if ('error' in serverState && serverState.error) {
  //     const errorToSet = serverState.error;
  //     const suppressInitialMessage = errorToSet === "No analysis performed yet." && (currentAnalysisResultFromScope !== null || isActionPending || hasFirstAnalysisCompleted);
  
  //     if (!suppressInitialMessage) {
  //       setClientError(errorToSet);
  //     }
      
  //     if (serverState.fieldErrors) {
  //       setFormErrors(serverState.fieldErrors as Record<string, string[] | undefined>);
  //     } else if (!suppressInitialMessage) { 
  //       setFormErrors(undefined); 
  //     }
  //   } else if (!('error' in serverState)) { 
  //     const resultDataFromServer = serverState as AnalysisResult;
  //     const currentFormValues = getValues(); 
  
  //     const newAnalysisData: AnalysisResult = {
  //       ...resultDataFromServer,
  //       pointA: {
  //         ...(resultDataFromServer.pointA || {} as any), 
  //         name: currentFormValues.pointA.name, 
  //         lat: resultDataFromServer.pointA?.lat ?? parseFloat(currentFormValues.pointA.lat), 
  //         lng: resultDataFromServer.pointA?.lng ?? parseFloat(currentFormValues.pointA.lng),
  //         towerHeight: resultDataFromServer.pointA?.towerHeight ?? currentFormValues.pointA.height,
  //       },
  //       pointB: {
  //         ...(resultDataFromServer.pointB || {} as any), 
  //         name: currentFormValues.pointB.name,
  //         lat: resultDataFromServer.pointB?.lat ?? parseFloat(currentFormValues.pointB.lat),
  //         lng: resultDataFromServer.pointB?.lng ?? parseFloat(currentFormValues.pointB.lng),
  //         towerHeight: resultDataFromServer.pointB?.towerHeight ?? currentFormValues.pointB.height,
  //       },
  //     };
      
  //     if (JSON.stringify(analysisResult) !== JSON.stringify(newAnalysisData)) {
  //        setAnalysisResult(newAnalysisData);
  //     }
      
  //     setClientError(null);
  //     setFormErrors(undefined);

  //     if (newAnalysisData && !hasFirstAnalysisCompleted && isAnalysisPanelGloballyOpen) {
  //       setIsBottomPanelContentExpanded(true); 
  //       setHasFirstAnalysisCompleted(true);
  //     }
  //   }
  // }, [serverState, getValues, hasFirstAnalysisCompleted, isActionPending, setIsBottomPanelContentExpanded, isAnalysisPanelGloballyOpen, analysisResult ]);


  // // Effect to calculate if the current form inputs are "stale" compared to the last analysisResult
  // useEffect(() => {
  //   if (!analysisResult) {
  //     setIsStale(false);
  //     return;
  //   }

  //   const currentFormValues = getValues();
  //   if (!currentFormValues.pointA?.lat || !currentFormValues.pointA?.lng || currentFormValues.pointA?.height === undefined ||
  //       !currentFormValues.pointB?.lat || !currentFormValues.pointB?.lng || currentFormValues.pointB?.height === undefined ||
  //       !currentFormValues.clearanceThreshold) {
  //     setIsStale(false); 
  //     return;
  //   }

  //   let formLatA, formLngA, formHeightA, formLatB, formLngB, formHeightB, formClearance;

  //   try {
  //       formLatA = parseFloat(currentFormValues.pointA.lat);
  //       formLngA = parseFloat(currentFormValues.pointA.lng);
  //       formHeightA = currentFormValues.pointA.height; 

  //       formLatB = parseFloat(currentFormValues.pointB.lat);
  //       formLngB = parseFloat(currentFormValues.pointB.lng);
  //       formHeightB = currentFormValues.pointB.height; 
        
  //       formClearance = parseFloat(currentFormValues.clearanceThreshold);
  //   } catch (e) {
  //       console.error("Error parsing form values for staleness check:", e);
  //       setIsStale(false); 
  //       return;
  //   }
    
  //   if (isNaN(formLatA) || isNaN(formLngA) || isNaN(formHeightA) || 
  //       isNaN(formLatB) || isNaN(formLngB) || isNaN(formHeightB) || isNaN(formClearance)) {
  //     setIsStale(false); 
  //     return;
  //   }

  //   const formPointACoords: PointCoordinates = { lat: formLatA, lng: formLngA };
  //   const formPointBCoords: PointCoordinates = { lat: formLatB, lng: formLngB };

  //   const analyzedPointA = analysisResult.pointA;
  //   const analyzedPointB = analysisResult.pointB;

  //   if (!analyzedPointA || !analyzedPointB) { 
  //       setIsStale(false);
  //       return;
  //   }

  //   const pointsAEqualResult = pointsEqual(formPointACoords, analyzedPointA);
  //   const pointsBEqualResult = pointsEqual(formPointBCoords, analyzedPointB);

  //   const heightAEqual = formHeightA === analyzedPointA?.towerHeight;
  //   const heightBEqual = formHeightB === analyzedPointB?.towerHeight;
  //   const clearanceEqual = formClearance === analysisResult.clearanceThresholdUsed;
    
  //   if (!pointsAEqualResult || !pointsBEqualResult || !heightAEqual || !heightBEqual || !clearanceEqual) {
  //     setIsStale(true);
  //   } else {
  //     setIsStale(false);
  //   }
  // }, [watchedPointA, watchedPointB, watchedClearanceThreshold, analysisResult, getValues]);

  // const handleMarkerDragStart = useCallback(() => {
  //   setAnalysisResult(null);
  //   setClientError(null);
  // }, []);

  // const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
  //   setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
  //   setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
  //   handleSubmit(processSubmit)();
  // }, [setValue, handleSubmit, processSubmit]);

  // const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
  //   setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
  //   setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
  //   handleSubmit(processSubmit)();
  // }, [setValue, handleSubmit, processSubmit]);
  
  // const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
  //   if (isActionPending) {
  //     console.log("[page.tsx] Drag update skipped: An action is already pending.");
  //     return;
  //   }
  //   console.log(`[page.tsx] handleTowerHeightChangeFromGraph called for ${siteId} with new height: ${newHeight}`);

  //   const clampedHeight = Math.max(0, Math.min(100, parseFloat(newHeight.toFixed(1))));

  //   setValue(siteId === 'pointA' ? 'pointA.height' : 'pointB.height', clampedHeight, {
  //     shouldValidate: true,
  //     shouldTouch: true,
  //     shouldDirty: true,
  //   });
    
  //   console.log(`[page.tsx] Form value for ${siteId}.height set to:`, clampedHeight);
    
  //   const currentValues = getValues();
  //   console.log("[page.tsx] Triggering re-analysis with current form values from tower drag:", currentValues);
  //   processSubmit(currentValues);
  // }, [setValue, isActionPending, getValues, processSubmit]);


  // const mapContainerHeightClass = isAnalysisPanelGloballyOpen ? 'h-[calc(100%_-_45vh)]' : 'h-full';

  // const formPointAForMap = watchedPointA && !isNaN(parseFloat(watchedPointA.lat)) && !isNaN(parseFloat(watchedPointA.lng))
  //   ? { lat: parseFloat(watchedPointA.lat), lng: parseFloat(watchedPointA.lng), name: watchedPointA.name }
  //   : undefined;
  // const formPointBForMap = watchedPointB && !isNaN(parseFloat(watchedPointB.lat)) && !isNaN(parseFloat(watchedPointB.lng))
  //   ? { lat: parseFloat(watchedPointB.lat), lng: parseFloat(watchedPointB.lng), name: watchedPointB.name }
  //   : undefined;

  // const analyzedDataForMap = analysisResult ? {
  //   pointA: { lat: analysisResult.pointA.lat, lng: analysisResult.pointA.lng },
  //   pointB: { lat: analysisResult.pointB.lat, lng: analysisResult.pointB.lng },
  //   losPossible: analysisResult.losPossible
  // } : null;
  
  console.log("[page.tsx] Rendering simplified Home component for debug.");

  return (
    <div className="flex-1 flex flex-col bg-yellow-500/50 text-white p-10"> {/* Bright debug color */}
      <h1 className="text-2xl">DEBUG: Home Component Rendered</h1>
      <p>If you see this, the basic page rendering is working.</p>
    </div>
  );

  // Original return statement (partially commented for incremental debugging)
  /*
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative bg-red-500/20">
      <div className={`bg-blue-500/20 ${mapContainerHeightClass} transition-all duration-300 ease-in-out`}>
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
          mapContainerClassName="w-full h-full" // Ensure map itself tries to fill its parent
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
              setIsBottomPanelContentExpanded(true); 
            }}
          >
            Check OpticSpectra FSO Link Feasibility
          </Button>
        </div>
      )}

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
      
      {/* <BottomPanel
        analysisResult={analysisResult}
        isPanelGloballyVisible={isAnalysisPanelGloballyOpen} 
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
      /> }
    </div>
  );
  */
}

