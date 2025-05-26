
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { AlertTriangle } from 'lucide-react';
import type { PointCoordinates } from '@/types';
import { Skeleton } from '../ui/skeleton';

const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ"; // IMPORTANT: Manage API keys securely

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string }); // Current form/marker position for A
  pointB?: (PointCoordinates & { name?: string }); // Current form/marker position for B
  isActionPending?: boolean; // To dim preview line during analysis

  analyzedData?: { // Data from the last successful analysis
    pointA: PointCoordinates;
    pointB: PointCoordinates;
    losPossible: boolean;
  } | null;

  onMarkerDragStartA?: () => void;
  onMarkerDragStartB?: () => void;
  onMarkerDragEndA?: (coords: PointCoordinates) => void;
  onMarkerDragEndB?: (coords: PointCoordinates) => void;
  mapContainerClassName?: string;
  isStale?: boolean; // Kept for potential future use, but not directly for line drawing now
}

const defaultCenter = {
  lat: 32.2313625,
  lng: 76.1482885,
};

const defaultZoom = 15;

export default function InteractiveMap({
  pointA: formPointA, 
  pointB: formPointB, 
  analyzedData,
  onMarkerDragStartA,
  onMarkerDragStartB,
  onMarkerDragEndA,
  onMarkerDragEndB,
  isActionPending,
  mapContainerClassName = "w-full h-full",
  isStale 
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
      bounds.extend(new google.maps.LatLng(formPointA.lat, formPointA.lng));
      bounds.extend(new google.maps.LatLng(formPointB.lat, formPointB.lng));
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

  // Analyzed LOS line
  let analyzedPathCoordinates: google.maps.LatLngLiteral[] = [];
  let analyzedPolylineOptions = {};
  if (analyzedData && analyzedData.pointA && analyzedData.pointB) {
    analyzedPathCoordinates = [
      { lat: analyzedData.pointA.lat, lng: analyzedData.pointA.lng },
      { lat: analyzedData.pointB.lat, lng: analyzedData.pointB.lng },
    ];
    const strokeColor = analyzedData.losPossible ? "#22d3ee" : "hsl(var(--destructive))"; 
    analyzedPolylineOptions = {
      strokeColor: strokeColor,
      strokeOpacity: 0.9,
      strokeWeight: 3,
      clickable: false,
      draggable: false,
      editable: false,
      visible: true,
      zIndex: 1, 
    };
  }

  // Real-time Form Preview Line (always shown based on current formPointA and formPointB)
  let formPreviewPathCoordinates: google.maps.LatLngLiteral[] = [];
  let formPreviewPolylineOptions = {};
  if (formPointA && formPointB) {
    formPreviewPathCoordinates = [
        { lat: formPointA.lat, lng: formPointA.lng },
        { lat: formPointB.lat, lng: formPointB.lng },
    ];
    formPreviewPolylineOptions = {
        strokeColor: "#6b7280", // gray-500 Tailwind
        strokeOpacity: isActionPending ? 0.3 : 0.6,
        strokeWeight: 2,
        clickable: false,
        draggable: false,
        editable: false,
        visible: true,
        zIndex: 0, // Ensure it's below the analyzed line if they overlap
    };
  }


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
                position={{ lat: formPointA.lat, lng: formPointA.lng }}
                label={{ text: formPointA.name || "A", color: "white", fontWeight: "bold" }}
                draggable={!!onMarkerDragEndA}
                onDragStart={onMarkerDragStartA}
                onDragEnd={(e) => handleMarkerDragEnd(e, 'A')}
              />
            )}
            {formPointB && (
              <Marker
                position={{ lat: formPointB.lat, lng: formPointB.lng }}
                label={{ text: formPointB.name || "B", color: "white", fontWeight: "bold" }}
                draggable={!!onMarkerDragEndB}
                onDragStart={onMarkerDragStartB}
                onDragEnd={(e) => handleMarkerDragEnd(e, 'B')}
              />
            )}

            {/* Real-time Form Preview Line */}
            {formPreviewPathCoordinates.length > 0 && (
                <Polyline path={formPreviewPathCoordinates} options={formPreviewPolylineOptions} />
            )}

            {/* Analyzed Line - Renders on top if positions are same */}
            {analyzedPathCoordinates.length > 0 && (
              <Polyline path={analyzedPathCoordinates} options={analyzedPolylineOptions} />
            )}
            
          </GoogleMap>
        ) : (
           <Skeleton className="w-full h-full rounded-none" />
        )}
      </LoadScript>
    </div>
  );
}

