// src/tools/report-generator/types.ts

export interface ReportGenerationOptions {
  /** Company name to display in header/footer */
  companyName?: string;
  /** Report title in header */
  reportTitle?: string;
  /** Include elevation profile chart in PDF */
  includeProfileChart?: boolean;
  /** Include static map image in PDF */
  includeStaticMap?: boolean;
  /** URL for the company logo (PNG) */
  logoUrl?: string | null;
  /** Pre-fetched logo image bytes (skip fetch if provided) */
  logoImageBytes?: Uint8Array;
  /** Google Maps API key for static map (server-side) */
  mapsApiKey?: string | null;
  /** Map type for static map image */
  mapType?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
  /** Export configuration from the config modal */
  exportConfig?: ExportConfig;
  /** Report ID (generated at download time) */
  reportId?: string;
  /** User display name (for report ID generation) */
  userName?: string;
}

/** Combined report options — extends base with combined-specific fields */
export interface CombinedReportOptions extends ReportGenerationOptions {
  /** Maximum number of links to include detail pages for (default: 15) */
  maxDetailPages?: number;
  /** Include per-link elevation charts in detail pages */
  includeDetailCharts?: boolean;
  /** Include per-link static maps in detail pages */
  includeDetailMaps?: boolean;
}

/** Report output format */
export type ReportFormat = 'pdf' | 'docx' | 'xlsx' | 'kmz';

/** Metadata returned alongside generated report bytes */
export interface ReportMetadata {
  /** Suggested filename for download */
  fileName: string;
  /** MIME type of the generated file */
  mimeType: string;
  /** Number of pages in the report */
  pageCount: number;
  /** Generation timestamp (ISO string) */
  generatedAt: string;
}

/** Export configuration — controls what goes into generated reports */
export interface ExportConfig {
  // ── Header / Client Fields ──
  /** Custom report title */
  reportTitle: string;
  /** Client or recipient name (optional — shown on report header) */
  clientName: string;
  /** Project name (optional — shown on report header) */
  projectName: string;
  /** Person who prepared the report (auto-filled from session) */
  preparedBy: string;
  /** Reference / PO number (optional) */
  referenceNumber: string;
  /** Report date (ISO string) */
  date: string;

  // ── Content Toggles ──
  /** Include elevation profile chart */
  includeElevationChart: boolean;
  /** Include static satellite map image */
  includeStaticMap: boolean;
  /** Include device specifications and compatibility data */
  includeDeviceSpecs: boolean;
  /** Include detailed per-link analysis (vs summary only) */
  includeDetailedAnalysis: boolean;
  /** Include narrative prose description */
  includeNarrative: boolean;
  /** Free-form notes appended to report */
  additionalNotes: string;

  // ── Bulk/Combined Report Toggles ──
  /** Include individual detail page per link (combined reports) */
  includeIndividualLinkDetails: boolean;
  /** Include overview statistics section (combined reports) */
  includeOverviewStats: boolean;
}

/** Default export configuration */
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  reportTitle: '',
  clientName: '',
  projectName: '',
  preparedBy: '',
  referenceNumber: '',
  date: new Date().toISOString(),
  includeElevationChart: true,
  includeStaticMap: true,
  includeDeviceSpecs: true,
  includeDetailedAnalysis: true,
  includeNarrative: false,
  additionalNotes: '',
  includeIndividualLinkDetails: true,
  includeOverviewStats: true,
};

/** Keys persisted to localStorage between sessions */
export const PERSISTED_EXPORT_CONFIG_KEYS: (keyof ExportConfig)[] = [
  'includeElevationChart',
  'includeStaticMap',
  'includeDeviceSpecs',
  'includeDetailedAnalysis',
  'includeNarrative',
  'includeIndividualLinkDetails',
  'includeOverviewStats',
];