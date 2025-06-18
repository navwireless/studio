
// src/tools/report-generator/reportUtils.ts
import { AlignmentType, BorderStyle, Footer, Header, IBorderOptions, ImageRun, Packer, PageNumber, Paragraph, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType } from 'docx';
import { PDFPage, StandardFonts, rgb, PDFFont, PDFDocument } from 'pdf-lib';
import type { AnalysisResult, PointCoordinates as AppPointCoordinates } from '@/types'; // Renamed to avoid conflict
import type { FiberPathResult, FiberPathSegment } from '@/tools/fiberPathCalculator'; // For Fiber reports
import type { PointInput } from '@/lib/fiber-calculator-form-schema'; // For Fiber reports (form values)


export const DEFAULT_COMPANY_NAME = "Nav Wireless Technologies Pvt. Ltd.";
export const DEFAULT_REPORT_TITLE = "LiFi Link Feasibility Report";
export const DEFAULT_FIBER_REPORT_TITLE = "Fiber Path Analysis Report";
export const DEFAULT_LOGO_URL = "https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png";


export const BRAND_COLOR_PRIMARY_RGB = rgb(63/255, 81/255, 181/255);
export const BRAND_COLOR_ACCENT_RGB = rgb(0/255, 150/255, 136/255);
export const TEXT_COLOR_DARK_RGB = rgb(0.1, 0.1, 0.1);
export const TEXT_COLOR_LIGHT_RGB = rgb(0.4, 0.4, 0.4);
export const LINE_COLOR_RGB = rgb(0.8, 0.8, 0.8);

export async function addHeaderToPdfPage(
    page: PDFPage,
    font: PDFFont,
    pdfDoc: PDFDocument,
    reportTitle: string = DEFAULT_REPORT_TITLE,
    companyName: string = DEFAULT_COMPANY_NAME,
    logoImageBytes?: Uint8Array
) {
    const { width, height } = page.getSize();
    const margin = 40;
    const headerHeight = 60;
    const titleFontSize = 16;
    const companyFontSize = 10;
    const logoMaxHeight = 40;

    if (logoImageBytes) {
        try {
            const logoImage = await pdfDoc.embedPng(logoImageBytes);
            let logoWidth = logoImage.width;
            let logoHeight = logoImage.height;

            if (logoHeight > logoMaxHeight) {
                const scale = logoMaxHeight / logoHeight;
                logoHeight = logoMaxHeight;
                logoWidth = logoWidth * scale;
            }

            page.drawImage(logoImage, {
                x: margin,
                y: height - margin - logoHeight + (logoMaxHeight - logoHeight) / 2,
                width: logoWidth,
                height: logoHeight,
            });
        } catch (e) {
            console.warn("Could not embed logo in PDF, drawing company name text instead:", e);
            page.drawText(companyName, {
                x: margin,
                y: height - margin - companyFontSize,
                font: font,
                size: companyFontSize,
                color: TEXT_COLOR_LIGHT_RGB,
            });
        }
    } else {
        page.drawText(companyName, {
            x: margin,
            y: height - margin - companyFontSize,
            font: font,
            size: companyFontSize,
            color: TEXT_COLOR_LIGHT_RGB,
        });
    }

    const titleWidth = font.widthOfTextAtSize(reportTitle, titleFontSize);
    page.drawText(reportTitle, {
        x: width - margin - titleWidth,
        y: height - margin - titleFontSize,
        font: font,
        size: titleFontSize,
        color: TEXT_COLOR_DARK_RGB,
    });

    const lineY = height - headerHeight - margin + 10;
    page.drawLine({
        start: { x: margin, y: lineY },
        end: { x: width - margin, y: lineY },
        thickness: 0.8,
        color: LINE_COLOR_RGB,
    });

    return lineY - 20;
}

export function addFooterToPdfPage(page: PDFPage, font: PDFFont, pageNumber: number, totalPages: number, companyName: string = DEFAULT_COMPANY_NAME) {
    const { width } = page.getSize();
    const margin = 40;
    const footerText = `Page ${pageNumber} of ${totalPages} | ${companyName} | ${new Date().toLocaleDateString()}`;
    const textSize = 9;
    const textWidth = font.widthOfTextAtSize(footerText, textSize);

    page.drawText(footerText, {
        x: (width - textWidth) / 2,
        y: margin - 10,
        size: textSize,
        font: font,
        color: TEXT_COLOR_LIGHT_RGB,
    });
}

export function formatAnalysisDataForReportTable(analysisResult: AnalysisResult): Array<{ key: string, value: string }> {
    return [
        { key: "Point A Name", value: analysisResult.pointA.name || "Site A" },
        { key: "Point A Coordinates", value: `${analysisResult.pointA.lat.toFixed(6)}, ${analysisResult.pointA.lng.toFixed(6)}` },
        { key: "Point A Tower Height", value: `${analysisResult.pointA.towerHeight} m` },
        { key: "Point B Name", value: analysisResult.pointB.name || "Site B" },
        { key: "Point B Coordinates", value: `${analysisResult.pointB.lat.toFixed(6)}, ${analysisResult.pointB.lng.toFixed(6)}` },
        { key: "Point B Tower Height", value: `${analysisResult.pointB.towerHeight} m` },
        { key: "Aerial Distance", value: `${analysisResult.distanceKm.toFixed(2)} km` },
        { key: "Required Clearance (Fresnel)", value: `${analysisResult.clearanceThresholdUsed} m` },
        { key: "Line-of-Sight Possible", value: analysisResult.losPossible ? "Yes" : "No" },
        { key: "Minimum Actual Clearance", value: analysisResult.minClearance !== null ? `${analysisResult.minClearance.toFixed(1)} m` : "N/A" },
        { key: "Additional Height Needed", value: analysisResult.additionalHeightNeeded !== null ? `${analysisResult.additionalHeightNeeded.toFixed(1)} m` : "N/A" },
        { key: "Overall Message", value: analysisResult.message },
    ];
}


export function formatFiberDataForReportTable(
    fiberResult: FiberPathResult,
    pointA_form: { name: string; lat: number; lng: number; }, // Using PointCoordinates structure
    pointB_form: { name: string; lat: number; lng: number; }, // Using PointCoordinates structure
    snapRadiusUsed: number
): Array<{ key: string, value: string }> {
    const data = [
        { key: "Site A Name", value: pointA_form.name || "Site A" },
        { key: "Site A Original Coordinates", value: `${pointA_form.lat.toFixed(6)}, ${pointA_form.lng.toFixed(6)}` },
        { key: "Site B Name", value: pointB_form.name || "Site B" },
        { key: "Site B Original Coordinates", value: `${pointB_form.lat.toFixed(6)}, ${pointB_form.lng.toFixed(6)}` },
        { key: "Snap to Road Radius Used", value: `${snapRadiusUsed} m` },
        { key: "Calculation Status", value: fiberResult.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
    ];

    if (fiberResult.status === 'success') {
        data.push(
            { key: "Total Fiber Path Distance", value: `${fiberResult.totalDistanceMeters?.toFixed(1) ?? 'N/A'} m` },
            { key: "Offset A (Site to Road)", value: `${fiberResult.offsetDistanceA_meters?.toFixed(1) ?? 'N/A'} m` },
            { key: "Site A Snapped Coords", value: fiberResult.pointA_snappedToRoad ? `${fiberResult.pointA_snappedToRoad.lat.toFixed(6)}, ${fiberResult.pointA_snappedToRoad.lng.toFixed(6)}` : "N/A"},
            { key: "Road Route Distance", value: `${fiberResult.roadRouteDistanceMeters?.toFixed(1) ?? 'N/A'} m` },
            { key: "Offset B (Road to Site)", value: `${fiberResult.offsetDistanceB_meters?.toFixed(1) ?? 'N/A'} m` },
            { key: "Site B Snapped Coords", value: fiberResult.pointB_snappedToRoad ? `${fiberResult.pointB_snappedToRoad.lat.toFixed(6)}, ${fiberResult.pointB_snappedToRoad.lng.toFixed(6)}` : "N/A"},
        );
        // Optionally, add polyline if needed, but it's long:
        // { key: "Road Route Encoded Polyline", value: fiberResult.segments?.find(s => s.type === 'road_route')?.pathPolyline || "N/A" }
    }

    if (fiberResult.errorMessage) {
        data.push({ key: "Notes/Error", value: fiberResult.errorMessage });
    }
    return data;
}


export async function fetchLogoImageBytes(url: string): Promise<Uint8Array | undefined> {
    try {
        if (typeof fetch === 'undefined') {
            console.warn("fetch is not defined. Cannot fetch logo image.");
            return undefined;
        }
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
            console.warn(`Failed to fetch logo image: ${response.status} ${response.statusText} from ${url}`);
            return undefined;
        }
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        console.error(`Error fetching logo image from ${url}:`, error);
        return undefined;
    }
}

// DOCX Utilities (currently not used by fiber report, but kept for completeness)
export function createDocxHeader(logoImageBuffer?: Buffer): Header {
    const children = [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
                new TextRun({
                    text: DEFAULT_REPORT_TITLE,
                    bold: true,
                    size: 28,
                }),
            ],
        }),
    ];

    if (logoImageBuffer) {
        try {
            children.unshift(
                 new Paragraph({
                    children: [
                        new ImageRun({
                            data: logoImageBuffer,
                            transformation: {
                                width: 100,
                                height: 24,
                            },
                        }),
                    ],
                })
            );
        } catch (e) {
            console.warn("Could not add logo to DOCX header:", e);
             children.unshift(new Paragraph(DEFAULT_COMPANY_NAME));
        }
    } else {
        children.unshift(new Paragraph(DEFAULT_COMPANY_NAME));
    }

    return new Header({
        children: [
            new Table({
                columnWidths: [2000, 7500],
                borders: {
                    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: "auto" },
                    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                    insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: logoImageBuffer ? [new Paragraph({
                                    children: [new ImageRun({ data: logoImageBuffer, transformation: { width: 100, height: 24}})],
                                })] : [new Paragraph(DEFAULT_COMPANY_NAME)],
                                verticalAlign: VerticalAlign.CENTER,
                                borders: { right: { style: BorderStyle.NONE } } as IBorderOptions,
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    text: DEFAULT_REPORT_TITLE,
                                    alignment: AlignmentType.RIGHT,
                                })],
                                verticalAlign: VerticalAlign.CENTER,
                                borders: { left: { style: BorderStyle.NONE } } as IBorderOptions,
                            }),
                        ],
                    }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
            }),
             new Paragraph({ text: "", spacing: { after: 100 } }),
        ],
    });
}

export function createDocxFooter(): Footer {
    return new Footer({
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        children: ["Page ", PageNumber.CURRENT],
                        size: 16,
                    }),
                    new TextRun({
                        children: [" of ", PageNumber.TOTAL_PAGES],
                        size: 16,
                    }),
                    new TextRun({
                        text: ` | ${DEFAULT_COMPANY_NAME} | ${new Date().toLocaleDateString()}`,
                        size: 16,
                    }),
                ],
            }),
        ],
    });
}
