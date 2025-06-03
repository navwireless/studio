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
const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ"; // Ensure this is managed securely in a real app
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};
const defaultZoom = 5;
const STYLES = {
    mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/70 rounded-md shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap w-max"
};
// Helper to get position for OverlayView
const getPixelPositionOffset = (width, height)=>({
        x: -(width / 2),
        y: -(height + 10)
    });
const getCustomMarkerIcon = (label)=>{
    if ("object" !== 'undefined' && window.google && window.google.maps) {
        return {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: '#FFEE58',
            fillOpacity: 1,
            strokeColor: '#424242',
            strokeWeight: 1,
            rotation: 0,
            scale: 6.5,
            anchor: new window.google.maps.Point(0, 2.5),
            labelOrigin: new window.google.maps.Point(0, -2.5)
        };
    }
    return undefined; // Fallback if google.maps is not available
};
function InteractiveMap({ pointA: formPointA, pointB: formPointB, onMapClick, onMarkerDrag, mapContainerClassName = "w-full h-full", analysisResult, isStale }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isMapInstanceLoaded, setIsMapInstanceLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentMapClickTarget, setCurrentMapClickTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('pointA');
    const markerIconA = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "InteractiveMap.useMemo[markerIconA]": ()=>getCustomMarkerIcon("A")
    }["InteractiveMap.useMemo[markerIconA]"], [
        isMapInstanceLoaded
    ]);
    const markerIconB = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "InteractiveMap.useMemo[markerIconB]": ()=>getCustomMarkerIcon("B")
    }["InteractiveMap.useMemo[markerIconB]"], [
        isMapInstanceLoaded
    ]);
    const handleActualMapLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[handleActualMapLoad]": (mapInstance)=>{
            mapRef.current = mapInstance;
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
                    gestureHandling: 'cooperative',
                    clickableIcons: false
                });
            }
            setIsMapInstanceLoaded(true);
        }
    }["InteractiveMap.useCallback[handleActualMapLoad]"], []);
    const handleMapUnmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[handleMapUnmount]": ()=>{
            mapRef.current = null;
            setIsMapInstanceLoaded(false);
        }
    }["InteractiveMap.useCallback[handleMapUnmount]"], []);
    const handleInternalMapClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[handleInternalMapClick]": (event)=>{
            if (onMapClick) {
                onMapClick(event, currentMapClickTarget);
                setCurrentMapClickTarget({
                    "InteractiveMap.useCallback[handleInternalMapClick]": (prev)=>prev === 'pointA' ? 'pointB' : 'pointA'
                }["InteractiveMap.useCallback[handleInternalMapClick]"]);
            }
        }
    }["InteractiveMap.useCallback[handleInternalMapClick]"], [
        onMapClick,
        currentMapClickTarget
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InteractiveMap.useEffect": ()=>{
            if (isMapInstanceLoaded && mapRef.current && formPointA && formPointB && formPointA.lat && formPointA.lng && formPointB.lat && formPointB.lng) {
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(new window.google.maps.LatLng(formPointA.lat, formPointA.lng));
                bounds.extend(new window.google.maps.LatLng(formPointB.lat, formPointB.lng));
                if (!bounds.isEmpty()) {
                    mapRef.current.fitBounds(bounds, 50);
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
            } else if (isMapInstanceLoaded && mapRef.current && (!formPointA?.lat || !formPointB?.lat)) {
                mapRef.current.setCenter(defaultCenter);
                mapRef.current.setZoom(defaultZoom);
            }
        }
    }["InteractiveMap.useEffect"], [
        formPointA,
        formPointB,
        isMapInstanceLoaded
    ]);
    const polylineColor = ()=>{
        if (isStale) return '#60A5FA'; // Blue for stale data that needs re-analysis
        if (!analysisResult) return '#A9A9A9'; // DarkGray for no analysis yet or pending state
        return analysisResult.losPossible ? '#4CAF50' : '#F44336'; // Green for LOS, Red for blocked
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${mapContainerClassName}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoadScript"], {
            googleMapsApiKey: GOOGLE_MAPS_API_KEY,
            loadingElement: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-12 h-12 animate-spin mb-3"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 144,
                        columnNumber: 13
                    }, void 0),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium",
                        children: "Initializing Map Service..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 145,
                        columnNumber: 13
                    }, void 0)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 143,
                columnNumber: 11
            }, void 0),
            onError: (error)=>{
                console.error("[InteractiveMap] LoadScript.onError:", error);
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleMap"], {
                mapContainerStyle: {
                    width: '100%',
                    height: '100%'
                },
                center: defaultCenter,
                zoom: defaultZoom,
                onLoad: handleActualMapLoad,
                onUnmount: handleMapUnmount,
                onClick: handleInternalMapClick,
                options: {},
                children: [
                    formPointA && formPointA.lat && formPointA.lng && markerIconA && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                                position: {
                                    lat: formPointA.lat,
                                    lng: formPointA.lng
                                },
                                draggable: true,
                                onDragEnd: (e)=>onMarkerDrag && onMarkerDrag(e, 'pointA'),
                                icon: markerIconA,
                                label: {
                                    text: "A",
                                    color: "#333333",
                                    fontWeight: "bold",
                                    fontSize: "10px"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 166,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                                position: {
                                    lat: formPointA.lat,
                                    lng: formPointA.lng
                                },
                                mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                                getPixelPositionOffset: getPixelPositionOffset,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: STYLES.mapMarkerLabel,
                                    children: formPointA.name || "Site A"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                                    lineNumber: 178,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 173,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    formPointB && formPointB.lat && formPointB.lng && markerIconB && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                                position: {
                                    lat: formPointB.lat,
                                    lng: formPointB.lng
                                },
                                draggable: true,
                                onDragEnd: (e)=>onMarkerDrag && onMarkerDrag(e, 'pointB'),
                                icon: markerIconB,
                                label: {
                                    text: "B",
                                    color: "#333333",
                                    fontWeight: "bold",
                                    fontSize: "10px"
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 187,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                                position: {
                                    lat: formPointB.lat,
                                    lng: formPointB.lng
                                },
                                mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                                getPixelPositionOffset: getPixelPositionOffset,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: STYLES.mapMarkerLabel,
                                    children: formPointB.name || "Site B"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                                    lineNumber: 199,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 194,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true),
                    formPointA && formPointA.lat && formPointA.lng && formPointB && formPointB.lat && formPointB.lng && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
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
                            strokeColor: polylineColor(),
                            strokeOpacity: isStale ? 0.8 : 0.9,
                            strokeWeight: isStale ? 3.5 : 4,
                            geodesic: true,
                            zIndex: 1
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 207,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 152,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/interactive-map.tsx",
            lineNumber: 140,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/interactive-map.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
_s(InteractiveMap, "VdSTPhacJ5uQF416S61vHfw3MEA=");
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