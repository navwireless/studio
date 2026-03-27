// src/hooks/use-pdf-download.ts
'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';

export interface UsePdfDownloadReturn {
  isGeneratingPdf: boolean;
  handleDownloadPdf: (
    analysisResult: AnalysisResult | null,
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    fiberResult?: FiberPathResult | null,
  ) => Promise<void>;
}

export function usePdfDownload(): UsePdfDownloadReturn {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async (
    analysisResult: AnalysisResult | null,
    toast: (opts: {
      title: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void,
    fiberResult?: FiberPathResult | null,
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
    try {
      const [{ saveAs }, { generateSingleAnalysisPdfReportAction }] =
        await Promise.all([
          import('file-saver'),
          import('@/app/actions'),
        ]);

      const response = await generateSingleAnalysisPdfReportAction(
        analysisResult,
        {},             // reportOptions — use defaults
        fiberResult,    // ← CHANGED: pass fiber result for inclusion in PDF
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
    }
  };

  return {
    isGeneratingPdf,
    handleDownloadPdf,
  };
}