'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic hook for localStorage-backed state.
 *
 * Features:
 * - Reads from localStorage on mount (client-side only)
 * - Writes to localStorage on every state change
 * - Handles SSR gracefully (returns defaultValue during server render)
 * - Handles JSON parse errors gracefully
 * - Syncs across tabs via the `storage` event
 * - Uses a ref-based setter to avoid stale closure issues with functional updates
 *
 * @param key - The localStorage key to use
 * @param defaultValue - The default value when no stored value exists
 * @returns A tuple of [value, setValue] similar to useState
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * setTheme('dark');
 * setTheme(prev => prev === 'dark' ? 'light' : 'dark');
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with default value first to avoid hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(defaultValue);

  // Keep a ref to the latest stored value to avoid stale closures in setValue
  const storedValueRef = useRef<T>(defaultValue);

  // Once mounted on client, read from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item) as T;
        setStoredValue(parsed);
        storedValueRef.current = parsed;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return;

      try {
        if (e.newValue === null) {
          setStoredValue(defaultValue);
          storedValueRef.current = defaultValue;
        } else {
          const parsed = JSON.parse(e.newValue) as T;
          setStoredValue(parsed);
          storedValueRef.current = parsed;
        }
      } catch (error) {
        console.warn(`Error parsing storage event for key "${key}":`, error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue]);

  // Wrapped setter that persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Use ref for functional updates to avoid stale closure
        const valueToStore =
          value instanceof Function ? value(storedValueRef.current) : value;

        // Save state and ref
        setStoredValue(valueToStore);
        storedValueRef.current = valueToStore;

        // Save to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}