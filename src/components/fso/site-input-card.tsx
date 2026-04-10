"use client";

import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { MapPin, Crosshair, Trash2, Pencil, Check, X } from 'lucide-react';

// ============================================
// Props
// ============================================

export interface SiteInputCardProps {
  /** Which site this card represents */
  site: 'A' | 'B';
  /** Display label */
  label: string;
  /** Site / place name (from form or geocode) */
  siteName: string | null;
  /** Latitude string from form */
  lat: string | null;
  /** Longitude string from form */
  lng: string | null;
  /** Tower height in meters */
  towerHeight: number;
  /** Callback when tower height changes */
  onTowerHeightChange: (height: number) => void;
  /** Callback when site name changes */
  onNameChange?: (name: string) => void;
  /** Callback to clear this site's data */
  onClear: () => void;
  /** Callback when user clicks "Place on Map" — activates placement mode */
  onActivatePlacement: () => void;
  /** Callback to cancel placement mode */
  onCancelPlacement: () => void;
  /** Whether placement mode is active for THIS site */
  isPlacementActive: boolean;
  /** Whether this site has valid coordinates */
  isPlaced: boolean;
  /** Whether any action is pending (disables interactions) */
  disabled?: boolean;
}

// ============================================
// Constants
// ============================================

const SITE_STYLES = {
  A: {
    accentColor: 'border-l-emerald-500',
    activeBorder: 'border-emerald-500/50',
    activeBg: 'bg-emerald-500/5',
    activeGlow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    placeBtnActive: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    emptyBorder: 'border-dashed border-surface-border-light',
  },
  B: {
    accentColor: 'border-l-cyan-500',
    activeBorder: 'border-cyan-500/50',
    activeBg: 'bg-cyan-500/5',
    activeGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-400',
    placeBtnActive: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    emptyBorder: 'border-dashed border-surface-border-light',
  },
} as const;

const TOWER_HEIGHT_TOOLTIP =
  'Height of the antenna or equipment mounting point above ground level, in meters. Higher towers improve line-of-sight clearance over terrain.';

// ============================================
// Component
// ============================================

/**
 * Site input card with three visual states:
 * - EMPTY: dashed border, prompt to place on map
 * - ACTIVE: glowing border with pulse, "click map to place" message
 * - FILLED: solid border with accent, name, coordinates, tower height control
 */
export function SiteInputCard({
  site,
  label,
  siteName,
  lat,
  lng,
  towerHeight,
  onTowerHeightChange,
  onNameChange,
  onClear,
  onActivatePlacement,
  onCancelPlacement,
  isPlacementActive,
  isPlaced,
  disabled = false,
}: SiteInputCardProps) {
  const styles = SITE_STYLES[site];
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const handleTowerHeightInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0 && val <= 100) {
        onTowerHeightChange(Math.round(val));
      }
    },
    [onTowerHeightChange]
  );

  const handleTowerHeightBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      if (isNaN(val) || val < 0) {
        onTowerHeightChange(0);
      } else if (val > 100) {
        onTowerHeightChange(100);
      }
    },
    [onTowerHeightChange]
  );

  const handleStartEditName = useCallback(() => {
    setEditedName(siteName || `Site ${site}`);
    setIsEditingName(true);
  }, [siteName, site]);

  const handleSaveName = useCallback(() => {
    if (onNameChange && editedName.trim()) {
      onNameChange(editedName.trim());
    }
    setIsEditingName(false);
  }, [onNameChange, editedName]);

  const handleCancelEditName = useCallback(() => {
    setIsEditingName(false);
  }, []);

  // ── EMPTY STATE ──
  if (!isPlaced && !isPlacementActive) {
    return (
      <div
        className={cn(
          'rounded-lg border p-4 transition-all duration-300',
          styles.emptyBorder,
          'bg-surface-card/50 backdrop-blur-sm',
          'hover:bg-surface-card hover:shadow-md',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-black',
              styles.badgeBg,
              styles.badgeText,
            )}
          >
            {site}
          </div>
          <span className="text-sm font-semibold text-text-brand-secondary">{label}</span>
        </div>

        {/* Empty content */}
        <p className="text-xs text-text-brand-muted italic mb-3 pl-8">
          Click map or search to place {label}
        </p>

        {/* Place on Map button */}
        <button
          type="button"
          onClick={onActivatePlacement}
          disabled={disabled}
          className={cn(
            'ml-8 flex items-center gap-2 text-xs font-medium',
            'px-3 py-2 rounded-lg transition-all duration-200',
            'text-brand-400 hover:bg-brand-500/10 hover:text-brand-300 hover:scale-105',
            'active:scale-95',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
            'touch-manipulation',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <MapPin className="h-3.5 w-3.5" />
          Place on Map
        </button>
      </div>
    );
  }

  // ── ACTIVE STATE (placement mode on) ──
  if (isPlacementActive) {
    return (
      <div
        className={cn(
          'rounded-lg border p-3 transition-all duration-200',
          styles.activeBorder,
          styles.activeBg,
          styles.activeGlow,
          'animate-pulse-subtle',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-black',
                styles.badgeBg,
                styles.badgeText,
              )}
            >
              {site}
            </div>
            <span className="text-xs font-semibold text-text-brand-primary">{label}</span>
          </div>
          <button
            type="button"
            onClick={onCancelPlacement}
            className={cn(
              'text-[0.65rem] font-medium px-2 py-1 rounded-md',
              'text-text-brand-muted hover:text-text-brand-primary hover:bg-surface-overlay',
              'transition-colors duration-200 touch-manipulation',
            )}
          >
            Cancel
          </button>
        </div>

        {/* Active message */}
        <div className="flex items-center gap-2 mt-2.5 pl-7">
          <div className="h-2.5 w-2.5 rounded-full bg-current animate-pulse" />
          <span className="text-[0.7rem] text-text-brand-secondary">
            Click anywhere on the map to place
          </span>
        </div>
      </div>
    );
  }

  // ── FILLED STATE ──
  const displayName = siteName && siteName !== `Site ${site}` && siteName.trim() !== ''
    ? siteName
    : null;

  return (
    <div
      className={cn(
        'rounded-lg border border-l-[3px] p-4 transition-all duration-300',
        styles.accentColor,
        'border-surface-border bg-surface-elevated',
        'hover:shadow-lg hover:border-surface-border-light',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-black flex-shrink-0',
              styles.badgeBg,
              styles.badgeText,
            )}
          >
            {site}
          </div>
          {isEditingName ? (
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEditName();
                }}
                className="flex-1 min-w-0 text-sm px-2 py-0.5 rounded bg-surface-input border border-surface-border text-text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-500"
                autoFocus
                maxLength={40}
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={handleCancelEditName}
                className="p-1 rounded text-text-brand-muted hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 min-w-0 group/name">
              <span className="text-sm font-semibold text-text-brand-primary truncate">
                {displayName || label}
              </span>
              {onNameChange && (
                <button
                  type="button"
                  onClick={handleStartEditName}
                  disabled={disabled}
                  className="p-1 rounded text-text-brand-muted opacity-0 group-hover/name:opacity-100 hover:text-brand-400 transition-all touch-manipulation"
                  aria-label="Edit name"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className={cn(
            'p-2 rounded-lg transition-all duration-200 touch-manipulation flex-shrink-0',
            'text-text-brand-muted hover:text-destructive hover:bg-destructive/10 hover:scale-110',
            'active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          aria-label={`Clear ${label}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Coordinates */}
      <div className="mt-2 pl-8">
        <p className="text-xs font-mono text-text-brand-muted leading-none">
          {lat ? parseFloat(lat).toFixed(6) : '—'}, {lng ? parseFloat(lng).toFixed(6) : '—'}
        </p>
      </div>

      {/* Tower height */}
      <div className="mt-3 pl-8 flex items-center gap-2">
        <span className="text-xs text-text-brand-muted">Tower:</span>
        <input
          type="number"
          value={towerHeight}
          onChange={handleTowerHeightInput}
          onBlur={handleTowerHeightBlur}
          min={0}
          max={500}
          step={1}
          disabled={disabled}
          className={cn(
            'w-16 h-7 px-2 text-xs text-center font-medium rounded-lg',
            'bg-surface-card border border-surface-border',
            'text-text-brand-primary',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/40',
            'transition-all duration-200',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          aria-label={`${label} tower height in meters`}
        />
        <span className="text-xs text-text-brand-muted">m</span>
        <InfoTooltip text={TOWER_HEIGHT_TOOLTIP} side="right" />
      </div>

      {/* Reposition button */}
      <button
        type="button"
        onClick={onActivatePlacement}
        disabled={disabled}
        className={cn(
          'mt-3 ml-8 flex items-center gap-1.5 text-xs font-medium',
          'text-text-brand-muted hover:text-text-brand-secondary hover:scale-105',
          'active:scale-95',
          'transition-all duration-200 touch-manipulation',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <Crosshair className="h-3 w-3" />
        Reposition
      </button>
    </div>
  );
}

export default SiteInputCard;