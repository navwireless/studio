
import type { PointCoordinates, AnalysisParams, ElevationSampleAPI, LOSPoint, AnalysisResult } from '@/types';

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_METERS = EARTH_RADIUS_KM * 1000;

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
  // Ensure d1 and d2 are in meters for the formula if totalDistance is in meters
  // Formula expects d1, d2, and (d1+d2) in same units. If totalDistance is km, then d1, d2 in km.
  // Original formula: F_n = sqrt(n * lambda * d1 * d2 / (d1 + d2))
  // For F1 (n=1): F1 = sqrt(lambda * d1_km * d2_km / (d1_km + d2_km)) -- result will be in sqrt(m*km) -> needs adjustment
  // Let's use the common practical formula: R = 8.657 * sqrt( (d1_km * d2_km) / (frequency_GHz * total_distance_km) )
  // where d1 is distance from one end, d2 is distance from other end. d1+d2 = total_distance_km
  
  // Using the simpler formula for first Fresnel zone (n=1):
  // F1 (meters) = 17.32 * sqrt( (d1_km * d2_km) / (frequency_GHz * total_distance_km) )
  // This is equivalent to: F_n = sqrt( (n * c * d1 * d2) / (f * (d1+d2)) )
  // where c is speed of light, f is frequency in Hz.
  // A more direct one from Wikipedia: Fn = sqrt(n * lambda * d1 * d2 / (d1 + d2))
  // d1, d2, (d1+d2) should be in meters if lambda is in meters for result in meters.
  
  const d1_m = d1 * 1000;
  const d2_m = d2 * 1000;
  const totalDistance_m = totalDistance * 1000;

  if (totalDistance_m === 0) return 0;

  const fresnelRadius = Math.sqrt((lambdaMeters * d1_m * d2_m) / totalDistance_m);
  return fresnelRadius; // Meters
}


export function analyzeLOS(params: AnalysisParams, elevationData: ElevationSampleAPI[]): AnalysisResult {
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
    const curvatureDrop = calculateEarthCurvatureDropMeters(totalDistanceKm, distanceFromA_Km);
    const correctedLosHeight = idealLosHeight - curvatureDrop;
    const clearance = correctedLosHeight - terrainElevation;

    // Example Fresnel radius calculation (e.g., for 60GHz, at this point)
    // const distanceFromB_Km = totalDistanceKm - distanceFromA_Km;
    // const fresnelRadiusAtPoint = calculateFresnelZoneRadius(distanceFromA_Km, distanceFromB_Km, totalDistanceKm, 60);

    profile.push({
      distance: parseFloat(distanceFromA_Km.toFixed(3)),
      terrainElevation: parseFloat(terrainElevation.toFixed(2)),
      losHeight: parseFloat(correctedLosHeight.toFixed(2)),
      clearance: parseFloat(clearance.toFixed(2)),
      // fresnelRadius: parseFloat(fresnelRadiusAtPoint.toFixed(2)) // If adding to LOSPoint
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
  };
}
