
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card'; // Removed Header/Description
import { MapPin, AlertTriangle } from 'lucide-react';
import type { PointCoordinates } from '@/types';
import { Skeleton } from '../ui/skeleton';

const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ"; // Ensure this key is for Maps JavaScript API

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { towerHeight?: number }) | null;
  pointB?: (PointCoordinates & { towerHeight?: number }) | null;
  losPossible?: boolean | null;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%', // Changed to fill container
};

const defaultCenter = {
  lat: 32.2313625, // Centered roughly between default points
  lng: 76.1482885,
};

const defaultZoom = 15; // Zoom closer for typical FSO links

export default function InteractiveMap({ pointA, pointB, losPossible }: InteractiveMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    // Set map type to satellite
    mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
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
      
      const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
        if (map.getZoom() && map.getZoom() > 17) { // Don't zoom out too much if points are very close
            map.setZoom(17);
        } else if (map.getZoom() && map.getZoom() < 3) { // Basic sanity zoom
            map.setZoom(3);
        }
      });
      return () => {
        google.maps.event.removeListener(listener);
      };

    } else if (map) {
        map.setCenter(defaultCenter);
        map.setZoom(defaultZoom);
    }
  }, [map, pointA, pointB]);

  const pathCoordinates = pointA && pointB ? [
    { lat: pointA.lat, lng: pointA.lng },
    { lat: pointB.lat, lng: pointB.lng },
  ] : [];

  let polylineColor = "hsl(var(--muted-foreground))"; 
  if (losPossible === true) {
    polylineColor = "hsl(var(--app-accent))"; // Use app-accent for success (green)
  } else if (losPossible === false) {
    polylineColor = "hsl(var(--destructive))"; // Red for failure
  }
  
  const polylineOptions = {
    strokeColor: polylineColor,
    strokeOpacity: 1, // More visible
    strokeWeight: 5, // Thicker line
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    zIndex: 1,
    icons: [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 4,
          strokeColor: polylineColor === "hsl(var(--app-accent))" || polylineColor === "hsl(var(--destructive))" ? '#FFFFFF' : polylineColor, // White dots on colored lines
        },
        offset: '0',
        repeat: '20px'
      }],
  };

  return (
    // The Card component is removed from here, as the map itself will fill the container
    // Styling for borders/shadows will be on the parent container in page.tsx if needed
    <div className="w-full h-full">
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          console.error("Google Maps script could not be loaded. Check API Key (Maps JavaScript API), billing, and restrictions in Google Cloud Console.");
          setScriptError(true);
          setScriptLoaded(true); 
        }}
        loadingElement={<Skeleton className="w-full h-full rounded-none" />} // Ensure skeleton fills space
      >
        {scriptError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 p-4 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-destructive font-semibold">Could not load Google Maps.</p>
              <p className="text-sm text-muted-foreground">
                  Check internet connection and API key configuration. Ensure "Maps JavaScript API" is enabled and billing is active. See browser console for details.
              </p>
          </div>
        ) : scriptLoaded && typeof google !== 'undefined' && google.maps ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={(pointA && pointB) ? undefined : defaultCenter} // Let fitBounds handle center if points exist
            zoom={(pointA && pointB) ? undefined : defaultZoom} // Let fitBounds handle zoom if points exist
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              streetViewControl: false,
              mapTypeControl: true, // Enable map type control (satellite, map)
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT,
              },
              fullscreenControl: true,
              zoomControl: true,
              gestureHandling: 'cooperative',
              mapTypeId: google.maps.MapTypeId.SATELLITE, // Default to satellite
            }}
          >
            {pointA && <Marker position={{ lat: pointA.lat, lng: pointA.lng }} label={{text: "A", color: "white", fontWeight: "bold"}} />}
            {pointB && <Marker position={{ lat: pointB.lat, lng: pointB.lng }} label={{text: "B", color: "white", fontWeight: "bold"}} />}
            {pointA && pointB && pathCoordinates.length > 0 && (
              <Polyline path={pathCoordinates} options={polylineOptions} />
            )}
          </GoogleMap>
        ) : (
           <Skeleton className="w-full h-full rounded-none" />
        )}
      </LoadScript>
    </div>
  );
}
