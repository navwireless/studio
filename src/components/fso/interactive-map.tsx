
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import type { PointCoordinates, AnalysisResult, LOSLink } from '@/types'; // Added LOSLink
import { cn } from '@/lib/utils';
import { calculateDistanceKm } from '@/lib/los-calculator'; // Import for live distance

const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ";

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
  links: LOSLink[]; // Now receives an array of links
  selectedLinkId: string | null;
  onMapClick?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void; // May need rework for multi-link
  onMarkerDrag?: (event: google.maps.MapMouseEvent, linkId: string, pointId: 'pointA' | 'pointB') => void;
  onLinkSelect?: (linkId: string | null) => void; // Callback to select a link
  mapContainerClassName?: string;
  // analysisResult and isStale are now per-link, managed in context
  // currentDistanceKm can be calculated per link or for selected link
}

const getPixelPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height + 10),
});

const getDistanceOverlayPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height / 2) - 15,
});

const getCustomMarkerIcon = (label: string, color: string, isMapLoaded: boolean) => {
  if (isMapLoaded && typeof window !== 'undefined' && window.google && window.google.maps) {
    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: color, // Use link's color
      fillOpacity: 1,
      strokeColor: '#424242',
      strokeWeight: 1.5,
      rotation: 0,
      scale: 7,
      anchor: new window.google.maps.Point(0, 2.5),
      labelOrigin: new window.google.maps.Point(0, 0.5),
    };
  }
  return undefined;
};

export default function InteractiveMap({
  links,
  selectedLinkId,
  onMapClick,
  onMarkerDrag,
  onLinkSelect,
  mapContainerClassName = "w-full h-full",
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
      // If a link is selected, delegate to page.tsx to decide point placement.
      // If no link is selected, page.tsx might initiate a new link.
      onMapClick(event, currentMapClickTarget); 
      // Toggling point target might be handled by parent based on new link state
      // setCurrentMapClickTarget(prev => prev === 'pointA' ? 'pointB' : 'pointA');
    }
  }, [onMapClick, currentMapClickTarget]);

  useEffect(() => {
    if (isMapInstanceLoaded && mapRef.current && links.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidPoints = false;
      links.forEach(link => {
        if (link.pointA.lat && link.pointA.lng) {
           bounds.extend(new window.google.maps.LatLng(link.pointA.lat, link.pointA.lng));
           hasValidPoints = true;
        }
        if (link.pointB.lat && link.pointB.lng) {
           bounds.extend(new window.google.maps.LatLng(link.pointB.lat, link.pointB.lng));
           hasValidPoints = true;
        }
      });
      
      if (hasValidPoints && !bounds.isEmpty()) {
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
      } else if (!hasValidPoints) {
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
      }
    } else if (isMapInstanceLoaded && mapRef.current && links.length === 0) {
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
    }
  }, [links, isMapInstanceLoaded]);


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
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={defaultCenter}
          zoom={defaultZoom}
          onLoad={handleActualMapLoad}
          onUnmount={handleMapUnmount}
          onClick={handleInternalMapClick}
          options={{}}
        >
          {links.map((link, index) => {
            const pALat = typeof link.pointA.lat === 'number' ? link.pointA.lat : undefined;
            const pALng = typeof link.pointA.lng === 'number' ? link.pointA.lng : undefined;
            const pBLat = typeof link.pointB.lat === 'number' ? link.pointB.lat : undefined;
            const pBLng = typeof link.pointB.lng === 'number' ? link.pointB.lng : undefined;

            const markerIconA = getCustomMarkerIcon("A", link.color || LINK_COLORS[0], isMapInstanceLoaded);
            const markerIconB = getCustomMarkerIcon("B", link.color || LINK_COLORS[0], isMapInstanceLoaded);
            
            const isSelected = link.id === selectedLinkId;
            const polylineColor = link.isDirty ? '#60A5FA' : (link.analysisResult?.losPossible ? '#4CAF50' : (link.analysisResult ? '#F44336' : '#A9A9A9'));

            let currentDistanceKm: number | null = null;
            if (link.analysisResult && !link.isDirty) {
                currentDistanceKm = link.analysisResult.distanceKm;
            } else if (pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined) {
                currentDistanceKm = calculateDistanceKm({ lat: pALat, lng: pALng }, { lat: pBLat, lng: pBLng });
            }

            const midPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined ? {
                lat: (pALat + pBLat) / 2,
                lng: (pALng + pBLng) / 2,
              } : null;


            return (
              <React.Fragment key={link.id}>
                {pALat !== undefined && pALng !== undefined && markerIconA && (
                  <>
                    <Marker
                      position={{ lat: pALat, lng: pALng }}
                      draggable={true}
                      onDragEnd={(e) => onMarkerDrag && onMarkerDrag(e, link.id, 'pointA')}
                      onClick={() => onLinkSelect && onLinkSelect(link.id)}
                      icon={markerIconA}
                      label={{ text: "A", color: "#333333", fontWeight: "bold", fontSize: "11px" }}
                      zIndex={isSelected ? 10 : 5}
                    />
                    <OverlayView
                      position={{ lat: pALat, lng: pALng }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      getPixelPositionOffset={getPixelPositionOffset}
                    >
                      <div className={cn(STYLES.mapMarkerLabel, isSelected && "ring-2 ring-offset-2 ring-yellow-400")}>
                        {link.pointA.name || `Site A (${index + 1})`}
                      </div>
                    </OverlayView>
                  </>
                )}

                {pBLat !== undefined && pBLng !== undefined && markerIconB && (
                  <>
                    <Marker
                      position={{ lat: pBLat, lng: pBLng }}
                      draggable={true}
                      onDragEnd={(e) => onMarkerDrag && onMarkerDrag(e, link.id, 'pointB')}
                      onClick={() => onLinkSelect && onLinkSelect(link.id)}
                      icon={markerIconB}
                      label={{ text: "B", color: "#333333", fontWeight: "bold", fontSize: "11px" }}
                      zIndex={isSelected ? 10 : 5}
                    />
                    <OverlayView
                      position={{ lat: pBLat, lng: pBLng }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      getPixelPositionOffset={getPixelPositionOffset}
                    >
                      <div className={cn(STYLES.mapMarkerLabel, isSelected && "ring-2 ring-offset-2 ring-yellow-400")}>
                        {link.pointB.name || `Site B (${index + 1})`}
                      </div>
                    </OverlayView>
                  </>
                )}

                {pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined && (
                  <Polyline
                    path={[{ lat: pALat, lng: pALng }, { lat: pBLat, lng: pBLng }]}
                    options={{
                      strokeColor: polylineColor,
                      strokeOpacity: isSelected ? 1 : 0.7,
                      strokeWeight: isSelected ? 5 : 3.5,
                      geodesic: true,
                      zIndex: isSelected ? 3 : 1,
                    }}
                    onClick={() => onLinkSelect && onLinkSelect(link.id)}
                  />
                )}
                 {midPoint && currentDistanceKm !== null && currentDistanceKm !== undefined && isSelected && (
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
              </React.Fragment>
            );
          })}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

// Default link colors if not specified in LOSLink object (should be assigned by context)
const LINK_COLORS = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1'];
