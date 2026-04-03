// src/components/onboarding/guided-tour.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TourOverlay } from './tour-overlay';
import { TourStepTooltip } from './tour-step';
import { ANALYSIS_PAGE_TOUR } from '@/content/tour-steps';

interface GuidedTourProps {
    /** Whether the tour should be active/visible */
    isActive: boolean;
    /** Current step index */
    currentStep: number;
    /** Called to advance to next step */
    onNext: () => void;
    /** Called to go back one step */
    onPrev: () => void;
    /** Called when user skips the tour */
    onSkip: (dontShowAgain: boolean) => void;
    /** Called when user completes the tour */
    onComplete: () => void;
}

export function GuidedTour({
    isActive,
    currentStep,
    onNext,
    onPrev,
    onSkip,
    onComplete,
}: GuidedTourProps) {
    const [resolvedStep, setResolvedStep] = useState(currentStep);
    const steps = ANALYSIS_PAGE_TOUR;

    // Resolve step — skip steps whose target elements don't exist in the DOM
    const resolveStep = useCallback(
        (stepIdx: number, direction: 'forward' | 'backward'): number => {
            let idx = stepIdx;
            const maxIterations = steps.length;
            let iterations = 0;

            while (iterations < maxIterations) {
                if (idx < 0) return 0;
                if (idx >= steps.length) return steps.length - 1;

                const step = steps[idx];

                // Center steps always exist
                if (step.target === 'center') return idx;

                // Check if target element exists in DOM
                try {
                    const el = document.querySelector(step.target);
                    if (el) return idx;
                } catch {
                    // Invalid selector — skip
                }

                // Target doesn't exist — skip in the current direction
                idx = direction === 'forward' ? idx + 1 : idx - 1;
                iterations++;
            }

            // Fallback — find the last center step
            const lastCenter = steps.findLastIndex((s) => s.target === 'center');
            return lastCenter >= 0 ? lastCenter : 0;
        },
        [steps]
    );

    // When currentStep prop changes, resolve it
    useEffect(() => {
        if (!isActive) return;
        const resolved = resolveStep(currentStep, 'forward');
        setResolvedStep(resolved);
    }, [currentStep, isActive, resolveStep]);

    // Handle Next with step resolution
    const handleNext = useCallback(() => {
        const nextIdx = resolvedStep + 1;
        if (nextIdx >= steps.length) {
            onComplete();
            return;
        }
        const resolved = resolveStep(nextIdx, 'forward');
        if (resolved >= steps.length) {
            onComplete();
            return;
        }
        onNext();
    }, [resolvedStep, steps.length, resolveStep, onNext, onComplete]);

    // Handle Prev with step resolution
    const handlePrev = useCallback(() => {
        const prevIdx = resolvedStep - 1;
        if (prevIdx < 0) return;
        const resolved = resolveStep(prevIdx, 'backward');
        onPrev();
        setResolvedStep(resolved);
    }, [resolvedStep, resolveStep, onPrev]);

    if (!isActive || resolvedStep < 0 || resolvedStep >= steps.length) {
        return null;
    }

    const step = steps[resolvedStep];
    const isFirst = resolvedStep === 0;
    const isLast = resolvedStep === steps.length - 1;
    const isWelcome = step.id === 'welcome';

    return (
        <>
            <TourOverlay
                target={step.target}
                padding={step.spotlightPadding ?? 8}
                highlight={step.highlight !== false}
            />
            <TourStepTooltip
                step={step}
                stepIndex={resolvedStep}
                totalSteps={steps.length}
                onNext={handleNext}
                onPrev={handlePrev}
                onSkip={onSkip}
                onComplete={onComplete}
                isFirst={isFirst}
                isLast={isLast}
                isWelcome={isWelcome}
            />
        </>
    );
}