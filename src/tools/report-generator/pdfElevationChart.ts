// src/tools/report-generator/pdfElevationChart.ts
import type { PDFPage, PDFFont } from 'pdf-lib';
import type { LOSPoint } from '@/types';
import { COLORS, FONT_SIZES, sanitize } from './pdfStyles';

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════
const FILL_SUBDIVISIONS = 3; // Sub-strips per data segment for smooth terrain fill
const H_PAD_PERCENT = 0.05; // 5% horizontal padding each side

// ═══════════════════════════════════════════════════════
// Options interface
// ═══════════════════════════════════════════════════════
export interface ElevationChartOptions {
    /** Left edge of chart area on PDF page */
    x: number;
    /** BOTTOM edge of chart area on PDF page (PDF coords: Y goes UP) */
    y: number;
    /** Total chart width in PDF points */
    width: number;
    /** Total chart height in PDF points */
    height: number;
    /** Display name for Site A */
    pointAName: string;
    /** Display name for Site B */
    pointBName: string;
    /** Total aerial distance in kilometers */
    totalDistanceKm: number;
    /** Whether LOS is feasible */
    losPossible: boolean;
    /** Minimum clearance value (null if N/A) */
    minClearance: number | null;
    /** Whether to render the bottom legend strip (default: true) */
    showLegend?: boolean;
}

// ═══════════════════════════════════════════════════════
// Main Drawing Function
// ═══════════════════════════════════════════════════════
export function drawElevationProfile(
    page: PDFPage,
    fonts: { regular: PDFFont; bold: PDFFont },
    data: LOSPoint[],
    options: ElevationChartOptions,
): void {
    // ── Guard clauses ──
    if (!data || data.length < 2) return;
    if (!options.totalDistanceKm || options.totalDistanceKm <= 0) return;

    const {
        x: chartX,
        y: chartY,
        width: chartW,
        height: chartH,
        pointAName,
        pointBName,
        totalDistanceKm,
        losPossible,
        minClearance,
        showLegend = true,
    } = options;

    // ── Layout: reserve space for legend ──
    const legendH = showLegend ? 14 : 0;
    const axisLabelH = 12; // Space below plot for X-axis labels
    const plotH = chartH - legendH - axisLabelH;
    const plotY = chartY + legendH + axisLabelH; // Plot area bottom edge (PDF coords)

    if (plotH < 20) return; // Too small to draw anything meaningful

    // ══════════════════════════════════════════════════════
    // 1. Calculate Data Ranges
    // ══════════════════════════════════════════════════════
    const allElevations = data.flatMap(p => [p.terrainElevation, p.losHeight]);
    let minElev = Math.min(...allElevations);
    let maxElev = Math.max(...allElevations);
    const elevRange = maxElev - minElev;
    minElev -= elevRange * 0.15;
    maxElev += elevRange * 0.15;
    if (maxElev <= minElev) {
        maxElev = minElev + 20;
    }

    const maxXKm = totalDistanceKm;

    // ── Effective plot area with horizontal padding ──
    const hPad = chartW * H_PAD_PERCENT;
    const effectiveW = chartW - 2 * hPad;
    const leftLabelW = 30; // Space for Y-axis labels on left
    const plotLeft = chartX + leftLabelW + hPad;
    const effectivePlotW = effectiveW - leftLabelW;

    // ── Mapping functions (PDF coordinates: Y goes UP) ──
    const getX = (distKm: number): number => {
        return plotLeft + (distKm / maxXKm) * effectivePlotW;
    };

    const getY = (elevation: number): number => {
        const ratio = (elevation - minElev) / (maxElev - minElev);
        return plotY + ratio * plotH;
    };

    // Interpolate terrain elevation at any distance
    const getTerrainAtKm = (km: number): number => {
        if (km <= data[0].distance) return data[0].terrainElevation;
        if (km >= data[data.length - 1].distance) return data[data.length - 1].terrainElevation;
        for (let i = 0; i < data.length - 1; i++) {
            if (km >= data[i].distance && km <= data[i + 1].distance) {
                const d1 = data[i].distance;
                const d2 = data[i + 1].distance;
                if (d2 - d1 === 0) return data[i].terrainElevation;
                const t = (km - d1) / (d2 - d1);
                return data[i].terrainElevation + t * (data[i + 1].terrainElevation - data[i].terrainElevation);
            }
        }
        return data[data.length - 1].terrainElevation;
    };

    // Get LOS height at any X position (linear interpolation between tower tops)
    const losAElev = data[0].losHeight;
    const losBElev = data[data.length - 1].losHeight;
    const getLosAtKm = (km: number): number => {
        if (maxXKm === 0) return losAElev;
        const t = km / maxXKm;
        return losAElev + t * (losBElev - losAElev);
    };

    // ══════════════════════════════════════════════════════
    // 2. Draw Chart Background & Border
    // ══════════════════════════════════════════════════════
    page.drawRectangle({
        x: chartX,
        y: plotY,
        width: chartW,
        height: plotH,
        color: COLORS.chartBg,
    });
    page.drawRectangle({
        x: chartX,
        y: plotY,
        width: chartW,
        height: plotH,
        borderColor: COLORS.chartBorder,
        borderWidth: 0.5,
    });

    // ══════════════════════════════════════════════════════
    // 3. Draw Grid Lines & Y-Axis Labels
    // ══════════════════════════════════════════════════════
    const numYTicks = 5;
    for (let i = 0; i <= numYTicks; i++) {
        const val = minElev + (i / numYTicks) * (maxElev - minElev);
        const yPos = getY(val);

        // Grid line
        page.drawLine({
            start: { x: plotLeft, y: yPos },
            end: { x: plotLeft + effectivePlotW, y: yPos },
            thickness: 0.3,
            color: COLORS.gridLine,
        });

        // Y-axis label
        const labelText = `${val.toFixed(0)}m`;
        const labelWidth = fonts.regular.widthOfTextAtSize(labelText, FONT_SIZES.chartAxis);
        page.drawText(labelText, {
            x: plotLeft - labelWidth - 3,
            y: yPos - 2.5,
            font: fonts.regular,
            size: FONT_SIZES.chartAxis,
            color: COLORS.textLight,
        });
    }

    // ══════════════════════════════════════════════════════
    // 4. Draw X-Axis Labels
    // ══════════════════════════════════════════════════════
    const numXTicks = Math.min(6, Math.max(2, Math.floor(maxXKm)));
    for (let i = 0; i <= numXTicks; i++) {
        const distKm = (i / numXTicks) * maxXKm;
        const xPos = getX(distKm);

        // Vertical grid line
        page.drawLine({
            start: { x: xPos, y: plotY },
            end: { x: xPos, y: plotY + plotH },
            thickness: 0.3,
            color: COLORS.gridLine,
        });

        // X-axis label below plot
        const distText = maxXKm < 2
            ? `${(distKm * 1000).toFixed(0)}m`
            : `${distKm.toFixed(1)}km`;
        const textWidth = fonts.regular.widthOfTextAtSize(distText, FONT_SIZES.chartAxis);
        page.drawText(distText, {
            x: xPos - textWidth / 2,
            y: plotY - 10,
            font: fonts.regular,
            size: FONT_SIZES.chartAxis,
            color: COLORS.textLight,
        });
    }

    // ══════════════════════════════════════════════════════
    // 5. Draw Terrain Fill (series of thin rectangles)
    // ══════════════════════════════════════════════════════
    // pdf-lib does not support arbitrary polygon fills, so we approximate
    // terrain area using vertical strip rectangles from terrain line down
    // to the chart baseline.
    const totalStrips = (data.length - 1) * FILL_SUBDIVISIONS;
    for (let s = 0; s < totalStrips; s++) {
        const km1 = (s / totalStrips) * maxXKm;
        const km2 = ((s + 1) / totalStrips) * maxXKm;
        const elev1 = getTerrainAtKm(km1);
        const elev2 = getTerrainAtKm(km2);
        const avgElev = (elev1 + elev2) / 2;

        const x1 = getX(km1);
        const x2 = getX(km2);
        const stripW = x2 - x1;
        if (stripW <= 0) continue;

        const terrainY = getY(avgElev);
        const baseY = plotY;
        const stripH = terrainY - baseY;
        if (stripH <= 0) continue;

        page.drawRectangle({
            x: x1,
            y: baseY,
            width: stripW,
            height: stripH,
            color: COLORS.terrainFill,
        });
    }

    // ══════════════════════════════════════════════════════
    // 6. Draw Terrain Stroke Line (series of small segments)
    // ══════════════════════════════════════════════════════
    for (let i = 0; i < data.length - 1; i++) {
        const x1 = getX(data[i].distance);
        const y1 = getY(data[i].terrainElevation);
        const x2 = getX(data[i + 1].distance);
        const y2 = getY(data[i + 1].terrainElevation);

        page.drawLine({
            start: { x: x1, y: y1 },
            end: { x: x2, y: y2 },
            thickness: 1,
            color: COLORS.terrainStroke,
        });
    }

    // ══════════════════════════════════════════════════════
    // 7. Draw LOS Line
    // ══════════════════════════════════════════════════════
    const losColor = losPossible ? COLORS.losLineClear : COLORS.losLineBlocked;
    const xA = getX(data[0].distance);
    const yA = getY(losAElev);
    const xB = getX(data[data.length - 1].distance);
    const yB = getY(losBElev);

    page.drawLine({
        start: { x: xA, y: yA },
        end: { x: xB, y: yB },
        thickness: 1.2,
        color: losColor,
    });

    // ══════════════════════════════════════════════════════
    // 8. Draw Obstruction Markers
    // ══════════════════════════════════════════════════════
    // Check at every data point (and interpolated midpoints) if terrain
    // intersects or exceeds the LOS line.
    const obstructionCheckPoints = Math.min(200, effectivePlotW);
    for (let i = 0; i <= obstructionCheckPoints; i++) {
        const km = (i / obstructionCheckPoints) * maxXKm;
        const terrainElev = getTerrainAtKm(km);
        const losElev = getLosAtKm(km);

        // Obstruction: terrain is at or above LOS line (within 0.5m tolerance)
        if (terrainElev >= losElev - 0.5) {
            const cx = getX(km);
            const cy = getY(losElev);

            page.drawCircle({
                x: cx,
                y: cy,
                size: 2,
                color: COLORS.obstructionDot,
            });
        }
    }

    // ══════════════════════════════════════════════════════
    // 9. Draw Tower A — vertical line + handle circle
    // ══════════════════════════════════════════════════════
    const terrainAY = getY(data[0].terrainElevation);
    const towerATopY = getY(losAElev);

    // Tower vertical line
    page.drawLine({
        start: { x: xA, y: terrainAY },
        end: { x: xA, y: towerATopY },
        thickness: 1.8,
        color: COLORS.towerLine,
    });

    // Tower handle circle
    page.drawCircle({
        x: xA,
        y: towerATopY,
        size: 4,
        color: COLORS.towerHandle,
        borderColor: COLORS.chartBg,
        borderWidth: 1,
    });

    // Tower height label
    const towerAHeight = (losAElev - data[0].terrainElevation).toFixed(0);
    page.drawText(`${towerAHeight}m`, {
        x: xA + 6,
        y: (terrainAY + towerATopY) / 2 - 3,
        font: fonts.regular,
        size: FONT_SIZES.chartAxis,
        color: COLORS.towerLine,
    });

    // Site A name above handle
    page.drawText(sanitize(pointAName), {
        x: xA - fonts.bold.widthOfTextAtSize(sanitize(pointAName), FONT_SIZES.chartLabel) / 2,
        y: towerATopY + 7,
        font: fonts.bold,
        size: FONT_SIZES.chartLabel,
        color: COLORS.textDark,
    });

    // ══════════════════════════════════════════════════════
    // 10. Draw Tower B — vertical line + handle circle
    // ══════════════════════════════════════════════════════
    const terrainBY = getY(data[data.length - 1].terrainElevation);
    const towerBTopY = getY(losBElev);

    // Tower vertical line
    page.drawLine({
        start: { x: xB, y: terrainBY },
        end: { x: xB, y: towerBTopY },
        thickness: 1.8,
        color: COLORS.towerLine,
    });

    // Tower handle circle
    page.drawCircle({
        x: xB,
        y: towerBTopY,
        size: 4,
        color: COLORS.towerHandle,
        borderColor: COLORS.chartBg,
        borderWidth: 1,
    });

    // Tower height label
    const towerBHeight = (losBElev - data[data.length - 1].terrainElevation).toFixed(0);
    const towerBLabelText = `${towerBHeight}m`;
    const towerBLabelWidth = fonts.regular.widthOfTextAtSize(towerBLabelText, FONT_SIZES.chartAxis);
    page.drawText(towerBLabelText, {
        x: xB - towerBLabelWidth - 6,
        y: (terrainBY + towerBTopY) / 2 - 3,
        font: fonts.regular,
        size: FONT_SIZES.chartAxis,
        color: COLORS.towerLine,
    });

    // Site B name above handle
    const bNameText = sanitize(pointBName);
    page.drawText(bNameText, {
        x: xB - fonts.bold.widthOfTextAtSize(bNameText, FONT_SIZES.chartLabel) / 2,
        y: towerBTopY + 7,
        font: fonts.bold,
        size: FONT_SIZES.chartLabel,
        color: COLORS.textDark,
    });

    // ══════════════════════════════════════════════════════
    // 11. Draw Aerial Distance Label on LOS Line
    // ══════════════════════════════════════════════════════
    const midX = (xA + xB) / 2;
    const midY = (yA + yB) / 2;
    const distLabel = maxXKm < 1
        ? `${(maxXKm * 1000).toFixed(0)}m`
        : `${maxXKm.toFixed(2)}km`;
    const distLabelFull = `Aerial: ${distLabel}`;
    const distLabelWidth = fonts.regular.widthOfTextAtSize(distLabelFull, FONT_SIZES.chartLabel);

    // Background pill for readability
    page.drawRectangle({
        x: midX - distLabelWidth / 2 - 4,
        y: midY + 4,
        width: distLabelWidth + 8,
        height: 11,
        color: COLORS.chartBg,
        borderColor: COLORS.chartBorder,
        borderWidth: 0.3,
    });

    page.drawText(distLabelFull, {
        x: midX - distLabelWidth / 2,
        y: midY + 6,
        font: fonts.regular,
        size: FONT_SIZES.chartLabel,
        color: COLORS.textMedium,
    });

    // ══════════════════════════════════════════════════════
    // 12. Draw Clearance Indicator
    // ══════════════════════════════════════════════════════
    if (minClearance !== null) {
        // Find the data point with minimum clearance
        let minClearancePoint = data[0];
        for (const point of data) {
            if (point.clearance < minClearancePoint.clearance) {
                minClearancePoint = point;
            }
        }

        const mcX = getX(minClearancePoint.distance);
        const mcTerrainY = getY(minClearancePoint.terrainElevation);
        const mcLosY = getY(minClearancePoint.losHeight);

        // Vertical dashed-style line (small segments) between terrain and LOS
        const segments = 6;
        const segLength = (mcLosY - mcTerrainY) / (segments * 2);
        for (let i = 0; i < segments; i++) {
            const segStartY = mcTerrainY + i * segLength * 2;
            const segEndY = segStartY + segLength;
            if (segEndY > mcLosY) break;
            page.drawLine({
                start: { x: mcX, y: segStartY },
                end: { x: mcX, y: Math.min(segEndY, mcLosY) },
                thickness: 0.8,
                color: losPossible ? COLORS.success : COLORS.failure,
            });
        }

        // Clearance value label
        const mcLabel = `${minClearance.toFixed(1)}m`;
        const mcLabelWidth = fonts.bold.widthOfTextAtSize(mcLabel, FONT_SIZES.chartAxis);
        const mcLabelX = mcX + 5;
        const mcLabelY = (mcTerrainY + mcLosY) / 2 - 3;

        // Label background
        page.drawRectangle({
            x: mcLabelX - 2,
            y: mcLabelY - 2,
            width: mcLabelWidth + 4,
            height: 10,
            color: COLORS.chartBg,
        });

        page.drawText(mcLabel, {
            x: mcLabelX,
            y: mcLabelY,
            font: fonts.bold,
            size: FONT_SIZES.chartAxis,
            color: losPossible ? COLORS.success : COLORS.failure,
        });
    }

    // ══════════════════════════════════════════════════════
    // 13. Draw Legend Strip
    // ══════════════════════════════════════════════════════
    if (showLegend) {
        const legendY = chartY + 1;
        const legendItemSpacing = 80;
        let lx = chartX + 10;

        // Terrain legend
        page.drawRectangle({
            x: lx,
            y: legendY,
            width: 12,
            height: 6,
            color: COLORS.terrainFill,
            borderColor: COLORS.terrainStroke,
            borderWidth: 0.5,
        });
        page.drawText('Terrain', {
            x: lx + 15,
            y: legendY,
            font: fonts.regular,
            size: 6,
            color: COLORS.textLight,
        });
        lx += legendItemSpacing;

        // LOS line legend
        page.drawLine({
            start: { x: lx, y: legendY + 3 },
            end: { x: lx + 12, y: legendY + 3 },
            thickness: 1.5,
            color: losColor,
        });
        page.drawText(losPossible ? 'LOS (Clear)' : 'LOS (Blocked)', {
            x: lx + 15,
            y: legendY,
            font: fonts.regular,
            size: 6,
            color: COLORS.textLight,
        });
        lx += legendItemSpacing;

        // Tower legend
        page.drawLine({
            start: { x: lx, y: legendY + 1 },
            end: { x: lx, y: legendY + 7 },
            thickness: 1.5,
            color: COLORS.towerLine,
        });
        page.drawCircle({
            x: lx,
            y: legendY + 7,
            size: 2.5,
            color: COLORS.towerHandle,
        });
        page.drawText('Tower', {
            x: lx + 6,
            y: legendY,
            font: fonts.regular,
            size: 6,
            color: COLORS.textLight,
        });
        lx += legendItemSpacing - 20;

        // Obstruction legend (only if blocked)
        if (!losPossible) {
            page.drawCircle({
                x: lx + 3,
                y: legendY + 3,
                size: 2.5,
                color: COLORS.obstructionDot,
            });
            page.drawText('Obstruction', {
                x: lx + 9,
                y: legendY,
                font: fonts.regular,
                size: 6,
                color: COLORS.textLight,
            });
        }

        // Min clearance legend
        if (minClearance !== null) {
            lx = chartX + chartW - 100;
            const statusText = losPossible
                ? `Min Clearance: ${minClearance.toFixed(1)}m`
                : `Min Clearance: ${minClearance.toFixed(1)}m (BLOCKED)`;
            const statusColor = losPossible ? COLORS.success : COLORS.failure;
            page.drawText(statusText, {
                x: lx,
                y: legendY,
                font: fonts.bold,
                size: 6.5,
                color: statusColor,
            });
        }
    }
}