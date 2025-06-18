// src/lib/polyline-decoder.ts
import polyline from '@mapbox/polyline';

/**
 * Decodes an encoded polyline string into an array of [latitude, longitude] coordinate pairs.
 * 
 * @param encodedPolyline The encoded polyline string (e.g., from Google Directions API).
 * @returns An array of [latitude, longitude] pairs. Returns an empty array if decoding fails or input is invalid.
 */
export function decodePolyline(encodedPolyline: string): Array<[number, number]> {
  if (!encodedPolyline || typeof encodedPolyline !== 'string') {
    console.warn("decodePolyline: Invalid or empty encoded polyline string provided.");
    return [];
  }
  try {
    // The @mapbox/polyline library decodes to [latitude, longitude] pairs
    const decodedCoordinates = polyline.decode(encodedPolyline);
    return decodedCoordinates;
  } catch (error) {
    console.error("decodePolyline: Error decoding polyline:", error);
    return [];
  }
}

/**
 * Converts an array of [latitude, longitude] pairs into a KML-compatible coordinates string.
 * KML expects "longitude,latitude,altitude longitude,latitude,altitude ..."
 * Altitude is assumed to be 0 if not provided.
 * 
 * @param coordinates An array of [latitude, longitude] pairs.
 * @returns A KML-compatible coordinates string.
 */
export function formatCoordinatesForKml(coordinates: Array<[number, number]>): string {
  if (!coordinates || coordinates.length === 0) {
    return "";
  }
  return coordinates.map(coord => `${coord[1]},${coord[0]},0`).join(' '); // lng,lat,alt
}
