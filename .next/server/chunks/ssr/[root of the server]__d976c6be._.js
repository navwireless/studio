module.exports = {

"[project]/src/lib/los-calculator.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "analyzeLOS": (()=>analyzeLOS),
    "calculateDistanceKm": (()=>calculateDistanceKm),
    "calculateFresnelZoneRadius": (()=>calculateFresnelZoneRadius)
});
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_METERS = EARTH_RADIUS_KM * 1000;
function calculateDistanceKm(p1, p2) {
    const R = EARTH_RADIUS_KM;
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const lat1Rad = p1.lat * Math.PI / 180;
    const lat2Rad = p2.lat * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
/**
 * Calculates the Earth's curvature drop at a specific point along a path.
 * @param totalPathDistanceKm Total distance of the LOS path in kilometers.
 * @param distanceFromStartKm Distance of the current point from the start of the path in kilometers.
 * @returns Earth curvature drop in meters.
 */ function calculateEarthCurvatureDropMeters(totalPathDistanceKm, distanceFromStartKm) {
    const totalPathDistanceM = totalPathDistanceKm * 1000;
    const distanceFromStartM = distanceFromStartKm * 1000;
    const distanceToEndM = totalPathDistanceM - distanceFromStartM;
    if (distanceFromStartM < 0 || distanceToEndM < 0) return 0;
    const h_drop = distanceFromStartM * distanceToEndM / (2 * EARTH_RADIUS_METERS);
    return h_drop;
}
function calculateFresnelZoneRadius(d1, d2, totalDistance, frequencyGHz) {
    if (totalDistance === 0 || frequencyGHz === 0) return 0;
    const lambdaMeters = 0.3 / frequencyGHz; // Wavelength in meters (speed of light c approx 3x10^8 m/s)
    const d1_m = d1 * 1000;
    const d2_m = d2 * 1000;
    const totalDistance_m = totalDistance * 1000;
    if (totalDistance_m === 0) return 0;
    const fresnelRadius = Math.sqrt(lambdaMeters * d1_m * d2_m / totalDistance_m);
    return fresnelRadius; // Meters
}
function analyzeLOS(params, elevationData) {
    if (elevationData.length < 2) {
        return {
            losPossible: false,
            distanceKm: 0,
            minClearance: null,
            additionalHeightNeeded: null,
            profile: [],
            message: "Insufficient elevation data for analysis.",
            pointA: params.pointA,
            pointB: params.pointB,
            clearanceThresholdUsed: params.clearanceThreshold
        };
    }
    const totalDistanceKm = calculateDistanceKm(params.pointA, params.pointB);
    const elevationAtA = elevationData[0].elevation;
    const elevationAtB = elevationData[elevationData.length - 1].elevation;
    const heightA_actual = elevationAtA + params.pointA.towerHeight;
    const heightB_actual = elevationAtB + params.pointB.towerHeight;
    const profile = [];
    let minClearance = null;
    const numSamples = elevationData.length;
    const segmentDistanceKm = totalDistanceKm / (numSamples > 1 ? numSamples - 1 : 1);
    for(let i = 0; i < numSamples; i++){
        const sample = elevationData[i];
        const distanceFromA_Km = i * segmentDistanceKm;
        const terrainElevation = sample.elevation;
        const fractionAlongPath = totalDistanceKm > 0 ? distanceFromA_Km / totalDistanceKm : 0;
        const idealLosHeight = heightA_actual + fractionAlongPath * (heightB_actual - heightA_actual);
        const curvatureDrop = calculateEarthCurvatureDropMeters(totalDistanceKm, distanceFromA_Km);
        const correctedLosHeight = idealLosHeight - curvatureDrop;
        const clearance = correctedLosHeight - terrainElevation;
        profile.push({
            distance: parseFloat(distanceFromA_Km.toFixed(3)),
            terrainElevation: parseFloat(terrainElevation.toFixed(2)),
            losHeight: parseFloat(correctedLosHeight.toFixed(2)),
            clearance: parseFloat(clearance.toFixed(2))
        });
        if (minClearance === null || clearance < minClearance) {
            minClearance = clearance;
        }
    }
    const losPossible = minClearance !== null && minClearance >= params.clearanceThreshold;
    let additionalHeightNeeded = null;
    if (!losPossible && minClearance !== null) {
        additionalHeightNeeded = params.clearanceThreshold - minClearance;
    }
    return {
        losPossible,
        distanceKm: parseFloat(totalDistanceKm.toFixed(2)),
        minClearance: minClearance !== null ? parseFloat(minClearance.toFixed(2)) : null,
        additionalHeightNeeded: additionalHeightNeeded !== null ? parseFloat(additionalHeightNeeded.toFixed(2)) : null,
        profile,
        message: "Analysis complete.",
        pointA: params.pointA,
        pointB: params.pointB,
        clearanceThresholdUsed: params.clearanceThreshold
    };
}
}}),
"[externals]/buffer [external] (buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}}),
"[project]/src/tools/report-generator/reportUtils.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/tools/report-generator/reportUtils.ts
// This file will contain utility functions shared between PDF and Word report generation,
// such as creating common headers, footers, formatting data, etc.
__turbopack_context__.s({
    "BRAND_COLOR_ACCENT_RGB": (()=>BRAND_COLOR_ACCENT_RGB),
    "BRAND_COLOR_PRIMARY_RGB": (()=>BRAND_COLOR_PRIMARY_RGB),
    "DEFAULT_COMPANY_NAME": (()=>DEFAULT_COMPANY_NAME),
    "DEFAULT_LOGO_URL": (()=>DEFAULT_LOGO_URL),
    "DEFAULT_REPORT_TITLE": (()=>DEFAULT_REPORT_TITLE),
    "LINE_COLOR_RGB": (()=>LINE_COLOR_RGB),
    "TEXT_COLOR_DARK_RGB": (()=>TEXT_COLOR_DARK_RGB),
    "TEXT_COLOR_LIGHT_RGB": (()=>TEXT_COLOR_LIGHT_RGB),
    "addFooterToPdfPage": (()=>addFooterToPdfPage),
    "addHeaderToPdfPage": (()=>addHeaderToPdfPage),
    "createDocxFooter": (()=>createDocxFooter),
    "createDocxHeader": (()=>createDocxHeader),
    "fetchLogoImageBytes": (()=>fetchLogoImageBytes),
    "formatAnalysisDataForReportTable": (()=>formatAnalysisDataForReportTable)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/docx/build/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-rsc] (ecmascript) <module evaluation>"); // Import rgb from pdf-lib
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/colors.js [app-rsc] (ecmascript)");
;
;
const DEFAULT_COMPANY_NAME = "Nav Wireless Technologies Pvt. Ltd.";
const DEFAULT_REPORT_TITLE = "LiFi Link Feasibility Report";
const DEFAULT_LOGO_URL = "https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png";
const BRAND_COLOR_PRIMARY_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(63 / 255, 81 / 255, 181 / 255); // #3F51B5 (Example Blue)
const BRAND_COLOR_ACCENT_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0 / 255, 150 / 255, 136 / 255); // #009688 (Example Teal)
const TEXT_COLOR_DARK_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.1, 0.1, 0.1);
const TEXT_COLOR_LIGHT_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.4, 0.4, 0.4);
const LINE_COLOR_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.8, 0.8, 0.8);
async function addHeaderToPdfPage(page, font, pdfDoc, reportTitle = DEFAULT_REPORT_TITLE, companyName = DEFAULT_COMPANY_NAME, logoImageBytes) {
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
                y: height - margin - logoHeight + (logoMaxHeight - logoHeight) / 2,
                width: logoWidth,
                height: logoHeight
            });
        } catch (e) {
            console.warn("Could not embed logo in PDF, drawing company name text instead:", e);
            page.drawText(companyName, {
                x: margin,
                y: height - margin - companyFontSize,
                font: font,
                size: companyFontSize,
                color: TEXT_COLOR_LIGHT_RGB
            });
        }
    } else {
        page.drawText(companyName, {
            x: margin,
            y: height - margin - companyFontSize,
            font: font,
            size: companyFontSize,
            color: TEXT_COLOR_LIGHT_RGB
        });
    }
    // Draw Report Title (aligned right)
    const titleWidth = font.widthOfTextAtSize(reportTitle, titleFontSize);
    page.drawText(reportTitle, {
        x: width - margin - titleWidth,
        y: height - margin - titleFontSize,
        font: font,
        size: titleFontSize,
        color: TEXT_COLOR_DARK_RGB
    });
    // Draw a line below header
    const lineY = height - headerHeight - margin + 10;
    page.drawLine({
        start: {
            x: margin,
            y: lineY
        },
        end: {
            x: width - margin,
            y: lineY
        },
        thickness: 0.8,
        color: LINE_COLOR_RGB
    });
    return lineY - 20; // Return usable Y coordinate below header line
}
function addFooterToPdfPage(page, font, pageNumber, totalPages, companyName = DEFAULT_COMPANY_NAME) {
    const { width, height } = page.getSize();
    const margin = 40;
    const footerText = `Page ${pageNumber} of ${totalPages} | ${companyName} | ${new Date().toLocaleDateString()}`;
    const textSize = 9;
    const textWidth = font.widthOfTextAtSize(footerText, textSize);
    page.drawText(footerText, {
        x: (width - textWidth) / 2,
        y: margin - 10,
        size: textSize,
        font: font,
        color: TEXT_COLOR_LIGHT_RGB
    });
}
function createDocxHeader(logoImageBuffer) {
    // Implementation for DOCX header can be refined later
    const children = [
        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"]({
            alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AlignmentType"].RIGHT,
            children: [
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TextRun"]({
                    text: DEFAULT_REPORT_TITLE,
                    bold: true,
                    size: 28
                })
            ]
        })
    ];
    if (logoImageBuffer) {
        try {
            children.unshift(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"]({
                children: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImageRun"]({
                        data: logoImageBuffer,
                        transformation: {
                            width: 100,
                            height: 24
                        }
                    })
                ]
            }));
        } catch (e) {
            console.warn("Could not add logo to DOCX header:", e);
            children.unshift(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"](DEFAULT_COMPANY_NAME));
        }
    } else {
        children.unshift(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"](DEFAULT_COMPANY_NAME));
    }
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Header"]({
        children: [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Table"]({
                columnWidths: [
                    2000,
                    7500
                ],
                borders: {
                    top: {
                        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BorderStyle"].NONE,
                        size: 0,
                        color: "FFFFFF"
                    },
                    bottom: {
                        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                        size: 6,
                        color: "auto"
                    },
                    left: {
                        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BorderStyle"].NONE,
                        size: 0,
                        color: "FFFFFF"
                    },
                    right: {
                        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BorderStyle"].NONE,
                        size: 0,
                        color: "FFFFFF"
                    },
                    insideHorizontal: {
                        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BorderStyle"].NONE,
                        size: 0,
                        color: "FFFFFF"
                    },
                    insideVertical: {
                        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BorderStyle"].NONE,
                        size: 0,
                        color: "FFFFFF"
                    }
                },
                rows: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TableRow"]({
                        children: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TableCell"]({
                                children: logoImageBuffer ? [
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"]({
                                        children: [
                                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImageRun"]({
                                                data: logoImageBuffer,
                                                transformation: {
                                                    width: 100,
                                                    height: 24
                                                }
                                            })
                                        ]
                                    })
                                ] : [
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"](DEFAULT_COMPANY_NAME)
                                ],
                                verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER,
                                borders: {
                                    right: {
                                        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BorderStyle"].NONE
                                    }
                                }
                            }),
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TableCell"]({
                                children: [
                                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"]({
                                        text: DEFAULT_REPORT_TITLE,
                                        alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AlignmentType"].RIGHT
                                    })
                                ],
                                verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER,
                                borders: {
                                    left: {
                                        style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BorderStyle"].NONE
                                    }
                                }
                            })
                        ]
                    })
                ],
                width: {
                    size: 100,
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WidthType"].PERCENTAGE
                }
            }),
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"]({
                text: "",
                spacing: {
                    after: 100
                }
            })
        ]
    });
}
function createDocxFooter() {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Footer"]({
        children: [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Paragraph"]({
                alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AlignmentType"].CENTER,
                children: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TextRun"]({
                        children: [
                            "Page ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageNumber"].CURRENT
                        ],
                        size: 16
                    }),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TextRun"]({
                        children: [
                            " of ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PageNumber"].TOTAL_PAGES
                        ],
                        size: 16
                    }),
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TextRun"]({
                        text: ` | ${DEFAULT_COMPANY_NAME} | ${new Date().toLocaleDateString()}`,
                        size: 16
                    })
                ]
            })
        ]
    });
}
function formatAnalysisDataForReportTable(analysisResult) {
    return [
        {
            key: "Point A Name",
            value: analysisResult.pointA.name || "Site A"
        },
        {
            key: "Point A Coordinates",
            value: `${analysisResult.pointA.lat.toFixed(6)}, ${analysisResult.pointA.lng.toFixed(6)}`
        },
        {
            key: "Point A Tower Height",
            value: `${analysisResult.pointA.towerHeight} m`
        },
        {
            key: "Point B Name",
            value: analysisResult.pointB.name || "Site B"
        },
        {
            key: "Point B Coordinates",
            value: `${analysisResult.pointB.lat.toFixed(6)}, ${analysisResult.pointB.lng.toFixed(6)}`
        },
        {
            key: "Point B Tower Height",
            value: `${analysisResult.pointB.towerHeight} m`
        },
        {
            key: "Aerial Distance",
            value: `${analysisResult.distanceKm.toFixed(2)} km`
        },
        {
            key: "Required Clearance (Fresnel)",
            value: `${analysisResult.clearanceThresholdUsed} m`
        },
        {
            key: "Line-of-Sight Possible",
            value: analysisResult.losPossible ? "Yes" : "No"
        },
        {
            key: "Minimum Actual Clearance",
            value: analysisResult.minClearance !== null ? `${analysisResult.minClearance.toFixed(1)} m` : "N/A"
        },
        {
            key: "Additional Height Needed",
            value: analysisResult.additionalHeightNeeded !== null ? `${analysisResult.additionalHeightNeeded.toFixed(1)} m` : "N/A"
        },
        {
            key: "Overall Message",
            value: analysisResult.message
        }
    ];
}
async function fetchLogoImageBytes(url) {
    try {
        // This check is important because 'fetch' behaves differently in Node.js vs. browser.
        // For this prototyping environment, we assume a browser-like fetch is available or polyfilled.
        if (typeof fetch === 'undefined') {
            console.warn("fetch is not defined. Cannot fetch logo image. This might happen in a Node.js environment without node-fetch.");
            return undefined;
        }
        const response = await fetch(url, {
            mode: 'cors'
        }); // Added cors mode
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
}}),
"[project]/src/tools/report-generator/generatePdfReport.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/tools/report-generator/generatePdfReport.ts
__turbopack_context__.s({
    "generatePdfReportForSingleAnalysis": (()=>generatePdfReportForSingleAnalysis)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$PDFDocument$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__PDFDocument$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/PDFDocument.js [app-rsc] (ecmascript) <export default as PDFDocument>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/colors.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/StandardFonts.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/report-generator/reportUtils.ts [app-rsc] (ecmascript)");
;
;
async function generatePdfReportForSingleAnalysis(analysisResult, options) {
    const pdfDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$PDFDocument$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__PDFDocument$3e$__["PDFDocument"].create();
    const helveticaFont = await pdfDoc.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StandardFonts"].Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StandardFonts"].HelveticaBold);
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const reportTitle = options?.reportTitle || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_REPORT_TITLE"];
    const companyName = options?.companyName || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_COMPANY_NAME"];
    let logoBytes = options?.logoImageBytes;
    if (!logoBytes && options?.logoUrl !== null) {
        logoBytes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchLogoImageBytes"])(options?.logoUrl || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_LOGO_URL"]);
    }
    let currentY = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addHeaderToPdfPage"])(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
    currentY -= 20; // Space after header
    // --- Report Details ---
    const contentMargin = 50;
    const contentWidth = width - 2 * contentMargin;
    const regularFontSize = 10;
    const smallFontSize = 8;
    const lineHeight = 15;
    const sectionSpacing = 20;
    // Report Date
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: contentMargin,
        y: currentY,
        font: helveticaFont,
        size: regularFontSize,
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_LIGHT_RGB"]
    });
    currentY -= lineHeight * 1.5;
    // --- Analysis Parameters Table ---
    page.drawText("Link Analysis Summary", {
        x: contentMargin,
        y: currentY,
        font: helveticaBoldFont,
        size: 13,
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND_COLOR_ACCENT_RGB"]
    });
    currentY -= lineHeight * 1.5;
    const analysisData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatAnalysisDataForReportTable"])(analysisResult);
    const tableStartY = currentY;
    const keyColumnWidth = 180;
    const valueColumnX = contentMargin + keyColumnWidth + 10;
    analysisData.forEach((item, index)=>{
        if (currentY < contentMargin + lineHeight * 2) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addFooterToPdfPage"])(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() + 1, companyName); // Footer for current page
            const newPage = pdfDoc.addPage();
            currentY = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addHeaderToPdfPage"])(newPage, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
            currentY -= 20; // Space after header on new page
            // Redraw section title if it's a new page for the table
            page.drawText("Link Analysis Summary (Continued)", {
                x: contentMargin,
                y: currentY,
                font: helveticaBoldFont,
                size: 13,
                color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND_COLOR_ACCENT_RGB"]
            });
            currentY -= lineHeight * 1.5;
        }
        page.drawText(`${item.key}:`, {
            x: contentMargin,
            y: currentY,
            font: helveticaFont,
            size: regularFontSize,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_DARK_RGB"]
        });
        page.drawText(item.value, {
            x: valueColumnX,
            y: currentY,
            font: helveticaBoldFont,
            size: regularFontSize,
            color: item.key === "Line-of-Sight Possible" ? analysisResult.losPossible ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND_COLOR_ACCENT_RGB"] : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.7, 0.2, 0.2) : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_DARK_RGB"],
            maxWidth: contentWidth - keyColumnWidth - 20
        });
        currentY -= lineHeight;
    });
    currentY -= sectionSpacing;
    // Placeholder for Profile Chart (if includeProfileChart is true and chart generation is implemented)
    if (options?.includeProfileChart) {
        if (currentY < contentMargin + 150) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addFooterToPdfPage"])(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() + 1, companyName);
            const newPage = pdfDoc.addPage();
            currentY = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addHeaderToPdfPage"])(newPage, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
            currentY -= 20;
        }
        page.drawText("Path Profile Chart (Placeholder)", {
            x: contentMargin,
            y: currentY,
            font: helveticaBoldFont,
            size: 12,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_DARK_RGB"]
        });
        currentY -= lineHeight;
        // Actual chart drawing logic would go here
        page.drawRectangle({
            x: contentMargin,
            y: currentY - 120,
            width: contentWidth,
            height: 100,
            borderColor: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.8, 0.8, 0.8),
            borderWidth: 1
        });
        page.drawText("Chart would be rendered here.", {
            x: contentMargin + 10,
            y: currentY - 60,
            font: helveticaFont,
            size: regularFontSize,
            color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_LIGHT_RGB"]
        });
        currentY -= 130;
    }
    // Add footer to the last page (or current page if it's the only one)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addFooterToPdfPage"])(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount(), companyName);
    // If new pages were added, we need to iterate and add footers to previous pages.
    // This is a bit tricky as pdfDoc.getPageCount() changes.
    // A simpler approach for now is to add footer after content might span pages.
    // For a multi-page document, this needs more robust handling.
    // For now, this just correctly numbers the LAST page it was working on.
    // A full solution would be to loop through all pages *after* all content is drawn.
    const totalPages = pdfDoc.getPageCount();
    for(let i = 0; i < totalPages; i++){
        const p = pdfDoc.getPage(i);
        // Re-call footer for each page to ensure correct totalPages
        // (This is slightly inefficient but ensures correctness if content caused page additions)
        // To be truly correct, this loop should be after all content is drawn, or manage Y position more carefully.
        // For now, the addFooterToPdfPage called during content generation will have the running page count.
        // Let's re-stamp the footers with final totalPages.
        // NOTE: This assumes addFooterToPdfPage is idempotent or safe to call multiple times on the same visual footer area if needed.
        // A better way: collect all pages, then loop *once* at the end.
        // Simplified for now:
        if (i < totalPages - 1) {
        // Need to re-call footer for previous pages if their content caused page break and they need correct total count
        // This is complex; for now the version called DURING content generation is what we have.
        }
    }
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
}}),
"[project]/src/tools/report-generator/index.ts [app-rsc] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/tools/report-generator/index.ts
__turbopack_context__.s({});
;
}}),
"[project]/src/tools/report-generator/index.ts [app-rsc] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$generatePdfReport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/report-generator/generatePdfReport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/tools/report-generator/index.ts [app-rsc] (ecmascript) <locals>");
}}),
"[project]/src/app/actions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"6032618b8418ac76277e7b9b725912dd40e39f206e":"performLosAnalysis","606e059f8f40dd4b377c51875d12e3221ca87a227e":"generateSingleAnalysisPdfReportAction"} */ __turbopack_context__.s({
    "generateSingleAnalysisPdfReportAction": (()=>generateSingleAnalysisPdfReportAction),
    "performLosAnalysis": (()=>performLosAnalysis)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/los-calculator.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/tools/report-generator/index.ts [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$generatePdfReport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/report-generator/generatePdfReport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
// --- Google Elevation API Configuration ---
const GOOGLE_ELEVATION_API_KEY = process.env.GOOGLE_ELEVATION_API_KEY;
const GOOGLE_ELEVATION_API_URL = "https://maps.googleapis.com/maps/api/elevation/json";
// --- End Google Elevation API Configuration ---
// Define Zod schema for form validation on the server, expecting string inputs from FormData
const ServerActionPointInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, "Name is required").max(50, "Name too long"),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>{
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
    }, "Latitude must be between -90 and 90 (e.g., 28.6139)"),
    lng: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>{
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
    }, "Longitude must be between -180 and 180 (e.g., 77.2090)"),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>!isNaN(parseFloat(val)), "Tower height must be a number").transform((val)=>parseFloat(val)).refine((val)=>val >= 0, "Minimum tower height is 0m").refine((val)=>val <= 100, "Maximum tower height is 100m")
});
const ServerActionAnalysisSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    pointA: ServerActionPointInputSchema,
    pointB: ServerActionPointInputSchema,
    clearanceThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>!isNaN(parseFloat(val)), "Clearance threshold must be a number").transform((val)=>parseFloat(val)).refine((val)=>val >= 0, "Clearance threshold must be a non-negative number")
});
/**
 * Fetches elevation data from Google Elevation API.
 */ async function getGoogleElevationData(pointA, pointB, samples = 100) {
    if (!GOOGLE_ELEVATION_API_KEY || GOOGLE_ELEVATION_API_KEY.trim() === "" || GOOGLE_ELEVATION_API_KEY === "YOUR_GOOGLE_ELEVATION_API_KEY_HERE") {
        console.error("Google Elevation API key is not configured or is a placeholder.");
        throw new Error("Elevation service API key is not configured. Please check server environment variables.");
    }
    const pathStr = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
    const url = `${GOOGLE_ELEVATION_API_URL}?path=${pathStr}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY.trim()}`;
    let response;
    try {
        response = await fetch(url);
    } catch (networkError) {
        const errorMessage = networkError instanceof Error ? networkError.message : String(networkError);
        console.error("Network error fetching elevation data:", errorMessage);
        throw new Error(`Network error reaching Google Elevation API: ${errorMessage}. Check connectivity & firewall.`);
    }
    if (!response.ok) {
        let errorBody = "Could not retrieve error body.";
        try {
            errorBody = await response.text();
        } catch (textError) {
            console.warn("Failed to read error body from Google API response:", textError);
        }
        console.error("Google Elevation API request failed:", response.status, errorBody);
        throw new Error(`Google Elevation API request failed (Status: ${response.status}). Details: ${errorBody.substring(0, 200)}`);
    }
    let data;
    try {
        data = await response.json();
    } catch (jsonError) {
        const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
        console.error("Failed to parse JSON response from Google Elevation API:", errorMessage);
        throw new Error(`Failed to parse response from Google Elevation API: ${errorMessage}`);
    }
    if (data.status !== 'OK') {
        console.error("Google Elevation API error:", data.status, data.error_message);
        throw new Error(`Google Elevation API error: ${data.status} - ${data.error_message || 'Unknown API error'}`);
    }
    if (!data.results || data.results.length === 0) {
        throw new Error("Google Elevation API returned no results for the given path. Check coordinates.");
    }
    return data.results.map((sample)=>({
            elevation: sample.elevation,
            location: {
                lat: sample.location.lat,
                lng: sample.location.lng
            },
            resolution: sample.resolution
        }));
}
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ performLosAnalysis(prevState, formData) {
    try {
        const rawFormData = {
            pointA: {
                name: String(formData.get('pointA.name') ?? "Site A"),
                lat: String(formData.get('pointA.lat') ?? ""),
                lng: String(formData.get('pointA.lng') ?? ""),
                height: String(formData.get('pointA.height') ?? "")
            },
            pointB: {
                name: String(formData.get('pointB.name') ?? "Site B"),
                lat: String(formData.get('pointB.lat') ?? ""),
                lng: String(formData.get('pointB.lng') ?? ""),
                height: String(formData.get('pointB.height') ?? "")
            },
            clearanceThreshold: String(formData.get('clearanceThreshold') ?? "")
        };
        const validationResult = ServerActionAnalysisSchema.safeParse(rawFormData);
        if (!validationResult.success) {
            const flattenedErrors = validationResult.error.flatten();
            let finalErrorMessage = "Input validation failed. Issues:\n";
            if (flattenedErrors.formErrors.length > 0) {
                finalErrorMessage += `Form Errors: ${flattenedErrors.formErrors.map(String).join(', ')}\n`;
            }
            const fieldErrorMessages = Object.entries(flattenedErrors.fieldErrors).map(([path, messages])=>{
                const typedMessages = messages; // Assuming messages are string arrays
                return `${String(path)}: ${typedMessages.map(String).join(', ')}`;
            }).join('\n');
            if (fieldErrorMessages) {
                finalErrorMessage += `Field Errors:\n${fieldErrorMessages}`;
            }
            console.error("Server-side Zod validation errors:", finalErrorMessage, flattenedErrors);
            throw new Error(finalErrorMessage.trim());
        }
        const validatedData = validationResult.data;
        const params = {
            pointA: {
                name: validatedData.pointA.name,
                lat: parseFloat(rawFormData.pointA.lat),
                lng: parseFloat(rawFormData.pointA.lng),
                towerHeight: validatedData.pointA.height
            },
            pointB: {
                name: validatedData.pointB.name,
                lat: parseFloat(rawFormData.pointB.lat),
                lng: parseFloat(rawFormData.pointB.lng),
                towerHeight: validatedData.pointB.height
            },
            clearanceThreshold: validatedData.clearanceThreshold
        };
        const elevationData = await getGoogleElevationData(params.pointA, params.pointB, 100);
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["analyzeLOS"])(params, elevationData);
        return {
            ...result,
            id: new Date().toISOString() + Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            message: `${result.message} Using Google Elevation API data.`
        };
    } catch (err) {
        let clientErrorMessageString;
        if (err instanceof Error) {
            clientErrorMessageString = String(err.message);
        } else {
            clientErrorMessageString = "An unknown error occurred during analysis.";
        }
        console.error("Error in performLosAnalysis server action:", clientErrorMessageString, err);
        throw new Error(clientErrorMessageString);
    }
}
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ generateSingleAnalysisPdfReportAction(analysisResult, reportOptions) {
    try {
        if (!analysisResult) {
            return {
                success: false,
                error: "Analysis result data is missing."
            };
        }
        const pdfBytes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$generatePdfReport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generatePdfReportForSingleAnalysis"])(analysisResult, reportOptions);
        const base64Pdf = Buffer.from(pdfBytes).toString('base64');
        const safePointAName = (analysisResult.pointA.name || "SiteA").replace(/[^a-zA-Z0-9]/g, '_');
        const safePointBName = (analysisResult.pointB.name || "SiteB").replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `LOS_Report_${safePointAName}_to_${safePointBName}.pdf`;
        return {
            success: true,
            data: {
                base64Pdf,
                fileName
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during PDF report generation.";
        console.error("Error generating PDF report action:", errorMessage, error);
        return {
            success: false,
            error: `Failed to generate PDF report: ${errorMessage}`
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    performLosAnalysis,
    generateSingleAnalysisPdfReportAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(performLosAnalysis, "6032618b8418ac76277e7b9b725912dd40e39f206e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(generateSingleAnalysisPdfReportAction, "606e059f8f40dd4b377c51875d12e3221ca87a227e", null);
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
;
;
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "6032618b8418ac76277e7b9b725912dd40e39f206e": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["performLosAnalysis"]),
    "606e059f8f40dd4b377c51875d12e3221ca87a227e": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateSingleAnalysisPdfReportAction"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "6032618b8418ac76277e7b9b725912dd40e39f206e": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["6032618b8418ac76277e7b9b725912dd40e39f206e"]),
    "606e059f8f40dd4b377c51875d12e3221ca87a227e": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["606e059f8f40dd4b377c51875d12e3221ca87a227e"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
}}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/page.tsx (client reference/proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/page.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/page.tsx <module evaluation>", "default");
}}),
"[project]/src/app/page.tsx (client reference/proxy)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/page.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/page.tsx", "default");
}}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/page.tsx (client reference/proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__ = __turbopack_context__.i("[project]/src/app/page.tsx (client reference/proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__);
}}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__d976c6be._.js.map