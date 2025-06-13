
"use server";

import type { PointCoordinates, ElevationSampleAPI } from '@/types';

// --- Google Elevation API Configuration ---
// WARNING: Storing API keys directly in code is insecure for production. 
// Consider using environment variables and restricting API key usage.
const GOOGLE_ELEVATION_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ"; // Replace with your actual key or env variable
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
  if (!GOOGLE_ELEVATION_API_KEY || GOOGLE_ELEVATION_API_KEY.trim() === "") {
    throw new Error("Google Elevation API key is not configured or is empty.");
  }

  const pathStr = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
  const url = `${GOOGLE_ELEVATION_API_URL}?path=${pathStr}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY.trim()}`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError: unknown) {
    const errorMessage = networkError instanceof Error ? networkError.message : String(networkError);
    console.error("Network error fetching elevation data for bulk analysis:", errorMessage);
    throw new Error(`Network error while trying to reach Google Elevation API: ${errorMessage}`);
  }

  if (!response.ok) {
    let errorBody = "Could not retrieve error body from Google API.";
    try {
      errorBody = await response.text();
    } catch (textError) {
      // Ignore if reading error body fails
    }
    console.error(`Google Elevation API request failed for bulk analysis: ${response.status}`, errorBody);
    throw new Error(`Google Elevation API request failed with status ${response.status}. Details: ${errorBody}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonError: unknown) {
    const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
    console.error("Failed to parse JSON response from Google Elevation API for bulk analysis:", errorMessage);
    throw new Error(`Failed to parse response from Google Elevation API: ${errorMessage}`);
  }
  
  if (data.status !== 'OK') {
    console.error("Google Elevation API error for bulk analysis:", data.status, data.error_message);
    throw new Error(`Google Elevation API error: ${data.status} - ${data.error_message || 'Unknown API error'}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error("Google Elevation API returned no results for the given path.");
  }
    
  return data.results.map((sample: any) => ({
      elevation: sample.elevation,
      location: {
          lat: sample.location.lat,
          lng: sample.location.lng,
      },
      resolution: sample.resolution, // This might be useful
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
    console.error("Error in getElevationProfileForPairAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred fetching elevation profile.";
    
    if (errorMessage.includes("Google Elevation API key is not configured")) {
        return { error: "Elevation service is not configured. Please check the API key."};
    }
    if (errorMessage.includes("Google Elevation API request failed") || errorMessage.includes("Google Elevation API error")) {
        return { error: `Failed to retrieve elevation data. This could be due to an invalid API key, restrictions, or billing issues. Details: ${errorMessage}` };
    }
     if (errorMessage.includes("Network error while trying to reach Google Elevation API")) {
        return { error: errorMessage };
    }
    return { error: `Analysis failed for pair due to an unexpected issue: ${errorMessage}` };
  }
}
