
"use client";

import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';
import type { AnalysisFormValues } from '@/types';

const PointInputSchemaClient = z.object({
  lat: z.string().min(1, "Latitude is required").refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Must be -90 to 90"),
  lng: z.string().min(1, "Longitude is required").refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Must be -180 to 180"),
  height: z.string().min(1, "Tower height is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
});

const AnalysisFormSchemaClient = z.object({
  pointA: PointInputSchemaClient,
  pointB: PointInputSchemaClient,
  clearanceThreshold: z.string().min(1, "Clearance threshold is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
});

interface InputFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  initialErrors?: Record<string, string[] | undefined>;
}

export default function InputForm({ onSubmit, isLoading, initialErrors }: InputFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchemaClient),
    defaultValues: {
      pointA: { lat: '32.23085', lng: '76.144608', height: '20' }, // Updated Point A
      pointB: { lat: '32.231875', lng: '76.151969', height: '20' }, // Updated Point B
      clearanceThreshold: '10',
    },
  });

  const processSubmit: SubmitHandler<AnalysisFormValues> = async (data) => {
    const formData = new FormData();
    formData.append('pointA.lat', data.pointA.lat);
    formData.append('pointA.lng', data.pointA.lng);
    formData.append('pointA.height', data.pointA.height);
    formData.append('pointB.lat', data.pointB.lat);
    formData.append('pointB.lng', data.pointB.lng);
    formData.append('pointB.height', data.pointB.height);
    formData.append('clearanceThreshold', data.clearanceThreshold);
    await onSubmit(formData);
  };
  
  // Combine server and client errors
  const getCombinedError = (fieldError?: { message?: string }, serverError?: string[]) => {
    if (serverError && serverError.length > 0) return serverError.join(', ');
    return fieldError?.message;
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>Analysis Parameters</CardTitle>
        <CardDescription>Enter coordinates and parameters for LOS analysis.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(processSubmit)}>
        <CardContent className="space-y-6">
          {/* Point A */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">Point A</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pointA.lat">Latitude (degrees)</Label>
                <Input id="pointA.lat" {...register('pointA.lat')} placeholder="-90 to 90" />
                {(errors.pointA?.lat || initialErrors?.['pointA.lat']) && <p className="text-sm text-destructive mt-1">{getCombinedError(errors.pointA?.lat, initialErrors?.['pointA.lat'])}</p>}
              </div>
              <div>
                <Label htmlFor="pointA.lng">Longitude (degrees)</Label>
                <Input id="pointA.lng" {...register('pointA.lng')} placeholder="-180 to 180" />
                {(errors.pointA?.lng || initialErrors?.['pointA.lng']) && <p className="text-sm text-destructive mt-1">{getCombinedError(errors.pointA?.lng, initialErrors?.['pointA.lng'])}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="pointA.height">Tower Height (meters)</Label>
              <Input id="pointA.height" type="number" step="any" {...register('pointA.height')} placeholder="e.g., 20" />
              {(errors.pointA?.height || initialErrors?.['pointA.height']) && <p className="text-sm text-destructive mt-1">{getCombinedError(errors.pointA?.height, initialErrors?.['pointA.height'])}</p>}
            </div>
          </div>

          {/* Point B */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-primary">Point B</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pointB.lat">Latitude (degrees)</Label>
                <Input id="pointB.lat" {...register('pointB.lat')} placeholder="-90 to 90" />
                {(errors.pointB?.lat || initialErrors?.['pointB.lat']) && <p className="text-sm text-destructive mt-1">{getCombinedError(errors.pointB?.lat, initialErrors?.['pointB.lat'])}</p>}
              </div>
              <div>
                <Label htmlFor="pointB.lng">Longitude (degrees)</Label>
                <Input id="pointB.lng" {...register('pointB.lng')} placeholder="-180 to 180" />
                {(errors.pointB?.lng || initialErrors?.['pointB.lng']) && <p className="text-sm text-destructive mt-1">{getCombinedError(errors.pointB?.lng, initialErrors?.['pointB.lng'])}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="pointB.height">Tower Height (meters)</Label>
              <Input id="pointB.height" type="number" step="any" {...register('pointB.height')} placeholder="e.g., 20" />
              {(errors.pointB?.height || initialErrors?.['pointB.height']) && <p className="text-sm text-destructive mt-1">{getCombinedError(errors.pointB?.height, initialErrors?.['pointB.height'])}</p>}
            </div>
          </div>

          {/* Clearance Threshold */}
          <div className="space-y-2">
            <Label htmlFor="clearanceThreshold">Clearance Threshold (meters)</Label>
            <Input id="clearanceThreshold" type="number" step="any" {...register('clearanceThreshold')} placeholder="e.g., 10" />
            {(errors.clearanceThreshold || initialErrors?.['clearanceThreshold']) && <p className="text-sm text-destructive mt-1">{getCombinedError(errors.clearanceThreshold, initialErrors?.['clearanceThreshold'])}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            Analyze LOS
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
