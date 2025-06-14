
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import type { BulkAnalysisResultItem, BulkAnalysisFormValues } from '@/app/bulk-los-analyzer/page';

interface BulkAnalysisResultsTableProps {
  results: BulkAnalysisResultItem[];
  analysisParams: BulkAnalysisFormValues;
}

const BulkAnalysisResultsTable: React.FC<BulkAnalysisResultsTableProps> = ({ results, analysisParams }) => {
  if (results.length === 0) {
    return null; // Don't render the table if there are no results
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>Detailed Line-of-Sight analysis for each processed pair.</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="min-w-[150px] md:min-w-[200px]">Pair</TableHead>
              <TableHead>Distance (km)</TableHead>
              <TableHead>LOS Possible</TableHead>
              <TableHead>Min. Clear. (m)</TableHead>
              <TableHead>Add. Height (m)</TableHead>
              <TableHead className="min-w-[250px] md:min-w-[350px]">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-xs sm:text-sm">{item.pointAName} ↔ {item.pointBName}</TableCell>
                <TableCell className="text-xs sm:text-sm">{item.aerialDistanceKm.toFixed(2)}</TableCell>
                <TableCell className={`${item.losPossible ? 'text-los-success' : 'text-los-failure'} font-semibold text-xs sm:text-sm`}>
                  {item.losPossible ? 'Yes' : 'No'}
                </TableCell>
                <TableCell className="text-xs sm:text-sm">{item.minClearanceActual?.toFixed(1) ?? 'N/A'}</TableCell>
                <TableCell className="text-xs sm:text-sm">{item.additionalHeightNeeded?.toFixed(1) ?? 'N/A'}</TableCell>
                <TableCell className="text-xs whitespace-pre-wrap">{item.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            Showing {results.length} processed pairs. Tower Height Used: {analysisParams.globalTowerHeight}m, Fresnel/Clearance Used: {analysisParams.globalFresnelHeight}m.
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BulkAnalysisResultsTable;
