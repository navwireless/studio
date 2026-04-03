// src/components/map/tools/multi-measure.ts
// Phase 12B — Replaces measure-distance + bearing-calc + terrain-profile
// Multi-click polyline: per-segment distance, bearing, compass, slope.
// Double-click finishes. Lazy elevation profile fetched on finish.

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import {
  haversineDistance,
  polylineDistance,
  calculateBearing,
  bearingToCompass,
  formatDistance,
  formatBearing,
  formatDD,
  formatElevation,
  createVertexMarker,
  midpoint,
  TOOL_COLORS,
} from './tool-utils';

// ─── Segment Label Factory (lazy — avoids google.maps at module load) ─

interface LabelHandle {
  remove: () => void;
}

function createSegmentLabel(
  position: google.maps.LatLng,
  primaryText: string,
  secondaryText: string,
  mapInstance: google.maps.Map,
): LabelHandle {
  const overlay = new google.maps.OverlayView();
  let div: HTMLDivElement | null = null;

  overlay.onAdd = function () {
    div = document.createElement('div');
    Object.assign(div.style, {
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
      marginTop: '-14px',
      padding: '3px 7px',
      backgroundColor: 'rgba(0, 0, 0, 0.82)',
      borderRadius: '5px',
      border: `1px solid ${TOOL_COLORS.distance.stroke}`,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: '100',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    });
    div.innerHTML = `
      <div style="font-size:11px;font-weight:600;color:${TOOL_COLORS.distance.stroke};line-height:1.3">
        ${primaryText}
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,0.65);line-height:1.3">
        ${secondaryText}
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
let _points: google.maps.LatLng[] = [];
let _markers: google.maps.Marker[] = [];
let _polyline: google.maps.Polyline | null = null;
let _labels: LabelHandle[] = [];

// ─── Internal Helpers ───────────────────────────────────────────────

interface Segment {
  index: number;
  from: google.maps.LatLng;
  to: google.maps.LatLng;
  distance: number;
  bearing: number;
  compass: string;
}

function buildSegments(): Segment[] {
  const segs: Segment[] = [];
  for (let i = 1; i < _points.length; i++) {
    const from = _points[i - 1];
    const to = _points[i];
    const distance = haversineDistance(from, to);
    const bearing = calculateBearing(from, to);
    segs.push({
      index: i,
      from,
      to,
      distance,
      bearing,
      compass: bearingToCompass(bearing),
    });
  }
  return segs;
}

function addLabel(a: google.maps.LatLng, b: google.maps.LatLng, seg: Segment): void {
  if (!_map) return;
  const mid = midpoint(a, b);
  _labels.push(
    createSegmentLabel(
      mid,
      formatDistance(seg.distance),
      `${formatBearing(seg.bearing)} ${seg.compass}`,
      _map,
    ),
  );
}

function clearAll(): void {
  _markers.forEach((m) => m.setMap(null));
  _markers = [];
  _labels.forEach((l) => l.remove());
  _labels = [];
  if (_polyline) {
    _polyline.setMap(null);
    _polyline = null;
  }
  _points = [];
}

function collectOverlays(): google.maps.MVCObject[] {
  return [
    ...(_polyline ? [_polyline] : []),
    ..._markers,
  ];
}

// ─── Elevation Profile (lazy — only on finish) ─────────────────────

async function fetchElevationProfile(): Promise<
  { elevation: number; lat: number; lng: number }[] | null
> {
  if (_points.length < 2) return null;
  try {
    const elevator = new google.maps.ElevationService();
    const path = _points.map((p) => ({ lat: p.lat(), lng: p.lng() }));
    const samples = Math.min(Math.max(_points.length * 32, 64), 512);
    const res = await elevator.getElevationAlongPath({ path, samples });
    if (!res?.results) return null;
    return res.results.map((r) => ({
      elevation: r.elevation ?? 0,
      lat: r.location?.lat() ?? 0,
      lng: r.location?.lng() ?? 0,
    }));
  } catch {
    return null;
  }
}

// ─── Result Builder ─────────────────────────────────────────────────

function buildResult(
  isFinal: boolean,
  elevationProfile?: { elevation: number; lat: number; lng: number }[] | null,
): ToolResult {
  const segments = buildSegments();
  const total = polylineDistance(_points);

  let elevData: Record<string, unknown> | undefined;
  if (elevationProfile && elevationProfile.length > 0) {
    const elevs = elevationProfile.map((p) => p.elevation);
    const minE = Math.min(...elevs);
    const maxE = Math.max(...elevs);
    const startE = elevs[0];
    const endE = elevs[elevs.length - 1];
    elevData = {
      minElevation: formatElevation(minE),
      maxElevation: formatElevation(maxE),
      startElevation: formatElevation(startE),
      endElevation: formatElevation(endE),
      elevationGain: formatElevation(maxE - minE),
      slopePercent:
        total > 0
          ? `${(((endE - startE) / total) * 100).toFixed(2)}%`
          : '0%',
      profile: elevationProfile,
    };
  }

  return {
    toolId: 'multi-measure',
    timestamp: Date.now(),
    data: {
      segments: segments.map((s) => ({
        index: s.index,
        from: formatDD(s.from.lat(), s.from.lng()),
        to: formatDD(s.to.lat(), s.to.lng()),
        distance: formatDistance(s.distance),
        distanceRaw: Math.round(s.distance * 100) / 100,
        bearing: formatBearing(s.bearing),
        bearingRaw: Math.round(s.bearing * 10) / 10,
        compass: s.compass,
      })),
      totalDistance: formatDistance(total),
      totalDistanceRaw: Math.round(total * 100) / 100,
      segmentCount: segments.length,
      pointCount: _points.length,
      isFinal,
      ...(elevData ? { elevation: elevData } : {}),
    },
    overlays: collectOverlays(),
  };
}

// ─── Tool Handler ───────────────────────────────────────────────────

export const multiMeasure: ToolHandler = {
  activate(options: ToolActivateOptions): void {
    clearAll();
    _map = options.map;
    _points = [];

    _polyline = new google.maps.Polyline({
      map: _map,
      path: [],
      strokeColor: TOOL_COLORS.distance.stroke,
      strokeOpacity: 1,
      strokeWeight: 3,
      geodesic: true,
      clickable: false,
    });

    options.onStatusChange('Click to start measuring. Double-click to finish.');
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

    const marker = createVertexMarker(
      latLng,
      _map,
      TOOL_COLORS.distance.stroke,
      (idx + 1).toString(),
    );
    _markers.push(marker);

    _polyline?.setPath(_points);

    if (idx > 0) {
      const seg = buildSegments().pop();
      if (seg) addLabel(_points[idx - 1], latLng, seg);
    }

    const total = polylineDistance(_points);
    if (_points.length === 1) {
      options.onStatusChange('Click next point. Double-click to finish.');
    } else {
      options.onStatusChange(
        `${_points.length} pts · ${formatDistance(total)}. Double-click to finish.`,
      );
    }

    if (_points.length >= 2) {
      options.onResult(buildResult(false));
    }
  },

  async handleDoubleClick(
    _latLng: google.maps.LatLng,
    options: ToolActivateOptions,
  ): Promise<void> {
    if (!_map || _points.length < 2) return;

    options.onStatusChange('Fetching elevation profile…');
    options.onProcessingChange(true);

    const profile = await fetchElevationProfile();

    options.onProcessingChange(false);
    options.onStatusChange(
      `Done — ${_points.length} pts · ${formatDistance(polylineDistance(_points))}`,
    );

    options.onResult(buildResult(true, profile));
  },

  getCursor(): string {
    return 'crosshair';
  },
};