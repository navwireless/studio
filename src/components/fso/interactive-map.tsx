
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { Loader2, MapPin, ZoomIn, ZoomOut, Globe, Satellite } from 'lucide-react';
import type { PointCoordinates, AnalysisResult } from '@/types';
import type { FiberPathResult, FiberPathSegment } from '@/tools/fiberPathCalculator';
import { cn } from '@/lib/utils';
import { useGoogleMapsLoader, GoogleMapsScriptGuard } from '@/components/GoogleMapsLoaderProvider';
import { decodePolyline } from '@/lib/polyline-decoder';
import { Button } from '@/components/ui/button';

const STYLES = {
  mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/70 rounded-md shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap w-max",
  distanceOverlayLabelBase: "text-xs font-bold text-white rounded-md shadow-xl backdrop-blur-sm whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 text-center px-2 py-1 w-max border border-black/20",
  distanceOverlayLabelLOS: "bg-green-600/90",
  distanceOverlayLabelFiber: "bg-blue-600/90",
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
  fiberPathResult?: FiberPathResult | null;
}

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};
const defaultZoom = 5;

const getSiteNameLabelOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height + 10),
});

const getPathDistanceLabelOffset = (width: number, height: number) => ({
    x: 0, 
    y: -(height / 2) - 5,
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

const LOS_POLYLINE_COLORS = {
  stale: '#60A5FA',
  feasible: '#4CAF50',
  notFeasible: '#F44336',
  default: '#A9A9A9',
};

const FIBER_POLYLINE_STYLES = {
  offset: {
    strokeColor: '#FF9800',
    strokeOpacity: 0.9,
    strokeWeight: 3,
    zIndex: 2,
  },
  roadRoute: {
    strokeColor: '#2196F3',
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
  const [mapTypeId, setMapTypeId] = useState<"roadmap" | "satellite">("satellite");
  const { isLoaded: isMapApiLoaded } = useGoogleMapsLoader();

  const losPolylineRef = useRef<google.maps.Polyline | null>(null);
  const fiberPolylinesRef = useRef<google.maps.Polyline[]>([]);

  const markerIconA = React.useMemo(() => getCustomMarkerIcon("A", isMapApiLoaded), [isMapApiLoaded]);
  const markerIconB = React.useMemo(() => getCustomMarkerIcon("B", isMapApiLoaded), [isMapApiLoaded]);

  const handleActualMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    if (window.google && window.google.maps) {
      mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
      mapInstance.setOptions({
        gestureHandling: 'cooperative',
        clickableIcons: false,
        // Disable all default controls
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
        fullscreenControl: false,
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

      if (fiberPathResult && fiberPathResult.status === 'success' && fiberPathResult.segments) {
        fiberPathResult.segments.forEach(segment => {
          if (segment.type === 'road_route' && segment.pathPolyline && google.maps.geometry?.encoding) {
            const decodedPath = decodePolyline(segment.pathPolyline);
            decodedPath.forEach(p => bounds.extend(new window.google.maps.LatLng(p[0], p[1])));
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

  const losMidPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined ? {
    lat: (pALat + pBLat) / 2,
    lng: (pALng + pBLng) / 2,
  } : null;

  let fiberPathLabelMidPoint: PointCoordinates | null = null;
  if (isMapApiLoaded && fiberPathResult?.status === 'success' && fiberPathResult.segments && fiberPathResult.segments.length > 0) {
    let longestRoadSegment: FiberPathSegment | null = null;
    let maxDistance = 0;

    fiberPathResult.segments.forEach(segment => {
      if (segment.type === 'road_route' && segment.pathPolyline && segment.distanceMeters > maxDistance) {
        maxDistance = segment.distanceMeters;
        longestRoadSegment = segment;
      }
    });

    if (longestRoadSegment && longestRoadSegment.pathPolyline) {
      const decoded = decodePolyline(longestRoadSegment.pathPolyline);
      if (decoded.length > 0) {
        const midIndex = Math.floor(decoded.length / 2);
        fiberPathLabelMidPoint = { lat: decoded[midIndex][0], lng: decoded[midIndex][1] };
      }
    } else if (fiberPathResult.pointA_snappedToRoad && fiberPathResult.pointB_snappedToRoad) {
        fiberPathLabelMidPoint = {
            lat: (fiberPathResult.pointA_snappedToRoad.lat + fiberPathResult.pointB_snappedToRoad.lat) / 2,
            lng: (fiberPathResult.pointA_snappedToRoad.lng + fiberPathResult.pointB_snappedToRoad.lng) / 2,
        };
    } else if (losMidPoint) {
        fiberPathLabelMidPoint = losMidPoint;
    }
  }

  useEffect(() => {
    if (!isMapApiLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const cleanupPolylines = () => {
        if (losPolylineRef.current) {
            losPolylineRef.current.setMap(null);
            losPolylineRef.current = null;
        }
        fiberPolylinesRef.current.forEach(p => p.setMap(null));
        fiberPolylinesRef.current = [];
    };

    cleanupPolylines();

    if (pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined) {
      losPolylineRef.current = new google.maps.Polyline({
        path: [{ lat: pALat, lng: pALng }, { lat: pBLat, lng: pBLng }],
        strokeColor: losPolylineColor(),
        strokeOpacity: isStale ? 0.8 : 0.9,
        strokeWeight: isStale ? 3.5 : 4,
        geodesic: true,
        zIndex: 1,
      });
      losPolylineRef.current.setMap(map);
    }

    if (fiberPathResult?.status === 'success' && fiberPathResult.segments) {
        const newFiberPolylines: google.maps.Polyline[] = [];
        fiberPathResult.segments.forEach((segment) => {
            let pathCoords: google.maps.LatLngLiteral[] = [];
            let segmentOptions: google.maps.PolylineOptions = {};

            if (segment.type === 'offset_a' || segment.type === 'offset_b') {
                pathCoords = [
                    { lat: segment.startPoint.lat, lng: segment.startPoint.lng },
                    { lat: segment.endPoint.lat, lng: segment.endPoint.lng },
                ];
                segmentOptions = FIBER_POLYLINE_STYLES.offset;
            } else if (segment.type === 'road_route' && segment.pathPolyline) {
                const decoded = decodePolyline(segment.pathPolyline);
                pathCoords = decoded.map(p => ({ lat: p[0], lng: p[1] }));
                segmentOptions = FIBER_POLYLINE_STYLES.roadRoute;
            } else {
                return;
            }
            const fiberPolyline = new google.maps.Polyline({ ...segmentOptions, path: pathCoords });
            fiberPolyline.setMap(map);
            newFiberPolylines.push(fiberPolyline);
        });
        fiberPolylinesRef.current = newFiberPolylines;
    }

    return cleanupPolylines;

  }, [analysisResult, fiberPathResult, isStale, isMapApiLoaded, pALat, pALng, pBLat, pBLng]);

  const handleZoomIn = () => {
    if (!mapRef.current) return;
    const currentZoom = mapRef.current.getZoom() || 0;
    mapRef.current.setZoom(currentZoom + 1);
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    const currentZoom = mapRef.current.getZoom() || 0;
    mapRef.current.setZoom(currentZoom - 1);
  };

  const handleMapTypeChange = (type: "roadmap" | "satellite") => {
    if (!mapRef.current) return;
    setMapTypeId(type);
    mapRef.current.setMapTypeId(type);
  }

  return (
    <div className="relative w-full h-full">
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
              getPixelPositionOffset={getSiteNameLabelOffset}
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
              getPixelPositionOffset={getSiteNameLabelOffset}
            >
              <div className={STYLES.mapMarkerLabel}>
                {formPointB.name || "Site B"}
              </div>
            </OverlayView>
          </>
        )}

        {losMidPoint && currentDistanceKm !== null && currentDistanceKm !== undefined && (
          <OverlayView
            position={losMidPoint}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPathDistanceLabelOffset}
          >
            <div className={cn(STYLES.distanceOverlayLabelBase, STYLES.distanceOverlayLabelLOS)}>
              Aerial Distance: {currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)} m` : `${currentDistanceKm.toFixed(1)} km`}
            </div>
          </OverlayView>
        )}

        {fiberPathResult?.status === 'success' && fiberPathResult.totalDistanceMeters !== undefined && fiberPathLabelMidPoint && (
           <OverlayView
            position={fiberPathLabelMidPoint}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPathDistanceLabelOffset}
          >
            <div className={cn(STYLES.distanceOverlayLabelBase, STYLES.distanceOverlayLabelFiber)}>
              Fiber Route: {fiberPathResult.totalDistanceMeters < 1000 ? `${(fiberPathResult.totalDistanceMeters).toFixed(0)} m` : `${(fiberPathResult.totalDistanceMeters / 1000).toFixed(1)} km`}
            </div>
          </OverlayView>
        )}
      </GoogleMap>
      
      {/* Custom Map Controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5">
        <Button
          size="sm"
          variant={mapTypeId === 'satellite' ? 'default' : 'secondary'}
          onClick={() => handleMapTypeChange('satellite')}
          className="shadow-md h-8 px-2.5"
        >
          <Satellite className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant={mapTypeId === 'roadmap' ? 'default' : 'secondary'}
          onClick={() => handleMapTypeChange('roadmap')}
          className="shadow-md h-8 px-2.5"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-20 right-2 flex flex-col gap-1">
        <Button size="icon" variant="secondary" onClick={handleZoomIn} className="shadow-md h-9 w-9">
          <ZoomIn className="h-5 w-5" />
          <span className="sr-only">Zoom In</span>
        </Button>
        <Button size="icon" variant="secondary" onClick={handleZoomOut} className="shadow-md h-9 w-9">
          <ZoomOut className="h-5 w-5" />
          <span className="sr-only">Zoom Out</span>
        </Button>
      </div>
    </div>
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
