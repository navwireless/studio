// Test file for alignment calculation functions in level-tool.ts
// Task 3.3: Verify alignment calculations work correctly

import { describe, it, expect } from 'vitest';

// Helper functions for testing (copied from level-tool.ts)
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function calculateAzimuth(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lng2 - lng1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const bearing = (toDegrees(θ) + 360) % 360;
  
  return bearing;
}

function calculateElevationAngle(heightA: number, heightB: number, distance: number): number {
  if (distance === 0) return 0;
  
  const heightDifference = heightB - heightA;
  const elevationRadians = Math.atan(heightDifference / distance);
  const elevationDegrees = toDegrees(elevationRadians);
  
  return elevationDegrees;
}

function calculateReciprocalAzimuth(azimuth: number): number {
  return (azimuth + 180) % 360;
}

function calculateOppositeElevation(elevation: number): number {
  return -elevation;
}

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
  let azimuthDelta = targetAzimuth - currentAzimuth;
  if (azimuthDelta > 180) azimuthDelta -= 360;
  if (azimuthDelta < -180) azimuthDelta += 360;
  
  const elevationDelta = targetElevation - currentElevation;
  
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

describe('Alignment Calculation Functions', () => {
  describe('calculateAzimuth', () => {
    it('should calculate azimuth from point A to point B (North)', () => {
      // Point A at equator, Point B directly north
      const azimuth = calculateAzimuth(0, 0, 1, 0);
      expect(azimuth).toBeCloseTo(0, 1); // Should be close to 0° (North)
    });

    it('should calculate azimuth from point A to point B (East)', () => {
      // Point A at equator, Point B directly east
      const azimuth = calculateAzimuth(0, 0, 0, 1);
      expect(azimuth).toBeCloseTo(90, 1); // Should be close to 90° (East)
    });

    it('should calculate azimuth from point A to point B (South)', () => {
      // Point A at equator, Point B directly south
      const azimuth = calculateAzimuth(1, 0, 0, 0);
      expect(azimuth).toBeCloseTo(180, 1); // Should be close to 180° (South)
    });

    it('should calculate azimuth from point A to point B (West)', () => {
      // Point A at equator, Point B directly west
      const azimuth = calculateAzimuth(0, 1, 0, 0);
      expect(azimuth).toBeCloseTo(270, 1); // Should be close to 270° (West)
    });

    it('should handle real-world coordinates', () => {
      // Example: New York to London
      const azimuth = calculateAzimuth(40.7128, -74.0060, 51.5074, -0.1278);
      expect(azimuth).toBeGreaterThan(0);
      expect(azimuth).toBeLessThan(360);
    });
  });

  describe('calculateElevationAngle', () => {
    it('should calculate positive elevation when point B is higher', () => {
      const elevation = calculateElevationAngle(100, 150, 1000);
      expect(elevation).toBeGreaterThan(0);
      expect(elevation).toBeCloseTo(2.86, 1); // atan(50/1000) ≈ 2.86°
    });

    it('should calculate negative elevation when point B is lower', () => {
      const elevation = calculateElevationAngle(150, 100, 1000);
      expect(elevation).toBeLessThan(0);
      expect(elevation).toBeCloseTo(-2.86, 1); // atan(-50/1000) ≈ -2.86°
    });

    it('should return 0 when heights are equal', () => {
      const elevation = calculateElevationAngle(100, 100, 1000);
      expect(elevation).toBe(0);
    });

    it('should return 0 when distance is 0', () => {
      const elevation = calculateElevationAngle(100, 150, 0);
      expect(elevation).toBe(0);
    });

    it('should handle small elevation angles', () => {
      // 5m height difference over 2km
      const elevation = calculateElevationAngle(0, 5, 2000);
      expect(elevation).toBeCloseTo(0.143, 2); // atan(5/2000) ≈ 0.143°
    });
  });

  describe('calculateReciprocalAzimuth', () => {
    it('should calculate reciprocal azimuth for 0° (North)', () => {
      expect(calculateReciprocalAzimuth(0)).toBe(180);
    });

    it('should calculate reciprocal azimuth for 90° (East)', () => {
      expect(calculateReciprocalAzimuth(90)).toBe(270);
    });

    it('should calculate reciprocal azimuth for 180° (South)', () => {
      expect(calculateReciprocalAzimuth(180)).toBe(0);
    });

    it('should calculate reciprocal azimuth for 270° (West)', () => {
      expect(calculateReciprocalAzimuth(270)).toBe(90);
    });

    it('should calculate reciprocal azimuth for 45° (Northeast)', () => {
      expect(calculateReciprocalAzimuth(45)).toBe(225);
    });

    it('should calculate reciprocal azimuth for 225° (Southwest)', () => {
      expect(calculateReciprocalAzimuth(225)).toBe(45);
    });
  });

  describe('calculateOppositeElevation', () => {
    it('should calculate opposite elevation for positive angle', () => {
      expect(calculateOppositeElevation(5.5)).toBe(-5.5);
    });

    it('should calculate opposite elevation for negative angle', () => {
      expect(calculateOppositeElevation(-3.2)).toBe(3.2);
    });

    it('should return 0 for 0', () => {
      expect(calculateOppositeElevation(0)).toBeCloseTo(0, 10);
    });
  });

  describe('checkAlignmentTolerance', () => {
    it('should return aligned when within tolerance', () => {
      const result = checkAlignmentTolerance(45, 46, 3, 3.5, 2, 1);
      expect(result.isAligned).toBe(true);
      expect(result.azimuthWithinTolerance).toBe(true);
      expect(result.elevationWithinTolerance).toBe(true);
      expect(result.azimuthDelta).toBeCloseTo(1, 1);
      expect(result.elevationDelta).toBeCloseTo(0.5, 1);
    });

    it('should return not aligned when azimuth exceeds tolerance', () => {
      const result = checkAlignmentTolerance(45, 50, 3, 3.5, 2, 1);
      expect(result.isAligned).toBe(false);
      expect(result.azimuthWithinTolerance).toBe(false);
      expect(result.elevationWithinTolerance).toBe(true);
      expect(result.azimuthDelta).toBeCloseTo(5, 1);
    });

    it('should return not aligned when elevation exceeds tolerance', () => {
      const result = checkAlignmentTolerance(45, 46, 3, 5, 2, 1);
      expect(result.isAligned).toBe(false);
      expect(result.azimuthWithinTolerance).toBe(true);
      expect(result.elevationWithinTolerance).toBe(false);
      expect(result.elevationDelta).toBeCloseTo(2, 1);
    });

    it('should handle azimuth wrap-around at 0°/360°', () => {
      // Current: 359°, Target: 1° (should be 2° difference, not 358°)
      const result = checkAlignmentTolerance(359, 1, 0, 0, 2, 1);
      expect(result.azimuthDelta).toBeCloseTo(2, 1);
      expect(result.azimuthWithinTolerance).toBe(true);
    });

    it('should handle azimuth wrap-around at 360°/0°', () => {
      // Current: 1°, Target: 359° (should be -2° difference, not 358°)
      const result = checkAlignmentTolerance(1, 359, 0, 0, 2, 1);
      expect(result.azimuthDelta).toBeCloseTo(-2, 1);
      expect(result.azimuthWithinTolerance).toBe(true);
    });

    it('should use default tolerances when not specified', () => {
      const result = checkAlignmentTolerance(45, 46.5, 3, 3.8);
      expect(result.isAligned).toBe(true); // Within ±2° azimuth and ±1° elevation
    });
  });
});
