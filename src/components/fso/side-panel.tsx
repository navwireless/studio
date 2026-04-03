"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { AnalysisResult, SavedLink, PlacementMode } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import type { FlowState } from '@/hooks/use-flow-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { timeAgo } from '@/hooks/use-saved-links';

// New flow-based components
import { StepIndicator } from './step-indicator';
import { SiteInputCard } from './site-input-card';
import { ConfigSection } from './config-section';
import { AnalysisButton } from './analysis-button';
import { ResultsCard } from './results-card';
import { DownloadMenu } from './download-menu';

import {
  X, Save, Plus,
  ChevronDown, ChevronRight,
  BookmarkPlus, History,
  Check, CheckCircle, XCircle, Cable,
  Globe2,
} from 'lucide-react';


// ═══════════════════════════════════════════════════════
// Collapsible Section (for Saved Links / History only)
// ═══════════════════════════════════════════════════════
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-surface-border">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'w-full flex items-center gap-2 px-4 py-3',
          'hover:bg-surface-overlay transition-colors text-left touch-manipulation',
        )}
      >
        <span className="text-text-brand-muted">{icon}</span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-text-brand-secondary flex-1">
          {title}
        </span>
        {badge}
        {open ? (
          <ChevronDown className="h-3 w-3 text-text-brand-muted" />
        ) : (
          <ChevronRight className="h-3 w-3 text-text-brand-muted" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 pb-3 pt-1">{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Saved Link Card
// ═══════════════════════════════════════════════════════
interface SavedLinkCardProps {
  link: SavedLink;
  isSelected: boolean;
  isSelectionMode: boolean;
  onLoad: () => void;
  onDelete: () => void;
  onToggleSelect: () => void;
}

function SavedLinkCard({
  link,
  isSelected,
  isSelectionMode,
  onLoad,
  onDelete,
  onToggleSelect,
}: SavedLinkCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  return (
    <div
      onClick={isSelectionMode ? onToggleSelect : onLoad}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={cn(
        'group relative flex items-center gap-2 p-2.5 rounded-lg border transition-all cursor-pointer touch-manipulation',
        isSelected
          ? 'border-brand-500/50 bg-brand-500/5'
          : 'border-surface-border hover:border-surface-border-light hover:bg-surface-overlay'
      )}
    >
      {isSelectionMode && (
        <div
          className={cn(
            'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
            isSelected
              ? 'bg-brand-500 border-brand-500'
              : 'border-surface-border-light'
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
      )}
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: link.color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-brand-primary truncate">
            {link.name}
          </span>
          <span
            className={cn(
              'text-[0.5rem] px-1 rounded font-bold flex-shrink-0',
              link.analysisResult.losPossible
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            )}
          >
            {link.analysisResult.losPossible ? '✓' : '✗'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[0.55rem] text-text-brand-muted">
            {link.analysisResult.distanceKm.toFixed(1)}km
          </span>
          <span className="text-[0.55rem] text-text-brand-muted">·</span>
          <span className="text-[0.55rem] text-text-brand-muted">
            {timeAgo(link.createdAt)}
          </span>
          {link.fiberPathResult?.status === 'success' && (
            <>
              <span className="text-[0.55rem] text-text-brand-muted">·</span>
              <span className="text-[0.55rem] text-cyan-400">
                <Cable className="h-2.5 w-2.5 inline mr-0.5" />
                {((link.fiberPathResult.totalDistanceMeters || 0) / 1000).toFixed(1)}km
              </span>
            </>
          )}
        </div>
      </div>
      {!isSelectionMode && showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-1.5 top-1.5 p-1.5 rounded-md bg-danger-bg hover:bg-red-500/20 text-red-400 transition-colors touch-manipulation"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// History Card
// ═══════════════════════════════════════════════════════
interface HistoryCardProps {
  item: AnalysisResult;
  onLoad: () => void;
}

function HistoryCard({ item, onLoad }: HistoryCardProps) {
  const ago = timeAgo(item.timestamp);
  return (
    <div
      onClick={onLoad}
      className={cn(
        'flex items-center gap-2 p-2.5 rounded-lg border',
        'border-surface-border hover:border-surface-border-light hover:bg-surface-overlay',
        'transition-all cursor-pointer touch-manipulation',
      )}
    >
      <div
        className={cn(
          'w-1 self-stretch rounded-full flex-shrink-0',
          item.losPossible ? 'bg-emerald-500' : 'bg-red-500'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-brand-primary truncate">
            {item.pointA.name || 'Site A'} → {item.pointB.name || 'Site B'}
          </span>
          <span
            className={cn(
              'text-[0.5rem] px-1 rounded font-bold flex-shrink-0',
              item.losPossible
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            )}
          >
            {item.losPossible ? (
              <CheckCircle className="h-2.5 w-2.5 inline" />
            ) : (
              <XCircle className="h-2.5 w-2.5 inline" />
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[0.55rem] text-text-brand-muted">
            {item.distanceKm.toFixed(2)}km
          </span>
          <span className="text-[0.55rem] text-text-brand-muted">·</span>
          <span className="text-[0.55rem] text-text-brand-muted">{ago}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Side Panel Props
// ═══════════════════════════════════════════════════════
export interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;

  // Flow state
  flow: FlowState;

  // Site A data
  siteAName: string;
  siteALat: string;
  siteALng: string;
  siteATowerHeight: number;
  onSiteATowerHeightChange: (height: number) => void;
  onClearSiteA: () => void;

  // Site B data
  siteBName: string;
  siteBLat: string;
  siteBLng: string;
  siteBTowerHeight: number;
  onSiteBTowerHeightChange: (height: number) => void;
  onClearSiteB: () => void;

  // Placement
  placementMode: PlacementMode;
  onSetPlacementMode: (mode: PlacementMode) => void;

  // Config
  clearanceThreshold: number;
  onClearanceThresholdChange: (value: number) => void;
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string | null) => void;
  currentDistanceKm: number | null;

  // Analysis
  onAnalyze: () => void;
  isActionPending: boolean;
  analysisResult: AnalysisResult | null;
  isStale: boolean;
  creditsRemaining: number;

  // Results helpers
  fiberPathResult: FiberPathResult | null;
  isFiberCalculating: boolean;
  fiberPathError: string | null;
  renderChart?: () => React.ReactNode;

  // Actions
  onSaveLink: () => void;
  onNewLink: () => void;

  // Downloads
  onDownloadPdf: () => void;
  onDownloadCombinedPdf: (links: SavedLink[]) => void;
  onExportKmz: (links: SavedLink[]) => Promise<void>;
  onExportExcel: (links: SavedLink[]) => Promise<void>;
  onExportCsv: (links: SavedLink[]) => Promise<void>;
  onShareWhatsApp: () => void;
  isDownloading: boolean;
  downloadingType: string | null;

  // Saved links
  savedLinks: SavedLink[];
  onLoadSavedLink: (link: SavedLink) => void;
  onDeleteSavedLink: (id: string) => void;
  onDeleteMultipleSavedLinks: (ids: string[]) => void;
  onClearAllSavedLinks: () => void;
  selectedLinkIds: string[];
  onToggleLinkSelection: (id: string) => void;
  onSelectAllLinks: () => void;
  onDeselectAllLinks: () => void;
  isSelectionMode: boolean;
  onSetSelectionMode: (mode: boolean) => void;

  // History
  historyList: AnalysisResult[];
  onLoadHistoryItem: (id: string) => void;
  onClearHistory: () => void;

  // Search
  onSearchNavigate?: (lat: number, lng: number, name: string) => void;
}

// ═══════════════════════════════════════════════════════
// Main Side Panel
// ═══════════════════════════════════════════════════════
export default function SidePanel({
  isOpen,
  onClose,
  flow,
  siteAName,
  siteALat,
  siteALng,
  siteATowerHeight,
  onSiteATowerHeightChange,
  onClearSiteA,
  siteBName,
  siteBLat,
  siteBLng,
  siteBTowerHeight,
  onSiteBTowerHeightChange,
  onClearSiteB,
  placementMode,
  onSetPlacementMode,
  clearanceThreshold,
  onClearanceThresholdChange,
  selectedDeviceId,
  onSelectDevice,
  currentDistanceKm,
  onAnalyze,
  isActionPending,
  analysisResult,
  isStale,
  creditsRemaining,
  fiberPathResult,
  isFiberCalculating,
  fiberPathError,
  renderChart,
  onSaveLink,
  onNewLink,
  onDownloadPdf,
  onDownloadCombinedPdf,
  onExportKmz,
  onExportExcel,
  onExportCsv,
  onShareWhatsApp,
  isDownloading,
  downloadingType,
  savedLinks,
  onLoadSavedLink,
  onDeleteSavedLink,
  onDeleteMultipleSavedLinks,
  onClearAllSavedLinks,
  selectedLinkIds,
  onToggleLinkSelection,
  onSelectAllLinks,
  onDeselectAllLinks,
  isSelectionMode,
  onSetSelectionMode,
  historyList,
  onLoadHistoryItem,
  onClearHistory,
}: SidePanelProps) {
  const anyPending = isActionPending || isFiberCalculating || isDownloading;
  const sortedHistory = useMemo(
    () => [...historyList].sort((a, b) => b.timestamp - a.timestamp),
    [historyList]
  );



  // ── Swipe-to-close gesture (mobile) ──
  const panelRef = useRef<HTMLElement>(null);
  const swipeState = useRef<{
    startX: number;
    startY: number;
    currentX: number;
    decided: boolean;
    isSwipe: boolean;
  } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeAnimating, setIsSwipeAnimating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSwipeOffset(0);
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      swipeState.current = {
        startX: t.clientX,
        startY: t.clientY,
        currentX: t.clientX,
        decided: false,
        isSwipe: false,
      };
    };
    const onTouchMove = (e: TouchEvent) => {
      const s = swipeState.current;
      if (!s || e.touches.length !== 1) return;
      const t = e.touches[0];
      s.currentX = t.clientX;
      if (!s.decided) {
        const dx = Math.abs(t.clientX - s.startX);
        const dy = Math.abs(t.clientY - s.startY);
        if (dx > 10 || dy > 10) {
          s.decided = true;
          s.isSwipe = dx > dy;
        }
        return;
      }
      if (!s.isSwipe) return;
      const dx = t.clientX - s.startX;
      if (dx < 0) {
        e.preventDefault();
        setSwipeOffset(dx);
      }
    };
    const onTouchEnd = () => {
      const s = swipeState.current;
      if (!s || !s.isSwipe) {
        swipeState.current = null;
        setSwipeOffset(0);
        return;
      }
      const dx = s.currentX - s.startX;
      if (dx < -80) {
        setIsSwipeAnimating(true);
        setSwipeOffset(-340);
        setTimeout(() => {
          onClose();
          setSwipeOffset(0);
          setIsSwipeAnimating(false);
        }, 250);
      } else {
        setIsSwipeAnimating(true);
        setSwipeOffset(0);
        setTimeout(() => setIsSwipeAnimating(false), 250);
      }
      swipeState.current = null;
    };

    panel.addEventListener('touchstart', onTouchStart, { passive: true });
    panel.addEventListener('touchmove', onTouchMove, { passive: false });
    panel.addEventListener('touchend', onTouchEnd, { passive: true });
    panel.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      panel.removeEventListener('touchstart', onTouchStart);
      panel.removeEventListener('touchmove', onTouchMove);
      panel.removeEventListener('touchend', onTouchEnd);
      panel.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isOpen, onClose]);

  const swipeProgress = Math.min(1, Math.abs(swipeOffset) / 340);
  const backdropOpacity = isOpen ? 1 - swipeProgress * 0.8 : 0;

  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          style={{ opacity: backdropOpacity }}
          onClick={onClose}
        />
      )}

      <aside
        ref={panelRef}
        className={cn(
          'flex flex-col bg-surface-card border-r border-surface-border z-50',
          // Desktop: static sidebar
          'lg:relative lg:w-[340px] lg:flex-shrink-0 lg:translate-x-0 lg:z-auto',
          // Mobile: slide-out panel
          'fixed inset-y-0 left-0 w-[340px]',
          !swipeOffset && !isSwipeAnimating
            ? 'transition-transform duration-300 ease-out'
            : '',
          isSwipeAnimating ? 'transition-transform duration-250 ease-out' : '',
          isOpen && !swipeOffset && !isSwipeAnimating ? 'translate-x-0' : '',
          !isOpen && !swipeOffset ? '-translate-x-full lg:translate-x-0' : '',
          'pt-safe pl-safe'
        )}
        style={
          swipeOffset
            ? { transform: `translateX(${swipeOffset}px)` }
            : undefined
        }
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <svg
                className="h-4 w-4 text-brand-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-brand-primary leading-none">
                Link Analysis
              </h2>
              <p className="text-[0.6rem] text-text-brand-muted">
                LOS Feasibility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-surface-overlay text-text-brand-muted touch-manipulation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search removed — using floating map search bar instead */}

        {/* ── Step Indicator ── */}
        <div className="px-4 border-b border-surface-border">
          <StepIndicator currentStep={flow.currentStep} />
        </div>

        {/* ── Scrollable Content ── */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden pb-safe"
          style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
        >
          {/* ① SITES — Always visible */}
          <div data-tour="site-cards" className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-text-brand-muted">
                Sites
              </span>
            </div>

            <SiteInputCard
              site="A"
              label={siteAName || 'Site A'}
              siteName={siteAName}
              lat={siteALat}
              lng={siteALng}
              towerHeight={siteATowerHeight}
              onTowerHeightChange={onSiteATowerHeightChange}
              onClear={onClearSiteA}
              onActivatePlacement={() =>
                onSetPlacementMode(placementMode === 'A' ? null : 'A')
              }
              onCancelPlacement={() => onSetPlacementMode(null)}
              isPlacementActive={placementMode === 'A'}
              isPlaced={flow.siteAPlaced}
              disabled={anyPending}
            />

            <SiteInputCard
              site="B"
              label={siteBName || 'Site B'}
              siteName={siteBName}
              lat={siteBLat}
              lng={siteBLng}
              towerHeight={siteBTowerHeight}
              onTowerHeightChange={onSiteBTowerHeightChange}
              onClear={onClearSiteB}
              onActivatePlacement={() =>
                onSetPlacementMode(placementMode === 'B' ? null : 'B')
              }
              onCancelPlacement={() => onSetPlacementMode(null)}
              isPlacementActive={placementMode === 'B'}
              isPlaced={flow.siteBPlaced}
              disabled={anyPending}
            />
          </div>

          {/* ② CONFIGURE — Visible when both sites placed */}
          {flow.bothSitesPlaced && (
            <div className="px-4 pb-3 border-t border-surface-border pt-3">
              <ConfigSection
                clearanceThreshold={clearanceThreshold}
                onClearanceThresholdChange={onClearanceThresholdChange}
                selectedDeviceId={selectedDeviceId}
                onSelectDevice={onSelectDevice}
                currentDistanceKm={currentDistanceKm}
                hasAnalysisResult={!!analysisResult}
                disabled={anyPending}
              />
            </div>
          )}

          {/* ⚡ ANALYZE BUTTON — Visible when both sites placed */}
          {flow.bothSitesPlaced && (
            <div className="px-4">
              <AnalysisButton
                canAnalyze={flow.canAnalyze}
                isAnalyzing={isActionPending}
                isStale={isStale}
                hasResults={flow.hasResults}
                creditsRemaining={creditsRemaining}
                onClick={onAnalyze}
                disabled={isFiberCalculating || isDownloading}
              />
            </div>
          )}

          {/* ③ RESULTS — Visible after analysis */}
          {analysisResult && !isStale && (
            <div className="px-4 pb-3 border-t border-surface-border pt-3">
              <ResultsCard
                result={analysisResult}
                clearanceThreshold={clearanceThreshold}
                fiberPathResult={fiberPathResult}
                isFiberCalculating={isFiberCalculating}
                fiberPathError={fiberPathError}
                renderChart={renderChart}
              />

              {/* Action buttons */}
              <div className="mt-3 space-y-2">
                {/* Download Menu */}
                <DownloadMenu
                  analysisResult={analysisResult}
                  savedLinks={savedLinks}
                  onDownloadPdf={onDownloadPdf}
                  onDownloadCombinedPdf={onDownloadCombinedPdf}
                  onExportKmz={onExportKmz}
                  onExportExcel={onExportExcel}
                  onExportCsv={onExportCsv}
                  onShareWhatsApp={onShareWhatsApp}
                  isDownloading={isDownloading}
                  downloadingType={downloadingType}
                  canDownloadSingle={flow.canDownload}
                  disabled={anyPending}
                />

                {/* Save + New Link row */}
                <div className="flex gap-2">
                  <Button
                    onClick={onSaveLink}
                    disabled={anyPending}
                    size="sm"
                    variant="outline"
                    className={cn(
                      'flex-1 h-9 text-xs',
                      'border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-400',
                      'touch-manipulation',
                    )}
                  >
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Save Link
                  </Button>
                  <Button
                    onClick={onNewLink}
                    disabled={anyPending}
                    size="sm"
                    variant="outline"
                    className={cn(
                      'flex-1 h-9 text-xs',
                      'border-surface-border-light hover:bg-brand-500/5 hover:border-brand-500/30',
                      'text-text-brand-muted hover:text-text-brand-primary',
                      'touch-manipulation',
                    )}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> New Link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Analyzing spinner (when pending with no result yet) ── */}
          {isActionPending && !analysisResult && (
            <div className="px-4 py-6 flex flex-col items-center gap-2 text-text-brand-muted border-t border-surface-border">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <span className="text-xs">Analyzing...</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              SECONDARY SECTIONS (collapsible)
              ═══════════════════════════════════════════ */}

          {/* ── SAVED LINKS ── */}
          <CollapsibleSection
            title="Saved Links"
            icon={<BookmarkPlus className="h-3.5 w-3.5" />}
            defaultOpen={false}
            badge={
              savedLinks.length > 0 ? (
                <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-surface-overlay text-text-brand-secondary tabular-nums">
                  {savedLinks.length}
                </span>
              ) : undefined
            }
          >
            {savedLinks.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-brand-muted">
                <BookmarkPlus className="h-8 w-8 mx-auto mb-2 text-text-brand-disabled" />
                <p className="font-medium">No saved links yet</p>
                <p className="text-[0.6rem] mt-1 text-text-brand-disabled">
                  Analyze a link, then click{' '}
                  <span className="text-emerald-400">Save Link</span> in
                  Results.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Selection controls */}
                <div className="flex items-center gap-1.5 pb-1">
                  <button
                    onClick={() => onSetSelectionMode(!isSelectionMode)}
                    className={cn(
                      'text-[0.6rem] px-2.5 py-1.5 rounded-md transition-colors font-medium touch-manipulation',
                      isSelectionMode
                        ? 'bg-brand-500/20 text-brand-400'
                        : 'text-text-brand-muted hover:text-text-brand-primary hover:bg-surface-overlay'
                    )}
                  >
                    {isSelectionMode ? 'Done' : 'Select'}
                  </button>
                  {isSelectionMode && (
                    <>
                      <button
                        onClick={
                          selectedLinkIds.length === savedLinks.length
                            ? onDeselectAllLinks
                            : onSelectAllLinks
                        }
                        className="text-[0.6rem] px-2.5 py-1.5 rounded-md text-text-brand-muted hover:text-text-brand-primary hover:bg-surface-overlay font-medium touch-manipulation"
                      >
                        {selectedLinkIds.length === savedLinks.length
                          ? 'None'
                          : 'All'}
                      </button>
                      {selectedLinkIds.length > 0 && (
                        <button
                          onClick={() => {
                            onDeleteMultipleSavedLinks(selectedLinkIds);
                            onSetSelectionMode(false);
                          }}
                          className="text-[0.6rem] px-2.5 py-1.5 rounded-md text-red-400 hover:bg-danger-bg font-medium ml-auto touch-manipulation"
                        >
                          Delete ({selectedLinkIds.length})
                        </button>
                      )}
                    </>
                  )}
                  {!isSelectionMode && (
                    <>
                      <button
                        onClick={() => window.open('/globe', '_blank')}
                        className="text-[0.6rem] px-2.5 py-1.5 rounded-md text-blue-400/80 hover:text-blue-400 hover:bg-blue-500/10 font-medium touch-manipulation flex items-center gap-1"
                        title="Open 3D Globe View"
                      >
                        <Globe2 className="h-3 w-3" />
                        Globe
                      </button>
                      <button
                        onClick={onClearAllSavedLinks}
                        className="text-[0.6rem] px-2.5 py-1.5 rounded-md text-red-400/60 hover:text-red-400 hover:bg-danger-bg font-medium ml-auto touch-manipulation"
                      >
                        Clear All
                      </button>
                    </>
                  )}
                </div>

                {/* Link list */}
                <div
                  className="space-y-1.5 max-h-[300px] overflow-y-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {savedLinks.map((link) => (
                    <SavedLinkCard
                      key={link.id}
                      link={link}
                      isSelected={selectedLinkIds.includes(link.id)}
                      isSelectionMode={isSelectionMode}
                      onLoad={() => onLoadSavedLink(link)}
                      onDelete={() => onDeleteSavedLink(link.id)}
                      onToggleSelect={() => onToggleLinkSelection(link.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CollapsibleSection>

          {/* ── HISTORY ── */}
          <CollapsibleSection
            title="History"
            icon={<History className="h-3.5 w-3.5" />}
            defaultOpen={false}
            badge={
              sortedHistory.length > 0 ? (
                <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full bg-surface-overlay text-text-brand-secondary tabular-nums">
                  {sortedHistory.length}
                </span>
              ) : undefined
            }
          >
            {sortedHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-brand-muted">
                <History className="h-8 w-8 mx-auto mb-2 text-text-brand-disabled" />
                <p className="font-medium">No analyses yet</p>
                <p className="text-[0.6rem] mt-1 text-text-brand-disabled">
                  Complete an analysis to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className="space-y-1.5 max-h-[300px] overflow-y-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {sortedHistory.map((item) => (
                    <HistoryCard
                      key={item.id}
                      item={item}
                      onLoad={() => {
                        onLoadHistoryItem(item.id);
                        if (
                          typeof window !== 'undefined' &&
                          window.innerWidth < 1024
                        ) {
                          onClose();
                        }
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={onClearHistory}
                  className="w-full text-[0.6rem] px-2 py-2 rounded-md text-red-400/60 hover:text-red-400 hover:bg-danger-bg font-medium transition-colors touch-manipulation"
                >
                  Clear All History
                </button>
              </div>
            )}
          </CollapsibleSection>
        </div>
      </aside>
    </>
  );
}