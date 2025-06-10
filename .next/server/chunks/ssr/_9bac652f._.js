module.exports = {

"[project]/src/lib/los-calculator.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "analyzeLOS": (()=>analyzeLOS),
    "calculateDistanceKm": (()=>calculateDistanceKm),
    "calculateFresnelZoneRadius": (()=>calculateFresnelZoneRadius),
    "getGoogleElevationData": (()=>getGoogleElevationData)
});
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_METERS = EARTH_RADIUS_KM * 1000;
async function getGoogleElevationData(pointA, pointB, samples) {
    const GOOGLE_ELEVATION_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const GOOGLE_ELEVATION_API_URL = 'https://maps.googleapis.com/maps/api/elevation/json';
    if (!GOOGLE_ELEVATION_API_KEY) {
        console.error("Google Elevation API key is not configured.");
        // This specific error message is checked in actions.ts, so keep it consistent
        throw new Error("Google Elevation API key is not configured");
    }
    const path = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
    const url = `${GOOGLE_ELEVATION_API_URL}?path=${path}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY}`;
    try {
        const response = await fetch(url, {
            next: {
                revalidate: 3600
            }
        }); // Cache for 1 hour
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (parseError) {
                errorData = {
                    message: 'Failed to parse error response from API.'
                };
            }
            console.error('Google Elevation API request failed:', response.status, response.statusText, errorData);
            // This specific error message is checked in actions.ts
            throw new Error(`Google Elevation API request failed: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        if (data.status !== 'OK') {
            console.error('Google Elevation API error:', data.status, data.error_message);
            // This specific error message is checked in actions.ts
            throw new Error(`Google Elevation API error: ${data.status}. ${data.error_message || 'No additional error message provided.'}`);
        }
        return data.results;
    } catch (error) {
        // Log the original error for server-side debugging
        console.error('Network error or other issue while trying to reach Google Elevation API:', error);
        // Re-throw with a consistent prefix for client-side handling, ensuring the original message is preserved if it's an Error instance
        if (error instanceof Error) {
            // This specific error message is checked in actions.ts
            throw new Error(`Network error while trying to reach Google Elevation API: ${error.message}`);
        }
        // This specific error message is checked in actions.ts
        throw new Error('Network error while trying to reach Google Elevation API. Unknown error type.');
    }
}
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
 */ function calculateEarthCurvatureDropMeters(totalPathDistanceKm1, distanceFromStartKm) {
    const totalPathDistanceM = totalPathDistanceKm1 * 1000;
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
        const curvatureDrop = calculateEarthCurvatureDropMeters(totalPathDistanceKm, distanceFromA_Km);
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
"[project]/src/app/actions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ [{"600a7e0dd5b29d1c5bca51f9a0c7c14b2ce7a3a397":"performLosAnalysis"},"",""] */ __turbopack_context__.s({
    "performLosAnalysis": (()=>performLosAnalysis)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/los-calculator.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
// Helper function to parse coordinate strings
// This can be moved to a shared utils file if used elsewhere server-side
const parseCoordinatesStringInternal = (coordsString)=>{
    if (!coordsString || typeof coordsString !== 'string') return null;
    const parts = coordsString.split(',').map((part)=>part.trim());
    if (parts.length !== 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
        return null;
    }
    return {
        lat,
        lng
    };
};
// Define Zod schema for server-side validation of FormData strings
const ServerActionPointSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, "Name is required.").max(50, "Name too long (max 50 chars)."),
    coordinates: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>parseCoordinatesStringInternal(val) !== null, {
        message: "Invalid coordinates. Use 'lat, lng' format (e.g., 20.5, 78.9). Lat: -90 to 90, Lng: -180 to 180."
    }),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>val.trim() !== "" && !isNaN(parseFloat(val)), {
        message: "Tower height must be a number."
    }).transform((val)=>parseFloat(val)).refine((val)=>val >= 0, {
        message: "Minimum tower height is 0m."
    }).refine((val)=>val <= 100, {
        message: "Maximum tower height is 100m."
    })
});
const ServerActionAnalysisSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    pointA: ServerActionPointSchema,
    pointB: ServerActionPointSchema,
    clearanceThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>val.trim() !== "" && !isNaN(parseFloat(val)), {
        message: "Clearance threshold must be a number."
    }).transform((val)=>parseFloat(val)).refine((val)=>val >= 0, {
        message: "Clearance threshold must be a non-negative number."
    })
});
async function performLosAnalysis(prevState, formData) {
    const rawFormData = {
        pointA: {
            name: String(formData.get('pointA.name') ?? ""),
            coordinates: String(formData.get('pointA.coordinates') ?? ""),
            height: String(formData.get('pointA.height') ?? "")
        },
        pointB: {
            name: String(formData.get('pointB.name') ?? ""),
            coordinates: String(formData.get('pointB.coordinates') ?? ""),
            height: String(formData.get('pointB.height') ?? "")
        },
        clearanceThreshold: String(formData.get('clearanceThreshold') ?? "")
    };
    const validationResult = ServerActionAnalysisSchema.safeParse(rawFormData);
    if (!validationResult.success) {
        const rawZodErrors = validationResult.error.flatten();
        let errorMessages = "Validation failed: ";
        // Form-level errors
        if (rawZodErrors.formErrors.length > 0) {
            errorMessages += rawZodErrors.formErrors.map(String).join('; ');
        }
        // Field-level errors
        const fieldErrorParts = [];
        // Iterate over pointA fields
        const pointAFieldErrors = rawZodErrors.fieldErrors['pointA'];
        if (typeof pointAFieldErrors === 'object' && pointAFieldErrors !== null) {
            for(const key in pointAFieldErrors){
                if (pointAFieldErrors[key]) {
                    fieldErrorParts.push(`Point A ${String(key)}: ${pointAFieldErrors[key].map(String).join(', ')}`);
                }
            }
        }
        // Iterate over pointB fields
        const pointBFieldErrors = rawZodErrors.fieldErrors['pointB'];
        if (typeof pointBFieldErrors === 'object' && pointBFieldErrors !== null) {
            for(const key in pointBFieldErrors){
                if (pointBFieldErrors[key]) {
                    fieldErrorParts.push(`Point B ${String(key)}: ${pointBFieldErrors[key].map(String).join(', ')}`);
                }
            }
        }
        // Clearance threshold error (if any, direct key)
        if (rawZodErrors.fieldErrors['clearanceThreshold']) {
            fieldErrorParts.push(`Clearance Threshold: ${rawZodErrors.fieldErrors['clearanceThreshold'].map(String).join(', ')}`);
        }
        if (fieldErrorParts.length > 0) {
            errorMessages += (errorMessages.endsWith(": ") ? "" : "; ") + fieldErrorParts.join('; ');
        }
        const finalErrorMessage = errorMessages.trim() === "Validation failed:" ? "Invalid input. Please check the form fields." : errorMessages;
        console.error("Server Action: Zod validation failed. Constructed Message:", finalErrorMessage, "Raw Zod Errors:", JSON.stringify(rawZodErrors));
        throw new Error(finalErrorMessage);
    }
    // validatedData now has heights and clearanceThreshold as numbers due to z.transform()
    // and coordinates as validated strings.
    const validatedData = validationResult.data;
    const parsedPointACoords = parseCoordinatesStringInternal(validatedData.pointA.coordinates); // Bang operator is safe due to refine
    const parsedPointBCoords = parseCoordinatesStringInternal(validatedData.pointB.coordinates); // Bang operator is safe due to refine
    const paramsForAnalysis = {
        pointA: {
            name: validatedData.pointA.name,
            lat: parsedPointACoords.lat,
            lng: parsedPointACoords.lng,
            towerHeight: validatedData.pointA.height
        },
        pointB: {
            name: validatedData.pointB.name,
            lat: parsedPointBCoords.lat,
            lng: parsedPointBCoords.lng,
            towerHeight: validatedData.pointB.height
        },
        clearanceThreshold: validatedData.clearanceThreshold
    };
    try {
        const elevationDataAPI = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getGoogleElevationData"])(paramsForAnalysis.pointA, paramsForAnalysis.pointB, 100);
        // analyzeLOS expects AnalysisParams which includes names from paramsForAnalysis
        const analysisOutcome = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["analyzeLOS"])(paramsForAnalysis, elevationDataAPI);
        const resultWithTimestamp = {
            ...analysisOutcome,
            id: `analysis_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`,
            timestamp: Date.now(),
            // Ensure names from validated data are consistently used in the result
            // analysisOutcome already contains pointA and pointB with their names from paramsForAnalysis
            pointA: analysisOutcome.pointA,
            pointB: analysisOutcome.pointB,
            message: `${analysisOutcome.message} Source: Google Elevation API.`
        };
        return resultWithTimestamp;
    } catch (err) {
        let clientErrorMessageString;
        if (err instanceof Error) {
            clientErrorMessageString = String(err.message); // Ensure message is string
            // Specific checks for Google API errors are good to keep for user clarity
            if (clientErrorMessageString.includes("Google Elevation API key is not configured")) {
                clientErrorMessageString = "Elevation service is not configured. Please check API key settings.";
            } else if (clientErrorMessageString.includes("Google Elevation API request failed") || clientErrorMessageString.includes("Google Elevation API error") || clientErrorMessageString.includes("Google Elevation API request timed out")) {
            // The message from los-calculator.ts is already quite descriptive, so just use it.
            } else if (clientErrorMessageString.includes("Network error while trying to reach Google Elevation API")) {
            // The message from los-calculator.ts is descriptive.
            }
        // No need for a generic catch-all for other Error instances if los-calculator is also hardened.
        } else {
            // Fallback for non-Error exceptions
            clientErrorMessageString = "An unexpected issue occurred during analysis. Please try again.";
        }
        // Log the original error type and message for server-side debugging
        console.error("performLosAnalysis - Inner error caught. Client-facing message:", clientErrorMessageString, "Original error:", String(err));
        throw new Error(clientErrorMessageString); // Always throw a standard Error with a string message
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    performLosAnalysis
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(performLosAnalysis, "600a7e0dd5b29d1c5bca51f9a0c7c14b2ce7a3a397", null);
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
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
    "600a7e0dd5b29d1c5bca51f9a0c7c14b2ce7a3a397": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["performLosAnalysis"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "600a7e0dd5b29d1c5bca51f9a0c7c14b2ce7a3a397": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["600a7e0dd5b29d1c5bca51f9a0c7c14b2ce7a3a397"])
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

//# sourceMappingURL=_9bac652f._.js.map