
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileArchive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { exportResultsToExcel, generateAndDownloadFeasibleLinksKmz, generateAndDownloadZipPackage } from '@/lib/export-utils';
import type { BulkAnalysisFormValues } from '@/app/bulk-los-analyzer/page';
import type { BulkAnalysisResultItem } from '@/types';
import type { KmzPlacemark } from '@/lib/kmz-parser';

interface BulkAnalysisDownloadsProps {
  results: BulkAnalysisResultItem[];
  originalPlacemarks: KmzPlacemark[];
  analysisParams: BulkAnalysisFormValues; // Contains globalTowerHeight and globalFresnelHeight
  baseFileName: string;
  disabled: boolean;
}

const BulkAnalysisDownloads: React.FC<BulkAnalysisDownloadsProps> = ({ 
  results, 
  originalPlacemarks, 
  analysisParams, 
  baseFileName,
  disabled 
}) => {
  const { toast } = useToast();

  const handleDownloadExcel = () => {
    if (results.length === 0) {
      toast({ title: "No Results", description: "No analysis results to export.", variant: "destructive" });
      return;
    }
    try {
      exportResultsToExcel(results, `${baseFileName}_results.xlsx`);
      toast({ title: "Excel Exported", description: "Results downloaded as Excel file." });
    } catch (error) {
       toast({ title: "Export Error", description: `Failed to export Excel: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive"});
    }
  };

  const handleDownloadKmz = () => {
    if (originalPlacemarks.length === 0 || results.length === 0) {
      toast({ title: "No Data", description: "No placemarks or analysis results to generate KMZ.", variant: "destructive" });
      return;
    }
    const feasibleLinks = results.filter(r => r.losPossible);
    if (feasibleLinks.length === 0) {
        toast({ title: "No Feasible Links", description: "No feasible links found to include in the KMZ.", variant: "default"});
        // Optionally, still generate KMZ with only original placemarks or skip.
        // For now, let's allow generating it even if empty.
    }
    try {
        generateAndDownloadFeasibleLinksKmz(
            originalPlacemarks, 
            feasibleLinks, 
            { towerHeight: analysisParams.globalTowerHeight, fresnelHeight: analysisParams.globalFresnelHeight },
            `${baseFileName}_feasible_links.kmz`
        );
        toast({ title: "KMZ Exported", description: "Feasible links downloaded as KMZ file." });
    } catch (error) {
        toast({ title: "Export Error", description: `Failed to export KMZ: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive"});
    }
  };

  const handleDownloadZip = async () => {
    if (results.length === 0 && originalPlacemarks.length === 0) {
      toast({ title: "No Data", description: "No data to package into a ZIP.", variant: "destructive" });
      return;
    }
    try {
      await generateAndDownloadZipPackage(
        originalPlacemarks,
        results, // Pass all results for Excel, filtering for KMZ happens inside
        { towerHeight: analysisParams.globalTowerHeight, fresnelHeight: analysisParams.globalFresnelHeight },
        baseFileName
      );
      toast({ title: "ZIP Package Downloaded", description: "Excel results and feasible links KMZ (if any) downloaded as a ZIP file." });
    } catch (error) {
      console.error("Error generating ZIP:", error);
      toast({ title: "ZIP Export Error", description: `Failed to create ZIP package: ${error instanceof Error ? error.message : "Unknown error"}`, variant: "destructive" });
    }
  };


  return (
    <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg">Export Results</CardTitle>
        </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button onClick={handleDownloadExcel} variant="outline" className="w-full" disabled={disabled || results.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export Excel
        </Button>
        <Button onClick={handleDownloadKmz} variant="outline" className="w-full" disabled={disabled || results.length === 0 || originalPlacemarks.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Export KMZ
        </Button>
        <Button onClick={handleDownloadZip} variant="default" className="w-full" disabled={disabled || (results.length === 0 && originalPlacemarks.length === 0)}>
          <FileArchive className="mr-2 h-4 w-4" /> Download Both (ZIP)
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkAnalysisDownloads;
