
"use client";

import type { AnalysisResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Info, TrendingUp, ArrowRightLeft } from 'lucide-react';

interface ResultsDisplayProps {
  result: AnalysisResult | { error: string };
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  // Error state is handled by page.tsx now directly
  if ('error' in result) {
    // This component might not even be rendered if there's a major error
    // But as a fallback:
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

  // UISP-like display for results
  return (
    <Card className={`shadow-xl bg-card/80 backdrop-blur-sm border-border`}>
      <CardHeader className="py-2 px-4">
        <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Link Viability
            </CardTitle>
            <Badge variant={result.losPossible ? "default" : "destructive"} className={`text-xs ${result.losPossible ? 'bg-los-success' : 'bg-los-failure'}`}>
                {result.losPossible ? 'LOS POSSIBLE' : 'LOS OBSTRUCTED'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Aerial Distance:</span>
          <span className="font-medium">{result.distanceKm} km</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Min. Clearance:</span>
          <span className={`font-medium ${result.minClearance !== null && result.minClearance < (result.profile[0]?.clearance /* hack to get threshold, should pass it */ || 0) ? 'text-los-failure' : 'text-los-success'}`}>
            {result.minClearance !== null ? `${result.minClearance} m` : 'N/A'}
          </span>
        </div>
        {result.additionalHeightNeeded !== null && result.additionalHeightNeeded > 0 && (
          <div className="flex justify-between items-center text-destructive">
            <span className="text-muted-foreground">Add. Height Needed:</span>
            <span className="font-medium">{result.additionalHeightNeeded} m (total)</span>
          </div>
        )}
        {result.message && !result.message.toLowerCase().includes("analysis complete") && (
            <div className="flex items-start text-xs text-muted-foreground pt-1">
                <Info className="mr-1 h-3 w-3 flex-shrink-0 mt-0.5" />
                <p>{result.message.replace("Using Google Elevation API data.", "")}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
