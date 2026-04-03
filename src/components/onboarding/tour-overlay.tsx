// src/components/onboarding/tour-overlay.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Z_INDEX } from '@/styles/design-tokens';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

interface TourOverlayProps {
  /** CSS selector for the target element, or 'center' for no spotlight */
  target: string;
  /** Extra padding around the spotlight cutout */
  padding?: number;
  /** Whether to show a pulse animation on the spotlight border */
  highlight?: boolean;
  /** Click handler for the overlay background (outside spotlight) */
  onOverlayClick?: () => void;
}

function getElementRect(selector: string, padding: number): SpotlightRect | null {
  if (selector === 'center') return null;

  try {
    const el = document.querySelector(selector);
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;

    const computed = window.getComputedStyle(el);
    const br = parseFloat(computed.borderRadius) || 0;

    return {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      borderRadius: br + padding / 2,
    };
  } catch {
    return null;
  }
}

export function TourOverlay({
  target,
  padding = 8,
  highlight = true,
  onOverlayClick,
}: TourOverlayProps) {
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);

  const updateSpotlight = useCallback(() => {
    const rect = getElementRect(target, padding);
    setSpotlight(rect);
  }, [target, padding]);

  useEffect(() => {
    updateSpotlight();

    // Recalculate on resize and scroll
    const handleResize = () => {
      requestAnimationFrame(updateSpotlight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    // Also observe DOM changes in case elements shift
    const observer = new MutationObserver(() => {
      requestAnimationFrame(updateSpotlight);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
      observer.disconnect();
    };
  }, [updateSpotlight]);

  // For 'center' target — just a dark overlay with no cutout
  if (target === 'center' || !spotlight) {
    return (
      <div
        className="fixed inset-0"
        style={{ zIndex: Z_INDEX.overlay, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={onOverlayClick}
        aria-hidden="true"
      />
    );
  }

  const { top, left, width, height, borderRadius } = spotlight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: Z_INDEX.overlay }}
      aria-hidden="true"
    >
      {/* SVG mask overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: 'auto' }}
        onClick={onOverlayClick}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White = visible overlay (dark area) */}
            <rect x="0" y="0" width={vw} height={vh} fill="white" />
            {/* Black = transparent cutout (spotlight) */}
            <rect
              x={left}
              y={top}
              width={width}
              height={height}
              rx={borderRadius}
              ry={borderRadius}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width={vw}
          height={vh}
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {highlight && (
        <div
          className="absolute pointer-events-none animate-pulse"
          style={{
            top: top - 2,
            left: left - 2,
            width: width + 4,
            height: height + 4,
            borderRadius: borderRadius + 2,
            border: '2px solid rgba(0, 102, 255, 0.4)',
            boxShadow: '0 0 20px rgba(0, 102, 255, 0.15)',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      )}
    </div>
  );
}