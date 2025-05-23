
"use client";

import type { AnalysisResult, PointCoordinates } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ElevationProfileChart from './elevation-profile-chart';
import { ChevronDown, ChevronUp, MapPin, TowerControl, TrendingUp, Sigma, Ruler } from 'lucide-react';

interface BottomPanelProps {
  analysisResult: AnalysisResult | null;
  isVisible: boolean;
  onToggle: () => void;
  pointAName: string;
  pointBName: string;
}

const SiteInfoCard: React.FC<{ siteName: string; coords?: PointCoordinates; towerHeight?: number }> = ({ siteName, coords, towerHeight }) => (
  <Card className="bg-card/80 backdrop-blur-sm h-full flex flex-col">
    <CardHeader className="py-2 px-3">
      <CardTitle className="text-base flex items-center">
        <MapPin className="mr-2 h-4 w-4 text-primary" /> {siteName}
      </CardTitle>
    </CardHeader>
    <CardContent className="px-3 pb-2 text-xs space-y-1.5 flex-grow">
      {coords ? (
        <>
          <p><span className="font-medium text-muted-foreground">Lat:</span> {coords.lat.toFixed(5)}</p>
          <p><span className="font-medium text-muted-foreground">Lng:</span> {coords.lng.toFixed(5)}</p>
        </>
      ) : (
        <p className="text-muted-foreground">Coordinates not available.</p>
      )}
      {towerHeight !== undefined ? (
         <p className="flex items-center"><TowerControl className="mr-1.5 h-3 w-3 text-muted-foreground" /> <span className="font-medium text-muted-foreground">Height:</span> {towerHeight} m</p>
      ) : (
        <p className="text-muted-foreground">Tower height not available.</p>
      )}
    </CardContent>
  </Card>
);

const OverallResultsDisplay: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  const formattedDistance = result.distanceKm < 1
    ? `${(result.distanceKm * 1000).toFixed(1)} m`
    : `${result.distanceKm.toFixed(2)} km`;

  return (
    <div className="p-2 text-center mb-1">
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${result.losPossible ? 'bg-los-success text-los-success-foreground' : 'bg-los-failure text-los-failure-foreground'}`}>
            {result.losPossible ? 'LOS POSSIBLE' : 'LOS OBSTRUCTED'}
        </span>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-muted/30 p-1.5 rounded">
                <p className="text-muted-foreground">Aerial Distance</p>
                <p className="font-semibold">{formattedDistance}</p>
            </div>
            <div className="bg-muted/30 p-1.5 rounded">
                <p className="text-muted-foreground">Min. Clearance</p>
                <p className={`font-semibold ${
              result.minClearance !== null && result.minClearance < result.clearanceThresholdUsed
                ? 'text-los-failure'
                : 'text-los-success'
            }`}>
                    {result.minClearance !== null ? `${result.minClearance.toFixed(1)} m` : 'N/A'}
                </p>
            </div>
        </div>
         {result.additionalHeightNeeded !== null && result.additionalHeightNeeded > 0 && (
          <p className="text-xs text-destructive mt-1.5">
            Additional Tower Height Needed: {result.additionalHeightNeeded.toFixed(1)} m (total)
          </p>
        )}
    </div>
  );
};


export default function BottomPanel({ analysisResult, isVisible, onToggle, pointAName, pointBName }: BottomPanelProps) {
  if (!analysisResult) {
    return null; // Or a placeholder if analysis hasn't run
  }

  const panelHeightClass = isVisible ? 'h-[35vh]' : 'h-10'; // Height for panel itself, chart needs to fit
  const contentVisibilityClass = isVisible ? 'opacity-100 visible' : 'opacity-0 invisible h-0';

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border shadow-2xl transition-all duration-300 ease-in-out ${panelHeightClass} overflow-hidden`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute top-1 left-1/2 -translate-x-1/2 z-40 bg-card hover:bg-accent text-xs px-2 py-1 h-auto"
        aria-label={isVisible ? "Hide Analysis Panel" : "Show Analysis Panel"}
      >
        {isVisible ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronUp className="mr-1 h-4 w-4" />}
        {isVisible ? 'Hide Analysis' : 'Show Analysis'}
      </Button>

      <div className={`pt-8 md:pt-3 p-2 md:p-3 transition-opacity duration-200 ease-in-out ${contentVisibilityClass}`}>
        {isVisible && analysisResult && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-full">
            {/* Section 1: Site A Info */}
            <div className="h-full">
              <SiteInfoCard
                siteName={pointAName || 'Site A'}
                coords={analysisResult.pointA}
                towerHeight={analysisResult.pointA?.towerHeight}
              />
            </div>

            {/* Section 2: Elevation Chart & Overall Results */}
            <div className="h-full flex flex-col">
              <OverallResultsDisplay result={analysisResult} />
              <div className="flex-grow min-h-0"> {/* Ensure chart container can shrink */}
                 <ElevationProfileChart
                    profile={analysisResult.profile}
                    pointAName={pointAName || 'Site A'}
                    pointBName={pointBName || 'Site B'}
                  />
              </div>
            </div>

            {/* Section 3: Site B Info */}
            <div className="h-full">
              <SiteInfoCard
                siteName={pointBName || 'Site B'}
                coords={analysisResult.pointB}
                towerHeight={analysisResult.pointB?.towerHeight}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
