
"use client";

import React, { useState, useEffect, useActionState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import AppHeader from '@/components/layout/app-header';
import AppSidebar, { type ActiveTool } from '@/components/layout/app-sidebar';
import ResultsDisplay from '@/components/fso/results-display';
import InteractiveMap from '@/components/fso/interactive-map';
// import ElevationProfileChart from '@/components/fso/elevation-profile-chart'; // Removed import
import BulkAnalysisView from '@/components/fso/bulk-analysis-view';
import ProductCatalog from '@/components/fso/product-catalog'; // New import
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, AnalysisFormValues } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider'; // New import
import { Loader2, Zap, Target, Info, ChevronUp, ChevronDown, ShoppingCart } from 'lucide-react';

// Zod schema for individual point, including Name
const StationPointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lat: z.string().min(1, "Latitude is required").refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Must be -90 to 90"),
  lng: z.string().min(1, "Longitude is required").refine(val => !isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Must be -180 to 180"),
  height: z.string().min(1, "Tower height is required")
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 10 && parseFloat(val) <= 200, "Must be between 10 and 200"),
});

// Updated Zod schema for the whole form
const PageAnalysisFormSchema = z.object({
  pointA: StationPointSchema,
  pointB: StationPointSchema,
  clearanceThreshold: z.string().min(1, "Clearance is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0"),
});

type PageAnalysisFormValues = z.infer<typeof PageAnalysisFormSchema>;

export default function Home() {
  const initialState: AnalysisResult | { error: string; fieldErrors?: any } = { error: "No analysis performed yet." };
  const [serverState, formAction] = useActionState(performLosAnalysis, initialState);
  
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);

  const [isPointACollapsed, setIsPointACollapsed] = useState(false);
  const [isPointBCollapsed, setIsPointBCollapsed] = useState(false);
  const [isProductCatalogCollapsed, setIsProductCatalogCollapsed] = useState(true); // New state
  const [activeTool, setActiveTool] = useState<ActiveTool>('singleLink');

  const { register, handleSubmit, formState: { errors: clientFormErrors }, getValues, control } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: {
      pointA: { name: 'Site A', lat: '32.23085', lng: '76.144608', height: '20' },
      pointB: { name: 'Site B', lat: '32.231875', lng: '76.151969', height: '20' },
      clearanceThreshold: '10',
    },
  });

  const processSubmit = async (data: PageAnalysisFormValues) => {
    setIsLoading(true);
    setClientError(null);
    setFormErrors(undefined);
    setAnalysisResult(null); 

    const formData = new FormData();
    formData.append('pointA.name', data.pointA.name);
    formData.append('pointA.lat', data.pointA.lat);
    formData.append('pointA.lng', data.pointA.lng);
    formData.append('pointA.height', data.pointA.height);
    formData.append('pointB.name', data.pointB.name);
    formData.append('pointB.lat', data.pointB.lat);
    formData.append('pointB.lng', data.pointB.lng);
    formData.append('pointB.height', data.pointB.height);
    formData.append('clearanceThreshold', data.clearanceThreshold);
    
    await formAction(formData);
  };
  
  useEffect(() => {
    setIsLoading(false);
    if (serverState) {
      if ('error' in serverState && serverState.error) {
        setClientError(serverState.error);
        if (serverState.fieldErrors) {
          setFormErrors(serverState.fieldErrors as Record<string, string[] | undefined>);
        } else {
          setFormErrors(undefined);
        }
        setAnalysisResult(null); 
      } else if (!('error' in serverState)) {
        const resultData = serverState as AnalysisResult;
        const formValues = getValues();
        setAnalysisResult({
            ...resultData,
            pointA: { 
                ...resultData.pointA, 
                name: formValues.pointA.name,
                lat: parseFloat(formValues.pointA.lat),
                lng: parseFloat(formValues.pointA.lng),
                towerHeight: parseFloat(formValues.pointA.height)
            },
            pointB: { 
                ...resultData.pointB, 
                name: formValues.pointB.name,
                lat: parseFloat(formValues.pointB.lat),
                lng: parseFloat(formValues.pointB.lng),
                towerHeight: parseFloat(formValues.pointB.height)
            }
        });
        setClientError(null);
        setFormErrors(undefined);
      }
    }
  }, [serverState, getValues]);

  const getCombinedError = (clientFieldError?: { message?: string }, serverFieldError?: string[]) => {
    if (serverFieldError && serverFieldError.length > 0) return serverFieldError.join(', ');
    return clientFieldError?.message;
  };

  const stationInputCard = (id: 'pointA' | 'pointB', title: string, isCollapsed: boolean, toggleCollapse: () => void) => (
    <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border w-[350px] max-h-[calc(90vh-120px)] overflow-y-auto">
      <CardHeader className="py-3 px-4 sticky top-0 bg-card/90 backdrop-blur-sm z-10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Target className="mr-2 h-5 w-5 text-primary" /> {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={toggleCollapse} className="text-muted-foreground hover:text-foreground">
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </Button>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="px-4 pb-4 space-y-3">
          <div>
            <Label htmlFor={`${id}.name`} className="text-xs">Name</Label>
            <Input id={`${id}.name`} {...register(`${id}.name`)} placeholder="e.g. Main Site" className="mt-1 bg-input/70" />
            {(clientFormErrors[id]?.name || formErrors?.[`${id}.name`]) && <p className="text-sm text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.name, formErrors?.[`${id}.name`])}</p>}
          </div>
          <div>
            <Label htmlFor={`${id}.lat`} className="text-xs">Latitude</Label>
            <Input id={`${id}.lat`} {...register(`${id}.lat`)} placeholder="-90 to 90" className="mt-1 bg-input/70" />
            {(clientFormErrors[id]?.lat || formErrors?.[`${id}.lat`]) && <p className="text-sm text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.lat, formErrors?.[`${id}.lat`])}</p>}
          </div>
          <div>
            <Label htmlFor={`${id}.lng`} className="text-xs">Longitude</Label>
            <Input id={`${id}.lng`} {...register(`${id}.lng`)} placeholder="-180 to 180" className="mt-1 bg-input/70" />
            {(clientFormErrors[id]?.lng || formErrors?.[`${id}.lng`]) && <p className="text-sm text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.lng, formErrors?.[`${id}.lng`])}</p>}
          </div>
          <div>
            <Label htmlFor={`${id}.height-input`} className="text-xs">Tower Height (m)</Label>
            <Controller
              name={`${id}.height`}
              control={control}
              render={({ field }) => (
                <div className="mt-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`${id}.height-input`}
                      type="number"
                      min="10"
                      max="200"
                      step="1"
                      className="w-24 bg-input/70"
                      value={field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Allow empty input for typing, or valid numbers
                        if (val === "" || (Number(val) >= 10 && Number(val) <= 200)) {
                           field.onChange(val);
                        } else if (Number(val) < 10) {
                           field.onChange("10");
                        } else if (Number(val) > 200) {
                           field.onChange("200");
                        }
                      }}
                      onBlur={(e) => { // Ensure value is valid on blur
                        const numValue = parseFloat(field.value);
                        if (isNaN(numValue) || numValue < 10) field.onChange("10");
                        else if (numValue > 200) field.onChange("200");
                      }}
                    />
                    <Slider
                      value={[parseFloat(field.value) || 10]}
                      onValueChange={(value) => field.onChange(String(value[0]))}
                      min={10}
                      max={200}
                      step={1}
                      className="flex-1"
                      aria-labelledby={`label-${id}-height`}
                    />
                  </div>
                </div>
              )}
            />
            {(clientFormErrors[id]?.height || formErrors?.[`${id}.height`]) && <p className="text-sm text-destructive mt-1">{getCombinedError(clientFormErrors[id]?.height, formErrors?.[`${id}.height`])}</p>}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar activeTool={activeTool} onToolChange={setActiveTool} />
        <main className="flex-1 relative overflow-hidden">
          {activeTool === 'singleLink' && (
            <>
              <InteractiveMap
                pointA={analysisResult?.pointA}
                pointB={analysisResult?.pointB}
                losPossible={analysisResult?.losPossible}
              />

              {/* Point A Configuration Overlay */}
              <div className="absolute top-4 left-4 z-10">
                {stationInputCard('pointA', "Site A Configuration", isPointACollapsed, () => setIsPointACollapsed(!isPointACollapsed))}
              </div>

              {/* Point B Configuration Overlay */}
              <div className="absolute top-4 right-4 z-10">
                {stationInputCard('pointB', "Site B Configuration", isPointBCollapsed, () => setIsPointBCollapsed(!isPointBCollapsed))}
              </div>

              {/* Product Catalog Overlay */}
              <div className="absolute top-[calc(4rem+20px+280px)] left-4 z-10 md:top-auto md:bottom-4 md:left-4 w-[350px]"> 
                {/* Position adjusted, might need further refinement based on actual Point A card height */}
                <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border max-h-[calc(90vh-120px-300px)] overflow-y-auto"> {/* Max height adjusted */}
                  <CardHeader 
                    className="py-3 px-4 sticky top-0 bg-card/90 backdrop-blur-sm z-10 cursor-pointer"
                    onClick={() => setIsProductCatalogCollapsed(!isProductCatalogCollapsed)}
                  >
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5 text-primary" /> Product Catalog
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        {isProductCatalogCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                      </Button>
                    </div>
                  </CardHeader>
                  {!isProductCatalogCollapsed && (
                    <CardContent className="px-4 pb-4">
                      <ProductCatalog />
                    </CardContent>
                  )}
                </Card>
              </div>
              
              {/* Global Settings & Action Overlay */}
              <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-card/80 backdrop-blur-sm border-border shadow-xl p-3 flex items-end gap-3">
                <div>
                  <Label htmlFor="clearanceThreshold" className="text-xs">Fresnel Clearance (m)</Label>
                  <Input id="clearanceThreshold" type="number" step="any" {...register('clearanceThreshold')} placeholder="e.g., 10" className="mt-1 w-32 bg-input/70" />
                  {(clientFormErrors.clearanceThreshold || formErrors?.clearanceThreshold) && <p className="text-sm text-destructive mt-1">{getCombinedError(clientFormErrors.clearanceThreshold, formErrors?.clearanceThreshold)}</p>}
                </div>
                <Button onClick={handleSubmit(processSubmit)} disabled={isLoading} className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
                  Analyze LOS
                </Button>
              </Card>

              {/* Results Display Overlay */}
              {analysisResult && !clientError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[400px]">
                  <ResultsDisplay result={analysisResult} />
                </div>
              )}
              {clientError && (
                 <Card className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[400px] shadow-lg border-destructive bg-card/80 backdrop-blur-sm">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-destructive text-base flex items-center"><Info className="mr-2 h-5 w-5" /> Error</CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                        <p className="text-sm">{clientError}</p>
                        {formErrors && Object.keys(formErrors).length > 0 && (
                           <ul className="list-disc list-inside mt-2 text-xs">
                               {Object.entries(formErrors).map(([field, errors]) => 
                                   errors?.map((error, index) => <li key={`${field}-${index}`}>{`${field.replace('pointA.','A: ').replace('pointB.','B: ')}: ${error}`}</li>)
                               )}
                           </ul>
                        )}
                    </CardContent>
                 </Card>
              )}
              {isLoading && !analysisResult && !clientError && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[400px]">
                    <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
                        <CardHeader className="py-3 px-4"><CardTitle className="text-base">Analysis Results</CardTitle></CardHeader>
                        <CardContent className="px-4 pb-3 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                </div>
              )}

              {/* Elevation Profile Chart Overlay - REMOVED */}
              {/* 
              <div className="absolute bottom-0 left-0 right-0 z-10 p-1 md:p-2">
                {isLoading && (!analysisResult || !analysisResult.profile || analysisResult.profile.length === 0) && (
                  <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border">
                      <CardHeader className="py-2 px-4"><CardTitle className="text-base">Elevation Profile</CardTitle></CardHeader>
                      <CardContent className="px-4 pb-2"><Skeleton className="h-[150px] w-full rounded-md" /></CardContent>
                  </Card>
                )}
                {!isLoading && analysisResult && analysisResult.profile && analysisResult.profile.length > 0 && (
                  <ElevationProfileChart 
                    profile={analysisResult.profile} 
                    pointAName={analysisResult.pointA?.name || 'Site A'}
                    pointBName={analysisResult.pointB?.name || 'Site B'}
                  />
                )}
                {!isLoading && (!analysisResult || !analysisResult.profile || analysisResult.profile.length === 0) && !clientError && (
                  <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border">
                      <CardHeader className="py-2 px-4">
                          <CardTitle className="text-base">Elevation Profile</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[150px] flex items-center justify-center px-4 pb-2">
                          <p className="text-muted-foreground text-sm">
                              Submit an analysis to view the elevation profile.
                          </p>
                      </CardContent>
                  </Card>
                )}
                 {!isLoading && clientError && (!analysisResult || !analysisResult.profile || analysisResult.profile.length === 0) && (
                   <Card className="shadow-xl bg-card/80 backdrop-blur-sm border-border">
                    <CardHeader className="py-2 px-4">
                        <CardTitle className="text-base">Elevation Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[150px] flex items-center justify-center px-4 pb-2">
                        <p className="text-muted-foreground text-sm">
                            Analysis could not be completed. Profile not available.
                        </p>
                    </CardContent>
                   </Card>
                 )}
              </div> 
              */}
            </>
          )}
          {activeTool === 'bulkAnalysis' && (
            <BulkAnalysisView />
          )}
          {(activeTool === 'sites' || activeTool === 'links' || activeTool === 'devices' || activeTool === 'coverage') && (
            <div className="p-8">
              <h2 className="text-2xl font-semibold mb-4">
                {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} (Placeholder)
              </h2>
              <p>This section is a placeholder for the '{activeTool}' functionality.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
