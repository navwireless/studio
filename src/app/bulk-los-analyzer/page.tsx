
"use client";

import React, { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { UploadCloud, Download, FileText, Loader2, AlertTriangle, Route } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseKmzFile, type KmzPlacemark } from '@/lib/kmz-parser';
import { exportResultsToExcel, generateAndDownloadFeasibleLinksKmz } from '@/lib/export-utils';
import { calculateDistanceKm, analyzeLOS } from '@/lib/los-calculator';
import type { AnalysisParams, LOSPoint, PointCoordinates, ElevationSampleAPI } from '@/types';
import { getElevationProfileForPairAction } from './actions';
import AppHeader from '@/components/layout/app-header';

const BulkAnalysisFormSchema = z.object({
  globalTowerHeight: z.coerce.number().min(0, "Tower height must be non-negative.").max(200, "Tower height seems too high."),
  globalFresnelHeight: z.coerce.number().min(0, "Fresnel height (clearance) must be non-negative.").max(100, "Fresnel height seems too high."),
  losCheckRadiusKm: z.coerce.number().min(0.1, "Check radius must be at least 0.1 km.").max(100, "Check radius too large for practical bulk analysis."),
  kmzFile: z.instanceof(FileList).refine(files => files.length === 1, "A KMZ file is required."),
});

type BulkAnalysisFormValues = z.infer<typeof BulkAnalysisFormSchema>;

export interface BulkAnalysisResultItem {
  id: string;
  pointAName: string;
  pointACoords: string; // "lat, lng"
  pointBName: string;
  pointBCoords: string; // "lat, lng"
  towerHeightUsed: number;
  fresnelHeightUsed: number; // This is the clearanceThresholdUsed
  aerialDistanceKm: number;
  losPossible: boolean;
  minClearanceActual: number | null; // Actual min clearance from terrain to LOS line
  additionalHeightNeeded: number | null;
  remarks: string;
  // For KMZ export
  pointA: PointCoordinates & { name: string; towerHeight: number };
  pointB: PointCoordinates & { name: string; towerHeight: number };
  profile?: LOSPoint[]; // Optional profile for detailed debugging or future use
}


export default function BulkLosAnalyzerPage() {
  const { toast } = useToast();
  const [kmzPlacemarks, setKmzPlacemarks] = useState<KmzPlacemark[]>([]);
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
  });

  const { register, handleSubmit, control, formState: { errors }, setValue } = form;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      setValue("kmzFile", files, { shouldValidate: true });
      try {
        const placemarks = await parseKmzFile(file);
        if (placemarks.length < 2) {
          toast({ title: "KMZ Parsing Issue", description: "Not enough placemarks (need at least 2) found in the KMZ file.", variant: "destructive" });
          setKmzPlacemarks([]);
          return;
        }
        setKmzPlacemarks(placemarks);
        toast({ title: "KMZ File Loaded", description: `Successfully parsed ${placemarks.length} placemarks from ${file.name}.` });
      } catch (error) {
        console.error("Error parsing KMZ:", error);
        toast({ title: "KMZ Parsing Error", description: error instanceof Error ? error.message : "Could not parse the KMZ file.", variant: "destructive" });
        setKmzPlacemarks([]);
        setFileName(null);
        setValue("kmzFile", new DataTransfer().files, { shouldValidate: true }); // Reset file input
      }
    } else {
      setFileName(null);
      setKmzPlacemarks([]);
      setValue("kmzFile", new DataTransfer().files, { shouldValidate: true });
    }
  };

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
    if (result.additionalHeightNeeded !== null) {
      remark += ` Additional height of ${result.additionalHeightNeeded.toFixed(1)}m needed for ${params.clearanceThreshold}m threshold.`;
    }
    return remark;
  };


  const onSubmit = async (data: BulkAnalysisFormValues) => {
    if (kmzPlacemarks.length < 2) {
      toast({ title: "Not Enough Points", description: "Please upload a KMZ file with at least two placemarks.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingMessage('Starting analysis...');
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
      toast({ title: "No Pairs Found", description: "No point pairs found within the specified radius.", variant: "default" });
      setIsProcessing(false);
      return;
    }

    const tempResults: BulkAnalysisResultItem[] = [];
    for (let i = 0; i < pairsToAnalyze.length; i++) {
      const { pA, pB } = pairsToAnalyze[i];
      setProcessingMessage(`Analyzing pair ${i + 1} of ${pairsToAnalyze.length}: ${pA.name} - ${pB.name}`);
      
      try {
        const elevationProfileResponse = await getElevationProfileForPairAction(
          { lat: pA.lat, lng: pA.lng },
          { lat: pB.lat, lng: pB.lng }
        );

        if (elevationProfileResponse.error || !elevationProfileResponse.profile) {
          throw new Error(elevationProfileResponse.error || "Failed to get elevation profile.");
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
            id: `${pA.name}_${pB.name}_${i}`,
            pointACoords: `${pA.lat.toFixed(6)}, ${pA.lng.toFixed(6)}`,
            pointBCoords: `${pB.lat.toFixed(6)}, ${pB.lng.toFixed(6)}`,
            remarks: generateRemarks(resultItemBase, analysisParams, singlePairAnalysis),
        });

      } catch (error) {
        console.error(`Error analyzing pair ${pA.name} - ${pB.name}:`, error);
        // Add a failed result item
        const distance = calculateDistanceKm({ lat: pA.lat, lng: pA.lng }, { lat: pB.lat, lng: pB.lng });
        tempResults.push({
          id: `${pA.name}_${pB.name}_${i}_error`,
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
      setProgress(((i + 1) / pairsToAnalyze.length) * 100);
    }

    setBulkResults(tempResults);
    setIsProcessing(false);
    setProcessingMessage('Analysis Complete.');
    toast({ title: "Bulk Analysis Complete", description: `Processed ${pairsToAnalyze.length} pairs.` });
  };
  
  const handleDownloadExcel = () => {
    if (bulkResults.length === 0) {
      toast({ title: "No Results", description: "No analysis results to export.", variant: "destructive" });
      return;
    }
    exportResultsToExcel(bulkResults, fileName || "bulk_los_analysis_results.xlsx");
    toast({ title: "Excel Exported", description: "Results downloaded as Excel file." });
  };

  const handleDownloadKmz = () => {
    if (kmzPlacemarks.length === 0 || bulkResults.length === 0) {
      toast({ title: "No Data", description: "No placemarks or analysis results to generate KMZ.", variant: "destructive" });
      return;
    }
    const exportParams = form.getValues();
    generateAndDownloadFeasibleLinksKmz(
      kmzPlacemarks, 
      bulkResults.filter(r => r.losPossible), 
      { towerHeight: exportParams.globalTowerHeight, fresnelHeight: exportParams.globalFresnelHeight },
      fileName ? `feasible_${fileName}` : "feasible_links.kmz"
    );
    toast({ title: "KMZ Exported", description: "Feasible links downloaded as KMZ file." });
  };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 h-[calc(100vh-theme(spacing.24))] overflow-y-auto custom-scrollbar">
        <Card className="max-w-5xl mx-auto shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center"><Route className="mr-2 h-7 w-7 text-primary"/>Bulk LOS Analyzer</CardTitle>
            <CardDescription>
              Upload a KMZ file, set global parameters, and analyze Line-of-Sight for multiple point pairs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Column 1: File Upload & Parameters */}
                <Card className="p-6 space-y-6 bg-background/50">
                  <div>
                    <Label htmlFor="kmzFile" className="text-lg font-semibold">KMZ File Upload</Label>
                    <p className="text-sm text-muted-foreground mb-2">Select a .kmz file containing placemarks.</p>
                    <Input
                      id="kmzFile"
                      type="file"
                      accept=".kmz"
                      className="bg-input/70 border-border hover:border-primary focus:border-primary"
                      onChange={handleFileChange}
                    />
                    {fileName && <p className="mt-2 text-sm text-muted-foreground">Selected file: {fileName} ({kmzPlacemarks.length} placemarks)</p>}
                    {errors.kmzFile && <p className="text-destructive text-sm mt-1">{errors.kmzFile.message}</p>}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Analysis Parameters</h3>
                    <div>
                      <Label htmlFor="globalTowerHeight">Global Tower Height (meters)</Label>
                      <Input id="globalTowerHeight" type="number" {...register("globalTowerHeight")} className="bg-input/70" />
                      {errors.globalTowerHeight && <p className="text-destructive text-sm mt-1">{errors.globalTowerHeight.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="globalFresnelHeight">Global Fresnel/Clearance Height (meters)</Label>
                      <Input id="globalFresnelHeight" type="number" {...register("globalFresnelHeight")} className="bg-input/70" />
                      {errors.globalFresnelHeight && <p className="text-destructive text-sm mt-1">{errors.globalFresnelHeight.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="losCheckRadiusKm">LOS Check Radius (kilometers)</Label>
                      <Input id="losCheckRadiusKm" type="number" step="0.1" {...register("losCheckRadiusKm")} className="bg-input/70" />
                      {errors.losCheckRadiusKm && <p className="text-destructive text-sm mt-1">{errors.losCheckRadiusKm.message}</p>}
                    </div>
                  </div>
                   <Button type="submit" className="w-full text-base py-3" disabled={isProcessing || kmzPlacemarks.length < 2}>
                    {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Route className="mr-2 h-5 w-5" />}
                    {isProcessing ? 'Analyzing...' : 'Start Bulk Analysis'}
                  </Button>
                </Card>

                {/* Column 2: Processing & Export */}
                <Card className="p-6 space-y-6 bg-background/50">
                   <h3 className="text-lg font-semibold border-b pb-2">Processing & Export</h3>
                  {isProcessing && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{processingMessage}</Label>
                      <Progress value={progress} className="w-full [&>div]:bg-primary" />
                      <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}% complete</p>
                    </div>
                  )}
                  {!isProcessing && bulkResults.length > 0 && (
                    <div className="space-y-3">
                       <p className="text-center text-green-500 font-semibold">Analysis complete. {bulkResults.length} pairs processed.</p>
                      <Button onClick={handleDownloadExcel} variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Export Results to Excel
                      </Button>
                      <Button onClick={handleDownloadKmz} variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Export Feasible Links to KMZ
                      </Button>
                    </div>
                  )}
                   {!isProcessing && bulkResults.length === 0 && !fileName && (
                    <div className="text-center py-6">
                      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Upload a KMZ and set parameters to begin.</p>
                    </div>
                  )}
                  {!isProcessing && bulkResults.length === 0 && fileName && kmzPlacemarks.length > 0 && (
                     <div className="text-center py-6">
                      <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-2" />
                      <p className="text-muted-foreground">Ready to analyze. Click "Start Bulk Analysis".</p>
                    </div>
                  )}
                </Card>
              </div>
            </form>

            {bulkResults.length > 0 && (
              <Card className="mt-8 bg-background/50">
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                  <CardDescription>Detailed Line-of-Sight analysis for each processed pair.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pair</TableHead>
                        <TableHead>Distance (km)</TableHead>
                        <TableHead>LOS Possible</TableHead>
                        <TableHead>Min. Clearance (m)</TableHead>
                        <TableHead>Add. Height (m)</TableHead>
                        <TableHead className="min-w-[300px]">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bulkResults.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.pointAName} - {item.pointBName}</TableCell>
                          <TableCell>{item.aerialDistanceKm.toFixed(2)}</TableCell>
                          <TableCell className={item.losPossible ? 'text-los-success' : 'text-los-failure'}>
                            {item.losPossible ? 'Yes' : 'No'}
                          </TableCell>
                           <TableCell>{item.minClearanceActual?.toFixed(1) ?? 'N/A'}</TableCell>
                           <TableCell>{item.additionalHeightNeeded?.toFixed(1) ?? 'N/A'}</TableCell>
                          <TableCell className="text-xs">{item.remarks}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                     <TableCaption>Showing {bulkResults.length} processed pairs. Tower Height Used: {form.getValues("globalTowerHeight")}m, Fresnel/Clearance Used: {form.getValues("globalFresnelHeight")}m.</TableCaption>
                  </Table>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

