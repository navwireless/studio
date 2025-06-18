
import { z } from 'zod';

// Simplified PointInputSchema for Fiber Calculator (no tower height)
export const PointInputSchema_FC = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  lat: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  }, "Latitude must be between -90 and 90"),
  lng: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  }, "Longitude must be between -180 and 180"),
});

export const FiberCalculatorFormSchema = z.object({
  pointA: PointInputSchema_FC,
  pointB: PointInputSchema_FC,
  fiberSnapRadius: z.coerce // coerce to number
    .number({
        required_error: "Snap radius is required",
        invalid_type_error: "Snap radius must be a number",
    })
    .min(1, "Snap radius must be at least 1 meter.")
    .max(10000, "Snap radius seems too large (max 10,000m)."), // Example max, adjust as needed
});

export type FiberCalculatorFormValues = z.infer<typeof FiberCalculatorFormSchema>;

export const defaultFiberCalculatorFormValues: FiberCalculatorFormValues = {
  pointA: { name: 'Site A', lat: '', lng: '' },
  pointB: { name: 'Site B', lat: '', lng: '' },
  fiberSnapRadius: 500, // Default snap radius in meters
};
