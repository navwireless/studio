'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for localStorage-backed state.
 * - Reads from localStorage on mount (client-side only)
 * - Writes to localStorage on every state change
 * - Handles SSR gracefully (returns defaultValue during server render)
 * - Handles JSON parse errors gracefully
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {

  // Initialize state with default value first to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  // Once mounted on client, read from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}
