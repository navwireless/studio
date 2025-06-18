
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import type { BulkAnalysisResultItem, BulkAnalysisFormValues } from '@/app/bulk-los-analyzer/page';
import { cn } from '@/lib/utils';

interface BulkAnalysisResultsTableProps {
  results: BulkAnalysisResultItem[];
  analysisParams: BulkAnalysisFormValues;
}

const BulkAnalysisResultsTable: React.FC<BulkAnalysisResultsTableProps> = ({ results, analysisParams }) => {
  if (results.length === 0) {
    return null; 
  }

  // Check if any result item has fiber path data to determine if fiber columns should be shown
  const hasFiberData = results.some(item => item.fiberPathStatus !== undefined);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
        <CardDescription>Detailed Line-of-Sight {hasFiberData ? "and Fiber Path " : ""}analysis for each processed pair.</CardDescription>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="min-w-[120px] md:min-w-[180px]">Pair</TableHead>
              <TableHead>LOS Dist (km)</TableHead>
              <TableHead>LOS Possible</TableHead>
              <TableHead>Min. Clear. (m)</TableHead>
              {hasFiberData && (
                <>
                  <TableHead>Fiber Status</TableHead>
                  <TableHead>Fiber Dist (m)</TableHead>
                </>
              )}
              <TableHead className="min-w-[200px] md:min-w-[300px]">Remarks / Fiber Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-xs sm:text-sm">{item.pointAName} ↔ {item.pointBName}</TableCell>
                <TableCell className="text-xs sm:text-sm">{item.aerialDistanceKm.toFixed(2)}</TableCell>
                <TableCell 
                    className={cn(
                        "font-semibold text-xs sm:text-sm",
                        item.losPossible ? 'text-los-success' : 'text-los-failure'
                    )}
                >
                  {item.losPossible ? 'Yes' : 'No'}
                </TableCell>
                <TableCell className="text-xs sm:text-sm">{item.minClearanceActual?.toFixed(1) ?? 'N/A'}</TableCell>
                
                {hasFiberData && (
                  <>
                    <TableCell 
                        className={cn(
                            "text-xs sm:text-sm",
                            item.fiberPathStatus === 'success' ? 'text-los-success' :
                            item.fiberPathStatus === 'los_not_feasible' || item.fiberPathStatus === 'no_road_for_a' || item.fiberPathStatus === 'no_road_for_b' || item.fiberPathStatus === 'no_route_between_roads' || item.fiberPathStatus === 'radius_too_small' ? 'text-amber-500' :
                            item.fiberPathStatus ? 'text-los-failure' : 'text-muted-foreground' // Default for other errors or if undefined
                        )}
                    >
                      {item.fiberPathStatus ? 
                        item.fiberPathStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        (item.losPossible ? 'Not Calculated' : 'N/A (LOS Blocked)')
                      }
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                        {item.fiberPathTotalDistanceMeters !== undefined && item.fiberPathTotalDistanceMeters !== null 
                            ? item.fiberPathTotalDistanceMeters.toFixed(0) 
                            : (item.losPossible && item.fiberPathStatus ? 'N/A' : '')}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-xs whitespace-pre-wrap">
                    {item.remarks}
                    {item.fiberPathErrorMessage && hasFiberData && (
                        <span className={cn("block mt-1 text-destructive/90 text-[0.7rem]", item.remarks ? "pt-1 border-t border-dashed border-border mt-1" : "")}>
                           Fiber: {item.fiberPathErrorMessage}
                        </span>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            Showing {results.length} processed pairs. 
            LOS Params - Tower: {analysisParams.globalTowerHeight}m, Fresnel: {analysisParams.globalFresnelHeight}m.
            {hasFiberData && ` Fiber Snap Radius: ${results.find(r=>r.pointA.name === '')?.pointA.name || analysisParams.losCheckRadiusKm /* fallback, need better way to get radius used if page available */}m.`}
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BulkAnalysisResultsTable;

