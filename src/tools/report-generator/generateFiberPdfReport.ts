
// src/tools/report-generator/generateFiberPdfReport.ts
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import type { PointInput } from '@/lib/fiber-calculator-form-schema'; // Assuming this is where form input types live
import type { PointCoordinates } from '@/types';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ReportGenerationOptions } from './types';
import {
    addHeaderToPdfPage,
    addFooterToPdfPage,
    formatFiberDataForReportTable, // New formatting function for fiber data
    fetchLogoImageBytes,
    DEFAULT_LOGO_URL,
    DEFAULT_FIBER_REPORT_TITLE, // Specific title for fiber reports
    DEFAULT_COMPANY_NAME,
    TEXT_COLOR_DARK_RGB,
    TEXT_COLOR_LIGHT_RGB,
    BRAND_COLOR_ACCENT_RGB
} from './reportUtils';

export async function generatePdfReportForFiberAnalysis(
  fiberPathResult: FiberPathResult,
  pointA_form: { name: string; lat: number; lng: number; },
  pointB_form: { name: string; lat: number; lng: number; },
  snapRadiusUsed: number,
  options?: ReportGenerationOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage(); // Start with the first page
  const { width } = page.getSize();

  const reportTitle = options?.reportTitle || DEFAULT_FIBER_REPORT_TITLE;
  const companyName = options?.companyName || DEFAULT_COMPANY_NAME;
  let logoBytes = options?.logoImageBytes;

  if (!logoBytes && options?.logoUrl !== null) {
    logoBytes = await fetchLogoImageBytes(options?.logoUrl || DEFAULT_LOGO_URL);
  }

  let currentY = await addHeaderToPdfPage(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
  currentY -= 20;

  const contentMargin = 50;
  const regularFontSize = 10;
  const lineHeight = 15;
  const sectionSpacing = 20;
  const keyColumnWidth = 200; // Adjusted for potentially longer keys in fiber report
  const valueColumnX = contentMargin + keyColumnWidth + 10;

  // Report Date
  page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: contentMargin,
    y: currentY,
    font: helveticaFont,
    size: regularFontSize,
    color: TEXT_COLOR_LIGHT_RGB,
  });
  currentY -= lineHeight * 1.5;

  // --- Fiber Path Analysis Summary Table ---
  page.drawText("Fiber Path Analysis Summary", {
    x: contentMargin,
    y: currentY,
    font: helveticaBoldFont,
    size: 13,
    color: BRAND_COLOR_ACCENT_RGB,
  });
  currentY -= lineHeight * 1.5;

  const fiberReportData = formatFiberDataForReportTable(fiberPathResult, pointA_form, pointB_form, snapRadiusUsed);

  for (const item of fiberReportData) {
    // Check for page overflow before drawing each item
    if (currentY < contentMargin + lineHeight * 2) {
      addFooterToPdfPage(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() + 1, companyName); // Footer for current page
      page = pdfDoc.addPage(); // Create a new page
      currentY = await addHeaderToPdfPage(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
      currentY -= 20; // Space after header on new page

      // Re-draw section title if it's a new page for the table
      page.drawText("Fiber Path Analysis Summary (Continued)", {
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
      font: helveticaBoldFont,
      size: regularFontSize,
      color: item.key === "Calculation Status" && fiberPathResult.status === 'success' ? BRAND_COLOR_ACCENT_RGB :
             (item.key === "Calculation Status" && fiberPathResult.status !== 'success' ? rgb(0.8, 0.2, 0.2) : TEXT_COLOR_DARK_RGB),
      maxWidth: width - valueColumnX - contentMargin,
    });
    currentY -= lineHeight;
  }
  currentY -= sectionSpacing;

  // Placeholder for Map Snapshot
  if (currentY < contentMargin + 150) { // Estimate space needed
      addFooterToPdfPage(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() + 1, companyName);
      page = pdfDoc.addPage();
      currentY = await addHeaderToPdfPage(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
      currentY -= 20;
  }
  page.drawText("Map Visualization (Placeholder)", {
    x: contentMargin,
    y: currentY,
    font: helveticaBoldFont,
    size: 12,
    color: TEXT_COLOR_DARK_RGB,
  });
  currentY -= lineHeight;
  page.drawText("Refer to interactive map in the application for visual path.", {
    x: contentMargin,
    y: currentY,
    font: helveticaFont,
    size: smallFontSize,
    color: TEXT_COLOR_LIGHT_RGB,
  });
  currentY -= lineHeight;
  // Example placeholder box for map
  page.drawRectangle({
      x: contentMargin,
      y: currentY - 120, // Adjust size as needed
      width: width - 2 * contentMargin,
      height: 100, // Adjust size as needed
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
  });
  currentY -= 130;


  // Finalize footers for all pages with the correct total page count
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const currentPageObject = pdfDoc.getPage(i);
    addFooterToPdfPage(currentPageObject, helveticaFont, i + 1, totalPages, companyName);
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

const smallFontSize = 8; // Define if not already defined globally in this file
