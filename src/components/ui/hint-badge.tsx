// src/components/ui/hint-badge.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { COLORS, SHADOWS, Z_INDEX, RADIUS } from '@/styles/design-tokens';
import type { HintTrigger } from '@/content/hint-triggers';

interface HintBadgeProps {
  hint: HintTrigger;
  /** Dynamic values to interpolate (e.g., {{credits}}) */
  interpolations?: Record<string, string | number>;
  onDismiss: () => void;
}

function interpolateMessage(
  message: string,
  values: Record<string, string | number>
): string {
  let result = message;
  for (const [key, val] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }
  return result;
}

export function HintBadge({ hint, interpolations = {}, onDismiss }: HintBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const message = interpolateMessage(hint.message, interpolations);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss progress
  useEffect(() => {
    if (hint.autoDismissMs <= 0) return;

    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(elapsed / hint.autoDismissMs, 1);
      setProgress(pct);

      if (pct < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [hint.autoDismissMs]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 200);
  };

  // Position styles based on hint.position
  const positionStyles: React.CSSProperties = (() => {
    switch (hint.position) {
      case 'bottom-right':
        return { position: 'fixed', bottom: 88, right: 24 };
      case 'top-right':
        return { position: 'fixed', top: 80, right: 24 };
      case 'inline':
        // For inline, we position fixed bottom-right as fallback
        // Real inline positioning would need ref to attachTo element
        return { position: 'fixed', bottom: 88, right: 24 };
      default:
        return { position: 'fixed', bottom: 88, right: 24 };
    }
  })();

  return (
    <div
      role="status"
      aria-live="polite"
      className="transition-all duration-300"
      style={{
        ...positionStyles,
        zIndex: Z_INDEX.toast - 50,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
        maxWidth: 340,
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: COLORS.surface.elevated,
          borderRadius: RADIUS.lg,
          boxShadow: SHADOWS.lg,
          borderLeft: `3px solid ${COLORS.primary[500]}`,
        }}
      >
        <div className="flex items-start gap-3 px-4 py-3.5">
          {/* Icon */}
          <span className="text-base flex-shrink-0 mt-0.5" aria-hidden="true">
            {hint.icon}
          </span>

          {/* Message */}
          <p
            className="flex-1"
            style={{
              fontSize: '0.8125rem',
              color: COLORS.text.secondary,
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-white/5"
            style={{ color: COLORS.primary[400] }}
          >
            Got it ✓
          </button>
        </div>

        {/* Auto-dismiss progress bar */}
        {hint.autoDismissMs > 0 && (
          <div
            className="h-0.5 w-full"
            style={{ backgroundColor: COLORS.surface.border }}
          >
            <div
              className="h-full transition-none"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: COLORS.primary[500],
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}