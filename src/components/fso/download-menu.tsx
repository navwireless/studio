"use client";

import React, { useCallback } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import type { AnalysisResult, SavedLink } from '@/types';
import {
  Download,
  FileText,
  Globe,
  FileSpreadsheet,
  FileDown,
  Loader2,
  Share2,
} from 'lucide-react';

// ============================================
// Props
// ============================================

export interface DownloadMenuProps {
  /** Current analysis result (for single-link exports) */
  analysisResult: AnalysisResult | null;
  /** Saved links (for multi-link exports) */
  savedLinks: SavedLink[];
  /** Opens export config modal for single PDF */
  onDownloadPdf: () => void;
  /** Opens export config modal for combined PDF */
  onDownloadCombinedPdf: (links: SavedLink[]) => void;
  /** Direct KMZ download for single analysis */
  onDownloadKmz?: () => void;
  /** KMZ export for saved links */
  onExportKmz: (links: SavedLink[]) => Promise<void>;
  /** Excel export for saved links */
  onExportExcel: (links: SavedLink[]) => Promise<void>;
  /** CSV export for saved links */
  onExportCsv: (links: SavedLink[]) => Promise<void>;
  /** WhatsApp share trigger */
  onShareWhatsApp: () => void;
  /** Whether any download is in progress */
  isDownloading: boolean;
  /** Which download type is currently in progress */
  downloadingType: string | null;
  /** Whether results are available for single-link actions */
  canDownloadSingle: boolean;
  /** Whether the button should be disabled entirely */
  disabled?: boolean;
}

// ============================================
// Menu Item
// ============================================

interface MenuItemProps {
  icon: React.ReactNode;
  loadingIcon?: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

function MenuItem({
  icon,
  title,
  description,
  onClick,
  disabled,
  isLoading,
}: MenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      onClick={(e) => {
        if (disabled || isLoading) {
          e.preventDefault();
          return;
        }
        onClick();
      }}
      disabled={disabled || isLoading}
      className={cn(
        'flex items-start gap-3 px-3 py-2.5 rounded-md outline-none cursor-pointer',
        'transition-colors duration-150',
        'data-[highlighted]:bg-surface-overlay',
        'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none',
      )}
    >
      <div className="mt-0.5 flex-shrink-0">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
        ) : (
          icon
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-text-brand-primary">{title}</p>
        <p className="text-[0.6rem] text-text-brand-muted mt-0.5">
          {description}
        </p>
      </div>
    </DropdownMenuPrimitive.Item>
  );
}

// ============================================
// Main Component
// ============================================

export function DownloadMenu({
  savedLinks,
  onDownloadPdf,
  onDownloadCombinedPdf,
  onExportKmz,
  onExportExcel,
  onExportCsv,
  onShareWhatsApp,
  isDownloading,
  downloadingType,
  canDownloadSingle,
  disabled = false,
}: DownloadMenuProps) {
  const hasMultipleLinks = savedLinks.length > 0;

  const handleCombinedPdf = useCallback(() => {
    onDownloadCombinedPdf(savedLinks);
  }, [savedLinks, onDownloadCombinedPdf]);

  const handleCombinedKmz = useCallback(async () => {
    await onExportKmz(savedLinks);
  }, [savedLinks, onExportKmz]);

  const handleCombinedExcel = useCallback(async () => {
    await onExportExcel(savedLinks);
  }, [savedLinks, onExportExcel]);

  const handleCombinedCsv = useCallback(async () => {
    await onExportCsv(savedLinks);
  }, [savedLinks, onExportCsv]);

  return (
    <div data-tour="download-menu">
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <button
            type="button"
            disabled={disabled || (!canDownloadSingle && !hasMultipleLinks)}
            className={cn(
              'w-full h-10 rounded-lg flex items-center justify-center gap-2',
              'border border-surface-border-light',
              'text-xs font-semibold',
              'hover:bg-surface-overlay hover:border-brand-500/30',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500/50',
              'transition-all duration-200',
              'touch-manipulation',
              canDownloadSingle
                ? 'text-text-brand-primary'
                : 'text-text-brand-muted',
              (disabled || (!canDownloadSingle && !hasMultipleLinks)) &&
              'opacity-40 cursor-not-allowed',
            )}
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download Report
            <svg
              className="h-3 w-3 text-text-brand-muted"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 5l3 3 3-3" />
            </svg>
          </button>
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            side="top"
            sideOffset={4}
            align="center"
            className={cn(
              'z-[650] w-[var(--radix-dropdown-menu-trigger-width)]',
              'bg-surface-elevated border border-surface-border-light',
              'rounded-xl shadow-xl',
              'py-1',
              'animate-in fade-in-0 slide-in-from-bottom-2 duration-150',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2',
            )}
          >
            {/* ── SINGLE LINK section ── */}
            <div className="px-3 pt-2 pb-1">
              <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-text-brand-muted">
                Single Link
              </p>
            </div>

            <MenuItem
              icon={<FileText className="h-4 w-4 text-red-400" />}
              title="PDF Report"
              description="Professional PDF with maps and charts"
              onClick={onDownloadPdf}
              disabled={!canDownloadSingle}
              isLoading={downloadingType === 'pdf'}
            />

            {/* ── MULTI-LINK section ── */}
            {hasMultipleLinks && (
              <>
                <DropdownMenuPrimitive.Separator className="h-px bg-surface-border mx-2 my-1" />

                <div className="px-3 pt-2 pb-1">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-wider text-text-brand-muted">
                    All Saved Links ({savedLinks.length})
                  </p>
                </div>

                <MenuItem
                  icon={<FileText className="h-4 w-4 text-red-400" />}
                  title="Combined PDF Report"
                  description={`All ${savedLinks.length} saved link${savedLinks.length !== 1 ? 's' : ''} in one report`}
                  onClick={handleCombinedPdf}
                  disabled={isDownloading}
                  isLoading={downloadingType === 'combined-pdf'}
                />

                <MenuItem
                  icon={<Globe className="h-4 w-4 text-emerald-400" />}
                  title="KMZ File"
                  description="Google Earth format"
                  onClick={handleCombinedKmz}
                  disabled={isDownloading}
                  isLoading={downloadingType === 'kmz'}
                />

                <MenuItem
                  icon={<FileSpreadsheet className="h-4 w-4 text-green-400" />}
                  title="Excel Spreadsheet"
                  description="XLSX with all link data"
                  onClick={handleCombinedExcel}
                  disabled={isDownloading}
                  isLoading={downloadingType === 'excel'}
                />

                <MenuItem
                  icon={<FileDown className="h-4 w-4 text-blue-400" />}
                  title="CSV"
                  description="Plain data export"
                  onClick={handleCombinedCsv}
                  disabled={isDownloading}
                  isLoading={downloadingType === 'csv'}
                />
              </>
            )}

            {/* ── SHARE section ── */}
            <DropdownMenuPrimitive.Separator className="h-px bg-surface-border mx-2 my-1" />

            <MenuItem
              icon={<Share2 className="h-4 w-4 text-emerald-400" />}
              title="Share via WhatsApp"
              description="Download report & open WhatsApp"
              onClick={onShareWhatsApp}
              disabled={!canDownloadSingle || isDownloading}
              isLoading={downloadingType === 'whatsapp'}
            />
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
}

export default DownloadMenu;