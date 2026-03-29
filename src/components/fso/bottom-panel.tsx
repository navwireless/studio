"use client";

import type { Control, UseFormRegister, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { AnalysisResult, AnalysisFormValues } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import { AnimatedNumber } from '@/components/animated-number';
import { ChevronUp, Loader2, AlertTriangle, Cable } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { Suspense, useRef, useEffect, useCallback } from 'react';

const CustomProfileChart = React.lazy(() => import('./custom-profile-chart'));

const EXPANDED_HEIGHT_MOBILE = 200;
const EXPANDED_HEIGHT_DESKTOP = 220;

interface BottomPanelProps {
  analysisResult: AnalysisResult | null;
  isPanelGloballyVisible: boolean;
  isContentExpanded: boolean;
  onToggleContentExpansion: () => void;
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
  /** Selected device ID for chart range indicator (Phase 6C) */
  selectedDeviceId?: string | null;
}

const BottomPanel = React.memo(function BottomPanel({
  analysisResult, isPanelGloballyVisible, isContentExpanded, onToggleContentExpansion,
  isStale, control, isActionPending,
  onTowerHeightChangeFromGraph,
  fiberPathResult, isFiberCalculating, isGeneratingPdf,
  selectedDeviceId,
}: BottomPanelProps) {

  const pointAName = useWatch({ control, name: 'pointA.name', defaultValue: "Site A" });
  const pointBName = useWatch({ control, name: 'pointB.name', defaultValue: "Site B" });
  const watchedClearance = useWatch({ control, name: 'clearanceThreshold', defaultValue: "10" });
  const minRequiredClearance = parseFloat(watchedClearance);

  const actualMinClearance = analysisResult?.minClearance ?? null;
  const isClear = analysisResult && actualMinClearance !== null ? actualMinClearance >= minRequiredClearance : false;

  const chartKey = React.useMemo(() => {
    if (!analysisResult) return 'no-result';
    const p = analysisResult.profile;
    const sig = p.length > 0
      ? `${p[0].distance}-${p[0].terrainElevation}-${p[0].losHeight}-${p[p.length - 1].distance}-${p[p.length - 1].terrainElevation}-${p[p.length - 1].losHeight}`
      : 'empty';
    return `${analysisResult.distanceKm}-${analysisResult.pointA?.towerHeight}-${analysisResult.pointB?.towerHeight}-${sig}-${minRequiredClearance}-${selectedDeviceId ?? 'none'}`;
  }, [analysisResult, minRequiredClearance, selectedDeviceId]);

  const anyPending = isActionPending || isGeneratingPdf || isFiberCalculating;

  // ── Drag gesture state (ref-based to avoid re-render issues inside React.memo) ──
  const peekBarRef = useRef<HTMLButtonElement>(null);
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startY: number;
    startExpanded: boolean;
    dragging: boolean;
    lastY: number;
    lastTime: number;
    velocity: number;
  } | null>(null);
  const dragHeightRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const [, forceRender] = React.useState(0);

  const getExpandedHeight = useCallback(() => {
    if (typeof window === 'undefined') return EXPANDED_HEIGHT_DESKTOP;
    return window.innerWidth < 768 ? EXPANDED_HEIGHT_MOBILE : EXPANDED_HEIGHT_DESKTOP;
  }, []);

  // Attach drag listeners to peek bar
  useEffect(() => {
    const bar = peekBarRef.current;
    if (!bar) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      dragState.current = {
        startY: t.clientY,
        startExpanded: isContentExpanded,
        dragging: true,
        lastY: t.clientY,
        lastTime: Date.now(),
        velocity: 0,
      };
      isDraggingRef.current = true;
      forceRender(c => c + 1);
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = dragState.current;
      if (!s || !s.dragging || e.touches.length !== 1) return;
      const t = e.touches[0];
      const now = Date.now();
      const dt = now - s.lastTime;

      if (dt > 0) {
        s.velocity = (t.clientY - s.lastY) / dt;
      }
      s.lastY = t.clientY;
      s.lastTime = now;

      const dy = t.clientY - s.startY;
      const expandedH = getExpandedHeight();

      if (s.startExpanded) {
        const h = Math.max(0, expandedH - dy);
        dragHeightRef.current = Math.max(0, Math.min(expandedH, h));
      } else {
        const h = Math.max(0, -dy);
        dragHeightRef.current = Math.min(expandedH, h);
      }

      forceRender(c => c + 1);
      e.preventDefault();
    };

    const onTouchEnd = () => {
      const s = dragState.current;
      if (!s) return;

      const expandedH = getExpandedHeight();
      const currentH = dragHeightRef.current ?? (isContentExpanded ? expandedH : 0);

      const VELOCITY_THRESHOLD = 0.4;

      let shouldExpand: boolean;
      if (Math.abs(s.velocity) > VELOCITY_THRESHOLD) {
        shouldExpand = s.velocity < 0;
      } else {
        shouldExpand = currentH > expandedH / 2;
      }

      if (navigator.vibrate) navigator.vibrate(15);

      dragHeightRef.current = null;
      isDraggingRef.current = false;
      dragState.current = null;
      forceRender(c => c + 1);

      if (shouldExpand !== isContentExpanded) {
        onToggleContentExpansion();
      }
    };

    bar.addEventListener('touchstart', onTouchStart, { passive: true });
    bar.addEventListener('touchmove', onTouchMove, { passive: false });
    bar.addEventListener('touchend', onTouchEnd, { passive: true });
    bar.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      bar.removeEventListener('touchstart', onTouchStart);
      bar.removeEventListener('touchmove', onTouchMove);
      bar.removeEventListener('touchend', onTouchEnd);
      bar.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isContentExpanded, onToggleContentExpansion, getExpandedHeight]);

  if (!isPanelGloballyVisible) return null;

  const expandedH = typeof window !== 'undefined'
    ? (window.innerWidth < 768 ? EXPANDED_HEIGHT_MOBILE : EXPANDED_HEIGHT_DESKTOP)
    : EXPANDED_HEIGHT_DESKTOP;

  const isCurrentlyDragging = isDraggingRef.current && dragHeightRef.current !== null;
  const chartHeight = isCurrentlyDragging
    ? dragHeightRef.current!
    : (isContentExpanded ? expandedH : 0);

  return (
    <div className="border-t border-slate-700/40 bg-slate-900/95 backdrop-blur-lg flex flex-col pb-safe">

      {/* Peek bar — always visible, acts as drag handle on mobile */}
      <button
        ref={peekBarRef}
        type="button"
        onClick={onToggleContentExpansion}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors relative touch-manipulation"
      >
        {/* Drag handle */}
        <div className={cn(
          "drag-handle absolute left-1/2 -translate-x-1/2 top-1.5",
          isCurrentlyDragging && "active"
        )} />

        <div className="flex items-center gap-3 flex-1 min-w-0 pt-2">
          {isActionPending ? (
            <span className="flex items-center gap-1.5 text-xs text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing...
            </span>
          ) : analysisResult && !isStale ? (
            <>
              <span className={cn("px-2 py-0.5 rounded text-[0.65rem] font-bold whitespace-nowrap flex-shrink-0",
                isClear ? "bg-los-success text-los-success-foreground" : "bg-los-failure text-los-failure-foreground"
              )}>
                {isClear ? "LOS FEASIBLE" : "LOS BLOCKED"}
              </span>

              <div className="flex items-center gap-3 text-xs overflow-x-auto flex-1 min-w-0 custom-scrollbar">
                <div className="flex flex-col flex-shrink-0">
                  <span className="text-[0.5rem] text-muted-foreground uppercase">Distance</span>
                  <span className="font-bold text-foreground text-[0.7rem] leading-tight">
                    <AnimatedNumber value={analysisResult.distanceKm < 1 ? analysisResult.distanceKm * 1000 : analysisResult.distanceKm}
                      decimals={analysisResult.distanceKm < 1 ? 0 : 1} suffix={analysisResult.distanceKm < 1 ? "m" : "km"} />
                  </span>
                </div>
                <div className="flex flex-col flex-shrink-0">
                  <span className="text-[0.5rem] text-muted-foreground uppercase">Clearance</span>
                  <span className={cn("font-bold text-[0.7rem] leading-tight", isClear ? "text-los-success" : "text-los-failure")}>
                    {actualMinClearance !== null ? <AnimatedNumber value={actualMinClearance} decimals={1} suffix="m" /> : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col flex-shrink-0">
                  <span className="text-[0.5rem] text-muted-foreground uppercase">Tower A</span>
                  <span className="font-bold text-[0.7rem] leading-tight text-foreground">{analysisResult.pointA?.towerHeight}m</span>
                </div>
                <div className="flex flex-col flex-shrink-0">
                  <span className="text-[0.5rem] text-muted-foreground uppercase">Tower B</span>
                  <span className="font-bold text-[0.7rem] leading-tight text-foreground">{analysisResult.pointB?.towerHeight}m</span>
                </div>
                {fiberPathResult?.status === 'success' && fiberPathResult.totalDistanceMeters !== undefined && (
                  <div className="flex flex-col flex-shrink-0">
                    <span className="text-[0.5rem] text-muted-foreground uppercase flex items-center gap-0.5">
                      <Cable className="h-2.5 w-2.5" /> Fiber
                    </span>
                    <span className="font-bold text-[0.7rem] leading-tight text-blue-400">
                      <AnimatedNumber value={fiberPathResult.totalDistanceMeters} decimals={0} suffix="m" />
                    </span>
                  </div>
                )}
                {isFiberCalculating && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-[0.6rem] text-primary">Fiber...</span>
                  </div>
                )}
              </div>
            </>
          ) : isStale ? (
            <span className="text-xs text-yellow-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Parameters changed &mdash; re-analyze
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Analysis results will appear here</span>
          )}
        </div>

        <ChevronUp className={cn("h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-300",
          isContentExpanded ? "rotate-180" : "rotate-0"
        )} />
      </button>

      {/* Expandable chart area — height controlled by drag or toggle */}
      <div
        ref={chartAreaRef}
        className={cn(
          "overflow-hidden",
          !isCurrentlyDragging && "transition-[height] duration-300 ease-out"
        )}
        style={{ height: chartHeight }}
      >
        <div className="h-full px-2 py-1">
          {analysisResult ? (
            <Suspense fallback={
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading Chart...
              </div>
            }>
              <CustomProfileChart
                key={chartKey}
                data={analysisResult.profile || []}
                pointAName={pointAName || "Site A"}
                pointBName={pointBName || "Site B"}
                isStale={isStale}
                totalDistanceKm={analysisResult.distanceKm}
                isActionPending={anyPending}
                onTowerHeightChangeFromGraph={onTowerHeightChangeFromGraph}
                selectedDeviceId={selectedDeviceId}
              />
            </Suspense>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              {isActionPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</>
              ) : (
                'Run analysis to see elevation profile'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default BottomPanel;