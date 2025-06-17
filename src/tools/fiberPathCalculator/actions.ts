// src/tools/fiberPathCalculator/actions.ts
"use server";

import type { FiberCalculatorParams, FiberPathResult } from './types';
import { calculateFiberPath } from './calculator';

/**
 * Server Action to perform fiber path analysis.
 * This action wraps the core calculation logic and handles API key access securely on the server.
 */
export async function performFiberPathAnalysisAction(
  params: FiberCalculatorParams
): Promise<FiberPathResult> {
  // Basic validation, more can be added
  if (!params || !params.pointA || !params.pointB || params.radiusMeters === undefined) {
    return {
      status: 'input_error',
      errorMessage: 'Invalid parameters provided for fiber path analysis.',
      pointA_original: params?.pointA,
      pointB_original: params?.pointB,
      losFeasible: params?.isLosFeasible || false,
      radiusMetersUsed: params?.radiusMeters || 0,
    };
  }

  // The GOOGLE_DIRECTIONS_API_KEY is accessed within calculateFiberPath from process.env
  // No need to pass it explicitly here.

  try {
    const result = await calculateFiberPath(params);
    return result;
  } catch (error: any) {
    console.error("performFiberPathAnalysisAction caught an error:", error);
    return {
      status: 'api_error',
      errorMessage: `Server error during fiber path analysis: ${error.message || 'Unknown error'}`,
      pointA_original: params.pointA,
      pointB_original: params.pointB,
      losFeasible: params.isLosFeasible,
      radiusMetersUsed: params.radiusMeters,
    };
  }
}
