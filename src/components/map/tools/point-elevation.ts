// src/components/map/tools/point-elevation.ts
// Phase 11B — Click to get ground elevation via Google Elevation API

import type { ToolHandler } from '@/types/map-tools';
import {
  formatDD,
  formatElevation,
  createVertexMarker,
  TOOL_COLORS,
} from './tool-utils';

export function createPointElevationHandler(): ToolHandler {
  let elevator: google.maps.ElevationService | null = null;

  return {
    activate(options) {
      if (!elevator) {
        elevator = new google.maps.ElevationService();
      }
      options.onStatusChange('Click any point to see its elevation.');
    },

    deactivate() {
      // Nothing to clean up between clicks
    },

    handleClick(latLng, options) {
      if (!elevator) {
        elevator = new google.maps.ElevationService();
      }

      options.onProcessingChange(true);
      options.onStatusChange('Fetching elevation…');

      const marker = createVertexMarker(
        latLng,
        options.map,
        TOOL_COLORS.elevation.stroke
      );

      elevator.getElevationForLocations(
        { locations: [latLng] },
        (results, status) => {
          options.onProcessingChange(false);

          if (
            status === google.maps.ElevationStatus.OK &&
            results &&
            results.length > 0
          ) {
            const elev = results[0].elevation;
            const resolution = results[0].resolution;

            options.onResult({
              toolId: 'point-elevation',
              timestamp: Date.now(),
              data: {
                lat: latLng.lat(),
                lng: latLng.lng(),
                dd: formatDD(latLng.lat(), latLng.lng()),
                elevationMeters: elev,
                elevationFormatted: formatElevation(elev),
                elevationFeet: (elev * 3.28084).toFixed(1) + ' ft',
                resolution: resolution ? `±${resolution.toFixed(0)}m` : 'N/A',
              },
              overlays: [marker],
            });

            options.onStatusChange(
              `Elevation: ${formatElevation(elev)} — click another point`
            );
          } else {
            marker.setMap(null);
            options.onStatusChange(
              `Elevation lookup failed (${status}). Try another point.`
            );
          }
        }
      );
    },

    getCursor() {
      return 'crosshair';
    },
  };
}