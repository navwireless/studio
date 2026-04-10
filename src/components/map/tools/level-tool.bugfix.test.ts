/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Bug Condition Exploration Test for Level Tool - FSO Device Alignment
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**
 * 
 * This test explores the bug condition where the level inclinometer tool
 * is activated with saved LOS links and user intent to align FSO devices,
 * but the system fails to provide alignment interface, target calculations,
 * or real-time guidance.
 * 
 * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * **DO NOT attempt to fix the test or the code when it fails.**
 * 
 * **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
 * 
 * The test will document counterexamples:
 * - Point selection interface not rendered
 * - Target calculations missing
 * - No real-time guidance
 * - No visual indicators
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { levelTool } from './level-tool';
import type { ToolActivateOptions } from '@/types/map-tools';
import type { SavedLink } from '@/types';

// Mock localStorage for saved links
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock DeviceOrientationEvent
let mockOrientationHandler: ((event: DeviceOrientationEvent) => void) | null = null;

Object.defineProperty(window, 'DeviceOrientationEvent', {
  value: class MockDeviceOrientationEvent {
    alpha: number;
    beta: number;
    gamma: number;
    
    constructor(type: string, init?: { alpha?: number; beta?: number; gamma?: number }) {
      this.alpha = init?.alpha ?? 0;
      this.beta = init?.beta ?? 0;
      this.gamma = init?.gamma ?? 0;
    }
  },
  writable: true,
});

// Override addEventListener to capture orientation listener
const originalAddEventListener = window.addEventListener;
window.addEventListener = vi.fn((event: string, handler: any) => {
  if (event === 'deviceorientation') {
    mockOrientationHandler = handler;
  }
  return originalAddEventListener.call(window, event, handler);
}) as any;

describe('Property 1: Bug Condition - FSO Device Alignment Workflow', () => {
  let onStatusChange: ReturnType<typeof vi.fn>;
  let onResult: ReturnType<typeof vi.fn>;
  let onProcessingChange: ReturnType<typeof vi.fn>;
  let addClickPoint: ReturnType<typeof vi.fn>;
  let getClickPoints: ReturnType<typeof vi.fn>;
  let options: ToolActivateOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockOrientationHandler = null;
    
    onStatusChange = vi.fn();
    onResult = vi.fn();
    onProcessingChange = vi.fn();
    addClickPoint = vi.fn();
    getClickPoints = vi.fn(() => []);
    
    options = {
      onStatusChange,
      onResult,
      onProcessingChange,
      addClickPoint,
      getClickPoints,
      map: {} as google.maps.Map,
    } as ToolActivateOptions;
  });

  afterEach(() => {
    levelTool.deactivate();
  });

  /**
   * Generator for saved LOS links with realistic data
   */
  const savedLinkArbitrary = fc.record({
    id: fc.string({ minLength: 10, maxLength: 20 }),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    pointA: fc.record({
      name: fc.string({ minLength: 3, maxLength: 20 }),
      lat: fc.double({ min: -90, max: 90 }),
      lng: fc.double({ min: -180, max: 180 }),
      towerHeight: fc.double({ min: 5, max: 100 }),
    }),
    pointB: fc.record({
      name: fc.string({ minLength: 3, maxLength: 20 }),
      lat: fc.double({ min: -90, max: 90 }),
      lng: fc.double({ min: -180, max: 180 }),
      towerHeight: fc.double({ min: 5, max: 100 }),
    }),
    clearanceThreshold: fc.double({ min: 0, max: 10 }),
    createdAt: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
    color: fc.constantFrom('#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'),
  });

  /**
   * Property: When level tool is activated with saved LOS data and user intent
   * is FSO device alignment, the system SHOULD display point selection interface,
   * calculate target azimuth and elevation, provide real-time guidance, support
   * bidirectional alignment, and confirm alignment when within tolerance.
   * 
   * **EXPECTED**: This test FAILS on unfixed code, proving the bug exists.
   */
  it('should provide FSO device alignment workflow when saved LOS links exist (Property)', { timeout: 30000 }, async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(savedLinkArbitrary, { minLength: 1, maxLength: 5 }),
        async (savedLinks) => {
          // Clear any previous data
          mockLocalStorage.clear();
          // ARRANGE: Set up saved LOS links in localStorage
          mockLocalStorage.setItem('findlos_saved_links', JSON.stringify(savedLinks));

          // ACT: Activate level tool (simulating user intent to align FSO device)
          await levelTool.activate(options);

          // Simulate sensor data
          if (mockOrientationHandler) {
            const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', {
              alpha: 45,  // Current heading
              beta: 5,    // Current pitch
              gamma: 2,   // Current roll
            });
            mockOrientationHandler(mockEvent);
          }

          // Wait for any async operations and result emission
          await new Promise(resolve => setTimeout(resolve, 1200));

          // ASSERT: Verify alignment interface is displayed
          // Requirement 2.1: Point selection interface with saved LOS links
          const statusCalls = onStatusChange.mock.calls.map(call => call[0]);
          const resultCalls = onResult.mock.calls.map(call => call[0]);

          // Check if any status message mentions alignment or point selection
          const hasAlignmentInterface = statusCalls.some((msg: string) => 
            msg.toLowerCase().includes('alignment') ||
            msg.toLowerCase().includes('select') ||
            msg.toLowerCase().includes('point') ||
            msg.toLowerCase().includes('fso')
          );

          expect(hasAlignmentInterface).toBe(true);

          // ASSERT: Verify target orientation is calculated
          // Requirement 2.2: Calculate target azimuth and elevation
          const hasTargetCalculation = resultCalls.some((result: any) => 
            result.data?.targetAzimuth !== undefined &&
            result.data?.targetElevation !== undefined
          );

          expect(hasTargetCalculation).toBe(true);

          // ASSERT: Verify real-time guidance is provided
          // Requirement 2.3: Real-time sensor-based guidance
          const hasRealTimeGuidance = resultCalls.some((result: any) => 
            result.data?.currentAzimuth !== undefined &&
            result.data?.alignmentGuidance !== undefined
          );

          expect(hasRealTimeGuidance).toBe(true);

          // ASSERT: Verify alignment interface shows saved links
          // Requirement 2.6: List all saved link points
          const hasSavedLinksDisplay = resultCalls.some((result: any) => 
            result.data?.availableLinks !== undefined &&
            Array.isArray(result.data.availableLinks) &&
            result.data.availableLinks.length > 0
          );

          expect(hasSavedLinksDisplay).toBe(true);

          // ASSERT: Verify bidirectional alignment support
          // Requirement 2.5: Support both A→B and B→A alignment
          const hasBidirectionalSupport = resultCalls.some((result: any) => 
            result.data?.alignmentDirection !== undefined ||
            result.data?.reciprocalAzimuth !== undefined
          );

          expect(hasBidirectionalSupport).toBe(true);

          // ASSERT: Verify visual indicators for alignment guidance
          // Requirement 2.3: Visual indicators (arrows, colors) for adjustment
          const hasVisualIndicators = resultCalls.some((result: any) => 
            result.data?.alignmentStatus !== undefined ||
            result.data?.adjustmentDirection !== undefined
          );

          expect(hasVisualIndicators).toBe(true);

          // Cleanup
          levelTool.deactivate();
        }
      ),
      { numRuns: 20 } // Run 20 test cases with different saved link configurations
    );
  });

  /**
   * Simple test to verify basic activation works
   */
  it('should call onResult when activated with saved links', async () => {
    // ARRANGE
    const savedLink: Partial<SavedLink> = {
      id: 'test_link',
      name: 'Test Link',
      pointA: {
        name: 'Point A',
        lat: 37.7749,
        lng: -122.4194,
        towerHeight: 30,
      },
      pointB: {
        name: 'Point B',
        lat: 37.7849,
        lng: -122.4094,
        towerHeight: 25,
      },
      analysisResult: {
        distance: 1500,
      } as any,
      clearanceThreshold: 5,
      createdAt: Date.now(),
      color: '#FF6B6B',
    };

    mockLocalStorage.setItem('findlos_saved_links', JSON.stringify([savedLink]));

    // ACT
    await levelTool.activate(options);

    // Trigger orientation event
    if (mockOrientationHandler) {
      const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 45,
        beta: 5,
        gamma: 2,
      });
      mockOrientationHandler(mockEvent);
    }

    // Wait for interval to fire (200ms interval + 1000ms for first result)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ASSERT
    expect(onResult).toHaveBeenCalled();
    expect(onResult.mock.calls.length).toBeGreaterThan(0);
    
    levelTool.deactivate();
  });

  /**
   * Concrete test case: Specific scenario with known saved link
   * 
   * This test uses a concrete example to demonstrate the bug more clearly.
   */
  it('should display alignment interface for concrete saved link (Tower A → Building B)', async () => {
    // Clear any previous data
    mockLocalStorage.clear();
    
    // ARRANGE: Create a specific saved link
    const savedLink: Partial<SavedLink> = {
      id: 'link_test_123',
      name: 'Tower A → Building B',
      pointA: {
        name: 'Tower A',
        lat: 37.7749,
        lng: -122.4194,
        towerHeight: 30,
      },
      pointB: {
        name: 'Building B',
        lat: 37.7849,
        lng: -122.4094,
        towerHeight: 25,
      },
      analysisResult: {
        distance: 1500, // 1.5 km
      } as any,
      clearanceThreshold: 5,
      createdAt: Date.now(),
      color: '#FF6B6B',
    };

    mockLocalStorage.setItem('findlos_saved_links', JSON.stringify([savedLink]));

    // ACT: Activate level tool
    await levelTool.activate(options);

    // Simulate sensor data
    if (mockOrientationHandler) {
      const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 45,  // Current heading: 45° (NE)
        beta: 5,    // Current pitch: 5°
        gamma: 2,   // Current roll: 2°
      });
      mockOrientationHandler(mockEvent);
    }

    // Wait for result emission (need to wait for first 1000ms result)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ASSERT: Verify alignment workflow is provided
    const resultCalls = onResult.mock.calls.map(call => call[0]);
    const latestResult = resultCalls[resultCalls.length - 1];

    // Requirement 2.1: Point selection interface displayed
    expect(latestResult?.data?.availableLinks).toBeDefined();
    expect(Array.isArray(latestResult?.data?.availableLinks)).toBe(true);
    expect((latestResult?.data?.availableLinks as any[]).length).toBeGreaterThan(0);
    expect((latestResult?.data?.availableLinks as any[])[0].displayName).toBe('Tower A → Building B');

    // Requirement 2.2: Target azimuth and elevation calculated
    // Expected azimuth from Tower A to Building B should be approximately 45° (NE)
    // Expected elevation should be calculated based on height difference and distance
    expect(latestResult?.data?.targetAzimuth).toBeDefined();
    expect(latestResult?.data?.targetElevation).toBeDefined();
    expect(typeof latestResult?.data?.targetAzimuth).toBe('number');
    expect(typeof latestResult?.data?.targetElevation).toBe('number');

    // Requirement 2.3: Real-time guidance provided
    expect(latestResult?.data?.currentAzimuth).toBeDefined();
    expect(latestResult?.data?.alignmentGuidance).toBeDefined();

    // Requirement 2.4: Alignment confirmation when within tolerance
    // If current orientation matches target, should show "Aligned!" message
    const azimuthDiff = Math.abs(latestResult?.data?.currentAzimuth - latestResult?.data?.targetAzimuth);
    if (azimuthDiff <= 2) {
      expect(latestResult?.data?.alignmentStatus).toContain('Aligned');
    }

    // Cleanup
    levelTool.deactivate();
  });

  /**
   * Test: Bidirectional alignment (reciprocal azimuth calculation)
   * 
   * Requirement 2.5: When aligning from point B to point A, the system
   * should calculate the reciprocal azimuth and opposite elevation angle.
   */
  it('should calculate reciprocal azimuth for bidirectional alignment (B → A)', async () => {
    // ARRANGE: Create saved link
    const savedLink: Partial<SavedLink> = {
      id: 'link_test_456',
      name: 'Site A ↔ Site B',
      pointA: {
        name: 'Site A',
        lat: 40.7128,
        lng: -74.0060,
        towerHeight: 40,
      },
      pointB: {
        name: 'Site B',
        lat: 40.7228,
        lng: -73.9960,
        towerHeight: 35,
      },
      analysisResult: {
        distance: 2000, // 2 km
      } as any,
      clearanceThreshold: 5,
      createdAt: Date.now(),
      color: '#4ECDC4',
    };

    mockLocalStorage.setItem('findlos_saved_links', JSON.stringify([savedLink]));

    // ACT: Activate level tool and select B → A direction
    await levelTool.activate(options);

    // Simulate sensor data
    if (mockOrientationHandler) {
      const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 90,  // Current heading: 90° (E)
        beta: 3,    // Current pitch: 3°
        gamma: 1,   // Current roll: 1°
      });
      mockOrientationHandler(mockEvent);
    }

    // Wait for result emission
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ASSERT: Verify reciprocal azimuth calculation
    const resultCalls = onResult.mock.calls.map(call => call[0]);
    const latestResult = resultCalls[resultCalls.length - 1];

    // The system should provide both forward and reciprocal azimuth
    expect(latestResult?.data?.targetAzimuth).toBeDefined();
    expect(latestResult?.data?.reciprocalAzimuth).toBeDefined();

    // Reciprocal azimuth should be (azimuth + 180) % 360
    if (latestResult?.data?.targetAzimuth !== undefined && 
        latestResult?.data?.reciprocalAzimuth !== undefined) {
      const expectedReciprocal = (latestResult.data.targetAzimuth + 180) % 360;
      expect(latestResult.data.reciprocalAzimuth).toBeCloseTo(expectedReciprocal, 1);
    }

    // Cleanup
    levelTool.deactivate();
  });

  /**
   * Test: Desktop mode with no sensors should still show target calculations
   * 
   * Requirement 2.7: When device sensors are unavailable (desktop), the system
   * should display the calculated target azimuth and elevation angles for manual
   * alignment with external tools.
   */
  it('should display target calculations in desktop mode without sensors', async () => {
    // ARRANGE: Create saved link
    const savedLink: Partial<SavedLink> = {
      id: 'link_test_789',
      name: 'Point X → Point Y',
      pointA: {
        name: 'Point X',
        lat: 51.5074,
        lng: -0.1278,
        towerHeight: 50,
      },
      pointB: {
        name: 'Point Y',
        lat: 51.5174,
        lng: -0.1178,
        towerHeight: 45,
      },
      analysisResult: {
        distance: 1800, // 1.8 km
      } as any,
      clearanceThreshold: 5,
      createdAt: Date.now(),
      color: '#45B7D1',
    };

    mockLocalStorage.setItem('findlos_saved_links', JSON.stringify([savedLink]));

    // Mock no sensor availability
    const originalDeviceOrientationEvent = (window as any).DeviceOrientationEvent;
    delete (window as any).DeviceOrientationEvent;

    // ACT: Activate level tool
    await levelTool.activate(options);

    await new Promise(resolve => setTimeout(resolve, 500));

    // ASSERT: Verify target calculations are shown even without sensors
    const resultCalls = onResult.mock.calls.map(call => call[0]);
    const latestResult = resultCalls[resultCalls.length - 1];

    // Should show available links
    expect(latestResult?.data?.availableLinks).toBeDefined();

    // Should show calculated target values for manual alignment
    expect(latestResult?.data?.targetAzimuth).toBeDefined();
    expect(latestResult?.data?.targetElevation).toBeDefined();

    // Should indicate manual alignment mode
    expect(latestResult?.data?.sensorMode).toBe(false);
    // Note: manualAlignmentMode is indicated by alignmentMode + sensorMode=false
    expect(latestResult?.data?.alignmentMode).toBe(true);

    // Restore
    (window as any).DeviceOrientationEvent = originalDeviceOrientationEvent;
    levelTool.deactivate();
  });
});
