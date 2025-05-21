import type { PointCoordinates, AnalysisParams, ElevationSampleAPI, LOSPoint, AnalysisResult } from '@/types';

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_METERS = EARTH_RADIUS_KM * 1000;

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula.
 * @returns Distance in kilometers.
 */
export function calculateDistanceKm(p1: PointCoordinates, p2: PointCoordinates): number {
  const R = EARTH_RADIUS_KM; // Radius of the Earth in km
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
  // Convert distances to meters for consistency with Earth radius in meters
  const totalPathDistanceM = totalPathDistanceKm * 1000;
  const distanceFromStartM = distanceFromStartKm * 1000;
  
  // Simplified formula: h_drop = (d1 * d2) / (2 * R)
  // where d1 is distance from start, d2 is distance to end
  const distanceToEndM = totalPathDistanceM - distanceFromStartM;
  if (distanceFromStartM < 0 || distanceToEndM < 0) return 0; // Should not happen with correct inputs
  
  const h_drop = (distanceFromStartM * distanceToEndM) / (2 * EARTH_RADIUS_METERS);
  return h_drop;
}

/**
 * Analyzes Line-of-Sight (LOS) based on elevation data, tower heights, and clearance threshold.
 * Assumes elevationData samples are evenly spaced along the great circle path.
 */
export function analyzeLOS(params: AnalysisParams, elevationData: ElevationSampleAPI[]): AnalysisResult {
  if (elevationData.length < 2) {
    return {
      losPossible: false,
      distanceKm: 0,
      minClearance: null,
      additionalHeightNeeded: null,
      profile: [],
      message: "Insufficient elevation data for analysis.",
      pointA: params.pointA, // Pass through pointA for context even in error
      pointB: params.pointB, // Pass through pointB for context even in error
    };
  }

  const totalDistanceKm = calculateDistanceKm(params.pointA, params.pointB);
  
  const elevationAtA = elevationData[0].elevation;
  const elevationAtB = elevationData[elevationData.length - 1].elevation;

  const heightA_actual = elevationAtA + params.pointA.towerHeight; // Total height at A from sea level
  const heightB_actual = elevationAtB + params.pointB.towerHeight; // Total height at B from sea level

  const profile: LOSPoint[] = [];
  let minClearance: number | null = null;

  const numSamples = elevationData.length;
  const segmentDistanceKm = totalDistanceKm / (numSamples > 1 ? numSamples - 1 : 1);

  for (let i = 0; i < numSamples; i++) {
    const sample = elevationData[i];
    const distanceFromA_Km = i * segmentDistanceKm;
    
    const terrainElevation = sample.elevation;

    // Ideal LOS height (straight line between tower tops)
    const fractionAlongPath = totalDistanceKm > 0 ? distanceFromA_Km / totalDistanceKm : 0;
    const idealLosHeight = heightA_actual + fractionAlongPath * (heightB_actual - heightA_actual);

    // Earth curvature correction
    const curvatureDrop = calculateEarthCurvatureDropMeters(totalDistanceKm, distanceFromA_Km);
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
  };
}

