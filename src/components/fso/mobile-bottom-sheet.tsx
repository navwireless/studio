"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export type SheetSnapPoint = 'collapsed' | 'half' | 'full';

export interface MobileBottomSheetProps {
  /** Content to render inside the sheet */
  children: React.ReactNode;
  /** Summary line shown when collapsed */
  collapsedSummary: React.ReactNode;
  /** Current snap point */
  snapPoint: SheetSnapPoint;
  /** Callback when snap point changes */
  onSnapPointChange: (point: SheetSnapPoint) => void;
  /** Whether to show the sheet */
  isVisible: boolean;
}

// ============================================
// Snap point heights (in vh-equivalent pixels)
// ============================================

const COLLAPSED_HEIGHT = 72; // 64px content + 8px handle area
const HALF_RATIO = 0.5;
const FULL_RATIO = 0.9;

function getSnapHeights(windowHeight: number) {
  return {
    collapsed: COLLAPSED_HEIGHT,
    half: Math.round(windowHeight * HALF_RATIO),
    full: Math.round(windowHeight * FULL_RATIO),
  };
}

function getClosestSnap(
  currentHeight: number,
  windowHeight: number
): SheetSnapPoint {
  const snaps = getSnapHeights(windowHeight);
  const distances = {
    collapsed: Math.abs(currentHeight - snaps.collapsed),
    half: Math.abs(currentHeight - snaps.half),
    full: Math.abs(currentHeight - snaps.full),
  };

  if (distances.collapsed <= distances.half && distances.collapsed <= distances.full) {
    return 'collapsed';
  }
  if (distances.half <= distances.full) {
    return 'half';
  }
  return 'full';
}

// ============================================
// Component
// ============================================

/**
 * Mobile bottom sheet with drag-to-resize gesture handling.
 *
 * Three snap points:
 * - collapsed: 72px — shows handle + summary
 * - half: 50vh — sites + config + analyze
 * - full: 90vh — all content including results, downloads, history
 *
 * Gesture handling:
 * - Touch drag on handle to resize
 * - Spring animation when snapping
 * - Velocity-based snap detection (fast flick → next snap point)
 *
 * No external dependencies — pure CSS transforms + touch events.
 *
 * @example
 * <MobileBottomSheet
 *   collapsedSummary={<span>📍 Place sites to start</span>}
 *   snapPoint={sheetSnap}
 *   onSnapPointChange={setSheetSnap}
 *   isVisible={isMobile}
 * >
 *   {... side panel content ...}
 * </MobileBottomSheet>
 */
export function MobileBottomSheet({
  children,
  collapsedSummary,
  snapPoint,
  onSnapPointChange,
  isVisible,
}: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  // Track touch state
  const touchState = useRef<{
    startY: number;
    startHeight: number;
    startTime: number;
    lastY: number;
    lastTime: number;
    velocity: number;
  } | null>(null);

  // Window resize
  useEffect(() => {
    function handleResize() {
      setWindowHeight(window.innerHeight);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const snapHeights = getSnapHeights(windowHeight);
  const currentTargetHeight = snapHeights[snapPoint];

  // ── Touch handlers ──
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const currentH = dragHeight ?? currentTargetHeight;
      touchState.current = {
        startY: touch.clientY,
        startHeight: currentH,
        startTime: Date.now(),
        lastY: touch.clientY,
        lastTime: Date.now(),
        velocity: 0,
      };
      setIsDragging(true);
    },
    [dragHeight, currentTargetHeight]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const state = touchState.current;
      if (!state) return;

      const touch = e.touches[0];
      const deltaY = state.startY - touch.clientY;
      const newHeight = Math.max(
        COLLAPSED_HEIGHT,
        Math.min(snapHeights.full + 20, state.startHeight + deltaY)
      );

      // Compute velocity
      const now = Date.now();
      const dt = now - state.lastTime;
      if (dt > 0) {
        state.velocity = (state.lastY - touch.clientY) / dt; // positive = dragging up
      }
      state.lastY = touch.clientY;
      state.lastTime = now;

      setDragHeight(newHeight);
    },
    [snapHeights.full]
  );

  const handleTouchEnd = useCallback(() => {
    const state = touchState.current;
    if (!state) return;

    const finalHeight = dragHeight ?? currentTargetHeight;
    const velocity = state.velocity;

    // Velocity-based snapping (fast flick)
    let targetSnap: SheetSnapPoint;
    if (Math.abs(velocity) > 0.5) {
      if (velocity > 0) {
        // Dragging up — go to next higher snap
        if (snapPoint === 'collapsed') targetSnap = 'half';
        else if (snapPoint === 'half') targetSnap = 'full';
        else targetSnap = 'full';
      } else {
        // Dragging down — go to next lower snap
        if (snapPoint === 'full') targetSnap = 'half';
        else if (snapPoint === 'half') targetSnap = 'collapsed';
        else targetSnap = 'collapsed';
      }
    } else {
      // Position-based snapping
      targetSnap = getClosestSnap(finalHeight, windowHeight);
    }

    touchState.current = null;
    setIsDragging(false);
    setDragHeight(null);
    onSnapPointChange(targetSnap);
  }, [
    dragHeight,
    currentTargetHeight,
    snapPoint,
    windowHeight,
    onSnapPointChange,
  ]);

  if (!isVisible) return null;

  const displayHeight = isDragging && dragHeight != null
    ? dragHeight
    : currentTargetHeight;

  const isExpanded = snapPoint !== 'collapsed';

  return (
    <>
      {/* Backdrop when expanded */}
      {isExpanded && !isDragging && (
        <div
          className="fixed inset-0 bg-black/40 z-[299] lg:hidden"
          onClick={() => onSnapPointChange('collapsed')}
        />
      )}

      <div
        ref={sheetRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[300] lg:hidden',
          'bg-surface-card border-t border-surface-border',
          'rounded-t-2xl shadow-xl',
          !isDragging && 'transition-[height] duration-300 ease-out',
        )}
        style={{
          height: displayHeight,
        }}
      >
        {/* Drag handle */}
        <div
          className="flex items-center justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing touch-manipulation"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-surface-border-light" />
        </div>

        {/* Collapsed summary */}
        {snapPoint === 'collapsed' && (
          <div
            className="px-4 py-2 cursor-pointer touch-manipulation"
            onClick={() => onSnapPointChange('half')}
          >
            <div className="text-xs font-medium text-text-brand-primary">
              {collapsedSummary}
            </div>
          </div>
        )}

        {/* Scrollable content */}
        {snapPoint !== 'collapsed' && (
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-safe"
            style={{
              height: displayHeight - 40, // minus handle area
              scrollbarWidth: 'thin',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {children}
          </div>
        )}
      </div>
    </>
  );
}

export default MobileBottomSheet;