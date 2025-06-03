
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { PointCoordinates } from '@/types';
// import { Skeleton } from '../ui/skeleton'; // Not used in this simplified path
// import { calculateDistanceKm } from '@/lib/los-calculator'; // Not used yet in simplified path

const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ";

const defaultCenter = {
  lat: 20.5937, // Centered on India
  lng: 78.9629,
};
const defaultZoom = 5; // Zoom level to show most of India

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string });
  pointB?: (PointCoordinates & { name?: string });
  // analyzedData?: { pointA: PointCoordinates; pointB: PointCoordinates; losPossible: boolean; } | null; // Commented for simplification
  // isStale?: boolean; // Commented for simplification
  // isActionPending?: boolean; // Commented for simplification
  // onMarkerDragStartA?: () => void; // Commented for simplification
  // onMarkerDragStartB?: () => void; // Commented for simplification
  // onMarkerDragEndA?: (coords: PointCoordinates) => void; // Commented for simplification
  // onMarkerDragEndB?: (coords: PointCoordinates) => void; // Commented for simplification
  mapContainerClassName?: string;
}

export default function InteractiveMap({
  pointA: formPointA, // Will be undefined in current page.tsx simplified state
  pointB: formPointB, // Will be undefined
  mapContainerClassName = "w-full h-full",
}: InteractiveMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapInstanceLoaded, setIsMapInstanceLoaded] = useState(false); // To track if GoogleMap's onLoad fired

  console.log("[InteractiveMap] Rendering component.");

  const handleActualMapLoad = useCallback((mapInstance: google.maps.Map) => {
    console.log("[InteractiveMap] GoogleMap onLoad callback fired. Map instance:", mapInstance);
    mapRef.current = mapInstance;
    mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE); // Explicitly set map type
    setIsMapInstanceLoaded(true);
    // No need to setCenter/Zoom here if GoogleMap component has them directly
  }, []);

  const handleMapUnmount = useCallback(() => {
    console.log("[InteractiveMap] GoogleMap onUnmount callback fired.");
    mapRef.current = null;
    setIsMapInstanceLoaded(false);
  }, []);

  // Effect to fit bounds if points are provided and map is loaded
  useEffect(() => {
    if (isMapInstanceLoaded && mapRef.current && formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(formPointA.lat, formPointA.lng));
      bounds.extend(new google.maps.LatLng(formPointB.lat, formPointB.lng));
      if (!bounds.isEmpty()) {
        console.log("[InteractiveMap] Fitting bounds to markers.");
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
      }
    } else if (isMapInstanceLoaded && mapRef.current && (!formPointA || !formPointB)) {
        console.log("[InteractiveMap] mapRef and instance loaded, but no valid points. Ensuring default view.");
        mapRef.current.setCenter(defaultCenter); // Ensure default center if points disappear
        mapRef.current.setZoom(defaultZoom);
    }
  }, [formPointA, formPointB, isMapInstanceLoaded]);


  return (
    // This div gets mapContainerClassName (w-full h-full)
    <div className={`${mapContainerClassName} bg-lime-500/20`}> {/* Changed debug color */}
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        loadingElement={
          <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-400/30 text-yellow-700">
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <p className="text-lg font-semibold">Map Service Initializing...</p>
          </div>
        }
        onError={(error) => {
          console.error("[InteractiveMap] CRITICAL LoadScript.onError:", error);
          // This component should display a more user-friendly error UI based on this
        }}
      >
        <GoogleMap
          mapContainerStyle={{
            width: '100%', // Takes width of its direct parent (the LoadScript-rendered div or the lime div)
            height: '100%', // Takes height of its direct parent
            border: '5px solid magenta' // Changed border color for visibility
          }}
          center={defaultCenter} // Provide initial center
          zoom={defaultZoom}     // Provide initial zoom
          onLoad={handleActualMapLoad}
          onUnmount={handleMapUnmount}
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
            // mapTypeId: google.maps.MapTypeId.SATELLITE, // Set in onLoad for clarity
          }}
        >
          {/* Markers, Polylines, Overlays are commented out for this test */}
          {/* Example:
          {formPointA && !isNaN(Number(formPointA.lat)) && !isNaN(Number(formPointA.lng)) && (
            <Marker key="marker-a" position={{ lat: Number(formPointA.lat), lng: Number(formPointA.lng) }} />
          )}
          */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
