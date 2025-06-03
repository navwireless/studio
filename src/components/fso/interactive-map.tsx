
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { PointCoordinates } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { calculateDistanceKm } from '@/lib/los-calculator';

const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ"; 

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string }); 
  pointB?: (PointCoordinates & { name?: string }); 
  
  analyzedData?: { 
    pointA: PointCoordinates;
    pointB: PointCoordinates;
    losPossible: boolean;
  } | null;

  isStale?: boolean; 
  isActionPending?: boolean;

  onMarkerDragStartA?: () => void;
  onMarkerDragStartB?: () => void;
  onMarkerDragEndA?: (coords: PointCoordinates) => void;
  onMarkerDragEndB?: (coords: PointCoordinates) => void;
  mapContainerClassName?: string;
}

const defaultCenter = {
  lat: 20.5937, // Centered on India
  lng: 78.9629,
};

const defaultZoom = 5; // Zoom level to show most of India

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

const getMidPoint = (p1: PointCoordinates, p2: PointCoordinates): PointCoordinates => {
  return {
    lat: (p1.lat + p2.lat) / 2,
    lng: (p1.lng + p2.lng) / 2,
  };
};


export default function InteractiveMap({
  pointA: formPointA, 
  pointB: formPointB, 
  analyzedData,
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
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);

  const [currentDistance, setCurrentDistance] = useState<string | null>(null);
  const [distanceLabelPosition, setDistanceLabelPosition] = useState<PointCoordinates | null>(null);

  useEffect(() => {
    console.log("[InteractiveMap] Script Loaded State:", scriptLoaded);
    console.log("[InteractiveMap] Script Error State:", scriptError);
  }, [scriptLoaded, scriptError]);


  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    console.log("[InteractiveMap] GoogleMap onLoad callback fired. Map instance:", mapInstance);
    mapRef.current = mapInstance;
    mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    if (!formPointA && !formPointB) { 
      console.log("[InteractiveMap] Setting default center and zoom.");
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(defaultZoom);
    }
  }, [formPointA, formPointB]);

  const onUnmount = useCallback(() => {
    console.log("[InteractiveMap] GoogleMap onUnmount callback fired.");
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (mapRef.current && formPointA && formPointB) {
      const bounds = new google.maps.LatLngBounds();
      if (formPointA.lat && formPointA.lng) bounds.extend(new google.maps.LatLng(formPointA.lat, formPointA.lng));
      if (formPointB.lat && formPointB.lng) bounds.extend(new google.maps.LatLng(formPointB.lat, formPointB.lng));
      
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
    } else if (mapRef.current && (!formPointA || !formPointB)) { 
        console.log("[InteractiveMap] No form points, resetting to default center/zoom.");
        setMapCenter(defaultCenter);
        setMapZoom(defaultZoom);
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
    }
  }, [formPointA, formPointB]);


  useEffect(() => {
    if (formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
      const p1 = { lat: Number(formPointA.lat), lng: Number(formPointA.lng) };
      const p2 = { lat: Number(formPointB.lat), lng: Number(formPointB.lng) };
      const distKm = calculateDistanceKm(p1, p2);
      setCurrentDistance(distKm < 1 ? `${(distKm * 1000).toFixed(1)} m` : `${distKm.toFixed(2)} km`);
      setDistanceLabelPosition(getMidPoint(p1, p2));
    } else {
      setCurrentDistance(null);
      setDistanceLabelPosition(null);
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
  
  const distinctLoadingElement = (
    <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-400/30 text-yellow-700">
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
        <p className="text-lg font-semibold">Loading Map Script...</p>
        <p className="text-sm">If this persists, check API key & console.</p>
    </div>
  );

  console.log(`[InteractiveMap] Rendering. ClassName: ${mapContainerClassName}`);
  return (
    <div className={`${mapContainerClassName} bg-green-500/20`}> {/* DEBUG: Overall map component container */}
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => {
          console.log("[InteractiveMap] LoadScript onLoad callback fired. Google Maps script should be loaded.");
          setScriptLoaded(true);
          setScriptError(false); 
        }}
        onError={(error) => {
          console.error("[InteractiveMap] LoadScript onError callback fired. Error loading Google Maps script:", error);
          setScriptError(true);
          setScriptLoaded(true); 
        }}
        loadingElement={distinctLoadingElement}
      >
        {scriptError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-500/30 p-4 text-center text-red-700">
              <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
              <p className="font-semibold text-lg">Could not load Google Maps.</p>
              <p className="text-sm">
                  Please check your internet connection and the Google Maps API key configuration.
                  Ensure the "Maps JavaScript API" is enabled in your Google Cloud Console, that billing is active,
                  and that there are no domain restrictions preventing usage. More details may be in the browser console.
              </p>
          </div>
        ) : scriptLoaded && typeof google !== 'undefined' && google.maps ? (
          <GoogleMap
            mapContainerStyle={{ 
              width: '100%', 
              height: '100%',
              border: '5px solid deeppink' // DEBUG: Prominent border for GoogleMap container
            }}
            center={mapCenter}
            zoom={mapZoom}
            onLoad={handleMapLoad}
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
            {formPointA && !isNaN(Number(formPointA.lat)) && !isNaN(Number(formPointA.lng)) && (
              <Marker
                key="marker-a"
                position={{ lat: Number(formPointA.lat), lng: Number(formPointA.lng) }}
                label={{ text: formPointA.name || "A", color: "white", fontWeight: "bold" }}
                draggable={!!onMarkerDragEndA}
                onDragStart={onMarkerDragStartA}
                onDragEnd={(e) => handleMarkerDragEnd(e, 'A')}
              />
            )}
            {formPointB && !isNaN(Number(formPointB.lat)) && !isNaN(Number(formPointB.lng)) && (
              <Marker
                key="marker-b"
                position={{ lat: Number(formPointB.lat), lng: Number(formPointB.lng) }}
                label={{ text: formPointB.name || "B", color: "white", fontWeight: "bold" }}
                draggable={!!onMarkerDragEndB}
                onDragStart={onMarkerDragStartB}
                onDragEnd={(e) => handleMarkerDragEnd(e, 'B')}
              />
            )}

            {(() => {
              if (
                analyzedData &&
                formPointA && formPointB && 
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
                      strokeColor: analyzedData.losPossible ? "hsl(var(--app-accent))" : "hsl(var(--destructive))", 
                      strokeOpacity: 0.9,
                      strokeWeight: 3,
                      clickable: false,
                      zIndex: 2 
                    }}
                  />
                );
              }
              if (formPointA && formPointB && 
                  !isNaN(Number(formPointA.lat)) && !isNaN(Number(formPointA.lng)) && 
                  !isNaN(Number(formPointB.lat)) && !isNaN(Number(formPointB.lng))) {
                return (
                  <Polyline
                    key={`preview-${formPointA.lat}-${formPointA.lng}-${formPointB.lat}-${formPointB.lng}`}
                    path={[
                      { lat: Number(formPointA.lat), lng: Number(formPointA.lng) },
                      { lat: Number(formPointB.lat), lng: Number(formPointB.lng) }
                    ]}
                    options={{
                      strokeColor: "hsl(var(--muted-foreground))", 
                      strokeOpacity: isActionPending ? 0.3 : 0.7,
                      strokeWeight: 2,
                      clickable: false,
                      zIndex: 1, 
                      icons: [{
                          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3, strokeWeight: 1.5 }, 
                          offset: '0',
                          repeat: '10px' 
                      }],
                    }}
                  />
                );
              }
              return null;
            })()}

            {distanceLabelPosition && currentDistance && (
              <OverlayView
                position={distanceLabelPosition}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={(offsetWidth, offsetHeight) => ({
                  x: -(offsetWidth / 2),
                  y: -offsetHeight -10, 
                })}
              >
                <div className="bg-slate-800/70 text-white text-xs px-2 py-1 rounded-md shadow-lg backdrop-blur-sm whitespace-nowrap">
                  {currentDistance}
                </div>
              </OverlayView>
            )}
            
          </GoogleMap>
        ) : (
           distinctLoadingElement 
        )}
      </LoadScript>
    </div>
  );
}

    

    