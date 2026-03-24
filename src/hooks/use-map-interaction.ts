'use client';

import { useState, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { AnalysisFormValues } from '@/types';
import type { PlacementMode } from '@/components/fso/map-toolbar';
import { calculateDistanceKm } from '@/lib/los-calculator';

export interface UseMapInteractionReturn {
  handleMapClick: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  handleMarkerDrag: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  liveDistanceKm: number | null;
  placementMode: PlacementMode;
  setPlacementMode: (mode: PlacementMode) => void;
}

export function useMapInteraction(
  form: UseFormReturn<AnalysisFormValues>
): UseMapInteractionReturn {
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null);
  const [placementMode, setPlacementMode] = useState<PlacementMode>(null);
  const { setValue, getValues } = form;

  const isValidNumericString = (val: string) => val && !isNaN(parseFloat(val));

  const updateDistanceIfValid = useCallback(() => {
    const currentA = getValues('pointA');
    const currentB = getValues('pointB');

    if (isValidNumericString(currentA.lat) && isValidNumericString(currentA.lng) &&
      isValidNumericString(currentB.lat) && isValidNumericString(currentB.lng)) {
      setLiveDistanceKm(
        calculateDistanceKm(
          { lat: parseFloat(currentA.lat), lng: parseFloat(currentA.lng) },
          { lat: parseFloat(currentB.lat), lng: parseFloat(currentB.lng) }
        )
      );
    } else {
      setLiveDistanceKm(null);
    }
  }, [getValues]);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });

      updateDistanceIfValid();

      // Auto-advance placement mode: A → B → null (pan-only)
      if (pointId === 'pointA') {
        setPlacementMode('B');
      } else {
        setPlacementMode(null);
      }
    }
  }, [setValue, updateDistanceIfValid]);

  const handleMarkerDrag = useCallback((event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
    if (event.latLng) {
      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);
      setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, { shouldDirty: true, shouldValidate: true });
      setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, { shouldDirty: true, shouldValidate: true });

      updateDistanceIfValid();
    }
  }, [setValue, updateDistanceIfValid]);

  return {
    handleMapClick,
    handleMarkerDrag,
    liveDistanceKm,
    placementMode,
    setPlacementMode,
  };
}
