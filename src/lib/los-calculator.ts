// src/lib/los-calculator.ts

/**
 * Line-of-Sight (LOS) Feasibility Calculator
 *
 * Calculates whether a clear geometric line of sight exists between two
 * geographic points considering terrain elevation, tower heights, and
 * Earth curvature.
 *
 * This tool is designed for Free Space Optical (FSO) laser communication
 * links (e.g., OpticSpectra 1550nm devices). Since laser beams travel in
 * straight lines without atmospheric refraction bending, we calculate
 * pure geometric LOS — no K-factor or Fresnel zone corrections.
 *
 * The core question: Can a straight line from the top of Tower A to the
 * top of Tower B clear all terrain obstacles in between?
 *
 * @module lib/los-calculator
 */

import type {
  PointCoordinates,
  AnalysisParams,
  ElevationSampleAPI,
  LOSPoint,
  AnalysisResult,
} from '@/types';
import { buildDeviceCompatibilityData } from '@/config/devices';

// ============================================
// Constants
// ============================================

/** Mean Earth radius in kilometers */
const EARTH_RADIUS_KM = 6371;

/** Mean Earth radius in meters */
const EARTH_RADIUS_METERS = EARTH_RADIUS_KM * 1000;

// ============================================
// Input Validation
// ============================================

/**
 * Validates geographic coordinates are within valid ranges.
 * @param point - The point to validate
 * @param label - Label for error messages (e.g., "Point A")
 * @throws Error if coordinates are invalid
 */
function validateCoordinates(point: PointCoordinates, label: string): void {
  if (typeof point.lat !== 'number' || isNaN(point.lat)) {
    throw new Error(`${label}: Latitude must be a valid number.`);
  }
  if (typeof point.lng !== 'number' || isNaN(point.lng)) {
    throw new Error(`${label}: Longitude must be a valid number.`);
  }
  if (point.lat < -90 || point.lat > 90) {
    throw new Error(`${label}: Latitude must be between -90 and 90 degrees. Got ${point.lat}.`);
  }
  if (point.lng < -180 || point.lng > 180) {
    throw new Error(`${label}: Longitude must be between -180 and 180 degrees. Got ${point.lng}.`);
  }
}

/**
 * Validates tower height is within reasonable bounds.
 * @param height - Tower height in meters
 * @param label - Label for error messages
 * @throws Error if tower height is invalid
 */
function validateTowerHeight(height: number, label: string): void {
  if (typeof height !== 'number' || isNaN(height)) {
    throw new Error(`${label}: Tower height must be a valid number.`);
  }
  if (height < 0) {
    throw new Error(`${label}: Tower height cannot be negative. Got ${height}m.`);
  }
  if (height > 500) {
    throw new Error(`${label}: Tower height exceeds maximum of 500m. Got ${height}m.`);
  }
}

// ============================================
// Core Calculation Functions
// ============================================

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 *
 * @param p1 - First geographic point
 * @param p2 - Second geographic point
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(p1: PointCoordinates, p2: PointCoordinates): number {
  const R = EARTH_RADIUS_KM;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1Rad = (p1.lat * Math.PI) / 180;
  const lat2Rad = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the Earth curvature drop at a point along the path.
 *
 * On a curved Earth, the terrain between two points "bulges up" relative
 * to a straight line drawn between them. This function calculates how much
 * higher the Earth's surface is at a given point compared to the straight
 * line connecting the two endpoints.
 *
 * Formula: h = (d1 × d2) / (2 × R)
 * where d1 = distance from start (meters), d2 = distance to end (meters),
 * R = Earth radius (meters).
 *
 * No K-factor is applied because laser beams (1550nm) travel in straight
 * lines — they do not bend with atmospheric refraction like RF signals.
 *
 * @param distanceFromStartM - Distance from path start in meters
 * @param distanceToEndM - Distance to path end in meters
 * @returns Earth curvature drop in meters (always >= 0)
 */
function calculateEarthCurvatureDrop(
  distanceFromStartM: number,
  distanceToEndM: number
): number {
  if (distanceFromStartM <= 0 || distanceToEndM <= 0) return 0;
  return (distanceFromStartM * distanceToEndM) / (2 * EARTH_RADIUS_METERS);
}

// ============================================
// Main Analysis Function
// ============================================

/**
 * Performs a complete Line-of-Sight feasibility analysis between two points.
 *
 * Steps:
 * 1. Validates all inputs (coordinates, tower heights, clearance threshold)
 * 2. Calculates great-circle distance between points
 * 3. For each elevation sample along the path:
 *    - Computes the geometric straight-line LOS height at that point
 *    - Subtracts Earth curvature drop (terrain bulges up relative to straight line)
 *    - Calculates clearance (LOS height minus terrain elevation)
 * 4. Determines feasibility: is minimum clearance >= threshold?
 * 5. If blocked, calculates how much additional tower height is needed
 * 6. Computes device compatibility for all OpticSpectra FSO devices
 *
 * @param params - Analysis parameters (points, tower heights, clearance threshold)
 * @param elevationData - Elevation samples along the path from Google Elevation API
 * @param selectedDeviceId - Optional device ID for device-specific compatibility
 * @returns Analysis result (without id and timestamp — added by server action)
 */
export function analyzeLOS(
  params: AnalysisParams,
  elevationData: ElevationSampleAPI[],
  selectedDeviceId?: string
): Omit<AnalysisResult, 'id' | 'timestamp'> {
  // ── Input validation ──
  validateCoordinates(params.pointA, 'Point A');
  validateCoordinates(params.pointB, 'Point B');
  validateTowerHeight(params.pointA.towerHeight, 'Point A');
  validateTowerHeight(params.pointB.towerHeight, 'Point B');

  if (params.clearanceThreshold < 0) {
    throw new Error('Clearance threshold cannot be negative.');
  }

  // ── Handle insufficient elevation data ──
  if (elevationData.length < 2) {
    return {
      losPossible: false,
      distanceKm: 0,
      minClearance: null,
      additionalHeightNeeded: null,
      profile: [],
      message: 'Insufficient elevation data for analysis.',
      pointA: params.pointA,
      pointB: params.pointB,
      clearanceThresholdUsed: params.clearanceThreshold,
    };
  }

  // ── Calculate total path distance ──
  const totalDistanceKm = calculateDistanceKm(params.pointA, params.pointB);
  const totalDistanceMeters = totalDistanceKm * 1000;

  // ── Handle zero/near-zero distance (same point) ──
  if (totalDistanceKm < 0.001) {
    const elevation = elevationData[0].elevation;
    const clearance = params.pointA.towerHeight;
    const profile: LOSPoint[] = [
      {
        distance: 0,
        terrainElevation: round2(elevation),
        losHeight: round2(elevation + params.pointA.towerHeight),
        clearance: round2(clearance),
      },
    ];

    const deviceCompatibility = buildDeviceCompatibilityData(
      totalDistanceMeters,
      true,
      selectedDeviceId
    );

    return {
      losPossible: true,
      distanceKm: round2(totalDistanceKm),
      minClearance: round2(clearance),
      additionalHeightNeeded: null,
      profile,
      message: 'Points are at the same location. LOS is inherently clear.',
      pointA: params.pointA,
      pointB: params.pointB,
      clearanceThresholdUsed: params.clearanceThreshold,
      selectedDeviceId,
      deviceCompatibility,
    };
  }

  // ── Warn for very long distances ──
  if (totalDistanceKm > 50) {
    console.warn(
      `LOS Calculator: Long distance (${totalDistanceKm.toFixed(1)}km). ` +
        'Elevation data resolution may affect accuracy at this range.'
    );
  }

  // ── Tower top absolute elevations ──
  const elevationAtA = elevationData[0].elevation;
  const elevationAtB = elevationData[elevationData.length - 1].elevation;
  const heightA_absolute = elevationAtA + params.pointA.towerHeight;
  const heightB_absolute = elevationAtB + params.pointB.towerHeight;

  // ── Build elevation profile with LOS analysis ──
  const profile: LOSPoint[] = [];
  let minClearance: number | null = null;

  const numSamples = elevationData.length;
  const segmentDistanceKm = totalDistanceKm / (numSamples > 1 ? numSamples - 1 : 1);

  for (let i = 0; i < numSamples; i++) {
    const sample = elevationData[i];
    const distanceFromAKm = i * segmentDistanceKm;
    const distanceFromBKm = totalDistanceKm - distanceFromAKm;

    // Terrain elevation at this sample point
    const terrainElevation = sample.elevation;

    // Geometric LOS line — straight line interpolation between tower tops
    const fractionAlongPath = totalDistanceKm > 0 ? distanceFromAKm / totalDistanceKm : 0;
    const geometricLosHeight = heightA_absolute + fractionAlongPath * (heightB_absolute - heightA_absolute);

    // Earth curvature compensation — terrain bulges up relative to straight line
    const distFromAMeters = distanceFromAKm * 1000;
    const distFromBMeters = distanceFromBKm * 1000;
    const curvatureDrop = calculateEarthCurvatureDrop(distFromAMeters, distFromBMeters);

    // Corrected LOS height (the straight laser line appears "lower" relative to
    // the curved Earth surface, so we subtract the curvature bulge)
    const correctedLosHeight = geometricLosHeight - curvatureDrop;

    // Clearance = how far the LOS line is above the terrain
    const clearance = correctedLosHeight - terrainElevation;

    profile.push({
      distance: round3(distanceFromAKm),
      terrainElevation: round2(terrainElevation),
      losHeight: round2(correctedLosHeight),
      clearance: round2(clearance),
    });

    if (minClearance === null || clearance < minClearance) {
      minClearance = clearance;
    }
  }

  // ── Determine feasibility ──
  const losPossible = minClearance !== null && minClearance >= params.clearanceThreshold;

  // ── Calculate additional height needed if not feasible ──
  let additionalHeightNeeded: number | null = null;
  if (!losPossible && minClearance !== null) {
    const needed = params.clearanceThreshold - minClearance;
    additionalHeightNeeded = round2(needed > 0 ? needed : 0);
  }

  // ── Device compatibility analysis ──
  const deviceCompatibility = buildDeviceCompatibilityData(
    totalDistanceMeters,
    losPossible,
    selectedDeviceId
  );

  // ── Build result message ──
  let message = 'Analysis complete.';
  if (losPossible) {
    message = `LOS is feasible with ${round2(minClearance!)}m minimum clearance (threshold: ${params.clearanceThreshold}m).`;
  } else if (minClearance !== null && minClearance > 0) {
    message = `LOS clearance of ${round2(minClearance)}m is below the ${params.clearanceThreshold}m threshold. Additional ${round2(additionalHeightNeeded!)}m tower height needed.`;
  } else if (minClearance !== null) {
    message = `LOS is blocked. Terrain obstructs the path by ${round2(Math.abs(minClearance))}m. Additional ${round2(additionalHeightNeeded!)}m tower height needed.`;
  }

  return {
    losPossible,
    distanceKm: round2(totalDistanceKm),
    minClearance: minClearance !== null ? round2(minClearance) : null,
    additionalHeightNeeded,
    profile,
    message,
    pointA: params.pointA,
    pointB: params.pointB,
    clearanceThresholdUsed: params.clearanceThreshold,
    selectedDeviceId,
    deviceCompatibility,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Rounds a number to 2 decimal places.
 * @param n - Number to round
 * @returns Rounded number
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Rounds a number to 3 decimal places (for distances in km).
 * @param n - Number to round
 * @returns Rounded number
 */
function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}