
"use client";

import React, { useState, useCallback, useEffect } from 'react';
// Removed dynamic import for BulkAnalysisMap
import BulkAnalysisMap from '@/components/bulk-los/BulkAnalysisMap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { KmzPlacemark } from '@/lib/kmz-parser';
import { calculateDistanceKm, analyzeLOS } from '@/lib/los-calculator';
import type { AnalysisParams, LOSPoint, PointCoordinates, ElevationSampleAPI } from '@/types';
import { getElevationProfileForPairAction } from './actions';
import AppHeader from '@/components/layout/app-header';

import BulkAnalysisUploader from '@/components/bulk-los/BulkAnalysisUploader';
import BulkAnalysisParameters from '@/components/bulk-los/BulkAnalysisParameters';
import BulkAnalysisActions from '@/components/bulk-los/BulkAnalysisActions';
import BulkAnalysisResultsTable from '@/components/bulk-los/BulkAnalysisResultsTable';
import BulkAnalysisDownloads from '@/components/bulk-los/BulkAnalysisDownloads';
import BulkAnalysisAnalytics from '@/components/bulk-los/BulkAnalysisAnalytics';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator';
import type { FiberPathResult, FiberPathSegment } from '@/tools/fiberPathCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LOCAL_STORAGE_KEYS_BULK = {
  FIBER_TOGGLE_BULK: 'fiberPathEnabledBulk',
  FIBER_RADIUS_BULK: 'fiberPathRadiusMetersBulk',
  AUTH_TOKEN_BULK: 'bulk-analyzer-auth-token',
};

const BulkAnalysisFormSchema = z.object({
  globalTowerHeight: z.coerce.number().min(0, "Tower height must be non-negative.").max(200, "Tower height seems too high (max 200m)."),
  globalFresnelHeight: z.coerce.number().min(0, "Fresnel height (clearance) must be non-negative.").max(100, "Fresnel height seems too high (max 100m)."),
  losCheckRadiusKm: z.coerce.number().min(0.1, "Check radius must be at least 0.1 km.").max(100, "Check radius too large (max 100km)."),
});

export type BulkAnalysisFormValues = z.infer<typeof BulkAnalysisFormSchema>;

export interface BulkAnalysisResultItem {
  id: string;
  pointAName: string;
  pointACoords: string; 
  pointBName: string;
  pointBCoords: string; 
  towerHeightUsed: number;
  fresnelHeightUsed: number;
  aerialDistanceKm: number;
  losPossible: boolean;
  minClearanceActual: number | null;
  additionalHeightNeeded: number | null;
  remarks: string;
  pointA: PointCoordinates & { name: string; towerHeight: number };
  pointB: PointCoordinates & { name: string; towerHeight: number };
  profile?: LOSPoint[];
  // Fiber Path related fields
  fiberPathStatus?: FiberPathResult['status'] | null;
  fiberPathTotalDistanceMeters?: number | null;
  fiberPathErrorMessage?: string | null;
  fiberPathSegments?: FiberPathSegment[] | null;
  // Fields for KMZ path reconstruction for fiber, if snapped points are different
  pointA_snappedToRoad?: PointCoordinates;
  pointB_snappedToRoad?: PointCoordinates;
}

const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});
type LoginFormValues = z.infer<typeof LoginSchema>;


export default function BulkLosAnalyzerPage() {
  const { toast } = useToast();
  const [kmzPlacemarks, setKmzPlacemarks] = useState<KmzPlacemark[]>([]);
  const [kmzFile, setKmzFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Covers both LOS and Fiber processing phases
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [bulkResults, setBulkResults] = useState<BulkAnalysisResultItem[]>([]);
  
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Initialize with static defaults for SSR and initial client render
  const [calculateFiberPathBulkEnabled, setCalculateFiberPathBulkEnabled] = useState<boolean>(false);
  const [fiberRadiusMetersBulk, setFiberRadiusMetersBulk] = useState<number>(500);

  // Effect to sync with localStorage after client-side mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (localStorage.getItem(LOCAL_STORAGE_KEYS_BULK.AUTH_TOKEN_BULK) === 'true') {
          setIsAuthenticated(true);
      }
      const storedToggle = localStorage.getItem(LOCAL_STORAGE_KEYS_BULK.FIBER_TOGGLE_BULK);
      if (storedToggle) {
        setCalculateFiberPathBulkEnabled(JSON.parse(storedToggle));
      }
      const storedRadius = localStorage.getItem(LOCAL_STORAGE_KEYS_BULK.FIBER_RADIUS_BULK);
      if (storedRadius) {
        setFiberRadiusMetersBulk(parseInt(storedRadius, 10));
      }
    }
  }, [isClient]); 

  const form = useForm<BulkAnalysisFormValues>({
    resolver: zodResolver(BulkAnalysisFormSchema),
    defaultValues: {
      globalTowerHeight: 20,
      globalFresnelHeight: 10,
      losCheckRadiusKm: 10,
    },
    mode: 'onBlur',
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
        email: '',
        password: '',
    },
  });


  const handleLoginSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            toast({ title: "Login Successful", description: "Access granted." });
            localStorage.setItem(LOCAL_STORAGE_KEYS_BULK.AUTH_TOKEN_BULK, 'true');
            setIsAuthenticated(true);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || "Invalid credentials.");
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown login error occurred.";
        toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    } finally {
        setIsLoggingIn(false);
    }
  };


  const generateRemarks = (
    result: Omit<BulkAnalysisResultItem, 'remarks' | 'id' | 'pointACoords' | 'pointBCoords' | 'fiberPathStatus' | 'fiberPathTotalDistanceMeters' | 'fiberPathErrorMessage' | 'fiberPathSegments' | 'pointA_snappedToRoad' | 'pointB_snappedToRoad'>,
    params: AnalysisParams,
    fullAnalysisResult: ReturnType<typeof analyzeLOS>
  ): string => {
    if (result.losPossible) {
      return "OK";
    }
    let remark = "LOS Blocked.";
    if (fullAnalysisResult.minClearance !== null && fullAnalysisResult.profile.length > 0) {
      const criticalPoint = fullAnalysisResult.profile.reduce((prev, curr) => (curr.clearance < prev.clearance ? curr : prev));
      remark += ` Obstruction at ${criticalPoint.distance.toFixed(1)}km (Terrain: ${criticalPoint.terrainElevation.toFixed(1)}m, LOS: ${criticalPoint.losHeight.toFixed(1)}m). Actual min clearance: ${fullAnalysisResult.minClearance.toFixed(1)}m.`;
    }
    if (result.additionalHeightNeeded !== null && result.additionalHeightNeeded > 0) {
      remark += ` Additional height of ${result.additionalHeightNeeded.toFixed(1)}m needed for ${params.clearanceThreshold}m threshold.`;
    } else if (fullAnalysisResult.minClearance !== null && params.clearanceThreshold > fullAnalysisResult.minClearance) {
        const neededForThreshold = params.clearanceThreshold - fullAnalysisResult.minClearance;
         remark += ` Additional height of approx ${neededForThreshold.toFixed(1)}m needed for ${params.clearanceThreshold}m threshold.`;
    }
    return remark;
  };

  const handleAnalysisSubmit = async (data: BulkAnalysisFormValues) => {
    if (kmzPlacemarks.length < 2) {
      toast({ title: "Not Enough Points", description: "Please upload a KMZ file with at least two placemarks.", variant: "destructive" });
      return;
    }
    if (!kmzFile) {
      toast({ title: "No KMZ File", description: "Please select a KMZ file.", variant: "destructive"});
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingMessage('Starting LOS analysis...');
    setBulkResults([]); 

    const { globalTowerHeight, globalFresnelHeight, losCheckRadiusKm } = data;
    const pairsToAnalyze: Array<{ pA: KmzPlacemark, pB: KmzPlacemark }> = [];

    for (let i = 0; i < kmzPlacemarks.length; i++) {
      for (let j = i + 1; j < kmzPlacemarks.length; j++) {
        const pA = kmzPlacemarks[i];
        const pB = kmzPlacemarks[j];
        const distance = calculateDistanceKm({ lat: pA.lat, lng: pA.lng }, { lat: pB.lat, lng: pB.lng });
        if (distance <= losCheckRadiusKm) {
          pairsToAnalyze.push({ pA, pB });
        }
      }
    }

    if (pairsToAnalyze.length === 0) {
      toast({ title: "No Pairs Found", description: `No point pairs found within the specified ${losCheckRadiusKm}km radius. Try increasing the radius.`, variant: "default" });
      setIsProcessing(false);
      return;
    }

    let tempResults: BulkAnalysisResultItem[] = [];
    const totalPairs = pairsToAnalyze.length;

    // Phase 1: LOS Analysis
    for (let i = 0; i < totalPairs; i++) {
      const { pA, pB } = pairsToAnalyze[i];
      setProcessingMessage(`LOS Analysis: ${pA.name} ↔ ${pB.name} (${i + 1}/${totalPairs})`);
      
      try {
        const elevationProfileResponse = await getElevationProfileForPairAction(
          { lat: pA.lat, lng: pA.lng },
          { lat: pB.lat, lng: pB.lng }
        );

        if (elevationProfileResponse.error || !elevationProfileResponse.profile) {
          throw new Error(elevationProfileResponse.error || `Failed to get elevation profile for ${pA.name}-${pB.name}.`);
        }
        
        const elevationDataAPI: ElevationSampleAPI[] = elevationProfileResponse.profile;

        const analysisParams: AnalysisParams = {
          pointA: { lat: pA.lat, lng: pA.lng, towerHeight: globalTowerHeight, name: pA.name },
          pointB: { lat: pB.lat, lng: pB.lng, towerHeight: globalTowerHeight, name: pB.name },
          clearanceThreshold: globalFresnelHeight,
        };
        
        const singlePairAnalysis = analyzeLOS(analysisParams, elevationDataAPI);

        const resultItemBase = {
            pointAName: pA.name,
            pointBName: pB.name,
            pointA: { lat: pA.lat, lng: pA.lng, name: pA.name, towerHeight: globalTowerHeight },
            pointB: { lat: pB.lat, lng: pB.lng, name: pB.name, towerHeight: globalTowerHeight },
            towerHeightUsed: globalTowerHeight,
            fresnelHeightUsed: globalFresnelHeight,
            aerialDistanceKm: parseFloat(calculateDistanceKm(pA, pB).toFixed(2)),
            losPossible: singlePairAnalysis.losPossible,
            minClearanceActual: singlePairAnalysis.minClearance,
            additionalHeightNeeded: singlePairAnalysis.additionalHeightNeeded,
            profile: singlePairAnalysis.profile,
        };
        
        tempResults.push({
            ...resultItemBase,
            id: `${pA.name}_${pB.name}_${Date.now()}_${i}`,
            pointACoords: `${pA.lat.toFixed(6)}, ${pA.lng.toFixed(6)}`,
            pointBCoords: `${pB.lat.toFixed(6)}, ${pB.lng.toFixed(6)}`,
            remarks: generateRemarks(resultItemBase, analysisParams, singlePairAnalysis),
        });

      } catch (error) {
        console.error(`Error analyzing LOS for pair ${pA.name} - ${pB.name}:`, error);
        const distance = calculateDistanceKm({ lat: pA.lat, lng: pA.lng }, { lat: pB.lat, lng: pB.lng });
        tempResults.push({
          id: `${pA.name}_${pB.name}_${Date.now()}_${i}_error`,
          pointAName: pA.name,
          pointACoords: `${pA.lat.toFixed(6)}, ${pA.lng.toFixed(6)}`,
          pointBName: pB.name,
          pointBCoords: `${pB.lat.toFixed(6)}, ${pB.lng.toFixed(6)}`,
          towerHeightUsed: globalTowerHeight,
          fresnelHeightUsed: globalFresnelHeight,
          aerialDistanceKm: parseFloat(distance.toFixed(2)),
          losPossible: false,
          minClearanceActual: null,
          additionalHeightNeeded: null,
          remarks: `LOS Error: ${error instanceof Error ? error.message : 'Unknown analysis error.'}`,
          pointA: { lat: pA.lat, lng: pA.lng, name: pA.name, towerHeight: globalTowerHeight },
          pointB: { lat: pB.lat, lng: pB.lng, name: pB.name, towerHeight: globalTowerHeight },
        });
      }
      setProgress(Math.round(((i + 1) / totalPairs) * (calculateFiberPathBulkEnabled ? 50 : 100)));
      setBulkResults([...tempResults]); 
    }

    // Phase 2: Fiber Path Analysis (if enabled)
    if (calculateFiberPathBulkEnabled && tempResults.length > 0) {
      const losFeasibleLinks = tempResults.filter(r => r.losPossible);
      
      if (losFeasibleLinks.length > 0) {
        setProcessingMessage(`Calculating fiber paths for ${losFeasibleLinks.length} feasible links...`);
        
        for (let k = 0; k < losFeasibleLinks.length; k++) {
          const link = losFeasibleLinks[k];
          setProcessingMessage(`Fiber Path: ${link.pointAName} ↔ ${link.pointBName} (${k + 1}/${losFeasibleLinks.length})`);

          try {
            const fiberResult = await performFiberPathAnalysisAction(
              link.pointA.lat, link.pointA.lng,
              link.pointB.lat, link.pointB.lng,
              fiberRadiusMetersBulk,
              true 
            );

            const resultIndex = tempResults.findIndex(r => r.id === link.id);
            if (resultIndex !== -1) {
              tempResults[resultIndex] = {
                ...tempResults[resultIndex],
                fiberPathStatus: fiberResult.status,
                fiberPathTotalDistanceMeters: fiberResult.totalDistanceMeters,
                fiberPathErrorMessage: fiberResult.errorMessage,
                fiberPathSegments: fiberResult.segments,
                pointA_snappedToRoad: fiberResult.pointA_snappedToRoad,
                pointB_snappedToRoad: fiberResult.pointB_snappedToRoad,
              };
            }
          } catch (fiberError) {
            console.error(`Error calculating fiber path for ${link.pointAName} - ${link.pointBName}:`, fiberError);
            const resultIndex = tempResults.findIndex(r => r.id === link.id);
            if (resultIndex !== -1) {
              tempResults[resultIndex].fiberPathStatus = 'api_error';
              tempResults[resultIndex].fiberPathErrorMessage = fiberError instanceof Error ? fiberError.message : 'Unknown fiber calculation error.';
            }
          }
          setProgress(50 + Math.round(((k + 1) / losFeasibleLinks.length) * 50));
          setBulkResults([...tempResults]); 
        }
        setProcessingMessage(`Fiber path analysis complete for ${losFeasibleLinks.length} links.`);
      } else {
        setProcessingMessage('No LOS-feasible links found for fiber path calculation.');
        setProgress(100); 
      }
    } else if (!calculateFiberPathBulkEnabled) {
        setProgress(100); // If fiber not enabled, LOS progress completion means 100%
    }


    setBulkResults(tempResults); 
    setIsProcessing(false);
    
    let finalMessage = `LOS Analysis Complete. Processed ${totalPairs} pairs.`;
    if (calculateFiberPathBulkEnabled) {
        finalMessage += ` Fiber path analysis also performed.`;
    }
    setProcessingMessage(finalMessage);
    toast({ title: "Bulk Analysis Complete", description: finalMessage, duration: 7000 });
  };
  
  const handleKmzUploaded = (file: File, placemarks: KmzPlacemark[], fName: string) => {
    setKmzFile(file);
    setKmzPlacemarks(placemarks);
    setFileName(fName);
    setBulkResults([]); 
    setProgress(0);
    setProcessingMessage('');
  };

  const handleToggleFiberPathBulk = (checked: boolean) => {
    setCalculateFiberPathBulkEnabled(checked);
    if (isClient) { // Only access localStorage on client
      localStorage.setItem(LOCAL_STORAGE_KEYS_BULK.FIBER_TOGGLE_BULK, JSON.stringify(checked));
    }
  };

  const handleFiberRadiusMetersBulkChange = (value: string) => {
    const newRadius = parseInt(value, 10);
    if (!isNaN(newRadius) && newRadius >= 0) {
      setFiberRadiusMetersBulk(newRadius);
      if (isClient) { // Only access localStorage on client
        localStorage.setItem(LOCAL_STORAGE_KEYS_BULK.FIBER_RADIUS_BULK, newRadius.toString());
      }
    }
  };

  if (!isClient) {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  if (!isAuthenticated) {
    return (
        <>
            <AppHeader currentPage="bulk" />
            <div className="container mx-auto p-4 flex items-center justify-center h-[calc(100vh-theme(spacing.12)-theme(spacing.12))]">
                <Card className="max-w-md w-full shadow-2xl">
                    <CardHeader>
                        <CardTitle>Bulk Analyzer Access</CardTitle>
                        <CardDescription>Please log in to use the bulk analysis tool.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    {...loginForm.register('email')}
                                />
                                {loginForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...loginForm.register('password')}
                                />
                                {loginForm.formState.errors.password && (
                                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoggingIn}>
                                {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Login
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
  }


  return (
    <>
      <AppHeader currentPage="bulk" />
      <div className="container mx-auto p-2 sm:p-4 md:p-6 lg:p-8 h-[calc(100vh-theme(spacing.12)-theme(spacing.12))] overflow-y-auto custom-scrollbar">
        <Card className="max-w-7xl mx-auto shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Bulk Line-of-Sight Analyzer</CardTitle>
            <CardDescription>
              Upload a KMZ file, set parameters, and analyze LOS for multiple point pairs. Optionally calculate fiber paths.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <BulkAnalysisUploader onKmzUploaded={handleKmzUploaded} />
                <BulkAnalysisParameters 
                    control={form.control} 
                    register={form.register} 
                    errors={form.formState.errors}
                    calculateFiberPathBulkEnabled={calculateFiberPathBulkEnabled}
                    onToggleFiberPathBulk={handleToggleFiberPathBulk}
                    fiberRadiusMetersBulk={fiberRadiusMetersBulk}
                    onFiberRadiusMetersBulkChange={handleFiberRadiusMetersBulkChange}
                />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <BulkAnalysisActions
                  onAnalyze={form.handleSubmit(handleAnalysisSubmit)}
                  isProcessing={isProcessing}
                  processingMessage={processingMessage}
                  progress={progress}
                  canAnalyze={kmzPlacemarks.length >= 2 && !!kmzFile}
                />
                 <BulkAnalysisDownloads
                  results={bulkResults}
                  originalPlacemarks={kmzPlacemarks}
                  analysisParams={form.getValues()}
                  baseFileName={fileName ? fileName.replace(/\.[^/.]+$/, "") : 'bulk_analysis'}
                  disabled={isProcessing || bulkResults.length === 0}
                />
              </div>
            </div>
            
            {kmzPlacemarks.length > 0 && (
                <div className="mt-6">
                    <Separator className="my-4" />
                    <h3 className="text-lg font-semibold mb-2">Visualizations & Analytics</h3>
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <BulkAnalysisMap placemarks={kmzPlacemarks} results={bulkResults} />
                        <BulkAnalysisAnalytics results={bulkResults} />
                    </div>
                </div>
            )}

            {bulkResults.length > 0 && !isProcessing && (
              <div className="mt-6">
                <Separator className="my-4"/>
                <BulkAnalysisResultsTable results={bulkResults} analysisParams={form.getValues()} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

    
