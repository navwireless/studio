"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { FlowStep } from '@/hooks/use-flow-state';

export interface StepIndicatorProps {
    /** Current workflow step from useFlowState */
    currentStep: FlowStep;
}

interface StepConfig {
    label: string;
    number: number;
}

const STEPS: StepConfig[] = [
    { label: 'Sites', number: 1 },
    { label: 'Configure', number: 2 },
    { label: 'Results', number: 3 },
];

/**
 * Determines the numeric step index (0-based) from the FlowStep.
 * PLACE_SITES → 0, CONFIGURE/READY_TO_ANALYZE/ANALYZING → 1, VIEWING_RESULTS/STALE_RESULTS → 2
 */
function getStepIndex(step: FlowStep): number {
    switch (step) {
        case 'PLACE_SITES':
            return 0;
        case 'CONFIGURE':
        case 'READY_TO_ANALYZE':
        case 'ANALYZING':
            return 1;
        case 'VIEWING_RESULTS':
        case 'STALE_RESULTS':
            return 2;
        default:
            return 0;
    }
}

/**
 * Compact visual step progress indicator showing the user's workflow position.
 * Three steps: Sites → Configure → Results, with completed/active/future states.
 *
 * @example
 * <StepIndicator currentStep={flow.currentStep} />
 */
export function StepIndicator({ currentStep }: StepIndicatorProps) {
    const activeIndex = getStepIndex(currentStep);

    return (
        <div data-tour="mode-tabs" className="flex items-center justify-between px-2 py-2.5" role="navigation" aria-label="Analysis progress">
            {STEPS.map((step, index) => {
                const isCompleted = index < activeIndex;
                const isCurrent = index === activeIndex;
                const isFuture = index > activeIndex;

                return (
                    <React.Fragment key={step.number}>
                        {/* Step circle + label */}
                        <div className="flex items-center gap-1.5">
                            <div
                                className={cn(
                                    'w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold transition-all duration-200',
                                    isCompleted && 'bg-success text-text-brand-inverse',
                                    isCurrent && 'bg-brand-500 text-white',
                                    isFuture && 'border border-surface-border-light text-text-brand-muted bg-transparent',
                                )}
                                aria-current={isCurrent ? 'step' : undefined}
                            >
                                {isCompleted ? (
                                    <Check className="h-3 w-3" />
                                ) : (
                                    step.number
                                )}
                            </div>
                            <span
                                className={cn(
                                    'text-[0.65rem] font-medium transition-colors duration-200 hidden sm:inline',
                                    isCompleted && 'text-success',
                                    isCurrent && 'text-text-brand-primary',
                                    isFuture && 'text-text-brand-muted',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connecting line (not after last step) */}
                        {index < STEPS.length - 1 && (
                            <div
                                className={cn(
                                    'flex-1 h-px mx-2 transition-colors duration-200',
                                    index < activeIndex ? 'bg-success' : 'bg-surface-border',
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export default StepIndicator;