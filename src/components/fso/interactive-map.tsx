
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import type { PointCoordinates, AnalysisResult } from '@/types';
import type { FiberPathResult, FiberPathSegment } from '@/tools/fiberPathCalculator';
import { cn } from '@/lib/utils';
import { useGoogleMapsLoader, GoogleMapsScriptGuard } from '@/components/GoogleMapsLoaderProvider';
import { decodePolyline } from '@/lib/polyline-decoder'; // For finding midpoint of fiber path

const STYLES = {
  mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/70 rounded-md shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap w-max",
  // Distance overlay labels with transforms for precise centering
  distanceOverlayLabelLOS: "p-1.5 text-xs font-bold text-white bg-green-600/80 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2",
  distanceOverlayLabelFiber: "p-1.5 text-xs font-bold text-white bg-blue-600/80 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2",
};

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string });
  pointB?: (PointCoordinates & { name?: string });
  onMapClick?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  onMarkerDrag?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  mapContainerClassName?: string;
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  currentDistanceKm?: number | null; // This is LOS distance
  fiberPathResult?: FiberPathResult | null;
}

const defaultCenter = {
  lat: 20.5937, 
  lng: 78.9629,
};
const defaultZoom = 5;

// getPixelPositionOffset for site name labels (above marker)
const getSiteNameLabelOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height + 10), 
});

// getPixelPositionOffset for distance labels (centered on path)
const getPathDistanceLabelOffset = (width: number, height: number) => ({
    x: -(width / 2),
    y: -(height / 2), // CSS transform will handle precise centering
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
  stale: '#60A5FA', // Blueish-gray for stale
  feasible: '#4CAF50', // Green for feasible LOS
  notFeasible: '#F44336', // Red for blocked LOS
  default: '#A9A9A9', // Default gray
};

const FIBER_POLYLINE_STYLES = {
  offset: {
    strokeColor: '#FF9800', // Orange for offset segments
    strokeOpacity: 0.9,
    strokeWeight: 3,
    zIndex: 2, // Render above LOS polyline
  },
  roadRoute: {
    strokeColor: '#2196F3', // Blue for road route segments
    strokeOpacity: 0.8,
    strokeWeight: 4,
    zIndex: 2, // Render above LOS polyline
  },
};


function InteractiveMapInner({
  pointA: formPointA,
  pointB: formPointB,
  onMapClick,
  onMarkerDrag,
  analysisResult,
  isStale,
  currentDistanceKm, // This is LOS distance
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

  const losMidPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined ? {
    lat: (pALat + pBLat) / 2,
    lng: (pALng + pBLng) / 2,
  } : null;

  // Calculate midpoint for Fiber Path Label
  let fiberPathLabelMidPoint: PointCoordinates | null = null;
  if (fiberPathResult?.status === 'success' && fiberPathResult.segments && fiberPathResult.segments.length > 0) {
    const roadRouteSegments = fiberPathResult.segments.filter(s => s.type === 'road_route' && s.pathPolyline);
    let targetSegmentPolyline: string | undefined;
    let longestDistance = 0;

    if (roadRouteSegments.length > 0) {
      // Find the longest road route segment
      roadRouteSegments.forEach(s => {
        if (s.distanceMeters > longestDistance) {
          longestDistance = s.distanceMeters;
          targetSegmentPolyline = s.pathPolyline;
        }
      });
    }
    
    if (targetSegmentPolyline) {
      const decoded = decodePolyline(targetSegmentPolyline); // Uses the utility from src/lib/polyline-decoder
      if (decoded.length > 0) {
        const midIndex = Math.floor(decoded.length / 2);
        fiberPathLabelMidPoint = { lat: decoded[midIndex][0], lng: decoded[midIndex][1] };
      }
    } else {
      // Fallback: if no road_route or polyline, use midpoint of the snapped points if available
      if (fiberPathResult.pointA_snappedToRoad && fiberPathResult.pointB_snappedToRoad) {
          fiberPathLabelMidPoint = {
              lat: (fiberPathResult.pointA_snappedToRoad.lat + fiberPathResult.pointB_snappedToRoad.lat) / 2,
              lng: (fiberPathResult.pointA_snappedToRoad.lng + fiberPathResult.pointB_snappedToRoad.lng) / 2,
          }
      } else if (losMidPoint) { // Further fallback to LOS midpoint
          fiberPathLabelMidPoint = losMidPoint; 
      }
    }
  }


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
            // Use the polyline-decoder utility
            const decodedCoords = decodePolyline(segment.pathPolyline);
            path = decodedCoords.map(p => ({ lat: p[0], lng: p[1] })); // decodePolyline returns [lat, lng]
            options = FIBER_POLYLINE_STYLES.roadRoute;
          } else {
            return null; 
          }
          
          return <Polyline key={`fiber-segment-${index}`} path={path} options={options} />;
        })
      )}

      {/* LOS Distance Label */}
      {losMidPoint && currentDistanceKm !== null && currentDistanceKm !== undefined && (
        <OverlayView
          position={losMidPoint}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={getPathDistanceLabelOffset}
        >
          <div className={STYLES.distanceOverlayLabelLOS}>
            LOS: {currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)}m` : `${currentDistanceKm.toFixed(1)}km`}
          </div>
        </OverlayView>
      )}

      {/* Fiber Path Distance Label */}
      {fiberPathResult?.status === 'success' && fiberPathResult.totalDistanceMeters !== undefined && fiberPathLabelMidPoint && (
         <OverlayView
          position={fiberPathLabelMidPoint}
          mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={getPathDistanceLabelOffset}
        >
          <div className={STYLES.distanceOverlayLabelFiber}>
            Fiber: {fiberPathResult.totalDistanceMeters < 1000 ? `${(fiberPathResult.totalDistanceMeters).toFixed(0)}m` : `${(fiberPathResult.totalDistanceMeters / 1000).toFixed(1)}km`}
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
