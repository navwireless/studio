"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// ============================================
// Props
// ============================================

export interface AnalysisButtonProps {
  /** Whether both sites are placed */
  canAnalyze: boolean;
  /** Whether analysis is in progress */
  isAnalyzing: boolean;
  /** Whether results are stale (inputs changed) */
  isStale: boolean;
  /** Whether analysis has been completed at least once */
  hasResults: boolean;
  /** Current credits remaining */
  creditsRemaining: number;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether any other action is pending */
  disabled?: boolean;
}

// ============================================
// Loading message cycle
// ============================================

const ANALYZING_MESSAGES = [
  'Analyzing terrain...',
  'Calculating LOS...',
  'Generating results...',
];

function useLoadingMessage(isAnalyzing: boolean): string {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYZING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return ANALYZING_MESSAGES[messageIndex];
}

// ============================================
// Component
// ============================================

/**
 * Smart analyze button with context-aware states.
 *
 * States:
 * - DISABLED: sites not placed — dimmed, shows "Place both sites to analyze"
 * - READY: both sites placed, no results — primary blue with pulse glow
 * - ANALYZING: spinner with cycling messages
 * - STALE: warning amber, "RE-ANALYZE (changed)"
 * - LOW_CREDITS: works but shows warning text below
 * - ZERO_CREDITS: disabled with upgrade link
 *
 * @example
 * <AnalysisButton
 *   canAnalyze={flow.canAnalyze}
 *   isAnalyzing={analysis.isActionPending}
 *   isStale={analysis.isStale}
 *   hasResults={!!analysis.analysisResult}
 *   creditsRemaining={latestCredits}
 *   onClick={handleAnalyzeClick}
 * />
 */
export function AnalysisButton({
  canAnalyze,
  isAnalyzing,
  isStale,
  hasResults,
  creditsRemaining,
  onClick,
  disabled = false,
}: AnalysisButtonProps) {
  const loadingMessage = useLoadingMessage(isAnalyzing);
  const isZeroCredits = creditsRemaining <= 0;
  const isLowCredits = creditsRemaining > 0 && creditsRemaining <= 3;
  const isDisabled = !canAnalyze || isAnalyzing || isZeroCredits || disabled;

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onClick();
    }
  }, [isDisabled, onClick]);

  // ── ANALYZING STATE ──
  if (isAnalyzing) {
    return (
      <div data-tour="analyze-button" className="my-3">
        <button
          type="button"
          disabled
          className={cn(
            'w-full h-12 rounded-lg flex items-center justify-center gap-2',
            'bg-brand-600 text-white',
            'text-sm font-semibold',
            'cursor-not-allowed',
            'relative overflow-hidden',
          )}
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <Loader2 className="h-4 w-4 animate-spin relative z-10" />
          <span className="relative z-10">{loadingMessage}</span>
        </button>
      </div>
    );
  }

  // ── STALE STATE ──
  if (hasResults && isStale && canAnalyze) {
    return (
      <div data-tour="analyze-button" className="my-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isZeroCredits}
          className={cn(
            'w-full h-12 rounded-lg flex items-center justify-center gap-2',
            'bg-warning text-text-brand-inverse',
            'text-sm font-semibold',
            'hover:brightness-110 active:scale-[0.99]',
            'transition-all duration-200',
            'touch-manipulation',
            (disabled || isZeroCredits) && 'opacity-50 cursor-not-allowed',
          )}
          title="Parameters changed since last analysis. Click to re-analyze."
        >
          <RefreshCw className="h-4 w-4" />
          RE-ANALYZE (changed)
        </button>
        {isLowCredits && (
          <p className="text-[0.65rem] text-warning mt-1.5 text-center">
            ⚠ {creditsRemaining} credit{creditsRemaining !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>
    );
  }

  // ── ZERO CREDITS STATE ──
  if (isZeroCredits) {
    return (
      <div data-tour="analyze-button" className="my-3">
        <button
          type="button"
          disabled
          className={cn(
            'w-full h-12 rounded-lg flex items-center justify-center gap-2',
            'bg-surface-overlay text-text-brand-disabled',
            'text-sm font-semibold',
            'cursor-not-allowed',
          )}
        >
          <Zap className="h-4 w-4" />
          ANALYZE LOS
        </button>
        <div className="text-center mt-1.5">
          <p className="text-[0.65rem] text-text-brand-muted">No credits remaining</p>
          <Link
            href="/pricing"
            className="text-[0.65rem] font-medium text-brand-400 hover:text-brand-300 transition-colors"
          >
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    );
  }

  // ── DISABLED STATE (sites not placed) ──
  if (!canAnalyze) {
    return (
      <div data-tour="analyze-button" className="my-3">
        <button
          type="button"
          disabled
          className={cn(
            'w-full h-12 rounded-lg flex items-center justify-center gap-2',
            'bg-surface-overlay text-text-brand-disabled',
            'text-sm font-semibold',
            'cursor-not-allowed',
          )}
        >
          <Zap className="h-4 w-4" />
          ANALYZE LOS
        </button>
        <p className="text-[0.65rem] text-text-brand-muted mt-1.5 text-center">
          Place both sites to analyze
        </p>
      </div>
    );
  }

  // ── READY STATE (both sites placed, can analyze) ──
  return (
    <div data-tour="analyze-button" className="my-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'w-full h-12 rounded-lg flex items-center justify-center gap-2',
          'bg-brand-500 text-white',
          'text-sm font-semibold',
          'hover:bg-brand-600 active:scale-[0.99]',
          'transition-all duration-200',
          'touch-manipulation',
          'shadow-[0_0_20px_rgba(0,102,255,0.15)]',
          // Subtle pulse glow animation when ready
          !hasResults && 'animate-glow-pulse',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        title="Analyze line-of-sight feasibility (Ctrl+Enter)"
      >
        <Zap className="h-4 w-4" />
        ANALYZE LOS
      </button>
      {isLowCredits && (
        <p className="text-[0.65rem] text-warning mt-1.5 text-center">
          ⚠ {creditsRemaining} credit{creditsRemaining !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
}

export default AnalysisButton;