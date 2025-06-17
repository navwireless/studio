// src/tools/fiberPathCalculator/types.ts
import type { PointCoordinates } from '@/types'; // Assuming PointCoordinates is defined in a central types file

export interface FiberPathSegment {
  type: 'offset_a' | 'offset_b' | 'road_route';
  distanceMeters: number;
  pathPolyline?: string; // Encoded polyline from Google Directions API for road_route segment
  startPoint: PointCoordinates;
  endPoint: PointCoordinates;
}

export interface FiberPathResult {
  status: 'success' | 'no_road_for_a' | 'no_road_for_b' | 'no_route_between_roads' | 'api_error' | 'input_error' | 'los_not_feasible' | 'radius_too_small';
  totalDistanceMeters?: number;
  pointA_original: PointCoordinates;
  pointB_original: PointCoordinates;
  pointA_snappedToRoad?: PointCoordinates;
  pointB_snappedToRoad?: PointCoordinates;
  offsetDistanceA_meters?: number;
  offsetDistanceB_meters?: number;
  roadRouteDistanceMeters?: number;
  segments?: FiberPathSegment[]; // Detailed path segments for drawing
  errorMessage?: string;
  losFeasible: boolean; // To confirm the pre-condition was met
  radiusMetersUsed: number;
}

export interface FiberCalculatorParams {
  pointA: PointCoordinates;
  pointB: PointCoordinates;
  radiusMeters: number; // Max distance from A/B to a road
  isLosFeasible: boolean; // Pre-condition: LOS must be feasible to calculate fiber
}
