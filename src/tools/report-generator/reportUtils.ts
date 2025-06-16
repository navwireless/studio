// src/tools/report-generator/reportUtils.ts
// This file will contain utility functions shared between PDF and Word report generation,
// such as creating common headers, footers, formatting data, etc.

import { AlignmentType, BorderStyle, Footer, Header, IBorderOptions, ImageRun, Packer, PageNumber, Paragraph, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType } from 'docx';
import { PDFPage, StandardFonts, rgb, PDFFont, PDFDocument } from 'pdf-lib';
import type { AnalysisResult } from '@/types';

export const DEFAULT_COMPANY_NAME = "Nav Wireless Technologies Pvt. Ltd.";
export const DEFAULT_REPORT_TITLE = "LiFi Link Feasibility Report";

// Common styling constants (can be expanded)
export const BRAND_COLOR_PRIMARY_RGB = { r: 63/255, g: 81/255, b: 181/255 }; // #3F51B5
export const BRAND_COLOR_ACCENT_RGB = { r: 139/255, g: 195/255, b: 74/255 }; // #8BC34A

// --- PDF Utilities ---

export async function addHeaderToPdfPage(
    page: PDFPage,
    font: PDFFont,
    logoImageBytes: Uint8Array | undefined,
    pdfDoc: PDFDocument,
    reportTitle: string = DEFAULT_REPORT_TITLE,
    companyName: string = DEFAULT_COMPANY_NAME
) {
    const { width, height } = page.getSize();
    const margin = 30;
    const headerHeight = 50;

    // Placeholder for company logo
    if (logoImageBytes) {
        try {
            const logoImage = await pdfDoc.embedPng(logoImageBytes);
            const logoDims = logoImage.scale(0.25); // Adjust scale as needed
             page.drawImage(logoImage, {
                x: margin,
                y: height - margin - logoDims.height + 10, // Adjust Y to align better
                width: logoDims.width,
                height: logoDims.height,
            });
        } catch (e) {
            console.warn("Could not embed logo in PDF:", e);
        }
    } else {
         page.drawText(companyName, {
            x: margin,
            y: height - margin - 12,
            font: font,
            size: 10,
            color: rgb(0.3, 0.3, 0.3),
        });
    }


    page.drawText(reportTitle, {
        x: width - margin,
        y: height - margin - 18, // Adjusted for better alignment if logo is present
        font: font,
        size: 14,
        color: rgb(0, 0, 0),
        maxWidth: width / 2 - margin,
        lineHeight: 15,
        // @ts-ignore//This is a valid property in pdf-lib for text alignment
        textAlign: 'right', 
    });
    
    // Draw a line below header
    page.drawLine({
        start: { x: margin, y: height - headerHeight - margin + 5 },
        end: { x: width - margin, y: height - headerHeight - margin + 5 },
        thickness: 0.5,
        color: rgb(0.7, 0.7, 0.7),
    });

    return height - headerHeight - margin - 10; // Return usable Y coordinate after header
}

export function addFooterToPdfPage(page: PDFPage, font: PDFFont, pageNumber: number, totalPages: number) {
    const { width, height } = page.getSize();
    const margin = 30;
    const footerText = `Page ${pageNumber} of ${totalPages} | ${DEFAULT_COMPANY_NAME} | ${new Date().toLocaleDateString()}`;
    const textSize = 8;
    const textWidth = font.widthOfTextAtSize(footerText, textSize);
    
    page.drawText(footerText, {
        x: (width - textWidth) / 2,
        y: margin,
        size: textSize,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
    });
}

// --- DOCX Utilities ---

export function createDocxHeader(logoImageBuffer?: Buffer): Header {
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
                                width: 100, // adjust as needed
                                height: 24, // adjust as needed
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
                columnWidths: [2000, 7500], // Adjust as needed
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
                                    style: "Heading1", // Assuming a style 'Heading1' is defined or use direct formatting
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
    // In a browser environment, you'd use fetch.
    // For server-side with Node.js, you might use node-fetch or http module.
    // For simplicity and client-side pdf-lib usage, let's assume fetch.
    // This function will be more useful if reports are generated client-side or if image is passed.
    // For server-side generation, you'd fetch and process it there.
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Failed to fetch logo image: ${response.statusText}`);
            return undefined;
        }
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        console.error("Error fetching logo image:", error);
        return undefined;
    }
}
