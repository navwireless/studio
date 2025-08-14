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
__turbopack_context__.s({
    "BRAND_COLOR_ACCENT_RGB": (()=>BRAND_COLOR_ACCENT_RGB),
    "BRAND_COLOR_PRIMARY_RGB": (()=>BRAND_COLOR_PRIMARY_RGB),
    "DEFAULT_COMPANY_NAME": (()=>DEFAULT_COMPANY_NAME),
    "DEFAULT_FIBER_REPORT_TITLE": (()=>DEFAULT_FIBER_REPORT_TITLE),
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
    "formatAnalysisDataForReportTable": (()=>formatAnalysisDataForReportTable),
    "formatFiberDataForReportTable": (()=>formatFiberDataForReportTable)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/docx/build/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/colors.js [app-rsc] (ecmascript)");
;
;
const DEFAULT_COMPANY_NAME = "Nav Wireless Technologies Pvt. Ltd.";
const DEFAULT_REPORT_TITLE = "LiFi Link Feasibility Report";
const DEFAULT_FIBER_REPORT_TITLE = "Fiber Path Analysis Report";
const DEFAULT_LOGO_URL = "https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png";
const BRAND_COLOR_PRIMARY_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(63 / 255, 81 / 255, 181 / 255);
const BRAND_COLOR_ACCENT_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0 / 255, 150 / 255, 136 / 255);
const TEXT_COLOR_DARK_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.1, 0.1, 0.1);
const TEXT_COLOR_LIGHT_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.4, 0.4, 0.4);
const LINE_COLOR_RGB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.8, 0.8, 0.8);
async function addHeaderToPdfPage(page, font, pdfDoc, reportTitle = DEFAULT_REPORT_TITLE, companyName = DEFAULT_COMPANY_NAME, logoImageBytes) {
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
    const titleWidth = font.widthOfTextAtSize(reportTitle, titleFontSize);
    page.drawText(reportTitle, {
        x: width - margin - titleWidth,
        y: height - margin - titleFontSize,
        font: font,
        size: titleFontSize,
        color: TEXT_COLOR_DARK_RGB
    });
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
    return lineY - 20; // Return Y position below the header line
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
function formatFiberDataForReportTable(fiberResult, // Ensure these have lat/lng as numbers for formatting consistency in the report
pointA_form, pointB_form, snapRadiusUsed) {
    const data = [
        {
            key: "Site A Name",
            value: pointA_form.name || "Site A"
        },
        {
            key: "Site A Original Coordinates",
            value: `${pointA_form.lat.toFixed(6)}, ${pointA_form.lng.toFixed(6)}`
        },
        {
            key: "Site B Name",
            value: pointB_form.name || "Site B"
        },
        {
            key: "Site B Original Coordinates",
            value: `${pointB_form.lat.toFixed(6)}, ${pointB_form.lng.toFixed(6)}`
        },
        {
            key: "Snap to Road Radius Used",
            value: `${snapRadiusUsed} m`
        },
        {
            key: "Calculation Status",
            value: fiberResult.status.replace(/_/g, ' ').replace(/\b\w/g, (l)=>l.toUpperCase())
        }
    ];
    if (fiberResult.status === 'success') {
        data.push({
            key: "Total Fiber Path Distance",
            value: `${fiberResult.totalDistanceMeters?.toFixed(1) ?? 'N/A'} m`
        }, {
            key: "Offset A (Site to Road)",
            value: `${fiberResult.offsetDistanceA_meters?.toFixed(1) ?? 'N/A'} m`
        }, {
            key: "Site A Snapped Coords",
            value: fiberResult.pointA_snappedToRoad ? `${fiberResult.pointA_snappedToRoad.lat.toFixed(6)}, ${fiberResult.pointA_snappedToRoad.lng.toFixed(6)}` : "N/A"
        }, {
            key: "Road Route Distance",
            value: `${fiberResult.roadRouteDistanceMeters?.toFixed(1) ?? 'N/A'} m`
        }, {
            key: "Offset B (Road to Site)",
            value: `${fiberResult.offsetDistanceB_meters?.toFixed(1) ?? 'N/A'} m`
        }, {
            key: "Site B Snapped Coords",
            value: fiberResult.pointB_snappedToRoad ? `${fiberResult.pointB_snappedToRoad.lat.toFixed(6)}, ${fiberResult.pointB_snappedToRoad.lng.toFixed(6)}` : "N/A"
        });
    }
    if (fiberResult.errorMessage) {
        data.push({
            key: "Notes/Error",
            value: fiberResult.errorMessage
        });
    }
    return data;
}
async function fetchLogoImageBytes(url) {
    try {
        if (typeof fetch === 'undefined') {
            console.warn("fetch is not defined. Cannot fetch logo image.");
            return undefined;
        }
        const response = await fetch(url, {
            mode: 'cors'
        });
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
function createDocxHeader(logoImageBuffer) {
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
"[project]/src/tools/report-generator/generateFiberPdfReport.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/tools/report-generator/generateFiberPdfReport.ts
__turbopack_context__.s({
    "generatePdfReportForFiberAnalysis": (()=>generatePdfReportForFiberAnalysis)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/index.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$PDFDocument$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__PDFDocument$3e$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/PDFDocument.js [app-rsc] (ecmascript) <export default as PDFDocument>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/colors.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/pdf-lib/es/api/StandardFonts.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/report-generator/reportUtils.ts [app-rsc] (ecmascript)");
;
;
const smallFontSize = 8;
async function generatePdfReportForFiberAnalysis(fiberPathResult, // These `pointA_form` and `pointB_form` will now have name (string) and lat/lng (number)
pointA_form, pointB_form, snapRadiusUsed, options) {
    const pdfDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$PDFDocument$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__PDFDocument$3e$__["PDFDocument"].create();
    const helveticaFont = await pdfDoc.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StandardFonts"].Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$StandardFonts$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["StandardFonts"].HelveticaBold);
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize(); // Get initial page dimensions
    const reportTitle = options?.reportTitle || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_FIBER_REPORT_TITLE"];
    const companyName = options?.companyName || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_COMPANY_NAME"];
    let logoBytes = options?.logoImageBytes;
    if (!logoBytes && options?.logoUrl !== null) {
        logoBytes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchLogoImageBytes"])(options?.logoUrl || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_LOGO_URL"]);
    }
    let currentY = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addHeaderToPdfPage"])(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
    currentY -= 20;
    const contentMargin = 50;
    const regularFontSize = 10;
    const lineHeight = 15;
    const sectionSpacing = 20;
    const keyColumnWidth = 200;
    const valueColumnX = contentMargin + keyColumnWidth + 10;
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: contentMargin,
        y: currentY,
        font: helveticaFont,
        size: regularFontSize,
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_LIGHT_RGB"]
    });
    currentY -= lineHeight * 1.5;
    page.drawText("Fiber Path Analysis Summary", {
        x: contentMargin,
        y: currentY,
        font: helveticaBoldFont,
        size: 13,
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND_COLOR_ACCENT_RGB"]
    });
    currentY -= lineHeight * 1.5;
    // Pass PointCoordinates (lat/lng as numbers) to the formatter
    const fiberReportData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatFiberDataForReportTable"])(fiberPathResult, pointA_form, pointB_form, snapRadiusUsed);
    for (const item of fiberReportData){
        if (currentY < contentMargin + lineHeight * 3) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addFooterToPdfPage"])(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() + 1, companyName);
            page = pdfDoc.addPage();
            currentY = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addHeaderToPdfPage"])(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
            currentY -= 20;
            page.drawText("Fiber Path Analysis Summary (Continued)", {
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
            color: item.key === "Calculation Status" && fiberPathResult.status === 'success' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BRAND_COLOR_ACCENT_RGB"] : item.key === "Calculation Status" && fiberPathResult.status !== 'success' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$pdf$2d$lib$2f$es$2f$api$2f$colors$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rgb"])(0.8, 0.2, 0.2) : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_DARK_RGB"],
            maxWidth: width - valueColumnX - contentMargin
        });
        currentY -= lineHeight;
    }
    currentY -= sectionSpacing;
    if (currentY < contentMargin + 150) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addFooterToPdfPage"])(page, helveticaFont, pdfDoc.getPageCount(), pdfDoc.getPageCount() + 1, companyName);
        page = pdfDoc.addPage();
        currentY = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addHeaderToPdfPage"])(page, helveticaBoldFont, pdfDoc, reportTitle, companyName, logoBytes);
        currentY -= 20;
    }
    page.drawText("Map Visualization (Placeholder)", {
        x: contentMargin,
        y: currentY,
        font: helveticaBoldFont,
        size: 12,
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_DARK_RGB"]
    });
    currentY -= lineHeight;
    page.drawText("Refer to interactive map in the application for visual path.", {
        x: contentMargin,
        y: currentY,
        font: helveticaFont,
        size: smallFontSize,
        color: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TEXT_COLOR_LIGHT_RGB"]
    });
    currentY -= lineHeight;
    page.drawRectangle({
        x: contentMargin,
        y: currentY - 120,
        width: width - 2 * contentMargin,
        height: 100,
        borderColor: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LINE_COLOR_RGB"],
        borderWidth: 1
    });
    currentY -= 130;
    const totalPages = pdfDoc.getPageCount();
    for(let i = 0; i < totalPages; i++){
        const currentPageObject = pdfDoc.getPage(i);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$reportUtils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addFooterToPdfPage"])(currentPageObject, helveticaFont, i + 1, totalPages, companyName);
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
;
}}),
"[project]/src/tools/report-generator/index.ts [app-rsc] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$generatePdfReport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/report-generator/generatePdfReport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$generateFiberPdfReport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/report-generator/generateFiberPdfReport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/tools/report-generator/index.ts [app-rsc] (ecmascript) <locals>");
}}),
"[project]/src/lib/fiber-calculator-form-schema.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "FiberCalculatorFormSchema": (()=>FiberCalculatorFormSchema),
    "PointInputSchema_FC": (()=>PointInputSchema_FC),
    "defaultFiberCalculatorFormValues": (()=>defaultFiberCalculatorFormValues)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
;
const PointInputSchema_FC = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, "Name is required").max(50, "Name too long"),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>{
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
    }, "Latitude must be between -90 and 90"),
    lng: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>{
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
    }, "Longitude must be between -180 and 180")
});
const FiberCalculatorFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    pointA: PointInputSchema_FC,
    pointB: PointInputSchema_FC,
    fiberSnapRadius: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].coerce // coerce to number
    .number({
        required_error: "Snap radius is required",
        invalid_type_error: "Snap radius must be a number"
    }).min(1, "Snap radius must be at least 1 meter.").max(10000, "Snap radius seems too large (max 10,000m).")
});
const defaultFiberCalculatorFormValues = {
    pointA: {
        name: 'Site A',
        lat: '',
        lng: ''
    },
    pointB: {
        name: 'Site B',
        lat: '',
        lng: ''
    },
    fiberSnapRadius: 500
};
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/events [external] (events, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}}),
"[externals]/util [external] (util, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}}),
"[project]/src/lib/xml-escape.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/lib/xml-escape.ts
/**
 * Escapes characters in a string to make it safe for inclusion in XML content.
 * Handles undefined or null input by returning an empty string.
 * @param str The string to escape.
 * @returns The escaped string.
 */ __turbopack_context__.s({
    "xmlEscape": (()=>xmlEscape)
});
function xmlEscape(str) {
    if (str === undefined || str === null) {
        return '';
    }
    return String(str).replace(/[<>&"']/g, (match)=>{
        switch(match){
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
            case '"':
                return '&quot;';
            case "'":
                return '&apos;';
            default:
                return match; // Should not happen based on regex
        }
    });
}
}}),
"[project]/src/lib/polyline-decoder.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/lib/polyline-decoder.ts
__turbopack_context__.s({
    "decodePolyline": (()=>decodePolyline),
    "formatCoordinatesForKml": (()=>formatCoordinatesForKml)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mapbox$2f$polyline$2f$src$2f$polyline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mapbox/polyline/src/polyline.js [app-rsc] (ecmascript)");
;
function decodePolyline(encodedPolyline) {
    if (!encodedPolyline || typeof encodedPolyline !== 'string') {
        console.warn("decodePolyline: Invalid or empty encoded polyline string provided.");
        return [];
    }
    try {
        // The @mapbox/polyline library decodes to [latitude, longitude] pairs
        const decodedCoordinates = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mapbox$2f$polyline$2f$src$2f$polyline$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].decode(encodedPolyline);
        return decodedCoordinates;
    } catch (error) {
        console.error("decodePolyline: Error decoding polyline:", error);
        return [];
    }
}
function formatCoordinatesForKml(coordinates) {
    if (!coordinates || coordinates.length === 0) {
        return "";
    }
    // KML format is longitude,latitude,altitude (optional)
    return coordinates.map((coord)=>`${coord[1]},${coord[0]},0`).join(' ');
}
}}),
"[project]/src/app/actions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"00ed03f1d2d8a98b5211ddd718472e887421870838":"getGoogleMapsApiKey","402d3049fed11f2d39fa3d58520db39f6249045915":"generateFiberReportAction","4041e2f7f83ffb09b59671e5406bd714b8f54cba07":"generateSingleFiberPathKmzAction","6032618b8418ac76277e7b9b725912dd40e39f206e":"performLosAnalysis","606e059f8f40dd4b377c51875d12e3221ca87a227e":"generateSingleAnalysisPdfReportAction"} */ __turbopack_context__.s({
    "generateFiberReportAction": (()=>generateFiberReportAction),
    "generateSingleAnalysisPdfReportAction": (()=>generateSingleAnalysisPdfReportAction),
    "generateSingleFiberPathKmzAction": (()=>generateSingleFiberPathKmzAction),
    "getGoogleMapsApiKey": (()=>getGoogleMapsApiKey),
    "performLosAnalysis": (()=>performLosAnalysis)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/los-calculator.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/tools/report-generator/index.ts [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$generatePdfReport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/report-generator/generatePdfReport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fiber$2d$calculator$2d$form$2d$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/fiber-calculator-form-schema.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$generateFiberPdfReport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/report-generator/generateFiberPdfReport.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jszip$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jszip/lib/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/xml-escape.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$polyline$2d$decoder$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/polyline-decoder.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
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
async function getGoogleElevationData(pointA, pointB, samples = 100) {
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
                const typedMessages = messages;
                return `${String(path)}: ${typedMessages.map(String).join(', ')}`;
            }).join('\n');
            if (fieldErrorMessages) {
                finalErrorMessage += `Field Errors:\n${fieldErrorMessages}`;
            }
            console.error("Server-side Zod validation errors:", finalErrorMessage, flattenedErrors);
            return {
                error: finalErrorMessage.trim(),
                fieldErrors: flattenedErrors.fieldErrors
            };
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
        return {
            error: clientErrorMessageString
        };
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
const FiberReportParamsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    fiberPathResult: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].custom((val)=>val !== null && typeof val === 'object' && 'status' in val, {
        message: "Valid FiberPathResult object is required."
    }),
    pointA_form: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fiber$2d$calculator$2d$form$2d$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PointInputSchema_FC"],
    pointB_form: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$fiber$2d$calculator$2d$form$2d$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PointInputSchema_FC"],
    snapRadiusUsed_form: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].number().min(0, "Snap radius must be non-negative."),
    reportOptions: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].custom().optional()
});
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ generateFiberReportAction(params) {
    try {
        const validation = FiberReportParamsSchema.safeParse(params);
        if (!validation.success) {
            console.error("Invalid parameters for generateFiberReportAction:", validation.error.flatten());
            const errorMessages = validation.error.errors.map((e)=>`${e.path.join('.')}: ${e.message}`).join('; ');
            return {
                success: false,
                error: `Invalid input: ${errorMessages}`
            };
        }
        const { fiberPathResult, pointA_form, pointB_form, snapRadiusUsed_form, reportOptions } = validation.data;
        if (!fiberPathResult || fiberPathResult.status !== 'success') {
            return {
                success: false,
                error: "Cannot generate report: Fiber path calculation was not successful or data is missing."
            };
        }
        const pointA_coords_report = {
            lat: parseFloat(pointA_form.lat),
            lng: parseFloat(pointA_form.lng)
        };
        const pointB_coords_report = {
            lat: parseFloat(pointB_form.lat),
            lng: parseFloat(pointB_form.lng)
        };
        if (isNaN(pointA_coords_report.lat) || isNaN(pointA_coords_report.lng) || isNaN(pointB_coords_report.lat) || isNaN(pointB_coords_report.lng)) {
            return {
                success: false,
                error: "Invalid coordinates provided in form data for report generation."
            };
        }
        const pdfBytes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$report$2d$generator$2f$generateFiberPdfReport$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generatePdfReportForFiberAnalysis"])(fiberPathResult, {
            name: pointA_form.name,
            ...pointA_coords_report
        }, {
            name: pointB_form.name,
            ...pointB_coords_report
        }, snapRadiusUsed_form, reportOptions);
        const base64Pdf = Buffer.from(pdfBytes).toString('base64');
        const safePointAName = (pointA_form.name || "SiteA").replace(/[^a-zA-Z0-9]/g, '_');
        const safePointBName = (pointB_form.name || "SiteB").replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Fiber_Path_Report_${safePointAName}_to_${safePointBName}.pdf`;
        return {
            success: true,
            data: {
                base64Pdf,
                fileName
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during Fiber PDF report generation.";
        console.error("Error generating Fiber PDF report action:", errorMessage, error);
        return {
            success: false,
            error: `Failed to generate Fiber PDF report: ${errorMessage}`
        };
    }
}
// Schema for KMZ generation parameters for a single fiber path
const SingleFiberPathKmzParamsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    fiberPathResult: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].custom((val)=>{
        if (val === null || typeof val !== 'object' || !('status' in val)) {
            return false;
        }
        return val.status === 'success';
    }, {
        message: "Successful FiberPathResult object is required for KMZ generation."
    }),
    pointA_name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, "Point A name is required."),
    pointB_name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, "Point B name is required.")
});
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ generateSingleFiberPathKmzAction(params) {
    try {
        const validation = SingleFiberPathKmzParamsSchema.safeParse(params);
        if (!validation.success) {
            const errorMessages = validation.error.errors.map((e)=>`${e.path.join('.')}: ${e.message}`).join('; ');
            return {
                success: false,
                error: `Invalid input for KMZ generation: ${errorMessages}`
            };
        }
        const { fiberPathResult, pointA_name, pointB_name } = validation.data;
        // KML Styles
        let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Fiber Path: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointA_name)} to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointB_name)}</name>
    <Style id="originalPointStyle">
      <IconStyle><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><scale>1.0</scale></IconStyle>
      <LabelStyle><scale>0.8</scale></LabelStyle>
    </Style>
    <Style id="snappedPointStyle">
      <IconStyle><Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-blank.png</href></Icon><scale>0.8</scale></IconStyle>
      <LabelStyle><scale>0.7</scale></LabelStyle>
    </Style>
    <Style id="offsetLineStyle">
      <LineStyle><color>a000aaff</color><width>3</width></LineStyle> <!-- Orange-ish, slightly transparent -->
    </Style>
    <Style id="roadRouteLineStyle">
      <LineStyle><color>a0ffaa00</color><width>4</width></LineStyle> <!-- Cyan-ish, slightly transparent -->
    </Style>

    <Folder><name>Original Sites</name>
      <Placemark>
        <name>${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointA_name)} (Original)</name>
        <styleUrl>#originalPointStyle</styleUrl>
        <Point><coordinates>${fiberPathResult.pointA_original.lng},${fiberPathResult.pointA_original.lat},0</coordinates></Point>
      </Placemark>
      <Placemark>
        <name>${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointB_name)} (Original)</name>
        <styleUrl>#originalPointStyle</styleUrl>
        <Point><coordinates>${fiberPathResult.pointB_original.lng},${fiberPathResult.pointB_original.lat},0</coordinates></Point>
      </Placemark>
    </Folder>

    <Folder><name>Fiber Path Segments</name>`;
        // Add snapped points if they exist
        if (fiberPathResult.pointA_snappedToRoad) {
            kmlContent += `
      <Placemark>
        <name>${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointA_name)} (Snapped to Road)</name>
        <styleUrl>#snappedPointStyle</styleUrl>
        <Point><coordinates>${fiberPathResult.pointA_snappedToRoad.lng},${fiberPathResult.pointA_snappedToRoad.lat},0</coordinates></Point>
      </Placemark>`;
        }
        if (fiberPathResult.pointB_snappedToRoad) {
            kmlContent += `
      <Placemark>
        <name>${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointB_name)} (Snapped to Road)</name>
        <styleUrl>#snappedPointStyle</styleUrl>
        <Point><coordinates>${fiberPathResult.pointB_snappedToRoad.lng},${fiberPathResult.pointB_snappedToRoad.lat},0</coordinates></Point>
      </Placemark>`;
        }
        // Iterate through segments to draw lines
        if (fiberPathResult.segments) {
            for (const segment of fiberPathResult.segments){
                let segmentName = "";
                let styleUrl = "";
                let coordinatesString = "";
                let description = `Segment Type: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(segment.type)}\nDistance: ${segment.distanceMeters.toFixed(1)} m`;
                switch(segment.type){
                    case 'offset_a':
                        segmentName = `Offset A: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointA_name)} to Road`;
                        styleUrl = "#offsetLineStyle";
                        coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
                        break;
                    case 'offset_b':
                        segmentName = `Offset B: Road to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointB_name)}`;
                        styleUrl = "#offsetLineStyle";
                        coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
                        break;
                    case 'road_route':
                        segmentName = `Road Segment (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointA_name)} to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(pointB_name)})`;
                        styleUrl = "#roadRouteLineStyle";
                        if (segment.pathPolyline) {
                            const decodedCoords = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$polyline$2d$decoder$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decodePolyline"])(segment.pathPolyline);
                            coordinatesString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$polyline$2d$decoder$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatCoordinatesForKml"])(decodedCoords);
                            description += `\nEncoded Polyline (for reference): ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(segment.pathPolyline)}`;
                        } else {
                            console.warn("KMZ Gen: Road_route segment missing pathPolyline. Drawing straight line.");
                            coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
                            description += "\nNote: Polyline missing, showing straight line.";
                        }
                        break;
                }
                if (segmentName && styleUrl && coordinatesString) {
                    kmlContent += `
          <Placemark>
            <name>${segmentName}</name>
            <styleUrl>${styleUrl}</styleUrl>
            <description>${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$xml$2d$escape$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["xmlEscape"])(description)}</description>
            <LineString><tessellate>1</tessellate><coordinates>${coordinatesString}</coordinates></LineString>
          </Placemark>`;
                }
            }
        }
        kmlContent += `
    </Folder>
  </Document>
</kml>`;
        const zip = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jszip$2f$lib$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]();
        zip.file("doc.kml", kmlContent);
        const kmzBuffer = await zip.generateAsync({
            type: "nodebuffer",
            mimeType: "application/vnd.google-earth.kmz"
        });
        const base64Kmz = kmzBuffer.toString('base64');
        const safePointAName = (pointA_name || "SiteA").replace(/[^a-zA-Z0-9]/g, '_');
        const safePointBName = (pointB_name || "SiteB").replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `Fiber_Path_KMZ_${safePointAName}_to_${safePointBName}.kmz`;
        return {
            success: true,
            data: {
                base64Kmz,
                fileName
            }
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during KMZ generation.";
        console.error("Error generating Single Fiber Path KMZ action:", errorMessage, error);
        return {
            success: false,
            error: `Failed to generate KMZ: ${errorMessage}`
        };
    }
}
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ getGoogleMapsApiKey() {
    const apiKey = ("TURBOPACK compile-time value", "AIzaSyBDHqUgSQVWknYUV-Y9cuLw50Oq-b88r4Y");
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    }
    return apiKey;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    performLosAnalysis,
    generateSingleAnalysisPdfReportAction,
    generateFiberReportAction,
    generateSingleFiberPathKmzAction,
    getGoogleMapsApiKey
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(performLosAnalysis, "6032618b8418ac76277e7b9b725912dd40e39f206e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(generateSingleAnalysisPdfReportAction, "606e059f8f40dd4b377c51875d12e3221ca87a227e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(generateFiberReportAction, "402d3049fed11f2d39fa3d58520db39f6249045915", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(generateSingleFiberPathKmzAction, "4041e2f7f83ffb09b59671e5406bd714b8f54cba07", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getGoogleMapsApiKey, "00ed03f1d2d8a98b5211ddd718472e887421870838", null);
}}),
"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"6091a7f5eb670c7a62c05633ebf85658287acaec18":"getElevationProfileForPairAction"} */ __turbopack_context__.s({
    "getElevationProfileForPairAction": (()=>getElevationProfileForPairAction)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
// --- Google Elevation API Configuration ---
const GOOGLE_ELEVATION_API_KEY = process.env.GOOGLE_ELEVATION_API_KEY;
const GOOGLE_ELEVATION_API_URL = "https://maps.googleapis.com/maps/api/elevation/json";
const GOOGLE_ELEVATION_API_SAMPLES = 100; // Number of samples along the path
/**
 * Fetches elevation data from Google Elevation API for a pair of coordinates.
 * This is a simplified version of getGoogleElevationData for bulk use.
 */ async function fetchElevationForPair(pointA, pointB, samples = GOOGLE_ELEVATION_API_SAMPLES) {
    if (!GOOGLE_ELEVATION_API_KEY || GOOGLE_ELEVATION_API_KEY.trim() === "" || GOOGLE_ELEVATION_API_KEY === "YOUR_GOOGLE_ELEVATION_API_KEY_HERE") {
        console.error("Google Elevation API key is not configured or is a placeholder for bulk analysis.");
        throw new Error("Elevation service API key is not configured. Please check server environment variables.");
    }
    const pathStr = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
    const url = `${GOOGLE_ELEVATION_API_URL}?path=${pathStr}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY.trim()}`;
    let response;
    try {
        response = await fetch(url);
    } catch (networkError) {
        const errorMessage = networkError instanceof Error ? networkError.message : String(networkError);
        console.error("Network error fetching elevation data for bulk analysis:", errorMessage);
        throw new Error(`Network error while trying to reach Google Elevation API for pair ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng}: ${errorMessage}`);
    }
    if (!response.ok) {
        let errorBody = "Could not retrieve error body from Google API.";
        try {
            errorBody = await response.text();
        } catch (textError) {
        // Ignore if reading error body fails
        }
        console.error(`Google Elevation API request failed for bulk analysis (Pair: ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng}): ${response.status}`, errorBody);
        throw new Error(`Google Elevation API request failed for pair with status ${response.status}. Details: ${errorBody.substring(0, 200)}`);
    }
    let data;
    try {
        data = await response.json();
    } catch (jsonError) {
        const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
        console.error("Failed to parse JSON response from Google Elevation API for bulk analysis:", errorMessage);
        throw new Error(`Failed to parse response from Google Elevation API for pair: ${errorMessage}`);
    }
    if (data.status !== 'OK') {
        console.error("Google Elevation API error for bulk analysis (Pair: ${pointA.lat},${pointA.lng} to ${pointB.lat},${pointB.lng}):", data.status, data.error_message);
        throw new Error(`Google Elevation API error for pair: ${data.status} - ${data.error_message || 'Unknown API error'}`);
    }
    if (!data.results || data.results.length === 0) {
        throw new Error("Google Elevation API returned no results for the given path in bulk analysis. Check coordinates.");
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
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ getElevationProfileForPairAction(pointA, pointB) {
    try {
        const elevationProfile = await fetchElevationForPair(pointA, pointB, GOOGLE_ELEVATION_API_SAMPLES);
        return {
            profile: elevationProfile
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred fetching elevation profile for pair.";
        console.error("Error in getElevationProfileForPairAction:", errorMessage);
        return {
            error: errorMessage
        }; // Return error as part of the response object
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getElevationProfileForPairAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getElevationProfileForPairAction, "6091a7f5eb670c7a62c05633ebf85658287acaec18", null);
}}),
"[externals]/http [external] (http, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/fs [external] (fs, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/crypto [external] (crypto, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}}),
"[externals]/assert [external] (assert, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}}),
"[externals]/tty [external] (tty, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}}),
"[externals]/net [external] (net, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[project]/src/tools/fiberPathCalculator/calculator.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/tools/fiberPathCalculator/calculator.ts
// This file will contain the core server-side logic for calculating fiber paths
// using Google Maps Platform APIs.
// IMPORTANT: This module should only be used server-side.
/* __next_internal_action_entry_do_not_use__ {"408cf1e98a8bb42582bb4e80f384540f52cfa966ed":"calculateFiberPath"} */ __turbopack_context__.s({
    "calculateFiberPath": (()=>calculateFiberPath)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$googlemaps$2f$google$2d$maps$2d$services$2d$js$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@googlemaps/google-maps-services-js/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/los-calculator.ts [app-rsc] (ecmascript)"); // For Haversine distance
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
const GOOGLE_DIRECTIONS_API_KEY = process.env.GOOGLE_DIRECTIONS_API_KEY;
const mapsClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$googlemaps$2f$google$2d$maps$2d$services$2d$js$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Client"]({});
/**
 * Calculates the straight-line distance between two points in meters.
 */ function calculateOffsetDistanceMeters(p1, p2) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calculateDistanceKm"])(p1, p2) * 1000;
}
/**
 * Finds the nearest point on a road to a given coordinate within a specified radius
 * and calculates the offset distance using the Google Directions API.
 * 
 * @param point The original coordinate.
 * @param radiusMeters The maximum distance to search for a road.
 * @param client The Google Maps API client.
 * @returns A promise that resolves to an object with the snapped road point and offset distance, or null if no road is found within radius.
 */ async function findNearestRoadPointWithOffset(point, radiusMeters, client) {
    if (!GOOGLE_DIRECTIONS_API_KEY) {
        console.error("GOOGLE_DIRECTIONS_API_KEY is not configured.");
        throw new Error("Directions API key not configured on server.");
    }
    const request = {
        params: {
            origin: {
                lat: point.lat,
                lng: point.lng
            },
            destination: {
                lat: point.lat,
                lng: point.lng
            },
            mode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$googlemaps$2f$google$2d$maps$2d$services$2d$js$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TravelMode"].driving,
            units: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$googlemaps$2f$google$2d$maps$2d$services$2d$js$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UnitSystem"].metric,
            key: GOOGLE_DIRECTIONS_API_KEY
        }
    };
    try {
        const response = await client.directions(request);
        if (response.data.status === 'OK' && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            if (route.legs.length > 0 && route.legs[0].steps.length > 0) {
                const leg = route.legs[0];
                // The start_location of the first leg is the point Google snapped to the road network
                const snappedRoadPoint = {
                    lat: leg.start_location.lat,
                    lng: leg.start_location.lng
                };
                const offsetDistanceMeters = calculateOffsetDistanceMeters(point, snappedRoadPoint);
                if (offsetDistanceMeters <= radiusMeters) {
                    return {
                        roadPoint: snappedRoadPoint,
                        offsetDistanceMeters
                    };
                } else {
                    console.log(`Road found for point ${point.lat},${point.lng}, but offset ${offsetDistanceMeters}m exceeds radius ${radiusMeters}m.`);
                    return null;
                }
            } else {
                console.log(`Directions API OK, but no route/legs/steps found for snapping point ${point.lat},${point.lng}. This might mean it's too far from any road network for the API to snap.`);
                return null;
            }
        } else {
            console.log(`Directions API status not OK for snapping point ${point.lat},${point.lng}: ${response.data.status}. Error: ${response.data.error_message}`);
            return null;
        }
    } catch (error) {
        console.error(`Error calling Google Directions API for road snapping (point: ${point.lat},${point.lng}):`, error.response?.data || error.message);
        throw new Error(`Google Directions API error during road snapping: ${error.response?.data?.error_message || error.message}`);
    }
}
/**
 * Gets the driving route between two points using Google Directions API.
 * @param origin The starting road point.
 * @param destination The ending road point.
 * @param client The Google Maps API client.
 * @returns A promise resolving to route details (distance, polyline, segments) or null if no route found.
 */ async function getRoadRoute(origin, destination, client) {
    if (!GOOGLE_DIRECTIONS_API_KEY) {
        console.error("GOOGLE_DIRECTIONS_API_KEY is not configured.");
        throw new Error("Directions API key not configured on server.");
    }
    const request = {
        params: {
            origin: {
                lat: origin.lat,
                lng: origin.lng
            },
            destination: {
                lat: destination.lat,
                lng: destination.lng
            },
            mode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$googlemaps$2f$google$2d$maps$2d$services$2d$js$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TravelMode"].driving,
            units: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$googlemaps$2f$google$2d$maps$2d$services$2d$js$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["UnitSystem"].metric,
            key: GOOGLE_DIRECTIONS_API_KEY
        }
    };
    try {
        const response = await client.directions(request);
        if (response.data.status === 'OK' && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            const leg = route.legs[0];
            if (leg && leg.distance && route.overview_polyline) {
                const routeSegmentsDetailed = route.legs.flatMap((currentLeg)=>currentLeg.steps.map((step)=>({
                            type: 'road_route',
                            distanceMeters: step.distance.value,
                            pathPolyline: step.polyline.points,
                            startPoint: {
                                lat: step.start_location.lat,
                                lng: step.start_location.lng
                            },
                            endPoint: {
                                lat: step.end_location.lat,
                                lng: step.end_location.lng
                            }
                        })));
                return {
                    distanceMeters: leg.distance.value,
                    polyline: route.overview_polyline.points,
                    segments: routeSegmentsDetailed
                };
            } else {
                console.log("Directions API OK, but missing leg, distance, or polyline for route between", origin, "and", destination);
                return null;
            }
        } else if (response.data.status === 'ZERO_RESULTS') {
            console.log("No road route found (ZERO_RESULTS) between", origin, "and", destination);
            return null;
        } else {
            console.log(`Directions API status not OK for routing: ${response.data.status}. Error: ${response.data.error_message}`);
            return null;
        }
    } catch (error) {
        console.error(`Error calling Google Directions API for road routing (origin: ${origin.lat},${origin.lng}, dest: ${destination.lat},${destination.lng}):`, error.response?.data || error.message);
        throw new Error(`Google Directions API error during road routing: ${error.response?.data?.error_message || error.message}`);
    }
}
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ calculateFiberPath(params) {
    const { pointA, pointB, radiusMeters, isLosFeasible } = params;
    const baseResult = {
        pointA_original: pointA,
        pointB_original: pointB,
        losFeasible: isLosFeasible,
        radiusMetersUsed: radiusMeters
    };
    if (!isLosFeasible) {
        return {
            ...baseResult,
            status: 'los_not_feasible',
            errorMessage: 'LOS is not feasible, fiber path calculation skipped.'
        };
    }
    if (!GOOGLE_DIRECTIONS_API_KEY) {
        console.error("FATAL: GOOGLE_DIRECTIONS_API_KEY is not configured for fiber path calculation.");
        return {
            ...baseResult,
            status: 'api_error',
            errorMessage: 'Server configuration error: Directions API key is missing.'
        };
    }
    if (radiusMeters <= 0) {
        return {
            ...baseResult,
            status: 'radius_too_small',
            errorMessage: 'Radius for road snapping must be greater than 0 meters.'
        };
    }
    try {
        const snappedAData = await findNearestRoadPointWithOffset(pointA, radiusMeters, mapsClient);
        if (!snappedAData) {
            return {
                ...baseResult,
                status: 'no_road_for_a',
                errorMessage: `No road found within ${radiusMeters}m of Point A (${pointA.lat.toFixed(5)}, ${pointA.lng.toFixed(5)}). Try increasing the radius.`
            };
        }
        const { roadPoint: pointA_snappedToRoad, offsetDistanceMeters: offsetDistanceA_meters } = snappedAData;
        const snappedBData = await findNearestRoadPointWithOffset(pointB, radiusMeters, mapsClient);
        if (!snappedBData) {
            return {
                ...baseResult,
                status: 'no_road_for_b',
                pointA_snappedToRoad,
                offsetDistanceA_meters: parseFloat(offsetDistanceA_meters.toFixed(1)),
                errorMessage: `No road found within ${radiusMeters}m of Point B (${pointB.lat.toFixed(5)}, ${pointB.lng.toFixed(5)}). Try increasing the radius.`
            };
        }
        const { roadPoint: pointB_snappedToRoad, offsetDistanceMeters: offsetDistanceB_meters } = snappedBData;
        const roadRouteData = await getRoadRoute(pointA_snappedToRoad, pointB_snappedToRoad, mapsClient);
        if (!roadRouteData) {
            return {
                ...baseResult,
                status: 'no_route_between_roads',
                pointA_snappedToRoad,
                offsetDistanceA_meters: parseFloat(offsetDistanceA_meters.toFixed(1)),
                pointB_snappedToRoad,
                offsetDistanceB_meters: parseFloat(offsetDistanceB_meters.toFixed(1)),
                errorMessage: 'No drivable route found between the snapped road points for A and B.'
            };
        }
        const { distanceMeters: roadRouteDistanceMeters, segments: roadSegmentsDetailed } = roadRouteData;
        const totalDistanceMeters = offsetDistanceA_meters + roadRouteDistanceMeters + offsetDistanceB_meters;
        const segments = [];
        segments.push({
            type: 'offset_a',
            distanceMeters: parseFloat(offsetDistanceA_meters.toFixed(1)),
            startPoint: pointA,
            endPoint: pointA_snappedToRoad
        });
        // Add detailed road segments from getRoadRoute
        segments.push(...roadSegmentsDetailed.map((seg)=>({
                ...seg,
                distanceMeters: parseFloat(seg.distanceMeters.toFixed(1))
            })));
        segments.push({
            type: 'offset_b',
            distanceMeters: parseFloat(offsetDistanceB_meters.toFixed(1)),
            startPoint: pointB_snappedToRoad,
            endPoint: pointB
        });
        return {
            ...baseResult,
            status: 'success',
            totalDistanceMeters: parseFloat(totalDistanceMeters.toFixed(1)),
            pointA_snappedToRoad,
            pointB_snappedToRoad,
            offsetDistanceA_meters: parseFloat(offsetDistanceA_meters.toFixed(1)),
            offsetDistanceB_meters: parseFloat(offsetDistanceB_meters.toFixed(1)),
            roadRouteDistanceMeters: parseFloat(roadRouteDistanceMeters.toFixed(1)),
            segments
        };
    } catch (error) {
        // This catch block handles errors thrown from findNearestRoadPointWithOffset or getRoadRoute,
        // or any other unexpected errors within this function.
        console.error("Error in calculateFiberPath main try-catch block:", error.message, error);
        return {
            ...baseResult,
            status: 'api_error',
            errorMessage: error.message || 'An unknown error occurred during fiber path calculation.'
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    calculateFiberPath
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(calculateFiberPath, "408cf1e98a8bb42582bb4e80f384540f52cfa966ed", null);
}}),
"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/tools/fiberPathCalculator/actions.ts
/* __next_internal_action_entry_do_not_use__ {"7e9053ee96b2a8ff08a5535b919d94d4648359fba6":"performFiberPathAnalysisAction"} */ __turbopack_context__.s({
    "performFiberPathAnalysisAction": (()=>performFiberPathAnalysisAction)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/calculator.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ performFiberPathAnalysisAction(// Expect direct parameters instead of a single object for easier FormData binding if used directly
pointA_lat, pointA_lng, pointB_lat, pointB_lng, radiusMeters, isLosFeasible) {
    const pointA = {
        lat: pointA_lat,
        lng: pointA_lng
    };
    const pointB = {
        lat: pointB_lat,
        lng: pointB_lng
    };
    const params = {
        pointA,
        pointB,
        radiusMeters,
        isLosFeasible
    };
    if (!params || !params.pointA || !params.pointB || params.radiusMeters === undefined) {
        return {
            status: 'input_error',
            errorMessage: 'Invalid parameters provided for fiber path analysis.',
            pointA_original: params?.pointA,
            pointB_original: params?.pointB,
            losFeasible: params?.isLosFeasible || false,
            radiusMetersUsed: params?.radiusMeters || 0
        };
    }
    // The GOOGLE_DIRECTIONS_API_KEY is accessed within calculateFiberPath from process.env
    // No need to pass it explicitly here.
    try {
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calculateFiberPath"])(params);
        return result;
    } catch (error) {
        console.error("performFiberPathAnalysisAction caught an error:", error);
        return {
            status: 'api_error',
            errorMessage: `Server error during fiber path analysis: ${error.message || 'Unknown error'}`,
            pointA_original: params.pointA,
            pointB_original: params.pointB,
            losFeasible: params.isLosFeasible,
            radiusMetersUsed: params.radiusMeters
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    performFiberPathAnalysisAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(performFiberPathAnalysisAction, "7e9053ee96b2a8ff08a5535b919d94d4648359fba6", null);
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
;
;
;
;
;
;
;
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "00ed03f1d2d8a98b5211ddd718472e887421870838": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGoogleMapsApiKey"]),
    "402d3049fed11f2d39fa3d58520db39f6249045915": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateFiberReportAction"]),
    "4041e2f7f83ffb09b59671e5406bd714b8f54cba07": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateSingleFiberPathKmzAction"]),
    "6032618b8418ac76277e7b9b725912dd40e39f206e": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["performLosAnalysis"]),
    "606e059f8f40dd4b377c51875d12e3221ca87a227e": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateSingleAnalysisPdfReportAction"]),
    "6091a7f5eb670c7a62c05633ebf85658287acaec18": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getElevationProfileForPairAction"]),
    "7e9053ee96b2a8ff08a5535b919d94d4648359fba6": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["performFiberPathAnalysisAction"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "00ed03f1d2d8a98b5211ddd718472e887421870838": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["00ed03f1d2d8a98b5211ddd718472e887421870838"]),
    "402d3049fed11f2d39fa3d58520db39f6249045915": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["402d3049fed11f2d39fa3d58520db39f6249045915"]),
    "4041e2f7f83ffb09b59671e5406bd714b8f54cba07": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["4041e2f7f83ffb09b59671e5406bd714b8f54cba07"]),
    "6032618b8418ac76277e7b9b725912dd40e39f206e": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["6032618b8418ac76277e7b9b725912dd40e39f206e"]),
    "606e059f8f40dd4b377c51875d12e3221ca87a227e": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["606e059f8f40dd4b377c51875d12e3221ca87a227e"]),
    "6091a7f5eb670c7a62c05633ebf85658287acaec18": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["6091a7f5eb670c7a62c05633ebf85658287acaec18"]),
    "7e9053ee96b2a8ff08a5535b919d94d4648359fba6": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["7e9053ee96b2a8ff08a5535b919d94d4648359fba6"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
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
"[project]/src/app/bulk-los-analyzer/page.tsx (client reference/proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/bulk-los-analyzer/page.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/bulk-los-analyzer/page.tsx <module evaluation>", "default");
}}),
"[project]/src/app/bulk-los-analyzer/page.tsx (client reference/proxy)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/bulk-los-analyzer/page.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/bulk-los-analyzer/page.tsx", "default");
}}),
"[project]/src/app/bulk-los-analyzer/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/bulk-los-analyzer/page.tsx (client reference/proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__ = __turbopack_context__.i("[project]/src/app/bulk-los-analyzer/page.tsx (client reference/proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__);
}}),
"[project]/src/app/bulk-los-analyzer/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/bulk-los-analyzer/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__ea26dbf0._.js.map