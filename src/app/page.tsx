
"use client";

import React, { useState, useEffect, useCallback, useId } from 'react';
import InteractiveMap from '@/components/fso/interactive-map';
import { useForm, useWatch, Controller as FormController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, MapPin, Cable, Plus, X, Trash2, History } from 'lucide-react'; // Added Trash2, History
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
import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator'; 
import type { FiberPathResult } from '@/tools/fiberPathCalculator'; 

const LOCAL_STORAGE_KEYS = {
  FIBER_TOGGLE: 'fiberPathEnabled',
  FIBER_RADIUS: 'fiberPathRadiusMeters',
};

export default function Home() {
  const { toast } = useToast();
  const [rawServerState, formAction, isActionPending] = React.useActionState(performLosAnalysis, null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [displayedError, setDisplayedError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any | null>(null);


  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const [historyList, setHistoryList] = useState<AnalysisResult[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null);

  // State for Fiber Path Calculation
  const [calculateFiberPathEnabled, setCalculateFiberPathEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE);
      return storedValue ? JSON.parse(storedValue) : false;
    }
    return false;
  });
  const [fiberRadiusMeters, setFiberRadiusMeters] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS);
      return storedValue ? parseInt(storedValue, 10) : 500; // Default radius 500m
    }
    return 500;
  });
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
    setFieldErrors(null);
    setFiberPathResult(null); 
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

    // Check for a returned error object from the server action
    if (typeof rawServerState === 'object' && rawServerState !== null && 'error' in rawServerState && typeof rawServerState.error === 'string') {
      setAnalysisResult(null);
      const errorMessage = rawServerState.error || "An unexpected error occurred during LOS analysis.";
      setDisplayedError(errorMessage);
      if ('fieldErrors' in rawServerState && rawServerState.fieldErrors) {
        setFieldErrors(rawServerState.fieldErrors);
      } else {
        setFieldErrors(null);
      }
      toast({
        title: "LOS Analysis Error",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });
      setFiberPathResult(null); // Clear fiber result on LOS error
      setFiberPathError(null);
    } else if (typeof rawServerState === 'object' && rawServerState !== null && 'losPossible' in rawServerState) {
      // Successful LOS analysis result
      const successfulLosResult = rawServerState as AnalysisResult;
      setAnalysisResult(successfulLosResult);
      setHistoryList(prev => [successfulLosResult, ...prev.slice(0, 19)]);
      setLiveDistanceKm(successfulLosResult.distanceKm);
      setDisplayedError(null);
      setFieldErrors(null);

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
      
      if (!isAnalysisPanelGloballyOpen) {
          setIsAnalysisPanelGloballyOpen(true);
          setIsBottomPanelContentExpanded(true);
      }

      toast({
        title: "LOS Analysis Complete",
        description: successfulLosResult.message || "LOS analysis performed successfully.",
      });

      // --- Trigger Fiber Path Calculation if enabled ---
      if (calculateFiberPathEnabled) {
        setIsFiberCalculating(true);
        setFiberPathError(null);
        setFiberPathResult(null); // Clear previous fiber result

        if (successfulLosResult.losPossible) {
          performFiberPathAnalysisAction(
            successfulLosResult.pointA.lat,
            successfulLosResult.pointA.lng,
            successfulLosResult.pointB.lat,
            successfulLosResult.pointB.lng,
            fiberRadiusMeters,
            true // isLosFeasible is true here
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
        } else {
          // LOS is not feasible, but fiber calculation was enabled.
          setFiberPathResult({
              status: 'los_not_feasible',
              errorMessage: 'Fiber path not calculated: LOS is not feasible for this link.',
              pointA_original: successfulLosResult.pointA,
              pointB_original: successfulLosResult.pointB,
              losFeasible: false,
              radiusMetersUsed: fiberRadiusMeters,
          });
          setFiberPathError('Fiber path not calculated: LOS is not feasible.');
          setIsFiberCalculating(false); 
        }
      } else {
        setFiberPathResult(null); // Clear fiber result if toggle is off
        setFiberPathError(null);
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
    if (newIsStale) { 
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
    setIsAnalysisPanelGloballyOpen(prevIsOpen => {
      const newIsOpen = !prevIsOpen;
      if (newIsOpen) {
        setIsBottomPanelContentExpanded(true); // Ensure panel content is expanded when panel becomes visible
      }
      // No need to explicitly set setIsBottomPanelContentExpanded(false) when closing,
      // as BottomPanel's h-0 class takes precedence when isPanelGloballyOpen is false.
      return newIsOpen;
    });
  }, [setIsAnalysisPanelGloballyOpen, setIsBottomPanelContentExpanded]); // Added setIsBottomPanelContentExpanded

  // const toggleBottomPanelContentExpansion = useCallback(() => {
  //   setIsBottomPanelContentExpanded(prev => !prev);
  // }, []);
  // This function is no longer needed as the chevron is removed and expansion is tied to visibility.

  // Removed handleStartAnalysisClick as it's replaced by the FAB's toggleGlobalPanelVisibility and BottomPanel's internal submit

  const dismissErrorModal = useCallback(() => {
    setDisplayedError(null);
    setFieldErrors(null);
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
    setFieldErrors(null);
    setFiberPathResult(null); 
    setFiberPathError(null);
    // setCalculateFiberPathEnabled(false); // Keep persisted state or reset to default? For now, keep persisted.
    // setFiberRadiusMeters(500); // Keep persisted state or reset? For now, keep persisted.
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
      setFieldErrors(null);
      setFiberPathResult(null); // Clear fiber results when loading from history
      setFiberPathError(null);
      
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name}.` });

      // Optionally, re-run fiber calculation if toggle is ON and LOS is feasible for the loaded item
      if (calculateFiberPathEnabled && itemToLoad.losPossible) {
        setIsFiberCalculating(true);
        performFiberPathAnalysisAction(
          itemToLoad.pointA.lat, itemToLoad.pointA.lng,
          itemToLoad.pointB.lat, itemToLoad.pointB.lng,
          fiberRadiusMeters, true
        ).then(setFiberPathResult).catch(err => {
          setFiberPathError(err.message || "Error re-calculating fiber for history item.");
        }).finally(() => setIsFiberCalculating(false));
      } else if (calculateFiberPathEnabled && !itemToLoad.losPossible) {
         setFiberPathResult({
            status: 'los_not_feasible',
            errorMessage: 'Fiber path not calculated: LOS is not feasible for this historical link.',
            pointA_original: itemToLoad.pointA,
            pointB_original: itemToLoad.pointB,
            losFeasible: false,
            radiusMetersUsed: fiberRadiusMeters,
        });
      }
    }
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    toast({ title: "History Cleared" });
  };

  const handleToggleFiberPath = (checked: boolean) => {
    setCalculateFiberPathEnabled(checked);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE, JSON.stringify(checked));
    }
    if (!checked) { 
        setFiberPathResult(null);
        setFiberPathError(null);
    } else if (analysisResult && !isStale) { // If toggled ON and there's a current, non-stale LOS result
        setIsFiberCalculating(true);
        setFiberPathError(null);
        setFiberPathResult(null);

        if (analysisResult.losPossible) {
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
        } else {
             // LOS is not feasible for the current analysisResult
            setFiberPathResult({
                status: 'los_not_feasible',
                errorMessage: 'Fiber path not calculated: LOS is not feasible for the current link.',
                pointA_original: analysisResult.pointA,
                pointB_original: analysisResult.pointB,
                losFeasible: false,
                radiusMetersUsed: fiberRadiusMeters,
            });
            setFiberPathError('Fiber path not calculated: LOS is not feasible.');
            setIsFiberCalculating(false);
        }
    }
  };

  const handleFiberRadiusChange = (value: string) => {
    const newRadius = parseInt(value, 10);
    if (!isNaN(newRadius) && newRadius >= 0) {
      setFiberRadiusMeters(newRadius);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS, newRadius.toString());
      }
      // If toggle is enabled and there's a valid, non-stale LOS result, re-calculate
      if (calculateFiberPathEnabled && analysisResult && !isStale) {
        setIsFiberCalculating(true);
        setFiberPathError(null);
        setFiberPathResult(null);
        
        if (analysisResult.losPossible) {
             performFiberPathAnalysisAction(
              analysisResult.pointA.lat,
              analysisResult.pointA.lng,
              analysisResult.pointB.lat,
              analysisResult.pointB.lng,
              newRadius, 
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
        } else {
            // LOS is not feasible for the current analysisResult
            setFiberPathResult({
                status: 'los_not_feasible',
                errorMessage: 'Fiber path not calculated: LOS is not feasible for the current link with new radius.',
                pointA_original: analysisResult.pointA,
                pointB_original: analysisResult.pointB,
                losFeasible: false,
                radiusMetersUsed: newRadius,
            });
            setFiberPathError('Fiber path not calculated: LOS is not feasible.');
            setIsFiberCalculating(false);
        }
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
            fiberPathResult={fiberPathResult}
          />
          {/* Map Overlay Buttons */}
          <div className="absolute top-4 right-4 z-30 print:hidden flex flex-col space-y-2">
            <Button
              variant="outline" // Consistent with other overlay buttons
              size="icon"
              onClick={toggleGlobalPanelVisibility} // Same function as the bottom-right FAB
              className="bg-background/70 hover:bg-background/80 backdrop-blur-sm text-foreground p-2 shadow-lg rounded-md" // Consistent styling
              aria-label={isAnalysisPanelGloballyOpen ? "Close Analysis Panel" : "Open Analysis Panel"}
            >
              {isAnalysisPanelGloballyOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearMap}
              className="bg-background/70 hover:bg-background/80 backdrop-blur-sm text-foreground p-2 shadow-lg rounded-md"
              aria-label="Clear Map and Form"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleHistoryPanel}
              className="bg-background/70 hover:bg-background/80 backdrop-blur-sm text-foreground p-2 shadow-lg rounded-md"
              aria-label="Toggle History Panel"
            >
              <History className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* FAB to toggle Analysis Panel Visibility */}
        <div className="fixed bottom-6 right-6 z-50 print:hidden">
          <Button
            onClick={toggleGlobalPanelVisibility}
            size="lg"
            variant="default"
            className="rounded-full shadow-lg w-14 h-14 p-0 flex items-center justify-center bg-primary hover:bg-primary/90"
            aria-label={isAnalysisPanelGloballyOpen ? "Close Analysis Panel" : "Open Analysis Panel"}
          >
            {isAnalysisPanelGloballyOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </Button>
        </div>

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
          // onToggleContentExpansion={toggleBottomPanelContentExpansion} // Prop removed
          isStale={isStale}
          control={control}
          register={register}
          handleSubmit={handleSubmit}
          processSubmit={processSubmit}
          clientFormErrors={clientFormErrors}
          serverFormErrors={fieldErrors} 
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

