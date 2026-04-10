// src/hooks/use-map-tools.ts
// Phase 12B — Tool state management hook
// Updated to use new 12B tool handlers + kept old tools (screenshot, grid)

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  MapToolId,
  ToolResult,
  ToolState,
  ToolHandler,
  ToolActivateOptions,
} from '@/types/map-tools';
import { MAP_TOOLS, MAX_TOOL_RESULTS } from '@/types/map-tools';
import { cleanupOverlays } from '@/components/map/tools/tool-utils';

// ─── Phase 12B tool imports (direct handler objects) ────────────────
import { multiMeasure } from '@/components/map/tools/multi-measure';
import { measureArea } from '@/components/map/tools/measure-area';
import { rangeRings } from '@/components/map/tools/range-rings';
import { placemark } from '@/components/map/tools/placemark';
import { elevationProbe } from '@/components/map/tools/elevation-probe';
import { coordTool } from '@/components/map/tools/coord-tool';
import { solarAnalyzer } from '@/components/map/tools/solar-analyzer';

// Phase 12D — Field Tools
import { weatherProbe } from '@/components/map/tools/weather-probe';
import { compassTool } from '@/components/map/tools/compass-tool';
import { alignmentGuide } from '@/components/map/tools/alignment-guide';
import { fieldNotes } from '@/components/map/tools/field-notes';
import { levelTool } from '@/components/map/tools/level-tool';

// ─── Kept Phase 11 tool imports (factory functions) ─────────────────
import { createMapScreenshotHandler } from '@/components/map/tools/map-screenshot';
import { createGridOverlayHandler } from '@/components/map/tools/grid-overlay';

export interface UseMapToolsConfig {
  /** Reference to the Google Map instance */
  getMap: () => google.maps.Map | null;
  /** Callback when a tool requires exclusive map click handling */
  onToolActiveChange?: (isToolActive: boolean) => void;
  /** Get currently selected device range in meters (for range rings tool) */
  getDeviceRangeMeters?: () => number;
  /** Get device name (for range rings tool) */
  getDeviceName?: () => string | null;
}

export interface UseMapToolsReturn {
  /** Current tool state */
  state: ToolState;
  /** Activate a tool (or deactivate if same tool) */
  toggleTool: (toolId: MapToolId) => void;
  /** Deactivate current tool */
  deactivateTool: () => void;
  /** Handle a map click event (delegates to active tool) */
  handleToolClick: (latLng: google.maps.LatLng) => void;
  /** Handle a map double-click event */
  handleToolDoubleClick: (latLng: google.maps.LatLng) => void;
  /** Current status message from active tool */
  statusMessage: string | null;
  /** Latest result from last tool action */
  latestResult: ToolResult | null;
  /** Clear the latest result display */
  clearLatestResult: () => void;
  /** Clear all tool overlays from map */
  clearAllOverlays: () => void;
  /** Get cursor style for current tool */
  getToolCursor: () => string;
  /** Whether any tool is currently active */
  isToolActive: boolean;
  /** Whether the grid overlay is visible */
  gridVisible: boolean;
  /** Whether active tool supports an explicit finish action */
  canFinishActiveTool: boolean;
  /** Explicitly finish current tool flow (mobile-friendly replacement for double-click) */
  finishActiveTool: () => void;
  /** Results with stable keys and current visibility state for drawing manager UI */
  managedResults: Array<{ key: string; result: ToolResult; visible: boolean }>;
  /** Toggle visibility of a saved tool result overlay set */
  toggleResultVisibility: (key: string) => void;
  /** Remove one saved tool result overlay set */
  removeResult: (key: string) => void;
  /** Update data fields of a saved tool result (e.g., rename placemark) */
  updateResultData: (key: string, updates: Record<string, unknown>) => void;
}

interface PersistedToolResult {
  toolId: MapToolId;
  timestamp: number;
  data: Record<string, unknown>;
  hidden?: boolean;
}

const PERSIST_KEY = 'findlos_map_tool_results_v1';
const PERSISTABLE_TOOL_IDS = new Set<MapToolId>([
  'placemark',
  'measure-area',
  'range-rings',
  'multi-measure',
]);

function getResultKey(result: ToolResult): string {
  return `${result.toolId}:${result.timestamp}`;
}

function setOverlaysMap(overlays: google.maps.MVCObject[], map: google.maps.Map | null): void {
  overlays.forEach((overlay) => {
    if ('setMap' in overlay && typeof (overlay as google.maps.Marker).setMap === 'function') {
      (overlay as google.maps.Marker).setMap(map);
    }
  });
}

function loadPersistedResults(): PersistedToolResult[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is PersistedToolResult => {
        if (!item || typeof item !== 'object') return false;
        const candidate = item as Record<string, unknown>;
        return (
          typeof candidate.toolId === 'string' &&
          typeof candidate.timestamp === 'number' &&
          candidate.data !== null &&
          typeof candidate.data === 'object'
        );
      })
      .slice(0, MAX_TOOL_RESULTS);
  } catch {
    return [];
  }
}

function persistResults(results: ToolResult[], hiddenKeys: Set<string>): void {
  if (typeof window === 'undefined') return;

  const serializable: PersistedToolResult[] = results
    .filter((result) => {
      if (!PERSISTABLE_TOOL_IDS.has(result.toolId)) return false;
      const isFinal = result.data.isFinal as boolean | undefined;
      return isFinal !== false;
    })
    .slice(0, MAX_TOOL_RESULTS)
    .map((result) => {
      const key = getResultKey(result);
      return {
        toolId: result.toolId,
        timestamp: result.timestamp,
        data: result.data,
        hidden: hiddenKeys.has(key),
      };
    });

  try {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore quota/unavailable storage failures.
  }
}

function restoreResultOverlays(
  persisted: PersistedToolResult,
  map: google.maps.Map,
): google.maps.MVCObject[] {
  const overlays: google.maps.MVCObject[] = [];
  const data = persisted.data;

  if (persisted.toolId === 'placemark') {
    const placemarks = Array.isArray(data.allPlacemarks)
      ? (data.allPlacemarks as Array<Record<string, unknown>>)
      : [];

    placemarks.forEach((placemark, index) => {
      const lat = typeof placemark.lat === 'number' ? placemark.lat : null;
      const lng = typeof placemark.lng === 'number' ? placemark.lng : null;
      if (lat === null || lng === null) return;

      const marker = new google.maps.Marker({
        map,
        position: { lat, lng },
        label: {
          text: String(index + 1),
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 'bold',
        },
      });
      overlays.push(marker);
    });

    return overlays;
  }

  if (persisted.toolId === 'measure-area') {
    const vertices = Array.isArray(data.vertices)
      ? (data.vertices as Array<Record<string, unknown>>)
      : [];
    const path = vertices
      .map((v) => ({
        lat: typeof v.lat === 'number' ? v.lat : null,
        lng: typeof v.lng === 'number' ? v.lng : null,
      }))
      .filter((p): p is { lat: number; lng: number } => p.lat !== null && p.lng !== null);

    if (path.length >= 3) {
      const polygon = new google.maps.Polygon({
        map,
        paths: path,
        strokeColor: '#22d3ee',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#22d3ee33',
        fillOpacity: 0.2,
        clickable: false,
      });
      overlays.push(polygon);
    }

    return overlays;
  }

  if (persisted.toolId === 'range-rings') {
    const centerLat = typeof data.centerLat === 'number' ? data.centerLat : null;
    const centerLng = typeof data.centerLng === 'number' ? data.centerLng : null;
    const radiusRaw = typeof data.radiusRaw === 'number' ? data.radiusRaw : null;

    if (centerLat !== null && centerLng !== null && radiusRaw !== null && radiusRaw > 0) {
      const circle = new google.maps.Circle({
        map,
        center: { lat: centerLat, lng: centerLng },
        radius: radiusRaw,
        strokeColor: '#f97316',
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: '#f9731633',
        fillOpacity: 0.16,
        clickable: false,
      });
      overlays.push(circle);
    }

    return overlays;
  }

  if (persisted.toolId === 'multi-measure') {
    const points = Array.isArray(data.points)
      ? (data.points as Array<Record<string, unknown>>)
      : [];

    const path = points
      .map((p) => ({
        lat: typeof p.lat === 'number' ? p.lat : null,
        lng: typeof p.lng === 'number' ? p.lng : null,
      }))
      .filter((p): p is { lat: number; lng: number } => p.lat !== null && p.lng !== null);

    if (path.length >= 2) {
      const polyline = new google.maps.Polyline({
        map,
        path,
        strokeColor: '#4ade80',
        strokeOpacity: 1,
        strokeWeight: 3,
        clickable: false,
      });
      overlays.push(polyline);

      path.forEach((point, index) => {
        const marker = new google.maps.Marker({
          map,
          position: point,
          label: {
            text: String(index + 1),
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 'bold',
          },
        });
        overlays.push(marker);
      });
    }
  }

  return overlays;
}

// ─── Handler Resolution ─────────────────────────────────────────────
// New 12B tools are direct objects; old tools need factory instantiation.
// We cache everything in handlersRef so factories are called only once.

function resolveHandler(toolId: MapToolId): ToolHandler | null {
  switch (toolId) {
    // Phase 12B — direct handler objects
    case 'multi-measure':
      return multiMeasure;
    case 'measure-area':
      return measureArea;
    case 'range-rings':
      return rangeRings;
    case 'placemark':
      return placemark;
    case 'elevation-probe':
      return elevationProbe;
    case 'coord-tool':
      return coordTool;
    // Phase 11 — factory-created handlers
    case 'map-screenshot':
      return createMapScreenshotHandler();
    case 'grid-overlay':
      return createGridOverlayHandler();
    // Phase 12C — Solar Interference
    case 'solar-analyzer':
      return solarAnalyzer;
    // Phase 12D — Field Tools
    case 'weather-probe':
      return weatherProbe;
    case 'compass-tool':
      return compassTool;
    case 'alignment-guide':
      return alignmentGuide;
    case 'field-notes':
      return fieldNotes;
    case 'level-tool':
      return levelTool;
    default:
      return null;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────

export function useMapTools(config: UseMapToolsConfig): UseMapToolsReturn {
  const [state, setState] = useState<ToolState>({
    activeTool: null,
    results: [],
    isProcessing: false,
    clickPoints: [],
    gridVisible: false,
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<ToolResult | null>(null);
  const [hiddenResultKeys, setHiddenResultKeys] = useState<Set<string>>(new Set());
  const hydratedRef = useRef(false);

  // Handler cache — created lazily
  const handlersRef = useRef<Map<MapToolId, ToolHandler>>(new Map());

  const getHandler = useCallback((toolId: MapToolId): ToolHandler | null => {
    const existing = handlersRef.current.get(toolId);
    if (existing) return existing;

    const handler = resolveHandler(toolId);
    if (handler) {
      handlersRef.current.set(toolId, handler);
    }
    return handler;
  }, []);

  useEffect(() => {
    if (hydratedRef.current) return;

    const map = config.getMap();
    if (!map) return;

    const persisted = loadPersistedResults();
    const restored: ToolResult[] = persisted
      .map((item) => {
        const overlays = restoreResultOverlays(item, map);
        if (!overlays.length) return null;

        return {
          toolId: item.toolId,
          timestamp: item.timestamp,
          data: item.data,
          overlays,
        } as ToolResult;
      })
      .filter((result): result is ToolResult => !!result)
      .slice(0, MAX_TOOL_RESULTS);

    const hidden = new Set(
      persisted
        .filter((item) => item.hidden)
        .map((item) => `${item.toolId}:${item.timestamp}`),
    );

    restored.forEach((result) => {
      const key = getResultKey(result);
      if (hidden.has(key)) {
        setOverlaysMap(result.overlays, null);
      }
    });

    setState((prev) => ({
      ...prev,
      results: restored,
    }));
    setHiddenResultKeys(hidden);
    hydratedRef.current = true;
  }, [config]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    persistResults(state.results, hiddenResultKeys);
  }, [state.results, hiddenResultKeys]);

  const buildActivateOptions = useCallback((): ToolActivateOptions | null => {
    const map = config.getMap();
    if (!map) return null;

    return {
      map,
      onResult: (result: ToolResult) => {
        setLatestResult(result);

        // Live inclinometer updates are high-frequency stream events.
        // Keep them out of persisted/history state to prevent render churn.
        if (result.toolId === 'level-tool' && result.data.live === true) {
          return;
        }

        setState((prev) => {
          const newResults = [result, ...prev.results].slice(0, MAX_TOOL_RESULTS);

          // Track grid visibility
          let gridVisible = prev.gridVisible;
          if (result.toolId === 'grid-overlay') {
            gridVisible = result.data.visible as boolean;
          }

          // For non-persistent tools, deactivate after result
          const toolDef = MAP_TOOLS.find((t) => t.id === result.toolId);
          const isFinal = result.data.isFinal as boolean | undefined;
          const shouldDeactivate = toolDef && !toolDef.persistent && isFinal !== false;

          return {
            ...prev,
            results: newResults,
            gridVisible,
            activeTool: shouldDeactivate ? null : prev.activeTool,
            clickPoints: shouldDeactivate ? [] : prev.clickPoints,
          };
        });
      },
      onStatusChange: (status: string) => {
        setStatusMessage(status);
      },
      onProcessingChange: (isProcessing: boolean) => {
        setState((prev) => ({ ...prev, isProcessing }));
      },
      addClickPoint: (point: google.maps.LatLng) => {
        setState((prev) => ({
          ...prev,
          clickPoints: [...prev.clickPoints, point],
        }));
      },
      getClickPoints: () => state.clickPoints,
    };
  }, [config, state.clickPoints]);

  const deactivateTool = useCallback(() => {
    if (state.activeTool) {
      const handler = handlersRef.current.get(state.activeTool);
      if (handler) {
        handler.deactivate();
      }
    }
    setState((prev) => ({
      ...prev,
      activeTool: null,
      clickPoints: [],
      isProcessing: false,
    }));
    setStatusMessage(null);
    config.onToolActiveChange?.(false);
  }, [state.activeTool, config]);

  const toggleTool = useCallback(
    (toolId: MapToolId) => {
      const map = config.getMap();
      if (!map) return;

      // Ensure level sensor stream never survives when another tool is selected.
      if (toolId !== 'level-tool') {
        const levelHandler = handlersRef.current.get('level-tool');
        levelHandler?.deactivate();
      }

      // If same tool is active, deactivate it
      if (state.activeTool === toolId) {
        // Special case: persistent tools toggle (e.g. grid)
        const toolDef = MAP_TOOLS.find((t) => t.id === toolId);
        if (toolDef?.persistent) {
          const handler = getHandler(toolId);
          const options = buildActivateOptions();
          if (handler && options) {
            handler.activate(options);
          }
          return;
        }
        deactivateTool();
        return;
      }

      // Deactivate previous tool first
      if (state.activeTool) {
        const prevHandler = handlersRef.current.get(state.activeTool);
        if (prevHandler) {
          prevHandler.deactivate();
        }
      }

      // Activate new tool
      const handler = getHandler(toolId);
      if (!handler) {
        console.warn(`No handler found for tool: ${toolId}`);
        return;
      }

      const toolDef = MAP_TOOLS.find((t) => t.id === toolId);

      setState((prev) => ({
        ...prev,
        activeTool: toolDef?.requiresClicks === 0 ? null : toolId,
        clickPoints: [],
        isProcessing: false,
      }));

      setLatestResult(null);
      setStatusMessage(null);

      const options = buildActivateOptions();
      if (options) {
        const freshOptions: ToolActivateOptions = {
          ...options,
          map,
        };
        handler.activate(freshOptions);

        if (toolDef?.requiresClicks !== 0) {
          config.onToolActiveChange?.(true);
        }
      }
    },
    [state.activeTool, config, getHandler, buildActivateOptions, deactivateTool],
  );

  const handleToolClick = useCallback(
    (latLng: google.maps.LatLng) => {
      if (!state.activeTool) return;
      const handler = handlersRef.current.get(state.activeTool);
      if (!handler) return;

      const options = buildActivateOptions();
      if (!options) return;

      try {
        handler.handleClick(latLng, options);
      } catch (error) {
        console.error(`Tool error (${state.activeTool}):`, error);
        setStatusMessage('Tool error occurred. Please try again.');
        setState((prev) => ({ ...prev, activeTool: null, isProcessing: false }));
        
        // Show error toast if available
        if (typeof window !== 'undefined' && 'toast' in window) {
          // @ts-expect-error - toast may be available globally
          window.toast?.({
            title: 'Tool Error',
            description: 'An error occurred. The tool has been reset.',
            variant: 'destructive',
          });
        }
      }
    },
    [state.activeTool, buildActivateOptions],
  );

  const handleToolDoubleClick = useCallback(
    (latLng: google.maps.LatLng) => {
      if (!state.activeTool) return;
      const handler = handlersRef.current.get(state.activeTool);
      if (!handler?.handleDoubleClick) return;

      const options = buildActivateOptions();
      if (!options) return;

      try {
        handler.handleDoubleClick(latLng, options);
      } catch (error) {
        console.error(`Tool error (${state.activeTool}):`, error);
        setStatusMessage('Tool error occurred. Please try again.');
        setState((prev) => ({ ...prev, activeTool: null, isProcessing: false }));
      }
    },
    [state.activeTool, buildActivateOptions],
  );

  const clearLatestResult = useCallback(() => {
    setLatestResult(null);
  }, []);

  const clearAllOverlays = useCallback(() => {
    state.results.forEach((result) => {
      cleanupOverlays(result.overlays);
    });
    setState((prev) => ({
      ...prev,
      results: [],
    }));
    setHiddenResultKeys(new Set());
    setLatestResult(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PERSIST_KEY);
    }
  }, [state.results]);

  const toggleResultVisibility = useCallback((key: string) => {
    const map = config.getMap();
    const target = state.results.find((r) => getResultKey(r) === key);
    if (!target) return;

    setHiddenResultKeys((prev) => {
      const next = new Set(prev);
      const willHide = !next.has(key);
      if (willHide) {
        setOverlaysMap(target.overlays, null);
        next.add(key);
      } else {
        setOverlaysMap(target.overlays, map ?? null);
        next.delete(key);
      }
      return next;
    });
  }, [config, state.results]);

  const removeResult = useCallback((key: string) => {
    const target = state.results.find((r) => getResultKey(r) === key);
    if (!target) return;

    cleanupOverlays(target.overlays);
    setState((prev) => ({
      ...prev,
      results: prev.results.filter((r) => getResultKey(r) !== key),
    }));
    setHiddenResultKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setLatestResult((prev) => (prev && getResultKey(prev) === key ? null : prev));
  }, [state.results]);

  // Phase 4: Update result data for inline editing (rename, color change)
  const updateResultData = useCallback((key: string, updates: Record<string, unknown>) => {
    setState((prev) => ({
      ...prev,
      results: prev.results.map((r) => {
        if (getResultKey(r) !== key) return r;
        return {
          ...r,
          data: { ...r.data, ...updates },
        };
      }),
    }));
    // Also update latest result if it matches
    setLatestResult((prev) => {
      if (!prev || getResultKey(prev) !== key) return prev;
      return { ...prev, data: { ...prev.data, ...updates } };
    });
  }, []);

  const canFinishActiveTool = !!(
    state.activeTool && handlersRef.current.get(state.activeTool)?.handleDoubleClick
  );

  const finishActiveTool = useCallback(() => {
    if (!state.activeTool) return;
    const handler = handlersRef.current.get(state.activeTool);
    if (!handler?.handleDoubleClick) return;

    const options = buildActivateOptions();
    if (!options) return;

    const map = config.getMap();
    const fallbackPoint = map?.getCenter();
    const lastPoint = state.clickPoints[state.clickPoints.length - 1] ?? fallbackPoint;
    if (!lastPoint) return;

    handler.handleDoubleClick(lastPoint, options);
  }, [state.activeTool, state.clickPoints, buildActivateOptions, config]);

  const getToolCursor = useCallback((): string => {
    if (!state.activeTool) return '';
    const handler = handlersRef.current.get(state.activeTool);
    return handler?.getCursor() ?? '';
  }, [state.activeTool]);

  const isToolActive = state.activeTool !== null;
  const gridVisible = state.gridVisible;
  const managedResults = state.results.map((result) => {
    const key = getResultKey(result);
    return {
      key,
      result,
      visible: !hiddenResultKeys.has(key),
    };
  });

  return {
    state,
    toggleTool,
    deactivateTool,
    handleToolClick,
    handleToolDoubleClick,
    statusMessage,
    latestResult,
    clearLatestResult,
    clearAllOverlays,
    getToolCursor,
    isToolActive,
    gridVisible,
    canFinishActiveTool,
    finishActiveTool,
    managedResults,
    toggleResultVisibility,
    removeResult,
    updateResultData,
  };
}