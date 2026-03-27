// src/tools/report-generator/pdfStyles.ts
import { PDFPage, PDFFont, PDFDocument, rgb, degrees, type RGB } from 'pdf-lib';

// ═══════════════════════════════════════════════════════
// Page Dimensions (US Letter)
// ═══════════════════════════════════════════════════════
export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 792;
export const MARGIN = 40;
export const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

// ═══════════════════════════════════════════════════════
// Brand Colors
// ═══════════════════════════════════════════════════════
export const COLORS = {
    brandBlue: rgb(0.247, 0.318, 0.71),
    brandTeal: rgb(0, 0.588, 0.533),
    brandTealLight: rgb(0.2, 0.78, 0.45),

    success: rgb(0.1, 0.7, 0.3),
    successBg: rgb(0.9, 0.97, 0.91),
    successLight: rgb(0.6, 0.92, 0.7),
    failure: rgb(0.8, 0.15, 0.15),
    failureBg: rgb(0.98, 0.91, 0.91),
    failureLight: rgb(0.95, 0.7, 0.7),

    textDark: rgb(0.1, 0.1, 0.12),
    textMedium: rgb(0.3, 0.3, 0.35),
    textLight: rgb(0.5, 0.5, 0.55),
    textMuted: rgb(0.65, 0.65, 0.7),
    white: rgb(1, 1, 1),

    bgLight: rgb(0.96, 0.96, 0.97),
    bgMedium: rgb(0.92, 0.92, 0.94),
    bgDark: rgb(0.15, 0.16, 0.2),
    bgHeader: rgb(0.12, 0.13, 0.17),

    terrainFill: rgb(0.78, 0.87, 0.95),
    terrainStroke: rgb(0.4, 0.55, 0.75),
    losLineClear: rgb(0.1, 0.75, 0.4),
    losLineBlocked: rgb(0.85, 0.2, 0.2),
    obstructionDot: rgb(0.9, 0.15, 0.15),
    towerLine: rgb(0.85, 0.7, 0.2),
    towerHandle: rgb(0.9, 0.75, 0.25),
    gridLine: rgb(0.85, 0.85, 0.88),
    chartBg: rgb(0.98, 0.98, 0.99),
    chartBorder: rgb(0.82, 0.82, 0.85),

    borderLight: rgb(0.85, 0.85, 0.88),
    borderMedium: rgb(0.75, 0.75, 0.78),

    fiberBlue: rgb(0.2, 0.5, 0.9),
} as const;

// ═══════════════════════════════════════════════════════
// Font Sizes
// ═══════════════════════════════════════════════════════
export const FONT_SIZES = {
    title: 18,
    sectionHeader: 11,
    body: 9.5,
    bodySmall: 8.5,
    label: 7.5,
    footer: 7,
    watermark: 36,
    statusBanner: 14,
    statusDetail: 9,
    metricValue: 11,
    metricLabel: 7,
    chartAxis: 7,
    chartLabel: 8,
} as const;

// ═══════════════════════════════════════════════════════
// Branding Constants
// ═══════════════════════════════════════════════════════
export const BRANDING = {
    companyName: 'Nav Wireless Technologies Pvt. Ltd.',
    productName: 'LiFi Link Pro',
    domain: 'findlos.com',
    reportTitle: 'LiFi Link Feasibility Report',
    fiberReportTitle: 'Fiber Path Analysis Report',
    combinedReportTitle: 'Combined Link Analysis Report',
    madeBy: 'Made by Raj Patel',
    logoUrl: 'https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png',
} as const;

// ═══════════════════════════════════════════════════════
// Sanitize text for WinAnsi encoding
// ═══════════════════════════════════════════════════════
export function sanitize(str: string): string {
    return str
        .replace(/→/g, '->')
        .replace(/←/g, '<-')
        .replace(/…/g, '...')
        .replace(/—/g, '--')
        .replace(/–/g, '-')
        .replace(/\u2018|\u2019/g, "'")
        .replace(/\u201C|\u201D/g, '"')
        .replace(/•/g, '-')
        .replace(/\u2713/g, 'PASS')
        .replace(/\u2717/g, 'FAIL')
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

// ═══════════════════════════════════════════════════════
// Draw filled box with optional border
// ═══════════════════════════════════════════════════════
export function drawBox(
    page: PDFPage,
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: RGB,
    borderColor?: RGB,
    borderWidth?: number,
) {
    page.drawRectangle({ x, y, width, height, color: fillColor });
    if (borderColor) {
        page.drawRectangle({
            x, y, width, height,
            borderColor,
            borderWidth: borderWidth ?? 0.5,
        });
    }
}

// ═══════════════════════════════════════════════════════
// Fetch Logo Image Bytes
// ═══════════════════════════════════════════════════════
export async function fetchLogoBytes(url?: string): Promise<Uint8Array | undefined> {
    const logoUrl = url || BRANDING.logoUrl;
    try {
        const response = await fetch(logoUrl);
        if (!response.ok) {
            console.warn(`PDF: Failed to fetch logo: ${response.status} from ${logoUrl}`);
            return undefined;
        }
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        console.warn('PDF: Error fetching logo:', error);
        return undefined;
    }
}

// ═══════════════════════════════════════════════════════
// Branded Header — returns Y below header
// ═══════════════════════════════════════════════════════
export async function drawBrandedHeader(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    pdfDoc: PDFDocument,
    title?: string,
    logoBytes?: Uint8Array,
): Promise<number> {
    const reportTitle = title || BRANDING.reportTitle;
    const headerY = PAGE_HEIGHT - MARGIN;
    let logoDrawn = false;

    if (logoBytes) {
        try {
            const logoImage = await pdfDoc.embedPng(logoBytes);
            const logoMaxH = 28;
            const scale = logoMaxH / logoImage.height;
            const logoW = logoImage.width * scale;
            const logoH = logoMaxH;
            page.drawImage(logoImage, {
                x: MARGIN,
                y: headerY - logoH,
                width: logoW,
                height: logoH,
            });
            logoDrawn = true;
        } catch {
            // Logo embed failed — fall back to text
        }
    }

    if (!logoDrawn) {
        page.drawText(BRANDING.companyName, {
            x: MARGIN,
            y: headerY - 12,
            font: fonts.bold,
            size: 9,
            color: COLORS.textMedium,
        });
    }

    const titleWidth = fonts.bold.widthOfTextAtSize(reportTitle, FONT_SIZES.title);
    page.drawText(reportTitle, {
        x: PAGE_WIDTH - MARGIN - titleWidth,
        y: headerY - 16,
        font: fonts.bold,
        size: FONT_SIZES.title,
        color: COLORS.textDark,
    });

    const lineY = headerY - 32;
    page.drawLine({
        start: { x: MARGIN, y: lineY },
        end: { x: PAGE_WIDTH - MARGIN, y: lineY },
        thickness: 1,
        color: COLORS.borderLight,
    });

    return lineY - 8;
}

// ═══════════════════════════════════════════════════════
// Branded Footer
// ═══════════════════════════════════════════════════════
export function drawBrandedFooter(
    page: PDFPage,
    font: PDFFont,
    pageNumber: number,
    totalPages: number,
) {
    const footerY = MARGIN - 18;

    page.drawLine({
        start: { x: MARGIN, y: footerY + 12 },
        end: { x: PAGE_WIDTH - MARGIN, y: footerY + 12 },
        thickness: 0.5,
        color: COLORS.borderLight,
    });

    // Left: company + domain
    page.drawText(`${BRANDING.companyName} | ${BRANDING.domain}`, {
        x: MARGIN,
        y: footerY,
        font,
        size: FONT_SIZES.footer,
        color: COLORS.textMuted,
    });

    // Center: Made by
    const madeByWidth = font.widthOfTextAtSize(BRANDING.madeBy, FONT_SIZES.footer);
    page.drawText(BRANDING.madeBy, {
        x: (PAGE_WIDTH - madeByWidth) / 2,
        y: footerY,
        font,
        size: FONT_SIZES.footer,
        color: COLORS.textMuted,
    });

    // Right: page number
    const pageText = `Page ${pageNumber} of ${totalPages}`;
    const pageWidth = font.widthOfTextAtSize(pageText, FONT_SIZES.footer);
    page.drawText(pageText, {
        x: PAGE_WIDTH - MARGIN - pageWidth,
        y: footerY,
        font,
        size: FONT_SIZES.footer,
        color: COLORS.textMuted,
    });
}

// ═══════════════════════════════════════════════════════
// Watermark — diagonal semi-transparent
// ═══════════════════════════════════════════════════════
export function drawWatermark(page: PDFPage, font: PDFFont) {
    const text = BRANDING.domain.toUpperCase();
    const size = FONT_SIZES.watermark;
    const textWidth = font.widthOfTextAtSize(text, size);

    page.drawText(text, {
        x: (PAGE_WIDTH - textWidth) / 2,
        y: PAGE_HEIGHT / 2 - 10,
        font,
        size,
        color: rgb(0.92, 0.92, 0.94),
        opacity: 0.07,
        rotate: degrees(-35),
    });
}

// ═══════════════════════════════════════════════════════
// Section Header — colored left bar + tinted background
// ═══════════════════════════════════════════════════════
export function drawSectionHeader(
    page: PDFPage,
    font: PDFFont,
    text: string,
    y: number,
    color?: RGB,
): number {
    const headerColor = color || COLORS.brandBlue;

    // Tinted background
    page.drawRectangle({
        x: MARGIN,
        y: y - 14,
        width: CONTENT_WIDTH,
        height: 16,
        color: rgb(
            Math.min(1, headerColor.red * 0.15 + 0.92),
            Math.min(1, headerColor.green * 0.15 + 0.92),
            Math.min(1, headerColor.blue * 0.15 + 0.92),
        ),
    });

    // Left accent bar
    page.drawRectangle({
        x: MARGIN,
        y: y - 14,
        width: 3,
        height: 16,
        color: headerColor,
    });

    page.drawText(sanitize(text), {
        x: MARGIN + 10,
        y: y - 10,
        font,
        size: FONT_SIZES.sectionHeader,
        color: headerColor,
    });

    return y - 22;
}

// ═══════════════════════════════════════════════════════
// Key-Value Row — label on left, bold value on right
// ═══════════════════════════════════════════════════════
export function drawKeyValue(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    key: string,
    value: string,
    y: number,
    options?: {
        keyX?: number;
        valueX?: number;
        valueColor?: RGB;
    },
): number {
    const keyX = options?.keyX ?? MARGIN + 5;
    const valueX = options?.valueX ?? MARGIN + 140;
    const valueColor = options?.valueColor ?? COLORS.textDark;

    page.drawText(sanitize(key) + ':', {
        x: keyX,
        y,
        font: fonts.regular,
        size: FONT_SIZES.body,
        color: COLORS.textMedium,
    });

    page.drawText(sanitize(value), {
        x: valueX,
        y,
        font: fonts.bold,
        size: FONT_SIZES.body,
        color: valueColor,
    });

    return y - 13;
}

// ═══════════════════════════════════════════════════════
// Date Formatter
// ═══════════════════════════════════════════════════════
export function formatReportDate(): string {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// ═══════════════════════════════════════════════════════
// Wrap text to fit within maxWidth — returns array of lines
// ═══════════════════════════════════════════════════════
export function wrapText(
    text: string,
    font: PDFFont,
    fontSize: number,
    maxWidth: number,
): string[] {
    const sanitized = sanitize(text);
    const words = sanitized.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}