// src/hooks/use-onboarding.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    getOnboardingState,
    updateOnboardingState,
    type OnboardingState,
} from '@/lib/onboarding-storage';
import { getRecentWhatsNew, type WhatsNewItem } from '@/content/whats-new';

export interface UseOnboardingReturn {
    // Tour
    shouldShowTour: boolean;
    isTourActive: boolean;
    currentTourStep: number;
    startTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: (dontShowAgain: boolean) => void;
    completeTour: () => void;
    restartTour: () => void;

    // Hints
    isHintDismissed: (hintId: string) => boolean;
    getHintShowCount: (hintId: string) => number;
    dismissHint: (hintId: string) => void;

    // Help panel
    isHelpPanelSeen: (pageId: string) => boolean;
    markHelpPanelSeen: (pageId: string) => void;

    // What's New
    unseenWhatsNew: WhatsNewItem[];
    markWhatsNewSeen: (itemIds: string[]) => void;
    hasUnseenWhatsNew: boolean;

    // Analytics helpers
    incrementAnalysisCount: () => void;
    markFeatureUsed: (featureId: string) => void;
    isFeatureUsed: (featureId: string) => boolean;
    analysisCount: number;

    // State
    onboardingState: OnboardingState;
    isLoading: boolean;
}

export function useOnboarding(userId?: string): UseOnboardingReturn {
    const [state, setState] = useState<OnboardingState>(() =>
        getOnboardingState(userId)
    );
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentTourStep, setCurrentTourStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load state on mount and when userId changes
    useEffect(() => {
        const loaded = getOnboardingState(userId);
        setState(loaded);
        setIsLoading(false);
    }, [userId]);

    // Persist helper — writes to localStorage and updates local state
    const persist = useCallback(
        (partial: Partial<OnboardingState>) => {
            updateOnboardingState(partial, userId);
            setState((prev) => {
                const next = { ...prev };
                // Handle simple overrides
                if (partial.tourComplete !== undefined)
                    next.tourComplete = partial.tourComplete;
                if (partial.tourSkippedAt !== undefined)
                    next.tourSkippedAt = partial.tourSkippedAt;
                if (partial.tourCompletedAt !== undefined)
                    next.tourCompletedAt = partial.tourCompletedAt;
                if (partial.totalAnalyses !== undefined)
                    next.totalAnalyses = partial.totalAnalyses;

                // Handle nested merges
                if (partial.hintsShown)
                    next.hintsShown = { ...prev.hintsShown, ...partial.hintsShown };
                if (partial.helpPanelSeen)
                    next.helpPanelSeen = {
                        ...prev.helpPanelSeen,
                        ...partial.helpPanelSeen,
                    };
                if (partial.whatsNewSeen)
                    next.whatsNewSeen = [
                        ...new Set([...prev.whatsNewSeen, ...partial.whatsNewSeen]),
                    ];
                if (partial.featuresUsed)
                    next.featuresUsed = {
                        ...prev.featuresUsed,
                        ...partial.featuresUsed,
                    };

                return next;
            });
        },
        [userId]
    );

    // ─── Tour ────────────────────────────────────────────
    const shouldShowTour = !state.tourComplete && !isTourActive;

    const startTour = useCallback(() => {
        setCurrentTourStep(0);
        setIsTourActive(true);
    }, []);

    const nextStep = useCallback(() => {
        setCurrentTourStep((prev) => prev + 1);
    }, []);

    const prevStep = useCallback(() => {
        setCurrentTourStep((prev) => Math.max(0, prev - 1));
    }, []);

    const skipTour = useCallback(
        (dontShowAgain: boolean) => {
            setIsTourActive(false);
            setCurrentTourStep(0);
            // Always mark tour as complete when skipping — the checkbox
            // is just UX sugar, skip should always dismiss permanently
            persist({
                tourComplete: true,
                tourSkippedAt: new Date().toISOString(),
            });
            // Suppress lint about unused param — kept for API compat
            void dontShowAgain;
        },
        [persist]
    );

    const completeTour = useCallback(() => {
        setIsTourActive(false);
        setCurrentTourStep(0);
        persist({
            tourComplete: true,
            tourCompletedAt: new Date().toISOString(),
        });
    }, [persist]);

    const restartTour = useCallback(() => {
        setCurrentTourStep(0);
        setIsTourActive(true);
    }, []);

    // ─── Hints ───────────────────────────────────────────
    const isHintDismissed = useCallback(
        (hintId: string): boolean => {
            return (state.hintsShown[hintId] ?? 0) > 0;
        },
        [state.hintsShown]
    );

    const getHintShowCount = useCallback(
        (hintId: string): number => {
            return state.hintsShown[hintId] ?? 0;
        },
        [state.hintsShown]
    );

    const dismissHint = useCallback(
        (hintId: string) => {
            const currentCount = state.hintsShown[hintId] ?? 0;
            persist({ hintsShown: { [hintId]: currentCount + 1 } });
        },
        [persist, state.hintsShown]
    );

    // ─── Help Panel ──────────────────────────────────────
    const isHelpPanelSeen = useCallback(
        (pageId: string): boolean => {
            return state.helpPanelSeen[pageId] ?? false;
        },
        [state.helpPanelSeen]
    );

    const markHelpPanelSeen = useCallback(
        (pageId: string) => {
            persist({ helpPanelSeen: { [pageId]: true } });
        },
        [persist]
    );

    // ─── What's New ──────────────────────────────────────
    const unseenWhatsNew = getRecentWhatsNew().filter(
        (item) => !state.whatsNewSeen.includes(item.id)
    );

    const hasUnseenWhatsNew = unseenWhatsNew.length > 0;

    const markWhatsNewSeen = useCallback(
        (itemIds: string[]) => {
            persist({ whatsNewSeen: itemIds });
        },
        [persist]
    );

    // ─── Analytics ───────────────────────────────────────
    const incrementAnalysisCount = useCallback(() => {
        persist({ totalAnalyses: state.totalAnalyses + 1 });
    }, [persist, state.totalAnalyses]);

    const markFeatureUsed = useCallback(
        (featureId: string) => {
            persist({ featuresUsed: { [featureId]: true } });
        },
        [persist]
    );

    const isFeatureUsed = useCallback(
        (featureId: string): boolean => {
            return state.featuresUsed[featureId] ?? false;
        },
        [state.featuresUsed]
    );

    return {
        shouldShowTour,
        isTourActive,
        currentTourStep,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        restartTour,

        isHintDismissed,
        getHintShowCount,
        dismissHint,

        isHelpPanelSeen,
        markHelpPanelSeen,

        unseenWhatsNew,
        markWhatsNewSeen,
        hasUnseenWhatsNew,

        incrementAnalysisCount,
        markFeatureUsed,
        isFeatureUsed,
        analysisCount: state.totalAnalyses,

        onboardingState: state,
        isLoading,
    };
}