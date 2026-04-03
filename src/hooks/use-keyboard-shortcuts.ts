'use client';

import { useEffect, useCallback } from 'react';
import type { PlacementMode } from '@/types';
import type { MapToolId } from '@/types/map-tools';

/**
 * Keyboard shortcut definitions:
 * - A: Toggle placement mode for Point A
 * - B: Toggle placement mode for Point B
 * - Escape: Cancel tool / Cancel placement mode
 * - Enter: Run analysis (when not pending)
 * - Ctrl+Enter / Cmd+Enter: Run analysis (works even in inputs)
 * - S: Save current link (when analysis result exists)
 * - P: Toggle side panel
 * - D: Open download menu (when analysis result exists)
 *
 * Phase 11 — Map tool shortcuts:
 * - M: Measure Distance
 * - N: Drop Pin
 * - E: Point Elevation
 * - R: Range Circle
 * - T: Terrain Profile
 * - G: Grid Overlay
 */

interface UseKeyboardShortcutsConfig {
  /** Callback to change placement mode */
  onSetPlacementMode: (mode: PlacementMode) => void;
  /** Callback to trigger analysis */
  onAnalyze: () => void;
  /** Callback to toggle side panel visibility */
  onToggleSidePanel: () => void;
  /** Callback to save the current link */
  onSaveLink: () => void;
  /** Optional callback to trigger download menu */
  onOpenDownload?: () => void;
  /** Current placement mode */
  placementMode: PlacementMode;
  /** Whether an analysis action is currently pending */
  isActionPending: boolean;
  /** Whether there is an analysis result available */
  hasAnalysisResult: boolean;

  // ── Phase 11: Map tool shortcuts ──
  /** Callback to toggle a map tool */
  onToggleMapTool?: (toolId: MapToolId) => void;
  /** Callback to deactivate the current map tool */
  onDeactivateMapTool?: () => void;
  /** Whether a map tool is currently active */
  isMapToolActive?: boolean;
}

/**
 * Registers global keyboard shortcuts for map interaction, analysis controls,
 * and map tools (Phase 11).
 *
 * Shortcuts are automatically disabled when the user is typing in an input,
 * textarea, select, or contentEditable element (except Escape and Ctrl+Enter).
 * Single-key shortcuts ignore modifier combos (Ctrl, Meta, Alt) to avoid conflicts.
 *
 * @param config - Shortcut handlers and current state
 */
export function useKeyboardShortcuts({
  onSetPlacementMode,
  onAnalyze,
  onToggleSidePanel,
  onSaveLink,
  onOpenDownload,
  placementMode,
  isActionPending,
  hasAnalysisResult,
  onToggleMapTool,
  onDeactivateMapTool,
  isMapToolActive,
}: UseKeyboardShortcutsConfig): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const isInInput =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target.isContentEditable;

      // Ctrl+Enter / Cmd+Enter — works even in inputs
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        if (!isActionPending) {
          e.preventDefault();
          onAnalyze();
        }
        return;
      }

      // Escape — always works (even in inputs)
      if (e.key === 'Escape') {
        e.preventDefault();
        // Phase 11: Deactivate tool first, then placement mode
        if (isMapToolActive && onDeactivateMapTool) {
          onDeactivateMapTool();
        } else if (placementMode) {
          onSetPlacementMode(null);
        }
        return;
      }

      // Don't trigger single-key shortcuts when typing in inputs
      if (isInInput) return;

      // Don't trigger with modifier combos we don't own
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'a':
          e.preventDefault();
          // Phase 11: Deactivate tool when switching to placement
          if (isMapToolActive && onDeactivateMapTool) onDeactivateMapTool();
          onSetPlacementMode(placementMode === 'A' ? null : 'A');
          break;

        case 'b':
          e.preventDefault();
          // Phase 11: Deactivate tool when switching to placement
          if (isMapToolActive && onDeactivateMapTool) onDeactivateMapTool();
          onSetPlacementMode(placementMode === 'B' ? null : 'B');
          break;

        case 'enter':
          if (!isActionPending && !e.shiftKey) {
            e.preventDefault();
            onAnalyze();
          }
          break;

        case 's':
          if (hasAnalysisResult && !isActionPending) {
            e.preventDefault();
            onSaveLink();
          }
          break;

        case 'p':
          e.preventDefault();
          onToggleSidePanel();
          break;

        case 'd':
          if (hasAnalysisResult && !isActionPending && onOpenDownload) {
            e.preventDefault();
            onOpenDownload();
          }
          break;

        // ── Phase 11: Map tool shortcuts ──
        case 'm':
          if (onToggleMapTool) {
            e.preventDefault();
            onToggleMapTool('measure-distance');
          }
          break;

        case 'n':
          if (onToggleMapTool) {
            e.preventDefault();
            onToggleMapTool('drop-pin');
          }
          break;

        case 'e':
          if (onToggleMapTool) {
            e.preventDefault();
            onToggleMapTool('point-elevation');
          }
          break;

        case 'r':
          if (onToggleMapTool) {
            e.preventDefault();
            onToggleMapTool('range-circle');
          }
          break;

        case 't':
          if (onToggleMapTool) {
            e.preventDefault();
            onToggleMapTool('terrain-profile');
          }
          break;

        case 'g':
          if (onToggleMapTool) {
            e.preventDefault();
            onToggleMapTool('grid-overlay');
          }
          break;
      }
    },
    [
      placementMode,
      isActionPending,
      hasAnalysisResult,
      isMapToolActive,
      onSetPlacementMode,
      onAnalyze,
      onToggleSidePanel,
      onSaveLink,
      onOpenDownload,
      onToggleMapTool,
      onDeactivateMapTool,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}