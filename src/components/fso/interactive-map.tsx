
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertTriangle } from 'lucide-react';
import type { PointCoordinates } from '@/types';
import { Skeleton } from '../ui/skeleton';

// WARNING: Storing API keys directly in code is insecure for production.
// Consider using environment variables and restricting API key usage.
// IMPORTANT: Ensure this API key is enabled for the "Maps JavaScript API" in your Google Cloud Console.
const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ";

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { towerHeight?: number }) | null;
  pointB?: (PointCoordinates & { towerHeight?: number }) | null;
  losPossible?: boolean | null;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px', // Match skeleton height
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

export default function InteractiveMap({ pointA, pointB, losPossible }: InteractiveMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && pointA && pointB) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(pointA.lat, pointA.lng));
      bounds.extend(new google.maps.LatLng(pointB.lat, pointB.lng));
      map.fitBounds(bounds);
      
      // Add a bit of padding if points are very close
      if (map.getZoom() && map.getZoom() > 15) {
        map.setZoom(map.getZoom() -1);
      }
    } else if (map) {
        // Reset to default if points are cleared
        map.setCenter(defaultCenter);
        map.setZoom(2);
    }
  }, [map, pointA, pointB]);

  const pathCoordinates = pointA && pointB ? [
    { lat: pointA.lat, lng: pointA.lng },
    { lat: pointB.lat, lng: pointB.lng },
  ] : [];

  let polylineColor = "hsl(var(--muted-foreground))"; // Default color
  if (losPossible === true) {
    polylineColor = "hsl(var(--accent))"; // Soft Green for success
  } else if (losPossible === false) {
    polylineColor = "hsl(var(--destructive))"; // Red for failure
  }
  
  const polylineOptions = {
    strokeColor: polylineColor,
    strokeOpacity: 0.8,
    strokeWeight: 4,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    zIndex: 1,
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-primary" />
          Site Map
        </CardTitle>
        <CardDescription>
          {pointA && pointB 
            ? "Interactive map showing Point A, Point B, and the path." 
            : "Enter analysis parameters to view sites on the map."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 rounded-b-md overflow-hidden">
        <LoadScript
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          onLoad={() => setScriptLoaded(true)}
          onError={() => {
            console.error("Google Maps script could not be loaded. Check API Key, enabled APIs (Maps JavaScript API), billing, and restrictions in Google Cloud Console.");
            setScriptError(true);
            setScriptLoaded(true); // Treat as loaded to show error message
          }}
          loadingElement={<Skeleton className="w-full h-[400px]" />}
        >
          {scriptError ? (
            <div className="h-[400px] flex flex-col items-center justify-center bg-muted/20 p-4 text-center">
                <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-destructive font-semibold">Could not load Google Maps.</p>
                <p className="text-sm text-muted-foreground">
                    Please check your internet connection and API key configuration in Google Cloud Console.
                    Ensure "Maps JavaScript API" is enabled and billing is active for your project.
                    See the browser console for more specific errors from Google.
                </p>
            </div>
          ) : scriptLoaded && typeof google !== 'undefined' && google.maps ? ( // Added check for google.maps
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={2}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                gestureHandling: 'cooperative' 
              }}
            >
              {pointA && <Marker position={{ lat: pointA.lat, lng: pointA.lng }} label="A" />}
              {pointB && <Marker position={{ lat: pointB.lat, lng: pointB.lng }} label="B" />}
              {pointA && pointB && pathCoordinates.length > 0 && (
                <Polyline path={pathCoordinates} options={polylineOptions} />
              )}
            </GoogleMap>
          ) : (
             <Skeleton className="w-full h-[400px]" />
          )}
        </LoadScript>
      </CardContent>
    </Card>
  );
}
