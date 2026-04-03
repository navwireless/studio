// src/components/map/tools/level-tool.ts
// Phase 12D — Digital Level / Inclinometer tool
// Uses device accelerometer (mobile) or manual input (desktop)
// Shows pitch, roll, tilt for verifying mounting angles

import type { ToolHandler, ToolActivateOptions } from '@/types/map-tools';

// ─── State ───
let _sensorAvailable = false;
let _permissionGranted = false;
let _lastReading: { alpha: number; beta: number; gamma: number } | null = null;
let _orientationListener: ((event: DeviceOrientationEvent) => void) | null = null;
let _updateInterval: ReturnType<typeof setInterval> | null = null;
let _options: ToolActivateOptions | null = null;

function checkSensorAvailability(): boolean {
  if (typeof window === 'undefined') return false;
  return 'DeviceOrientationEvent' in window;
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

function startListening(options: ToolActivateOptions): void {
  _options = options;

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

      _options.onStatusChange(
        `Pitch: ${pitch.toFixed(1)}° · Roll: ${roll.toFixed(1)}° · Tilt: ${tilt.toFixed(1)}°`
      );

      _options.onResult({
        toolId: 'level-tool',
        timestamp: Date.now(),
        data: {
          sensorMode: true,
          pitch: `${pitch.toFixed(1)}°`,
          roll: `${roll.toFixed(1)}°`,
          tilt: `${tilt.toFixed(1)}°`,
          heading: `${_lastReading.alpha.toFixed(1)}°`,
          isLevel: tilt < 1.0,
          levelStatus: tilt < 0.5 ? '✅ Level (< 0.5°)' : tilt < 2.0 ? '⚠️ Slightly tilted' : '❌ Not level',
          raw: { alpha: _lastReading.alpha, beta: pitch, gamma: roll },
        },
        overlays: [],
      });
    }
  }, 200);
}

function stopListening(): void {
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
}

// ─── Manual Mode (desktop) ──────────────────────────────────────────

function showDesktopMode(options: ToolActivateOptions): void {
  options.onStatusChange('📐 No device sensors detected. Showing manual inclinometer calculator.');
  options.onResult({
    toolId: 'level-tool',
    timestamp: Date.now(),
    data: {
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
    },
    overlays: [],
  });
}

export const levelTool: ToolHandler = {
  async activate(options: ToolActivateOptions) {
    _sensorAvailable = checkSensorAvailability();

    if (!_sensorAvailable) {
      showDesktopMode(options);
      return;
    }

    options.onStatusChange('Requesting sensor permission...');
    _permissionGranted = await requestPermission();

    if (!_permissionGranted) {
      options.onStatusChange('Sensor permission denied. Using manual mode.');
      showDesktopMode(options);
      return;
    }

    options.onStatusChange('Hold device flat to use as level. Tilt to measure angles.');
    startListening(options);
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
