// src/types/map-project.ts
// Phase 12A — Project types for saving map shapes (Google Earth Pro style)

// ─── Core Types ─────────────────────────────────────────────────────

export type ProjectItemType = 'placemark' | 'path' | 'polygon' | 'circle' | 'note';

export type ProjectGeometryType = 'Point' | 'LineString' | 'Polygon' | 'Circle';

export interface ProjectCoordinate {
    lat: number;
    lng: number;
    elevation?: number;
}

export interface ProjectItemStyle {
    strokeWidth?: number;
    strokeOpacity?: number;
    fillOpacity?: number;
    iconScale?: number;
}

export interface ProjectItem {
    /** Unique ID (generated) */
    id: string;
    /** Item type determines rendering and available operations */
    type: ProjectItemType;
    /** User-editable name */
    name: string;
    /** User-editable description */
    description: string;
    /** Hex color for stroke/fill */
    color: string;
    /** Toggle visibility on map */
    visible: boolean;
    /** Prevent accidental edits */
    locked: boolean;
    /** Geometry data */
    geometry: {
        type: ProjectGeometryType;
        coordinates: ProjectCoordinate[];
        /** For circles: radius in meters */
        radius?: number;
    };
    /** Computed measurements (distance, area, bearing, elevation, etc.) */
    measurements: Record<string, string>;
    /** Optional icon identifier for placemarks */
    icon?: string;
    /** Optional style overrides */
    style?: ProjectItemStyle;
    /** Tool that created this item */
    sourceToolId?: string;
    /** Arbitrary metadata */
    metadata?: Record<string, unknown>;
    /** Creation timestamp */
    createdAt: number;
    /** Last modification timestamp */
    updatedAt: number;
}

// ─── Project Container ──────────────────────────────────────────────

export interface MapProject {
    /** Unique project ID */
    id: string;
    /** User-editable project name */
    name: string;
    /** User-editable description */
    description: string;
    /** All items in this project */
    items: ProjectItem[];
    /** Creation timestamp */
    createdAt: number;
    /** Last modification timestamp */
    updatedAt: number;
}

// ─── Export Formats ─────────────────────────────────────────────────

export type ProjectExportFormat = 'kmz' | 'kml' | 'geojson' | 'csv';

export interface ProjectExportOptions {
    format: ProjectExportFormat;
    /** Only export visible items */
    visibleOnly: boolean;
    /** Include measurements in export */
    includeMeasurements: boolean;
    /** Include descriptions */
    includeDescriptions: boolean;
    /** Items to export (empty = all) */
    itemIds?: string[];
}

// ─── Color Palette ──────────────────────────────────────────────────

export const PROJECT_COLORS = [
    '#0066FF', // Brand blue
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#A855F7', // Violet
    '#84CC16', // Lime
    '#E11D48', // Rose
] as const;

export const PLACEMARK_ICONS = [
    { id: 'pin', label: 'Pin', emoji: '📍' },
    { id: 'tower', label: 'Tower', emoji: '🗼' },
    { id: 'building', label: 'Building', emoji: '🏢' },
    { id: 'antenna', label: 'Antenna', emoji: '📡' },
    { id: 'flag', label: 'Flag', emoji: '🚩' },
    { id: 'star', label: 'Star', emoji: '⭐' },
    { id: 'warning', label: 'Warning', emoji: '⚠️' },
    { id: 'camera', label: 'Camera', emoji: '📷' },
] as const;

// ─── Helper Functions ───────────────────────────────────────────────

/** Pick a color not yet heavily used in the project */
export function getNextProjectColor(existingColors: string[]): string {
    const counts = new Map<string, number>();
    existingColors.forEach((c) => counts.set(c, (counts.get(c) || 0) + 1));

    // Return first color with 0 uses, then least-used
    for (const color of PROJECT_COLORS) {
        if (!counts.has(color)) return color;
    }
    const sorted = [...PROJECT_COLORS].sort(
        (a, b) => (counts.get(a) || 0) - (counts.get(b) || 0)
    );
    return sorted[0];
}

/** Create a new project item with sensible defaults */
export function createProjectItem(
    type: ProjectItemType,
    coordinates: ProjectCoordinate[],
    overrides?: Partial<ProjectItem>
): ProjectItem {
    const now = Date.now();

    const defaultNames: Record<ProjectItemType, string> = {
        placemark: 'Placemark',
        path: 'Path',
        polygon: 'Polygon',
        circle: 'Circle',
        note: 'Note',
    };

    const geometryTypes: Record<ProjectItemType, ProjectGeometryType> = {
        placemark: 'Point',
        path: 'LineString',
        polygon: 'Polygon',
        circle: 'Circle',
        note: 'Point',
    };

    return {
        id: `pi_${now}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        name: defaultNames[type],
        description: '',
        color: PROJECT_COLORS[0],
        visible: true,
        locked: false,
        geometry: {
            type: geometryTypes[type],
            coordinates,
        },
        measurements: {},
        createdAt: now,
        updatedAt: now,
        ...overrides,
    };
}

/** Create a fresh empty project */
export function createEmptyProject(name?: string): MapProject {
    const now = Date.now();
    return {
        id: `proj_${now}_${Math.random().toString(36).slice(2, 8)}`,
        name: name || 'My Project',
        description: '',
        items: [],
        createdAt: now,
        updatedAt: now,
    };
}