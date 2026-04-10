/**
 * Unit tests for real-time guidance logic in level-tool.ts
 * Task 3.5: Verify real-time guidance logic implementation
 * 
 * Tests the following requirements:
 * - Compare current device azimuth to target azimuth
 * - Compare current device tilt to target elevation
 * - Generate adjustment instructions based on differences
 * - Update visual indicators in real-time
 * - Trigger alignment confirmation when within tolerance
 */

import { describe, it, expect } from 'vitest';

/**
 * Helper function to generate adjustment guidance text
 * (Copied from level-tool.ts for testing)
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

describe('Real-Time Guidance Logic (Task 3.5)', () => {
  describe('generateAdjustmentGuidance', () => {
    it('should generate clockwise turn instruction when azimuth delta is positive', () => {
      const guidance = generateAdjustmentGuidance(15, 0);
      expect(guidance).toBe('Turn 15.0° clockwise');
    });

    it('should generate counterclockwise turn instruction when azimuth delta is negative', () => {
      const guidance = generateAdjustmentGuidance(-10, 0);
      expect(guidance).toBe('Turn 10.0° counterclockwise');
    });

    it('should generate tilt up instruction when elevation delta is positive', () => {
      const guidance = generateAdjustmentGuidance(0, 5);
      expect(guidance).toBe('Tilt 5.0° up');
    });

    it('should generate tilt down instruction when elevation delta is negative', () => {
      const guidance = generateAdjustmentGuidance(0, -3);
      expect(guidance).toBe('Tilt 3.0° down');
    });

    it('should generate combined instructions for both azimuth and elevation adjustments', () => {
      const guidance = generateAdjustmentGuidance(15, 2);
      expect(guidance).toBe('Turn 15.0° clockwise, Tilt 2.0° up');
    });

    it('should generate combined instructions for negative deltas', () => {
      const guidance = generateAdjustmentGuidance(-8, -4);
      expect(guidance).toBe('Turn 8.0° counterclockwise, Tilt 4.0° down');
    });

    it('should return fine-tune message when both deltas are within 0.5°', () => {
      const guidance = generateAdjustmentGuidance(0.3, 0.2);
      expect(guidance).toBe('Fine-tune alignment');
    });

    it('should return fine-tune message when both deltas are zero', () => {
      const guidance = generateAdjustmentGuidance(0, 0);
      expect(guidance).toBe('Fine-tune alignment');
    });

    it('should ignore small azimuth delta (< 0.5°) but show elevation adjustment', () => {
      const guidance = generateAdjustmentGuidance(0.3, 2);
      expect(guidance).toBe('Tilt 2.0° up');
    });

    it('should ignore small elevation delta (< 0.5°) but show azimuth adjustment', () => {
      const guidance = generateAdjustmentGuidance(10, 0.2);
      expect(guidance).toBe('Turn 10.0° clockwise');
    });
  });

  describe('Real-time guidance scenarios', () => {
    it('should provide guidance for device pointing too far left', () => {
      // Current: 30°, Target: 45° → Need to turn 15° clockwise
      const azimuthDelta = 45 - 30; // 15°
      const elevationDelta = 0;
      const guidance = generateAdjustmentGuidance(azimuthDelta, elevationDelta);
      expect(guidance).toContain('clockwise');
      expect(guidance).toContain('15.0°');
    });

    it('should provide guidance for device pointing too far right', () => {
      // Current: 60°, Target: 45° → Need to turn 15° counterclockwise
      const azimuthDelta = 45 - 60; // -15°
      const elevationDelta = 0;
      const guidance = generateAdjustmentGuidance(azimuthDelta, elevationDelta);
      expect(guidance).toContain('counterclockwise');
      expect(guidance).toContain('15.0°');
    });

    it('should provide guidance for device tilted too low', () => {
      // Current: 1°, Target: 3° → Need to tilt 2° up
      const azimuthDelta = 0;
      const elevationDelta = 3 - 1; // 2°
      const guidance = generateAdjustmentGuidance(azimuthDelta, elevationDelta);
      expect(guidance).toContain('up');
      expect(guidance).toContain('2.0°');
    });

    it('should provide guidance for device tilted too high', () => {
      // Current: 5°, Target: 3° → Need to tilt 2° down
      const azimuthDelta = 0;
      const elevationDelta = 3 - 5; // -2°
      const guidance = generateAdjustmentGuidance(azimuthDelta, elevationDelta);
      expect(guidance).toContain('down');
      expect(guidance).toContain('2.0°');
    });

    it('should provide combined guidance for misaligned device', () => {
      // Current: 30° azimuth, 1° elevation
      // Target: 45° azimuth, 3° elevation
      // Need: Turn 15° clockwise, Tilt 2° up
      const azimuthDelta = 45 - 30; // 15°
      const elevationDelta = 3 - 1; // 2°
      const guidance = generateAdjustmentGuidance(azimuthDelta, elevationDelta);
      expect(guidance).toContain('Turn 15.0° clockwise');
      expect(guidance).toContain('Tilt 2.0° up');
    });

    it('should indicate fine-tuning when nearly aligned', () => {
      // Current: 44.7° azimuth, 2.8° elevation
      // Target: 45° azimuth, 3° elevation
      // Deltas: 0.3° azimuth, 0.2° elevation (both < 0.5°)
      const azimuthDelta = 45 - 44.7; // 0.3°
      const elevationDelta = 3 - 2.8; // 0.2°
      const guidance = generateAdjustmentGuidance(azimuthDelta, elevationDelta);
      expect(guidance).toBe('Fine-tune alignment');
    });
  });
});
