/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Preservation Property Tests for Level Tool - Basic Inclinometer Functionality
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * This test suite validates that existing basic inclinometer functionality
 * remains unchanged after implementing the FSO device alignment feature.
 * 
 * **IMPORTANT**: These tests follow observation-first methodology:
 * 1. Observe behavior on UNFIXED code for non-buggy inputs
 * 2. Write property-based tests capturing observed behavior patterns
 * 3. Run tests on UNFIXED code
 * 
 * **EXPECTED OUTCOME**: Tests PASS on unfixed code (confirms baseline behavior to preserve)
 * 
 * The tests cover:
 * - Basic inclinometer displays pitch/roll/tilt readings correctly
 * - Manual calculator mode shows physical level tips when sensors unavailable
 * - Sensor cleanup and resource management work properly on tool deactivation
 * - Tool functions in basic mode when no LOS analysis exists
 * - Other map tools properly deactivate level tool
 * - Tool result panel displays sensor readings in existing format
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { levelTool } from './level-tool';
import type { ToolActivateOptions } from '@/types/map-tools';

// Mock localStorage
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

describe('Property 2: Preservation - Basic Inclinometer Functionality', () => {
  let onStatusChange: ReturnType<typeof vi.fn>;
  let onResult: ReturnType<typeof vi.fn>;
  let options: ToolActivateOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockOrientationHandler = null;
    
    onStatusChange = vi.fn();
    onResult = vi.fn();
    
    options = {
      onStatusChange,
      onResult,
      map: {} as google.maps.Map,
    };
  });

  afterEach(() => {
    levelTool.deactivate();
  });

  /**
   * Property: Basic inclinometer mode displays pitch/roll/tilt readings correctly
   * 
   * **Validates: Requirement 3.1**
   * 
   * When the level tool is used in basic inclinometer mode (no point selection),
   * the system SHALL CONTINUE TO display pitch, roll, tilt, and heading readings
   * as currently implemented.
   */
  it('should display pitch/roll/tilt readings in basic inclinometer mode (Property)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          alpha: fc.double({ min: 0, max: 360 }),  // Heading
          beta: fc.double({ min: -180, max: 180 }), // Pitch
          gamma: fc.double({ min: -90, max: 90 }),  // Roll
        }),
        async (sensorData) => {
          // ARRANGE: No saved LOS links (basic mode)
          mockLocalStorage.clear();
          vi.clearAllMocks();

          // ACT: Activate level tool
          await levelTool.activate(options);

          // Simulate sensor data
          if (mockOrientationHandler) {
            const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', sensorData);
            mockOrientationHandler(mockEvent);
          }

          // Wait for result emission
          await new Promise(resolve => setTimeout(resolve, 1200));

          // ASSERT: Verify basic inclinometer readings are displayed
          const statusCalls = onStatusChange.mock.calls.map(call => call[0]);
          const resultCalls = onResult.mock.calls.map(call => call[0]);

          // Should have status updates with pitch/roll/tilt
          const hasBasicReadings = statusCalls.some((msg: string) => 
            msg.includes('Pitch:') && msg.includes('Roll:') && msg.includes('Tilt:')
          );
          expect(hasBasicReadings).toBe(true);

          // Should have result data with sensor readings
          const hasResultData = resultCalls.some((result: any) => 
            result.data?.pitch !== undefined &&
            result.data?.roll !== undefined &&
            result.data?.tilt !== undefined &&
            result.data?.heading !== undefined
          );
          expect(hasResultData).toBe(true);

          // Verify the readings match expected format
          const latestResult = resultCalls[resultCalls.length - 1];
          if (latestResult?.data) {
            expect(latestResult.data.sensorMode).toBe(true);
            expect(latestResult.data.live).toBe(true);
            expect(typeof latestResult.data.pitch).toBe('string');
            expect(typeof latestResult.data.roll).toBe('string');
            expect(typeof latestResult.data.tilt).toBe('string');
            expect(typeof latestResult.data.heading).toBe('string');
            expect(latestResult.data.pitch).toMatch(/°$/);
            expect(latestResult.data.roll).toMatch(/°$/);
            expect(latestResult.data.tilt).toMatch(/°$/);
            expect(latestResult.data.heading).toMatch(/°$/);
          }

          // Cleanup
          levelTool.deactivate();
        }
      ),
      { numRuns: 10, timeout: 10000 }
    );
  }, 15000);

  /**
   * Property: Manual calculator mode shows physical level tips when sensors unavailable
   * 
   * **Validates: Requirement 3.2**
   * 
   * When device orientation sensors are unavailable, the system SHALL CONTINUE TO
   * show the manual calculator mode with tips for physical level usage.
   */
  it('should show manual calculator mode when sensors unavailable (Property)', async () => {
    // ARRANGE: Remove DeviceOrientationEvent to simulate no sensors
    const originalDeviceOrientationEvent = (window as any).DeviceOrientationEvent;
    delete (window as any).DeviceOrientationEvent;

    // ACT: Activate level tool
    await levelTool.activate(options);

    await new Promise(resolve => setTimeout(resolve, 500));

    // ASSERT: Verify manual mode is displayed
    const statusCalls = onStatusChange.mock.calls.map(call => call[0]);
    const resultCalls = onResult.mock.calls.map(call => call[0]);

    // Should show status about no sensors
    const hasNoSensorMessage = statusCalls.some((msg: string) => 
      msg.includes('No device sensors') || msg.includes('manual')
    );
    expect(hasNoSensorMessage).toBe(true);

    // Should have result with manual mode data
    const latestResult = resultCalls[resultCalls.length - 1];
    expect(latestResult?.data?.sensorMode).toBe(false);
    expect(latestResult?.data?.message).toContain('Device orientation sensors not available');
    
    // Should have calculator information
    expect(latestResult?.data?.calculator).toBeDefined();
    expect(latestResult?.data?.calculator?.description).toContain('Manual tilt angle calculator');
    expect(latestResult?.data?.calculator?.formula).toBeDefined();
    expect(latestResult?.data?.calculator?.example).toBeDefined();

    // Should have tips for physical level usage
    expect(latestResult?.data?.tips).toBeDefined();
    expect(Array.isArray(latestResult?.data?.tips)).toBe(true);
    expect(latestResult?.data?.tips?.length).toBeGreaterThan(0);
    expect(latestResult?.data?.tips?.some((tip: string) => tip.includes('physical bubble level'))).toBe(true);

    // Restore
    (window as any).DeviceOrientationEvent = originalDeviceOrientationEvent;
    levelTool.deactivate();
  });

  /**
   * Property: Sensor cleanup and resource management work properly on tool deactivation
   * 
   * **Validates: Requirement 3.3**
   * 
   * When the level tool is deactivated, the system SHALL CONTINUE TO stop sensor
   * listeners and clean up resources properly.
   */
  it('should clean up sensor listeners on deactivation (Property)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          alpha: fc.double({ min: 0, max: 360 }),
          beta: fc.double({ min: -180, max: 180 }),
          gamma: fc.double({ min: -90, max: 90 }),
        }),
        async (sensorData) => {
          // ARRANGE: Clear any saved links
          mockLocalStorage.clear();
          vi.clearAllMocks();

          // ACT: Activate level tool
          await levelTool.activate(options);

          // Simulate sensor data
          if (mockOrientationHandler) {
            const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', sensorData);
            mockOrientationHandler(mockEvent);
          }

          await new Promise(resolve => setTimeout(resolve, 1200));

          // Record the number of results before deactivation
          const resultsBeforeDeactivation = onResult.mock.calls.length;

          // ACT: Deactivate the tool
          levelTool.deactivate();

          // Wait to ensure no more results are emitted
          await new Promise(resolve => setTimeout(resolve, 500));

          // ASSERT: Verify no new results are emitted after deactivation
          const resultsAfterDeactivation = onResult.mock.calls.length;
          // Allow for results that were already in the pipeline
          expect(resultsAfterDeactivation).toBeLessThanOrEqual(resultsBeforeDeactivation + 1);
        }
      ),
      { numRuns: 5, timeout: 15000 }
    );
  }, 20000);

  /**
   * Property: Tool functions in basic mode when no LOS analysis exists
   * 
   * **Validates: Requirement 3.4**
   * 
   * When no LOS analysis has been performed, the system SHALL CONTINUE TO function
   * in basic inclinometer mode without alignment features.
   */
  it('should function in basic mode when no LOS data exists (Property)', async () => {
    // ARRANGE: Ensure no saved LOS links
    mockLocalStorage.clear();

    // ACT: Activate level tool
    await levelTool.activate(options);

    // Simulate sensor data
    if (mockOrientationHandler) {
      const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 90,
        beta: 10,
        gamma: 5,
      });
      mockOrientationHandler(mockEvent);
    }

    await new Promise(resolve => setTimeout(resolve, 1200));

    // ASSERT: Verify basic mode is active
    const statusCalls = onStatusChange.mock.calls.map(call => call[0]);
    const resultCalls = onResult.mock.calls.map(call => call[0]);

    // Should show basic sensor readings
    const hasBasicReadings = statusCalls.some((msg: string) => 
      msg.includes('Pitch:') && msg.includes('Roll:') && msg.includes('Tilt:')
    );
    expect(hasBasicReadings).toBe(true);

    // Should NOT show alignment-related data
    const latestResult = resultCalls[resultCalls.length - 1];
    expect(latestResult?.data?.targetAzimuth).toBeUndefined();
    expect(latestResult?.data?.targetElevation).toBeUndefined();
    expect(latestResult?.data?.availableLinks).toBeUndefined();
    expect(latestResult?.data?.alignmentGuidance).toBeUndefined();

    // Should show basic inclinometer data
    // Note: On unfixed code, these should be present
    if (latestResult?.data) {
      expect(latestResult.data.pitch).toBeDefined();
      expect(latestResult.data.roll).toBeDefined();
      expect(latestResult.data.tilt).toBeDefined();
      expect(latestResult.data.heading).toBeDefined();
      expect(latestResult.data.sensorMode).toBe(true);
    }

    // Cleanup
    levelTool.deactivate();
  });

  /**
   * Property: Tool result panel displays sensor readings in existing format
   * 
   * **Validates: Requirement 3.6**
   * 
   * When the tool result panel displays level tool results, the system SHALL
   * CONTINUE TO show sensor readings in the existing format.
   */
  it('should display sensor readings in existing format (Property)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          alpha: fc.double({ min: 0, max: 360 }),
          beta: fc.double({ min: -180, max: 180 }),
          gamma: fc.double({ min: -90, max: 90 }),
        }),
        async (sensorData) => {
          // ARRANGE: No saved LOS links
          mockLocalStorage.clear();
          vi.clearAllMocks();

          // ACT: Activate level tool
          await levelTool.activate(options);

          // Simulate sensor data
          if (mockOrientationHandler) {
            const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', sensorData);
            mockOrientationHandler(mockEvent);
          }

          await new Promise(resolve => setTimeout(resolve, 1200));

          // ASSERT: Verify result format matches existing structure
          const resultCalls = onResult.mock.calls.map(call => call[0]);
          const latestResult = resultCalls[resultCalls.length - 1];

          // Verify toolId
          expect(latestResult?.toolId).toBe('level-tool');

          // Verify timestamp exists
          expect(latestResult?.timestamp).toBeDefined();
          expect(typeof latestResult?.timestamp).toBe('number');

          // Verify data structure
          expect(latestResult?.data).toBeDefined();
          expect(latestResult?.data?.live).toBe(true);
          expect(latestResult?.data?.sensorMode).toBe(true);

          // Verify sensor readings format (strings with degree symbol)
          expect(latestResult?.data?.pitch).toMatch(/^-?\d+\.\d°$/);
          expect(latestResult?.data?.roll).toMatch(/^-?\d+\.\d°$/);
          expect(latestResult?.data?.tilt).toMatch(/^\d+\.\d°$/);
          expect(latestResult?.data?.heading).toMatch(/^\d+\.\d°$/);

          // Verify level status
          expect(latestResult?.data?.isLevel).toBeDefined();
          expect(typeof latestResult?.data?.isLevel).toBe('boolean');
          expect(latestResult?.data?.levelStatus).toBeDefined();
          expect(typeof latestResult?.data?.levelStatus).toBe('string');

          // Verify raw data
          expect(latestResult?.data?.raw).toBeDefined();
          expect(latestResult?.data?.raw?.alpha).toBeDefined();
          expect(latestResult?.data?.raw?.beta).toBeDefined();
          expect(latestResult?.data?.raw?.gamma).toBeDefined();

          // Verify overlays array exists
          expect(latestResult?.overlays).toBeDefined();
          expect(Array.isArray(latestResult?.overlays)).toBe(true);

          // Cleanup
          levelTool.deactivate();
        }
      ),
      { numRuns: 5, timeout: 15000 }
    );
  }, 20000);

  /**
   * Concrete test: Tool deactivation stops sensor stream
   * 
   * **Validates: Requirement 3.3**
   * 
   * This concrete test verifies that calling deactivate() properly stops
   * the sensor stream and prevents further result emissions.
   */
  it('should stop sensor stream when deactivate is called', async () => {
    // ARRANGE: Clear saved links
    mockLocalStorage.clear();

    // ACT: Activate level tool
    await levelTool.activate(options);

    // Simulate sensor data
    if (mockOrientationHandler) {
      const mockEvent = new (window as any).DeviceOrientationEvent('deviceorientation', {
        alpha: 45,
        beta: 10,
        gamma: 5,
      });
      mockOrientationHandler(mockEvent);
    }

    await new Promise(resolve => setTimeout(resolve, 1200));

    const resultsBeforeDeactivation = onResult.mock.calls.length;
    expect(resultsBeforeDeactivation).toBeGreaterThan(0);

    // ACT: Deactivate
    levelTool.deactivate();

    // Wait and verify no new results
    await new Promise(resolve => setTimeout(resolve, 1200));

    const resultsAfterDeactivation = onResult.mock.calls.length;
    // Allow for results that were already in the pipeline
    expect(resultsAfterDeactivation).toBeLessThanOrEqual(resultsBeforeDeactivation + 1);
  });

  /**
   * Concrete test: Reactivating tool stops previous instance
   * 
   * **Validates: Requirement 3.3**
   * 
   * When the level tool is activated while already active, it should stop
   * the previous instance and emit a stopped message.
   */
  it('should stop previous instance when reactivated', async () => {
    // ARRANGE: Clear saved links
    mockLocalStorage.clear();

    // ACT: Activate level tool first time
    await levelTool.activate(options);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Clear mock calls
    vi.clearAllMocks();

    // ACT: Activate again (should stop previous instance)
    await levelTool.activate(options);

    await new Promise(resolve => setTimeout(resolve, 500));

    // ASSERT: Verify stopped message was sent
    const statusCalls = onStatusChange.mock.calls.map(call => call[0]);
    const resultCalls = onResult.mock.calls.map(call => call[0]);

    expect(statusCalls.some((msg: string) => msg.includes('stopped'))).toBe(true);
    
    const stoppedResult = resultCalls.find((result: any) => result.data?.stopped === true);
    expect(stoppedResult).toBeDefined();
    expect(stoppedResult?.data?.message).toContain('Inclinometer stopped');

    // Cleanup
    levelTool.deactivate();
  });

  /**
   * Concrete test: Manual mode displays all required information
   * 
   * **Validates: Requirement 3.2**
   * 
   * When sensors are unavailable, manual mode should display calculator
   * information and tips for physical level usage.
   */
  it('should display complete manual mode information', async () => {
    // ARRANGE: Remove DeviceOrientationEvent
    const originalDeviceOrientationEvent = (window as any).DeviceOrientationEvent;
    delete (window as any).DeviceOrientationEvent;

    // ACT: Activate level tool
    await levelTool.activate(options);

    await new Promise(resolve => setTimeout(resolve, 500));

    // ASSERT: Verify manual mode content
    const resultCalls = onResult.mock.calls.map(call => call[0]);
    const latestResult = resultCalls[resultCalls.length - 1];

    // Verify calculator section
    expect(latestResult?.data?.calculator?.description).toBe('Manual tilt angle calculator for FSO mounting verification');
    expect(latestResult?.data?.calculator?.formula).toBe('Tilt angle = arctan(height difference / horizontal distance)');
    expect(latestResult?.data?.calculator?.example).toContain('arctan');

    // Verify tips section
    expect(latestResult?.data?.tips).toHaveLength(3);
    expect(latestResult?.data?.tips?.[0]).toContain('physical bubble level');
    expect(latestResult?.data?.tips?.[1]).toContain('0.5° tilt accuracy');
    expect(latestResult?.data?.tips?.[2]).toContain('smartphone');

    // Restore
    (window as any).DeviceOrientationEvent = originalDeviceOrientationEvent;
    levelTool.deactivate();
  });
});
