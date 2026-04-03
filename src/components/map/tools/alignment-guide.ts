// src/components/map/tools/alignment-guide.ts
// Phase 12D — FSO Alignment Guide tool
// After LOS analysis: computes exact azimuth + tilt angle to aim each device
// No map clicks needed — reads from current analysis state

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import type { AnalysisResult } from '@/types';
import { computePointingDirection } from '@/lib/solar-position';

// ─── State ───
let _analysisResult: AnalysisResult | null = null;

/**
 * Set the current analysis result for alignment calculations.
 * Called from page.tsx whenever analysis changes.
 */
export function setAlignmentAnalysisData(result: AnalysisResult | null) {
  _analysisResult = result;
}

function getCompassDirection(azimuth: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(azimuth / 22.5) % 16];
}

function formatAngle(deg: number): string {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  const s = Math.round(((Math.abs(deg) - d) * 60 - m) * 60);
  const sign = deg >= 0 ? '+' : '-';
  return `${sign}${d}° ${m}' ${s}"`;
}

export const alignmentGuide: ToolHandler = {
  activate(options: ToolActivateOptions) {
    if (!_analysisResult) {
      options.onStatusChange('Run a LOS analysis first to use the Alignment Guide.');
      options.onResult({
        toolId: 'alignment-guide',
        timestamp: Date.now(),
        data: { error: 'No analysis data available. Run a LOS analysis first.' },
        overlays: [],
      });
      return;
    }

    const result = _analysisResult;
    options.onStatusChange('Computing alignment parameters...');
    options.onProcessingChange(true);

    setTimeout(() => {
      try {
        const pA = result.pointA;
        const pB = result.pointB;

        // Device A → B
        const aimAB = computePointingDirection(
          pA.lat, pA.lng, pA.towerHeight,
          pB.lat, pB.lng, pB.towerHeight,
          result.distanceKm,
        );

        // Device B → A
        const aimBA = computePointingDirection(
          pB.lat, pB.lng, pB.towerHeight,
          pA.lat, pA.lng, pA.towerHeight,
          result.distanceKm,
        );

        const deviceA = {
          name: pA.name || 'Site A',
          azimuth: aimAB.azimuth.toFixed(2),
          azimuthDMS: formatAngle(aimAB.azimuth),
          compassDir: getCompassDirection(aimAB.azimuth),
          elevation: aimAB.elevation.toFixed(3),
          elevationDMS: formatAngle(aimAB.elevation),
          tilt: aimAB.elevation >= 0 ? 'Up' : 'Down',
          towerHeight: `${pA.towerHeight} m`,
        };

        const deviceB = {
          name: pB.name || 'Site B',
          azimuth: aimBA.azimuth.toFixed(2),
          azimuthDMS: formatAngle(aimBA.azimuth),
          compassDir: getCompassDirection(aimBA.azimuth),
          elevation: aimBA.elevation.toFixed(3),
          elevationDMS: formatAngle(aimBA.elevation),
          tilt: aimBA.elevation >= 0 ? 'Up' : 'Down',
          towerHeight: `${pB.towerHeight} m`,
        };

        options.onProcessingChange(false);
        options.onStatusChange(
          `A→B: ${aimAB.azimuth.toFixed(1)}° ${getCompassDirection(aimAB.azimuth)}, ${aimAB.elevation >= 0 ? '+' : ''}${aimAB.elevation.toFixed(2)}° · B→A: ${aimBA.azimuth.toFixed(1)}° ${getCompassDirection(aimBA.azimuth)}, ${aimBA.elevation >= 0 ? '+' : ''}${aimBA.elevation.toFixed(2)}°`
        );

        const toolResult: ToolResult = {
          toolId: 'alignment-guide',
          timestamp: Date.now(),
          data: {
            distance: `${result.distanceKm.toFixed(3)} km`,
            deviceA,
            deviceB,
            earthCurvatureDrop: `${((result.distanceKm * 1000) ** 2 / (2 * 6371000)).toFixed(2)} m`,
            tips: [
              'Use true bearing (not magnetic) for FSO alignment',
              `Earth curvature drop at ${result.distanceKm.toFixed(1)} km: ${((result.distanceKm * 1000) ** 2 / (2 * 6371000)).toFixed(1)}m`,
              Math.abs(aimAB.elevation) < 0.1
                ? 'Tilt angle is near zero — devices are at similar effective heights'
                : `Tilt ${Math.abs(aimAB.elevation).toFixed(2)}° — verify mount supports this angle range`,
            ],
            isFinal: true,
          },
          overlays: [],
        };

        options.onResult(toolResult);
      } catch (e) {
        console.error('Alignment calc failed:', e);
        options.onProcessingChange(false);
        options.onStatusChange('Alignment calculation failed.');
        options.onResult({
          toolId: 'alignment-guide',
          timestamp: Date.now(),
          data: { error: String(e) },
          overlays: [],
        });
      }
    }, 30);
  },

  deactivate() {
    // Nothing to clean up
  },

  handleClick() {
    // Alignment guide doesn't use map clicks
  },

  getCursor() {
    return '';
  },
};
