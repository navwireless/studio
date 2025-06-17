// src/tools/fiberPathCalculator/calculator.ts
// This file will contain the core server-side logic for calculating fiber paths
// using Google Maps Platform APIs.
// IMPORTANT: This module should only be used server-side.

'use server'; 

import { Client, DirectionsRequest, TravelMode, UnitSystem } from "@googlemaps/google-maps-services-js";
import type { PointCoordinates, FiberCalculatorParams, FiberPathResult, FiberPathSegment } from './types';
import { calculateDistanceKm } from '@/lib/los-calculator'; // For Haversine distance

const GOOGLE_DIRECTIONS_API_KEY = process.env.GOOGLE_DIRECTIONS_API_KEY;

const mapsClient = new Client({});

/**
 * Calculates the straight-line distance between two points in meters.
 */
function calculateOffsetDistanceMeters(p1: PointCoordinates, p2: PointCoordinates): number {
  return calculateDistanceKm(p1, p2) * 1000;
}

/**
 * Finds the nearest point on a road to a given coordinate within a specified radius
 * and calculates the offset distance using the Google Directions API.
 * 
 * @param point The original coordinate.
 * @param radiusMeters The maximum distance to search for a road.
 * @param client The Google Maps API client.
 * @returns A promise that resolves to an object with the snapped road point and offset distance, or null if no road is found within radius.
 */
async function findNearestRoadPointWithOffset(
  point: PointCoordinates,
  radiusMeters: number,
  client: Client
): Promise<{ roadPoint: PointCoordinates; offsetDistanceMeters: number } | null> {
  if (!GOOGLE_DIRECTIONS_API_KEY) {
    console.error("GOOGLE_DIRECTIONS_API_KEY is not configured.");
    throw new Error("Directions API key not configured on server.");
  }

  const request: DirectionsRequest = {
    params: {
      origin: { lat: point.lat, lng: point.lng },
      destination: { lat: point.lat, lng: point.lng }, // Route to itself to snap to nearest road
      mode: TravelMode.driving, 
      units: UnitSystem.metric,
      key: GOOGLE_DIRECTIONS_API_KEY,
    },
  };

  try {
    const response = await client.directions(request);

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      if (route.legs.length > 0 && route.legs[0].steps.length > 0) {
        const leg = route.legs[0];
        // The start_location of the first leg is the point Google snapped to the road network
        const snappedRoadPoint: PointCoordinates = {
          lat: leg.start_location.lat,
          lng: leg.start_location.lng,
        };

        const offsetDistanceMeters = calculateOffsetDistanceMeters(point, snappedRoadPoint);

        if (offsetDistanceMeters <= radiusMeters) {
          return { roadPoint: snappedRoadPoint, offsetDistanceMeters };
        } else {
          console.log(`Road found for point ${point.lat},${point.lng}, but offset ${offsetDistanceMeters}m exceeds radius ${radiusMeters}m.`);
          return null; 
        }
      } else {
         console.log(`Directions API OK, but no route/legs/steps found for snapping point ${point.lat},${point.lng}. This might mean it's too far from any road network for the API to snap.`);
         return null;
      }
    } else {
      console.log(`Directions API status not OK for snapping point ${point.lat},${point.lng}: ${response.data.status}. Error: ${response.data.error_message}`);
      return null;
    }
  } catch (error: any) {
    console.error(`Error calling Google Directions API for road snapping (point: ${point.lat},${point.lng}):`, error.response?.data || error.message);
    throw new Error(`Google Directions API error during road snapping: ${error.response?.data?.error_message || error.message}`);
  }
}


/**
 * Gets the driving route between two points using Google Directions API.
 * @param origin The starting road point.
 * @param destination The ending road point.
 * @param client The Google Maps API client.
 * @returns A promise resolving to route details (distance, polyline, segments) or null if no route found.
 */
async function getRoadRoute(
  origin: PointCoordinates,
  destination: PointCoordinates,
  client: Client
): Promise<{ distanceMeters: number; polyline: string; segments: FiberPathSegment[] } | null> {
  if (!GOOGLE_DIRECTIONS_API_KEY) {
    console.error("GOOGLE_DIRECTIONS_API_KEY is not configured.");
    throw new Error("Directions API key not configured on server.");
  }
  
  const request: DirectionsRequest = {
    params: {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      mode: TravelMode.driving,
      units: UnitSystem.metric,
      key: GOOGLE_DIRECTIONS_API_KEY,
    },
  };

  try {
    const response = await client.directions(request);

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      if (leg && leg.distance && route.overview_polyline) {
        const routeSegmentsDetailed: FiberPathSegment[] = route.legs.flatMap(currentLeg => 
          currentLeg.steps.map(step => ({
            type: 'road_route' as const,
            distanceMeters: step.distance.value,
            pathPolyline: step.polyline.points,
            startPoint: { lat: step.start_location.lat, lng: step.start_location.lng },
            endPoint: { lat: step.end_location.lat, lng: step.end_location.lng },
          }))
        );

        return {
          distanceMeters: leg.distance.value,
          polyline: route.overview_polyline.points, // Overview polyline for the whole road route part
          segments: routeSegmentsDetailed,
        };
      } else {
        console.log("Directions API OK, but missing leg, distance, or polyline for route between", origin, "and", destination);
        return null;
      }
    } else if (response.data.status === 'ZERO_RESULTS') {
        console.log("No road route found (ZERO_RESULTS) between", origin, "and", destination);
        return null;
    } else {
        console.log(`Directions API status not OK for routing: ${response.data.status}. Error: ${response.data.error_message}`);
        return null;
    }
  } catch (error: any) {
    console.error(`Error calling Google Directions API for road routing (origin: ${origin.lat},${origin.lng}, dest: ${destination.lat},${destination.lng}):`, error.response?.data || error.message);
    throw new Error(`Google Directions API error during road routing: ${error.response?.data?.error_message || error.message}`);
  }
}


export async function calculateFiberPath(params: FiberCalculatorParams): Promise<FiberPathResult> {
  const { pointA, pointB, radiusMeters, isLosFeasible } = params;

  const baseResult = { // Common fields for all return paths
    pointA_original: pointA,
    pointB_original: pointB,
    losFeasible: isLosFeasible,
    radiusMetersUsed: radiusMeters,
  };

  if (!isLosFeasible) {
    return {
      ...baseResult,
      status: 'los_not_feasible',
      errorMessage: 'LOS is not feasible, fiber path calculation skipped.',
    };
  }

  if (!GOOGLE_DIRECTIONS_API_KEY) {
    console.error("FATAL: GOOGLE_DIRECTIONS_API_KEY is not configured for fiber path calculation.");
    return {
      ...baseResult,
      status: 'api_error',
      errorMessage: 'Server configuration error: Directions API key is missing.',
    };
  }
  
  if (radiusMeters <= 0) {
      return {
        ...baseResult,
        status: 'radius_too_small',
        errorMessage: 'Radius for road snapping must be greater than 0 meters.',
      };
  }

  try {
    const snappedAData = await findNearestRoadPointWithOffset(pointA, radiusMeters, mapsClient);
    if (!snappedAData) {
      return {
        ...baseResult,
        status: 'no_road_for_a',
        errorMessage: `No road found within ${radiusMeters}m of Point A (${pointA.lat.toFixed(5)}, ${pointA.lng.toFixed(5)}). Try increasing the radius.`,
      };
    }
    const { roadPoint: pointA_snappedToRoad, offsetDistanceMeters: offsetDistanceA_meters } = snappedAData;

    const snappedBData = await findNearestRoadPointWithOffset(pointB, radiusMeters, mapsClient);
    if (!snappedBData) {
      return {
        ...baseResult,
        status: 'no_road_for_b',
        pointA_snappedToRoad, // Include if Point A was successfully snapped
        offsetDistanceA_meters: parseFloat(offsetDistanceA_meters.toFixed(1)),
        errorMessage: `No road found within ${radiusMeters}m of Point B (${pointB.lat.toFixed(5)}, ${pointB.lng.toFixed(5)}). Try increasing the radius.`,
      };
    }
    const { roadPoint: pointB_snappedToRoad, offsetDistanceMeters: offsetDistanceB_meters } = snappedBData;

    const roadRouteData = await getRoadRoute(pointA_snappedToRoad, pointB_snappedToRoad, mapsClient);
    if (!roadRouteData) {
      return {
        ...baseResult,
        status: 'no_route_between_roads',
        pointA_snappedToRoad,
        offsetDistanceA_meters: parseFloat(offsetDistanceA_meters.toFixed(1)),
        pointB_snappedToRoad,
        offsetDistanceB_meters: parseFloat(offsetDistanceB_meters.toFixed(1)),
        errorMessage: 'No drivable route found between the snapped road points for A and B.',
      };
    }
    const { distanceMeters: roadRouteDistanceMeters, segments: roadSegmentsDetailed } = roadRouteData;

    const totalDistanceMeters = offsetDistanceA_meters + roadRouteDistanceMeters + offsetDistanceB_meters;

    const segments: FiberPathSegment[] = [];
    segments.push({
      type: 'offset_a',
      distanceMeters: parseFloat(offsetDistanceA_meters.toFixed(1)),
      startPoint: pointA,
      endPoint: pointA_snappedToRoad,
      // No polyline for straight offset, can be drawn as straight line by client
    });
    
    // Add detailed road segments from getRoadRoute
    segments.push(...roadSegmentsDetailed.map(seg => ({...seg, distanceMeters: parseFloat(seg.distanceMeters.toFixed(1))})));

    segments.push({
      type: 'offset_b',
      distanceMeters: parseFloat(offsetDistanceB_meters.toFixed(1)),
      startPoint: pointB_snappedToRoad,
      endPoint: pointB,
      // No polyline for straight offset
    });
    
    return {
      ...baseResult,
      status: 'success',
      totalDistanceMeters: parseFloat(totalDistanceMeters.toFixed(1)),
      pointA_snappedToRoad,
      pointB_snappedToRoad,
      offsetDistanceA_meters: parseFloat(offsetDistanceA_meters.toFixed(1)),
      offsetDistanceB_meters: parseFloat(offsetDistanceB_meters.toFixed(1)),
      roadRouteDistanceMeters: parseFloat(roadRouteDistanceMeters.toFixed(1)),
      segments,
    };

  } catch (error: any) {
    // This catch block handles errors thrown from findNearestRoadPointWithOffset or getRoadRoute,
    // or any other unexpected errors within this function.
    console.error("Error in calculateFiberPath main try-catch block:", error.message, error);
    return {
      ...baseResult,
      status: 'api_error', // Or a more specific error if identifiable
      errorMessage: error.message || 'An unknown error occurred during fiber path calculation.',
    };
  }
}
