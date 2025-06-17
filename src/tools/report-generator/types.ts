// src/tools/report-generator/types.ts

// Currently, we can reuse AnalysisResult from '@/types'
// This file can be expanded if report-specific types are needed,
// for example, configuration options for reports.

export interface ReportGenerationOptions {
  companyName?: string;
  reportTitle?: string;
  includeProfileChart?: boolean; // Placeholder for future chart inclusion
  logoUrl?: string; // URL for the company logo
  logoImageBytes?: Uint8Array; // Directly pass logo bytes if already fetched
}

// Possible formats for the report
export type ReportFormat = 'pdf' | 'docx';
