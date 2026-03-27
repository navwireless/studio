'use client';

import { useEffect, useCallback } from 'react';
import type { PlacementMode } from '@/types';

interface UseKeyboardShortcutsConfig {
    onSetPlacementMode: (mode: PlacementMode) => void;
    onAnalyze: () => void;
    onToggleSidePanel: () => void;
    onSaveLink: () => void;
    placementMode: PlacementMode;
    isActionPending: boolean;
    hasAnalysisResult: boolean;
}

export function useKeyboardShortcuts({
    onSetPlacementMode,
    onAnalyze,
    onToggleSidePanel,
    onSaveLink,
    placementMode,
    isActionPending,
    hasAnalysisResult,
}: UseKeyboardShortcutsConfig) {

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
    }, [placementMode, isActionPending, hasAnalysisResult, onSetPlacementMode, onAnalyze, onToggleSidePanel, onSaveLink]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}