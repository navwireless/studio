module.exports = {

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
"[externals]/util [external] (util, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
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
"[externals]/events [external] (events, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}}),
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
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
;
;
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "6091a7f5eb670c7a62c05633ebf85658287acaec18": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getElevationProfileForPairAction"]),
    "7e9053ee96b2a8ff08a5535b919d94d4648359fba6": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["performFiberPathAnalysisAction"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "6091a7f5eb670c7a62c05633ebf85658287acaec18": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["6091a7f5eb670c7a62c05633ebf85658287acaec18"]),
    "7e9053ee96b2a8ff08a5535b919d94d4648359fba6": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["7e9053ee96b2a8ff08a5535b919d94d4648359fba6"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/tools/fiberPathCalculator/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
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

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__942d8182._.js.map