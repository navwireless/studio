
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
 * Fetches elevation data from Google Elevation API with a timeout.
 */
async function getGoogleElevationData(pointA: PointCoordinates, pointB: PointCoordinates, samples: number = 100): Promise<ElevationSampleAPI[]> {
  if (!GOOGLE_ELEVATION_API_KEY || GOOGLE_ELEVATION_API_KEY.trim() === "") {
    throw new Error("Google Elevation API key is not configured or is empty.");
  }

  const pathStr = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
  const url = `${GOOGLE_ELEVATION_API_URL}?path=${pathStr}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY.trim()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId); // Clear timeout if fetch completes or errors normally
  } catch (networkError) {
    clearTimeout(timeoutId); // Ensure timeout is cleared on error
    if (networkError instanceof Error && networkError.name === 'AbortError') {
      console.error("Google Elevation API request timed out after 30 seconds.");
      throw new Error("Google Elevation API request timed out. The service might be temporarily unavailable or there could be network issues.");
    }
    console.error("Network error fetching elevation data:", networkError);
    const networkErrorMessageSource = networkError instanceof Error ? networkError.message : networkError;
    throw new Error(`Network error while trying to reach Google Elevation API. Please check your internet connection and server's ability to reach Google services. Details: ${String(networkErrorMessageSource)}`);
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
    const jsonErrorMsgSource = jsonError instanceof Error ? jsonError.message : jsonError;
    console.error("Failed to parse JSON response from Google Elevation API:", jsonErrorMsgSource);
    throw new Error(`Failed to parse response from Google Elevation API. Details: ${String(jsonErrorMsgSource)}`);
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
  try { // Outer try-catch for the entire action
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
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const sanitizedFieldErrors: { [key: string]: string[] } = {};
      for (const field in fieldErrors) {
        const messages = fieldErrors[field as keyof typeof fieldErrors]; 
        if (messages) {
          sanitizedFieldErrors[field] = messages.map(msg => String(msg));
        }
      }
      return { error: "Invalid input.", fieldErrors: sanitizedFieldErrors };
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

    try { // Inner try-catch specifically for elevation fetching and LOS analysis
      const elevationData = await getGoogleElevationData(params.pointA, params.pointB, 100);
      const result = analyzeLOS(params, elevationData);
      return { ...result, message: `${result.message} Using Google Elevation API data.` };

    } catch (err) { // Inner catch
      console.error("Error during LOS analysis (inner catch):", err);
      const errorMessageSource = err instanceof Error ? err.message : err;
      const errorMessageString = String(errorMessageSource);


      if (errorMessageString.includes("Google Elevation API key is not configured")) {
          return { error: "Elevation service is not configured. Please check the API key and ensure it's enabled for the Google Elevation API in your Google Cloud Console."};
      }
      if (errorMessageString.includes("Google Elevation API request failed") || errorMessageString.includes("Google Elevation API error") || errorMessageString.includes("Google Elevation API request timed out")) {
          return { error: `Failed to retrieve elevation data. This could be due to an invalid API key, restrictions, billing issues with Google Cloud Platform, or the service being temporarily unavailable. Details: ${errorMessageString}` };
      }
       if (errorMessageString.includes("Network error while trying to reach Google Elevation API")) {
          return { error: errorMessageString }; 
      }
      return { error: `Analysis failed due to an unexpected issue: ${errorMessageString}` };
    }
  } catch (e) { // Outer catch for any other errors in the action
    console.error("Unhandled error in performLosAnalysis (outer catch):", e);
    const errorMessageSource = e instanceof Error ? e.message : e;
    const errorMessageString = String(errorMessageSource);
    return { error: `An unexpected system error occurred: ${errorMessageString}` };
  }
}

