import { z } from 'zod';
import type { AnalysisFormValues } from '@/types';

/**
 * Zod schema for validating a single point input (name, coordinates, tower height).
 * Coordinates are validated as strings that parse to numbers within geographic bounds.
 */
export const PointInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  lat: z.string().refine(
    val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    },
    'Latitude must be between -90 and 90'
  ),
  lng: z.string().refine(
    val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    },
    'Longitude must be between -180 and 180'
  ),
  height: z
    .number({
      required_error: 'Tower height is required',
      invalid_type_error: 'Tower height must be a number',
    })
    .min(0, 'Minimum tower height is 0m')
    .max(100, 'Maximum tower height is 100m'),
});

/**
 * Zod schema for the complete LOS analysis form.
 * Validates both point inputs and the clearance threshold.
 */
export const AnalysisFormSchema = z.object({
  pointA: PointInputSchema,
  pointB: PointInputSchema,
  clearanceThreshold: z.string().refine(
    val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    },
    'Clearance threshold must be a non-negative number'
  ),
});

/**
 * Default form values for the analysis form.
 * Used for initial form state and form reset operations.
 */
export const defaultFormStateValues: AnalysisFormValues = {
  pointA: { name: 'Site A', lat: '', lng: '', height: 20 },
  pointB: { name: 'Site B', lat: '', lng: '', height: 20 },
  clearanceThreshold: '10',
};