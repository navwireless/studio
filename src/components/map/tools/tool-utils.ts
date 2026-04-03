// src/components/map/tools/tool-utils.ts
// Phase 11A — Shared utilities for map tools

// ─── Distance Calculation ───────────────────────────────────────────
/**
 * Haversine distance between two LatLng points in meters
 */
export function haversineDistance(
  a: google.maps.LatLng,
  b: google.maps.LatLng
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat() - a.lat());
  const dLng = toRad(b.lng() - a.lng());
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat())) * Math.cos(toRad(b.lat())) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Total distance along a polyline path (array of LatLng) in meters
 */
export function polylineDistance(points: google.maps.LatLng[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(points[i - 1], points[i]);
  }
  return total;
}

// ─── Area Calculation ───────────────────────────────────────────────
/**
 * Spherical excess polygon area in square meters (for convex/simple polygons)
 * Uses the Shoelace formula adapted for spherical coordinates.
 */
export function sphericalPolygonArea(points: google.maps.LatLng[]): number {
  if (points.length < 3) return 0;
  // Use Google's geometry library if available
  if (
    typeof google !== 'undefined' &&
    google.maps.geometry?.spherical?.computeArea
  ) {
    return google.maps.geometry.spherical.computeArea(points);
  }
  // Fallback: planar approximation (less accurate for large areas)
  return planarPolygonArea(points);
}

function planarPolygonArea(points: google.maps.LatLng[]): number {
  const R = 6371000;
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = toRad(points[i].lng()) * R * Math.cos(toRad(points[i].lat()));
    const yi = toRad(points[i].lat()) * R;
    const xj = toRad(points[j].lng()) * R * Math.cos(toRad(points[j].lat()));
    const yj = toRad(points[j].lat()) * R;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2);
}

// ─── Bearing Calculation ────────────────────────────────────────────
/**
 * Initial bearing from point A to point B in degrees (0-360, clockwise from North)
 */
export function calculateBearing(
  from: google.maps.LatLng,
  to: google.maps.LatLng
): number {
  const lat1 = toRad(from.lat());
  const lat2 = toRad(to.lat());
  const dLng = toRad(to.lng() - from.lng());

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

/**
 * Back bearing (reverse direction)
 */
export function calculateBackBearing(
  from: google.maps.LatLng,
  to: google.maps.LatLng
): number {
  return (calculateBearing(from, to) + 180) % 360;
}

/**
 * Compass direction label from bearing degrees
 */
export function bearingToCompass(bearing: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

// ─── Coordinate Format Conversion ───────────────────────────────────
/**
 * Decimal degrees to Degrees/Minutes/Seconds string
 */
export function ddToDMS(lat: number, lng: number): { lat: string; lng: string } {
  return {
    lat: formatDMS(lat, 'lat'),
    lng: formatDMS(lng, 'lng'),
  };
}

function formatDMS(dd: number, type: 'lat' | 'lng'): string {
  const dir = type === 'lat' ? (dd >= 0 ? 'N' : 'S') : dd >= 0 ? 'E' : 'W';
  const abs = Math.abs(dd);
  const d = Math.floor(abs);
  const mFull = (abs - d) * 60;
  const m = Math.floor(mFull);
  const s = ((mFull - m) * 60).toFixed(2);
  return `${d}° ${m}' ${s}" ${dir}`;
}

/**
 * Decimal degrees to UTM string
 */
export function ddToUTM(
  lat: number,
  lng: number
): { zone: string; easting: string; northing: string; full: string } {
  // UTM zone number
  let zoneNumber = Math.floor((lng + 180) / 6) + 1;

  // Special zones for Norway/Svalbard
  if (lat >= 56 && lat < 64 && lng >= 3 && lng < 12) zoneNumber = 32;
  if (lat >= 72 && lat < 84) {
    if (lng >= 0 && lng < 9) zoneNumber = 31;
    else if (lng >= 9 && lng < 21) zoneNumber = 33;
    else if (lng >= 21 && lng < 33) zoneNumber = 35;
    else if (lng >= 33 && lng < 42) zoneNumber = 37;
  }

  const zoneLetter = getUTMLetterDesignator(lat);

  // UTM projection constants
  const a = 6378137; // WGS84 semi-major axis
  const eccSquared = 0.00669438;
  const k0 = 0.9996;

  const lonOrigin = (zoneNumber - 1) * 6 - 180 + 3;
  const eccPrimeSquared = eccSquared / (1 - eccSquared);

  const latRad = toRad(lat);
  const lonRad = toRad(lng);
  const lonOriginRad = toRad(lonOrigin);

  const N = a / Math.sqrt(1 - eccSquared * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = eccPrimeSquared * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lonRad - lonOriginRad);

  const M =
    a *
    ((1 - eccSquared / 4 - (3 * eccSquared * eccSquared) / 64 - (5 * Math.pow(eccSquared, 3)) / 256) * latRad -
      ((3 * eccSquared) / 8 + (3 * eccSquared * eccSquared) / 32 + (45 * Math.pow(eccSquared, 3)) / 1024) * Math.sin(2 * latRad) +
      ((15 * eccSquared * eccSquared) / 256 + (45 * Math.pow(eccSquared, 3)) / 1024) * Math.sin(4 * latRad) -
      ((35 * Math.pow(eccSquared, 3)) / 3072) * Math.sin(6 * latRad));

  const easting =
    k0 *
    N *
    (A +
      ((1 - T + C) * Math.pow(A, 3)) / 6 +
      ((5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * Math.pow(A, 5)) / 120) +
    500000;

  let northing =
    k0 *
    (M +
      N *
      Math.tan(latRad) *
      ((A * A) / 2 +
        ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
        ((61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * Math.pow(A, 6)) / 720));

  if (lat < 0) northing += 10000000;

  const zone = `${zoneNumber}${zoneLetter}`;
  const eastingStr = `${Math.round(easting)}m E`;
  const northingStr = `${Math.round(northing)}m N`;

  return {
    zone,
    easting: eastingStr,
    northing: northingStr,
    full: `${zone} ${eastingStr} ${northingStr}`,
  };
}

function getUTMLetterDesignator(lat: number): string {
  if (lat >= 72) return 'X';
  if (lat >= 64) return 'W';
  if (lat >= 56) return 'V';
  if (lat >= 48) return 'U';
  if (lat >= 40) return 'T';
  if (lat >= 32) return 'S';
  if (lat >= 24) return 'R';
  if (lat >= 16) return 'Q';
  if (lat >= 8) return 'P';
  if (lat >= 0) return 'N';
  if (lat >= -8) return 'M';
  if (lat >= -16) return 'L';
  if (lat >= -24) return 'K';
  if (lat >= -32) return 'J';
  if (lat >= -40) return 'H';
  if (lat >= -48) return 'G';
  if (lat >= -56) return 'F';
  if (lat >= -64) return 'E';
  if (lat >= -72) return 'D';
  return 'C';
}

// ─── Formatting Helpers ─────────────────────────────────────────────
/**
 * Format distance for display (auto-selects m or km)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  }
  return `${(meters / 1000).toFixed(3)} km`;
}

/**
 * Format area for display (auto-selects m² or km²)
 */
export function formatArea(sqMeters: number): string {
  if (sqMeters < 1_000_000) {
    return `${sqMeters.toFixed(1)} m²`;
  }
  return `${(sqMeters / 1_000_000).toFixed(4)} km²`;
}

/**
 * Format elevation for display
 */
export function formatElevation(meters: number): string {
  return `${meters.toFixed(1)} m`;
}

/**
 * Format bearing for display
 */
export function formatBearing(degrees: number): string {
  return `${degrees.toFixed(2)}°`;
}

/**
 * Format coordinates as decimal degrees
 */
export function formatDD(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

// ─── Color Helpers ──────────────────────────────────────────────────
/** Tool overlay colors — semi-transparent for map visibility */
export const TOOL_COLORS = {
  distance: { stroke: '#0066FF', fill: 'rgba(0, 102, 255, 0.1)' },
  area: { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.15)' },
  pin: { stroke: '#F59E0B', fill: '#F59E0B' },
  elevation: { stroke: '#10B981', fill: '#10B981' },
  coords: { stroke: '#06B6D4', fill: '#06B6D4' },
  range: { stroke: '#F97316', fill: 'rgba(249, 115, 22, 0.1)' },
  terrain: { stroke: '#EC4899', fill: 'rgba(236, 72, 153, 0.1)' },
  grid: { stroke: 'rgba(255, 255, 255, 0.15)', fill: 'transparent' },
  bearing: { stroke: '#EF4444', fill: 'rgba(239, 68, 68, 0.1)' },
} as const;

/** Marker label counter for drop-pin tool */
let pinCounter = 0;
export function getNextPinLabel(): string {
  pinCounter++;
  return pinCounter <= 26
    ? String.fromCharCode(64 + pinCounter) // A-Z
    : `P${pinCounter}`;
}
export function resetPinCounter(): void {
  pinCounter = 0;
}

// ─── Map Overlay Cleanup ────────────────────────────────────────────
/**
 * Remove all overlays from map and clear the array
 */
export function cleanupOverlays(overlays: google.maps.MVCObject[]): void {
  overlays.forEach((overlay) => {
    if ('setMap' in overlay && typeof (overlay as google.maps.Marker).setMap === 'function') {
      (overlay as google.maps.Marker).setMap(null);
    }
  });
  overlays.length = 0;
}

// ─── Interpolation Helper ───────────────────────────────────────────
/**
 * Interpolate N points along a great-circle path between two LatLng points
 */
export function interpolatePoints(
  from: google.maps.LatLng,
  to: google.maps.LatLng,
  numPoints: number
): google.maps.LatLng[] {
  const points: google.maps.LatLng[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const fraction = i / numPoints;
    const lat = from.lat() + (to.lat() - from.lat()) * fraction;
    const lng = from.lng() + (to.lng() - from.lng()) * fraction;
    points.push(new google.maps.LatLng(lat, lng));
  }
  return points;
}

// ─── Private Helpers ────────────────────────────────────────────────
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}
// ─── Vertex Marker (used by multi-click tools) ─────────────────────
export function createVertexMarker(
  position: google.maps.LatLng,
  map: google.maps.Map,
  color: string,
  label?: string
): google.maps.Marker {
  return new google.maps.Marker({
    position,
    map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: label ? 8 : 5,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    },
    label: label
      ? { text: label, color: '#ffffff', fontSize: '10px', fontWeight: 'bold' }
      : undefined,
    clickable: false,
    zIndex: 10,
  });
}

// ─── Midpoint helper ────────────────────────────────────────────────
export function midpoint(a: google.maps.LatLng, b: google.maps.LatLng): google.maps.LatLng {
  return new google.maps.LatLng(
    (a.lat() + b.lat()) / 2,
    (a.lng() + b.lng()) / 2
  );
}

// ─── Coordinate Format Auto-Detection (Phase 12A) ──────────────────

export interface ParsedCoordinate {
  lat: number;
  lng: number;
  format: 'dd' | 'dms' | 'utm' | 'unknown';
}

export function parseCoordinateInput(input: string): ParsedCoordinate | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const ddResult = tryParseDD(trimmed);
  if (ddResult) return ddResult;

  const dmsResult = tryParseDMS(trimmed);
  if (dmsResult) return dmsResult;

  return null;
}

function tryParseDD(input: string): ParsedCoordinate | null {
  const ddPattern = /^([+-]?\d{1,3}(?:\.\d+)?)\s*[,\s]\s*([+-]?\d{1,3}(?:\.\d+)?)$/;
  const match = input.match(ddPattern);

  if (!match) return null;

  const a = parseFloat(match[1]);
  const b = parseFloat(match[2]);

  if (isNaN(a) || isNaN(b)) return null;

  let lat: number;
  let lng: number;

  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
    lat = a;
    lng = b;
  } else if (Math.abs(b) <= 90 && Math.abs(a) <= 180) {
    lat = b;
    lng = a;
  } else {
    return null;
  }

  return { lat, lng, format: 'dd' };
}

function tryParseDMS(input: string): ParsedCoordinate | null {
  const normalized = input
    .replace(/[°º]/g, ' ')
    .replace(/[''′]/g, ' ')
    .replace(/[""″]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const dmsPattern =
    /^(\d{1,3})\s+(\d{1,2})\s+(\d{1,2}(?:\.\d+)?)\s*([NSns])\s*[,\s]?\s*(\d{1,3})\s+(\d{1,2})\s+(\d{1,2}(?:\.\d+)?)\s*([EWew])$/;

  const match = normalized.match(dmsPattern);
  if (!match) {
    const reversedPattern =
      /^(\d{1,3})\s+(\d{1,2})\s+(\d{1,2}(?:\.\d+)?)\s*([EWew])\s*[,\s]?\s*(\d{1,3})\s+(\d{1,2})\s+(\d{1,2}(?:\.\d+)?)\s*([NSns])$/;

    const revMatch = normalized.match(reversedPattern);
    if (!revMatch) return null;

    const lng = dmsPartsToDecimal(
      parseInt(revMatch[1]),
      parseInt(revMatch[2]),
      parseFloat(revMatch[3]),
      revMatch[4].toUpperCase()
    );
    const lat = dmsPartsToDecimal(
      parseInt(revMatch[5]),
      parseInt(revMatch[6]),
      parseFloat(revMatch[7]),
      revMatch[8].toUpperCase()
    );

    if (lat === null || lng === null) return null;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

    return { lat, lng, format: 'dms' };
  }

  const lat = dmsPartsToDecimal(
    parseInt(match[1]),
    parseInt(match[2]),
    parseFloat(match[3]),
    match[4].toUpperCase()
  );
  const lng = dmsPartsToDecimal(
    parseInt(match[5]),
    parseInt(match[6]),
    parseFloat(match[7]),
    match[8].toUpperCase()
  );

  if (lat === null || lng === null) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return { lat, lng, format: 'dms' };
}

function dmsPartsToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
  direction: string
): number | null {
  if (minutes < 0 || minutes >= 60) return null;
  if (seconds < 0 || seconds >= 60) return null;

  let decimal = degrees + minutes / 60 + seconds / 3600;

  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }

  return decimal;
}

export function isValidLatLng(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}