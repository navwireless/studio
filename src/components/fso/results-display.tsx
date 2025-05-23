
"use client";

// This component is now focused on displaying the *overall* results summary,
// intended to be used within the new BottomPanel.

import type { AnalysisResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Card might not be needed if embedded
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Info, Sigma } from 'lucide-react'; // Replaced icons

interface ResultsDisplayProps {
  result: AnalysisResult; // Assumes result is always present when this is rendered
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  // No error handling here, parent (BottomPanel) handles if result is null or error
  if (!result) return null;

  const formattedDistance = result.distanceKm < 1
    ? `${(result.distanceKm * 1000).toFixed(1)} m`
    : `${result.distanceKm.toFixed(2)} km`;

  return (
    // Removed outer Card to allow embedding directly
    <div className="p-1.5 text-center bg-card/70 rounded-md shadow">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${result.losPossible ? 'bg-los-success text-los-success-foreground' : 'bg-los-failure text-los-failure-foreground'}`}>
            {result.losPossible ? 'LOS POSSIBLE' : 'LOS OBSTRUCTED'}
        </span>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-xs">
            <div className="bg-muted/30 p-1 rounded">
                <p className="text-muted-foreground text-[0.65rem] leading-tight">Aerial Distance</p>
                <p className="font-semibold text-[0.7rem]">{formattedDistance}</p>
            </div>
            <div className="bg-muted/30 p-1 rounded">
                <p className="text-muted-foreground text-[0.65rem] leading-tight">Min. Clearance</p>
                <p className={`font-semibold text-[0.7rem] ${
              result.minClearance !== null && result.minClearance < result.clearanceThresholdUsed
                ? 'text-los-failure'
                : 'text-los-success'
            }`}>
                    {result.minClearance !== null ? `${result.minClearance.toFixed(1)} m` : 'N/A'}
                </p>
            </div>
        </div>
         {result.additionalHeightNeeded !== null && result.additionalHeightNeeded > 0 && (
          <p className="text-[0.65rem] text-destructive mt-1">
            Additional Tower Height Needed: {result.additionalHeightNeeded.toFixed(1)} m (total)
          </p>
        )}
         {result.message && !result.message.toLowerCase().includes("analysis complete") &&
         !result.message.toLowerCase().includes("google elevation api data") && (
            <div className="flex items-start text-[0.65rem] text-muted-foreground pt-0.5">
                <Info className="mr-1 h-2.5 w-2.5 flex-shrink-0 mt-px" />
                <p>{result.message}</p>
            </div>
        )}
    </div>
  );
}

    