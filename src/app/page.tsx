
"use client";

import React, { useState, useEffect, useActionState } from 'react';
import InputForm from '@/components/fso/input-form';
import ResultsDisplay from '@/components/fso/results-display';
import InteractiveMap from '@/components/fso/interactive-map'; // Updated import
import ElevationProfileChart from '@/components/fso/elevation-profile-chart';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisResult, PointCoordinates } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react'; // Using Package as a generic logo icon

export default function Home() {
  const initialState: (AnalysisResult | { error: string; fieldErrors?: any }) = { error: "No analysis performed yet." };
  const [state, formAction] = useActionState(performLosAnalysis, initialState);
  
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);
  const [clientError, setClientError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setClientError(null);
    // Do not clear analysisResult immediately, allow map to show previous points if desired
    // setAnalysisResult(null); 
    setFormErrors(undefined);
    await formAction(formData); 
  };
  
  useEffect(() => {
    setIsLoading(false); // Action has completed
    if (state) {
      if ('error' in state && state.error) {
        setClientError(state.error);
        if (state.fieldErrors) {
          setFormErrors(state.fieldErrors as Record<string, string[] | undefined>);
        } else {
          setFormErrors(undefined);
        }
        // Keep previous analysisResult for the map if an error occurs, unless it's a field error invalidating points
        if (state.fieldErrors) setAnalysisResult(null); 
      } else if (!('error' in state)) { 
        setAnalysisResult(state as AnalysisResult);
        setClientError(null);
        setFormErrors(undefined);
      }
    }
  }, [state]);


  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 bg-background text-foreground">
      <header className="mb-8 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
          <Package className="h-10 w-10 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold text-primary">FSO Line-of-Sight Analyzer</h1>
        </div>
        <p className="text-muted-foreground text-sm md:text-base">
          Analyze terrain profiles to determine Free Space Optics (FSO) viability between two points.
        </p>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Column: Form and Results */}
        <section className="md:col-span-2 flex flex-col gap-6">
          <InputForm onSubmit={handleFormSubmit} isLoading={isLoading} initialErrors={formErrors} />
          
          {clientError && !analysisResult && ( // Only show general error if no results are displayed
             <Card className="shadow-lg border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{clientError}</p>
                </CardContent>
             </Card>
          )}
          {isLoading && !analysisResult && ( // Skeleton for results only if no results yet
            <Card className="shadow-lg">
                <CardHeader><CardTitle>Analysis Results</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
            </Card>
          )}
          {analysisResult && <ResultsDisplay result={analysisResult} />}
        </section>

        {/* Right Column: Map and Chart */}
        <section className="md:col-span-3 flex flex-col gap-6">
          <InteractiveMap 
            pointA={analysisResult?.pointA} 
            pointB={analysisResult?.pointB}
            losPossible={analysisResult?.losPossible} // Pass losPossible status
          />
          
          {isLoading && (
             <Card className="shadow-lg">
                <CardHeader><CardTitle>Elevation Profile</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-[400px] w-full rounded-md" /></CardContent>
             </Card>
          )}
          {!isLoading && analysisResult && analysisResult.profile.length > 0 && (
            <ElevationProfileChart profile={analysisResult.profile} />
          )}
          {/* Adjusted condition for empty state of chart */}
          {!isLoading && (!analysisResult || analysisResult.profile.length === 0) && (
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Elevation Profile</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                        {clientError && !formErrors ? "Analysis could not be completed." : "Submit an analysis to view the elevation profile."}
                    </p>
                </CardContent>
             </Card>
          )}
        </section>
      </main>

      <footer className="mt-auto pt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} FSO LOS Analyzer. All rights reserved. For demonstration purposes using Google Elevation API.</p>
      </footer>
    </div>
  );
}
