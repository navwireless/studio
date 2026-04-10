// src/types/map-tools.ts
// Phase 12B — 15-tool catalog (8 active now, 7 added in 12C/12D/12E)

// ─── Tool IDs ───────────────────────────────────────────────────────

export type MapToolId =
  // Phase 12B — Active
  | 'multi-measure'
  | 'measure-area'
  | 'range-rings'
  | 'placemark'
  | 'elevation-probe'
  | 'coord-tool'
  | 'map-screenshot'
  | 'grid-overlay'
  // Phase 12C
  | 'solar-analyzer'
  // Phase 12D
  | 'weather-probe'
  | 'compass-tool'
  | 'alignment-guide'
  | 'field-notes'
  | 'level-tool'
  // Phase 12E
  | 'project-manager'
  // Legacy IDs (Phase 11 — kept for backward compat in result panel)
  | 'measure-distance'
  | 'drop-pin'
  | 'point-elevation'
  | 'coord-converter'
  | 'range-circle'
  | 'bearing-calc'
  | 'terrain-profile';

// ─── Categories ─────────────────────────────────────────────────────

export type MapToolCategory = 'measure' | 'mark' | 'project' | 'analyze' | 'field';

export const TOOL_CATEGORIES: Record<MapToolCategory, { label: string; order: number }> = {
  measure: { label: 'Measure', order: 1 },
  mark: { label: 'Mark', order: 2 },
  project: { label: 'Project', order: 3 },
  analyze: { label: 'Analyze', order: 4 },
  field: { label: 'Field', order: 5 },
};

// ─── Tool Definition ────────────────────────────────────────────────

export interface MapTool {
  id: MapToolId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  shortcutKey?: string;
  category: MapToolCategory;
  /** 0 = toggle/instant, 1 = single click, 2 = two clicks, -1 = multi-click */
  requiresClicks: number;
  /** true = stays active after result (grid, placemark), false = deactivates */
  persistent: boolean;
  mobileSupported: boolean;
}

// ─── Active Tool Catalog (Phase 12B: 8 tools) ──────────────────────

export const MAP_TOOLS: MapTool[] = [
  // ── Measure ──
  {
    id: 'multi-measure',
    name: 'Ruler + Profile',
    shortName: 'Ruler',
    description: 'Draw a line between two points for aerial distance and elevation profile.',
    icon: 'Ruler',
    shortcutKey: 'M',
    category: 'measure',
    requiresClicks: -1,
    persistent: false,
    mobileSupported: true,
  },
  {
    id: 'measure-area',
    name: 'Measure Area',
    shortName: 'Area',
    description: 'Draw a polygon to measure area and perimeter.',
    icon: 'Pentagon',
    shortcutKey: 'N',
    category: 'measure',
    requiresClicks: -1,
    persistent: false,
    mobileSupported: true,
  },
  {
    id: 'range-rings',
    name: 'Radius Circle',
    shortName: 'Radius',
    description: 'Draw center and edge points to create a radius circle.',
    icon: 'Circle',
    shortcutKey: 'R',
    category: 'measure',
    requiresClicks: 1,
    persistent: false,
    mobileSupported: true,
  },
  {
    id: 'elevation-probe',
    name: 'Elevation Probe (Legacy)',
    shortName: 'Elev Legacy',
    description: 'Legacy point elevation tool. Use Ruler + Profile for line profiles.',
    icon: 'Mountain',
    shortcutKey: 'E',
    category: 'measure',
    requiresClicks: 1,
    persistent: true,
    mobileSupported: false,
  },
  // ── Mark ──
  {
    id: 'placemark',
    name: 'Placemark',
    shortName: 'Mark',
    description: 'Place a named, colored marker with coordinates.',
    icon: 'MapPin',
    shortcutKey: 'L',
    category: 'mark',
    requiresClicks: 1,
    persistent: true,
    mobileSupported: true,
  },
  {
    id: 'coord-tool',
    name: 'Coordinate Tool',
    shortName: 'Coords',
    description: 'Click to see DD/DMS/UTM. Or paste any coordinate format.',
    icon: 'Crosshair',
    shortcutKey: 'C',
    category: 'mark',
    requiresClicks: 1,
    persistent: false,
    mobileSupported: true,
  },
  // ── Project ──
  {
    id: 'grid-overlay',
    name: 'Grid Overlay',
    shortName: 'Grid',
    description: 'Toggle adaptive latitude/longitude grid lines.',
    icon: 'Grid3x3',
    shortcutKey: 'G',
    category: 'project',
    requiresClicks: 0,
    persistent: true,
    mobileSupported: true,
  },
  {
    id: 'map-screenshot',
    name: 'Screenshot',
    shortName: 'Capture',
    description: 'Export the current map view as a PNG image.',
    icon: 'Camera',
    shortcutKey: 'K',
    category: 'project',
    requiresClicks: 0,
    persistent: false,
    mobileSupported: false,
  },
  // ── Analyze ──
  {
    id: 'solar-analyzer',
    name: 'Solar Interference',
    shortName: 'Solar',
    description: 'Analyze when sun aligns with FSO beam path causing detector blinding. Requires LOS analysis.',
    icon: 'Sun',
    shortcutKey: 'S',
    category: 'analyze',
    requiresClicks: 0,
    persistent: false,
    mobileSupported: true,
  },
  {
    id: 'alignment-guide',
    name: 'Alignment Guide',
    shortName: 'Align',
    description: 'Compute exact azimuth + tilt angle to aim FSO devices. Requires LOS analysis.',
    icon: 'Target',
    shortcutKey: 'A',
    category: 'analyze',
    requiresClicks: 0,
    persistent: false,
    mobileSupported: true,
  },
  // ── Field ──
  {
    id: 'weather-probe',
    name: 'Weather Probe',
    shortName: 'Weather',
    description: 'Click map to fetch real-time weather + FSO impact assessment.',
    icon: 'Cloud',
    shortcutKey: 'W',
    category: 'field',
    requiresClicks: 1,
    persistent: false,
    mobileSupported: true,
  },
  {
    id: 'compass-tool',
    name: 'Compass / Bearing',
    shortName: 'Compass',
    description: 'Click 2 points for true/magnetic bearing + declination.',
    icon: 'Compass',
    shortcutKey: 'B',
    category: 'field',
    requiresClicks: 2,
    persistent: true,
    mobileSupported: true,
  },
  {
    id: 'field-notes',
    name: 'Field Notes',
    shortName: 'Notes',
    description: 'Click map to add geo-tagged timestamped notes. Persistent storage.',
    icon: 'StickyNote',
    shortcutKey: 'F',
    category: 'field',
    requiresClicks: 1,
    persistent: true,
    mobileSupported: true,
  },
  {
    id: 'level-tool',
    name: 'Level / Inclinometer',
    shortName: 'Level',
    description: 'Use device accelerometer to check mounting angles. Desktop: manual calculator.',
    icon: 'Gauge',
    shortcutKey: 'I',
    category: 'field',
    requiresClicks: 0,
    persistent: false,
    mobileSupported: true,
  },
];

// ─── Interfaces ─────────────────────────────────────────────────────

export interface ToolResult {
  toolId: MapToolId;
  timestamp: number;
  data: Record<string, unknown>;
  overlays: google.maps.MVCObject[];
}

export interface ToolState {
  activeTool: MapToolId | null;
  results: ToolResult[];
  isProcessing: boolean;
  clickPoints: google.maps.LatLng[];
  gridVisible: boolean;
}

export interface ToolActivateOptions {
  map: google.maps.Map;
  onResult: (result: ToolResult) => void;
  onStatusChange: (status: string) => void;
  onProcessingChange: (isProcessing: boolean) => void;
  addClickPoint: (point: google.maps.LatLng) => void;
  getClickPoints: () => google.maps.LatLng[];
}

export interface ToolHandler {
  activate: (options: ToolActivateOptions) => void;
  deactivate: () => void;
  handleClick: (latLng: google.maps.LatLng, options: ToolActivateOptions) => void;
  handleDoubleClick?: (latLng: google.maps.LatLng, options: ToolActivateOptions) => void;
  getCursor: () => string;
}

export const MAX_TOOL_RESULTS = 20;