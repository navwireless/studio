'use client';

import { useState, useEffect } from 'react';

/**
 * Tracks browser online/offline status using the Navigator API.
 *
 * Returns `true` if the browser is online, `false` if offline.
 * Defaults to `true` during SSR to avoid hydration mismatch.
 * Updates in real-time as the browser goes online or offline.
 *
 * @returns Whether the browser is currently online
 *
 * @example
 * const isOnline = useOnlineStatus();
 * if (!isOnline) showOfflineBanner();
 */
export function useOnlineStatus(): boolean {
  // Default to true to avoid hydration mismatch (assume online during SSR)
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set actual status after hydration
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}