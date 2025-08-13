
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import type { BulkAnalysisResultItem, BulkAnalysisFormValues } from '@/app/bulk-los-analyzer/page';
import { cn } from '@/lib/utils';
import type { FiberPathResult } from '@/tools/fiberPathCalculator'; // For FiberPathStatus type

const BulkAnalysisResultsTable: React.FC<{ results: BulkAnalysisResultItem[]; analysisParams: BulkAnalysisFormValues; }> = ({ results, analysisParams }) => {
  if (results.length === 0) {
    return null; 
  }

  const hasFiberData = results.some(item => 
    item.fiberPathStatus !== undefined || 
    item.fiberPathTotalDistanceMeters !== undefined ||
    item.fiberPathErrorMessage !== undefined
  );

  // Helper to format fiber status for display
  const formatFiberStatus = (status?: FiberPathResult['status']): string => {
    if (!status) return 'N/A';
    switch (status) {
      case 'success': return 'Success';
      case 'los_not_feasible': return 'LOS Not Feasible';
      case 'no_road_for_a': return 'No Road Near Site A';
      case 'no_road_for_b': return 'No Road Near Site B';
      case 'no_route_between_roads': return 'No Road Route';
      case 'radius_too_small': return 'Snap Radius Too Small';
      case 'api_error': return 'API Error';
      case 'input_error': return 'Input Error';
      default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

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
              <TableHead>Pair</TableHead>
              <TableHead>LOS Dist (km)</TableHead>
              <TableHead>LOS Possible</TableHead>
              <TableHead>Min. Clear. (m)</TableHead>
              {hasFiberData && (
                <>
                  <TableHead>Fiber Status</TableHead>
                  <TableHead>Fiber Dist (m)</TableHead>
                </>
              )}
              <TableHead className="min-w-[200px]">Remarks / Fiber Error</TableHead>
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
                            item.fiberPathStatus === 'los_not_feasible' || item.fiberPathStatus === 'no_road_for_a' || item.fiberPathStatus === 'no_road_for_b' || item.fiberPathStatus === 'no_route_between_roads' || item.fiberPathStatus === 'radius_too_small' ? 'text-amber-500 dark:text-amber-400' : // Warning color
                            item.fiberPathStatus ? 'text-los-failure' : 'text-muted-foreground'
                        )}
                    >
                      {item.fiberPathStatus ? 
                        formatFiberStatus(item.fiberPathStatus) : 
                        (item.losPossible ? 'Not Calculated' : 'N/A (LOS Blocked)')
                      }
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm">
                        {item.fiberPathTotalDistanceMeters !== undefined && item.fiberPathTotalDistanceMeters !== null && item.fiberPathStatus === 'success'
                            ? item.fiberPathTotalDistanceMeters.toFixed(0) 
                            : 'N/A'}
                    </TableCell>
                  </>
                )}
                <TableCell className="text-xs whitespace-pre-wrap">
                    {item.remarks}
                    {hasFiberData && item.fiberPathErrorMessage && (
                        <span className={cn("block mt-1 text-destructive/90 text-[0.7rem]", item.remarks ? "pt-1 border-t border-dashed border-border mt-1" : "")}>
                           Fiber Error: {item.fiberPathErrorMessage}
                        </span>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>
            Showing {results.length} processed pairs. 
            LOS Params - Tower: {analysisParams.globalTowerHeight}m, Fresnel: {analysisParams.globalFresnelHeight}m.
            {hasFiberData && ` Fiber Snap Radius: ${results.find(r => r.pointA && r.pointB)?.pointA.name && results.find(r => r.pointA && r.pointB)?.pointB.name ? (results.find(r => r.fiberPathStatus !== undefined)?.fiberPathSegments?.find((s: any) => s.type === 'offset_a')?.distanceMeters !== undefined ? (results.find(r => r.fiberPathStatus !== undefined) as BulkAnalysisResultItem & { fiberPathSegments: any[] })?.fiberPathSegments?.find((s: any) => s.type === 'offset_a')?.distanceMeters : analysisParams.losCheckRadiusKm.toString()) : 'N/A'}m.`}
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BulkAnalysisResultsTable;
