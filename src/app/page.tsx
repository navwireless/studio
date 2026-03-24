"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, Waypoints, WifiOff } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisFormValues } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';

import AppHeader from '@/components/layout/app-header';
import InteractiveMap from '@/components/fso/interactive-map';
import BottomPanel from '@/components/fso/bottom-panel';
import { AnalysisSettings } from '@/components/fso/analysis-settings';
import HistoryPanel from '@/components/layout/history-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary';
import { MapErrorBoundary } from '@/components/map-error-boundary';
import { ErrorModal } from '@/components/error-modal';
import { BottomPanelSkeleton } from '@/components/fso/bottom-panel-skeleton';
import { ProgressBar } from '@/components/progress-bar';

// Custom Hooks
import { useFormPersistence, LOCAL_STORAGE_KEYS } from '@/hooks/use-form-persistence';
import { useMapInteraction } from '@/hooks/use-map-interaction';
import { useAnalysisState } from '@/hooks/use-analysis-state';
import { useFiberCalculation } from '@/hooks/use-fiber-calculation';
import { usePdfDownload } from '@/hooks/use-pdf-download';
import { useOnlineStatus } from '@/hooks/use-online-status';

export default function Home() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const isOnline = useOnlineStatus();

  // UI State
  const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
  const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onBlur',
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, setValue, watch, reset } = form;

  useFormPersistence(form);
  const mapInteraction = useMapInteraction(form);
  const pdfDownload = usePdfDownload();

  const analysis = useAnalysisState({
    serverAction: performLosAnalysis,
    form,
    isAnalysisPanelGloballyOpen,
    setIsAnalysisPanelGloballyOpen,
    setIsBottomPanelContentExpanded,
    toast
  });

  const fiber = useFiberCalculation({
    analysisResult: analysis.analysisResult,
    isStale: analysis.isStale,
    toast,
    rawServerState: analysis.rawServerState
  });

  const processSubmit = useCallback((data: AnalysisFormValues) => {
    if (!isOnline) {
      toast({ title: 'No Connection', description: 'Please check your internet connection.', variant: 'destructive' });
      return;
    }

    analysis.setDisplayedError(null);
    analysis.setFieldErrors(null);
    fiber.setFiberPathResult(null); 
    fiber.setFiberPathError(null);

    const formData = new FormData();
    formData.append('pointA.name', data.pointA.name);
    formData.append('pointA.lat', data.pointA.lat);
    formData.append('pointA.lng', data.pointA.lng);
    formData.append('pointA.height', data.pointA.height.toString());
    formData.append('pointB.name', data.pointB.name);
    formData.append('pointB.lat', data.pointB.lat);
    formData.append('pointB.lng', data.pointB.lng);
    formData.append('pointB.height', data.pointB.height.toString());
    formData.append('clearanceThreshold', data.clearanceThreshold);

    React.startTransition(() => {
      analysis.formAction(formData);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, fiber]);

  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    setValue(`${siteId}.height`, Math.round(newHeight), { shouldDirty: true, shouldValidate: true });
    form.trigger().then(isValid => {
        if (isValid) {
            handleSubmit(processSubmit)();
        } else {
            toast({ title: "Input Error", description: "Please correct form errors before re-analyzing.", variant: "destructive" });
        }
    });
  }, [setValue, handleSubmit, processSubmit, form, toast]);



  const toggleBottomPanelContentExpansion = useCallback(() => {
    setIsBottomPanelContentExpanded(prev => !prev);
  }, []);

  const handleStartAnalysisClick = useCallback(() => {
    setIsAnalysisPanelGloballyOpen(true);
    setIsBottomPanelContentExpanded(true);
     form.trigger().then(isValid => {
        if (isValid) {
            handleSubmit(processSubmit)();
        } else {
            toast({ title: "Input Error", description: "Please correct form errors before analyzing.", variant: "destructive" });
        }
    });
  }, [form, handleSubmit, processSubmit, toast]);

  const handleToggleHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen(prev => !prev);
  }, []);

  const handleClearHistory = useCallback(() => {
    analysis.setHistoryList([]);
    toast({ title: "History Cleared" });
  }, [analysis, toast]);

  const handleClearMap = useCallback(() => {
    reset(defaultFormStateValues);
    
    if (isClient) { 
      Object.keys(LOCAL_STORAGE_KEYS).forEach(key => {
        const keyName = key as keyof typeof LOCAL_STORAGE_KEYS;
        if (keyName !== 'FIBER_TOGGLE' && keyName !== 'FIBER_RADIUS') {
          localStorage.removeItem(LOCAL_STORAGE_KEYS[keyName]);
        }
      });
    }

    analysis.clearAnalysis();
    fiber.setFiberPathResult(null); 
    fiber.setFiberPathError(null);
    toast({ title: "Map Cleared", description: "Form reset to default values." });
    
    if (isAnalysisPanelGloballyOpen) setIsAnalysisPanelGloballyOpen(false);
    if (isBottomPanelContentExpanded) setIsBottomPanelContentExpanded(false);
  }, [reset, isClient, analysis, fiber, toast, isAnalysisPanelGloballyOpen, isBottomPanelContentExpanded]);

  const handleClearanceChange = useCallback((value: number[]) => {
      const numValue = value[0];
      if(typeof numValue === 'number'){
          const stringValue = String(Math.round(numValue * 100) / 100);
          setValue('clearanceThreshold', stringValue, { shouldValidate: true, shouldDirty: true });
      }
  }, [setValue]);

  const isValidNumericString = (val: string) => val && !isNaN(parseFloat(val));
  const watchedPointALat = watch('pointA.lat');
  const watchedPointALng = watch('pointA.lng');
  const watchedPointAName = watch('pointA.name');
  const watchedPointBLat = watch('pointB.lat');
  const watchedPointBLng = watch('pointB.lng');
  const watchedPointBName = watch('pointB.name');

  return (
    <>
      <ProgressBar isActive={analysis.isActionPending || fiber.isFiberCalculating} />
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {analysis.analysisResult && !analysis.isStale && (
          analysis.analysisResult.losPossible
            ? `Analysis complete. Line of sight is feasible. Distance: ${analysis.analysisResult.distanceKm.toFixed(2)} kilometers.`
            : `Analysis complete. Line of sight is blocked. ${analysis.analysisResult.message || ''}`
        )}
      </div>
      {!isOnline && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg text-sm flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          You are offline. Analysis requires an internet connection.
        </div>
      )}
      <AppHeader
        onToggleHistory={handleToggleHistoryPanel}
        onClearMap={handleClearMap}
        isHistoryPanelSupported={true}
        currentPage="home"
      />
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        <div className="flex-1 w-full relative">
          <AnalysisSettings
            isFiberPathEnabled={fiber.calculateFiberPathEnabled}
            onToggleFiberPath={fiber.handleToggleFiberPath}
            snapRadius={parseInt(fiber.localSnapRadiusInput, 10)}
            onSnapRadiusChange={fiber.setLocalSnapRadiusInput}
            onApplySnapRadius={fiber.handleApplySnapRadius}
            clearanceThreshold={parseFloat(watch('clearanceThreshold'))}
            onClearanceThresholdChange={handleClearanceChange}
            isPending={analysis.isActionPending || fiber.isFiberCalculating}
          />
          <MapErrorBoundary>
            <InteractiveMap
              pointA={watchedPointALat && watchedPointALng && isValidNumericString(watchedPointALat) && isValidNumericString(watchedPointALng) ? { lat: parseFloat(watchedPointALat), lng: parseFloat(watchedPointALng), name: watchedPointAName } : undefined}
              pointB={watchedPointBLat && watchedPointBLng && isValidNumericString(watchedPointBLat) && isValidNumericString(watchedPointBLng) ? { lat: parseFloat(watchedPointBLat), lng: parseFloat(watchedPointBLng), name: watchedPointBName } : undefined}
              onMapClick={mapInteraction.handleMapClick}
              onMarkerDrag={mapInteraction.handleMarkerDrag}
              mapContainerClassName="w-full h-full"
              analysisResult={analysis.analysisResult}
              isStale={analysis.isStale}
              currentDistanceKm={mapInteraction.liveDistanceKm}
              fiberPathResult={fiber.fiberPathResult}
            />
          </MapErrorBoundary>
        </div>

        {!isAnalysisPanelGloballyOpen && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 print:hidden">
            <Button
              onClick={handleStartAnalysisClick}
              size="lg"
              className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm"
              aria-label="Start Link Analysis"
            >
              <Waypoints className="mr-2 h-5 w-5" />
              Start Link Analysis
            </Button>
          </div>
        )}

        {(analysis.isActionPending || fiber.isFiberCalculating) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
              <Card className="p-6 shadow-2xl bg-card/90">
                <CardContent className="flex flex-col items-center text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-semibold text-foreground">
                    {analysis.isActionPending ? "Analyzing Link..." : "Calculating Fiber Path..."}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysis.isActionPending ? "Please wait while we process elevation data." : "Accessing road network data..."}
                  </p>
                </CardContent>
              </Card>
          </div>
        )}

        {analysis.displayedError && !analysis.isActionPending && (
          <ErrorModal
            message={analysis.displayedError}
            onDismiss={analysis.dismissErrorModal}
            onRetry={analysis.retryLastAnalysis}
            title="LOS Analysis Failed"
          />
        )}

        {isClient ? (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-destructive/95 backdrop-blur-md border-t border-destructive shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out p-6 flex flex-col items-center justify-center text-center space-y-4">
                <AlertTriangle className="h-8 w-8 text-destructive-foreground" />
                <h3 className="text-lg font-semibold text-destructive-foreground">Analysis panel encountered an error</h3>
                <p className="text-sm text-destructive-foreground/80">{error.message}</p>
                <div className="flex gap-4">
                  <Button variant="outline" className="text-destructive-foreground border-destructive-foreground/50 hover:bg-destructive-foreground/10" onClick={resetErrorBoundary}>Reset Panel</Button>
                  <Button variant="secondary" onClick={handleClearMap}>Clear Map Data</Button>
                </div>
              </div>
            )}
          >
            <BottomPanel
              analysisResult={analysis.analysisResult}
              isPanelGloballyVisible={isAnalysisPanelGloballyOpen}
              isContentExpanded={isBottomPanelContentExpanded}
              onToggleContentExpansion={toggleBottomPanelContentExpansion}
              isStale={analysis.isStale}
              control={control}
              register={register}
              handleSubmit={handleSubmit}
              processSubmit={processSubmit}
              clientFormErrors={clientFormErrors}
              serverFormErrors={analysis.fieldErrors ?? undefined} 
              isActionPending={analysis.isActionPending}
              onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
              onDownloadPdf={() => pdfDownload.handleDownloadPdf(analysis.analysisResult, toast)}
              isGeneratingPdf={pdfDownload.isGeneratingPdf}
              fiberPathResult={fiber.fiberPathResult}
              isFiberCalculating={fiber.isFiberCalculating}
              fiberPathError={fiber.fiberPathError}
            />
          </ErrorBoundary>
        ) : (
          <BottomPanelSkeleton />
        )}

        <HistoryPanel
          historyList={analysis.historyList}
          onLoadHistoryItem={analysis.loadFromHistory}
          onClearHistory={handleClearHistory}
          isOpen={isHistoryPanelOpen}
          onToggle={handleToggleHistoryPanel}
        />
      </div>
    </>
  );
}
