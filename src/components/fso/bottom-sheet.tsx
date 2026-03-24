
"use client";

import type { Control, UseFormRegister, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { AnalysisResult, AnalysisFormValues } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import { Button } from '@/components/ui/button';
import { AnimatedNumber } from '@/components/animated-number';
import SiteInputCard from './site-input-card';
import { cn } from '@/lib/utils';
import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import {
  ChevronUp,
  Loader2,
  AlertTriangle,
  Download,
  BarChart3,
  MapPin,
  Info,
  Cable,
} from 'lucide-react';

const CustomProfileChart = React.lazy(() => import('./custom-profile-chart'));

type TabId = 'results' | 'profile' | 'sites';

// ─── RESULTS TAB ───────────────────────────────────────────────
interface ResultsTabProps {
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  isActionPending: boolean;
  handleSubmit: UseFormHandleSubmit<AnalysisFormValues>;
  processSubmit: (data: AnalysisFormValues) => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  isFiberCalculating: boolean;
  fiberPathResult: FiberPathResult | null;
  fiberPathError: string | null;
  minRequiredClearance: number;
}

const ResultsTab: React.FC<ResultsTabProps> = ({
  analysisResult, isStale, isActionPending, handleSubmit, processSubmit,
  onDownloadPdf, isGeneratingPdf, isFiberCalculating, fiberPathResult,
  fiberPathError, minRequiredClearance,
}) => {
  const actualMinClearance = analysisResult?.minClearance ?? null;
  let isClearBasedOnAnalysis = false;
  let deficit = 0;

  if (analysisResult && actualMinClearance !== null && !isNaN(minRequiredClearance)) {
    isClearBasedOnAnalysis = actualMinClearance >= minRequiredClearance;
    deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(minRequiredClearance - actualMinClearance);
  }

  const anyPending = isActionPending || isGeneratingPdf || isFiberCalculating;
  const buttonText = isActionPending ? "Analyzing..." : (isStale || !analysisResult ? "Analyze Link" : "Re-Analyze");

  if (!analysisResult && !isActionPending) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-3">
        <Info className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No analysis yet</p>
        <p className="text-xs text-muted-foreground/70">Place two sites on the map and tap Analyze</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2.5 px-1 overflow-y-auto">
      {/* Status + Metrics Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* LOS Status Badge */}
        <div className="flex-shrink-0">
          {isStale ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-500/80 text-yellow-900 flex items-center shadow whitespace-nowrap">
              <AlertTriangle className="mr-1 h-3 w-3" /> STALE
            </span>
          ) : analysisResult ? (
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold shadow-md whitespace-nowrap",
              isClearBasedOnAnalysis ? "bg-los-success text-los-success-foreground" : "bg-los-failure text-los-failure-foreground"
            )}>
              {isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"}
            </span>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <Button
            type="submit"
            onClick={handleSubmit(processSubmit)}
            disabled={anyPending}
            size="sm"
            className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 h-auto rounded-lg shadow-none transition-all active:scale-[0.97]"
          >
            <Loader2 className={cn("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")} />
            {buttonText}
          </Button>
          {analysisResult && !isStale && (
            <Button
              type="button"
              onClick={onDownloadPdf}
              disabled={anyPending}
              size="sm"
              variant="outline"
              className="text-xs px-2 py-1.5 h-auto rounded-lg border-primary/40 hover:bg-primary/10"
            >
              <Loader2 className={cn("mr-1 h-3 w-3", !isGeneratingPdf && "hidden", isGeneratingPdf && "animate-spin")} />
              <Download className={cn("mr-1 h-3 w-3", isGeneratingPdf && "hidden")} />
              PDF
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      {analysisResult && !isStale && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-700/30 rounded-lg px-3 py-2 text-center">
            <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground block">Aerial Distance</span>
            <span className="font-bold text-foreground text-sm">
              <AnimatedNumber
                value={analysisResult.distanceKm < 1 ? analysisResult.distanceKm * 1000 : analysisResult.distanceKm}
                decimals={analysisResult.distanceKm < 1 ? 0 : 1}
                suffix={analysisResult.distanceKm < 1 ? " m" : " km"}
              />
            </span>
          </div>
          <div className="bg-slate-700/30 rounded-lg px-3 py-2 text-center">
            <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground block">Min. Clearance</span>
            <span className={cn(
              "font-bold text-sm",
              actualMinClearance !== null && actualMinClearance >= (minRequiredClearance || 0) ? "text-los-success" : "text-los-failure"
            )}>
              {actualMinClearance !== null ? <AnimatedNumber value={actualMinClearance} decimals={1} suffix=" m" /> : "N/A"}
            </span>
          </div>
        </div>
      )}

      {/* Deficit Warning */}
      {analysisResult && !isClearBasedOnAnalysis && actualMinClearance !== null && !isNaN(minRequiredClearance) && !isStale && (
        <div className="text-center text-los-failure text-xs py-1 bg-los-failure/10 rounded-lg">
          Add <span className="font-bold">{deficit.toFixed(0)}m</span> to tower(s) for clearance.
        </div>
      )}

      {/* Fiber Status */}
      {isFiberCalculating && (
        <div className="text-primary flex items-center justify-center py-1.5 text-xs">
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          <span className="animate-subtle-pulse">Calculating fiber path...</span>
        </div>
      )}
      {fiberPathResult && !isFiberCalculating && (
        <div className="bg-slate-700/30 rounded-lg px-3 py-2 space-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Cable className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold">Fiber Route:</span>
            <span className={cn(
              fiberPathResult.status === 'success' ? 'text-los-success' :
              ['los_not_feasible', 'no_road_for_a', 'no_road_for_b', 'no_route_between_roads', 'radius_too_small'].includes(fiberPathResult.status) ? 'text-amber-500' :
              'text-los-failure'
            )}>
              {fiberPathResult.status === 'success' ? 'Calculated' :
               fiberPathResult.status === 'los_not_feasible' ? 'LOS Not Feasible' :
               fiberPathResult.status === 'no_road_for_a' ? 'No Road Near A' :
               fiberPathResult.status === 'no_road_for_b' ? 'No Road Near B' :
               fiberPathResult.status === 'no_route_between_roads' ? 'No Road Route' :
               fiberPathResult.status === 'radius_too_small' ? 'Snap Radius Too Small' : 'Error'}
            </span>
          </div>
          {fiberPathResult.totalDistanceMeters !== undefined && fiberPathResult.status === 'success' && (
            <p><span className="font-semibold">Total:</span> <AnimatedNumber value={fiberPathResult.totalDistanceMeters} decimals={0} suffix=" m" /></p>
          )}
          {fiberPathResult.status === 'success' && (
            <div className="text-[0.6rem] text-muted-foreground/70">
              (A offset: {fiberPathResult.offsetDistanceA_meters?.toFixed(0)}m
              + Road: {fiberPathResult.roadRouteDistanceMeters?.toFixed(0)}m
              + B offset: {fiberPathResult.offsetDistanceB_meters?.toFixed(0)}m)
            </div>
          )}
          {fiberPathError && <p className="text-destructive">{fiberPathError}</p>}
          {fiberPathResult.errorMessage && fiberPathResult.status !== 'success' && !fiberPathError && (
            <p className="text-muted-foreground italic">{fiberPathResult.errorMessage}</p>
          )}
        </div>
      )}
      {fiberPathResult && ['no_road_for_a', 'no_road_for_b', 'radius_too_small'].includes(fiberPathResult.status) && !isFiberCalculating && (
        <p className="text-xs text-amber-500 text-center">
          <AlertTriangle className="inline h-3 w-3 mr-1" />
          {fiberPathResult.status === 'radius_too_small' ? "Snap radius too small." : "No road found near a site."} Try increasing Snap Radius.
        </p>
      )}
    </div>
  );
};


// ─── PROFILE TAB ───────────────────────────────────────────────
interface ProfileTabProps {
  analysisResult: AnalysisResult | null;
  isStale?: boolean;
  isActionPending: boolean;
  pointAName: string;
  pointBName: string;
  onTowerHeightChangeFromGraph: (siteId: 'pointA' | 'pointB', newHeight: number) => void;
  isGeneratingPdf: boolean;
  isFiberCalculating: boolean;
  minRequiredClearance: number;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  analysisResult, isStale, isActionPending, pointAName, pointBName,
  onTowerHeightChangeFromGraph, isGeneratingPdf, isFiberCalculating, minRequiredClearance,
}) => {
  const chartKey = React.useMemo(() => {
    if (!analysisResult) return 'no-result';
    const p = analysisResult.profile;
    const sig = p.length > 0
      ? `${p[0].distance}-${p[0].terrainElevation}-${p[0].losHeight}-${p[p.length - 1].distance}-${p[p.length - 1].terrainElevation}-${p[p.length - 1].losHeight}`
      : 'empty';
    return `${analysisResult.distanceKm}-${analysisResult.pointA?.towerHeight}-${analysisResult.pointB?.towerHeight}-${sig}-${minRequiredClearance}`;
  }, [analysisResult, minRequiredClearance]);

  const anyPending = isActionPending || isGeneratingPdf || isFiberCalculating;

  if (!analysisResult && !isActionPending) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-3">
        <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No profile data</p>
        <p className="text-xs text-muted-foreground/70">Run an analysis to see the elevation profile</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-0.5">
      <Suspense fallback={
        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading Chart...
        </div>
      }>
        <CustomProfileChart
          key={chartKey}
          data={analysisResult?.profile || []}
          pointAName={pointAName || "Site A"}
          pointBName={pointBName || "Site B"}
          isStale={isStale}
          totalDistanceKm={analysisResult?.distanceKm}
          isActionPending={anyPending}
          onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
        />
      </Suspense>
    </div>
  );
};


// ─── SITES TAB ─────────────────────────────────────────────────
interface SitesTabProps {
  control: Control<AnalysisFormValues>;
  register: UseFormRegister<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  getCombinedError: (clientError: { message?: string } | undefined, serverError?: string[]) => string | undefined;
  pointAName: string;
  pointBName: string;
  onLocateSite?: (siteId: 'pointA' | 'pointB') => void;
}

const SitesTab: React.FC<SitesTabProps> = ({
  control, register, clientFormErrors, serverFormErrors, getCombinedError,
  pointAName, pointBName, onLocateSite,
}) => (
  <div className="h-full overflow-y-auto px-0.5 py-1 space-y-2">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <SiteInputCard
        id="pointA"
        title={pointAName || "Site A"}
        control={control}
        register={register}
        clientFormErrors={clientFormErrors}
        serverFormErrors={serverFormErrors}
        getCombinedError={getCombinedError}
        onLocate={onLocateSite ? () => onLocateSite('pointA') : undefined}
      />
      <SiteInputCard
        id="pointB"
        title={pointBName || "Site B"}
        control={control}
        register={register}
        clientFormErrors={clientFormErrors}
        serverFormErrors={serverFormErrors}
        getCombinedError={getCombinedError}
        onLocate={onLocateSite ? () => onLocateSite('pointB') : undefined}
      />
    </div>
  </div>
);


// ─── TAB BUTTON ────────────────────────────────────────────────
interface TabButtonProps {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onSelect: (id: TabId) => void;
}

const TabButton: React.FC<TabButtonProps> = ({ id, label, icon, active, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    className={cn(
      "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all duration-200",
      active
        ? "bg-primary/15 text-primary border border-primary/30 shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-slate-700/30"
    )}
    aria-selected={active}
    role="tab"
  >
    {icon}
    <span className="hidden xs:inline">{label}</span>
  </button>
);


// ─── MAIN BOTTOM SHEET ─────────────────────────────────────────
interface BottomSheetProps {
  analysisResult: AnalysisResult | null;
  isVisible: boolean;
  isStale?: boolean;
  control: Control<AnalysisFormValues>;
  register: UseFormRegister<AnalysisFormValues>;
  handleSubmit: UseFormHandleSubmit<AnalysisFormValues>;
  processSubmit: (data: AnalysisFormValues) => void;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  isActionPending: boolean;
  onTowerHeightChangeFromGraph: (siteId: 'pointA' | 'pointB', newHeight: number) => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  fiberPathResult: FiberPathResult | null;
  isFiberCalculating: boolean;
  fiberPathError: string | null;
  onLocateSite?: (siteId: 'pointA' | 'pointB') => void;
}

const BottomSheet = React.memo(function BottomSheet({
  analysisResult, isVisible, isStale,
  control, register, handleSubmit, processSubmit,
  clientFormErrors, serverFormErrors,
  isActionPending, onTowerHeightChangeFromGraph,
  onDownloadPdf, isGeneratingPdf,
  fiberPathResult, isFiberCalculating, fiberPathError,
  onLocateSite,
}: BottomSheetProps) {

  const [activeTab, setActiveTab] = useState<TabId>('results');
  const [isExpanded, setIsExpanded] = useState(false);
  const dragRef = useRef<{ startY: number; startTranslate: number } | null>(null);
  const sheetRef = useRef<HTMLFormElement>(null);

  const getCombinedError = useCallback(
    (clientFieldError?: { message?: string }, serverFieldError?: string[]) => {
      if (serverFieldError && serverFieldError.length > 0) return serverFieldError.join(', ');
      return clientFieldError?.message;
    }, []
  );

  const pointAName = useWatch({ control, name: 'pointA.name', defaultValue: "Site A" });
  const pointBName = useWatch({ control, name: 'pointB.name', defaultValue: "Site B" });
  const watchedClearance = useWatch({ control, name: 'clearanceThreshold', defaultValue: "10" });
  const minRequiredClearance = parseFloat(watchedClearance);

  // Auto-open and switch to results when analysis completes
  useEffect(() => {
    if (analysisResult && !isActionPending) {
      setIsExpanded(true);
      setActiveTab('results');
    }
  }, [analysisResult, isActionPending]);

  // ── Peek bar drag gesture ──
  const handleDragStart = useCallback((clientY: number) => {
    dragRef.current = { startY: clientY, startTranslate: 0 };
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragRef.current) return;
    const delta = dragRef.current.startY - clientY;
    // Positive delta = dragging up (expand), negative = dragging down (collapse)
    dragRef.current.startTranslate = delta;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return;
    const delta = dragRef.current.startTranslate;
    if (delta > 40) {
      setIsExpanded(true);
    } else if (delta < -40) {
      setIsExpanded(false);
    }
    dragRef.current = null;
  }, []);

  // Touch handlers for the drag handle
  const onPeekTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  }, [handleDragStart]);

  const onPeekTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  }, [handleDragMove]);

  const onPeekTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const toggleExpanded = useCallback(() => setIsExpanded(prev => !prev), []);

  // Determine peek bar content
  const isClear = analysisResult && analysisResult.minClearance !== null && !isNaN(minRequiredClearance)
    ? analysisResult.minClearance >= minRequiredClearance
    : false;

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'results', label: 'Results', icon: <Info className="h-3.5 w-3.5" /> },
    { id: 'profile', label: 'Profile', icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { id: 'sites', label: 'Sites', icon: <MapPin className="h-3.5 w-3.5" /> },
  ];

  return (
    <form
      ref={sheetRef}
      noValidate
      role="region"
      aria-label="Analysis results panel"
      onSubmit={handleSubmit(processSubmit)}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[50] print:hidden",
        "bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 rounded-t-2xl",
        "shadow-[0_-4px_30px_rgba(0,0,0,0.4)]",
        "transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0" : "translate-y-[200%]"
      )}
    >
      {/* ── Drag handle + Peek bar ── */}
      <div
        className="cursor-grab active:cursor-grabbing select-none"
        onClick={toggleExpanded}
        onTouchStart={onPeekTouchStart}
        onTouchMove={onPeekTouchMove}
        onTouchEnd={onPeekTouchEnd}
        role="button"
        aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
        tabIndex={0}
      >
        {/* Drag pill */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Peek summary */}
        <div className="flex items-center justify-between px-4 pb-2 gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isActionPending ? (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
              </span>
            ) : analysisResult && !isStale ? (
              <>
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[0.65rem] font-bold whitespace-nowrap",
                  isClear ? "bg-los-success text-los-success-foreground" : "bg-los-failure text-los-failure-foreground"
                )}>
                  {isClear ? "LOS ✓" : "LOS ✗"}
                </span>
                <span className="text-xs text-foreground/90 font-medium truncate">
                  {analysisResult.distanceKm < 1
                    ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m`
                    : `${analysisResult.distanceKm.toFixed(1)}km`
                  }
                </span>
                {analysisResult.minClearance !== null && (
                  <span className={cn(
                    "text-xs font-medium",
                    isClear ? "text-los-success" : "text-los-failure"
                  )}>
                    {analysisResult.minClearance.toFixed(1)}m clr
                  </span>
                )}
              </>
            ) : isStale ? (
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Needs re-analysis
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">Tap to view analysis panel</span>
            )}
          </div>
          <ChevronUp className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300",
            isExpanded ? "rotate-180" : "rotate-0"
          )} />
        </div>
      </div>

      {/* ── Expanded content ── */}
      <div className={cn(
        "overflow-hidden transition-[height] duration-300 ease-out",
        isExpanded ? "h-[42vh] sm:h-[38vh] md:h-[35vh]" : "h-0"
      )}>
        <div className="h-full flex flex-col px-3 pb-3">
          {/* Tab bar */}
          <div className="flex gap-1.5 mb-2" role="tablist">
            {TABS.map(tab => (
              <TabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                active={activeTab === tab.id}
                onSelect={setActiveTab}
              />
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0" role="tabpanel">
            {activeTab === 'results' && (
              <ResultsTab
                analysisResult={analysisResult}
                isStale={isStale}
                isActionPending={isActionPending}
                handleSubmit={handleSubmit}
                processSubmit={processSubmit}
                onDownloadPdf={onDownloadPdf}
                isGeneratingPdf={isGeneratingPdf}
                isFiberCalculating={isFiberCalculating}
                fiberPathResult={fiberPathResult}
                fiberPathError={fiberPathError}
                minRequiredClearance={minRequiredClearance}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab
                analysisResult={analysisResult}
                isStale={isStale}
                isActionPending={isActionPending}
                pointAName={pointAName || "Site A"}
                pointBName={pointBName || "Site B"}
                onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
                isGeneratingPdf={isGeneratingPdf}
                isFiberCalculating={isFiberCalculating}
                minRequiredClearance={minRequiredClearance}
              />
            )}
            {activeTab === 'sites' && (
              <SitesTab
                control={control}
                register={register}
                clientFormErrors={clientFormErrors}
                serverFormErrors={serverFormErrors}
                getCombinedError={getCombinedError}
                pointAName={pointAName || "Site A"}
                pointBName={pointBName || "Site B"}
                onLocateSite={onLocateSite}
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
});

export default BottomSheet;
