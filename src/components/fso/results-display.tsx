
"use client";

// This component is no longer directly used in page.tsx.
// Its functionality for displaying overall results (LOS status, distance, clearance)
// has been integrated into the new `src/components/fso/bottom-panel.tsx` component
// as part of the `OverallResultsDisplay` sub-component.

// Keeping the file for now in case parts are needed, or if it's decided to be reused
// in a different context, but it's not active in the main analysis display flow.

import type { AnalysisResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Info, ArrowRightLeft, Sigma } from 'lucide-react';

interface ResultsDisplayProps {
  result: AnalysisResult | { error: string };
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  if ('error' in result) {
    return (
      <Card className="shadow-lg border-destructive bg-card/80 backdrop-blur-sm">
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center text-destructive text-sm">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <p className="text-xs">{result.error}</p>
        </CardContent>
      </Card>
    );
  }

  const formattedDistance = result.distanceKm < 1
    ? `${(result.distanceKm * 1000).toFixed(1)} m`
    : `${result.distanceKm.toFixed(2)} km`;

  return (
    <Card className={`shadow-xl bg-card/90 backdrop-blur-sm border-border w-full max-w-md`}>
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-center">
            <CardTitle className="text-md flex items-center">
                <Sigma className="mr-2 h-5 w-5 text-primary" /> Analysis Summary
            </CardTitle>
             <Badge
                variant={result.losPossible ? "default" : "destructive"}
                className={`text-xs px-2 py-1 ${result.losPossible ? 'bg-los-success' : 'bg-los-failure'}`}
            >
                {result.losPossible ? 'LOS POSSIBLE' : 'LOS OBSTRUCTED'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2.5 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Aerial Distance:</span>
          <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">{formattedDistance}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Min. Clearance:</span>
          <Badge
            variant="outline"
            className={`px-2 py-0.5 text-xs font-medium ${
              result.minClearance !== null && result.minClearance < result.clearanceThresholdUsed
                ? 'text-los-failure border-destructive'
                : 'text-los-success border-app-accent'
            }`}
          >
            {result.minClearance !== null ? `${result.minClearance.toFixed(1)} m` : 'N/A'}
          </Badge>
        </div>

        {result.additionalHeightNeeded !== null && result.additionalHeightNeeded > 0 && (
          <div className="flex justify-between items-center text-destructive">
            <span className="text-muted-foreground">Add. Height Needed:</span>
            <Badge variant="destructive" className="px-2 py-0.5 text-xs font-medium">{result.additionalHeightNeeded.toFixed(1)} m (total)</Badge>
          </div>
        )}

        {result.message && !result.message.toLowerCase().includes("analysis complete") &&
         !result.message.toLowerCase().includes("google elevation api data") && (
            <div className="flex items-start text-xs text-muted-foreground pt-1">
                <Info className="mr-1 h-3 w-3 flex-shrink-0 mt-0.5" />
                <p>{result.message}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
