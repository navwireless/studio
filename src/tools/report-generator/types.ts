// src/tools/report-generator/types.ts

// Currently, we can reuse AnalysisResult from '@/types'
// This file can be expanded if report-specific types are needed,
// for example, configuration options for reports.

export interface ReportGenerationOptions {
  companyName?: string;
  reportTitle?: string;
  includeProfileChart?: boolean; // Placeholder for future chart inclusion
  logoUrl?: string; // URL for the company logo
}

// Possible formats for the report
export type ReportFormat = 'pdf' | 'docx';
