// src/tools/report-generator/narrativeTemplates.ts
import type { AnalysisResult, DeviceCompatibilityData } from '@/types';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';

// ═══════════════════════════════════════════════════════
// Context extracted from analysis result
// ═══════════════════════════════════════════════════════
interface NarrativeContext {
    pointAName: string;
    pointBName: string;
    distanceKm: number;
    losPossible: boolean;
    minClearance: number | null;
    threshold: number;
    towerA: number;
    towerB: number;
    additionalHeight: number | null;
    fiberStatus?: string;
    fiberDistance?: number;
    deviceCompatibility?: DeviceCompatibilityData;
}

function getCtx(
    result: AnalysisResult,
    fiber?: FiberPathResult | null,
): NarrativeContext {
    return {
        pointAName: result.pointA.name || 'Site A',
        pointBName: result.pointB.name || 'Site B',
        distanceKm: result.distanceKm,
        losPossible: result.losPossible,
        minClearance: result.minClearance,
        threshold: result.clearanceThresholdUsed,
        towerA: result.pointA.towerHeight,
        towerB: result.pointB.towerHeight,
        additionalHeight: result.additionalHeightNeeded,
        fiberStatus: fiber?.status,
        fiberDistance: fiber?.totalDistanceMeters,
        deviceCompatibility: result.deviceCompatibility,
    };
}

function distStr(km: number): string {
    return km < 1
        ? `${(km * 1000).toFixed(0)} meters`
        : `${km.toFixed(2)} km`;
}

// ═══════════════════════════════════════════════════════
// CLEAR TEMPLATES
// ═══════════════════════════════════════════════════════

function clearLargeClearance(c: NarrativeContext): string {
    return (
        `The line-of-sight path between ${c.pointAName} and ${c.pointBName} spanning ` +
        `${distStr(c.distanceKm)} is confirmed CLEAR with excellent clearance. ` +
        `The minimum clearance of ${c.minClearance?.toFixed(1)}m significantly exceeds the ` +
        `required threshold of ${c.threshold}m, providing robust tolerance for environmental ` +
        `variations and equipment sway. ` +
        `This link is highly suitable for Free Space Optical (FSO) deployment.`
    );
}

function clearAdequateClearance(c: NarrativeContext): string {
    return (
        `The line-of-sight between ${c.pointAName} and ${c.pointBName} over ` +
        `${distStr(c.distanceKm)} is CLEAR with adequate clearance. ` +
        `The minimum clearance of ${c.minClearance?.toFixed(1)}m meets the ${c.threshold}m ` +
        `requirement, indicating a viable FSO link. ` +
        `Tower heights of ${c.towerA}m (${c.pointAName}) and ${c.towerB}m (${c.pointBName}) ` +
        `provide sufficient elevation above terrain obstructions for reliable operation.`
    );
}

function clearLimited(c: NarrativeContext): string {
    const headroom = (c.minClearance ?? 0) - c.threshold;
    return (
        `The line-of-sight between ${c.pointAName} and ${c.pointBName} ` +
        `(${distStr(c.distanceKm)}) is CLEAR but with limited clearance. ` +
        `The minimum clearance of ${c.minClearance?.toFixed(1)}m exceeds the ${c.threshold}m ` +
        `threshold by only ${headroom.toFixed(1)}m. While technically feasible, consider ` +
        `increasing tower heights to improve reliability during adverse weather conditions ` +
        `or heavy rainfall.`
    );
}

// ═══════════════════════════════════════════════════════
// BLOCKED TEMPLATES
// ═══════════════════════════════════════════════════════

function blockedSmallDeficit(c: NarrativeContext): string {
    return (
        `The line-of-sight between ${c.pointAName} and ${c.pointBName} ` +
        `(${distStr(c.distanceKm)}) is OBSTRUCTED. ` +
        `The minimum clearance of ${c.minClearance?.toFixed(1)}m falls below the ` +
        `required ${c.threshold}m threshold. An estimated additional ` +
        `${c.additionalHeight?.toFixed(1)}m of tower height is needed to achieve clearance. ` +
        `This is a minor obstruction that can likely be resolved with modest tower height ` +
        `adjustments at one or both sites.`
    );
}

function blockedLargeDeficit(c: NarrativeContext): string {
    return (
        `The line-of-sight between ${c.pointAName} and ${c.pointBName} over ` +
        `${distStr(c.distanceKm)} is BLOCKED by significant terrain obstruction. ` +
        `The path requires approximately ${c.additionalHeight?.toFixed(1)}m of additional ` +
        `height above the current tower configuration of ${c.towerA}m / ${c.towerB}m. ` +
        `Consider alternative tower placements or intermediate relay points to establish ` +
        `connectivity along this path.`
    );
}

function blockedSevere(c: NarrativeContext): string {
    return (
        `The line-of-sight between ${c.pointAName} and ${c.pointBName} ` +
        `(${distStr(c.distanceKm)}) faces severe terrain obstruction requiring ` +
        `${c.additionalHeight?.toFixed(1)}m of additional height. ` +
        `An FSO link along this trajectory is not recommended without major infrastructure ` +
        `investment. A completely different path geometry or deployment of intermediate ` +
        `relay stations should be evaluated as alternatives.`
    );
}

// ═══════════════════════════════════════════════════════
// SPECIAL CONDITION TEMPLATES
// ═══════════════════════════════════════════════════════

function shortDistance(c: NarrativeContext): string {
    if (c.losPossible) {
        return (
            `This short-range link of ${distStr(c.distanceKm)} between ${c.pointAName} ` +
            `and ${c.pointBName} is CLEAR with ${c.minClearance?.toFixed(1)}m clearance. ` +
            `At this distance, the link should deliver reliable, high-bandwidth performance ` +
            `with standard FSO equipment.`
        );
    }
    return (
        `Despite the short distance of ${distStr(c.distanceKm)}, the path between ` +
        `${c.pointAName} and ${c.pointBName} is obstructed. Terrain between the sites ` +
        `rises above the line of sight. Consider repositioning equipment or adding ` +
        `${c.additionalHeight?.toFixed(1)}m to tower heights to resolve this obstruction.`
    );
}

function longDistance(c: NarrativeContext): string {
    if (c.losPossible) {
        return (
            `This long-range FSO link of ${distStr(c.distanceKm)} between ${c.pointAName} ` +
            `and ${c.pointBName} is confirmed CLEAR. At this distance, atmospheric ` +
            `attenuation and beam divergence become significant factors. While the path ` +
            `geometry is favorable with ${c.minClearance?.toFixed(1)}m clearance, ensure ` +
            `the selected device supports the ${c.distanceKm.toFixed(1)}km range and ` +
            `consider weather-related availability targets for this region.`
        );
    }
    return (
        `This long-range path of ${distStr(c.distanceKm)} between ${c.pointAName} ` +
        `and ${c.pointBName} is BLOCKED. The combination of distance and terrain ` +
        `makes this a challenging deployment. An intermediate relay site is ` +
        `recommended to establish connectivity along this corridor.`
    );
}

// ═══════════════════════════════════════════════════════
// MODIFIER FRAGMENTS (appended to primary narrative)
// ═══════════════════════════════════════════════════════

function fiberAvailableFragment(c: NarrativeContext): string {
    if (c.fiberStatus === 'success' && c.fiberDistance) {
        const fiberKm = (c.fiberDistance / 1000).toFixed(2);
        const ratio = (c.fiberDistance / 1000 / c.distanceKm).toFixed(1);
        return (
            ` A fiber path has been calculated at ${fiberKm} km via road routing, ` +
            `which is ${ratio}x the aerial distance.`
        );
    }
    return '';
}

function fiberErrorFragment(c: NarrativeContext): string {
    if (c.fiberStatus && c.fiberStatus !== 'success') {
        const reasonMap: Record<string, string> = {
            no_road_for_a: `no road access was found near ${c.pointAName}`,
            no_road_for_b: `no road access was found near ${c.pointBName}`,
            no_route_between_roads: 'no viable road route exists between the snapped road points',
            radius_too_small: 'the snap-to-road radius was too small to find nearby roads',
            api_error: 'an API error occurred during routing',
            input_error: 'there was an input configuration error',
        };
        const reason = reasonMap[c.fiberStatus] || 'a viable road route could not be determined';
        return ` Note: Fiber path calculation was attempted but ${reason}.`;
    }
    return '';
}

function highTowerFragment(c: NarrativeContext): string {
    const maxTower = Math.max(c.towerA, c.towerB);
    if (maxTower > 50) {
        return (
            ` Note: A tower height of ${maxTower}m is specified, which represents ` +
            `significant infrastructure. Verify structural feasibility, wind load ` +
            `requirements, and local regulations for towers of this height.`
        );
    }
    return '';
}

function zeroTowerFragment(c: NarrativeContext): string {
    if (c.towerA === 0 || c.towerB === 0) {
        const which =
            c.towerA === 0 && c.towerB === 0
                ? 'both sites'
                : c.towerA === 0
                    ? c.pointAName
                    : c.pointBName;
        return (
            ` The analysis uses ground-level (0m tower height) for ${which}. ` +
            `Any practical installation will require some mounting height, which ` +
            `may improve clearance beyond what is shown here.`
        );
    }
    return '';
}

// ═══════════════════════════════════════════════════════
// DEVICE COMPATIBILITY FRAGMENT
// No percentages. Binary compatible / not compatible.
// ═══════════════════════════════════════════════════════

function deviceFragment(c: NarrativeContext): string {
    const dc = c.deviceCompatibility;
    if (!dc) return '';

    // Specific device selected
    if (dc.selectedDevice) {
        const sd = dc.selectedDevice;

        if (sd.isCompatible) {
            return (
                ` The analysis was conducted for the ${sd.deviceName}. ` +
                `This device is compatible with the ${c.distanceKm.toFixed(2)} km link, ` +
                `as the link distance is within its maximum operational range.`
            );
        } else {
            const rec = dc.recommendation;
            const recName = rec.recommendedDeviceName;
            const recDevice = rec.compatibleDevices.find(d => d.deviceId === rec.recommendedDeviceId);
            let alt = '';
            if (recName && recDevice) {
                alt = ` The recommended alternative is the ${recName} (${recDevice.bandwidth}, ${recDevice.maxRangeKm} km range).`;
            }
            // Calculate shortfall
            const shortfall = dc.recommendation.incompatibleDevices.find(
                d => d.deviceId === sd.deviceId
            )?.shortfallMeters;
            const shortfallStr = shortfall
                ? ` The link exceeds the device range by ${(shortfall / 1000).toFixed(1)} km.`
                : '';
            return (
                ` The ${sd.deviceName} is not compatible with this link distance of ` +
                `${c.distanceKm.toFixed(2)} km, which exceeds the device's maximum operational range.${shortfallStr}${alt}`
            );
        }
    }

    // Auto-detect mode (no specific device selected)
    const compatible = dc.recommendation.compatibleDevices;
    const rec = dc.recommendation;

    if (compatible.length > 0) {
        const recText = rec.recommendedDeviceName
            ? ` The recommended device is the ${rec.recommendedDeviceName}.`
            : '';
        return (
            ` ${compatible.length} Nav Wireless OpticSpectra device(s) are compatible with this ` +
            `${c.distanceKm.toFixed(2)} km link.${recText}`
        );
    }

    // No devices compatible
    const maxRange = dc.recommendation.incompatibleDevices.length > 0
        ? Math.max(...dc.recommendation.incompatibleDevices.map(d => d.maxRangeKm))
        : 0;
    return (
        ` No Nav Wireless OpticSpectra devices currently support the ` +
        `${c.distanceKm.toFixed(2)} km link distance.` +
        (maxRange > 0 ? ` The maximum supported range in the current product line is ${maxRange} km. Consider relay points to reduce individual link distances.` : '')
    );
}

// ═══════════════════════════════════════════════════════
// MAIN GENERATOR — selects template + appends modifiers
// ═══════════════════════════════════════════════════════

/**
 * Generates a professional narrative paragraph for a single LOS analysis.
 * Focuses on FSO/OWC technology. No RF, Fresnel, fiber recommendations,
 * earth curvature, percentages, or grading language.
 *
 * @param analysisResult - The LOS analysis result
 * @param fiberResult - Optional fiber path result
 * @param includeDeviceInfo - Whether to include device compatibility narrative
 * @returns A professional narrative string
 */
export function generateNarrative(
    analysisResult: AnalysisResult,
    fiberResult?: FiberPathResult | null,
    includeDeviceInfo: boolean = true,
): string {
    const c = getCtx(analysisResult, fiberResult);
    let narrative = '';

    // ── Select primary template ──
    if (c.distanceKm < 0.5) {
        narrative = shortDistance(c);
    } else if (c.distanceKm > 10) {
        narrative = longDistance(c);
    } else if (c.losPossible) {
        const headroom = (c.minClearance ?? 0) - c.threshold;
        if (headroom > c.threshold) {
            narrative = clearLargeClearance(c);
        } else if (headroom >= 3) {
            narrative = clearAdequateClearance(c);
        } else {
            narrative = clearLimited(c);
        }
    } else {
        const deficit = c.additionalHeight ?? 0;
        if (deficit <= 5) {
            narrative = blockedSmallDeficit(c);
        } else if (deficit <= 20) {
            narrative = blockedLargeDeficit(c);
        } else {
            narrative = blockedSevere(c);
        }
    }

    // ── Append modifier fragments ──
    narrative += fiberAvailableFragment(c);
    narrative += fiberErrorFragment(c);
    narrative += highTowerFragment(c);
    narrative += zeroTowerFragment(c);

    // ── Append device info ──
    if (includeDeviceInfo) {
        narrative += deviceFragment(c);
    }

    return narrative;
}

// ═══════════════════════════════════════════════════════
// SHORT SUMMARY — one-line for table/combined reports
// ═══════════════════════════════════════════════════════

/**
 * Generates a one-line summary for table rows and combined report listings.
 *
 * @param analysisResult - The LOS analysis result
 * @returns A concise summary string
 */
export function generateShortSummary(
    analysisResult: AnalysisResult,
): string {
    const c = getCtx(analysisResult);

    if (c.losPossible) {
        const headroom = (c.minClearance ?? 0) - c.threshold;
        if (headroom > c.threshold) {
            return `Clear with excellent ${c.minClearance?.toFixed(1)}m clearance over ${distStr(c.distanceKm)}.`;
        } else if (headroom >= 3) {
            return `Clear with adequate ${c.minClearance?.toFixed(1)}m clearance over ${distStr(c.distanceKm)}.`;
        } else {
            return `Clear but limited -- only ${headroom.toFixed(1)}m above threshold over ${distStr(c.distanceKm)}.`;
        }
    } else {
        return `Blocked -- needs ${c.additionalHeight?.toFixed(1)}m additional height over ${distStr(c.distanceKm)}.`;
    }
}