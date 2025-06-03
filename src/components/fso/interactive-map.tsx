
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
  mapContainerClassName?: string;
}

export default function InteractiveMap({
  pointA: formPointA,
  pointB: formPointB,
  mapContainerClassName = "w-full h-full",
}: InteractiveMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapInstanceLoaded, setIsMapInstanceLoaded] = useState(false);

  console.log("[InteractiveMap] Rendering component.");

  const handleActualMapLoad = useCallback((mapInstance: google.maps.Map) => {
    console.log("[InteractiveMap] GoogleMap onLoad callback fired. Map instance:", mapInstance);
    mapRef.current = mapInstance;

    // Check if google object is available before using its properties
    if (window.google && window.google.maps) {
      mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      mapInstance.setOptions({
        streetViewControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
      });
    } else {
      console.error("[InteractiveMap] google.maps object not available in handleActualMapLoad");
    }
    setIsMapInstanceLoaded(true);
  }, []);

  const handleMapUnmount = useCallback(() => {
    console.log("[InteractiveMap] GoogleMap onUnmount callback fired.");
    mapRef.current = null;
    setIsMapInstanceLoaded(false);
  }, []);

  useEffect(() => {
    if (isMapInstanceLoaded && mapRef.current && formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(formPointA.lat, formPointA.lng));
      bounds.extend(new window.google.maps.LatLng(formPointB.lat, formPointB.lng));
      if (!bounds.isEmpty()) {
        console.log("[InteractiveMap] Fitting bounds to markers.");
        mapRef.current.fitBounds(bounds);
        const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
          if (mapRef.current?.getZoom() && mapRef.current.getZoom()! > 17) {
            mapRef.current.setZoom(17);
          } else if (mapRef.current?.getZoom() && mapRef.current.getZoom()! < 3) {
            mapRef.current.setZoom(3);
          }
        });
        return () => {
          if (listener && window.google && window.google.maps) {
             window.google.maps.event.removeListener(listener);
          }
        };
      }
    } else if (isMapInstanceLoaded && mapRef.current && (!formPointA || !formPointB)) {
        console.log("[InteractiveMap] mapRef and instance loaded, but no valid points. Ensuring default view.");
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
    }
  }, [formPointA, formPointB, isMapInstanceLoaded]);


  return (
    <div className={`${mapContainerClassName} bg-lime-500/20`}> {/* DEBUG BG for InteractiveMap root */}
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
        }}
        onLoad={() => {
          console.log("[InteractiveMap] LoadScript.onLoad: Google Maps API script should be loaded.");
        }}
      >
        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: '100%',
            border: '5px solid magenta' // DEBUG BORDER for GoogleMap container
          }}
          center={defaultCenter}
          zoom={defaultZoom}
          onLoad={handleActualMapLoad}
          onUnmount={handleMapUnmount}
          // Options that do not depend on google.maps.* can remain here if needed,
          // but it's cleaner to set most map-specific options in onLoad.
          // For this fix, we move all problematic options to handleActualMapLoad.
          options={{
            // Basic options can stay, e.g. minZoom, maxZoom, if not google.maps dependent.
            // gestureHandling: 'cooperative', // Moved to setOptions
            // streetViewControl: false, // Moved
            // mapTypeControl: false, // Moved
            // fullscreenControl: false, // Moved
            // zoomControl: false // Moved
          }}
        >
          {/* Markers, Polylines, Overlays are commented out for this test */}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
