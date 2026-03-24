
"use client";

import React from 'react';
import { Crosshair, Settings, Trash2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PlacementMode = 'A' | 'B' | null;

interface MapToolbarProps {
  placementMode: PlacementMode;
  onSetPlacementMode: (mode: PlacementMode) => void;
  onOpenSettings: () => void;
  onClearMap: () => void;
  onAnalyze: () => void;
  isPending: boolean;
  hasAnyPoints: boolean;
  hasBothPoints: boolean;
  hasAnalysisResult: boolean;
}

const MapToolbar = React.memo(function MapToolbar({
  placementMode,
  onSetPlacementMode,
  onOpenSettings,
  onClearMap,
  onAnalyze,
  isPending,
  hasAnyPoints,
  hasBothPoints,
}: MapToolbarProps) {

  const handlePlaceA = () => onSetPlacementMode(placementMode === 'A' ? null : 'A');
  const handlePlaceB = () => onSetPlacementMode(placementMode === 'B' ? null : 'B');

  return (
    <>
      {/* ─── Primary Control Bar ─── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 print:hidden w-[calc(100%-2rem)] max-w-md">
        <div className="flex items-stretch bg-black/75 backdrop-blur-2xl rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/[0.08] overflow-hidden">

          {/* Place A */}
          <button
            type="button"
            onClick={handlePlaceA}
            disabled={isPending}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 transition-all duration-200 relative group",
              "hover:bg-white/[0.06] active:bg-white/[0.1]",
              placementMode === 'A' && "bg-emerald-500/15",
              isPending && "opacity-40 pointer-events-none"
            )}
            aria-label={placementMode === 'A' ? "Cancel placing Site A" : "Place Site A on map"}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[0.7rem] font-black transition-all duration-200",
              placementMode === 'A'
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110"
                : "bg-white/10 text-white/60 group-hover:bg-white/15 group-hover:text-white/80"
            )}>
              A
            </div>
            <span className={cn(
              "text-[0.55rem] font-semibold tracking-wider uppercase transition-colors",
              placementMode === 'A' ? "text-emerald-400" : "text-white/40 group-hover:text-white/60"
            )}>
              Site A
            </span>
            {placementMode === 'A' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          {/* Place B */}
          <button
            type="button"
            onClick={handlePlaceB}
            disabled={isPending}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 transition-all duration-200 relative group",
              "hover:bg-white/[0.06] active:bg-white/[0.1]",
              placementMode === 'B' && "bg-blue-500/15",
              isPending && "opacity-40 pointer-events-none"
            )}
            aria-label={placementMode === 'B' ? "Cancel placing Site B" : "Place Site B on map"}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-[0.7rem] font-black transition-all duration-200",
              placementMode === 'B'
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/40 scale-110"
                : "bg-white/10 text-white/60 group-hover:bg-white/15 group-hover:text-white/80"
            )}>
              B
            </div>
            <span className={cn(
              "text-[0.55rem] font-semibold tracking-wider uppercase transition-colors",
              placementMode === 'B' ? "text-blue-400" : "text-white/40 group-hover:text-white/60"
            )}>
              Site B
            </span>
            {placementMode === 'B' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>

          {/* Divider */}
          <div className="w-px bg-white/[0.06] my-2" />

          {/* Analyze - central hero button */}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isPending || !hasBothPoints}
            className={cn(
              "flex-[1.3] flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 transition-all duration-200 relative group",
              hasBothPoints && !isPending
                ? "hover:bg-primary/10 active:bg-primary/15"
                : "opacity-30 pointer-events-none"
            )}
            aria-label="Analyze Link"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
              hasBothPoints && !isPending
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 group-active:scale-95"
                : "bg-white/10 text-white/30"
            )}>
              <Zap className="h-4 w-4" />
            </div>
            <span className={cn(
              "text-[0.55rem] font-semibold tracking-wider uppercase",
              hasBothPoints && !isPending ? "text-primary/80 group-hover:text-primary" : "text-white/25"
            )}>
              Analyze
            </span>
          </button>

          {/* Divider */}
          <div className="w-px bg-white/[0.06] my-2" />

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            disabled={isPending}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 transition-all duration-200 group",
              "hover:bg-white/[0.06] active:bg-white/[0.1]",
              isPending && "opacity-40 pointer-events-none"
            )}
            aria-label="Analysis Settings"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-all">
              <Settings className="h-3.5 w-3.5 text-white/60 group-hover:text-white/80" />
            </div>
            <span className="text-[0.55rem] font-semibold tracking-wider uppercase text-white/40 group-hover:text-white/60">
              Settings
            </span>
          </button>

          {/* Clear - only visible when points exist */}
          {hasAnyPoints && (
            <>
              <div className="w-px bg-white/[0.06] my-2" />
              <button
                type="button"
                onClick={onClearMap}
                disabled={isPending}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 transition-all duration-200 group",
                  "hover:bg-red-500/10 active:bg-red-500/15",
                  isPending && "opacity-40 pointer-events-none"
                )}
                aria-label="Clear map and reset"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-red-500/15 transition-all">
                  <Trash2 className="h-3.5 w-3.5 text-white/60 group-hover:text-red-400" />
                </div>
                <span className="text-[0.55rem] font-semibold tracking-wider uppercase text-white/40 group-hover:text-red-400/80">
                  Clear
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ─── Placement Mode Indicator ─── */}
      {placementMode && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 print:hidden animate-in fade-in slide-in-from-bottom-2">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl border backdrop-blur-xl",
            placementMode === 'A'
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
              : "bg-blue-950/80 border-blue-500/30 text-blue-300"
          )}>
            <Crosshair className="h-3.5 w-3.5 animate-pulse" />
            <span className="text-xs font-semibold">Tap map to place Site {placementMode}</span>
          </div>
        </div>
      )}
    </>
  );
});

export default MapToolbar;
