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
"use client";
;
;
;
;
;
const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ"; // IMPORTANT: Manage API keys securely
const defaultCenter = {
    lat: 32.2313625,
    lng: 76.1482885
};
const defaultZoom = 15;
// Helper function to compare points
function pointsEqual(p1, p2, precision = 6) {
    if (!p1 || !p2) return false;
    const p1Lat = Number(p1.lat);
    const p1Lng = Number(p1.lng);
    const p2Lat = Number(p2.lat);
    const p2Lng = Number(p2.lng);
    if (isNaN(p1Lat) || isNaN(p1Lng) || isNaN(p2Lat) || isNaN(p2Lng)) return false;
    return p1Lat.toFixed(precision) === p2Lat.toFixed(precision) && p1Lng.toFixed(precision) === p2Lng.toFixed(precision);
}
function InteractiveMap({ pointA: formPointA, pointB: formPointB, analyzedData, // isStale, // Not directly used for line logic anymore, comparison is internal
isActionPending, onMarkerDragStartA, onMarkerDragStartB, onMarkerDragEndA, onMarkerDragEndB, mapContainerClassName = "w-full h-full" }) {
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [scriptLoaded, setScriptLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [scriptError, setScriptError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const onLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((mapInstance)=>{
        mapRef.current = mapInstance;
        mapInstance.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    }, []);
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
                        mapRef.current.setZoom(3);
                    }
                });
                return ()=>{
                    if (listener) google.maps.event.removeListener(listener);
                };
            } else {
                mapRef.current.setCenter(defaultCenter);
                mapRef.current.setZoom(defaultZoom);
            }
        } else if (mapRef.current) {
            mapRef.current.setCenter(defaultCenter);
            mapRef.current.setZoom(defaultZoom);
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
        className: mapContainerClassName,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LoadScript"], {
            googleMapsApiKey: GOOGLE_MAPS_API_KEY,
            onLoad: ()=>setScriptLoaded(true),
            onError: ()=>{
                console.error("Google Maps script could not be loaded. Check API Key (Maps JavaScript API), billing, and restrictions in Google Cloud Console.");
                setScriptError(true);
                setScriptLoaded(true);
            },
            loadingElement: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                className: "w-full h-full rounded-none"
            }, void 0, false, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 135,
                columnNumber: 25
            }, void 0),
            children: scriptError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full h-full flex flex-col items-center justify-center bg-muted/50 p-4 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                        className: "w-12 h-12 text-destructive mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 139,
                        columnNumber: 15
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-destructive font-semibold",
                        children: "Could not load Google Maps."
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 140,
                        columnNumber: 15
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: 'Check internet connection and API key configuration. Ensure "Maps JavaScript API" is enabled and billing is active. See browser console for details.'
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 141,
                        columnNumber: 15
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 138,
                columnNumber: 11
            }, this) : scriptLoaded && typeof google !== 'undefined' && google.maps ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleMap"], {
                mapContainerStyle: {
                    width: '100%',
                    height: '100%'
                },
                center: formPointA && formPointB ? undefined : defaultCenter,
                zoom: formPointA && formPointB ? undefined : defaultZoom,
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
                        lineNumber: 166,
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
                        lineNumber: 176,
                        columnNumber: 15
                    }, this),
                    (()=>{
                        // Show analyzed LOS line ONLY if current markers match last analysis
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
                                    strokeColor: analyzedData.losPossible ? "#22d3ee" : "hsl(var(--destructive))",
                                    strokeOpacity: 0.9,
                                    strokeWeight: 3,
                                    clickable: false,
                                    zIndex: 2 // Analyzed line on top
                                }
                            }, `analyzed-${analyzedData.pointA.lat}-${analyzedData.pointA.lng}-${analyzedData.pointB.lat}-${analyzedData.pointB.lng}`, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 194,
                                columnNumber: 19
                            }, this);
                        }
                        // Otherwise, show preview (dashed) line if both form markers exist
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
                                    strokeColor: "#6b7280",
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
                                            repeat: '10px' // Creates a dashed line effect
                                        }
                                    ]
                                }
                            }, `preview-${formPointA.lat}-${formPointA.lng}-${formPointB.lat}-${formPointB.lng}`, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 213,
                                columnNumber: 19
                            }, this);
                        }
                        return null;
                    })()
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 146,
                columnNumber: 11
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Skeleton"], {
                className: "w-full h-full rounded-none"
            }, void 0, false, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 239,
                columnNumber: 12
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/interactive-map.tsx",
            lineNumber: 127,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/interactive-map.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/components/fso/interactive-map.tsx [app-ssr] (ecmascript, next/dynamic entry)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/fso/interactive-map.tsx [app-ssr] (ecmascript)"));
}}),

};

//# sourceMappingURL=src_components_2de14ba0._.js.map