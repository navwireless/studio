// src/components/map/tools/solar-analyzer.ts
// Phase 12C — Solar Interference Analyzer tool handler
// Reads current LOS analysis data, computes solar interference for both devices

import type { ToolHandler, ToolActivateOptions, ToolResult } from '@/types/map-tools';
import type { AnalysisResult } from '@/types';
import {
  analyzeSolarInterference,
  type SolarAnalysisResult,
} from '@/lib/solar-position';

// ─── State ───
let _analysisResult: AnalysisResult | null = null;
let _cachedResult: SolarAnalysisResult | null = null;
let _cachedFov: number = 3;

/**
 * Set the current analysis result so the tool can access it.
 * Called from page.tsx whenever analysis changes.
 */
export function setSolarAnalysisData(result: AnalysisResult | null) {
  _analysisResult = result;
  // Invalidate cache when analysis changes
  _cachedResult = null;
}

/**
 * Get the last computed solar analysis result (if any).
 */
export function getCachedSolarResult(): SolarAnalysisResult | null {
  return _cachedResult;
}

export const solarAnalyzer: ToolHandler = {
  activate(options: ToolActivateOptions) {
    if (!_analysisResult) {
      options.onStatusChange('Run a LOS analysis first to use the Solar Analyzer.');
      options.onResult({
        toolId: 'solar-analyzer',
        timestamp: Date.now(),
        data: { error: 'No analysis data available. Run a LOS analysis first.' },
        overlays: [],
      });
      return;
    }

    const result = _analysisResult;
    options.onStatusChange('Computing solar interference for the full year...');
    options.onProcessingChange(true);

    // Run analysis async to not block UI
    setTimeout(() => {
      try {
        const siteA = {
          lat: result.pointA.lat,
          lng: result.pointA.lng,
          height: result.pointA.towerHeight,
          name: result.pointA.name || 'Site A',
        };
        const siteB = {
          lat: result.pointB.lat,
          lng: result.pointB.lng,
          height: result.pointB.towerHeight,
          name: result.pointB.name || 'Site B',
        };

        const solarResult = analyzeSolarInterference(
          siteA,
          siteB,
          result.distanceKm,
          _cachedFov,
        );

        _cachedResult = solarResult;

        const toolResult: ToolResult = {
          toolId: 'solar-analyzer',
          timestamp: Date.now(),
          data: {
            solarResult,
            overallRisk: solarResult.overallRisk,
            deviceA: {
              label: solarResult.deviceA.label,
              risk: solarResult.deviceA.summary.riskLevel,
              annualHours: solarResult.deviceA.summary.annualHours,
              affectedDays: solarResult.deviceA.summary.affectedDays,
              pointing: `${solarResult.deviceA.pointingAzimuth.toFixed(1)}° az, ${solarResult.deviceA.pointingElevation.toFixed(1)}° el`,
            },
            deviceB: {
              label: solarResult.deviceB.label,
              risk: solarResult.deviceB.summary.riskLevel,
              annualHours: solarResult.deviceB.summary.annualHours,
              affectedDays: solarResult.deviceB.summary.affectedDays,
              pointing: `${solarResult.deviceB.pointingAzimuth.toFixed(1)}° az, ${solarResult.deviceB.pointingElevation.toFixed(1)}° el`,
            },
            isFinal: true,
          },
          overlays: [],
        };

        options.onProcessingChange(false);

        const riskLabel = solarResult.overallRisk === 'none'
          ? '✅ No interference detected'
          : solarResult.overallRisk === 'low'
            ? '⚠️ Low risk interference'
            : solarResult.overallRisk === 'moderate'
              ? '⚠️ Moderate interference'
              : '🔴 High risk interference';

        options.onStatusChange(riskLabel);
        options.onResult(toolResult);
      } catch (e) {
        console.error('Solar analysis failed:', e);
        options.onProcessingChange(false);
        options.onStatusChange('Solar analysis failed.');
        options.onResult({
          toolId: 'solar-analyzer',
          timestamp: Date.now(),
          data: { error: String(e) },
          overlays: [],
        });
      }
    }, 50);
  },

  deactivate() {
    // Nothing to clean up — no map overlays
  },

  handleClick() {
    // Solar tool doesn't use map clicks
  },

  getCursor() {
    return '';
  },
};

/**
 * Update the FOV threshold for future analyses.
 */
export function setSolarFovThreshold(degrees: number) {
  _cachedFov = Math.max(0.5, Math.min(15, degrees));
  _cachedResult = null; // Invalidate cache
}
