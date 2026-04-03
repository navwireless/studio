// src/content/hint-triggers.ts

export interface HintCondition {
    type:
    | 'analysis_count'
    | 'flow_state'
    | 'time_on_page'
    | 'feature_unused'
    | 'credits_low';
    params: Record<string, number | string | boolean>;
}

export interface HintTrigger {
    id: string;
    message: string;
    icon: string;
    condition: HintCondition;
    /** Where to render the hint */
    position: 'top-right' | 'bottom-right' | 'inline';
    /** CSS selector to attach near (for inline position) */
    attachTo?: string;
    /** Max times to show before permanent auto-dismiss (usually 1) */
    maxShows: number;
    /** Delay in ms before showing after condition is met */
    delayMs: number;
    /** Auto-dismiss after N ms (0 = manual only) */
    autoDismissMs: number;
}

export const HINT_TRIGGERS: HintTrigger[] = [
    {
        id: 'rightClickMap',
        message:
            'Tip: Right-click the map for quick actions like placing sites and measuring distance.',
        icon: '🖱️',
        condition: { type: 'analysis_count', params: { exactly: 0 } },
        position: 'bottom-right',
        maxShows: 1,
        delayMs: 30000,
        autoDismissMs: 10000,
    },
    {
        id: 'saveLink',
        message:
            'You can save this link for future reference and include it in combined reports.',
        icon: '💾',
        condition: { type: 'analysis_count', params: { exactly: 1 } },
        position: 'inline',
        attachTo: '[data-tour="results-area"]',
        maxShows: 1,
        delayMs: 3000,
        autoDismissMs: 8000,
    },
    {
        id: 'keyboardShortcuts',
        message:
            'Pro tip: Press "A" to place Site A, "B" for Site B, Enter to analyze, "D" to download.',
        icon: '⌨️',
        condition: { type: 'analysis_count', params: { min: 3 } },
        position: 'bottom-right',
        maxShows: 1,
        delayMs: 2000,
        autoDismissMs: 12000,
    },
    // Phase 11: Map toolbox discovery hint
    {
        id: 'discoverMapTools',
        message:
            'New! Try the Map Toolbox (right side) — measure distance, check elevation, calculate bearing, and more. Press M to start measuring.',
        icon: '🧰',
        condition: { type: 'analysis_count', params: { min: 2 } },
        position: 'bottom-right',
        maxShows: 1,
        delayMs: 4000,
        autoDismissMs: 12000,
    },
    {
        id: 'lowCredits',
        message:
            'You have {{credits}} credits remaining. Consider upgrading to Pro for unlimited analyses.',
        icon: '⚠️',
        condition: { type: 'credits_low', params: { threshold: 5 } },
        position: 'top-right',
        maxShows: 3,
        delayMs: 1000,
        autoDismissMs: 8000,
    },
    {
        id: 'tryBulkAnalyzer',
        message:
            'Analyzing multiple links? Try the Bulk Analyzer — upload a KMZ file and process all links at once.',
        icon: '📦',
        condition: { type: 'analysis_count', params: { min: 5 } },
        position: 'bottom-right',
        maxShows: 1,
        delayMs: 2000,
        autoDismissMs: 10000,
    },
    {
        id: 'exportConfigTip',
        message:
            'You can customize your PDF report with client details and content toggles before downloading.',
        icon: '📄',
        condition: { type: 'feature_unused', params: { feature: 'exportConfig' } },
        position: 'inline',
        attachTo: '[data-tour="download-menu"]',
        maxShows: 1,
        delayMs: 2000,
        autoDismissMs: 8000,
    },
    {
        id: 'whatsappShare',
        message:
            'Share your report directly via WhatsApp! Click the download menu for sharing options.',
        icon: '📱',
        condition: { type: 'analysis_count', params: { min: 2 } },
        position: 'inline',
        attachTo: '[data-tour="download-menu"]',
        maxShows: 1,
        delayMs: 5000,
        autoDismissMs: 8000,
    },
    {
        id: 'settingsDefaults',
        message:
            'Set default tower heights and export preferences in Settings to save time on future analyses.',
        icon: '⚙️',
        condition: { type: 'analysis_count', params: { min: 10 } },
        position: 'top-right',
        maxShows: 1,
        delayMs: 3000,
        autoDismissMs: 10000,
    },
];