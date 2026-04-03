// src/components/map/tools/bearing-calc.ts
// Phase 11B — Calculate bearing angle between two points

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';
import {
  calculateBearing,
  calculateBackBearing,
  bearingToCompass,
  haversineDistance,
  formatBearing,
  formatDistance,
  formatDD,
  cleanupOverlays,
  createVertexMarker,
  TOOL_COLORS,
} from './tool-utils';

export function createBearingCalcHandler(): ToolHandler {
  let pointA: google.maps.LatLng | null = null;
  let pointB: google.maps.LatLng | null = null;
  let markerA: google.maps.Marker | null = null;
  let markerB: google.maps.Marker | null = null;
  let line: google.maps.Polyline | null = null;
  let arrowMarker: google.maps.Marker | null = null;
  let finished = false;

  function getAllOverlays(): google.maps.MVCObject[] {
    const all: google.maps.MVCObject[] = [];
    if (markerA) all.push(markerA);
    if (markerB) all.push(markerB);
    if (line) all.push(line);
    if (arrowMarker) all.push(arrowMarker);
    return all;
  }

  function cleanup() {
    if (!finished) {
      cleanupOverlays(getAllOverlays());
    }
    pointA = null;
    pointB = null;
    markerA = null;
    markerB = null;
    line = null;
    arrowMarker = null;
    finished = false;
  }

  function finishBearing(options: ToolActivateOptions) {
    if (!pointA || !pointB) return;
    finished = true;

    const bearing = calculateBearing(pointA, pointB);
    const backBearing = calculateBackBearing(pointA, pointB);
    const compass = bearingToCompass(bearing);
    const distance = haversineDistance(pointA, pointB);

    // Draw the line
    line = new google.maps.Polyline({
      path: [pointA, pointB],
      map: options.map,
      strokeColor: TOOL_COLORS.bearing.stroke,
      strokeOpacity: 1,
      strokeWeight: 3,
      zIndex: 5,
      icons: [
        {
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 4,
            fillColor: TOOL_COLORS.bearing.stroke,
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#ffffff',
          },
          offset: '100%',
        },
      ],
    });

    options.onResult({
      toolId: 'bearing-calc',
      timestamp: Date.now(),
      data: {
        from: {
          lat: pointA.lat(),
          lng: pointA.lng(),
          dd: formatDD(pointA.lat(), pointA.lng()),
        },
        to: {
          lat: pointB.lat(),
          lng: pointB.lng(),
          dd: formatDD(pointB.lat(), pointB.lng()),
        },
        bearing,
        bearingFormatted: formatBearing(bearing),
        backBearing,
        backBearingFormatted: formatBearing(backBearing),
        compass,
        distance,
        distanceFormatted: formatDistance(distance),
      },
      overlays: getAllOverlays(),
    });

    options.onStatusChange(
      `Bearing: ${formatBearing(bearing)} (${compass}) — ${formatDistance(distance)}`
    );

    // Clear refs without removing from map
    markerA = null;
    markerB = null;
    line = null;
    arrowMarker = null;
    pointA = null;
    pointB = null;
  }

  return {
    activate(options) {
      cleanup();
      options.onStatusChange('Click the origin point (bearing FROM).');
    },

    deactivate() {
      cleanup();
    },

    handleClick(latLng, options) {
      if (finished) return;

      if (!pointA) {
        pointA = latLng;
        options.addClickPoint(latLng);
        markerA = createVertexMarker(
          latLng,
          options.map,
          TOOL_COLORS.bearing.stroke,
          'A'
        );
        options.onStatusChange('Now click the target point (bearing TO).');
      } else if (!pointB) {
        pointB = latLng;
        options.addClickPoint(latLng);
        markerB = createVertexMarker(
          latLng,
          options.map,
          TOOL_COLORS.bearing.stroke,
          'B'
        );
        finishBearing(options);
      }
    },

    getCursor() {
      return 'crosshair';
    },
  };
}