
"use client";

import React, { useState, useEffect, useCallback, useId } from 'react';
// Removed dynamic import for InteractiveMap as it's now loaded via context
import InteractiveMap from '@/components/fso/interactive-map';
import { useForm, useWatch, Controller as FormController } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Waypoints, MapPin } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues, PointInput as PointFormInputType, PointCoordinates } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';
import { useToast } from '@/hooks/use-toast';
import AppHeader from '@/components/layout/app-header';
import HistoryPanel from '@/components/layout/history-panel';
import { calculateDistanceKm } from '@/lib/los-calculator';
import BottomPanel from '@/components/fso/bottom-panel';


export default function Home() {
  const { toast } = useToast();
  const [rawServerState, formAction, isActionPending] = React.useActionState(performLosAnalysis, null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [displayedError, setDisplayedError] = useState<string | null>(null);
  
  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const [historyList, setHistoryList] = useState<AnalysisResult[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null);


  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema), 
    defaultValues: defaultFormStateValues,
    mode: 'onBlur',
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, getValues, setValue, reset, watch } = form;

  const watchedPointA = watch('pointA');
  const watchedPointB = watch('pointB');
  const watchedClearanceThreshold = watch('clearanceThreshold');

  const formPointAForMap = useWatch({ control, name: 'pointA' });
  const formPointBForMap = useWatch({ control, name: 'pointB' });

  const processSubmit = useCallback((data: AnalysisFormValues) => {
    setDisplayedError(null);

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
  }, [formAction]);

  useEffect(() => {
    if (rawServerState === null) return; 

    if (rawServerState instanceof Error) {
      setAnalysisResult(null);
      const errorMessage = rawServerState.message || "An unexpected error occurred.";
      setDisplayedError(errorMessage);
      toast({
        title: "Analysis Error",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
    } else if ('losPossible' in rawServerState) { 
      const successfulResult = rawServerState as AnalysisResult;
      
      setAnalysisResult(successfulResult);
      setHistoryList(prev => [successfulResult, ...prev.slice(0, 19)]);
      setLiveDistanceKm(successfulResult.distanceKm);
      
      const currentFormValues = getValues(); 
      const formValuesForResult: AnalysisFormValues = {
        pointA: {
          name: successfulResult.pointA.name || currentFormValues.pointA.name,
          lat: successfulResult.pointA.lat.toString(),
          lng: successfulResult.pointA.lng.toString(),
          height: successfulResult.pointA.towerHeight,
        },
        pointB: {
          name: successfulResult.pointB.name || currentFormValues.pointB.name,
          lat: successfulResult.pointB.lat.toString(),
          lng: successfulResult.pointB.lng.toString(),
          height: successfulResult.pointB.towerHeight,
        },
        clearanceThreshold: successfulResult.clearanceThresholdUsed.toString(),
      };
      reset(formValuesForResult); 
      setIsStale(false); 
      setDisplayedError(null); 

      if (!isAnalysisPanelGloballyOpen) { 
          setIsAnalysisPanelGloballyOpen(true);
          setIsBottomPanelContentExpanded(true);
      }
      
      toast({
        title: "Analysis Complete",
        description: successfulResult.message || "LOS analysis performed successfully.",
      });
    }
  }, [rawServerState, toast, reset, getValues, isAnalysisPanelGloballyOpen, setValue]);
  
  useEffect(() => {
    const formValues = getValues();
    const currentPointA = formValues.pointA;
    const currentPointB = formValues.pointB;
    const currentClearanceStr = formValues.clearanceThreshold;

    let newIsStale = false;
    const isValidNumeric = (val: string) => val && !isNaN(parseFloat(val));
    const isPointDataSufficient = (p: PointFormInputType) => 
        isValidNumeric(p.lat) && isValidNumeric(p.lng) && typeof p.height === 'number';

    const canPerformAnalysisWithCurrentForm = 
        isPointDataSufficient(currentPointA) &&
        isPointDataSufficient(currentPointB) &&
        isValidNumeric(currentClearanceStr);

    if (analysisResult && analysisResult.pointA && analysisResult.pointB) {
        const formLatA = parseFloat(currentPointA.lat);
        const formLngA = parseFloat(currentPointA.lng);
        const formHeightA = currentPointA.height;
        const formLatB = parseFloat(currentPointB.lat);
        const formLngB = parseFloat(currentPointB.lng);
        const formHeightB = currentPointB.height;
        const formClearanceNum = parseFloat(currentClearanceStr);

        if (
            analysisResult.pointA.lat !== formLatA ||
            analysisResult.pointA.lng !== formLngA ||
            analysisResult.pointA.towerHeight !== formHeightA ||
            analysisResult.pointB.lat !== formLatB ||
            analysisResult.pointB.lng !== formLngB ||
            analysisResult.pointB.towerHeight !== formHeightB ||
            analysisResult.clearanceThresholdUsed !== formClearanceNum
        ) {
            newIsStale = true;
        } else {
            newIsStale = false;
        }
    } else { 
        if (canPerformAnalysisWithCurrentForm) {
            newIsStale = true; 
        } else {
            newIsStale = false; 
        }
    }
    setIsStale(newIsStale);

  }, [getValues, analysisResult, watchedPointA, watchedPointB, watchedClearanceThreshold, isActionPending]);


  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
      
      const currentA = getValues('pointA');
      const currentB = getValues('pointB');
      if (isValidNumericString(currentA.lat) && isValidNumericString(currentA.lng) && isValidNumericString(currentB.lat) && isValidNumericString(currentB.lng)) {
        setLiveDistanceKm(calculateDistanceKm({lat: parseFloat(currentA.lat), lng: parseFloat(currentA.lng)}, {lat: parseFloat(currentB.lat), lng: parseFloat(currentB.lng)}));
      } else {
        setLiveDistanceKm(null);
      }
    }
  }, [setValue, getValues]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });

      const currentA = getValues('pointA');
      const currentB = getValues('pointB');
      if (isValidNumericString(currentA.lat) && isValidNumericString(currentA.lng) && isValidNumericString(currentB.lat) && isValidNumericString(currentB.lng)) {
        setLiveDistanceKm(calculateDistanceKm({lat: parseFloat(currentA.lat), lng: parseFloat(currentA.lng)}, {lat: parseFloat(currentB.lat), lng: parseFloat(currentB.lng)}));
      } else {
        setLiveDistanceKm(null);
      }
    }
  }, [setValue, getValues]);
  
  const isValidNumericString = (val: string) => val && !isNaN(parseFloat(val));


  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    setValue(`${siteId}.height`, Math.round(newHeight), { shouldDirty: true, shouldValidate: true });
    // Trigger analysis after graph height change
    // Ensure handleSubmit is called with the processSubmit function correctly
    handleSubmit(processSubmit)(); 
  }, [setValue, handleSubmit, processSubmit, getValues]);


  const toggleGlobalPanelVisibility = useCallback(() => {
    setIsAnalysisPanelGloballyOpen(prev => !prev);
  }, []);

  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);
  
  const handleStartAnalysisClick = () => {
    // This function is called when the "Start Link Analysis" button is clicked
    // It should open the bottom panel and immediately submit the form for analysis.
    setIsAnalysisPanelGloballyOpen(true);
    setIsBottomPanelContentExpanded(true); // Ensure content area is expanded
    handleSubmit(processSubmit)();
  };

  const dismissErrorModal = useCallback(() => {
    setDisplayedError(null); 
  }, []);

  const handleToggleHistoryPanel = () => {
    setIsHistoryPanelOpen(prev => !prev);
  };

  const handleClearMap = () => {
    reset(defaultFormStateValues);
    setAnalysisResult(null);
    setLiveDistanceKm(null);
    setIsStale(false);
    setDisplayedError(null);
    toast({ title: "Map Cleared", description: "Form reset to default values." });
    if (isAnalysisPanelGloballyOpen) {
        // Optionally close the panel or just clear its content
        setIsAnalysisPanelGloballyOpen(false); 
    }
  };
  
  const handleLoadHistoryItem = (id: string) => {
    const itemToLoad = historyList.find(item => item.id === id);
    if (itemToLoad) {
      setAnalysisResult(itemToLoad); // This sets the result that BottomPanel will use
      
      // Update form values to match the loaded history item
      const formValuesFromHistory: AnalysisFormValues = {
        pointA: {
          name: itemToLoad.pointA.name || 'Site A',
          lat: itemToLoad.pointA.lat.toString(),
          lng: itemToLoad.pointA.lng.toString(),
          height: itemToLoad.pointA.towerHeight,
        },
        pointB: {
          name: itemToLoad.pointB.name || 'Site B',
          lat: itemToLoad.pointB.lat.toString(),
          lng: itemToLoad.pointB.lng.toString(),
          height: itemToLoad.pointB.towerHeight,
        },
        clearanceThreshold: itemToLoad.clearanceThresholdUsed.toString(),
      };
      reset(formValuesFromHistory);
      setLiveDistanceKm(itemToLoad.distanceKm); // Update live distance display
      setIsStale(false); // Data is now in sync with the form
      setDisplayedError(null);
      setIsAnalysisPanelGloballyOpen(true); // Ensure panel is open to show loaded data
      setIsBottomPanelContentExpanded(true); // Ensure content is expanded
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name}.` });
    }
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    toast({ title: "History Cleared" });
  };


  return (
    <> 
      <AppHeader 
        onToggleHistory={handleToggleHistoryPanel}
        onClearMap={handleClearMap}
        isHistoryPanelSupported={true}
        currentPage="home"
      />
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        {/* Map takes up remaining space */}
        <div className="flex-1 w-full relative">
          <InteractiveMap
            pointA={formPointAForMap && formPointAForMap.lat && formPointAForMap.lng ? { lat: parseFloat(formPointAForMap.lat), lng: parseFloat(formPointAForMap.lng), name: formPointAForMap.name } : undefined}
            pointB={formPointBForMap && formPointBForMap.lat && formPointBForMap.lng ? { lat: parseFloat(formPointBForMap.lat), lng: parseFloat(formPointBForMap.lng), name: formPointBForMap.name } : undefined}
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
            mapContainerClassName="w-full h-full" // ensure map fills its container
            analysisResult={analysisResult}
            isStale={isStale}
            currentDistanceKm={liveDistanceKm}
          />
        </div>

        {/* Floating "Start Link Analysis" button - shown only if panel is closed */}
        {!isAnalysisPanelGloballyOpen && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 print:hidden">
            <Button
              onClick={handleStartAnalysisClick} // This should open the panel AND submit
              size="lg"
              className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm"
              aria-label="Start Link Analysis"
            >
              <Waypoints className="mr-2 h-5 w-5" />
              Start Link Analysis
            </Button>
          </div>
        )}
        
        {/* Global Loading Spinner Modal */}
        {isActionPending && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]"> {/* Higher z-index for modals */}
              <Card className="p-6 shadow-2xl bg-card/90">
                <CardContent className="flex flex-col items-center text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-semibold text-foreground">Analyzing Link...</p>
                  <p className="text-sm text-muted-foreground mt-1">Please wait while we process the elevation data.</p>
                </CardContent>
              </Card>
          </div>
        )}

        {/* Global Error Display Modal */}
        {displayedError && !isActionPending && ( // Only show if not pending and error exists
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={dismissErrorModal}> {/* Click overlay to dismiss */}
              <Card className="p-6 shadow-2xl bg-destructive/90 max-w-md w-full mx-4">
                <CardHeader>
                  <CardTitle className="text-destructive-foreground flex items-center">
                    <AlertTriangle className="mr-2 h-6 w-6"/> Analysis Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive-foreground mb-4 whitespace-pre-wrap">{displayedError}</p>
                  <Button 
                    variant="outline" 
                    className="w-full bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
                    onClick={(e) => { e.stopPropagation(); dismissErrorModal();}} // Stop propagation to prevent overlay click
                  >
                    Dismiss
                  </Button>
                </CardContent>
              </Card>
          </div>
        )}

        {/* Bottom Panel for Inputs and Results */}
        <BottomPanel
          analysisResult={analysisResult}
          isPanelGloballyVisible={isAnalysisPanelGloballyOpen}
          onToggleGlobalVisibility={toggleGlobalPanelVisibility}
          isContentExpanded={isBottomPanelContentExpanded}
          onToggleContentExpansion={toggleBottomPanelContentExpansion}
          isStale={isStale}
          // Form related props
          control={control}
          register={register}
          handleSubmit={handleSubmit}
          processSubmit={processSubmit} // The function to call on form submit
          clientFormErrors={clientFormErrors}
          serverFormErrors={undefined} // Server field errors are no longer passed with this error handling strategy
          isActionPending={isActionPending}
          getValues={getValues}
          setValue={setValue}
          onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
        />
        {/* History Panel (Sheet) */}
        <HistoryPanel 
          historyList={historyList}
          onLoadHistoryItem={handleLoadHistoryItem}
          onClearHistory={handleClearHistory}
          isOpen={isHistoryPanelOpen}
          onToggle={handleToggleHistoryPanel}
        />
      </div>
    </>
  );
}

    