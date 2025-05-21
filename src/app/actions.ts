"use server";

import { z } from 'zod';
import type { AnalysisParams, AnalysisResult, PointCoordinates, ElevationSampleAPI } from '@/types';
import { analyzeLOS, calculateDistanceKm } from '@/lib/los-calculator';

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


// Mock Google Elevation API call
// In a real application, this would fetch data from Google's Elevation API
// https://maps.googleapis.com/maps/api/elevation/json?path=[pointA_lat],[pointA_lng]|[pointB_lat],[pointB_lng]&samples=100&key=[YOUR_API_KEY]
async function getMockElevationData(pointA: PointCoordinates, pointB: PointCoordinates, samples: number = 100): Promise<ElevationSampleAPI[]> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  const data: ElevationSampleAPI[] = [];
  const startElevation = 50; // meters
  const endElevation = 70; // meters
  
  // Determine if we should create an obstruction
  // This is a very simple way to vary results for testing.
  // If pointA latitude is an even integer, create an obstruction.
  const hasObstruction = Math.floor(pointA.lat) % 2 === 0;

  for (let i = 0; i < samples; i++) {
    const fraction = samples > 1 ? i / (samples - 1) : 0;
    const lat = pointA.lat + fraction * (pointB.lat - pointA.lat);
    const lng = pointA.lng + fraction * (pointB.lng - pointA.lng);
    
    let elevation = startElevation + fraction * (endElevation - startElevation);
    
    // Add a hill: increases elevation up to midpoint, then decreases
    const peakHeight = hasObstruction ? 60 : 20; // 60m hill if obstructed, 20m otherwise
    elevation += peakHeight * Math.sin(Math.PI * fraction); 
    
    data.push({ location: { lat, lng }, elevation });
  }
  return data;
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
    // In a real app, call Google Elevation API here. For now, use mock data.
    const elevationData = await getMockElevationData(params.pointA, params.pointB, 100);
    
    const result = analyzeLOS(params, elevationData);
    return { ...result, message: `${result.message} Using mock elevation data.` };

  } catch (err) {
    console.error("Error during LOS analysis:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
    return { error: `Analysis failed: ${errorMessage}` };
  }
}
