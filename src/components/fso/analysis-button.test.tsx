/**
 * Bug Condition Exploration Test for AnalysisButton Component
 * 
 * Tests the AnalysisButton component in isolation to verify it shows
 * the correct state when parameters change after analysis.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalysisButton } from './analysis-button';

describe('AnalysisButton - Bug Condition Tests', () => {
  it('should show RE-ANALYZE (changed) state when results exist and are stale', () => {
    render(
      <AnalysisButton
        canAnalyze={true}
        isAnalyzing={false}
        isStale={true}
        hasResults={true}
        creditsRemaining={10}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('RE-ANALYZE (changed)');
    expect(button).not.toBeDisabled();
  });

  it('should be visible and clickable in stale state', () => {
    render(
      <AnalysisButton
        canAnalyze={true}
        isAnalyzing={false}
        isStale={true}
        hasResults={true}
        creditsRemaining={10}
        onClick={() => {}}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeVisible();
    expect(button).not.toBeDisabled();
  });
});
