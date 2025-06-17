// src/tools/report-generator/reportUtils.ts
// This file will contain utility functions shared between PDF and Word report generation,
// such as creating common headers, footers, formatting data, etc.

import { AlignmentType, BorderStyle, Footer, Header, IBorderOptions, ImageRun, Packer, PageNumber, Paragraph, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType } from 'docx';
import { PDFPage, StandardFonts, rgb, PDFFont, PDFDocument } from 'pdf-lib';
import type { AnalysisResult } from '@/types';

export const DEFAULT_COMPANY_NAME = "Nav Wireless Technologies Pvt. Ltd.";
export const DEFAULT_REPORT_TITLE = "LiFi Link Feasibility Report";
export const DEFAULT_LOGO_URL = "https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png";


// Common styling constants (can be expanded)
export const BRAND_COLOR_PRIMARY_RGB = { r: 63/255, g: 81/255, b: 181/255 }; // #3F51B5 (Example Blue)
export const BRAND_COLOR_ACCENT_RGB = { r: 0/255, g: 150/255, b: 136/255 }; // #009688 (Example Teal)
export const TEXT_COLOR_DARK_RGB = { r: 0.1, g: 0.1, b: 0.1 };
export const TEXT_COLOR_LIGHT_RGB = { r: 0.4, g: 0.4, b: 0.4 };
export const LINE_COLOR_RGB = { r: 0.8, g: 0.8, b: 0.8 };

// --- PDF Utilities ---

export async function addHeaderToPdfPage(
    page: PDFPage,
    font: PDFFont,
    pdfDoc: PDFDocument,
    reportTitle: string = DEFAULT_REPORT_TITLE,
    companyName: string = DEFAULT_COMPANY_NAME,
    logoImageBytes?: Uint8Array
) {
    const { width, height } = page.getSize();
    const margin = 40; // Increased margin
    const headerHeight = 60; // Increased header area
    const titleFontSize = 16;
    const companyFontSize = 10;
    const logoMaxHeight = 40;

    // Draw Company Name (or logo placeholder)
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
                y: height - margin - logoHeight + (logoMaxHeight - logoHeight) / 2, // Vertically center logo in its allocated space
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

    // Draw Report Title (aligned right)
    const titleWidth = font.widthOfTextAtSize(reportTitle, titleFontSize);
    page.drawText(reportTitle, {
        x: width - margin - titleWidth,
        y: height - margin - titleFontSize, 
        font: font,
        size: titleFontSize,
        color: TEXT_COLOR_DARK_RGB,
    });
    
    // Draw a line below header
    const lineY = height - headerHeight - margin + 10;
    page.drawLine({
        start: { x: margin, y: lineY },
        end: { x: width - margin, y: lineY },
        thickness: 0.8,
        color: LINE_COLOR_RGB,
    });

    return lineY - 20; // Return usable Y coordinate below header line
}

export function addFooterToPdfPage(page: PDFPage, font: PDFFont, pageNumber: number, totalPages: number, companyName: string = DEFAULT_COMPANY_NAME) {
    const { width, height } = page.getSize();
    const margin = 40;
    const footerText = `Page ${pageNumber} of ${totalPages} | ${companyName} | ${new Date().toLocaleDateString()}`;
    const textSize = 9;
    const textWidth = font.widthOfTextAtSize(footerText, textSize);
    
    page.drawText(footerText, {
        x: (width - textWidth) / 2,
        y: margin - 10, // Position slightly lower
        size: textSize,
        font: font,
        color: TEXT_COLOR_LIGHT_RGB,
    });
}

// --- DOCX Utilities ---

export function createDocxHeader(logoImageBuffer?: Buffer): Header {
    // Implementation for DOCX header can be refined later
    const children = [
        new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
                new TextRun({
                    text: DEFAULT_REPORT_TITLE,
                    bold: true,
                    size: 28, // 14pt
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
                                    // style: "Heading1", // Assuming a style 'Heading1' is defined or use direct formatting
                                })],
                                verticalAlign: VerticalAlign.CENTER,
                                borders: { left: { style: BorderStyle.NONE } } as IBorderOptions,
                            }),
                        ],
                    }),
                ],
                width: { size: 100, type: WidthType.PERCENTAGE },
            }),
             new Paragraph({ text: "", spacing: { after: 100 } }), // Spacer
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
                        size: 16, // 8pt
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


// --- Common Data Formatting ---
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

export async function fetchLogoImageBytes(url: string): Promise<Uint8Array | undefined> {
    try {
        // This check is important because 'fetch' behaves differently in Node.js vs. browser.
        // For this prototyping environment, we assume a browser-like fetch is available or polyfilled.
        if (typeof fetch === 'undefined') {
            console.warn("fetch is not defined. Cannot fetch logo image. This might happen in a Node.js environment without node-fetch.");
            return undefined;
        }
        const response = await fetch(url, { mode: 'cors' }); // Added cors mode
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
