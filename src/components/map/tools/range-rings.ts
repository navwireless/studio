// src/components/map/tools/range-rings.ts
// Phase 12B — Replaces range-circle.ts
// Single click → concentric rings at 25%, 50%, 75%, 100% of device max range.

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';
import {
  formatDistance,
  formatDD,
  ddToDMS,
  createVertexMarker,
  TOOL_COLORS,
} from './tool-utils';

// ─── Constants ──────────────────────────────────────────────────────

const DEFAULT_RANGE_KM = 5;
const RING_PERCENTAGES = [0.25, 0.50, 0.75, 1.0];
const RING_OPACITIES = [0.15, 0.20, 0.25, 0.35];
const RING_WEIGHTS = [1, 1, 1.5, 2];

// ─── Label Factory (lazy) ───────────────────────────────────────────

interface LabelHandle {
  remove: () => void;
}

function createRingLabel(
  position: google.maps.LatLng,
  text: string,
  percent: string,
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
        ${percent}
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
let _circles: google.maps.Circle[] = [];
let _centerMarker: google.maps.Marker | null = null;
let _labelOverlays: LabelHandle[] = [];

// ─── Internal Helpers ───────────────────────────────────────────────

function offsetNorth(center: google.maps.LatLng, meters: number): google.maps.LatLng {
  const earthRadius = 6371000;
  const dLat = meters / earthRadius;
  const newLat = center.lat() + (dLat * 180) / Math.PI;
  return new google.maps.LatLng(newLat, center.lng());
}

function getDeviceRangeKm(): { rangeKm: number; deviceName: string } {
  try {
    const mapContainer = _map?.getDiv();
    const rangeAttr = mapContainer?.getAttribute('data-device-range-km');
    const nameAttr = mapContainer?.getAttribute('data-device-name');
    if (rangeAttr) {
      const parsed = parseFloat(rangeAttr);
      if (!isNaN(parsed) && parsed > 0) {
        return {
          rangeKm: parsed,
          deviceName: nameAttr || 'Selected Device',
        };
      }
    }
  } catch {
    // ignore
  }
  return { rangeKm: DEFAULT_RANGE_KM, deviceName: `Default (${DEFAULT_RANGE_KM} km)` };
}

function clearAll(): void {
  _circles.forEach((c) => c.setMap(null));
  _circles = [];
  _labelOverlays.forEach((l) => l.remove());
  _labelOverlays = [];
  if (_centerMarker) {
    _centerMarker.setMap(null);
    _centerMarker = null;
  }
}

function collectOverlays(): google.maps.MVCObject[] {
  return [
    ..._circles,
    ...(_centerMarker ? [_centerMarker] : []),
  ];
}

// ─── Tool Handler ───────────────────────────────────────────────────

export const rangeRings: ToolHandler = {
  activate(options: ToolActivateOptions): void {
    clearAll();
    _map = options.map;
    const { rangeKm, deviceName } = getDeviceRangeKm();
    options.onStatusChange(`Click to place range rings (${deviceName}: ${rangeKm} km).`);
  },

  deactivate(): void {
    clearAll();
    _map = null;
  },

  handleClick(latLng: google.maps.LatLng, options: ToolActivateOptions): void {
    if (!_map) return;

    clearAll();

    const { rangeKm, deviceName } = getDeviceRangeKm();
    const maxRangeMeters = rangeKm * 1000;

    _centerMarker = createVertexMarker(
      latLng,
      _map,
      TOOL_COLORS.range.stroke,
      '⊕',
    );

    const ringData: { percent: number; radius: number }[] = [];

    RING_PERCENTAGES.forEach((pct, i) => {
      const radius = maxRangeMeters * pct;

      const circle = new google.maps.Circle({
        map: _map!,
        center: latLng,
        radius,
        strokeColor: TOOL_COLORS.range.stroke,
        strokeOpacity: RING_OPACITIES[i],
        strokeWeight: RING_WEIGHTS[i],
        fillColor: TOOL_COLORS.range.fill,
        fillOpacity: i === 0 ? 0.04 : 0,
        clickable: false,
      });

      _circles.push(circle);
      ringData.push({ percent: pct, radius });

      const labelPos = offsetNorth(latLng, radius);
      const pctLabel = `${Math.round(pct * 100)}%`;
      const distLabel = formatDistance(radius);
      _labelOverlays.push(createRingLabel(labelPos, distLabel, pctLabel, _map!));
    });

    const bounds = _circles[_circles.length - 1]?.getBounds();
    if (bounds) {
      _map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }

    const dms = ddToDMS(latLng.lat(), latLng.lng());
    options.onStatusChange(
      `${deviceName} — ${rangeKm} km range at ${formatDD(latLng.lat(), latLng.lng())}`,
    );

    options.onResult({
      toolId: 'range-rings',
      timestamp: Date.now(),
      data: {
        center: formatDD(latLng.lat(), latLng.lng()),
        centerLat: latLng.lat(),
        centerLng: latLng.lng(),
        centerDMS: `${dms.lat}, ${dms.lng}`,
        deviceName,
        maxRange: formatDistance(maxRangeMeters),
        maxRangeKm: rangeKm,
        rings: ringData.map((r) => ({
          percent: `${Math.round(r.percent * 100)}%`,
          radius: formatDistance(r.radius),
          radiusRaw: Math.round(r.radius),
        })),
      },
      overlays: collectOverlays(),
    });
  },

  getCursor(): string {
    return 'crosshair';
  },
};