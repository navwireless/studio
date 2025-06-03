
"use client";

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, MapPin, Waypoints, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues, PointCoordinates } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema'; // Assuming you might create this
import { useToast } from '@/hooks/use-toast';

// Dynamically import InteractiveMap with SSR turned off
const InteractiveMap = dynamic(() => import('@/components/fso/interactive-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Loading Map...</p>
    </div>
  ),
});

const BottomPanel = dynamic(() => import('@/components/fso/bottom-panel'), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-0 left-0 right-0 h-[50px] bg-slate-800/80 flex items-center justify-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="ml-2">Loading Analysis Panel...</span>
    </div>
  ),
});


export default function Home() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition(); // For server action
  const [serverState, formAction, isActionPending] = React.useActionState(performLosAnalysis, null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true); // Default to expanded when panel opens
  const [isStale, setIsStale] = useState(false); // To indicate if form changes require re-analysis

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onBlur', // Validate on blur
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors, dirtyFields }, getValues, setValue, reset, watch } = form;

  const watchedPointA = watch('pointA');
  const watchedPointB = watch('pointB');
  const watchedClearanceThreshold = watch('clearanceThreshold');

  // For map display
  const formPointAForMap = useWatch({ control, name: 'pointA' });
  const formPointBForMap = useWatch({ control, name: 'pointB' });

  const processSubmit = useCallback((data: AnalysisFormValues) => {
    console.log("Form data submitted:", data);
    startTransition(() => {
      const formData = new FormData();
      formData.append('pointA.name', data.pointA.name);
      formData.append('pointA.lat', data.pointA.lat);
      formData.append('pointA.lng', data.pointA.lng);
      formData.append('pointA.height', data.pointA.height.toString());
      formData.append('pointB.name', data.pointB.name);
      formData.append('pointB.lat', data.pointB.lat);
      formData.append('pointB.lng', data.pointB.lng);
      formData.append('pointB.height', data.pointB.height.toString());
      formData.append('clearanceThreshold', data.clearanceThreshold);
      formAction(formData);
    });
    setIsStale(false);
  }, [formAction, startTransition]);

  useEffect(() => {
    if (serverState) {
      console.log("Server state received:", serverState);
      if (serverState.error) {
        setAnalysisResult(null); // Clear previous results on error
        toast({
          title: "Analysis Error",
          description: serverState.error,
          variant: "destructive",
          duration: 7000,
        });
      } else if ('losPossible' in serverState) { // Check if it's a valid AnalysisResult
        setAnalysisResult(serverState as AnalysisResult);
        setIsAnalysisPanelGloballyOpen(true); // Open panel on successful analysis
        setIsBottomPanelContentExpanded(true);
        toast({
          title: "Analysis Complete",
          description: serverState.message || "LOS analysis performed successfully.",
        });
      }
    }
  }, [serverState, toast]);
  
  useEffect(() => {
    // If any of the watched fields are dirty and an analysis result exists, mark as stale
    // This ensures that if the user changes data after an analysis, they are prompted to re-analyze
    if (analysisResult && (dirtyFields.pointA || dirtyFields.pointB || dirtyFields.clearanceThreshold)) {
      setIsStale(true);
    }
  }, [watchedPointA, watchedPointB, watchedClearanceThreshold, analysisResult, dirtyFields]);


  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      
      // After setting value, check if both points are defined to potentially trigger analysis or enable button
      const currentValues = getValues();
      if (currentValues.pointA.lat && currentValues.pointA.lng && currentValues.pointB.lat && currentValues.pointB.lng) {
        // Both points are set. If an analysis was already done, mark as stale.
        if (analysisResult) setIsStale(true);
      }
    }
  }, [setValue, getValues, analysisResult]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      if (analysisResult) setIsStale(true);
    }
  }, [setValue, analysisResult]);

  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    setValue(`${siteId}.height`, newHeight, { shouldDirty: true, shouldValidate: true });
    if (analysisResult) setIsStale(true);
  }, [setValue, analysisResult]);


  const toggleGlobalPanelVisibility = useCallback(() => {
    setIsAnalysisPanelGloballyOpen(prev => !prev);
  }, []);

  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);
  
  const handleStartAnalysisClick = () => {
    setIsAnalysisPanelGloballyOpen(true);
    setIsBottomPanelContentExpanded(true);
    // Optionally, if you want to trigger analysis immediately if form is valid:
    // handleSubmit(processSubmit)(); 
  };

  const mapContainerHeightClass = isAnalysisPanelGloballyOpen && isBottomPanelContentExpanded 
    ? "h-[55vh]" 
    : isAnalysisPanelGloballyOpen && !isBottomPanelContentExpanded
    ? "h-[calc(100vh-50px-48px)]" // Approx: 100vh - panel_min_height - footer_height 
    : "h-[calc(100vh-40px-48px)]"; // Approx: 100vh - header_height - footer_height

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className={`transition-all duration-500 ease-in-out ${mapContainerHeightClass} w-full`}>
        <InteractiveMap
          pointA={formPointAForMap && formPointAForMap.lat && formPointAForMap.lng ? { lat: parseFloat(formPointAForMap.lat), lng: parseFloat(formPointAForMap.lng), name: formPointAForMap.name } : undefined}
          pointB={formPointBForMap && formPointBForMap.lat && formPointBForMap.lng ? { lat: parseFloat(formPointBForMap.lat), lng: parseFloat(formPointBForMap.lng), name: formPointBForMap.name } : undefined}
          onMapClick={handleMapClick}
          onMarkerDrag={handleMarkerDrag}
          mapContainerClassName="w-full h-full"
        />
      </div>

      {/* Button to Start Analysis - visible only if panel is not open */}
      {!isAnalysisPanelGloballyOpen && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 print:hidden">
          <Button
            onClick={handleStartAnalysisClick}
            size="lg"
            className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm"
            aria-label="Start Link Analysis"
          >
            <Waypoints className="mr-2 h-5 w-5" />
            Start Link Analysis
          </Button>
        </div>
      )}
      
      {isActionPending && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-6 shadow-2xl bg-card/90">
              <CardContent className="flex flex-col items-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold text-foreground">Analyzing Link...</p>
                <p className="text-sm text-muted-foreground mt-1">Please wait while we process the elevation data.</p>
              </CardContent>
            </Card>
         </div>
      )}

      {serverState?.error && !isActionPending && (
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => {/* Ideally clear serverState error here */}}>
            <Card className="p-6 shadow-2xl bg-destructive/90 max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-destructive-foreground flex items-center">
                  <AlertTriangle className="mr-2 h-6 w-6"/> Analysis Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive-foreground mb-4">{serverState.error}</p>
                <Button 
                  variant="outline" 
                  className="w-full bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
                  onClick={() => { 
                    const newFormState = { ...getValues() }; 
                    startTransition(() => formAction(new FormData())); // Clears action state
                    reset(newFormState); // Re-apply form values if needed, or reset to default
                  }}
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
         </div>
      )}

      <BottomPanel
        analysisResult={analysisResult}
        isPanelGloballyVisible={isAnalysisPanelGloballyOpen}
        onToggleGlobalVisibility={toggleGlobalPanelVisibility}
        isContentExpanded={isBottomPanelContentExpanded}
        onToggleContentExpansion={toggleBottomPanelContentExpansion}
        isStale={isStale}
        control={control}
        register={register}
        handleSubmit={handleSubmit}
        processSubmit={processSubmit}
        clientFormErrors={clientFormErrors}
        serverFormErrors={serverState?.fieldErrors}
        isActionPending={isActionPending || isPending}
        getValues={getValues}
        setValue={setValue}
        onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
      />
    </div>
  );
}

// It's good practice to define schemas and defaults in a separate file, e.g., src/lib/form-schema.ts
// For brevity, I'm re-adding a basic version here if you don't have it.
// Consider moving this to src/lib/form-schema.ts
/*
export const PointInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lat: z.string().refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Lat (-90 to 90)"),
  lng: z.string().refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Lng (-180 to 180)"),
  height: z.number().min(0, "Min height 0m").max(100, "Max height 100m"),
});

export const AnalysisFormSchema = z.object({
  pointA: PointInputSchema,
  pointB: PointInputSchema,
  clearanceThreshold: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be positive"),
});

export const defaultFormStateValues: AnalysisFormValues = {
  pointA: { name: 'Site A', lat: '', lng: '', height: 20 },
  pointB: { name: 'Site B', lat: '', lng: '', height: 20 },
  clearanceThreshold: '10',
};
*/
