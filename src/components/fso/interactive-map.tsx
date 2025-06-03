
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import type { PointCoordinates, AnalysisResult } from '@/types';
import { cn } from '@/lib/utils';

const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ"; // Ensure this is managed securely in a real app

const defaultCenter = {
  lat: 20.5937, // Centered on India
  lng: 78.9629,
};
const defaultZoom = 5;

const STYLES = {
  mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/70 rounded-md shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+10px)]",
};

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string });
  pointB?: (PointCoordinates & { name?: string });
  onMapClick?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  onMarkerDrag?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  mapContainerClassName?: string;
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
}

// Helper to get position for OverlayView
const getPixelPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height + 10), // Adjust as needed for label positioning above marker
});


export default function InteractiveMap({
  pointA: formPointA,
  pointB: formPointB,
  onMapClick,
  onMarkerDrag,
  mapContainerClassName = "w-full h-full",
  analysisResult,
  isStale,
}: InteractiveMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapInstanceLoaded, setIsMapInstanceLoaded] = useState(false);
  const [currentMapClickTarget, setCurrentMapClickTarget] = useState<'pointA' | 'pointB'>('pointA');


  const handleActualMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
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
        clickableIcons: false, 
      });
    }
    setIsMapInstanceLoaded(true);
  }, []);

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
    setIsMapInstanceLoaded(false);
  }, []);

  const handleInternalMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (onMapClick) {
      onMapClick(event, currentMapClickTarget);
      // Toggle target for next click
      setCurrentMapClickTarget(prev => prev === 'pointA' ? 'pointB' : 'pointA');
    }
  }, [onMapClick, currentMapClickTarget]);


  useEffect(() => {
    if (isMapInstanceLoaded && mapRef.current && formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(formPointA.lat, formPointA.lng));
      bounds.extend(new window.google.maps.LatLng(formPointB.lat, formPointB.lng));
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, 50); // Add padding to fitBounds
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
    } else if (isMapInstanceLoaded && mapRef.current && (!formPointA?.lat || !formPointB?.lat)) {
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
    }
  }, [formPointA, formPointB, isMapInstanceLoaded]);

  const polylineColor = () => {
    if (isStale) return '#FFEB3B'; // Yellow for stale
    if (!analysisResult) return '#60A5FA'; // Blue for no analysis yet
    return analysisResult.losPossible ? '#4CAF50' : '#F44336'; // Green for LOS, Red for blocked
  };

  return (
    <div className={`${mapContainerClassName}`}>
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        loadingElement={
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin mb-3" />
            <p className="text-sm font-medium">Initializing Map Service...</p>
          </div>
        }
        onError={(error) => {
          console.error("[InteractiveMap] LoadScript.onError:", error);
        }}
      >
        <GoogleMap
          mapContainerStyle={{
            width: '100%',
            height: '100%',
          }}
          center={defaultCenter}
          zoom={defaultZoom}
          onLoad={handleActualMapLoad}
          onUnmount={handleMapUnmount}
          onClick={handleInternalMapClick} 
          options={{ /* Basic options moved to onLoad for safety */ }}
        >
          {formPointA && formPointA.lat && formPointA.lng && (
            <>
              <Marker
                position={{ lat: formPointA.lat, lng: formPointA.lng }}
                draggable={true}
                onDragEnd={(e) => onMarkerDrag && onMarkerDrag(e, 'pointA')}
                label={{ text: "A", color: "white", fontWeight: "bold", fontSize: "12px" }}
              />
              <OverlayView
                position={{ lat: formPointA.lat, lng: formPointA.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={getPixelPositionOffset}
              >
                <div className={STYLES.mapMarkerLabel}>
                  {formPointA.name || "Site A"}
                </div>
              </OverlayView>
            </>
          )}

          {formPointB && formPointB.lat && formPointB.lng && (
             <>
              <Marker
                position={{ lat: formPointB.lat, lng: formPointB.lng }}
                draggable={true}
                onDragEnd={(e) => onMarkerDrag && onMarkerDrag(e, 'pointB')}
                label={{ text: "B", color: "white", fontWeight: "bold", fontSize: "12px" }}
              />
              <OverlayView
                position={{ lat: formPointB.lat, lng: formPointB.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={getPixelPositionOffset}
              >
                <div className={STYLES.mapMarkerLabel}>
                  {formPointB.name || "Site B"}
                </div>
              </OverlayView>
            </>
          )}

          {formPointA && formPointA.lat && formPointA.lng && formPointB && formPointB.lat && formPointB.lng && (
            <Polyline
              path={[
                { lat: formPointA.lat, lng: formPointA.lng },
                { lat: formPointB.lat, lng: formPointB.lng },
              ]}
              options={{
                strokeColor: polylineColor(),
                strokeOpacity: isStale ? 0.7 : 0.9,
                strokeWeight: isStale ? 3 : 4,
                geodesic: true,
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

