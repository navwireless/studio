
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
    console.error("Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
    return (
      <div className="w-full h-screen flex items-center justify-center bg-destructive/10 text-destructive p-4 text-center">
        <p>Google Maps API key is not configured. Maps functionality will be unavailable.</p>
      </div>
    );
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries, 
  });

  return (
    <GoogleMapsLoaderContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsLoaderContext.Provider>
  );
};

// Optional: A component to handle loading/error states for map consumers
export const GoogleMapsScriptGuard: React.FC<{ children: ReactNode, loadingMessage?: string, errorMessage?: string }> = ({ 
  children, 
  loadingMessage = "Loading Map...", 
  errorMessage = "Error loading Google Maps." 
}) => {
  const { isLoaded, loadError } = useGoogleMapsLoader();

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-destructive/10 text-destructive p-4 text-center">
        <p>{errorMessage} Details: {loadError.message}</p>
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
