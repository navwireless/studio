
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '@/components/layout/app-header';
import InteractiveMap from '@/components/fso/interactive-map'; // Reusing for map display
import type { PointCoordinates } from '@/types';
import { FiberCalculatorFormSchema, type FiberCalculatorFormValues, defaultFiberCalculatorFormValues } from '@/lib/fiber-calculator-form-schema';
import { useToast } from '@/hooks/use-toast';
import FiberInputPanel from '@/components/fiber-calculator/FiberInputPanel'; // New component for this page
import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';

const FC_LOCAL_STORAGE_KEYS = {
  SNAP_RADIUS: 'fiberCalculatorSnapRadius',
  POINT_A_LAT: 'fcPointALat',
  POINT_A_LNG: 'fcPointALng',
  POINT_A_NAME: 'fcPointAName',
  POINT_B_LAT: 'fcPointBLat',
  POINT_B_LNG: 'fcPointBLng',
  POINT_B_NAME: 'fcPointBName',
};

export default function FiberCalculatorPage() {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [fiberPathResult, setFiberPathResult] = useState<FiberPathResult | null>(null);

  // Form handling using react-hook-form
  const form = useForm<FiberCalculatorFormValues>({
    resolver: zodResolver(FiberCalculatorFormSchema),
    defaultValues: defaultFiberCalculatorFormValues,
    mode: 'onBlur',
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, getValues, setValue, reset, watch } = form;

  // Persist and load snap radius from localStorage
  useEffect(() => {
    const storedRadius = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.SNAP_RADIUS);
    if (storedRadius) {
      setValue('fiberSnapRadius', parseInt(storedRadius, 10), { shouldValidate: true });
    }
    // Load other persisted fields
    const storedPointALat = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.POINT_A_LAT);
    const storedPointALng = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.POINT_A_LNG);
    const storedPointAName = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.POINT_A_NAME);
    if (storedPointALat) setValue('pointA.lat', storedPointALat);
    if (storedPointALng) setValue('pointA.lng', storedPointALng);
    if (storedPointAName) setValue('pointA.name', storedPointAName);

    const storedPointBLat = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.POINT_B_LAT);
    const storedPointBLng = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.POINT_B_LNG);
    const storedPointBName = localStorage.getItem(FC_LOCAL_STORAGE_KEYS.POINT_B_NAME);
    if (storedPointBLat) setValue('pointB.lat', storedPointBLat);
    if (storedPointBLng) setValue('pointB.lng', storedPointBLng);
    if (storedPointBName) setValue('pointB.name', storedPointBName);

  }, [setValue]);

  const watchedSnapRadius = watch('fiberSnapRadius');
  useEffect(() => {
    if (typeof watchedSnapRadius === 'number') {
      localStorage.setItem(FC_LOCAL_STORAGE_KEYS.SNAP_RADIUS, watchedSnapRadius.toString());
    }
  }, [watchedSnapRadius]);

  const watchedPointA = watch('pointA');
  const watchedPointB = watch('pointB');

  useEffect(() => {
    localStorage.setItem(FC_LOCAL_STORAGE_KEYS.POINT_A_LAT, watchedPointA.lat);
    localStorage.setItem(FC_LOCAL_STORAGE_KEYS.POINT_A_LNG, watchedPointA.lng);
    localStorage.setItem(FC_LOCAL_STORAGE_KEYS.POINT_A_NAME, watchedPointA.name);
  }, [watchedPointA]);

   useEffect(() => {
    localStorage.setItem(FC_LOCAL_STORAGE_KEYS.POINT_B_LAT, watchedPointB.lat);
    localStorage.setItem(FC_LOCAL_STORAGE_KEYS.POINT_B_LNG, watchedPointB.lng);
    localStorage.setItem(FC_LOCAL_STORAGE_KEYS.POINT_B_NAME, watchedPointB.name);
  }, [watchedPointB]);


  const handleCalculateSubmit = async (data: FiberCalculatorFormValues) => {
    setIsCalculating(true);
    setCalculationError(null);
    setFiberPathResult(null);

    try {
      const pointA: PointCoordinates = { lat: parseFloat(data.pointA.lat), lng: parseFloat(data.pointA.lng) };
      const pointB: PointCoordinates = { lat: parseFloat(data.pointB.lat), lng: parseFloat(data.pointB.lng) };
      
      // For the dedicated fiber calculator, LOS feasibility is not a direct input/concern for the calculation itself.
      // The `performFiberPathAnalysisAction` will proceed as if LOS is feasible or this check is bypassed.
      const result = await performFiberPathAnalysisAction(
        pointA.lat, 
        pointA.lng, 
        pointB.lat, 
        pointB.lng, 
        data.fiberSnapRadius,
        true // Marking true here as LOS check is not part of this page's direct workflow before calculation
      );

      setFiberPathResult(result);

      if (result.status !== 'success') {
        setCalculationError(result.errorMessage || 'Fiber path calculation failed.');
        toast({ title: "Calculation Info", description: result.errorMessage || 'Could not calculate fiber path.', variant: result.status === 'api_error' ? "destructive" : "default" });
      } else {
        toast({ title: "Fiber Path Calculated", description: `Total distance: ${result.totalDistanceMeters?.toFixed(0)}m` });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred.";
      setCalculationError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
    }
  }, [setValue]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });
    }
  }, [setValue]);

  const handleClearForm = () => {
    reset(defaultFiberCalculatorFormValues);
    // Optionally clear localStorage for points too, or keep them for convenience
    localStorage.removeItem(FC_LOCAL_STORAGE_KEYS.POINT_A_LAT);
    localStorage.removeItem(FC_LOCAL_STORAGE_KEYS.POINT_A_LNG);
    localStorage.removeItem(FC_LOCAL_STORAGE_KEYS.POINT_A_NAME);
    localStorage.removeItem(FC_LOCAL_STORAGE_KEYS.POINT_B_LAT);
    localStorage.removeItem(FC_LOCAL_STORAGE_KEYS.POINT_B_LNG);
    localStorage.removeItem(FC_LOCAL_STORAGE_KEYS.POINT_B_NAME);
    // Snap radius might be kept or reset based on preference. For now, let's keep it.
    setFiberPathResult(null);
    setCalculationError(null);
    toast({ title: "Form Cleared", description: "Inputs reset to default." });
  };
  
  const formPointAForMap = watch('pointA');
  const formPointBForMap = watch('pointB');

  const mapPointA = formPointAForMap.lat && formPointAForMap.lng ? { lat: parseFloat(formPointAForMap.lat), lng: parseFloat(formPointAForMap.lng), name: formPointAForMap.name } : undefined;
  const mapPointB = formPointBForMap.lat && formPointBForMap.lng ? { lat: parseFloat(formPointBForMap.lat), lng: parseFloat(formPointBForMap.lng), name: formPointBForMap.name } : undefined;

  return (
    <>
      <AppHeader currentPage="bulk" /> {/* TODO: Add 'fiber' to currentPage options and set it here */}
      <div className="flex-1 flex flex-col-reverse md:flex-row overflow-hidden h-[calc(100vh-theme(spacing.12)-theme(spacing.12))]">
        <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[450px] h-auto md:h-full overflow-y-auto custom-scrollbar bg-card/80 backdrop-blur-sm shadow-lg border-t md:border-t-0 md:border-r border-border p-1 print:hidden">
          <FiberInputPanel
            control={control}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={handleCalculateSubmit}
            onClear={handleClearForm}
            clientFormErrors={clientFormErrors}
            isCalculating={isCalculating}
            fiberPathResult={fiberPathResult}
            calculationError={calculationError}
          />
        </div>
        <div className="flex-1 w-full relative min-h-[250px] md:min-h-0">
          <InteractiveMap
            pointA={mapPointA}
            pointB={mapPointB}
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
            mapContainerClassName="w-full h-full"
            analysisResult={null} // No LOS analysis result on this page
            isStale={false} // Not applicable here
            fiberPathResult={fiberPathResult} // To draw the fiber path
          />
        </div>

        {isCalculating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
            <Card className="p-6 shadow-2xl bg-card/90">
              <CardContent className="flex flex-col items-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold text-foreground">Calculating Fiber Path...</p>
                <p className="text-sm text-muted-foreground mt-1">Accessing road network data...</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
