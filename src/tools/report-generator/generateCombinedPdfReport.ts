// src/tools/report-generator/generateCombinedPdfReport.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PDFPage, PDFFont, RGB } from 'pdf-lib';
import type { SavedLink } from '@/types';
import type { AnalysisResult } from '@/types';
import type { CombinedReportOptions } from './types';
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
    drawKeyValue,
    formatReportDate,
    wrapText,
} from './pdfStyles';
import { generateNarrative, generateShortSummary } from './narrativeTemplates';
import { drawElevationProfile } from './pdfElevationChart';
import { drawStaticMap, getStaticMapsApiKey } from './pdfStaticMap';

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════
const DEFAULT_MAX_DETAIL_PAGES = 15;
const HERO_HEIGHT = 150;
const HERO_BG = rgb(0.11, 0.12, 0.16);
const HERO_TEXT = rgb(1, 1, 1);
const HERO_TEXT_SUB = rgb(0.72, 0.73, 0.78);
const HERO_TEXT_MUTED = rgb(0.52, 0.53, 0.58);

// ═══════════════════════════════════════════════════════
// Helper: Metric Card
// ═══════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════
// Helper: KPI Card (taller, for summary page)
// ═══════════════════════════════════════════════════════
function drawKpiCard(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    value: string,
    accentColor: RGB,
    opts?: { valueSize?: number; valueColor?: RGB; subtitle?: string },
) {
    drawBox(page, x, y, w, h, COLORS.bgLight, COLORS.borderLight, 0.4);
    page.drawRectangle({ x, y: y + h - 4, width: w, height: 4, color: accentColor });
    page.drawText(sanitize(label), {
        x: x + 10, y: y + h - 18,
        font: fonts.regular, size: 7.5, color: COLORS.textMuted,
    });
    page.drawText(sanitize(value), {
        x: x + 10, y: y + (opts?.subtitle ? 18 : 10),
        font: fonts.bold, size: opts?.valueSize ?? 20, color: opts?.valueColor ?? COLORS.textDark,
    });
    if (opts?.subtitle) {
        page.drawText(sanitize(opts.subtitle), {
            x: x + 10, y: y + 6,
            font: fonts.regular, size: 7, color: COLORS.textLight,
        });
    }
}

// ═══════════════════════════════════════════════════════
// Helper: Link Grade
// ═══════════════════════════════════════════════════════
function getLinkGrade(result: AnalysisResult): { letter: string; color: RGB } {
    if (!result.losPossible) return { letter: 'F', color: COLORS.failure };
    const margin = (result.minClearance ?? 0) - result.clearanceThresholdUsed;
    const ratio = result.clearanceThresholdUsed > 0 ? margin / result.clearanceThresholdUsed : margin;
    if (ratio > 2) return { letter: 'A+', color: rgb(0.05, 0.65, 0.25) };
    if (ratio > 1) return { letter: 'A', color: COLORS.success };
    if (ratio > 0.5) return { letter: 'B', color: rgb(0.2, 0.7, 0.35) };
    if (ratio > 0.2) return { letter: 'C', color: rgb(0.85, 0.65, 0.1) };
    if (ratio >= 0) return { letter: 'D', color: rgb(0.9, 0.5, 0.1) };
    return { letter: 'F', color: COLORS.failure };
}

// ═══════════════════════════════════════════════════════
// Helper: Network Grade
// ═══════════════════════════════════════════════════════
function getNetworkGrade(feasiblePct: number): { letter: string; color: RGB } {
    if (feasiblePct >= 100) return { letter: 'A+', color: rgb(0.05, 0.65, 0.25) };
    if (feasiblePct >= 80) return { letter: 'A', color: COLORS.success };
    if (feasiblePct >= 60) return { letter: 'B', color: rgb(0.2, 0.7, 0.35) };
    if (feasiblePct >= 40) return { letter: 'C', color: rgb(0.85, 0.65, 0.1) };
    if (feasiblePct >= 20) return { letter: 'D', color: rgb(0.9, 0.5, 0.1) };
    return { letter: 'F', color: COLORS.failure };
}

// ═══════════════════════════════════════════════════════
// Main Export Function
// ═══════════════════════════════════════════════════════
export async function generateCombinedPdfReport(
    links: SavedLink[],
    options?: CombinedReportOptions,
): Promise<Uint8Array> {
    try {
        const doc = await PDFDocument.create();
        const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
        const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
        const fonts = { regular: fontRegular, bold: fontBold };

        const maxDetailPages = options?.maxDetailPages ?? DEFAULT_MAX_DETAIL_PAGES;
        const includeDetailCharts = options?.includeDetailCharts !== false;
        const includeDetailMaps = options?.includeDetailMaps !== false;
        const showDetailPages = links.length <= maxDetailPages;

        // ── Logo ──
        let logoBytes = options?.logoImageBytes;
        if (!logoBytes && options?.logoUrl !== null) {
            logoBytes = await fetchLogoBytes(options?.logoUrl);
        }

        // ── Statistics ──
        const feasible = links.filter(l => l.analysisResult.losPossible).length;
        const blocked = links.length - feasible;
        const totalDist = links.reduce((s, l) => s + l.analysisResult.distanceKm, 0);
        const avgDist = links.length > 0 ? totalDist / links.length : 0;
        const fiberCount = links.filter(l => l.fiberPathResult?.status === 'success').length;
        const maxDist = links.length > 0 ? Math.max(...links.map(l => l.analysisResult.distanceKm)) : 0;
        const minDist = links.length > 0 ? Math.min(...links.map(l => l.analysisResult.distanceKm)) : 0;
        const feasiblePct = links.length > 0 ? (feasible / links.length) * 100 : 0;
        const totalFiberM = links
            .filter(l => l.fiberPathResult?.status === 'success')
            .reduce((s, l) => s + (l.fiberPathResult?.totalDistanceMeters ?? 0), 0);

        const allPages: ReturnType<typeof doc.addPage>[] = [];

        // ══════════════════════════════════════════════════════
        // PAGE 1: COVER PAGE
        // ══════════════════════════════════════════════════════
        const cover = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        allPages.push(cover);
        drawWatermark(cover, fontRegular);

        // ── Top accent bar ──
        cover.drawRectangle({ x: 0, y: PAGE_HEIGHT - 4, width: PAGE_WIDTH, height: 4, color: COLORS.brandBlue });

        // ── Dark hero section ──
        const heroTop = PAGE_HEIGHT - 4;
        const heroBottom = heroTop - HERO_HEIGHT;
        cover.drawRectangle({ x: 0, y: heroBottom, width: PAGE_WIDTH, height: HERO_HEIGHT, color: HERO_BG });

        // Teal accent line at hero bottom
        cover.drawRectangle({ x: 0, y: heroBottom, width: PAGE_WIDTH, height: 2, color: COLORS.brandTeal });

        // Logo in hero (white badge behind it)
        if (logoBytes) {
            try {
                const logoImage = await doc.embedPng(logoBytes);
                const logoMaxH = 26;
                const scale = logoMaxH / logoImage.height;
                const logoW = logoImage.width * scale;
                // White badge
                cover.drawRectangle({
                    x: MARGIN - 4, y: heroTop - 10 - logoMaxH - 4,
                    width: logoW + 8, height: logoMaxH + 8, color: COLORS.white,
                });
                cover.drawImage(logoImage, {
                    x: MARGIN, y: heroTop - 10 - logoMaxH,
                    width: logoW, height: logoMaxH,
                });
            } catch {
                cover.drawText(BRANDING.companyName, {
                    x: MARGIN, y: heroTop - 22,
                    font: fontBold, size: 9, color: HERO_TEXT_SUB,
                });
            }
        } else {
            cover.drawText(BRANDING.companyName, {
                x: MARGIN, y: heroTop - 22,
                font: fontBold, size: 9, color: HERO_TEXT_SUB,
            });
        }

        // Title
        cover.drawText(BRANDING.combinedReportTitle, {
            x: MARGIN, y: heroTop - 64,
            font: fontBold, size: 22, color: HERO_TEXT,
        });

        // Subtitle
        cover.drawText('Multi-Link Line-of-Sight Analysis', {
            x: MARGIN, y: heroTop - 84,
            font: fontRegular, size: 12, color: HERO_TEXT_SUB,
        });

        // Date
        cover.drawText(formatReportDate(), {
            x: MARGIN, y: heroTop - 102,
            font: fontRegular, size: 9, color: HERO_TEXT_MUTED,
        });

        // Quick stats in hero (right side)
        const heroStatX = PAGE_WIDTH - MARGIN - 130;
        cover.drawText(`${links.length}`, {
            x: heroStatX, y: heroTop - 50,
            font: fontBold, size: 32, color: HERO_TEXT,
        });
        cover.drawText('Links Analyzed', {
            x: heroStatX, y: heroTop - 64,
            font: fontRegular, size: 9, color: HERO_TEXT_SUB,
        });

        const feasPctStr = `${feasiblePct.toFixed(0)}%`;
        cover.drawText(feasPctStr, {
            x: heroStatX, y: heroTop - 90,
            font: fontBold, size: 20, color: feasiblePct >= 50 ? COLORS.brandTealLight : COLORS.failureLight,
        });
        cover.drawText('Feasibility Rate', {
            x: heroStatX, y: heroTop - 102,
            font: fontRegular, size: 9, color: HERO_TEXT_SUB,
        });

        let y = heroBottom - 14;

        // ── Executive Summary — 2 rows of 3 cards ──
        y = drawSectionHeader(cover, fontBold, 'Executive Summary', y, COLORS.brandBlue);
        y -= 6;

        const cardGap = 6;
        const cardW = (CONTENT_WIDTH - 2 * cardGap) / 3;
        const cardH = 48;

        // Row 1
        drawMetricCard(cover, fonts, MARGIN, y - cardH, cardW, cardH,
            'TOTAL LINKS', `${links.length}`, COLORS.brandBlue);
        drawMetricCard(cover, fonts, MARGIN + cardW + cardGap, y - cardH, cardW, cardH,
            'FEASIBLE', `${feasible}`, COLORS.success, { valueColor: COLORS.success });
        drawMetricCard(cover, fonts, MARGIN + 2 * (cardW + cardGap), y - cardH, cardW, cardH,
            'BLOCKED', `${blocked}`, COLORS.failure, { valueColor: COLORS.failure });

        y -= cardH + cardGap;

        // Row 2
        drawMetricCard(cover, fonts, MARGIN, y - cardH, cardW, cardH,
            'TOTAL DISTANCE', `${totalDist.toFixed(1)} km`, COLORS.brandTeal);
        drawMetricCard(cover, fonts, MARGIN + cardW + cardGap, y - cardH, cardW, cardH,
            'AVG DISTANCE', `${avgDist.toFixed(2)} km`, COLORS.brandTeal);
        drawMetricCard(cover, fonts, MARGIN + 2 * (cardW + cardGap), y - cardH, cardW, cardH,
            'FIBER PATHS', `${fiberCount}`, COLORS.fiberBlue, { valueColor: COLORS.fiberBlue });

        y -= cardH + 14;

        // ── Feasibility Distribution Bar ──
        y = drawSectionHeader(cover, fontBold, 'Feasibility Distribution', y, COLORS.brandTeal);
        y -= 6;

        const barH = 22;
        const barY = y - barH;
        const feasibleW = links.length > 0 ? (feasible / links.length) * CONTENT_WIDTH : 0;
        const blockedW = CONTENT_WIDTH - feasibleW;

        if (feasibleW > 0) {
            drawBox(cover, MARGIN, barY, feasibleW, barH, COLORS.success);
            if (feasibleW > 35) {
                const pt = `${feasiblePct.toFixed(0)}%`;
                cover.drawText(pt, {
                    x: MARGIN + feasibleW / 2 - fontBold.widthOfTextAtSize(pt, 9) / 2,
                    y: barY + 7, font: fontBold, size: 9, color: COLORS.white,
                });
            }
        }
        if (blockedW > 0) {
            drawBox(cover, MARGIN + feasibleW, barY, blockedW, barH, COLORS.failure);
            if (blockedW > 35) {
                const pt = `${(100 - feasiblePct).toFixed(0)}%`;
                cover.drawText(pt, {
                    x: MARGIN + feasibleW + blockedW / 2 - fontBold.widthOfTextAtSize(pt, 9) / 2,
                    y: barY + 7, font: fontBold, size: 9, color: COLORS.white,
                });
            }
        }

        // Legend
        const legendY = barY - 14;
        cover.drawRectangle({ x: MARGIN, y: legendY, width: 8, height: 8, color: COLORS.success });
        cover.drawText(`Feasible (${feasible})`, {
            x: MARGIN + 12, y: legendY + 1,
            font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
        });
        cover.drawRectangle({ x: MARGIN + 100, y: legendY, width: 8, height: 8, color: COLORS.failure });
        cover.drawText(`Blocked (${blocked})`, {
            x: MARGIN + 112, y: legendY + 1,
            font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium,
        });

        y = legendY - 16;

        // ── Distance Analysis ──
        y = drawSectionHeader(cover, fontBold, 'Distance Analysis', y, COLORS.brandBlue);
        y -= 4;

        y = drawKeyValue(cover, fonts, 'Shortest Link', `${minDist.toFixed(2)} km`, y);
        y = drawKeyValue(cover, fonts, 'Longest Link', `${maxDist.toFixed(2)} km`, y);
        y = drawKeyValue(cover, fonts, 'Average Distance', `${avgDist.toFixed(2)} km`, y);
        y = drawKeyValue(cover, fonts, 'Total Combined', `${totalDist.toFixed(1)} km`, y);
        if (fiberCount > 0) {
            y = drawKeyValue(cover, fonts, 'Total Fiber', `${(totalFiberM / 1000).toFixed(2)} km`, y, { valueColor: COLORS.fiberBlue });
        }

        y -= 12;

        // ── Links at a Glance ──
        y = drawSectionHeader(cover, fontBold, 'Links at a Glance', y, COLORS.brandBlue);
        y -= 4;

        const maxPreview = Math.min(links.length, 14);
        const colW2 = (CONTENT_WIDTH - 12) / 2;
        const rowH = 13;

        for (let i = 0; i < maxPreview; i++) {
            const link = links[i];
            const col = i % 2;
            const row = Math.floor(i / 2);
            const lx = MARGIN + col * (colW2 + 12);
            const ly = y - row * rowH;

            if (ly < MARGIN + 50) break;

            // Status dot
            cover.drawCircle({
                x: lx + 4, y: ly - 3, size: 2.5,
                color: link.analysisResult.losPossible ? COLORS.success : COLORS.failure,
            });

            // Name
            const truncName = sanitize(link.name).length > 28
                ? sanitize(link.name).substring(0, 27) + '...'
                : sanitize(link.name);
            cover.drawText(truncName, {
                x: lx + 12, y: ly - 5,
                font: fontRegular, size: 7.5, color: COLORS.textDark,
            });

            // Distance (right-aligned within column)
            const distText = `${link.analysisResult.distanceKm.toFixed(1)} km`;
            const distW = fontRegular.widthOfTextAtSize(distText, 7);
            cover.drawText(distText, {
                x: lx + colW2 - distW, y: ly - 5,
                font: fontRegular, size: 7, color: COLORS.textLight,
            });
        }

        if (links.length > maxPreview) {
            const moreY = y - Math.ceil(maxPreview / 2) * rowH;
            cover.drawText(`... and ${links.length - maxPreview} more link(s)`, {
                x: MARGIN + 12, y: moreY - 5,
                font: fontRegular, size: 7, color: COLORS.textMuted,
            });
        }

        // ── Report info box at bottom ──
        const infoBoxH = 36;
        const infoBoxY = MARGIN + 30;
        drawBox(cover, MARGIN, infoBoxY, CONTENT_WIDTH, infoBoxH, COLORS.bgLight, COLORS.borderLight, 0.4);
        cover.drawText('REPORT INFORMATION', {
            x: MARGIN + 8, y: infoBoxY + infoBoxH - 12,
            font: fontBold, size: 7, color: COLORS.textMuted,
        });
        const infoStr = showDetailPages
            ? `This report contains ${links.length} detailed link analysis page(s) with elevation profiles and maps.`
            : `This report contains ${links.length} links in table format. Detail pages generated for ${maxDetailPages} or fewer links.`;
        cover.drawText(sanitize(infoStr), {
            x: MARGIN + 8, y: infoBoxY + 6,
            font: fontRegular, size: 7.5, color: COLORS.textMedium,
        });

        // Bottom accent bar
        cover.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 3, color: COLORS.brandBlue });

        // ══════════════════════════════════════════════════════
        // TABLE PAGES
        // ══════════════════════════════════════════════════════
        const COL = [
            { label: '#', x: MARGIN, w: 22 },
            { label: 'Link Name', x: MARGIN + 22, w: 115 },
            { label: 'Dist (km)', x: MARGIN + 137, w: 55 },
            { label: 'LOS', x: MARGIN + 192, w: 40 },
            { label: 'Clearance', x: MARGIN + 232, w: 60 },
            { label: 'Tower A/B', x: MARGIN + 292, w: 60 },
            { label: 'Fiber (m)', x: MARGIN + 352, w: 55 },
            { label: 'Summary', x: MARGIN + 407, w: 125 },
        ];
        const ROW_H = 18;
        const TABLE_BOTTOM = MARGIN + 30;

        // ── Dark title banner for table page ──
        function drawTableTitleBanner(pg: PDFPage): number {
            const bannerH = 52;
            const bannerY = PAGE_HEIGHT - MARGIN - bannerH;
            pg.drawRectangle({ x: MARGIN, y: bannerY, width: CONTENT_WIDTH, height: bannerH, color: COLORS.bgHeader });

            pg.drawText('Link Analysis Details', {
                x: MARGIN + 12, y: bannerY + bannerH - 20,
                font: fontBold, size: 14, color: COLORS.white,
            });
            pg.drawText(`${links.length} link(s) analyzed`, {
                x: MARGIN + 12, y: bannerY + 8,
                font: fontRegular, size: 8, color: HERO_TEXT_SUB,
            });

            // Status badges (right side)
            const badgeY = bannerY + 14;
            const badgeH = 18;

            // Pass badge
            const passW = 52;
            const passX = PAGE_WIDTH - MARGIN - 12 - passW - 56;
            pg.drawRectangle({ x: passX, y: badgeY, width: passW, height: badgeH, color: COLORS.success });
            pg.drawText(`${feasible} PASS`, {
                x: passX + 8, y: badgeY + 5,
                font: fontBold, size: 8, color: COLORS.white,
            });

            // Fail badge
            const failX = PAGE_WIDTH - MARGIN - 12 - 52;
            pg.drawRectangle({ x: failX, y: badgeY, width: 52, height: badgeH, color: COLORS.failure });
            pg.drawText(`${blocked} FAIL`, {
                x: failX + 8, y: badgeY + 5,
                font: fontBold, size: 8, color: COLORS.white,
            });

            return bannerY - 4;
        }

        function drawTableHeader(pg: PDFPage, startY: number): number {
            pg.drawRectangle({
                x: MARGIN, y: startY - ROW_H, width: CONTENT_WIDTH, height: ROW_H,
                color: COLORS.bgDark,
            });
            COL.forEach(col => {
                pg.drawText(col.label, {
                    x: col.x + 3, y: startY - 13,
                    font: fontBold, size: 7.5, color: COLORS.white,
                });
            });
            return startY - ROW_H;
        }

        function truncate(str: string, max: number): string {
            const s = sanitize(str);
            return s.length > max ? s.slice(0, max - 1) + '...' : s;
        }

        // First table page
        let tablePage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        allPages.push(tablePage);
        drawWatermark(tablePage, fontRegular);
        tablePage.drawRectangle({ x: 0, y: PAGE_HEIGHT - 4, width: PAGE_WIDTH, height: 4, color: COLORS.brandBlue });
        tablePage.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 3, color: COLORS.brandBlue });

        y = drawTableTitleBanner(tablePage);
        y = drawTableHeader(tablePage, y);
        let rowOnPage = 0;
        let isFirstTablePage = true;

        for (let i = 0; i < links.length; i++) {
            const link = links[i];

            if (y - ROW_H < TABLE_BOTTOM) {
                tablePage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
                allPages.push(tablePage);
                drawWatermark(tablePage, fontRegular);
                tablePage.drawRectangle({ x: 0, y: PAGE_HEIGHT - 4, width: PAGE_WIDTH, height: 4, color: COLORS.brandBlue });
                tablePage.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 3, color: COLORS.brandBlue });
                y = drawTableHeader(tablePage, PAGE_HEIGHT - MARGIN);
                rowOnPage = 0;
                isFirstTablePage = false;
            }

            // Alternating rows
            if (rowOnPage % 2 === 0) {
                tablePage.drawRectangle({
                    x: MARGIN, y: y - ROW_H, width: CONTENT_WIDTH, height: ROW_H,
                    color: COLORS.bgLight,
                });
            }

            const rowY = y - 13;
            const los = link.analysisResult.losPossible;
            const mc = link.analysisResult.minClearance;
            const fiberDist = link.fiberPathResult?.status === 'success' && link.fiberPathResult.totalDistanceMeters
                ? link.fiberPathResult.totalDistanceMeters.toFixed(0) : '-';
            const shortSummary = truncate(generateShortSummary(link.analysisResult), 28);

            tablePage.drawText(String(i + 1), { x: COL[0].x + 3, y: rowY, font: fontRegular, size: 7.5, color: COLORS.textMedium });
            tablePage.drawText(truncate(link.name, 22), { x: COL[1].x + 3, y: rowY, font: fontRegular, size: 7.5, color: COLORS.textDark });
            tablePage.drawText(link.analysisResult.distanceKm.toFixed(2), { x: COL[2].x + 3, y: rowY, font: fontRegular, size: 7.5, color: COLORS.textMedium });
            tablePage.drawText(los ? 'PASS' : 'FAIL', { x: COL[3].x + 3, y: rowY, font: fontBold, size: 7.5, color: los ? COLORS.success : COLORS.failure });
            tablePage.drawText(mc !== null ? `${mc.toFixed(1)}m` : 'N/A', { x: COL[4].x + 3, y: rowY, font: fontRegular, size: 7.5, color: COLORS.textMedium });
            tablePage.drawText(`${link.pointA.towerHeight}/${link.pointB.towerHeight}m`, { x: COL[5].x + 3, y: rowY, font: fontRegular, size: 7.5, color: COLORS.textMedium });
            tablePage.drawText(fiberDist, { x: COL[6].x + 3, y: rowY, font: fontRegular, size: 7.5, color: fiberDist !== '-' ? COLORS.fiberBlue : COLORS.textMuted });
            tablePage.drawText(shortSummary, { x: COL[7].x + 3, y: rowY, font: fontRegular, size: 6.5, color: COLORS.textLight });

            y -= ROW_H;
            rowOnPage++;
        }

        // ── Summary row ──
        tablePage.drawRectangle({
            x: MARGIN, y: y - ROW_H, width: CONTENT_WIDTH, height: ROW_H,
            color: COLORS.bgMedium,
        });
        const sumRowY = y - 13;
        tablePage.drawText('TOTAL', { x: COL[0].x + 3, y: sumRowY, font: fontBold, size: 7.5, color: COLORS.textDark });
        tablePage.drawText(`${links.length} links`, { x: COL[1].x + 3, y: sumRowY, font: fontBold, size: 7.5, color: COLORS.textDark });
        tablePage.drawText(`${totalDist.toFixed(1)}`, { x: COL[2].x + 3, y: sumRowY, font: fontBold, size: 7.5, color: COLORS.textDark });
        tablePage.drawText(`${feasible}P/${blocked}F`, { x: COL[3].x + 3, y: sumRowY, font: fontBold, size: 7, color: COLORS.textDark });
        tablePage.drawText('', { x: COL[4].x + 3, y: sumRowY, font: fontBold, size: 7.5, color: COLORS.textDark });
        tablePage.drawText('', { x: COL[5].x + 3, y: sumRowY, font: fontBold, size: 7.5, color: COLORS.textDark });
        tablePage.drawText(fiberCount > 0 ? `${fiberCount} paths` : '-', { x: COL[6].x + 3, y: sumRowY, font: fontBold, size: 7.5, color: fiberCount > 0 ? COLORS.fiberBlue : COLORS.textMuted });
        tablePage.drawText(`${feasiblePct.toFixed(0)}% feasible`, { x: COL[7].x + 3, y: sumRowY, font: fontBold, size: 6.5, color: feasiblePct >= 50 ? COLORS.success : COLORS.failure });

        // ══════════════════════════════════════════════════════
        // DETAIL PAGES
        // ══════════════════════════════════════════════════════
        if (showDetailPages) {
            const apiKey = getStaticMapsApiKey();

            for (let i = 0; i < links.length; i++) {
                const link = links[i];
                const result = link.analysisResult;
                const fiber = link.fiberPathResult;

                const detailPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
                allPages.push(detailPage);
                drawWatermark(detailPage, fontRegular);
                detailPage.drawRectangle({ x: 0, y: PAGE_HEIGHT - 4, width: PAGE_WIDTH, height: 4, color: COLORS.brandBlue });
                detailPage.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 3, color: COLORS.brandBlue });

                y = PAGE_HEIGHT - MARGIN;

                // ── Compact header ──
                if (logoBytes) {
                    try {
                        const logoImage = await doc.embedPng(logoBytes);
                        const lmH = 20;
                        const sc = lmH / logoImage.height;
                        detailPage.drawImage(logoImage, { x: MARGIN, y: y - lmH, width: logoImage.width * sc, height: lmH });
                    } catch {
                        detailPage.drawText(BRANDING.companyName, { x: MARGIN, y: y - 10, font: fontBold, size: 7, color: COLORS.textMedium });
                    }
                } else {
                    detailPage.drawText(BRANDING.companyName, { x: MARGIN, y: y - 10, font: fontBold, size: 7, color: COLORS.textMedium });
                }

                const linkLabel = `Link ${i + 1} of ${links.length}`;
                const llW = fontBold.widthOfTextAtSize(linkLabel, 13);
                detailPage.drawText(linkLabel, { x: PAGE_WIDTH - MARGIN - llW, y: y - 14, font: fontBold, size: 13, color: COLORS.textDark });

                y -= 26;

                // Link name + date
                detailPage.drawText(sanitize(link.name), { x: MARGIN, y, font: fontBold, size: 12, color: COLORS.textDark });
                const dateText = new Date(link.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                const dtW = fontRegular.widthOfTextAtSize(dateText, FONT_SIZES.bodySmall);
                detailPage.drawText(dateText, { x: PAGE_WIDTH - MARGIN - dtW, y, font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textLight });

                y -= 4;
                detailPage.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.5, color: COLORS.borderLight });
                y -= 8;

                // ── Status Banner ──
                const dClear = result.losPossible;
                const bH = 28;
                const dBg = dClear ? COLORS.successBg : COLORS.failureBg;
                const dBorder = dClear ? COLORS.success : COLORS.failure;
                const dColor = dClear ? COLORS.success : COLORS.failure;

                drawBox(detailPage, MARGIN, y - bH, CONTENT_WIDTH, bH, dBg, dBorder, 0.6);
                detailPage.drawRectangle({ x: MARGIN, y: y - bH, width: 3, height: bH, color: dBorder });

                detailPage.drawText(dClear ? 'PASS - LINE OF SIGHT CLEAR' : 'FAIL - LINE OF SIGHT BLOCKED', {
                    x: MARGIN + 10, y: y - 11, font: fontBold, size: 9, color: dColor,
                });
                const cInfo = result.minClearance !== null
                    ? `Clearance: ${result.minClearance.toFixed(1)}m | Threshold: ${result.clearanceThresholdUsed}m | Distance: ${result.distanceKm.toFixed(2)} km`
                    : `Threshold: ${result.clearanceThresholdUsed}m | Distance: ${result.distanceKm.toFixed(2)} km`;
                detailPage.drawText(sanitize(cInfo), {
                    x: MARGIN + 10, y: y - 23, font: fontRegular, size: 7, color: COLORS.textMedium,
                });

                y -= bH + 6;

                // ── Metrics Row (4 cards) ──
                const dCardGap = 5;
                const dCardW = (CONTENT_WIDTH - 3 * dCardGap) / 4;
                const dCardH = 30;
                const grade = getLinkGrade(result);
                const dMarginVal = result.minClearance !== null ? (result.minClearance - result.clearanceThresholdUsed) : null;

                drawMetricCard(detailPage, fonts, MARGIN, y - dCardH, dCardW, dCardH,
                    'GRADE', grade.letter, grade.color, { valueSize: 14, valueColor: grade.color });
                drawMetricCard(detailPage, fonts, MARGIN + dCardW + dCardGap, y - dCardH, dCardW, dCardH,
                    'DISTANCE', `${result.distanceKm.toFixed(2)} km`, COLORS.brandBlue);
                drawMetricCard(detailPage, fonts, MARGIN + 2 * (dCardW + dCardGap), y - dCardH, dCardW, dCardH,
                    'MARGIN', dMarginVal !== null ? `${dMarginVal.toFixed(1)}m` : 'N/A',
                    dMarginVal !== null && dMarginVal >= 0 ? COLORS.success : COLORS.failure,
                    { valueColor: dMarginVal !== null && dMarginVal >= 0 ? COLORS.success : COLORS.failure });
                drawMetricCard(detailPage, fonts, MARGIN + 3 * (dCardW + dCardGap), y - dCardH, dCardW, dCardH,
                    'TOWERS', `${result.pointA.towerHeight}m / ${result.pointB.towerHeight}m`, COLORS.brandTeal);

                y -= dCardH + 6;

                // ── Sites (compact two-column) ──
                y = drawSectionHeader(detailPage, fontBold, 'Sites', y, COLORS.brandBlue);
                y -= 2;

                const dColW = (CONTENT_WIDTH - 8) / 2;
                const dSiteH = 34;

                drawBox(detailPage, MARGIN, y - dSiteH, dColW, dSiteH, COLORS.bgLight, COLORS.borderLight, 0.3);
                detailPage.drawRectangle({ x: MARGIN, y: y - dSiteH, width: 3, height: dSiteH, color: COLORS.success });
                detailPage.drawText(`A: ${sanitize(result.pointA.name || 'Site A')}`, { x: MARGIN + 8, y: y - 10, font: fontBold, size: 8, color: COLORS.textDark });
                detailPage.drawText(`${result.pointA.lat.toFixed(6)}, ${result.pointA.lng.toFixed(6)}`, { x: MARGIN + 8, y: y - 20, font: fontRegular, size: 7, color: COLORS.textMedium });
                detailPage.drawText(`Tower: ${result.pointA.towerHeight}m`, { x: MARGIN + 8, y: y - 29, font: fontRegular, size: 7, color: COLORS.textMedium });

                const dbX = MARGIN + dColW + 8;
                drawBox(detailPage, dbX, y - dSiteH, dColW, dSiteH, COLORS.bgLight, COLORS.borderLight, 0.3);
                detailPage.drawRectangle({ x: dbX, y: y - dSiteH, width: 3, height: dSiteH, color: COLORS.brandBlue });
                detailPage.drawText(`B: ${sanitize(result.pointB.name || 'Site B')}`, { x: dbX + 8, y: y - 10, font: fontBold, size: 8, color: COLORS.textDark });
                detailPage.drawText(`${result.pointB.lat.toFixed(6)}, ${result.pointB.lng.toFixed(6)}`, { x: dbX + 8, y: y - 20, font: fontRegular, size: 7, color: COLORS.textMedium });
                detailPage.drawText(`Tower: ${result.pointB.towerHeight}m`, { x: dbX + 8, y: y - 29, font: fontRegular, size: 7, color: COLORS.textMedium });

                y -= dSiteH + 6;

                // ── Dynamic space allocation ──
                const footerReserve = 28;
                const availableSpace = y - MARGIN - footerReserve;
                const hasFiber = fiber?.status === 'success' && fiber.totalDistanceMeters;
                const fiberSecH = hasFiber ? 44 : 0;
                const sectionOverhead = (includeDetailMaps ? 26 : 0) + (includeDetailCharts ? 26 : 0) + 26 + (hasFiber ? 26 : 0);
                const contentBudget = availableSpace - sectionOverhead - fiberSecH;

                const mapH = includeDetailMaps ? Math.max(100, Math.min(180, Math.floor(contentBudget * 0.38))) : 0;
                const chartH = includeDetailCharts ? Math.max(90, Math.min(160, Math.floor(contentBudget * 0.38))) : 0;
                const narrativeMax = Math.max(28, Math.floor(contentBudget * 0.24));

                // ── Map ──
                if (includeDetailMaps) {
                    y = drawSectionHeader(detailPage, fontBold, 'Map View', y, COLORS.brandTeal);
                    y -= 2;
                    y = await drawStaticMap(detailPage, doc, fonts,
                        { lat: result.pointA.lat, lng: result.pointA.lng, name: result.pointA.name },
                        { lat: result.pointB.lat, lng: result.pointB.lng, name: result.pointB.name },
                        { x: MARGIN, yTop: y, width: CONTENT_WIDTH, height: mapH },
                        apiKey, { maptype: 'hybrid', scale: 2 },
                    );
                    y -= 4;
                }

                // ── Elevation Profile ──
                if (includeDetailCharts && result.profile && result.profile.length >= 2) {
                    y = drawSectionHeader(detailPage, fontBold, 'Elevation Profile', y, COLORS.brandBlue);
                    y -= 2;
                    drawElevationProfile(detailPage, fonts, result.profile, {
                        x: MARGIN, y: y - chartH, width: CONTENT_WIDTH, height: chartH,
                        pointAName: result.pointA.name || 'Site A',
                        pointBName: result.pointB.name || 'Site B',
                        totalDistanceKm: result.distanceKm,
                        losPossible: result.losPossible,
                        minClearance: result.minClearance,
                        showLegend: true,
                    });
                    y -= chartH + 4;
                }

                y -= 2;

                // ── Narrative ──
                y = drawSectionHeader(detailPage, fontBold, 'Analysis', y, COLORS.brandBlue);
                y -= 2;

                const narrative = generateNarrative(result, fiber);
                const nLines = wrapText(narrative, fontRegular, FONT_SIZES.bodySmall, CONTENT_WIDTH - 12);
                const nBoxH = Math.min(narrativeMax, Math.max(20, nLines.length * 10 + 6));

                drawBox(detailPage, MARGIN, y - nBoxH, CONTENT_WIDTH, nBoxH, COLORS.bgLight, COLORS.borderLight, 0.3);
                detailPage.drawRectangle({ x: MARGIN, y: y - nBoxH, width: 3, height: nBoxH, color: COLORS.brandBlue });

                let ny = y - 8;
                for (const line of nLines) {
                    if (ny < y - nBoxH + 3) break;
                    detailPage.drawText(line, { x: MARGIN + 8, y: ny, font: fontRegular, size: FONT_SIZES.bodySmall, color: COLORS.textMedium });
                    ny -= 10;
                }
                y -= nBoxH + 4;

                // ── Fiber ──
                if (hasFiber && fiber) {
                    if (y > MARGIN + 55) {
                        y = drawSectionHeader(detailPage, fontBold, 'Fiber Path', y, COLORS.fiberBlue);
                        y -= 2;
                        const fbH = 16;
                        drawBox(detailPage, MARGIN, y - fbH, CONTENT_WIDTH, fbH, COLORS.bgLight, COLORS.borderLight, 0.3);
                        detailPage.drawRectangle({ x: MARGIN, y: y - fbH, width: 3, height: fbH, color: COLORS.fiberBlue });
                        const fText = `Total: ${fiber.totalDistanceMeters!.toFixed(0)}m | Offset A: ${fiber.offsetDistanceA_meters?.toFixed(0) || 'N/A'}m | Road: ${fiber.roadRouteDistanceMeters?.toFixed(0) || 'N/A'}m | Offset B: ${fiber.offsetDistanceB_meters?.toFixed(0) || 'N/A'}m`;
                        detailPage.drawText(sanitize(fText), { x: MARGIN + 8, y: y - 11, font: fontRegular, size: 7.5, color: COLORS.fiberBlue });
                    }
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // SUMMARY & RECOMMENDATIONS PAGE
        // ══════════════════════════════════════════════════════
        const summaryPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        allPages.push(summaryPage);
        drawWatermark(summaryPage, fontRegular);
        summaryPage.drawRectangle({ x: 0, y: PAGE_HEIGHT - 4, width: PAGE_WIDTH, height: 4, color: COLORS.brandBlue });
        summaryPage.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: 3, color: COLORS.brandBlue });

        // ── Dark title bar ──
        const sumBannerH = 36;
        const sumBannerY = PAGE_HEIGHT - MARGIN - sumBannerH;
        summaryPage.drawRectangle({ x: MARGIN, y: sumBannerY, width: CONTENT_WIDTH, height: sumBannerH, color: COLORS.bgHeader });
        summaryPage.drawText('Summary & Recommendations', {
            x: MARGIN + 12, y: sumBannerY + 12,
            font: fontBold, size: 14, color: COLORS.white,
        });

        y = sumBannerY - 12;

        // ── KPI Cards (3 across) ──
        const kpiW = (CONTENT_WIDTH - 2 * cardGap) / 3;
        const kpiH = 65;
        const netGrade = getNetworkGrade(feasiblePct);

        drawKpiCard(summaryPage, fonts, MARGIN, y - kpiH, kpiW, kpiH,
            'FEASIBILITY RATE', `${feasiblePct.toFixed(0)}%`,
            feasiblePct >= 50 ? COLORS.success : COLORS.failure,
            { valueSize: 26, valueColor: feasiblePct >= 50 ? COLORS.success : COLORS.failure, subtitle: `${feasible} of ${links.length} links clear` });

        drawKpiCard(summaryPage, fonts, MARGIN + kpiW + cardGap, y - kpiH, kpiW, kpiH,
            'AVG LINK DISTANCE', `${avgDist.toFixed(1)} km`,
            COLORS.brandBlue,
            { valueSize: 22, subtitle: `Range: ${minDist.toFixed(1)} - ${maxDist.toFixed(1)} km` });

        drawKpiCard(summaryPage, fonts, MARGIN + 2 * (kpiW + cardGap), y - kpiH, kpiW, kpiH,
            'NETWORK GRADE', netGrade.letter,
            netGrade.color,
            { valueSize: 28, valueColor: netGrade.color, subtitle: `Based on ${links.length} analyzed links` });

        y -= kpiH + 14;

        // ── Feasibility Overview ──
        y = drawSectionHeader(summaryPage, fontBold, 'Feasibility Overview', y, COLORS.brandTeal);
        y -= 6;

        // Bar
        const sBarH = 18;
        const sBarY = y - sBarH;
        const sFeasW = links.length > 0 ? (feasible / links.length) * CONTENT_WIDTH : 0;
        const sBlockW = CONTENT_WIDTH - sFeasW;

        if (sFeasW > 0) drawBox(summaryPage, MARGIN, sBarY, sFeasW, sBarH, COLORS.success);
        if (sBlockW > 0) drawBox(summaryPage, MARGIN + sFeasW, sBarY, sBlockW, sBarH, COLORS.failure);

        // Labels
        if (sFeasW > 30) {
            const fp = `${feasible} Pass`;
            summaryPage.drawText(fp, { x: MARGIN + sFeasW / 2 - fontBold.widthOfTextAtSize(fp, 8) / 2, y: sBarY + 5, font: fontBold, size: 8, color: COLORS.white });
        }
        if (sBlockW > 30) {
            const fl = `${blocked} Fail`;
            summaryPage.drawText(fl, { x: MARGIN + sFeasW + sBlockW / 2 - fontBold.widthOfTextAtSize(fl, 8) / 2, y: sBarY + 5, font: fontBold, size: 8, color: COLORS.white });
        }

        y = sBarY - 14;

        // ── Aggregate Statistics ──
        y = drawSectionHeader(summaryPage, fontBold, 'Aggregate Statistics', y, COLORS.brandBlue);
        y -= 4;

        y = drawKeyValue(summaryPage, fonts, 'Total Links Analyzed', `${links.length}`, y);
        y = drawKeyValue(summaryPage, fonts, 'Feasible Links', `${feasible} (${feasiblePct.toFixed(0)}%)`, y, { valueColor: COLORS.success });
        y = drawKeyValue(summaryPage, fonts, 'Blocked Links', `${blocked} (${(100 - feasiblePct).toFixed(0)}%)`, y, { valueColor: COLORS.failure });
        y = drawKeyValue(summaryPage, fonts, 'Total Aerial Distance', `${totalDist.toFixed(1)} km`, y);
        y = drawKeyValue(summaryPage, fonts, 'Distance Range', `${minDist.toFixed(2)} - ${maxDist.toFixed(2)} km`, y);
        y = drawKeyValue(summaryPage, fonts, 'Average Link Distance', `${avgDist.toFixed(2)} km`, y);

        if (fiberCount > 0) {
            y = drawKeyValue(summaryPage, fonts, 'Fiber Paths Calculated', `${fiberCount}`, y, { valueColor: COLORS.fiberBlue });
            y = drawKeyValue(summaryPage, fonts, 'Total Fiber Distance', `${(totalFiberM / 1000).toFixed(2)} km`, y, { valueColor: COLORS.fiberBlue });
        }

        y -= 12;

        // ── Recommendations ──
        y = drawSectionHeader(summaryPage, fontBold, 'Recommendations', y, COLORS.brandTeal);
        y -= 6;

        const recommendations: string[] = [];

        if (feasible === links.length) {
            recommendations.push('All analyzed links show clear line-of-sight. The network topology is favorable for FSO deployment across all surveyed paths.');
        } else if (feasible > blocked) {
            recommendations.push(`${feasible} of ${links.length} links are feasible. The ${blocked} blocked link(s) may require tower height adjustments, alternative routing, or fiber-optic backup paths.`);
        } else if (blocked > feasible) {
            recommendations.push(`Only ${feasible} of ${links.length} links are feasible. Consider a comprehensive site survey to identify optimal tower positions or evaluate fiber-optic alternatives for blocked routes.`);
        } else {
            recommendations.push('Results are evenly split between feasible and blocked. Prioritize feasible links for immediate deployment and evaluate blocked links for optimization.');
        }

        if (fiberCount > 0) {
            recommendations.push(`Fiber path analysis completed for ${fiberCount} link(s), providing backup or primary connectivity options for blocked paths.`);
        }

        const longestLink = links.reduce((max, l) => (l.analysisResult.distanceKm > max.analysisResult.distanceKm ? l : max), links[0]);
        if (longestLink && longestLink.analysisResult.distanceKm > 5) {
            recommendations.push(`The longest link (${sanitize(longestLink.name)}, ${longestLink.analysisResult.distanceKm.toFixed(2)} km) should be evaluated for atmospheric availability and equipment range.`);
        }

        const marginalLinks = links.filter(l => {
            if (!l.analysisResult.losPossible) return false;
            const m = (l.analysisResult.minClearance ?? 0) - l.analysisResult.clearanceThresholdUsed;
            return m < 3 && m >= 0;
        });
        if (marginalLinks.length > 0) {
            recommendations.push(`${marginalLinks.length} link(s) have marginal clearance (<3m above threshold). Consider increasing tower heights for improved reliability.`);
        }

        for (const rec of recommendations) {
            const recLines = wrapText(rec, fontRegular, FONT_SIZES.body, CONTENT_WIDTH - 18);
            summaryPage.drawCircle({ x: MARGIN + 5, y: y - 3, size: 2.5, color: COLORS.brandTeal });
            for (const line of recLines) {
                if (y < MARGIN + 80) break;
                summaryPage.drawText(line, {
                    x: MARGIN + 14, y: y - 4,
                    font: fontRegular, size: FONT_SIZES.body, color: COLORS.textMedium,
                });
                y -= 12;
            }
            y -= 6;
        }

        // ── Confidentiality / Report Info Box ──
        const confBoxH = 48;
        const confBoxY = MARGIN + 30;
        drawBox(summaryPage, MARGIN, confBoxY, CONTENT_WIDTH, confBoxH, COLORS.bgLight, COLORS.borderLight, 0.4);
        summaryPage.drawRectangle({ x: MARGIN, y: confBoxY, width: 3, height: confBoxH, color: COLORS.brandBlue });

        summaryPage.drawText('REPORT INFORMATION', {
            x: MARGIN + 10, y: confBoxY + confBoxH - 13,
            font: fontBold, size: 7.5, color: COLORS.textMuted,
        });
        summaryPage.drawText(`Generated by ${BRANDING.productName} | ${BRANDING.domain}`, {
            x: MARGIN + 10, y: confBoxY + confBoxH - 25,
            font: fontRegular, size: 7.5, color: COLORS.textMedium,
        });
        summaryPage.drawText(`Report Date: ${formatReportDate()} | ${BRANDING.madeBy}`, {
            x: MARGIN + 10, y: confBoxY + confBoxH - 36,
            font: fontRegular, size: 7.5, color: COLORS.textMedium,
        });
        summaryPage.drawText('This report is generated from automated analysis and should be validated with field surveys before deployment decisions.', {
            x: MARGIN + 10, y: confBoxY + 4,
            font: fontRegular, size: 6.5, color: COLORS.textLight,
        });

        // ══════════════════════════════════════════════════════
        // APPLY FOOTERS TO ALL PAGES
        // ══════════════════════════════════════════════════════
        const totalPages = allPages.length;
        for (let i = 0; i < totalPages; i++) {
            drawBrandedFooter(allPages[i], fontRegular, i + 1, totalPages);
        }

        return doc.save();
    } catch (error) {
        console.error('REPORT_ERROR: Failed to generate combined PDF report:', error);
        throw new Error(`Failed to generate combined PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}