(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/_58904b79._.js", {

"[project]/src/components/ui/input.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Input": (()=>Input)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/input.tsx",
        lineNumber: 8,
        columnNumber: 7
    }, this);
});
_c1 = Input;
Input.displayName = "Input";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/fso/custom-profile-chart.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/components/fso/custom-profile-chart.tsx
__turbopack_context__.s({
    "default": (()=>CustomProfileChart)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
// Adjusted Padding for more chart space
const PADDING_BASE = {
    top: 20,
    right: 15,
    bottom: 25,
    left: 40
};
const TEXT_COLOR = 'hsl(210, 25%, 90%)';
const GRID_COLOR = 'hsla(217, 30%, 50%, 0.4)';
const TERRAIN_FILL_COLOR = 'hsla(217, 70%, 60%, 0.25)';
const TERRAIN_STROKE_COLOR = 'hsla(217, 70%, 60%, 0.5)';
const LOS_LINE_COLOR = 'hsl(180, 70%, 65%)'; // Bright Cyan
const OBSTRUCTION_DOT_COLOR = 'hsl(0, 80%, 60%)'; // Bright Red
const TOWER_LINE_COLOR = 'hsl(45, 90%, 60%)'; // Bright Yellow/Amber
const HOVER_GUIDE_LINE_COLOR = 'hsla(210, 25%, 80%, 0.5)';
const HOVER_DOT_COLOR = LOS_LINE_COLOR;
const TOOLTIP_BG_COLOR = 'hsla(222, 40%, 15%, 0.9)';
const TOOLTIP_TEXT_COLOR = 'hsl(210, 40%, 95%)';
const TOOLTIP_BORDER_COLOR = 'hsl(217, 33%, 35%)';
const MIN_TOWER_HEIGHT = 0;
const MAX_TOWER_HEIGHT = 100;
const TOWER_HANDLE_RADIUS_VISUAL = 5; // Slightly smaller for compact view
const TOWER_HANDLE_CLICK_RADIUS = 10;
const HORIZONTAL_PADDING_PERCENTAGE = 0.05; // 5% padding on each side of the x-axis
const WATERMARK_TEXT = "LiFi Link Pro";
const WATERMARK_COLOR = 'hsla(210, 30%, 60%, 0.1)'; // Subtle greyish-blue
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
function CustomProfileChart({ data, pointAName = "Site A", pointBName = "Site B", isStale, totalDistanceKm, isActionPending, onTowerHeightChangeFromGraph }) {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [hoverData, setHoverData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mousePosition, setMousePosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [draggingTower, setDraggingTower] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dragStartInfo, setDragStartInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [liveDragVisuals, setLiveDragVisuals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const isInteractingByDrag = !!draggingTower;
    const chartMetricsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const drawChart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CustomProfileChart.useCallback[drawChart]": ()=>{
            const canvas = canvasRef.current;
            if (!canvas || !data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                requestAnimationFrame(drawChart); // If canvas not yet sized, retry
                return;
            }
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            const PADDING = PADDING_BASE;
            const chartWidth = rect.width - PADDING.left - PADDING.right;
            const chartHeight = rect.height - PADDING.top - PADDING.bottom;
            // Calculate effective width for data plotting after applying horizontal padding
            const xOffsetPx = chartWidth * HORIZONTAL_PADDING_PERCENTAGE;
            const effectiveChartWidthPx = chartWidth * (1 - 2 * HORIZONTAL_PADDING_PERCENTAGE);
            ctx.clearRect(0, 0, rect.width, rect.height);
            const originalTransform = ctx.getTransform();
            ctx.translate(PADDING.left, PADDING.top); // Move origin to top-left of chart area
            const elevations = data.flatMap({
                "CustomProfileChart.useCallback[drawChart].elevations": (p)=>[
                        p.terrainElevation,
                        p.losHeight
                    ]
            }["CustomProfileChart.useCallback[drawChart].elevations"]);
            let minY = Math.min(...elevations);
            let maxY = Math.max(...elevations);
            const yDataRange = maxY - minY;
            minY -= yDataRange * 0.1; // Reduced vertical padding for Y-axis scale
            maxY += yDataRange * 0.1;
            if (maxY === minY) {
                maxY += 10;
                minY -= 10;
            }
            if (maxY < minY) [maxY, minY] = [
                minY,
                maxY
            ]; // Ensure minY < maxY
            const maxXKmActual = totalDistanceKm;
            // Map data value (km) to pixel X position within the chart area (considering visual padding)
            const getX = {
                "CustomProfileChart.useCallback[drawChart].getX": (distanceKm)=>xOffsetPx + distanceKm / maxXKmActual * effectiveChartWidthPx
            }["CustomProfileChart.useCallback[drawChart].getX"];
            const getY = {
                "CustomProfileChart.useCallback[drawChart].getY": (elevation)=>chartHeight - (elevation - minY) / (maxY - minY) * chartHeight
            }["CustomProfileChart.useCallback[drawChart].getY"];
            const getElevationFromY = {
                "CustomProfileChart.useCallback[drawChart].getElevationFromY": (pixelY_ChartArea)=>minY + (chartHeight - pixelY_ChartArea) / chartHeight * (maxY - minY)
            }["CustomProfileChart.useCallback[drawChart].getElevationFromY"];
            // Converts pixel X relative to the chart area's left edge (after canvas PADDING.left) back to km
            const getKmFromX = {
                "CustomProfileChart.useCallback[drawChart].getKmFromX": (pixelX_ChartArea_relative_to_padding_left)=>{
                    const effectivePx = pixelX_ChartArea_relative_to_padding_left - xOffsetPx;
                    if (effectiveChartWidthPx === 0) return 0; // Avoid division by zero
                    return effectivePx / effectiveChartWidthPx * maxXKmActual;
                }
            }["CustomProfileChart.useCallback[drawChart].getKmFromX"];
            chartMetricsRef.current = {
                padding: PADDING,
                canvasRect: rect,
                chartPixelWidth: chartWidth,
                chartPixelHeight: chartHeight,
                effectivePixelWidth: effectiveChartWidthPx,
                xOffsetPx: xOffsetPx,
                minYData: minY,
                maxYData: maxY,
                maxXKm: maxXKmActual,
                getPixelXFromKm: getX,
                getPixelYFromElevation: getY,
                getElevationFromPixelY: getElevationFromY,
                getKmFromPixelX: getKmFromX
            };
            // Draw Grid & Axes
            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth = 0.5;
            ctx.font = "9px Inter, sans-serif";
            ctx.fillStyle = TEXT_COLOR;
            const numYTicks = 5;
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            for(let i = 0; i <= numYTicks; i++){
                const val = minY + i / numYTicks * (maxY - minY);
                const yPx = getY(val);
                ctx.beginPath();
                ctx.moveTo(0, yPx);
                ctx.lineTo(chartWidth, yPx);
                ctx.stroke();
                ctx.fillText(val.toFixed(0) + "m", -8, yPx);
            }
            const numXTicks = Math.min(5, Math.max(1, Math.floor(maxXKmActual / (maxXKmActual > 5 ? 2 : 1))));
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            for(let i = 0; i <= numXTicks; i++){
                // For X ticks, ensure they align with the effective plotting area
                const distKm = i / numXTicks * maxXKmActual;
                const xPx = getX(distKm); // xPx is already relative to chart area's left
                ctx.beginPath();
                ctx.moveTo(xPx, 0);
                ctx.lineTo(xPx, chartHeight);
                ctx.stroke();
                ctx.fillText((distKm * 1000).toFixed(0) + "m", xPx, chartHeight + 8);
            }
            // Draw Watermark
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const watermarkFontSize = Math.max(20, Math.min(chartWidth / 9, chartHeight / 6)); // Dynamic font size
            ctx.font = `bold ${watermarkFontSize}px Inter, sans-serif`;
            ctx.fillStyle = WATERMARK_COLOR;
            ctx.translate(chartWidth / 2, chartHeight / 2); // Move to center
            ctx.rotate(-Math.PI / 6); // Rotate (e.g., -30 degrees)
            ctx.fillText(WATERMARK_TEXT, 0, 0);
            ctx.restore();
            // Draw Terrain Area
            ctx.beginPath();
            ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
            data.forEach({
                "CustomProfileChart.useCallback[drawChart]": (p)=>ctx.lineTo(getX(p.distance), getY(p.terrainElevation))
            }["CustomProfileChart.useCallback[drawChart]"]);
            ctx.lineTo(getX(data[data.length - 1].distance), chartHeight); // Line to bottom right
            ctx.lineTo(getX(data[0].distance), chartHeight); // Line to bottom left
            ctx.closePath();
            ctx.fillStyle = TERRAIN_FILL_COLOR;
            ctx.fill();
            // Draw Terrain Stroke
            ctx.beginPath();
            ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
            data.forEach({
                "CustomProfileChart.useCallback[drawChart]": (p)=>ctx.lineTo(getX(p.distance), getY(p.terrainElevation))
            }["CustomProfileChart.useCallback[drawChart]"]);
            ctx.strokeStyle = TERRAIN_STROKE_COLOR;
            ctx.lineWidth = 1;
            ctx.stroke();
            // Line of Sight (LOS) path
            let yLosA_px_ChartArea = getY(data[0].losHeight);
            let yLosB_px_ChartArea = getY(data[data.length - 1].losHeight);
            if (liveDragVisuals) {
                if (liveDragVisuals.site === 'A') {
                    yLosA_px_ChartArea = liveDragVisuals.currentLosY_px_ChartArea;
                } else if (liveDragVisuals.site === 'B') {
                    yLosB_px_ChartArea = liveDragVisuals.currentLosY_px_ChartArea;
                }
            }
            const xA_px_ChartArea = getX(data[0].distance);
            const xB_px_ChartArea = getX(data[data.length - 1].distance);
            ctx.beginPath();
            ctx.moveTo(xA_px_ChartArea, yLosA_px_ChartArea);
            ctx.lineTo(xB_px_ChartArea, yLosB_px_ChartArea);
            ctx.strokeStyle = LOS_LINE_COLOR;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // LOS Distance Text
            if (totalDistanceKm !== undefined) {
                const midXLos = (xA_px_ChartArea + xB_px_ChartArea) / 2;
                const midYLos = (yLosA_px_ChartArea + yLosB_px_ChartArea) / 2;
                ctx.fillStyle = TEXT_COLOR;
                ctx.font = "10px Inter, sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                const distanceText = totalDistanceKm < 1 ? `${(totalDistanceKm * 1000).toFixed(0)}m` : `${totalDistanceKm.toFixed(1)}km`;
                ctx.fillText(`Aerial Dist: ${distanceText}`, midXLos, midYLos - 5);
            }
            // Obstruction dots (iterate over pixels of the effective chart width)
            if (data.length > 1 && maxXKmActual > 0 && effectiveChartWidthPx > 0) {
                for(let px_on_effective_width = 0; px_on_effective_width <= effectiveChartWidthPx; px_on_effective_width++){
                    const currentX_on_chart_area = xOffsetPx + px_on_effective_width;
                    const currentKm = px_on_effective_width / effectiveChartWidthPx * maxXKmActual;
                    // LOS line equation based on current (possibly dragged) tower heights
                    const losSlope = xB_px_ChartArea - xA_px_ChartArea === 0 ? 0 : (yLosB_px_ChartArea - yLosA_px_ChartArea) / (xB_px_ChartArea - xA_px_ChartArea);
                    const los_y_at_currentX = yLosA_px_ChartArea + losSlope * (currentX_on_chart_area - xA_px_ChartArea);
                    // Interpolate terrain elevation at currentKm
                    let terrain_elevation_at_currentKm = data[0].terrainElevation; // Default to start if out of bounds
                    if (data.length > 1) {
                        for(let j = 0; j < data.length - 1; j++){
                            if (currentKm >= data[j].distance && currentKm <= data[j + 1].distance) {
                                const d1 = data[j].distance;
                                const d2 = data[j + 1].distance;
                                const e1 = data[j].terrainElevation;
                                const e2 = data[j + 1].terrainElevation;
                                if (d2 - d1 === 0) {
                                    terrain_elevation_at_currentKm = e1;
                                } else {
                                    const t_interp = (currentKm - d1) / (d2 - d1);
                                    terrain_elevation_at_currentKm = e1 + t_interp * (e2 - e1);
                                }
                                break; // Found segment
                            } else if (currentKm > data[data.length - 1].distance && j === data.length - 2) {
                                terrain_elevation_at_currentKm = data[data.length - 1].terrainElevation;
                            }
                        }
                    } else {
                        terrain_elevation_at_currentKm = data[0].terrainElevation;
                    }
                    const terrain_y_at_currentX = getY(terrain_elevation_at_currentKm);
                    // If LOS line is at or below terrain, draw obstruction dot
                    if (los_y_at_currentX >= terrain_y_at_currentX - 1) {
                        ctx.beginPath();
                        ctx.arc(currentX_on_chart_area, los_y_at_currentX, 2.5, 0, 2 * Math.PI); // Small dot
                        ctx.fillStyle = OBSTRUCTION_DOT_COLOR;
                        ctx.fill();
                    }
                }
            }
            // Tower A
            const yTerrainA_px_ChartArea = getY(data[0].terrainElevation);
            ctx.strokeStyle = TOWER_LINE_COLOR;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(xA_px_ChartArea, yTerrainA_px_ChartArea);
            ctx.lineTo(xA_px_ChartArea, yLosA_px_ChartArea);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(xA_px_ChartArea, yLosA_px_ChartArea, TOWER_HANDLE_RADIUS_VISUAL, 0, 2 * Math.PI);
            ctx.fillStyle = TOWER_LINE_COLOR;
            ctx.fill();
            ctx.strokeStyle = TOOLTIP_BG_COLOR;
            ctx.lineWidth = 1.5;
            ctx.stroke(); // Border for handle
            ctx.fillStyle = TEXT_COLOR;
            ctx.font = "bold 10px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(pointAName, xA_px_ChartArea, yLosA_px_ChartArea - (TOWER_HANDLE_RADIUS_VISUAL + 2));
            // Tower B
            const yTerrainB_px_ChartArea = getY(data[data.length - 1].terrainElevation);
            ctx.strokeStyle = TOWER_LINE_COLOR;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(xB_px_ChartArea, yTerrainB_px_ChartArea);
            ctx.lineTo(xB_px_ChartArea, yLosB_px_ChartArea);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(xB_px_ChartArea, yLosB_px_ChartArea, TOWER_HANDLE_RADIUS_VISUAL, 0, 2 * Math.PI);
            ctx.fillStyle = TOWER_LINE_COLOR;
            ctx.fill();
            ctx.strokeStyle = TOOLTIP_BG_COLOR;
            ctx.lineWidth = 1.5;
            ctx.stroke(); // Border for handle
            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(pointBName, xB_px_ChartArea, yLosB_px_ChartArea - (TOWER_HANDLE_RADIUS_VISUAL + 2));
            // Display dragged tower height
            if (liveDragVisuals) {
                ctx.fillStyle = TOWER_LINE_COLOR;
                ctx.font = "bold 11px Inter, sans-serif";
                ctx.textBaseline = "middle";
                const textXOffset = TOWER_HANDLE_RADIUS_VISUAL + 5;
                if (liveDragVisuals.site === 'A') {
                    ctx.textAlign = xA_px_ChartArea < chartWidth / 2 ? "left" : "right";
                    const textX = xA_px_ChartArea + (ctx.textAlign === "left" ? textXOffset : -textXOffset);
                    ctx.fillText(`${liveDragVisuals.currentHeightMeters.toFixed(0)}m`, textX, yLosA_px_ChartArea);
                } else if (liveDragVisuals.site === 'B') {
                    ctx.textAlign = xB_px_ChartArea < chartWidth / 2 ? "left" : "right";
                    const textX = xB_px_ChartArea + (ctx.textAlign === "left" ? textXOffset : -textXOffset);
                    ctx.fillText(`${liveDragVisuals.currentHeightMeters.toFixed(0)}m`, textX, yLosB_px_ChartArea);
                }
            }
            // Hover effects (guide line and dot)
            if (hoverData && !isInteractingByDrag) {
                const hxPx_Canvas = hoverData.xPx; // x position on canvas (includes canvas padding)
                const hyPxLos_Canvas = hoverData.yPx; // y position on canvas (includes canvas padding)
                const hxPx_ChartArea = hxPx_Canvas - PADDING.left; // x position relative to chart area
                // Vertical guide line
                ctx.beginPath();
                ctx.setLineDash([
                    3,
                    3
                ]);
                ctx.strokeStyle = HOVER_GUIDE_LINE_COLOR;
                ctx.lineWidth = 1;
                ctx.moveTo(hxPx_ChartArea, 0);
                ctx.lineTo(hxPx_ChartArea, chartHeight);
                ctx.stroke();
                ctx.setLineDash([]);
                // Dot on LOS line
                const hyPxLos_ChartArea = hyPxLos_Canvas - PADDING.top; // y position relative to chart area
                ctx.beginPath();
                ctx.arc(hxPx_ChartArea, hyPxLos_ChartArea, 4, 0, 2 * Math.PI);
                ctx.fillStyle = HOVER_DOT_COLOR;
                ctx.fill();
                ctx.strokeStyle = TOOLTIP_BG_COLOR;
                ctx.lineWidth = 1.5;
                ctx.stroke(); // Border for dot
            }
            ctx.setTransform(originalTransform); // Restore original canvas transform
            // Tooltip (drawn in canvas coordinates, not chart area coordinates)
            if (hoverData && mousePosition && !isInteractingByDrag) {
                const p = hoverData.point;
                const lines = [
                    `Distance to Site: ${(p.distance * 1000).toFixed(0)} m`,
                    `Line of Sight (AGL): ${p.losHeight.toFixed(1)} m`,
                    `Terrain (AMSL): ${p.terrainElevation.toFixed(1)} m`,
                    `Fresnel Clearance: ${p.clearance.toFixed(1)} m`
                ];
                ctx.font = "10px Inter, sans-serif";
                const lineHeight = 14;
                const tooltipPadding = 6;
                const textWidth = Math.max(...lines.map({
                    "CustomProfileChart.useCallback[drawChart].textWidth": (line)=>ctx.measureText(line).width
                }["CustomProfileChart.useCallback[drawChart].textWidth"]));
                const tooltipWidth = textWidth + 2 * tooltipPadding;
                const tooltipHeight = lines.length * lineHeight + 2 * tooltipPadding - (lineHeight - 10); // Adjust for tighter line spacing
                const cornerRadius = 4;
                // Position tooltip relative to mouse, avoiding edges
                let tipX = mousePosition.x + 15;
                let tipY = mousePosition.y - tooltipHeight - 5;
                if (tipX + tooltipWidth > rect.width - PADDING.right / 2) tipX = mousePosition.x - tooltipWidth - 15;
                if (tipY < PADDING.top / 2) tipY = mousePosition.y + 15;
                if (tipY + tooltipHeight > rect.height - PADDING.bottom / 2) tipY = rect.height - PADDING.bottom / 2 - tooltipHeight;
                if (tipX < PADDING.left / 2) tipX = PADDING.left / 2;
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = TOOLTIP_BG_COLOR;
                ctx.strokeStyle = TOOLTIP_BORDER_COLOR;
                ctx.lineWidth = 0.5;
                drawRoundedRect(ctx, tipX, tipY, tooltipWidth, tooltipHeight, cornerRadius);
                ctx.fill();
                ctx.stroke();
                ctx.globalAlpha = 1.0;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                lines.forEach({
                    "CustomProfileChart.useCallback[drawChart]": (line, i)=>{
                        ctx.fillStyle = line.startsWith("Line of Sight") ? LOS_LINE_COLOR : TOOLTIP_TEXT_COLOR;
                        ctx.fillText(line, tipX + tooltipPadding, tipY + tooltipPadding + i * lineHeight + lineHeight / 2);
                    }
                }["CustomProfileChart.useCallback[drawChart]"]);
            }
        }
    }["CustomProfileChart.useCallback[drawChart]"], [
        data,
        totalDistanceKm,
        pointAName,
        pointBName,
        hoverData,
        mousePosition,
        isInteractingByDrag,
        liveDragVisuals
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            const handleMouseMoveForTooltip = {
                "CustomProfileChart.useEffect.handleMouseMoveForTooltip": (event)=>{
                    if (isInteractingByDrag || !chartMetricsRef.current || !data || data.length < 2) {
                        if (hoverData) setHoverData(null); // Clear hover if dragging or no data/metrics
                        return;
                    }
                    const { canvasRect, padding, getPixelXFromKm, getPixelYFromElevation, getKmFromPixelX, xOffsetPx, effectivePixelWidth } = chartMetricsRef.current;
                    if (!canvasRect) return;
                    const mouseCanvasX = event.clientX - canvasRect.left;
                    const mouseCanvasY = event.clientY - canvasRect.top;
                    setMousePosition({
                        x: mouseCanvasX,
                        y: mouseCanvasY
                    });
                    const mouseXInChartArea = mouseCanvasX - padding.left;
                    // Check if mouse is within the effective plotting area (between the visual paddings)
                    if (mouseXInChartArea >= xOffsetPx && mouseXInChartArea <= xOffsetPx + effectivePixelWidth) {
                        const distanceKmHovered = getKmFromPixelX(mouseXInChartArea); // Get km based on position within effective area
                        let closestPoint = data[0];
                        let minDiff = Math.abs(data[0].distance - distanceKmHovered);
                        for(let i = 0; i < data.length; i++){
                            const diff = Math.abs(data[i].distance - distanceKmHovered);
                            if (diff < minDiff) {
                                minDiff = diff;
                                closestPoint = data[i];
                            }
                        }
                        if (closestPoint) {
                            setHoverData({
                                xPx: getPixelXFromKm(closestPoint.distance) + padding.left,
                                yPx: getPixelYFromElevation(closestPoint.losHeight) + padding.top,
                                point: {
                                    ...closestPoint,
                                    distanceMeters: closestPoint.distance * 1000
                                }
                            });
                        } else {
                            setHoverData(null);
                        }
                    } else {
                        setHoverData(null);
                    }
                }
            }["CustomProfileChart.useEffect.handleMouseMoveForTooltip"];
            const handleMouseOutForTooltip = {
                "CustomProfileChart.useEffect.handleMouseOutForTooltip": ()=>{
                    if (!isInteractingByDrag) {
                        setHoverData(null);
                        setMousePosition(null);
                    }
                }
            }["CustomProfileChart.useEffect.handleMouseOutForTooltip"];
            canvas.addEventListener('mousemove', handleMouseMoveForTooltip);
            canvas.addEventListener('mouseout', handleMouseOutForTooltip);
            const resizeObserver = new ResizeObserver({
                "CustomProfileChart.useEffect": ()=>requestAnimationFrame(drawChart)
            }["CustomProfileChart.useEffect"]);
            resizeObserver.observe(canvas);
            drawChart(); // Initial draw
            return ({
                "CustomProfileChart.useEffect": ()=>{
                    resizeObserver.unobserve(canvas);
                    canvas.removeEventListener('mousemove', handleMouseMoveForTooltip);
                    canvas.removeEventListener('mouseout', handleMouseOutForTooltip);
                }
            })["CustomProfileChart.useEffect"];
        }
    }["CustomProfileChart.useEffect"], [
        drawChart,
        data,
        isInteractingByDrag,
        hoverData
    ]); // isInteractingByDrag and hoverData are important here
    // Mouse down handler for starting tower drag
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            const handleCanvasMouseDown = {
                "CustomProfileChart.useEffect.handleCanvasMouseDown": (event)=>{
                    if (!chartMetricsRef.current || !data || data.length < 2 || !onTowerHeightChangeFromGraph) return;
                    const { canvasRect, padding, getPixelXFromKm, getPixelYFromElevation } = chartMetricsRef.current;
                    if (!canvasRect) return;
                    const clickX_Canvas = event.clientX - canvasRect.left;
                    const clickY_Canvas = event.clientY - canvasRect.top;
                    // Tower A handle check
                    const towerAx_px_ChartArea = getPixelXFromKm(data[0].distance);
                    const towerAy_px_ChartArea = getPixelYFromElevation(data[0].losHeight);
                    const distA = Math.sqrt(Math.pow(clickX_Canvas - (towerAx_px_ChartArea + padding.left), 2) + Math.pow(clickY_Canvas - (towerAy_px_ChartArea + padding.top), 2));
                    if (distA < TOWER_HANDLE_CLICK_RADIUS) {
                        setDraggingTower('A');
                        setDragStartInfo({
                            clientY: event.clientY,
                            initialTowerHeightMeters: data[0].losHeight - data[0].terrainElevation,
                            siteTerrainElevation: data[0].terrainElevation,
                            initialLosY_px_ChartArea: towerAy_px_ChartArea
                        });
                        setLiveDragVisuals(null); // Clear previous live visuals
                        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                        event.preventDefault();
                        return;
                    }
                    // Tower B handle check
                    const towerBx_px_ChartArea = getPixelXFromKm(data[data.length - 1].distance);
                    const towerBy_px_ChartArea = getPixelYFromElevation(data[data.length - 1].losHeight);
                    const distB = Math.sqrt(Math.pow(clickX_Canvas - (towerBx_px_ChartArea + padding.left), 2) + Math.pow(clickY_Canvas - (towerBy_px_ChartArea + padding.top), 2));
                    if (distB < TOWER_HANDLE_CLICK_RADIUS) {
                        setDraggingTower('B');
                        setDragStartInfo({
                            clientY: event.clientY,
                            initialTowerHeightMeters: data[data.length - 1].losHeight - data[data.length - 1].terrainElevation,
                            siteTerrainElevation: data[data.length - 1].terrainElevation,
                            initialLosY_px_ChartArea: towerBy_px_ChartArea
                        });
                        setLiveDragVisuals(null);
                        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                        event.preventDefault();
                        return;
                    }
                }
            }["CustomProfileChart.useEffect.handleCanvasMouseDown"];
            canvas.addEventListener('mousedown', handleCanvasMouseDown);
            return ({
                "CustomProfileChart.useEffect": ()=>canvas.removeEventListener('mousedown', handleCanvasMouseDown)
            })["CustomProfileChart.useEffect"];
        }
    }["CustomProfileChart.useEffect"], [
        data,
        onTowerHeightChangeFromGraph
    ]); // Depends on data for tower positions
    // Global mouse move and up handlers for active dragging
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            if (!draggingTower || !dragStartInfo || !chartMetricsRef.current) {
                if (canvasRef.current && canvasRef.current.style.cursor === 'grabbing') canvasRef.current.style.cursor = 'crosshair';
                return;
            }
            const { getElevationFromPixelY, chartPixelHeight, getPixelYFromElevation: getPixelY } = chartMetricsRef.current;
            const handleGlobalMouseMove = {
                "CustomProfileChart.useEffect.handleGlobalMouseMove": (event)=>{
                    if (!draggingTower || !dragStartInfo || !chartMetricsRef.current) return; // Should not happen if effect dependency is correct
                    const clientYDelta = event.clientY - dragStartInfo.clientY;
                    let newTowerLosY_px_ChartArea = dragStartInfo.initialLosY_px_ChartArea - clientYDelta; // Inverted Y
                    // Clamp Y to chart boundaries
                    newTowerLosY_px_ChartArea = Math.max(0, Math.min(chartPixelHeight, newTowerLosY_px_ChartArea));
                    const newTowerAbsoluteElevation = getElevationFromPixelY(newTowerLosY_px_ChartArea);
                    let currentHeightMeters = newTowerAbsoluteElevation - dragStartInfo.siteTerrainElevation;
                    // Clamp height to MIN/MAX tower height
                    currentHeightMeters = Math.round(currentHeightMeters); // Round to nearest integer
                    currentHeightMeters = Math.max(MIN_TOWER_HEIGHT, Math.min(MAX_TOWER_HEIGHT, currentHeightMeters));
                    // Recalculate Y pixel for the clamped height
                    const clampedAbsoluteElevation = currentHeightMeters + dragStartInfo.siteTerrainElevation;
                    newTowerLosY_px_ChartArea = getPixelY(clampedAbsoluteElevation);
                    setLiveDragVisuals({
                        site: draggingTower,
                        currentLosY_px_ChartArea: newTowerLosY_px_ChartArea,
                        currentHeightMeters: currentHeightMeters
                    });
                }
            }["CustomProfileChart.useEffect.handleGlobalMouseMove"];
            const handleGlobalMouseUp = {
                "CustomProfileChart.useEffect.handleGlobalMouseUp": (event)=>{
                    if (!draggingTower || !dragStartInfo || !chartMetricsRef.current) {
                        setDraggingTower(null);
                        setDragStartInfo(null);
                        setLiveDragVisuals(null);
                        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
                        return;
                    }
                    let finalNewTowerHeightRelativeToTerrain;
                    if (liveDragVisuals) {
                        // Use the height from the last live visual update
                        finalNewTowerHeightRelativeToTerrain = liveDragVisuals.currentHeightMeters;
                    } else {
                        const clientYDelta = event.clientY - dragStartInfo.clientY;
                        let newTowerLosY_px_ChartArea = dragStartInfo.initialLosY_px_ChartArea - clientYDelta;
                        newTowerLosY_px_ChartArea = Math.max(0, Math.min(chartMetricsRef.current.chartPixelHeight, newTowerLosY_px_ChartArea));
                        const newTowerAbsoluteElevation = chartMetricsRef.current.getElevationFromPixelY(newTowerLosY_px_ChartArea);
                        finalNewTowerHeightRelativeToTerrain = newTowerAbsoluteElevation - dragStartInfo.siteTerrainElevation;
                        finalNewTowerHeightRelativeToTerrain = Math.round(finalNewTowerHeightRelativeToTerrain);
                        finalNewTowerHeightRelativeToTerrain = Math.max(MIN_TOWER_HEIGHT, Math.min(MAX_TOWER_HEIGHT, finalNewTowerHeightRelativeToTerrain));
                    }
                    onTowerHeightChangeFromGraph(draggingTower === 'A' ? 'pointA' : 'pointB', finalNewTowerHeightRelativeToTerrain);
                    setDraggingTower(null);
                    setDragStartInfo(null);
                    setLiveDragVisuals(null);
                    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
                }
            }["CustomProfileChart.useEffect.handleGlobalMouseUp"];
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
            return ({
                "CustomProfileChart.useEffect": ()=>{
                    window.removeEventListener('mousemove', handleGlobalMouseMove);
                    window.removeEventListener('mouseup', handleGlobalMouseUp);
                    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair'; // Reset cursor on cleanup
                }
            })["CustomProfileChart.useEffect"];
        }
    }["CustomProfileChart.useEffect"], [
        draggingTower,
        dragStartInfo,
        onTowerHeightChangeFromGraph,
        data,
        liveDragVisuals
    ]); // Include liveDragVisuals
    // Trigger re-draw when liveDragVisuals change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            drawChart(); // Re-draw the chart with live drag updates
        }
    }["CustomProfileChart.useEffect"], [
        liveDragVisuals,
        drawChart
    ]);
    if (isActionPending && !isInteractingByDrag) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md pointer-events-none"),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted-foreground text-xs text-center",
                children: "Analyzing..."
            }, void 0, false, {
                fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
                lineNumber: 581,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 580,
            columnNumber: 7
        }, this);
    }
    if (!data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
        if (isActionPending) {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-muted-foreground text-xs text-center",
                    children: "Loading analysis data..."
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
                    lineNumber: 590,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
                lineNumber: 589,
                columnNumber: 13
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md"),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted-foreground text-xs text-center",
                children: "Not enough data to display profile."
            }, void 0, false, {
                fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
                lineNumber: 596,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 595,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full h-full relative", isStale && !isInteractingByDrag && "opacity-50", isActionPending && !isInteractingByDrag && "pointer-events-none" // Disable interactions if pending AND not dragging
        ),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
            ref: canvasRef,
            style: {
                width: '100%',
                height: '100%',
                cursor: isInteractingByDrag ? 'grabbing' : hoverData ? 'pointer' : 'crosshair'
            }
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 608,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
        lineNumber: 602,
        columnNumber: 5
    }, this);
}
_s(CustomProfileChart, "PH6djyIYJmQp/cROaD4eF4J/gj8=");
_c = CustomProfileChart;
var _c;
__turbopack_context__.k.register(_c, "CustomProfileChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/fso/bottom-panel.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>BottomPanel)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$custom$2d$profile$2d$chart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/custom-profile-chart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-plus.js [app-client] (ecmascript) <export default as PlusCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
const SiteInputGroup = ({ id })=>{
    _s();
    const { register, control, formState: { errors: clientFormErrors } } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormContext"])();
    const cardStaticTitle = id === 'pointA' ? 'Point A' : 'Point B';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "bg-transparent backdrop-blur-2px shadow-none border-0 h-full flex flex-col p-1 md:p-2 w-full min-w-[280px] md:min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                className: "p-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                    className: "text-xs flex items-center text-slate-100/90 uppercase tracking-wider font-medium",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                            className: "mr-1.5 h-3.5 w-3.5 text-primary/70"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this),
                        " ",
                        cardStaticTitle
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "p-1 space-y-1.5 text-xs flex-grow overflow-y-auto pr-1 flex flex-col justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: `${id}.name`,
                                        className: "text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal",
                                        children: "Name"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 35,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: `${id}.name`,
                                        ...register(`${id}.name`),
                                        placeholder: `e.g. ${id === 'pointA' ? 'Main Building' : 'Remote Tower'}`,
                                        className: "mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 36,
                                        columnNumber: 13
                                    }, this),
                                    clientFormErrors[id]?.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-destructive/80 mt-0.5",
                                        children: clientFormErrors[id]?.name?.message
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 43,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 34,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                        htmlFor: `${id}.coordinates`,
                                        className: "text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal",
                                        children: "Coordinates (Lat, Lng)"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 46,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: `${id}.coordinates`,
                                        ...register(`${id}.coordinates`),
                                        placeholder: "e.g., 20.123, -78.456",
                                        className: "mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 47,
                                        columnNumber: 13
                                    }, this),
                                    clientFormErrors[id]?.coordinates && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-destructive/80 mt-0.5",
                                        children: clientFormErrors[id]?.coordinates?.message
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 54,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 45,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Controller"], {
                                name: `${id}.height`,
                                control: control,
                                render: ({ field })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "hidden",
                                        ...field
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 61,
                                        columnNumber: 15
                                    }, void 0)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 57,
                                columnNumber: 12
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[0.65rem] text-muted-foreground/70 italic mt-1.5",
                        children: "Tower height adjusted via chart."
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
};
_s(SiteInputGroup, "g0NDI9o7Op6PK1YGOmaQpps+YE4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormContext"]
    ];
});
_c = SiteInputGroup;
const ProfilePanelMiddleColumn = ({ analysisResult, isStale, isActionPending, onAnalyzeSubmit, pointANameWatch, pointBNameWatch, onTowerHeightChangeFromGraph, onOpenReportDialog, onAddNewLink, currentDistanceKm, selectedLinkClearanceThreshold })=>{
    _s1();
    const { control, formState: { errors: clientFormErrors } } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormContext"])();
    const watchedClearanceThresholdString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'clearanceThreshold'
    });
    const minRequiredClearance = selectedLinkClearanceThreshold ?? parseFloat(watchedClearanceThresholdString || "0");
    let isClearBasedOnAnalysis = false;
    let deficit = 0;
    let actualMinClearance = analysisResult?.minClearance ?? null;
    if (analysisResult && analysisResult.minClearance !== null && !isNaN(minRequiredClearance)) {
        isClearBasedOnAnalysis = analysisResult.minClearance >= minRequiredClearance;
        deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(minRequiredClearance - (analysisResult.minClearance || 0));
    }
    const chartKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "ProfilePanelMiddleColumn.useMemo[chartKey]": ()=>{
            if (!analysisResult) return 'no-result';
            const profileDataSignature = analysisResult.profile.length > 0 ? `${analysisResult.profile[0].distance}-${analysisResult.profile[0].terrainElevation}-${analysisResult.profile[0].losHeight}-${analysisResult.profile[analysisResult.profile.length - 1].distance}-${analysisResult.profile[analysisResult.profile.length - 1].terrainElevation}-${analysisResult.profile[analysisResult.profile.length - 1].losHeight}` : 'empty-profile';
            return `${analysisResult.distanceKm}-${analysisResult.pointA?.towerHeight}-${analysisResult.pointB?.towerHeight}-${profileDataSignature}-${minRequiredClearance}`;
        }
    }["ProfilePanelMiddleColumn.useMemo[chartKey]"], [
        analysisResult,
        minRequiredClearance
    ]);
    const buttonText = isActionPending ? "Analyzing..." : isStale || !analysisResult ? "Analyze Link" : "Re-Analyze";
    const pointANameDisplay = analysisResult?.pointA?.name || pointANameWatch || "Site A";
    const pointBNameDisplay = analysisResult?.pointB?.name || pointBNameWatch || "Site B";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-shrink-0 w-full md:w-auto snap-start flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-2px rounded-lg p-1 md:p-0 min-w-[320px] md:min-w-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-between gap-x-2 gap-y-2 py-1 md:py-1.5 px-2 md:px-3 border-b border-border mb-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 order-1",
                        children: isStale && !isActionPending && analysisResult || isStale && !analysisResult ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "px-2 py-1 rounded-md text-xs font-semibold bg-yellow-500/80 text-yellow-900 flex items-center shadow",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                    className: "mr-1 h-3 w-3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 136,
                                    columnNumber: 15
                                }, this),
                                " NEEDS RE-ANALYZE"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 135,
                            columnNumber: 13
                        }, this) : analysisResult ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-3 py-1.5 rounded-md text-xs font-bold shadow-md", isClearBasedOnAnalysis ? "bg-los-success text-los-success-foreground" : "bg-los-failure text-los-failure-foreground"),
                            children: isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 139,
                            columnNumber: 13
                        }, this) : !isActionPending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground italic",
                            children: "Perform analysis"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 151,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this),
                    analysisResult && !isStale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center order-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "uppercase tracking-wider text-muted-foreground text-[0.6rem] md:text-[0.65rem] font-medium",
                                        children: "Aerial Dist."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-bold text-foreground text-xs md:text-sm",
                                        children: currentDistanceKm !== null ? currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)}m` : `${currentDistanceKm.toFixed(1)}km` : "N/A"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center order-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "uppercase tracking-wider text-muted-foreground text-[0.6rem] md:text-[0.65rem] font-medium",
                                        children: "Min. Clear."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("font-bold text-xs md:text-sm", isStale ? "text-muted-foreground" : actualMinClearance !== null && actualMinClearance >= (minRequiredClearance || 0) ? "text-los-success" : "text-los-failure"),
                                        children: actualMinClearance !== null ? actualMinClearance.toFixed(1) + "m" : "N/A"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 168,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "order-3 flex-grow-0 md:flex-grow-0 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            type: "button",
                            onClick: onAnalyzeSubmit,
                            disabled: isActionPending,
                            size: "sm",
                            className: "bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 186,
                                    columnNumber: 13
                                }, this),
                                buttonText
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 179,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 178,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "order-5 flex items-center space-x-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                htmlFor: "clearanceThresholdProfile",
                                className: "text-[0.65rem] text-muted-foreground whitespace-nowrap",
                                children: "Req. Fresnel (m):"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 192,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Controller"], {
                                name: "clearanceThreshold",
                                control: control,
                                render: ({ field, fieldState: { error } })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                        id: "clearanceThresholdProfile",
                                        type: "number",
                                        step: "any",
                                        ...field,
                                        className: "bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-14 text-center"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 197,
                                        columnNumber: 15
                                    }, void 0)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 193,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this),
                    analysisResult && !isStale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "order-6 flex-grow-0 md:flex-grow-0 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            type: "button",
                            onClick: onOpenReportDialog,
                            size: "sm",
                            variant: "outline",
                            className: "text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"], {
                                    className: "mr-1.5 h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 217,
                                    columnNumber: 15
                                }, this),
                                "Make Report"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 210,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 209,
                        columnNumber: 11
                    }, this),
                    analysisResult && !isStale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "order-7 flex-grow-0 md:flex-grow-0 text-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            type: "button",
                            onClick: onAddNewLink,
                            size: "sm",
                            variant: "outline",
                            className: "text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight border-primary/50 text-primary/90 hover:bg-primary/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PlusCircle$3e$__["PlusCircle"], {
                                    className: "mr-1.5 h-3.5 w-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 232,
                                    columnNumber: 15
                                }, this),
                                "Add Another Link"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 225,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 224,
                        columnNumber: 12
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this),
            clientFormErrors.clearanceThreshold && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-destructive mt-0.5 text-center px-2",
                children: clientFormErrors.clearanceThreshold.message
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 240,
                columnNumber: 9
            }, this),
            analysisResult && !isClearBasedOnAnalysis && actualMinClearance !== null && !isNaN(minRequiredClearance) && !isStale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center text-los-failure text-[0.7rem] py-0.5",
                children: [
                    "Add ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-semibold",
                        children: [
                            deficit.toFixed(0),
                            "m"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 247,
                        columnNumber: 11
                    }, this),
                    " to tower(s) for clearance."
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 245,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex-1 min-h-0 p-0.5"),
                children: analysisResult ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$custom$2d$profile$2d$chart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    data: analysisResult.profile,
                    pointAName: pointANameDisplay,
                    pointBName: pointBNameDisplay,
                    isStale: isStale,
                    totalDistanceKm: analysisResult.distanceKm,
                    isActionPending: isActionPending,
                    onTowerHeightChangeFromGraph: onTowerHeightChangeFromGraph
                }, chartKey, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 254,
                    columnNumber: 11
                }, this) : isActionPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full flex items-center justify-center p-2 bg-muted/30 rounded-md",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground text-xs text-center",
                        children: "Loading analysis data..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 266,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 265,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "h-full flex flex-col items-center justify-center p-2 text-xs text-muted-foreground",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Select a link and perform analysis to see profile."
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 270,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 269,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 252,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
};
_s1(ProfilePanelMiddleColumn, "QX6/dfoiHivFdDK/9gf92mwevRg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"]
    ];
});
_c1 = ProfilePanelMiddleColumn;
function BottomPanel({ analysisResult, isPanelGloballyVisible, onToggleGlobalVisibility, isContentExpanded, onToggleContentExpansion, isStale, onAnalyzeSubmit, isActionPending, onTowerHeightChangeFromGraph, onOpenReportDialog, onAddNewLink, currentDistanceKm, selectedLinkClearanceThreshold, selectedLinkPointA, selectedLinkPointB }) {
    _s2();
    const { control } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormContext"])();
    const pointANameWatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'pointA.name',
        defaultValue: selectedLinkPointA?.name || "Site A"
    });
    const pointBNameWatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'pointB.name',
        defaultValue: selectedLinkPointB?.name || "Site B"
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        noValidate: true,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed bottom-12 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-slate-700/60 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out print:hidden", isPanelGloballyVisible ? "transform translate-y-0" : "transform translate-y-full", "z-[50]"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full overflow-hidden transition-[height] duration-500 ease-in-out", isContentExpanded && isPanelGloballyVisible ? "h-[33vh] md:h-[35vh]" : "h-0" // Slightly taller on md+ for better chart view
                ),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-1.5 md:p-2 h-full overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-row md:grid md:grid-cols-[minmax(200px,_1fr)_minmax(300px,_2.5fr)_minmax(200px,_1fr)] gap-1.5 h-full overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none custom-scrollbar",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 w-[calc(100vw-theme(spacing.12))] sm:w-[calc(100vw-theme(spacing.16))] md:w-auto snap-start p-1 md:p-0 order-1",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SiteInputGroup, {
                                    id: "pointA"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 339,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 338,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 w-[calc(100vw-theme(spacing.12))] sm:w-[calc(100vw-theme(spacing.16))] md:w-auto snap-start order-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProfilePanelMiddleColumn, {
                                    analysisResult: analysisResult,
                                    isStale: isStale,
                                    isActionPending: isActionPending,
                                    onAnalyzeSubmit: onAnalyzeSubmit,
                                    pointANameWatch: pointANameWatch,
                                    pointBNameWatch: pointBNameWatch,
                                    onTowerHeightChangeFromGraph: onTowerHeightChangeFromGraph,
                                    onOpenReportDialog: onOpenReportDialog,
                                    onAddNewLink: onAddNewLink,
                                    currentDistanceKm: currentDistanceKm,
                                    selectedLinkClearanceThreshold: selectedLinkClearanceThreshold
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 343,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 342,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 w-[calc(100vw-theme(spacing.12))] sm:w-[calc(100vw-theme(spacing.16))] md:w-auto snap-start p-1 md:p-0 order-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SiteInputGroup, {
                                    id: "pointB"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 359,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 358,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 336,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 334,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 328,
                columnNumber: 7
            }, this),
            isPanelGloballyVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-0 p-1.5 bg-slate-800/50 backdrop-blur-sm rounded-t-lg border-t border-x border-slate-700/50 shadow-lg cursor-pointer hover:bg-slate-700/70 group",
                onClick: onToggleContentExpansion,
                "aria-label": isContentExpanded ? "Collapse Panel Content" : "Expand Panel Content",
                children: isContentExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                    className: "h-4 w-4 text-slate-300 group-hover:text-slate-100"
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 371,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                    className: "h-4 w-4 text-slate-300 group-hover:text-slate-100"
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 372,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 365,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 320,
        columnNumber: 5
    }, this);
}
_s2(BottomPanel, "Vj+sBBqTknvHV8Zns0KoDjVCTaI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFormContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"]
    ];
});
_c2 = BottomPanel;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "SiteInputGroup");
__turbopack_context__.k.register(_c1, "ProfilePanelMiddleColumn");
__turbopack_context__.k.register(_c2, "BottomPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/fso/bottom-panel.tsx [app-client] (ecmascript, next/dynamic entry)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/fso/bottom-panel.tsx [app-client] (ecmascript)"));
}}),
"[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s({
    "__iconNode": (()=>__iconNode),
    "default": (()=>ChevronDown)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m6 9 6 6 6-6",
            key: "qrunsl"
        }
    ]
];
const ChevronDown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("ChevronDown", __iconNode);
;
 //# sourceMappingURL=chevron-down.js.map
}}),
"[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ChevronDown": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript)");
}}),
"[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s({
    "__iconNode": (()=>__iconNode),
    "default": (()=>ChevronUp)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m18 15-6-6-6 6",
            key: "153udz"
        }
    ]
];
const ChevronUp = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("ChevronUp", __iconNode);
;
 //# sourceMappingURL=chevron-up.js.map
}}),
"[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ChevronUp": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript)");
}}),
"[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s({
    "__iconNode": (()=>__iconNode),
    "default": (()=>Target)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "10",
            key: "1mglay"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "6",
            key: "1vlfrh"
        }
    ],
    [
        "circle",
        {
            cx: "12",
            cy: "12",
            r: "2",
            key: "1c9p78"
        }
    ]
];
const Target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("Target", __iconNode);
;
 //# sourceMappingURL=target.js.map
}}),
"[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Target": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=_58904b79._.js.map