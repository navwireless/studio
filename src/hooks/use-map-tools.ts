// src/hooks/use-map-tools.ts
// Phase 12B — Tool state management hook
// Updated to use new 12B tool handlers + kept old tools (screenshot, grid)

'use client';

import { useState, useCallback, useRef } from 'react';
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

  const buildActivateOptions = useCallback((): ToolActivateOptions | null => {
    const map = config.getMap();
    if (!map) return null;

    return {
      map,
      onResult: (result: ToolResult) => {
        setLatestResult(result);
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

      handler.handleClick(latLng, options);
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

      handler.handleDoubleClick(latLng, options);
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
    setLatestResult(null);
  }, [state.results]);

  const getToolCursor = useCallback((): string => {
    if (!state.activeTool) return '';
    const handler = handlersRef.current.get(state.activeTool);
    return handler?.getCursor() ?? '';
  }, [state.activeTool]);

  const isToolActive = state.activeTool !== null;
  const gridVisible = state.gridVisible;

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
  };
}