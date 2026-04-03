"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { FlowStep } from '@/hooks/use-flow-state';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';

// ============================================
// Props
// ============================================

export interface MapHintOverlayProps {
    /** Current flow step */
    currentStep: FlowStep;
    /** Whether Site A has coordinates */
    siteAPlaced: boolean;
    /** Whether Site B has coordinates */
    siteBPlaced: boolean;
    /** Whether results exist */
    hasResults: boolean;
    /** Whether analysis is in progress */
    isAnalyzing: boolean;
    /** Whether results are stale */
    isStale: boolean;
}

// ============================================
// Hint config per state
// ============================================

interface HintConfig {
    message: string;
    icon: React.ReactNode;
    bgClass: string;
    autoDismissMs?: number;
}

function getHintConfig(
    currentStep: FlowStep,
    siteAPlaced: boolean,
    siteBPlaced: boolean,
): HintConfig | null {
    switch (currentStep) {
        case 'PLACE_SITES':
            if (!siteAPlaced) {
                return {
                    message: 'Click the map to place Site A, or search above',
                    icon: <MapPin className="h-3.5 w-3.5" />,
                    bgClass: 'bg-surface-elevated/90 border-surface-border-light',
                };
            }
            if (!siteBPlaced) {
                return {
                    message: 'Now click the map to place Site B',
                    icon: <MapPin className="h-3.5 w-3.5" />,
                    bgClass: 'bg-surface-elevated/90 border-surface-border-light',
                };
            }
            return null;

        case 'CONFIGURE':
        case 'READY_TO_ANALYZE':
            return {
                message: 'Both sites placed — click Analyze in the panel',
                icon: <span className="text-success">✓</span>,
                bgClass: 'bg-success-bg border-success-border',
                autoDismissMs: 5000,
            };

        case 'ANALYZING':
            return {
                message: 'Analyzing terrain between sites...',
                icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
                bgClass: 'bg-brand-500/10 border-brand-500/20',
            };

        case 'STALE_RESULTS':
            return {
                message: 'Parameters changed — results may be outdated',
                icon: <AlertTriangle className="h-3.5 w-3.5" />,
                bgClass: 'bg-warning-bg border-warning-border',
                autoDismissMs: 3000,
            };

        case 'VIEWING_RESULTS':
            // No hint when viewing fresh results — the LOS line IS the indicator
            return null;

        default:
            return null;
    }
}

// ============================================
// Component
// ============================================

/**
 * Floating hint pill displayed at top-center of the map area.
 * Provides contextual guidance based on the current flow state.
 *
 * - pointer-events: none so user can click through to map
 * - Auto-dismisses for certain states (e.g., "both sites placed" after 5s)
 * - Smooth fade + slide transitions
 *
 * @example
 * <MapHintOverlay
 *   currentStep={flow.currentStep}
 *   siteAPlaced={flow.siteAPlaced}
 *   siteBPlaced={flow.siteBPlaced}
 *   hasResults={flow.hasResults}
 *   isAnalyzing={flow.isAnalyzing}
 *   isStale={flow.isStale}
 * />
 */
export function MapHintOverlay({
    currentStep,
    siteAPlaced,
    siteBPlaced,
    // hasResults, isAnalyzing, isStale — reserved for future hint logic
}: MapHintOverlayProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [lastStep, setLastStep] = useState<FlowStep | null>(null);

    const hint = getHintConfig(currentStep, siteAPlaced, siteBPlaced);

    // Reset dismissed state when step changes
    useEffect(() => {
        if (currentStep !== lastStep) {
            setLastStep(currentStep);
            setIsDismissed(false);
        }
    }, [currentStep, lastStep]);

    // Show/hide logic
    useEffect(() => {
        if (hint && !isDismissed) {
            // Small delay before showing to avoid flash
            const showTimer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(showTimer);
        } else {
            setIsVisible(false);
        }
    }, [hint, isDismissed]);

    // Auto-dismiss
    useEffect(() => {
        if (!hint?.autoDismissMs || isDismissed) return;

        const timer = setTimeout(() => {
            setIsDismissed(true);
        }, hint.autoDismissMs);

        return () => clearTimeout(timer);
    }, [hint, isDismissed]);

    if (!hint) return null;

    return (
        <div
            className={cn(
                'absolute top-16 left-1/2 -translate-x-1/2 z-20',
                'pointer-events-none',
                'transition-all duration-200',
                isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2',
            )}
        >
            <div
                className={cn(
                    'flex items-center gap-2 px-4 py-2.5',
                    'rounded-full border backdrop-blur-xl',
                    'shadow-lg',
                    'max-w-[400px]',
                    hint.bgClass,
                )}
            >
                <span className="flex-shrink-0 text-text-brand-primary">
                    {hint.icon}
                </span>
                <span className="text-xs font-medium text-text-brand-primary whitespace-nowrap">
                    {hint.message}
                </span>
            </div>
        </div>
    );
}

export default MapHintOverlay;