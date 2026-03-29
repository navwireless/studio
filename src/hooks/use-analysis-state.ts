// src/hooks/use-analysis-state.ts

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { AnalysisResult, AnalysisFormValues, PointInput as PointFormInputType } from '@/types';

interface UseAnalysisStateOptions {
  /** Server action function compatible with useActionState */
  serverAction: (
    prevState: AnalysisResult | { error: string; fieldErrors?: Record<string, string[] | undefined> } | null,
    formData: FormData
  ) => Promise<AnalysisResult | { error: string; fieldErrors?: Record<string, string[] | undefined> }>;
  /** The react-hook-form instance */
  form: UseFormReturn<AnalysisFormValues>;
  /** Whether the analysis panel is currently open */
  isAnalysisPanelGloballyOpen: boolean;
  /** Setter for analysis panel open state */
  setIsAnalysisPanelGloballyOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Setter for bottom panel content expanded state */
  setIsBottomPanelContentExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  /** Toast notification function */
  toast: (opts: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }) => void;
}

export interface UseAnalysisStateReturn {
  /** Raw server action state for downstream consumers */
  rawServerState: unknown;
  /** Wrapped form action that tracks the last submission */
  formAction: (payload: FormData) => void;
  /** Whether a server action is currently pending */
  isActionPending: boolean;
  /** The current analysis result, or null */
  analysisResult: AnalysisResult | null;
  /** Direct setter for analysis result */
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  /** Current error message to display, or null */
  displayedError: string | null;
  /** Direct setter for displayed error */
  setDisplayedError: React.Dispatch<React.SetStateAction<string | null>>;
  /** Field-level validation errors from the server, or null */
  fieldErrors: Record<string, string[] | undefined> | null;
  /** Direct setter for field errors */
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string[] | undefined> | null>>;
  /** Whether the current form values differ from the last analysis result */
  isStale: boolean;
  /** Direct setter for staleness */
  setIsStale: React.Dispatch<React.SetStateAction<boolean>>;
  /** Session history of analysis results */
  historyList: AnalysisResult[];
  /** Direct setter for history list */
  setHistoryList: React.Dispatch<React.SetStateAction<AnalysisResult[]>>;
  /** Currently selected device ID, or null */
  selectedDeviceId: string | null;
  /** Direct setter for selected device ID */
  setSelectedDeviceId: React.Dispatch<React.SetStateAction<string | null>>;
  /** Dismisses the error modal and clears field errors */
  dismissErrorModal: () => void;
  /** Loads a previous analysis from the session history list */
  loadFromHistory: (id: string) => void;
  /** Clears all analysis state and resets device selection */
  clearAnalysis: () => void;
  /** Retries the last analysis submission */
  retryLastAnalysis: () => void;
}

/**
 * Manages the full lifecycle of a LOS analysis:
 * - Server action state (pending, result, error)
 * - Analysis result + history
 * - Form staleness detection (did user change inputs after last analysis?)
 * - Device selection state
 * - Error display and dismissal
 * - History loading and analysis clearing
 *
 * @param options - Configuration including server action, form, panel state, and toast
 * @returns Full analysis state and control functions
 *
 * @example
 * const { analysisResult, isStale, formAction, isActionPending } = useAnalysisState({
 *   serverAction: performLosAnalysis,
 *   form,
 *   isAnalysisPanelGloballyOpen,
 *   setIsAnalysisPanelGloballyOpen,
 *   setIsBottomPanelContentExpanded,
 *   toast,
 * });
 */
export function useAnalysisState({
  serverAction,
  form,
  isAnalysisPanelGloballyOpen,
  setIsAnalysisPanelGloballyOpen,
  setIsBottomPanelContentExpanded,
  toast,
}: UseAnalysisStateOptions): UseAnalysisStateReturn {
  const [rawServerState, formAction, isActionPending] = React.useActionState(serverAction, null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [displayedError, setDisplayedError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined> | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [historyList, setHistoryList] = useState<AnalysisResult[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const lastFormDataRef = React.useRef<FormData | null>(null);
  const lastProcessedStateRef = React.useRef<unknown>(null);

  const wrappedFormAction = useCallback(
    (formData: FormData) => {
      lastFormDataRef.current = formData;
      formAction(formData);
    },
    [formAction]
  );

  const retryLastAnalysis = useCallback(() => {
    const formDataToRetry = lastFormDataRef.current;
    if (formDataToRetry) {
      React.startTransition(() => {
        formAction(formDataToRetry);
      });
    }
  }, [formAction]);

  const { getValues, reset, watch } = form;

  // Process server action result
  useEffect(() => {
    if (rawServerState === null || rawServerState === lastProcessedStateRef.current) return;
    lastProcessedStateRef.current = rawServerState;

    const state = rawServerState as Record<string, unknown>;

    if (typeof state === 'object' && state !== null && 'error' in state && typeof state.error === 'string') {
      setAnalysisResult(null);
      const errorMessage = (state.error as string) || 'An unexpected error occurred during LOS analysis.';
      setDisplayedError(errorMessage);

      if ('fieldErrors' in state && state.fieldErrors && typeof state.fieldErrors === 'object') {
        setFieldErrors(state.fieldErrors as Record<string, string[] | undefined>);
      } else {
        setFieldErrors(null);
      }
      toast({
        title: 'LOS Analysis Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 7000,
      });
    } else if (typeof state === 'object' && state !== null && 'losPossible' in state) {
      const successfulLosResult = rawServerState as AnalysisResult;

      setAnalysisResult(successfulLosResult);
      setHistoryList(prev => [successfulLosResult, ...prev.slice(0, 19)]);
      setDisplayedError(null);
      setFieldErrors(null);

      // Sync device selection from result (server may have stored it)
      if (successfulLosResult.selectedDeviceId) {
        setSelectedDeviceId(successfulLosResult.selectedDeviceId);
      }

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
        title: 'LOS Analysis Complete',
        description: successfulLosResult.message || 'LOS analysis performed.',
      });
    }
  }, [
    rawServerState,
    toast,
    reset,
    getValues,
    isAnalysisPanelGloballyOpen,
    setIsAnalysisPanelGloballyOpen,
    setIsBottomPanelContentExpanded,
  ]);

  // Staleness detection — tracks whether user has changed inputs since last analysis
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
    const isValidNumeric = (val: string) => val !== '' && !isNaN(parseFloat(val));
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

      // Check if any form value differs from the last analysis result
      const formChanged =
        analysisResult.pointA.lat !== formLatA ||
        analysisResult.pointA.lng !== formLngA ||
        analysisResult.pointA.towerHeight !== formHeightA ||
        analysisResult.pointB.lat !== formLatB ||
        analysisResult.pointB.lng !== formLngB ||
        analysisResult.pointB.towerHeight !== formHeightB ||
        analysisResult.clearanceThresholdUsed !== formClearanceNum;

      // Check if device selection changed since last analysis
      const deviceChanged = (analysisResult.selectedDeviceId || null) !== selectedDeviceId;

      newIsStale = formChanged || deviceChanged;
    } else {
      if (canPerformAnalysisWithCurrentForm) {
        newIsStale = true;
      } else {
        newIsStale = false;
      }
    }

    setIsStale(newIsStale);
  }, [
    getValues,
    analysisResult,
    selectedDeviceId,
    watchedPointALat,
    watchedPointALng,
    watchedPointAHeight,
    watchedPointBLat,
    watchedPointBLng,
    watchedPointBHeight,
    watchedClearanceThreshold,
    isActionPending,
  ]);

  /** Dismiss the error modal and clear field errors */
  const dismissErrorModal = useCallback(() => {
    setDisplayedError(null);
    setFieldErrors(null);
  }, []);

  /** Load a previous analysis from the session history list */
  const loadFromHistory = useCallback(
    (id: string) => {
      const itemToLoad = historyList.find(item => item.id === id);
      if (itemToLoad) {
        setAnalysisResult(itemToLoad);

        // Restore device selection from the loaded analysis
        setSelectedDeviceId(itemToLoad.selectedDeviceId || null);

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
        toast({
          title: 'History Loaded',
          description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name}.`,
        });
      }
    },
    [historyList, reset, setIsAnalysisPanelGloballyOpen, setIsBottomPanelContentExpanded, toast]
  );

  /** Clear all analysis state and reset device selection */
  const clearAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setSelectedDeviceId(null);
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
    selectedDeviceId,
    setSelectedDeviceId,
    dismissErrorModal,
    loadFromHistory,
    clearAnalysis,
    retryLastAnalysis,
  };
}