// src/components/map/tools/range-rings.ts
// Phase 12B/13 — Radius circle tool
// Click center, then click edge to create a single radius circle.

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import {
  formatDistance,
  formatDD,
  ddToDMS,
  createVertexMarker,
  haversineDistance,
  TOOL_COLORS,
} from './tool-utils';

// ─── Label Factory (lazy) ───────────────────────────────────────────

interface LabelHandle {
  remove: () => void;
}

function createRingLabel(
  position: google.maps.LatLng,
  text: string,
  title: string,
  mapInstance: google.maps.Map,
): LabelHandle {
  const overlay = new google.maps.OverlayView();
  let div: HTMLDivElement | null = null;

  overlay.onAdd = function () {
    div = document.createElement('div');
    Object.assign(div.style, {
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      padding: '2px 6px',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      borderRadius: '4px',
      border: `1px solid ${TOOL_COLORS.range.stroke}`,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: '90',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    });
    div.innerHTML = `
      <div style="font-size:10px;font-weight:600;color:${TOOL_COLORS.range.stroke};line-height:1.2">
        ${title}
      </div>
      <div style="font-size:9px;color:rgba(255,255,255,0.65);line-height:1.2">
        ${text}
      </div>`;
    this.getPanes()?.overlayLayer.appendChild(div);
  };

  overlay.draw = function () {
    if (!div) return;
    const pos = this.getProjection()?.fromLatLngToDivPixel(position);
    if (!pos) return;
    div.style.left = `${pos.x}px`;
    div.style.top = `${pos.y}px`;
  };

  overlay.onRemove = function () {
    div?.parentNode?.removeChild(div);
    div = null;
  };

  overlay.setMap(mapInstance);

  return {
    remove: () => overlay.setMap(null),
  };
}

// ─── Module State ───────────────────────────────────────────────────

let _map: google.maps.Map | null = null;
let _circle: google.maps.Circle | null = null;
let _centerMarker: google.maps.Marker | null = null;
let _edgeMarker: google.maps.Marker | null = null;
let _labelOverlays: LabelHandle[] = [];
let _centerPoint: google.maps.LatLng | null = null;

// ─── Internal Helpers ───────────────────────────────────────────────

function offsetNorth(center: google.maps.LatLng, meters: number): google.maps.LatLng {
  const earthRadius = 6371000;
  const dLat = meters / earthRadius;
  const newLat = center.lat() + (dLat * 180) / Math.PI;
  return new google.maps.LatLng(newLat, center.lng());
}

function clearAll(): void {
  if (_circle) {
    _circle.setMap(null);
    _circle = null;
  }
  _labelOverlays.forEach((l) => l.remove());
  _labelOverlays = [];
  if (_centerMarker) {
    _centerMarker.setMap(null);
    _centerMarker = null;
  }
  if (_edgeMarker) {
    _edgeMarker.setMap(null);
    _edgeMarker = null;
  }
  _centerPoint = null;
}

function collectOverlays(): google.maps.MVCObject[] {
  return [
    ...(_circle ? [_circle] : []),
    ...(_centerMarker ? [_centerMarker] : []),
    ...(_edgeMarker ? [_edgeMarker] : []),
  ];
}

function buildResult(center: google.maps.LatLng, edge: google.maps.LatLng): ToolResult {
  const radiusMeters = haversineDistance(center, edge);
  const centerDms = ddToDMS(center.lat(), center.lng());
  const edgeDms = ddToDMS(edge.lat(), edge.lng());

  return {
    toolId: 'range-rings',
    timestamp: Date.now(),
    data: {
      center: formatDD(center.lat(), center.lng()),
      centerLat: center.lat(),
      centerLng: center.lng(),
      centerDMS: `${centerDms.lat}, ${centerDms.lng}`,
      edge: formatDD(edge.lat(), edge.lng()),
      edgeLat: edge.lat(),
      edgeLng: edge.lng(),
      edgeDMS: `${edgeDms.lat}, ${edgeDms.lng}`,
      radius: formatDistance(radiusMeters),
      radiusRaw: Math.round(radiusMeters * 100) / 100,
      diameter: formatDistance(radiusMeters * 2),
      area: `${(Math.PI * radiusMeters * radiusMeters).toFixed(1)} m²`,
    },
    overlays: collectOverlays(),
  };
}

// ─── Tool Handler ───────────────────────────────────────────────────

export const rangeRings: ToolHandler = {
  activate(options: ToolActivateOptions): void {
    clearAll();
    _map = options.map;
    options.onStatusChange('Click circle center, then click edge to set radius.');
  },

  deactivate(): void {
    clearAll();
    _map = null;
  },

  handleClick(latLng: google.maps.LatLng, options: ToolActivateOptions): void {
    if (!_map) return;

    // First click: center point.
    if (!_centerPoint) {
      clearAll();
      _centerPoint = latLng;
      _centerMarker = createVertexMarker(latLng, _map, TOOL_COLORS.range.stroke, 'C');
      options.onStatusChange('Center set. Click edge point to complete radius circle.');
      return;
    }

    // Second click: edge point and final circle.
    _edgeMarker = createVertexMarker(latLng, _map, TOOL_COLORS.range.stroke, 'R');
    const radiusMeters = haversineDistance(_centerPoint, latLng);

    _circle = new google.maps.Circle({
      map: _map,
      center: _centerPoint,
      radius: radiusMeters,
      strokeColor: TOOL_COLORS.range.stroke,
      strokeOpacity: 0.95,
      strokeWeight: 2,
      fillColor: TOOL_COLORS.range.fill,
      fillOpacity: 0.16,
      clickable: false,
    });

    const labelPos = offsetNorth(_centerPoint, radiusMeters);
    _labelOverlays.push(createRingLabel(labelPos, formatDistance(radiusMeters), 'Radius', _map));

    const bounds = _circle.getBounds();
    if (bounds) {
      _map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }

    options.onStatusChange(`Radius circle created: ${formatDistance(radiusMeters)}`);
    options.onResult(buildResult(_centerPoint, latLng));
  },

  getCursor(): string {
    return 'crosshair';
  },
};