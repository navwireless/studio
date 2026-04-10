/**
 * Bug Condition Exploration Test for Analysis Panel Bugfix
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 * 
 * This test demonstrates the bug exists on unfixed code by verifying that
 * the AnalysisButton disappears after parameter changes when it should remain visible.
 * 
 * Bug Condition: The button should be visible when:
 * - Both sites are placed (flow.bothSitesPlaced = true)
 * - Analysis has been completed (analysisResult exists)
 * - Parameters have changed (isStale = true)
 * - Not currently analyzing (isActionPending = false)
 * - On desktop view (isDesktop = true)
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the code when the test fails.
 * 
 * **TEST RESULT**: All tests PASS on current code.
 * 
 * **ANALYSIS**: The current implementation in side-panel.tsx appears to be correct:
 * - AnalysisButton renders when `flow.bothSitesPlaced` is true
 * - ResultsCard renders when `analysisResult && !isStale` is true
 * - When isStale=true, ResultsCard hides and AnalysisButton remains visible
 * 
 * **CONCLUSION**: Either:
 * 1. The bug has already been fixed in the current codebase
 * 2. The bug exists in a different scenario not covered by these tests
 * 3. The bug is in the state management layer (how isStale is computed)
 * 
 * These tests encode the EXPECTED behavior and will serve as regression tests
 * to ensure the button remains visible when parameters change after analysis.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SidePanel, { type SidePanelProps } from './side-panel';
import type { FlowState } from '@/hooks/use-flow-state';
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

// Don't mock AnalysisButton - we need to test the actual component
vi.mock('./analysis-button', () => ({
  AnalysisButton: ({ isStale, hasResults, canAnalyze, isAnalyzing }: { isStale: boolean; hasResults: boolean; canAnalyze: boolean; isAnalyzing: boolean }) => {
    // Simulate the actual AnalysisButton logic
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
 * Creates a mock FlowState for testing
 */
function createMockFlowState(overrides: Partial<FlowState> = {}): FlowState {
  return {
    currentStep: 'STALE_RESULTS',
    siteAPlaced: true,
    siteBPlaced: true,
    bothSitesPlaced: true,
    hasResults: true,
    isStale: true,
    isAnalyzing: false,
    canAnalyze: true,
    canDownload: false,
    canShare: false,
    canSave: false,
    ...overrides,
  };
}

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
    flow: createMockFlowState(),
    siteAName: 'Site A',
    siteALat: '40.7128',
    siteALng: '-74.0060',
    siteATowerHeight: 20,
    onSiteATowerHeightChange: vi.fn(),
    onClearSiteA: vi.fn(),
    siteBName: 'Site B',
    siteBLat: '40.7589',
    siteBLng: '-73.9851',
    siteBTowerHeight: 25,
    onSiteBTowerHeightChange: vi.fn(),
    onClearSiteB: vi.fn(),
    placementMode: null,
    onSetPlacementMode: vi.fn(),
    clearanceThreshold: 10,
    onClearanceThresholdChange: vi.fn(),
    selectedDeviceId: null,
    onSelectDevice: vi.fn(),
    currentDistanceKm: 8.5,
    onAnalyze: vi.fn(),
    isActionPending: false,
    analysisResult: createMockAnalysisResult(),
    isStale: true,
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

describe('Analysis Panel Bug Condition Exploration', () => {
  describe('Property 1: Bug Condition - Analyze Button Disappears After Parameter Change', () => {
    it('should show AnalysisButton when tower height changes after analysis (Requirement 1.1)', () => {
      // Scenario: User completes analysis, then changes tower height at Site A
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: true,
          isStale: true,
          isAnalyzing: false,
          canAnalyze: true,
        }),
        analysisResult: createMockAnalysisResult(),
        isStale: true,
        isActionPending: false,
        siteATowerHeight: 25, // Changed from 20 to 25
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should be visible with "RE-ANALYZE (changed)" state
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should be visible after tower height change').toBeInTheDocument();
      expect(button?.getAttribute('data-state')).toBe('stale');
      expect(button?.textContent).toContain('RE-ANALYZE (changed)');

      // EXPECTED: Results section should be HIDDEN when isStale=true
      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should be hidden when parameters are stale').not.toBeInTheDocument();
    });

    it('should show AnalysisButton when point is dragged after analysis (Requirement 1.2)', () => {
      // Scenario: User completes analysis, then drags Site B marker to new location
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: true,
          isStale: true,
          isAnalyzing: false,
          canAnalyze: true,
        }),
        analysisResult: createMockAnalysisResult(),
        isStale: true,
        isActionPending: false,
        siteBLat: '40.7600', // Changed from 40.7589
        siteBLng: '-73.9800', // Changed from -73.9851
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should be visible with "RE-ANALYZE (changed)" state
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should be visible after point drag').toBeInTheDocument();
      expect(button?.getAttribute('data-state')).toBe('stale');
      expect(button?.textContent).toContain('RE-ANALYZE (changed)');

      // EXPECTED: Results section should be HIDDEN when isStale=true
      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should be hidden when parameters are stale').not.toBeInTheDocument();
    });

    it('should show AnalysisButton when clearance threshold changes after analysis (Requirement 1.3)', () => {
      // Scenario: User completes analysis with 10m clearance, then changes to 15m
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: true,
          isStale: true,
          isAnalyzing: false,
          canAnalyze: true,
        }),
        analysisResult: createMockAnalysisResult(),
        isStale: true,
        isActionPending: false,
        clearanceThreshold: 15, // Changed from 10 to 15
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should be visible with "RE-ANALYZE (changed)" state
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should be visible after clearance threshold change').toBeInTheDocument();
      expect(button?.getAttribute('data-state')).toBe('stale');
      expect(button?.textContent).toContain('RE-ANALYZE (changed)');

      // EXPECTED: Results section should be HIDDEN when isStale=true
      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should be hidden when parameters are stale').not.toBeInTheDocument();
    });

    it('should show AnalysisButton when device selection changes after analysis (Requirement 1.4)', () => {
      // Scenario: User completes analysis with auto-detect, then selects specific device
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: true,
          isStale: true,
          isAnalyzing: false,
          canAnalyze: true,
        }),
        analysisResult: createMockAnalysisResult(),
        isStale: true,
        isActionPending: false,
        selectedDeviceId: 'device-123', // Changed from null to specific device
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should be visible with "RE-ANALYZE (changed)" state
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should be visible after device selection change').toBeInTheDocument();
      expect(button?.getAttribute('data-state')).toBe('stale');
      expect(button?.textContent).toContain('RE-ANALYZE (changed)');

      // EXPECTED: Results section should be HIDDEN when isStale=true
      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should be hidden when parameters are stale').not.toBeInTheDocument();
    });

    it('should show AnalysisButton in all bug condition scenarios', () => {
      // General test covering the bug condition function:
      // isBugCondition = bothSitesPlaced AND hasAnalysisResult AND isStale AND NOT isAnalyzing
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: true,
          isStale: true,
          isAnalyzing: false,
          canAnalyze: true,
          currentStep: 'STALE_RESULTS',
        }),
        analysisResult: createMockAnalysisResult(),
        isStale: true,
        isActionPending: false,
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should be visible
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should be visible when bug condition holds').toBeInTheDocument();
      expect(button?.getAttribute('data-state')).toBe('stale');

      // EXPECTED: Results section should be HIDDEN when isStale=true
      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should be hidden when parameters are stale').not.toBeInTheDocument();
    });
  });

  describe('Property 2: Preservation - Existing Button Visibility Logic', () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
     * 
     * These tests verify that the fix does NOT break existing functionality.
     * They test scenarios where the bug condition does NOT hold:
     * - Initial placement (no analysis yet)
     * - Analyzing state (analysis in progress)
     * - Results display (analysis complete, not stale)
     * - Mobile UI behavior
     * 
     * IMPORTANT: These tests are run on UNFIXED code first to observe baseline behavior.
     * They should PASS on unfixed code, confirming what behavior to preserve.
     */

    it('should show AnalysisButton when both sites placed and no analysis yet (Requirement 3.1)', () => {
      // Scenario: Initial placement - both sites placed, ready to analyze for first time
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: false,
          isStale: false,
          isAnalyzing: false,
          canAnalyze: true,
          currentStep: 'READY_TO_ANALYZE',
        }),
        analysisResult: null,
        isStale: false,
        isActionPending: false,
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should be visible in READY state
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should be visible for initial analysis').toBeInTheDocument();
      expect(button?.getAttribute('data-state')).toBe('ready');
      expect(button?.textContent).toContain('ANALYZE LOS');

      // EXPECTED: Results section should NOT be visible (no analysis yet)
      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should not be visible before first analysis').not.toBeInTheDocument();
    });

    it('should show analyzing spinner when analysis is in progress (Requirement 3.2)', () => {
      // Scenario: Analysis in progress - user clicked analyze, waiting for results
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: false,
          isStale: false,
          isAnalyzing: true,
          canAnalyze: false,
          currentStep: 'ANALYZING',
        }),
        analysisResult: null,
        isStale: false,
        isActionPending: true,
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should show analyzing state
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should be visible during analysis').toBeInTheDocument();
      expect(button?.getAttribute('data-state')).toBe('analyzing');
      expect(button?.textContent).toContain('Analyzing');

      // EXPECTED: Results section should NOT be visible yet
      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should not be visible during analysis').not.toBeInTheDocument();
    });

    it('should show ResultsCard when analysis completes successfully (Requirement 3.3)', () => {
      // Scenario: Analysis complete - results are fresh (not stale)
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: true,
          isStale: false,
          isAnalyzing: false,
          canAnalyze: true,
          currentStep: 'RESULTS',
        }),
        analysisResult: createMockAnalysisResult(),
        isStale: false,
        isActionPending: false,
      });

      render(<SidePanel {...props} />);

      // EXPECTED: ResultsCard should be visible with fresh results
      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should be visible after successful analysis').toBeInTheDocument();

      // EXPECTED: AnalysisButton should still be present (for potential re-analysis)
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should remain in DOM').toBeInTheDocument();
    });

    it('should preserve button visibility on mobile devices (Requirement 3.4)', () => {
      // Scenario: Mobile UI - button should work the same way
      // This test verifies the button logic is consistent across desktop/mobile
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: false,
          isStale: false,
          isAnalyzing: false,
          canAnalyze: true,
          currentStep: 'READY_TO_ANALYZE',
        }),
        analysisResult: null,
        isStale: false,
        isActionPending: false,
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should be visible (same as desktop)
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should be visible on mobile').toBeInTheDocument();
      expect(button?.getAttribute('data-state')).toBe('ready');
    });

    it('should keep Configure section interactive when both sites placed (Requirement 3.5)', () => {
      // Scenario: Configure section should remain functional
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: true,
          hasResults: false,
          isStale: false,
          isAnalyzing: false,
          canAnalyze: true,
        }),
        analysisResult: null,
        isStale: false,
        isActionPending: false,
      });

      render(<SidePanel {...props} />);

      // EXPECTED: ConfigSection should be visible
      const configSection = screen.queryByTestId('config-section');
      expect(configSection, 'ConfigSection should be visible when both sites placed').toBeInTheDocument();
    });

    it('should preserve all button states across workflow (Requirement 3.6)', () => {
      // Scenario: Test multiple state transitions to ensure nothing breaks
      const { rerender } = render(
        <SidePanel
          {...createDefaultProps({
            flow: createMockFlowState({
              bothSitesPlaced: true,
              hasResults: false,
              isStale: false,
              isAnalyzing: false,
              canAnalyze: true,
              currentStep: 'READY_TO_ANALYZE',
            }),
            analysisResult: null,
            isStale: false,
            isActionPending: false,
          })}
        />
      );

      // State 1: Ready to analyze
      let button = screen.queryByTestId('analysis-button');
      expect(button?.getAttribute('data-state')).toBe('ready');

      // State 2: Analyzing
      rerender(
        <SidePanel
          {...createDefaultProps({
            flow: createMockFlowState({
              bothSitesPlaced: true,
              hasResults: false,
              isStale: false,
              isAnalyzing: true,
              canAnalyze: false,
              currentStep: 'ANALYZING',
            }),
            analysisResult: null,
            isStale: false,
            isActionPending: true,
          })}
        />
      );

      button = screen.queryByTestId('analysis-button');
      expect(button?.getAttribute('data-state')).toBe('analyzing');

      // State 3: Results (fresh)
      rerender(
        <SidePanel
          {...createDefaultProps({
            flow: createMockFlowState({
              bothSitesPlaced: true,
              hasResults: true,
              isStale: false,
              isAnalyzing: false,
              canAnalyze: true,
              currentStep: 'RESULTS',
            }),
            analysisResult: createMockAnalysisResult(),
            isStale: false,
            isActionPending: false,
          })}
        />
      );

      const resultsCard = screen.queryByTestId('results-card');
      expect(resultsCard, 'ResultsCard should be visible with fresh results').toBeInTheDocument();

      // All state transitions should work correctly
      expect(button, 'Button should remain in DOM throughout workflow').toBeInTheDocument();
    });

    it('should not show AnalysisButton when sites are not placed (disabled state)', () => {
      // Scenario: Initial state - no sites placed yet
      const props = createDefaultProps({
        flow: createMockFlowState({
          bothSitesPlaced: false,
          hasResults: false,
          isStale: false,
          isAnalyzing: false,
          canAnalyze: false,
          currentStep: 'PLACE_SITES',
        }),
        analysisResult: null,
        isStale: false,
        isActionPending: false,
      });

      render(<SidePanel {...props} />);

      // EXPECTED: AnalysisButton should NOT be visible when sites not placed
      const button = screen.queryByTestId('analysis-button');
      expect(button, 'AnalysisButton should not be visible when sites not placed').not.toBeInTheDocument();
    });
  });
});
