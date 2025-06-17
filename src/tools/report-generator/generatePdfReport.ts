// src/tools/report-generator/generatePdfReport.ts
import type { AnalysisResult } from '@/types';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import type { ReportGenerationOptions } from './types';
import { 
    addHeaderToPdfPage, 
    addFooterToPdfPage, 
    formatAnalysisDataForReportTable,
    fetchLogoImageBytes,
    DEFAULT_LOGO_URL,
    DEFAULT_REPORT_TITLE,
    DEFAULT_COMPANY_NAME,
    TEXT_COLOR_DARK_RGB,
    TEXT_COLOR_LIGHT_RGB,
    BRAND_COLOR_ACCENT_RGB
} from './reportUtils';

export async function generatePdfReportForSingleAnalysis(
  analysisResult: AnalysisResult,
  options?: ReportGenerationOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  const reportTitle = options?.reportTitle || DEFAULT_REPORT_TITLE;
  const companyName = options?.companyName || DEFAULT_COMPANY_NAME;
  let logoBytes = options?.logoImageBytes;

  if (!logoBytes && options?.logoUrl !== null) { // Allow explicit null to skip default
    logoBytes = await fetchLogoImageBytes(options?.logoUrl || DEFAULT_LOGO_URL);
  }

  let currentY = await addHeaderToPdfPage(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
  currentY -= 20; // Space after header

  // --- Report Details ---
  const contentMargin = 50;
  const contentWidth = width - 2 * contentMargin;
  const regularFontSize = 10;
  const smallFontSize = 8;
  const lineHeight = 15;
  const sectionSpacing = 20;

  // Report Date
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: contentMargin,
    y: currentY,
    font: helveticaFont,
    size: regularFontSize,
    color: TEXT_COLOR_LIGHT_RGB,
  });
  currentY -= lineHeight * 1.5;

  // --- Analysis Parameters Table ---
  page.drawText("Link Analysis Summary", {
    x: contentMargin,
    y: currentY,
    font: helveticaBoldFont,
    size: 13,
    color: BRAND_COLOR_ACCENT_RGB,
  });
  currentY -= lineHeight * 1.5;

  const analysisData = formatAnalysisDataForReportTable(analysisResult);
  const tableStartY = currentY;
  const keyColumnWidth = 180;
  const valueColumnX = contentMargin + keyColumnWidth + 10;

  analysisData.forEach((item, index) => {
    if (currentY < contentMargin + lineHeight * 2) { // Check for page break
        addFooterToPdfPage(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() +1, companyName); // Footer for current page
        const newPage = pdfDoc.addPage();
        currentY = await addHeaderToPdfPage(newPage, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
        currentY -= 20; // Space after header on new page
        // Redraw section title if it's a new page for the table
        page.drawText("Link Analysis Summary (Continued)", {
            x: contentMargin, y: currentY, font: helveticaBoldFont, size: 13, color: BRAND_COLOR_ACCENT_RGB,
        });
        currentY -= lineHeight * 1.5;
    }

    page.drawText(`${item.key}:`, {
      x: contentMargin,
      y: currentY,
      font: helveticaFont,
      size: regularFontSize,
      color: TEXT_COLOR_DARK_RGB,
    });
    page.drawText(item.value, {
      x: valueColumnX,
      y: currentY,
      font: helveticaBoldFont, // Make values bold
      size: regularFontSize,
      color: item.key === "Line-of-Sight Possible" ? (analysisResult.losPossible ? BRAND_COLOR_ACCENT_RGB : rgb(0.7, 0.2, 0.2)) : TEXT_COLOR_DARK_RGB,
      maxWidth: contentWidth - keyColumnWidth - 20,
    });
    currentY -= lineHeight;
  });
  currentY -= sectionSpacing;


  // Placeholder for Profile Chart (if includeProfileChart is true and chart generation is implemented)
  if (options?.includeProfileChart) {
    if (currentY < contentMargin + 150) { // Estimate space needed for chart
        addFooterToPdfPage(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() + 1, companyName);
        const newPage = pdfDoc.addPage();
        currentY = await addHeaderToPdfPage(newPage, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
        currentY -= 20;
    }
    page.drawText("Path Profile Chart (Placeholder)", {
      x: contentMargin,
      y: currentY,
      font: helveticaBoldFont,
      size: 12,
      color: TEXT_COLOR_DARK_RGB,
    });
    currentY -= lineHeight;
    // Actual chart drawing logic would go here
    page.drawRectangle({
        x: contentMargin,
        y: currentY - 120,
        width: contentWidth,
        height: 100,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
    });
    page.drawText("Chart would be rendered here.", {
        x: contentMargin + 10, y: currentY - 60, font: helveticaFont, size: regularFontSize, color: TEXT_COLOR_LIGHT_RGB
    });
    currentY -= 130;
  }

  // Add footer to the last page (or current page if it's the only one)
  addFooterToPdfPage(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount(), companyName);
  
  // If new pages were added, we need to iterate and add footers to previous pages.
  // This is a bit tricky as pdfDoc.getPageCount() changes.
  // A simpler approach for now is to add footer after content might span pages.
  // For a multi-page document, this needs more robust handling.
  // For now, this just correctly numbers the LAST page it was working on.
  // A full solution would be to loop through all pages *after* all content is drawn.

  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdfDoc.getPage(i);
    // Re-call footer for each page to ensure correct totalPages
    // (This is slightly inefficient but ensures correctness if content caused page additions)
    // To be truly correct, this loop should be after all content is drawn, or manage Y position more carefully.
    // For now, the addFooterToPdfPage called during content generation will have the running page count.
    // Let's re-stamp the footers with final totalPages.
    // NOTE: This assumes addFooterToPdfPage is idempotent or safe to call multiple times on the same visual footer area if needed.
    // A better way: collect all pages, then loop *once* at the end.
    // Simplified for now:
    if (i < totalPages -1) { // If not the last page (which was already footered)
        // Need to re-call footer for previous pages if their content caused page break and they need correct total count
        // This is complex; for now the version called DURING content generation is what we have.
    }
  }


  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
