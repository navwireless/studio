
import type { PointCoordinates, AnalysisParams, ElevationSampleAPI, LOSPoint, AnalysisResult } from '@/types';

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_METERS = EARTH_RADIUS_KM * 1000;

/**
 * Fetches elevation data from Google Elevation API for a path between two points.
 * @param pointA Starting point coordinates.
 * @param pointB Ending point coordinates.
 * @param samples Number of samples along the path.
 * @returns A promise that resolves to an array of elevation samples.
 * @throws Error if API key is not configured, or if API request fails or returns an error status.
 *         The thrown error will always be an `Error` instance with a plain string message.
 */
export async function getGoogleElevationData(
  pointA: PointCoordinates,
  pointB: PointCoordinates,
  samples: number
): Promise<ElevationSampleAPI[]> {
  const GOOGLE_ELEVATION_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const GOOGLE_ELEVATION_API_URL = 'https://maps.googleapis.com/maps/api/elevation/json';

  if (!GOOGLE_ELEVATION_API_KEY) {
    const errorMessage = "Google Elevation API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const path = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
  const url = `${GOOGLE_ELEVATION_API_URL}?path=${path}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); 

    if (!response.ok) {
      let errorDataContent = `Status: ${response.status} ${response.statusText}.`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorDataContent += ` Details: ${String(errorData.message)}`;
        } else if (errorData && errorData.error_message) { 
          errorDataContent += ` Details: ${String(errorData.error_message)}`;
        } else if (errorData) {
          errorDataContent += ` Body: ${String(errorData)}`;
        }
      } catch (parseError) {
        // Failed to parse response body
      }
      const apiErrorMessage = `Google Elevation API request failed. ${errorDataContent}`;
      console.error(apiErrorMessage);
      throw new Error(apiErrorMessage);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      let apiStatusErrorMessage = `API Status: ${data.status}.`;
      if (data.error_message) {
        apiStatusErrorMessage += ` Message: ${String(data.error_message)}`;
      }
      const detailedApiErrorMessage = `Google Elevation API returned an error. ${apiStatusErrorMessage}`;
      console.error(detailedApiErrorMessage);
      throw new Error(detailedApiErrorMessage);
    }
    return data.results as ElevationSampleAPI[];

  } catch (error: unknown) {
    let finalErrorMessage: string;
    if (error instanceof RegExp) {
      finalErrorMessage = `Error fetching elevation data: RegExp /${error.source}/${error.flags}`;
    } else if (error instanceof Error) {
      finalErrorMessage = `Error fetching elevation data: ${String(error.message)}`;
    } else {
      finalErrorMessage = `An unknown error occurred while fetching elevation data: ${String(error)}`;
    }
    console.error("getGoogleElevationData - final catch block:", finalErrorMessage, "Original error (stringified):", String(error));
    throw new Error(finalErrorMessage);
  }
}


/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * @returns Distance in kilometers.
 */
export function calculateDistanceKm(p1: PointCoordinates, p2: PointCoordinates): number {
  const R = EARTH_RADIUS_KM;
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  const lat1Rad = p1.lat * Math.PI / 180;
  const lat2Rad = p2.lat * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the Earth's curvature drop at a specific point along a path.
 * @param totalPathDistanceKm Total distance of the LOS path in kilometers.
 * @param distanceFromStartKm Distance of the current point from the start of the path in kilometers.
 * @returns Earth curvature drop in meters.
 */
function calculateEarthCurvatureDropMeters(totalPathDistanceKm: number, distanceFromStartKm: number): number {
  const totalPathDistanceM = totalPathDistanceKm * 1000;
  const distanceFromStartM = distanceFromStartKm * 1000;
  const distanceToEndM = totalPathDistanceM - distanceFromStartM;
  if (distanceFromStartM < 0 || distanceToEndM < 0) return 0;

  const h_drop = (distanceFromStartM * distanceToEndM) / (2 * EARTH_RADIUS_METERS);
  return h_drop;
}

/**
 * Calculates the radius of the first Fresnel zone.
 * @param d1 Distance from transmitter to point in km.
 * @param d2 Distance from receiver to point in km.
 * @param totalDistance Total distance between transmitter and receiver in km.
 * @param frequencyGHz Frequency in GHz.
 * @returns Fresnel zone radius in meters.
 */
export function calculateFresnelZoneRadius(d1: number, d2: number, totalDistance: number, frequencyGHz: number): number {
  if (totalDistance === 0 || frequencyGHz === 0) return 0;
  const lambdaMeters = 0.3 / frequencyGHz; // Wavelength in meters (speed of light c approx 3x10^8 m/s)

  const d1_m = d1 * 1000;
  const d2_m = d2 * 1000;
  const totalDistance_m = totalDistance * 1000;

  if (totalDistance_m === 0) return 0;

  const fresnelRadius = Math.sqrt((lambdaMeters * d1_m * d2_m) / totalDistance_m);
  return fresnelRadius; // Meters
}


export function analyzeLOS(params: AnalysisParams, elevationData: ElevationSampleAPI[]): Omit<AnalysisResult, 'id' | 'timestamp'> {
  try {
    if (elevationData.length < 2) {
      return {
        losPossible: false,
        distanceKm: 0,
        minClearance: null,
        additionalHeightNeeded: null,
        profile: [],
        message: "Insufficient elevation data for analysis.",
        pointA: params.pointA,
        pointB: params.pointB,
        clearanceThresholdUsed: params.clearanceThreshold,
      };
    }

    const totalDistanceKm = calculateDistanceKm(params.pointA, params.pointB);

    const elevationAtA = elevationData[0].elevation;
    const elevationAtB = elevationData[elevationData.length - 1].elevation;

    const heightA_actual = elevationAtA + params.pointA.towerHeight;
    const heightB_actual = elevationAtB + params.pointB.towerHeight;

    const profile: LOSPoint[] = [];
    let minClearance: number | null = null;

    const numSamples = elevationData.length;
    const segmentDistanceKm = totalDistanceKm / (numSamples > 1 ? numSamples - 1 : 1);

    for (let i = 0; i < numSamples; i++) {
      const sample = elevationData[i];
      const distanceFromA_Km = i * segmentDistanceKm;

      const terrainElevation = sample.elevation;
      const fractionAlongPath = totalDistanceKm > 0 ? distanceFromA_Km / totalDistanceKm : 0;
      const idealLosHeight = heightA_actual + fractionAlongPath * (heightB_actual - heightA_actual);
      const curvatureDrop = calculateEarthCurvatureDropMeters(totalPathDistanceKm, distanceFromA_Km);
      const correctedLosHeight = idealLosHeight - curvatureDrop;
      const clearance = correctedLosHeight - terrainElevation;

      profile.push({
        distance: parseFloat(distanceFromA_Km.toFixed(3)),
        terrainElevation: parseFloat(terrainElevation.toFixed(2)),
        losHeight: parseFloat(correctedLosHeight.toFixed(2)),
        clearance: parseFloat(clearance.toFixed(2)),
      });

      if (minClearance === null || clearance < minClearance) {
        minClearance = clearance;
      }
    }

    const losPossible = minClearance !== null && minClearance >= params.clearanceThreshold;
    let additionalHeightNeeded: number | null = null;

    if (!losPossible && minClearance !== null) {
      additionalHeightNeeded = params.clearanceThreshold - minClearance;
    }

    return {
      losPossible,
      distanceKm: parseFloat(totalDistanceKm.toFixed(2)),
      minClearance: minClearance !== null ? parseFloat(minClearance.toFixed(2)) : null,
      additionalHeightNeeded: additionalHeightNeeded !== null ? parseFloat(additionalHeightNeeded.toFixed(2)) : null,
      profile,
      message: "Analysis complete.",
      pointA: params.pointA,
      pointB: params.pointB,
      clearanceThresholdUsed: params.clearanceThreshold,
    };
  } catch (error: unknown) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = `Error in analyzeLOS: ${String(error.message)}`;
    } else if (error instanceof RegExp) {
      errorMessage = `Error in analyzeLOS: RegExp /${error.source}/${error.flags}`;
    } else {
      errorMessage = `An unknown error occurred in analyzeLOS: ${String(error)}`;
    }
    console.error(errorMessage, "Original error (stringified):", String(error));
    // Re-throw as a standard Error with a plain string message
    throw new Error(errorMessage);
  }
}

    