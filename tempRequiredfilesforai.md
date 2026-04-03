==> src/components/map/tools/map-screenshot.ts <==
// src/components/map/tools/map-screenshot.ts
// Phase 11B — Export current map view as PNG
// Uses html2canvas approach on the map container div

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';

export function createMapScreenshotHandler(): ToolHandler {
    async function captureMap(options: ToolActivateOptions) {
        options.onProcessingChange(true);
        options.onStatusChange('Capturing map…');

        try {
            // Dynamically import html2canvas to avoid bundle bloat
            // If not available, fall back to the static map tile approach
            let canvas: HTMLCanvasElement | null = null;

            const mapDiv = options.map.getDiv();
            if (!mapDiv) {
                throw new Error('Map container not found');
            }

            try {
                const html2canvas = (await import('html2canvas')).default;
                canvas = await html2canvas(mapDiv as HTMLElement, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#0A0F18',
                    scale: 2, // Retina quality
                    logging: false,
                    // Ignore UI overlays on the map

==> src/components/map/tools/grid-overlay.ts <==
// src/components/map/tools/grid-overlay.ts
// Phase 11B — Toggle lat/lng grid lines on the map

import type { ToolHandler } from '@/types/map-tools';
import { TOOL_COLORS } from './tool-utils';

let gridLines: google.maps.Polyline[] = [];
let gridLabels: google.maps.Marker[] = [];
let isGridVisible = false;
let boundsListener: google.maps.MapsEventListener | null = null;
let zoomListener: google.maps.MapsEventListener | null = null;

function clearGrid() {
  gridLines.forEach((line) => line.setMap(null));
  gridLabels.forEach((label) => label.setMap(null));
  gridLines = [];
  gridLabels = [];
}

function getGridSpacing(zoom: number): number {
  // Adaptive spacing based on zoom level
  if (zoom >= 16) return 0.005;   // ~500m
  if (zoom >= 14) return 0.01;    // ~1km
  if (zoom >= 12) return 0.05;    // ~5km
  if (zoom >= 10) return 0.1;     // ~10km
  if (zoom >= 8) return 0.5;      // ~50km
  if (zoom >= 6) return 1;        // ~100km
  if (zoom >= 4) return 5;        // ~500km
  return 10;                       // ~1000km
}
