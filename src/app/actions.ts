
"use server";

import { z } from 'zod';
import type { AnalysisParams, AnalysisResult, PointCoordinates, ElevationSampleAPI } from '@/types';
import { analyzeLOS } from '@/lib/los-calculator';
import { generatePdfReportForSingleAnalysis, ReportGenerationOptions } from '@/tools/report-generator';

// --- Google Elevation API Configuration ---
const GOOGLE_ELEVATION_API_KEY = process.env.GOOGLE_ELEVATION_API_KEY;
const GOOGLE_ELEVATION_API_URL = "https://maps.googleapis.com/maps/api/elevation/json";
// --- End Google Elevation API Configuration ---


// Define Zod schema for form validation on the server, expecting string inputs from FormData
const ServerActionPointInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  lat: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  }, "Latitude must be between -90 and 90 (e.g., 28.6139)"),
  lng: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  }, "Longitude must be between -180 and 180 (e.g., 77.2090)"),
  height: z.string()
    .refine(val => !isNaN(parseFloat(val)), "Tower height must be a number")
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, "Minimum tower height is 0m")
    .refine(val => val <= 100, "Maximum tower height is 100m"),
});

const ServerActionAnalysisSchema = z.object({
  pointA: ServerActionPointInputSchema,
  pointB: ServerActionPointInputSchema,
  clearanceThreshold: z.string()
    .refine(val => !isNaN(parseFloat(val)), "Clearance threshold must be a number")
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, "Clearance threshold must be a non-negative number"),
});


/**
 * Fetches elevation data from Google Elevation API.
 */
async function getGoogleElevationData(pointA: PointCoordinates, pointB: PointCoordinates, samples: number = 100): Promise<ElevationSampleAPI[]> {
  if (!GOOGLE_ELEVATION_API_KEY || GOOGLE_ELEVATION_API_KEY.trim() === "" || GOOGLE_ELEVATION_API_KEY === "YOUR_GOOGLE_ELEVATION_API_KEY_HERE") {
    console.error("Google Elevation API key is not configured or is a placeholder.");
    throw new Error("Elevation service API key is not configured. Please check server environment variables.");
  }

  const pathStr = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
  const url = `${GOOGLE_ELEVATION_API_URL}?path=${pathStr}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY.trim()}`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError: unknown) {
    const errorMessage = networkError instanceof Error ? networkError.message : String(networkError);
    console.error("Network error fetching elevation data:", errorMessage);
    throw new Error(`Network error reaching Google Elevation API: ${errorMessage}. Check connectivity & firewall.`);
  }

  if (!response.ok) {
    let errorBody = "Could not retrieve error body.";
    try {
      errorBody = await response.text();
    } catch (textError) {
      console.warn("Failed to read error body from Google API response:", textError);
    }
    console.error("Google Elevation API request failed:", response.status, errorBody);
    throw new Error(`Google Elevation API request failed (Status: ${response.status}). Details: ${errorBody.substring(0, 200)}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonError: unknown) {
    const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
    console.error("Failed to parse JSON response from Google Elevation API:", errorMessage);
    throw new Error(`Failed to parse response from Google Elevation API: ${errorMessage}`);
  }
  
  if (data.status !== 'OK') {
    console.error("Google Elevation API error:", data.status, data.error_message);
    throw new Error(`Google Elevation API error: ${data.status} - ${data.error_message || 'Unknown API error'}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error("Google Elevation API returned no results for the given path. Check coordinates.");
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


export async function performLosAnalysis(
  prevState: AnalysisResult | { error: string; fieldErrors?: any } | null, // Can be null initially
  formData: FormData
): Promise<AnalysisResult | { error: string; fieldErrors?: any }> {
  try {
    const rawFormData = {
      pointA: {
        name: String(formData.get('pointA.name') ?? "Site A"),
        lat: String(formData.get('pointA.lat') ?? ""),
        lng: String(formData.get('pointA.lng') ?? ""),
        height: String(formData.get('pointA.height') ?? ""),
      },
      pointB: {
        name: String(formData.get('pointB.name') ?? "Site B"),
        lat: String(formData.get('pointB.lat') ?? ""),
        lng: String(formData.get('pointB.lng') ?? ""),
        height: String(formData.get('pointB.height') ?? ""),
      },
      clearanceThreshold: String(formData.get('clearanceThreshold') ?? ""),
    };

    const validationResult = ServerActionAnalysisSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten();
      let finalErrorMessage = "Input validation failed. Issues:\n";
      
      if (flattenedErrors.formErrors.length > 0) {
        finalErrorMessage += `Form Errors: ${flattenedErrors.formErrors.map(String).join(', ')}\n`;
      }
      
      const fieldErrorMessages = Object.entries(flattenedErrors.fieldErrors)
        .map(([path, messages]) => {
          const typedMessages = messages as string[]; // Assuming messages are string arrays
          return `${String(path)}: ${typedMessages.map(String).join(', ')}`;
        })
        .join('\n');

      if (fieldErrorMessages) {
        finalErrorMessage += `Field Errors:\n${fieldErrorMessages}`;
      }
      
      console.error("Server-side Zod validation errors:", finalErrorMessage, flattenedErrors);
      throw new Error(finalErrorMessage.trim());
    }

    const validatedData = validationResult.data;

    const params: AnalysisParams = {
      pointA: {
        name: validatedData.pointA.name,
        lat: parseFloat(rawFormData.pointA.lat), 
        lng: parseFloat(rawFormData.pointA.lng),
        towerHeight: validatedData.pointA.height, 
      },
      pointB: {
        name: validatedData.pointB.name,
        lat: parseFloat(rawFormData.pointB.lat),
        lng: parseFloat(rawFormData.pointB.lng),
        towerHeight: validatedData.pointB.height, 
      },
      clearanceThreshold: validatedData.clearanceThreshold, 
    };
    
    const elevationData = await getGoogleElevationData(params.pointA, params.pointB, 100);
    const result = analyzeLOS(params, elevationData);
    
    return { 
      ...result, 
      id: new Date().toISOString() + Math.random().toString(36).substring(2,9), 
      timestamp: Date.now(), 
      message: `${result.message} Using Google Elevation API data.` 
    };

  } catch (err: unknown) {
    let clientErrorMessageString: string;

    if (err instanceof Error) {
      clientErrorMessageString = String(err.message); 
    } else {
      clientErrorMessageString = "An unknown error occurred during analysis.";
    }
    
    console.error("Error in performLosAnalysis server action:", clientErrorMessageString, err);
    throw new Error(clientErrorMessageString);
  }
}


export async function generateSingleAnalysisPdfReportAction(
  analysisResult: AnalysisResult,
  reportOptions?: ReportGenerationOptions
): Promise<{ success: true; data: { base64Pdf: string; fileName: string } } | { success: false; error: string }> {
  try {
    if (!analysisResult) {
      return { success: false, error: "Analysis result data is missing." };
    }

    const pdfBytes = await generatePdfReportForSingleAnalysis(analysisResult, reportOptions);
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');
    
    const safePointAName = (analysisResult.pointA.name || "SiteA").replace(/[^a-zA-Z0-9]/g, '_');
    const safePointBName = (analysisResult.pointB.name || "SiteB").replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `LOS_Report_${safePointAName}_to_${safePointBName}.pdf`;

    return { success: true, data: { base64Pdf, fileName } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during PDF report generation.";
    console.error("Error generating PDF report action:", errorMessage, error);
    return { success: false, error: `Failed to generate PDF report: ${errorMessage}` };
  }
}

