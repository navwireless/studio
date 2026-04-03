/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { SavedLink } from '@/types';
import {
  Globe2, RotateCcw, ZoomIn, ZoomOut, Pause, Play, X, Eye, EyeOff,
  Map, Satellite, Activity, TrendingUp, ArrowRight, Signal,
  ChevronDown, ChevronUp, Maximize2, Minimize2,
} from 'lucide-react';

const STORAGE_KEY = 'findlos_saved_links';
const CESIUM_CDN = 'https://cesium.com/downloads/cesiumjs/releases/1.120/Build/Cesium';

// ─── Types for Cesium (loaded from CDN) ───
type CesiumViewer = any;
type CesiumEntity = any;

interface LinkInfo {
  link: SavedLink;
  entity: CesiumEntity;
}

type MapStyle = 'satellite' | 'streets' | 'dark';

function loadSavedLinksFromStorage(): SavedLink[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l: SavedLink) =>
        l.id && l.pointA && l.pointB && l.analysisResult &&
        typeof l.pointA.lat === 'number' && typeof l.pointA.lng === 'number' &&
        typeof l.pointB.lat === 'number' && typeof l.pointB.lng === 'number'
    );
  } catch {
    return [];
  }
}

export default function GlobePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CesiumViewer>(null);
  const rotationRef = useRef<(() => void) | null>(null);
  const imageryLayerRef = useRef<any>(null);

  const [links, setLinks] = useState<SavedLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<LinkInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [mapStyle, setMapStyle] = useState<MapStyle>('streets');
  const [linksExpanded, setLinksExpanded] = useState(true);
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Computed stats
  const stats = useMemo(() => {
    if (links.length === 0) return null;
    const feasible = links.filter(l => l.analysisResult.losPossible).length;
    const blocked = links.length - feasible;
    const totalDistance = links.reduce((acc, l) => acc + l.analysisResult.distanceKm, 0);
    const avgDistance = totalDistance / links.length;
    const maxDistance = Math.max(...links.map(l => l.analysisResult.distanceKm));
    const minDistance = Math.min(...links.map(l => l.analysisResult.distanceKm));
    return { feasible, blocked, totalDistance, avgDistance, maxDistance, minDistance };
  }, [links]);

  // Load saved links
  useEffect(() => {
    setLinks(loadSavedLinksFromStorage());
  }, []);

  // Load Cesium from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).Cesium) {
      setIsLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `${CESIUM_CDN}/Widgets/widgets.css`;
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = `${CESIUM_CDN}/Cesium.js`;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => setError('Failed to load CesiumJS. Check your internet connection.');
    document.head.appendChild(script);
  }, []);

  // Initialize Cesium Viewer once loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const Cesium = (window as any).Cesium;
    if (!Cesium) return;

    // Disable Ion (we use open-source tile providers)
    Cesium.Ion.defaultAccessToken = undefined;

    try {
      const viewer = new Cesium.Viewer(containerRef.current, {
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        animation: false,
        navigationHelpButton: false,
        fullscreenButton: false,
        infoBox: false,
        creditContainer: document.createElement('div'),
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        skyAtmosphere: new Cesium.SkyAtmosphere(),
        orderIndependentTranslucency: false,
        imageryProvider: false, // Prevent default Ion imagery (401 without token)
        contextOptions: {
          webgl: { alpha: false },
        },
      });

      // Add OpenStreetMap as initial base layer (free, no API key)
      viewer.imageryLayers.addImageryProvider(
        new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/',
        })
      );

      // Style the globe
      viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#060A10');
      viewer.scene.globe.enableLighting = false;
      viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0A0F18');
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.fog.enabled = true;
      viewer.scene.fog.density = 0.0002;

      // Smoother camera
      viewer.scene.screenSpaceCameraController.enableLook = false;

      viewerRef.current = viewer;

      // Add links as entities
      addLinksToGlobe(viewer, Cesium, links, showLabels);

      // Entity click handler
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((click: any) => {
        const picked = viewer.scene.pick(click.position);
        if (Cesium.defined(picked) && picked.id) {
          const linkData = picked.id._linkData as SavedLink | undefined;
          if (linkData) {
            setSelectedLink({ link: linkData, entity: picked.id });
            viewer.selectedEntity = picked.id;
          }
        } else {
          setSelectedLink(null);
          viewer.selectedEntity = undefined;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Fly to center of links (or India)
      if (links.length > 0) {
        const lats = links.flatMap(l => [l.pointA.lat, l.pointB.lat]);
        const lngs = links.flatMap(l => [l.pointA.lng, l.pointB.lng]);
        const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(centerLng, centerLat, 2500000),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-30), roll: 0 },
          duration: 2.5,
        });
      } else {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(78.96, 20.59, 8000000),
          orientation: { heading: 0, pitch: Cesium.Math.toRadians(-25), roll: 0 },
          duration: 2.5,
        });
      }

      // Auto-rotation
      startRotation(viewer, Cesium);

      return () => {
        stopRotation();
        handler.destroy();
        if (!viewer.isDestroyed()) viewer.destroy();
        viewerRef.current = null;
      };
    } catch (e) {
      console.error('Cesium init failed:', e);
      setError('Failed to initialize 3D globe. Your browser may not support WebGL.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, links]);

  // Toggle rotation
  useEffect(() => {
    if (!viewerRef.current || !isLoaded) return;
    const Cesium = (window as any).Cesium;
    if (isRotating) {
      startRotation(viewerRef.current, Cesium);
    } else {
      stopRotation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRotating, isLoaded]);

  // Change map style
  const mapStyleInitRef = useRef(false);
  useEffect(() => {
    if (!viewerRef.current || !isLoaded) return;
    // Skip on first mount — the init effect already sets up OSM
    if (!mapStyleInitRef.current) {
      mapStyleInitRef.current = true;
      return;
    }
    const Cesium = (window as any).Cesium;
    const viewer = viewerRef.current;

    viewer.imageryLayers.removeAll();

    let provider;
    switch (mapStyle) {
      case 'satellite':
        // ESRI World Imagery (free satellite tiles, no API key)
        provider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          credit: 'Esri, Maxar, Earthstar Geographics',
          maximumLevel: 19,
        });
        break;
      case 'streets':
        provider = new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/',
        });
        break;
      case 'dark':
        // CartoDB Dark (free dark tiles, great for data viz)
        provider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          subdomains: 'abcd',
          credit: 'CartoDB',
        });
        break;
    }

    if (provider) {
      imageryLayerRef.current = viewer.imageryLayers.addImageryProvider(provider);
    }

    // Add road/city labels overlay on satellite view
    if (mapStyle === 'satellite') {
      viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
          subdomains: 'abcd',
          credit: 'CartoDB',
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapStyle, isLoaded]);

  function startRotation(viewer: CesiumViewer, Cesium: any) {
    stopRotation();
    rotationRef.current = viewer.scene.postRender.addEventListener(() => {
      viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(-0.15 * 0.016));
    });
  }

  function stopRotation() {
    if (rotationRef.current !== null) {
      rotationRef.current();
      rotationRef.current = null;
    }
  }

  const handleZoomIn = () => {
    if (!viewerRef.current) return;
    const camera = viewerRef.current.camera;
    camera.zoomIn(camera.positionCartographic.height * 0.3);
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    const camera = viewerRef.current.camera;
    camera.zoomOut(camera.positionCartographic.height * 0.3);
  };

  const handleResetView = () => {
    if (!viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    if (links.length > 0) {
      const lats = links.flatMap(l => [l.pointA.lat, l.pointB.lat]);
      const lngs = links.flatMap(l => [l.pointA.lng, l.pointB.lng]);
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(centerLng, centerLat, 2000000),
        duration: 1.5,
      });
    } else {
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(78.96, 20.59, 8000000),
        duration: 1.5,
      });
    }
  };

  const handleToggleLabels = () => {
    setShowLabels(prev => {
      const newVal = !prev;
      if (viewerRef.current) {
        const entities = viewerRef.current.entities.values;
        for (const entity of entities) {
          if (entity.label) {
            entity.label.show = newVal;
          }
        }
      }
      return newVal;
    });
  };

  const handleFlyToLink = (link: SavedLink) => {
    if (!viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const midLat = (link.pointA.lat + link.pointB.lat) / 2;
    const midLng = (link.pointA.lng + link.pointB.lng) / 2;
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(midLng, midLat, 80000),
      orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
      duration: 1.5,
    });
    setIsRotating(false);
    // Find and select the entity
    const entities = viewerRef.current.entities.values;
    for (const entity of entities) {
      if (entity._linkData?.id === link.id) {
        setSelectedLink({ link, entity });
        viewerRef.current.selectedEntity = entity;
        break;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (error) {
    return (
      <div className="h-screen w-screen bg-[#060A10] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <Globe2 className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Globe Error</h1>
          <p className="text-slate-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#060A10] relative overflow-hidden select-none">
      {/* Cesium container */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#060A10] flex items-center justify-center z-50">
          <div className="text-center">
            <div className="relative">
              <Globe2 className="h-20 w-20 text-blue-500/30 mx-auto" />
              <Globe2 className="h-20 w-20 text-blue-500 mx-auto absolute inset-0 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h1 className="text-xl font-bold text-white mt-6 mb-2">Loading FindLOS Globe</h1>
            <p className="text-slate-400 text-sm">Initializing 3D visualization engine...</p>
            <div className="mt-4 w-48 mx-auto h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOP BAR ═══ */}
      {isLoaded && (
        <div className="absolute top-3 left-3 right-3 z-30 flex items-start justify-between pointer-events-none gap-3">
          {/* Title + Stats */}
          <div className="pointer-events-auto flex flex-col gap-2">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-slate-700/50 shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Globe2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white leading-none">FindLOS Globe</h1>
                <p className="text-[0.6rem] text-slate-400 mt-0.5">
                  {links.length} link{links.length !== 1 ? 's' : ''} ·{' '}
                  {stats ? `${stats.feasible} feasible, ${stats.blocked} blocked` : 'No data'}
                </p>
              </div>
            </div>

            {/* Quick Stats Cards */}
            {stats && (
              <div
                className="bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden transition-all duration-300"
                style={{ maxHeight: statsExpanded ? '200px' : '0px', opacity: statsExpanded ? 1 : 0 }}
              >
                <div className="p-3 grid grid-cols-3 gap-2">
                  <StatCard icon={<Signal className="h-3 w-3" />} label="Total" value={`${links.length}`} color="blue" />
                  <StatCard icon={<Activity className="h-3 w-3" />} label="Feasible" value={`${stats.feasible}`} color="green" />
                  <StatCard icon={<TrendingUp className="h-3 w-3" />} label="Range" value={`${stats.minDistance.toFixed(1)}-${stats.maxDistance.toFixed(1)}km`} color="cyan" />
                </div>
                <div className="px-3 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.feasible / links.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[0.55rem] text-slate-400 font-medium tabular-nums">
                      {Math.round((stats.feasible / links.length) * 100)}% LOS
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Style + Actions */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* Map style buttons */}
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-lg border border-slate-700/50 flex overflow-hidden">
              <MapStyleBtn active={mapStyle === 'satellite'} onClick={() => setMapStyle('satellite')} icon={<Satellite className="h-3.5 w-3.5" />} label="Satellite" />
              <MapStyleBtn active={mapStyle === 'streets'} onClick={() => setMapStyle('streets')} icon={<Map className="h-3.5 w-3.5" />} label="Streets" />
              <MapStyleBtn active={mapStyle === 'dark'} onClick={() => setMapStyle('dark')} icon={<Globe2 className="h-3.5 w-3.5" />} label="Dark" />
            </div>

            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all shadow-lg"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={() => window.close()}
              className="w-9 h-9 rounded-lg bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500/20 transition-all shadow-lg"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══ RIGHT CONTROLS ═══ */}
      {isLoaded && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1">
          <ControlButton icon={isRotating ? Pause : Play} label={isRotating ? 'Pause' : 'Spin'} onClick={() => setIsRotating(prev => !prev)} active={isRotating} />
          <div className="h-px bg-slate-700/50 mx-1" />
          <ControlButton icon={ZoomIn} label="Zoom In" onClick={handleZoomIn} />
          <ControlButton icon={ZoomOut} label="Zoom Out" onClick={handleZoomOut} />
          <ControlButton icon={RotateCcw} label="Reset" onClick={handleResetView} />
          <div className="h-px bg-slate-700/50 mx-1" />
          <ControlButton icon={showLabels ? Eye : EyeOff} label={showLabels ? 'Labels On' : 'Labels Off'} onClick={handleToggleLabels} active={showLabels} />
          {stats && (
            <ControlButton icon={statsExpanded ? ChevronUp : ChevronDown} label={statsExpanded ? 'Hide Stats' : 'Show Stats'} onClick={() => setStatsExpanded(p => !p)} active={statsExpanded} />
          )}
        </div>
      )}

      {/* ═══ LINKS LIST (left) ═══ */}
      {isLoaded && links.length > 0 && (
        <div className="absolute left-3 bottom-3 z-30 w-72 max-h-[50vh]">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl flex flex-col max-h-[50vh]">
            {/* Header */}
            <button
              onClick={() => setLinksExpanded(p => !p)}
              className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Signal className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-white">
                  Links ({links.length})
                </span>
              </div>
              {linksExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronUp className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {/* Link list */}
            {linksExpanded && (
              <div className="overflow-y-auto flex-1 p-1.5 space-y-0.5" style={{ scrollbarWidth: 'thin', maxHeight: '40vh' }}>
                {links.map(link => (
                  <button
                    key={link.id}
                    onClick={() => handleFlyToLink(link)}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all group ${
                      selectedLink?.link.id === link.id
                        ? 'bg-blue-500/15 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                        : 'border border-transparent hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Status dot */}
                    <div className="flex flex-col items-center gap-1 pt-0.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-slate-900/90 flex-shrink-0 ${
                          link.analysisResult.losPossible ? 'ring-emerald-600' : 'ring-red-600'
                        }`}
                        style={{
                          backgroundColor: link.analysisResult.losPossible ? '#4ADE80' : '#F87171',
                        }}
                      />
                      <div className="w-px h-4 bg-slate-700/50" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Link name */}
                      <div className="text-[0.7rem] text-white font-semibold truncate leading-tight">{link.name}</div>

                      {/* Route */}
                      <div className="flex items-center gap-1 mt-0.5 text-[0.55rem] text-slate-400">
                        <span className="truncate max-w-[80px]">{link.pointA.name}</span>
                        <ArrowRight className="h-2.5 w-2.5 flex-shrink-0 text-slate-600" />
                        <span className="truncate max-w-[80px]">{link.pointB.name}</span>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[0.55rem] font-bold ${link.analysisResult.losPossible ? 'text-emerald-400' : 'text-red-400'}`}>
                          {link.analysisResult.losPossible ? '✓ LOS' : '✗ BLOCKED'}
                        </span>
                        <span className="text-[0.5rem] text-slate-600">·</span>
                        <span className="text-[0.55rem] text-slate-400 tabular-nums">{link.analysisResult.distanceKm.toFixed(2)} km</span>
                        {link.analysisResult.minClearance != null && (
                          <>
                            <span className="text-[0.5rem] text-slate-600">·</span>
                            <span className="text-[0.55rem] text-slate-400 tabular-nums">{link.analysisResult.minClearance.toFixed(1)}m clr</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Fly-to arrow */}
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-blue-400 transition-colors mt-0.5 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ SELECTED LINK DETAIL ═══ */}
      {selectedLink && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40" style={{ marginLeft: links.length > 0 ? '100px' : '0' }}>
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl p-4 min-w-[320px] max-w-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-offset-1 ring-offset-slate-900"
                  style={{ backgroundColor: selectedLink.link.color }}
                />
                <span className="text-sm font-bold text-white">{selectedLink.link.name}</span>
                <span className={`text-[0.55rem] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedLink.link.analysisResult.losPossible
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30'
                }`}>
                  {selectedLink.link.analysisResult.losPossible ? 'FEASIBLE' : 'BLOCKED'}
                </span>
              </div>
              <button onClick={() => setSelectedLink(null)} className="text-slate-500 hover:text-white transition p-1 -mr-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Route visualization */}
            <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-slate-800/50 rounded-lg">
              <div className="flex-1 text-center">
                <div className="text-[0.55rem] text-slate-500 uppercase tracking-wider">Site A</div>
                <div className="text-xs text-white font-medium truncate">{selectedLink.link.pointA.name}</div>
                <div className="text-[0.55rem] text-slate-400">{selectedLink.link.pointA.towerHeight}m tower</div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="text-[0.55rem] text-blue-400 font-bold tabular-nums">
                  {selectedLink.link.analysisResult.distanceKm.toFixed(2)} km
                </div>
                <div className="w-12 h-px bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400" />
              </div>
              <div className="flex-1 text-center">
                <div className="text-[0.55rem] text-slate-500 uppercase tracking-wider">Site B</div>
                <div className="text-xs text-white font-medium truncate">{selectedLink.link.pointB.name}</div>
                <div className="text-[0.55rem] text-slate-400">{selectedLink.link.pointB.towerHeight}m tower</div>
              </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <DetailCell label="Distance" value={`${selectedLink.link.analysisResult.distanceKm.toFixed(2)} km`} />
              {selectedLink.link.analysisResult.minClearance != null && (
                <DetailCell label="Clearance" value={`${selectedLink.link.analysisResult.minClearance.toFixed(1)} m`} />
              )}
              <DetailCell label="Threshold" value={`${selectedLink.link.clearanceThreshold} m`} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ NO LINKS MESSAGE ═══ */}
      {isLoaded && links.length === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-700/50 px-8 py-5 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
              <Globe2 className="h-6 w-6 text-slate-600" />
            </div>
            <p className="text-sm text-white font-semibold">No saved links yet</p>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
              Analyze FSO links on the main page and save them to visualize on this 3D globe
            </p>
          </div>
        </div>
      )}

      {/* ═══ ATTRIBUTION ═══ */}
      {isLoaded && (
        <div className="absolute bottom-1 right-2 z-20 text-[0.45rem] text-slate-600/50 pointer-events-none">
          © OpenStreetMap · CesiumJS · FindLOS
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'blue' | 'green' | 'cyan' }) {
  const colors = {
    blue: 'from-blue-500/15 to-blue-600/5 border-blue-500/20 text-blue-400',
    green: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    cyan: 'from-cyan-500/15 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
  };
  return (
    <div className={`bg-gradient-to-b ${colors[color]} border rounded-lg p-2 text-center`}>
      <div className="flex items-center justify-center gap-1 mb-0.5">
        {icon}
        <span className="text-[0.5rem] uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <div className="text-xs font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}

function MapStyleBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`px-2.5 py-2 flex items-center gap-1.5 text-[0.6rem] font-medium transition-all ${
        active
          ? 'bg-blue-500/20 text-blue-400'
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ControlButton({icon: Icon, label, onClick, active}: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-9 h-9 rounded-lg backdrop-blur-xl border flex items-center justify-center transition-all shadow-lg ${
        active
          ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
          : 'bg-slate-900/90 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800/80'
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-1.5">
      <div className="text-[0.5rem] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-[0.65rem] font-bold text-white tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

// ─── Add Links to Globe ───
function addLinksToGlobe(viewer: CesiumViewer, Cesium: any, links: SavedLink[], showLabels: boolean) {
  viewer.entities.removeAll();

  links.forEach((link, idx) => {
    const color = Cesium.Color.fromCssColorString(link.color);
    const isLOS = link.analysisResult.losPossible;
    const statusColor = isLOS
      ? Cesium.Color.fromCssColorString('#4ADE80')
      : Cesium.Color.fromCssColorString('#F87171');

    // Calculate midpoint for link label
    const midLat = (link.pointA.lat + link.pointB.lat) / 2;
    const midLng = (link.pointA.lng + link.pointB.lng) / 2;
    const midHeight = Math.max(link.pointA.towerHeight, link.pointB.towerHeight) * 50 + 5000;

    // Arc between sites — thick glowing line
    const arcEntity = viewer.entities.add({
      name: link.name,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          link.pointA.lng, link.pointA.lat, link.pointA.towerHeight * 80,
          midLng, midLat, midHeight,
          link.pointB.lng, link.pointB.lat, link.pointB.towerHeight * 80,
        ]),
        width: 4,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          taperPower: 0.5,
          color: color.withAlpha(0.85),
        }),
      },
    });
    arcEntity._linkData = link;
    arcEntity._linkIdx = idx;

    // Link name label at midpoint
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(midLng, midLat, midHeight + 2000),
      label: {
        text: `${link.name}\n${link.analysisResult.distanceKm.toFixed(1)} km`,
        font: '12px Inter, -apple-system, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0, -8),
        show: showLabels,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 600000),
        scaleByDistance: new Cesium.NearFarScalar(50000, 1.0, 500000, 0.5),
      },
    });

    // Site A marker + label
    viewer.entities.add({
      name: `${link.name} ─ ${link.pointA.name}`,
      position: Cesium.Cartesian3.fromDegrees(link.pointA.lng, link.pointA.lat, link.pointA.towerHeight * 80),
      point: {
        pixelSize: 10,
        color: statusColor,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE,
      },
      label: showLabels ? {
        text: link.pointA.name || 'Site A',
        font: '11px Inter, -apple-system, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
        show: true,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 400000),
        scaleByDistance: new Cesium.NearFarScalar(20000, 1.0, 400000, 0.4),
      } : undefined,
    });

    // Tower pole for Site A (vertical line from ground to tower top)
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          link.pointA.lng, link.pointA.lat, 0,
          link.pointA.lng, link.pointA.lat, link.pointA.towerHeight * 80,
        ]),
        width: 1.5,
        material: statusColor.withAlpha(0.4),
      },
    });

    // Site B marker + label
    viewer.entities.add({
      name: `${link.name} ─ ${link.pointB.name}`,
      position: Cesium.Cartesian3.fromDegrees(link.pointB.lng, link.pointB.lat, link.pointB.towerHeight * 80),
      point: {
        pixelSize: 10,
        color: statusColor,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.NONE,
      },
      label: showLabels ? {
        text: link.pointB.name || 'Site B',
        font: '11px Inter, -apple-system, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
        show: true,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 400000),
        scaleByDistance: new Cesium.NearFarScalar(20000, 1.0, 400000, 0.4),
      } : undefined,
    });

    // Tower pole for Site B
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          link.pointB.lng, link.pointB.lat, 0,
          link.pointB.lng, link.pointB.lat, link.pointB.towerHeight * 80,
        ]),
        width: 1.5,
        material: statusColor.withAlpha(0.4),
      },
    });

    // Ground track (shadow on surface)
    viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          link.pointA.lng, link.pointA.lat,
          link.pointB.lng, link.pointB.lat,
        ]),
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: color.withAlpha(0.35),
          dashLength: 12,
        }),
        clampToGround: true,
      },
    });
  });
}
