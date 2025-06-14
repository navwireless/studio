
"use client";

import React from 'react';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';
import type { BulkAnalysisFormValues } from '@/app/bulk-los-analyzer/page';

interface BulkAnalysisParametersProps {
  control: Control<BulkAnalysisFormValues>;
  register: UseFormRegister<BulkAnalysisFormValues>;
  errors: FieldErrors<BulkAnalysisFormValues>;
}

const BulkAnalysisParameters: React.FC<BulkAnalysisParametersProps> = ({ control, register, errors }) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Target className="mr-2 h-5 w-5 text-primary" />
          Analysis Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="globalTowerHeight">Global Tower Height (meters)</Label>
          <Input 
            id="globalTowerHeight" 
            type="number" 
            {...register("globalTowerHeight")} 
            className="mt-1 bg-input/70" 
            placeholder="e.g., 20"
          />
          {errors.globalTowerHeight && <p className="text-destructive text-sm mt-1">{errors.globalTowerHeight.message}</p>}
        </div>
        <div>
          <Label htmlFor="globalFresnelHeight">Global Fresnel/Clearance Height (meters)</Label>
          <Input 
            id="globalFresnelHeight" 
            type="number" 
            {...register("globalFresnelHeight")} 
            className="mt-1 bg-input/70"
            placeholder="e.g., 10"
          />
          {errors.globalFresnelHeight && <p className="text-destructive text-sm mt-1">{errors.globalFresnelHeight.message}</p>}
        </div>
        <div>
          <Label htmlFor="losCheckRadiusKm">LOS Check Radius (kilometers)</Label>
          <Input 
            id="losCheckRadiusKm" 
            type="number" 
            step="0.1" 
            {...register("losCheckRadiusKm")} 
            className="mt-1 bg-input/70"
            placeholder="e.g., 10"
          />
          {errors.losCheckRadiusKm && <p className="text-destructive text-sm mt-1">{errors.losCheckRadiusKm.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkAnalysisParameters;
