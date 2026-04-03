// src/components/map/tools/measure-area.ts
// Phase 12B — Enhanced polygon area measurement
// Multi-click to add vertices, double-click to close polygon.
// Shows area + perimeter. Better vertex markers & fill.

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import {
  haversineDistance,
  polylineDistance,
  sphericalPolygonArea,
  formatDistance,
  formatArea,
  formatDD,
  createVertexMarker,
  TOOL_COLORS,
} from './tool-utils';

// ─── Module State ───────────────────────────────────────────────────

let _map: google.maps.Map | null = null;
let _points: google.maps.LatLng[] = [];
let _markers: google.maps.Marker[] = [];
let _polygon: google.maps.Polygon | null = null;
let _polyline: google.maps.Polyline | null = null; // open path while drawing

// ─── Internal Helpers ───────────────────────────────────────────────

function getPerimeter(pts: google.maps.LatLng[]): number {
  if (pts.length < 2) return 0;
  // polyline distance + closing segment
  let total = polylineDistance(pts);
  if (pts.length >= 3) {
    total += haversineDistance(pts[pts.length - 1], pts[0]);
  }
  return total;
}

function clearAll(): void {
  _markers.forEach((m) => m.setMap(null));
  _markers = [];
  if (_polygon) {
    _polygon.setMap(null);
    _polygon = null;
  }
  if (_polyline) {
    _polyline.setMap(null);
    _polyline = null;
  }
  _points = [];
}

function collectOverlays(): google.maps.MVCObject[] {
  return [
    ...(_polygon ? [_polygon] : []),
    ...(_polyline ? [_polyline] : []),
    ..._markers,
  ];
}

function buildResult(isFinal: boolean): ToolResult {
  const area = _points.length >= 3 ? sphericalPolygonArea(_points) : 0;
  const perimeter = getPerimeter(_points);

  const vertices = _points.map((p, i) => ({
    index: i + 1,
    coords: formatDD(p.lat(), p.lng()),
    lat: p.lat(),
    lng: p.lng(),
  }));

  return {
    toolId: 'measure-area',
    timestamp: Date.now(),
    data: {
      area: formatArea(area),
      areaRaw: Math.round(area * 100) / 100,
      areaAcres: area > 0 ? `${(area / 4046.8564224).toFixed(3)} acres` : '0 acres',
      perimeter: formatDistance(perimeter),
      perimeterRaw: Math.round(perimeter * 100) / 100,
      vertexCount: _points.length,
      vertices,
      isFinal,
    },
    overlays: collectOverlays(),
  };
}

// ─── Tool Handler ───────────────────────────────────────────────────

export const measureArea: ToolHandler = {
  activate(options: ToolActivateOptions): void {
    clearAll();
    _map = options.map;
    _points = [];

    // Drawing polyline (shown while placing vertices, before closing)
    _polyline = new google.maps.Polyline({
      map: _map,
      path: [],
      strokeColor: TOOL_COLORS.area.stroke,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      geodesic: true,
      clickable: false,
    });

    options.onStatusChange('Click to add vertices. Double-click to close polygon.');
  },

  deactivate(): void {
    clearAll();
    _map = null;
  },

  handleClick(latLng: google.maps.LatLng, options: ToolActivateOptions): void {
    if (!_map) return;

    const idx = _points.length;
    _points.push(latLng);
    options.addClickPoint(latLng);

    // Vertex marker
    const marker = createVertexMarker(
      latLng,
      _map,
      TOOL_COLORS.area.stroke,
      (idx + 1).toString(),
    );
    _markers.push(marker);

    // Update drawing polyline
    _polyline?.setPath(_points);

    // Status
    if (_points.length < 3) {
      options.onStatusChange(
        `${_points.length} vertex${_points.length > 1 ? 'es' : ''}. Need ${3 - _points.length} more. Double-click to close.`,
      );
    } else {
      const area = sphericalPolygonArea(_points);
      options.onStatusChange(
        `${_points.length} vertices · ${formatArea(area)}. Double-click to close.`,
      );
      // Emit intermediate result
      options.onResult(buildResult(false));
    }
  },

  handleDoubleClick(latLng: google.maps.LatLng, options: ToolActivateOptions): void {
    if (!_map || _points.length < 3) {
      options.onStatusChange('Need at least 3 vertices to form a polygon.');
      return;
    }

    // Remove the drawing polyline
    if (_polyline) {
      _polyline.setMap(null);
      _polyline = null;
    }

    // Create closed polygon
    _polygon = new google.maps.Polygon({
      map: _map,
      paths: _points,
      strokeColor: TOOL_COLORS.area.stroke,
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: TOOL_COLORS.area.fill,
      fillOpacity: 1, // fill already has alpha in the color string
      geodesic: true,
      clickable: false,
    });

    const area = sphericalPolygonArea(_points);
    const perimeter = getPerimeter(_points);
    options.onStatusChange(
      `Done — ${_points.length} vertices · ${formatArea(area)} · ${formatDistance(perimeter)} perimeter`,
    );

    options.onResult(buildResult(true));
  },

  getCursor(): string {
    return 'crosshair';
  },
};