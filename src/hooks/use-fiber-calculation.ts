'use client';

import { useState, useCallback, useEffect } from 'react';
import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import type { AnalysisResult } from '@/types';
import { LOCAL_STORAGE_KEYS } from './use-form-persistence';

interface UseFiberCalculationOptions {
  analysisResult: AnalysisResult | null;
  isStale: boolean;
  toast: (opts: { title: string; description?: string; variant?: "default" | "destructive"; duration?: number }) => void;
  rawServerState: unknown;
}

export interface UseFiberCalculationReturn {
  calculateFiberPathEnabled: boolean;
  fiberRadiusMeters: number;
  localSnapRadiusInput: string;
  setLocalSnapRadiusInput: (val: string) => void;
  fiberPathResult: FiberPathResult | null;
  isFiberCalculating: boolean;
  fiberPathError: string | null;
  handleToggleFiberPath: (checked: boolean) => void;
  handleApplySnapRadius: () => void;
  setFiberPathResult: React.Dispatch<React.SetStateAction<FiberPathResult | null>>;
  setFiberPathError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsFiberCalculating: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useFiberCalculation({
  analysisResult,
  isStale,
  toast,
  rawServerState
}: UseFiberCalculationOptions): UseFiberCalculationReturn {
  const [calculateFiberPathEnabled, setCalculateFiberPathEnabled] = useState<boolean>(false);
  const [fiberRadiusMeters, setFiberRadiusMeters] = useState<number>(500);
  const [localSnapRadiusInput, setLocalSnapRadiusInput] = useState<string>('500');
  
  const [fiberPathResult, setFiberPathResult] = useState<FiberPathResult | null>(null);
  const [isFiberCalculating, setIsFiberCalculating] = useState(false);
  const [fiberPathError, setFiberPathError] = useState<string | null>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user fiber preferences on mount
  useEffect(() => {
    if (isClient) {
      const storedToggle = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE);
      if (storedToggle) {
        setCalculateFiberPathEnabled(JSON.parse(storedToggle));
      }
      const storedRadius = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS);
      if (storedRadius) {
        const radiusNum = parseInt(storedRadius, 10);
        setFiberRadiusMeters(radiusNum);
        setLocalSnapRadiusInput(radiusNum.toString());
      }
    }
  }, [isClient]);

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
         setFiberPathResult(null); 
      } else if (!calculateFiberPathEnabled) {
        setFiberPathResult(null); 
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
        true 
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
        losFeasible: true,
        radiusMetersUsed: fiberRadiusMeters,
      });
      toast({ title: "Fiber Path Error", description: fiberErrorMessage, variant: "destructive", duration: 7000 });
    } finally {
      setIsFiberCalculating(false);
    }
  }, [analysisResult, calculateFiberPathEnabled, fiberRadiusMeters, toast, isStale]);

  // Effect to handle LOS server state errors (clears fiber data)
  useEffect(() => {
    if (rawServerState && typeof rawServerState === 'object' && 'error' in rawServerState && typeof rawServerState.error === 'string') {
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

  // Trigger fiber calculation when analysisResult changes
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

  const handleToggleFiberPath = (checked: boolean) => {
    setCalculateFiberPathEnabled(checked);
    if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE, JSON.stringify(checked));
    }
    if (!checked) { 
        setFiberPathResult(null);
        setFiberPathError(null);
        setIsFiberCalculating(false);
    } else {
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
        } else {
          setFiberPathResult(null);
          setFiberPathError(null);
        }
    }
  };

  const handleApplySnapRadius = () => {
    const newRadius = parseInt(localSnapRadiusInput, 10);
    if (!isNaN(newRadius) && newRadius > 0) {
      setFiberRadiusMeters(newRadius);
      if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS, newRadius.toString());
      }
      if (calculateFiberPathEnabled && analysisResult && !isStale && analysisResult.losPossible) {
        triggerFiberCalculation();
      }
    } else {
      toast({title: "Invalid Radius", description: "Please enter a valid number for snap radius.", variant: "destructive"});
    }
  };

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
    setIsFiberCalculating
  };
}
