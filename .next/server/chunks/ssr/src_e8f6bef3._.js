module.exports = {

"[project]/src/components/ui/skeleton.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Skeleton": (()=>Skeleton)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Skeleton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("animate-pulse rounded-md bg-muted", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/skeleton.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
;
}}),
"[project]/src/lib/los-calculator.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
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
"[project]/src/components/fso/interactive-map.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>InteractiveMap)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-google-maps/api/dist/esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-ssr] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/skeleton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/los-calculator.ts [app-ssr] (ecmascript)"); // Import distance calculation
"use client";
;
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
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [scriptLoaded, setScriptLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [scriptError, setScriptError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mapCenter, setMapCenter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultCenter);
    const [mapZoom, setMapZoom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultZoom);
    const [currentDistance, setCurrentDistance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [distanceLabelPosition, setDistanceLabelPosition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const onLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((mapInstance)=>{
        mapRef.current = mapInstance;
        mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
        if (!formPointA && !formPointB) {
            mapInstance.setCenter(defaultCenter);
            mapInstance.setZoom(defaultZoom);
        }
    }, [
        formPointA,
        formPointB
    ]);
    const onUnmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        mapRef.current = null;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (mapRef.current && formPointA && formPointB) {
            const bounds = new google.maps.LatLngBounds();
            if (formPointA.lat && formPointA.lng) bounds.extend(new google.maps.LatLng(formPointA.lat, formPointA.lng));
            if (formPointB.lat && formPointB.lng) bounds.extend(new google.maps.LatLng(formPointB.lat, formPointB.lng));
            if (!bounds.isEmpty()) {
                mapRef.current.fitBounds(bounds);
                const listener = google.maps.event.addListenerOnce(mapRef.current, 'idle', ()=>{
                    if (mapRef.current?.getZoom() && mapRef.current.getZoom() > 17) {
                        mapRef.current.setZoom(17);
                    } else if (mapRef.current?.getZoom() && mapRef.current.getZoom() < 3) {
                        mapRef.current.setZoom(3); // Prevent zooming out too far
                    }
                });
                return ()=>{
                    if (listener) google.maps.event.removeListener(listener);
                };
            }
        } else if (mapRef.current && (!formPointA || !formPointB)) {
            setMapCenter(defaultCenter);
            setMapZoom(defaultZoom);
            mapRef.current.setCenter(defaultCenter);
            mapRef.current.setZoom(defaultZoom);
        }
    }, [
        formPointA,
        formPointB
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
            const p1 = {
                lat: Number(formPointA.lat),
                lng: Number(formPointA.lng)
            };
            const p2 = {
                lat: Number(formPointB.lat),
                lng: Number(formPointB.lng)
            };
            const distKm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateDistanceKm"])(p1, p2);
            setCurrentDistance(distKm < 1 ? `${(distKm * 1000).toFixed(1)} m` : `${distKm.toFixed(2)} km`);
            setDistanceLabelPosition(getMidPoint(p1, p2));
        } else {
            setCurrentDistance(null);
            setDistanceLabelPosition(null);
        }
    }, [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${mapContainerClassName} bg-slate-700`,
        children: [
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LoadScript"], {
                googleMapsApiKey: GOOGLE_MAPS_API_KEY,
                onLoad: ()=>setScriptLoaded(true),
                onError: ()=>{
                    console.error("Google Maps script could not be loaded. Check API Key (Maps JavaScript API), billing, and restrictions in Google Cloud Console.");
                    setScriptError(true);
                    setScriptLoaded(true);
                },
                loadingElement: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                    className: "w-full h-full rounded-none bg-slate-600"
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 167,
                    columnNumber: 25
                }, void 0),
                children: scriptError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-full flex flex-col items-center justify-center bg-muted/50 p-4 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                            className: "w-12 h-12 text-destructive mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 171,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-destructive font-semibold",
                            children: "Could not load Google Maps."
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 172,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                }, this) : scriptLoaded && typeof google !== 'undefined' && google.maps ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleMap"], {
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
                        formPointA && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Marker"], {
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
                        formPointB && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Marker"], {
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
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Polyline"], {
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
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Polyline"], {
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
                        distanceLabelPosition && currentDistance && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OverlayView"], {
                            position: distanceLabelPosition,
                            mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                            getPixelPositionOffset: (offsetWidth, offsetHeight)=>({
                                    x: -(offsetWidth / 2),
                                    y: -offsetHeight - 10
                                }),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
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
}}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Home)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$interactive$2d$map$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/interactive-map.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function Home() {
    // --- ALL STATE AND LOGIC COMMENTED OUT FOR EXTREME SIMPLIFICATION ---
    // const initialState: AnalysisResult | { error: string; fieldErrors?: any } = { error: "No analysis performed yet." };
    // const [serverState, formAction, isActionPending] = useActionState(performLosAnalysis, initialState);
    // const [, startTransition] = useTransition();
    // const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    // const [clientError, setClientError] = useState<string | null>(null);
    // const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined> | undefined>(undefined);
    // const [isStale, setIsStale] = useState(false);
    // const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = useState(false);
    // const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = useState(true);
    /*
  const { register, handleSubmit, formState: { errors: clientFormErrors, isValid }, control, setValue, getValues } = useForm<PageAnalysisFormValues>({
    resolver: zodResolver(PageAnalysisFormSchema),
    defaultValues: defaultFormStateValues,
    mode: 'onChange',
  });
  */ /*
  const processSubmit = useCallback((data: PageAnalysisFormValues) => {
    // if (isActionPending) return;
    console.log("[page.tsx] processSubmit called with data:", data);

    // setAnalysisResult(null); 
    // setClientError(null);
    // setFormErrors(undefined);
    // setIsStale(false);

    const formData = new FormData();
    // ... (append form data) ...
    // startTransition(() => {
    //   formAction(formData);
    // });
  }, [isActionPending, formAction, startTransition]);
  */ // const watchedPointA = useWatch({ control, name: 'pointA' });
    // const watchedPointB = useWatch({ control, name: 'pointB' });
    // const watchedClearanceThreshold = useWatch({ control, name: 'clearanceThreshold' });
    /*
  useEffect(() => {
    // if (!serverState) return;
    // ... (serverState processing logic) ...
  }, [serverState, getValues, isAnalysisPanelGloballyOpen, analysisResult, isActionPending ]);
  */ /*
  useEffect(() => {
    // if (!analysisResult) {
    //   setIsStale(false);
    //   return;
    // }
    // ... (isStale calculation logic) ...
  }, [watchedPointA, watchedPointB, watchedClearanceThreshold, analysisResult, getValues]);
  */ // const handleMarkerDragStart = useCallback(() => {
    //   setAnalysisResult(null); 
    //   setClientError(null);
    // }, []);
    // const handleMarkerDragEndA = useCallback((coords: PointCoordinates) => {
    //   setValue('pointA.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    //   setValue('pointA.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    //   handleSubmit(processSubmit)(); 
    // }, [setValue, handleSubmit, processSubmit]); 
    // const handleMarkerDragEndB = useCallback((coords: PointCoordinates) => {
    //   setValue('pointB.lat', coords.lat.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    //   setValue('pointB.lng', coords.lng.toFixed(7), { shouldValidate: true, shouldTouch: true, shouldDirty: true });
    //   handleSubmit(processSubmit)();
    // }, [setValue, handleSubmit, processSubmit]); 
    // const handleTowerHeightChangeFromGraph = useCallback((siteId: 'pointA' | 'pointB', newHeight: number) => {
    //   // if (isActionPending) return;
    //   const clampedHeight = Math.max(0, Math.min(100, parseFloat(newHeight.toFixed(1))));
    //   // setValue(siteId === 'pointA' ? 'pointA.height' : 'pointB.height', clampedHeight, {
    //   //   shouldValidate: true,
    //   //   shouldTouch: true, 
    //   //   shouldDirty: true,
    //   // });
    //   // processSubmit(getValues());
    // }, [setValue, isActionPending, getValues, processSubmit]);
    // const mapContainerHeightClass = isAnalysisPanelGloballyOpen ? 'h-[calc(100%_-_45vh)]' : 'h-full';
    /*
  const formPointAForMap = watchedPointA && !isNaN(parseFloat(watchedPointA.lat)) && !isNaN(parseFloat(watchedPointA.lng))
    ? { lat: parseFloat(watchedPointA.lat), lng: parseFloat(watchedPointA.lng), name: watchedPointA.name }
    : { lat: parseFloat(defaultFormStateValues.pointA.lat), lng: parseFloat(defaultFormStateValues.pointA.lng), name: defaultFormStateValues.pointA.name };
  
  const formPointBForMap = watchedPointB && !isNaN(parseFloat(watchedPointB.lat)) && !isNaN(parseFloat(watchedPointB.lng))
    ? { lat: parseFloat(watchedPointB.lat), lng: parseFloat(watchedPointB.lng), name: watchedPointB.name }
    : { lat: parseFloat(defaultFormStateValues.pointB.lat), lng: parseFloat(defaultFormStateValues.pointB.lng), name: defaultFormStateValues.pointB.name };

  const analyzedDataForMap = analysisResult ? {
    pointA: { lat: analysisResult.pointA.lat, lng: analysisResult.pointA.lng },
    pointB: { lat: analysisResult.pointB.lat, lng: analysisResult.pointB.lng },
    losPossible: analysisResult.losPossible
  } : null;
  */ // const toggleGlobalPanelVisibility = () => {
    // setIsAnalysisPanelGloballyOpen(prev => !prev);
    // if (!isAnalysisPanelGloballyOpen) { 
    // setIsBottomPanelContentExpanded(true); 
    // }
    // };
    /*
  const handleStartAnalysisClick = () => {
    // setIsAnalysisPanelGloballyOpen(true);
    // setIsBottomPanelContentExpanded(true);
    // if (!analysisResult && !isActionPending && isValid) {
        // processSubmit(getValues());
    // } else if (!analysisResult && !isActionPending && !isValid) {
        // handleSubmit(processSubmit)(); 
    // }
  };
  */ console.log("[page.tsx] Rendering EXTREMELY simplified Home component.");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-1 flex flex-col overflow-hidden relative",
        children: [
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `h-full transition-all duration-300 ease-in-out`,
                children: [
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$interactive$2d$map$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        // Pass NO props other than the class name to test its most basic rendering
                        mapContainerClassName: "w-full h-full"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 190,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=src_e8f6bef3._.js.map