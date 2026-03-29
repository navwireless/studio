"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, WifiOff } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisFormValues, MapNavigationTarget, MapContextMenuState, SavedLink } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';

import InteractiveMap from '@/components/fso/interactive-map';
import BottomPanel from '@/components/fso/bottom-panel';
import SidePanel from '@/components/fso/side-panel';
import MapContextMenu from '@/components/fso/map-context-menu';
import MapHeader from '@/components/layout/map-header';
import KeyboardHint from '@/components/fso/keyboard-hint';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { MapErrorBoundary } from '@/components/map-error-boundary';
import { ErrorModal } from '@/components/error-modal';
import { ProgressBar } from '@/components/progress-bar';
import { cn } from '@/lib/utils';

import { useFormPersistence, LOCAL_STORAGE_KEYS } from '@/hooks/use-form-persistence';
import { useMapInteraction } from '@/hooks/use-map-interaction';
import { useAnalysisState } from '@/hooks/use-analysis-state';
import { useFiberCalculation } from '@/hooks/use-fiber-calculation';
import { usePdfDownload } from '@/hooks/use-pdf-download';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { useSavedLinks } from '@/hooks/use-saved-links';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useCredits } from '@/hooks/use-credits';

import CreditWarning from '@/components/credit-warning';
import ProUpsellModal from '@/components/pro-upsell-modal';

// Export config modal for PDF downloads
import { ExportConfigModal } from '@/components/fso/export-config-modal';
import type { ExportConfig } from '@/tools/report-generator/types';

export default function Home() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const isOnline = useOnlineStatus();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [mapNavigationTarget, setMapNavigationTarget] = useState<MapNavigationTarget | null>(null);
  const [contextMenu, setContextMenu] = useState<MapContextMenuState>({ isOpen: false, x: 0, y: 0, lat: 0, lng: 0 });

  // State to hold links pending combined PDF export (for modal)
  const [combinedExportLinks, setCombinedExportLinks] = useState<SavedLink[]>([]);

  // Credit management
  const { refreshCredits } = useCredits();
  const [creditWarningTrigger, setCreditWarningTrigger] = useState(false);
  const [latestCredits, setLatestCredits] = useState<number>(999);
  const [showZeroCreditModal, setShowZeroCreditModal] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidePanelOpen(false);
    }
  }, []);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(AnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onBlur',
  });

  const { register, handleSubmit, control, formState: { errors: clientFormErrors }, setValue, watch, reset } = form;

  useFormPersistence(form);
  const mapInteraction = useMapInteraction(form);
  const pdfDownload = usePdfDownload();
  const saved = useSavedLinks();

  const analysis = useAnalysisState({
    serverAction: performLosAnalysis,
    form,
    isAnalysisPanelGloballyOpen: true,
    setIsAnalysisPanelGloballyOpen: () => { },
    setIsBottomPanelContentExpanded: setIsProfileExpanded,
    toast
  });

  const fiber = useFiberCalculation({
    analysisResult: analysis.analysisResult,
    isStale: analysis.isStale,
    toast,
    rawServerState: analysis.rawServerState
  });

  const analysisRef = useRef(analysis);
  analysisRef.current = analysis;
  const fiberRef = useRef(fiber);
  fiberRef.current = fiber;

  // ── Handle credit updates after analysis ──
  useEffect(() => {
    const result = analysis.analysisResult;
    if (result && !analysis.isStale && 'creditsRemaining' in result) {
      const remaining = (result as { creditsRemaining?: number }).creditsRemaining;
      if (typeof remaining === 'number') {
        setLatestCredits(remaining);
        setCreditWarningTrigger(true);

        if (remaining <= 0) {
          setShowZeroCreditModal(true);
        }

        // Refresh session to update header credits
        refreshCredits();
      }
    }
  }, [analysis.analysisResult, analysis.isStale, refreshCredits]);

  // ── Handle credit errors from server ──
  useEffect(() => {
    const rawState = analysis.rawServerState;
    if (rawState && typeof rawState === 'object' && 'error' in rawState) {
      const errorObj = rawState as Record<string, unknown>;
      if (typeof errorObj.error === 'string') {
        const errorMsg = errorObj.error;
        if (errorMsg.includes('Not enough credits') || errorMsg.includes('Credit check failed')) {
          setShowZeroCreditModal(true);
        }
      }
    }
  }, [analysis.rawServerState]);

  const processSubmit = useCallback((data: AnalysisFormValues) => {
    if (!navigator.onLine) {
      toast({ title: 'No Connection', description: 'Please check your internet connection.', variant: 'destructive' });
      return;
    }
    analysisRef.current.setDisplayedError(null);
    analysisRef.current.setFieldErrors(null);
    fiberRef.current.setFiberPathResult(null);
    fiberRef.current.setFiberPathError(null);
    setCreditWarningTrigger(false);

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

    // ── Include selected device ID in FormData (Phase 6C) ──
    const currentDeviceId = analysisRef.current.selectedDeviceId;
    if (currentDeviceId) {
      formData.append('selectedDeviceId', currentDeviceId);
    }

    React.startTransition(() => {
      analysisRef.current.formAction(formData);
    });
  }, [toast]);

  const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    setValue(`${siteId}.height`, Math.round(newHeight), { shouldDirty: true, shouldValidate: true });
    form.trigger().then(isValid => {
      if (isValid) handleSubmit(processSubmit)();
      else toast({ title: "Input Error", description: "Please correct form errors before re-analyzing.", variant: "destructive" });
    });
  }, [setValue, handleSubmit, processSubmit, form, toast]);

  const handleAnalyzeClick = useCallback(() => {
    form.trigger().then(isValid => {
      if (isValid) handleSubmit(processSubmit)();
      else toast({ title: "Input Error", description: "Please set both site locations before analyzing.", variant: "destructive" });
    });
  }, [form, handleSubmit, processSubmit, toast]);

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
        if (keyName !== 'FIBER_TOGGLE' && keyName !== 'FIBER_RADIUS') localStorage.removeItem(LOCAL_STORAGE_KEYS[keyName]);
      });
    }
    analysisRef.current.clearAnalysis();
    fiberRef.current.setFiberPathResult(null);
    fiberRef.current.setFiberPathError(null);
    mapInteraction.setPlacementMode(null);
    setMapNavigationTarget(null);
    toast({ title: "Map Cleared", description: "Form reset to default values." });
    setIsProfileExpanded(false);
  }, [reset, isClient, toast, mapInteraction]);

  const handleNewLink = useCallback(() => {
    reset(defaultFormStateValues);
    if (isClient) {
      Object.keys(LOCAL_STORAGE_KEYS).forEach(key => {
        const keyName = key as keyof typeof LOCAL_STORAGE_KEYS;
        if (keyName !== 'FIBER_TOGGLE' && keyName !== 'FIBER_RADIUS') localStorage.removeItem(LOCAL_STORAGE_KEYS[keyName]);
      });
    }
    analysisRef.current.clearAnalysis();
    fiberRef.current.setFiberPathResult(null);
    fiberRef.current.setFiberPathError(null);
    mapInteraction.setPlacementMode('A');
    setMapNavigationTarget(null);
    setIsProfileExpanded(false);
    toast({ title: "Ready for New Link", description: "Place Site A to begin." });
  }, [reset, isClient, toast, mapInteraction]);

  const handleClearanceChange = useCallback((value: number[]) => {
    const numValue = value[0];
    if (typeof numValue === 'number') {
      setValue('clearanceThreshold', String(Math.round(numValue * 100) / 100), { shouldValidate: true, shouldDirty: true });
    }
  }, [setValue]);

  const toggleProfileExpansion = useCallback(() => setIsProfileExpanded(prev => !prev), []);

  // ── Search navigation ──
  const handleSearchNavigate = useCallback((lat: number, lng: number, name: string) => {
    setMapNavigationTarget({ lat, lng, zoom: 15, timestamp: Date.now() });

    if (mapInteraction.placementMode === 'A') {
      setValue('pointA.lat', lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
      setValue('pointA.lng', lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
      if (name && name !== `${lat.toFixed(6)}, ${lng.toFixed(6)}`) setValue('pointA.name', name, { shouldDirty: true });
      mapInteraction.setPlacementMode('B');
      toast({ title: `Site A set to ${name}`, description: 'Now place Site B.' });
    } else if (mapInteraction.placementMode === 'B') {
      setValue('pointB.lat', lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
      setValue('pointB.lng', lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
      if (name && name !== `${lat.toFixed(6)}, ${lng.toFixed(6)}`) setValue('pointB.name', name, { shouldDirty: true });
      mapInteraction.setPlacementMode(null);
      toast({ title: `Site B set to ${name}`, description: 'Both sites placed. Ready to analyze.' });
    } else {
      toast({ title: `Navigated to ${name}`, description: 'Press A or B to start placing a site.' });
    }
  }, [mapInteraction, setValue, toast]);

  const handleSearchPlaceA = useCallback((lat: number, lng: number, name: string) => {
    setValue('pointA.lat', lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
    setValue('pointA.lng', lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
    if (name && name !== `${lat.toFixed(6)}, ${lng.toFixed(6)}`) setValue('pointA.name', name, { shouldDirty: true });
    setMapNavigationTarget({ lat, lng, zoom: 15, timestamp: Date.now() });
    mapInteraction.setPlacementMode('B');
    toast({ title: `Site A set to ${name}`, description: 'Now place Site B.' });
  }, [setValue, toast, mapInteraction]);

  const handleSearchPlaceB = useCallback((lat: number, lng: number, name: string) => {
    setValue('pointB.lat', lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
    setValue('pointB.lng', lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
    if (name && name !== `${lat.toFixed(6)}, ${lng.toFixed(6)}`) setValue('pointB.name', name, { shouldDirty: true });
    setMapNavigationTarget({ lat, lng, zoom: 15, timestamp: Date.now() });
    mapInteraction.setPlacementMode(null);
    toast({ title: `Site B set to ${name}`, description: 'Both sites placed. Ready to analyze.' });
  }, [setValue, toast, mapInteraction]);

  const handleSearchNavigateOnly = useCallback((lat: number, lng: number, name: string) => {
    setMapNavigationTarget({ lat, lng, zoom: 15, timestamp: Date.now() });
    toast({ title: `Navigated to ${name}` });
  }, [toast]);

  // ── Save link (Phase 6C: includes selectedDeviceId) ──
  const handleSaveLink = useCallback(() => {
    if (!analysis.analysisResult || analysis.isStale) {
      toast({ title: "Cannot Save", description: "Run analysis first.", variant: "destructive" });
      return;
    }
    const link = saved.saveLink({
      analysisResult: analysis.analysisResult,
      fiberPathResult: fiber.fiberPathResult,
      clearanceThreshold: parseFloat(watch('clearanceThreshold')),
      selectedDeviceId: analysis.selectedDeviceId ?? undefined,
    });
    toast({ title: "Link Saved", description: `"${link.name}" saved to library.` });
  }, [analysis.analysisResult, analysis.isStale, analysis.selectedDeviceId, fiber.fiberPathResult, saved, toast, watch]);

  // ── Load saved link (Phase 6C: restores selectedDeviceId) ──
  const handleLoadSavedLink = useCallback((link: SavedLink) => {
    setValue('pointA.name', link.pointA.name, { shouldDirty: true });
    setValue('pointA.lat', link.pointA.lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
    setValue('pointA.lng', link.pointA.lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
    setValue('pointA.height', link.pointA.towerHeight, { shouldDirty: true, shouldValidate: true });
    setValue('pointB.name', link.pointB.name, { shouldDirty: true });
    setValue('pointB.lat', link.pointB.lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
    setValue('pointB.lng', link.pointB.lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
    setValue('pointB.height', link.pointB.towerHeight, { shouldDirty: true, shouldValidate: true });
    setValue('clearanceThreshold', link.clearanceThreshold.toString(), { shouldDirty: true, shouldValidate: true });

    // Restore device selection from saved link
    analysis.setSelectedDeviceId(link.selectedDeviceId ?? null);

    const midLat = (link.pointA.lat + link.pointB.lat) / 2;
    const midLng = (link.pointA.lng + link.pointB.lng) / 2;
    setMapNavigationTarget({ lat: midLat, lng: midLng, zoom: 12, timestamp: Date.now() });

    toast({ title: "Link Loaded", description: `"${link.name}" restored. Click Analyze to refresh.` });

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidePanelOpen(false);
    }
  }, [setValue, toast, analysis]);

  // ── Context menu handlers ──
  const handleContextMenu = useCallback((state: MapContextMenuState) => setContextMenu(state), []);
  const closeContextMenu = useCallback(() => setContextMenu(prev => ({ ...prev, isOpen: false })), []);

  const handleContextPlaceSite = useCallback((site: 'A' | 'B', lat: number, lng: number) => {
    const pointId = site === 'A' ? 'pointA' : 'pointB';
    setValue(`${pointId}.lat`, lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
    setValue(`${pointId}.lng`, lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
    mapInteraction.setPlacementMode(site === 'A' ? 'B' : null);
    toast({ title: `Site ${site} placed`, description: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
  }, [setValue, mapInteraction, toast]);

  const handleContextCopy = useCallback((lat: number, lng: number) => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied", description: text });
    }).catch(() => {
      toast({ title: "Copy failed", variant: "destructive" });
    });
  }, [toast]);

  const handleContextNavigate = useCallback((lat: number, lng: number) => {
    setMapNavigationTarget({ lat, lng, zoom: 16, timestamp: Date.now() });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleContextWhatsHere = useCallback((_lat: number, _lng: number) => {
  }, []);

  // ══════════════════════════════════════════════════════
  // PDF DOWNLOAD — Single report: opens export config modal
  // ══════════════════════════════════════════════════════

  /** Opens the export config modal instead of downloading directly */
  const handlePdfButtonClick = useCallback(() => {
    if (!analysis.analysisResult || analysis.isStale) {
      toast({ title: "No Results", description: "Run analysis first to generate a PDF.", variant: "destructive" });
      return;
    }
    pdfDownload.openExportModal();
  }, [analysis.analysisResult, analysis.isStale, pdfDownload, toast]);

  /** Called when user confirms download from the single export config modal */
  const handleExportConfigConfirm = useCallback((config: ExportConfig) => {
    pdfDownload.handleDownloadWithConfig(
      analysis.analysisResult,
      toast,
      config,
      fiber.fiberPathResult,
    );
  }, [analysis.analysisResult, fiber.fiberPathResult, pdfDownload, toast]);

  /** Called when user confirms download from the combined export config modal */
  const handleCombinedExportConfigConfirm = useCallback((config: ExportConfig) => {
    pdfDownload.handleDownloadCombinedWithConfig(
      combinedExportLinks,
      toast,
      config,
    );
  }, [combinedExportLinks, pdfDownload, toast]);

  // ── Export handlers ──
  const handleExportKmz = useCallback(async (links: SavedLink[]) => {
    try {
      const { exportSavedLinksAsKmz } = await import('@/lib/saved-link-exports');
      await exportSavedLinksAsKmz(links);
      toast({ title: "KMZ Exported", description: `${links.length} link(s) exported to KMZ.` });
    } catch (e) {
      console.error('KMZ export failed:', e);
      toast({ title: "Export Failed", description: e instanceof Error ? e.message : "KMZ export failed.", variant: "destructive" });
    }
  }, [toast]);

  const handleExportExcel = useCallback(async (links: SavedLink[]) => {
    try {
      const { exportSavedLinksAsExcel } = await import('@/lib/saved-link-exports');
      await exportSavedLinksAsExcel(links);
      toast({ title: "Excel Exported", description: `${links.length} link(s) exported to Excel.` });
    } catch (e) {
      console.error('Excel export failed:', e);
      toast({ title: "Export Failed", description: e instanceof Error ? e.message : "Excel export failed.", variant: "destructive" });
    }
  }, [toast]);

  const handleExportCsv = useCallback(async (links: SavedLink[]) => {
    try {
      const { exportSavedLinksAsCsv } = await import('@/lib/saved-link-exports');
      await exportSavedLinksAsCsv(links);
      toast({ title: "CSV Exported", description: `${links.length} link(s) exported to CSV.` });
    } catch (e) {
      console.error('CSV export failed:', e);
      toast({ title: "Export Failed", description: e instanceof Error ? e.message : "CSV export failed.", variant: "destructive" });
    }
  }, [toast]);

  /** Combined PDF: opens export config modal instead of downloading directly */
  const handleExportPdf = useCallback(async (links: SavedLink[]) => {
    if (!links.length) {
      toast({ title: "No Links", description: "No links to export.", variant: "destructive" });
      return;
    }
    // Store the links and open the combined export config modal
    setCombinedExportLinks(links);
    pdfDownload.openCombinedExportModal();
  }, [toast, pdfDownload]);

  // ── Keyboard shortcuts ──
  const toggleSidePanel = useCallback(() => setIsSidePanelOpen(prev => !prev), []);

  useKeyboardShortcuts({
    onSetPlacementMode: mapInteraction.setPlacementMode,
    onAnalyze: handleAnalyzeClick,
    onToggleSidePanel: toggleSidePanel,
    onSaveLink: handleSaveLink,
    placementMode: mapInteraction.placementMode,
    isActionPending: analysis.isActionPending,
    hasAnalysisResult: !!analysis.analysisResult && !analysis.isStale,
  });

  // ── Watched form values ──
  const isValidNumericString = (val: string) => val && !isNaN(parseFloat(val));
  const watchedPointALat = watch('pointA.lat');
  const watchedPointALng = watch('pointA.lng');
  const watchedPointAName = watch('pointA.name');
  const watchedPointBLat = watch('pointB.lat');
  const watchedPointBLng = watch('pointB.lng');
  const watchedPointBName = watch('pointB.name');

  const hasPointA = !!(watchedPointALat && isValidNumericString(watchedPointALat) && watchedPointALng && isValidNumericString(watchedPointALng));
  const hasPointB = !!(watchedPointBLat && isValidNumericString(watchedPointBLat) && watchedPointBLng && isValidNumericString(watchedPointBLng));

  useEffect(() => {
    if (analysis.analysisResult) setIsProfileExpanded(true);
  }, [analysis.analysisResult]);

  // ── Determine if device data is available (for export modals) ──
  const hasDeviceData = !!(analysis.analysisResult?.deviceCompatibility);
  const combinedHasDeviceData = combinedExportLinks.some(
    l => !!(l.analysisResult.deviceCompatibility || l.selectedDeviceId)
  );

  return (
    <>
      <ProgressBar isActive={analysis.isActionPending || fiber.isFiberCalculating} />

      {/* Credit warning toasts */}
      <CreditWarning credits={latestCredits} trigger={creditWarningTrigger} />

      {/* Zero-credit blocking modal */}
      <ProUpsellModal
        open={showZeroCreditModal}
        onOpenChange={setShowZeroCreditModal}
        blocking={latestCredits <= 0}
        trigger="zero_credits"
      />

      {/* ══════════════════════════════════════════════════
          Export Config Modal for single-link PDF
          ══════════════════════════════════════════════════ */}
      <ExportConfigModal
        open={pdfDownload.isExportModalOpen}
        onOpenChange={(open) => {
          if (!open) pdfDownload.closeExportModal();
        }}
        onConfirm={handleExportConfigConfirm}
        isLoading={pdfDownload.isGeneratingPdf}
        defaultTitle="LOS Feasibility Report"
        userName=""
        isCombinedReport={false}
        hasDeviceData={hasDeviceData}
        formatLabel="PDF Report"
      />

      {/* ══════════════════════════════════════════════════
          Export Config Modal for combined/bulk PDF
          ══════════════════════════════════════════════════ */}
      <ExportConfigModal
        open={pdfDownload.isCombinedExportModalOpen}
        onOpenChange={(open) => {
          if (!open) pdfDownload.closeCombinedExportModal();
        }}
        onConfirm={handleCombinedExportConfigConfirm}
        isLoading={pdfDownload.isGeneratingPdf}
        defaultTitle="LOS Feasibility Analysis"
        userName=""
        isCombinedReport={true}
        hasDeviceData={combinedHasDeviceData}
        formatLabel="Combined PDF Report"
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {analysis.analysisResult && !analysis.isStale && (
          analysis.analysisResult.losPossible
            ? `Analysis complete. Line of sight is feasible. Distance: ${analysis.analysisResult.distanceKm.toFixed(2)} kilometers.`
            : `Analysis complete. Line of sight is blocked. ${analysis.analysisResult.message || ''}`
        )}
      </div>

      {!isOnline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[70] bg-red-500/95 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 backdrop-blur-sm pt-safe">
          <WifiOff className="h-3.5 w-3.5" /> Offline &mdash; analysis requires internet
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div className="flex h-full w-full overflow-hidden">

        {/* Side Panel */}
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
          control={control} register={register}
          clientFormErrors={clientFormErrors}
          serverFormErrors={analysis.fieldErrors ?? undefined}
          placementMode={mapInteraction.placementMode}
          onSetPlacementMode={mapInteraction.setPlacementMode}
          onAnalyze={handleAnalyzeClick}
          onClearMap={handleClearMap}
          onNewLink={handleNewLink}
          isActionPending={analysis.isActionPending}
          analysisResult={analysis.analysisResult}
          isStale={analysis.isStale}
          onDownloadPdf={handlePdfButtonClick}
          isGeneratingPdf={pdfDownload.isGeneratingPdf}
          fiberPathResult={fiber.fiberPathResult}
          isFiberCalculating={fiber.isFiberCalculating}
          fiberPathError={fiber.fiberPathError}
          isFiberPathEnabled={fiber.calculateFiberPathEnabled}
          onToggleFiberPath={fiber.handleToggleFiberPath}
          snapRadius={parseInt(fiber.localSnapRadiusInput, 10)}
          onSnapRadiusChange={fiber.setLocalSnapRadiusInput}
          onApplySnapRadius={fiber.handleApplySnapRadius}
          clearanceThreshold={parseFloat(watch('clearanceThreshold'))}
          onClearanceThresholdChange={handleClearanceChange}
          isPending={analysis.isActionPending || fiber.isFiberCalculating}
          onSearchNavigate={handleSearchNavigate}
          savedLinks={saved.savedLinks}
          onSaveLink={handleSaveLink}
          onLoadSavedLink={handleLoadSavedLink}
          onDeleteSavedLink={saved.deleteLink}
          onDeleteMultipleSavedLinks={saved.deleteMultipleLinks}
          onClearAllSavedLinks={saved.clearAllLinks}
          selectedLinkIds={saved.selectedLinkIds}
          onToggleLinkSelection={saved.toggleLinkSelection}
          onSelectAllLinks={saved.selectAllLinks}
          onDeselectAllLinks={saved.deselectAllLinks}
          isSelectionMode={saved.isSelectionMode}
          onSetSelectionMode={saved.setIsSelectionMode}
          onExportKmz={handleExportKmz}
          onExportExcel={handleExportExcel}
          onExportCsv={handleExportCsv}
          onExportPdf={handleExportPdf}
          historyList={analysis.historyList}
          onLoadHistoryItem={analysis.loadFromHistory}
          onClearHistory={handleClearHistory}
          selectedDeviceId={analysis.selectedDeviceId}
          onSelectDevice={analysis.setSelectedDeviceId}
          currentDistanceKm={mapInteraction.liveDistanceKm}
        />

        {/* Map + Bottom Profile */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* ── MapHeader: Google Maps-style floating header ── */}
          <MapHeader
            onToggleSidePanel={() => setIsSidePanelOpen(true)}
            showHamburger={!isSidePanelOpen}
            onSearchPlaceSelected={handleSearchNavigate}
            onSearchPlaceA={handleSearchPlaceA}
            onSearchPlaceB={handleSearchPlaceB}
            onSearchNavigateOnly={handleSearchNavigateOnly}
            placementMode={mapInteraction.placementMode}
          />

          {/* Placement indicator */}
          {mapInteraction.placementMode && (
            <div className="absolute top-[7.5rem] sm:top-[5.5rem] left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2 max-w-[90vw] pointer-events-none">
              <div className={cn("flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl border backdrop-blur-xl pointer-events-auto",
                mapInteraction.placementMode === 'A' ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300" : "bg-blue-950/80 border-blue-500/30 text-blue-300")}>
                <div className="h-3.5 w-3.5 rounded-full bg-current animate-pulse" />
                <span className="text-xs font-semibold whitespace-nowrap">
                  {typeof window !== 'undefined' && window.innerWidth < 768
                    ? `Tap to place Site ${mapInteraction.placementMode}`
                    : `Click map or search to place Site ${mapInteraction.placementMode}`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Loading pill */}
          {(analysis.isActionPending || fiber.isFiberCalculating) && (
            <div className="absolute top-[7.5rem] sm:top-[5.5rem] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-slate-950/95 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl border border-white/[0.06] pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs font-medium text-white/80">
                {analysis.isActionPending ? "Analyzing link..." : "Computing fiber path..."}
              </span>
            </div>
          )}

          {/* Error modal */}
          {analysis.displayedError && !analysis.isActionPending && (
            <ErrorModal message={analysis.displayedError} onDismiss={analysis.dismissErrorModal}
              onRetry={analysis.retryLastAnalysis} title="LOS Analysis Failed" />
          )}

          {/* Map */}
          <div className="flex-1 min-h-0 relative">
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
                mapNavigationTarget={mapNavigationTarget}
                onContextMenu={handleContextMenu}
                savedLinks={saved.savedLinks}
                onSavedLinkClick={handleLoadSavedLink}
                selectedDeviceId={analysis.selectedDeviceId}
              />
            </MapErrorBoundary>

            <KeyboardHint show={isClient && typeof window !== 'undefined' && window.innerWidth >= 1024} />
          </div>

          {/* Bottom Profile Strip */}
          {isClient && (
            <ErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => (
                <div className="bg-red-950/95 border-t border-red-500/30 p-4 flex items-center justify-between pb-safe">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <p className="text-sm text-red-200">{error.message}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={resetErrorBoundary} className="text-white border-white/20">Reset</Button>
                </div>
              )}
            >
              <BottomPanel
                analysisResult={analysis.analysisResult}
                isPanelGloballyVisible={!!analysis.analysisResult || analysis.isActionPending}
                isContentExpanded={isProfileExpanded}
                onToggleContentExpansion={toggleProfileExpansion}
                isStale={analysis.isStale}
                control={control} register={register}
                handleSubmit={handleSubmit} processSubmit={processSubmit}
                clientFormErrors={clientFormErrors}
                serverFormErrors={analysis.fieldErrors ?? undefined}
                isActionPending={analysis.isActionPending}
                onTowerHeightChangeFromGraph={handleTowerHeightChangeFromGraph}
                onDownloadPdf={handlePdfButtonClick}
                isGeneratingPdf={pdfDownload.isGeneratingPdf}
                fiberPathResult={fiber.fiberPathResult}
                isFiberCalculating={fiber.isFiberCalculating}
                fiberPathError={fiber.fiberPathError}
                selectedDeviceId={analysis.selectedDeviceId}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>

      {/* Context Menu */}
      <MapContextMenu
        state={contextMenu}
        onClose={closeContextMenu}
        onPlaceSite={handleContextPlaceSite}
        onCopyCoordinates={handleContextCopy}
        onNavigateHere={handleContextNavigate}
        onWhatsHere={handleContextWhatsHere}
      />
    </>
  );
}