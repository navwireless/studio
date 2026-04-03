"use client";

import React, { useState, useEffect } from 'react';
import BulkAnalysisMap from '@/components/bulk-los/BulkAnalysisMap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { KmzPlacemark } from '@/lib/kmz-parser';
import { calculateDistanceKm, analyzeLOS } from '@/lib/los-calculator';
import type { AnalysisParams, ElevationSampleAPI, BulkAnalysisResultItem } from '@/types';
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

import { ErrorBoundary } from '@/components/error-boundary';
import { MapErrorBoundary } from '@/components/map-error-boundary';

import { performFiberPathAnalysisAction } from '@/tools/fiberPathCalculator';

import { useAuth } from '@/hooks/use-auth';
import ProUpsellModal from '@/components/pro-upsell-modal';

const LOCAL_STORAGE_KEYS_BULK = {
  FIBER_TOGGLE_BULK: 'fiberPathEnabledBulk',
  FIBER_RADIUS_BULK: 'fiberPathRadiusMetersBulk',
};

const BulkAnalysisFormSchema = z.object({
  globalTowerHeight: z.coerce.number().min(0, "Tower height must be non-negative.").max(200, "Tower height seems too high (max 200m)."),
  globalFresnelHeight: z.coerce.number().min(0, "Fresnel height (clearance) must be non-negative.").max(100, "Fresnel height seems too high (max 100m)."),
  losCheckRadiusKm: z.coerce.number().min(0.1, "Check radius must be at least 0.1 km.").max(100, "Check radius too large (max 100km)."),
});

export type BulkAnalysisFormValues = z.infer<typeof BulkAnalysisFormSchema>;

export default function BulkLosAnalyzerPage() {
  const { toast } = useToast();
  const { plan } = useAuth();
  const [kmzPlacemarks, setKmzPlacemarks] = useState<KmzPlacemark[]>([]);
  const [kmzFile, setKmzFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [bulkResults, setBulkResults] = useState<BulkAnalysisResultItem[]>([]);
  const [showProGate, setShowProGate] = useState(false);

  const [isClient, setIsClient] = useState(false);

  const [calculateFiberPathBulkEnabled, setCalculateFiberPathBulkEnabled] = useState<boolean>(false);
  const [fiberRadiusMetersBulk, setFiberRadiusMetersBulk] = useState<number>(500);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show pro gate for free users
  useEffect(() => {
    if (isClient && plan === 'free') {
      setShowProGate(true);
    }
  }, [isClient, plan]);

  useEffect(() => {
    if (isClient) {
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
    // Block free users
    if (plan === 'free') {
      setShowProGate(true);
      return;
    }

    if (kmzPlacemarks.length < 2) {
      toast({ title: "Not Enough Points", description: "Please upload a KMZ file with at least two placemarks.", variant: "destructive" });
      return;
    }
    if (!kmzFile) {
      toast({ title: "No KMZ File", description: "Please select a KMZ file.", variant: "destructive" });
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

    const tempResults: BulkAnalysisResultItem[] = [];
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
      setProgress(100);
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
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEYS_BULK.FIBER_TOGGLE_BULK, JSON.stringify(checked));
    }
  };

  const handleFiberRadiusMetersBulkChange = (value: string) => {
    const newRadius = parseInt(value, 10);
    if (!isNaN(newRadius) && newRadius >= 0) {
      setFiberRadiusMetersBulk(newRadius);
      if (isClient) {
        localStorage.setItem(LOCAL_STORAGE_KEYS_BULK.FIBER_RADIUS_BULK, newRadius.toString());
      }
    }
  };

  if (!isClient) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-12 w-12 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />

      {/* Pro gate modal for free users */}
      <ProUpsellModal
        open={showProGate}
        onOpenChange={setShowProGate}
        blocking={false}
        trigger="bulk_gate"
      />

      <ErrorBoundary>
        <div className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden bg-surface-base">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
            <Card className="shadow-xl bg-surface-card border-surface-border flex flex-col overflow-hidden max-h-[calc(100vh-theme(spacing.24))] overflow-y-auto custom-scrollbar">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl text-text-brand-primary">Bulk Line-of-Sight Analyzer</CardTitle>
                <CardDescription className="text-text-brand-muted">
                  Upload a KMZ file, set parameters, and analyze LOS for multiple point pairs. Optionally calculate fiber paths.
                  {plan === 'free' && (
                    <span className="block mt-1 text-purple-400 font-medium">
                      ⚡ This feature requires a Pro subscription.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 grid grid-cols-1 gap-6">
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
                  <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[50vh]">
                    <Separator className="my-4 xl:col-span-2 bg-surface-border" />
                    <h3 className="text-lg font-semibold mb-2 xl:col-span-2 text-text-brand-primary">Visualizations & Analytics</h3>
                    <MapErrorBoundary>
                      <BulkAnalysisMap placemarks={kmzPlacemarks} results={bulkResults} />
                    </MapErrorBoundary>
                    <BulkAnalysisAnalytics results={bulkResults} />
                  </div>
                )}

                {bulkResults.length > 0 && !isProcessing && (
                  <div className="mt-6">
                    <Separator className="my-4 bg-surface-border" />
                    <BulkAnalysisResultsTable results={bulkResults} analysisParams={form.getValues()} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
}