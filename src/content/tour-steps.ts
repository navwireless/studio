// src/content/tour-steps.ts

export interface TourStep {
    id: string;
    /** CSS selector or 'center' for centered modal */
    target: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    /** Extra padding around the spotlight cutout (default 8) */
    spotlightPadding?: number;
    /** Whether the target element should have a pulse/glow effect (default true) */
    highlight?: boolean;
}

export const ANALYSIS_PAGE_TOUR: TourStep[] = [
    {
        id: 'welcome',
        target: 'center',
        title: 'Welcome to FindLOS! 👋',
        description:
            "FindLOS helps you analyze line-of-sight feasibility between two locations. Let's take a quick 60-second tour to get you started.",
        position: 'center',
        highlight: false,
    },
    {
        id: 'search-bar',
        target: '[data-tour="search-bar"]',
        title: 'Search for Locations',
        description:
            'Search for any location by name, address, or paste coordinates directly. This is the fastest way to set your sites.',
        position: 'bottom',
    },
    {
        id: 'site-cards',
        target: '[data-tour="site-cards"]',
        title: 'Set Your Two Sites',
        description:
            'Every analysis needs two endpoints — Site A and Site B. Click "Place on Map" or click directly on the map to set each site. You can also drag markers to adjust.',
        position: 'right',
    },
    {
        id: 'map-area',
        target: '[data-tour="map-area"]',
        title: 'Interactive Map',
        description:
            'Click anywhere on the map to place sites. Right-click for quick actions. Scroll to zoom, drag to pan. The terrain between your sites determines feasibility.',
        position: 'left',
        spotlightPadding: 0,
    },
    {
        id: 'config-section',
        target: '[data-tour="config-section"]',
        title: 'Configure Parameters',
        description:
            'Set tower heights, clearance threshold, and optionally select a specific device. These appear automatically once both sites are placed.',
        position: 'right',
    },
    {
        id: 'analyze-button',
        target: '[data-tour="analyze-button"]',
        title: 'Run the Analysis',
        description:
            'Click this button to analyze the terrain profile between your sites. Each analysis uses 1 credit. The results appear instantly below.',
        position: 'right',
    },
    {
        id: 'mode-tabs',
        target: '[data-tour="mode-tabs"]',
        title: 'Analysis Modes',
        description:
            'Switch between Single link analysis, Bulk processing (upload KMZ files), and Fiber path calculation. Each mode has its own workflow.',
        position: 'bottom',
    },
    {
        id: 'results-area',
        target: '[data-tour="results-area"]',
        title: 'View Results & Download',
        description:
            "After analysis, you'll see the result (Pass/Fail), terrain metrics, device compatibility, and download options including PDF reports and WhatsApp sharing.",
        position: 'right',
    },
    // Phase 11: Map toolbar tour step
    {
        id: 'map-toolbar',
        target: '[data-tour="map-toolbar"]',
        title: 'Map Toolbox 🧰',
        description:
            'Access 10 professional map tools: measure distance, area, elevation, bearing, terrain profile, coordinate conversion, range circles, grid overlay, pins, and screenshots. Use keyboard shortcuts (M, E, G, T…) for quick access.',
        position: 'left',
    },
    {
        id: 'user-menu',
        target: '[data-tour="user-menu"]',
        title: 'Your Account',
        description:
            'Access your dashboard, settings, credits, and help from here. You can also manage saved links and view analysis history.',
        position: 'bottom',
    },
    {
        id: 'tour-complete',
        target: 'center',
        title: "You're All Set! 🎉",
        description:
            'Start by searching for a location or clicking the map. Need help anytime? Click the help button (bottom-right corner). Happy analyzing!',
        position: 'center',
        highlight: false,
    },
];