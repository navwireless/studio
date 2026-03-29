'use client';

import { useEffect, useCallback } from 'react';
import type { PlacementMode } from '@/types';

/**
 * Keyboard shortcut definitions:
 * - A: Toggle placement mode for Point A
 * - B: Toggle placement mode for Point B
 * - Escape: Cancel current placement mode
 * - Enter: Run analysis (when not pending)
 * - S: Save current link (when analysis result exists)
 * - P: Toggle side panel
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
    /** Current placement mode */
    placementMode: PlacementMode;
    /** Whether an analysis action is currently pending */
    isActionPending: boolean;
    /** Whether there is an analysis result available */
    hasAnalysisResult: boolean;
}

/**
 * Registers global keyboard shortcuts for map interaction and analysis controls.
 *
 * Shortcuts are automatically disabled when the user is typing in an input,
 * textarea, select, or contentEditable element (except Escape, which always works).
 * Modifier key combinations (Ctrl, Meta, Alt) are ignored to avoid conflicts.
 *
 * @param config - Shortcut handlers and current state
 *
 * @example
 * useKeyboardShortcuts({
 *   onSetPlacementMode: setPlacementMode,
 *   onAnalyze: handleAnalyze,
 *   onToggleSidePanel: togglePanel,
 *   onSaveLink: handleSave,
 *   placementMode,
 *   isActionPending,
 *   hasAnalysisResult: !!analysisResult,
 * });
 */
export function useKeyboardShortcuts({
    onSetPlacementMode,
    onAnalyze,
    onToggleSidePanel,
    onSaveLink,
    placementMode,
    isActionPending,
    hasAnalysisResult,
}: UseKeyboardShortcutsConfig): void {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Don't trigger when typing in inputs
            const target = e.target as HTMLElement;
            const tag = target.tagName.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable) {
                // Only allow Escape to work in inputs
                if (e.key !== 'Escape') return;
            }

            // Don't trigger with modifier combos we don't own
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            switch (e.key.toLowerCase()) {
                case 'a':
                    e.preventDefault();
                    onSetPlacementMode(placementMode === 'A' ? null : 'A');
                    break;

                case 'b':
                    e.preventDefault();
                    onSetPlacementMode(placementMode === 'B' ? null : 'B');
                    break;

                case 'escape':
                    e.preventDefault();
                    if (placementMode) {
                        onSetPlacementMode(null);
                    }
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
            }
        },
        [placementMode, isActionPending, hasAnalysisResult, onSetPlacementMode, onAnalyze, onToggleSidePanel, onSaveLink]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}