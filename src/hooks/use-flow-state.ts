'use client';

import { useMemo } from 'react';

/**
 * Flow steps representing the user's position in the analysis workflow.
 */
export type FlowStep =
  | 'PLACE_SITES'
  | 'CONFIGURE'
  | 'READY_TO_ANALYZE'
  | 'ANALYZING'
  | 'VIEWING_RESULTS'
  | 'STALE_RESULTS';

/**
 * Complete flow state derived from analysis inputs and results.
 */
export interface FlowState {
  /** Current primary workflow step */
  currentStep: FlowStep;
  /** Whether Site A has valid coordinates */
  siteAPlaced: boolean;
  /** Whether Site B has valid coordinates */
  siteBPlaced: boolean;
  /** Whether both sites have valid coordinates */
  bothSitesPlaced: boolean;
  /** Whether an analysis result exists */
  hasResults: boolean;
  /** Whether results are stale (inputs changed since last analysis) */
  isStale: boolean;
  /** Whether analysis is currently in progress */
  isAnalyzing: boolean;
  /** Whether the user can click Analyze (both sites placed and not currently analyzing) */
  canAnalyze: boolean;
  /** Whether the user can download a report (has non-stale results) */
  canDownload: boolean;
  /** Whether the user can share results (has non-stale results) */
  canShare: boolean;
  /** Whether the user can save the current link */
  canSave: boolean;
}

/**
 * Site coordinate input for flow state computation.
 */
export interface FlowSiteInput {
  lat: string;
  lng: string;
}

/**
 * Validates that a coordinate string is a finite number.
 */
function isValidCoord(val: string | undefined | null): boolean {
  if (!val || val === '') return false;
  const num = parseFloat(val);
  return !isNaN(num) && isFinite(num);
}

/**
 * Determines whether a site has valid lat/lng coordinates.
 */
function isSitePlaced(site: FlowSiteInput | null | undefined): boolean {
  if (!site) return false;
  return isValidCoord(site.lat) && isValidCoord(site.lng);
}

/**
 * Hook that computes the user's current position in the analysis workflow.
 *
 * Used by:
 * - Side panel: progressive disclosure of sections
 * - Map hint overlay: contextual guidance messages
 * - Analyze button: state-dependent appearance
 * - Download menu: enabled/disabled states
 *
 * @param siteA - Site A coordinates (lat/lng strings from form)
 * @param siteB - Site B coordinates (lat/lng strings from form)
 * @param hasAnalysisResult - Whether an AnalysisResult exists
 * @param isAnalyzing - Whether a server action is in progress
 * @param isStale - Whether form values differ from last analysis
 * @returns Computed FlowState
 *
 * @example
 * const flow = useFlowState(
 *   { lat: watch('pointA.lat'), lng: watch('pointA.lng') },
 *   { lat: watch('pointB.lat'), lng: watch('pointB.lng') },
 *   !!analysis.analysisResult,
 *   analysis.isActionPending,
 *   analysis.isStale,
 * );
 */
export function useFlowState(
  siteA: FlowSiteInput | null | undefined,
  siteB: FlowSiteInput | null | undefined,
  hasAnalysisResult: boolean,
  isAnalyzing: boolean,
  isStale: boolean,
): FlowState {
  return useMemo(() => {
    const siteAPlaced = isSitePlaced(siteA);
    const siteBPlaced = isSitePlaced(siteB);
    const bothSitesPlaced = siteAPlaced && siteBPlaced;
    const hasResults = hasAnalysisResult;

    // Determine current step
    let currentStep: FlowStep;

    if (isAnalyzing) {
      currentStep = 'ANALYZING';
    } else if (hasResults && isStale) {
      currentStep = 'STALE_RESULTS';
    } else if (hasResults && !isStale) {
      currentStep = 'VIEWING_RESULTS';
    } else if (bothSitesPlaced) {
      // Both sites placed but no results yet (or results were cleared)
      currentStep = 'READY_TO_ANALYZE';
    } else {
      currentStep = 'PLACE_SITES';
    }

    const canAnalyze = bothSitesPlaced && !isAnalyzing;
    const canDownload = hasResults && !isStale;
    const canShare = hasResults && !isStale;
    const canSave = hasResults && !isStale;

    return {
      currentStep,
      siteAPlaced,
      siteBPlaced,
      bothSitesPlaced,
      hasResults,
      isStale,
      isAnalyzing,
      canAnalyze,
      canDownload,
      canShare,
      canSave,
    };
  }, [siteA, siteB, hasAnalysisResult, isAnalyzing, isStale]);
}