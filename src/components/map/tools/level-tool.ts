// src/components/map/tools/level-tool.ts
// Phase 12D — Digital Level / Inclinometer tool
// Uses device accelerometer (mobile) or manual input (desktop)
// Shows pitch, roll, tilt for verifying mounting angles

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';
import type { SavedLink } from '@/types';

// ─── State ───
let _sensorAvailable = false;
let _permissionGranted = false;
let _lastReading: { alpha: number; beta: number; gamma: number } | null = null;
let _orientationListener: ((event: DeviceOrientationEvent) => void) | null = null;
let _updateInterval: ReturnType<typeof setInterval> | null = null;
let _options: ToolActivateOptions | null = null;
let _isListening = false;
let _lastResultEmitAt = 0;

// ─── Alignment Mode State ───
let _alignmentMode = false; // false = basic inclinometer, true = alignment mode
let _selectedLink: {
  sourcePoint: { name: string; lat: number; lng: number; height: number };
  destinationPoint: { name: string; lat: number; lng: number; height: number };
  distance: number;
  linkId: string;
  linkName: string;
  direction: 'A→B' | 'B→A'; // Bidirectional support
} | null = null;
let _targetOrientation: {
  azimuth: number; // Target compass direction (0-360°)
  elevation: number; // Target vertical angle (degrees from horizontal)
} | null = null;
let _alignmentStatus: {
  isAligned: boolean;
  currentAzimuth: number | null;
  currentElevation: number | null;
  azimuthDelta: number | null; // Difference from target
  elevationDelta: number | null; // Difference from target
  azimuthTolerance: number; // ±2° default
  elevationTolerance: number; // ±1° default
  status: 'aligned' | 'adjusting' | 'initializing';
} = {
  isAligned: false,
  currentAzimuth: null,
  currentElevation: null,
  azimuthDelta: null,
  elevationDelta: null,
  azimuthTolerance: 2.0,
  elevationTolerance: 1.0,
  status: 'initializing',
};

// ─── LOS Data Integration ───
const STORAGE_KEY = 'findlos_saved_links';

interface FormattedLink {
  id: string;
  name: string;
  pointA: {
    name: string;
    lat: number;
    lng: number;
    height: number;
  };
  pointB: {
    name: string;
    lat: number;
    lng: number;
    height: number;
  };
  distance: number;
  displayName: string; // "Point A → Point B"
}

/**
 * Fetch saved LOS analysis results from localStorage
 * Returns empty array if no data exists or parsing fails
 */
function fetchSavedLOSLinks(): SavedLink[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    return parsed as SavedLink[];
  } catch (error) {
    console.error('Failed to fetch saved LOS links:', error);
    return [];
  }
}

/**
 * Parse and format saved links for display in alignment interface
 * Extracts point names, coordinates, heights, and distances
 */
function formatLinksForAlignment(savedLinks: SavedLink[]): FormattedLink[] {
  return savedLinks.map(link => {
    // Calculate distance from analysis result if available
    const distance = (link.analysisResult?.distanceKm ?? 0) * 1000;
    
    return {
      id: link.id,
      name: link.name,
      pointA: {
        name: link.pointA.name,
        lat: link.pointA.lat,
        lng: link.pointA.lng,
        height: link.pointA.towerHeight,
      },
      pointB: {
        name: link.pointB.name,
        lat: link.pointB.lat,
        lng: link.pointB.lng,
        height: link.pointB.towerHeight,
      },
      distance,
      displayName: `${link.pointA.name} → ${link.pointB.name}`,
    };
  });
}

// hasSavedLOSLinks removed — was unused

// ─── Alignment Calculations ───

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate azimuth (bearing) between two geographic coordinates using haversine formula
 * @param lat1 Latitude of point A in degrees
 * @param lng1 Longitude of point A in degrees
 * @param lat2 Latitude of point B in degrees
 * @param lng2 Longitude of point B in degrees
 * @returns Azimuth in degrees (0-360°), where 0° is North, 90° is East, 180° is South, 270° is West
 */
function calculateAzimuth(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lng2 - lng1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const bearing = (toDegrees(θ) + 360) % 360; // Normalize to 0-360°
  
  return bearing;
}

/**
 * Calculate elevation angle using heights and distance
 * @param heightA Height of point A in meters
 * @param heightB Height of point B in meters
 * @param distance Horizontal distance between points in meters
 * @returns Elevation angle in degrees (positive = upward, negative = downward)
 */
function calculateElevationAngle(heightA: number, heightB: number, distance: number): number {
  if (distance === 0) return 0;
  
  const heightDifference = heightB - heightA;
  const elevationRadians = Math.atan(heightDifference / distance);
  const elevationDegrees = toDegrees(elevationRadians);
  
  return elevationDegrees;
}

/**
 * Calculate reciprocal azimuth (opposite direction)
 * @param azimuth Original azimuth in degrees (0-360°)
 * @returns Reciprocal azimuth in degrees (0-360°)
 */
function calculateReciprocalAzimuth(azimuth: number): number {
  return (azimuth + 180) % 360;
}

/**
 * Calculate opposite elevation angle
 * @param elevation Original elevation angle in degrees
 * @returns Opposite elevation angle in degrees
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _calculateOppositeElevation(elevation: number): number {
  return -elevation;
}

/**
 * Check if current orientation matches target within tolerance thresholds
 * @param currentAzimuth Current device azimuth in degrees (0-360°)
 * @param targetAzimuth Target azimuth in degrees (0-360°)
 * @param currentElevation Current device elevation in degrees
 * @param targetElevation Target elevation in degrees
 * @param azimuthTolerance Azimuth tolerance in degrees (default ±2°)
 * @param elevationTolerance Elevation tolerance in degrees (default ±1°)
 * @returns Object with alignment status and deltas
 */
function checkAlignmentTolerance(
  currentAzimuth: number,
  targetAzimuth: number,
  currentElevation: number,
  targetElevation: number,
  azimuthTolerance: number = 2.0,
  elevationTolerance: number = 1.0
): {
  isAligned: boolean;
  azimuthDelta: number;
  elevationDelta: number;
  azimuthWithinTolerance: boolean;
  elevationWithinTolerance: boolean;
} {
  // Calculate azimuth delta (handle wrap-around at 0°/360°)
  let azimuthDelta = targetAzimuth - currentAzimuth;
  if (azimuthDelta > 180) azimuthDelta -= 360;
  if (azimuthDelta < -180) azimuthDelta += 360;
  
  // Calculate elevation delta
  const elevationDelta = targetElevation - currentElevation;
  
  // Check if within tolerance
  const azimuthWithinTolerance = Math.abs(azimuthDelta) <= azimuthTolerance;
  const elevationWithinTolerance = Math.abs(elevationDelta) <= elevationTolerance;
  const isAligned = azimuthWithinTolerance && elevationWithinTolerance;
  
  return {
    isAligned,
    azimuthDelta,
    elevationDelta,
    azimuthWithinTolerance,
    elevationWithinTolerance,
  };
}

function checkSensorAvailability(): boolean {
  if (typeof window === 'undefined') return false;
  return 'DeviceOrientationEvent' in window;
}

function resetAlignmentState(): void {
  _alignmentMode = false;
  _selectedLink = null;
  _targetOrientation = null;
  _alignmentStatus = {
    isAligned: false,
    currentAzimuth: null,
    currentElevation: null,
    azimuthDelta: null,
    elevationDelta: null,
    azimuthTolerance: 2.0,
    elevationTolerance: 1.0,
    status: 'initializing',
  };
}

/**
 * Select a link for alignment and calculate target orientation
 * @param link The formatted link to align to
 * @param direction Direction of alignment: 'A→B' or 'B→A'
 */
function selectLinkForAlignment(link: FormattedLink, direction: 'A→B' | 'B→A' = 'A→B'): void {
  _alignmentMode = true;
  
  // Set source and destination based on direction
  const sourcePoint = direction === 'A→B' ? link.pointA : link.pointB;
  const destinationPoint = direction === 'A→B' ? link.pointB : link.pointA;
  
  _selectedLink = {
    sourcePoint: {
      name: sourcePoint.name,
      lat: sourcePoint.lat,
      lng: sourcePoint.lng,
      height: sourcePoint.height,
    },
    destinationPoint: {
      name: destinationPoint.name,
      lat: destinationPoint.lat,
      lng: destinationPoint.lng,
      height: destinationPoint.height,
    },
    distance: link.distance,
    linkId: link.id,
    linkName: link.name,
    direction,
  };
  
  // Calculate target orientation
  const azimuth = calculateAzimuth(
    sourcePoint.lat,
    sourcePoint.lng,
    destinationPoint.lat,
    destinationPoint.lng
  );
  
  const elevation = calculateElevationAngle(
    sourcePoint.height,
    destinationPoint.height,
    link.distance
  );
  
  _targetOrientation = {
    azimuth,
    elevation,
  };
  
  // Reset alignment status
  _alignmentStatus = {
    isAligned: false,
    currentAzimuth: null,
    currentElevation: null,
    azimuthDelta: null,
    elevationDelta: null,
    azimuthTolerance: 2.0,
    elevationTolerance: 1.0,
    status: 'adjusting',
  };
}

/**
 * Generate adjustment guidance text based on alignment deltas
 */
function generateAdjustmentGuidance(azimuthDelta: number, elevationDelta: number): string {
  const azimuthAbs = Math.abs(azimuthDelta);
  const elevationAbs = Math.abs(elevationDelta);
  
  const parts: string[] = [];
  
  // Azimuth guidance
  if (azimuthAbs > 0.5) {
    const direction = azimuthDelta > 0 ? 'clockwise' : 'counterclockwise';
    parts.push(`Turn ${azimuthAbs.toFixed(1)}° ${direction}`);
  }
  
  // Elevation guidance
  if (elevationAbs > 0.5) {
    const direction = elevationDelta > 0 ? 'up' : 'down';
    parts.push(`Tilt ${elevationAbs.toFixed(1)}° ${direction}`);
  }
  
  if (parts.length === 0) {
    return 'Fine-tune alignment';
  }
  
  return parts.join(', ');
}

/**
 * Get compass direction from azimuth
 */
function getCompassDirection(azimuth: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(azimuth / 22.5) % 16;
  return directions[index];
}

async function requestPermission(): Promise<boolean> {
  // iOS 13+ requires explicit permission
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
  ) {
    try {
      const result = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  }
  // Android / desktop — no permission needed
  return true;
}

function startListening(options: ToolActivateOptions, availableLinks: FormattedLink[] = []): void {
  // Ensure only one active listener/interval pair exists at a time.
  stopListening();

  if (typeof window === 'undefined') return;

  _options = options;
  _isListening = true;
  _lastResultEmitAt = 0;

  // Auto-select first link for alignment if available
  if (availableLinks.length > 0) {
    selectLinkForAlignment(availableLinks[0], 'A→B');
  }

  _orientationListener = (event: DeviceOrientationEvent) => {
    _lastReading = {
      alpha: event.alpha ?? 0,  // Compass heading (0-360)
      beta: event.beta ?? 0,    // Front-back tilt (-180 to 180)
      gamma: event.gamma ?? 0,  // Left-right tilt (-90 to 90)
    };
  };

  window.addEventListener('deviceorientation', _orientationListener, true);

  // Update display every 200ms
  _updateInterval = setInterval(() => {
    if (_lastReading && _options) {
      const pitch = _lastReading.beta;
      const roll = _lastReading.gamma;
      const tilt = Math.sqrt(pitch * pitch + roll * roll);
      const heading = _lastReading.alpha;

      _options.onStatusChange(
        `Pitch: ${pitch.toFixed(1)}° · Roll: ${roll.toFixed(1)}° · Tilt: ${tilt.toFixed(1)}°`
      );

      const now = Date.now();
      if (now - _lastResultEmitAt >= 1000) {
        _lastResultEmitAt = now;
        
        // Build result data with available links if they exist
        const resultData: Record<string, unknown> = {
          live: true,
          sensorMode: true,
          pitch: `${pitch.toFixed(1)}°`,
          roll: `${roll.toFixed(1)}°`,
          tilt: `${tilt.toFixed(1)}°`,
          heading: `${heading.toFixed(1)}°`,
          isLevel: tilt < 1.0,
          levelStatus: tilt < 0.5 ? '✅ Level (< 0.5°)' : tilt < 2.0 ? '⚠️ Slightly tilted' : '❌ Not level',
          raw: { alpha: heading, beta: pitch, gamma: roll },
        };
        
        // Add available links for alignment mode if they exist
        if (availableLinks.length > 0) {
          resultData.alignmentMode = true;
          resultData.availableLinks = availableLinks.map(link => ({
            id: link.id,
            name: link.name,
            displayName: link.displayName,
            pointA: {
              name: link.pointA.name,
              lat: link.pointA.lat,
              lng: link.pointA.lng,
              height: link.pointA.height,
            },
            pointB: {
              name: link.pointB.name,
              lat: link.pointB.lat,
              lng: link.pointB.lng,
              height: link.pointB.height,
            },
            distance: link.distance,
          }));
        }
        
        // Add target orientation and alignment guidance if a link is selected
        if (_alignmentMode && _selectedLink && _targetOrientation) {
          resultData.targetAzimuth = _targetOrientation.azimuth;
          resultData.targetElevation = _targetOrientation.elevation;
          resultData.alignmentDirection = _selectedLink.direction;
          resultData.reciprocalAzimuth = calculateReciprocalAzimuth(_targetOrientation.azimuth);
          
          // Update current azimuth from sensor
          _alignmentStatus.currentAzimuth = heading;
          _alignmentStatus.currentElevation = pitch;
          
          // Check alignment tolerance
          const toleranceCheck = checkAlignmentTolerance(
            heading,
            _targetOrientation.azimuth,
            pitch,
            _targetOrientation.elevation,
            _alignmentStatus.azimuthTolerance,
            _alignmentStatus.elevationTolerance
          );
          
          _alignmentStatus.isAligned = toleranceCheck.isAligned;
          _alignmentStatus.azimuthDelta = toleranceCheck.azimuthDelta;
          _alignmentStatus.elevationDelta = toleranceCheck.elevationDelta;
          _alignmentStatus.status = toleranceCheck.isAligned ? 'aligned' : 'adjusting';
          
          // Add alignment data to result
          resultData.currentAzimuth = heading;
          resultData.currentElevation = pitch;
          resultData.alignmentStatus = _alignmentStatus.status;
          resultData.alignmentGuidance = generateAdjustmentGuidance(
            toleranceCheck.azimuthDelta,
            toleranceCheck.elevationDelta
          );
          resultData.adjustmentDirection = generateAdjustmentGuidance(
            toleranceCheck.azimuthDelta,
            toleranceCheck.elevationDelta
          );
          resultData.azimuthDelta = toleranceCheck.azimuthDelta;
          resultData.elevationDelta = toleranceCheck.elevationDelta;
          resultData.compassDirection = getCompassDirection(_targetOrientation.azimuth);
        }
        
        _options.onResult({
          toolId: 'level-tool',
          timestamp: now,
          data: resultData,
          overlays: [],
        });
      }
    }
  }, 200);
}

function stopListening(): void {
  _isListening = false;

  if (_orientationListener) {
    window.removeEventListener('deviceorientation', _orientationListener, true);
    _orientationListener = null;
  }
  if (_updateInterval) {
    clearInterval(_updateInterval);
    _updateInterval = null;
  }
  _lastReading = null;
  _options = null;
  _lastResultEmitAt = 0;
  
  // Reset alignment state when stopping
  resetAlignmentState();
}

// ─── Manual Mode (desktop) ──────────────────────────────────────────

function showDesktopMode(options: ToolActivateOptions, availableLinks: FormattedLink[] = []): void {
  options.onStatusChange('📐 No device sensors detected. Showing manual inclinometer calculator.');
  
  const resultData: Record<string, unknown> = {
    sensorMode: false,
    message: 'Device orientation sensors not available on this device.',
    calculator: {
      description: 'Manual tilt angle calculator for FSO mounting verification',
      formula: 'Tilt angle = arctan(height difference / horizontal distance)',
      example: 'For a 5m height diff over 2km: arctan(5/2000) = 0.143°',
    },
    tips: [
      'Use a physical bubble level for accurate mounting angle',
      'Most FSO devices need ≤ 0.5° tilt accuracy',
      'For mobile inclinometer, open this page on a smartphone',
    ],
  };
  
  // Add available links for alignment mode if they exist
  if (availableLinks.length > 0) {
    resultData.alignmentMode = true;
    resultData.availableLinks = availableLinks.map(link => ({
      id: link.id,
      name: link.name,
      displayName: link.displayName,
      pointA: {
        name: link.pointA.name,
        lat: link.pointA.lat,
        lng: link.pointA.lng,
        height: link.pointA.height,
      },
      pointB: {
        name: link.pointB.name,
        lat: link.pointB.lat,
        lng: link.pointB.lng,
        height: link.pointB.height,
      },
      distance: link.distance,
    }));
    
    // Auto-select first link and show target orientation for manual alignment
    selectLinkForAlignment(availableLinks[0], 'A→B');
    
    if (_targetOrientation) {
      resultData.targetAzimuth = _targetOrientation.azimuth;
      resultData.targetElevation = _targetOrientation.elevation;
      resultData.alignmentDirection = _selectedLink?.direction;
      resultData.reciprocalAzimuth = calculateReciprocalAzimuth(_targetOrientation.azimuth);
      resultData.compassDirection = getCompassDirection(_targetOrientation.azimuth);
      
      // Add manual alignment instructions
      resultData.manualAlignmentInstructions = [
        `Use external compass to aim device at ${_targetOrientation.azimuth.toFixed(1)}° (${getCompassDirection(_targetOrientation.azimuth)})`,
        `Use external inclinometer to set elevation angle to ${_targetOrientation.elevation.toFixed(1)}°`,
        `Verify alignment with physical tools before finalizing installation`,
      ];
    }
  }
  
  options.onResult({
    toolId: 'level-tool',
    timestamp: Date.now(),
    data: resultData,
    overlays: [],
  });
}

export const levelTool: ToolHandler = {
  async activate(options: ToolActivateOptions) {
    if (_isListening) {
      stopListening();
      options.onStatusChange('Level tool stopped.');
      options.onResult({
        toolId: 'level-tool',
        timestamp: Date.now(),
        data: {
          live: false,
          sensorMode: true,
          stopped: true,
          message: 'Inclinometer stopped.',
        },
        overlays: [],
      });
      return;
    }

    _sensorAvailable = checkSensorAvailability();

    // Fetch saved LOS links for alignment mode
    const savedLinks = fetchSavedLOSLinks();
    const formattedLinks = formatLinksForAlignment(savedLinks);
    const hasLinks = formattedLinks.length > 0;

    if (!_sensorAvailable) {
      showDesktopMode(options, formattedLinks);
      return;
    }

    options.onStatusChange('Requesting sensor permission...');
    _permissionGranted = await requestPermission();

    if (!_permissionGranted) {
      options.onStatusChange('Sensor permission denied. Using manual mode.');
      showDesktopMode(options, formattedLinks);
      return;
    }

    // Display available links if they exist
    if (hasLinks) {
      options.onStatusChange('Hold device flat to use as level. Select a link for FSO alignment.');
    } else {
      options.onStatusChange('Hold device flat to use as level. Tilt to measure angles.');
    }
    
    startListening(options, formattedLinks);
  },

  deactivate() {
    stopListening();
  },

  handleClick() {
    // Level tool doesn't use map clicks
  },

  getCursor() {
    return '';
  },
};
