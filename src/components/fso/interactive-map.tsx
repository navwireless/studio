
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { AlertTriangle } from 'lucide-react';
import type { PointCoordinates } from '@/types';
import { Skeleton } from '../ui/skeleton';

const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ";

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string });
  pointB?: (PointCoordinates & { name?: string });
  losPossible?: boolean | null;
  onMarkerDragEndA?: (coords: PointCoordinates) => void;
  onMarkerDragEndB?: (coords: PointCoordinates) => void;
  mapContainerClassName?: string; // Allow parent to set class for height
}

const defaultCenter = {
  lat: 32.2313625,
  lng: 76.1482885,
};

const defaultZoom = 15;

export default function InteractiveMap({
  pointA,
  pointB,
  losPossible,
  onMarkerDragEndA,
  onMarkerDragEndB,
  mapContainerClassName = "w-full h-full" // Default to fill parent
}: InteractiveMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (mapRef.current && pointA && pointB) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(pointA.lat, pointA.lng));
      bounds.extend(new google.maps.LatLng(pointB.lat, pointB.lng));
      mapRef.current.fitBounds(bounds);
      
      const listener = google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
        if (mapRef.current?.getZoom() && mapRef.current.getZoom()! > 17) {
          mapRef.current.setZoom(17);
        } else if (mapRef.current?.getZoom() && mapRef.current.getZoom()! < 3) {
          mapRef.current.setZoom(3);
        }
      });
      return () => {
        google.maps.event.removeListener(listener);
      };
    } else if (mapRef.current) {
      mapRef.current.setCenter(defaultCenter);
      mapRef.current.setZoom(defaultZoom);
    }
  }, [pointA, pointB]);

  const handleMarkerDragEnd = (
    event: google.maps.MapMouseEvent,
    markerType: 'A' | 'B'
  ) => {
    if (event.latLng) {
      const newCoords = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      if (markerType === 'A' && onMarkerDragEndA) {
        onMarkerDragEndA(newCoords);
      } else if (markerType === 'B' && onMarkerDragEndB) {
        onMarkerDragEndB(newCoords);
      }
    }
  };

  const pathCoordinates = pointA && pointB ? [
    { lat: pointA.lat, lng: pointA.lng },
    { lat: pointB.lat, lng: pointB.lng },
  ] : [];

  let polylineColor = "#FFFFFF"; // Default white for LOS line on map
  // LOS status colors can be handled by ResultsDisplay or specific map elements if needed
  // For the main path line on the map, keeping it white for visibility on satellite view.
  // If you want map path color to change:
  // if (losPossible === true) polylineColor = "hsl(var(--app-accent))"; 
  // else if (losPossible === false) polylineColor = "hsl(var(--destructive))";
  
  const polylineOptions = {
    strokeColor: polylineColor,
    strokeOpacity: 0.9,
    strokeWeight: 3,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    zIndex: 1,
  };

  return (
    <div className={mapContainerClassName}>
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          console.error("Google Maps script could not be loaded. Check API Key (Maps JavaScript API), billing, and restrictions in Google Cloud Console.");
          setScriptError(true);
          setScriptLoaded(true); 
        }}
        loadingElement={<Skeleton className="w-full h-full rounded-none" />}
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
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={(pointA && pointB) ? undefined : defaultCenter}
            zoom={(pointA && pointB) ? undefined : defaultZoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              streetViewControl: true,
              mapTypeControl: true,
              mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT,
              },
              fullscreenControl: true,
              zoomControl: true,
              gestureHandling: 'cooperative',
              mapTypeId: google.maps.MapTypeId.SATELLITE,
            }}
          >
            {pointA && (
              <Marker
                position={{ lat: pointA.lat, lng: pointA.lng }}
                label={{ text: pointA.name || "A", color: "white", fontWeight: "bold" }}
                draggable={!!onMarkerDragEndA}
                onDragEnd={(e) => handleMarkerDragEnd(e, 'A')}
              />
            )}
            {pointB && (
              <Marker
                position={{ lat: pointB.lat, lng: pointB.lng }}
                label={{ text: pointB.name || "B", color: "white", fontWeight: "bold" }}
                draggable={!!onMarkerDragEndB}
                onDragEnd={(e) => handleMarkerDragEnd(e, 'B')}
              />
            )}
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
