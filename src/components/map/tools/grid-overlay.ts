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

function drawGrid(map: google.maps.Map) {
  clearGrid();

  const bounds = map.getBounds();
  const zoom = map.getZoom();
  if (!bounds || zoom === undefined) return;

  const spacing = getGridSpacing(zoom);
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  // Extend bounds slightly for edge labels
  const latStart = Math.floor(sw.lat() / spacing) * spacing;
  const latEnd = Math.ceil(ne.lat() / spacing) * spacing;
  const lngStart = Math.floor(sw.lng() / spacing) * spacing;
  const lngEnd = Math.ceil(ne.lng() / spacing) * spacing;

  const strokeColor = TOOL_COLORS.grid.stroke;

  // Latitude lines (horizontal)
  for (let lat = latStart; lat <= latEnd; lat += spacing) {
    const line = new google.maps.Polyline({
      path: [
        { lat, lng: lngStart - spacing },
        { lat, lng: lngEnd + spacing },
      ],
      map,
      strokeColor,
      strokeOpacity: 1,
      strokeWeight: 1,
      zIndex: 1,
      clickable: false,
    });
    gridLines.push(line);

    // Label
    const label = new google.maps.Marker({
      position: { lat, lng: sw.lng() + (ne.lng() - sw.lng()) * 0.02 },
      map,
      icon: {
        path: 'M 0 0',
        scale: 0,
      },
      label: {
        text: `${lat.toFixed(spacing < 0.01 ? 3 : spacing < 0.1 ? 2 : 1)}°`,
        color: 'rgba(255,255,255,0.5)',
        fontSize: '10px',
        fontWeight: '400',
      },
      clickable: false,
      zIndex: 2,
    });
    gridLabels.push(label);
  }

  // Longitude lines (vertical)
  for (let lng = lngStart; lng <= lngEnd; lng += spacing) {
    const line = new google.maps.Polyline({
      path: [
        { lat: latStart - spacing, lng },
        { lat: latEnd + spacing, lng },
      ],
      map,
      strokeColor,
      strokeOpacity: 1,
      strokeWeight: 1,
      zIndex: 1,
      clickable: false,
    });
    gridLines.push(line);

    const label = new google.maps.Marker({
      position: { lat: sw.lat() + (ne.lat() - sw.lat()) * 0.02, lng },
      map,
      icon: {
        path: 'M 0 0',
        scale: 0,
      },
      label: {
        text: `${lng.toFixed(spacing < 0.01 ? 3 : spacing < 0.1 ? 2 : 1)}°`,
        color: 'rgba(255,255,255,0.5)',
        fontSize: '10px',
        fontWeight: '400',
      },
      clickable: false,
      zIndex: 2,
    });
    gridLabels.push(label);
  }
}

export function createGridOverlayHandler(): ToolHandler {
  return {
    activate(options) {
      if (isGridVisible) {
        // Toggle off
        clearGrid();
        if (boundsListener) {
          google.maps.event.removeListener(boundsListener);
          boundsListener = null;
        }
        if (zoomListener) {
          google.maps.event.removeListener(zoomListener);
          zoomListener = null;
        }
        isGridVisible = false;

        options.onResult({
          toolId: 'grid-overlay',
          timestamp: Date.now(),
          data: { visible: false },
          overlays: [],
        });
        options.onStatusChange('Grid hidden');
      } else {
        // Toggle on
        isGridVisible = true;
        drawGrid(options.map);

        // Redraw on pan/zoom
        boundsListener = options.map.addListener('bounds_changed', () => {
          if (isGridVisible) drawGrid(options.map);
        });
        zoomListener = options.map.addListener('zoom_changed', () => {
          if (isGridVisible) {
            // Small delay to let bounds update
            setTimeout(() => {
              if (isGridVisible) drawGrid(options.map);
            }, 100);
          }
        });

        options.onResult({
          toolId: 'grid-overlay',
          timestamp: Date.now(),
          data: {
            visible: true,
            spacing: getGridSpacing(options.map.getZoom() ?? 10),
          },
          overlays: [...gridLines, ...gridLabels],
        });
        options.onStatusChange('Grid visible — press G to toggle off');
      }
    },

    deactivate() {
      // Grid persists even after tool deactivation — it's a toggle
      // Only cleanup when explicitly toggled off via activate()
    },

    handleClick() {
      // No-op — grid is a toggle, not a click tool
    },

    getCursor() {
      return 'default';
    },
  };
}

/** Query current grid state */
export function isGridActive(): boolean {
  return isGridVisible;
}