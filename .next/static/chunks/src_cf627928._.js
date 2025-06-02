(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_cf627928._.js", {

"[project]/src/components/ui/skeleton.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Skeleton": (()=>Skeleton)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Skeleton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("animate-pulse rounded-md bg-muted", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/skeleton.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = Skeleton;
;
var _c;
__turbopack_context__.k.register(_c, "Skeleton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/los-calculator.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/fso/interactive-map.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>InteractiveMap)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-google-maps/api/dist/esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/skeleton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/los-calculator.ts [app-client] (ecmascript)"); // Import distance calculation
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ";
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};
const defaultZoom = 5; // Zoom level to show most of India
function pointsEqual(p1, p2, precision = 6) {
    if (!p1 || !p2) return false;
    const p1Lat = Number(p1.lat);
    const p1Lng = Number(p1.lng);
    const p2Lat = Number(p2.lat);
    const p2Lng = Number(p2.lng);
    if (isNaN(p1Lat) || isNaN(p1Lng) || isNaN(p2Lat) || isNaN(p2Lng)) return false;
    return p1Lat.toFixed(precision) === p2Lat.toFixed(precision) && p1Lng.toFixed(precision) === p2Lng.toFixed(precision);
}
// Function to get the middle point of a line
const getMidPoint = (p1, p2)=>{
    return {
        lat: (p1.lat + p2.lat) / 2,
        lng: (p1.lng + p2.lng) / 2
    };
};
function InteractiveMap({ pointA: formPointA, pointB: formPointB, analyzedData, isActionPending, onMarkerDragStartA, onMarkerDragStartB, onMarkerDragEndA, onMarkerDragEndB, mapContainerClassName = "w-full h-full" }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [scriptLoaded, setScriptLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [scriptError, setScriptError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mapCenter, setMapCenter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultCenter);
    const [mapZoom, setMapZoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(defaultZoom);
    const [currentDistance, setCurrentDistance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [distanceLabelPosition, setDistanceLabelPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const onLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[onLoad]": (mapInstance)=>{
            mapRef.current = mapInstance;
            mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
            if (!formPointA && !formPointB) {
                mapInstance.setCenter(defaultCenter);
                mapInstance.setZoom(defaultZoom);
            }
        }
    }["InteractiveMap.useCallback[onLoad]"], [
        formPointA,
        formPointB
    ]);
    const onUnmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[onUnmount]": ()=>{
            mapRef.current = null;
        }
    }["InteractiveMap.useCallback[onUnmount]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InteractiveMap.useEffect": ()=>{
            if (mapRef.current && formPointA && formPointB) {
                const bounds = new google.maps.LatLngBounds();
                if (formPointA.lat && formPointA.lng) bounds.extend(new google.maps.LatLng(formPointA.lat, formPointA.lng));
                if (formPointB.lat && formPointB.lng) bounds.extend(new google.maps.LatLng(formPointB.lat, formPointB.lng));
                if (!bounds.isEmpty()) {
                    mapRef.current.fitBounds(bounds);
                    const listener = google.maps.event.addListenerOnce(mapRef.current, 'idle', {
                        "InteractiveMap.useEffect.listener": ()=>{
                            if (mapRef.current?.getZoom() && mapRef.current.getZoom() > 17) {
                                mapRef.current.setZoom(17);
                            } else if (mapRef.current?.getZoom() && mapRef.current.getZoom() < 3) {
                                mapRef.current.setZoom(3); // Prevent zooming out too far
                            }
                        }
                    }["InteractiveMap.useEffect.listener"]);
                    return ({
                        "InteractiveMap.useEffect": ()=>{
                            if (listener) google.maps.event.removeListener(listener);
                        }
                    })["InteractiveMap.useEffect"];
                }
            } else if (mapRef.current && (!formPointA || !formPointB)) {
                setMapCenter(defaultCenter);
                setMapZoom(defaultZoom);
                mapRef.current.setCenter(defaultCenter);
                mapRef.current.setZoom(defaultZoom);
            }
        }
    }["InteractiveMap.useEffect"], [
        formPointA,
        formPointB
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InteractiveMap.useEffect": ()=>{
            if (formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
                const p1 = {
                    lat: Number(formPointA.lat),
                    lng: Number(formPointA.lng)
                };
                const p2 = {
                    lat: Number(formPointB.lat),
                    lng: Number(formPointB.lng)
                };
                const distKm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDistanceKm"])(p1, p2);
                setCurrentDistance(distKm < 1 ? `${(distKm * 1000).toFixed(1)} m` : `${distKm.toFixed(2)} km`);
                setDistanceLabelPosition(getMidPoint(p1, p2));
            } else {
                setCurrentDistance(null);
                setDistanceLabelPosition(null);
            }
        }
    }["InteractiveMap.useEffect"], [
        formPointA,
        formPointB
    ]);
    const handleMarkerDragEnd = (event, markerType)=>{
        if (event.latLng) {
            const newCoords = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            };
            if (markerType === 'A' && onMarkerDragEndA) {
                onMarkerDragEndA(newCoords);
            } else if (markerType === 'B' && onMarkerDragEndB) {
                onMarkerDragEndB(newCoords);
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${mapContainerClassName} bg-slate-700`,
        children: [
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoadScript"], {
                googleMapsApiKey: GOOGLE_MAPS_API_KEY,
                onLoad: ()=>setScriptLoaded(true),
                onError: ()=>{
                    console.error("Google Maps script could not be loaded. Check API Key (Maps JavaScript API), billing, and restrictions in Google Cloud Console.");
                    setScriptError(true);
                    setScriptLoaded(true);
                },
                loadingElement: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                    className: "w-full h-full rounded-none bg-slate-600"
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 167,
                    columnNumber: 25
                }, void 0),
                children: scriptError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-full flex flex-col items-center justify-center bg-muted/50 p-4 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "w-12 h-12 text-destructive mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 171,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-destructive font-semibold",
                            children: "Could not load Google Maps."
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 172,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground",
                            children: 'Check internet connection and API key configuration. Ensure "Maps JavaScript API" is enabled and billing is active. See browser console for details.'
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 173,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 170,
                    columnNumber: 11
                }, this) : scriptLoaded && typeof google !== 'undefined' && google.maps ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleMap"], {
                    mapContainerStyle: {
                        width: '100%',
                        height: '100%'
                    },
                    center: mapCenter,
                    zoom: mapZoom,
                    onLoad: onLoad,
                    onUnmount: onUnmount,
                    options: {
                        streetViewControl: true,
                        mapTypeControl: true,
                        mapTypeControlOptions: {
                            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                            position: google.maps.ControlPosition.TOP_RIGHT
                        },
                        fullscreenControl: true,
                        zoomControl: true,
                        gestureHandling: 'cooperative',
                        mapTypeId: google.maps.MapTypeId.SATELLITE
                    },
                    children: [
                        formPointA && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                            position: {
                                lat: formPointA.lat,
                                lng: formPointA.lng
                            },
                            label: {
                                text: formPointA.name || "A",
                                color: "white",
                                fontWeight: "bold"
                            },
                            draggable: !!onMarkerDragEndA,
                            onDragStart: onMarkerDragStartA,
                            onDragEnd: (e)=>handleMarkerDragEnd(e, 'A')
                        }, "marker-a", false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 198,
                            columnNumber: 15
                        }, this),
                        formPointB && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                            position: {
                                lat: formPointB.lat,
                                lng: formPointB.lng
                            },
                            label: {
                                text: formPointB.name || "B",
                                color: "white",
                                fontWeight: "bold"
                            },
                            draggable: !!onMarkerDragEndB,
                            onDragStart: onMarkerDragStartB,
                            onDragEnd: (e)=>handleMarkerDragEnd(e, 'B')
                        }, "marker-b", false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 208,
                            columnNumber: 15
                        }, this),
                        (()=>{
                            if (analyzedData && pointsEqual(formPointA, analyzedData.pointA) && pointsEqual(formPointB, analyzedData.pointB)) {
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                                    path: [
                                        {
                                            lat: analyzedData.pointA.lat,
                                            lng: analyzedData.pointA.lng
                                        },
                                        {
                                            lat: analyzedData.pointB.lat,
                                            lng: analyzedData.pointB.lng
                                        }
                                    ],
                                    options: {
                                        strokeColor: analyzedData.losPossible ? "hsl(var(--app-accent))" : "hsl(var(--destructive))",
                                        strokeOpacity: 0.9,
                                        strokeWeight: 3,
                                        clickable: false,
                                        zIndex: 2
                                    }
                                }, `analyzed-${analyzedData.pointA.lat}-${analyzedData.pointA.lng}-${analyzedData.pointB.lat}-${analyzedData.pointB.lng}`, false, {
                                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                                    lineNumber: 225,
                                    columnNumber: 19
                                }, this);
                            }
                            if (formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                                    path: [
                                        {
                                            lat: formPointA.lat,
                                            lng: formPointA.lng
                                        },
                                        {
                                            lat: formPointB.lat,
                                            lng: formPointB.lng
                                        }
                                    ],
                                    options: {
                                        strokeColor: "hsl(var(--muted-foreground))",
                                        strokeOpacity: isActionPending ? 0.3 : 0.7,
                                        strokeWeight: 2,
                                        clickable: false,
                                        zIndex: 1,
                                        icons: [
                                            {
                                                icon: {
                                                    path: 'M 0,-1 0,1',
                                                    strokeOpacity: 1,
                                                    scale: 3,
                                                    strokeWeight: 1.5
                                                },
                                                offset: '0',
                                                repeat: '10px'
                                            }
                                        ]
                                    }
                                }, `preview-${formPointA.lat}-${formPointA.lng}-${formPointB.lat}-${formPointB.lng}`, false, {
                                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                                    lineNumber: 243,
                                    columnNumber: 19
                                }, this);
                            }
                            return null;
                        })(),
                        distanceLabelPosition && currentDistance && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                            position: distanceLabelPosition,
                            mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                            getPixelPositionOffset: (offsetWidth, offsetHeight)=>({
                                    x: -(offsetWidth / 2),
                                    y: -offsetHeight - 10
                                }),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-slate-800/70 text-white text-xs px-2 py-1 rounded-md shadow-lg backdrop-blur-sm whitespace-nowrap",
                                children: currentDistance
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 276,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 268,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 178,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                    className: "w-full h-full rounded-none bg-slate-600"
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 284,
                    columnNumber: 12
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/interactive-map.tsx",
        lineNumber: 158,
        columnNumber: 5
    }, this);
}
_s(InteractiveMap, "BXr7s3AwFsm/ioOR7Mg91Msbkf4=");
_c = InteractiveMap;
var _c;
__turbopack_context__.k.register(_c, "InteractiveMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/card.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Card": (()=>Card),
    "CardContent": (()=>CardContent),
    "CardDescription": (()=>CardDescription),
    "CardFooter": (()=>CardFooter),
    "CardHeader": (()=>CardHeader),
    "CardTitle": (()=>CardTitle)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Card = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("rounded-lg border bg-card text-card-foreground shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, this));
_c1 = Card;
Card.displayName = "Card";
const CardHeader = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 p-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 24,
        columnNumber: 3
    }, this));
_c3 = CardHeader;
CardHeader.displayName = "CardHeader";
const CardTitle = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c4 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-2xl font-semibold leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 36,
        columnNumber: 3
    }, this));
_c5 = CardTitle;
CardTitle.displayName = "CardTitle";
const CardDescription = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 51,
        columnNumber: 3
    }, this));
_c7 = CardDescription;
CardDescription.displayName = "CardDescription";
const CardContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c8 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 63,
        columnNumber: 3
    }, this));
_c9 = CardContent;
CardContent.displayName = "CardContent";
const CardFooter = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center p-6 pt-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 71,
        columnNumber: 3
    }, this));
_c11 = CardFooter;
CardFooter.displayName = "CardFooter";
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "Card$React.forwardRef");
__turbopack_context__.k.register(_c1, "Card");
__turbopack_context__.k.register(_c2, "CardHeader$React.forwardRef");
__turbopack_context__.k.register(_c3, "CardHeader");
__turbopack_context__.k.register(_c4, "CardTitle$React.forwardRef");
__turbopack_context__.k.register(_c5, "CardTitle");
__turbopack_context__.k.register(_c6, "CardDescription$React.forwardRef");
__turbopack_context__.k.register(_c7, "CardDescription");
__turbopack_context__.k.register(_c8, "CardContent$React.forwardRef");
__turbopack_context__.k.register(_c9, "CardContent");
__turbopack_context__.k.register(_c10, "CardFooter$React.forwardRef");
__turbopack_context__.k.register(_c11, "CardFooter");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/button.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": (()=>Button),
    "buttonVariants": (()=>buttonVariants)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 46,
        columnNumber: 7
    }, this);
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
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
"[project]/src/components/ui/label.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Label": (()=>Label)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
const labelVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(labelVariants(), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/label.tsx",
        lineNumber: 18,
        columnNumber: 3
    }, this));
_c1 = Label;
Label.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Label$React.forwardRef");
__turbopack_context__.k.register(_c1, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/slider.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Slider": (()=>Slider)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slider/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Slider = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex w-full touch-none select-none items-center", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Track"], {
                className: "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Range"], {
                    className: "absolute h-full bg-primary"
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/slider.tsx",
                    lineNumber: 21,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/slider.tsx",
                lineNumber: 20,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Thumb"], {
                className: "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/slider.tsx",
                lineNumber: 23,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/slider.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, this));
_c1 = Slider;
Slider.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slider$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Slider$React.forwardRef");
__turbopack_context__.k.register(_c1, "Slider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/fso/tower-height-control.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$slider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/slider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
const TowerHeightControl = ({ label, height, onChange, min = 0, max = 100, step = 1, idSuffix })=>{
    const handleSliderChange = (value)=>{
        onChange(value[0]);
    };
    const handleInputChange = (event)=>{
        let newValue = parseFloat(event.target.value);
        if (isNaN(newValue)) {
            // Allow empty input for clearing, but don't change if invalid
            if (event.target.value === "") {
                onChange(min); // Or some default, or just don't call onChange
                return;
            }
            return;
        }
        // No immediate clamping here, let react-hook-form validation handle it on blur/submit
        // if (newValue < min) newValue = min;
        // if (newValue > max) newValue = max;
        onChange(newValue);
    };
    const validateAndSetHeight = (value)=>{
        let numValue = parseFloat(value);
        if (isNaN(numValue)) {
            numValue = min; // default to min if invalid
        }
        if (numValue < min) numValue = min;
        if (numValue > max) numValue = max;
        onChange(numValue);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-0.5",
        children: [
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                        htmlFor: `height-input-${idSuffix}`,
                        className: "text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal",
                        children: [
                            label,
                            " (m)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fso/tower-height-control.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[0.7rem] font-medium text-primary/80",
                        children: [
                            height,
                            "m"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fso/tower-height-control.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/tower-height-control.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-1",
                children: [
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                        id: `height-input-${idSuffix}`,
                        type: "number",
                        value: height,
                        onChange: handleInputChange,
                        onBlur: (e)=>validateAndSetHeight(e.target.value),
                        min: min,
                        max: max,
                        step: step,
                        className: "w-12 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 text-xs h-6 px-1 py-0.5 rounded-none focus:ring-0"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/tower-height-control.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$slider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slider"], {
                        id: `height-slider-${idSuffix}`,
                        value: [
                            height
                        ],
                        onValueChange: handleSliderChange,
                        min: min,
                        max: max,
                        step: step,
                        className: "flex-1",
                        "aria-labelledby": `label-${idSuffix}-height`
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/tower-height-control.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/tower-height-control.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/tower-height-control.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
};
_c = TowerHeightControl;
const __TURBOPACK__default__export__ = TowerHeightControl;
var _c;
__turbopack_context__.k.register(_c, "TowerHeightControl");
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
const PADDING = {
    top: 20,
    right: 30,
    bottom: 40,
    left: 50
};
const TEXT_COLOR = 'hsl(210, 20%, 55%)'; // Muted foreground for axes
const GRID_COLOR = 'hsla(217, 33%, 20%, 0.7)'; // Darker grid, increased visibility
const TERRAIN_FILL_COLOR = 'rgba(99, 102, 241, 0.35)';
const TERRAIN_STROKE_COLOR = 'rgba(99, 102, 241, 0.6)';
const LOS_LINE_COLOR = '#22d3ee';
const TOWER_LINE_COLOR = '#eab308';
const HOVER_GUIDE_LINE_COLOR = 'rgba(200, 200, 200, 0.5)';
const HOVER_DOT_COLOR = '#22d3ee';
// Updated Tooltip Colors for Dark Style
const TOOLTIP_BG_COLOR = 'hsla(222, 40%, 10%, 0.9)'; // Dark, semi-transparent popover-like bg
const TOOLTIP_TEXT_COLOR = 'hsl(210, 40%, 95%)'; // Light popover-like foreground
const TOOLTIP_BORDER_COLOR = 'hsl(217, 33%, 20%)'; // Subtle border
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
function CustomProfileChart({ data, pointAName = "Site A", pointBName = "Site B", isStale, totalDistanceKm, isLoading, onTowerHeightChangeFromGraph }) {
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [hoverData, setHoverData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mousePosition, setMousePosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [draggingTower, setDraggingTower] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [towerDragStartY, setTowerDragStartY] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [initialTowerHeightValue, setInitialTowerHeightValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isGraphUpdatingByDrag, setIsGraphUpdatingByDrag] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const drawChart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "CustomProfileChart.useCallback[drawChart]": ()=>{
            const canvas = canvasRef.current;
            if (!canvas || !data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                requestAnimationFrame(drawChart);
                return;
            }
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            const chartWidth = rect.width - PADDING.left - PADDING.right;
            const chartHeight = rect.height - PADDING.top - PADDING.bottom;
            ctx.clearRect(0, 0, rect.width, rect.height);
            const originalTransform = ctx.getTransform();
            ctx.translate(PADDING.left, PADDING.top);
            const elevations = data.flatMap({
                "CustomProfileChart.useCallback[drawChart].elevations": (p)=>[
                        p.terrainElevation,
                        p.losHeight
                    ]
            }["CustomProfileChart.useCallback[drawChart].elevations"]);
            let minY = Math.min(...elevations);
            let maxY = Math.max(...elevations);
            const yDataRange = maxY - minY;
            minY -= yDataRange * 0.15;
            maxY += yDataRange * 0.15;
            if (maxY === minY) {
                maxY += 10;
                minY -= 10;
            }
            if (maxY < minY) [maxY, minY] = [
                minY,
                maxY
            ];
            const maxXKm = totalDistanceKm;
            const maxX = maxXKm * 1000;
            const getX = {
                "CustomProfileChart.useCallback[drawChart].getX": (distanceKm)=>distanceKm / maxXKm * chartWidth
            }["CustomProfileChart.useCallback[drawChart].getX"];
            const getY = {
                "CustomProfileChart.useCallback[drawChart].getY": (elevation)=>chartHeight - (elevation - minY) / (maxY - minY) * chartHeight
            }["CustomProfileChart.useCallback[drawChart].getY"];
            // 1. Draw Grid Lines
            ctx.strokeStyle = GRID_COLOR;
            ctx.lineWidth = 0.5;
            ctx.font = "9px Inter, sans-serif";
            ctx.fillStyle = TEXT_COLOR;
            const numYTicks = 5;
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            for(let i = 0; i <= numYTicks; i++){
                const val = minY + i / numYTicks * (maxY - minY);
                const y = getY(val);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(chartWidth, y);
                ctx.stroke();
                ctx.fillText(val.toFixed(0) + "m", -8, y);
            }
            const numXTicks = Math.min(5, Math.max(1, Math.floor(totalDistanceKm / (totalDistanceKm > 5 ? 2 : 1))));
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            for(let i = 0; i <= numXTicks; i++){
                const distKm = i / numXTicks * maxXKm;
                const x = getX(distKm);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, chartHeight);
                ctx.stroke();
                ctx.fillText((distKm * 1000).toFixed(0) + "m", x, chartHeight + 8);
            }
            // 2. Draw Terrain Profile
            ctx.beginPath();
            ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
            data.forEach({
                "CustomProfileChart.useCallback[drawChart]": (p)=>ctx.lineTo(getX(p.distance), getY(p.terrainElevation))
            }["CustomProfileChart.useCallback[drawChart]"]);
            ctx.lineTo(getX(data[data.length - 1].distance), chartHeight);
            ctx.lineTo(getX(data[0].distance), chartHeight);
            ctx.closePath();
            ctx.fillStyle = TERRAIN_FILL_COLOR;
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
            data.forEach({
                "CustomProfileChart.useCallback[drawChart]": (p)=>ctx.lineTo(getX(p.distance), getY(p.terrainElevation))
            }["CustomProfileChart.useCallback[drawChart]"]);
            ctx.strokeStyle = TERRAIN_STROKE_COLOR;
            ctx.lineWidth = 1;
            ctx.stroke();
            // 3. Draw LOS Line
            ctx.beginPath();
            ctx.moveTo(getX(data[0].distance), getY(data[0].losHeight));
            ctx.lineTo(getX(data[data.length - 1].distance), getY(data[data.length - 1].losHeight));
            ctx.strokeStyle = LOS_LINE_COLOR;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // 4. Draw Tower Lines and Site Names (with interactive handles)
            ctx.fillStyle = TEXT_COLOR;
            ctx.font = "bold 10px Inter, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            const towerHandleRadiusVisual = 6;
            // Site A Tower
            const xA = getX(data[0].distance);
            const yTerrainA = getY(data[0].terrainElevation);
            const yLosA = getY(data[0].losHeight);
            ctx.strokeStyle = TOWER_LINE_COLOR;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(xA, yTerrainA);
            ctx.lineTo(xA, yLosA);
            ctx.stroke();
            // Handle
            ctx.beginPath();
            ctx.arc(xA, yLosA, towerHandleRadiusVisual, 0, 2 * Math.PI);
            ctx.fillStyle = TOWER_LINE_COLOR;
            ctx.fill();
            ctx.strokeStyle = TOOLTIP_BG_COLOR; // Outline handle
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(pointAName, xA, yLosA - (towerHandleRadiusVisual + 2));
            // Site B Tower
            const xB = getX(data[data.length - 1].distance);
            const yTerrainB = getY(data[data.length - 1].terrainElevation);
            const yLosB = getY(data[data.length - 1].losHeight);
            ctx.strokeStyle = TOWER_LINE_COLOR;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(xB, yTerrainB);
            ctx.lineTo(xB, yLosB);
            ctx.stroke();
            // Handle
            ctx.beginPath();
            ctx.arc(xB, yLosB, towerHandleRadiusVisual, 0, 2 * Math.PI);
            ctx.fillStyle = TOWER_LINE_COLOR;
            ctx.fill();
            ctx.strokeStyle = TOOLTIP_BG_COLOR;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = TEXT_COLOR;
            ctx.fillText(pointBName, xB, yLosB - (towerHandleRadiusVisual + 2));
            // 5. Draw Hover Effects
            if (hoverData && !draggingTower) {
                const hxPx = hoverData.xPx;
                const hyPxLos = hoverData.yPx;
                ctx.beginPath();
                ctx.setLineDash([
                    3,
                    3
                ]);
                ctx.strokeStyle = HOVER_GUIDE_LINE_COLOR;
                ctx.lineWidth = 1;
                ctx.moveTo(hxPx, 0);
                ctx.lineTo(hxPx, chartHeight);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.arc(hxPx, hyPxLos, 4, 0, 2 * Math.PI);
                ctx.fillStyle = HOVER_DOT_COLOR;
                ctx.fill();
                ctx.strokeStyle = TOOLTIP_BG_COLOR;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            ctx.setTransform(originalTransform);
            // 6. Draw Tooltip
            if (hoverData && mousePosition && !draggingTower) {
                const p = hoverData.point;
                const lines = [
                    `Distance to Site: ${(p.distance * 1000).toFixed(2)} m`,
                    `Line of Sight height: ${p.losHeight.toFixed(1)} m`,
                    `Fresnel height: ${p.clearance.toFixed(1)} m`
                ];
                ctx.font = "10px Inter, sans-serif";
                const lineHeight = 14;
                const tooltipPadding = 6;
                const textWidth = Math.max(...lines.map({
                    "CustomProfileChart.useCallback[drawChart].textWidth": (line)=>ctx.measureText(line).width
                }["CustomProfileChart.useCallback[drawChart].textWidth"]));
                const tooltipWidth = textWidth + 2 * tooltipPadding;
                const tooltipHeight = lines.length * lineHeight + 2 * tooltipPadding - (lineHeight - 10);
                const cornerRadius = 4;
                let tipX = mousePosition.x + 15;
                let tipY = mousePosition.y - tooltipHeight - 5;
                if (tipX + tooltipWidth > rect.width - PADDING.right / 2) {
                    tipX = mousePosition.x - tooltipWidth - 15;
                }
                if (tipY < PADDING.top / 2) {
                    tipY = mousePosition.y + 15;
                }
                if (tipY + tooltipHeight > rect.height - PADDING.bottom / 2) {
                    tipY = rect.height - PADDING.bottom / 2 - tooltipHeight;
                }
                if (tipX < PADDING.left / 2) {
                    tipX = PADDING.left / 2;
                }
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
                        if (line.startsWith("Line of Sight height:")) {
                            ctx.fillStyle = LOS_LINE_COLOR;
                        } else {
                            ctx.fillStyle = TOOLTIP_TEXT_COLOR;
                        }
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
        draggingTower
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            const handleMouseMoveForTooltip = {
                "CustomProfileChart.useEffect.handleMouseMoveForTooltip": (event)=>{
                    if (draggingTower) return;
                    if (!data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
                        setHoverData(null);
                        setMousePosition(null);
                        return;
                    }
                    const rect = canvas.getBoundingClientRect();
                    const mouseCanvasX = event.clientX - rect.left;
                    const mouseCanvasY = event.clientY - rect.top;
                    setMousePosition({
                        x: mouseCanvasX,
                        y: mouseCanvasY
                    });
                    const chartWidth = rect.width - PADDING.left - PADDING.right;
                    const chartHeight = rect.height - PADDING.top - PADDING.bottom;
                    const mouseXInChartArea = mouseCanvasX - PADDING.left;
                    const elevations = data.flatMap({
                        "CustomProfileChart.useEffect.handleMouseMoveForTooltip.elevations": (p)=>[
                                p.terrainElevation,
                                p.losHeight
                            ]
                    }["CustomProfileChart.useEffect.handleMouseMoveForTooltip.elevations"]);
                    let tempMinY = Math.min(...elevations);
                    let tempMaxY = Math.max(...elevations);
                    const yDataRange = tempMaxY - tempMinY;
                    tempMinY -= yDataRange * 0.15;
                    tempMaxY += yDataRange * 0.15;
                    if (tempMaxY === tempMinY) {
                        tempMaxY += 10;
                        tempMinY -= 10;
                    }
                    if (tempMaxY < tempMinY) [tempMaxY, tempMinY] = [
                        tempMinY,
                        tempMaxY
                    ];
                    const getXPx = {
                        "CustomProfileChart.useEffect.handleMouseMoveForTooltip.getXPx": (distKm)=>distKm / totalDistanceKm * chartWidth
                    }["CustomProfileChart.useEffect.handleMouseMoveForTooltip.getXPx"];
                    const getYPx = {
                        "CustomProfileChart.useEffect.handleMouseMoveForTooltip.getYPx": (elev)=>chartHeight - (elev - tempMinY) / (tempMaxY - tempMinY) * chartHeight
                    }["CustomProfileChart.useEffect.handleMouseMoveForTooltip.getYPx"];
                    if (mouseXInChartArea >= 0 && mouseXInChartArea <= chartWidth) {
                        const distanceKmHovered = mouseXInChartArea / chartWidth * totalDistanceKm;
                        let closestPoint = data[0];
                        let minDiff = Math.abs(data[0].distance - distanceKmHovered);
                        for(let i = 1; i < data.length; i++){
                            const diff = Math.abs(data[i].distance - distanceKmHovered);
                            if (diff < minDiff) {
                                minDiff = diff;
                                closestPoint = data[i];
                            }
                        }
                        setHoverData({
                            xPx: getXPx(closestPoint.distance),
                            yPx: getYPx(closestPoint.losHeight),
                            point: {
                                ...closestPoint,
                                distanceMeters: closestPoint.distance * 1000
                            }
                        });
                    } else {
                        setHoverData(null);
                    }
                }
            }["CustomProfileChart.useEffect.handleMouseMoveForTooltip"];
            const handleMouseOutForTooltip = {
                "CustomProfileChart.useEffect.handleMouseOutForTooltip": ()=>{
                    if (draggingTower) return;
                    setHoverData(null);
                    setMousePosition(null);
                }
            }["CustomProfileChart.useEffect.handleMouseOutForTooltip"];
            const handleCanvasMouseDown = {
                "CustomProfileChart.useEffect.handleCanvasMouseDown": (event)=>{
                    if (!canvasRef.current || !data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null || !onTowerHeightChangeFromGraph) return;
                    const rect = canvasRef.current.getBoundingClientRect();
                    const clickX = event.clientX - rect.left;
                    const clickY = event.clientY - rect.top;
                    const chartWidth = rect.width - PADDING.left - PADDING.right;
                    const chartHeight = rect.height - PADDING.top - PADDING.bottom;
                    const elevations = data.flatMap({
                        "CustomProfileChart.useEffect.handleCanvasMouseDown.elevations": (p)=>[
                                p.terrainElevation,
                                p.losHeight
                            ]
                    }["CustomProfileChart.useEffect.handleCanvasMouseDown.elevations"]);
                    let tempMinY = Math.min(...elevations);
                    let tempMaxY = Math.max(...elevations);
                    const yDataRange = tempMaxY - tempMinY;
                    tempMinY -= yDataRange * 0.15;
                    tempMaxY += yDataRange * 0.15;
                    if (tempMaxY === tempMinY) {
                        tempMaxY += 10;
                        tempMinY -= 10;
                    }
                    if (tempMaxY < tempMinY) [tempMaxY, tempMinY] = [
                        tempMinY,
                        tempMaxY
                    ];
                    const getCanvasX = {
                        "CustomProfileChart.useEffect.handleCanvasMouseDown.getCanvasX": (distanceKm)=>PADDING.left + distanceKm / totalDistanceKm * chartWidth
                    }["CustomProfileChart.useEffect.handleCanvasMouseDown.getCanvasX"];
                    const getCanvasY = {
                        "CustomProfileChart.useEffect.handleCanvasMouseDown.getCanvasY": (elevation)=>PADDING.top + (chartHeight - (elevation - tempMinY) / (tempMaxY - tempMinY) * chartHeight)
                    }["CustomProfileChart.useEffect.handleCanvasMouseDown.getCanvasY"];
                    const towerHandleClickRadius = 8;
                    const towerAx = getCanvasX(data[0].distance);
                    const towerAy = getCanvasY(data[0].losHeight);
                    const distA = Math.sqrt(Math.pow(clickX - towerAx, 2) + Math.pow(clickY - towerAy, 2));
                    if (distA < towerHandleClickRadius) {
                        setDraggingTower('A');
                        setTowerDragStartY(event.clientY);
                        setInitialTowerHeightValue(data[0].losHeight - data[0].terrainElevation);
                        setIsGraphUpdatingByDrag(true);
                        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                        event.preventDefault();
                        return;
                    }
                    const towerBx = getCanvasX(data[data.length - 1].distance);
                    const towerBy = getCanvasY(data[data.length - 1].losHeight);
                    const distB = Math.sqrt(Math.pow(clickX - towerBx, 2) + Math.pow(clickY - towerBy, 2));
                    if (distB < towerHandleClickRadius) {
                        setDraggingTower('B');
                        setTowerDragStartY(event.clientY);
                        setInitialTowerHeightValue(data[data.length - 1].losHeight - data[data.length - 1].terrainElevation);
                        setIsGraphUpdatingByDrag(true);
                        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                        event.preventDefault();
                        return;
                    }
                }
            }["CustomProfileChart.useEffect.handleCanvasMouseDown"];
            canvas.addEventListener('mousemove', handleMouseMoveForTooltip);
            canvas.addEventListener('mouseout', handleMouseOutForTooltip);
            canvas.addEventListener('mousedown', handleCanvasMouseDown);
            const resizeObserver = new ResizeObserver({
                "CustomProfileChart.useEffect": ()=>{
                    requestAnimationFrame(drawChart);
                }
            }["CustomProfileChart.useEffect"]);
            resizeObserver.observe(canvas);
            drawChart();
            return ({
                "CustomProfileChart.useEffect": ()=>{
                    resizeObserver.unobserve(canvas);
                    canvas.removeEventListener('mousemove', handleMouseMoveForTooltip);
                    canvas.removeEventListener('mouseout', handleMouseOutForTooltip);
                    canvas.removeEventListener('mousedown', handleCanvasMouseDown);
                }
            })["CustomProfileChart.useEffect"];
        }
    }["CustomProfileChart.useEffect"], [
        drawChart,
        data,
        totalDistanceKm,
        PADDING.left,
        PADDING.top,
        onTowerHeightChangeFromGraph,
        draggingTower
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!draggingTower || !canvas || !data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null || !onTowerHeightChangeFromGraph) {
                if (canvas && canvas.style.cursor === 'grabbing') canvas.style.cursor = 'crosshair';
                return;
            }
            const handleGlobalMouseMove = {
                "CustomProfileChart.useEffect.handleGlobalMouseMove": (event)=>{
                    if (!canvasRef.current) return;
                    const rect = canvasRef.current.getBoundingClientRect();
                    const chartHeightPixels = rect.height - PADDING.top - PADDING.bottom;
                    if (chartHeightPixels <= 0) return;
                    const elevations = data.flatMap({
                        "CustomProfileChart.useEffect.handleGlobalMouseMove.elevations": (p)=>[
                                p.terrainElevation,
                                p.losHeight
                            ]
                    }["CustomProfileChart.useEffect.handleGlobalMouseMove.elevations"]);
                    let dataMinY = Math.min(...elevations);
                    let dataMaxY = Math.max(...elevations);
                    const yDataRangeVal = dataMaxY - dataMinY; // Renamed to avoid conflict
                    dataMinY -= yDataRangeVal * 0.15;
                    dataMaxY += yDataRangeVal * 0.15;
                    if (dataMaxY === dataMinY) {
                        dataMaxY += 10;
                        dataMinY -= 10;
                    }
                    if (dataMaxY < dataMinY) [dataMaxY, dataMinY] = [
                        dataMinY,
                        dataMaxY
                    ];
                    const heightPerPixel = (dataMaxY - dataMinY) / chartHeightPixels;
                    const clientYDelta = event.clientY - towerDragStartY;
                    const heightChange = clientYDelta * heightPerPixel * -1;
                    let newTowerHeight = initialTowerHeightValue + heightChange;
                    newTowerHeight = Math.max(0, Math.min(100, newTowerHeight));
                }
            }["CustomProfileChart.useEffect.handleGlobalMouseMove"];
            const handleGlobalMouseUp = {
                "CustomProfileChart.useEffect.handleGlobalMouseUp": (event)=>{
                    if (!canvasRef.current) {
                        setDraggingTower(null);
                        setIsGraphUpdatingByDrag(false);
                        return;
                    }
                    const rect = canvasRef.current.getBoundingClientRect();
                    const chartHeightPixels = rect.height - PADDING.top - PADDING.bottom;
                    if (chartHeightPixels <= 0) {
                        setDraggingTower(null);
                        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
                        setIsGraphUpdatingByDrag(false);
                        return;
                    }
                    const elevations = data.flatMap({
                        "CustomProfileChart.useEffect.handleGlobalMouseUp.elevations": (p)=>[
                                p.terrainElevation,
                                p.losHeight
                            ]
                    }["CustomProfileChart.useEffect.handleGlobalMouseUp.elevations"]);
                    let dataMinY = Math.min(...elevations);
                    let dataMaxY = Math.max(...elevations);
                    const yDataRangeVal = dataMaxY - dataMinY; // Renamed
                    dataMinY -= yDataRangeVal * 0.15;
                    dataMaxY += yDataRangeVal * 0.15;
                    if (dataMaxY === dataMinY) {
                        dataMaxY += 10;
                        dataMinY -= 10;
                    }
                    if (dataMaxY < dataMinY) [dataMaxY, dataMinY] = [
                        dataMinY,
                        dataMaxY
                    ];
                    const heightPerPixel = (dataMaxY - dataMinY) / chartHeightPixels;
                    const clientYDelta = event.clientY - towerDragStartY;
                    const heightChange = clientYDelta * heightPerPixel * -1;
                    let finalNewTowerHeight = initialTowerHeightValue + heightChange;
                    finalNewTowerHeight = Math.max(0, Math.min(100, parseFloat(finalNewTowerHeight.toFixed(1))));
                    if (draggingTower && onTowerHeightChangeFromGraph) {
                        onTowerHeightChangeFromGraph(draggingTower === 'A' ? 'pointA' : 'pointB', finalNewTowerHeight);
                    }
                    setDraggingTower(null);
                    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
                    setIsGraphUpdatingByDrag(false);
                }
            }["CustomProfileChart.useEffect.handleGlobalMouseUp"];
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
            return ({
                "CustomProfileChart.useEffect": ()=>{
                    window.removeEventListener('mousemove', handleGlobalMouseMove);
                    window.removeEventListener('mouseup', handleGlobalMouseUp);
                    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
                }
            })["CustomProfileChart.useEffect"];
        }
    }["CustomProfileChart.useEffect"], [
        draggingTower,
        towerDragStartY,
        initialTowerHeightValue,
        data,
        totalDistanceKm,
        onTowerHeightChangeFromGraph,
        PADDING.top,
        PADDING.bottom
    ]); // Removed isGraphUpdatingByDrag from deps
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            drawChart();
        }
    }["CustomProfileChart.useEffect"], [
        hoverData,
        mousePosition,
        drawChart
    ]);
    if (isGraphUpdatingByDrag) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-full flex items-center justify-center p-2 bg-slate-700/30 rounded-md relative", isStale && "opacity-50"),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-slate-300 text-xs text-center",
                children: "Adjusting tower height..."
            }, void 0, false, {
                fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
                lineNumber: 519,
                columnNumber: 15
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 518,
            columnNumber: 11
        }, this);
    }
    if (isLoading && !isGraphUpdatingByDrag) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md", isStale && "opacity-50"),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted-foreground text-xs text-center",
                children: "Loading analysis data..."
            }, void 0, false, {
                fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
                lineNumber: 526,
                columnNumber: 15
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 525,
            columnNumber: 11
        }, this);
    }
    if (!data || data.length < 2 || totalDistanceKm === undefined || totalDistanceKm === null) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("h-full flex items-center justify-center p-2 bg-muted/30 rounded-md", isStale && "opacity-50"),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted-foreground text-xs text-center",
                children: "Not enough data to display profile. Perform analysis."
            }, void 0, false, {
                fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
                lineNumber: 535,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 534,
            columnNumber: 9
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full h-full relative", isStale && "opacity-50"),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
            ref: canvasRef,
            style: {
                width: '100%',
                height: '100%',
                cursor: draggingTower ? 'grabbing' : 'crosshair'
            }
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 544,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
        lineNumber: 543,
        columnNumber: 5
    }, this);
}
_s(CustomProfileChart, "fNQVq6oPB/jlAXVXip/PHeg0744=");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$tower$2d$height$2d$control$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/tower-height-control.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$custom$2d$profile$2d$chart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/custom-profile-chart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/target.js [app-client] (ecmascript) <export default as Target>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
const SiteInputGroup = ({ id, title, control, register, clientFormErrors, serverFormErrors, getCombinedError })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "bg-transparent backdrop-blur-2px shadow-none border-0 h-full flex flex-col p-1 md:p-2 w-full",
        children: [
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                className: "p-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                    className: "text-xs flex items-center text-slate-100/90 uppercase tracking-wider font-medium",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$target$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Target$3e$__["Target"], {
                            className: "mr-1.5 h-3.5 w-3.5 text-primary/70"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 38,
                            columnNumber: 9
                        }, this),
                        " ",
                        title
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 37,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 36,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                className: "p-1 space-y-1.5 text-xs flex-grow overflow-y-auto pr-1 flex flex-col justify-between",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    htmlFor: `${id}.name`,
                                    className: "text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal",
                                    children: "Name"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 44,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                    id: `${id}.name`,
                                    ...register(`${id}.name`),
                                    placeholder: "e.g. Main Site",
                                    className: "mt-0.5 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 45,
                                    columnNumber: 11
                                }, this),
                                (clientFormErrors[id]?.name || serverFormErrors?.[`${id}.name`]) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-destructive/80 mt-0.5",
                                    children: getCombinedError(clientFormErrors[id]?.name, serverFormErrors?.[`${id}.name`])
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 52,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 43,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: `${id}.lat`,
                                            className: "text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal",
                                            children: "Latitude"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 56,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: `${id}.lat`,
                                            ...register(`${id}.lat`),
                                            placeholder: "-90 to 90",
                                            className: "mt-0.5 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 57,
                                            columnNumber: 13
                                        }, this),
                                        (clientFormErrors[id]?.lat || serverFormErrors?.[`${id}.lat`]) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-destructive/80 mt-0.5",
                                            children: getCombinedError(clientFormErrors[id]?.lat, serverFormErrors?.[`${id}.lat`])
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 64,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 55,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: `${id}.lng`,
                                            className: "text-[0.7rem] uppercase tracking-wider text-slate-300/70 font-normal",
                                            children: "Longitude"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 67,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: `${id}.lng`,
                                            ...register(`${id}.lng`),
                                            placeholder: "-180 to 180",
                                            className: "mt-0.5 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 68,
                                            columnNumber: 13
                                        }, this),
                                        (clientFormErrors[id]?.lng || serverFormErrors?.[`${id}.lng`]) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-destructive/80 mt-0.5",
                                            children: getCombinedError(clientFormErrors[id]?.lng, serverFormErrors?.[`${id}.lng`])
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 75,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 66,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 54,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Controller"], {
                            name: `${id}.height`,
                            control: control,
                            defaultValue: 20,
                            render: ({ field })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$tower$2d$height$2d$control$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    label: "Tower Height",
                                    height: field.value,
                                    onChange: field.onChange,
                                    min: 0,
                                    max: 100,
                                    idSuffix: id
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, void 0)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 78,
                            columnNumber: 9
                        }, this),
                        (clientFormErrors[id]?.height || serverFormErrors?.[`${id}.height`]) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-destructive/80 mt-0.5",
                            children: getCombinedError(clientFormErrors[id]?.height, serverFormErrors?.[`${id}.height`])
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 42,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 41,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 35,
        columnNumber: 3
    }, this);
_c = SiteInputGroup;
const AnalysisAction = ({ isActionPending, handleSubmit, processSubmit })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full flex flex-col items-center justify-center p-1 bg-transparent backdrop-blur-2px rounded-lg w-full",
        children: [
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                className: "text-sm flex items-center mb-2 text-primary/80 uppercase tracking-wider font-medium",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                        className: "mr-1.5 h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 113,
                        columnNumber: 7
                    }, this),
                    " Actions"
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 112,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "pt-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "submit",
                    onClick: handleSubmit(processSubmit),
                    disabled: isActionPending,
                    className: "bg-primary/80 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-normal text-center leading-tight",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 123,
                            columnNumber: 9
                        }, this),
                        "Analyze LOS"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 117,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 116,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 111,
        columnNumber: 3
    }, this);
_c1 = AnalysisAction;
function BottomPanel({ analysisResult, isPanelGloballyVisible, onToggleGlobalVisibility, isContentExpanded, onToggleContentExpansion, isStale, control, register, handleSubmit, processSubmit, clientFormErrors, serverFormErrors, isActionPending, onTowerHeightChangeFromGraph }) {
    _s();
    const getCombinedError = (clientFieldError, serverFieldError)=>{
        if (serverFieldError && serverFieldError.length > 0) return serverFieldError.join(', ');
        return clientFieldError?.message;
    };
    const pointAName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'pointA.name',
        defaultValue: analysisResult?.pointA?.name || "Site A"
    });
    const pointBName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'pointB.name',
        defaultValue: analysisResult?.pointB?.name || "Site B"
    });
    const watchedClearanceThresholdString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'clearanceThreshold',
        defaultValue: analysisResult?.clearanceThresholdUsed?.toString() || "10"
    });
    const minRequiredClearance = parseFloat(watchedClearanceThresholdString) || 0;
    let isClearBasedOnAnalysis = false;
    let deficit = 0;
    let actualMinClearance = 0;
    if (analysisResult && analysisResult.minClearance !== null) {
        actualMinClearance = analysisResult.minClearance;
        const thresholdUsedForComparison = analysisResult.clearanceThresholdUsed ?? minRequiredClearance;
        isClearBasedOnAnalysis = actualMinClearance >= thresholdUsedForComparison;
        deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(thresholdUsedForComparison - actualMinClearance);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: handleSubmit(processSubmit),
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed bottom-0 left-0 right-0 z-30 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/60 rounded-t-2xl transition-transform duration-300 ease-in-out hover:bg-slate-800/90 print:hidden", isPanelGloballyVisible ? "transform translate-y-0" : "transform translate-y-full"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-1 right-1 z-40",
                children: [
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: onToggleGlobalVisibility,
                        className: "p-1.5 rounded-full bg-slate-700/50 hover:bg-slate-600/70 backdrop-blur-sm text-slate-200/80 hover:text-white transition-all duration-200",
                        "aria-label": isPanelGloballyVisible ? "Hide Analysis Panel" : "Show Analysis Panel",
                        children: isPanelGloballyVisible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 205,
                            columnNumber: 37
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 205,
                            columnNumber: 79
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full overflow-hidden transition-[height] duration-500 ease-in-out", isContentExpanded ? "h-[45vh]" : "h-0" // This controls the content area's height
                ),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-1.5 md:p-2 h-full overflow-y-hidden md:overflow-y-auto",
                    children: [
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex md:grid md:grid-cols-[23%_minmax(0,1fr)_23%] gap-1.5 h-full overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none custom-scrollbar",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-shrink-0 w-full md:w-auto snap-start p-1 md:p-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SiteInputGroup, {
                                        id: "pointA",
                                        title: pointAName,
                                        control: control,
                                        register: register,
                                        clientFormErrors: clientFormErrors,
                                        serverFormErrors: serverFormErrors,
                                        getCombinedError: getCombinedError
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 220,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 219,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-shrink-0 w-full md:w-auto snap-start flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-2px rounded-lg p-1 md:p-0",
                                    children: [
                                        analysisResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col md:flex-row items-center justify-around py-1 md:py-2 px-2 md:px-3 border-b border-slate-700/50 mb-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-shrink-0 mb-1 md:mb-0",
                                                    children: isStale ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "px-2 py-1 rounded-md text-xs font-semibold bg-yellow-600/30 text-yellow-400/90",
                                                        children: "NEEDS RE-ANALYZE"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                        lineNumber: 237,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-2 py-1 rounded-md text-xs font-semibold", isClearBasedOnAnalysis ? "bg-emerald-500/30 text-emerald-300/90" : "bg-rose-500/30 text-rose-300/90"),
                                                        children: isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                        lineNumber: 241,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                    lineNumber: 235,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-grow flex justify-center my-1 md:my-0 md:mx-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        type: "submit",
                                                        disabled: isActionPending,
                                                        className: "bg-primary/80 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none hover:shadow-md transition-all duration-200",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                                lineNumber: 261,
                                                                columnNumber: 23
                                                            }, this),
                                                            "Re-Analyze"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                        lineNumber: 256,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                    lineNumber: 255,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center space-x-2 md:space-x-4 text-xs",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col items-center",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "uppercase tracking-wider text-slate-400/90 text-[0.6rem] md:text-[0.65rem] font-medium",
                                                                    children: "Aerial Dist."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                                    lineNumber: 268,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-bold text-slate-100 text-xs md:text-sm",
                                                                    children: analysisResult.distanceKm < 1 ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m` : `${analysisResult.distanceKm.toFixed(1)}km`
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                                    lineNumber: 269,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                            lineNumber: 267,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-col items-center",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "uppercase tracking-wider text-slate-400/90 text-[0.6rem] md:text-[0.65rem] font-medium",
                                                                    children: "Min. Clear."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                                    lineNumber: 276,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("font-bold text-xs md:text-sm", isStale ? "text-slate-400" : isClearBasedOnAnalysis ? "text-emerald-400" : "text-rose-400"),
                                                                    children: [
                                                                        actualMinClearance.toFixed(1),
                                                                        "m"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                                    lineNumber: 277,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                            lineNumber: 275,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                    lineNumber: 266,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 234,
                                            columnNumber: 17
                                        }, this),
                                        analysisResult && !isClearBasedOnAnalysis && analysisResult.minClearance !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center text-rose-300/80 text-[0.7rem] py-0.5",
                                            children: [
                                                "Add ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold",
                                                    children: [
                                                        deficit,
                                                        "m"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                    lineNumber: 291,
                                                    columnNumber: 19
                                                }, this),
                                                " to tower(s) for clearance."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 289,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex-1 min-h-0 p-0.5", analysisResult && isStale && "opacity-60 pointer-events-none"),
                                            children: analysisResult && !isActionPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$custom$2d$profile$2d$chart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                data: analysisResult.profile,
                                                pointAName: pointAName,
                                                pointBName: pointBName,
                                                isStale: isStale,
                                                totalDistanceKm: analysisResult.distanceKm,
                                                isActionPending: false,
                                                onTowerHeightChangeFromGraph: onTowerHeightChangeFromGraph
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                lineNumber: 301,
                                                columnNumber: 19
                                            }, this) : isActionPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-full flex items-center justify-center p-2 bg-muted/30 rounded-md",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-muted-foreground text-xs text-center",
                                                    children: "Loading analysis data..."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                lineNumber: 311,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AnalysisAction, {
                                                isActionPending: isActionPending,
                                                handleSubmit: handleSubmit,
                                                processSubmit: processSubmit
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                lineNumber: 315,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 296,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 231,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-shrink-0 w-full md:w-auto snap-start p-1 md:p-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SiteInputGroup, {
                                        id: "pointB",
                                        title: pointBName,
                                        control: control,
                                        register: register,
                                        clientFormErrors: clientFormErrors,
                                        serverFormErrors: serverFormErrors,
                                        getCombinedError: getCombinedError
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 325,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 324,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 217,
                            columnNumber: 12
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 216,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this),
            isPanelGloballyVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-1 md:hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    type: "button",
                    onClick: onToggleContentExpansion,
                    className: "p-1.5 rounded-full bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 hover:text-white transition-all",
                    "aria-label": isContentExpanded ? "Collapse Panel Content" : "Expand Panel Content",
                    children: isContentExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 347,
                        columnNumber: 38
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 347,
                        columnNumber: 76
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 341,
                    columnNumber: 14
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 340,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 191,
        columnNumber: 5
    }, this);
}
_s(BottomPanel, "ahycJPqJYSUfaU+EM+qwXRI61/8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"]
    ];
});
_c2 = BottomPanel;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "SiteInputGroup");
__turbopack_context__.k.register(_c1, "AnalysisAction");
__turbopack_context__.k.register(_c2, "BottomPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/fso/fresnel-settings-bar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>FresnelSettingsBar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
"use client";
;
;
;
;
;
function FresnelSettingsBar({ control }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-slate-800/60 backdrop-blur-sm p-2 border-b border-slate-700/50 print:hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-xs mx-auto flex items-center space-x-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                    className: "h-5 w-5 text-primary/80 flex-shrink-0"
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/fresnel-settings-bar.tsx",
                    lineNumber: 20,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-grow",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                            htmlFor: "globalClearanceThreshold",
                            className: "text-[0.7rem] uppercase tracking-wider text-slate-300/80 font-normal block mb-0.5",
                            children: "Min. Fresnel Clearance (m)"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/fresnel-settings-bar.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Controller"], {
                            name: "clearanceThreshold",
                            control: control,
                            render: ({ field, fieldState: { error } })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: "globalClearanceThreshold",
                                            type: "number",
                                            step: "any",
                                            ...field,
                                            onChange: (e)=>field.onChange(e.target.value),
                                            placeholder: "e.g., 10",
                                            className: "bg-slate-700/50 border-slate-600/70 focus:border-primary/70 text-slate-100/90 h-8 text-sm px-2 py-1 rounded-md focus:ring-1 focus:ring-primary/70 w-full"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/fresnel-settings-bar.tsx",
                                            lineNumber: 30,
                                            columnNumber: 17
                                        }, void 0),
                                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-destructive/90 mt-1",
                                            children: error.message
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/fresnel-settings-bar.tsx",
                                            lineNumber: 39,
                                            columnNumber: 27
                                        }, void 0)
                                    ]
                                }, void 0, true)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/fresnel-settings-bar.tsx",
                            lineNumber: 25,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/fresnel-settings-bar.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/fso/fresnel-settings-bar.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/fresnel-settings-bar.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c = FresnelSettingsBar;
var _c;
__turbopack_context__.k.register(_c, "FresnelSettingsBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/actions.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"600a7e0dd5b29d1c5bca51f9a0c7c14b2ce7a3a397":"performLosAnalysis"} */ __turbopack_context__.s({
    "performLosAnalysis": (()=>performLosAnalysis)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
;
var performLosAnalysis = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("600a7e0dd5b29d1c5bca51f9a0c7c14b2ce7a3a397", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "performLosAnalysis");
}}),
"[project]/src/app/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Home)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$interactive$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/interactive-map.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$bottom$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/bottom-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$fresnel$2d$settings$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/fresnel-settings-bar.tsx [app-client] (ecmascript)"); // New import
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
;
var _s = __turbopack_context__.k.signature();
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
;
;
;
;
const StationPointSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().min(1, "Name is required").max(50, "Name too long"),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().min(1, "Latitude is required").refine((val)=>!isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 90, "Must be -90 to 90"),
    lng: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().min(1, "Longitude is required").refine((val)=>!isNaN(parseFloat(val)) && Math.abs(parseFloat(val)) <= 180, "Must be -180 to 180"),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].number().min(0, "Min 0m").max(100, "Max 100m")
});
const PageAnalysisFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].object({
    pointA: StationPointSchema,
    pointB: StationPointSchema,
    clearanceThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().min(1, "Clearance is required").refine((val)=>!isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Must be >= 0")
});
const defaultFormStateValues = {
    pointA: {
        name: 'Site A',
        lat: '32.23085',
        lng: '76.144608',
        height: 20
    },
    pointB: {
        name: 'Site B',
        lat: '32.231875',
        lng: '76.151969',
        height: 58
    },
    clearanceThreshold: '10'
};
function pointsEqual(p1, p2, precision = 6) {
    if (!p1 || !p2) return false;
    const p1Lat = Number(p1.lat);
    const p1Lng = Number(p1.lng);
    const p2Lat = Number(p2.lat);
    const p2Lng = Number(p2.lng);
    if (isNaN(p1Lat) || isNaN(p1Lng) || isNaN(p2Lat) || isNaN(p2Lng)) return false;
    return p1Lat.toFixed(precision) === p2Lat.toFixed(precision) && p1Lng.toFixed(precision) === p2Lng.toFixed(precision);
}
function Home() {
    _s();
    const initialState = {
        error: "No analysis performed yet."
    };
    const [serverState, formAction, isActionPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["performLosAnalysis"], initialState);
    const [, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"])();
    const [analysisResult, setAnalysisResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [clientError, setClientError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [formErrors, setFormErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [isStale, setIsStale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // Panel hidden by default
    const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true); // Internal content expanded by default when panel opens
    const [hasFirstAnalysisCompleted, setHasFirstAnalysisCompleted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { register, handleSubmit, formState: { errors: clientFormErrors, isValid }, control, setValue, getValues } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["zodResolver"])(PageAnalysisFormSchema),
        defaultValues: defaultFormStateValues,
        mode: 'onChange'
    });
    const processSubmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[processSubmit]": (data)=>{
            if (isActionPending) return;
            console.log("[page.tsx] processSubmit called with data:", data);
            setAnalysisResult(null);
            setClientError(null);
            setFormErrors(undefined);
            setIsStale(false);
            const formData = new FormData();
            formData.append('pointA.name', data.pointA.name);
            formData.append('pointA.lat', data.pointA.lat);
            formData.append('pointA.lng', data.pointA.lng);
            formData.append('pointA.height', String(data.pointA.height));
            formData.append('pointB.name', data.pointB.name);
            formData.append('pointB.lat', data.pointB.lat);
            formData.append('pointB.lng', data.pointB.lng);
            formData.append('pointB.height', String(data.pointB.height));
            formData.append('clearanceThreshold', data.clearanceThreshold);
            startTransition({
                "Home.useCallback[processSubmit]": ()=>{
                    formAction(formData);
                }
            }["Home.useCallback[processSubmit]"]);
        }
    }["Home.useCallback[processSubmit]"], [
        isActionPending,
        formAction,
        startTransition
    ]); // Added dependencies
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (!serverState) return;
            if ('error' in serverState && serverState.error) {
                const errorToSet = serverState.error;
                // Suppress "No analysis performed yet." if we already have results or are loading new ones
                const suppressInitialMessage = errorToSet === "No analysis performed yet." && (analysisResult !== null || isActionPending);
                if (!suppressInitialMessage) {
                    setClientError(errorToSet);
                }
                if (serverState.fieldErrors) {
                    setFormErrors(serverState.fieldErrors);
                } else if (!suppressInitialMessage) {
                    // Clear form errors only if we are not suppressing the main error message
                    // and there are no new field errors.
                    setFormErrors(undefined);
                }
            } else if (!('error' in serverState)) {
                const resultDataFromServer = serverState;
                const currentFormValues = getValues();
                // Ensure point names are preserved from the form when setting analysis result
                const newAnalysisData = {
                    ...resultDataFromServer,
                    pointA: {
                        ...resultDataFromServer.pointA || {},
                        name: currentFormValues.pointA.name,
                        lat: parseFloat(currentFormValues.pointA.lat),
                        lng: parseFloat(currentFormValues.pointA.lng),
                        towerHeight: currentFormValues.pointA.height
                    },
                    pointB: {
                        ...resultDataFromServer.pointB || {},
                        name: currentFormValues.pointB.name,
                        lat: parseFloat(currentFormValues.pointB.lat),
                        lng: parseFloat(currentFormValues.pointB.lng),
                        towerHeight: currentFormValues.pointB.height
                    }
                };
                // Deep comparison to prevent unnecessary re-renders if data is identical
                if (JSON.stringify(analysisResult) !== JSON.stringify(newAnalysisData)) {
                    setAnalysisResult(newAnalysisData);
                }
                setClientError(null);
                setFormErrors(undefined);
                setIsStale(false);
                // If panel is not already open, open it on successful analysis
                if (newAnalysisData && !isAnalysisPanelGloballyOpen && !hasFirstAnalysisCompleted) {
                    setIsAnalysisPanelGloballyOpen(true);
                    setIsBottomPanelContentExpanded(true);
                    setHasFirstAnalysisCompleted(true);
                } else if (newAnalysisData && !hasFirstAnalysisCompleted) {
                    setHasFirstAnalysisCompleted(true); // Mark first analysis done even if panel was already open
                }
            }
        }
    }["Home.useEffect"], [
        serverState,
        getValues,
        isAnalysisPanelGloballyOpen,
        hasFirstAnalysisCompleted,
        analysisResult,
        isActionPending
    ]);
    const watchedPointA = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'pointA'
    });
    const watchedPointB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'pointB'
    });
    const watchedClearanceThreshold = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'clearanceThreshold'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (!analysisResult) {
                setIsStale(false);
                return;
            }
            const currentFormValues = getValues();
            // Ensure comparison is between numbers for lat/lng/height/clearance
            const formLatA = parseFloat(currentFormValues.pointA.lat);
            const formLngA = parseFloat(currentFormValues.pointA.lng);
            const formHeightA = currentFormValues.pointA.height;
            const formLatB = parseFloat(currentFormValues.pointB.lat);
            const formLngB = parseFloat(currentFormValues.pointB.lng);
            const formHeightB = currentFormValues.pointB.height;
            const formClearance = parseFloat(currentFormValues.clearanceThreshold);
            const formPointAForCompare = {
                lat: formLatA,
                lng: formLngA
            };
            const formPointBForCompare = {
                lat: formLatB,
                lng: formLngB
            };
            const analyzedPointA = analysisResult.pointA;
            const analyzedPointB = analysisResult.pointB;
            const pointsAEqualResult = pointsEqual(formPointAForCompare, analyzedPointA);
            const pointsBEqualResult = pointsEqual(formPointBForCompare, analyzedPointB);
            const heightAEqual = formHeightA === analyzedPointA?.towerHeight;
            const heightBEqual = formHeightB === analyzedPointB?.towerHeight;
            const clearanceEqual = formClearance === analysisResult.clearanceThresholdUsed;
            if (!pointsAEqualResult || !pointsBEqualResult || !heightAEqual || !heightBEqual || !clearanceEqual) {
                setIsStale(true);
            } else {
                setIsStale(false);
            }
        }
    }["Home.useEffect"], [
        watchedPointA,
        watchedPointB,
        watchedClearanceThreshold,
        analysisResult,
        getValues
    ]);
    const handleMarkerDragStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleMarkerDragStart]": ()=>{
            setAnalysisResult(null); // Clear previous results on drag start
            setClientError(null);
        }
    }["Home.useCallback[handleMarkerDragStart]"], []);
    const handleMarkerDragEndA = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleMarkerDragEndA]": (coords)=>{
            setValue('pointA.lat', coords.lat.toFixed(7), {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true
            });
            setValue('pointA.lng', coords.lng.toFixed(7), {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true
            });
            handleSubmit(processSubmit)();
        }
    }["Home.useCallback[handleMarkerDragEndA]"], [
        setValue,
        handleSubmit,
        processSubmit
    ]);
    const handleMarkerDragEndB = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleMarkerDragEndB]": (coords)=>{
            setValue('pointB.lat', coords.lat.toFixed(7), {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true
            });
            setValue('pointB.lng', coords.lng.toFixed(7), {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true
            });
            handleSubmit(processSubmit)();
        }
    }["Home.useCallback[handleMarkerDragEndB]"], [
        setValue,
        handleSubmit,
        processSubmit
    ]);
    const handleTowerHeightChangeFromGraph = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleTowerHeightChangeFromGraph]": (siteId, newHeight)=>{
            if (isActionPending) return;
            const clampedHeight = Math.max(0, Math.min(100, parseFloat(newHeight.toFixed(1))));
            setValue(siteId === 'pointA' ? 'pointA.height' : 'pointB.height', clampedHeight, {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true
            });
            // Trigger analysis immediately after height change from graph
            processSubmit(getValues());
        }
    }["Home.useCallback[handleTowerHeightChangeFromGraph]"], [
        setValue,
        isActionPending,
        getValues,
        processSubmit
    ]);
    const mapContainerHeightClass = isAnalysisPanelGloballyOpen ? 'h-[calc(100%_-_45vh_-_56px)]' : 'h-[calc(100%_-_56px)]'; // Adjusted for FresnelSettingsBar (approx 56px height)
    // Fallback to default values if watched values are invalid or empty
    const formPointAForMap = watchedPointA && !isNaN(parseFloat(watchedPointA.lat)) && !isNaN(parseFloat(watchedPointA.lng)) ? {
        lat: parseFloat(watchedPointA.lat),
        lng: parseFloat(watchedPointA.lng),
        name: watchedPointA.name
    } : {
        lat: parseFloat(defaultFormStateValues.pointA.lat),
        lng: parseFloat(defaultFormStateValues.pointA.lng),
        name: defaultFormStateValues.pointA.name
    };
    const formPointBForMap = watchedPointB && !isNaN(parseFloat(watchedPointB.lat)) && !isNaN(parseFloat(watchedPointB.lng)) ? {
        lat: parseFloat(watchedPointB.lat),
        lng: parseFloat(watchedPointB.lng),
        name: watchedPointB.name
    } : {
        lat: parseFloat(defaultFormStateValues.pointB.lat),
        lng: parseFloat(defaultFormStateValues.pointB.lng),
        name: defaultFormStateValues.pointB.name
    };
    const analyzedDataForMap = analysisResult ? {
        pointA: {
            lat: analysisResult.pointA.lat,
            lng: analysisResult.pointA.lng
        },
        pointB: {
            lat: analysisResult.pointB.lat,
            lng: analysisResult.pointB.lng
        },
        losPossible: analysisResult.losPossible
    } : null;
    const toggleGlobalPanelVisibility = ()=>{
        setIsAnalysisPanelGloballyOpen(!isAnalysisPanelGloballyOpen);
        if (!isAnalysisPanelGloballyOpen) {
            setIsBottomPanelContentExpanded(true); // Ensure its content is expanded
            if (!analysisResult && !isActionPending) {
                processSubmit(getValues());
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-1 flex flex-col overflow-hidden relative print:overflow-visible",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$fresnel$2d$settings$2d$bar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                control: control
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 271,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex-grow", mapContainerHeightClass, "transition-all duration-300 ease-in-out"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$interactive$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    pointA: formPointAForMap,
                    pointB: formPointBForMap,
                    analyzedData: analyzedDataForMap,
                    isStale: isStale,
                    isActionPending: isActionPending,
                    onMarkerDragStartA: handleMarkerDragStart,
                    onMarkerDragStartB: handleMarkerDragStart,
                    onMarkerDragEndA: handleMarkerDragEndA,
                    onMarkerDragEndB: handleMarkerDragEndB,
                    mapContainerClassName: "w-full h-full"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 274,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 273,
                columnNumber: 7
            }, this),
            !isAnalysisPanelGloballyOpen && !isActionPending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none print:hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    size: "lg",
                    className: "px-8 py-4 text-lg font-semibold shadow-xl bg-primary hover:bg-primary/90 pointer-events-auto ",
                    onClick: ()=>{
                        toggleGlobalPanelVisibility();
                    },
                    children: "Check OpticSpectra FSO Link Feasibility"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 290,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 289,
                columnNumber: 9
            }, this),
            clientError && clientError !== "No analysis performed yet." && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-2 print:hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                    className: "shadow-lg border-destructive bg-destructive/30 backdrop-blur-md text-destructive-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                            className: "py-2 px-4 flex-row items-center justify-between",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                className: "text-sm flex items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                                        className: "mr-2 h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 306,
                                        columnNumber: 74
                                    }, this),
                                    " Error"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 306,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 305,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "px-4 py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm",
                                    children: clientError
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 309,
                                    columnNumber: 25
                                }, this),
                                formErrors && Object.keys(formErrors).length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "list-disc list-inside mt-1 text-xs opacity-80",
                                    children: Object.entries(formErrors).map(([field, errors])=>errors?.map((error, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                children: `${field.replace('pointA.', 'A: ').replace('pointB.', 'B: ')}: ${error}`
                                            }, `${field}-${index}`, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 313,
                                                columnNumber: 63
                                            }, this)))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 311,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 308,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 304,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 303,
                columnNumber: 13
            }, this),
            isActionPending && (!analysisResult || analysisResult && clientError && clientError !== "No analysis performed yet.") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 print:hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "h-12 w-12 text-primary animate-spin mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 324,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-slate-200 text-lg font-medium",
                        children: "Loading Analysis Data..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 325,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 323,
                columnNumber: 14
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$bottom$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                analysisResult: analysisResult,
                isPanelGloballyVisible: isAnalysisPanelGloballyOpen,
                onToggleGlobalVisibility: toggleGlobalPanelVisibility,
                isContentExpanded: isBottomPanelContentExpanded,
                onToggleContentExpansion: ()=>setIsBottomPanelContentExpanded(!isBottomPanelContentExpanded),
                control: control,
                register: register,
                handleSubmit: handleSubmit,
                processSubmit: processSubmit,
                clientFormErrors: clientFormErrors,
                serverFormErrors: formErrors,
                isActionPending: isActionPending,
                getValues: getValues,
                setValue: setValue,
                isStale: isStale,
                onTowerHeightChangeFromGraph: handleTowerHeightChangeFromGraph
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 329,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 270,
        columnNumber: 5
    }, this);
}
_s(Home, "OlV6HH/bO7Ff2iPBiWqhWpZm2v4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useActionState"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransition"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_cf627928._.js.map