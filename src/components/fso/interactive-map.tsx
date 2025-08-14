
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';
import type { PointCoordinates, AnalysisResult } from '@/types';
import type { FiberPathResult, FiberPathSegment } from '@/tools/fiberPathCalculator';
import { cn } from '@/lib/utils';
import { useGoogleMapsLoader, GoogleMapsScriptGuard } from '@/components/GoogleMapsLoaderProvider';
import { decodePolyline } from '@/lib/polyline-decoder';

const STYLES = {
  mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/70 rounded-md shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap w-max",
  // Base style for distance overlay labels
  distanceOverlayLabelBase: "text-xs font-bold text-white rounded-md shadow-xl backdrop-blur-sm whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 text-center px-2 py-1 w-max border border-black/20",
  distanceOverlayLabelLOS: "bg-green-600/90", // Specific color for LOS
  distanceOverlayLabelFiber: "bg-blue-600/90", // Specific color for Fiber
};

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string });
  pointB?: (PointCoordinates & { name?: string });
  onMapClick?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  onMarkerDrag?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  mapContainerClassName?: string;
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  currentDistanceKm?: number | null; // This is for LOS path
  fiberPathResult?: FiberPathResult | null;
}

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};
const defaultZoom = 5;

const getSiteNameLabelOffset = (width: number, height: number) => ({
  x: -(width / 2),
  y: -(height + 10), // Position above marker
});

// For distance labels, centering is handled by CSS transform
const getPathDistanceLabelOffset = (width: number, height: number) => ({
    x: 0, 
    y: -(height / 2) - 5, // Slight offset upwards from the line
});


const getCustomMarkerIcon = (label: string, isMapApiLoaded: boolean) => {
  if (isMapApiLoaded && typeof window !== 'undefined' && window.google && window.google.maps) {
    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: '#FFEE58', // Yellowish
      fillOpacity: 1,
      strokeColor: '#424242', // Dark Gray
      strokeWeight: 1.5,
      rotation: 0, // Will be set dynamically if needed, or keep static
      scale: 7, // Size of the marker
      anchor: new window.google.maps.Point(0, 2.5), // Anchor point of the arrow
      labelOrigin: new window.google.maps.Point(0, 0.5), // Label position relative to anchor
    };
  }
  return undefined; // Fallback or for SSR
};

const LOS_POLYLINE_COLORS = {
  stale: '#60A5FA', // Light Blue for stale data
  feasible: '#4CAF50', // Green for feasible LOS
  notFeasible: '#F44336', // Red for not feasible LOS
  default: '#A9A9A9', // Gray for when no analysis done
};

const FIBER_POLYLINE_STYLES = {
  offset: {
    strokeColor: '#FF9800', // Orange for offset segments
    strokeOpacity: 0.9,
    strokeWeight: 3,
    zIndex: 2, // Render above LOS line if overlapping near sites
  },
  roadRoute: {
    strokeColor: '#2196F3', // Blue for road route segments
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
  currentDistanceKm, // This is the LOS aerial distance
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
            position: google.maps.ControlPosition.TOP_LEFT,
        },
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.TOP_LEFT,
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
        },
        gestureHandling: 'cooperative',
        clickableIcons: false, // Disable clicking on default map POIs
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

      // Extend bounds to include fiber path if available and successful
      if (fiberPathResult && fiberPathResult.status === 'success' && fiberPathResult.segments) {
        fiberPathResult.segments.forEach(segment => {
          if (segment.type === 'road_route' && segment.pathPolyline && google.maps.geometry?.encoding) {
            const decodedPath = decodePolyline(segment.pathPolyline); // Use utility
            decodedPath.forEach(p => bounds.extend(new window.google.maps.LatLng(p[0], p[1])));
          } else { // For offset segments or road routes without polyline (fallback)
            bounds.extend(new window.google.maps.LatLng(segment.startPoint.lat, segment.startPoint.lng));
            bounds.extend(new window.google.maps.LatLng(segment.endPoint.lat, segment.endPoint.lng));
          }
        });
      }

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, 75); // Padding of 75px
        // Listener to prevent over-zooming after fitBounds
        const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
          if (mapRef.current?.getZoom() && mapRef.current.getZoom()! > 17) { // Max zoom level
            mapRef.current.setZoom(17);
          } else if (mapRef.current?.getZoom() && mapRef.current.getZoom()! < 3) { // Min zoom level
             mapRef.current.setZoom(3);
          }
        });
         return () => { // Cleanup listener
           if (listener && window.google && window.google.maps) { // Check if maps API is still available
              window.google.maps.event.removeListener(listener);
           }
         };
      }
    } else if (isMapApiLoaded && mapRef.current && (!formPointA?.lat || !formPointB?.lat)) {
        // Default view if points are not set
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
    }
  }, [formPointA, formPointB, isMapApiLoaded, fiberPathResult]);


  const losPolylineColor = () => {
    if (isStale) return LOS_POLYLINE_COLORS.stale;
    if (!analysisResult) return LOS_POLYLINE_COLORS.default;
    return analysisResult.losPossible ? LOS_POLYLINE_COLORS.feasible : LOS_POLYLINE_COLORS.notFeasible;
  };

  // Ensure lat/lng are numbers for map components
  const pALat = typeof formPointA?.lat === 'number' ? formPointA.lat : undefined;
  const pALng = typeof formPointA?.lng === 'number' ? formPointA.lng : undefined;
  const pBLat = typeof formPointB?.lat === 'number' ? formPointB.lat : undefined;
  const pBLng = typeof formPointB?.lng === 'number' ? formPointB.lng : undefined;

  const losMidPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined ? {
    lat: (pALat + pBLat) / 2,
    lng: (pALng + pBLng) / 2,
  } : null;


  // Calculate midpoint for the fiber path label
  let fiberPathLabelMidPoint: PointCoordinates | null = null;
  if (isMapApiLoaded && fiberPathResult?.status === 'success' && fiberPathResult.segments && fiberPathResult.segments.length > 0) {
    let longestRoadSegment: FiberPathSegment | null = null;
    let maxDistance = 0;

    // Find the longest road_route segment to place the label on
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
        // Fallback: Midpoint of the straight line between snapped points if no polyline available
        fiberPathLabelMidPoint = {
            lat: (fiberPathResult.pointA_snappedToRoad.lat + fiberPathResult.pointB_snappedToRoad.lat) / 2,
            lng: (fiberPathResult.pointA_snappedToRoad.lng + fiberPathResult.pointB_snappedToRoad.lng) / 2,
        };
    } else if (losMidPoint) {
        // Further fallback to LOS midpoint if snapped points aren't available
        fiberPathLabelMidPoint = losMidPoint;
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
      options={{}} // Keep empty, specific options set in onLoad
    >
      {/* Point A Marker and Label */}
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

      {/* Point B Marker and Label */}
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
            zIndex: 1, // Ensure LOS path is generally below fiber paths if they overlap
          }}
        />
      )}

      {/* Fiber Path Segments Polylines */}
      {isMapApiLoaded && fiberPathResult && fiberPathResult.status === 'success' && fiberPathResult.segments && fiberPathResult.segments.length > 0 && (
        fiberPathResult.segments.map((segment, index) => {
          let pathCoords: google.maps.LatLngLiteral[] = [];
          let segmentOptions = {};

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
            // Fallback for road_route without polyline or unknown segment type - draw straight line
            console.warn(`Fiber segment type ${segment.type} at index ${index} missing polyline or is unknown. Drawing straight line.`);
            pathCoords = [
              { lat: segment.startPoint.lat, lng: segment.startPoint.lng },
              { lat: segment.endPoint.lat, lng: segment.endPoint.lng },
            ];
            segmentOptions = { ...FIBER_POLYLINE_STYLES.roadRoute, strokeColor: '#FF00FF' }; // Magenta for fallback
          }
          return <Polyline key={`fiber-segment-${index}`} path={pathCoords} options={segmentOptions} />;
        })
      )}

      {/* LOS Distance Label */}
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

      {/* Fiber Path Distance Label */}
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
  );
}


// Wrapper component to handle Google Maps API script loading status
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
