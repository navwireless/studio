// src/tools/report-generator/generatePdfReport.ts
import { rgb } from 'pdf-lib';
import type { PDFPage, PDFFont, RGB } from 'pdf-lib';
import type { AnalysisResult } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import type { ReportGenerationOptions, ExportConfig } from './types';
import { DEFAULT_EXPORT_CONFIG } from './types';
import { getDeviceById } from '@/config/devices';
import { PDFLayoutEngine, truncateText } from './pdfLayoutEngine';
import {
  PAGE_WIDTH,
  MARGIN,
  CONTENT_WIDTH,
  COLORS,
  FONT_SIZES,
  BRANDING,
  sanitize,
  drawBox,
  fetchLogoBytes,
  drawSectionHeader,
  formatReportDate,
  wrapText,
  drawClientInfoBlock,
  generateReportId,
} from './pdfStyles';
import { generateNarrative } from './narrativeTemplates';
import { drawElevationProfile } from './pdfElevationChart';
import { drawStaticMap, getStaticMapsApiKey } from './pdfStaticMap';

// ═══════════════════════════════════════════════════════
// Fixed section heights
// ═══════════════════════════════════════════════════════
const MAP_HEIGHT = 180;
const CHART_HEIGHT = 160;
const METRIC_CARD_H = 36;
const STATUS_BANNER_H = 36;
const SITE_BOX_H = 44;
const SECTION_GAP = 8;

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function drawMetricCard(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  x: number, y: number, w: number, h: number,
  label: string, value: string, accentColor: RGB,
  opts?: { valueSize?: number; valueColor?: RGB },
) {
  drawBox(page, x, y, w, h, COLORS.bgLight, COLORS.borderLight, 0.4);
  page.drawRectangle({ x, y: y + h - 3, width: w, height: 3, color: accentColor });
  page.drawText(sanitize(label), {
    x: x + 8, y: y + h - 14,
    font: fonts.regular, size: 6.5, color: COLORS.textMuted,
  });
  page.drawText(sanitize(value), {
    x: x + 8, y: y + 6,
    font: fonts.bold, size: opts?.valueSize ?? 11,
    color: opts?.valueColor ?? COLORS.textDark,
  });
}

function isRestrictedDevice(deviceId: string): boolean {
  const device = getDeviceById(deviceId);
  return device?.isPenta5Certified ?? false;
}

function filterCompatibleDevices(
  devices: Array<{ deviceId: string; deviceName: string; bandwidth: string; maxRangeKm: number; utilizationPercent: number; reliabilityRating: string }>,
  selectedDeviceId?: string,
) {
  return devices.filter(d => d.deviceId === selectedDeviceId || !isRestrictedDevice(d.deviceId));
}

function estimateDeviceSectionHeight(analysisResult: AnalysisResult): number {
  const dc = analysisResult.deviceCompatibility;
  if (!dc) return 0;
  let h = 26; // section header
  if (dc.selectedDevice) {
    h += 46; // device box
    if (!dc.selectedDevice.isCompatible && dc.recommendation.recommendedDeviceName) h += 24;
  } else {
    const compatible = filterCompatibleDevices(dc.recommendation.compatibleDevices);
    h += 14 + compatible.length * 12 + 8;
  }
  return h;
}

function drawDeviceSection(
  page: PDFPage,
  fonts: { regular: PDFFont; bold: PDFFont },
  y: number,
  analysisResult: AnalysisResult,
): number {
  const dc = analysisResult.deviceCompatibility;
  if (!dc) return y;

  y = drawSectionHeader(page, fonts.bold, 'Device Compatibility', y, COLORS.brandTeal);
  y -= 2;

  if (dc.selectedDevice) {
    const sd = dc.selectedDevice;
    const device = getDeviceById(sd.deviceId);
    const isCompat = sd.isCompatible;
    const statusColor = isCompat ? COLORS.deviceCompatible : COLORS.deviceIncompatible;
    const statusText = isCompat ? 'COMPATIBLE' : 'NOT COMPATIBLE';

    const boxH = 42;
    drawBox(page, MARGIN, y - boxH, CONTENT_WIDTH, boxH, COLORS.bgLight, COLORS.borderLight, 0.3);
    page.drawRectangle({ x: MARGIN, y: y - boxH, width: 3, height: boxH, color: statusColor });

    const devName = truncateText(sd.deviceName, fonts.bold, FONT_SIZES.body, 200);
    page.drawText(devName, {
      x: MARGIN + 10, y: y - 12,
      font: fonts.bold, size: FONT_SIZES.body, color: COLORS.textDark,
    });

    const nameW = fonts.bold.widthOfTextAtSize(devName, FONT_SIZES.body);
    const badgeW = fonts.bold.widthOfTextAtSize(statusText, 7) + 10;
    const badgeX = MARGIN + 10 + nameW + 8;
    if (badgeX + badgeW < PAGE_WIDTH - MARGIN - 10) {
      page.drawRectangle({ x: badgeX, y: y - 15, width: badgeW, height: 12, color: statusColor });
      page.drawText(statusText, {
        x: badgeX + 5, y: y - 12,
        font: fonts.bold, size: 7, color: COLORS.white,
      });
    }

    const specs = [
      device ? `Bandwidth: ${device.bandwidth}` : '',
      device ? `Max Range: ${device.maxRangeKm} km` : '',
      `Link Distance: ${analysisResult.distanceKm.toFixed(2)} km`,
    ].filter(Boolean);
    page.drawText(sanitize(specs.join('  |  ')), {
      x: MARGIN + 10, y: y - 26,
      font: fonts.regular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });

    if (!isCompat && device) {
      const shortfall = analysisResult.distanceKm - device.maxRangeKm;
      if (shortfall > 0) {
        page.drawText(sanitize(`Exceeds range by ${shortfall.toFixed(1)} km`), {
          x: MARGIN + 10, y: y - 37,
          font: fonts.regular, size: 7, color: COLORS.deviceIncompatible,
        });
      }
    }

    y -= boxH + 4;

    if (!isCompat && dc.recommendation.recommendedDeviceName) {
      const recH = 20;
      drawBox(page, MARGIN, y - recH, CONTENT_WIDTH, recH, rgb(0.93, 0.97, 0.93), COLORS.deviceCompatible, 0.3);
      const recDevice = dc.recommendation.compatibleDevices.find(d => d.deviceId === dc.recommendation.recommendedDeviceId);
      const recInfo = recDevice
        ? `${dc.recommendation.recommendedDeviceName} (${recDevice.bandwidth} | ${recDevice.maxRangeKm} km range)`
        : dc.recommendation.recommendedDeviceName;
      page.drawText(sanitize(`Recommended: ${truncateText(recInfo, fonts.bold, FONT_SIZES.bodySmall, CONTENT_WIDTH - 30)}`), {
        x: MARGIN + 10, y: y - 13,
        font: fonts.bold, size: FONT_SIZES.bodySmall, color: COLORS.deviceCompatible,
      });
      y -= recH + 4;
    }
  } else {
    const allCompatible = dc.recommendation.compatibleDevices;
    const compatible = filterCompatibleDevices(allCompatible);

    if (compatible.length > 0) {
      const headerH = 14;
      const rowH = 12;
      const tableH = headerH + compatible.length * rowH + 4;

      drawBox(page, MARGIN, y - tableH, CONTENT_WIDTH, tableH, COLORS.bgLight, COLORS.borderLight, 0.3);
      page.drawRectangle({ x: MARGIN, y: y - tableH, width: 3, height: tableH, color: COLORS.brandTeal });

      const thY = y - 10;
      const cols = [
        { label: 'Device', x: MARGIN + 10, w: 180 },
        { label: 'Bandwidth', x: MARGIN + 190, w: 80 },
        { label: 'Max Range', x: MARGIN + 270, w: 80 },
        { label: 'Status', x: MARGIN + 350, w: 120 },
      ];

      cols.forEach(col => {
        page.drawText(col.label, {
          x: col.x, y: thY,
          font: fonts.bold, size: 7, color: COLORS.textMuted,
        });
      });

      page.drawLine({
        start: { x: MARGIN + 8, y: thY - 4 },
        end: { x: PAGE_WIDTH - MARGIN - 8, y: thY - 4 },
        thickness: 0.3, color: COLORS.borderLight,
      });

      compatible.forEach((device, idx) => {
        const rowY = thY - 4 - (idx + 1) * rowH + 2;
        const isRec = device.deviceId === dc.recommendation.recommendedDeviceId;

        if (isRec) {
          page.drawRectangle({
            x: MARGIN + 4, y: rowY - 4,
            width: CONTENT_WIDTH - 8, height: rowH,
            color: rgb(0.92, 0.97, 0.92),
          });
        }

        const dName = truncateText(device.deviceName + (isRec ? ' (Recommended)' : ''), isRec ? fonts.bold : fonts.regular, 7, 170);
        page.drawText(dName, {
          x: cols[0].x, y: rowY,
          font: isRec ? fonts.bold : fonts.regular, size: 7, color: COLORS.textDark,
        });
        page.drawText(device.bandwidth, {
          x: cols[1].x, y: rowY,
          font: fonts.regular, size: 7, color: COLORS.textMedium,
        });
        page.drawText(`${device.maxRangeKm} km`, {
          x: cols[2].x, y: rowY,
          font: fonts.regular, size: 7, color: COLORS.textMedium,
        });
        page.drawText('Compatible', {
          x: cols[3].x, y: rowY,
          font: fonts.regular, size: 7, color: COLORS.deviceCompatible,
        });
      });

      y -= tableH + 4;
    } else {
      const noDevH = 20;
      drawBox(page, MARGIN, y - noDevH, CONTENT_WIDTH, noDevH, COLORS.failureBg, COLORS.failure, 0.3);
      page.drawText(sanitize(`No compatible devices for ${analysisResult.distanceKm.toFixed(2)} km link distance`), {
        x: MARGIN + 10, y: y - 13,
        font: fonts.regular, size: FONT_SIZES.bodySmall, color: COLORS.failure,
      });
      y -= noDevH + 4;
    }
  }

  return y;
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
    const cfg: ExportConfig = { ...DEFAULT_EXPORT_CONFIG, ...options?.exportConfig };
    const reportId = options?.reportId || generateReportId(options?.userName || cfg.preparedBy || '', 1, 'A');
    const reportTitle = cfg.reportTitle || options?.reportTitle || BRANDING.reportTitle;

    let logoBytes = options?.logoImageBytes;
    if (!logoBytes && options?.logoUrl !== null) {
      logoBytes = await fetchLogoBytes(options?.logoUrl);
    }

    const engine = await PDFLayoutEngine.create({
      onNewPage: (_page, pageIndex) => {
        if (pageIndex > 0) {
          engine.drawContinuationHeader(reportTitle);
        }
      },
    });

    const page = engine.addPage();

    // ═══════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════
    if (logoBytes) {
      try {
        const logoImage = await engine.doc.embedPng(logoBytes);
        const logoMaxH = 24;
        const scale = logoMaxH / logoImage.height;
        page.drawImage(logoImage, {
          x: MARGIN, y: engine.y - logoMaxH,
          width: logoImage.width * scale, height: logoMaxH,
        });
      } catch {
        page.drawText(BRANDING.companyName, {
          x: MARGIN, y: engine.y - 10,
          font: engine.fontBold, size: 8, color: COLORS.textMedium,
        });
      }
    } else {
      page.drawText(BRANDING.companyName, {
        x: MARGIN, y: engine.y - 10,
        font: engine.fontBold, size: 8, color: COLORS.textMedium,
      });
    }

    const titleW = engine.fontBold.widthOfTextAtSize(reportTitle, 14);
    page.drawText(reportTitle, {
      x: PAGE_WIDTH - MARGIN - titleW, y: engine.y - 14,
      font: engine.fontBold, size: 14, color: COLORS.textDark,
    });
    engine.advance(28);

    // Date line (left) + Report ID (right) — separate lines to avoid overlap
    page.drawText(formatReportDate(cfg.date), {
      x: MARGIN, y: engine.y,
      font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textLight,
    });

    const idText = `ID: ${reportId}`;
    const idW = engine.fontRegular.widthOfTextAtSize(idText, FONT_SIZES.bodySmall);
    page.drawText(idText, {
      x: PAGE_WIDTH - MARGIN - idW, y: engine.y,
      font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textLight,
    });
    engine.advance(10);

    // Separator
    engine.page.drawLine({
      start: { x: MARGIN, y: engine.y },
      end: { x: PAGE_WIDTH - MARGIN, y: engine.y },
      thickness: 0.6, color: COLORS.borderLight,
    });
    engine.advance(6);

    // ═══════════════════════════════════════════════════
    // CLIENT INFO (optional)
    // ═══════════════════════════════════════════════════
    engine.y = drawClientInfoBlock(engine.page, engine.fonts, engine.y, {
      clientName: cfg.clientName,
      projectName: cfg.projectName,
      preparedBy: cfg.preparedBy,
      referenceNumber: cfg.referenceNumber,
      date: cfg.date,
    });

    // ═══════════════════════════════════════════════════
    // STATUS BANNER
    // ═══════════════════════════════════════════════════
    engine.ensureSpace(STATUS_BANNER_H + SECTION_GAP);

    const isClear = analysisResult.losPossible;
    const mc = analysisResult.minClearance;
    const threshold = analysisResult.clearanceThresholdUsed;
    const bannerBg = isClear ? COLORS.successBg : COLORS.failureBg;
    const bannerBorder = isClear ? COLORS.success : COLORS.failure;

    drawBox(engine.page, MARGIN, engine.y - STATUS_BANNER_H, CONTENT_WIDTH, STATUS_BANNER_H, bannerBg, bannerBorder, 0.8);
    engine.page.drawRectangle({ x: MARGIN, y: engine.y - STATUS_BANNER_H, width: 4, height: STATUS_BANNER_H, color: bannerBorder });

    const statusLabel = isClear ? 'PASS' : 'FAIL';
    const statusMsg = isClear ? 'LINE OF SIGHT IS CLEAR' : 'LINE OF SIGHT BLOCKED';
    engine.page.drawText(statusLabel, {
      x: MARGIN + 12, y: engine.y - 14,
      font: engine.fontBold, size: 11, color: bannerBorder,
    });
    engine.page.drawText(statusMsg, {
      x: MARGIN + 46, y: engine.y - 14,
      font: engine.fontBold, size: 12, color: bannerBorder,
    });

    const distStr = analysisResult.distanceKm < 1
      ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m`
      : `${analysisResult.distanceKm.toFixed(2)} km`;
    const detailStr = mc !== null
      ? `Clearance: ${mc.toFixed(1)}m  |  Threshold: ${threshold}m  |  Distance: ${distStr}`
      : `Threshold: ${threshold}m  |  Distance: ${distStr}`;
    engine.page.drawText(sanitize(detailStr), {
      x: MARGIN + 12, y: engine.y - 28,
      font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });

    if (!isClear && analysisResult.additionalHeightNeeded !== null) {
      const addText = `+${analysisResult.additionalHeightNeeded.toFixed(1)}m needed`;
      const addW = engine.fontBold.widthOfTextAtSize(addText, 10);
      engine.page.drawText(addText, {
        x: PAGE_WIDTH - MARGIN - addW - 8, y: engine.y - 16,
        font: engine.fontBold, size: 10, color: COLORS.failure,
      });
    }

    engine.advance(STATUS_BANNER_H + SECTION_GAP);

    // ═══════════════════════════════════════════════════
    // METRIC CARDS (3)
    // ═══════════════════════════════════════════════════
    engine.ensureSpace(METRIC_CARD_H + SECTION_GAP);

    const cardGap = 6;
    const cardW = (CONTENT_WIDTH - 2 * cardGap) / 3;

    drawMetricCard(engine.page, engine.fonts, MARGIN, engine.y - METRIC_CARD_H, cardW, METRIC_CARD_H,
      'DISTANCE', distStr, COLORS.brandBlue);
    drawMetricCard(engine.page, engine.fonts, MARGIN + cardW + cardGap, engine.y - METRIC_CARD_H, cardW, METRIC_CARD_H,
      'MIN CLEARANCE', mc !== null ? `${mc.toFixed(1)}m` : 'N/A',
      mc !== null && mc >= threshold ? COLORS.success : COLORS.failure,
      { valueColor: mc !== null && mc >= threshold ? COLORS.success : COLORS.failure });
    drawMetricCard(engine.page, engine.fonts, MARGIN + 2 * (cardW + cardGap), engine.y - METRIC_CARD_H, cardW, METRIC_CARD_H,
      'TOWERS (A / B)', `${analysisResult.pointA.towerHeight}m / ${analysisResult.pointB.towerHeight}m`, COLORS.brandTeal);

    engine.advance(METRIC_CARD_H + SECTION_GAP);

    // ═══════════════════════════════════════════════════
    // SITE DETAILS
    // ═══════════════════════════════════════════════════
    engine.ensureSpace(SITE_BOX_H + 28);
    engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Site Details', engine.y, COLORS.brandBlue);
    engine.advance(2);

    const colW = (CONTENT_WIDTH - 8) / 2;
    const nameMaxW = colW - 50;

    // Site A
    drawBox(engine.page, MARGIN, engine.y - SITE_BOX_H, colW, SITE_BOX_H, COLORS.bgLight, COLORS.borderLight, 0.4);
    engine.page.drawRectangle({ x: MARGIN, y: engine.y - SITE_BOX_H, width: 3, height: SITE_BOX_H, color: COLORS.success });
    engine.page.drawText('SITE A', { x: MARGIN + 8, y: engine.y - 10, font: engine.fontBold, size: 7, color: COLORS.success });
    engine.page.drawText(truncateText(analysisResult.pointA.name || 'Site A', engine.fontBold, FONT_SIZES.body, nameMaxW), {
      x: MARGIN + 36, y: engine.y - 10, font: engine.fontBold, size: FONT_SIZES.body, color: COLORS.textDark,
    });
    engine.page.drawText(`${analysisResult.pointA.lat.toFixed(6)}, ${analysisResult.pointA.lng.toFixed(6)}`, {
      x: MARGIN + 8, y: engine.y - 22, font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });
    engine.page.drawText(`Tower: ${analysisResult.pointA.towerHeight}m`, {
      x: MARGIN + 8, y: engine.y - 34, font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });

    // Site B
    const bX = MARGIN + colW + 8;
    drawBox(engine.page, bX, engine.y - SITE_BOX_H, colW, SITE_BOX_H, COLORS.bgLight, COLORS.borderLight, 0.4);
    engine.page.drawRectangle({ x: bX, y: engine.y - SITE_BOX_H, width: 3, height: SITE_BOX_H, color: COLORS.brandBlue });
    engine.page.drawText('SITE B', { x: bX + 8, y: engine.y - 10, font: engine.fontBold, size: 7, color: COLORS.brandBlue });
    engine.page.drawText(truncateText(analysisResult.pointB.name || 'Site B', engine.fontBold, FONT_SIZES.body, nameMaxW), {
      x: bX + 36, y: engine.y - 10, font: engine.fontBold, size: FONT_SIZES.body, color: COLORS.textDark,
    });
    engine.page.drawText(`${analysisResult.pointB.lat.toFixed(6)}, ${analysisResult.pointB.lng.toFixed(6)}`, {
      x: bX + 8, y: engine.y - 22, font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });
    engine.page.drawText(`Tower: ${analysisResult.pointB.towerHeight}m`, {
      x: bX + 8, y: engine.y - 34, font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
    });

    engine.advance(SITE_BOX_H + SECTION_GAP);

    // ═══════════════════════════════════════════════════
    // DEVICE COMPATIBILITY (conditional)
    // ═══════════════════════════════════════════════════
    if (cfg.includeDeviceSpecs && analysisResult.deviceCompatibility) {
      const deviceH = estimateDeviceSectionHeight(analysisResult);
      engine.ensureSpace(deviceH);
      engine.y = drawDeviceSection(engine.page, engine.fonts, engine.y, analysisResult);
      engine.advance(SECTION_GAP - 4);
    }

    // ═══════════════════════════════════════════════════
    // MAP VIEW (conditional)
    // ═══════════════════════════════════════════════════
    if (cfg.includeStaticMap !== false) {
      engine.ensureSpace(MAP_HEIGHT + 28);
      engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Map View', engine.y, COLORS.brandTeal);
      engine.advance(2);

      const apiKey = getStaticMapsApiKey();
      engine.y = await drawStaticMap(
        engine.page, engine.doc, engine.fonts,
        { lat: analysisResult.pointA.lat, lng: analysisResult.pointA.lng, name: analysisResult.pointA.name },
        { lat: analysisResult.pointB.lat, lng: analysisResult.pointB.lng, name: analysisResult.pointB.name },
        { x: MARGIN, yTop: engine.y, width: CONTENT_WIDTH, height: MAP_HEIGHT },
        apiKey, { maptype: 'hybrid', scale: 2 },
      );
      engine.advance(SECTION_GAP);
    }

    // ═══════════════════════════════════════════════════
    // ELEVATION PROFILE (conditional)
    // ═══════════════════════════════════════════════════
    if (cfg.includeElevationChart !== false) {
      engine.ensureSpace(CHART_HEIGHT + 28);
      engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Elevation Profile', engine.y, COLORS.brandBlue);
      engine.advance(2);

      if (analysisResult.profile && analysisResult.profile.length >= 2) {
        let deviceMaxRangeKm: number | undefined;
        let deviceName: string | undefined;
        if (cfg.includeDeviceSpecs && analysisResult.deviceCompatibility?.selectedDevice) {
          const sd = analysisResult.deviceCompatibility.selectedDevice;
          const device = getDeviceById(sd.deviceId);
          if (device) { deviceMaxRangeKm = device.maxRangeKm; deviceName = device.name; }
        }

        drawElevationProfile(engine.page, engine.fonts, analysisResult.profile, {
          x: MARGIN, y: engine.y - CHART_HEIGHT, width: CONTENT_WIDTH, height: CHART_HEIGHT,
          pointAName: analysisResult.pointA.name || 'Site A',
          pointBName: analysisResult.pointB.name || 'Site B',
          totalDistanceKm: analysisResult.distanceKm,
          losPossible: analysisResult.losPossible,
          minClearance: analysisResult.minClearance,
          showLegend: true,
          deviceMaxRangeKm, deviceName,
        });
        engine.advance(CHART_HEIGHT + SECTION_GAP);
      } else {
        drawBox(engine.page, MARGIN, engine.y - 40, CONTENT_WIDTH, 40, COLORS.bgLight, COLORS.chartBorder, 0.5);
        const noData = 'Elevation profile data not available';
        const noDataW = engine.fontRegular.widthOfTextAtSize(noData, FONT_SIZES.body);
        engine.page.drawText(noData, {
          x: MARGIN + (CONTENT_WIDTH - noDataW) / 2, y: engine.y - 22,
          font: engine.fontRegular, size: FONT_SIZES.body, color: COLORS.textMuted,
        });
        engine.advance(40 + SECTION_GAP);
      }
    }

    // ═══════════════════════════════════════════════════
    // NARRATIVE (conditional)
    // ═══════════════════════════════════════════════════
    if (cfg.includeNarrative) {
      const narrative = generateNarrative(analysisResult, fiberResult, cfg.includeDeviceSpecs);
      const lines = wrapText(narrative, engine.fontRegular, FONT_SIZES.bodySmall, CONTENT_WIDTH - 16);
      const narrativeH = lines.length * 10 + 10;

      // Only force new page if truly no room for header + at least 3 lines
      const minNarrativeSpace = 28 + Math.min(narrativeH, 40);
      engine.ensureSpace(minNarrativeSpace);
      engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Analysis Summary', engine.y, COLORS.brandBlue);
      engine.advance(2);

      // Draw as much narrative as fits in available space
      const boxH = Math.min(narrativeH, engine.availableSpace - 4);
      drawBox(engine.page, MARGIN, engine.y - boxH, CONTENT_WIDTH, boxH, COLORS.bgLight, COLORS.borderLight, 0.3);
      engine.page.drawRectangle({ x: MARGIN, y: engine.y - boxH, width: 3, height: boxH, color: COLORS.brandBlue });

      let ny = engine.y - 9;
      for (const line of lines) {
        if (ny < engine.y - boxH + 4) break;
        engine.page.drawText(line, {
          x: MARGIN + 8, y: ny,
          font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
        });
        ny -= 10;
      }
      engine.advance(boxH + SECTION_GAP);
    }

    // ═══════════════════════════════════════════════════
    // FIBER PATH (conditional)
    // ═══════════════════════════════════════════════════
    const hasFiber = fiberResult?.status === 'success' && fiberResult.totalDistanceMeters;
    const hasFiberError = fiberResult && fiberResult.status !== 'success' && fiberResult.errorMessage;

    if (hasFiber && fiberResult) {
      // Only need ~40pt, don't force page break for small section
      engine.ensureSpace(40);
      engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Fiber Path', engine.y, COLORS.fiberBlue);
      engine.advance(2);

      const fiberBoxH = 28;
      drawBox(engine.page, MARGIN, engine.y - fiberBoxH, CONTENT_WIDTH, fiberBoxH, COLORS.bgLight, COLORS.borderLight, 0.3);
      engine.page.drawRectangle({ x: MARGIN, y: engine.y - fiberBoxH, width: 3, height: fiberBoxH, color: COLORS.fiberBlue });

      const totalF = fiberResult.totalDistanceMeters!;
      const ratio = (totalF / 1000 / analysisResult.distanceKm).toFixed(1);
      engine.page.drawText(`Total: ${totalF.toFixed(0)}m (${ratio}x aerial)`, {
        x: MARGIN + 10, y: engine.y - 11,
        font: engine.fontBold, size: FONT_SIZES.body, color: COLORS.fiberBlue,
      });

      const seg = [
        `Offset A: ${fiberResult.offsetDistanceA_meters?.toFixed(0) || 'N/A'}m`,
        `Road: ${fiberResult.roadRouteDistanceMeters?.toFixed(0) || 'N/A'}m`,
        `Offset B: ${fiberResult.offsetDistanceB_meters?.toFixed(0) || 'N/A'}m`,
      ].join('  |  ');
      engine.page.drawText(sanitize(seg), {
        x: MARGIN + 10, y: engine.y - 23,
        font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
      });

      engine.advance(fiberBoxH + SECTION_GAP);
    } else if (hasFiberError && fiberResult) {
      engine.ensureSpace(36);
      engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Fiber Path', engine.y, COLORS.fiberBlue);
      engine.advance(2);

      const errH = 16;
      drawBox(engine.page, MARGIN, engine.y - errH, CONTENT_WIDTH, errH, COLORS.bgLight, COLORS.borderLight, 0.3);
      engine.page.drawText(sanitize(`Fiber: ${fiberResult.errorMessage || 'Calculation failed'}`), {
        x: MARGIN + 5, y: engine.y - 11,
        font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textLight,
      });
      engine.advance(errH + SECTION_GAP);
    }

    // ═══════════════════════════════════════════════════
    // ADDITIONAL NOTES (conditional)
    // ═══════════════════════════════════════════════════
    if (cfg.additionalNotes) {
      const noteLines = wrapText(cfg.additionalNotes, engine.fontRegular, FONT_SIZES.bodySmall, CONTENT_WIDTH - 16);
      const noteH = Math.max(18, noteLines.length * 10 + 8);

      // Only need header + a few lines minimum
      engine.ensureSpace(Math.min(noteH + 24, 50));
      engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Notes', engine.y, COLORS.textMedium);
      engine.advance(2);

      const drawH = Math.min(noteH, engine.availableSpace - 4);
      drawBox(engine.page, MARGIN, engine.y - drawH, CONTENT_WIDTH, drawH, COLORS.bgLight, COLORS.borderLight, 0.3);

      let noteY = engine.y - 8;
      for (const line of noteLines) {
        if (noteY < engine.y - drawH + 3) break;
        engine.page.drawText(line, {
          x: MARGIN + 6, y: noteY,
          font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
        });
        noteY -= 10;
      }
      engine.advance(drawH + SECTION_GAP);
    }

    // ═══════════════════════════════════════════════════
    // FINALIZE — footers on all pages
    // ═══════════════════════════════════════════════════
    return engine.save();
  } catch (error) {
    console.error('REPORT_ERROR: Failed to generate single analysis PDF:', error);
    throw new Error(
      `Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}