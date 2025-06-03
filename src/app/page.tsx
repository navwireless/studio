
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Waypoints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';
import { useToast } from '@/hooks/use-toast';

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
  loading: () => null, 
});


export default function Home() {
  const { toast } = useToast();
  const [serverState, formAction, isActionPending] = React.useActionState(performLosAnalysis, null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onBlur',
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors, dirtyFields }, getValues, setValue, reset, watch } = form;

  const watchedPointA = watch('pointA');
  const watchedPointB = watch('pointB');
  const watchedClearanceThreshold = watch('clearanceThreshold');

  const formPointAForMap = useWatch({ control, name: 'pointA' });
  const formPointBForMap = useWatch({ control, name: 'pointB' });

  const processSubmit = useCallback((data: AnalysisFormValues) => {
    console.log("Form data submitted for analysis:", data);
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

    setIsStale(false); // Mark as not stale before starting analysis
    React.startTransition(() => {
      formAction(formData);
    });
  }, [formAction, setIsStale]);

  useEffect(() => {
    if (serverState) {
      console.log("Server state received:", serverState);
      if (serverState.error) {
        setAnalysisResult(null);
        toast({
          title: "Analysis Error",
          description: serverState.error,
          variant: "destructive",
          duration: 7000,
        });
      } else if ('losPossible' in serverState) {
        const newResult = serverState as AnalysisResult;
        setAnalysisResult(newResult);
        
        // After a successful analysis, the current form values are the new baseline.
        // Resetting the form with these values will clear dirtyFields.
        const currentFormValues = getValues(); 
        reset(currentFormValues); // This makes current values the new "pristine" state
        setIsStale(false); // Explicitly ensure stale is false.

        if (!isAnalysisPanelGloballyOpen) { // Open panel if it was closed
            setIsAnalysisPanelGloballyOpen(true);
            setIsBottomPanelContentExpanded(true);
        }
        
        toast({
          title: "Analysis Complete",
          description: newResult.message || "LOS analysis performed successfully.",
        });
      }
    }
  }, [serverState, toast, reset, getValues, setIsAnalysisPanelGloballyOpen, setIsBottomPanelContentExpanded, isAnalysisPanelGloballyOpen]);
  
  useEffect(() => {
    // This effect determines if the current form state is "stale" compared to the last analysisResult.
    // It should only mark as stale if an analysisResult exists and then changes are made.
    if (analysisResult) { // Only consider staleness if there's a baseline result
      const isActuallyDirty = Object.keys(dirtyFields).length > 0;
      if (isActuallyDirty) {
         // Check if only height changed, which might not require full "stale" if auto-analyzing height
         const pointAHeightChangedOnly = dirtyFields.pointA && 'height' in dirtyFields.pointA && Object.keys(dirtyFields.pointA).length === 1 && !dirtyFields.pointB && !dirtyFields.clearanceThreshold;
         const pointBHeightChangedOnly = dirtyFields.pointB && 'height' in dirtyFields.pointB && Object.keys(dirtyFields.pointB).length === 1 && !dirtyFields.pointA && !dirtyFields.clearanceThreshold;
         
         // If it's not *just* a height change (which auto-analyzes), then it's genuinely stale for other params
         if (!(pointAHeightChangedOnly || pointBHeightChangedOnly)) {
            setIsStale(true);
         }
      }
      // If not dirty, and we have an analysis result, it should not be stale.
      // setIsStale(false) is handled after successful analysis.
    }
  }, [watchedPointA, watchedPointB, watchedClearanceThreshold, analysisResult, dirtyFields]);


  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      
      // No need to check getValues() here for staleness, useEffect for dirtyFields will handle it
    }
  }, [setValue]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      // No need to set isStale(true) directly, useEffect for dirtyFields will handle it
    }
  }, [setValue]);

  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    setValue(`${siteId}.height`, Math.round(newHeight), { shouldDirty: true, shouldValidate: true });
    // Auto-submit after height change from graph
    handleSubmit(processSubmit)();
  }, [setValue, handleSubmit, processSubmit]);


  const toggleGlobalPanelVisibility = useCallback(() => {
    setIsAnalysisPanelGloballyOpen(prev => !prev);
  }, []);

  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);
  
  const handleStartAnalysisClick = () => {
    setIsAnalysisPanelGloballyOpen(true);
    setIsBottomPanelContentExpanded(true);
  };

  // Dismisses the error modal by clearing serverState, allowing user to try again.
  const dismissErrorModal = useCallback(() => {
    // Create a new FormData instance to effectively 'clear' the action for serverState.
    // This doesn't resubmit with old data but resets the useActionState for the error.
    const dummyFormData = new FormData(); 
    React.startTransition(() => {
      formAction(dummyFormData);
    });
    // Optionally, reset form fields to default or last good state if desired
    // For now, just clearing the error state.
    // reset(getValues()); // Keeps current values, might be what user wants
  }, [formAction, reset, getValues]);


  return (
    <div className="flex-1 flex flex-col overflow-hidden relative h-full">
      <div className="flex-1 w-full relative">
        <InteractiveMap
          pointA={formPointAForMap && formPointAForMap.lat && formPointAForMap.lng ? { lat: parseFloat(formPointAForMap.lat), lng: parseFloat(formPointAForMap.lng), name: formPointAForMap.name } : undefined}
          pointB={formPointBForMap && formPointBForMap.lat && formPointBForMap.lng ? { lat: parseFloat(formPointBForMap.lat), lng: parseFloat(formPointBForMap.lng), name: formPointBForMap.name } : undefined}
          onMapClick={handleMapClick}
          onMarkerDrag={handleMarkerDrag}
          mapContainerClassName="w-full h-full"
        />
      </div>

      {!isAnalysisPanelGloballyOpen && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 print:hidden">
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
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
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
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={dismissErrorModal}>
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
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    dismissErrorModal();
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
        isActionPending={isActionPending}
        getValues={getValues}
        setValue={setValue}
        onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
      />
    </div>
  );
}

