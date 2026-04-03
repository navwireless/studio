// src/components/map/tools/terrain-profile.ts
// Phase 11B — Draw a line between two points, fetch elevation samples, show profile

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';
import {
  haversineDistance,
  formatDistance,
  formatElevation,
  cleanupOverlays,
  createVertexMarker,
  interpolatePoints,
  TOOL_COLORS,
} from './tool-utils';

const NUM_SAMPLES = 64;

export function createTerrainProfileHandler(): ToolHandler {
  let pointA: google.maps.LatLng | null = null;
  let pointB: google.maps.LatLng | null = null;
  let previewLine: google.maps.Polyline | null = null;
  let markerA: google.maps.Marker | null = null;
  let markerB: google.maps.Marker | null = null;
  let elevator: google.maps.ElevationService | null = null;
  let finished = false;

  function getAllOverlays(): google.maps.MVCObject[] {
    const all: google.maps.MVCObject[] = [];
    if (previewLine) all.push(previewLine);
    if (markerA) all.push(markerA);
    if (markerB) all.push(markerB);
    return all;
  }

  function cleanup() {
    if (!finished) {
      cleanupOverlays(getAllOverlays());
    }
    pointA = null;
    pointB = null;
    previewLine = null;
    markerA = null;
    markerB = null;
    finished = false;
  }

  function fetchProfile(options: ToolActivateOptions) {
    if (!pointA || !pointB) return;
    if (!elevator) {
      elevator = new google.maps.ElevationService();
    }

    options.onProcessingChange(true);
    options.onStatusChange('Fetching elevation profile…');

    const path = interpolatePoints(pointA, pointB, NUM_SAMPLES);

    elevator.getElevationAlongPath(
      { path, samples: NUM_SAMPLES },
      (results, status) => {
        options.onProcessingChange(false);

        if (
          status === google.maps.ElevationStatus.OK &&
          results &&
          results.length > 0
        ) {
          finished = true;
          const totalDist = haversineDistance(pointA!, pointB!);

          const profileData = results.map((r, i) => ({
            distance: (totalDist / (results.length - 1)) * i,
            elevation: r.elevation,
            lat: r.location?.lat() ?? 0,
            lng: r.location?.lng() ?? 0,
          }));

          const elevations = profileData.map((p) => p.elevation);
          const minElev = Math.min(...elevations);
          const maxElev = Math.max(...elevations);
          const avgElev = elevations.reduce((a, b) => a + b, 0) / elevations.length;
          const elevGain = profileData.reduce((gain, p, i) => {
            if (i === 0) return 0;
            const diff = p.elevation - profileData[i - 1].elevation;
            return gain + (diff > 0 ? diff : 0);
          }, 0);

          // Color the line by elevation
          previewLine?.setOptions({
            strokeColor: TOOL_COLORS.terrain.stroke,
            strokeWeight: 4,
          });

          options.onResult({
            toolId: 'terrain-profile',
            timestamp: Date.now(),
            data: {
              profile: profileData,
              totalDistance: totalDist,
              totalDistanceFormatted: formatDistance(totalDist),
              minElevation: minElev,
              minElevationFormatted: formatElevation(minElev),
              maxElevation: maxElev,
              maxElevationFormatted: formatElevation(maxElev),
              avgElevation: avgElev,
              avgElevationFormatted: formatElevation(avgElev),
              elevationGain: elevGain,
              elevationGainFormatted: formatElevation(elevGain),
              pointA: { lat: pointA!.lat(), lng: pointA!.lng() },
              pointB: { lat: pointB!.lat(), lng: pointB!.lng() },
            },
            overlays: getAllOverlays(),
          });

          options.onStatusChange(
            `Profile: ${formatDistance(totalDist)}, ${formatElevation(minElev)} – ${formatElevation(maxElev)}`
          );

          // Clear refs without removing from map
          previewLine = null;
          markerA = null;
          markerB = null;
          pointA = null;
          pointB = null;
        } else {
          options.onStatusChange(
            `Elevation fetch failed (${status}). Try again.`
          );
          cleanup();
        }
      }
    );
  }

  return {
    activate(options) {
      cleanup();
      options.onStatusChange('Click the start point of the profile line.');
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
          TOOL_COLORS.terrain.stroke,
          'A'
        );
        options.onStatusChange('Now click the end point.');
      } else if (!pointB) {
        pointB = latLng;
        options.addClickPoint(latLng);
        markerB = createVertexMarker(
          latLng,
          options.map,
          TOOL_COLORS.terrain.stroke,
          'B'
        );

        previewLine = new google.maps.Polyline({
          path: [pointA, pointB],
          map: options.map,
          strokeColor: TOOL_COLORS.terrain.stroke,
          strokeOpacity: 0.6,
          strokeWeight: 2,
          geodesic: true,
          zIndex: 5,
        });

        fetchProfile(options);
      }
    },

    getCursor() {
      return 'crosshair';
    },
  };
}