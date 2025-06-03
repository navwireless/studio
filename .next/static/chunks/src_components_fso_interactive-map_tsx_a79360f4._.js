(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_components_fso_interactive-map_tsx_a79360f4._.js", {

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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
// import { Skeleton } from '../ui/skeleton'; // Not used in this simplified path
// import { calculateDistanceKm } from '@/lib/los-calculator'; // Not used yet in simplified path
const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ";
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};
const defaultZoom = 5; // Zoom level to show most of India
function InteractiveMap({ pointA: formPointA, pointB: formPointB, mapContainerClassName = "w-full h-full" }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isMapInstanceLoaded, setIsMapInstanceLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    console.log("[InteractiveMap] Rendering component.");
    const handleActualMapLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[handleActualMapLoad]": (mapInstance)=>{
            console.log("[InteractiveMap] GoogleMap onLoad callback fired. Map instance:", mapInstance);
            mapRef.current = mapInstance;
            // Check if google object is available before using its properties
            if (window.google && window.google.maps) {
                mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                mapInstance.setOptions({
                    streetViewControl: true,
                    mapTypeControl: true,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.TOP_RIGHT
                    },
                    fullscreenControl: true,
                    zoomControl: true,
                    gestureHandling: 'cooperative'
                });
            } else {
                console.error("[InteractiveMap] google.maps object not available in handleActualMapLoad");
            }
            setIsMapInstanceLoaded(true);
        }
    }["InteractiveMap.useCallback[handleActualMapLoad]"], []);
    const handleMapUnmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[handleMapUnmount]": ()=>{
            console.log("[InteractiveMap] GoogleMap onUnmount callback fired.");
            mapRef.current = null;
            setIsMapInstanceLoaded(false);
        }
    }["InteractiveMap.useCallback[handleMapUnmount]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InteractiveMap.useEffect": ()=>{
            if (isMapInstanceLoaded && mapRef.current && formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(new window.google.maps.LatLng(formPointA.lat, formPointA.lng));
                bounds.extend(new window.google.maps.LatLng(formPointB.lat, formPointB.lng));
                if (!bounds.isEmpty()) {
                    console.log("[InteractiveMap] Fitting bounds to markers.");
                    mapRef.current.fitBounds(bounds);
                    const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', {
                        "InteractiveMap.useEffect.listener": ()=>{
                            if (mapRef.current?.getZoom() && mapRef.current.getZoom() > 17) {
                                mapRef.current.setZoom(17);
                            } else if (mapRef.current?.getZoom() && mapRef.current.getZoom() < 3) {
                                mapRef.current.setZoom(3);
                            }
                        }
                    }["InteractiveMap.useEffect.listener"]);
                    return ({
                        "InteractiveMap.useEffect": ()=>{
                            if (listener && window.google && window.google.maps) {
                                window.google.maps.event.removeListener(listener);
                            }
                        }
                    })["InteractiveMap.useEffect"];
                }
            } else if (isMapInstanceLoaded && mapRef.current && (!formPointA || !formPointB)) {
                console.log("[InteractiveMap] mapRef and instance loaded, but no valid points. Ensuring default view.");
                mapRef.current.setCenter(defaultCenter);
                mapRef.current.setZoom(defaultZoom);
            }
        }
    }["InteractiveMap.useEffect"], [
        formPointA,
        formPointB,
        isMapInstanceLoaded
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${mapContainerClassName} bg-lime-500/20`,
        children: [
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoadScript"], {
                googleMapsApiKey: GOOGLE_MAPS_API_KEY,
                loadingElement: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-full flex flex-col items-center justify-center bg-yellow-400/30 text-yellow-700",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "w-16 h-16 animate-spin mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 100,
                            columnNumber: 13
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-lg font-semibold",
                            children: "Map Service Initializing..."
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 101,
                            columnNumber: 13
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 99,
                    columnNumber: 11
                }, void 0),
                onError: (error)=>{
                    console.error("[InteractiveMap] CRITICAL LoadScript.onError:", error);
                },
                onLoad: ()=>{
                    console.log("[InteractiveMap] LoadScript.onLoad: Google Maps API script should be loaded.");
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleMap"], {
                    mapContainerStyle: {
                        width: '100%',
                        height: '100%',
                        border: '5px solid magenta' // DEBUG BORDER for GoogleMap container
                    },
                    center: defaultCenter,
                    zoom: defaultZoom,
                    onLoad: handleActualMapLoad,
                    onUnmount: handleMapUnmount,
                    // Options that do not depend on google.maps.* can remain here if needed,
                    // but it's cleaner to set most map-specific options in onLoad.
                    // For this fix, we move all problematic options to handleActualMapLoad.
                    options: {
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/interactive-map.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_s(InteractiveMap, "vgDh0H4DxIFE3K5pUlizUuClrwc=");
_c = InteractiveMap;
var _c;
__turbopack_context__.k.register(_c, "InteractiveMap");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/fso/interactive-map.tsx [app-client] (ecmascript, next/dynamic entry)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/fso/interactive-map.tsx [app-client] (ecmascript)"));
}}),
}]);

//# sourceMappingURL=src_components_fso_interactive-map_tsx_a79360f4._.js.map