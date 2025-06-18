
"use client";

import React, { useState, useEffect, useCallback, useId } from 'react';
import InteractiveMap from '@/components/fso/interactive-map';
import { useForm, useWatch, Controller as FormController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Waypoints, MapPin, Cable } from 'lucide-react';
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
import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator'; // Import the action
import type { FiberPathResult } from '@/tools/fiberPathCalculator'; // Import the type

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

  // State for Fiber Path Calculation
  const [calculateFiberPathEnabled, setCalculateFiberPathEnabled] = useState(false);
  const [fiberRadiusMeters, setFiberRadiusMeters] = useState<number>(500); // Default radius
  const [fiberPathResult, setFiberPathResult] = useState<FiberPathResult | null>(null);
  const [isFiberCalculating, setIsFiberCalculating] = useState(false);
  const [fiberPathError, setFiberPathError] = useState<string | null>(null);


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
    setFiberPathResult(null); // Clear previous fiber results on new LOS analysis
    setFiberPathError(null);

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

  // Effect to handle LOS Analysis results and trigger Fiber Path calculation
  useEffect(() => {
    if (rawServerState === null) return;

    if (rawServerState instanceof Error) {
      setAnalysisResult(null);
      const errorMessage = rawServerState.message || "An unexpected error occurred during LOS analysis.";
      setDisplayedError(errorMessage);
      toast({
        title: "LOS Analysis Error",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
      setFiberPathResult(null); // Clear fiber result on LOS error
    } else if ('losPossible' in rawServerState) {
      const successfulLosResult = rawServerState as AnalysisResult;
      setAnalysisResult(successfulLosResult);
      setHistoryList(prev => [successfulLosResult, ...prev.slice(0, 19)]);
      setLiveDistanceKm(successfulLosResult.distanceKm);

      const currentFormValues = getValues();
      const formValuesForResult: AnalysisFormValues = {
        pointA: {
          name: successfulLosResult.pointA.name || currentFormValues.pointA.name,
          lat: successfulLosResult.pointA.lat.toString(),
          lng: successfulLosResult.pointA.lng.toString(),
          height: successfulLosResult.pointA.towerHeight,
        },
        pointB: {
          name: successfulLosResult.pointB.name || currentFormValues.pointB.name,
          lat: successfulLosResult.pointB.lat.toString(),
          lng: successfulLosResult.pointB.lng.toString(),
          height: successfulLosResult.pointB.towerHeight,
        },
        clearanceThreshold: successfulLosResult.clearanceThresholdUsed.toString(),
      };
      reset(formValuesForResult);
      setIsStale(false);
      setDisplayedError(null);

      if (!isAnalysisPanelGloballyOpen) {
          setIsAnalysisPanelGloballyOpen(true);
          setIsBottomPanelContentExpanded(true);
      }

      toast({
        title: "LOS Analysis Complete",
        description: successfulLosResult.message || "LOS analysis performed successfully.",
      });

      // --- Trigger Fiber Path Calculation if enabled and LOS is feasible ---
      if (calculateFiberPathEnabled && successfulLosResult.losPossible) {
        setIsFiberCalculating(true);
        setFiberPathError(null);
        setFiberPathResult(null);

        performFiberPathAnalysisAction(
          successfulLosResult.pointA.lat,
          successfulLosResult.pointA.lng,
          successfulLosResult.pointB.lat,
          successfulLosResult.pointB.lng,
          fiberRadiusMeters,
          true // LOS is feasible
        ).then(fiberResult => {
          setFiberPathResult(fiberResult);
          if (fiberResult.status !== 'success' && fiberResult.errorMessage) {
            setFiberPathError(fiberResult.errorMessage);
            toast({ title: "Fiber Path Info", description: fiberResult.errorMessage, variant: "default", duration: 6000 });
          } else if (fiberResult.status === 'success') {
            toast({ title: "Fiber Path Calculated", description: `Total fiber distance: ${fiberResult.totalDistanceMeters?.toFixed(0)}m.`, duration: 5000 });
          }
        }).catch(err => {
          const fiberErrorMessage = err instanceof Error ? err.message : "Fiber path calculation failed.";
          setFiberPathError(fiberErrorMessage);
          toast({ title: "Fiber Path Error", description: fiberErrorMessage, variant: "destructive", duration: 7000 });
        }).finally(() => {
          setIsFiberCalculating(false);
        });
      } else if (calculateFiberPathEnabled && !successfulLosResult.losPossible) {
        // LOS not feasible, but fiber toggle was on.
        setFiberPathResult({
            status: 'los_not_feasible',
            errorMessage: 'Fiber path not calculated: LOS is not feasible.',
            pointA_original: successfulLosResult.pointA,
            pointB_original: successfulLosResult.pointB,
            losFeasible: false,
            radiusMetersUsed: fiberRadiusMeters,
        });
        setFiberPathError('Fiber path not calculated: LOS is not feasible.');
        setIsFiberCalculating(false); // Ensure loading is stopped
      } else {
        // Fiber toggle is off, or LOS not feasible (and toggle was off)
        setFiberPathResult(null);
        setIsFiberCalculating(false);
      }
    }
  }, [rawServerState, toast, reset, getValues, isAnalysisPanelGloballyOpen, calculateFiberPathEnabled, fiberRadiusMeters]);

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
    if (newIsStale) { // If form changes, previous fiber result is no longer relevant
        setFiberPathResult(null);
        setFiberPathError(null);
    }

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
    setFiberPathResult(null); // Clear fiber results
    setFiberPathError(null);
    setCalculateFiberPathEnabled(false); // Reset toggle
    toast({ title: "Map Cleared", description: "Form reset to default values." });
    if (isAnalysisPanelGloballyOpen) {
        setIsAnalysisPanelGloballyOpen(false);
    }
  };

  const handleLoadHistoryItem = (id: string) => {
    const itemToLoad = historyList.find(item => item.id === id);
    if (itemToLoad) {
      setAnalysisResult(itemToLoad);
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
      setLiveDistanceKm(itemToLoad.distanceKm);
      setIsStale(false);
      setDisplayedError(null);
      setFiberPathResult(null); // Clear fiber result when loading from history (it wasn't saved)
      setFiberPathError(null);
      // Optionally, decide if fiber toggle should be reset or preserved
      // setCalculateFiberPathEnabled(false);
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name}.` });
    }
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    toast({ title: "History Cleared" });
  };

  const handleToggleFiberPath = (checked: boolean) => {
    setCalculateFiberPathEnabled(checked);
    if (!checked) { // If turning off, clear existing fiber results
        setFiberPathResult(null);
        setFiberPathError(null);
    } else if (analysisResult && analysisResult.losPossible && !isStale) {
        // If turning ON and there's a valid, current LOS result, trigger fiber calculation
        setIsFiberCalculating(true);
        setFiberPathError(null);
        performFiberPathAnalysisAction(
          analysisResult.pointA.lat,
          analysisResult.pointA.lng,
          analysisResult.pointB.lat,
          analysisResult.pointB.lng,
          fiberRadiusMeters,
          true
        ).then(fiberResult => {
          setFiberPathResult(fiberResult);
          if (fiberResult.status !== 'success' && fiberResult.errorMessage) {
            setFiberPathError(fiberResult.errorMessage);
            toast({ title: "Fiber Path Info", description: fiberResult.errorMessage, variant: "default", duration: 6000 });
          } else if (fiberResult.status === 'success') {
             toast({ title: "Fiber Path Calculated", description: `Total fiber distance: ${fiberResult.totalDistanceMeters?.toFixed(0)}m.`, duration: 5000 });
          }
        }).catch(err => {
          const fiberErrorMessage = err instanceof Error ? err.message : "Fiber path calculation failed.";
          setFiberPathError(fiberErrorMessage);
          toast({ title: "Fiber Path Error", description: fiberErrorMessage, variant: "destructive", duration: 7000 });
        }).finally(() => {
          setIsFiberCalculating(false);
        });
    } else if (checked && analysisResult && !analysisResult.losPossible) {
        setFiberPathResult({
            status: 'los_not_feasible',
            errorMessage: 'Fiber path not calculated: LOS is not feasible.',
            pointA_original: analysisResult.pointA,
            pointB_original: analysisResult.pointB,
            losFeasible: false,
            radiusMetersUsed: fiberRadiusMeters,
        });
        setFiberPathError('Fiber path not calculated: LOS is not feasible.');
    }
  };

  const handleFiberRadiusChange = (value: string) => {
    const newRadius = parseInt(value, 10);
    if (!isNaN(newRadius) && newRadius >= 0) {
      setFiberRadiusMeters(newRadius);
      // If fiber is enabled and there's a valid LOS result, re-calculate fiber path on radius change
      if (calculateFiberPathEnabled && analysisResult && analysisResult.losPossible && !isStale) {
        setIsFiberCalculating(true);
        setFiberPathError(null);
         performFiberPathAnalysisAction(
          analysisResult.pointA.lat,
          analysisResult.pointA.lng,
          analysisResult.pointB.lat,
          analysisResult.pointB.lng,
          newRadius, // use new radius
          true
        ).then(fiberResult => {
          setFiberPathResult(fiberResult);
          if (fiberResult.status !== 'success' && fiberResult.errorMessage) {
            setFiberPathError(fiberResult.errorMessage);
             toast({ title: "Fiber Path Info", description: fiberResult.errorMessage, variant: "default", duration: 6000 });
          } else if (fiberResult.status === 'success') {
             toast({ title: "Fiber Path Re-calculated", description: `Total fiber distance: ${fiberResult.totalDistanceMeters?.toFixed(0)}m.`, duration: 5000 });
          }
        }).catch(err => {
           const fiberErrorMessage = err instanceof Error ? err.message : "Fiber path calculation failed.";
          setFiberPathError(fiberErrorMessage);
          toast({ title: "Fiber Path Error", description: fiberErrorMessage, variant: "destructive", duration: 7000 });
        }).finally(() => {
          setIsFiberCalculating(false);
        });
      }
    }
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
        <div className="flex-1 w-full relative">
          <InteractiveMap
            pointA={formPointAForMap && formPointAForMap.lat && formPointAForMap.lng ? { lat: parseFloat(formPointAForMap.lat), lng: parseFloat(formPointAForMap.lng), name: formPointAForMap.name } : undefined}
            pointB={formPointBForMap && formPointBForMap.lat && formPointBForMap.lng ? { lat: parseFloat(formPointBForMap.lat), lng: parseFloat(formPointBForMap.lng), name: formPointBForMap.name } : undefined}
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
            mapContainerClassName="w-full h-full"
            analysisResult={analysisResult}
            isStale={isStale}
            currentDistanceKm={liveDistanceKm}
            // TODO: Pass fiberPathResult to map for visualization in a later step
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

        {(isActionPending || isFiberCalculating) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
              <Card className="p-6 shadow-2xl bg-card/90">
                <CardContent className="flex flex-col items-center text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-semibold text-foreground">
                    {isActionPending ? "Analyzing Link..." : "Calculating Fiber Path..."}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isActionPending ? "Please wait while we process elevation data." : "Accessing road network data..."}
                  </p>
                </CardContent>
              </Card>
          </div>
        )}

        {displayedError && !isActionPending && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]" onClick={dismissErrorModal}>
              <Card className="p-6 shadow-2xl bg-destructive/90 max-w-md w-full mx-4">
                <CardHeader>
                  <CardTitle className="text-destructive-foreground flex items-center">
                    <AlertTriangle className="mr-2 h-6 w-6"/> LOS Analysis Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive-foreground mb-4 whitespace-pre-wrap">{displayedError}</p>
                  <Button
                    variant="outline"
                    className="w-full bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
                    onClick={(e) => { e.stopPropagation(); dismissErrorModal();}}
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
          serverFormErrors={undefined}
          isActionPending={isActionPending}
          getValues={getValues}
          setValue={setValue}
          onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
          // Fiber Path Props
          calculateFiberPathEnabled={calculateFiberPathEnabled}
          onToggleFiberPath={handleToggleFiberPath}
          fiberRadiusMeters={fiberRadiusMeters}
          onFiberRadiusChange={handleFiberRadiusChange}
          fiberPathResult={fiberPathResult}
          isFiberCalculating={isFiberCalculating}
          fiberPathError={fiberPathError}
        />
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
