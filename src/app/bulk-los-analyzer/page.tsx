
"use client";

import React, { useState, useCallback } from 'react';
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
import BulkAnalysisMap from '@/components/bulk-los/BulkAnalysisMap';
import BulkAnalysisAnalytics from '@/components/bulk-los/BulkAnalysisAnalytics';
import { Separator } from '@/components/ui/separator';

const isBrowser = typeof window !== 'undefined';

const BulkAnalysisFormSchema = z.object({
  globalTowerHeight: z.coerce.number().min(0, "Tower height must be non-negative.").max(200, "Tower height seems too high (max 200m)."),
  globalFresnelHeight: z.coerce.number().min(0, "Fresnel height (clearance) must be non-negative.").max(100, "Fresnel height seems too high (max 100m)."),
  losCheckRadiusKm: z.coerce.number().min(0.1, "Check radius must be at least 0.1 km.").max(100, "Check radius too large (max 100km)."),
  // KMZ file validation is handled by the Uploader component and its state
});

export type BulkAnalysisFormValues = z.infer<typeof BulkAnalysisFormSchema>;

export interface BulkAnalysisResultItem {
  id: string;
  pointAName: string;
  pointACoords: string; // "lat, lng"
  pointBName: string;
  pointBCoords: string; // "lat, lng"
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
}


export default function BulkLosAnalyzerPage() {
  const { toast } = useToast();
  const [kmzPlacemarks, setKmzPlacemarks] = useState<KmzPlacemark[]>([]);
  const [kmzFile, setKmzFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [bulkResults, setBulkResults] = useState<BulkAnalysisResultItem[]>([]);

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
    result: Omit<BulkAnalysisResultItem, 'remarks' | 'id' | 'pointACoords' | 'pointBCoords'>,
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
    setProcessingMessage('Starting analysis...');
    setBulkResults([]); // Clear previous results before starting a new analysis

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

    for (let i = 0; i < totalPairs; i++) {
      const { pA, pB } = pairsToAnalyze[i];
      setProcessingMessage(`Analyzing pair ${i + 1} of ${totalPairs}: ${pA.name} ↔ ${pB.name}`);
      
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
        console.error(`Error analyzing pair ${pA.name} - ${pB.name}:`, error);
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
          remarks: `Error: ${error instanceof Error ? error.message : 'Unknown analysis error.'}`,
          pointA: { lat: pA.lat, lng: pA.lng, name: pA.name, towerHeight: globalTowerHeight },
          pointB: { lat: pB.lat, lng: pB.lng, name: pB.name, towerHeight: globalTowerHeight },
        });
      }
      setProgress(Math.round(((i + 1) / totalPairs) * 100));
       // Optional: Short delay to allow UI updates if processing is very fast
       // await new Promise(resolve => setTimeout(resolve, 10));
    }

    setBulkResults(tempResults);
    setIsProcessing(false);
    setProcessingMessage(`Analysis Complete. Processed ${totalPairs} pairs.`);
    toast({ title: "Bulk Analysis Complete", description: `Processed ${totalPairs} pairs.` });
  };
  
  const handleKmzUploaded = (file: File, placemarks: KmzPlacemark[], fName: string) => {
    setKmzFile(file);
    setKmzPlacemarks(placemarks);
    setFileName(fName);
    setBulkResults([]); // Clear results when a new file is uploaded
    setProgress(0);
    setProcessingMessage('');
  };


  return (
    <>
      <AppHeader currentPage="bulk" />
      <div className="container mx-auto p-2 sm:p-4 md:p-6 lg:p-8 h-[calc(100vh-theme(spacing.12)-theme(spacing.12))] overflow-y-auto custom-scrollbar"> {/* Adjusted height for footer */}
        <Card className="max-w-7xl mx-auto shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Bulk Line-of-Sight Analyzer</CardTitle>
            <CardDescription>
              Upload a KMZ file, set parameters, and analyze LOS for multiple point pairs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <BulkAnalysisUploader onKmzUploaded={handleKmzUploaded} />
                <BulkAnalysisParameters control={form.control} register={form.register} errors={form.formState.errors} />
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
