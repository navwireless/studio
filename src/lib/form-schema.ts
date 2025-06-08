
import { z } from 'zod';
import type { AnalysisFormValues } from '@/types';

const coordinatePairSchema = z.string().refine(val => {
  if (!val.includes(',')) return false;
  const parts = val.split(',').map(part => part.trim());
  if (parts.length !== 2) return false;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  return !isNaN(lat) && lat >= -90 && lat <= 90 && !isNaN(lng) && lng >= -180 && lng <= 180;
}, "Enter as 'lat, lng' (e.g., 20.5, 78.9). Latitude must be -90 to 90, Longitude -180 to 180.");

export const PointInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  coordinates: coordinatePairSchema,
  height: z.coerce.number({
    required_error: "Tower height is required",
    invalid_type_error: "Tower height must be a number",
  }).min(0, "Minimum tower height is 0m").max(100, "Maximum tower height is 100m"),
});

export const AnalysisFormSchema = z.object({
  pointA: PointInputSchema,
  pointB: PointInputSchema,
  clearanceThreshold: z.coerce.number().min(0, "Clearance threshold must be a non-negative number"),
});

export const defaultFormStateValues: AnalysisFormValues = {
  pointA: { name: 'Site A', coordinates: '', height: 20 },
  pointB: { name: 'Site B', coordinates: '', height: 20 },
  clearanceThreshold: 10, // Changed from '10' to 10
};
