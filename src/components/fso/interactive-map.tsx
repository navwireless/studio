
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import type { PointCoordinates, AnalysisResult } from '@/types';
import type { FiberPathResult, FiberPathSegment } from '@/tools/fiberPathCalculator';
import { cn } from '@/lib/utils';
import { useGoogleMapsLoader, GoogleMapsScriptGuard } from '@/components/GoogleMapsLoaderProvider';

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string });
  pointB?: (PointCoordinates & { name?: string });
  onMapClick?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  onMarkerDrag?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  mapContainerClassName?: string;
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  currentDistanceKm?: number | null;
  fiberPathResult?: FiberPathResult | null;
}

const defaultCenter = {
  lat: 20.5937, 
  lng: 78.9629,
};
const defaultZoom = 5;

const getPixelPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height + 10), 
});

const getDistanceOverlayPositionOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height / 2) -15, 
});

const getCustomMarkerIcon = (label: string, isMapApiLoaded: boolean) => {
  if (isMapApiLoaded && typeof window !== 'undefined' && window.google && window.google.maps) {
    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: '#FFEE58', 
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

// Polyline Styles
const LOS_POLYLINE_COLORS = {
  stale: '#60A5FA', // Blueish
  feasible: '#4CAF50', // Green
  notFeasible: '#F44336', // Red
  default: '#A9A9A9', // Gray
};

const FIBER_POLYLINE_STYLES = {
  offset: {
    strokeColor: '#FFEB3B', // Yellow
    strokeOpacity: 0.9,
    strokeWeight: 3,
    zIndex: 2, 
  },
  roadRoute: {
    strokeColor: '#00BCD4', // Cyan
    strokeOpacity: 0.8,
    strokeWeight: 4,
    zIndex: 2,
  },
};


function InteractiveMapInner({
  pointA: formPointA,
  pointB: formPointB,
  onMapClick,
  onMarkerDrag,
  analysisResult,
  isStale,
  currentDistanceKm,
  fiberPathResult,
}: Omit<InteractiveMapProps, 'mapContainerClassName'>) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentMapClickTarget, setCurrentMapClickTarget] = useState<'pointA' | 'pointB'>('pointA');
  const { isLoaded: isMapApiLoaded } = useGoogleMapsLoader();

  const markerIconA = React.useMemo(() => getCustomMarkerIcon("A", isMapApiLoaded), [isMapApiLoaded]);
  const markerIconB = React.useMemo(() => getCustomMarkerIcon("B", isMapApiLoaded), [isMapApiLoaded]);

  const handleActualMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    if (window.google && window.google.maps) {
      mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      mapInstance.setOptions({
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        gestureHandling: 'cooperative',
        clickableIcons: false,
        styles: darkMapStyle,
      });
    }
  }, []);

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleInternalMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (onMapClick) {
      onMapClick(event, currentMapClickTarget);
      setCurrentMapClickTarget(prev => prev === 'pointA' ? 'pointB' : 'pointA');
    }
  }, [onMapClick, currentMapClickTarget]);

  useEffect(() => {
    if (isMapApiLoaded && mapRef.current && formPointA && formPointB && typeof formPointA.lat === 'number' && typeof formPointA.lng === 'number' && typeof formPointB.lat === 'number' && typeof formPointB.lng === 'number') {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(formPointA.lat, formPointA.lng));
      bounds.extend(new window.google.maps.LatLng(formPointB.lat, formPointB.lng));
      
      // If fiber path exists, extend bounds to include its points
      if (fiberPathResult && fiberPathResult.status === 'success' && fiberPathResult.segments) {
        fiberPathResult.segments.forEach(segment => {
          if (segment.pathPolyline && google.maps.geometry?.encoding) {
            const decodedPath = google.maps.geometry.encoding.decodePath(segment.pathPolyline);
            decodedPath.forEach(p => bounds.extend(p));
          } else {
            bounds.extend(new window.google.maps.LatLng(segment.startPoint.lat, segment.startPoint.lng));
            bounds.extend(new window.google.maps.LatLng(segment.endPoint.lat, segment.endPoint.lng));
          }
        });
      }

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
    } else if (isMapApiLoaded && mapRef.current && (!formPointA?.lat || !formPointB?.lat)) {
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
    }
  }, [formPointA, formPointB, isMapApiLoaded, fiberPathResult]);

  const losPolylineColor = () => {
    if (isStale) return LOS_POLYLINE_COLORS.stale; 
    if (!analysisResult) return LOS_POLYLINE_COLORS.default; 
    return analysisResult.losPossible ? LOS_POLYLINE_COLORS.feasible : LOS_POLYLINE_COLORS.notFeasible; 
  };

  const pALat = typeof formPointA?.lat === 'number' ? formPointA.lat : undefined;
  const pALng = typeof formPointA?.lng === 'number' ? formPointA.lng : undefined;
  const pBLat = typeof formPointB?.lat === 'number' ? formPointB.lat : undefined;
  const pBLng = typeof formPointB?.lng === 'number' ? formPointB.lng : undefined;

  const midPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined ? {
    lat: (pALat + pBLat) / 2,
    lng: (pALng + pBLng) / 2,
  } : null;

  return (
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
            <div className={"p-1 text-[0.6rem] sm:text-xs font-semibold text-white bg-slate-800/70 rounded shadow-md backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+8px)] sm:-translate-y-[calc(100%+10px)] whitespace-nowrap w-max"}>
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
            <div className={"p-1 text-[0.6rem] sm:text-xs font-semibold text-white bg-slate-800/70 rounded shadow-md backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+8px)] sm:-translate-y-[calc(100%+10px)] whitespace-nowrap w-max"}>
              {formPointB.name || "Site B"}
            </div>
          </OverlayView>
        </>
      )}

      {/* LOS Path Polyline */}
      {pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined && (
        <Polyline
          path={[
            { lat: pALat, lng: pALng },
            { lat: pBLat, lng: pBLng },
          ]}
          options={{
            strokeColor: losPolylineColor(),
            strokeOpacity: isStale ? 0.8 : 0.9,
            strokeWeight: isStale ? 3.5 : 4,
            geodesic: true,
            zIndex: 1, // LOS path below fiber path
          }}
        />
      )}

      {/* Fiber Path Polylines */}
      {isMapApiLoaded && fiberPathResult && fiberPathResult.status === 'success' && fiberPathResult.segments && fiberPathResult.segments.length > 0 && (
        fiberPathResult.segments.map((segment, index) => {
          let path: google.maps.LatLngLiteral[] = [];
          let options = {};

          if (segment.type === 'offset_a' || segment.type === 'offset_b') {
            path = [
              { lat: segment.startPoint.lat, lng: segment.startPoint.lng },
              { lat: segment.endPoint.lat, lng: segment.endPoint.lng },
            ];
            options = FIBER_POLYLINE_STYLES.offset;
          } else if (segment.type === 'road_route' && segment.pathPolyline) {
            if (google.maps.geometry && google.maps.geometry.encoding) {
              path = google.maps.geometry.encoding.decodePath(segment.pathPolyline).map(p => ({ lat: p.lat(), lng: p.lng() }));
            } else {
              console.warn("Google Maps geometry library not loaded, cannot decode road_route polyline.");
              return null;
            }
            options = FIBER_POLYLINE_STYLES.roadRoute;
          } else {
            return null; // Skip if segment type is unknown or data missing
          }
          
          return <Polyline key={`fiber-segment-${index}`} path={path} options={options} />;
        })
      )}


      {midPoint && currentDistanceKm !== null && currentDistanceKm !== undefined && (
        <OverlayView
          position={midPoint}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={getDistanceOverlayPositionOffset}
        >
          <div className={"p-1 text-[0.7rem] sm:text-sm font-semibold text-white bg-primary/80 rounded shadow-lg backdrop-blur-sm whitespace-nowrap"}>
            {currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)}m` : `${currentDistanceKm.toFixed(1)}km`}
          </div>
        </OverlayView>
      )}
    </GoogleMap>
  );
}

export default function InteractiveMap({ mapContainerClassName = "w-full h-full", ...props }: InteractiveMapProps) {
  return (
    <div className={cn(mapContainerClassName)}>
      <GoogleMapsScriptGuard 
        loadingMessage="Initializing Main Map..."
        errorMessage="Error loading Main Map."
      >
        <InteractiveMapInner {...props} />
      </GoogleMapsScriptGuard>
    </div>
  );
}
