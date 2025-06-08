(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

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
// import { Loader2, SearchIcon } from 'lucide-react'; // SearchIcon commented out
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/los-calculator.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// import { Input } from '@/components/ui/input'; // Input for search commented out
const GOOGLE_MAPS_API_KEY = "AIzaSyDrXNokew1fgXpZmHqgjYB7fGVAkxUfkRQ";
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};
const defaultZoom = 5;
const STYLES = {
    mapMarkerLabel: "p-1.5 text-xs font-semibold text-white bg-slate-800/70 rounded-md shadow-lg backdrop-blur-sm -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap w-max",
    distanceOverlayLabel: "p-1.5 text-sm font-bold text-white bg-primary/80 rounded-lg shadow-xl backdrop-blur-sm whitespace-nowrap"
};
const getPixelPositionOffset = (width, height)=>({
        x: -(width / 2),
        y: -(height + 10)
    });
const getDistanceOverlayPositionOffset = (width, height)=>({
        x: -(width / 2),
        y: -(height / 2) - 15
    });
const getCustomMarkerIcon = (label, color, isMapLoaded)=>{
    if (isMapLoaded && "object" !== 'undefined' && window.google && window.google.maps) {
        return {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            fillColor: color,
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
function InteractiveMap({ links, selectedLinkId, onMapClick, onMarkerDrag, onLinkSelect, mapContainerClassName = "w-full h-full" }) {
    _s();
    const mapRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null); // Search ref commented out
    // const searchInputRef = useRef<HTMLInputElement | null>(null); // Search ref commented out
    const [isMapInstanceLoaded, setIsMapInstanceLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentMapClickTarget, setCurrentMapClickTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('pointA');
    const handleActualMapLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[handleActualMapLoad]": (mapInstance)=>{
            mapRef.current = mapInstance;
            if (window.google && window.google.maps && window.google.maps.places /* && searchInputRef.current */ ) {
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
            // // Initialize SearchBox - All SearchBox logic commented out
            // const searchBox = new google.maps.places.SearchBox(searchInputRef.current!);
            // searchBoxRef.current = searchBox;
            // // Ensure parentElement exists before trying to push it.
            // if (searchInputRef.current?.parentElement) {
            //    mapInstance.controls[google.maps.ControlPosition.TOP_CENTER].push(searchInputRef.current.parentElement);
            // }
            // searchBox.addListener('places_changed', () => {
            //     const places = searchBox.getPlaces();
            //     if (!places || places.length === 0) {
            //         return;
            //     }
            //     const bounds = new google.maps.LatLngBounds();
            //     places.forEach(place => {
            //         if (!place.geometry || !place.geometry.location) {
            //         return;
            //         }
            //         if (place.geometry.viewport) {
            //         bounds.union(place.geometry.viewport);
            //         } else {
            //         bounds.extend(place.geometry.location);
            //         }
            //     });
            //     mapRef.current?.fitBounds(bounds);
            // });
            }
            setIsMapInstanceLoaded(true);
        }
    }["InteractiveMap.useCallback[handleActualMapLoad]"], []);
    const handleMapUnmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[handleMapUnmount]": ()=>{
            // if (searchBoxRef.current && window.google && google.maps.event) { // SearchBox cleanup commented out
            //     google.maps.event.clearInstanceListeners(searchBoxRef.current);
            // }
            mapRef.current = null;
            setIsMapInstanceLoaded(false);
        }
    }["InteractiveMap.useCallback[handleMapUnmount]"], []);
    const handleInternalMapClick = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "InteractiveMap.useCallback[handleInternalMapClick]": (event)=>{
            if (onMapClick) {
                onMapClick(event, currentMapClickTarget);
            // setCurrentMapClickTarget(prev => prev === 'pointA' ? 'pointB' : 'pointA');
            }
        }
    }["InteractiveMap.useCallback[handleInternalMapClick]"], [
        onMapClick,
        currentMapClickTarget
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InteractiveMap.useEffect": ()=>{
            if (isMapInstanceLoaded && mapRef.current && links.length > 0) {
                const bounds = new window.google.maps.LatLngBounds();
                let hasValidPoints = false;
                links.forEach({
                    "InteractiveMap.useEffect": (link)=>{
                        if (link.pointA.lat && link.pointA.lng) {
                            bounds.extend(new window.google.maps.LatLng(link.pointA.lat, link.pointA.lng));
                            hasValidPoints = true;
                        }
                        if (link.pointB.lat && link.pointB.lng) {
                            bounds.extend(new window.google.maps.LatLng(link.pointB.lat, link.pointB.lng));
                            hasValidPoints = true;
                        }
                    }
                }["InteractiveMap.useEffect"]);
                if (hasValidPoints && !bounds.isEmpty()) {
                    mapRef.current.fitBounds(bounds, 75);
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
                } else if (!hasValidPoints) {
                    mapRef.current.setCenter(defaultCenter);
                    mapRef.current.setZoom(defaultZoom);
                }
            } else if (isMapInstanceLoaded && mapRef.current && links.length === 0) {
                mapRef.current.setCenter(defaultCenter);
                mapRef.current.setZoom(defaultZoom);
            }
        }
    }["InteractiveMap.useEffect"], [
        links,
        isMapInstanceLoaded
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${mapContainerClassName} relative`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LoadScript"], {
            googleMapsApiKey: GOOGLE_MAPS_API_KEY,
            // libraries={['places']} // 'places' library commented out
            loadingElement: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                        className: "w-12 h-12 animate-spin mb-3"
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 202,
                        columnNumber: 13
                    }, void 0),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-medium",
                        children: "Initializing Map Service..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 203,
                        columnNumber: 13
                    }, void 0)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 201,
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
                options: {
                },
                children: links.map((link, index)=>{
                    const pALat = typeof link.pointA.lat === 'number' ? link.pointA.lat : undefined;
                    const pALng = typeof link.pointA.lng === 'number' ? link.pointA.lng : undefined;
                    const pBLat = typeof link.pointB.lat === 'number' ? link.pointB.lat : undefined;
                    const pBLng = typeof link.pointB.lng === 'number' ? link.pointB.lng : undefined;
                    const markerIconA = getCustomMarkerIcon("A", link.color || LINK_COLORS[0], isMapInstanceLoaded);
                    const markerIconB = getCustomMarkerIcon("B", link.color || LINK_COLORS[0], isMapInstanceLoaded);
                    const isSelected = link.id === selectedLinkId;
                    const polylineColor = link.isDirty ? '#60A5FA' : link.analysisResult?.losPossible ? '#4CAF50' : link.analysisResult ? '#F44336' : '#A9A9A9';
                    let currentDistanceKm = null;
                    if (link.analysisResult && !link.isDirty) {
                        currentDistanceKm = link.analysisResult.distanceKm;
                    } else if (pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined) {
                        currentDistanceKm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$los$2d$calculator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDistanceKm"])({
                            lat: pALat,
                            lng: pALng
                        }, {
                            lat: pBLat,
                            lng: pBLng
                        });
                    }
                    const midPoint = pALat !== undefined && pALng !== undefined && pBLat !== undefined && pBLng !== undefined ? {
                        lat: (pALat + pBLat) / 2,
                        lng: (pALng + pBLng) / 2
                    } : null;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                        children: [
                            pALat !== undefined && pALng !== undefined && markerIconA && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                                        position: {
                                            lat: pALat,
                                            lng: pALng
                                        },
                                        draggable: true,
                                        onDragEnd: (e)=>onMarkerDrag && onMarkerDrag(e, link.id, 'pointA'),
                                        onClick: ()=>onLinkSelect && onLinkSelect(link.id),
                                        icon: markerIconA,
                                        label: {
                                            text: "A",
                                            color: "#333333",
                                            fontWeight: "bold",
                                            fontSize: "11px"
                                        },
                                        zIndex: isSelected ? 10 : 5
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                                        lineNumber: 254,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                                        position: {
                                            lat: pALat,
                                            lng: pALng
                                        },
                                        mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                                        getPixelPositionOffset: getPixelPositionOffset,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(STYLES.mapMarkerLabel, isSelected && "ring-2 ring-offset-2 ring-yellow-400"),
                                            children: link.pointA.name || `Site A (${index + 1})`
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                                            lineNumber: 268,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                                        lineNumber: 263,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true),
                            pBLat !== undefined && pBLng !== undefined && markerIconB && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                                        position: {
                                            lat: pBLat,
                                            lng: pBLng
                                        },
                                        draggable: true,
                                        onDragEnd: (e)=>onMarkerDrag && onMarkerDrag(e, link.id, 'pointB'),
                                        onClick: ()=>onLinkSelect && onLinkSelect(link.id),
                                        icon: markerIconB,
                                        label: {
                                            text: "B",
                                            color: "#333333",
                                            fontWeight: "bold",
                                            fontSize: "11px"
                                        },
                                        zIndex: isSelected ? 10 : 5
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                                        lineNumber: 277,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                                        position: {
                                            lat: pBLat,
                                            lng: pBLng
                                        },
                                        mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                                        getPixelPositionOffset: getPixelPositionOffset,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(STYLES.mapMarkerLabel, isSelected && "ring-2 ring-offset-2 ring-yellow-400"),
                                            children: link.pointB.name || `Site B (${index + 1})`
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/fso/interactive-map.tsx",
                                            lineNumber: 291,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                                        lineNumber: 286,
                                        columnNumber: 21
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
                                    strokeColor: polylineColor,
                                    strokeOpacity: isSelected ? 1 : 0.7,
                                    strokeWeight: isSelected ? 5 : 3.5,
                                    geodesic: true,
                                    zIndex: isSelected ? 3 : 1
                                },
                                onClick: ()=>onLinkSelect && onLinkSelect(link.id)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 299,
                                columnNumber: 19
                            }, this),
                            midPoint && currentDistanceKm !== null && currentDistanceKm !== undefined && isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"], {
                                position: midPoint,
                                mapPaneName: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$google$2d$maps$2f$api$2f$dist$2f$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OverlayView"].OVERLAY_MOUSE_TARGET,
                                getPixelPositionOffset: getDistanceOverlayPositionOffset,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: STYLES.distanceOverlayLabel,
                                    children: currentDistanceKm < 1 ? `${(currentDistanceKm * 1000).toFixed(0)}m` : `${currentDistanceKm.toFixed(1)}km`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/fso/interactive-map.tsx",
                                    lineNumber: 317,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/fso/interactive-map.tsx",
                                lineNumber: 312,
                                columnNumber: 21
                            }, this)
                        ]
                    }, link.id, true, {
                        fileName: "[project]/src/components/fso/interactive-map.tsx",
                        lineNumber: 251,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/fso/interactive-map.tsx",
                lineNumber: 210,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/fso/interactive-map.tsx",
            lineNumber: 197,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/fso/interactive-map.tsx",
        lineNumber: 183,
        columnNumber: 5
    }, this);
}
_s(InteractiveMap, "WxYTMrslTJvJ8/2+ORA+8520mW8=");
_c = InteractiveMap;
// Default link colors if not specified in LOSLink object (should be assigned by context)
const LINK_COLORS = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FF33A1',
    '#A133FF',
    '#33FFA1'
];
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