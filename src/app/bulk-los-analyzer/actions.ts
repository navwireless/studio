
"use server";

import type { PointCoordinates, ElevationSampleAPI } from '@/types';

// --- Google Elevation API Configuration ---
const GOOGLE_ELEVATION_API_KEY = process.env.GOOGLE_ELEVATION_API_KEY;
const GOOGLE_ELEVATION_API_URL = "https://maps.googleapis.com/maps/api/elevation/json";
const GOOGLE_ELEVATION_API_SAMPLES = 100; // Number of samples along the path
// --- End Google Elevation API Configuration ---


interface ElevationProfileResponse {
  profile?: ElevationSampleAPI[];
  error?: string;
}

/**
 * Fetches elevation data from Google Elevation API for a pair of coordinates.
 * This is a simplified version of getGoogleElevationData for bulk use.
 */
async function fetchElevationForPair(pointA: PointCoordinates, pointB: PointCoordinates, samples: number = GOOGLE_ELEVATION_API_SAMPLES): Promise<ElevationSampleAPI[]> {
  if (!GOOGLE_ELEVATION_API_KEY || GOOGLE_ELEVATION_API_KEY.trim() === "" || GOOGLE_ELEVATION_API_KEY === "YOUR_GOOGLE_ELEVATION_API_KEY_HERE") {
    console.error("BULK_ACTION_ERROR: fetchElevationForPair - Google Elevation API key is not configured or is a placeholder.");
    throw new Error("Elevation service API key is not configured. Please check server environment variables.");
  }

  const pathStr = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
  const url = `${GOOGLE_ELEVATION_API_URL}?path=${pathStr}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY.trim()}`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError: unknown) {
    const errorMessage = networkError instanceof Error ? networkError.message : String(networkError);
    console.error(`BULK_ACTION_ERROR: fetchElevationForPair - Network error for pair ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng}:`, errorMessage);
    throw new Error(`Network error while trying to reach Google Elevation API for pair ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng}: ${errorMessage}`);
  }

  if (!response.ok) {
    let errorBody = "Could not retrieve error body from Google API.";
    try {
      errorBody = await response.text();
    } catch (textError) {
      console.warn("BULK_ACTION_WARNING: fetchElevationForPair - Failed to read error body from Google API response:", textError);
    }
    console.error(`BULK_ACTION_ERROR: fetchElevationForPair - Google Elevation API request failed for pair ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng} with status ${response.status}:`, errorBody);
    throw new Error(`Google Elevation API request failed for pair with status ${response.status}. Details: ${errorBody.substring(0,200)}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonError: unknown) {
    const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
    console.error(`BULK_ACTION_ERROR: fetchElevationForPair - Failed to parse JSON response from Google Elevation API for pair ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng}:`, errorMessage);
    throw new Error(`Failed to parse response from Google Elevation API for pair: ${errorMessage}`);
  }
  
  if (data.status !== 'OK') {
    console.error(`BULK_ACTION_ERROR: fetchElevationForPair - Google Elevation API error for pair ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng} with status '${data.status}':`, data.error_message);
    throw new Error(`Google Elevation API error for pair: ${data.status} - ${data.error_message || 'Unknown API error'}`);
  }

  if (!data.results || data.results.length === 0) {
    console.error(`BULK_ACTION_ERROR: fetchElevationForPair - Google Elevation API returned no results for pair ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng}.`);
    throw new Error("Google Elevation API returned no results for the given path in bulk analysis. Check coordinates.");
  }
    
  return data.results.map((sample: any) => ({
      elevation: sample.elevation,
      location: {
          lat: sample.location.lat,
          lng: sample.location.lng,
      },
      resolution: sample.resolution, 
  }));
}


export async function getElevationProfileForPairAction(
  pointA: PointCoordinates, 
  pointB: PointCoordinates
): Promise<ElevationProfileResponse> {
  try {
    const elevationProfile = await fetchElevationForPair(pointA, pointB, GOOGLE_ELEVATION_API_SAMPLES);
    return { profile: elevationProfile };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred fetching elevation profile for pair.";
    console.error("BULK_ACTION_ERROR: Unhandled exception in getElevationProfileForPairAction:", error);
    return { error: errorMessage }; // Return error as part of the response object
  }
}
