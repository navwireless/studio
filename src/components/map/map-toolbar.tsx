// src/components/map/map-toolbar.tsx
// Phase 12A — Vertical toolbar with integrated controls, mobile-optimized

'use client';

import React, { useState, useCallback } from 'react';
import {
  Ruler,
  Pentagon,
  MapPin,
  Mountain,
  Crosshair,
  Circle,
  Camera,
  BarChart3,
  Grid3x3,
  Compass,
  Target,
  ChevronRight,
  Trash2,
  X,
  Wrench,
  Sun,
  Cloud,
  StickyNote,
} from 'lucide-react';
import type { MapToolId, MapToolCategory } from '@/types/map-tools';
import { MAP_TOOLS, TOOL_CATEGORIES } from '@/types/map-tools';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ruler,
  Pentagon,
  MapPin,
  Mountain,
  Crosshair,
  Circle,
  Camera,
  BarChart3,
  Grid3x3,
  Compass,
  Target,
  Sun,
  Cloud,
  StickyNote,
};

interface MapToolbarProps {
  activeTool: MapToolId | null;
  onToggleTool: (toolId: MapToolId) => void;
  onClearAll: () => void;
  isProcessing: boolean;
  gridVisible: boolean;
  isMobile: boolean;
  statusMessage: string | null;
}

export function MapToolbar({
  activeTool,
  onToggleTool,
  onClearAll,
  isProcessing,
  gridVisible,
  isMobile,
  statusMessage,
}: MapToolbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [tooltipToolId, setTooltipToolId] = useState<MapToolId | null>(null);

  const visibleTools = isMobile
    ? MAP_TOOLS.filter((t) => t.mobileSupported)
    : MAP_TOOLS;

  const groupedTools = visibleTools.reduce(
    (acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<MapToolCategory, typeof visibleTools>
  );

  const sortedCategories = (
    Object.keys(groupedTools) as MapToolCategory[]
  ).sort((a, b) => TOOL_CATEGORIES[a].order - TOOL_CATEGORIES[b].order);

  const handleToolClick = useCallback(
    (toolId: MapToolId) => {
      if (isProcessing) return;
      onToggleTool(toolId);
    },
    [isProcessing, onToggleTool]
  );

  // ── Collapsed: single compact button ──
  if (isCollapsed) {
    return (
      <div className="absolute top-20 right-3 z-30" data-tour="map-toolbar">
        <button
          onClick={() => setIsCollapsed(false)}
          className={cn(
            'flex items-center justify-center rounded-xl shadow-lg',
            'bg-surface-card/95 backdrop-blur-xl border border-surface-border',
            'text-text-brand-secondary hover:text-text-brand-primary',
            'hover:shadow-xl transition-all touch-manipulation active:scale-95',
            isMobile ? 'w-9 h-9' : 'w-10 h-10',
            activeTool && 'ring-1 ring-brand-500/40'
          )}
          aria-label="Open map tools"
        >
          <Wrench className={cn(isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4', activeTool && 'text-brand-400')} />
        </button>
      </div>
    );
  }

  // ── Expanded: unified toolbar card ──
  return (
    <div
      className={cn(
        'absolute top-20 right-3 z-30 flex flex-col gap-1.5',
        'animate-in fade-in slide-in-from-right-2 duration-200'
      )}
      data-tour="map-toolbar"
    >
      {/* Single unified card */}
      <div
        className={cn(
          'flex flex-col rounded-xl overflow-hidden',
          'bg-surface-card/95 backdrop-blur-xl border border-surface-border',
          'shadow-xl'
        )}
      >
        {/* Scrollable tools section */}
        <div
          className={cn(
            'flex flex-col overflow-y-auto',
            isMobile ? 'p-1 gap-px max-h-[60vh]' : 'p-1.5 gap-0.5 max-h-[75vh]'
          )}
        >
          {sortedCategories.map((category, catIdx) => (
            <React.Fragment key={category}>
              {/* Category separator */}
              {catIdx > 0 && (
                <div className={cn('mx-1', isMobile ? 'my-0.5' : 'my-1')}>
                  <div className="h-px bg-surface-border" />
                </div>
              )}



              {/* Tool buttons */}
              {groupedTools[category].map((tool) => {
                const Icon = ICON_MAP[tool.icon];
                const isActive =
                  activeTool === tool.id ||
                  (tool.id === 'grid-overlay' && gridVisible);
                const isDisabled = isProcessing && activeTool !== tool.id;

                return (
                  <div key={tool.id} className="relative">
                    <button
                      onClick={() => handleToolClick(tool.id)}
                      onMouseEnter={() => !isMobile && setTooltipToolId(tool.id)}
                      onMouseLeave={() => setTooltipToolId(null)}
                      disabled={isDisabled}
                      className={cn(
                        'flex items-center justify-center rounded-lg',
                        'transition-all duration-150 touch-manipulation active:scale-90',
                        isMobile ? 'w-8 h-8' : 'w-9 h-9',
                        isActive
                          ? 'bg-brand-500/20 text-brand-400 shadow-[inset_0_0_0_1px_rgba(0,102,255,0.3)]'
                          : 'text-text-brand-muted hover:text-text-brand-secondary hover:bg-white/[0.04]',
                        isDisabled && 'opacity-30 cursor-not-allowed'
                      )}
                      aria-label={tool.name}
                      aria-pressed={isActive}
                    >
                      {Icon && (
                        <Icon className={cn(isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
                      )}
                    </button>

                    {/* Desktop tooltip — left of button */}
                    {tooltipToolId === tool.id && !isMobile && (
                      <div
                        className={cn(
                          'absolute right-full top-1/2 -translate-y-1/2 mr-3',
                          'px-3 py-2 rounded-lg',
                          'bg-surface-base/95 backdrop-blur-md border border-surface-border',
                          'shadow-xl pointer-events-none z-50',
                          'animate-in fade-in slide-in-from-right-1 duration-100',
                          'whitespace-nowrap'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-text-brand-primary">
                            {tool.name}
                          </span>
                          {tool.shortcutKey && (
                            <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded bg-surface-overlay border border-surface-border text-text-brand-muted font-mono text-[0.55rem] leading-none">
                              {tool.shortcutKey}
                            </kbd>
                          )}
                        </div>
                        <p className="text-[0.6rem] text-text-brand-muted mt-1 leading-relaxed max-w-[220px]">
                          {tool.description}
                        </p>
                        {/* Right-pointing arrow */}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-[5px]">
                          <div className="w-0 h-0 border-y-[5px] border-y-transparent border-l-[5px] border-l-surface-border" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Footer: Clear + Collapse — integrated at bottom */}
        <div
          className={cn(
            'flex items-center border-t border-surface-border',
            isMobile ? 'p-1 gap-px' : 'p-1.5 gap-1'
          )}
        >
          <button
            onClick={onClearAll}
            className={cn(
              'flex-1 flex items-center justify-center rounded-lg',
              'text-text-brand-muted hover:text-red-400 hover:bg-red-500/10',
              'transition-all touch-manipulation active:scale-95',
              isMobile ? 'h-7' : 'h-8'
            )}
            aria-label="Clear all tool overlays"
            title="Clear all overlays"
          >
            <Trash2 className={cn(isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
          </button>
          <div className="w-px h-4 bg-surface-border" />
          <button
            onClick={() => setIsCollapsed(true)}
            className={cn(
              'flex-1 flex items-center justify-center rounded-lg',
              'text-text-brand-muted hover:text-text-brand-secondary hover:bg-white/[0.04]',
              'transition-all touch-manipulation active:scale-95',
              isMobile ? 'h-7' : 'h-8'
            )}
            aria-label="Collapse toolbar"
            title="Collapse"
          >
            <ChevronRight className={cn(isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
          </button>
        </div>
      </div>

      {/* Status message — below toolbar card */}
      {statusMessage && activeTool && (
        <div
          className={cn(
            'p-2 rounded-lg',
            'bg-surface-card/95 backdrop-blur-xl border border-surface-border',
            'shadow-lg',
            isMobile ? 'max-w-[150px]' : 'max-w-[200px]'
          )}
        >
          <div className="flex items-start gap-1.5">
            <p className="flex-1 text-[0.6rem] leading-relaxed text-text-brand-secondary">
              {statusMessage}
            </p>
            <button
              onClick={() => onToggleTool(activeTool)}
              className="text-text-brand-muted hover:text-red-400 flex-shrink-0 mt-0.5 touch-manipulation"
              aria-label="Cancel tool"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {isProcessing && (
            <div className="mt-1.5 h-0.5 rounded-full bg-surface-overlay overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full animate-shimmer w-1/2" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}