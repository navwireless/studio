// src/tools/report-generator/pdfStaticMap.ts
import type { PDFPage, PDFDocument, PDFFont } from 'pdf-lib';
import { COLORS, FONT_SIZES, sanitize } from './pdfStyles';

// ═══════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════
const STATIC_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api/staticmap';

export interface StaticMapOptions {
    /** Width in pixels for the static map image (max 640 for free tier) */
    imageWidth?: number;
    /** Height in pixels for the static map image (max 640 for free tier) */
    imageHeight?: number;
    /** Map type: roadmap, satellite, terrain, hybrid */
    maptype?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
    /** Retina scale: 1 or 2 */
    scale?: 1 | 2;
    /** Optional zoom level (auto-calculated if omitted) */
    zoom?: number;
}

interface PointCoords {
    lat: number;
    lng: number;
    name?: string;
}

// ═══════════════════════════════════════════════════════
// Fetch Static Map Image Bytes
// ═══════════════════════════════════════════════════════
export async function fetchStaticMapBytes(
    pointA: PointCoords,
    pointB: PointCoords,
    apiKey: string,
    options?: StaticMapOptions,
): Promise<Uint8Array | null> {
    const imageWidth = options?.imageWidth ?? 600;
    const imageHeight = options?.imageHeight ?? 280;
    const maptype = options?.maptype ?? 'hybrid';
    const scale = options?.scale ?? 2;

    // Build markers
    const markerA = `markers=color:red%7Clabel:A%7C${pointA.lat},${pointA.lng}`;
    const markerB = `markers=color:blue%7Clabel:B%7C${pointB.lat},${pointB.lng}`;

    // Build LOS path line (red, weight 3)
    const path = `path=color:0xFF0000CC%7Cweight:3%7C${pointA.lat},${pointA.lng}%7C${pointB.lat},${pointB.lng}`;

    // Build URL — let Google auto-fit zoom to show both markers
    const params = [
        `size=${imageWidth}x${imageHeight}`,
        `scale=${scale}`,
        `maptype=${maptype}`,
        markerA,
        markerB,
        path,
        `key=${apiKey}`,
    ];

    // Add zoom only if explicitly provided
    if (options?.zoom !== undefined) {
        params.push(`zoom=${options.zoom}`);
    }

    const url = `${STATIC_MAPS_BASE_URL}?${params.join('&')}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(
                `PDF StaticMap: HTTP ${response.status} fetching static map.`,
                `URL (key redacted): ${url.replace(apiKey, 'REDACTED')}`,
            );
            return null;
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('image')) {
            // Google sometimes returns JSON error body with 200 status
            const text = await response.text();
            console.warn('PDF StaticMap: Non-image response:', text.substring(0, 200));
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        console.warn('PDF StaticMap: Network error fetching static map:', error);
        return null;
    }
}

// ═══════════════════════════════════════════════════════
// Embed Static Map Image onto PDF Page
// Returns the Y position below the drawn image,
// or the original Y if drawing failed (with placeholder)
// ═══════════════════════════════════════════════════════
export async function drawStaticMap(
    page: PDFPage,
    pdfDoc: PDFDocument,
    fonts: { regular: PDFFont; bold: PDFFont },
    pointA: PointCoords,
    pointB: PointCoords,
    placement: {
        /** Left edge of image area */
        x: number;
        /** TOP edge of image area (we draw downward from here) */
        yTop: number;
        /** Available width */
        width: number;
        /** Desired height */
        height: number;
    },
    apiKey: string | null,
    options?: StaticMapOptions,
): Promise<number> {
    const { x, yTop, width, height } = placement;
    // In PDF coords, yTop is the upper edge. Image bottom = yTop - height.
    const imageBottom = yTop - height;

    // ── Try to fetch and embed the map ──
    if (apiKey) {
        try {
            const mapBytes = await fetchStaticMapBytes(pointA, pointB, apiKey, options);

            if (mapBytes) {
                // Detect image format from magic bytes
                let image;
                if (mapBytes[0] === 0x89 && mapBytes[1] === 0x50) {
                    // PNG magic bytes: 89 50 4E 47
                    image = await pdfDoc.embedPng(mapBytes);
                } else {
                    // Assume JPEG (Google Static Maps usually returns PNG, but fallback)
                    image = await pdfDoc.embedJpg(mapBytes);
                }

                // Calculate aspect-fit dimensions
                const imgAspect = image.width / image.height;
                const boxAspect = width / height;

                let drawW = width;
                let drawH = height;
                let drawX = x;
                let drawY = imageBottom;

                if (imgAspect > boxAspect) {
                    // Image is wider — fit to width, center vertically
                    drawH = width / imgAspect;
                    drawY = imageBottom + (height - drawH) / 2;
                } else {
                    // Image is taller — fit to height, center horizontally
                    drawW = height * imgAspect;
                    drawX = x + (width - drawW) / 2;
                }

                // Draw border first
                page.drawRectangle({
                    x,
                    y: imageBottom,
                    width,
                    height,
                    borderColor: COLORS.chartBorder,
                    borderWidth: 0.5,
                });

                // Draw image
                page.drawImage(image, {
                    x: drawX,
                    y: drawY,
                    width: drawW,
                    height: drawH,
                });

                // Draw site labels on map
                drawMapSiteLabels(page, fonts, pointA, pointB, x, imageBottom, width);

                return imageBottom - 4; // Return Y below image with small gap
            }
        } catch (error) {
            console.warn('PDF StaticMap: Failed to embed static map image:', error);
        }
    }

    // ── Fallback: draw placeholder box ──
    return drawMapPlaceholder(page, fonts, pointA, pointB, x, imageBottom, width, height);
}

// ═══════════════════════════════════════════════════════
// Map Site Labels (small overlay labels at bottom of map)
// ═══════════════════════════════════════════════════════
function drawMapSiteLabels(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    pointA: PointCoords,
    pointB: PointCoords,
    x: number,
    y: number,
    width: number,
): void {
    const labelY = y + 4;
    const labelSize = 6;

    // Site A label — bottom left
    const aLabel = `A: ${sanitize(pointA.name || 'Site A')} (${pointA.lat.toFixed(4)}, ${pointA.lng.toFixed(4)})`;
    page.drawText(aLabel, {
        x: x + 4,
        y: labelY,
        font: fonts.regular,
        size: labelSize,
        color: COLORS.white,
    });

    // Site B label — bottom right
    const bLabel = `B: ${sanitize(pointB.name || 'Site B')} (${pointB.lat.toFixed(4)}, ${pointB.lng.toFixed(4)})`;
    const bLabelWidth = fonts.regular.widthOfTextAtSize(bLabel, labelSize);
    page.drawText(bLabel, {
        x: x + width - bLabelWidth - 4,
        y: labelY,
        font: fonts.regular,
        size: labelSize,
        color: COLORS.white,
    });
}

// ═══════════════════════════════════════════════════════
// Placeholder (when static map is unavailable)
// ═══════════════════════════════════════════════════════
function drawMapPlaceholder(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    pointA: PointCoords,
    pointB: PointCoords,
    x: number,
    y: number,
    width: number,
    height: number,
): number {
    // Background
    page.drawRectangle({
        x,
        y,
        width,
        height,
        color: COLORS.bgLight,
        borderColor: COLORS.chartBorder,
        borderWidth: 0.5,
    });

    // Center text
    const titleText = 'Map View';
    const titleWidth = fonts.bold.widthOfTextAtSize(titleText, FONT_SIZES.body);
    page.drawText(titleText, {
        x: x + (width - titleWidth) / 2,
        y: y + height / 2 + 10,
        font: fonts.bold,
        size: FONT_SIZES.body,
        color: COLORS.textLight,
    });

    const subText = 'Static map image unavailable';
    const subWidth = fonts.regular.widthOfTextAtSize(subText, FONT_SIZES.bodySmall);
    page.drawText(subText, {
        x: x + (width - subWidth) / 2,
        y: y + height / 2 - 3,
        font: fonts.regular,
        size: FONT_SIZES.bodySmall,
        color: COLORS.textMuted,
    });

    // Site coordinates
    const coordA = `A: ${pointA.lat.toFixed(6)}, ${pointA.lng.toFixed(6)}`;
    const coordB = `B: ${pointB.lat.toFixed(6)}, ${pointB.lng.toFixed(6)}`;
    const coordAWidth = fonts.regular.widthOfTextAtSize(coordA, FONT_SIZES.label);
    const coordBWidth = fonts.regular.widthOfTextAtSize(coordB, FONT_SIZES.label);

    page.drawText(coordA, {
        x: x + (width - coordAWidth) / 2,
        y: y + height / 2 - 18,
        font: fonts.regular,
        size: FONT_SIZES.label,
        color: COLORS.textMuted,
    });
    page.drawText(coordB, {
        x: x + (width - coordBWidth) / 2,
        y: y + height / 2 - 28,
        font: fonts.regular,
        size: FONT_SIZES.label,
        color: COLORS.textMuted,
    });

    return y - 4;
}

// ═══════════════════════════════════════════════════════
// Utility: Get API key from environment
// ═══════════════════════════════════════════════════════
export function getStaticMapsApiKey(): string | null {
    // Use the same key as the Maps JS API
    // On server-side, check both possible env variable names
    const key =
        process.env.GOOGLE_ELEVATION_API_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!key || key.includes('YOUR_') || key.trim() === '') {
        console.warn('PDF StaticMap: No valid Google Maps API key found.');
        return null;
    }

    return key.trim();
}