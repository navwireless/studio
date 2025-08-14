
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import { getGoogleMapsApiKey } from '@/app/actions';

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

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ['geometry', 'places'];

export const GoogleMapsLoaderProvider: React.FC<GoogleMapsLoaderProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await getGoogleMapsApiKey();
        if (key) {
          setApiKey(key);
        } else {
          setError("Google Maps API key is not configured on the server. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.");
        }
      } catch (e) {
        setError("Failed to fetch Google Maps API key from the server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiKey();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Initializing mapping service...</p>
      </div>
    );
  }

  if (error || !apiKey) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-destructive/10 text-destructive p-4 text-center">
        <h2 className="text-lg font-semibold mb-2">Google Maps Configuration Error</h2>
        <p>{error || "API key is missing."}</p>
        <p className="mt-1">Maps functionality will be unavailable until this is resolved.</p>
      </div>
    );
  }

  return <LoadScriptComponent apiKey={apiKey}>{children}</LoadScriptComponent>;
};

const LoadScriptComponent: React.FC<{ apiKey: string; children: ReactNode }> = ({ apiKey, children }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

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
                This usually means the API key is invalid, expired, or has incorrect restrictions (e.g., HTTP referrers) in the Google Cloud Console.
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
