"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, WifiOff } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisFormValues } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';

import AppHeader from '@/components/layout/app-header';
import InteractiveMap from '@/components/fso/interactive-map';
import BottomSheet from '@/components/fso/bottom-sheet';
import { AnalysisSettings } from '@/components/fso/analysis-settings';
import MapToolbar from '@/components/fso/map-toolbar';
import HistoryPanel from '@/components/layout/history-panel';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { MapErrorBoundary } from '@/components/map-error-boundary';
import { ErrorModal } from '@/components/error-modal';
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
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    isAnalysisPanelGloballyOpen: isBottomSheetVisible,
    setIsAnalysisPanelGloballyOpen: setIsBottomSheetVisible,
    setIsBottomPanelContentExpanded: () => {},
    toast
  });

  const fiber = useFiberCalculation({
    analysisResult: analysis.analysisResult,
    isStale: analysis.isStale,
    toast,
    rawServerState: analysis.rawServerState
  });

  // Use refs to avoid stale closures and infinite update loops
  const analysisRef = useRef(analysis);
  analysisRef.current = analysis;
  const fiberRef = useRef(fiber);
  fiberRef.current = fiber;

  const processSubmit = useCallback((data: AnalysisFormValues) => {
    if (!navigator.onLine) {
      toast({ title: 'No Connection', description: 'Please check your internet connection.', variant: 'destructive' });
      return;
    }

    analysisRef.current.setDisplayedError(null);
    analysisRef.current.setFieldErrors(null);
    fiberRef.current.setFiberPathResult(null);
    fiberRef.current.setFiberPathError(null);

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
      analysisRef.current.formAction(formData);
    });
  }, [toast]);

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

  const handleAnalyzeClick = useCallback(() => {
    setIsBottomSheetVisible(true);
    form.trigger().then(isValid => {
      if (isValid) {
        handleSubmit(processSubmit)();
      } else {
        toast({ title: "Input Error", description: "Please set both site locations before analyzing.", variant: "destructive" });
      }
    });
  }, [form, handleSubmit, processSubmit, toast]);

  const handleToggleHistoryPanel = useCallback(() => {
    setIsHistoryPanelOpen(prev => !prev);
  }, []);

  const handleClearHistory = useCallback(() => {
    analysis.setHistoryList([]);
    toast({ title: "History Cleared" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

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

    analysisRef.current.clearAnalysis();
    fiberRef.current.setFiberPathResult(null);
    fiberRef.current.setFiberPathError(null);
    mapInteraction.setPlacementMode(null);
    toast({ title: "Map Cleared", description: "Form reset to default values." });

    setIsBottomSheetVisible(false);
  }, [reset, isClient, toast, mapInteraction]);

  const handleClearanceChange = useCallback((value: number[]) => {
    const numValue = value[0];
    if (typeof numValue === 'number') {
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

  const hasPointA = !!(watchedPointALat && isValidNumericString(watchedPointALat) && watchedPointALng && isValidNumericString(watchedPointALng));
  const hasPointB = !!(watchedPointBLat && isValidNumericString(watchedPointBLat) && watchedPointBLng && isValidNumericString(watchedPointBLng));
  const hasBothPoints = hasPointA && hasPointB;
  const hasAnyPoints = hasPointA || hasPointB;

  // Show bottom sheet when we have an analysis result
  useEffect(() => {
    if (analysis.analysisResult) {
      setIsBottomSheetVisible(true);
    }
  }, [analysis.analysisResult]);

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
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[70] bg-red-500/95 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 backdrop-blur-sm">
          <WifiOff className="h-3.5 w-3.5" />
          Offline — analysis requires internet
        </div>
      )}
      <AppHeader
        onToggleHistory={handleToggleHistoryPanel}
        isHistoryPanelSupported={true}
        currentPage="home"
      />
      <div className="flex-1 flex flex-col overflow-hidden relative h-full">
        <div className="flex-1 w-full relative">
          <MapErrorBoundary>
            <InteractiveMap
              pointA={hasPointA ? { lat: parseFloat(watchedPointALat), lng: parseFloat(watchedPointALng), name: watchedPointAName } : undefined}
              pointB={hasPointB ? { lat: parseFloat(watchedPointBLat), lng: parseFloat(watchedPointBLng), name: watchedPointBName } : undefined}
              placementMode={mapInteraction.placementMode}
              onMapClick={mapInteraction.handleMapClick}
              onMarkerDrag={mapInteraction.handleMarkerDrag}
              mapContainerClassName="w-full h-full"
              analysisResult={analysis.analysisResult}
              isStale={analysis.isStale}
              currentDistanceKm={mapInteraction.liveDistanceKm}
              fiberPathResult={fiber.fiberPathResult}
            />
          </MapErrorBoundary>

          {/* Map Toolbar - floating above bottom sheet */}
          <MapToolbar
            placementMode={mapInteraction.placementMode}
            onSetPlacementMode={mapInteraction.setPlacementMode}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onClearMap={handleClearMap}
            onAnalyze={handleAnalyzeClick}
            isPending={analysis.isActionPending || fiber.isFiberCalculating}
            hasAnyPoints={hasAnyPoints}
            hasBothPoints={hasBothPoints}
            hasAnalysisResult={!!analysis.analysisResult && !analysis.isStale}
          />
        </div>

        {/* Loading indicator - compact floating pill */}
        {(analysis.isActionPending || fiber.isFiberCalculating) && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[55] flex items-center gap-2.5 bg-slate-950/95 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl border border-white/[0.06]">
            <div className="relative">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm animate-pulse" />
            </div>
            <span className="text-xs font-medium text-white/80">
              {analysis.isActionPending ? "Analyzing link..." : "Computing fiber path..."}
            </span>
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

        {isClient && (
          <ErrorBoundary
            fallbackRender={({ error, resetErrorBoundary }) => (
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-red-950/95 backdrop-blur-md border-t border-red-500/30 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <h3 className="text-lg font-semibold text-white">Panel error</h3>
                <p className="text-sm text-red-200/80">{error.message}</p>
                <div className="flex gap-4">
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/5" onClick={resetErrorBoundary}>Reset</Button>
                  <Button variant="secondary" onClick={handleClearMap}>Clear Map</Button>
                </div>
              </div>
            )}
          >
            <BottomSheet
              analysisResult={analysis.analysisResult}
              isVisible={isBottomSheetVisible}
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
        )}

        {/* Settings Drawer */}
        <AnalysisSettings
          isOpen={isSettingsOpen}
          onClose={setIsSettingsOpen}
          isFiberPathEnabled={fiber.calculateFiberPathEnabled}
          onToggleFiberPath={fiber.handleToggleFiberPath}
          snapRadius={parseInt(fiber.localSnapRadiusInput, 10)}
          onSnapRadiusChange={fiber.setLocalSnapRadiusInput}
          onApplySnapRadius={fiber.handleApplySnapRadius}
          clearanceThreshold={parseFloat(watch('clearanceThreshold'))}
          onClearanceThresholdChange={handleClearanceChange}
          isPending={analysis.isActionPending || fiber.isFiberCalculating}
        />

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
