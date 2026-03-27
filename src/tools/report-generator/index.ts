// src/tools/report-generator/index.ts
export { generatePdfReportForSingleAnalysis } from './generatePdfReport';
export { generatePdfReportForFiberAnalysis } from './generateFiberPdfReport';
export { generateCombinedPdfReport } from './generateCombinedPdfReport';
// export { generateWordReportForSingleAnalysis } from './generateWordReport'; // Will be enabled later
export type { ReportGenerationOptions, CombinedReportOptions, ReportFormat, ReportMetadata } from './types';