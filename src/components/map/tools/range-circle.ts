// src/components/map/tools/range-circle.ts
// Phase 11B — Draw device operational range radius from a point

import type { ToolHandler } from '@/types/map-tools';
import { formatDD, formatDistance, TOOL_COLORS } from './tool-utils';

interface RangeCircleConfig {
    getRadiusMeters: () => number;
    getDeviceName: () => string | null;
}

export function createRangeCircleHandler(config: RangeCircleConfig): ToolHandler {
    return {
        activate(options) {
            const deviceName = config.getDeviceName();
            const radiusKm = (config.getRadiusMeters() / 1000).toFixed(1);
            const hint = deviceName
                ? `Click to show ${deviceName} range (${radiusKm} km)`
                : `Click to show range circle (${radiusKm} km)`;
            options.onStatusChange(hint);
        },

        deactivate() { },

        handleClick(latLng, options) {
            const radiusMeters = config.getRadiusMeters();
            const deviceName = config.getDeviceName();

            const circle = new google.maps.Circle({
                center: latLng,
                radius: radiusMeters,
                map: options.map,
                strokeColor: TOOL_COLORS.range.stroke,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: TOOL_COLORS.range.stroke,
                fillOpacity: 0.08,
                zIndex: 3,
            });

            // Center marker
            const centerMarker = new google.maps.Marker({
                position: latLng,
                map: options.map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: TOOL_COLORS.range.stroke,
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                },
                zIndex: 10,
                clickable: false,
            });

            const areaKmSq = (Math.PI * radiusMeters * radiusMeters) / 1_000_000;

            options.onResult({
                toolId: 'range-circle',
                timestamp: Date.now(),
                data: {
                    center: {
                        lat: latLng.lat(),
                        lng: latLng.lng(),
                        dd: formatDD(latLng.lat(), latLng.lng()),
                    },
                    radiusMeters,
                    radiusFormatted: formatDistance(radiusMeters),
                    deviceName: deviceName || 'Custom',
                    areaSqKm: areaKmSq.toFixed(2) + ' km²',
                },
                overlays: [circle, centerMarker],
            });

            options.onStatusChange(
                `${deviceName || 'Range'}: ${formatDistance(radiusMeters)} radius — click another center point`
            );
        },

        getCursor() {
            return 'crosshair';
        },
    };
}