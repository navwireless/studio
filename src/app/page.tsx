
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
import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator'; 
import type { FiberPathResult } from '@/tools/fiberPathCalculator'; 

const LOCAL_STORAGE_KEYS = {
  FIBER_TOGGLE: 'fiberPathEnabled',
  FIBER_RADIUS: 'fiberPathRadiusMeters',
  // Keys for persisting form inputs for single LOS analysis
  POINT_A_NAME: 'homePointAName',
  POINT_A_LAT: 'homePointALat',
  POINT_A_LNG: 'homePointALng',
  POINT_A_HEIGHT: 'homePointAHeight',
  POINT_B_NAME: 'homePointBName',
  POINT_B_LAT: 'homePointBLat',
  POINT_B_LNG: 'homePointBLng',
  POINT_B_HEIGHT: 'homePointBHeight',
  CLEARANCE_THRESHOLD: 'homeClearanceThreshold',
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

  const [isClient, setIsClient] = useState(false);

  // State for Fiber Path Calculation
  const [calculateFiberPathEnabled, setCalculateFiberPathEnabled] = useState<boolean>(false); // Initial static default
  const [fiberRadiusMeters, setFiberRadiusMeters] = useState<number>(500); // Initial static default
  
  const [fiberPathResult, setFiberPathResult] = useState<FiberPathResult | null>(null);
  const [isFiberCalculating, setIsFiberCalculating] = useState(false);
  const [fiberPathError, setFiberPathError] = useState<string | null>(null);

  // Initialize form with static default values
  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema),
    defaultValues: defaultFormStateValues, // Use static defaults for initial render
    mode: 'onBlur',
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, getValues, setValue, reset, watch } = form;

  // Effect to set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []); // Runs once after mount

  // Effect to load settings AND FORM VALUES from localStorage after client mount
  useEffect(() => {
    if (isClient) {
      // Load fiber settings
      const storedToggle = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE);
      if (storedToggle) {
        setCalculateFiberPathEnabled(JSON.parse(storedToggle));
      }
      const storedRadius = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS);
      if (storedRadius) {
        setFiberRadiusMeters(parseInt(storedRadius, 10));
      }

      // Load and set form values using form.reset()
      const initialFormValues: AnalysisFormValues = {
        pointA: {
          name: localStorage.getItem(LOCAL_STORAGE_KEYS.POINT_A_NAME) || defaultFormStateValues.pointA.name,
          lat: localStorage.getItem(LOCAL_STORAGE_KEYS.POINT_A_LAT) || defaultFormStateValues.pointA.lat,
          lng: localStorage.getItem(LOCAL_STORAGE_KEYS.POINT_A_LNG) || defaultFormStateValues.pointA.lng,
          height: parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.POINT_A_HEIGHT) || defaultFormStateValues.pointA.height.toString(), 10),
        },
        pointB: {
          name: localStorage.getItem(LOCAL_STORAGE_KEYS.POINT_B_NAME) || defaultFormStateValues.pointB.name,
          lat: localStorage.getItem(LOCAL_STORAGE_KEYS.POINT_B_LAT) || defaultFormStateValues.pointB.lat,
          lng: localStorage.getItem(LOCAL_STORAGE_KEYS.POINT_B_LNG) || defaultFormStateValues.pointB.lng,
          height: parseInt(localStorage.getItem(LOCAL_STORAGE_KEYS.POINT_B_HEIGHT) || defaultFormStateValues.pointB.height.toString(), 10),
        },
        clearanceThreshold: localStorage.getItem(LOCAL_STORAGE_KEYS.CLEARANCE_THRESHOLD) || defaultFormStateValues.clearanceThreshold,
      };
      reset(initialFormValues); // Reset the form with values from localStorage
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, reset]); // Add reset to dependency array


  // Persist form inputs to localStorage whenever they change
  const watchedPointA = watch('pointA');
  const watchedPointB = watch('pointB');
  const watchedClearanceThreshold = watch('clearanceThreshold');

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_NAME, watchedPointA.name);
      localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_LAT, watchedPointA.lat);
      localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_LNG, watchedPointA.lng);
      localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_HEIGHT, watchedPointA.height.toString());
    }
  }, [isClient, watchedPointA]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_NAME, watchedPointB.name);
      localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_LAT, watchedPointB.lat);
      localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_LNG, watchedPointB.lng);
      localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_HEIGHT, watchedPointB.height.toString());
    }
  }, [isClient, watchedPointB]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CLEARANCE_THRESHOLD, watchedClearanceThreshold);
    }
  }, [isClient, watchedClearanceThreshold]);


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


  // Unified Fiber Path Calculation Logic
  const triggerFiberCalculation = useCallback(async () => {
    if (!analysisResult || !analysisResult.losPossible || !calculateFiberPathEnabled || isStale) {
      if (calculateFiberPathEnabled && analysisResult && !analysisResult.losPossible) {
        setFiberPathResult({
          status: 'los_not_feasible',
          errorMessage: 'Fiber path not calculated: LOS is not feasible for this link.',
          pointA_original: analysisResult.pointA,
          pointB_original: analysisResult.pointB,
          losFeasible: false,
          radiusMetersUsed: fiberRadiusMeters,
        });
      } else if (calculateFiberPathEnabled && isStale) {
         setFiberPathResult(null); // Clear fiber results if LOS data is stale
      } else if (!calculateFiberPathEnabled) {
        setFiberPathResult(null); // Clear if toggle is off
      }
      setFiberPathError(null);
      setIsFiberCalculating(false);
      return;
    }

    setIsFiberCalculating(true);
    setFiberPathError(null);
    setFiberPathResult(null);

    try {
      const fiberResultData = await performFiberPathAnalysisAction(
        analysisResult.pointA.lat,
        analysisResult.pointA.lng,
        analysisResult.pointB.lat,
        analysisResult.pointB.lng,
        fiberRadiusMeters,
        true // LOS is feasible here
      );
      setFiberPathResult(fiberResultData);
      if (fiberResultData.status !== 'success' && fiberResultData.errorMessage) {
        setFiberPathError(fiberResultData.errorMessage);
        toast({ title: "Fiber Path Info", description: fiberResultData.errorMessage, variant: "default", duration: 6000 });
      } else if (fiberResultData.status === 'success') {
        toast({ title: "Fiber Path Calculated", description: `Total fiber distance: ${fiberResultData.totalDistanceMeters?.toFixed(0)}m.`, duration: 5000 });
      }
    } catch (err) {
      const fiberErrorMessage = err instanceof Error ? err.message : "Fiber path calculation failed.";
      setFiberPathError(fiberErrorMessage);
      setFiberPathResult({
        status: 'api_error',
        errorMessage: fiberErrorMessage,
        pointA_original: analysisResult.pointA,
        pointB_original: analysisResult.pointB,
        losFeasible: true, // Assumed true if we got this far
        radiusMetersUsed: fiberRadiusMeters,
      });
      toast({ title: "Fiber Path Error", description: fiberErrorMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsFiberCalculating(false);
    }
  }, [analysisResult, calculateFiberPathEnabled, fiberRadiusMeters, toast, isStale]);


  // Effect to handle LOS Analysis results and trigger Fiber Path calculation
  useEffect(() => {
    if (rawServerState === null) return;

    if (typeof rawServerState === 'object' && rawServerState !== null && 'error' in rawServerState && typeof rawServerState.error === 'string') {
      const newAnalysisResult = null;
      setAnalysisResult(newAnalysisResult);
      const errorMessage = rawServerState.error || "An unexpected error occurred during LOS analysis.";
      setDisplayedError(errorMessage);
      if ('fieldErrors' in rawServerState && rawServerState.fieldErrors) setFieldErrors(rawServerState.fieldErrors);
      else setFieldErrors(null);
      toast({ title: "LOS Analysis Error", description: errorMessage, variant: "destructive", duration: 7000 });
      
      setFiberPathResult(null); 
      setFiberPathError(null);
      setIsFiberCalculating(false);

    } else if (typeof rawServerState === 'object' && rawServerState !== null && 'losPossible' in rawServerState) {
      const successfulLosResult = rawServerState as AnalysisResult;
      setAnalysisResult(successfulLosResult); // Set analysisResult first
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
      reset(formValuesForResult); // Reset form *after* analysisResult is set
      setIsStale(false); // Mark as not stale
      
      if (!isAnalysisPanelGloballyOpen) {
          setIsAnalysisPanelGloballyOpen(true);
          setIsBottomPanelContentExpanded(true);
      }
      toast({ title: "LOS Analysis Complete", description: successfulLosResult.message || "LOS analysis performed.", });
      
      // Trigger fiber calculation AFTER analysisResult state is updated
      // This needs to happen in a separate effect that watches analysisResult or be called carefully
      // For now, triggerFiberCalculation will be called by useEffect watching analysisResult.
    }
  }, [rawServerState, toast, reset, getValues, isAnalysisPanelGloballyOpen]); 

  // New useEffect to trigger fiber calculation when analysisResult changes and conditions are met
  useEffect(() => {
    if (analysisResult && !isStale && calculateFiberPathEnabled && analysisResult.losPossible) {
      triggerFiberCalculation();
    } else if (analysisResult && !isStale && calculateFiberPathEnabled && !analysisResult.losPossible) {
        setFiberPathResult({
            status: 'los_not_feasible',
            errorMessage: 'Fiber path not calculated: LOS is not feasible for this link.',
            pointA_original: analysisResult.pointA,
            pointB_original: analysisResult.pointB,
            losFeasible: false,
            radiusMetersUsed: fiberRadiusMeters,
        });
        setFiberPathError(null);
        setIsFiberCalculating(false);
    }
  }, [analysisResult, isStale, calculateFiberPathEnabled, triggerFiberCalculation, fiberRadiusMeters]);


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
    // Only submit if the form is valid according to client-side schema
    form.trigger().then(isValid => {
        if (isValid) {
            handleSubmit(processSubmit)();
        } else {
            toast({ title: "Input Error", description: "Please correct form errors before re-analyzing.", variant: "destructive" });
        }
    });
  }, [setValue, handleSubmit, processSubmit, form, toast]);


  const toggleGlobalPanelVisibility = useCallback(() => {
    setIsAnalysisPanelGloballyOpen(prev => !prev);
  }, []);

  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);

  const handleStartAnalysisClick = () => {
    setIsAnalysisPanelGloballyOpen(true);
    setIsBottomPanelContentExpanded(true);
    // Only submit if the form is valid according to client-side schema
     form.trigger().then(isValid => {
        if (isValid) {
            handleSubmit(processSubmit)();
        } else {
            toast({ title: "Input Error", description: "Please correct form errors before analyzing.", variant: "destructive" });
        }
    });
  };

  const dismissErrorModal = useCallback(() => {
    setDisplayedError(null);
    setFieldErrors(null);
  }, []);

  const handleToggleHistoryPanel = () => {
    setIsHistoryPanelOpen(prev => !prev);
  };

  const handleClearMap = () => {
    reset(defaultFormStateValues); 
     if (isClient) { 
        Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
            if (key !== LOCAL_STORAGE_KEYS.FIBER_TOGGLE && key !== LOCAL_STORAGE_KEYS.FIBER_RADIUS) {
                 localStorage.removeItem(key);
            }
        });
    }
    setAnalysisResult(null);
    setLiveDistanceKm(null);
    setIsStale(false);
    setDisplayedError(null);
    setFieldErrors(null);
    setFiberPathResult(null); 
    setFiberPathError(null);
    toast({ title: "Map Cleared", description: "Form reset to default values." });
    if (isAnalysisPanelGloballyOpen) {
        setIsAnalysisPanelGloballyOpen(false);
    }
  };

  const handleLoadHistoryItem = (id: string) => {
    const itemToLoad = historyList.find(item => item.id === id);
    if (itemToLoad) {
      // Set analysisResult first to allow fiber calculation effect to pick it up
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
            
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name}.` });
      
      // Fiber calculation is now handled by the useEffect watching analysisResult, isStale, and calculateFiberPathEnabled
      // No explicit call to triggerFiberCalculation needed here, as setting analysisResult will trigger that effect.
       if (!calculateFiberPathEnabled) { // If toggle is off, ensure fiber results are cleared
            setFiberPathResult(null);
            setFiberPathError(null);
            setIsFiberCalculating(false);
       } else if (calculateFiberPathEnabled && !itemToLoad.losPossible) {
            // If toggle is on but loaded history item has LOS not possible
            setFiberPathResult({
                status: 'los_not_feasible',
                errorMessage: 'Fiber path not calculated: LOS is not feasible for this historical link.',
                pointA_original: itemToLoad.pointA,
                pointB_original: itemToLoad.pointB,
                losFeasible: false,
                radiusMetersUsed: fiberRadiusMeters,
            });
            setFiberPathError(null);
            setIsFiberCalculating(false);
       }
    }
  };

  const handleClearHistory = () => {
    setHistoryList([]);
    toast({ title: "History Cleared" });
  };

  // Called when "Fiber" toggle is switched
  const handleToggleFiberPath = (checked: boolean) => {
    setCalculateFiberPathEnabled(checked);
    if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE, JSON.stringify(checked));
    }
    // Let the useEffect watching calculateFiberPathEnabled and analysisResult handle triggering calculation.
    if (!checked) { 
        setFiberPathResult(null);
        setFiberPathError(null);
        setIsFiberCalculating(false);
    } else {
        // If toggled on, and we have a valid, non-stale, feasible LOS result, trigger calc
        if (analysisResult && !isStale && analysisResult.losPossible) {
            triggerFiberCalculation();
        } else if (analysisResult && !isStale && !analysisResult.losPossible) {
            setFiberPathResult({
                status: 'los_not_feasible',
                errorMessage: 'Fiber path not calculated: LOS is not feasible for the current link.',
                pointA_original: analysisResult.pointA,
                pointB_original: analysisResult.pointB,
                losFeasible: false,
                radiusMetersUsed: fiberRadiusMeters,
            });
            setFiberPathError(null);
        }
    }
  };

  // Called when "Apply" for Snap Radius is clicked in BottomPanel
  const handleFiberRadiusChange = (newRadius: number) => {
    setFiberRadiusMeters(newRadius);
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS, newRadius.toString());
    }
    // Let the useEffect watching fiberRadiusMeters and analysisResult handle triggering calculation.
     if (calculateFiberPathEnabled && analysisResult && !isStale && analysisResult.losPossible) {
        triggerFiberCalculation();
    } else if (calculateFiberPathEnabled && analysisResult && !isStale && !analysisResult.losPossible) {
        setFiberPathResult({
            status: 'los_not_feasible',
            errorMessage: 'Fiber path not calculated: LOS is not feasible for the current link with new radius.',
            pointA_original: analysisResult.pointA,
            pointB_original: analysisResult.pointB,
            losFeasible: false,
            radiusMetersUsed: newRadius,
        });
        setFiberPathError(null);
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
            pointA={watchedPointA && isValidNumericString(watchedPointA.lat) && isValidNumericString(watchedPointA.lng) ? { lat: parseFloat(watchedPointA.lat), lng: parseFloat(watchedPointA.lng), name: watchedPointA.name } : undefined}
            pointB={watchedPointB && isValidNumericString(watchedPointB.lat) && isValidNumericString(watchedPointB.lng) ? { lat: parseFloat(watchedPointB.lat), lng: parseFloat(watchedPointB.lng), name: watchedPointB.name } : undefined}
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
            mapContainerClassName="w-full h-full"
            analysisResult={analysisResult}
            isStale={isStale}
            currentDistanceKm={liveDistanceKm}
            fiberPathResult={fiberPathResult}
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
