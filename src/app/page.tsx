
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Waypoints } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';
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
    
    React.startTransition(() => {
      formAction(formData);
    });
    setIsStale(false);
  }, [formAction]);

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
        setAnalysisResult(serverState as AnalysisResult);
        setIsAnalysisPanelGloballyOpen(true); 
        setIsBottomPanelContentExpanded(true);
        
        // Avoid toasting if only tower height changed and auto-submitted
        // This crude check assumes that if it's not stale, it was likely an auto-submit from tower height
        if (isStale || !analysisResult?.profile.length) {
            toast({
            title: "Analysis Complete",
            description: serverState.message || "LOS analysis performed successfully.",
            });
        }
      }
    }
  }, [serverState, toast, isStale, analysisResult]);
  
  useEffect(() => {
    if (analysisResult && (dirtyFields.pointA || dirtyFields.pointB || dirtyFields.clearanceThreshold)) {
      const pointAHeightChanged = dirtyFields.pointA && 'height' in dirtyFields.pointA && Object.keys(dirtyFields.pointA).length === 1;
      const pointBHeightChanged = dirtyFields.pointB && 'height' in dirtyFields.pointB && Object.keys(dirtyFields.pointB).length === 1;

      if (!(pointAHeightChanged || pointBHeightChanged) || dirtyFields.clearanceThreshold) {
         setIsStale(true);
      }
    }
  }, [watchedPointA, watchedPointB, watchedClearanceThreshold, analysisResult, dirtyFields]);


  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      
      const currentValues = getValues();
      if (currentValues.pointA.lat && currentValues.pointA.lng && currentValues.pointB.lat && currentValues.pointB.lng) {
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
    setValue(`${siteId}.height`, Math.round(newHeight), { shouldDirty: true, shouldValidate: true });
    // Trigger re-analysis automatically
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

  const mapContainerHeightClass = isAnalysisPanelGloballyOpen && isBottomPanelContentExpanded 
    ? "h-[55vh]" 
    : isAnalysisPanelGloballyOpen && !isBottomPanelContentExpanded
    ? "h-[calc(100vh-50px-48px-env(safe-area-inset-bottom))]" // Account for footer, panel handle, and notch
    : "h-[calc(100vh-40px-48px-env(safe-area-inset-bottom))]"; // Account for header, footer and notch (48px footer, 40px header)

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div 
        className={`transition-all duration-500 ease-in-out ${mapContainerHeightClass} w-full border-2 border-blue-500`}
        style={{ height: 'calc(50vh)' }} // Fixed height for map debugging
      >
        <InteractiveMap
          pointA={formPointAForMap && formPointAForMap.lat && formPointAForMap.lng ? { lat: parseFloat(formPointAForMap.lat), lng: parseFloat(formPointAForMap.lng), name: formPointAForMap.name } : undefined}
          pointB={formPointBForMap && formPointBForMap.lat && formPointBForMap.lng ? { lat: parseFloat(formPointBForMap.lat), lng: parseFloat(formPointBForMap.lng), name: formPointBForMap.name } : undefined}
          onMapClick={handleMapClick}
          onMarkerDrag={handleMarkerDrag}
          mapContainerClassName="w-full h-full"
        />
      </div>

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
         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { 
             // Clear only the error state, keep form values
             const currentFormData = getValues(); // Get current form values
             formAction(new FormData()); // Effectively clears serverState by passing empty FormData
             reset(currentFormData); // Reset form with existing values to clear dirty state if needed
           }}>
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
                    e.stopPropagation(); // Prevent click from bubbling to the backdrop div
                    const currentFormData = getValues();
                    formAction(new FormData()); 
                    reset(currentFormData);
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

