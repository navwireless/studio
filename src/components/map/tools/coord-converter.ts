// src/components/map/tools/coord-converter.ts
// Phase 11B — Click to show coordinates in DD, DMS, UTM formats

import type { ToolHandler } from '@/types/map-tools';
import {
  formatDD,
  ddToDMS,
  ddToUTM,
  createVertexMarker,
  TOOL_COLORS,
} from './tool-utils';

export function createCoordConverterHandler(): ToolHandler {
  return {
    activate(options) {
      options.onStatusChange('Click any point to see coordinates in all formats.');
    },

    deactivate() {},

    handleClick(latLng, options) {
      const lat = latLng.lat();
      const lng = latLng.lng();
      const dd = formatDD(lat, lng);
      const dms = ddToDMS(lat, lng);
      const utm = ddToUTM(lat, lng);

      const marker = createVertexMarker(
        latLng,
        options.map,
        TOOL_COLORS.coords.stroke
      );

      options.onResult({
        toolId: 'coord-converter',
        timestamp: Date.now(),
        data: { lat, lng, dd, dms, utm },
        overlays: [marker],
      });

      options.onStatusChange(`${dd} — click another point`);
    },

    getCursor() {
      return 'crosshair';
    },
  };
}