'use client';

import { useState, useEffect } from 'react';

/**
 * Tracks browser online/offline status.
 * Returns true if online, false if offline.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true); // default to true to avoid hydration mismatch assuming online

  useEffect(() => {
    // Only set after hydration
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
