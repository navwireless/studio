'use client';

import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { AnalysisFormValues } from '@/types';
import { defaultFormStateValues } from '@/lib/form-schema';

export const LOCAL_STORAGE_KEYS = {
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

/**
 * Persists form values to localStorage on every change,
 * and restores them on mount.
 */
export function useFormPersistence(
  form: UseFormReturn<AnalysisFormValues>
): void {
  const [isClient, setIsClient] = useState(false);
  const { watch, reset } = form;

  // On mount, set client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // On client load, restore defaults from localStorage
  useEffect(() => {
    if (isClient) {
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
      
      reset(initialFormValues);
    }
  }, [isClient, reset]);

  // Watch fields and persist changes using subscription
  useEffect(() => {
    if (!isClient) return;
    const subscription = watch((value, { name }) => {
      // Directed updates
      if (name?.startsWith('pointA.')) {
        if (value.pointA?.name !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_NAME, value.pointA.name);
        if (value.pointA?.lat !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_LAT, value.pointA.lat!);
        if (value.pointA?.lng !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_LNG, value.pointA.lng!);
        if (value.pointA?.height !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_HEIGHT, value.pointA.height.toString());
      }
      if (name?.startsWith('pointB.')) {
        if (value.pointB?.name !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_NAME, value.pointB.name);
        if (value.pointB?.lat !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_LAT, value.pointB.lat!);
        if (value.pointB?.lng !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_LNG, value.pointB.lng!);
        if (value.pointB?.height !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_HEIGHT, value.pointB.height.toString());
      }
      if (name === 'clearanceThreshold') {
        if (value.clearanceThreshold !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.CLEARANCE_THRESHOLD, value.clearanceThreshold);
      }
      
      // Fallback for full object resets
      if (!name) {
          if (value.pointA) {
            if (value.pointA.name) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_NAME, value.pointA.name);
            if (value.pointA.lat !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_LAT, value.pointA.lat);
            if (value.pointA.lng !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_LNG, value.pointA.lng);
            if (value.pointA.height !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_A_HEIGHT, value.pointA.height.toString());
          }
          if (value.pointB) {
            if (value.pointB.name) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_NAME, value.pointB.name);
            if (value.pointB.lat !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_LAT, value.pointB.lat);
            if (value.pointB.lng !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_LNG, value.pointB.lng);
            if (value.pointB.height !== undefined) localStorage.setItem(LOCAL_STORAGE_KEYS.POINT_B_HEIGHT, value.pointB.height.toString());
          }
          if (value.clearanceThreshold) localStorage.setItem(LOCAL_STORAGE_KEYS.CLEARANCE_THRESHOLD, value.clearanceThreshold);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, isClient]);
}
