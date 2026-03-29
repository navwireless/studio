'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import type { AnalysisResult } from '@/types';
import { LOCAL_STORAGE_KEYS } from './use-form-persistence';

interface UseFiberCalculationOptions {
  /** Current analysis result to calculate fiber path for */
  analysisResult: AnalysisResult | null;
  /** Whether the analysis result is stale (user changed inputs) */
  isStale: boolean;
  /** Toast notification function */
  toast: (opts: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    duration?: number;
  }) => void;
  /** Raw server action state for detecting LOS errors */
  rawServerState: unknown;
}

export interface UseFiberCalculationReturn {
  /** Whether fiber path calculation is enabled */
  calculateFiberPathEnabled: boolean;
  /** Current snap radius in meters */
  fiberRadiusMeters: number;
  /** Local input value for snap radius (string for text input) */
  localSnapRadiusInput: string;
  /** Sets the local snap radius input value */
  setLocalSnapRadiusInput: (val: string) => void;
  /** The fiber path calculation result, or null */
  fiberPathResult: FiberPathResult | null;
  /** Whether a fiber calculation is in progress */
  isFiberCalculating: boolean;
  /** Error message from fiber calculation, or null */
  fiberPathError: string | null;
  /** Toggles fiber path calculation on/off */
  handleToggleFiberPath: (checked: boolean) => void;
  /** Applies the current snap radius input and recalculates */
  handleApplySnapRadius: () => void;
  /** Direct setter for fiber path result */
  setFiberPathResult: React.Dispatch<React.SetStateAction<FiberPathResult | null>>;
  /** Direct setter for fiber path error */
  setFiberPathError: React.Dispatch<React.SetStateAction<string | null>>;
  /** Direct setter for fiber calculating state */
  setIsFiberCalculating: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Manages fiber path calculation state, including toggle persistence,
 * snap radius management, and automatic recalculation when analysis results change.
 *
 * Persists user preferences (toggle state and radius) to localStorage.
 * Handles race conditions by tracking an abort flag for stale calculations.
 *
 * @param options - Configuration including analysis result, staleness, toast, and server state
 * @returns Fiber calculation state and control functions
 *
 * @example
 * const { fiberPathResult, isFiberCalculating, handleToggleFiberPath } = useFiberCalculation({
 *   analysisResult, isStale, toast, rawServerState
 * });
 */
export function useFiberCalculation({
  analysisResult,
  isStale,
  toast,
  rawServerState,
}: UseFiberCalculationOptions): UseFiberCalculationReturn {
  const [calculateFiberPathEnabled, setCalculateFiberPathEnabled] = useState<boolean>(false);
  const [fiberRadiusMeters, setFiberRadiusMeters] = useState<number>(500);
  const [localSnapRadiusInput, setLocalSnapRadiusInput] = useState<string>('500');

  const [fiberPathResult, setFiberPathResult] = useState<FiberPathResult | null>(null);
  const [isFiberCalculating, setIsFiberCalculating] = useState(false);
  const [fiberPathError, setFiberPathError] = useState<string | null>(null);

  const [isClient, setIsClient] = useState(false);

  // Abort flag to prevent stale fiber calculations from updating state
  const calculationIdRef = useRef(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user fiber preferences on mount
  useEffect(() => {
    if (!isClient) return;

    try {
      const storedToggle = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE);
      if (storedToggle !== null) {
        setCalculateFiberPathEnabled(JSON.parse(storedToggle) === true);
      }
    } catch {
      // Ignore corrupted toggle value
    }

    try {
      const storedRadius = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS);
      if (storedRadius !== null) {
        const radiusNum = parseInt(storedRadius, 10);
        if (!isNaN(radiusNum) && radiusNum > 0) {
          setFiberRadiusMeters(radiusNum);
          setLocalSnapRadiusInput(radiusNum.toString());
        }
      }
    } catch {
      // Ignore corrupted radius value
    }
  }, [isClient]);

  /**
   * Builds a "LOS not feasible" fiber result for display purposes.
   */
  const buildLosNotFeasibleResult = useCallback(
    (result: AnalysisResult, radius: number): FiberPathResult => ({
      status: 'los_not_feasible',
      errorMessage: 'Fiber path not calculated: LOS is not feasible for this link.',
      pointA_original: result.pointA,
      pointB_original: result.pointB,
      losFeasible: false,
      radiusMetersUsed: radius,
    }),
    []
  );

  const triggerFiberCalculation = useCallback(
    async (result: AnalysisResult, radius: number) => {
      if (!result.losPossible) {
        setFiberPathResult(buildLosNotFeasibleResult(result, radius));
        setFiberPathError(null);
        setIsFiberCalculating(false);
        return;
      }

      // Increment calculation ID to invalidate any in-flight requests
      const thisCalculationId = ++calculationIdRef.current;

      setIsFiberCalculating(true);
      setFiberPathError(null);
      setFiberPathResult(null);

      try {
        const fiberResultData = await performFiberPathAnalysisAction(
          result.pointA.lat,
          result.pointA.lng,
          result.pointB.lat,
          result.pointB.lng,
          radius,
          true
        );

        // Check if this calculation is still the latest one
        if (calculationIdRef.current !== thisCalculationId) return;

        setFiberPathResult(fiberResultData);

        if (fiberResultData.status !== 'success' && fiberResultData.errorMessage) {
          setFiberPathError(fiberResultData.errorMessage);
          toast({
            title: 'Fiber Path Info',
            description: fiberResultData.errorMessage,
            variant: 'default',
            duration: 6000,
          });
        } else if (fiberResultData.status === 'success') {
          toast({
            title: 'Fiber Path Calculated',
            description: `Total fiber distance: ${fiberResultData.totalDistanceMeters?.toFixed(0)}m.`,
            duration: 5000,
          });
        }
      } catch (err) {
        // Check if this calculation is still the latest one
        if (calculationIdRef.current !== thisCalculationId) return;

        const fiberErrorMessage =
          err instanceof Error ? err.message : 'Fiber path calculation failed.';
        setFiberPathError(fiberErrorMessage);
        setFiberPathResult({
          status: 'api_error',
          errorMessage: fiberErrorMessage,
          pointA_original: result.pointA,
          pointB_original: result.pointB,
          losFeasible: true,
          radiusMetersUsed: radius,
        });
        toast({
          title: 'Fiber Path Error',
          description: fiberErrorMessage,
          variant: 'destructive',
          duration: 7000,
        });
      } finally {
        if (calculationIdRef.current === thisCalculationId) {
          setIsFiberCalculating(false);
        }
      }
    },
    [toast, buildLosNotFeasibleResult]
  );

  // Clear fiber data when server returns a LOS error
  useEffect(() => {
    if (
      rawServerState &&
      typeof rawServerState === 'object' &&
      'error' in rawServerState &&
      typeof (rawServerState as Record<string, unknown>).error === 'string'
    ) {
      setFiberPathResult(null);
      setFiberPathError(null);
      setIsFiberCalculating(false);
    }
  }, [rawServerState]);

  // Clear fiber path if stale
  useEffect(() => {
    if (isStale) {
      setFiberPathResult(null);
      setFiberPathError(null);
    }
  }, [isStale]);

  // Trigger fiber calculation when analysisResult changes and conditions are met
  useEffect(() => {
    if (!analysisResult || isStale || !calculateFiberPathEnabled) return;

    if (analysisResult.losPossible) {
      triggerFiberCalculation(analysisResult, fiberRadiusMeters);
    } else {
      setFiberPathResult(buildLosNotFeasibleResult(analysisResult, fiberRadiusMeters));
      setFiberPathError(null);
      setIsFiberCalculating(false);
    }
  }, [
    analysisResult,
    isStale,
    calculateFiberPathEnabled,
    fiberRadiusMeters,
    triggerFiberCalculation,
    buildLosNotFeasibleResult,
  ]);

  /**
   * Handles toggling fiber path calculation on or off.
   * Persists preference to localStorage and triggers/clears calculation accordingly.
   */
  const handleToggleFiberPath = useCallback(
    (checked: boolean) => {
      setCalculateFiberPathEnabled(checked);
      if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE, JSON.stringify(checked));
      }

      if (!checked) {
        setFiberPathResult(null);
        setFiberPathError(null);
        setIsFiberCalculating(false);
      } else if (analysisResult && !isStale) {
        if (analysisResult.losPossible) {
          triggerFiberCalculation(analysisResult, fiberRadiusMeters);
        } else {
          setFiberPathResult(buildLosNotFeasibleResult(analysisResult, fiberRadiusMeters));
          setFiberPathError(null);
        }
      } else {
        setFiberPathResult(null);
        setFiberPathError(null);
      }
    },
    [
      isClient,
      analysisResult,
      isStale,
      fiberRadiusMeters,
      triggerFiberCalculation,
      buildLosNotFeasibleResult,
    ]
  );

  /**
   * Applies the current snap radius input, validates it,
   * persists to localStorage, and triggers recalculation if appropriate.
   */
  const handleApplySnapRadius = useCallback(() => {
    const newRadius = parseInt(localSnapRadiusInput, 10);
    if (isNaN(newRadius) || newRadius <= 0) {
      toast({
        title: 'Invalid Radius',
        description: 'Please enter a valid positive number for snap radius.',
        variant: 'destructive',
      });
      return;
    }

    setFiberRadiusMeters(newRadius);
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS, newRadius.toString());
    }

    // Trigger with the new radius directly to avoid stale state
    if (calculateFiberPathEnabled && analysisResult && !isStale && analysisResult.losPossible) {
      triggerFiberCalculation(analysisResult, newRadius);
    }
  }, [
    localSnapRadiusInput,
    isClient,
    calculateFiberPathEnabled,
    analysisResult,
    isStale,
    triggerFiberCalculation,
    toast,
  ]);

  return {
    calculateFiberPathEnabled,
    fiberRadiusMeters,
    localSnapRadiusInput,
    setLocalSnapRadiusInput,
    fiberPathResult,
    isFiberCalculating,
    fiberPathError,
    handleToggleFiberPath,
    handleApplySnapRadius,
    setFiberPathResult,
    setFiberPathError,
    setIsFiberCalculating,
  };
}