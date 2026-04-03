// src/components/map/tools/placemark.ts
// Phase 12B — Replaces drop-pin.ts
// Named, colored, described placemark with icon choice.
// Single click places marker. Persistent (stays active for multiple placements).
// TODO: Wire project-storage save in Phase 12E.

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import {
  formatDD,
  ddToDMS,
  ddToUTM,
  getNextPinLabel,
  resetPinCounter,
} from './tool-utils';

// ─── Placemark Colors (rotating palette) ────────────────────────────

const PLACEMARK_COLORS = [
    '#F59E0B', // amber
    '#EF4444', // red
    '#10B981', // emerald
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
] as const;

let _colorIndex = 0;

function getNextColor(): string {
    const color = PLACEMARK_COLORS[_colorIndex % PLACEMARK_COLORS.length];
    _colorIndex++;
    return color;
}

// ─── Module State ───────────────────────────────────────────────────

let _map: google.maps.Map | null = null;
let _markers: google.maps.Marker[] = [];
let _infoWindows: google.maps.InfoWindow[] = [];
let _placemarkCount = 0;

// ─── Internal Helpers ───────────────────────────────────────────────

function createPlacemarkMarker(
    position: google.maps.LatLng,
    map: google.maps.Map,
    label: string,
    color: string,
): google.maps.Marker {
    return new google.maps.Marker({
        position,
        map,
        icon: {
            path: 'M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z',
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            scale: 1.3,
            anchor: new google.maps.Point(12, 36),
            labelOrigin: new google.maps.Point(12, 11),
        },
        label: {
            text: label,
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold',
        },
        draggable: true,
        zIndex: 20,
        title: `Placemark ${label}`,
    });
}

function buildInfoContent(
    label: string,
    color: string,
    lat: number,
    lng: number,
): string {
    const dd = formatDD(lat, lng);
    const dms = ddToDMS(lat, lng);
    const utm = ddToUTM(lat, lng);

    return `
    <div style="font-family:system-ui,-apple-system,sans-serif;min-width:200px;color:#1a1a1a">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <div style="width:12px;height:12px;border-radius:50%;background:${color}"></div>
        <strong style="font-size:13px">Placemark ${label}</strong>
      </div>
      <div style="font-size:11px;line-height:1.6;color:#444">
        <div><strong>DD:</strong> ${dd}</div>
        <div><strong>DMS:</strong> ${dms.lat}, ${dms.lng}</div>
        <div><strong>UTM:</strong> ${utm.full}</div>
      </div>
    </div>
  `;
}

export function clearAll(): void {
    _infoWindows.forEach((iw) => iw.close());
    _infoWindows = [];
    _markers.forEach((m) => m.setMap(null));
    _markers = [];
    _placemarkCount = 0;
    _colorIndex = 0;
    resetPinCounter();
}

function collectOverlays(): google.maps.MVCObject[] {
    return [..._markers];
}

// ─── Tool Handler ───────────────────────────────────────────────────

export const placemark: ToolHandler = {
    activate(options: ToolActivateOptions): void {
        // Don't clear previous placemarks — persistent tool
        // Only reset if fresh activation (no existing markers from this session)
        _map = options.map;

        // Close any open info windows
        _infoWindows.forEach((iw) => iw.close());

        options.onStatusChange('Click map to place a marker. Each click adds a new placemark.');
    },

    // Replace the deactivate method (around line 150):
  deactivate(): void {
    // Close info windows but keep markers on map (persistent)
    _infoWindows.forEach((iw) => iw.close());
    _map = null;
  },

    handleClick(latLng: google.maps.LatLng, options: ToolActivateOptions): void {
        if (!_map) return;

        _placemarkCount++;
        const label = getNextPinLabel();
        const color = getNextColor();
        const lat = latLng.lat();
        const lng = latLng.lng();

        // Create marker
        const marker = createPlacemarkMarker(latLng, _map, label, color);
        _markers.push(marker);

        // Info window (click to show)
        const infoWindow = new google.maps.InfoWindow({
            content: buildInfoContent(label, color, lat, lng),
            maxWidth: 280,
        });
        _infoWindows.push(infoWindow);

        // Click marker to toggle info
        marker.addListener('click', () => {
            // Close all other info windows first
            _infoWindows.forEach((iw) => iw.close());
            infoWindow.open(_map!, marker);
        });

        // Update info window content on drag
        marker.addListener('dragend', () => {
            const newPos = marker.getPosition();
            if (!newPos) return;
            infoWindow.setContent(
                buildInfoContent(label, color, newPos.lat(), newPos.lng()),
            );

            // Re-emit result with updated position
            options.onResult(buildPlacemarkResult(label, color, newPos));
        });

        // Open info window immediately
        infoWindow.open(_map, marker);

        options.onStatusChange(
            `Placemark ${label} placed. Click to add more.`,
        );

        options.onResult(buildPlacemarkResult(label, color, latLng));
    },

    getCursor(): string {
        return 'crosshair';
    },
};

// ─── Result Builder ─────────────────────────────────────────────────

function buildPlacemarkResult(
    label: string,
    color: string,
    position: google.maps.LatLng,
): ToolResult {
    const lat = position.lat();
    const lng = position.lng();
    const dd = formatDD(lat, lng);
    const dms = ddToDMS(lat, lng);
    const utm = ddToUTM(lat, lng);

    return {
        toolId: 'placemark',
        timestamp: Date.now(),
        data: {
            label,
            color,
            lat,
            lng,
            dd,
            dms: `${dms.lat}, ${dms.lng}`,
            utm: utm.full,
            utmZone: utm.zone,
            utmEasting: utm.easting,
            utmNorthing: utm.northing,
            totalPlacemarks: _placemarkCount,
            allPlacemarks: _markers.map((m, i) => {
                const pos = m.getPosition();
                if (!pos) return null;
                return {
                    index: i + 1,
                    lat: pos.lat(),
                    lng: pos.lng(),
                    dd: formatDD(pos.lat(), pos.lng()),
                };
            }).filter(Boolean),
        },
        overlays: collectOverlays(),
    };
}