// src/hooks/use-pdf-download.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import type { AnalysisResult, SavedLink } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import type { ExportConfig } from '@/tools/report-generator/types';

export interface UsePdfDownloadReturn {
  /** Whether a PDF is currently being generated */
  isGeneratingPdf: boolean;
  /** Whether the single-report export config modal is open */
  isExportModalOpen: boolean;
  /** Open the single-report export config modal */
  openExportModal: () => void;
  /** Close the single-report export config modal */
  closeExportModal: () => void;
  /** Whether the combined-report export config modal is open */
  isCombinedExportModalOpen: boolean;
  /** Open the combined-report export config modal */
  openCombinedExportModal: () => void;
  /** Close the combined-report export config modal */
  closeCombinedExportModal: () => void;
  /** Direct download (bypasses modal — used when config is already available) */
  handleDownloadPdf: (
    analysisResult: AnalysisResult | null,
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    fiberResult?: FiberPathResult | null,
    exportConfig?: ExportConfig,
  ) => Promise<void>;
  /** Download single PDF with config from modal */
  handleDownloadWithConfig: (
    analysisResult: AnalysisResult | null,
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    config: ExportConfig,
    fiberResult?: FiberPathResult | null,
  ) => Promise<void>;
  /** Download combined PDF with config from modal */
  handleDownloadCombinedWithConfig: (
    links: SavedLink[],
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    config: ExportConfig,
  ) => Promise<void>;
  /** Session-scoped report sequence counter (increments each download) */
  reportSequence: number;
}

/**
 * Hook for managing PDF report downloads with optional export config modal.
 *
 * Tracks a session-scoped sequence number for report ID generation (NN-hhmmddmmyy-CDD).
 * The sequence resets on page reload (session-scoped, not persisted).
 *
 * @returns Object with generation state, modal controls, and download handlers
 */
export function usePdfDownload(): UsePdfDownloadReturn {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCombinedExportModalOpen, setIsCombinedExportModalOpen] = useState(false);

  // Session-scoped sequence counter for report IDs
  const sequenceRef = useRef(0);
  const [reportSequence, setReportSequence] = useState(0);

  const openExportModal = useCallback(() => {
    setIsExportModalOpen(true);
  }, []);

  const closeExportModal = useCallback(() => {
    setIsExportModalOpen(false);
  }, []);

  const openCombinedExportModal = useCallback(() => {
    setIsCombinedExportModalOpen(true);
  }, []);

  const closeCombinedExportModal = useCallback(() => {
    setIsCombinedExportModalOpen(false);
  }, []);

  const performDownload = useCallback(async (
    analysisResult: AnalysisResult | null,
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    fiberResult?: FiberPathResult | null,
    exportConfig?: ExportConfig,
  ) => {
    if (!analysisResult) {
      toast({
        title: 'Error',
        description: 'No analysis data available to generate PDF.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingPdf(true);

    // Increment sequence for this download
    sequenceRef.current += 1;
    const currentSequence = sequenceRef.current;
    setReportSequence(currentSequence);

    try {
      const [{ saveAs }, { generateSingleAnalysisPdfReportAction }] =
        await Promise.all([
          import('file-saver'),
          import('@/app/actions'),
        ]);

      // Build report options with export config and sequence number
      const reportOptions: Record<string, unknown> = {};
      if (exportConfig) {
        reportOptions.exportConfig = exportConfig;
      }
      // Pass sequence number so server can generate report ID if needed
      reportOptions.reportSequence = currentSequence;

      const response = await generateSingleAnalysisPdfReportAction(
        analysisResult,
        reportOptions,
        fiberResult,
      );

      if (response.success) {
        const { base64Pdf, fileName } = response.data;
        const byteCharacters = atob(base64Pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        saveAs(blob, fileName);
        toast({
          title: 'Success',
          description: 'PDF report downloaded.',
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error generating PDF.';
      console.error('PDF Generation Error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPdf(false);
      setIsExportModalOpen(false);
    }
  }, []);

  const handleDownloadPdf = useCallback(async (
    analysisResult: AnalysisResult | null,
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    fiberResult?: FiberPathResult | null,
    exportConfig?: ExportConfig,
  ) => {
    await performDownload(analysisResult, toast, fiberResult, exportConfig);
  }, [performDownload]);

  const handleDownloadWithConfig = useCallback(async (
    analysisResult: AnalysisResult | null,
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    config: ExportConfig,
    fiberResult?: FiberPathResult | null,
  ) => {
    await performDownload(analysisResult, toast, fiberResult, config);
  }, [performDownload]);

  const handleDownloadCombinedWithConfig = useCallback(async (
    links: SavedLink[],
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    config: ExportConfig,
  ) => {
    if (!links.length) {
      toast({
        title: 'Error',
        description: 'No links to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingPdf(true);

    // Increment sequence for this download
    sequenceRef.current += 1;
    const currentSequence = sequenceRef.current;
    setReportSequence(currentSequence);

    try {
      const { generateCombinedPdfReportAction } = await import('@/app/actions');

      const MAX_DETAIL_LINKS = 15;
      const linksForExport = links.length <= MAX_DETAIL_LINKS
        ? links
        : links.map(l => ({
          ...l,
          analysisResult: { ...l.analysisResult, profile: [] },
        }));

      const reportOptions = {
        exportConfig: config,
        reportSequence: currentSequence,
      };

      const result = await generateCombinedPdfReportAction(
        JSON.stringify(linksForExport),
        JSON.stringify(reportOptions),
      );

      if (result.success) {
        const { base64Pdf, fileName } = result.data;
        const byteCharacters = atob(base64Pdf);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        const { saveAs } = await import('file-saver');
        saveAs(blob, fileName);

        toast({
          title: 'Combined PDF Exported',
          description: `${links.length} link(s) exported to PDF report.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown error generating combined PDF.';
      console.error('Combined PDF Generation Error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPdf(false);
      setIsCombinedExportModalOpen(false);
    }
  }, []);

  return {
    isGeneratingPdf,
    isExportModalOpen,
    openExportModal,
    closeExportModal,
    isCombinedExportModalOpen,
    openCombinedExportModal,
    closeCombinedExportModal,
    handleDownloadPdf,
    handleDownloadWithConfig,
    handleDownloadCombinedWithConfig,
    reportSequence,
  };
}