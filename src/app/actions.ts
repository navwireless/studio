
"use server";

import { z } from 'zod';
import type { AnalysisResult, ActionErrorState, PointCoordinates, ElevationSampleAPI } from '@/types';
import { getGoogleElevationData, analyzeLOS } from '@/lib/los-calculator';

// Define Zod schema for form validation
const PointInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  lat: z.string().refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Invalid Latitude (-90 to 90)"),
  lng: z.string().refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Invalid Longitude (-180 to 180)"),
  height: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Height must be a positive number"),
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
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const sanitizedFieldErrors: { [key: string]: string[] | undefined } = {};
      for (const field in fieldErrors) {
        const messages = fieldErrors[field as keyof typeof fieldErrors];
        if (messages) {
          sanitizedFieldErrors[field] = messages.map(msg => String(msg ?? 'Validation message undefined'));
        }
      }
      // Simplified logging for validation errors
      console.error("Validation errors occurred. Field details suppressed for this log message.");
      return { error: "Invalid input. Please check the fields highlighted below.", fieldErrors: sanitizedFieldErrors };
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
        message: `${analysisResultData.message} Using Google Elevation API data.`,
        pointA: paramsForAnalysis.pointA,
        pointB: paramsForAnalysis.pointB,
        clearanceThresholdUsed: paramsForAnalysis.clearanceThreshold,
      };
      return fullResult;

    } catch (err: unknown) { // Inner catch for LOS analysis specific errors
      // Simplified logging: Avoid logging the raw error object if it might be complex
      console.error("Error during LOS analysis (inner catch). A generic message will be returned to the client. Original error suppressed from this log line.");
      
      return { 
        error: "An error occurred during the Line-of-Sight analysis process. Please check the server logs for more details or try again later.", 
        fieldErrors: undefined 
      };
    }
  } catch (e: unknown) { // Outermost catch for any other errors in the action
    // Simplified logging
    console.error("Unhandled error in performLosAnalysis (outer catch). A generic message will be returned to the client. Original error suppressed from this log line.");

    return {
      error: "An unexpected server error occurred. Please contact support or check server logs for more details.",
      fieldErrors: undefined,
    };
  }
}
