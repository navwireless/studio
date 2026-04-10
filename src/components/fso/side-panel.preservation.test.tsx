/**
 * Preservation Property-Based Tests for Analysis Panel Bugfix
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * These tests verify that existing correct behavior is preserved after any fix.
 * They use property-based testing to generate many test cases automatically,
 * providing stronger guarantees that behavior is unchanged for all non-buggy inputs.
 * 
 * IMPORTANT: These tests should PASS on UNFIXED code, confirming baseline behavior.
 * After implementing any fix, these tests should still PASS, confirming no regressions.
 * 
 * Testing Strategy:
 * - Generate random application states that do NOT trigger the bug condition
 * - Verify button visibility and behavior matches expected patterns
 * - Test across many scenarios to catch edge cases
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import SidePanel, { type SidePanelProps } from './side-panel';
import type { AnalysisResult } from '@/types';

// Mock the child components to simplify testing
vi.mock('./step-indicator', () => ({
  StepIndicator: () => <div data-testid="step-indicator">Step Indicator</div>,
}));

vi.mock('./site-input-card', () => ({
  SiteInputCard: () => <div data-testid="site-input-card">Site Input Card</div>,
}));

vi.mock('./config-section', () => ({
  ConfigSection: () => <div data-testid="config-section">Config Section</div>,
}));

vi.mock('./analysis-button', () => ({
  AnalysisButton: ({ isStale, hasResults, canAnalyze, isAnalyzing }: { isStale: boolean; hasResults: boolean; canAnalyze: boolean; isAnalyzing: boolean }) => {
    if (isAnalyzing) {
      return <div data-testid="analysis-button" data-state="analyzing">Analyzing...</div>;
    }
    if (hasResults && isStale && canAnalyze) {
      return <div data-testid="analysis-button" data-state="stale">RE-ANALYZE (changed)</div>;
    }
    if (canAnalyze) {
      return <div data-testid="analysis-button" data-state="ready">ANALYZE LOS</div>;
    }
    return <div data-testid="analysis-button" data-state="disabled">ANALYZE LOS</div>;
  },
}));

vi.mock('./results-card', () => ({
  ResultsCard: () => <div data-testid="results-card">Results Card</div>,
}));

vi.mock('./download-menu', () => ({
  DownloadMenu: () => <div data-testid="download-menu">Download Menu</div>,
}));

/**
 * Creates a mock AnalysisResult for testing
 */
function createMockAnalysisResult(): AnalysisResult {
  return {
    id: 'test-analysis-1',
    timestamp: Date.now(),
    pointA: {
      lat: 40.7128,
      lng: -74.0060,
      name: 'Site A',
      elevation: 10,
      towerHeight: 20,
    },
    pointB: {
      lat: 40.7589,
      lng: -73.9851,
      name: 'Site B',
      elevation: 15,
      towerHeight: 25,
    },
    distanceKm: 8.5,
    losPossible: true,
    minClearance: 12.5,
    clearanceThreshold: 10,
    elevationProfile: [],
    fresnel60Clearance: 8.2,
    fresnel100Clearance: 5.1,
  };
}

/**
 * Creates default props for SidePanel component
 */
function createDefaultProps(overrides: Partial<SidePanelProps> = {}): SidePanelProps {
  return {
    isOpen: true,
    onClose: vi.fn(),
    flow: {
      currentStep: 'PLACE_SITES',
      siteAPlaced: false,
      siteBPlaced: false,
      bothSitesPlaced: false,
      hasResults: false,
      isStale: false,
      isAnalyzing: false,
      canAnalyze: false,
      canDownload: false,
      canShare: false,
      canSave: false,
    },
    siteAName: 'Site A',
    siteALat: '',
    siteALng: '',
    siteATowerHeight: 20,
    onSiteATowerHeightChange: vi.fn(),
    onClearSiteA: vi.fn(),
    siteBName: 'Site B',
    siteBLat: '',
    siteBLng: '',
    siteBTowerHeight: 25,
    onSiteBTowerHeightChange: vi.fn(),
    onClearSiteB: vi.fn(),
    placementMode: null,
    onSetPlacementMode: vi.fn(),
    clearanceThreshold: 10,
    onClearanceThresholdChange: vi.fn(),
    selectedDeviceId: null,
    onSelectDevice: vi.fn(),
    currentDistanceKm: null,
    onAnalyze: vi.fn(),
    isActionPending: false,
    analysisResult: null,
    isStale: false,
    creditsRemaining: 10,
    fiberPathResult: null,
    isFiberCalculating: false,
    fiberPathError: null,
    renderChart: undefined,
    onSaveLink: vi.fn(),
    onNewLink: vi.fn(),
    onDownloadPdf: vi.fn(),
    onDownloadCombinedPdf: vi.fn(),
    onExportKmz: vi.fn(),
    onExportExcel: vi.fn(),
    onExportCsv: vi.fn(),
    onShareWhatsApp: vi.fn(),
    isDownloading: false,
    downloadingType: null,
    savedLinks: [],
    onLoadSavedLink: vi.fn(),
    onDeleteSavedLink: vi.fn(),
    onDeleteMultipleSavedLinks: vi.fn(),
    onClearAllSavedLinks: vi.fn(),
    selectedLinkIds: [],
    onToggleLinkSelection: vi.fn(),
    onSelectAllLinks: vi.fn(),
    onDeselectAllLinks: vi.fn(),
    isSelectionMode: false,
    onSetSelectionMode: vi.fn(),
    historyList: [],
    onLoadHistoryItem: vi.fn(),
    onClearHistory: vi.fn(),
    ...overrides,
  };
}

/**
 * Bug condition function from design.md
 * Returns true when the bug condition holds (button should be visible but might not be)
 */
function isBugCondition(state: {
  bothSitesPlaced: boolean;
  hasAnalysisResult: boolean;
  isStale: boolean;
  isAnalyzing: boolean;
}): boolean {
  return (
    state.bothSitesPlaced &&
    state.hasAnalysisResult &&
    state.isStale &&
    !state.isAnalyzing
  );
}

describe('Property 2: Preservation - Existing Button Visibility Logic', () => {
  /**
   * Property: Initial Placement Flow
   * 
   * For any state where both sites are placed and no analysis has been run yet,
   * the AnalysisButton should be visible in READY state.
   * 
   * **Validates: Requirement 3.1**
   */
  it('should show AnalysisButton when both sites placed and no analysis yet (Property)', () => {
    fc.assert(
      fc.property(
        // Generate random tower heights
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        // Generate random clearance threshold
        fc.integer({ min: 5, max: 50 }),
        // Generate random credits
        fc.integer({ min: 0, max: 100 }),
        (towerHeightA, towerHeightB, clearance, credits) => {
          // State: Both sites placed, no analysis yet
          const props = createDefaultProps({
            flow: {
              currentStep: 'READY_TO_ANALYZE',
              siteAPlaced: true,
              siteBPlaced: true,
              bothSitesPlaced: true,
              hasResults: false,
              isStale: false,
              isAnalyzing: false,
              canAnalyze: credits > 0,
              canDownload: false,
              canShare: false,
              canSave: false,
            },
            siteALat: '40.7128',
            siteALng: '-74.0060',
            siteATowerHeight: towerHeightA,
            siteBLat: '40.7589',
            siteBLng: '-73.9851',
            siteBTowerHeight: towerHeightB,
            clearanceThreshold: clearance,
            analysisResult: null,
            isStale: false,
            isActionPending: false,
            creditsRemaining: credits,
          });

          // Verify this is NOT a bug condition
          expect(
            isBugCondition({
              bothSitesPlaced: true,
              hasAnalysisResult: false,
              isStale: false,
              isAnalyzing: false,
            })
          ).toBe(false);

          const { unmount } = render(<SidePanel {...props} />);

          // EXPECTED: AnalysisButton should be visible
          const button = screen.queryByTestId('analysis-button');
          expect(button).toBeInTheDocument();

          if (credits > 0) {
            expect(button?.getAttribute('data-state')).toBe('ready');
          }

          // EXPECTED: Results section should NOT be visible
          const resultsCard = screen.queryByTestId('results-card');
          expect(resultsCard).not.toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 50 } // Run 50 random test cases
    );
  });

  /**
   * Property: Analyzing State
   * 
   * For any state where analysis is in progress, the AnalysisButton should
   * show the analyzing spinner state.
   * 
   * **Validates: Requirement 3.2**
   */
  it('should show analyzing spinner when analysis is in progress (Property)', () => {
    fc.assert(
      fc.property(
        // Generate random tower heights
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        // Generate random clearance threshold
        fc.integer({ min: 5, max: 50 }),
        // Generate whether there's a previous result
        fc.boolean(),
        (towerHeightA, towerHeightB, clearance, hasPreviousResult) => {
          // State: Analysis in progress
          const props = createDefaultProps({
            flow: {
              currentStep: 'ANALYZING',
              siteAPlaced: true,
              siteBPlaced: true,
              bothSitesPlaced: true,
              hasResults: hasPreviousResult,
              isStale: false,
              isAnalyzing: true,
              canAnalyze: false,
              canDownload: false,
              canShare: false,
              canSave: false,
            },
            siteALat: '40.7128',
            siteALng: '-74.0060',
            siteATowerHeight: towerHeightA,
            siteBLat: '40.7589',
            siteBLng: '-73.9851',
            siteBTowerHeight: towerHeightB,
            clearanceThreshold: clearance,
            analysisResult: hasPreviousResult ? createMockAnalysisResult() : null,
            isStale: false,
            isActionPending: true,
            creditsRemaining: 10,
          });

          // Verify this is NOT a bug condition
          expect(
            isBugCondition({
              bothSitesPlaced: true,
              hasAnalysisResult: hasPreviousResult,
              isStale: false,
              isAnalyzing: true,
            })
          ).toBe(false);

          const { unmount } = render(<SidePanel {...props} />);

          // EXPECTED: AnalysisButton should show analyzing state
          const button = screen.queryByTestId('analysis-button');
          expect(button).toBeInTheDocument();
          expect(button?.getAttribute('data-state')).toBe('analyzing');
          expect(button?.textContent).toContain('Analyzing');

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Results Display
   * 
   * For any state where analysis has completed successfully and results are fresh
   * (not stale), the ResultsCard should be visible.
   * 
   * **Validates: Requirement 3.3**
   */
  it('should show ResultsCard when analysis completes successfully (Property)', () => {
    fc.assert(
      fc.property(
        // Generate random analysis results
        fc.double({ min: 0.1, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 50, noNaN: true }),
        fc.boolean(),
        fc.integer({ min: 5, max: 50 }),
        (distanceKm, minClearance, losPossible, clearanceThreshold) => {
          // State: Analysis complete, results fresh
          const analysisResult: AnalysisResult = {
            ...createMockAnalysisResult(),
            distanceKm,
            minClearance,
            losPossible,
            clearanceThreshold,
          };

          const props = createDefaultProps({
            flow: {
              currentStep: 'RESULTS',
              siteAPlaced: true,
              siteBPlaced: true,
              bothSitesPlaced: true,
              hasResults: true,
              isStale: false,
              isAnalyzing: false,
              canAnalyze: true,
              canDownload: true,
              canShare: true,
              canSave: true,
            },
            siteALat: '40.7128',
            siteALng: '-74.0060',
            siteBLat: '40.7589',
            siteBLng: '-73.9851',
            clearanceThreshold,
            analysisResult,
            isStale: false,
            isActionPending: false,
            creditsRemaining: 10,
          });

          // Verify this is NOT a bug condition
          expect(
            isBugCondition({
              bothSitesPlaced: true,
              hasAnalysisResult: true,
              isStale: false,
              isAnalyzing: false,
            })
          ).toBe(false);

          const { unmount } = render(<SidePanel {...props} />);

          // EXPECTED: ResultsCard should be visible
          const resultsCard = screen.queryByTestId('results-card');
          expect(resultsCard).toBeInTheDocument();

          // EXPECTED: AnalysisButton should still be present
          const button = screen.queryByTestId('analysis-button');
          expect(button).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Configure Section Visibility
   * 
   * For any state where both sites are placed, the Configure section should
   * be visible and functional.
   * 
   * **Validates: Requirement 3.5**
   */
  it('should show Configure section when both sites placed (Property)', () => {
    fc.assert(
      fc.property(
        // Generate random state combinations
        fc.boolean(), // hasResults
        fc.boolean(), // isStale
        fc.boolean(), // isAnalyzing
        fc.integer({ min: 5, max: 50 }), // clearanceThreshold
        (hasResults, isStale, isAnalyzing, clearanceThreshold) => {
          // Skip bug condition states
          if (hasResults && isStale && !isAnalyzing) {
            return true; // Skip this test case
          }

          const props = createDefaultProps({
            flow: {
              currentStep: hasResults ? 'RESULTS' : 'READY_TO_ANALYZE',
              siteAPlaced: true,
              siteBPlaced: true,
              bothSitesPlaced: true,
              hasResults,
              isStale,
              isAnalyzing,
              canAnalyze: !isAnalyzing,
              canDownload: hasResults && !isStale,
              canShare: hasResults && !isStale,
              canSave: hasResults && !isStale,
            },
            siteALat: '40.7128',
            siteALng: '-74.0060',
            siteBLat: '40.7589',
            siteBLng: '-73.9851',
            clearanceThreshold,
            analysisResult: hasResults ? createMockAnalysisResult() : null,
            isStale,
            isActionPending: isAnalyzing,
            creditsRemaining: 10,
          });

          const { unmount } = render(<SidePanel {...props} />);

          // EXPECTED: ConfigSection should be visible
          const configSection = screen.queryByTestId('config-section');
          expect(configSection).toBeInTheDocument();

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Button Visibility Across Workflow States
   * 
   * For any non-bug-condition state, the button visibility should follow
   * the original logic consistently.
   * 
   * **Validates: Requirement 3.6**
   */
  it('should preserve button visibility logic across all non-bug states (Property)', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // siteAPlaced
        fc.boolean(), // siteBPlaced
        fc.boolean(), // hasResults
        fc.boolean(), // isStale
        fc.boolean(), // isAnalyzing
        fc.integer({ min: 0, max: 100 }), // credits
        (siteAPlaced, siteBPlaced, hasResults, isStale, isAnalyzing, credits) => {
          const bothSitesPlaced = siteAPlaced && siteBPlaced;

          // Skip bug condition states
          if (bothSitesPlaced && hasResults && isStale && !isAnalyzing) {
            return true; // Skip this test case
          }

          const props = createDefaultProps({
            flow: {
              currentStep: isAnalyzing
                ? 'ANALYZING'
                : hasResults
                ? 'RESULTS'
                : bothSitesPlaced
                ? 'READY_TO_ANALYZE'
                : 'PLACE_SITES',
              siteAPlaced,
              siteBPlaced,
              bothSitesPlaced,
              hasResults,
              isStale,
              isAnalyzing,
              canAnalyze: bothSitesPlaced && !isAnalyzing && credits > 0,
              canDownload: hasResults && !isStale,
              canShare: hasResults && !isStale,
              canSave: hasResults && !isStale,
            },
            siteALat: siteAPlaced ? '40.7128' : '',
            siteALng: siteAPlaced ? '-74.0060' : '',
            siteBLat: siteBPlaced ? '40.7589' : '',
            siteBLng: siteBPlaced ? '-73.9851' : '',
            analysisResult: hasResults ? createMockAnalysisResult() : null,
            isStale,
            isActionPending: isAnalyzing,
            creditsRemaining: credits,
          });

          const { unmount } = render(<SidePanel {...props} />);

          // EXPECTED: Button visibility follows original logic
          const button = screen.queryByTestId('analysis-button');

          if (bothSitesPlaced) {
            // Button should be visible when both sites placed
            expect(button).toBeInTheDocument();
          } else {
            // Button should NOT be visible when sites not placed
            expect(button).not.toBeInTheDocument();
          }

          // EXPECTED: Results visibility follows original logic
          const resultsCard = screen.queryByTestId('results-card');

          if (hasResults && !isStale) {
            // Results should be visible when fresh
            expect(resultsCard).toBeInTheDocument();
          } else {
            // Results should NOT be visible when stale or no results
            expect(resultsCard).not.toBeInTheDocument();
          }

          unmount();
        }
      ),
      { numRuns: 100 } // Run 100 random test cases for comprehensive coverage
    );
  });

  /**
   * Property: State Transitions Preserve Behavior
   * 
   * For any sequence of state transitions that don't involve the bug condition,
   * the button visibility should remain consistent with the original logic.
   * 
   * **Validates: Requirements 3.1, 3.2, 3.3, 3.6**
   */
  it('should preserve behavior across state transitions (Property)', () => {
    fc.assert(
      fc.property(
        // Generate a sequence of state transitions
        fc.array(
          fc.record({
            hasResults: fc.boolean(),
            isStale: fc.boolean(),
            isAnalyzing: fc.boolean(),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (stateSequence) => {
          // Filter out bug condition states
          const validStates = stateSequence.filter(
            (state) => !isBugCondition({ ...state, bothSitesPlaced: true, hasAnalysisResult: state.hasResults })
          );

          if (validStates.length === 0) {
            return true; // Skip if no valid states
          }

          // Test each state transition
          for (const state of validStates) {
            const props = createDefaultProps({
              flow: {
                currentStep: state.isAnalyzing
                  ? 'ANALYZING'
                  : state.hasResults
                  ? 'RESULTS'
                  : 'READY_TO_ANALYZE',
                siteAPlaced: true,
                siteBPlaced: true,
                bothSitesPlaced: true,
                hasResults: state.hasResults,
                isStale: state.isStale,
                isAnalyzing: state.isAnalyzing,
                canAnalyze: !state.isAnalyzing,
                canDownload: state.hasResults && !state.isStale,
                canShare: state.hasResults && !state.isStale,
                canSave: state.hasResults && !state.isStale,
              },
              siteALat: '40.7128',
              siteALng: '-74.0060',
              siteBLat: '40.7589',
              siteBLng: '-73.9851',
              analysisResult: state.hasResults ? createMockAnalysisResult() : null,
              isStale: state.isStale,
              isActionPending: state.isAnalyzing,
              creditsRemaining: 10,
            });

            const { unmount } = render(<SidePanel {...props} />);

            // EXPECTED: Button should be visible (both sites placed)
            const button = screen.queryByTestId('analysis-button');
            expect(button).toBeInTheDocument();

            // EXPECTED: Results visibility follows logic
            const resultsCard = screen.queryByTestId('results-card');
            if (state.hasResults && !state.isStale) {
              expect(resultsCard).toBeInTheDocument();
            } else {
              expect(resultsCard).not.toBeInTheDocument();
            }

            unmount();
          }
        }
      ),
      { numRuns: 30 }
    );
  });
});
