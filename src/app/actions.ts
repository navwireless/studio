
"use server";

import { z } from 'zod';
import type { AnalysisParams, AnalysisResult, PointCoordinates, ElevationSampleAPI } from '@/types';
import { analyzeLOS } from '@/lib/los-calculator';

// --- Google Elevation API Configuration ---
// WARNING: Storing API keys directly in code is insecure for production. 
// Consider using environment variables and restricting API key usage.
const GOOGLE_ELEVATION_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ";
const GOOGLE_ELEVATION_API_URL = "https://maps.googleapis.com/maps/api/elevation/json";
// --- End Google Elevation API Configuration ---


// Define Zod schema for form validation
const PointInputSchema = z.object({
  lat: z.string().refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Invalid Latitude (-90 to 90)"),
  lng: z.string().refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Invalid Longitude (-180 to 180)"),
  height: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Height must be a positive number"),
});

const AnalysisFormSchema = z.object({
  pointA: PointInputSchema,
  pointB: PointInputSchema,
  clearanceThreshold: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Clearance must be a positive number"),
});


/**
 * Fetches elevation data from Google Elevation API.
 */
async function getGoogleElevationData(pointA: PointCoordinates, pointB: PointCoordinates, samples: number = 100): Promise<ElevationSampleAPI[]> {
  if (!GOOGLE_ELEVATION_API_KEY || GOOGLE_ELEVATION_API_KEY.trim() === "") {
    throw new Error("Google Elevation API key is not configured or is empty.");
  }

  const pathStr = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
  const url = `${GOOGLE_ELEVATION_API_URL}?path=${pathStr}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY.trim()}`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    console.error("Network error fetching elevation data:", networkError);
    throw new Error(`Network error while trying to reach Google Elevation API. Please check your internet connection and server's ability to reach Google services. Details: ${networkError instanceof Error ? networkError.message : String(networkError)}`);
  }

  if (!response.ok) {
    let errorBody = "Could not retrieve error body.";
    try {
      errorBody = await response.text();
    } catch (textError) {
      console.error("Failed to read error body from Google API response:", textError);
    }
    console.error("Google Elevation API request failed:", response.status, errorBody);
    throw new Error(`Google Elevation API request failed with status ${response.status}. Details: ${errorBody}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonError) {
    console.error("Failed to parse JSON response from Google Elevation API:", jsonError);
    throw new Error(`Failed to parse response from Google Elevation API. Details: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
  }
  

  if (data.status !== 'OK') {
    console.error("Google Elevation API error:", data.status, data.error_message);
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
      resolution: sample.resolution,
  }));
}


export async function performLosAnalysis(prevState: any, formData: FormData): Promise<AnalysisResult | { error: string; fieldErrors?: any }> {
  const rawFormData = {
    pointA: {
      lat: formData.get('pointA.lat') as string,
      lng: formData.get('pointA.lng') as string,
      height: formData.get('pointA.height') as string,
    },
    pointB: {
      lat: formData.get('pointB.lat') as string,
      lng: formData.get('pointB.lng') as string,
      height: formData.get('pointB.height') as string,
    },
    clearanceThreshold: formData.get('clearanceThreshold') as string,
  };

  const validationResult = AnalysisFormSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.flatten().fieldErrors);
    return { error: "Invalid input.", fieldErrors: validationResult.error.flatten().fieldErrors };
  }

  const validatedData = validationResult.data;

  const params: AnalysisParams = {
    pointA: {
      lat: parseFloat(validatedData.pointA.lat),
      lng: parseFloat(validatedData.pointA.lng),
      towerHeight: parseFloat(validatedData.pointA.height),
    },
    pointB: {
      lat: parseFloat(validatedData.pointB.lat),
      lng: parseFloat(validatedData.pointB.lng),
      towerHeight: parseFloat(validatedData.pointB.height),
    },
    clearanceThreshold: parseFloat(validatedData.clearanceThreshold),
  };

  try {
    const elevationData = await getGoogleElevationData(params.pointA, params.pointB, 100);
    const result = analyzeLOS(params, elevationData);
    return { ...result, message: `${result.message} Using Google Elevation API data.` };

  } catch (err) {
    console.error("Error during LOS analysis:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
    
    if (errorMessage.includes("Google Elevation API key is not configured")) {
        return { error: "Elevation service is not configured. Please check the API key and ensure it's enabled for the Google Elevation API in your Google Cloud Console."};
    }
    if (errorMessage.includes("Google Elevation API request failed") || errorMessage.includes("Google Elevation API error")) {
        return { error: `Failed to retrieve elevation data. This could be due to an invalid API key, restrictions, or billing issues with Google Cloud Platform. Details: ${errorMessage}` };
    }
     if (errorMessage.includes("Network error while trying to reach Google Elevation API")) {
        return { error: errorMessage }; // Pass through the detailed network error
    }
    return { error: `Analysis failed due to an unexpected issue: ${errorMessage}` };
  }
}
