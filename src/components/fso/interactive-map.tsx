
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { AlertTriangle } from 'lucide-react';
import type { PointCoordinates } from '@/types';
import { Skeleton } from '../ui/skeleton';

const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ"; // IMPORTANT: Manage API keys securely

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string }); // Current form/marker position A
  pointB?: (PointCoordinates & { name?: string }); // Current form/marker position B
  
  analyzedData?: { // Data from the last successful analysis
    pointA: PointCoordinates;
    pointB: PointCoordinates;
    losPossible: boolean;
  } | null;

  isStale?: boolean; // No longer directly used for line drawing, but kept for consistency if page.tsx passes it
  isActionPending?: boolean;

  onMarkerDragStartA?: () => void;
  onMarkerDragStartB?: () => void;
  onMarkerDragEndA?: (coords: PointCoordinates) => void;
  onMarkerDragEndB?: (coords: PointCoordinates) => void;
  mapContainerClassName?: string;
}

const defaultCenter = {
  lat: 32.2313625,
  lng: 76.1482885,
};

const defaultZoom = 15;

// Helper function to compare points
function pointsEqual(p1?: PointCoordinates, p2?: PointCoordinates, precision = 6) {
  if (!p1 || !p2) return false;
  const p1Lat = Number(p1.lat);
  const p1Lng = Number(p1.lng);
  const p2Lat = Number(p2.lat);
  const p2Lng = Number(p2.lng);

  if (isNaN(p1Lat) || isNaN(p1Lng) || isNaN(p2Lat) || isNaN(p2Lng)) return false;

  return (
    p1Lat.toFixed(precision) === p2Lat.toFixed(precision) &&
    p1Lng.toFixed(precision) === p2Lng.toFixed(precision)
  );
}

export default function InteractiveMap({
  pointA: formPointA, // Renaming for clarity within this component based on new logic
  pointB: formPointB, // Renaming for clarity
  analyzedData,
  // isStale, // Not directly used for line logic anymore, comparison is internal
  isActionPending,
  onMarkerDragStartA,
  onMarkerDragStartB,
  onMarkerDragEndA,
  onMarkerDragEndB,
  mapContainerClassName = "w-full h-full",
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
    if (mapRef.current && formPointA && formPointB) {
      const bounds = new google.maps.LatLngBounds();
      if (formPointA.lat && formPointA.lng) bounds.extend(new google.maps.LatLng(formPointA.lat, formPointA.lng));
      if (formPointB.lat && formPointB.lng) bounds.extend(new google.maps.LatLng(formPointB.lat, formPointB.lng));
      
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds);
        const listener = google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
          if (mapRef.current?.getZoom() && mapRef.current.getZoom()! > 17) {
            mapRef.current.setZoom(17);
          } else if (mapRef.current?.getZoom() && mapRef.current.getZoom()! < 3) {
            mapRef.current.setZoom(3);
          }
        });
        return () => {
          if (listener) google.maps.event.removeListener(listener);
        };
      } else {
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
      }
    } else if (mapRef.current) {
      mapRef.current.setCenter(defaultCenter);
      mapRef.current.setZoom(defaultZoom);
    }
  }, [formPointA, formPointB]);

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
            center={(formPointA && formPointB) ? undefined : defaultCenter}
            zoom={(formPointA && formPointB) ? undefined : defaultZoom}
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
            {formPointA && (
              <Marker
                key="marker-a"
                position={{ lat: formPointA.lat, lng: formPointA.lng }}
                label={{ text: formPointA.name || "A", color: "white", fontWeight: "bold" }}
                draggable={!!onMarkerDragEndA}
                onDragStart={onMarkerDragStartA}
                onDragEnd={(e) => handleMarkerDragEnd(e, 'A')}
              />
            )}
            {formPointB && (
              <Marker
                key="marker-b"
                position={{ lat: formPointB.lat, lng: formPointB.lng }}
                label={{ text: formPointB.name || "B", color: "white", fontWeight: "bold" }}
                draggable={!!onMarkerDragEndB}
                onDragStart={onMarkerDragStartB}
                onDragEnd={(e) => handleMarkerDragEnd(e, 'B')}
              />
            )}

            {(() => {
              // Show analyzed LOS line ONLY if current markers match last analysis
              if (
                analyzedData &&
                pointsEqual(formPointA, analyzedData.pointA) &&
                pointsEqual(formPointB, analyzedData.pointB)
              ) {
                return (
                  <Polyline
                    key={`analyzed-${analyzedData.pointA.lat}-${analyzedData.pointA.lng}-${analyzedData.pointB.lat}-${analyzedData.pointB.lng}`}
                    path={[
                      { lat: analyzedData.pointA.lat, lng: analyzedData.pointA.lng },
                      { lat: analyzedData.pointB.lat, lng: analyzedData.pointB.lng }
                    ]}
                    options={{
                      strokeColor: analyzedData.losPossible ? "#22d3ee" : "hsl(var(--destructive))", // Cyan or Theme Red
                      strokeOpacity: 0.9,
                      strokeWeight: 3,
                      clickable: false,
                      zIndex: 2 // Analyzed line on top
                    }}
                  />
                );
              }
              // Otherwise, show preview (dashed) line if both form markers exist
              if (formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
                return (
                  <Polyline
                    key={`preview-${formPointA.lat}-${formPointA.lng}-${formPointB.lat}-${formPointB.lng}`}
                    path={[
                      { lat: formPointA.lat, lng: formPointA.lng },
                      { lat: formPointB.lat, lng: formPointB.lng }
                    ]}
                    options={{
                      strokeColor: "#6b7280", // gray-500
                      strokeOpacity: isActionPending ? 0.3 : 0.7,
                      strokeWeight: 2,
                      clickable: false,
                      zIndex: 1, // Preview line below analyzed
                      icons: [{
                          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3, strokeWeight: 1.5 }, // Making strokeWeight of icon match line
                          offset: '0',
                          repeat: '10px' // Creates a dashed line effect
                      }],
                    }}
                  />
                );
              }
              return null;
            })()}
            
          </GoogleMap>
        ) : (
           <Skeleton className="w-full h-full rounded-none" />
        )}
      </LoadScript>
    </div>
  );
}

    