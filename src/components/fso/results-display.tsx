"use client";

import type { AnalysisResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

interface ResultsDisplayProps {
  result: AnalysisResult | { error: string };
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  if ('error' in result) {
    return (
      <Card className="shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{result.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`shadow-lg ${result.losPossible ? 'border-green-500' : 'border-red-500'}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          {result.losPossible ? (
            <CheckCircle2 className="mr-2 h-6 w-6 text-los-success" />
          ) : (
            <XCircle className="mr-2 h-6 w-6 text-los-failure" />
          )}
          LOS Analysis Result
        </CardTitle>
        <CardDescription>Summary of the line-of-sight analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="font-semibold">Verdict:</span>
          <Badge variant={result.losPossible ? "default" : "destructive"} className={`ml-2 ${result.losPossible ? 'bg-los-success' : 'bg-los-failure'}`}>
            {result.losPossible ? 'LOS POSSIBLE' : 'LOS NOT POSSIBLE'}
          </Badge>
        </div>
        <div>
          <span className="font-semibold">Aerial Distance:</span>
          <span className="ml-2">{result.distanceKm} km</span>
        </div>
        <div>
          <span className="font-semibold">Minimum Clearance:</span>
          <span className="ml-2">{result.minClearance !== null ? `${result.minClearance} meters` : 'N/A'}</span>
        </div>
        {result.additionalHeightNeeded !== null && (
          <div>
            <span className="font-semibold">Additional Tower Height Needed:</span>
            <span className="ml-2">{result.additionalHeightNeeded} meters (approx.)</span>
          </div>
        )}
        {result.message && (
            <div className="flex items-start text-sm text-muted-foreground mt-2">
                <Info className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{result.message}</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
