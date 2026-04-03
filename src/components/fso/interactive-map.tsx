"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, Marker, OverlayView } from '@react-google-maps/api';
import { Layers } from 'lucide-react';
import type { PointCoordinates, AnalysisResult, PlacementMode, MapNavigationTarget, MapContextMenuState, SavedLink } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import type { MapToolId } from '@/types/map-tools'; // Phase 11
import { cn } from '@/lib/utils';
import { useGoogleMapsLoader, GoogleMapsScriptGuard } from '@/components/GoogleMapsLoaderProvider';
import { decodePolyline } from '@/lib/polyline-decoder';
import CursorCoordinates from './cursor-coordinates';
import { getDeviceById } from '@/config/devices';

const STYLES = {
  mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/80 rounded-lg shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap w-max border border-slate-700/30",
  distanceOverlayLabelBase: "text-xs font-bold text-white rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 text-center px-2.5 py-1 w-max border border-black/20",
  distanceOverlayLabelLOS: "bg-green-600/90",
  distanceOverlayLabelFiber: "bg-blue-600/90",
};

// Brand color for device range circle
const DEVICE_RANGE_CIRCLE_COLOR = '#1E3A5F';
const DEVICE_RANGE_CIRCLE_OUT_COLOR = '#DC2626';

interface InteractiveMapProps {
  pointA?: (PointCoordinates & { name?: string });
  pointB?: (PointCoordinates & { name?: string });
  placementMode?: PlacementMode;
  onMapClick?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  onMarkerDrag?: (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => void;
  mapContainerClassName?: string;
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  currentDistanceKm?: number | null;
  fiberPathResult?: FiberPathResult | null;
  mapNavigationTarget?: MapNavigationTarget | null;
  onContextMenu?: (state: MapContextMenuState) => void;
  savedLinks?: SavedLink[];
  onSavedLinkClick?: (link: SavedLink) => void;
  /** Selected device ID for range circle (Phase 6C) */
  selectedDeviceId?: string | null;

  // ── Phase 11: Map tools integration ──
  /** Callback when Google Map instance is ready or unmounted */
  onMapReady?: (map: google.maps.Map | null) => void;
  /** Currently active map tool ID */
  activeMapTool?: MapToolId | null;
  /** Callback for map clicks when a tool is active */
  onToolMapClick?: (latLng: google.maps.LatLng) => void;
  /** Callback for map double-clicks when a tool is active */
  onToolMapDoubleClick?: (latLng: google.maps.LatLng) => void;
  /** Cursor style override from active tool */
  toolCursor?: string;
}

const defaultCenter = { lat: 20.5937, lng: 78.9629 };
const defaultZoom = 5;
const LONG_PRESS_DURATION = 500;
const LONG_PRESS_MOVE_THRESHOLD = 10;

const getSiteNameLabelOffset = (width: number, height: number) => ({ x: -(width / 2), y: -(height + 12) });
const getPathDistanceLabelOffset = (_width: number, height: number) => ({ x: 0, y: -(height / 2) - 5 });

const getCustomMarkerIcon = (_label: string, isMapApiLoaded: boolean) => {
  if (isMapApiLoaded && typeof window !== 'undefined' && window.google?.maps) {
    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: '#FFEE58', fillOpacity: 1, strokeColor: '#424242', strokeWeight: 1.5,
      rotation: 0, scale: 7,
      anchor: new window.google.maps.Point(0, 2.5),
      labelOrigin: new window.google.maps.Point(0, 0.5),
    };
  }
  return undefined;
};

const LOS_POLYLINE_COLORS = { stale: '#60A5FA', feasible: '#4CAF50', notFeasible: '#F44336', default: '#A9A9A9' };
const FIBER_POLYLINE_STYLES = {
  offset: { strokeColor: '#FF9800', strokeOpacity: 0.9, strokeWeight: 3, zIndex: 2 },
  roadRoute: { strokeColor: '#2196F3', strokeOpacity: 0.8, strokeWeight: 4, zIndex: 2 },
};

function createProjectionOverlay(map: google.maps.Map): google.maps.OverlayView {
  const overlay = new google.maps.OverlayView();
  overlay.onAdd = function () { };
  overlay.draw = function () { };
  overlay.onRemove = function () { };
  overlay.setMap(map);
  return overlay;
}

function InteractiveMapInner({
  pointA: formPointA, pointB: formPointB, placementMode, onMapClick, onMarkerDrag,
  analysisResult, isStale, currentDistanceKm, fiberPathResult,
  mapNavigationTarget, onContextMenu, savedLinks, onSavedLinkClick,
  selectedDeviceId,
  // Phase 11 props
  onMapReady, activeMapTool, onToolMapClick, onToolMapDoubleClick, toolCursor,
}: Omit<InteractiveMapProps, 'mapContainerClassName'>) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const projectionOverlayRef = useRef<google.maps.OverlayView | null>(null);
  const [mapTypeId, setMapTypeId] = useState<"roadmap" | "hybrid">("hybrid");
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const { isLoaded: isMapApiLoaded } = useGoogleMapsLoader();

  const losPolylineRef = useRef<google.maps.Polyline | null>(null);
  const fiberPolylinesRef = useRef<google.maps.Polyline[]>([]);
  const savedLinkPolylinesRef = useRef<{ polyline: google.maps.Polyline; linkId: string }[]>([]);
  const savedLinkListenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const deviceRangeCircleRef = useRef<google.maps.Circle | null>(null);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const lastNavTimestampRef = useRef<number>(0);
  const [cursorLat, setCursorLat] = useState<number | null>(null);
  const [cursorLng, setCursorLng] = useState<number | null>(null);
  const [isCursorOnMap, setIsCursorOnMap] = useState(false);

  const [hoveredLinkInfo, setHoveredLinkInfo] = useState<{
    link: SavedLink;
    position: PointCoordinates;
  } | null>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressFiredRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const [longPressIndicator, setLongPressIndicator] = useState<{ x: number; y: number; active: boolean } | null>(null);

  const onContextMenuRef = useRef(onContextMenu);
  onContextMenuRef.current = onContextMenu;

  const onSavedLinkClickRef = useRef(onSavedLinkClick);
  onSavedLinkClickRef.current = onSavedLinkClick;

  const savedLinksRef = useRef(savedLinks);
  savedLinksRef.current = savedLinks;

  // Phase 11: Keep refs for tool callbacks to avoid stale closures
  const onToolMapClickRef = useRef(onToolMapClick);
  onToolMapClickRef.current = onToolMapClick;
  const onToolMapDoubleClickRef = useRef(onToolMapDoubleClick);
  onToolMapDoubleClickRef.current = onToolMapDoubleClick;
  const activeMapToolRef = useRef(activeMapTool);
  activeMapToolRef.current = activeMapTool;

  // Resolve device max range in meters
  const deviceMaxRangeMeters = useMemo(() => {
    if (!selectedDeviceId) return null;
    const device = getDeviceById(selectedDeviceId);
    return device ? device.maxRange : null;
  }, [selectedDeviceId]);

  // Point A coordinates for range circle center
  const pALat = typeof formPointA?.lat === 'number' ? formPointA.lat : undefined;
  const pALng = typeof formPointA?.lng === 'number' ? formPointA.lng : undefined;
  const pBLat = typeof formPointB?.lat === 'number' ? formPointB.lat : undefined;
  const pBLng = typeof formPointB?.lng === 'number' ? formPointB.lng : undefined;

  // Check if point B is outside device range
  const isPointBOutsideRange = useMemo(() => {
    if (deviceMaxRangeMeters === null || currentDistanceKm == null) return false;
    return currentDistanceKm * 1000 > deviceMaxRangeMeters;
  }, [deviceMaxRangeMeters, currentDistanceKm]);

  // Close layer menu on outside click
  useEffect(() => {
    if (!showLayerMenu) return;
    const handleClick = () => setShowLayerMenu(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showLayerMenu]);

  useEffect(() => {
    if (analysisResult) {
      setIsFlashing(true);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => setIsFlashing(false), 300);
    }
    return () => { if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current); };
  }, [analysisResult]);

  useEffect(() => {
    if (!mapNavigationTarget || !mapRef.current || !isMapApiLoaded) return;
    if (mapNavigationTarget.timestamp <= lastNavTimestampRef.current) return;
    lastNavTimestampRef.current = mapNavigationTarget.timestamp;
    mapRef.current.panTo({ lat: mapNavigationTarget.lat, lng: mapNavigationTarget.lng });
    mapRef.current.setZoom(mapNavigationTarget.zoom ?? 15);
  }, [mapNavigationTarget, isMapApiLoaded]);

  const markerIconA = useMemo(() => getCustomMarkerIcon("A", isMapApiLoaded), [isMapApiLoaded]);
  const markerIconB = useMemo(() => getCustomMarkerIcon("B", isMapApiLoaded), [isMapApiLoaded]);

  const pixelToLatLng = useCallback((clientX: number, clientY: number): { lat: number; lng: number } | null => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !container) return null;

    try {
      const projection = projectionOverlayRef.current?.getProjection?.();
      if (projection) {
        const rect = container.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const point = new google.maps.Point(x, y);
        const latLng = projection.fromContainerPixelToLatLng(point);
        if (latLng) return { lat: latLng.lat(), lng: latLng.lng() };
      }
    } catch {
      // projection not ready, fall through
    }

    const bounds = map.getBounds();
    if (bounds && container) {
      const rect = container.getBoundingClientRect();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const xRatio = (clientX - rect.left) / rect.width;
      const yRatio = (clientY - rect.top) / rect.height;
      const lng = sw.lng() + (ne.lng() - sw.lng()) * xRatio;
      const lat = ne.lat() - (ne.lat() - sw.lat()) * yRatio;
      return { lat, lng };
    }

    return null;
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressTouchStartRef.current = null;
    setLongPressIndicator(null);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { cancelLongPress(); return; }
      const touch = e.touches[0];
      longPressFiredRef.current = false;
      longPressTouchStartRef.current = { x: touch.clientX, y: touch.clientY };

      const rect = el.getBoundingClientRect();
      setLongPressIndicator({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        active: true,
      });

      longPressTimerRef.current = setTimeout(() => {
        if (!longPressTouchStartRef.current) return;

        const coords = pixelToLatLng(touch.clientX, touch.clientY);
        if (coords && onContextMenuRef.current) {
          if (navigator.vibrate) navigator.vibrate(50);

          longPressFiredRef.current = true;
          suppressNextClickRef.current = true;

          onContextMenuRef.current({
            isOpen: true,
            x: touch.clientX,
            y: touch.clientY,
            lat: coords.lat,
            lng: coords.lng,
          });
        }

        cancelLongPress();

        const rippleRect = el.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'long-press-ripple';
        ripple.style.left = `${touch.clientX - rippleRect.left}px`;
        ripple.style.top = `${touch.clientY - rippleRect.top}px`;
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);

      }, LONG_PRESS_DURATION);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!longPressTouchStartRef.current || e.touches.length !== 1) { cancelLongPress(); return; }
      const touch = e.touches[0];
      const dx = touch.clientX - longPressTouchStartRef.current.x;
      const dy = touch.clientY - longPressTouchStartRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > LONG_PRESS_MOVE_THRESHOLD) {
        cancelLongPress();
      }
    };

    const onTouchEnd = () => {
      cancelLongPress();
      if (suppressNextClickRef.current) {
        setTimeout(() => { suppressNextClickRef.current = false; }, 300);
      }
    };

    const onNativeContextMenu = (e: Event) => {
      e.preventDefault();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    el.addEventListener('contextmenu', onNativeContextMenu);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('contextmenu', onNativeContextMenu);
      cancelLongPress();
    };
  }, [cancelLongPress, pixelToLatLng]);

  const handleActualMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    if (window.google?.maps) {
      mapInstance.setMapTypeId(google.maps.MapTypeId.HYBRID);
      mapInstance.setOptions({
        gestureHandling: 'greedy',
        clickableIcons: false,
        mapTypeControl: false,
        zoomControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        rotateControl: false,
        scaleControl: false,
        keyboardShortcuts: false,
      });
      try {
        projectionOverlayRef.current = createProjectionOverlay(mapInstance);
      } catch { /* projection will use fallback */ }
    }
    // Phase 11: Notify parent that map is ready
    onMapReady?.(mapInstance);
  }, [onMapReady]);

  const handleMapUnmount = useCallback(() => {
    if (projectionOverlayRef.current) {
      projectionOverlayRef.current.setMap(null);
      projectionOverlayRef.current = null;
    }
    if (deviceRangeCircleRef.current) {
      deviceRangeCircleRef.current.setMap(null);
      deviceRangeCircleRef.current = null;
    }
    // Phase 11: Notify parent that map is gone
    onMapReady?.(null);
    mapRef.current = null;
  }, [onMapReady]);

  const handleInternalMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    setHoveredLinkInfo(null);
    setShowLayerMenu(false);

    // Phase 11: If a tool is active, delegate click to tool handler
    if (activeMapToolRef.current && event.latLng && onToolMapClickRef.current) {
      onToolMapClickRef.current(event.latLng);
      return; // Don't process as placement click
    }

    if (!onMapClick) return;
    if (placementMode === null || placementMode === undefined) return;
    const pointId = placementMode === 'B' ? 'pointB' : 'pointA';
    onMapClick(event, pointId);
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
  }, [onMapClick, placementMode]);

  // Phase 11: Handle double-click for multi-click tools
  const handleInternalMapDoubleClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (activeMapToolRef.current && event.latLng && onToolMapDoubleClickRef.current) {
      event.stop?.();
      onToolMapDoubleClickRef.current(event.latLng);
    }
  }, []);

  const handleRightClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (!onContextMenu || !event.latLng) return;
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }

    const domEvent = event.domEvent;
    let clientX = 0;
    let clientY = 0;

    if (domEvent instanceof MouseEvent) {
      clientX = domEvent.clientX;
      clientY = domEvent.clientY;
    } else if (domEvent instanceof TouchEvent && domEvent.changedTouches?.length > 0) {
      clientX = domEvent.changedTouches[0].clientX;
      clientY = domEvent.changedTouches[0].clientY;
    } else {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        clientX = rect.left + rect.width / 2;
        clientY = rect.top + rect.height / 2;
      }
    }

    onContextMenu({
      isOpen: true,
      x: clientX,
      y: clientY,
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  }, [onContextMenu]);

  const handleMouseMove = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setCursorLat(event.latLng.lat());
      setCursorLng(event.latLng.lng());
    }
  }, []);

  const handleMouseOver = useCallback(() => setIsCursorOnMap(true), []);
  const handleMouseOut = useCallback(() => { setIsCursorOnMap(false); setCursorLat(null); setCursorLng(null); }, []);

  useEffect(() => {
    if (isMapApiLoaded && mapRef.current && formPointA && formPointB &&
      typeof formPointA.lat === 'number' && typeof formPointA.lng === 'number' &&
      typeof formPointB.lat === 'number' && typeof formPointB.lng === 'number') {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(new window.google.maps.LatLng(formPointA.lat, formPointA.lng));
      bounds.extend(new window.google.maps.LatLng(formPointB.lat, formPointB.lng));

      if (fiberPathResult?.status === 'success' && fiberPathResult.segments) {
        fiberPathResult.segments.forEach(segment => {
          if (segment.type === 'road_route' && segment.pathPolyline && google.maps.geometry?.encoding) {
            decodePolyline(segment.pathPolyline).forEach(p => bounds.extend(new window.google.maps.LatLng(p[0], p[1])));
          } else {
            bounds.extend(new window.google.maps.LatLng(segment.startPoint.lat, segment.startPoint.lng));
            bounds.extend(new window.google.maps.LatLng(segment.endPoint.lat, segment.endPoint.lng));
          }
        });
      }

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, 75);
        const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
          const z = mapRef.current?.getZoom() ?? 10;
          if (z > 17) mapRef.current?.setZoom(17);
          else if (z < 3) mapRef.current?.setZoom(3);
        });
        return () => { if (listener && window.google?.maps) window.google.maps.event.removeListener(listener); };
      }
    } else if (isMapApiLoaded && mapRef.current && (!formPointA?.lat || !formPointB?.lat)) {
      if (!mapNavigationTarget || mapNavigationTarget.timestamp <= 0) {
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
      }
    }
  }, [formPointA, formPointB, isMapApiLoaded, fiberPathResult, mapNavigationTarget]);

  const losPolylineColor = useCallback(() => {
    if (isStale) return LOS_POLYLINE_COLORS.stale;
    if (!analysisResult) return LOS_POLYLINE_COLORS.default;
    return analysisResult.losPossible ? LOS_POLYLINE_COLORS.feasible : LOS_POLYLINE_COLORS.notFeasible;
  }, [isStale, analysisResult]);

  const losMidPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined
    ? { lat: (pALat + pBLat) / 2, lng: (pALng + pBLng) / 2 } : null;

  let fiberPathLabelMidPoint: PointCoordinates | null = null;
  if (isMapApiLoaded && fiberPathResult?.status === 'success' && fiberPathResult.segments?.length) {
    const roadSegs = fiberPathResult.segments.filter(s => s.type === 'road_route' && s.pathPolyline);
    const longest = roadSegs.length > 0 ? roadSegs.reduce((prev, curr) => curr.distanceMeters > prev.distanceMeters ? curr : prev) : null;
    if (longest?.pathPolyline) {
      const decoded = decodePolyline(longest.pathPolyline);
      if (decoded.length > 0) { const mid = Math.floor(decoded.length / 2); fiberPathLabelMidPoint = { lat: decoded[mid][0], lng: decoded[mid][1] }; }
    } else if (fiberPathResult.pointA_snappedToRoad && fiberPathResult.pointB_snappedToRoad) {
      fiberPathLabelMidPoint = { lat: (fiberPathResult.pointA_snappedToRoad.lat + fiberPathResult.pointB_snappedToRoad.lat) / 2, lng: (fiberPathResult.pointA_snappedToRoad.lng + fiberPathResult.pointB_snappedToRoad.lng) / 2 };
    } else if (losMidPoint) { fiberPathLabelMidPoint = losMidPoint; }
  }

  // ── Device Range Circle ──
  useEffect(() => {
    if (!isMapApiLoaded || !mapRef.current) return;
    const map = mapRef.current;

    if (deviceRangeCircleRef.current) {
      deviceRangeCircleRef.current.setMap(null);
      deviceRangeCircleRef.current = null;
    }

    if (deviceMaxRangeMeters !== null && pALat !== undefined && pALng !== undefined) {
      const circleColor = isPointBOutsideRange ? DEVICE_RANGE_CIRCLE_OUT_COLOR : DEVICE_RANGE_CIRCLE_COLOR;

      deviceRangeCircleRef.current = new google.maps.Circle({
        map,
        center: { lat: pALat, lng: pALng },
        radius: deviceMaxRangeMeters,
        fillColor: circleColor,
        fillOpacity: 0.08,
        strokeColor: circleColor,
        strokeOpacity: 0.45,
        strokeWeight: 2,
        clickable: false,
        zIndex: 0,
      });
    }

    return () => {
      if (deviceRangeCircleRef.current) {
        deviceRangeCircleRef.current.setMap(null);
        deviceRangeCircleRef.current = null;
      }
    };
  }, [isMapApiLoaded, deviceMaxRangeMeters, pALat, pALng, isPointBOutsideRange]);

  // Draw LOS + fiber polylines
  useEffect(() => {
    if (!isMapApiLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const cleanup = () => {
      if (losPolylineRef.current) { losPolylineRef.current.setMap(null); losPolylineRef.current = null; }
      fiberPolylinesRef.current.forEach(p => p.setMap(null));
      fiberPolylinesRef.current = [];
    };
    cleanup();

    if (pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined) {
      losPolylineRef.current = new google.maps.Polyline({
        path: [{ lat: pALat, lng: pALng }, { lat: pBLat, lng: pBLng }],
        strokeColor: losPolylineColor(), strokeOpacity: isStale ? 0.8 : (isFlashing ? 1 : 0.9),
        strokeWeight: isStale ? 3.5 : (isFlashing ? 6 : 4), geodesic: true, zIndex: 3,
      });
      losPolylineRef.current.setMap(map);
    }

    if (fiberPathResult?.status === 'success' && fiberPathResult.segments) {
      const newFiber: google.maps.Polyline[] = [];
      fiberPathResult.segments.forEach(seg => {
        let path: google.maps.LatLngLiteral[] = [];
        let opts: google.maps.PolylineOptions = {};
        if (seg.type === 'offset_a' || seg.type === 'offset_b') {
          path = [{ lat: seg.startPoint.lat, lng: seg.startPoint.lng }, { lat: seg.endPoint.lat, lng: seg.endPoint.lng }];
          opts = FIBER_POLYLINE_STYLES.offset;
        } else if (seg.type === 'road_route' && seg.pathPolyline) {
          path = decodePolyline(seg.pathPolyline).map(p => ({ lat: p[0], lng: p[1] }));
          opts = FIBER_POLYLINE_STYLES.roadRoute;
        } else return;
        const pl = new google.maps.Polyline({ ...opts, path });
        pl.setMap(map);
        newFiber.push(pl);
      });
      fiberPolylinesRef.current = newFiber;
    }
    return cleanup;
  }, [analysisResult, fiberPathResult, isStale, isFlashing, isMapApiLoaded, pALat, pALng, pBLat, pBLng, losPolylineColor]);

  // Draw saved link polylines
  useEffect(() => {
    if (!isMapApiLoaded || !mapRef.current) return;
    const map = mapRef.current;

    savedLinkListenersRef.current.forEach(l => google.maps.event.removeListener(l));
    savedLinkListenersRef.current = [];
    savedLinkPolylinesRef.current.forEach(({ polyline }) => polyline.setMap(null));
    savedLinkPolylinesRef.current = [];

    if (!savedLinks?.length) return;

    const newEntries: { polyline: google.maps.Polyline; linkId: string }[] = [];
    const newListeners: google.maps.MapsEventListener[] = [];

    savedLinks.forEach(link => {
      const pl = new google.maps.Polyline({
        path: [
          { lat: link.pointA.lat, lng: link.pointA.lng },
          { lat: link.pointB.lat, lng: link.pointB.lng },
        ],
        strokeColor: link.color,
        strokeOpacity: 0.35,
        strokeWeight: 2.5,
        geodesic: true,
        zIndex: 1,
        clickable: true,
      });
      pl.setMap(map);

      const overListener = pl.addListener('mouseover', () => {
        pl.setOptions({ strokeOpacity: 0.85, strokeWeight: 4.5, zIndex: 2 });
        const midLat = (link.pointA.lat + link.pointB.lat) / 2;
        const midLng = (link.pointA.lng + link.pointB.lng) / 2;
        setHoveredLinkInfo({ link, position: { lat: midLat, lng: midLng } });
      });

      const outListener = pl.addListener('mouseout', () => {
        pl.setOptions({ strokeOpacity: 0.35, strokeWeight: 2.5, zIndex: 1 });
        setHoveredLinkInfo(null);
      });

      const clickListener = pl.addListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(20);
        setHoveredLinkInfo(null);
        const currentLinks = savedLinksRef.current;
        const currentLink = currentLinks?.find(l => l.id === link.id);
        if (currentLink && onSavedLinkClickRef.current) {
          onSavedLinkClickRef.current(currentLink);
        }
      });

      newListeners.push(overListener, outListener, clickListener);
      newEntries.push({ polyline: pl, linkId: link.id });
    });

    savedLinkPolylinesRef.current = newEntries;
    savedLinkListenersRef.current = newListeners;

    return () => {
      savedLinkListenersRef.current.forEach(l => google.maps.event.removeListener(l));
      savedLinkListenersRef.current = [];
      savedLinkPolylinesRef.current.forEach(({ polyline }) => polyline.setMap(null));
      savedLinkPolylinesRef.current = [];
    };
  }, [savedLinks, isMapApiLoaded]);

  const handleMapTypeChange = useCallback((type: "roadmap" | "hybrid") => {
    if (!mapRef.current) return;
    setMapTypeId(type);
    mapRef.current.setMapTypeId(type);
    setShowLayerMenu(false);
  }, []);

  // Phase 11: Apply tool cursor style
  const cursorStyle = activeMapTool && toolCursor ? toolCursor : undefined;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full touch-manipulation"
      style={cursorStyle ? { cursor: cursorStyle } : undefined}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseOut}
    >
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={defaultCenter} zoom={defaultZoom}
        onLoad={handleActualMapLoad} onUnmount={handleMapUnmount}
        onClick={handleInternalMapClick}
        onDblClick={handleInternalMapDoubleClick}
        onRightClick={handleRightClick}
        onMouseMove={handleMouseMove}
        options={{
          disableDoubleClickZoom: !!activeMapTool, // Phase 11: disable zoom on dblclick when tool active
        }}
      >
        {formPointA && pALat !== undefined && pALng !== undefined && markerIconA && (
          <>
            <Marker position={{ lat: pALat, lng: pALng }} draggable={true}
              onDragEnd={(e) => onMarkerDrag && onMarkerDrag(e, 'pointA')}
              icon={markerIconA} label={{ text: "A", color: "#333333", fontWeight: "bold", fontSize: "11px" }} />
            <OverlayView position={{ lat: pALat, lng: pALng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getSiteNameLabelOffset}>
              <div className={STYLES.mapMarkerLabel}>{formPointA.name || "Site A"}</div>
            </OverlayView>
          </>
        )}
        {formPointB && pBLat !== undefined && pBLng !== undefined && markerIconB && (
          <>
            <Marker position={{ lat: pBLat, lng: pBLng }} draggable={true}
              onDragEnd={(e) => onMarkerDrag && onMarkerDrag(e, 'pointB')}
              icon={markerIconB} label={{ text: "B", color: "#333333", fontWeight: "bold", fontSize: "11px" }} />
            <OverlayView position={{ lat: pBLat, lng: pBLng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getSiteNameLabelOffset}>
              <div className={STYLES.mapMarkerLabel}>{formPointB.name || "Site B"}</div>
            </OverlayView>
          </>
        )}
        {losMidPoint && currentDistanceKm !== null && currentDistanceKm !== undefined && (
          <OverlayView position={losMidPoint} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getPathDistanceLabelOffset}>
            <div className={cn(STYLES.distanceOverlayLabelBase, STYLES.distanceOverlayLabelLOS)}>
              {currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)} m` : `${currentDistanceKm.toFixed(1)} km`}
            </div>
          </OverlayView>
        )}
        {fiberPathResult?.status === 'success' && fiberPathResult.totalDistanceMeters !== undefined && fiberPathLabelMidPoint && (
          <OverlayView position={fiberPathLabelMidPoint} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getPathDistanceLabelOffset}>
            <div className={cn(STYLES.distanceOverlayLabelBase, STYLES.distanceOverlayLabelFiber)}>
              Fiber: {fiberPathResult.totalDistanceMeters < 1000 ? `${fiberPathResult.totalDistanceMeters.toFixed(0)} m` : `${(fiberPathResult.totalDistanceMeters / 1000).toFixed(1)} km`}
            </div>
          </OverlayView>
        )}

        {hoveredLinkInfo && (
          <OverlayView position={hoveredLinkInfo.position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={(w, h) => ({ x: -(w / 2), y: -(h + 8) })}>
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-lg px-3 py-2 border border-slate-700/50 shadow-xl pointer-events-none max-w-[220px]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: hoveredLinkInfo.link.color }} />
                <span className="text-xs font-semibold text-white truncate">{hoveredLinkInfo.link.name}</span>
                <span className={cn("text-[0.5rem] px-1 rounded font-bold flex-shrink-0",
                  hoveredLinkInfo.link.analysisResult.losPossible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                  {hoveredLinkInfo.link.analysisResult.losPossible ? 'LOS' : 'BLOCKED'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[0.6rem] text-slate-400">
                <span>{hoveredLinkInfo.link.analysisResult.distanceKm.toFixed(1)} km</span>
                <span>&middot;</span>
                <span>Clearance: {hoveredLinkInfo.link.analysisResult.minClearance?.toFixed(1) ?? 'N/A'}m</span>
              </div>
              <p className="text-[0.5rem] text-slate-500 mt-1">Click to load analysis</p>
            </div>
          </OverlayView>
        )}
      </GoogleMap>

      {/* Long-press indicator */}
      {longPressIndicator && (
        <div
          className={cn("long-press-indicator", longPressIndicator.active && "active")}
          style={{ left: longPressIndicator.x, top: longPressIndicator.y }}
        />
      )}

      {/* Cursor coordinates — desktop only */}
      <CursorCoordinates lat={cursorLat} lng={cursorLng} isVisible={isCursorOnMap} />

      {/* Placement mode edge glow */}
      {placementMode && !activeMapTool && (
        <div className={cn("absolute inset-0 pointer-events-none z-10 rounded-sm border-2 transition-colors duration-300",
          placementMode === 'A' ? "border-emerald-500/40" : "border-blue-500/40")} />
      )}

      {/* Phase 11: Tool active edge glow */}
      {activeMapTool && (
        <div className="absolute inset-0 pointer-events-none z-10 rounded-sm border-2 border-brand-500/30 transition-colors duration-300" />
      )}

      {/* ── Layers button (bottom-right, single button) ── */}
      <div className="absolute bottom-20 right-3 z-10">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowLayerMenu(prev => !prev); }}
            className="w-11 h-11 rounded-full bg-white shadow-md shadow-black/20 flex items-center justify-center text-gray-700 hover:shadow-lg transition-all touch-manipulation active:scale-95"
            aria-label="Map layers"
          >
            <Layers className="h-5 w-5" />
          </button>

          {/* Layer menu popup */}
          {showLayerMenu && (
            <div
              className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-xl shadow-black/20 border border-gray-100 p-2 min-w-[140px] animate-in fade-in slide-in-from-bottom-2 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[0.6rem] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-1 pb-2">
                Map Type
              </p>
              <button
                onClick={() => handleMapTypeChange('hybrid')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all touch-manipulation",
                  mapTypeId === 'hybrid'
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold",
                  mapTypeId === 'hybrid'
                    ? "border-blue-500 bg-blue-100 text-blue-600"
                    : "border-gray-200 bg-gray-100 text-gray-400"
                )}>
                  🛰
                </div>
                Satellite
              </button>
              <button
                onClick={() => handleMapTypeChange('roadmap')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all touch-manipulation",
                  mapTypeId === 'roadmap'
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-bold",
                  mapTypeId === 'roadmap'
                    ? "border-blue-500 bg-blue-100 text-blue-600"
                    : "border-gray-200 bg-gray-100 text-gray-400"
                )}>
                  🗺
                </div>
                Road Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const InteractiveMap = React.memo(function InteractiveMap({ mapContainerClassName = "w-full h-full", ...props }: InteractiveMapProps) {
  return (
    <div className={cn(mapContainerClassName)}>
      <GoogleMapsScriptGuard loadingMessage="Initializing Main Map..." errorMessagePrefix="Error loading Main Map.">
        <InteractiveMapInner {...props} />
      </GoogleMapsScriptGuard>
    </div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.isStale !== nextProps.isStale) return false;
  if (prevProps.currentDistanceKm !== nextProps.currentDistanceKm) return false;
  if (prevProps.analysisResult !== nextProps.analysisResult) return false;
  if (prevProps.fiberPathResult !== nextProps.fiberPathResult) return false;
  if (prevProps.placementMode !== nextProps.placementMode) return false;
  if (prevProps.mapNavigationTarget !== nextProps.mapNavigationTarget) return false;
  if (prevProps.savedLinks !== nextProps.savedLinks) return false;
  if (prevProps.selectedDeviceId !== nextProps.selectedDeviceId) return false;
  if (prevProps.pointA?.lat !== nextProps.pointA?.lat) return false;
  if (prevProps.pointA?.lng !== nextProps.pointA?.lng) return false;
  if (prevProps.pointA?.name !== nextProps.pointA?.name) return false;
  if (prevProps.pointB?.lat !== nextProps.pointB?.lat) return false;
  if (prevProps.pointB?.lng !== nextProps.pointB?.lng) return false;
  if (prevProps.pointB?.name !== nextProps.pointB?.name) return false;
  // Phase 11: Also re-render when tool state changes
  if (prevProps.activeMapTool !== nextProps.activeMapTool) return false;
  if (prevProps.toolCursor !== nextProps.toolCursor) return false;
  return true;
});

export default InteractiveMap;