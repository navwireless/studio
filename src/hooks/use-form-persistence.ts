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
} as const;

/**
 * Safely reads a value from localStorage. Returns null if the key doesn't exist
 * or if localStorage is unavailable (SSR).
 * @param key - The localStorage key to read
 * @returns The stored string value, or null
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely writes a value to localStorage. Silently fails if localStorage
 * is unavailable or quota is exceeded.
 * @param key - The localStorage key to write
 * @param value - The string value to store
 */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`Failed to write localStorage key "${key}":`, e);
  }
}

/**
 * Persists analysis form values to localStorage on every change,
 * and restores them on mount. Handles SSR gracefully by deferring
 * all localStorage access until the component is mounted on the client.
 *
 * @param form - The react-hook-form instance to persist
 *
 * @example
 * const form = useForm<AnalysisFormValues>({ defaultValues });
 * useFormPersistence(form);
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
    if (!isClient) return;

    const storedHeight = safeGetItem(LOCAL_STORAGE_KEYS.POINT_A_HEIGHT);
    const parsedHeightA = storedHeight !== null ? parseInt(storedHeight, 10) : NaN;

    const storedHeightB = safeGetItem(LOCAL_STORAGE_KEYS.POINT_B_HEIGHT);
    const parsedHeightB = storedHeightB !== null ? parseInt(storedHeightB, 10) : NaN;

    const initialFormValues: AnalysisFormValues = {
      pointA: {
        name: safeGetItem(LOCAL_STORAGE_KEYS.POINT_A_NAME) || defaultFormStateValues.pointA.name,
        lat: safeGetItem(LOCAL_STORAGE_KEYS.POINT_A_LAT) || defaultFormStateValues.pointA.lat,
        lng: safeGetItem(LOCAL_STORAGE_KEYS.POINT_A_LNG) || defaultFormStateValues.pointA.lng,
        height: !isNaN(parsedHeightA) ? parsedHeightA : defaultFormStateValues.pointA.height,
      },
      pointB: {
        name: safeGetItem(LOCAL_STORAGE_KEYS.POINT_B_NAME) || defaultFormStateValues.pointB.name,
        lat: safeGetItem(LOCAL_STORAGE_KEYS.POINT_B_LAT) || defaultFormStateValues.pointB.lat,
        lng: safeGetItem(LOCAL_STORAGE_KEYS.POINT_B_LNG) || defaultFormStateValues.pointB.lng,
        height: !isNaN(parsedHeightB) ? parsedHeightB : defaultFormStateValues.pointB.height,
      },
      clearanceThreshold:
        safeGetItem(LOCAL_STORAGE_KEYS.CLEARANCE_THRESHOLD) || defaultFormStateValues.clearanceThreshold,
    };

    reset(initialFormValues);
  }, [isClient, reset]);

  // Watch fields and persist changes using subscription
  useEffect(() => {
    if (!isClient) return;

    const subscription = watch((value, { name }) => {
      // Directed updates for specific field changes
      if (name?.startsWith('pointA.') && value.pointA) {
        if (value.pointA.name !== undefined) safeSetItem(LOCAL_STORAGE_KEYS.POINT_A_NAME, value.pointA.name);
        if (value.pointA.lat !== undefined && value.pointA.lat !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_A_LAT, value.pointA.lat);
        if (value.pointA.lng !== undefined && value.pointA.lng !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_A_LNG, value.pointA.lng);
        if (value.pointA.height !== undefined && value.pointA.height !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_A_HEIGHT, value.pointA.height.toString());
      }
      if (name?.startsWith('pointB.') && value.pointB) {
        if (value.pointB.name !== undefined) safeSetItem(LOCAL_STORAGE_KEYS.POINT_B_NAME, value.pointB.name);
        if (value.pointB.lat !== undefined && value.pointB.lat !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_B_LAT, value.pointB.lat);
        if (value.pointB.lng !== undefined && value.pointB.lng !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_B_LNG, value.pointB.lng);
        if (value.pointB.height !== undefined && value.pointB.height !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_B_HEIGHT, value.pointB.height.toString());
      }
      if (name === 'clearanceThreshold') {
        if (value.clearanceThreshold !== undefined) safeSetItem(LOCAL_STORAGE_KEYS.CLEARANCE_THRESHOLD, value.clearanceThreshold);
      }

      // Fallback for full object resets (name is undefined when reset() is called)
      if (!name) {
        if (value.pointA) {
          if (value.pointA.name) safeSetItem(LOCAL_STORAGE_KEYS.POINT_A_NAME, value.pointA.name);
          if (value.pointA.lat !== undefined && value.pointA.lat !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_A_LAT, value.pointA.lat);
          if (value.pointA.lng !== undefined && value.pointA.lng !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_A_LNG, value.pointA.lng);
          if (value.pointA.height !== undefined && value.pointA.height !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_A_HEIGHT, value.pointA.height.toString());
        }
        if (value.pointB) {
          if (value.pointB.name) safeSetItem(LOCAL_STORAGE_KEYS.POINT_B_NAME, value.pointB.name);
          if (value.pointB.lat !== undefined && value.pointB.lat !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_B_LAT, value.pointB.lat);
          if (value.pointB.lng !== undefined && value.pointB.lng !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_B_LNG, value.pointB.lng);
          if (value.pointB.height !== undefined && value.pointB.height !== null) safeSetItem(LOCAL_STORAGE_KEYS.POINT_B_HEIGHT, value.pointB.height.toString());
        }
        if (value.clearanceThreshold) safeSetItem(LOCAL_STORAGE_KEYS.CLEARANCE_THRESHOLD, value.clearanceThreshold);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, isClient]);
}