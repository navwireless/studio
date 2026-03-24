
// src/tools/report-generator/generateFiberPdfReport.ts
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
// PointInput shape is defined inline in the function parameters below
// PointCoordinates removed — unused
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { ReportGenerationOptions } from './types';
import {
    addHeaderToPdfPage,
    addFooterToPdfPage,
    formatFiberDataForReportTable, 
    fetchLogoImageBytes,
    DEFAULT_LOGO_URL,
    DEFAULT_FIBER_REPORT_TITLE, 
    DEFAULT_COMPANY_NAME,
    TEXT_COLOR_DARK_RGB,
    TEXT_COLOR_LIGHT_RGB,
    BRAND_COLOR_ACCENT_RGB,
    LINE_COLOR_RGB
} from './reportUtils';

const smallFontSize = 8; 

export async function generatePdfReportForFiberAnalysis(
  fiberPathResult: FiberPathResult,
  // These `pointA_form` and `pointB_form` will now have name (string) and lat/lng (number)
  pointA_form: { name: string; lat: number; lng: number; },
  pointB_form: { name: string; lat: number; lng: number; },
  snapRadiusUsed: number,
  options?: ReportGenerationOptions
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let page = pdfDoc.addPage(); 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width, height } = page.getSize(); // Get initial page dimensions

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
    const keyColumnWidth = 200; 
    const valueColumnX = contentMargin + keyColumnWidth + 10;

    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: contentMargin,
      y: currentY,
      font: helveticaFont,
      size: regularFontSize,
      color: TEXT_COLOR_LIGHT_RGB,
    });
    currentY -= lineHeight * 1.5;

    page.drawText("Fiber Path Analysis Summary", {
      x: contentMargin,
      y: currentY,
      font: helveticaBoldFont,
      size: 13,
      color: BRAND_COLOR_ACCENT_RGB,
    });
    currentY -= lineHeight * 1.5;

    // Pass PointCoordinates (lat/lng as numbers) to the formatter
    const fiberReportData = formatFiberDataForReportTable(fiberPathResult, pointA_form, pointB_form, snapRadiusUsed);

    for (const item of fiberReportData) {
      if (currentY < contentMargin + lineHeight * 3) { // Increased buffer for safety
        addFooterToPdfPage(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() +1, companyName); 
        page = pdfDoc.addPage(); 
        currentY = await addHeaderToPdfPage(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
        currentY -= 20; 

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

    if (currentY < contentMargin + 150) { 
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
    page.drawRectangle({
        x: contentMargin,
        y: currentY - 120, 
        width: width - 2 * contentMargin,
        height: 100, 
        borderColor: LINE_COLOR_RGB,
        borderWidth: 1,
    });
    currentY -= 130;

    const totalPages = pdfDoc.getPageCount();
    for (let i = 0; i < totalPages; i++) {
      const currentPageObject = pdfDoc.getPage(i);
      addFooterToPdfPage(currentPageObject, helveticaFont, i + 1, totalPages, companyName);
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch(error) {
    console.error("REPORT_ERROR: Failed to generate Fiber PDF report:", error);
    throw new Error(`Failed to generate Fiber PDF report: ${error instanceof Error ? error.message : "An unknown error occurred"}`);
  }
}
