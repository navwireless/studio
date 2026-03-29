// src/config/devices.ts

/**
 * Device Intelligence Configuration
 *
 * Defines all Nav Wireless / OpticSpectra FSO device specifications and provides
 * helper functions for device compatibility analysis, recommendations,
 * and filtering.
 *
 * These are Free Space Optical (FSO) laser communication devices
 * manufactured by Nav Wireless Technologies Pvt. Ltd.
 *
 * Key advantages of OpticSpectra FSO technology:
 * - No trenching or digging required
 * - No Right-of-Way (ROW) issues
 * - No spectrum license required (laser is unlicensed)
 * - Highly secure — narrow laser beam, nearly impossible to intercept
 * - Easy and fast installation
 * - Low latency (<5ms optical channel)
 * - Full duplex operation
 * - Tested and certified in extreme conditions
 *
 * @module config/devices
 */

// ============================================
// Device Specification Interface
// ============================================

export interface DeviceSpec {
  /** Unique identifier, e.g. 'opticspectra-1g-5km' */
  id: string;
  /** Display name, e.g. 'OpticSpectra 1G – 5Km' */
  name: string;
  /** Product line grouping, e.g. 'OpticSpectra' or 'OpticSpectra Penta-5' */
  productLine: string;
  /** Human-readable bandwidth, e.g. '1 Gbps' */
  bandwidth: string;
  /** Numeric bandwidth in Mbps for sorting/filtering (1000 = 1Gbps, 10000 = 10Gbps) */
  bandwidthMbps: number;
  /** Maximum link distance in meters */
  maxRange: number;
  /** Maximum link distance in kilometers */
  maxRangeKm: number;
  /** Short device description */
  description: string;
  /** Ideal use case description */
  idealUseCase: string;
  /** Key advantages/features specific to this device */
  keyFeatures: string[];
  /** Whether this is a JSS 55555 (Penta-5) defence certified model */
  isPenta5Certified: boolean;
  /** Whether device has RF backup channel */
  hasRfBackup: boolean;
  /** Whether device has PAT (Pointing, Acquisition, Tracking) / Gyro system */
  hasPAT: boolean;
  /** URL to product datasheet */
  datasheetUrl?: string;
  /** URL to product image */
  imageUrl?: string;
  /** Whether this device is currently available for selection */
  isActive: boolean;
  /** Display sort order (ascending) */
  sortOrder: number;
}

// ============================================
// Device Compatibility Types
// ============================================

/** Reliability rating based on range utilization */
export type ReliabilityRating = 'excellent' | 'good' | 'marginal' | 'exceeds_range';

/** Compatibility analysis for a single device at a given distance */
export interface DeviceCompatibilityResult {
  /** Whether the device can cover the distance */
  isCompatible: boolean;
  /** Percentage of device max range used (distance / maxRange * 100) */
  utilizationPercent: number;
  /** Remaining range margin in meters (negative if exceeds range) */
  marginMeters: number;
  /** Margin as percentage of max range */
  marginPercent: number;
  /** Reliability rating based on utilization */
  reliabilityRating: ReliabilityRating;
}

/** A compatible device entry for recommendation results */
export interface CompatibleDeviceEntry {
  deviceId: string;
  deviceName: string;
  bandwidth: string;
  maxRangeKm: number;
  utilizationPercent: number;
  reliabilityRating: ReliabilityRating;
}

/** An incompatible device entry for recommendation results */
export interface IncompatibleDeviceEntry {
  deviceId: string;
  deviceName: string;
  maxRangeKm: number;
  shortfallMeters: number;
}

/** Full device recommendation result */
export interface DeviceRecommendation {
  /** Best fit device (null if none compatible or LOS not feasible) */
  recommended: DeviceSpec | null;
  /** All devices that can cover the distance */
  compatible: DeviceSpec[];
  /** All devices that cannot cover the distance */
  incompatible: DeviceSpec[];
  /** Human-readable recommendation reasoning */
  reasoning: string;
}

// ============================================
// Shared Key Features
// ============================================

const COMMON_FSO_FEATURES: string[] = [
  'No trenching or digging required',
  'No Right-of-Way (ROW) issues',
  'No spectrum license required',
  'Highly secure — narrow laser beam, nearly impossible to intercept',
  'Easy and fast installation',
  'Full duplex operation',
  'Low latency (<5ms)',
];

// ============================================
// Device Catalog — 7 Models
// ============================================

export const DEVICES: DeviceSpec[] = [
  // ── Standard Commercial Models (4) ──
  {
    id: 'opticspectra-1g-5km',
    name: 'OpticSpectra 1G – 5Km',
    productLine: 'OpticSpectra',
    bandwidth: '1 Gbps',
    bandwidthMbps: 1000,
    maxRange: 5000,
    maxRangeKm: 5,
    description: 'Standard 1Gbps FSO laser link for short to medium-range deployments up to 5 kilometers.',
    idealUseCase: 'Building-to-building connectivity, campus networks, inter-office links within 5km.',
    keyFeatures: [...COMMON_FSO_FEATURES],
    isPenta5Certified: false,
    hasRfBackup: false,
    hasPAT: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'opticspectra-1g-10km',
    name: 'OpticSpectra 1G – 10Km',
    productLine: 'OpticSpectra',
    bandwidth: '1 Gbps',
    bandwidthMbps: 1000,
    maxRange: 10000,
    maxRangeKm: 10,
    description: 'Long-range 1Gbps FSO laser link for extended reach deployments up to 10 kilometers.',
    idealUseCase: 'Cross-city links, rural connectivity, long-distance enterprise backbone up to 10km.',
    keyFeatures: [
      ...COMMON_FSO_FEATURES,
      'Extended 10km range for long-distance links',
    ],
    isPenta5Certified: false,
    hasRfBackup: false,
    hasPAT: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'opticspectra-10g-3km',
    name: 'OpticSpectra 10G – 3Km',
    productLine: 'OpticSpectra',
    bandwidth: '10 Gbps',
    bandwidthMbps: 10000,
    maxRange: 3000,
    maxRangeKm: 3,
    description: 'High-capacity 10Gbps FSO laser link for demanding short-range applications up to 3 kilometers.',
    idealUseCase: 'Data center interconnect, high-bandwidth backbone, ISP infrastructure within 3km.',
    keyFeatures: [
      ...COMMON_FSO_FEATURES,
      '10 Gbps throughput for high-bandwidth demands',
    ],
    isPenta5Certified: false,
    hasRfBackup: false,
    hasPAT: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'opticspectra-10g-5km',
    name: 'OpticSpectra 10G – 5Km',
    productLine: 'OpticSpectra',
    bandwidth: '10 Gbps',
    bandwidthMbps: 10000,
    maxRange: 5000,
    maxRangeKm: 5,
    description: 'High-capacity 10Gbps FSO laser link for medium-range high-bandwidth needs up to 5 kilometers.',
    idealUseCase: 'Enterprise backbone, ISP last-mile high-speed links, data center interconnect up to 5km.',
    keyFeatures: [
      ...COMMON_FSO_FEATURES,
      '10 Gbps throughput for high-bandwidth demands',
      'Extended 5km range with 10G capacity',
    ],
    isPenta5Certified: false,
    hasRfBackup: false,
    hasPAT: false,
    isActive: true,
    sortOrder: 4,
  },

  // ── JSS 55555 (Penta-5) Certified Defence Models (3) ──
  {
    id: 'opticspectra-1g-jss55555',
    name: 'OpticSpectra 1G – JSS 55555',
    productLine: 'OpticSpectra Penta-5',
    bandwidth: '1 Gbps',
    bandwidthMbps: 1000,
    maxRange: 10000,
    maxRangeKm: 10,
    description: 'Defence-grade 1Gbps FSO laser link, JSS 55555 (Penta-5) certified for extreme conditions. Up to 10 kilometers.',
    idealUseCase: 'Defence and military communications, secure government networks, critical infrastructure links up to 10km.',
    keyFeatures: [
      ...COMMON_FSO_FEATURES,
      'JSS 55555 (Penta-5) certified — tested for extreme temperature, humidity, altitude, and dust',
      'Defence-grade ruggedization',
    ],
    isPenta5Certified: true,
    hasRfBackup: false,
    hasPAT: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'opticspectra-1g-smart-jss55555',
    name: 'OpticSpectra 1G Smart – JSS 55555',
    productLine: 'OpticSpectra Penta-5',
    bandwidth: '1 Gbps',
    bandwidthMbps: 1000,
    maxRange: 18000,
    maxRangeKm: 18,
    description: 'Extended-range defence-grade 1Gbps FSO laser link, JSS 55555 (Penta-5) certified. Industry-leading 18 kilometer range.',
    idealUseCase: 'Long-distance defence communications, remote base connectivity, cross-terrain secure links up to 18km.',
    keyFeatures: [
      ...COMMON_FSO_FEATURES,
      'JSS 55555 (Penta-5) certified — tested for extreme temperature, humidity, altitude, and dust',
      'Industry-leading 18km range',
      'Defence-grade ruggedization',
    ],
    isPenta5Certified: true,
    hasRfBackup: false,
    hasPAT: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: 'opticspectra-1g-supreme-jss55555',
    name: 'OpticSpectra 1G Supreme – JSS 55555',
    productLine: 'OpticSpectra Penta-5',
    bandwidth: '1 Gbps',
    bandwidthMbps: 1000,
    maxRange: 10000,
    maxRangeKm: 10,
    description: 'Top-of-the-line defence-grade 1Gbps FSO laser link with inbuilt RF backup channel and PAT (Gyro) auto-alignment system. JSS 55555 certified.',
    idealUseCase: 'Mission-critical defence links, high-availability secure networks requiring RF backup and auto-alignment up to 10km.',
    keyFeatures: [
      ...COMMON_FSO_FEATURES,
      'JSS 55555 (Penta-5) certified — tested for extreme temperature, humidity, altitude, and dust',
      'Inbuilt 46W RF backup channel for all-weather availability',
      'PAT (Gyro) auto-alignment system with joystick operation',
      'Defence-grade ruggedization',
    ],
    isPenta5Certified: true,
    hasRfBackup: true,
    hasPAT: true,
    isActive: true,
    sortOrder: 7,
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Retrieves a device by its unique ID.
 * @param id - Device identifier
 * @returns The matching DeviceSpec or undefined
 */
export function getDeviceById(id: string): DeviceSpec | undefined {
  return DEVICES.find((d) => d.id === id);
}

/**
 * Returns all active devices, sorted by sortOrder.
 * @returns Array of active DeviceSpec entries
 */
export function getActiveDevices(): DeviceSpec[] {
  return DEVICES
    .filter((d) => d.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Returns all active devices whose maxRange covers the given distance.
 * @param distanceMeters - Link distance in meters
 * @returns Array of compatible DeviceSpec entries, sorted by sortOrder
 */
export function getCompatibleDevices(distanceMeters: number): DeviceSpec[] {
  if (distanceMeters < 0) return [];
  return getActiveDevices().filter((d) => d.maxRange >= distanceMeters);
}

/**
 * Calculates detailed compatibility metrics for a specific device at a given distance.
 * @param device - The device to evaluate
 * @param distanceMeters - Link distance in meters
 * @returns DeviceCompatibilityResult with utilization, margin, and reliability rating
 */
export function getDeviceCompatibility(
  device: DeviceSpec,
  distanceMeters: number
): DeviceCompatibilityResult {
  if (distanceMeters <= 0) {
    return {
      isCompatible: true,
      utilizationPercent: 0,
      marginMeters: device.maxRange,
      marginPercent: 100,
      reliabilityRating: 'excellent',
    };
  }

  const utilizationPercent = (distanceMeters / device.maxRange) * 100;
  const marginMeters = device.maxRange - distanceMeters;
  const marginPercent = (marginMeters / device.maxRange) * 100;
  const isCompatible = distanceMeters <= device.maxRange;

  let reliabilityRating: ReliabilityRating;
  if (!isCompatible) {
    reliabilityRating = 'exceeds_range';
  } else if (utilizationPercent <= 60) {
    reliabilityRating = 'excellent';
  } else if (utilizationPercent <= 80) {
    reliabilityRating = 'good';
  } else {
    reliabilityRating = 'marginal';
  }

  return {
    isCompatible,
    utilizationPercent: Math.round(utilizationPercent * 100) / 100,
    marginMeters: Math.round(marginMeters * 100) / 100,
    marginPercent: Math.round(marginPercent * 100) / 100,
    reliabilityRating,
  };
}

/**
 * Generates a full device recommendation for a given link distance and feasibility.
 *
 * Recommendation logic:
 * - If LOS is not feasible, no device is recommended (but compatibility is still calculated)
 * - Among compatible devices, the "best fit" is the one with utilization in the
 *   50-80% sweet spot. Within that range, prefer higher bandwidth.
 * - If no device in sweet spot, pick the one with lowest utilization (most headroom)
 *
 * @param distanceMeters - Link distance in meters
 * @param isFeasible - Whether the LOS analysis determined the link is feasible
 * @returns DeviceRecommendation with recommended device, compatible/incompatible lists, and reasoning
 */
export function getDeviceRecommendation(
  distanceMeters: number,
  isFeasible: boolean
): DeviceRecommendation {
  const activeDevices = getActiveDevices();

  if (distanceMeters <= 0) {
    return {
      recommended: isFeasible && activeDevices.length > 0 ? activeDevices[0] : null,
      compatible: activeDevices,
      incompatible: [],
      reasoning: distanceMeters === 0
        ? 'Both points are at the same location. All devices are compatible.'
        : 'Invalid distance. Please check your coordinates.',
    };
  }

  const compatible: DeviceSpec[] = [];
  const incompatible: DeviceSpec[] = [];

  for (const device of activeDevices) {
    if (device.maxRange >= distanceMeters) {
      compatible.push(device);
    } else {
      incompatible.push(device);
    }
  }

  if (!isFeasible) {
    return {
      recommended: null,
      compatible,
      incompatible,
      reasoning: 'Line-of-sight is obstructed. Resolve LOS issues before selecting a device. '
        + (compatible.length > 0
          ? `${compatible.length} device(s) would be in range if LOS were clear.`
          : 'No devices cover this distance.'),
    };
  }

  if (compatible.length === 0) {
    const maxRangeDevice = activeDevices.length > 0
      ? activeDevices.reduce((max, d) => d.maxRange > max.maxRange ? d : max, activeDevices[0])
      : null;
    const shortfall = maxRangeDevice
      ? distanceMeters - maxRangeDevice.maxRange
      : distanceMeters;

    return {
      recommended: null,
      compatible: [],
      incompatible,
      reasoning: `The ${(distanceMeters / 1000).toFixed(1)}km distance exceeds all available devices. `
        + (maxRangeDevice
          ? `The longest-range device (${maxRangeDevice.name}) covers up to ${maxRangeDevice.maxRangeKm}km, leaving a ${(shortfall / 1000).toFixed(1)}km shortfall.`
          : 'No devices are available.'),
    };
  }

  // Find best fit among compatible devices
  const compatibleWithUtil = compatible.map((device) => ({
    device,
    ...getDeviceCompatibility(device, distanceMeters),
  }));

  // Sweet spot: 50-80% utilization
  const sweetSpot = compatibleWithUtil.filter(
    (d) => d.utilizationPercent >= 50 && d.utilizationPercent <= 80
  );

  let recommended: DeviceSpec;
  if (sweetSpot.length > 0) {
    sweetSpot.sort((a, b) => {
      if (b.device.bandwidthMbps !== a.device.bandwidthMbps) {
        return b.device.bandwidthMbps - a.device.bandwidthMbps;
      }
      return a.utilizationPercent - b.utilizationPercent;
    });
    recommended = sweetSpot[0].device;
  } else {
    compatibleWithUtil.sort((a, b) => {
      if (a.utilizationPercent !== b.utilizationPercent) {
        return a.utilizationPercent - b.utilizationPercent;
      }
      return b.device.bandwidthMbps - a.device.bandwidthMbps;
    });
    recommended = compatibleWithUtil[0].device;
  }

  const recCompat = getDeviceCompatibility(recommended, distanceMeters);
  const distKm = (distanceMeters / 1000).toFixed(1);

  let reasoning = `For the ${distKm}km link, the ${recommended.name} is recommended`;
  reasoning += `, operating at ${recCompat.utilizationPercent.toFixed(0)}% of its ${recommended.maxRangeKm}km range`;
  reasoning += ` with a ${(recCompat.marginMeters / 1000).toFixed(1)}km margin.`;

  if (compatible.length > 1) {
    reasoning += ` ${compatible.length} device(s) are compatible in total.`;
  }

  if (incompatible.length > 0) {
    reasoning += ` ${incompatible.length} device(s) do not cover this distance.`;
  }

  return {
    recommended,
    compatible,
    incompatible,
    reasoning,
  };
}

/**
 * Builds serializable device compatibility data for storage in AnalysisResult.
 * This is the data structure stored in Firestore and returned to the client.
 *
 * @param distanceMeters - Link distance in meters
 * @param isFeasible - Whether LOS is feasible
 * @param selectedDeviceId - Optional user-selected device ID
 * @returns Serializable device compatibility object
 */
export function buildDeviceCompatibilityData(
  distanceMeters: number,
  isFeasible: boolean,
  selectedDeviceId?: string
): {
  selectedDevice?: {
    deviceId: string;
    deviceName: string;
    isCompatible: boolean;
    utilizationPercent: number;
    marginMeters: number;
    reliabilityRating: string;
  };
  recommendation: {
    recommendedDeviceId: string | null;
    recommendedDeviceName: string | null;
    compatibleDevices: CompatibleDeviceEntry[];
    incompatibleDevices: IncompatibleDeviceEntry[];
    reasoning: string;
  };
} {
  const recommendation = getDeviceRecommendation(distanceMeters, isFeasible);

  let selectedDevice: {
    deviceId: string;
    deviceName: string;
    isCompatible: boolean;
    utilizationPercent: number;
    marginMeters: number;
    reliabilityRating: string;
  } | undefined;

  if (selectedDeviceId) {
    const device = getDeviceById(selectedDeviceId);
    if (device) {
      const compat = getDeviceCompatibility(device, distanceMeters);
      selectedDevice = {
        deviceId: device.id,
        deviceName: device.name,
        isCompatible: compat.isCompatible,
        utilizationPercent: compat.utilizationPercent,
        marginMeters: compat.marginMeters,
        reliabilityRating: compat.reliabilityRating,
      };
    }
  }

  const compatibleDevices: CompatibleDeviceEntry[] = recommendation.compatible.map((d) => {
    const compat = getDeviceCompatibility(d, distanceMeters);
    return {
      deviceId: d.id,
      deviceName: d.name,
      bandwidth: d.bandwidth,
      maxRangeKm: d.maxRangeKm,
      utilizationPercent: compat.utilizationPercent,
      reliabilityRating: compat.reliabilityRating,
    };
  });

  const incompatibleDevices: IncompatibleDeviceEntry[] = recommendation.incompatible.map((d) => ({
    deviceId: d.id,
    deviceName: d.name,
    maxRangeKm: d.maxRangeKm,
    shortfallMeters: Math.round(distanceMeters - d.maxRange),
  }));

  return {
    selectedDevice,
    recommendation: {
      recommendedDeviceId: recommendation.recommended?.id ?? null,
      recommendedDeviceName: recommendation.recommended?.name ?? null,
      compatibleDevices,
      incompatibleDevices,
      reasoning: recommendation.reasoning,
    },
  };
}