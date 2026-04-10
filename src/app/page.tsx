"use client";

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertTriangle, WifiOff, PanelLeftOpen } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { performLosAnalysis } from '@/app/actions';
import type { AnalysisFormValues, MapNavigationTarget, MapContextMenuState, SavedLink } from '@/types';
import { AnalysisFormSchema, defaultFormStateValues } from '@/lib/form-schema';

import InteractiveMap from '@/components/fso/interactive-map';
import BottomPanel from '@/components/fso/bottom-panel';
import SidePanel from '@/components/fso/side-panel';
import MapContextMenu from '@/components/fso/map-context-menu';
import { MapHintOverlay } from '@/components/map/map-hint-overlay';
import MapSearchBar from '@/components/fso/map-search-bar';
import AppHeader from '@/components/layout/app-header';
// SiteInputCard, ConfigSection, DownloadMenu — used inside SidePanel only
import { AnalysisButton } from '@/components/fso/analysis-button';
import { ResultsCard } from '@/components/fso/results-card';
import KeyboardHint from '@/components/fso/keyboard-hint';
import { MobileBottomSheet, type SheetSnapPoint } from '@/components/fso/mobile-bottom-sheet';
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
import { useFlowState } from '@/hooks/use-flow-state';
import { useWhatsAppShare } from '@/components/fso/whatsapp-share';
import { useIsMobile } from '@/hooks/use-mobile';

// Phase 11: Map tools
import { useMapTools } from '@/hooks/use-map-tools';
import { MapToolbar } from '@/components/map/map-toolbar';
import { ToolResultPanel } from '@/components/map/tool-result-panel';
// DrawingsManager removed — drawings are now in the side panel
import { getDeviceById } from '@/config/devices';
import { AlignmentPanel } from '@/components/map/alignment-panel';

// Phase 12C: Solar Analyzer
import { SolarPanel } from '@/components/map/solar-panel';
import { setSolarAnalysisData } from '@/components/map/tools/solar-analyzer';
import { setAlignmentAnalysisData } from '@/components/map/tools/alignment-guide';
import type { SolarAnalysisResult } from '@/lib/solar-position';

// Onboarding
import { useSession } from 'next-auth/react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useHints } from '@/hooks/use-hints';
import { useHelpPanel } from '@/hooks/use-help-panel';
import { GuidedTour } from '@/components/onboarding/guided-tour';
import { HintBadge } from '@/components/ui/hint-badge';

import CreditWarning from '@/components/credit-warning';
import ProUpsellModal from '@/components/pro-upsell-modal';

// Export config modal for PDF downloads
import { ExportConfigModal } from '@/components/fso/export-config-modal';
import type { ExportConfig } from '@/tools/report-generator/types';

export default function Home() {
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const isOnline = useOnlineStatus();
  const isMobile = useIsMobile();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [mapNavigationTarget, setMapNavigationTarget] = useState<MapNavigationTarget | null>(null);
  const [contextMenu, setContextMenu] = useState<MapContextMenuState>({ isOpen: false, x: 0, y: 0, lat: 0, lng: 0 });

  // Mobile bottom sheet state
  const [sheetSnapPoint, setSheetSnapPoint] = useState<SheetSnapPoint>('collapsed');

  // Phase 5: Alignment panel state
  const [alignmentTarget, setAlignmentTarget] = useState<{
    linkId: string;
    linkName: string;
    direction: 'A→B' | 'B→A';
    azimuth: number;
    elevation: number;
  } | null>(null);

  // State to hold links pending combined PDF export (for modal)
  const [combinedExportLinks, setCombinedExportLinks] = useState<SavedLink[]>([]);

  // Download tracking state (for download menu)
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  // Credit management
  const { refreshCredits } = useCredits();
  const [creditWarningTrigger, setCreditWarningTrigger] = useState(false);
  const [latestCredits, setLatestCredits] = useState<number>(999);
  const [showZeroCreditModal, setShowZeroCreditModal] = useState(false);

  // ── Onboarding ──
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const onboarding = useOnboarding(userId);
  const helpPanel = useHelpPanel();

  // ── Phase 11: Map instance ref for tools ──
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  const handleMapReady = useCallback((map: google.maps.Map | null) => {
    mapInstanceRef.current = map;
  }, []);

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidePanelOpen(false);
    }
  }, []);

  // Auto-start tour for first-time users (1.5s delay)
  useEffect(() => {
    if (onboarding.isLoading || !isClient) return;
    if (!onboarding.shouldShowTour) return;

    const timer = setTimeout(() => {
      onboarding.startTour();
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarding.isLoading, onboarding.shouldShowTour, isClient, onboarding.startTour]);

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
    setIsAnalysisPanelGloballyOpen: () => {},
    setIsBottomPanelContentExpanded: setIsProfileExpanded,
    toast
  });

  const fiber = useFiberCalculation({
    analysisResult: analysis.analysisResult,
    isStale: analysis.isStale,
    toast,
    rawServerState: analysis.rawServerState
  });

  const whatsApp = useWhatsAppShare({ toast });

  // ── Watched form values ──
  const watchedPointALat = watch('pointA.lat');
  const watchedPointALng = watch('pointA.lng');
  const watchedPointAName = watch('pointA.name');
  const watchedPointAHeight = watch('pointA.height');
  const watchedPointBLat = watch('pointB.lat');
  const watchedPointBLng = watch('pointB.lng');
  const watchedPointBName = watch('pointB.name');
  const watchedPointBHeight = watch('pointB.height');
  const watchedClearance = watch('clearanceThreshold');

  const isValidNumericString = (val: string) => val && !isNaN(parseFloat(val));
  const hasPointA = !!(watchedPointALat && isValidNumericString(watchedPointALat) && watchedPointALng && isValidNumericString(watchedPointALng));
  const hasPointB = !!(watchedPointBLat && isValidNumericString(watchedPointBLat) && watchedPointBLng && isValidNumericString(watchedPointBLng));

  // ── Flow State ──
  const flow = useFlowState(
    hasPointA ? { lat: watchedPointALat, lng: watchedPointALng } : null,
    hasPointB ? { lat: watchedPointBLat, lng: watchedPointBLng } : null,
    !!analysis.analysisResult,
    analysis.isActionPending,
    analysis.isStale,
  );

  // ── Phase 11: Map Tools ──
  const mapTools = useMapTools({
    getMap: () => mapInstanceRef.current,
    onToolActiveChange: (isActive) => {
      // When a tool activates, cancel placement mode
      if (isActive && mapInteraction.placementMode) {
        mapInteraction.setPlacementMode(null);
      }
    },
    getDeviceRangeMeters: () => {
      if (!analysis.selectedDeviceId) return 5000;
      const device = getDeviceById(analysis.selectedDeviceId);
      return device?.maxRange ?? 5000;
    },
    getDeviceName: () => {
      if (!analysis.selectedDeviceId) return null;
      const device = getDeviceById(analysis.selectedDeviceId);
      return device?.name ?? null;
    },
  });
    //hints
    const hints = useHints({
    analysisCount: onboarding.analysisCount,
    creditsRemaining: latestCredits,
    getHintShowCount: onboarding.getHintShowCount,
    onDismiss: onboarding.dismissHint,
    isFeatureUsed: onboarding.isFeatureUsed,
    isTourActive: onboarding.isTourActive,
    isHelpPanelOpen: helpPanel.isOpen,
  });

  const analysisRef = useRef(analysis);
  analysisRef.current = analysis;
  const fiberRef = useRef(fiber);
  fiberRef.current = fiber;

  // ── Track analysis count for hints ──
  useEffect(() => {
    if (analysis.analysisResult && !analysis.isStale) {
      onboarding.incrementAnalysisCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis.analysisResult?.id]);

  // ── Handle credit updates after analysis (BUILD FIX: corrected braces) ──
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
    // Phase 11: Deactivate tool before analyzing
    if (mapTools.isToolActive) mapTools.deactivateTool();

    form.trigger().then(isValid => {
      if (isValid) handleSubmit(processSubmit)();
      else toast({ title: "Input Error", description: "Please set both site locations before analyzing.", variant: "destructive" });
    });
  }, [form, handleSubmit, processSubmit, toast, mapTools]);

  const handleClearHistory = useCallback(() => {
    analysis.setHistoryList([]);
    toast({ title: "History Cleared" });
  }, [toast, analysis]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    mapTools.deactivateTool();
    mapTools.clearAllOverlays();
    setMapNavigationTarget(null);
    toast({ title: "Map Cleared", description: "Form reset to default values." });
    setIsProfileExpanded(false);
  }, [reset, isClient, toast, mapInteraction, mapTools]);

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
    mapTools.deactivateTool();
    setMapNavigationTarget(null);
    setIsProfileExpanded(false);
    toast({ title: "Ready for New Link", description: "Place Site A to begin." });
  }, [reset, isClient, toast, mapInteraction, mapTools]);

  // ── Site clear handlers ──
  const handleClearSiteA = useCallback(() => {
    setValue('pointA.lat', '', { shouldDirty: true, shouldValidate: true });
    setValue('pointA.lng', '', { shouldDirty: true, shouldValidate: true });
    setValue('pointA.name', 'Site A', { shouldDirty: true });
    setValue('pointA.height', 20, { shouldDirty: true });
  }, [setValue]);

  const handleClearSiteB = useCallback(() => {
    setValue('pointB.lat', '', { shouldDirty: true, shouldValidate: true });
    setValue('pointB.lng', '', { shouldDirty: true, shouldValidate: true });
    setValue('pointB.name', 'Site B', { shouldDirty: true });
    setValue('pointB.height', 20, { shouldDirty: true });
  }, [setValue]);

  // ── Tower height change handlers ──
  const handleSiteATowerHeightChange = useCallback((height: number) => {
    setValue('pointA.height', height, { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  const handleSiteBTowerHeightChange = useCallback((height: number) => {
    setValue('pointB.height', height, { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  // ── Clearance threshold handler ──
  const handleClearanceChange = useCallback((value: number) => {
    setValue('clearanceThreshold', String(Math.round(value * 100) / 100), { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const isAnyExportModalOpen = pdfDownload.isExportModalOpen || pdfDownload.isCombinedExportModalOpen;

  const handleToggleProfileExpansion = useCallback(() => {
    if (isMobile) {
      setSheetSnapPoint('collapsed');
    }
    setIsProfileExpanded(prev => !prev);
  }, [isMobile]);

  // ── Search navigation ──
  const handleSearchNavigate = useCallback((lat: number, lng: number, name: string) => {
    setMapNavigationTarget({ lat, lng, zoom: 15, timestamp: Date.now() });

    if (mapInteraction.placementMode === 'A') {
      setValue('pointA.lat', lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
      setValue('pointA.lng', lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
      if (name && name !== `${lat.toFixed(6)}, ${lng.toFixed(6)}`) setValue('pointA.name', name, { shouldDirty: true });
      mapInteraction.setPlacementMode('B');
      toast({ title: `Site A set to ${name}`, description: 'Now place Site B.' });
    } else  if (mapInteraction.placementMode === 'B') {
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

  // ── Save link ──
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

  // ── Load saved link ──
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
    analysis.setSelectedDeviceId(link.selectedDeviceId ?? null);

    const midLat = (link.pointA.lat + link.pointB.lat) / 2;
    const midLng = (link.pointA.lng + link.pointB.lng) / 2;
    setMapNavigationTarget({ lat: midLat, lng: midLng, zoom: 12, timestamp: Date.now() });
    toast({ title: "Link Loaded", description: `"${link.name}" restored. Click Analyze to refresh.` });

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidePanelOpen(false);
      setSheetSnapPoint('collapsed');
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
  const handleContextWhatsHere = useCallback((_lat: number, _lng: number) => {}, []);

  // ══════════════════════════════════════════════════════
  // PDF / DOWNLOAD HANDLERS
  // ══════════════════════════════════════════════════════

  const handlePdfButtonClick = useCallback(() => {
    if (!analysis.analysisResult || analysis.isStale) {
      toast({ title: "No Results", description: "Run analysis first to generate a PDF.", variant: "destructive" });
      return;
    }
    setIsSidePanelOpen(false);
    setSheetSnapPoint('collapsed');
    setDownloadingType('pdf');
    pdfDownload.openExportModal();
    onboarding.markFeatureUsed('exportConfig');
  }, [analysis.analysisResult, analysis.isStale, pdfDownload, toast, onboarding]);

  const handleExportConfigConfirm = useCallback(async (config: ExportConfig) => {
    try {
      await pdfDownload.handleDownloadWithConfig(
        analysis.analysisResult,
        toast,
        config,
        fiber.fiberPathResult,
      );
    } finally {
      setDownloadingType(null);
    }
  }, [analysis.analysisResult, fiber.fiberPathResult, pdfDownload, toast]);

  const handleCombinedExportConfigConfirm = useCallback(async (config: ExportConfig) => {
    try {
      await pdfDownload.handleDownloadCombinedWithConfig(
        combinedExportLinks,
        toast,
        config,
      );
    } finally {
      setDownloadingType(null);
    }
  }, [combinedExportLinks, pdfDownload, toast]);

  const handleDownloadCombinedPdf = useCallback((links: SavedLink[]) => {
    if (!links.length) {
      toast({ title: "No Links", description: "No links to export.", variant: "destructive" });
      return;
    }
    setIsSidePanelOpen(false);
    setSheetSnapPoint('collapsed');
    setCombinedExportLinks(links);
    setDownloadingType('combined-pdf');
    pdfDownload.openCombinedExportModal();
  }, [toast, pdfDownload]);

  const handleExportKmz = useCallback(async (links: SavedLink[]) => {
    setDownloadingType('kmz');
    try {
      const { exportSavedLinksAsKmz } = await import('@/lib/saved-link-exports');
      await exportSavedLinksAsKmz(links);
      toast({ title: "KMZ Exported", description: `${links.length} link(s) exported to KMZ.` });
    } catch (e) {
      console.error('KMZ export failed:', e);
      toast({ title: "Export Failed", description: e instanceof Error ? e.message : "KMZ export failed.", variant: "destructive" });
    } finally {
      setDownloadingType(null);
    }
  }, [toast]);

  const handleExportExcel = useCallback(async (links: SavedLink[]) => {
    setDownloadingType('excel');
    try {
      const { exportSavedLinksAsExcel } = await import('@/lib/saved-link-exports');
      await exportSavedLinksAsExcel(links);
      toast({ title: "Excel Exported", description: `${links.length} link(s) exported to Excel.` });
    } catch (e) {
      console.error('Excel export failed:', e);
      toast({ title: "Export Failed", description: e instanceof Error ? e.message : "Excel export failed.", variant: "destructive" });
    } finally {
      setDownloadingType(null);
    }
  }, [toast]);

  const handleExportCsv = useCallback(async (links: SavedLink[]) => {
    setDownloadingType('csv');
    try {
      const { exportSavedLinksAsCsv } = await import('@/lib/saved-link-exports');
      await exportSavedLinksAsCsv(links);
      toast({ title: "CSV Exported", description: `${links.length} link(s) exported to CSV.` });
    } catch (e) {
      console.error('CSV export failed:', e);
      toast({ title: "Export Failed", description: e instanceof Error ? e.message : "CSV export failed.", variant: "destructive" });
    } finally {
      setDownloadingType(null);
    }
  }, [toast]);

  const handleShareWhatsApp = useCallback(async () => {
    if (!analysis.analysisResult || analysis.isStale) {
      toast({ title: "No Results", description: "Run analysis first.", variant: "destructive" });
      return;
    }
    setDownloadingType('whatsapp');
    try {
      await whatsApp.shareViaWhatsApp(analysis.analysisResult, fiber.fiberPathResult);
    } finally {
      setDownloadingType(null);
    }
  }, [analysis.analysisResult, analysis.isStale, fiber.fiberPathResult, whatsApp, toast]);

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
    // Phase 11: Map tool shortcuts
    onToggleMapTool: mapTools.toggleTool,
    onDeactivateMapTool: mapTools.deactivateTool,
    isMapToolActive: mapTools.isToolActive,
  });

  useEffect(() => {
    // Keep mobile controls visible after analysis so Analyze/Re-analyze remains accessible.
    if (analysis.analysisResult && !isMobile) {
      setIsProfileExpanded(true);
    }
  }, [analysis.analysisResult, isMobile]);

  useEffect(() => {
    // When parameters change while profile is expanded on mobile, return to the
    // existing bottom-sheet controls so the Analyze button remains visible.
    if (isMobile && analysis.isStale && isProfileExpanded) {
      setIsProfileExpanded(false);
      setSheetSnapPoint((prev) => (prev === 'collapsed' ? 'half' : prev));
    }
  }, [isMobile, analysis.isStale, isProfileExpanded]);

  // ── Phase 12C: Feed analysis data to solar tool ──
  const [solarResult, setSolarResult] = useState<SolarAnalysisResult | null>(null);
  const [showSolarPanel, setShowSolarPanel] = useState(false);

  useEffect(() => {
    setSolarAnalysisData(analysis.analysisResult ?? null);
    setAlignmentAnalysisData(analysis.analysisResult ?? null);
  }, [analysis.analysisResult]);

  // Watch for solar tool result
  useEffect(() => {
    if (mapTools.latestResult?.toolId === 'solar-analyzer') {
      const data = mapTools.latestResult.data;
      if (data.solarResult) {
        setSolarResult(data.solarResult as SolarAnalysisResult);
        setShowSolarPanel(true);
      } else if (data.error) {
        setSolarResult(null);
        setShowSolarPanel(false);
      }
    }
  }, [mapTools.latestResult]);

  // ── Collapse mobile sheet when map is tapped ──
  const handleMapClickWrapper = useCallback(
    (event: google.maps.MapMouseEvent, pointId: 'pointA' | 'pointB') => {
      mapInteraction.handleMapClick(event, pointId);
      if (isMobile && sheetSnapPoint !== 'collapsed') {
        setSheetSnapPoint('collapsed');
      }
    },
    [mapInteraction, isMobile, sheetSnapPoint]
  );

  // ── Device data flags for export modals ──
  const hasDeviceData = !!(analysis.analysisResult?.deviceCompatibility);
  const combinedHasDeviceData = combinedExportLinks.some(
    l => !!(l.analysisResult.deviceCompatibility || l.selectedDeviceId)
  );

  // ── Collapsed summary for mobile bottom sheet ──
  const collapsedSummary = useMemo(() => {
    if (analysis.analysisResult && !analysis.isStale) {
      const r = analysis.analysisResult;
      return (
        <span className="flex items-center gap-2">
          <span className={r.losPossible ? 'text-emerald-400' : 'text-red-400'}>
            {r.losPossible ? '✓ PASS' : '✗ FAIL'}
          </span>
          <span className="text-text-brand-muted">—</span>
          <span>{r.distanceKm.toFixed(1)} km</span>
        </span>
      );
    }
    if (flow.bothSitesPlaced) {
      return <span>✓ Both sites placed — ready to analyze</span>;
    }
    if (flow.siteAPlaced) {
      return <span>📍 Site A placed — tap map for Site B</span>;
    }
    return <span>📍 Tap map to place Site A</span>;
  }, [analysis.analysisResult, analysis.isStale, flow]);

  // ── Shared side panel props ──
  const sidePanelProps = {
    flow,
    siteAName: watchedPointAName,
    siteALat: watchedPointALat,
    siteALng: watchedPointALng,
    siteATowerHeight: watchedPointAHeight,
    onSiteATowerHeightChange: handleSiteATowerHeightChange,
    onSiteANameChange: (name: string) => setValue('pointA.name', name),
    onClearSiteA: handleClearSiteA,
    siteBName: watchedPointBName,
    siteBLat: watchedPointBLat,
    siteBLng: watchedPointBLng,
    siteBTowerHeight: watchedPointBHeight,
    onSiteBTowerHeightChange: handleSiteBTowerHeightChange,
    onSiteBNameChange: (name: string) => setValue('pointB.name', name),
    onClearSiteB: handleClearSiteB,
    placementMode: mapInteraction.placementMode,
    onSetPlacementMode: mapInteraction.setPlacementMode,
    clearanceThreshold: parseFloat(watchedClearance) || 10,
    onClearanceThresholdChange: handleClearanceChange,
    selectedDeviceId: analysis.selectedDeviceId,
    onSelectDevice: analysis.setSelectedDeviceId,
    currentDistanceKm: mapInteraction.liveDistanceKm,
    onAnalyze: handleAnalyzeClick,
    isActionPending: analysis.isActionPending,
    analysisResult: analysis.analysisResult,
    isStale: analysis.isStale,
    creditsRemaining: latestCredits,
    fiberPathResult: fiber.fiberPathResult,
    isFiberCalculating: fiber.isFiberCalculating,
    fiberPathError: fiber.fiberPathError,
    onSaveLink: handleSaveLink,
    onNewLink: handleNewLink,
    onDownloadPdf: handlePdfButtonClick,
    onDownloadCombinedPdf: handleDownloadCombinedPdf,
    onExportKmz: handleExportKmz,
    onExportExcel: handleExportExcel,
    onExportCsv: handleExportCsv,
    onShareWhatsApp: handleShareWhatsApp,
    isDownloading: pdfDownload.isGeneratingPdf || downloadingType !== null,
    downloadingType,
    savedLinks: saved.savedLinks,
    onLoadSavedLink: handleLoadSavedLink,
    onDeleteSavedLink: saved.deleteLink,
    onDeleteMultipleSavedLinks: saved.deleteMultipleLinks,
    onClearAllSavedLinks: saved.clearAllLinks,
    selectedLinkIds: saved.selectedLinkIds,
    onToggleLinkSelection: saved.toggleLinkSelection,
    onSelectAllLinks: saved.selectAllLinks,
    onDeselectAllLinks: saved.deselectAllLinks,
    isSelectionMode: saved.isSelectionMode,
    onSetSelectionMode: saved.setIsSelectionMode,
    historyList: analysis.historyList,
    onLoadHistoryItem: analysis.loadFromHistory,
    onClearHistory: handleClearHistory,
    onSearchNavigate: handleSearchNavigate,
    // Phase 2: Drawings integration
    drawings: mapTools.managedResults,
    onToggleDrawingVisibility: mapTools.toggleResultVisibility,
    onRemoveDrawing: mapTools.removeResult,
    onUpdateDrawing: mapTools.updateResultData,
  };

  return (
    <>
      <ProgressBar isActive={analysis.isActionPending || fiber.isFiberCalculating} />
      <CreditWarning credits={latestCredits} trigger={creditWarningTrigger} />
      <ProUpsellModal
        open={showZeroCreditModal}
        onOpenChange={setShowZeroCreditModal}
        blocking={latestCredits <= 0}
        trigger="zero_credits"
      />

      {/* Export Config Modal — single */}
      <ExportConfigModal
        open={pdfDownload.isExportModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            pdfDownload.closeExportModal();
            setDownloadingType(null);
          }
        }}
        onConfirm={handleExportConfigConfirm}
        isLoading={pdfDownload.isGeneratingPdf}
        defaultTitle="LOS Feasibility Report"
        userName=""
        isCombinedReport={false}
        hasDeviceData={hasDeviceData}
        formatLabel="PDF Report"
      />

      {/* Export Config Modal — combined */}
      <ExportConfigModal
        open={pdfDownload.isCombinedExportModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            pdfDownload.closeCombinedExportModal();
            setDownloadingType(null);
          }
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
          <WifiOff className="h-3.5 w-3.5" /> Offline — analysis requires internet
        </div>
      )}

      {/* ── GUIDED TOUR ── */}
      {isClient && (
        <GuidedTour
          isActive={onboarding.isTourActive}
          currentStep={onboarding.currentTourStep}
          onNext={onboarding.nextStep}
          onPrev={onboarding.prevStep}
          onSkip={onboarding.skipTour}
          onComplete={onboarding.completeTour}
        />
      )}

      {/* ── MICRO-HINT ── */}
      {isClient && hints.activeHint && !onboarding.isTourActive && (
        <HintBadge
          hint={hints.activeHint}
          interpolations={{ credits: String(latestCredits) }}
          onDismiss={hints.dismissCurrentHint}
        />
      )}

      {/* ── GLOBAL HEADER ── */}
      <AppHeader compact />

      {/* ── MAIN LAYOUT ── */}
      <div className="flex h-below-header w-full overflow-hidden">

        {/* Side Panel — all viewports (component handles responsive behavior internally) */}
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
          {...sidePanelProps}
        />

        {/* Map + Bottom Profile */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* Toggle side panel button — shown when panel is closed */}
          {!isSidePanelOpen && (
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="absolute top-3 left-3 z-30 p-2.5 rounded-lg bg-surface-card/90 backdrop-blur-sm border border-surface-border shadow-lg text-text-brand-muted hover:text-text-brand-primary hover:bg-surface-card transition-all touch-manipulation"
              aria-label="Open side panel"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}

          {/* Floating Search Bar — dark themed, over the map */}
          <div
            className="absolute top-3 z-20 pointer-events-none"
            style={{
              left: 'calc(0.75rem + var(--sai-left))',
              right: 'calc(3.75rem + var(--sai-right))',
            }}
          >
            <div className="pointer-events-auto">
              <MapSearchBar
                onPlaceSelected={handleSearchNavigate}
                onPlaceASelected={handleSearchPlaceA}
                onPlaceBSelected={handleSearchPlaceB}
                onNavigateOnly={handleSearchNavigateOnly}
                placementMode={mapInteraction.placementMode ?? null}
              />
            </div>
          </div>

          {/* Map Hint Overlay */}
          <MapHintOverlay
            currentStep={flow.currentStep}
            siteAPlaced={flow.siteAPlaced}
            siteBPlaced={flow.siteBPlaced}
            hasResults={flow.hasResults}
            isAnalyzing={flow.isAnalyzing}
            isStale={flow.isStale}
          />

          {/* Placement indicator */}
          {mapInteraction.placementMode && !mapTools.isToolActive && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2 max-w-[90vw] pointer-events-none">
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
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-surface-base/95 backdrop-blur-xl px-4 py-2 rounded-full shadow-2xl border border-surface-border pointer-events-none">
              <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
              <span className="text-xs font-medium text-text-brand-secondary">
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
          <div className="flex-1 min-h-0 relative" data-tour="map-area">
            <MapErrorBoundary>
              <InteractiveMap
                pointA={hasPointA ? { lat: parseFloat(watchedPointALat), lng: parseFloat(watchedPointALng), name: watchedPointAName } : undefined}
                pointB={hasPointB ? { lat: parseFloat(watchedPointBLat), lng: parseFloat(watchedPointBLng), name: watchedPointBName } : undefined}
                placementMode={mapInteraction.placementMode}
                onMapClick={handleMapClickWrapper}
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
                // Phase 11: Map tools props
                onMapReady={handleMapReady}
                activeMapTool={mapTools.state.activeTool}
                onToolMapClick={mapTools.handleToolClick}
                onToolMapDoubleClick={mapTools.handleToolDoubleClick}
                toolCursor={mapTools.getToolCursor()}
              />
            </MapErrorBoundary>

            {/* Phase 11: Map Toolbar */}
            {isClient && (
              <MapToolbar
                activeTool={mapTools.state.activeTool}
                onToggleTool={mapTools.toggleTool}
                onClearAll={mapTools.clearAllOverlays}
                isProcessing={mapTools.state.isProcessing}
                gridVisible={mapTools.gridVisible}
                isMobile={!!isMobile}
                statusMessage={mapTools.statusMessage}
                canFinishActiveTool={mapTools.canFinishActiveTool}
                onFinishActiveTool={mapTools.finishActiveTool}
              />
            )}

            {/* Phase 13: Drawings are now shown in the side panel Drawings section */}

            {/* Phase 11: Tool Result Panel */}
            {isClient && (
              <ToolResultPanel
                result={mapTools.latestResult}
                onClose={mapTools.clearLatestResult}
                isMobile={!!isMobile}
              />
            )}

            {/* Phase 12C: Solar Interference Panel */}
            {isClient && showSolarPanel && solarResult && (
              <SolarPanel
                result={solarResult}
                onClose={() => setShowSolarPanel(false)}
                isMobile={!!isMobile}
              />
            )}

            <KeyboardHint show={isClient && typeof window !== 'undefined' && window.innerWidth >= 1024} />
          </div>

          {/* Bottom Profile Strip */}
          {isClient && (!isMobile || isProfileExpanded) && (
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
                onToggleContentExpansion={handleToggleProfileExpansion}
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

      {/* Mobile Bottom Sheet — compact summary + quick actions */}
      {isMobile && isClient && !isProfileExpanded && !isAnyExportModalOpen && (
        <MobileBottomSheet
          collapsedSummary={collapsedSummary}
          snapPoint={sheetSnapPoint}
          onSnapPointChange={setSheetSnapPoint}
          isVisible={true}
        >
          <div className="space-y-3 py-2">
            {/* Quick Analyze button — always visible when both sites placed */}
            {flow.bothSitesPlaced && (
              <AnalysisButton
                canAnalyze={flow.canAnalyze}
                isAnalyzing={analysis.isActionPending}
                isStale={analysis.isStale}
                hasResults={flow.hasResults}
                creditsRemaining={latestCredits}
                onClick={handleAnalyzeClick}
              />
            )}

            {/* Quick results summary */}
            {analysis.analysisResult && !analysis.isStale && (
              <div className="space-y-2">
                <ResultsCard
                  result={analysis.analysisResult}
                  clearanceThreshold={parseFloat(watchedClearance) || 10}
                  fiberPathResult={fiber.fiberPathResult}
                  isFiberCalculating={fiber.isFiberCalculating}
                  fiberPathError={fiber.fiberPathError}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSheetSnapPoint('collapsed');
                      setIsProfileExpanded(true);
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 h-9 text-xs border-surface-border-light text-text-brand-secondary hover:text-text-brand-primary touch-manipulation"
                  >
                    Elevation Profile
                  </Button>
                  <Button onClick={handleSaveLink} size="sm" variant="outline"
                    className="flex-1 h-9 text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 touch-manipulation">
                    Save Link
                  </Button>
                </div>
              </div>
            )}

            {/* Open full side panel button */}
            <Button
              onClick={() => {
                setSheetSnapPoint('collapsed');
                setIsSidePanelOpen(true);
              }}
              size="sm"
              variant="outline"
              className="w-full h-9 text-xs border-surface-border-light text-text-brand-secondary hover:text-text-brand-primary touch-manipulation"
            >
              Open Full Panel
            </Button>
          </div>
        </MobileBottomSheet>
      )}
      {/* Phase 5: Device Alignment Panel */}
      {alignmentTarget && (
        <AlignmentPanel
          target={alignmentTarget}
          onClose={() => setAlignmentTarget(null)}
        />
      )}

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