(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/lib/report-generator.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/lib/report-generator.ts
__turbopack_context__.s({
    "generateReportDocx": (()=>generateReportDocx)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/docx/build/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/file-saver/dist/FileSaver.min.js [app-client] (ecmascript)");
;
;
function createSectionTitle(text) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
        text: text,
        heading: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeadingLevel"].HEADING_2,
        spacing: {
            after: 200,
            before: 300
        }
    });
}
function createStyledParagraph(text, options) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
        children: [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"](text)
        ],
        alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlignmentType"].JUSTIFIED,
        spacing: {
            after: 200
        },
        ...options
    });
}
function createLinkDetailTable(analysisResult) {
    const { pointA, pointB, distanceKm, losPossible, clearanceThresholdUsed, minClearance } = analysisResult;
    const pointAName = pointA.name || "Site A";
    const pointBName = pointB.name || "Site B";
    const data = [
        {
            label: "Site A Name",
            value: pointAName
        },
        {
            label: "Site A Latitude",
            value: pointA.lat.toFixed(6)
        },
        {
            label: "Site A Longitude",
            value: pointA.lng.toFixed(6)
        },
        {
            label: "Site A Tower Height (m)",
            value: pointA.towerHeight.toString()
        },
        {
            label: "Site B Name",
            value: pointBName
        },
        {
            label: "Site B Latitude",
            value: pointB.lat.toFixed(6)
        },
        {
            label: "Site B Longitude",
            value: pointB.lng.toFixed(6)
        },
        {
            label: "Site B Tower Height (m)",
            value: pointB.towerHeight.toString()
        },
        {
            label: "Aerial Distance",
            value: distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)}km`
        },
        {
            label: "Required Fresnel Height (m)",
            value: clearanceThresholdUsed.toString()
        },
        {
            label: "Min. Actual Clearance (m)",
            value: minClearance?.toFixed(1) ?? 'N/A'
        },
        {
            label: "LOS Feasible?",
            value: losPossible ? "Yes" : "No"
        }
    ];
    const rows = data.map((item)=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"]({
            children: [
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                    children: [
                        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                            children: [
                                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                                    text: item.label,
                                    bold: true
                                })
                            ],
                            spacing: {
                                before: 80,
                                after: 80
                            }
                        })
                    ],
                    verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER,
                    margins: {
                        top: 80,
                        bottom: 80,
                        left: 100,
                        right: 100
                    },
                    borders: {
                        top: {
                            style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                            size: 1,
                            color: "D3D3D3"
                        },
                        bottom: {
                            style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                            size: 1,
                            color: "D3D3D3"
                        },
                        left: {
                            style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                            size: 1,
                            color: "D3D3D3"
                        },
                        right: {
                            style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                            size: 1,
                            color: "D3D3D3"
                        }
                    }
                }),
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                    children: [
                        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                            children: [
                                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"](item.value)
                            ],
                            spacing: {
                                before: 80,
                                after: 80
                            }
                        })
                    ],
                    columnSpan: 2,
                    verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER,
                    margins: {
                        top: 80,
                        bottom: 80,
                        left: 100,
                        right: 100
                    },
                    borders: {
                        top: {
                            style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                            size: 1,
                            color: "D3D3D3"
                        },
                        bottom: {
                            style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                            size: 1,
                            color: "D3D3D3"
                        },
                        left: {
                            style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                            size: 1,
                            color: "D3D3D3"
                        },
                        right: {
                            style: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BorderStyle"].SINGLE,
                            size: 1,
                            color: "D3D3D3"
                        }
                    }
                })
            ]
        }));
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Table"]({
        rows: rows,
        width: {
            size: 100,
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WidthType"].PERCENTAGE
        },
        columnWidths: [
            4000,
            5500
        ]
    });
}
function createSummaryTable(analysisResults) {
    const headerRow = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"]({
        children: [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                children: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                        children: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                                text: "No.",
                                bold: true
                            })
                        ]
                    })
                ],
                verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER
            }),
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                children: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                        children: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                                text: "Link Description",
                                bold: true
                            })
                        ]
                    })
                ],
                verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER
            }),
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                children: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                        children: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                                text: "Aerial Distance",
                                bold: true
                            })
                        ]
                    })
                ],
                verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER
            }),
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                children: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                        children: [
                            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                                text: "LOS Feasible?",
                                bold: true
                            })
                        ]
                    })
                ],
                verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER
            })
        ]
    });
    const dataRows = analysisResults.map((result, index)=>{
        const pointAName = result.pointA.name || "Site A";
        const pointBName = result.pointB.name || "Site B";
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"]({
            children: [
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                    children: [
                        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"](String(index + 1))
                    ],
                    verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER
                }),
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                    children: [
                        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"](`${pointAName} to ${pointBName}`)
                    ],
                    verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER
                }),
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                    children: [
                        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"](result.distanceKm < 1 ? `${(result.distanceKm * 1000).toFixed(0)}m` : `${result.distanceKm.toFixed(1)}km`)
                    ],
                    verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER
                }),
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"]({
                    children: [
                        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"](result.losPossible ? "Yes" : "No")
                    ],
                    verticalAlign: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VerticalAlign"].CENTER
                })
            ]
        });
    });
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Table"]({
        rows: [
            headerRow,
            ...dataRows
        ],
        width: {
            size: 100,
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WidthType"].PERCENTAGE
        },
        columnWidths: [
            500,
            4500,
            2000,
            2000
        ]
    });
}
async function generateReportDocx(analysisResults) {
    if (!analysisResults || analysisResults.length === 0) {
        throw new Error("No analysis results provided for report generation.");
    }
    const sections = [];
    if (analysisResults.length > 1) {
        sections.push({
            properties: {},
            children: [
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                    text: "LOS Survey Report Summary",
                    heading: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeadingLevel"].TITLE,
                    alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlignmentType"].CENTER,
                    spacing: {
                        after: 400
                    }
                }),
                createSummaryTable(analysisResults),
                new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                    children: [
                        new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageBreak"]()
                    ]
                })
            ]
        });
    }
    analysisResults.forEach((analysisResult, index)=>{
        const { pointA, pointB, distanceKm, losPossible, clearanceThresholdUsed } = analysisResult;
        const pointAName = pointA.name || "Point A";
        const pointBName = pointB.name || "Point B";
        const remarksText = `As per desktop survey, LOS is ${losPossible ? "Possible" : "Not Possible"} from "${pointAName}" to "${pointBName}". Aerial distance between two sites is ${distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)}m` : `${distanceKm.toFixed(1)}km`}. We have considered tower height as ${pointA.towerHeight}m for ${pointAName} and ${pointB.towerHeight}m for ${pointBName} and Fresnel height (clearance threshold) as ${clearanceThresholdUsed}m for this survey. Physical survey is recommended for further analysis of the site.`;
        const children = [
            new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                children: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextRun"]({
                        text: `LOS Survey Report: ${pointAName} to ${pointBName}`,
                        bold: true,
                        size: 32
                    })
                ],
                heading: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeadingLevel"].HEADING_1,
                alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlignmentType"].CENTER,
                spacing: {
                    after: 300
                }
            }),
            createSectionTitle("Link Details:"),
            createLinkDetailTable(analysisResult),
            createSectionTitle("Remarks:"),
            createStyledParagraph(remarksText),
            createSectionTitle("Attachments:"),
            createStyledParagraph("[Map Snapshot Placeholder]", {
                italics: true,
                alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlignmentType"].CENTER
            }),
            createStyledParagraph("Map snapshot showing link path.", {
                style: "Caption",
                alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlignmentType"].CENTER
            }),
            createStyledParagraph("\n[Elevation Profile Snapshot Placeholder]", {
                italics: true,
                alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlignmentType"].CENTER,
                spacing: {
                    before: 200
                }
            }),
            createStyledParagraph("Elevation profile chart.", {
                style: "Caption",
                alignment: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlignmentType"].CENTER
            })
        ];
        if (index < analysisResults.length - 1) {
            children.push(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Paragraph"]({
                children: [
                    new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageBreak"]()
                ]
            }));
        }
        sections.push({
            properties: {},
            children: children
        });
    });
    const doc = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Document"]({
        sections: sections,
        styles: {
            paragraphStyles: [
                {
                    id: "Caption",
                    name: "Caption",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 18,
                        italics: true,
                        color: "808080" // Grey
                    },
                    paragraph: {
                        spacing: {
                            after: 200
                        }
                    }
                }
            ]
        }
    });
    try {
        const blob = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$docx$2f$build$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Packer"].toBlob(doc);
        const reportNameBase = analysisResults.length > 1 ? "Multi_Link_LOS_Report" : `LOS_Report_${analysisResults[0].pointA.name || 'SiteA'}_to_${analysisResults[0].pointB.name || 'SiteB'}`;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAs"])(blob, `${reportNameBase}.docx`);
    } catch (error) {
        console.error("Error generating DOCX blob:", error);
        throw new Error("Failed to generate report document.");
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_lib_report-generator_ts_a7db50b0._.js.map