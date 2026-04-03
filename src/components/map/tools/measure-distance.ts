// src/components/map/tools/measure-distance.ts
// Phase 11B — Multi-click polyline distance measurement

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';
import {
  haversineDistance,
  polylineDistance,
  formatDistance,
  cleanupOverlays,
  createVertexMarker,
  TOOL_COLORS,
} from './tool-utils';

export function createMeasureDistanceHandler(): ToolHandler {
  let points: google.maps.LatLng[] = [];
  let polyline: google.maps.Polyline | null = null;
  let vertexMarkers: google.maps.Marker[] = [];
  let finished = false;

  function updatePolyline(map: google.maps.Map) {
    if (polyline) {
      polyline.setPath(points);
    } else if (points.length >= 2) {
      polyline = new google.maps.Polyline({
        path: points,
        map,
        strokeColor: TOOL_COLORS.distance.stroke,
        strokeOpacity: 1,
        strokeWeight: 3,
        zIndex: 5,
      });
    }
  }

  function getAllOverlays(): google.maps.MVCObject[] {
    const all: google.maps.MVCObject[] = [...vertexMarkers];
    if (polyline) all.push(polyline);
    return all;
  }

  function cleanup() {
    if (!finished) {
      cleanupOverlays(getAllOverlays());
    }
    points = [];
    polyline = null;
    vertexMarkers = [];
    finished = false;
  }

  function buildSegments(): Array<{ index: number; meters: number }> {
    const segments: Array<{ index: number; meters: number }> = [];
    for (let i = 1; i < points.length; i++) {
      segments.push({
        index: i,
        meters: haversineDistance(points[i - 1], points[i]),
      });
    }
    return segments;
  }

  function finish(options: ToolActivateOptions) {
    if (points.length < 2) return;
    finished = true;
    const totalMeters = polylineDistance(points);
    const segments = buildSegments();

    options.onResult({
      toolId: 'measure-distance',
      timestamp: Date.now(),
      data: {
        totalMeters,
        totalFormatted: formatDistance(totalMeters),
        pointCount: points.length,
        segments: segments.map((s) => ({
          index: s.index,
          meters: s.meters,
          formatted: formatDistance(s.meters),
        })),
      },
      overlays: getAllOverlays(),
    });

    // Transfer ownership — clear local refs without removing from map
    polyline = null;
    vertexMarkers = [];
    points = [];
  }

  return {
    activate(options) {
      cleanup();
      options.onStatusChange('Click to start measuring. Double-click to finish.');
    },

    deactivate() {
      cleanup();
    },

    handleClick(latLng, options) {
      if (finished) return;
      points.push(latLng);
      options.addClickPoint(latLng);

      const marker = createVertexMarker(
        latLng,
        options.map,
        TOOL_COLORS.distance.stroke,
        String(points.length)
      );
      vertexMarkers.push(marker);
      updatePolyline(options.map);

      const total = polylineDistance(points);
      options.onStatusChange(
        `${points.length} point${points.length > 1 ? 's' : ''} · ${formatDistance(total)} — double-click to finish`
      );
    },

    handleDoubleClick(_latLng, options) {
      // Remove the extra point added by the second click of the dblclick
      if (points.length > 1) {
        const lastMarker = vertexMarkers.pop();
        if (lastMarker) lastMarker.setMap(null);
        points.pop();
        updatePolyline(options.map);
      }
      finish(options);
    },

    getCursor() {
      return 'crosshair';
    },
  };
}