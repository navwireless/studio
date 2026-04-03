// src/hooks/use-hints.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { HINT_TRIGGERS, type HintTrigger } from '@/content/hint-triggers';

interface UseHintsOptions {
  /** Total analyses performed by this user */
  analysisCount: number;
  /** Remaining credits */
  creditsRemaining: number;
  /** Get show count for a hint */
  getHintShowCount: (hintId: string) => number;
  /** Callback when a hint is dismissed */
  onDismiss: (hintId: string) => void;
  /** Check if a feature has been used */
  isFeatureUsed: (featureId: string) => boolean;
  /** Whether the tour is currently active (suppress hints during tour) */
  isTourActive: boolean;
  /** Whether the help panel is open (suppress hints when panel open) */
  isHelpPanelOpen: boolean;
}

export interface UseHintsReturn {
  /** Currently showing hint (only one at a time), or null */
  activeHint: HintTrigger | null;
  /** Dismiss the current hint */
  dismissCurrentHint: () => void;
}

function evaluateCondition(
  trigger: HintTrigger,
  analysisCount: number,
  creditsRemaining: number,
  isFeatureUsed: (featureId: string) => boolean
): boolean {
  const { condition } = trigger;

  switch (condition.type) {
    case 'analysis_count': {
      if ('exactly' in condition.params) {
        return analysisCount === Number(condition.params.exactly);
      }
      if ('min' in condition.params) {
        return analysisCount >= Number(condition.params.min);
      }
      return false;
    }
    case 'credits_low': {
      const threshold = Number(condition.params.threshold ?? 5);
      return creditsRemaining > 0 && creditsRemaining <= threshold;
    }
    case 'feature_unused': {
      const feature = String(condition.params.feature ?? '');
      return feature !== '' && !isFeatureUsed(feature);
    }
    default:
      return false;
  }
}

export function useHints({
  analysisCount,
  creditsRemaining,
  getHintShowCount,
  onDismiss,
  isFeatureUsed,
  isTourActive,
  isHelpPanelOpen,
}: UseHintsOptions): UseHintsReturn {
  const [activeHint, setActiveHint] = useState<HintTrigger | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const dismissCurrentHint = useCallback(() => {
    if (activeHint) {
      onDismiss(activeHint.id);
      setActiveHint(null);
      clearTimers();
    }
  }, [activeHint, onDismiss, clearTimers]);

  // Evaluate triggers when dependencies change
  useEffect(() => {
    // Don't show hints during tour or when help panel is open
    if (isTourActive || isHelpPanelOpen) {
      setActiveHint(null);
      clearTimers();
      return;
    }

    // Don't evaluate if a hint is already showing
    if (activeHint) return;

    // Find the first eligible hint
    const eligible = HINT_TRIGGERS.find((trigger) => {
      // Check if already dismissed enough times
      const showCount = getHintShowCount(trigger.id);
      if (showCount >= trigger.maxShows) return false;

      // Check condition
      return evaluateCondition(
        trigger,
        analysisCount,
        creditsRemaining,
        isFeatureUsed
      );
    });

    if (!eligible) return;

    // Show after delay
    clearTimers();
    showTimerRef.current = setTimeout(() => {
      setActiveHint(eligible);

      // Set auto-dismiss timer
      if (eligible.autoDismissMs > 0) {
        dismissTimerRef.current = setTimeout(() => {
          onDismiss(eligible.id);
          setActiveHint(null);
        }, eligible.autoDismissMs);
      }
    }, eligible.delayMs);

    return () => {
      clearTimers();
    };
  }, [
    analysisCount,
    creditsRemaining,
    isFeatureUsed,
    isTourActive,
    isHelpPanelOpen,
    activeHint,
    getHintShowCount,
    onDismiss,
    clearTimers,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    activeHint,
    dismissCurrentHint,
  };
}