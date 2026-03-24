'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { AnalysisResult, AnalysisFormValues, PointInput as PointFormInputType } from '@/types';

interface UseAnalysisStateOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serverAction: (prevState: any, formData: FormData) => Promise<any>;
  form: UseFormReturn<AnalysisFormValues>;
  isAnalysisPanelGloballyOpen: boolean;
  setIsAnalysisPanelGloballyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsBottomPanelContentExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toast: (opts: { title: string; description?: string; variant?: "default" | "destructive"; duration?: number }) => void;
}

export interface UseAnalysisStateReturn {
  rawServerState: unknown;
  formAction: (payload: FormData) => void;
  isActionPending: boolean;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  displayedError: string | null;
  setDisplayedError: React.Dispatch<React.SetStateAction<string | null>>;
  fieldErrors: Record<string, string[] | undefined> | null;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string[] | undefined> | null>>;
  isStale: boolean;
  setIsStale: React.Dispatch<React.SetStateAction<boolean>>;
  historyList: AnalysisResult[];
  setHistoryList: React.Dispatch<React.SetStateAction<AnalysisResult[]>>;
  dismissErrorModal: () => void;
  loadFromHistory: (id: string) => void;
  clearAnalysis: () => void;
  retryLastAnalysis: () => void;
}

export function useAnalysisState({
  serverAction,
  form,
  isAnalysisPanelGloballyOpen,
  setIsAnalysisPanelGloballyOpen,
  setIsBottomPanelContentExpanded,
  toast
}: UseAnalysisStateOptions) {
  const [rawServerState, formAction, isActionPending] = React.useActionState(serverAction, null);
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [displayedError, setDisplayedError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined> | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [historyList, setHistoryList] = useState<AnalysisResult[]>([]);

  const lastFormDataRef = React.useRef<FormData | null>(null);

  const wrappedFormAction = useCallback((formData: FormData) => {
    lastFormDataRef.current = formData;
    formAction(formData);
  }, [formAction]);

  const retryLastAnalysis = useCallback(() => {
    if (lastFormDataRef.current) {
      React.startTransition(() => {
        formAction(lastFormDataRef.current!);
      });
    }
  }, [formAction]);

  const { getValues, reset, watch } = form;

  // Process server action result
  useEffect(() => {
    if (rawServerState === null) return;

    if (typeof rawServerState === 'object' && rawServerState !== null && 'error' in rawServerState && typeof rawServerState.error === 'string') {
      setAnalysisResult(null);
      const errorMessage = rawServerState.error || "An unexpected error occurred during LOS analysis.";
      setDisplayedError(errorMessage);
      
      if ('fieldErrors' in rawServerState && rawServerState.fieldErrors) {
        setFieldErrors(rawServerState.fieldErrors as Record<string, string[] | undefined>);
      } else {
        setFieldErrors(null);
      }
      toast({ title: "LOS Analysis Error", description: errorMessage, variant: "destructive", duration: 7000 });
      
    } else if (typeof rawServerState === 'object' && rawServerState !== null && 'losPossible' in rawServerState) {
      const successfulLosResult = rawServerState as AnalysisResult;
      
      setAnalysisResult(successfulLosResult);
      setHistoryList(prev => [successfulLosResult, ...prev.slice(0, 19)]);
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
      toast({ title: "LOS Analysis Complete", description: successfulLosResult.message || "LOS analysis performed.", });
    }
  }, [rawServerState, toast, reset, getValues, isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen, setIsBottomPanelContentExpanded]); 

  // Staleness detection
  const watchedPointALat = watch('pointA.lat');
  const watchedPointALng = watch('pointA.lng');
  const watchedPointAHeight = watch('pointA.height');
  const watchedPointBLat = watch('pointB.lat');
  const watchedPointBLng = watch('pointB.lng');
  const watchedPointBHeight = watch('pointB.height');
  const watchedClearanceThreshold = watch('clearanceThreshold');

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
  }, [getValues, analysisResult, watchedPointALat, watchedPointALng, watchedPointAHeight, watchedPointBLat, watchedPointBLng, watchedPointBHeight, watchedClearanceThreshold, isActionPending]);

  const dismissErrorModal = useCallback(() => {
    setDisplayedError(null);
    setFieldErrors(null);
  }, []);

  const loadFromHistory = useCallback((id: string) => {
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
      setIsStale(false); 
      setDisplayedError(null);
      setFieldErrors(null);
            
      setIsAnalysisPanelGloballyOpen(true);
      setIsBottomPanelContentExpanded(true);
      toast({ title: "History Loaded", description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name}.` });
    }
  }, [historyList, reset, setIsAnalysisPanelGloballyOpen, setIsBottomPanelContentExpanded, toast]);

  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setIsStale(false);
    setDisplayedError(null);
    setFieldErrors(null);
  }, []);

  return {
    rawServerState,
    formAction: wrappedFormAction,
    isActionPending,
    analysisResult,
    setAnalysisResult,
    displayedError,
    setDisplayedError,
    fieldErrors,
    setFieldErrors,
    isStale,
    setIsStale,
    historyList,
    setHistoryList,
    dismissErrorModal,
    loadFromHistory,
    clearAnalysis,
    retryLastAnalysis
  };
}
