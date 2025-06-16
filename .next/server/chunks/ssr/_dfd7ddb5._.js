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
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
;
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "6091a7f5eb670c7a62c05633ebf85658287acaec18": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getElevationProfileForPairAction"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "6091a7f5eb670c7a62c05633ebf85658287acaec18": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["6091a7f5eb670c7a62c05633ebf85658287acaec18"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$bulk$2d$los$2d$analyzer$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$bulk$2d$los$2d$analyzer$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/bulk-los-analyzer/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/bulk-los-analyzer/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
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

//# sourceMappingURL=_dfd7ddb5._.js.map