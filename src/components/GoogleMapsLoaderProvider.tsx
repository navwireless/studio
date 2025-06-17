
"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface GoogleMapsLoaderContextType {
  isLoaded: boolean;
  loadError?: Error;
}

const GoogleMapsLoaderContext = createContext<GoogleMapsLoaderContextType | undefined>(undefined);

export const useGoogleMapsLoader = (): GoogleMapsLoaderContextType => {
  const context = useContext(GoogleMapsLoaderContext);
  if (context === undefined) {
    throw new Error('useGoogleMapsLoader must be used within a GoogleMapsLoaderProvider');
  }
  return context;
};

interface GoogleMapsLoaderProviderProps {
  children: ReactNode;
}

// Libraries to load with the Google Maps API. Add more as needed.
const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['geometry', 'places'];

export const GoogleMapsLoaderProvider: React.FC<GoogleMapsLoaderProviderProps> = ({ children }) => {
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_JS_API_KEY_HERE") {
    console.error("Google Maps API key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is not configured or is a placeholder. Please set it in your .env.local file.");
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-destructive/10 text-destructive p-4 text-center">
        <h2 className="text-lg font-semibold mb-2">Google Maps API Configuration Error</h2>
        <p>The Google Maps JavaScript API key (<code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>) is missing or is still set to its placeholder value.</p>
        <p className="mt-1">Please ensure it is correctly set in your <code>.env.local</code> file.</p>
        <p className="mt-1">Maps functionality will be unavailable until this is resolved.</p>
      </div>
    );
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries, 
  });

  // If loadError occurs after attempting to load with a key, GoogleMapsScriptGuard will handle displaying it.
  return (
    <GoogleMapsLoaderContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsLoaderContext.Provider>
  );
};

// Optional: A component to handle loading/error states for map consumers
export const GoogleMapsScriptGuard: React.FC<{ children: ReactNode, loadingMessage?: string, errorMessagePrefix?: string }> = ({ 
  children, 
  loadingMessage = "Loading Map...", 
  errorMessagePrefix = "Error loading Google Maps:" 
}) => {
  const { isLoaded, loadError } = useGoogleMapsLoader();

  if (loadError) {
    console.error("Google Maps Load Error:", loadError);
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-destructive/10 text-destructive p-4 text-center">
        <h2 className="text-lg font-semibold mb-2">Google Maps Error</h2>
        <p>{errorMessagePrefix}</p>
        <p className="mt-1 text-sm"><code>{loadError.name}: {loadError.message}</code></p>
        {loadError.message?.includes("InvalidKeyMapError") && (
            <p className="mt-2 text-xs">
                This usually means the <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> is invalid, expired, or has incorrect restrictions (e.g., HTTP referrers) in the Google Cloud Console.
                Ensure the Maps JavaScript API is enabled for this key.
            </p>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
        <Loader2 className="w-12 h-12 animate-spin mb-3" />
        <p className="text-sm font-medium">{loadingMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

