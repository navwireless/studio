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
export type ReportFormat = 'pdf' | 'docx';

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