
"use server";

import { z } from 'zod';
import type { AnalysisResult, ActionErrorState, PointCoordinates } from '@/types';
import { getGoogleElevationData, analyzeLOS } from '@/lib/los-calculator';

// Define Zod schema for form validation
const PointInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  lat: z.string().refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Invalid Latitude (-90 to 90)"),
  lng: z.string().refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Invalid Longitude (-180 to 180)"),
  height: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, "Height must be between 0 and 100m"),
});

const AnalysisFormSchema = z.object({
  pointA: PointInputSchema,
  pointB: PointInputSchema,
  clearanceThreshold: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Clearance must be a positive number"),
});


export async function performLosAnalysis(
  prevState: AnalysisResult | ActionErrorState | null,
  formData: FormData
): Promise<AnalysisResult | ActionErrorState> {
  try { // Outer try-catch for the entire action
    const rawFormData = {
      pointA: {
        name: formData.get('pointA.name') as string,
        lat: formData.get('pointA.lat') as string,
        lng: formData.get('pointA.lng') as string,
        height: formData.get('pointA.height') as string,
      },
      pointB: {
        name: formData.get('pointB.name') as string,
        lat: formData.get('pointB.lat') as string,
        lng: formData.get('pointB.lng') as string,
        height: formData.get('pointB.height') as string,
      },
      clearanceThreshold: formData.get('clearanceThreshold') as string,
    };

    const validationResult = AnalysisFormSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      // Log detailed field errors for server-side debugging
      const fieldErrorsForLogging = validationResult.error.flatten().fieldErrors;
      console.error("Validation errors in performLosAnalysis (server log):", JSON.stringify(fieldErrorsForLogging, null, 2));
      
      // Return a generic error message to the client, without fieldErrors
      return {
        error: "Invalid input. Please check your entries and try again.", // Generic client-facing message
        fieldErrors: undefined // Explicitly undefined for the client
      };
    }

    const validatedData = validationResult.data;

    const paramsForAnalysis = {
      pointA: {
        name: validatedData.pointA.name,
        lat: parseFloat(validatedData.pointA.lat),
        lng: parseFloat(validatedData.pointA.lng),
        towerHeight: parseFloat(validatedData.pointA.height),
      },
      pointB: {
        name: validatedData.pointB.name,
        lat: parseFloat(validatedData.pointB.lat),
        lng: parseFloat(validatedData.pointB.lng),
        towerHeight: parseFloat(validatedData.pointB.height),
      },
      clearanceThreshold: parseFloat(validatedData.clearanceThreshold),
    };
    
    try { // Inner try-catch specifically for elevation fetching and LOS analysis
      const elevationData = await getGoogleElevationData(
        { lat: paramsForAnalysis.pointA.lat, lng: paramsForAnalysis.pointA.lng },
        { lat: paramsForAnalysis.pointB.lat, lng: paramsForAnalysis.pointB.lng },
        100 // Number of samples
      );
      
      const analysisResultData = analyzeLOS(
        paramsForAnalysis,
        elevationData
      );
      
      const fullResult: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        timestamp: Date.now(),
        losPossible: analysisResultData.losPossible,
        distanceKm: analysisResultData.distanceKm,
        minClearance: analysisResultData.minClearance,
        additionalHeightNeeded: analysisResultData.additionalHeightNeeded,
        profile: analysisResultData.profile,
        message: `${analysisResultData.message} Elevation data from Google Elevation API.`,
        pointA: paramsForAnalysis.pointA,
        pointB: paramsForAnalysis.pointB,
        clearanceThresholdUsed: paramsForAnalysis.clearanceThreshold,
      };
      return fullResult;

    } catch (err: unknown) { // Inner catch for LOS analysis specific errors
      // Log the original error for server-side debugging
      console.error("Error Log (Inner Catch - performLosAnalysis):", String(err));
      
      // Return a generic, safe error message to the client
      return { 
        error: "An error occurred during the Line-of-Sight analysis. Please check server logs for details.",
        fieldErrors: undefined 
      };
    }
  } catch (e: unknown) { // Outermost catch for any other errors in the action
    // Log the original error for server-side debugging
    console.error("Error Log (Outer Catch - performLosAnalysis):", String(e));

    // Return a generic, safe error message to the client
    return {
      error: "An unexpected server error occurred. Please contact support or check server logs for more details.",
      fieldErrors: undefined,
    };
  }
}
    

    