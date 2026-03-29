'use client';

import { useState, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { AnalysisFormValues, PlacementMode } from '@/types';
import { calculateDistanceKm } from '@/lib/los-calculator';

/**
 * Validates that a string represents a finite number.
 * @param val - The string to validate
 * @returns True if the string can be parsed as a finite number
 */
function isValidNumericString(val: string | undefined | null): val is string {
  if (val === undefined || val === null || val === '') return false;
  const num = parseFloat(val);
  return !isNaN(num) && isFinite(num);
}

/**
 * Validates that a latitude string is a valid latitude in range [-90, 90].
 * @param val - The latitude string
 * @returns True if valid
 */
function isValidLatitude(val: string | undefined | null): boolean {
  if (!isValidNumericString(val)) return false;
  const num = parseFloat(val);
  return num >= -90 && num <= 90;
}

/**
 * Validates that a longitude string is a valid longitude in range [-180, 180].
 * @param val - The longitude string
 * @returns True if valid
 */
function isValidLongitude(val: string | undefined | null): boolean {
  if (!isValidNumericString(val)) return false;
  const num = parseFloat(val);
  return num >= -180 && num <= 180;
}

export interface UseMapInteractionReturn {
  /** Handles a map click event, setting the coordinates for the specified point */
  handleMapClick: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  /** Handles a marker drag event, updating the coordinates for the specified point */
  handleMarkerDrag: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  /** Live calculated distance between points in km, or null if coordinates are incomplete/invalid */
  liveDistanceKm: number | null;
  /** Current placement mode — which point the user is placing on the map */
  placementMode: PlacementMode;
  /** Sets the current placement mode */
  setPlacementMode: (mode: PlacementMode) => void;
}

/**
 * Manages map interaction state including marker placement, dragging,
 * and live distance calculation between two geographic points.
 *
 * @param form - The react-hook-form instance for the analysis form
 * @returns Map interaction state and handlers
 *
 * @example
 * const { handleMapClick, liveDistanceKm, placementMode } = useMapInteraction(form);
 */
export function useMapInteraction(
  form: UseFormReturn<AnalysisFormValues>
): UseMapInteractionReturn {
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null);
  const [placementMode, setPlacementMode] = useState<PlacementMode>(null);
  const { setValue, getValues } = form;

  const updateDistanceIfValid = useCallback(() => {
    const currentA = getValues('pointA');
    const currentB = getValues('pointB');

    if (
      isValidLatitude(currentA.lat) &&
      isValidLongitude(currentA.lng) &&
      isValidLatitude(currentB.lat) &&
      isValidLongitude(currentB.lng)
    ) {
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

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
      if (!event.latLng) return;

      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);

      const latKey = pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat';
      const lngKey = pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng';

      setValue(latKey, lat, { shouldDirty: true, shouldValidate: true });
      setValue(lngKey, lng, { shouldDirty: true, shouldValidate: true });

      updateDistanceIfValid();

      if (pointId === 'pointA') {
        setPlacementMode('B');
      } else {
        setPlacementMode(null);
      }
    },
    [setValue, updateDistanceIfValid]
  );

  const handleMarkerDrag = useCallback(
    (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
      if (!event.latLng) return;

      const lat = event.latLng.lat().toFixed(6);
      const lng = event.latLng.lng().toFixed(6);

      const latKey = pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat';
      const lngKey = pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng';

      setValue(latKey, lat, { shouldDirty: true, shouldValidate: true });
      setValue(lngKey, lng, { shouldDirty: true, shouldValidate: true });

      updateDistanceIfValid();
    },
    [setValue, updateDistanceIfValid]
  );

  return {
    handleMapClick,
    handleMarkerDrag,
    liveDistanceKm,
    placementMode,
    setPlacementMode,
  };
}