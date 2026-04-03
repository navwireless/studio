// src/components/map/tools/elevation-probe.ts
// Phase 12B — Replaces point-elevation.ts
// Multi-point elevation comparison. Persistent — each click adds a probe point.

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import {
    formatDD,
    ddToDMS,
    formatElevation,
    formatDistance,
    haversineDistance,
    createVertexMarker,
    TOOL_COLORS,
} from './tool-utils';

// ─── Label Factory (lazy — avoids google.maps at module load) ───────

interface LabelHandle {
    remove: () => void;
}

function createProbeLabel(
    position: google.maps.LatLng,
    label: string,
    elevation: string,
    isHighest: boolean,
    isLowest: boolean,
    mapInstance: google.maps.Map,
): LabelHandle {
    const overlay = new google.maps.OverlayView();
    let div: HTMLDivElement | null = null;

    overlay.onAdd = function () {
        div = document.createElement('div');

        let borderColor: string = TOOL_COLORS.elevation.stroke;
        let badge = '';
        if (isHighest) {
            borderColor = '#EF4444';
            badge = '<span style="color:#EF4444;font-size:9px;margin-left:3px">▲ HIGH</span>';
        } else if (isLowest) {
            borderColor = '#3B82F6';
            badge = '<span style="color:#3B82F6;font-size:9px;margin-left:3px">▼ LOW</span>';
        }

        Object.assign(div.style, {
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            marginTop: '-16px',
            padding: '3px 7px',
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            borderRadius: '5px',
            border: `1px solid ${borderColor}`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: '100',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        });
        div.innerHTML = `
      <div style="font-size:11px;font-weight:600;color:${TOOL_COLORS.elevation.stroke};line-height:1.3">
        ${label}: ${elevation}${badge}
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

// ─── Probe Point Data ───────────────────────────────────────────────

interface ProbePoint {
    index: number;
    label: string;
    latLng: google.maps.LatLng;
    elevation: number | null;
    marker: google.maps.Marker;
}

// ─── Module State ───────────────────────────────────────────────────

let _map: google.maps.Map | null = null;
let _probes: ProbePoint[] = [];
let _labels: LabelHandle[] = [];
let _probeCount = 0;

// ─── Internal Helpers ───────────────────────────────────────────────

function getProbeLabel(index: number): string {
    if (index <= 26) return String.fromCharCode(64 + index);
    return `E${index}`;
}

async function fetchElevation(latLng: google.maps.LatLng): Promise<number | null> {
    try {
        const elevator = new google.maps.ElevationService();
        const res = await elevator.getElevationForLocations({
            locations: [latLng],
        });
        if (res?.results?.[0]) {
            return res.results[0].elevation ?? null;
        }
        return null;
    } catch {
        return null;
    }
}

function getElevationStats(): {
    min: { label: string; elevation: number; index: number } | null;
    max: { label: string; elevation: number; index: number } | null;
    avg: number | null;
    range: number | null;
} {
    const withElev = _probes.filter((p) => p.elevation !== null);
    if (withElev.length === 0) return { min: null, max: null, avg: null, range: null };

    let minProbe = withElev[0];
    let maxProbe = withElev[0];
    let sum = 0;

    for (const p of withElev) {
        if (p.elevation! < minProbe.elevation!) minProbe = p;
        if (p.elevation! > maxProbe.elevation!) maxProbe = p;
        sum += p.elevation!;
    }

    return {
        min: { label: minProbe.label, elevation: minProbe.elevation!, index: minProbe.index },
        max: { label: maxProbe.label, elevation: maxProbe.elevation!, index: maxProbe.index },
        avg: sum / withElev.length,
        range: maxProbe.elevation! - minProbe.elevation!,
    };
}

function refreshLabels(): void {
    _labels.forEach((l) => l.remove());
    _labels = [];

    if (!_map) return;

    const stats = getElevationStats();
    const probesWithElev = _probes.filter((p) => p.elevation !== null);

    for (const probe of _probes) {
        if (probe.elevation === null) continue;

        const isHighest = stats.max !== null && probe.index === stats.max.index && probesWithElev.length > 1;
        const isLowest = stats.min !== null && probe.index === stats.min.index && probesWithElev.length > 1;

        _labels.push(
            createProbeLabel(
                probe.latLng,
                probe.label,
                formatElevation(probe.elevation),
                isHighest,
                isLowest,
                _map,
            ),
        );
    }
}

export function clearAll(): void {
    _labels.forEach((l) => l.remove());
    _labels = [];
    _probes.forEach((p) => p.marker.setMap(null));
    _probes = [];
    _probeCount = 0;
}

function collectOverlays(): google.maps.MVCObject[] {
    return _probes.map((p) => p.marker);
}

function buildResult(): ToolResult {
    const stats = getElevationStats();

    const points = _probes.map((p) => {
        const lat = p.latLng.lat();
        const lng = p.latLng.lng();
        const dms = ddToDMS(lat, lng);
        return {
            label: p.label,
            index: p.index,
            dd: formatDD(lat, lng),
            dms: `${dms.lat}, ${dms.lng}`,
            lat,
            lng,
            elevation: p.elevation !== null ? formatElevation(p.elevation) : 'Failed',
            elevationRaw: p.elevation,
        };
    });

    const distances: { from: string; to: string; distance: string; elevDiff: string }[] = [];
    for (let i = 1; i < _probes.length; i++) {
        const prev = _probes[i - 1];
        const curr = _probes[i];
        const dist = haversineDistance(prev.latLng, curr.latLng);
        const elevDiff =
            prev.elevation !== null && curr.elevation !== null
                ? formatElevation(curr.elevation - prev.elevation)
                : 'N/A';
        distances.push({
            from: prev.label,
            to: curr.label,
            distance: formatDistance(dist),
            elevDiff,
        });
    }

    return {
        toolId: 'elevation-probe',
        timestamp: Date.now(),
        data: {
            points,
            pointCount: _probes.length,
            comparison: distances,
            stats: stats.min
                ? {
                    highest: `${stats.max!.label}: ${formatElevation(stats.max!.elevation)}`,
                    lowest: `${stats.min.label}: ${formatElevation(stats.min.elevation)}`,
                    average: formatElevation(stats.avg!),
                    range: formatElevation(stats.range!),
                }
                : null,
        },
        overlays: collectOverlays(),
    };
}

// ─── Tool Handler ───────────────────────────────────────────────────

export const elevationProbe: ToolHandler = {
    activate(options: ToolActivateOptions): void {
        _map = options.map;
        options.onStatusChange(
            _probes.length === 0
                ? 'Click map to probe elevation. Each click adds a comparison point.'
                : `${_probes.length} probe(s). Click to add more.`,
        );
    },

    deactivate(): void {
        _map = null;
    },

    async handleClick(
        latLng: google.maps.LatLng,
        options: ToolActivateOptions,
    ): Promise<void> {
        if (!_map) return;

        _probeCount++;
        const label = getProbeLabel(_probeCount);

        const marker = createVertexMarker(
            latLng,
            _map,
            TOOL_COLORS.elevation.stroke,
            label,
        );

        const probe: ProbePoint = {
            index: _probeCount,
            label,
            latLng,
            elevation: null,
            marker,
        };
        _probes.push(probe);

        options.onStatusChange(`Fetching elevation for point ${label}…`);
        options.onProcessingChange(true);

        const elevation = await fetchElevation(latLng);
        probe.elevation = elevation;

        options.onProcessingChange(false);
        refreshLabels();

        if (elevation !== null) {
            const stats = getElevationStats();
            const statsStr = stats.range !== null && _probes.filter((p) => p.elevation !== null).length > 1
                ? ` · Range: ${formatElevation(stats.range)}`
                : '';
            options.onStatusChange(
                `${label}: ${formatElevation(elevation)}${statsStr}. Click for more.`,
            );
        } else {
            options.onStatusChange(
                `${label}: Elevation fetch failed. Click for more.`,
            );
        }

        options.onResult(buildResult());
    },

    getCursor(): string {
        return 'crosshair';
    },
};