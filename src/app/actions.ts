
"use server";

import { z } from 'zod';
import type { AnalysisParams, AnalysisResult, PointCoordinates } from '@/types';
import { getGoogleElevationData, analyzeLOS } from '@/lib/los-calculator';

// Helper function to parse coordinate strings
// This can be moved to a shared utils file if used elsewhere server-side
const parseCoordinatesStringInternal = (coordsString: string): PointCoordinates | null => {
  if (!coordsString || typeof coordsString !== 'string') return null;
  const parts = coordsString.split(',').map(part => part.trim());
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
    return null;
  }
  return { lat, lng };
};

// Define Zod schema for server-side validation of FormData strings
const ServerActionPointSchema = z.object({
  name: z.string().min(1, "Name is required.").max(50, "Name too long (max 50 chars)."),
  coordinates: z.string().refine(val => parseCoordinatesStringInternal(val) !== null, {
    message: "Invalid coordinates. Use 'lat, lng' format (e.g., 20.5, 78.9). Lat: -90 to 90, Lng: -180 to 180.",
  }),
  height: z.string()
    .refine(val => val.trim() !== "" && !isNaN(parseFloat(val)), { message: "Tower height must be a number." })
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, { message: "Minimum tower height is 0m." })
    .refine(val => val <= 100, { message: "Maximum tower height is 100m." }),
});

const ServerActionAnalysisSchema = z.object({
  pointA: ServerActionPointSchema,
  pointB: ServerActionPointSchema,
  clearanceThreshold: z.string()
    .refine(val => val.trim() !== "" && !isNaN(parseFloat(val)), { message: "Clearance threshold must be a number." })
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, { message: "Clearance threshold must be a non-negative number." }),
});


export async function performLosAnalysis(
  prevState: any, // Previous state from useActionState, not directly used if throwing errors
  formData: FormData
): Promise<AnalysisResult> { // Action now throws Error on failure or returns AnalysisResult on success

  const rawFormData = {
    pointA: {
      name: String(formData.get('pointA.name') ?? ""),
      coordinates: String(formData.get('pointA.coordinates') ?? ""),
      height: String(formData.get('pointA.height') ?? ""),
    },
    pointB: {
      name: String(formData.get('pointB.name') ?? ""),
      coordinates: String(formData.get('pointB.coordinates') ?? ""),
      height: String(formData.get('pointB.height') ?? ""),
    },
    clearanceThreshold: String(formData.get('clearanceThreshold') ?? ""),
  };

  const validationResult = ServerActionAnalysisSchema.safeParse(rawFormData);

  if (!validationResult.success) {
    const rawZodErrors = validationResult.error.flatten();
    let errorMessages = "Validation failed: ";
    
    // Form-level errors
    if (rawZodErrors.formErrors.length > 0) {
        errorMessages += rawZodErrors.formErrors.map(String).join('; ');
    }

    // Field-level errors
    const fieldErrorParts: string[] = [];
    // Iterate over pointA fields
    const pointAFieldErrors = rawZodErrors.fieldErrors['pointA'] as unknown as Record<string, string[] | undefined> | undefined;
    if (typeof pointAFieldErrors === 'object' && pointAFieldErrors !== null) {
        for (const key in pointAFieldErrors) {
            if (pointAFieldErrors[key]) {
                fieldErrorParts.push(`Point A ${String(key)}: ${pointAFieldErrors[key]!.map(String).join(', ')}`);
            }
        }
    }
    // Iterate over pointB fields
    const pointBFieldErrors = rawZodErrors.fieldErrors['pointB'] as unknown as Record<string, string[] | undefined> | undefined;
     if (typeof pointBFieldErrors === 'object' && pointBFieldErrors !== null) {
        for (const key in pointBFieldErrors) {
            if (pointBFieldErrors[key]) {
                fieldErrorParts.push(`Point B ${String(key)}: ${pointBFieldErrors[key]!.map(String).join(', ')}`);
            }
        }
    }
    // Clearance threshold error (if any, direct key)
    if (rawZodErrors.fieldErrors['clearanceThreshold']) {
        fieldErrorParts.push(`Clearance Threshold: ${rawZodErrors.fieldErrors['clearanceThreshold']!.map(String).join(', ')}`);
    }
    
    if (fieldErrorParts.length > 0) {
        errorMessages += (errorMessages.endsWith(": ") ? "" : "; ") + fieldErrorParts.join('; ');
    }
    
    const finalErrorMessage = errorMessages.trim() === "Validation failed:" ? "Invalid input. Please check the form fields." : errorMessages;
    console.error("Server Action: Zod validation failed. Constructed Message:", finalErrorMessage, "Raw Zod Errors:", JSON.stringify(rawZodErrors));
    throw new Error(finalErrorMessage);
  }

  // validatedData now has heights and clearanceThreshold as numbers due to z.transform()
  // and coordinates as validated strings.
  const validatedData = validationResult.data;

  const parsedPointACoords = parseCoordinatesStringInternal(validatedData.pointA.coordinates)!; // Bang operator is safe due to refine
  const parsedPointBCoords = parseCoordinatesStringInternal(validatedData.pointB.coordinates)!; // Bang operator is safe due to refine

  const paramsForAnalysis: AnalysisParams = {
    pointA: {
      name: validatedData.pointA.name,
      lat: parsedPointACoords.lat,
      lng: parsedPointACoords.lng,
      towerHeight: validatedData.pointA.height, // Already a number from transform
    },
    pointB: {
      name: validatedData.pointB.name,
      lat: parsedPointBCoords.lat,
      lng: parsedPointBCoords.lng,
      towerHeight: validatedData.pointB.height, // Already a number from transform
    },
    clearanceThreshold: validatedData.clearanceThreshold, // Already a number from transform
  };

  try {
    const elevationDataAPI = await getGoogleElevationData(paramsForAnalysis.pointA, paramsForAnalysis.pointB, 100);
    
    // analyzeLOS expects AnalysisParams which includes names from paramsForAnalysis
    const analysisOutcome = analyzeLOS(paramsForAnalysis, elevationDataAPI);
    
    const resultWithTimestamp: AnalysisResult = {
        ...analysisOutcome,
        id: `analysis_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`,
        timestamp: Date.now(),
        // Ensure names from validated data are consistently used in the result
        // analysisOutcome already contains pointA and pointB with their names from paramsForAnalysis
        pointA: analysisOutcome.pointA, 
        pointB: analysisOutcome.pointB,
        message: `${analysisOutcome.message} Source: Google Elevation API.`,
    };
    return resultWithTimestamp;

  } catch (err: unknown) {
    let clientErrorMessageString: string;

    if (err instanceof Error) {
      clientErrorMessageString = String(err.message); // Ensure message is string
      // Specific checks for Google API errors are good to keep for user clarity
      if (clientErrorMessageString.includes("Google Elevation API key is not configured")) {
        clientErrorMessageString = "Elevation service is not configured. Please check API key settings.";
      } else if (clientErrorMessageString.includes("Google Elevation API request failed") || 
                 clientErrorMessageString.includes("Google Elevation API error") || 
                 clientErrorMessageString.includes("Google Elevation API request timed out")) {
        // The message from los-calculator.ts is already quite descriptive, so just use it.
      } else if (clientErrorMessageString.includes("Network error while trying to reach Google Elevation API")) {
         // The message from los-calculator.ts is descriptive.
      }
      // No need for a generic catch-all for other Error instances if los-calculator is also hardened.
    } else {
      // Fallback for non-Error exceptions
      clientErrorMessageString = "An unexpected issue occurred during analysis. Please try again.";
    }
    
    // Log the original error type and message for server-side debugging
    console.error("performLosAnalysis - Inner error caught. Client-facing message:", clientErrorMessageString, "Original error:", String(err));
    throw new Error(clientErrorMessageString); // Always throw a standard Error with a string message
  }
}
