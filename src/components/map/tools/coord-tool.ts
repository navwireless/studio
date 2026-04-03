// src/components/map/tools/coord-tool.ts
// Phase 12B — Replaces coord-converter.ts
// Dual mode: click map → DD/DMS/UTM, or paste any coordinate format.

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';
import {
    formatDD,
    ddToDMS,
    ddToUTM,
    parseCoordinateInput,
    isValidLatLng,
    TOOL_COLORS,
} from './tool-utils';

// ─── Coord Info Overlay Factory (lazy) ──────────────────────────────

interface LabelHandle {
    remove: () => void;
}

function createCoordInfoOverlay(
    position: google.maps.LatLng,
    dd: string,
    dms: string,
    utm: string,
    source: string,
    mapInstance: google.maps.Map,
): LabelHandle {
    const overlay = new google.maps.OverlayView();
    let div: HTMLDivElement | null = null;

    overlay.onAdd = function () {
        div = document.createElement('div');
        Object.assign(div.style, {
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            marginTop: '-18px',
            padding: '6px 10px',
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            borderRadius: '6px',
            border: `1px solid ${TOOL_COLORS.coords.stroke}`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: '110',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            maxWidth: '320px',
        });

        const sourceTag = source !== 'click'
            ? `<div style="font-size:9px;color:rgba(255,255,255,0.45);margin-bottom:3px">
           Parsed from ${source.toUpperCase()} input
         </div>`
            : '';

        div.innerHTML = `
      ${sourceTag}
      <div style="font-size:11px;color:${TOOL_COLORS.coords.stroke};line-height:1.5;font-weight:600">
        DD: <span style="color:#fff;font-weight:400">${dd}</span>
      </div>
      <div style="font-size:11px;color:${TOOL_COLORS.coords.stroke};line-height:1.5;font-weight:600">
        DMS: <span style="color:#fff;font-weight:400">${dms}</span>
      </div>
      <div style="font-size:11px;color:${TOOL_COLORS.coords.stroke};line-height:1.5;font-weight:600">
        UTM: <span style="color:#fff;font-weight:400">${utm}</span>
      </div>`;
        this.getPanes()?.overlayLayer.appendChild(div);
    };

    overlay.draw = function () {
        if (!div) return;
        const pos = this.getProjection()?.fromLatLngToDivPixel(position);
        if (!pos) return;
        div.style.left = `${pos.x}px`;
        div.style.top = `${pos.y}px`;
    };

    overlay.onRemove = function () {
        div?.parentNode?.removeChild(div);
        div = null;
    };

    overlay.setMap(mapInstance);

    return {
        remove: () => overlay.setMap(null),
    };
}

// ─── Module State ───────────────────────────────────────────────────

let _map: google.maps.Map | null = null;
let _marker: google.maps.Marker | null = null;
let _infoOverlay: LabelHandle | null = null;
let _pasteListener: ((e: ClipboardEvent) => void) | null = null;

// ─── Internal Helpers ───────────────────────────────────────────────

function clearOverlays(): void {
    if (_marker) {
        _marker.setMap(null);
        _marker = null;
    }
    if (_infoOverlay) {
        _infoOverlay.remove();
        _infoOverlay = null;
    }
}

function collectOverlays(): google.maps.MVCObject[] {
    return _marker ? [_marker] : [];
}

function placeCoordResult(
    latLng: google.maps.LatLng,
    source: string,
    options: ToolActivateOptions,
): void {
    if (!_map) return;

    clearOverlays();

    const lat = latLng.lat();
    const lng = latLng.lng();
    const dd = formatDD(lat, lng);
    const dms = ddToDMS(lat, lng);
    const utm = ddToUTM(lat, lng);
    const dmsStr = `${dms.lat}, ${dms.lng}`;

    _marker = new google.maps.Marker({
        position: latLng,
        map: _map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: TOOL_COLORS.coords.stroke,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
        },
        clickable: false,
        zIndex: 15,
    });

    _infoOverlay = createCoordInfoOverlay(
        latLng,
        dd,
        dmsStr,
        utm.full,
        source,
        _map,
    );

    options.onStatusChange(`${dd} — Click again or paste coordinates.`);

    options.onResult({
        toolId: 'coord-tool',
        timestamp: Date.now(),
        data: {
            lat,
            lng,
            dd,
            dms: dmsStr,
            dmsLat: dms.lat,
            dmsLng: dms.lng,
            utm: utm.full,
            utmZone: utm.zone,
            utmEasting: utm.easting,
            utmNorthing: utm.northing,
            source,
        },
        overlays: collectOverlays(),
    });
}

// ─── Paste Handler ──────────────────────────────────────────────────

function setupPasteListener(options: ToolActivateOptions): void {
    removePasteListener();

    _pasteListener = (e: ClipboardEvent) => {
        const active = document.activeElement;
        if (
            active instanceof HTMLInputElement ||
            active instanceof HTMLTextAreaElement
        ) {
            return;
        }

        const text = e.clipboardData?.getData('text');
        if (!text) return;

        const parsed = parseCoordinateInput(text.trim());
        if (!parsed) {
            options.onStatusChange(`Could not parse: "${text.trim().substring(0, 40)}". Try DD or DMS format.`);
            return;
        }

        if (!isValidLatLng(parsed.lat, parsed.lng)) {
            options.onStatusChange(`Parsed coordinates out of range: ${parsed.lat}, ${parsed.lng}`);
            return;
        }

        e.preventDefault();

        const latLng = new google.maps.LatLng(parsed.lat, parsed.lng);
        if (_map) {
            _map.panTo(latLng);
            _map.setZoom(Math.max(_map.getZoom() ?? 14, 14));
        }

        placeCoordResult(latLng, parsed.format, options);
    };

    document.addEventListener('paste', _pasteListener);
}

function removePasteListener(): void {
    if (_pasteListener) {
        document.removeEventListener('paste', _pasteListener);
        _pasteListener = null;
    }
}

// ─── Tool Handler ───────────────────────────────────────────────────

export const coordTool: ToolHandler = {
    activate(options: ToolActivateOptions): void {
        clearOverlays();
        _map = options.map;
        setupPasteListener(options);
        options.onStatusChange(
            'Click map for coordinates, or Ctrl+V to paste any format (DD, DMS).',
        );
    },

    deactivate(): void {
        clearOverlays();
        removePasteListener();
        _map = null;
    },

    handleClick(latLng: google.maps.LatLng, options: ToolActivateOptions): void {
        if (!_map) return;
        placeCoordResult(latLng, 'click', options);
    },

    getCursor(): string {
        return 'crosshair';
    },
};