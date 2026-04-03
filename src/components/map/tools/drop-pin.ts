// src/components/map/tools/drop-pin.ts
// Phase 11B — Place a labeled marker with coordinates

import type { ToolHandler } from '@/types/map-tools';
import {
  formatDD,
  ddToDMS,
  ddToUTM,
  getNextPinLabel,
  TOOL_COLORS,
} from './tool-utils';

export function createDropPinHandler(): ToolHandler {
  return {
    activate(options) {
      options.onStatusChange('Click map to drop a pin.');
    },

    deactivate() {
      // Don't clean up — pins are persistent results
    },

    handleClick(latLng, options) {
      const label = getNextPinLabel();
      const lat = latLng.lat();
      const lng = latLng.lng();

      const marker = new google.maps.Marker({
        position: latLng,
        map: options.map,
        icon: {
          path: 'M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9zm0 12.75c-2.07 0-3.75-1.68-3.75-3.75S9.93 5.25 12 5.25 15.75 6.93 15.75 9 14.07 12.75 12 12.75z',
          fillColor: TOOL_COLORS.pin.fill,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1,
          scale: 1.5,
          anchor: new google.maps.Point(12, 24),
          labelOrigin: new google.maps.Point(12, 9),
        },
        label: {
          text: label,
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: 'bold',
        },
        zIndex: 15,
        title: `Pin ${label}: ${formatDD(lat, lng)}`,
      });

      const dms = ddToDMS(lat, lng);
      const utm = ddToUTM(lat, lng);

      options.onResult({
        toolId: 'drop-pin',
        timestamp: Date.now(),
        data: {
          label,
          lat,
          lng,
          dd: formatDD(lat, lng),
          dms,
          utm,
        },
        overlays: [marker],
      });

      options.onStatusChange(`Pin ${label} placed. Click to drop another.`);
    },

    getCursor() {
      return 'crosshair';
    },
  };
}