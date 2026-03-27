// src/tools/report-generator/generatePdfReport.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PDFPage, PDFFont, RGB } from 'pdf-lib';
import type { AnalysisResult } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import type { ReportGenerationOptions } from './types';
import {
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN,
  CONTENT_WIDTH,
  COLORS,
  FONT_SIZES,
  BRANDING,
  sanitize,
  drawBox,
  fetchLogoBytes,
  drawBrandedFooter,
  drawWatermark,
  drawSectionHeader,
  formatReportDate,
  wrapText,
} from './pdfStyles';
import { generateNarrative } from './narrativeTemplates';
import { drawElevationProfile } from './pdfElevationChart';
import { drawStaticMap, getStaticMapsApiKey } from './pdfStaticMap';

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function getLinkGrade(result: AnalysisResult): { letter: string; color: RGB } {
  if (!result.losPossible) return { letter: 'F', color: COLORS.failure };
  const margin = (result.minClearance ?? 0) - result.clearanceThresholdUsed;
  const ratio = result.clearanceThresholdUsed > 0
    ? margin / result.clearanceThresholdUsed
    : margin;
  if (ratio > 2) return { letter: 'A+', color: rgb(0.05, 0.65, 0.25) };
  if (ratio > 1) return { letter: 'A', color: COLORS.success };
  if (ratio > 0.5) return { letter: 'B', color: rgb(0.2, 0.7, 0.35) };
  if (ratio > 0.2) return { letter: 'C', color: rgb(0.85, 0.65, 0.1) };
  if (ratio >= 0) return { letter: 'D', color: rgb(0.9, 0.5, 0.1) };
  return { letter: 'F', color: COLORS.failure };
}

function drawMetricCard(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  accentColor: RGB,
  opts?: { valueSize?: number; valueColor?: RGB },
) {
  // Card background
  drawBox(page, x, y, w, h, COLORS.bgLight, COLORS.borderLight, 0.4);
  // Top accent stripe
  page.drawRectangle({ x, y: y + h - 3, width: w, height: 3, color: accentColor });
  // Label
  page.drawText(sanitize(label), {
    x: x + 6,
    y: y + h - 14,
    font: fonts.regular,
    size: 6.5,
    color: COLORS.textMuted,
  });
  // Value
  const vs = opts?.valueSize ?? 11;
  page.drawText(sanitize(value), {
    x: x + 6,
    y: y + 6,
    font: fonts.bold,
    size: vs,
    color: opts?.valueColor ?? COLORS.textDark,
  });
}

// ═══════════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════════
export async function generatePdfReportForSingleAnalysis(
  analysisResult: AnalysisResult,
  options?: ReportGenerationOptions,
  fiberResult?: FiberPathResult | null,
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fonts = { regular: fontRegular, bold: fontBold };

    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    // ── Fetch logo ──
    let logoBytes = options?.logoImageBytes;
    if (!logoBytes && options?.logoUrl !== null) {
      logoBytes = await fetchLogoBytes(options?.logoUrl);
    }

    // ── Watermark ──
    drawWatermark(page, fontRegular);

    // ══════════════════════════════════════════════════════
    // TOP ACCENT BAR (full-bleed brand stripe)
    // ══════════════════════════════════════════════════════
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 4,
      width: PAGE_WIDTH,
      height: 4,
      color: COLORS.brandBlue,
    });

    let y = PAGE_HEIGHT - MARGIN;

    // ══════════════════════════════════════════════════════
    // HEADER (compact — logo left, title right)
    // ══════════════════════════════════════════════════════
    if (logoBytes) {
      try {
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoMaxH = 24;
        const scale = logoMaxH / logoImage.height;
        const logoW = logoImage.width * scale;
        page.drawImage(logoImage, {
          x: MARGIN,
          y: y - logoMaxH,
          width: logoW,
          height: logoMaxH,
        });
      } catch {
        page.drawText(BRANDING.companyName, {
          x: MARGIN,
          y: y - 10,
          font: fontBold,
          size: 8,
          color: COLORS.textMedium,
        });
      }
    } else {
      page.drawText(BRANDING.companyName, {
        x: MARGIN,
        y: y - 10,
        font: fontBold,
        size: 8,
        color: COLORS.textMedium,
      });
    }

    const reportTitle = options?.reportTitle || BRANDING.reportTitle;
    const titleW = fontBold.widthOfTextAtSize(reportTitle, 15);
    page.drawText(reportTitle, {
      x: PAGE_WIDTH - MARGIN - titleW,
      y: y - 14,
      font: fontBold,
      size: 15,
      color: COLORS.textDark,
    });

    y -= 28;

    // Date + ID
    page.drawText(formatReportDate(), {
      x: MARGIN,
      y,
      font: fontRegular,
      size: FONT_SIZES.bodySmall,
      color: COLORS.textLight,
    });
    const idText = analysisResult.id ? `ID: ${analysisResult.id.substring(0, 12)}` : '';
    if (idText) {
      const idW = fontRegular.widthOfTextAtSize(idText, FONT_SIZES.bodySmall);
      page.drawText(idText, {
        x: PAGE_WIDTH - MARGIN - idW,
        y,
        font: fontRegular,
        size: FONT_SIZES.bodySmall,
        color: COLORS.textLight,
      });
    }

    y -= 6;

    // Thin separator
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.6,
      color: COLORS.borderLight,
    });
    y -= 8;

    // ══════════════════════════════════════════════════════
    // STATUS BANNER
    // ══════════════════════════════════════════════════════
    const isClear = analysisResult.losPossible;
    const mc = analysisResult.minClearance;
    const threshold = analysisResult.clearanceThresholdUsed;
    const bannerH = 36;
    const bannerBg = isClear ? COLORS.successBg : COLORS.failureBg;
    const bannerBorderC = isClear ? COLORS.success : COLORS.failure;
    const statusColor = isClear ? COLORS.success : COLORS.failure;

    drawBox(page, MARGIN, y - bannerH, CONTENT_WIDTH, bannerH, bannerBg, bannerBorderC, 0.8);
    page.drawRectangle({ x: MARGIN, y: y - bannerH, width: 4, height: bannerH, color: bannerBorderC });

    const statusLabel = isClear ? 'PASS' : 'FAIL';
    const statusMsg = isClear ? 'LINE OF SIGHT IS CLEAR' : 'LINE OF SIGHT BLOCKED';
    page.drawText(statusLabel, {
      x: MARGIN + 12,
      y: y - 14,
      font: fontBold,
      size: 11,
      color: statusColor,
    });
    page.drawText(statusMsg, {
      x: MARGIN + 46,
      y: y - 14,
      font: fontBold,
      size: 12,
      color: statusColor,
    });

    const detailStr = mc !== null
      ? `Clearance: ${mc.toFixed(1)}m  |  Threshold: ${threshold}m  |  Distance: ${analysisResult.distanceKm < 1 ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m` : `${analysisResult.distanceKm.toFixed(2)} km`}`
      : `Threshold: ${threshold}m  |  Distance: ${analysisResult.distanceKm.toFixed(2)} km`;
    page.drawText(sanitize(detailStr), {
      x: MARGIN + 12,
      y: y - 28,
      font: fontRegular,
      size: FONT_SIZES.bodySmall,
      color: COLORS.textMedium,
    });

    if (!isClear && analysisResult.additionalHeightNeeded !== null) {
      const addText = `+${analysisResult.additionalHeightNeeded.toFixed(1)}m needed`;
      const addW = fontBold.widthOfTextAtSize(addText, 10);
      page.drawText(addText, {
        x: PAGE_WIDTH - MARGIN - addW - 8,
        y: y - 16,
        font: fontBold,
        size: 10,
        color: COLORS.failure,
      });
    }

    y -= bannerH + 6;

    // ══════════════════════════════════════════════════════
    // METRICS ROW (4 cards)
    // ══════════════════════════════════════════════════════
    const cardGap = 6;
    const cardW = (CONTENT_WIDTH - 3 * cardGap) / 4;
    const cardH = 34;

    const grade = getLinkGrade(analysisResult);
    const marginVal = mc !== null ? (mc - threshold) : null;

    drawMetricCard(page, fonts, MARGIN, y - cardH, cardW, cardH,
      'LINK GRADE', grade.letter, grade.color,
      { valueSize: 16, valueColor: grade.color });

    drawMetricCard(page, fonts, MARGIN + cardW + cardGap, y - cardH, cardW, cardH,
      'DISTANCE',
      analysisResult.distanceKm < 1
        ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m`
        : `${analysisResult.distanceKm.toFixed(2)} km`,
      COLORS.brandBlue);

    drawMetricCard(page, fonts, MARGIN + 2 * (cardW + cardGap), y - cardH, cardW, cardH,
      'CLEARANCE MARGIN',
      marginVal !== null ? `${marginVal.toFixed(1)}m` : 'N/A',
      marginVal !== null && marginVal >= 0 ? COLORS.success : COLORS.failure,
      { valueColor: marginVal !== null && marginVal >= 0 ? COLORS.success : COLORS.failure });

    drawMetricCard(page, fonts, MARGIN + 3 * (cardW + cardGap), y - cardH, cardW, cardH,
      'TOWERS (A / B)',
      `${analysisResult.pointA.towerHeight}m / ${analysisResult.pointB.towerHeight}m`,
      COLORS.brandTeal);

    y -= cardH + 8;

    // ══════════════════════════════════════════════════════
    // SITE DETAILS (two-column)
    // ══════════════════════════════════════════════════════
    y = drawSectionHeader(page, fontBold, 'Site Details', y, COLORS.brandBlue);
    y -= 2;

    const colW = (CONTENT_WIDTH - 8) / 2;
    const siteBoxH = 42;

    // Site A
    drawBox(page, MARGIN, y - siteBoxH, colW, siteBoxH, COLORS.bgLight, COLORS.borderLight, 0.4);
    page.drawRectangle({ x: MARGIN, y: y - siteBoxH, width: 3, height: siteBoxH, color: COLORS.success });
    page.drawText('SITE A', {
      x: MARGIN + 8, y: y - 10,
      font: fontBold, size: 7, color: COLORS.success,
    });
    page.drawText(sanitize(analysisResult.pointA.name || 'Site A'), {
      x: MARGIN + 36, y: y - 10,
      font: fontBold, size: FONT_SIZES.body, color: COLORS.textDark,
    });
    page.drawText(`${analysisResult.pointA.lat.toFixed(6)}, ${analysisResult.pointA.lng.toFixed(6)}`, {
      x: MARGIN + 8, y: y - 22,
      font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });
    page.drawText(`Tower: ${analysisResult.pointA.towerHeight}m`, {
      x: MARGIN + 8, y: y - 34,
      font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });

    // Site B
    const bX = MARGIN + colW + 8;
    drawBox(page, bX, y - siteBoxH, colW, siteBoxH, COLORS.bgLight, COLORS.borderLight, 0.4);
    page.drawRectangle({ x: bX, y: y - siteBoxH, width: 3, height: siteBoxH, color: COLORS.brandBlue });
    page.drawText('SITE B', {
      x: bX + 8, y: y - 10,
      font: fontBold, size: 7, color: COLORS.brandBlue,
    });
    page.drawText(sanitize(analysisResult.pointB.name || 'Site B'), {
      x: bX + 36, y: y - 10,
      font: fontBold, size: FONT_SIZES.body, color: COLORS.textDark,
    });
    page.drawText(`${analysisResult.pointB.lat.toFixed(6)}, ${analysisResult.pointB.lng.toFixed(6)}`, {
      x: bX + 8, y: y - 22,
      font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });
    page.drawText(`Tower: ${analysisResult.pointB.towerHeight}m`, {
      x: bX + 8, y: y - 34,
      font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });

    y -= siteBoxH + 8;

    // ══════════════════════════════════════════════════════
    // DYNAMIC SPACE ALLOCATION
    // ══════════════════════════════════════════════════════
    const footerReserve = 28;
    const availableY = y - MARGIN - footerReserve;

    const hasFiber = fiberResult?.status === 'success' && fiberResult.totalDistanceMeters;
    const hasFiberError = fiberResult && fiberResult.status !== 'success' && fiberResult.errorMessage;
    const fiberSectionH = hasFiber ? 52 : hasFiberError ? 40 : 0;

    // Section headers + gaps = ~26pt each for map, chart, analysis (+ fiber)
    const sectionOverhead = 26;
    const numSections = 3 + (fiberSectionH > 0 ? 1 : 0);
    const totalOverhead = numSections * sectionOverhead + fiberSectionH;
    const contentBudget = availableY - totalOverhead;

    // Allocate: map 38%, chart 38%, narrative 24%
    const mapH = Math.max(100, Math.min(200, Math.floor(contentBudget * 0.38)));
    const chartH = Math.max(90, Math.min(185, Math.floor(contentBudget * 0.38)));
    const narrativeH = Math.max(28, Math.floor(contentBudget * 0.24));

    // ══════════════════════════════════════════════════════
    // MAP VIEW
    // ══════════════════════════════════════════════════════
    y = drawSectionHeader(page, fontBold, 'Map View', y, COLORS.brandTeal);
    y -= 2;

    const apiKey = getStaticMapsApiKey();
    y = await drawStaticMap(
      page, pdfDoc, fonts,
      { lat: analysisResult.pointA.lat, lng: analysisResult.pointA.lng, name: analysisResult.pointA.name },
      { lat: analysisResult.pointB.lat, lng: analysisResult.pointB.lng, name: analysisResult.pointB.name },
      { x: MARGIN, yTop: y, width: CONTENT_WIDTH, height: mapH },
      apiKey,
      { maptype: 'hybrid', scale: 2 },
    );
    y -= 6;

    // ══════════════════════════════════════════════════════
    // ELEVATION PROFILE
    // ══════════════════════════════════════════════════════
    y = drawSectionHeader(page, fontBold, 'Elevation Profile', y, COLORS.brandBlue);
    y -= 2;

    if (analysisResult.profile && analysisResult.profile.length >= 2) {
      drawElevationProfile(page, fonts, analysisResult.profile, {
        x: MARGIN,
        y: y - chartH,
        width: CONTENT_WIDTH,
        height: chartH,
        pointAName: analysisResult.pointA.name || 'Site A',
        pointBName: analysisResult.pointB.name || 'Site B',
        totalDistanceKm: analysisResult.distanceKm,
        losPossible: analysisResult.losPossible,
        minClearance: analysisResult.minClearance,
        showLegend: true,
      });
      y -= chartH + 4;
    } else {
      drawBox(page, MARGIN, y - chartH, CONTENT_WIDTH, chartH, COLORS.bgLight, COLORS.chartBorder, 0.5);
      const noData = 'Elevation profile data not available';
      const noDataW = fontRegular.widthOfTextAtSize(noData, FONT_SIZES.body);
      page.drawText(noData, {
        x: MARGIN + (CONTENT_WIDTH - noDataW) / 2,
        y: y - chartH / 2,
        font: fontRegular, size: FONT_SIZES.body, color: COLORS.textMuted,
      });
      y -= chartH + 4;
    }

    y -= 4;

    // ══════════════════════════════════════════════════════
    // ANALYSIS NARRATIVE
    // ══════════════════════════════════════════════════════
    y = drawSectionHeader(page, fontBold, 'Analysis Summary', y, COLORS.brandBlue);
    y -= 2;

    const narrative = generateNarrative(analysisResult, fiberResult);
    const narrativeLines = wrapText(narrative, fontRegular, FONT_SIZES.bodySmall, CONTENT_WIDTH - 12);
    const actualNarrH = Math.max(narrativeH, narrativeLines.length * 10 + 8);

    drawBox(page, MARGIN, y - actualNarrH, CONTENT_WIDTH, actualNarrH, COLORS.bgLight, COLORS.borderLight, 0.3);
    page.drawRectangle({ x: MARGIN, y: y - actualNarrH, width: 3, height: actualNarrH, color: COLORS.brandBlue });

    let ny = y - 9;
    for (const line of narrativeLines) {
      if (ny < y - actualNarrH + 4) break;
      page.drawText(line, {
        x: MARGIN + 8, y: ny,
        font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
      });
      ny -= 10;
    }
    y -= actualNarrH + 6;

    // ══════════════════════════════════════════════════════
    // FIBER PATH (conditional)
    // ══════════════════════════════════════════════════════
    if (hasFiber && fiberResult) {
      y = drawSectionHeader(page, fontBold, 'Fiber Path', y, COLORS.fiberBlue);
      y -= 2;

      const fiberBoxH = 28;
      drawBox(page, MARGIN, y - fiberBoxH, CONTENT_WIDTH, fiberBoxH, COLORS.bgLight, COLORS.borderLight, 0.3);
      page.drawRectangle({ x: MARGIN, y: y - fiberBoxH, width: 3, height: fiberBoxH, color: COLORS.fiberBlue });

      const totalF = fiberResult.totalDistanceMeters!;
      const ratio = (totalF / 1000 / analysisResult.distanceKm).toFixed(1);
      page.drawText(`Total: ${totalF.toFixed(0)}m (${ratio}x aerial)`, {
        x: MARGIN + 10, y: y - 11,
        font: fontBold, size: FONT_SIZES.body, color: COLORS.fiberBlue,
      });

      const seg = [
        `Offset A: ${fiberResult.offsetDistanceA_meters?.toFixed(0) || 'N/A'}m`,
        `Road: ${fiberResult.roadRouteDistanceMeters?.toFixed(0) || 'N/A'}m`,
        `Offset B: ${fiberResult.offsetDistanceB_meters?.toFixed(0) || 'N/A'}m`,
      ].join('  |  ');
      page.drawText(sanitize(seg), {
        x: MARGIN + 10, y: y - 23,
        font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
      });

      y -= fiberBoxH + 4;
    } else if (hasFiberError && fiberResult) {
      y = drawSectionHeader(page, fontBold, 'Fiber Path', y, COLORS.fiberBlue);
      y -= 2;
      const errH = 16;
      drawBox(page, MARGIN, y - errH, CONTENT_WIDTH, errH, COLORS.bgLight, COLORS.borderLight, 0.3);
      page.drawText(sanitize(`Fiber: ${fiberResult.errorMessage || 'Calculation failed'}`), {
        x: MARGIN + 5, y: y - 11,
        font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textLight,
      });
      y -= errH + 4;
    }

    // ══════════════════════════════════════════════════════
    // BOTTOM ACCENT BAR + FOOTER
    // ══════════════════════════════════════════════════════
    page.drawRectangle({
      x: 0, y: 0, width: PAGE_WIDTH, height: 3, color: COLORS.brandBlue,
    });

    drawBrandedFooter(page, fontRegular, 1, 1);

    return pdfDoc.save();
  } catch (error) {
    console.error('REPORT_ERROR: Failed to generate single analysis PDF:', error);
    throw new Error(
      `Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}