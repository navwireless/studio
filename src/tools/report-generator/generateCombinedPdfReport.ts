// src/tools/report-generator/generateCombinedPdfReport.ts
import { rgb } from 'pdf-lib';
import type { PDFPage, PDFFont, RGB } from 'pdf-lib';
import type { SavedLink } from '@/types';
import type { AnalysisResult } from '@/types';
import type { CombinedReportOptions, ExportConfig } from './types';
import { DEFAULT_EXPORT_CONFIG } from './types';
import { getDeviceById } from '@/config/devices';
import { PDFLayoutEngine, truncateText } from './pdfLayoutEngine';
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
    drawSectionHeader,
    formatReportDate,
    wrapText,
    drawClientInfoBlock,
    generateReportId,
} from './pdfStyles';
import { generateNarrative, generateShortSummary } from './narrativeTemplates';
import { drawElevationProfile } from './pdfElevationChart';
import { drawStaticMap, getStaticMapsApiKey } from './pdfStaticMap';

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════
const DEFAULT_MAX_DETAIL_PAGES = 15;
const HERO_HEIGHT = 120;
const HERO_BG = rgb(0.11, 0.12, 0.16);
const HERO_TEXT = rgb(1, 1, 1);
const HERO_TEXT_SUB = rgb(0.72, 0.73, 0.78);
const HERO_TEXT_MUTED = rgb(0.52, 0.53, 0.58);
const MAP_HEIGHT = 170;
const CHART_HEIGHT = 155;
const SECTION_GAP = 8;
const ROW_H = 16;
const TABLE_HEADER_H = 16;

// ═══════════════════════════════════════════════════════
// Column definitions — percentage-based widths
// ═══════════════════════════════════════════════════════
// #: 5%, Link Name: 20%, Dist: 10%, LOS: 8%, Clearance: 10%,
// Tower A/B: 10%, Device: 15%, Summary: 22%
const COL_PERCENTS = [0.05, 0.20, 0.10, 0.08, 0.10, 0.10, 0.15, 0.22];

function getColumns(hasDeviceData: boolean): Array<{ label: string; x: number; w: number }> {
    const percents = [...COL_PERCENTS];
    const labels = hasDeviceData
        ? ['#', 'Link Name', 'Dist (km)', 'LOS', 'Clearance', 'Tower A/B', 'Device', 'Summary']
        : ['#', 'Link Name', 'Dist (km)', 'LOS', 'Clearance', 'Tower A/B', 'Fiber (m)', 'Summary'];

    const cols: Array<{ label: string; x: number; w: number }> = [];
    let xOffset = MARGIN;
    for (let i = 0; i < percents.length; i++) {
        const w = CONTENT_WIDTH * percents[i];
        cols.push({ label: labels[i], x: xOffset, w });
        xOffset += w;
    }
    return cols;
}

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
        x: x + 8, y: y + h - 15,
        font: fonts.regular, size: 6.5, color: COLORS.textMuted,
    });
    page.drawText(sanitize(value), {
        x: x + 8, y: y + 7,
        font: fonts.bold, size: opts?.valueSize ?? 13, color: opts?.valueColor ?? COLORS.textDark,
    });
}

function isRestrictedDevice(deviceId: string): boolean {
    const device = getDeviceById(deviceId);
    return device?.isPenta5Certified ?? false;
}

function getDeviceDisplayName(link: SavedLink): string {
    if (link.analysisResult.deviceCompatibility?.selectedDevice) {
        return link.analysisResult.deviceCompatibility.selectedDevice.deviceName;
    }
    if (link.selectedDeviceId) {
        const device = getDeviceById(link.selectedDeviceId);
        return device ? device.name : link.selectedDeviceId;
    }
    return 'Auto';
}

function drawCondensedDeviceInfo(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    y: number,
    result: AnalysisResult,
): number {
    const dc = result.deviceCompatibility;
    if (!dc) return y;

    const sd = dc.selectedDevice;

    if (sd) {
        const isCompat = sd.isCompatible;
        const statusColor = isCompat ? COLORS.deviceCompatible : COLORS.deviceIncompatible;
        const statusText = isCompat ? 'COMPATIBLE' : 'NOT COMPATIBLE';
        const boxH = 20;

        drawBox(page, MARGIN, y - boxH, CONTENT_WIDTH, boxH, COLORS.bgLight, COLORS.borderLight, 0.3);
        page.drawRectangle({ x: MARGIN, y: y - boxH, width: 3, height: boxH, color: statusColor });

        const devName = truncateText(sd.deviceName, fonts.bold, 8, 180);
        page.drawText(devName, {
            x: MARGIN + 10, y: y - 13,
            font: fonts.bold, size: 8, color: COLORS.textDark,
        });

        const nameW = fonts.bold.widthOfTextAtSize(devName, 8);
        const badgeW = fonts.bold.widthOfTextAtSize(statusText, 6) + 8;
        const badgeX = MARGIN + 14 + nameW;
        if (badgeX + badgeW < PAGE_WIDTH - MARGIN - 80) {
            page.drawRectangle({ x: badgeX, y: y - 16, width: badgeW, height: 10, color: statusColor });
            page.drawText(statusText, {
                x: badgeX + 4, y: y - 13,
                font: fonts.bold, size: 6, color: COLORS.white,
            });
        }

        const device = getDeviceById(sd.deviceId);
        if (device) {
            const specStr = `${device.bandwidth} | ${device.maxRangeKm}km range`;
            const specW = fonts.regular.widthOfTextAtSize(sanitize(specStr), 7);
            page.drawText(sanitize(specStr), {
                x: PAGE_WIDTH - MARGIN - specW - 10, y: y - 13,
                font: fonts.regular, size: 7, color: COLORS.textMedium,
            });
        }

        return y - boxH - 4;
    }

    // Auto mode
    const allCompatible = dc.recommendation.compatibleDevices;
    const compatible = allCompatible.filter(d => !isRestrictedDevice(d.deviceId));
    if (compatible.length > 0) {
        const infoH = 16;
        drawBox(page, MARGIN, y - infoH, CONTENT_WIDTH, infoH, COLORS.bgLight, COLORS.borderLight, 0.3);
        page.drawRectangle({ x: MARGIN, y: y - infoH, width: 3, height: infoH, color: COLORS.brandTeal });

        const recName = dc.recommendation.recommendedDeviceName || 'N/A';
        const infoText = truncateText(`${compatible.length} compatible device(s) | Recommended: ${recName}`, fonts.regular, 7.5, CONTENT_WIDTH - 30);
        page.drawText(sanitize(infoText), {
            x: MARGIN + 10, y: y - 11,
            font: fonts.regular, size: 7.5, color: COLORS.textMedium,
        });
        return y - infoH - 4;
    }

    return y;
}

function drawFeasibilityBar(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    y: number,
    feasible: number,
    blocked: number,
    total: number,
): number {
    const barH = 20;
    const barY = y - barH;
    const feasibleW = total > 0 ? (feasible / total) * CONTENT_WIDTH : 0;
    const blockedW = CONTENT_WIDTH - feasibleW;

    if (feasibleW > 0) {
        drawBox(page, MARGIN, barY, feasibleW, barH, COLORS.success);
        if (feasibleW > 35) {
            const pt = `${feasible} Pass`;
            page.drawText(pt, {
                x: MARGIN + feasibleW / 2 - fonts.bold.widthOfTextAtSize(pt, 8) / 2,
                y: barY + 6, font: fonts.bold, size: 8, color: COLORS.white,
            });
        }
    }
    if (blockedW > 0) {
        drawBox(page, MARGIN + feasibleW, barY, blockedW, barH, COLORS.failure);
        if (blockedW > 35) {
            const pt = `${blocked} Fail`;
            page.drawText(pt, {
                x: MARGIN + feasibleW + blockedW / 2 - fonts.bold.widthOfTextAtSize(pt, 8) / 2,
                y: barY + 6, font: fonts.bold, size: 8, color: COLORS.white,
            });
        }
    }

    return barY - SECTION_GAP;
}

// ═══════════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════════
export async function generateCombinedPdfReport(
    links: SavedLink[],
    options?: CombinedReportOptions,
): Promise<Uint8Array> {
    try {
        const cfg: ExportConfig = { ...DEFAULT_EXPORT_CONFIG, ...options?.exportConfig };
        const reportId = options?.reportId || generateReportId(options?.userName || cfg.preparedBy || '', 1, 'C');

        const maxDetailPages = options?.maxDetailPages ?? DEFAULT_MAX_DETAIL_PAGES;
        const includeDetailCharts = options?.includeDetailCharts !== false && cfg.includeElevationChart;
        const includeDetailMaps = options?.includeDetailMaps !== false && cfg.includeStaticMap;
        const showDetailPages = cfg.includeIndividualLinkDetails && links.length <= maxDetailPages;
        const hasDeviceData = cfg.includeDeviceSpecs && links.some(l => l.analysisResult.deviceCompatibility || l.selectedDeviceId);

        let logoBytes = options?.logoImageBytes;
        if (!logoBytes && options?.logoUrl !== null) {
            logoBytes = await fetchLogoBytes(options?.logoUrl);
        }

        // Statistics
        const feasible = links.filter(l => l.analysisResult.losPossible).length;
        const blocked = links.length - feasible;
        const totalDist = links.reduce((s, l) => s + l.analysisResult.distanceKm, 0);
        const feasiblePct = links.length > 0 ? (feasible / links.length) * 100 : 0;

        const COL = getColumns(hasDeviceData);

        const engine = await PDFLayoutEngine.create();
        const fonts = engine.fonts;

        // ══════════════════════════════════════════════════
        // PAGE 1: SINGLE CONSOLIDATED OVERVIEW PAGE
        // Hero + Client Info + KPI Cards + Feasibility Bar + Table + Report Info
        // ══════════════════════════════════════════════════
        const cover = engine.addPage();

        // ── Dark hero section ──
        const heroTop = PAGE_HEIGHT - 4;
        const heroBottom = heroTop - HERO_HEIGHT;
        cover.drawRectangle({ x: 0, y: heroBottom, width: PAGE_WIDTH, height: HERO_HEIGHT, color: HERO_BG });
        cover.drawRectangle({ x: 0, y: heroBottom, width: PAGE_WIDTH, height: 2, color: COLORS.brandTeal });

        // Logo in hero
        if (logoBytes) {
            try {
                const logoImage = await engine.doc.embedPng(logoBytes);
                const logoMaxH = 22;
                const scale = logoMaxH / logoImage.height;
                const logoW = logoImage.width * scale;
                cover.drawRectangle({
                    x: MARGIN - 3, y: heroTop - 8 - logoMaxH - 3,
                    width: logoW + 6, height: logoMaxH + 6, color: COLORS.white,
                });
                cover.drawImage(logoImage, {
                    x: MARGIN, y: heroTop - 8 - logoMaxH,
                    width: logoW, height: logoMaxH,
                });
            } catch {
                cover.drawText(BRANDING.companyName, {
                    x: MARGIN, y: heroTop - 20,
                    font: engine.fontBold, size: 9, color: HERO_TEXT_SUB,
                });
            }
        } else {
            cover.drawText(BRANDING.companyName, {
                x: MARGIN, y: heroTop - 20,
                font: engine.fontBold, size: 9, color: HERO_TEXT_SUB,
            });
        }

        // Title
        const coverTitle = cfg.reportTitle || BRANDING.combinedReportTitle;
        cover.drawText(coverTitle, {
            x: MARGIN, y: heroTop - 52,
            font: engine.fontBold, size: 18, color: HERO_TEXT,
        });

        // Subtitle
        cover.drawText('Multi-Link Line-of-Sight Analysis', {
            x: MARGIN, y: heroTop - 68,
            font: engine.fontRegular, size: 10, color: HERO_TEXT_SUB,
        });

        // Date + ID
        cover.drawText(`${formatReportDate(cfg.date)}  |  ID: ${reportId}`, {
            x: MARGIN, y: heroTop - 84,
            font: engine.fontRegular, size: 8, color: HERO_TEXT_MUTED,
        });

        // Stats (right side of hero)
        const heroStatX = PAGE_WIDTH - MARGIN - 100;
        cover.drawText(`${links.length}`, {
            x: heroStatX, y: heroTop - 44,
            font: engine.fontBold, size: 26, color: HERO_TEXT,
        });
        cover.drawText('Links Analyzed', {
            x: heroStatX, y: heroTop - 56,
            font: engine.fontRegular, size: 8, color: HERO_TEXT_SUB,
        });

        const feasPctStr = `${feasible}/${links.length}`;
        cover.drawText(feasPctStr, {
            x: heroStatX, y: heroTop - 74,
            font: engine.fontBold, size: 16,
            color: feasiblePct >= 50 ? COLORS.brandTealLight : COLORS.failureLight,
        });
        cover.drawText('Feasible', {
            x: heroStatX, y: heroTop - 84,
            font: engine.fontRegular, size: 8, color: HERO_TEXT_SUB,
        });

        engine.y = heroBottom - 8;

        // ── Client Info ──
        engine.y = drawClientInfoBlock(cover, fonts, engine.y, {
            clientName: cfg.clientName,
            projectName: cfg.projectName,
            preparedBy: cfg.preparedBy,
            referenceNumber: cfg.referenceNumber,
            date: cfg.date,
        });

        // ── KPI Cards (ONE TIME) ──
        if (cfg.includeOverviewStats) {
            const cardGap = 6;
            const cardW = (CONTENT_WIDTH - 2 * cardGap) / 3;
            const cardH = 36;

            engine.ensureSpace(cardH + 10);

            drawMetricCard(cover, fonts, MARGIN, engine.y - cardH, cardW, cardH,
                'TOTAL LINKS', `${links.length}`, COLORS.brandBlue, { valueSize: 12 });
            drawMetricCard(cover, fonts, MARGIN + cardW + cardGap, engine.y - cardH, cardW, cardH,
                'FEASIBLE', `${feasible}`, COLORS.success, { valueColor: COLORS.success, valueSize: 12 });
            drawMetricCard(cover, fonts, MARGIN + 2 * (cardW + cardGap), engine.y - cardH, cardW, cardH,
                'BLOCKED', `${blocked}`, COLORS.failure, { valueColor: COLORS.failure, valueSize: 12 });

            engine.advance(cardH + 8);
        }

        // ── Feasibility Bar (ONE TIME) ──
        engine.ensureSpace(28);
        engine.y = drawFeasibilityBar(engine.page, fonts, engine.y, feasible, blocked, links.length);

        // ── Link Analysis Table (on same page, continues to next if needed) ──
        function drawTableHeader(pg: PDFPage, startY: number): number {
            pg.drawRectangle({
                x: MARGIN, y: startY - TABLE_HEADER_H, width: CONTENT_WIDTH, height: TABLE_HEADER_H,
                color: COLORS.bgDark,
            });
            COL.forEach(col => {
                pg.drawText(col.label, {
                    x: col.x + 4, y: startY - 12,
                    font: engine.fontBold, size: 7, color: COLORS.white,
                });
            });
            return startY - TABLE_HEADER_H;
        }

        // Table header
        engine.ensureSpace(TABLE_HEADER_H + ROW_H * 2 + 10);
        engine.y = drawTableHeader(engine.page, engine.y);
        let rowOnPage = 0;

        for (let i = 0; i < links.length; i++) {
            const link = links[i];

            // Check if row fits; if not, new page with header
            if (engine.availableSpace < ROW_H + 4) {
                engine.addPage();
                engine.drawContinuationHeader('Link Analysis Details');
                engine.y = drawTableHeader(engine.page, engine.y);
                rowOnPage = 0;
            }

            if (rowOnPage % 2 === 0) {
                engine.page.drawRectangle({
                    x: MARGIN, y: engine.y - ROW_H, width: CONTENT_WIDTH, height: ROW_H,
                    color: COLORS.bgLight,
                });
            }

            const rowY = engine.y - 11;
            const los = link.analysisResult.losPossible;
            const mc = link.analysisResult.minClearance;
            const shortSummary = generateShortSummary(link.analysisResult);

            // Every cell value goes through truncateText
            const cellPad = 8;
            engine.page.drawText(truncateText(String(i + 1), engine.fontRegular, 7, COL[0].w - cellPad), { x: COL[0].x + 4, y: rowY, font: engine.fontRegular, size: 7, color: COLORS.textMedium });
            engine.page.drawText(truncateText(link.name, engine.fontRegular, 7, COL[1].w - cellPad), { x: COL[1].x + 4, y: rowY, font: engine.fontRegular, size: 7, color: COLORS.textDark });
            engine.page.drawText(truncateText(link.analysisResult.distanceKm.toFixed(2), engine.fontRegular, 7, COL[2].w - cellPad), { x: COL[2].x + 4, y: rowY, font: engine.fontRegular, size: 7, color: COLORS.textMedium });
            engine.page.drawText(truncateText(los ? 'PASS' : 'FAIL', engine.fontBold, 7, COL[3].w - cellPad), { x: COL[3].x + 4, y: rowY, font: engine.fontBold, size: 7, color: los ? COLORS.success : COLORS.failure });
            engine.page.drawText(truncateText(mc !== null ? `${mc.toFixed(1)}m` : 'N/A', engine.fontRegular, 7, COL[4].w - cellPad), { x: COL[4].x + 4, y: rowY, font: engine.fontRegular, size: 7, color: COLORS.textMedium });
            engine.page.drawText(truncateText(`${link.pointA.towerHeight}/${link.pointB.towerHeight}m`, engine.fontRegular, 7, COL[5].w - cellPad), { x: COL[5].x + 4, y: rowY, font: engine.fontRegular, size: 7, color: COLORS.textMedium });

            if (hasDeviceData) {
                engine.page.drawText(truncateText(getDeviceDisplayName(link), engine.fontRegular, 6.5, COL[6].w - cellPad), { x: COL[6].x + 4, y: rowY, font: engine.fontRegular, size: 6.5, color: COLORS.textMedium });
            } else {
                const fiberDist = link.fiberPathResult?.status === 'success' && link.fiberPathResult.totalDistanceMeters
                    ? link.fiberPathResult.totalDistanceMeters.toFixed(0) : '-';
                engine.page.drawText(truncateText(fiberDist, engine.fontRegular, 7, COL[6].w - cellPad), { x: COL[6].x + 4, y: rowY, font: engine.fontRegular, size: 7, color: fiberDist !== '-' ? COLORS.fiberBlue : COLORS.textMuted });
            }

            engine.page.drawText(truncateText(shortSummary, engine.fontRegular, 6, COL[7].w - cellPad), { x: COL[7].x + 4, y: rowY, font: engine.fontRegular, size: 6, color: COLORS.textLight });

            engine.advance(ROW_H);
            rowOnPage++;
        }

        // ── TOTAL row ──
        if (engine.availableSpace < ROW_H + 4) {
            engine.addPage();
            engine.drawContinuationHeader('Link Analysis Details');
            engine.y = drawTableHeader(engine.page, engine.y);
        }

        engine.page.drawRectangle({
            x: MARGIN, y: engine.y - ROW_H, width: CONTENT_WIDTH, height: ROW_H,
            color: COLORS.bgMedium,
        });
        const sumRowY = engine.y - 11;
        const cellPad = 8;
        // TOTAL in column 0 only
        engine.page.drawText('TOTAL', { x: COL[0].x + 4, y: sumRowY, font: engine.fontBold, size: 7, color: COLORS.textDark });
        // Link count in column 1
        engine.page.drawText(truncateText(`${links.length} links`, engine.fontBold, 7, COL[1].w - cellPad), { x: COL[1].x + 4, y: sumRowY, font: engine.fontBold, size: 7, color: COLORS.textDark });
        // Total distance in column 2
        engine.page.drawText(truncateText(`${totalDist.toFixed(1)}`, engine.fontBold, 7, COL[2].w - cellPad), { x: COL[2].x + 4, y: sumRowY, font: engine.fontBold, size: 7, color: COLORS.textDark });
        // LOS summary in column 3
        engine.page.drawText(truncateText(`${feasible}P/${blocked}F`, engine.fontBold, 6.5, COL[3].w - cellPad), { x: COL[3].x + 4, y: sumRowY, font: engine.fontBold, size: 6.5, color: COLORS.textDark });
        // Columns 4-7 empty for TOTAL row
        engine.advance(ROW_H);

        // ── Report Information (ONE TIME) ──
        engine.advance(8);
        if (engine.availableSpace > 52) {
            const confBoxH = 44;
            drawBox(engine.page, MARGIN, engine.y - confBoxH, CONTENT_WIDTH, confBoxH, COLORS.bgLight, COLORS.borderLight, 0.4);
            engine.page.drawRectangle({ x: MARGIN, y: engine.y - confBoxH, width: 3, height: confBoxH, color: COLORS.brandBlue });

            engine.page.drawText('REPORT INFORMATION', {
                x: MARGIN + 10, y: engine.y - 12,
                font: engine.fontBold, size: 7, color: COLORS.textMuted,
            });
            engine.page.drawText(sanitize(BRANDING.footerText), {
                x: MARGIN + 10, y: engine.y - 23,
                font: engine.fontRegular, size: 7, color: COLORS.textMedium,
            });
            engine.page.drawText(sanitize(`Report Date: ${formatReportDate(cfg.date)}  |  ID: ${reportId}`), {
                x: MARGIN + 10, y: engine.y - 34,
                font: engine.fontRegular, size: 7, color: COLORS.textMedium,
            });
            engine.page.drawText('This report is generated from automated analysis and should be validated with field surveys before deployment decisions.', {
                x: MARGIN + 10, y: engine.y - confBoxH + 5,
                font: engine.fontRegular, size: 6.5, color: COLORS.textLight,
            });
            engine.advance(confBoxH);
        }

        // ══════════════════════════════════════════════════
        // DETAIL PAGES (one per link)
        // ══════════════════════════════════════════════════
        if (showDetailPages) {
            const apiKey = getStaticMapsApiKey();

            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                const result = link.analysisResult;
                const fiber = link.fiberPathResult;

                // Each link gets a fresh page
                const detailPage = engine.addPage();
                const nameMaxW = 280;

                // Compact header
                if (logoBytes) {
                    try {
                        const logoImage = await engine.doc.embedPng(logoBytes);
                        const lmH = 18;
                        const sc = lmH / logoImage.height;
                        detailPage.drawImage(logoImage, { x: MARGIN, y: engine.y - lmH, width: logoImage.width * sc, height: lmH });
                    } catch {
                        detailPage.drawText(BRANDING.companyName, { x: MARGIN, y: engine.y - 9, font: engine.fontBold, size: 7, color: COLORS.textMedium });
                    }
                } else {
                    detailPage.drawText(BRANDING.companyName, { x: MARGIN, y: engine.y - 9, font: engine.fontBold, size: 7, color: COLORS.textMedium });
                }

                const linkLabel = `Link ${i + 1} of ${links.length}`;
                const llW = engine.fontBold.widthOfTextAtSize(linkLabel, 12);
                detailPage.drawText(linkLabel, { x: PAGE_WIDTH - MARGIN - llW, y: engine.y - 12, font: engine.fontBold, size: 12, color: COLORS.textDark });
                engine.advance(24);

                // Link name + date
                detailPage.drawText(truncateText(link.name, engine.fontBold, 11, nameMaxW), {
                    x: MARGIN, y: engine.y,
                    font: engine.fontBold, size: 11, color: COLORS.textDark,
                });
                const dateText = new Date(link.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                const dtW = engine.fontRegular.widthOfTextAtSize(dateText, FONT_SIZES.bodySmall);
                                detailPage.drawText(dateText, { x: PAGE_WIDTH - MARGIN - dtW, y: engine.y, font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textLight });
                engine.advance(4);

                detailPage.drawLine({ start: { x: MARGIN, y: engine.y }, end: { x: PAGE_WIDTH - MARGIN, y: engine.y }, thickness: 0.5, color: COLORS.borderLight });
                engine.advance(8);

                // Status Banner
                const dClear = result.losPossible;
                const bH = 28;
                const dBg = dClear ? COLORS.successBg : COLORS.failureBg;
                const dBorder = dClear ? COLORS.success : COLORS.failure;

                drawBox(detailPage, MARGIN, engine.y - bH, CONTENT_WIDTH, bH, dBg, dBorder, 0.6);
                detailPage.drawRectangle({ x: MARGIN, y: engine.y - bH, width: 3, height: bH, color: dBorder });

                detailPage.drawText(dClear ? 'PASS - LINE OF SIGHT CLEAR' : 'FAIL - LINE OF SIGHT BLOCKED', {
                    x: MARGIN + 10, y: engine.y - 11,
                    font: engine.fontBold, size: 9, color: dBorder,
                });

                const cInfo = result.minClearance !== null
                    ? `Clearance: ${result.minClearance.toFixed(1)}m | Threshold: ${result.clearanceThresholdUsed}m | Distance: ${result.distanceKm.toFixed(2)} km`
                    : `Threshold: ${result.clearanceThresholdUsed}m | Distance: ${result.distanceKm.toFixed(2)} km`;
                detailPage.drawText(sanitize(cInfo), {
                    x: MARGIN + 10, y: engine.y - 23,
                    font: engine.fontRegular, size: 7, color: COLORS.textMedium,
                });
                engine.advance(bH + 6);

                // Metric Cards
                const dCardGap = 5;
                const dCardW = (CONTENT_WIDTH - 2 * dCardGap) / 3;
                const dCardH = 34;

                drawMetricCard(detailPage, fonts, MARGIN, engine.y - dCardH, dCardW, dCardH,
                    'DISTANCE', `${result.distanceKm.toFixed(2)} km`, COLORS.brandBlue);
                drawMetricCard(detailPage, fonts, MARGIN + dCardW + dCardGap, engine.y - dCardH, dCardW, dCardH,
                    'MIN CLEARANCE',
                    result.minClearance !== null ? `${result.minClearance.toFixed(1)}m` : 'N/A',
                    result.minClearance !== null && result.minClearance >= result.clearanceThresholdUsed ? COLORS.success : COLORS.failure,
                    { valueColor: result.minClearance !== null && result.minClearance >= result.clearanceThresholdUsed ? COLORS.success : COLORS.failure });
                drawMetricCard(detailPage, fonts, MARGIN + 2 * (dCardW + dCardGap), engine.y - dCardH, dCardW, dCardH,
                    'TOWERS', `${result.pointA.towerHeight}m / ${result.pointB.towerHeight}m`, COLORS.brandTeal);

                engine.advance(dCardH + 6);

                // Sites
                engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Sites', engine.y, COLORS.brandBlue);
                engine.advance(2);

                const dColW = (CONTENT_WIDTH - 8) / 2;
                const dSiteH = 34;
                const dNameMaxW = dColW - 40;

                drawBox(engine.page, MARGIN, engine.y - dSiteH, dColW, dSiteH, COLORS.bgLight, COLORS.borderLight, 0.3);
                engine.page.drawRectangle({ x: MARGIN, y: engine.y - dSiteH, width: 3, height: dSiteH, color: COLORS.success });
                engine.page.drawText(truncateText(`A: ${result.pointA.name || 'Site A'}`, engine.fontBold, 8, dNameMaxW), { x: MARGIN + 8, y: engine.y - 10, font: engine.fontBold, size: 8, color: COLORS.textDark });
                engine.page.drawText(`${result.pointA.lat.toFixed(6)}, ${result.pointA.lng.toFixed(6)}`, { x: MARGIN + 8, y: engine.y - 20, font: engine.fontRegular, size: 7, color: COLORS.textMedium });
                engine.page.drawText(`Tower: ${result.pointA.towerHeight}m`, { x: MARGIN + 8, y: engine.y - 29, font: engine.fontRegular, size: 7, color: COLORS.textMedium });

                const dbX = MARGIN + dColW + 8;
                drawBox(engine.page, dbX, engine.y - dSiteH, dColW, dSiteH, COLORS.bgLight, COLORS.borderLight, 0.3);
                engine.page.drawRectangle({ x: dbX, y: engine.y - dSiteH, width: 3, height: dSiteH, color: COLORS.brandBlue });
                engine.page.drawText(truncateText(`B: ${result.pointB.name || 'Site B'}`, engine.fontBold, 8, dNameMaxW), { x: dbX + 8, y: engine.y - 10, font: engine.fontBold, size: 8, color: COLORS.textDark });
                engine.page.drawText(`${result.pointB.lat.toFixed(6)}, ${result.pointB.lng.toFixed(6)}`, { x: dbX + 8, y: engine.y - 20, font: engine.fontRegular, size: 7, color: COLORS.textMedium });
                engine.page.drawText(`Tower: ${result.pointB.towerHeight}m`, { x: dbX + 8, y: engine.y - 29, font: engine.fontRegular, size: 7, color: COLORS.textMedium });

                engine.advance(dSiteH + 6);

                // Device (condensed)
                if (cfg.includeDeviceSpecs && result.deviceCompatibility) {
                    engine.ensureSpace(46);
                    engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Device', engine.y, COLORS.brandTeal);
                    engine.advance(2);
                    engine.y = drawCondensedDeviceInfo(engine.page, fonts, engine.y, result);
                }

                // Map
                if (includeDetailMaps) {
                    engine.ensureSpace(MAP_HEIGHT + 28);
                    engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Map View', engine.y, COLORS.brandTeal);
                    engine.advance(2);
                    engine.y = await drawStaticMap(engine.page, engine.doc, fonts,
                        { lat: result.pointA.lat, lng: result.pointA.lng, name: result.pointA.name },
                        { lat: result.pointB.lat, lng: result.pointB.lng, name: result.pointB.name },
                        { x: MARGIN, yTop: engine.y, width: CONTENT_WIDTH, height: MAP_HEIGHT },
                        apiKey, { maptype: 'hybrid', scale: 2 },
                    );
                    engine.advance(SECTION_GAP);
                }

                // Elevation Profile
                if (includeDetailCharts && result.profile && result.profile.length >= 2) {
                    engine.ensureSpace(CHART_HEIGHT + 28);
                    engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Elevation Profile', engine.y, COLORS.brandBlue);
                    engine.advance(2);

                    let deviceMaxRangeKm: number | undefined;
                    let deviceChartName: string | undefined;
                    if (cfg.includeDeviceSpecs && result.deviceCompatibility?.selectedDevice) {
                        const sd = result.deviceCompatibility.selectedDevice;
                        const device = getDeviceById(sd.deviceId);
                        if (device) { deviceMaxRangeKm = device.maxRangeKm; deviceChartName = device.name; }
                    }

                    drawElevationProfile(engine.page, fonts, result.profile, {
                        x: MARGIN, y: engine.y - CHART_HEIGHT, width: CONTENT_WIDTH, height: CHART_HEIGHT,
                        pointAName: result.pointA.name || 'Site A',
                        pointBName: result.pointB.name || 'Site B',
                        totalDistanceKm: result.distanceKm,
                        losPossible: result.losPossible,
                        minClearance: result.minClearance,
                        showLegend: true,
                        deviceMaxRangeKm, deviceName: deviceChartName,
                    });
                    engine.advance(CHART_HEIGHT + SECTION_GAP);
                }

                // Narrative — flows on same page if space, otherwise continues on next
                if (cfg.includeNarrative) {
                    const narrative = generateNarrative(result, fiber, cfg.includeDeviceSpecs);
                    const nLines = wrapText(narrative, engine.fontRegular, FONT_SIZES.bodySmall, CONTENT_WIDTH - 16);
                    const nBoxH = Math.max(20, nLines.length * 10 + 8);

                    engine.ensureSpace(Math.min(nBoxH + 28, 100));
                    engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Analysis', engine.y, COLORS.brandBlue);
                    engine.advance(2);

                    const drawH = Math.min(nBoxH, engine.availableSpace);
                    drawBox(engine.page, MARGIN, engine.y - drawH, CONTENT_WIDTH, drawH, COLORS.bgLight, COLORS.borderLight, 0.3);
                    engine.page.drawRectangle({ x: MARGIN, y: engine.y - drawH, width: 3, height: drawH, color: COLORS.brandBlue });

                    let ny = engine.y - 8;
                    for (const line of nLines) {
                        if (ny < engine.y - drawH + 3) break;
                        engine.page.drawText(line, { x: MARGIN + 8, y: ny, font: engine.fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium });
                        ny -= 10;
                    }
                    engine.advance(drawH + 4);
                }

                // Fiber
                const hasFiber = fiber?.status === 'success' && fiber.totalDistanceMeters;
                if (hasFiber && fiber) {
                    if (engine.availableSpace > 44) {
                        engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Fiber Path', engine.y, COLORS.fiberBlue);
                        engine.advance(2);
                        const fbH = 16;
                        drawBox(engine.page, MARGIN, engine.y - fbH, CONTENT_WIDTH, fbH, COLORS.bgLight, COLORS.borderLight, 0.3);
                        engine.page.drawRectangle({ x: MARGIN, y: engine.y - fbH, width: 3, height: fbH, color: COLORS.fiberBlue });
                        const fText = truncateText(
                            `Total: ${fiber.totalDistanceMeters!.toFixed(0)}m | Offset A: ${fiber.offsetDistanceA_meters?.toFixed(0) || 'N/A'}m | Road: ${fiber.roadRouteDistanceMeters?.toFixed(0) || 'N/A'}m | Offset B: ${fiber.offsetDistanceB_meters?.toFixed(0) || 'N/A'}m`,
                            engine.fontRegular, 7.5, CONTENT_WIDTH - 20,
                        );
                        engine.page.drawText(sanitize(fText), { x: MARGIN + 8, y: engine.y - 11, font: engine.fontRegular, size: 7.5, color: COLORS.fiberBlue });
                        engine.advance(fbH + 4);
                    }
                }

                // Additional notes on last detail page only
                if (i === links.length - 1 && cfg.additionalNotes) {
                    const noteLines = wrapText(cfg.additionalNotes, engine.fontRegular, FONT_SIZES.body, CONTENT_WIDTH - 12);
                    const noteH = Math.max(18, noteLines.length * 12 + 8);
                    if (engine.availableSpace > noteH + 28) {
                        engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Notes', engine.y, COLORS.textMedium);
                        engine.advance(4);
                        for (const line of noteLines) {
                            if (engine.availableSpace < 14) break;
                            engine.page.drawText(line, {
                                x: MARGIN + 8, y: engine.y,
                                font: engine.fontRegular, size: FONT_SIZES.body, color: COLORS.textMedium,
                            });
                            engine.advance(12);
                        }
                    }
                }
            }
        } else if (cfg.additionalNotes) {
            // No detail pages — put notes after table
            engine.advance(4);
            const noteLines = wrapText(cfg.additionalNotes, engine.fontRegular, FONT_SIZES.body, CONTENT_WIDTH - 12);
            if (engine.availableSpace > 40) {
                engine.y = drawSectionHeader(engine.page, engine.fontBold, 'Notes', engine.y, COLORS.textMedium);
                engine.advance(4);
                for (const line of noteLines) {
                    if (engine.availableSpace < 14) break;
                    engine.page.drawText(line, {
                        x: MARGIN + 8, y: engine.y,
                        font: engine.fontRegular, size: FONT_SIZES.body, color: COLORS.textMedium,
                    });
                    engine.advance(12);
                }
            }
        }

        // ══════════════════════════════════════════════════
        // NO FINAL SUMMARY PAGE — everything is on page 1
        // ══════════════════════════════════════════════════

        // ══════════════════════════════════════════════════
        // FINALIZE
        // ══════════════════════════════════════════════════
        return engine.save();
    } catch (error) {
        console.error('REPORT_ERROR: Failed to generate combined PDF report:', error);
        throw new Error(`Failed to generate combined PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}