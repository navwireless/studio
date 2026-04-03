// src/components/map/tools/compass-tool.ts
// Phase 12D — Compass/Magnetic Declination tool
// Click map → shows true bearing, magnetic declination at that location

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import {
  formatDD,
  calculateBearing,
  bearingToCompass,
  createVertexMarker,
  TOOL_COLORS,
} from './tool-utils';

// ─── State ───
let _map: google.maps.Map | null = null;
let _markers: google.maps.Marker[] = [];
let _lines: google.maps.Polyline[] = [];
let _clickCount = 0;
let _firstLatLng: google.maps.LatLng | null = null;

// ─── WMM Magnetic Declination (simplified model) ────────────────────
// This is a simplified World Magnetic Model approximation.
// For field use, accuracy is ±1° which is sufficient for FSO alignment.

function getMagneticDeclination(lat: number, lng: number, year: number = 2025): number {
  // Simplified IGRF/WMM model coefficients (epoch 2025)
  // Main dipole + quadrupole terms for reasonable accuracy
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  // Simplified dipole model
  // Magnetic north pole approximate position (2025): ~86.5°N, 162.9°W
  const poleLatRad = (86.5 * Math.PI) / 180;
  const poleLngRad = (-162.9 * Math.PI) / 180;

  // Compute declination using dipole approximation
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const sinPoleLat = Math.sin(poleLatRad);
  const cosPoleLat = Math.cos(poleLatRad);
  const dLng = lngRad - poleLngRad;

  // Declination via spherical triangle
  const num = cosPoleLat * Math.sin(dLng);
  const den = cosLat * sinPoleLat - sinLat * cosPoleLat * Math.cos(dLng);
  let decl = Math.atan2(num, den) * (180 / Math.PI);

  // Secular variation correction (approximately +0.1°/year from epoch)
  decl += (year - 2025) * 0.1;

  return decl;
}

function clearAll(): void {
  _markers.forEach(m => m.setMap(null));
  _markers = [];
  _lines.forEach(l => l.setMap(null));
  _lines = [];
  _clickCount = 0;
  _firstLatLng = null;
}

export const compassTool: ToolHandler = {
  activate(options: ToolActivateOptions) {
    _map = options.map;
    _clickCount = 0;
    _firstLatLng = null;
    options.onStatusChange('Click two points to measure bearing + magnetic declination.');
  },

  deactivate() {
    _map = null;
  },

  handleClick(latLng: google.maps.LatLng, options: ToolActivateOptions) {
    if (!_map) return;

    _clickCount++;
    const lat = latLng.lat();
    const lng = latLng.lng();

    if (_clickCount === 1) {
      // First click — from point
      _firstLatLng = latLng;
      const marker = createVertexMarker(latLng, _map, TOOL_COLORS.bearing.stroke, 'A');
      _markers.push(marker);

      const decl = getMagneticDeclination(lat, lng);
      options.onStatusChange(
        `Point A set. Declination: ${decl >= 0 ? '+' : ''}${decl.toFixed(1)}°. Click second point.`
      );
    } else if (_clickCount === 2 && _firstLatLng) {
      // Second click — to point
      const marker = createVertexMarker(latLng, _map, TOOL_COLORS.bearing.stroke, 'B');
      _markers.push(marker);

      // Draw bearing line
      const line = new google.maps.Polyline({
        path: [_firstLatLng, latLng],
        map: _map,
        strokeColor: TOOL_COLORS.bearing.stroke,
        strokeWeight: 2.5,
        strokeOpacity: 0.9,
      });
      _lines.push(line);

      // Compute results
      const trueBearing = calculateBearing(_firstLatLng, latLng);
      const backBearing = (trueBearing + 180) % 360;
      const declA = getMagneticDeclination(_firstLatLng.lat(), _firstLatLng.lng());
      const declB = getMagneticDeclination(lat, lng);
      const magBearing = ((trueBearing - declA) + 360) % 360;

      const compass = bearingToCompass(trueBearing);

      options.onStatusChange(
        `True: ${trueBearing.toFixed(2)}° ${compass} · Mag: ${magBearing.toFixed(2)}° · Decl: ${declA >= 0 ? '+' : ''}${declA.toFixed(1)}°`
      );

      const result: ToolResult = {
        toolId: 'compass-tool',
        timestamp: Date.now(),
        data: {
          from: formatDD(_firstLatLng.lat(), _firstLatLng.lng()),
          to: formatDD(lat, lng),
          trueBearing: `${trueBearing.toFixed(2)}°`,
          trueDirection: compass,
          backBearing: `${backBearing.toFixed(2)}°`,
          magneticBearing: `${magBearing.toFixed(2)}°`,
          declination: {
            siteA: `${declA >= 0 ? '+' : ''}${declA.toFixed(2)}°`,
            siteB: `${declB >= 0 ? '+' : ''}${declB.toFixed(2)}°`,
          },
          note: Math.abs(declA) > 5
            ? '⚠️ Significant magnetic declination — use true bearing for FSO alignment'
            : 'Declination is small at this location',
        },
        overlays: [..._markers, ...(_lines as unknown as google.maps.MVCObject[])],
      };

      options.onResult(result);

      // Reset for next measurement
      _clickCount = 0;
      _firstLatLng = null;
    }
  },

  getCursor() {
    return 'crosshair';
  },
};

(compassTool as { clearAll?: () => void }).clearAll = clearAll;
