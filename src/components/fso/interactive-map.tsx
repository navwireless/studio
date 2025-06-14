
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import type { PointCoordinates, AnalysisResult } from '@/types';
import { cn } from '@/lib/utils';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; 

const defaultCenter = {
  lat: 20.5937, 
  lng: 78.9629,
};
const defaultZoom = 5;

const STYLES = {
  mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/70 rounded-md shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap w-max",
  distanceOverlayLabel: "p-1.5 text-sm font-bold text-white bg-primary/80 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap",
};

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string });
  pointB?: (PointCoordinates & { name?: string });
  onMapClick?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  onMarkerDrag?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  mapContainerClassName?: string;
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  currentDistanceKm?: number | null;
}

const getPixelPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height + 10), 
});

const getDistanceOverlayPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height / 2) -15, // Position above the midpoint of the line
});


const getCustomMarkerIcon = (label: string, isMapLoaded: boolean) => {
  if (isMapLoaded && typeof window !== 'undefined' && window.google && window.google.maps) {
    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: '#FFEE58', // Bright Yellow (consistent with tower handles in chart)
      fillOpacity: 1,
      strokeColor: '#424242', // Dark grey outline
      strokeWeight: 1.5,
      rotation: 0,
      scale: 7, // Slightly larger for better visibility
      anchor: new window.google.maps.Point(0, 2.5), // Pin point
      labelOrigin: new window.google.maps.Point(0, 0.5), // Center label inside pin
    };
  }
  return undefined;
};


export default function InteractiveMap({
  pointA: formPointA,
  pointB: formPointB,
  onMapClick,
  onMarkerDrag,
  mapContainerClassName = "w-full h-full",
  analysisResult,
  isStale,
  currentDistanceKm,
}: InteractiveMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapInstanceLoaded, setIsMapInstanceLoaded] = useState(false);
  const [currentMapClickTarget, setCurrentMapClickTarget] = useState<'pointA' | 'pointB'>('pointA');
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  const markerIconA = React.useMemo(() => getCustomMarkerIcon("A", isMapInstanceLoaded), [isMapInstanceLoaded]);
  const markerIconB = React.useMemo(() => getCustomMarkerIcon("B", isMapInstanceLoaded), [isMapInstanceLoaded]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_JS_API_KEY_HERE") {
      setMapLoadError("Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.");
      console.error("Google Maps API key is missing or is a placeholder.");
    }
  }, []);

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
      setCurrentMapClickTarget(prev => prev === 'pointA' ? 'pointB' : 'pointA');
    }
  }, [onMapClick, currentMapClickTarget]);

  useEffect(() => {
    if (isMapInstanceLoaded && mapRef.current && formPointA && formPointB && typeof formPointA.lat === 'number' && typeof formPointA.lng === 'number' && typeof formPointB.lat === 'number' && typeof formPointB.lng === 'number') {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(formPointA.lat, formPointA.lng));
      bounds.extend(new window.google.maps.LatLng(formPointB.lat, formPointB.lng));
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, 75); 
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
    if (isStale) return '#60A5FA'; // Blue for stale data
    if (!analysisResult) return '#A9A9A9'; // DarkGray for no analysis yet
    return analysisResult.losPossible ? '#4CAF50' : '#F44336'; // Green for LOS, Red for blocked
  };

  const pALat = typeof formPointA?.lat === 'number' ? formPointA.lat : undefined;
  const pALng = typeof formPointA?.lng === 'number' ? formPointA.lng : undefined;
  const pBLat = typeof formPointB?.lat === 'number' ? formPointB.lat : undefined;
  const pBLng = typeof formPointB?.lng === 'number' ? formPointB.lng : undefined;

  const midPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined ? {
    lat: (pALat + pBLat) / 2,
    lng: (pALng + pBLng) / 2,
  } : null;


  if (mapLoadError) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-destructive/10 text-destructive p-4 text-center", mapContainerClassName)}>
        <p>{mapLoadError}</p>
      </div>
    );
  }

  return (
    <div className={`${mapContainerClassName}`}>
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY as string} // Cast as string after check
        loadingElement={
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin mb-3" />
            <p className="text-sm font-medium">Initializing Map Service...</p>
          </div>
        }
        onError={(error) => {
          console.error("[InteractiveMap] LoadScript.onError:", error);
          setMapLoadError(`Failed to load Google Maps script. Check your API key and network connection. Details: ${error.message}`);
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
          options={{}}
        >
          {formPointA && pALat !== undefined && pALng !== undefined && markerIconA && (
            <>
              <Marker
                position={{ lat: pALat, lng: pALng }}
                draggable={true}
                onDragEnd={(e) => onMarkerDrag && onMarkerDrag(e, 'pointA')}
                icon={markerIconA}
                label={{ text: "A", color: "#333333", fontWeight: "bold", fontSize: "11px" }}
              />
              <OverlayView
                position={{ lat: pALat, lng: pALng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={getPixelPositionOffset}
              >
                <div className={STYLES.mapMarkerLabel}>
                  {formPointA.name || "Site A"}
                </div>
              </OverlayView>
            </>
          )}

          {formPointB && pBLat !== undefined && pBLng !== undefined && markerIconB && (
             <>
              <Marker
                position={{ lat: pBLat, lng: pBLng }}
                draggable={true}
                onDragEnd={(e) => onMarkerDrag && onMarkerDrag(e, 'pointB')}
                icon={markerIconB}
                label={{ text: "B", color: "#333333", fontWeight: "bold", fontSize: "11px" }}
              />
              <OverlayView
                position={{ lat: pBLat, lng: pBLng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={getPixelPositionOffset}
              >
                <div className={STYLES.mapMarkerLabel}>
                  {formPointB.name || "Site B"}
                </div>
              </OverlayView>
            </>
          )}

          {pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined && (
            <Polyline
              path={[
                { lat: pALat, lng: pALng },
                { lat: pBLat, lng: pBLng },
              ]}
              options={{
                strokeColor: polylineColor(),
                strokeOpacity: isStale ? 0.8 : 0.9,
                strokeWeight: isStale ? 3.5 : 4,
                geodesic: true,
                zIndex: 1,
              }}
            />
          )}
          {midPoint && currentDistanceKm !== null && currentDistanceKm !== undefined && (
            <OverlayView
              position={midPoint}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              getPixelPositionOffset={getDistanceOverlayPositionOffset}
            >
              <div className={STYLES.distanceOverlayLabel}>
                {currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)}m` : `${currentDistanceKm.toFixed(1)}km`}
              </div>
            </OverlayView>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
