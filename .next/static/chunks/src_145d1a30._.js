(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_145d1a30._.js", {

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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GoogleMapsLoaderProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GoogleMapsLoaderProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const STYLES = {
    mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/70 rounded-md shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap w-max",
    distanceOverlayLabel: "p-1.5 text-sm font-bold text-white bg-primary/80 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap"
};
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};
const defaultZoom = 5;
const getPixelPositionOffset = (width, height)=>({
        x: -(width / 2),
        y: -(height + 10)
    });
const getDistanceOverlayPositionOffset = (width, height)=>({
        x: -(width / 2),
        y: -(height / 2) - 15
    });
const getCustomMarkerIcon = (label, isMapApiLoaded)=>{
    if (isMapApiLoaded && "object" !== 'undefined' && window.google && window.google.maps) {
        return {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: '#FFEE58',
            fillOpacity: 1,
            strokeColor: '#424242',
            strokeWeight: 1.5,
            rotation: 0,
            scale: 7,
            anchor: new window.google.maps.Point(0, 2.5),
            labelOrigin: new window.google.maps.Point(0, 0.5)
        };
    }
    return undefined;
};
// Polyline Styles
const LOS_POLYLINE_COLORS = {
    stale: '#60A5FA',
    feasible: '#4CAF50',
    notFeasible: '#F44336',
    default: '#A9A9A9'
};
const FIBER_POLYLINE_STYLES = {
    offset: {
        strokeColor: '#FFEB3B',
        strokeOpacity: 0.9,
        strokeWeight: 3,
        zIndex: 2
    },
    roadRoute: {
        strokeColor: '#00BCD4',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        zIndex: 2
    }
};
function InteractiveMapInner({ pointA: formPointA, pointB: formPointB, onMapClick, onMarkerDrag, analysisResult, isStale, currentDistanceKm, fiberPathResult }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [currentMapClickTarget, setCurrentMapClickTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('pointA');
    const { isLoaded: isMapApiLoaded } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GoogleMapsLoaderProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGoogleMapsLoader"])();
    const markerIconA = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "InteractiveMapInner.useMemo[markerIconA]": ()=>getCustomMarkerIcon("A", isMapApiLoaded)
    }["InteractiveMapInner.useMemo[markerIconA]"], [
        isMapApiLoaded
    ]);
    const markerIconB = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useMemo({
        "InteractiveMapInner.useMemo[markerIconB]": ()=>getCustomMarkerIcon("B", isMapApiLoaded)
    }["InteractiveMapInner.useMemo[markerIconB]"], [
        isMapApiLoaded
    ]);
    const handleActualMapLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMapInner.useCallback[handleActualMapLoad]": (mapInstance)=>{
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
        }
    }["InteractiveMapInner.useCallback[handleActualMapLoad]"], []);
    const handleMapUnmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMapInner.useCallback[handleMapUnmount]": ()=>{
            mapRef.current = null;
        }
    }["InteractiveMapInner.useCallback[handleMapUnmount]"], []);
    const handleInternalMapClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMapInner.useCallback[handleInternalMapClick]": (event)=>{
            if (onMapClick) {
                onMapClick(event, currentMapClickTarget);
                setCurrentMapClickTarget({
                    "InteractiveMapInner.useCallback[handleInternalMapClick]": (prev)=>prev === 'pointA' ? 'pointB' : 'pointA'
                }["InteractiveMapInner.useCallback[handleInternalMapClick]"]);
            }
        }
    }["InteractiveMapInner.useCallback[handleInternalMapClick]"], [
        onMapClick,
        currentMapClickTarget
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InteractiveMapInner.useEffect": ()=>{
            if (isMapApiLoaded && mapRef.current && formPointA && formPointB && typeof formPointA.lat === 'number' && typeof formPointA.lng === 'number' && typeof formPointB.lat === 'number' && typeof formPointB.lng === 'number') {
                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(new window.google.maps.LatLng(formPointA.lat, formPointA.lng));
                bounds.extend(new window.google.maps.LatLng(formPointB.lat, formPointB.lng));
                // If fiber path exists, extend bounds to include its points
                if (fiberPathResult && fiberPathResult.status === 'success' && fiberPathResult.segments) {
                    fiberPathResult.segments.forEach({
                        "InteractiveMapInner.useEffect": (segment)=>{
                            if (segment.pathPolyline && google.maps.geometry?.encoding) {
                                const decodedPath = google.maps.geometry.encoding.decodePath(segment.pathPolyline);
                                decodedPath.forEach({
                                    "InteractiveMapInner.useEffect": (p)=>bounds.extend(p)
                                }["InteractiveMapInner.useEffect"]);
                            } else {
                                bounds.extend(new window.google.maps.LatLng(segment.startPoint.lat, segment.startPoint.lng));
                                bounds.extend(new window.google.maps.LatLng(segment.endPoint.lat, segment.endPoint.lng));
                            }
                        }
                    }["InteractiveMapInner.useEffect"]);
                }
                if (!bounds.isEmpty()) {
                    mapRef.current.fitBounds(bounds, 75);
                    const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', {
                        "InteractiveMapInner.useEffect.listener": ()=>{
                            if (mapRef.current?.getZoom() && mapRef.current.getZoom() > 17) {
                                mapRef.current.setZoom(17);
                            } else if (mapRef.current?.getZoom() && mapRef.current.getZoom() < 3) {
                                mapRef.current.setZoom(3);
                            }
                        }
                    }["InteractiveMapInner.useEffect.listener"]);
                    return ({
                        "InteractiveMapInner.useEffect": ()=>{
                            if (listener && window.google && window.google.maps) {
                                window.google.maps.event.removeListener(listener);
                            }
                        }
                    })["InteractiveMapInner.useEffect"];
                }
            } else if (isMapApiLoaded && mapRef.current && (!formPointA?.lat || !formPointB?.lat)) {
                mapRef.current.setCenter(defaultCenter);
                mapRef.current.setZoom(defaultZoom);
            }
        }
    }["InteractiveMapInner.useEffect"], [
        formPointA,
        formPointB,
        isMapApiLoaded,
        fiberPathResult
    ]);
    const losPolylineColor = ()=>{
        if (isStale) return LOS_POLYLINE_COLORS.stale;
        if (!analysisResult) return LOS_POLYLINE_COLORS.default;
        return analysisResult.losPossible ? LOS_POLYLINE_COLORS.feasible : LOS_POLYLINE_COLORS.notFeasible;
    };
    const pALat = typeof formPointA?.lat === 'number' ? formPointA.lat : undefined;
    const pALng = typeof formPointA?.lng === 'number' ? formPointA.lng : undefined;
    const pBLat = typeof formPointB?.lat === 'number' ? formPointB.lat : undefined;
    const pBLng = typeof formPointB?.lng === 'number' ? formPointB.lng : undefined;
    const midPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined ? {
        lat: (pALat + pBLat) / 2,
        lng: (pALng + pBLng) / 2
    } : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleMap"], {
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
            formPointA && pALat !== undefined && pALng !== undefined && markerIconA && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                        position: {
                            lat: pALat,
                            lng: pALng
                        },
                        draggable: true,
                        onDragEnd: (e)=>onMarkerDrag && onMarkerDrag(e, 'pointA'),
                        icon: markerIconA,
                        label: {
                            text: "A",
                            color: "#333333",
                            fontWeight: "bold",
                            fontSize: "11px"
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                        position: {
                            lat: pALat,
                            lng: pALng
                        },
                        mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                        getPixelPositionOffset: getPixelPositionOffset,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: STYLES.mapMarkerLabel,
                            children: formPointA.name || "Site A"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 216,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 211,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            formPointB && pBLat !== undefined && pBLng !== undefined && markerIconB && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                        position: {
                            lat: pBLat,
                            lng: pBLng
                        },
                        draggable: true,
                        onDragEnd: (e)=>onMarkerDrag && onMarkerDrag(e, 'pointB'),
                        icon: markerIconB,
                        label: {
                            text: "B",
                            color: "#333333",
                            fontWeight: "bold",
                            fontSize: "11px"
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 225,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                        position: {
                            lat: pBLat,
                            lng: pBLng
                        },
                        mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                        getPixelPositionOffset: getPixelPositionOffset,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: STYLES.mapMarkerLabel,
                            children: formPointB.name || "Site B"
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                            lineNumber: 237,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 232,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                path: [
                    {
                        lat: pALat,
                        lng: pALng
                    },
                    {
                        lat: pBLat,
                        lng: pBLng
                    }
                ],
                options: {
                    strokeColor: losPolylineColor(),
                    strokeOpacity: isStale ? 0.8 : 0.9,
                    strokeWeight: isStale ? 3.5 : 4,
                    geodesic: true,
                    zIndex: 1
                }
            }, void 0, false, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 246,
                columnNumber: 9
            }, this),
            isMapApiLoaded && fiberPathResult && fiberPathResult.status === 'success' && fiberPathResult.segments && fiberPathResult.segments.length > 0 && fiberPathResult.segments.map((segment, index)=>{
                let path = [];
                let options = {};
                if (segment.type === 'offset_a' || segment.type === 'offset_b') {
                    path = [
                        {
                            lat: segment.startPoint.lat,
                            lng: segment.startPoint.lng
                        },
                        {
                            lat: segment.endPoint.lat,
                            lng: segment.endPoint.lng
                        }
                    ];
                    options = FIBER_POLYLINE_STYLES.offset;
                } else if (segment.type === 'road_route' && segment.pathPolyline) {
                    if (google.maps.geometry && google.maps.geometry.encoding) {
                        path = google.maps.geometry.encoding.decodePath(segment.pathPolyline).map((p)=>({
                                lat: p.lat(),
                                lng: p.lng()
                            }));
                    } else {
                        console.warn("Google Maps geometry library not loaded, cannot decode road_route polyline.");
                        return null;
                    }
                    options = FIBER_POLYLINE_STYLES.roadRoute;
                } else {
                    return null; // Skip if segment type is unknown or data missing
                }
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                    path: path,
                    options: options
                }, `fiber-segment-${index}`, false, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 285,
                    columnNumber: 18
                }, this);
            }),
            midPoint && currentDistanceKm !== null && currentDistanceKm !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                position: midPoint,
                mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                getPixelPositionOffset: getDistanceOverlayPositionOffset,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: STYLES.distanceOverlayLabel,
                    children: currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)}m` : `${currentDistanceKm.toFixed(1)}km`
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                    lineNumber: 296,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 291,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/interactive-map.tsx",
        lineNumber: 190,
        columnNumber: 5
    }, this);
}
_s(InteractiveMapInner, "YzancbIMG7C4GjjGsEGFjCdD95k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GoogleMapsLoaderProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGoogleMapsLoader"]
    ];
});
_c = InteractiveMapInner;
function InteractiveMap({ mapContainerClassName = "w-full h-full", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(mapContainerClassName),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GoogleMapsLoaderProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleMapsScriptGuard"], {
            loadingMessage: "Initializing Main Map...",
            errorMessage: "Error loading Main Map.",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(InteractiveMapInner, {
                ...props
            }, void 0, false, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 312,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/interactive-map.tsx",
            lineNumber: 308,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/interactive-map.tsx",
        lineNumber: 307,
        columnNumber: 5
    }, this);
}
_c1 = InteractiveMap;
var _c, _c1;
__turbopack_context__.k.register(_c, "InteractiveMapInner");
__turbopack_context__.k.register(_c1, "InteractiveMap");
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
"[project]/src/app/actions.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"6032618b8418ac76277e7b9b725912dd40e39f206e":"performLosAnalysis","606e059f8f40dd4b377c51875d12e3221ca87a227e":"generateSingleAnalysisPdfReportAction"} */ __turbopack_context__.s({
    "generateSingleAnalysisPdfReportAction": (()=>generateSingleAnalysisPdfReportAction),
    "performLosAnalysis": (()=>performLosAnalysis)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
;
var performLosAnalysis = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("6032618b8418ac76277e7b9b725912dd40e39f206e", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "performLosAnalysis");
var generateSingleAnalysisPdfReportAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("606e059f8f40dd4b377c51875d12e3221ca87a227e", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "generateSingleAnalysisPdfReportAction");
}}),
"[project]/src/lib/form-schema.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AnalysisFormSchema": (()=>AnalysisFormSchema),
    "PointInputSchema": (()=>PointInputSchema),
    "defaultFormStateValues": (()=>defaultFormStateValues)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-client] (ecmascript)");
;
const PointInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().min(1, "Name is required").max(50, "Name too long"),
    lat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>{
        const num = parseFloat(val);
        return !isNaN(num) && num >= -90 && num <= 90;
    }, "Latitude must be between -90 and 90"),
    lng: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>{
        const num = parseFloat(val);
        return !isNaN(num) && num >= -180 && num <= 180;
    }, "Longitude must be between -180 and 180"),
    height: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].number({
        required_error: "Tower height is required",
        invalid_type_error: "Tower height must be a number"
    }).min(0, "Minimum tower height is 0m").max(100, "Maximum tower height is 100m")
});
const AnalysisFormSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].object({
    pointA: PointInputSchema,
    pointB: PointInputSchema,
    clearanceThreshold: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["z"].string().refine((val)=>{
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
    }, "Clearance threshold must be a non-negative number")
});
const defaultFormStateValues = {
    pointA: {
        name: 'Site A',
        lat: '',
        lng: '',
        height: 20
    },
    pointB: {
        name: 'Site B',
        lat: '',
        lng: '',
        height: 20
    },
    clearanceThreshold: '10'
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/layout/app-header.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>AppHeader)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-client] (ecmascript) <export default as History>"); // Added ListChecks for Bulk Analysis
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list-checks.js [app-client] (ecmascript) <export default as ListChecks>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
"use client";
;
;
;
;
;
function AppHeader({ onToggleHistory, onClearMap, isHistoryPanelSupported = false, currentPage }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "bg-transparent px-2 py-1 h-12 flex items-center justify-between hover:bg-slate-900/10 transition-all duration-200 z-50 relative print:hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        "aria-label": "Home",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            src: "https://storage.googleapis.com/project-fabrica-chat-agent-test-assets/images/ZepPjV2n7N_nav_wireless_logo.png",
                            alt: "Nav Wireless Technologies Pvt. Ltd. Logo",
                            width: 100,
                            height: 24,
                            className: "object-contain cursor-pointer",
                            "data-ai-hint": "company logo"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/app-header.tsx",
                            lineNumber: 27,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/app-header.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-base font-medium tracking-wider text-slate-100/90 hidden sm:block",
                        children: "LiFi Link Pro"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/app-header.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/app-header.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex items-center gap-1 sm:gap-2",
                children: [
                    currentPage !== 'home' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        passHref: true,
                        legacyBehavior: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            size: "sm",
                            "aria-label": "Go to Single Link Analysis",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                    className: "h-5 w-5 sm:mr-1 text-muted-foreground hover:text-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/app-header.tsx",
                                    lineNumber: 44,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "hidden sm:inline",
                                    children: "Single"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/app-header.tsx",
                                    lineNumber: 45,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/layout/app-header.tsx",
                            lineNumber: 43,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/app-header.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this),
                    currentPage !== 'bulk' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/bulk-los-analyzer",
                        passHref: true,
                        legacyBehavior: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "ghost",
                            size: "sm",
                            "aria-label": "Go to Bulk LOS Analyzer",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2d$checks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ListChecks$3e$__["ListChecks"], {
                                    className: "h-5 w-5 sm:mr-1 text-muted-foreground hover:text-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/app-header.tsx",
                                    lineNumber: 52,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "hidden sm:inline",
                                    children: "Bulk"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/layout/app-header.tsx",
                                    lineNumber: 53,
                                    columnNumber: 16
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/layout/app-header.tsx",
                            lineNumber: 51,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/app-header.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this),
                    onClearMap && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "icon",
                        onClick: onClearMap,
                        "aria-label": "Clear Map and Form",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                            className: "h-5 w-5 text-muted-foreground hover:text-foreground"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/app-header.tsx",
                            lineNumber: 59,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/app-header.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this),
                    isHistoryPanelSupported && onToggleHistory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "ghost",
                        size: "icon",
                        onClick: onToggleHistory,
                        "aria-label": "Toggle History Panel",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                            className: "h-5 w-5 text-muted-foreground hover:text-foreground"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/app-header.tsx",
                            lineNumber: 64,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/app-header.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/app-header.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/app-header.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = AppHeader;
var _c;
__turbopack_context__.k.register(_c, "AppHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/sheet.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Sheet": (()=>Sheet),
    "SheetClose": (()=>SheetClose),
    "SheetContent": (()=>SheetContent),
    "SheetDescription": (()=>SheetDescription),
    "SheetFooter": (()=>SheetFooter),
    "SheetHeader": (()=>SheetHeader),
    "SheetOverlay": (()=>SheetOverlay),
    "SheetPortal": (()=>SheetPortal),
    "SheetTitle": (()=>SheetTitle),
    "SheetTrigger": (()=>SheetTrigger)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
const Sheet = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const SheetTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const SheetClose = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"];
const SheetPortal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"];
const SheetOverlay = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
        ...props,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/src/components/ui/sheet.tsx",
        lineNumber: 22,
        columnNumber: 3
    }, this));
_c = SheetOverlay;
SheetOverlay.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"].displayName;
const sheetVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500", {
    variants: {
        side: {
            top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
            bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
            right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
        }
    },
    defaultVariants: {
        side: "right"
    }
});
const SheetContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c1 = ({ side = "right", className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SheetPortal, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SheetOverlay, {}, void 0, false, {
                fileName: "[project]/src/components/ui/sheet.tsx",
                lineNumber: 61,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
                ref: ref,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(sheetVariants({
                    side
                }), className),
                ...props,
                children: [
                    children,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
                        className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/sheet.tsx",
                                lineNumber: 69,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/sheet.tsx",
                                lineNumber: 70,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/sheet.tsx",
                        lineNumber: 68,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/sheet.tsx",
                lineNumber: 62,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/sheet.tsx",
        lineNumber: 60,
        columnNumber: 3
    }, this));
_c2 = SheetContent;
SheetContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const SheetHeader = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-2 text-center sm:text-left", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/sheet.tsx",
        lineNumber: 81,
        columnNumber: 3
    }, this);
_c3 = SheetHeader;
SheetHeader.displayName = "SheetHeader";
const SheetFooter = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/sheet.tsx",
        lineNumber: 95,
        columnNumber: 3
    }, this);
_c4 = SheetFooter;
SheetFooter.displayName = "SheetFooter";
const SheetTitle = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c5 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg font-semibold text-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/sheet.tsx",
        lineNumber: 109,
        columnNumber: 3
    }, this));
_c6 = SheetTitle;
SheetTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"].displayName;
const SheetDescription = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c7 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/sheet.tsx",
        lineNumber: 121,
        columnNumber: 3
    }, this));
_c8 = SheetDescription;
SheetDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "SheetOverlay");
__turbopack_context__.k.register(_c1, "SheetContent$React.forwardRef");
__turbopack_context__.k.register(_c2, "SheetContent");
__turbopack_context__.k.register(_c3, "SheetHeader");
__turbopack_context__.k.register(_c4, "SheetFooter");
__turbopack_context__.k.register(_c5, "SheetTitle$React.forwardRef");
__turbopack_context__.k.register(_c6, "SheetTitle");
__turbopack_context__.k.register(_c7, "SheetDescription$React.forwardRef");
__turbopack_context__.k.register(_c8, "SheetDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/scroll-area.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "ScrollArea": (()=>ScrollArea),
    "ScrollBar": (()=>ScrollBar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-scroll-area/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const ScrollArea = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative overflow-hidden", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                className: "h-full w-full rounded-[inherit]",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 17,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScrollBar, {}, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 20,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Corner"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/scroll-area.tsx",
                lineNumber: 21,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/scroll-area.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, this));
_c1 = ScrollArea;
ScrollArea.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
const ScrollBar = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, orientation = "vertical", ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollAreaScrollbar"], {
        ref: ref,
        orientation: orientation,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex touch-none select-none transition-colors", orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollAreaThumb"], {
            className: "relative flex-1 rounded-full bg-border"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/scroll-area.tsx",
            lineNumber: 43,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/scroll-area.tsx",
        lineNumber: 30,
        columnNumber: 3
    }, this));
_c2 = ScrollBar;
ScrollBar.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$scroll$2d$area$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollAreaScrollbar"].displayName;
;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ScrollArea$React.forwardRef");
__turbopack_context__.k.register(_c1, "ScrollArea");
__turbopack_context__.k.register(_c2, "ScrollBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/badge.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Badge": (()=>Badge),
    "badgeVariants": (()=>badgeVariants)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            outline: "text-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
function Badge({ className, variant, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/badge.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/layout/history-panel.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>HistoryPanel)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/sheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/scroll-area.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-client] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$formatDistanceStrict$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/formatDistanceStrict.mjs [app-client] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
function HistoryPanel({ historyList, onLoadHistoryItem, onClearHistory, isOpen, onToggle }) {
    const sortedHistory = [
        ...historyList
    ].sort((a, b)=>b.timestamp - a.timestamp);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sheet"], {
        open: isOpen,
        onOpenChange: onToggle,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetContent"], {
            className: "w-[350px] sm:w-[400px] flex flex-col p-0",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetHeader"], {
                    className: "p-4 border-b",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetTitle"], {
                        className: "flex items-center text-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                className: "mr-2 h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/history-panel.tsx",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this),
                            "Analysis History"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/history-panel.tsx",
                        lineNumber: 32,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/history-panel.tsx",
                    lineNumber: 31,
                    columnNumber: 9
                }, this),
                sortedHistory.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex flex-col items-center justify-center text-center p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("maximize", {
                            className: "h-16 w-16 text-muted-foreground mb-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/history-panel.tsx",
                            lineNumber: 39,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground text-sm",
                            children: "No analyses recorded yet."
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/history-panel.tsx",
                            lineNumber: 40,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-muted-foreground mt-1",
                            children: "Complete an analysis to see it here."
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/history-panel.tsx",
                            lineNumber: 41,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/layout/history-panel.tsx",
                    lineNumber: 38,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$scroll$2d$area$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollArea"], {
                    className: "flex-1 overflow-y-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 space-y-3",
                        children: sortedHistory.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "bg-card/80 hover:shadow-md transition-shadow",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                        className: "p-3",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between items-start",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                                            className: "text-sm font-semibold",
                                                            children: [
                                                                item.pointA.name || 'Site A',
                                                                " - ",
                                                                item.pointB.name || 'Site B'
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/layout/history-panel.tsx",
                                                            lineNumber: 51,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardDescription"], {
                                                            className: "text-xs text-muted-foreground mt-0.5",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$formatDistanceStrict$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDistanceStrict"])(new Date(item.timestamp), new Date(), {
                                                                addSuffix: true
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/layout/history-panel.tsx",
                                                            lineNumber: 54,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/layout/history-panel.tsx",
                                                    lineNumber: 50,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: item.losPossible ? "default" : "destructive",
                                                    className: cn(item.losPossible ? "bg-los-success text-los-success-foreground" : "bg-los-failure text-los-failure-foreground", "text-xs px-2 py-0.5"),
                                                    children: [
                                                        item.losPossible ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                                            className: "mr-1 h-3 w-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/layout/history-panel.tsx",
                                                            lineNumber: 64,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                                                            className: "mr-1 h-3 w-3"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/layout/history-panel.tsx",
                                                            lineNumber: 65,
                                                            columnNumber: 27
                                                        }, this),
                                                        item.losPossible ? 'LOS Possible' : 'LOS Blocked'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/layout/history-panel.tsx",
                                                    lineNumber: 58,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/layout/history-panel.tsx",
                                            lineNumber: 49,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/history-panel.tsx",
                                        lineNumber: 48,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-3 text-xs space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-muted-foreground",
                                                        children: "Distance:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/history-panel.tsx",
                                                        lineNumber: 71,
                                                        columnNumber: 24
                                                    }, this),
                                                    " ",
                                                    item.distanceKm,
                                                    " km"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/history-panel.tsx",
                                                lineNumber: 71,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-muted-foreground",
                                                        children: "Req. Clearance:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/history-panel.tsx",
                                                        lineNumber: 72,
                                                        columnNumber: 24
                                                    }, this),
                                                    " ",
                                                    item.clearanceThresholdUsed,
                                                    " m"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/history-panel.tsx",
                                                lineNumber: 72,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-medium text-muted-foreground",
                                                        children: "Min. Actual Clearance:"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/layout/history-panel.tsx",
                                                        lineNumber: 73,
                                                        columnNumber: 24
                                                    }, this),
                                                    " ",
                                                    item.minClearance?.toFixed(1) ?? 'N/A',
                                                    " m"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/layout/history-panel.tsx",
                                                lineNumber: 73,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/layout/history-panel.tsx",
                                        lineNumber: 70,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardFooter"], {
                                        className: "p-3 border-t",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            size: "sm",
                                            className: "w-full text-xs",
                                            onClick: ()=>{
                                                onLoadHistoryItem(item.id);
                                                onToggle(); // Close panel after loading
                                            },
                                            children: "Load Analysis"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/history-panel.tsx",
                                            lineNumber: 76,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/history-panel.tsx",
                                        lineNumber: 75,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, item.id, true, {
                                fileName: "[project]/src/components/layout/history-panel.tsx",
                                lineNumber: 47,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/history-panel.tsx",
                        lineNumber: 45,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/history-panel.tsx",
                    lineNumber: 44,
                    columnNumber: 11
                }, this),
                sortedHistory.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-t",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "destructive",
                        className: "w-full",
                        onClick: onClearHistory,
                        children: "Clear All History"
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/history-panel.tsx",
                        lineNumber: 90,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/history-panel.tsx",
                    lineNumber: 89,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/layout/history-panel.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/layout/history-panel.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_c = HistoryPanel;
// Helper function to cn class names - ensure this is available or define it
function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}
var _c;
__turbopack_context__.k.register(_c, "HistoryPanel");
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
        onChange(Math.round(value[0])); // Ensure slider output is rounded
    };
    const handleInputChange = (event)=>{
        const rawValue = event.target.value;
        if (rawValue === "") {
            // Allow temporarily empty input, parent form validation will handle empty required field.
            // Or, set to min if that's preferred on empty.
            // For now, let parent validation catch it if empty is not allowed by schema.
            // If schema expects a number, this needs to be handled carefully.
            // onChange(min); // Or don't call onChange if empty string is typed.
            // Let's try to pass NaN or a placeholder that indicates "empty" if possible
            // For now, simplest is to revert to min or let validation handle.
            // For controlled number input, it's tricky. Let's pass parseFloat which becomes NaN.
            onChange(parseFloat(rawValue)); // This might become NaN
            return;
        }
        let newValue = parseFloat(rawValue);
        if (!isNaN(newValue)) {
            onChange(newValue); // Pass the float, rounding is done on blur or by chart.
        }
    };
    const validateAndSetHeight = (event)=>{
        let numValue = parseFloat(event.target.value);
        if (isNaN(numValue)) {
            numValue = min; // default to min if invalid or empty on blur
        }
        numValue = Math.round(numValue); // Round on blur
        if (numValue < min) numValue = min;
        if (numValue > max) numValue = max;
        onChange(numValue);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-0.5",
        children: [
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
                        lineNumber: 67,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[0.7rem] font-medium text-primary/80",
                        children: [
                            Number.isFinite(height) ? Math.round(height) : min,
                            "m"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fso/tower-height-control.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    " "
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/tower-height-control.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                        id: `height-input-${idSuffix}`,
                        type: "number",
                        value: Number.isFinite(height) ? height.toString() : "",
                        onChange: handleInputChange,
                        onBlur: validateAndSetHeight,
                        min: min,
                        max: max,
                        step: step,
                        className: "w-12 bg-transparent border-b border-white/20 focus:border-white/50 text-slate-100/90 text-xs h-6 px-1 py-0.5 rounded-none focus:ring-0"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/tower-height-control.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$slider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slider"], {
                        id: `height-slider-${idSuffix}`,
                        value: [
                            Number.isFinite(height) ? height : min
                        ],
                        onValueChange: handleSliderChange,
                        min: min,
                        max: max,
                        step: step,
                        className: "flex-1",
                        "aria-labelledby": `label-${idSuffix}-height`
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/tower-height-control.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/tower-height-control.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/tower-height-control.tsx",
        lineNumber: 65,
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
// Adjusted Padding for more chart space
const PADDING_BASE = {
    top: 30,
    right: 20,
    bottom: 30,
    left: 45
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
const TOOLTIP_BG_COLOR = 'hsla(222, 40%, 15%, 0.9)'; // Slightly lighter than default popover
const TOOLTIP_TEXT_COLOR = 'hsl(210, 40%, 95%)';
const TOOLTIP_BORDER_COLOR = 'hsl(217, 33%, 35%)';
const MIN_TOWER_HEIGHT = 0;
const MAX_TOWER_HEIGHT = 100;
const TOWER_HANDLE_RADIUS_VISUAL = 6;
const TOWER_HANDLE_CLICK_RADIUS = 10;
const HORIZONTAL_PADDING_PERCENTAGE = 0.05; // Profile uses 90% of width
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
                requestAnimationFrame(drawChart);
                return;
            }
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            const PADDING = PADDING_BASE;
            const chartWidth = rect.width - PADDING.left - PADDING.right;
            const chartHeight = rect.height - PADDING.top - PADDING.bottom;
            const xOffsetPx = chartWidth * HORIZONTAL_PADDING_PERCENTAGE;
            const effectiveChartWidthPx = chartWidth * (1 - 2 * HORIZONTAL_PADDING_PERCENTAGE);
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
            minY -= yDataRange * 0.15; // Add some padding to Y-axis
            maxY += yDataRange * 0.15;
            if (maxY === minY) {
                maxY += 10;
                minY -= 10;
            } // Avoid division by zero if all elevations are same
            if (maxY < minY) [maxY, minY] = [
                minY,
                maxY
            ]; // Ensure minY < maxY
            const maxXKmActual = totalDistanceKm;
            const getX = {
                "CustomProfileChart.useCallback[drawChart].getX": (distanceKm)=>xOffsetPx + distanceKm / maxXKmActual * effectiveChartWidthPx
            }["CustomProfileChart.useCallback[drawChart].getX"];
            const getY = {
                "CustomProfileChart.useCallback[drawChart].getY": (elevation)=>chartHeight - (elevation - minY) / (maxY - minY) * chartHeight
            }["CustomProfileChart.useCallback[drawChart].getY"];
            const getElevationFromY = {
                "CustomProfileChart.useCallback[drawChart].getElevationFromY": (pixelY_ChartArea)=>minY + (chartHeight - pixelY_ChartArea) / chartHeight * (maxY - minY)
            }["CustomProfileChart.useCallback[drawChart].getElevationFromY"];
            const getKmFromX = {
                "CustomProfileChart.useCallback[drawChart].getKmFromX": (pixelX_ChartArea_relative_to_padding_left)=>{
                    const effectivePx = pixelX_ChartArea_relative_to_padding_left - xOffsetPx;
                    if (effectiveChartWidthPx === 0) return 0;
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
                const distKm = i / numXTicks * maxXKmActual;
                const xPx = getX(distKm);
                ctx.beginPath();
                ctx.moveTo(xPx, 0);
                ctx.lineTo(xPx, chartHeight);
                ctx.stroke();
                ctx.fillText((distKm * 1000).toFixed(0) + "m", xPx, chartHeight + 8);
            }
            // Draw Terrain Area
            ctx.beginPath();
            ctx.moveTo(getX(data[0].distance), getY(data[0].terrainElevation));
            data.forEach({
                "CustomProfileChart.useCallback[drawChart]": (p)=>ctx.lineTo(getX(p.distance), getY(p.terrainElevation))
            }["CustomProfileChart.useCallback[drawChart]"]);
            ctx.lineTo(getX(data[data.length - 1].distance), chartHeight); // Close area to bottom
            ctx.lineTo(getX(data[0].distance), chartHeight); // Close area to bottom
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
            // Determine LOS line Y positions, considering live drag
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
            // Draw LOS Line
            ctx.beginPath();
            ctx.moveTo(xA_px_ChartArea, yLosA_px_ChartArea);
            ctx.lineTo(xB_px_ChartArea, yLosB_px_ChartArea);
            ctx.strokeStyle = LOS_LINE_COLOR;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Display Aerial Distance
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
            // Draw Obstruction Dots
            // Ensure maxXKmActual and effectiveChartWidthPx are positive to avoid issues
            if (data.length > 1 && maxXKmActual > 0 && effectiveChartWidthPx > 0) {
                for(let px_on_effective_width = 0; px_on_effective_width <= effectiveChartWidthPx; px_on_effective_width++){
                    const currentX_on_chart_area = xOffsetPx + px_on_effective_width;
                    // Calculate currentKm based on the pixel's position within the effective drawing width
                    const currentKm = px_on_effective_width / effectiveChartWidthPx * maxXKmActual;
                    // Calculate LOS Y position at currentX_on_chart_area
                    const losSlope = xB_px_ChartArea - xA_px_ChartArea === 0 ? 0 : (yLosB_px_ChartArea - yLosA_px_ChartArea) / (xB_px_ChartArea - xA_px_ChartArea);
                    const los_y_at_currentX = yLosA_px_ChartArea + losSlope * (currentX_on_chart_area - xA_px_ChartArea);
                    // Interpolate terrain elevation at currentKm
                    let terrain_elevation_at_currentKm = data[0].terrainElevation; // Default to first point
                    if (data.length > 1) {
                        // Find segment for currentKm
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
                                break; // Found the segment
                            } else if (currentKm > data[data.length - 1].distance && j === data.length - 2) {
                                terrain_elevation_at_currentKm = data[data.length - 1].terrainElevation;
                            }
                        }
                    } else {
                        terrain_elevation_at_currentKm = data[0].terrainElevation;
                    }
                    const terrain_y_at_currentX = getY(terrain_elevation_at_currentKm);
                    // Check for obstruction (LOS line Y is >= Terrain line Y, since Y increases downwards)
                    // Add a small tolerance (e.g., 1 pixel) to catch near-touches
                    if (los_y_at_currentX >= terrain_y_at_currentX - 1) {
                        ctx.beginPath();
                        ctx.arc(currentX_on_chart_area, los_y_at_currentX, 2.5, 0, 2 * Math.PI); // Draw dot on the LOS line
                        ctx.fillStyle = OBSTRUCTION_DOT_COLOR;
                        ctx.fill();
                    }
                }
            }
            // Draw Towers & Handles
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
            // Display live tower height during drag
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
            // Draw Hover Guides & Tooltip
            if (hoverData && !isInteractingByDrag) {
                const hxPx_Canvas = hoverData.xPx;
                const hyPxLos_Canvas = hoverData.yPx;
                const hxPx_ChartArea = hxPx_Canvas - PADDING.left;
                // Vertical hover line
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
                // Dot on LOS line at hover point
                const hyPxLos_ChartArea = hyPxLos_Canvas - PADDING.top;
                ctx.beginPath();
                ctx.arc(hxPx_ChartArea, hyPxLos_ChartArea, 4, 0, 2 * Math.PI);
                ctx.fillStyle = HOVER_DOT_COLOR;
                ctx.fill();
                ctx.strokeStyle = TOOLTIP_BG_COLOR;
                ctx.lineWidth = 1.5;
                ctx.stroke(); // Border for hover dot
            }
            // Restore transform before drawing tooltip (which uses canvas coordinates)
            ctx.setTransform(originalTransform);
            // Draw Tooltip (uses original canvas coordinates with mousePosition)
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
                const tooltipHeight = lines.length * lineHeight + 2 * tooltipPadding - (lineHeight - 10); // Adjust for line spacing
                const cornerRadius = 4;
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
    // Effect for initial draw and resize
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (!canvas) return;
            // Mouse move for tooltips
            const handleMouseMoveForTooltip = {
                "CustomProfileChart.useEffect.handleMouseMoveForTooltip": (event)=>{
                    if (isInteractingByDrag || !chartMetricsRef.current || !data || data.length < 2) {
                        if (hoverData) setHoverData(null); // Clear hover data if dragging or no chart metrics
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
                    // Check if mouse is within the effective drawing area for X
                    if (mouseXInChartArea >= xOffsetPx && mouseXInChartArea <= xOffsetPx + effectivePixelWidth) {
                        const distanceKmHovered = getKmFromPixelX(mouseXInChartArea);
                        // Find the closest data point to the hovered distance for tooltip info
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
    ]); // Ensure drawChart is stable or dependencies are correct
    // Effect for handling tower drag mouse down
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
                    // Check Site A tower handle
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
                        setLiveDragVisuals(null); // Reset live visuals at start of new drag
                        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                        event.preventDefault();
                        return;
                    }
                    // Check Site B tower handle
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
    ]); // Re-bind if data changes to get new tower positions
    // Effect for handling global mouse move and mouse up during drag
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            if (!draggingTower || !dragStartInfo || !chartMetricsRef.current) {
                // Reset cursor if it was set to grabbing and drag ended prematurely
                if (canvasRef.current && canvasRef.current.style.cursor === 'grabbing') canvasRef.current.style.cursor = 'crosshair';
                return;
            }
            const { getElevationFromPixelY, chartPixelHeight, getPixelYFromElevation: getPixelY } = chartMetricsRef.current;
            const handleGlobalMouseMove = {
                "CustomProfileChart.useEffect.handleGlobalMouseMove": (event)=>{
                    if (!draggingTower || !dragStartInfo || !chartMetricsRef.current) return; // Should not happen if effect is bound correctly
                    const clientYDelta = event.clientY - dragStartInfo.clientY;
                    // New tower LOS Y position in chart area coordinates (Y=0 at top)
                    let newTowerLosY_px_ChartArea = dragStartInfo.initialLosY_px_ChartArea - clientYDelta;
                    // Clamp Y within chart boundaries
                    newTowerLosY_px_ChartArea = Math.max(0, Math.min(chartPixelHeight, newTowerLosY_px_ChartArea));
                    // Convert pixel Y back to absolute elevation
                    const newTowerAbsoluteElevation = getElevationFromPixelY(newTowerLosY_px_ChartArea);
                    // Calculate height relative to terrain
                    let currentHeightMeters = newTowerAbsoluteElevation - dragStartInfo.siteTerrainElevation;
                    // Clamp and round height
                    currentHeightMeters = Math.round(currentHeightMeters);
                    currentHeightMeters = Math.max(MIN_TOWER_HEIGHT, Math.min(MAX_TOWER_HEIGHT, currentHeightMeters));
                    // Recalculate LOS Y pixel from clamped height for visual consistency
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
                    // Ensure cursor is reset if component unmounts during drag
                    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
                }
            })["CustomProfileChart.useEffect"];
        }
    }["CustomProfileChart.useEffect"], [
        draggingTower,
        dragStartInfo,
        onTowerHeightChangeFromGraph,
        data,
        liveDragVisuals
    ]); // Add liveDragVisuals to dependencies if its state is read inside
    // Re-draw chart when liveDragVisuals change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomProfileChart.useEffect": ()=>{
            drawChart();
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
                lineNumber: 578,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 577,
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
                    lineNumber: 587,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
                lineNumber: 586,
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
                lineNumber: 593,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 592,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full h-full relative", isStale && !isInteractingByDrag && "opacity-50", isActionPending && !isInteractingByDrag && "pointer-events-none"),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
            ref: canvasRef,
            style: {
                width: '100%',
                height: '100%',
                cursor: isInteractingByDrag ? 'grabbing' : hoverData ? 'pointer' : 'crosshair'
            }
        }, void 0, false, {
            fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
            lineNumber: 605,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/custom-profile-chart.tsx",
        lineNumber: 599,
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
"[project]/src/components/ui/switch.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Switch": (()=>Switch)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-switch/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const Switch = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
        ...props,
        ref: ref,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Thumb"], {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0")
        }, void 0, false, {
            fileName: "[project]/src/components/ui/switch.tsx",
            lineNumber: 20,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/switch.tsx",
        lineNumber: 12,
        columnNumber: 3
    }, this));
_c1 = Switch;
Switch.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Switch$React.forwardRef");
__turbopack_context__.k.register(_c1, "Switch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Tooltip": (()=>Tooltip),
    "TooltipContent": (()=>TooltipContent),
    "TooltipProvider": (()=>TooltipProvider),
    "TooltipTrigger": (()=>TooltipTrigger)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-tooltip/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
const TooltipProvider = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"];
const Tooltip = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const TooltipTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const TooltipContent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = ({ className, sideOffset = 4, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
        ref: ref,
        sideOffset: sideOffset,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tooltip.tsx",
        lineNumber: 18,
        columnNumber: 3
    }, this));
_c1 = TooltipContent;
TooltipContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tooltip$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "TooltipContent$React.forwardRef");
__turbopack_context__.k.register(_c1, "TooltipContent");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cable$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cable$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cable.js [app-client] (ecmascript) <export default as Cable>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-help.js [app-client] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/file-saver/dist/FileSaver.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/switch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tooltip.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
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
;
;
const SiteInputGroup = ({ id, title, control, register, clientFormErrors, serverFormErrors, getCombinedError })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
        className: "bg-transparent backdrop-blur-2px shadow-none border-0 h-full flex flex-col p-1 md:p-2 w-full",
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
                            lineNumber: 46,
                            columnNumber: 9
                        }, this),
                        " ",
                        title
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 45,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 44,
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
                                    className: "text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal",
                                    children: "Name"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 52,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                    id: `${id}.name`,
                                    ...register(`${id}.name`),
                                    placeholder: "e.g. Main Site",
                                    className: "mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 53,
                                    columnNumber: 11
                                }, this),
                                (clientFormErrors[id]?.name || serverFormErrors?.[`${id}.name`]) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-destructive/80 mt-0.5",
                                    children: getCombinedError(clientFormErrors[id]?.name, serverFormErrors?.[`${id}.name`])
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 60,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 51,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: `${id}.lat`,
                                            className: "text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal",
                                            children: "Latitude"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 64,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: `${id}.lat`,
                                            ...register(`${id}.lat`),
                                            placeholder: "-90 to 90",
                                            className: "mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 65,
                                            columnNumber: 13
                                        }, this),
                                        (clientFormErrors[id]?.lat || serverFormErrors?.[`${id}.lat`]) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-destructive/80 mt-0.5",
                                            children: getCombinedError(clientFormErrors[id]?.lat, serverFormErrors?.[`${id}.lat`])
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 72,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 63,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: `${id}.lng`,
                                            className: "text-[0.7rem] uppercase tracking-wider text-muted-foreground font-normal",
                                            children: "Longitude"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 75,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: `${id}.lng`,
                                            ...register(`${id}.lng`),
                                            placeholder: "-180 to 180",
                                            className: "mt-0.5 bg-transparent border-b border-border focus:border-primary/70 text-foreground h-7 text-xs px-1 py-0.5 rounded-none focus:ring-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 76,
                                            columnNumber: 13
                                        }, this),
                                        (clientFormErrors[id]?.lng || serverFormErrors?.[`${id}.lng`]) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-destructive/80 mt-0.5",
                                            children: getCombinedError(clientFormErrors[id]?.lng, serverFormErrors?.[`${id}.lng`])
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 83,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 74,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 62,
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
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, void 0)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 86,
                            columnNumber: 9
                        }, this),
                        (clientFormErrors[id]?.height || serverFormErrors?.[`${id}.height`]) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-destructive/80 mt-0.5",
                            children: getCombinedError(clientFormErrors[id]?.height, serverFormErrors?.[`${id}.height`])
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 102,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 50,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 49,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 43,
        columnNumber: 3
    }, this);
_c = SiteInputGroup;
const ProfilePanelMiddleColumn = ({ analysisResult, isStale, isActionPending, control, clientFormErrors, serverFormErrors, getCombinedError, handleSubmit, processSubmit, pointAName, pointBName, onTowerHeightChangeFromGraph, onDownloadPdf, isGeneratingPdf, // Fiber Path Props
calculateFiberPathEnabled, onToggleFiberPath, fiberRadiusMeters, onFiberRadiusChange, fiberPathResult, isFiberCalculating, fiberPathError })=>{
    _s();
    const watchedClearanceThresholdString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'clearanceThreshold',
        defaultValue: "10"
    });
    const minRequiredClearance = parseFloat(watchedClearanceThresholdString);
    let isClearBasedOnAnalysis = false;
    let deficit = 0;
    let actualMinClearance = analysisResult?.minClearance ?? null;
    if (analysisResult && analysisResult.minClearance !== null && !isNaN(minRequiredClearance)) {
        isClearBasedOnAnalysis = analysisResult.minClearance >= minRequiredClearance;
        deficit = isClearBasedOnAnalysis ? 0 : Math.ceil(minRequiredClearance - analysisResult.minClearance);
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
    const handleFiberRadiusInputChange = (event)=>{
        onFiberRadiusChange(event.target.value);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-shrink-0 w-full md:w-auto snap-start flex flex-col h-full overflow-hidden bg-transparent backdrop-blur-2px rounded-lg p-1 md:p-0",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap items-center justify-between gap-x-2 gap-y-2 py-1 md:py-1.5 px-2 md:px-3 border-b border-border mb-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-shrink-0 order-1",
                            children: isStale ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-2 py-1 rounded-md text-xs font-semibold bg-yellow-500/80 text-yellow-900 flex items-center shadow",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                        className: "mr-1 h-3 w-3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                        lineNumber: 192,
                                        columnNumber: 15
                                    }, this),
                                    " NEEDS RE-ANALYZE"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 191,
                                columnNumber: 13
                            }, this) : analysisResult ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-3 py-1.5 rounded-md text-xs font-bold shadow-md", isClearBasedOnAnalysis ? "bg-los-success text-los-success-foreground" : "bg-los-failure text-los-failure-foreground"),
                                children: isClearBasedOnAnalysis ? "LOS POSSIBLE" : "LOS BLOCKED"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "px-3 py-1.5 rounded-md text-xs font-semibold text-muted-foreground italic",
                                children: "Perform analysis"
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 206,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 189,
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
                                            lineNumber: 215,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-bold text-foreground text-xs md:text-sm",
                                            children: analysisResult.distanceKm < 1 ? `${(analysisResult.distanceKm * 1000).toFixed(0)}m` : `${analysisResult.distanceKm.toFixed(1)}km`
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 216,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 214,
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
                                            lineNumber: 224,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("font-bold text-xs md:text-sm", isStale ? "text-muted-foreground" : actualMinClearance !== null && actualMinClearance >= (minRequiredClearance || 0) ? "text-los-success" : "text-los-failure"),
                                            children: actualMinClearance !== null ? actualMinClearance.toFixed(1) + "m" : "N/A"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 225,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 223,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "order-3 flex-grow-0 md:flex-grow-0 text-center flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "submit" // This button triggers LOS analysis via form submission
                                    ,
                                    onClick: handleSubmit(processSubmit),
                                    disabled: isActionPending || isGeneratingPdf || isFiberCalculating,
                                    size: "sm",
                                    className: "bg-primary/90 hover:bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mr-1.5 h-3.5 w-3.5", !isActionPending && "hidden", isActionPending && "animate-spin")
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 243,
                                            columnNumber: 17
                                        }, this),
                                        buttonText
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 236,
                                    columnNumber: 14
                                }, this),
                                analysisResult && !isStale && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "button",
                                    onClick: onDownloadPdf,
                                    disabled: isActionPending || isGeneratingPdf || !analysisResult || isStale || isFiberCalculating,
                                    size: "sm",
                                    variant: "outline",
                                    className: "text-xs font-semibold px-3 py-1 h-auto min-h-7 rounded-md shadow-none transition-all duration-200 whitespace-nowrap leading-tight border-primary/50 hover:bg-primary/10",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mr-1.5 h-3.5 w-3.5", !isGeneratingPdf && "hidden", isGeneratingPdf && "animate-spin")
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 255,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mr-1.5 h-3.5 w-3.5", isGeneratingPdf && "hidden")
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 256,
                                            columnNumber: 21
                                        }, this),
                                        "PDF"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 247,
                                    columnNumber: 18
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 235,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center space-x-1 order-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    htmlFor: "clearanceThresholdProfile",
                                    className: "text-[0.65rem] text-muted-foreground whitespace-nowrap",
                                    children: "Req. Fresnel (m):"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 263,
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
                                            onChange: (e)=>field.onChange(e.target.value),
                                            className: "bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-14 text-center"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 268,
                                            columnNumber: 19
                                        }, void 0)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 264,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 262,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 188,
                    columnNumber: 7
                }, this),
                (clientFormErrors.clearanceThreshold || serverFormErrors?.clearanceThreshold) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-destructive mt-0.5 text-center px-2",
                    children: getCombinedError(clientFormErrors.clearanceThreshold, serverFormErrors?.clearanceThreshold)
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 281,
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
                            lineNumber: 288,
                            columnNumber: 13
                        }, this),
                        " to tower(s) for clearance."
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 286,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "py-1 px-2 md:px-3 border-t border-border mt-1 space-y-1.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                            id: "fiber-path-toggle",
                                            checked: calculateFiberPathEnabled,
                                            onCheckedChange: onToggleFiberPath,
                                            disabled: isActionPending
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 297,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: "fiber-path-toggle",
                                            className: "text-xs text-muted-foreground flex items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cable$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cable$3e$__["Cable"], {
                                                    className: "mr-1.5 h-3.5 w-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                    lineNumber: 304,
                                                    columnNumber: 15
                                                }, this),
                                                " Calculate Fiber Path"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 303,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {
                                            delayDuration: 100,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipTrigger"], {
                                                    asChild: true,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "ghost",
                                                        size: "icon",
                                                        className: "h-4 w-4 p-0 m-0",
                                                        onClick: (e)=>e.preventDefault(),
                                                        "aria-label": "Fiber path calculation info",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$help$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"], {
                                                            className: "h-3.5 w-3.5 text-muted-foreground/70 cursor-help"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                            lineNumber: 309,
                                                            columnNumber: 26
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                        lineNumber: 308,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                    lineNumber: 307,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tooltip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TooltipContent"], {
                                                    side: "top",
                                                    className: "max-w-xs text-xs p-2 bg-popover text-popover-foreground border border-border shadow-lg",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            children: "Calculates estimated fiber optic cable path length using road networks within a specified radius from each site."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1",
                                                            children: "Requires Line-of-Sight (LOS) to be feasible."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                            lineNumber: 314,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1",
                                                            children: "Results include offsets from sites to roads and the road route distance."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                            lineNumber: 315,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 306,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 296,
                                    columnNumber: 11
                                }, this),
                                calculateFiberPathEnabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: "fiber-radius-input",
                                            className: "text-[0.65rem] text-muted-foreground whitespace-nowrap",
                                            children: "Snap Radius (m):"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 321,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: "fiber-radius-input",
                                            type: "number",
                                            value: fiberRadiusMeters.toString(),
                                            onChange: handleFiberRadiusInputChange,
                                            min: 0,
                                            step: 50,
                                            className: "bg-input border-border focus:border-primary/70 text-foreground h-6 text-xs px-1.5 py-0.5 rounded-sm focus:ring-1 focus:ring-primary/70 w-16 text-center",
                                            disabled: isActionPending || isFiberCalculating
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 322,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 320,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 295,
                            columnNumber: 9
                        }, this),
                        isFiberCalculating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs text-primary flex items-center justify-center py-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                    className: "mr-1.5 h-3.5 w-3.5 animate-spin"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 337,
                                    columnNumber: 13
                                }, this),
                                " Calculating fiber path..."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 336,
                            columnNumber: 11
                        }, this),
                        fiberPathResult && !isFiberCalculating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs p-1.5 rounded-sm bg-muted/50 space-y-0.5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold",
                                            children: "Fiber Path Status:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 343,
                                            columnNumber: 15
                                        }, this),
                                        ' ',
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(fiberPathResult.status === 'success' ? 'text-los-success' : fiberPathResult.status === 'los_not_feasible' || fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'no_route_between_roads' || fiberPathResult.status === 'radius_too_small' ? 'text-amber-500' : 'text-los-failure'),
                                            children: fiberPathResult.status === 'success' ? 'Calculated' : fiberPathResult.status === 'los_not_feasible' ? 'LOS Not Feasible' : fiberPathResult.status === 'no_road_for_a' ? 'No Road Near Site A' : fiberPathResult.status === 'no_road_for_b' ? 'No Road Near Site B' : fiberPathResult.status === 'no_route_between_roads' ? 'No Road Route' : fiberPathResult.status === 'radius_too_small' ? 'Snap Radius Too Small' : 'Error'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 344,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 342,
                                    columnNumber: 13
                                }, this),
                                fiberPathResult.totalDistanceMeters !== undefined && fiberPathResult.status === 'success' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold",
                                            children: "Total Fiber Distance:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                            lineNumber: 359,
                                            columnNumber: 18
                                        }, this),
                                        " ",
                                        fiberPathResult.totalDistanceMeters.toFixed(0),
                                        " m"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 359,
                                    columnNumber: 15
                                }, this),
                                fiberPathError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-destructive",
                                    children: fiberPathError
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 361,
                                    columnNumber: 32
                                }, this),
                                fiberPathResult.errorMessage && fiberPathResult.status !== 'success' && !fiberPathError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-muted-foreground italic",
                                    children: fiberPathResult.errorMessage
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 363,
                                    columnNumber: 17
                                }, this),
                                fiberPathResult.status === 'success' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-[0.65rem] text-muted-foreground/80",
                                    children: [
                                        "(Offset A: ",
                                        fiberPathResult.offsetDistanceA_meters?.toFixed(0),
                                        "m + Road: ",
                                        fiberPathResult.roadRouteDistanceMeters?.toFixed(0),
                                        "m + Offset B: ",
                                        fiberPathResult.offsetDistanceB_meters?.toFixed(0),
                                        "m)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 366,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 341,
                            columnNumber: 11
                        }, this),
                        fiberPathResult && (fiberPathResult.status === 'no_road_for_a' || fiberPathResult.status === 'no_road_for_b' || fiberPathResult.status === 'radius_too_small') && !isFiberCalculating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-amber-600 dark:text-amber-500 mt-1 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                    className: "inline h-3 w-3 mr-1"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 377,
                                    columnNumber: 17
                                }, this),
                                fiberPathResult.status === 'radius_too_small' ? "Snap radius is too small. " : "No road found near one or both sites. ",
                                "Try increasing the Snap Radius."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 376,
                            columnNumber: 13
                        }, this),
                        fiberPathResult && fiberPathResult.status === 'no_route_between_roads' && !isFiberCalculating && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-amber-600 dark:text-amber-500 mt-1 text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                    className: "inline h-3 w-3 mr-1"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 385,
                                    columnNumber: 17
                                }, this),
                                "Could not find a road route between the snapped points for Site A and Site B. They might be on disconnected road networks."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 384,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 294,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex-1 min-h-0 p-0.5"),
                    children: analysisResult ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$custom$2d$profile$2d$chart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        data: analysisResult.profile,
                        pointAName: pointAName,
                        pointBName: pointBName,
                        isStale: isStale,
                        totalDistanceKm: analysisResult.distanceKm,
                        isActionPending: isActionPending || isFiberCalculating,
                        onTowerHeightChangeFromGraph: onTowerHeightChangeFromGraph
                    }, chartKey, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 394,
                        columnNumber: 11
                    }, this) : isActionPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full flex items-center justify-center p-2 bg-muted/30 rounded-md",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-muted-foreground text-xs text-center",
                            children: "Loading analysis data..."
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 406,
                            columnNumber: 17
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 405,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-full flex flex-col items-center justify-center p-2 text-xs text-muted-foreground",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "Perform analysis to see profile."
                        }, void 0, false, {
                            fileName: "[project]/src/components/fso/bottom-panel.tsx",
                            lineNumber: 410,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 409,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 392,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/fso/bottom-panel.tsx",
            lineNumber: 187,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 186,
        columnNumber: 5
    }, this);
};
_s(ProfilePanelMiddleColumn, "dl8HUQb6+zRQquiQNehxO2ZDhew=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"]
    ];
});
_c1 = ProfilePanelMiddleColumn;
function BottomPanel({ analysisResult, isPanelGloballyVisible, onToggleGlobalVisibility, isContentExpanded, onToggleContentExpansion, isStale, control, register, handleSubmit, processSubmit, clientFormErrors, serverFormErrors, isActionPending, getValues, setValue, onTowerHeightChangeFromGraph, // Fiber Path Props
calculateFiberPathEnabled, onToggleFiberPath, fiberRadiusMeters, onFiberRadiusChange, fiberPathResult, isFiberCalculating, fiberPathError }) {
    _s1();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const [isGeneratingPdf, setIsGeneratingPdf] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
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
    const handleDownloadPdf = async ()=>{
        if (!analysisResult) {
            toast({
                title: "Error",
                description: "No analysis data available to generate PDF.",
                variant: "destructive"
            });
            return;
        }
        setIsGeneratingPdf(true);
        try {
            const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateSingleAnalysisPdfReportAction"])(analysisResult, {});
            if (response.success) {
                const { base64Pdf, fileName } = response.data;
                const byteCharacters = atob(base64Pdf);
                const byteNumbers = new Array(byteCharacters.length);
                for(let i = 0; i < byteCharacters.length; i++){
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([
                    byteArray
                ], {
                    type: 'application/pdf'
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$file$2d$saver$2f$dist$2f$FileSaver$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveAs"])(blob, fileName);
                toast({
                    title: "Success",
                    description: "PDF report downloaded."
                });
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error generating PDF.";
            console.error("PDF Generation Error:", error);
            toast({
                title: "PDF Generation Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally{
            setIsGeneratingPdf(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        noValidate: true,
        onSubmit: handleSubmit(processSubmit),
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-slate-700/60 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-in-out print:hidden", isPanelGloballyVisible ? "transform translate-y-0" : "transform translate-y-full", "z-[50]"),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full overflow-hidden transition-[height] duration-500 ease-in-out", isContentExpanded && isPanelGloballyVisible ? "h-[40vh] md:h-[35vh]" : "h-0"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-1.5 md:p-2 h-full overflow-y-hidden md:overflow-y-auto",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex md:grid md:grid-cols-[minmax(200px,_1fr)_minmax(300px,_2fr)_minmax(200px,_1fr)] gap-1.5 h-full overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none custom-scrollbar",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 w-full md:w-auto snap-start p-1 md:p-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SiteInputGroup, {
                                    id: "pointA",
                                    title: pointAName || "Site A",
                                    control: control,
                                    register: register,
                                    clientFormErrors: clientFormErrors,
                                    serverFormErrors: serverFormErrors,
                                    getCombinedError: getCombinedError
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 538,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 537,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ProfilePanelMiddleColumn, {
                                analysisResult: analysisResult,
                                isStale: isStale,
                                isActionPending: isActionPending,
                                control: control,
                                clientFormErrors: clientFormErrors,
                                serverFormErrors: serverFormErrors,
                                getCombinedError: getCombinedError,
                                handleSubmit: handleSubmit,
                                processSubmit: processSubmit,
                                pointAName: pointAName || "Site A",
                                pointBName: pointBName || "Site B",
                                onTowerHeightChangeFromGraph: onTowerHeightChangeFromGraph,
                                onDownloadPdf: handleDownloadPdf,
                                isGeneratingPdf: isGeneratingPdf,
                                // Fiber Path Props
                                calculateFiberPathEnabled: calculateFiberPathEnabled,
                                onToggleFiberPath: onToggleFiberPath,
                                fiberRadiusMeters: fiberRadiusMeters,
                                onFiberRadiusChange: onFiberRadiusChange,
                                fiberPathResult: fiberPathResult,
                                isFiberCalculating: isFiberCalculating,
                                fiberPathError: fiberPathError
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 549,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-shrink-0 w-full md:w-auto snap-start p-1 md:p-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SiteInputGroup, {
                                    id: "pointB",
                                    title: pointBName || "Site B",
                                    control: control,
                                    register: register,
                                    clientFormErrors: clientFormErrors,
                                    serverFormErrors: serverFormErrors,
                                    getCombinedError: getCombinedError
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                    lineNumber: 575,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                                lineNumber: 574,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/fso/bottom-panel.tsx",
                        lineNumber: 535,
                        columnNumber: 12
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 534,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 528,
                columnNumber: 7
            }, this),
            isPanelGloballyVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-0 p-1.5 bg-card rounded-t-lg border-t border-x border-border shadow-lg cursor-pointer hover:bg-muted group",
                onClick: onToggleContentExpansion,
                "aria-label": isContentExpanded ? "Collapse Panel Content" : "Expand Panel Content",
                children: isContentExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                    className: "h-4 w-4 text-muted-foreground group-hover:text-foreground"
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 595,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                    className: "h-4 w-4 text-muted-foreground group-hover:text-foreground"
                }, void 0, false, {
                    fileName: "[project]/src/components/fso/bottom-panel.tsx",
                    lineNumber: 596,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/fso/bottom-panel.tsx",
                lineNumber: 589,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/fso/bottom-panel.tsx",
        lineNumber: 519,
        columnNumber: 5
    }, this);
}
_s1(BottomPanel, "vxN4BgJtxTOYTGYtkcrSWSWFrXs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
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
"[project]/src/tools/fiberPathCalculator/actions.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/tools/fiberPathCalculator/actions.ts
/* __next_internal_action_entry_do_not_use__ {"7e9053ee96b2a8ff08a5535b919d94d4648359fba6":"performFiberPathAnalysisAction"} */ __turbopack_context__.s({
    "performFiberPathAnalysisAction": (()=>performFiberPathAnalysisAction)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-client] (ecmascript)");
;
var performFiberPathAnalysisAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createServerReference"])("7e9053ee96b2a8ff08a5535b919d94d4648359fba6", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findSourceMapURL"], "performFiberPathAnalysisAction");
}}),
"[project]/src/tools/fiberPathCalculator/index.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/tools/fiberPathCalculator/index.ts
// This file will export the public functions and types from the fiberPathCalculator module.
__turbopack_context__.s({});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
 // export { calculateFiberPath } from './calculator'; // Core logic, might not be directly exported if only used by actions
}}),
"[project]/src/tools/fiberPathCalculator/index.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/actions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/index.ts [app-client] (ecmascript) <locals>");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$interactive$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/interactive-map.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hook-form/dist/index.esm.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hookform/resolvers/zod/dist/zod.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waypoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waypoints$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/waypoints.js [app-client] (ecmascript) <export default as Waypoints>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$form$2d$schema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/form-schema.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$app$2d$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/app-header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$history$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/history-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/los-calculator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$bottom$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/fso/bottom-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/index.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/tools/fiberPathCalculator/actions.ts [app-client] (ecmascript)");
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
;
;
const LOCAL_STORAGE_KEYS = {
    FIBER_TOGGLE: 'fiberPathEnabled',
    FIBER_RADIUS: 'fiberPathRadiusMeters'
};
function Home() {
    _s();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const [rawServerState, formAction, isActionPending] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useActionState(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["performLosAnalysis"], null);
    const [analysisResult, setAnalysisResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [displayedError, setDisplayedError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [fieldErrors, setFieldErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isAnalysisPanelGloballyOpen, setIsAnalysisPanelGloballyOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isBottomPanelContentExpanded, setIsBottomPanelContentExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isStale, setIsStale] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [historyList, setHistoryList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isHistoryPanelOpen, setIsHistoryPanelOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [liveDistanceKm, setLiveDistanceKm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // State for Fiber Path Calculation
    const [calculateFiberPathEnabled, setCalculateFiberPathEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Home.useState": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                const storedValue = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE);
                return storedValue ? JSON.parse(storedValue) : false;
            }
            "TURBOPACK unreachable";
        }
    }["Home.useState"]);
    const [fiberRadiusMeters, setFiberRadiusMeters] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Home.useState": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                const storedValue = localStorage.getItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS);
                return storedValue ? parseInt(storedValue, 10) : 500; // Default radius 500m
            }
            "TURBOPACK unreachable";
        }
    }["Home.useState"]);
    const [fiberPathResult, setFiberPathResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isFiberCalculating, setIsFiberCalculating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fiberPathError, setFiberPathError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const form = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"])({
        resolver: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hookform$2f$resolvers$2f$zod$2f$dist$2f$zod$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["zodResolver"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$form$2d$schema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnalysisFormSchema"]),
        defaultValues: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$form$2d$schema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultFormStateValues"],
        mode: 'onBlur'
    });
    const { register, handleSubmit, control, formState: { errors: clientFormErrors }, getValues, setValue, reset, watch } = form;
    const watchedPointA = watch('pointA');
    const watchedPointB = watch('pointB');
    const watchedClearanceThreshold = watch('clearanceThreshold');
    const formPointAForMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'pointA'
    });
    const formPointBForMap = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWatch"])({
        control,
        name: 'pointB'
    });
    const processSubmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[processSubmit]": (data)=>{
            setDisplayedError(null);
            setFieldErrors(null);
            setFiberPathResult(null);
            setFiberPathError(null);
            const formData = new FormData();
            formData.append('pointA.name', data.pointA.name);
            formData.append('pointA.lat', data.pointA.lat);
            formData.append('pointA.lng', data.pointA.lng);
            formData.append('pointA.height', data.pointA.height.toString());
            formData.append('pointB.name', data.pointB.name);
            formData.append('pointB.lat', data.pointB.lat);
            formData.append('pointB.lng', data.pointB.lng);
            formData.append('pointB.height', data.pointB.height.toString());
            formData.append('clearanceThreshold', data.clearanceThreshold);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].startTransition({
                "Home.useCallback[processSubmit]": ()=>{
                    formAction(formData);
                }
            }["Home.useCallback[processSubmit]"]);
        }
    }["Home.useCallback[processSubmit]"], [
        formAction
    ]);
    // Effect to handle LOS Analysis results and trigger Fiber Path calculation
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if (rawServerState === null) return;
            // Check for a returned error object from the server action
            if (typeof rawServerState === 'object' && rawServerState !== null && 'error' in rawServerState && typeof rawServerState.error === 'string') {
                setAnalysisResult(null);
                const errorMessage = rawServerState.error || "An unexpected error occurred during LOS analysis.";
                setDisplayedError(errorMessage);
                if ('fieldErrors' in rawServerState && rawServerState.fieldErrors) {
                    setFieldErrors(rawServerState.fieldErrors);
                } else {
                    setFieldErrors(null);
                }
                toast({
                    title: "LOS Analysis Error",
                    description: errorMessage,
                    variant: "destructive",
                    duration: 7000
                });
                setFiberPathResult(null); // Clear fiber result on LOS error
                setFiberPathError(null);
            } else if (typeof rawServerState === 'object' && rawServerState !== null && 'losPossible' in rawServerState) {
                // Successful LOS analysis result
                const successfulLosResult = rawServerState;
                setAnalysisResult(successfulLosResult);
                setHistoryList({
                    "Home.useEffect": (prev)=>[
                            successfulLosResult,
                            ...prev.slice(0, 19)
                        ]
                }["Home.useEffect"]);
                setLiveDistanceKm(successfulLosResult.distanceKm);
                setDisplayedError(null);
                setFieldErrors(null);
                const currentFormValues = getValues();
                const formValuesForResult = {
                    pointA: {
                        name: successfulLosResult.pointA.name || currentFormValues.pointA.name,
                        lat: successfulLosResult.pointA.lat.toString(),
                        lng: successfulLosResult.pointA.lng.toString(),
                        height: successfulLosResult.pointA.towerHeight
                    },
                    pointB: {
                        name: successfulLosResult.pointB.name || currentFormValues.pointB.name,
                        lat: successfulLosResult.pointB.lat.toString(),
                        lng: successfulLosResult.pointB.lng.toString(),
                        height: successfulLosResult.pointB.towerHeight
                    },
                    clearanceThreshold: successfulLosResult.clearanceThresholdUsed.toString()
                };
                reset(formValuesForResult);
                setIsStale(false);
                if (!isAnalysisPanelGloballyOpen) {
                    setIsAnalysisPanelGloballyOpen(true);
                    setIsBottomPanelContentExpanded(true);
                }
                toast({
                    title: "LOS Analysis Complete",
                    description: successfulLosResult.message || "LOS analysis performed successfully."
                });
                // --- Trigger Fiber Path Calculation if enabled ---
                if (calculateFiberPathEnabled) {
                    setIsFiberCalculating(true);
                    setFiberPathError(null);
                    setFiberPathResult(null); // Clear previous fiber result
                    if (successfulLosResult.losPossible) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["performFiberPathAnalysisAction"])(successfulLosResult.pointA.lat, successfulLosResult.pointA.lng, successfulLosResult.pointB.lat, successfulLosResult.pointB.lng, fiberRadiusMeters, true // isLosFeasible is true here
                        ).then({
                            "Home.useEffect": (fiberResult)=>{
                                setFiberPathResult(fiberResult);
                                if (fiberResult.status !== 'success' && fiberResult.errorMessage) {
                                    setFiberPathError(fiberResult.errorMessage);
                                    toast({
                                        title: "Fiber Path Info",
                                        description: fiberResult.errorMessage,
                                        variant: "default",
                                        duration: 6000
                                    });
                                } else if (fiberResult.status === 'success') {
                                    toast({
                                        title: "Fiber Path Calculated",
                                        description: `Total fiber distance: ${fiberResult.totalDistanceMeters?.toFixed(0)}m.`,
                                        duration: 5000
                                    });
                                }
                            }
                        }["Home.useEffect"]).catch({
                            "Home.useEffect": (err)=>{
                                const fiberErrorMessage = err instanceof Error ? err.message : "Fiber path calculation failed.";
                                setFiberPathError(fiberErrorMessage);
                                toast({
                                    title: "Fiber Path Error",
                                    description: fiberErrorMessage,
                                    variant: "destructive",
                                    duration: 7000
                                });
                            }
                        }["Home.useEffect"]).finally({
                            "Home.useEffect": ()=>{
                                setIsFiberCalculating(false);
                            }
                        }["Home.useEffect"]);
                    } else {
                        // LOS is not feasible, but fiber calculation was enabled.
                        setFiberPathResult({
                            status: 'los_not_feasible',
                            errorMessage: 'Fiber path not calculated: LOS is not feasible for this link.',
                            pointA_original: successfulLosResult.pointA,
                            pointB_original: successfulLosResult.pointB,
                            losFeasible: false,
                            radiusMetersUsed: fiberRadiusMeters
                        });
                        setFiberPathError('Fiber path not calculated: LOS is not feasible.');
                        setIsFiberCalculating(false);
                    }
                } else {
                    setFiberPathResult(null); // Clear fiber result if toggle is off
                    setFiberPathError(null);
                    setIsFiberCalculating(false);
                }
            }
        }
    }["Home.useEffect"], [
        rawServerState,
        toast,
        reset,
        getValues,
        isAnalysisPanelGloballyOpen,
        calculateFiberPathEnabled,
        fiberRadiusMeters
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            const formValues = getValues();
            const currentPointA = formValues.pointA;
            const currentPointB = formValues.pointB;
            const currentClearanceStr = formValues.clearanceThreshold;
            let newIsStale = false;
            const isValidNumeric = {
                "Home.useEffect.isValidNumeric": (val)=>val && !isNaN(parseFloat(val))
            }["Home.useEffect.isValidNumeric"];
            const isPointDataSufficient = {
                "Home.useEffect.isPointDataSufficient": (p)=>isValidNumeric(p.lat) && isValidNumeric(p.lng) && typeof p.height === 'number'
            }["Home.useEffect.isPointDataSufficient"];
            const canPerformAnalysisWithCurrentForm = isPointDataSufficient(currentPointA) && isPointDataSufficient(currentPointB) && isValidNumeric(currentClearanceStr);
            if (analysisResult && analysisResult.pointA && analysisResult.pointB) {
                const formLatA = parseFloat(currentPointA.lat);
                const formLngA = parseFloat(currentPointA.lng);
                const formHeightA = currentPointA.height;
                const formLatB = parseFloat(currentPointB.lat);
                const formLngB = parseFloat(currentPointB.lng);
                const formHeightB = currentPointB.height;
                const formClearanceNum = parseFloat(currentClearanceStr);
                if (analysisResult.pointA.lat !== formLatA || analysisResult.pointA.lng !== formLngA || analysisResult.pointA.towerHeight !== formHeightA || analysisResult.pointB.lat !== formLatB || analysisResult.pointB.lng !== formLngB || analysisResult.pointB.towerHeight !== formHeightB || analysisResult.clearanceThresholdUsed !== formClearanceNum) {
                    newIsStale = true;
                } else {
                    newIsStale = false;
                }
            } else {
                if (canPerformAnalysisWithCurrentForm) {
                    newIsStale = true;
                } else {
                    newIsStale = false;
                }
            }
            setIsStale(newIsStale);
            if (newIsStale) {
                setFiberPathResult(null);
                setFiberPathError(null);
            }
        }
    }["Home.useEffect"], [
        getValues,
        analysisResult,
        watchedPointA,
        watchedPointB,
        watchedClearanceThreshold,
        isActionPending
    ]);
    const handleMapClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleMapClick]": (event, pointId)=>{
            if (event.latLng) {
                const lat = event.latLng.lat().toFixed(6);
                const lng = event.latLng.lng().toFixed(6);
                setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                const currentA = getValues('pointA');
                const currentB = getValues('pointB');
                if (isValidNumericString(currentA.lat) && isValidNumericString(currentA.lng) && isValidNumericString(currentB.lat) && isValidNumericString(currentB.lng)) {
                    setLiveDistanceKm((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDistanceKm"])({
                        lat: parseFloat(currentA.lat),
                        lng: parseFloat(currentA.lng)
                    }, {
                        lat: parseFloat(currentB.lat),
                        lng: parseFloat(currentB.lng)
                    }));
                } else {
                    setLiveDistanceKm(null);
                }
            }
        }
    }["Home.useCallback[handleMapClick]"], [
        setValue,
        getValues
    ]);
    const handleMarkerDrag = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleMarkerDrag]": (event, pointId)=>{
            if (event.latLng) {
                const lat = event.latLng.lat().toFixed(6);
                const lng = event.latLng.lng().toFixed(6);
                setValue(pointId === 'pointA' ? 'pointA.lat' : 'pointB.lat', lat, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                setValue(pointId === 'pointA' ? 'pointA.lng' : 'pointB.lng', lng, {
                    shouldDirty: true,
                    shouldValidate: true
                });
                const currentA = getValues('pointA');
                const currentB = getValues('pointB');
                if (isValidNumericString(currentA.lat) && isValidNumericString(currentA.lng) && isValidNumericString(currentB.lat) && isValidNumericString(currentB.lng)) {
                    setLiveDistanceKm((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDistanceKm"])({
                        lat: parseFloat(currentA.lat),
                        lng: parseFloat(currentA.lng)
                    }, {
                        lat: parseFloat(currentB.lat),
                        lng: parseFloat(currentB.lng)
                    }));
                } else {
                    setLiveDistanceKm(null);
                }
            }
        }
    }["Home.useCallback[handleMarkerDrag]"], [
        setValue,
        getValues
    ]);
    const isValidNumericString = (val)=>val && !isNaN(parseFloat(val));
    const handleTowerHeightChangeFromGraph = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[handleTowerHeightChangeFromGraph]": (siteId, newHeight)=>{
            setValue(`${siteId}.height`, Math.round(newHeight), {
                shouldDirty: true,
                shouldValidate: true
            });
            handleSubmit(processSubmit)();
        }
    }["Home.useCallback[handleTowerHeightChangeFromGraph]"], [
        setValue,
        handleSubmit,
        processSubmit
    ]);
    const toggleGlobalPanelVisibility = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[toggleGlobalPanelVisibility]": ()=>{
            setIsAnalysisPanelGloballyOpen({
                "Home.useCallback[toggleGlobalPanelVisibility]": (prev)=>!prev
            }["Home.useCallback[toggleGlobalPanelVisibility]"]);
        }
    }["Home.useCallback[toggleGlobalPanelVisibility]"], []);
    const toggleBottomPanelContentExpansion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[toggleBottomPanelContentExpansion]": ()=>{
            setIsBottomPanelContentExpanded({
                "Home.useCallback[toggleBottomPanelContentExpansion]": (prev)=>!prev
            }["Home.useCallback[toggleBottomPanelContentExpansion]"]);
        }
    }["Home.useCallback[toggleBottomPanelContentExpansion]"], []);
    const handleStartAnalysisClick = ()=>{
        setIsAnalysisPanelGloballyOpen(true);
        setIsBottomPanelContentExpanded(true);
        handleSubmit(processSubmit)();
    };
    const dismissErrorModal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Home.useCallback[dismissErrorModal]": ()=>{
            setDisplayedError(null);
            setFieldErrors(null);
        }
    }["Home.useCallback[dismissErrorModal]"], []);
    const handleToggleHistoryPanel = ()=>{
        setIsHistoryPanelOpen((prev)=>!prev);
    };
    const handleClearMap = ()=>{
        reset(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$form$2d$schema$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultFormStateValues"]);
        setAnalysisResult(null);
        setLiveDistanceKm(null);
        setIsStale(false);
        setDisplayedError(null);
        setFieldErrors(null);
        setFiberPathResult(null);
        setFiberPathError(null);
        // setCalculateFiberPathEnabled(false); // Keep persisted state or reset to default? For now, keep persisted.
        // setFiberRadiusMeters(500); // Keep persisted state or reset? For now, keep persisted.
        toast({
            title: "Map Cleared",
            description: "Form reset to default values."
        });
        if (isAnalysisPanelGloballyOpen) {
            setIsAnalysisPanelGloballyOpen(false);
        }
    };
    const handleLoadHistoryItem = (id)=>{
        const itemToLoad = historyList.find((item)=>item.id === id);
        if (itemToLoad) {
            setAnalysisResult(itemToLoad);
            const formValuesFromHistory = {
                pointA: {
                    name: itemToLoad.pointA.name || 'Site A',
                    lat: itemToLoad.pointA.lat.toString(),
                    lng: itemToLoad.pointA.lng.toString(),
                    height: itemToLoad.pointA.towerHeight
                },
                pointB: {
                    name: itemToLoad.pointB.name || 'Site B',
                    lat: itemToLoad.pointB.lat.toString(),
                    lng: itemToLoad.pointB.lng.toString(),
                    height: itemToLoad.pointB.towerHeight
                },
                clearanceThreshold: itemToLoad.clearanceThresholdUsed.toString()
            };
            reset(formValuesFromHistory);
            setLiveDistanceKm(itemToLoad.distanceKm);
            setIsStale(false);
            setDisplayedError(null);
            setFieldErrors(null);
            setFiberPathResult(null); // Clear fiber results when loading from history
            setFiberPathError(null);
            setIsAnalysisPanelGloballyOpen(true);
            setIsBottomPanelContentExpanded(true);
            toast({
                title: "History Loaded",
                description: `Loaded analysis for ${itemToLoad.pointA.name} - ${itemToLoad.pointB.name}.`
            });
            // Optionally, re-run fiber calculation if toggle is ON and LOS is feasible for the loaded item
            if (calculateFiberPathEnabled && itemToLoad.losPossible) {
                setIsFiberCalculating(true);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["performFiberPathAnalysisAction"])(itemToLoad.pointA.lat, itemToLoad.pointA.lng, itemToLoad.pointB.lat, itemToLoad.pointB.lng, fiberRadiusMeters, true).then(setFiberPathResult).catch((err)=>{
                    setFiberPathError(err.message || "Error re-calculating fiber for history item.");
                }).finally(()=>setIsFiberCalculating(false));
            } else if (calculateFiberPathEnabled && !itemToLoad.losPossible) {
                setFiberPathResult({
                    status: 'los_not_feasible',
                    errorMessage: 'Fiber path not calculated: LOS is not feasible for this historical link.',
                    pointA_original: itemToLoad.pointA,
                    pointB_original: itemToLoad.pointB,
                    losFeasible: false,
                    radiusMetersUsed: fiberRadiusMeters
                });
            }
        }
    };
    const handleClearHistory = ()=>{
        setHistoryList([]);
        toast({
            title: "History Cleared"
        });
    };
    const handleToggleFiberPath = (checked)=>{
        setCalculateFiberPathEnabled(checked);
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_TOGGLE, JSON.stringify(checked));
        }
        if (!checked) {
            setFiberPathResult(null);
            setFiberPathError(null);
        } else if (analysisResult && !isStale) {
            setIsFiberCalculating(true);
            setFiberPathError(null);
            setFiberPathResult(null);
            if (analysisResult.losPossible) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["performFiberPathAnalysisAction"])(analysisResult.pointA.lat, analysisResult.pointA.lng, analysisResult.pointB.lat, analysisResult.pointB.lng, fiberRadiusMeters, true).then((fiberResult)=>{
                    setFiberPathResult(fiberResult);
                    if (fiberResult.status !== 'success' && fiberResult.errorMessage) {
                        setFiberPathError(fiberResult.errorMessage);
                        toast({
                            title: "Fiber Path Info",
                            description: fiberResult.errorMessage,
                            variant: "default",
                            duration: 6000
                        });
                    } else if (fiberResult.status === 'success') {
                        toast({
                            title: "Fiber Path Calculated",
                            description: `Total fiber distance: ${fiberResult.totalDistanceMeters?.toFixed(0)}m.`,
                            duration: 5000
                        });
                    }
                }).catch((err)=>{
                    const fiberErrorMessage = err instanceof Error ? err.message : "Fiber path calculation failed.";
                    setFiberPathError(fiberErrorMessage);
                    toast({
                        title: "Fiber Path Error",
                        description: fiberErrorMessage,
                        variant: "destructive",
                        duration: 7000
                    });
                }).finally(()=>{
                    setIsFiberCalculating(false);
                });
            } else {
                // LOS is not feasible for the current analysisResult
                setFiberPathResult({
                    status: 'los_not_feasible',
                    errorMessage: 'Fiber path not calculated: LOS is not feasible for the current link.',
                    pointA_original: analysisResult.pointA,
                    pointB_original: analysisResult.pointB,
                    losFeasible: false,
                    radiusMetersUsed: fiberRadiusMeters
                });
                setFiberPathError('Fiber path not calculated: LOS is not feasible.');
                setIsFiberCalculating(false);
            }
        }
    };
    const handleFiberRadiusChange = (value)=>{
        const newRadius = parseInt(value, 10);
        if (!isNaN(newRadius) && newRadius >= 0) {
            setFiberRadiusMeters(newRadius);
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.setItem(LOCAL_STORAGE_KEYS.FIBER_RADIUS, newRadius.toString());
            }
            // If toggle is enabled and there's a valid, non-stale LOS result, re-calculate
            if (calculateFiberPathEnabled && analysisResult && !isStale) {
                setIsFiberCalculating(true);
                setFiberPathError(null);
                setFiberPathResult(null);
                if (analysisResult.losPossible) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$tools$2f$fiberPathCalculator$2f$actions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["performFiberPathAnalysisAction"])(analysisResult.pointA.lat, analysisResult.pointA.lng, analysisResult.pointB.lat, analysisResult.pointB.lng, newRadius, true).then((fiberResult)=>{
                        setFiberPathResult(fiberResult);
                        if (fiberResult.status !== 'success' && fiberResult.errorMessage) {
                            setFiberPathError(fiberResult.errorMessage);
                            toast({
                                title: "Fiber Path Info",
                                description: fiberResult.errorMessage,
                                variant: "default",
                                duration: 6000
                            });
                        } else if (fiberResult.status === 'success') {
                            toast({
                                title: "Fiber Path Re-calculated",
                                description: `Total fiber distance: ${fiberResult.totalDistanceMeters?.toFixed(0)}m.`,
                                duration: 5000
                            });
                        }
                    }).catch((err)=>{
                        const fiberErrorMessage = err instanceof Error ? err.message : "Fiber path calculation failed.";
                        setFiberPathError(fiberErrorMessage);
                        toast({
                            title: "Fiber Path Error",
                            description: fiberErrorMessage,
                            variant: "destructive",
                            duration: 7000
                        });
                    }).finally(()=>{
                        setIsFiberCalculating(false);
                    });
                } else {
                    // LOS is not feasible for the current analysisResult
                    setFiberPathResult({
                        status: 'los_not_feasible',
                        errorMessage: 'Fiber path not calculated: LOS is not feasible for the current link with new radius.',
                        pointA_original: analysisResult.pointA,
                        pointB_original: analysisResult.pointB,
                        losFeasible: false,
                        radiusMetersUsed: newRadius
                    });
                    setFiberPathError('Fiber path not calculated: LOS is not feasible.');
                    setIsFiberCalculating(false);
                }
            }
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$app$2d$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                onToggleHistory: handleToggleHistoryPanel,
                onClearMap: handleClearMap,
                isHistoryPanelSupported: true,
                currentPage: "home"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 515,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 flex flex-col overflow-hidden relative h-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 w-full relative",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$interactive$2d$map$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            pointA: formPointAForMap && formPointAForMap.lat && formPointAForMap.lng ? {
                                lat: parseFloat(formPointAForMap.lat),
                                lng: parseFloat(formPointAForMap.lng),
                                name: formPointAForMap.name
                            } : undefined,
                            pointB: formPointBForMap && formPointBForMap.lat && formPointBForMap.lng ? {
                                lat: parseFloat(formPointBForMap.lat),
                                lng: parseFloat(formPointBForMap.lng),
                                name: formPointBForMap.name
                            } : undefined,
                            onMapClick: handleMapClick,
                            onMarkerDrag: handleMarkerDrag,
                            mapContainerClassName: "w-full h-full",
                            analysisResult: analysisResult,
                            isStale: isStale,
                            currentDistanceKm: liveDistanceKm,
                            fiberPathResult: fiberPathResult
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 523,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 522,
                        columnNumber: 9
                    }, this),
                    !isAnalysisPanelGloballyOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-8 left-1/2 -translate-x-1/2 z-40 print:hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: handleStartAnalysisClick,
                            size: "lg",
                            className: "bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg rounded-full px-8 py-6 text-base font-semibold backdrop-blur-sm",
                            "aria-label": "Start Link Analysis",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$waypoints$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Waypoints$3e$__["Waypoints"], {
                                    className: "mr-2 h-5 w-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 544,
                                    columnNumber: 15
                                }, this),
                                "Start Link Analysis"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 538,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 537,
                        columnNumber: 11
                    }, this),
                    (isActionPending || isFiberCalculating) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "p-6 shadow-2xl bg-card/90",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "flex flex-col items-center text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "h-12 w-12 animate-spin text-primary mb-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 554,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-semibold text-foreground",
                                        children: isActionPending ? "Analyzing Link..." : "Calculating Fiber Path..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 555,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-muted-foreground mt-1",
                                        children: isActionPending ? "Please wait while we process elevation data." : "Accessing road network data..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 558,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 553,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 552,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 551,
                        columnNumber: 11
                    }, this),
                    displayedError && !isActionPending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]",
                        onClick: dismissErrorModal,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "p-6 shadow-2xl bg-destructive/90 max-w-md w-full mx-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        className: "text-destructive-foreground flex items-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                                className: "mr-2 h-6 w-6"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 571,
                                                columnNumber: 21
                                            }, this),
                                            " LOS Analysis Failed"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 570,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 569,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-destructive-foreground mb-4 whitespace-pre-wrap",
                                            children: displayedError
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 575,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            className: "w-full bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90",
                                            onClick: (e)=>{
                                                e.stopPropagation();
                                                dismissErrorModal();
                                            },
                                            children: "Dismiss"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 576,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 574,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 568,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 567,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$fso$2f$bottom$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        analysisResult: analysisResult,
                        isPanelGloballyVisible: isAnalysisPanelGloballyOpen,
                        onToggleGlobalVisibility: toggleGlobalPanelVisibility,
                        isContentExpanded: isBottomPanelContentExpanded,
                        onToggleContentExpansion: toggleBottomPanelContentExpansion,
                        isStale: isStale,
                        control: control,
                        register: register,
                        handleSubmit: handleSubmit,
                        processSubmit: processSubmit,
                        clientFormErrors: clientFormErrors,
                        serverFormErrors: fieldErrors,
                        isActionPending: isActionPending,
                        getValues: getValues,
                        setValue: setValue,
                        onTowerHeightChangeFromGraph: handleTowerHeightChangeFromGraph,
                        // Fiber Path Props
                        calculateFiberPathEnabled: calculateFiberPathEnabled,
                        onToggleFiberPath: handleToggleFiberPath,
                        fiberRadiusMeters: fiberRadiusMeters,
                        onFiberRadiusChange: handleFiberRadiusChange,
                        fiberPathResult: fiberPathResult,
                        isFiberCalculating: isFiberCalculating,
                        fiberPathError: fiberPathError
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 588,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$history$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        historyList: historyList,
                        onLoadHistoryItem: handleLoadHistoryItem,
                        onClearHistory: handleClearHistory,
                        isOpen: isHistoryPanelOpen,
                        onToggle: handleToggleHistoryPanel
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 614,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 521,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(Home, "mQUKSTNTBtWB0qrTnHyqzLqnIyU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hook$2d$form$2f$dist$2f$index$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useForm"],
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

//# sourceMappingURL=src_145d1a30._.js.map