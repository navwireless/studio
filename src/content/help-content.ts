// src/content/help-content.ts

export interface HelpStep {
    title: string;
    description: string;
    /** Optional pro-tip callout */
    tip?: string;
}

export interface HelpGuide {
    id: string;
    title: string;
    icon: string;
    subtitle: string;
    /** Page routes this guide applies to ('/' = analysis page) */
    pages: string[];
    steps: HelpStep[];
}

export const HELP_GUIDES: HelpGuide[] = [
    {
        id: 'run-analysis',
        title: 'How to Run a LOS Analysis',
        icon: '⚡',
        subtitle: 'Step-by-step guide to analyzing line-of-sight',
        pages: ['/'],
        steps: [
            {
                title: '1. Place Site A',
                description:
                    'Click anywhere on the map to place your first site, or use the search bar to find a location by name. You can also click "Place on Map" in the Site A card.',
                tip: 'Press "A" on your keyboard to quickly activate Site A placement mode.',
            },
            {
                title: '2. Place Site B',
                description:
                    'Place your second site the same way. The map will show a line connecting both sites with the distance displayed.',
                tip: 'Press "B" for Site B placement. Right-click the map for a context menu with placement options.',
            },
            {
                title: '3. Configure Parameters',
                description:
                    'Set tower heights for each site (default 20m). Adjust the clearance threshold if needed. Optionally select a specific device to check range compatibility.',
            },
            {
                title: '4. Click Analyze',
                description:
                    'The "Analyze LOS" button activates once both sites are placed. Click it to run the terrain analysis. Each analysis uses 1 credit.',
                tip: 'Press Enter or Ctrl+Enter to analyze quickly.',
            },
            {
                title: '5. View Results',
                description:
                    'Results show Pass/Fail status, distance, clearance, and device compatibility. Expand "Elevation Profile" to see the terrain cross-section. Expand "Analysis Details" for full data.',
            },
            {
                title: '6. Download & Share',
                description:
                    'Click "Download Report" for PDF, KMZ, or combined report options. Use "Share via WhatsApp" to send the report directly. The PDF includes maps, charts, and all analysis data.',
                tip: 'Save multiple links, then generate a Combined Report with all of them in one PDF.',
            },
        ],
    },
    {
        id: 'understanding-results',
        title: 'Understanding Results',
        icon: '📊',
        subtitle: 'What the numbers mean',
        pages: ['/'],
        steps: [
            {
                title: 'Pass vs Fail',
                description:
                    'PASS means the line of sight is clear — the straight line between your two towers clears all terrain obstacles by at least the clearance threshold you set. FAIL means terrain blocks the path.',
            },
            {
                title: 'Min Clearance',
                description:
                    'The smallest vertical gap between the line of sight and the terrain below. Positive = clear above terrain. Negative = terrain blocks the path (obstruction).',
            },
            {
                title: 'Distance',
                description:
                    'The straight-line (aerial) distance between your two sites in kilometers. This is the distance the FSO device must cover.',
            },
            {
                title: 'Device Compatibility',
                description:
                    'Shows whether the selected device\'s maximum range covers the link distance. "Compatible" = device can reach. "Not Compatible" = distance exceeds device range.',
            },
            {
                title: 'Additional Height Needed',
                description:
                    'When a link is blocked, this shows how much additional tower height would be needed to clear the obstruction. This is an estimate — actual requirements may vary.',
            },
        ],
    },
    {
        id: 'downloading-reports',
        title: 'Downloading Reports',
        icon: '📥',
        subtitle: 'PDF, KMZ, and sharing options',
        pages: ['/'],
        steps: [
            {
                title: 'PDF Report',
                description:
                    'A professional PDF with client details, analysis summary, map view, elevation profile, device compatibility, and narrative. Customize content before downloading using the export configuration dialog.',
            },
            {
                title: 'KMZ File',
                description:
                    'Google Earth format file containing the link path and site markers. Open in Google Earth for 3D terrain visualization.',
            },
            {
                title: 'Combined Report',
                description:
                    'Save multiple links first, then generate a Combined Report that includes all saved links in one PDF. Great for project proposals with multiple link analyses.',
            },
            {
                title: 'WhatsApp Share',
                description:
                    'Downloads the PDF and opens WhatsApp with a pre-filled message containing the analysis summary. Attach the downloaded PDF in the WhatsApp chat.',
                tip: 'The message includes site names, distance, and feasibility status — ready to send.',
            },
        ],
    },
    // Phase 11: Map Toolbox guide
    {
        id: 'map-toolbox',
        title: 'Map Toolbox',
        icon: '🧰',
        subtitle: '10 professional map utility tools',
        pages: ['/'],
        steps: [
            {
                title: 'Accessing Tools',
                description:
                    'The map toolbox is the vertical toolbar on the right side of the map. Click any tool icon to activate it. Click again or press Escape to deactivate. Tools are grouped by category: Measure, Annotate, Visualize, and Export.',
                tip: 'The toolbar collapses with the arrow button. Hover over icons for descriptions and keyboard shortcuts.',
            },
            {
                title: 'Measure Distance (M)',
                description:
                    'Click multiple points to measure the total path distance. Double-click to finish. Shows total distance and individual segment lengths in meters or kilometers.',
                tip: 'Great for quickly checking distances without running a full LOS analysis.',
            },
            {
                title: 'Measure Area',
                description:
                    'Click to place polygon vertices and measure the enclosed area. Double-click to close the polygon. Shows area in m² or km² and perimeter distance.',
            },
            {
                title: 'Drop Pin (N)',
                description:
                    'Click to place a labeled marker (A, B, C…) and instantly see coordinates in DD, DMS, and UTM formats. Each value has a copy button.',
            },
            {
                title: 'Point Elevation (E)',
                description:
                    'Click any point to query its ground elevation via the Google Elevation API. Shows elevation in meters and feet, plus the data resolution.',
            },
            {
                title: 'Coordinate Converter',
                description:
                    'Click any point to see its coordinates in three formats simultaneously: Decimal Degrees (DD), Degrees/Minutes/Seconds (DMS), and Universal Transverse Mercator (UTM). All values are copyable.',
            },
            {
                title: 'Range Circle (R)',
                description:
                    'Click to draw a circle showing the operational range of the currently selected device. If no device is selected, uses a 5 km default radius. Shows radius and coverage area.',
                tip: 'Select a device in the Configure section first to see its actual range circle.',
            },
            {
                title: 'Terrain Profile (T)',
                description:
                    'Click two points to generate an elevation cross-section along the path between them. Shows a mini chart with min/max elevation, total gain, and distance. Useful for quick terrain checks without a full analysis.',
            },
            {
                title: 'Grid Overlay (G)',
                description:
                    'Toggle a latitude/longitude grid on the map. The grid spacing automatically adapts to the zoom level. Press G again to hide.',
            },
            {
                title: 'Bearing Calculator',
                description:
                    'Click two points to calculate the bearing (azimuth) from the first to the second. Shows forward bearing, back bearing, compass direction (N, NNE, etc.), and distance.',
                tip: 'Essential for antenna alignment in the field.',
            },
            {
                title: 'Map Screenshot',
                description:
                    'Instantly capture the current map view as a high-resolution PNG image. The file downloads automatically. Desktop only.',
            },
            {
                title: 'Tool Keyboard Shortcuts',
                description:
                    'M = Measure Distance, N = Drop Pin, E = Point Elevation, R = Range Circle, T = Terrain Profile, G = Grid Overlay. Press Escape to cancel any active tool.',
            },
        ],
    },
    {
        id: 'bulk-analyzer',
        title: 'Bulk Analyzer',
        icon: '📦',
        subtitle: 'Process multiple links from KMZ files',
        pages: ['/bulk-los-analyzer'],
        steps: [
            {
                title: '1. Upload KMZ File',
                description:
                    'Upload a KMZ or KML file containing site placemarks. The file should have pairs of locations that represent link endpoints.',
            },
            {
                title: '2. Set Global Parameters',
                description:
                    'Configure tower heights, clearance threshold, and radius. These apply to all links in the batch.',
            },
            {
                title: '3. Run Bulk Analysis',
                description:
                    'Click "Analyze All" to process every link pair. This uses 1 credit per link. Results are shown in a table with Pass/Fail status.',
            },
            {
                title: '4. Review & Export',
                description:
                    'Review results in the table, view on the map, and export as CSV, KMZ, or combined PDF report.',
            },
        ],
    },
    {
        id: 'fiber-calculator',
        title: 'Fiber Path Calculator',
        icon: '🔗',
        subtitle: 'Calculate fiber routing distances',
        pages: ['/fiber-calculator'],
        steps: [
            {
                title: '1. Set Origin & Destination',
                description:
                    'Place the fiber origin and destination points on the map.',
            },
            {
                title: '2. Calculate Route',
                description:
                    'The system uses road routing to estimate the actual fiber path distance, which is typically longer than the aerial distance.',
            },
            {
                title: '3. View & Export',
                description:
                    'See the fiber route on the map and export a detailed PDF report.',
            },
        ],
    },
    {
        id: 'credits-plans',
        title: 'Credits & Plans',
        icon: '💰',
        subtitle: 'How credits and subscriptions work',
        pages: ['/pricing', '/dashboard'],
        steps: [
            {
                title: 'Credits',
                description:
                    'Each line-of-sight analysis costs 1 credit. New accounts start with 10 free credits. You can see your remaining credits in the header.',
            },
            {
                title: 'Free Plan',
                description:
                    "Includes the initial credits. Once credits run out, you'll need to purchase more or upgrade to Pro.",
            },
            {
                title: 'Pro Plan',
                description:
                    'Unlimited analyses, priority support, and access to all features. Billed monthly via Razorpay.',
            },
        ],
    },
    {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        icon: '⌨️',
        subtitle: 'Speed up your workflow',
        pages: ['/'],
        steps: [
            {
                title: 'Site Placement',
                description:
                    'A = Place Site A, B = Place Site B, Escape = Cancel placement or active tool',
            },
            {
                title: 'Analysis',
                description: 'Enter or Ctrl+Enter = Run analysis',
            },
            {
                title: 'Actions',
                description:
                    'D = Open download menu, S = Save link, P = Toggle side panel',
            },
            // Phase 11: Map tool shortcuts
            {
                title: 'Map Tools',
                description:
                    'M = Measure Distance, N = Drop Pin, E = Point Elevation, R = Range Circle, T = Terrain Profile, G = Grid Overlay',
            },
        ],
    },
    {
        id: 'settings-guide',
        title: 'Settings',
        icon: '⚙️',
        subtitle: 'Customize your preferences',
        pages: ['/settings'],
        steps: [
            {
                title: 'Analysis Preferences',
                description:
                    'Set default tower heights and clearance thresholds that apply to every new analysis.',
            },
            {
                title: 'Export Defaults',
                description:
                    'Pre-fill client name, project name, and other fields for PDF exports.',
            },
            {
                title: 'Data Management',
                description:
                    'Clear saved links, history, and cached data from your browser.',
            },
        ],
    },
    {
        id: 'admin-guide',
        title: 'Admin Panel',
        icon: '🛡️',
        subtitle: 'Manage users and monitor usage',
        pages: ['/admin'],
        steps: [
            {
                title: 'User Management',
                description:
                    'Approve, reject, or suspend user accounts. Adjust credits and change roles.',
            },
            {
                title: 'Analysis Logs',
                description:
                    'View all analyses performed across the platform with filtering options.',
            },
            {
                title: 'Credit & Audit Logs',
                description:
                    'Track credit transactions and admin actions for accountability.',
            },
        ],
    },
];

/** Get help guides relevant to a specific page route */
export function getGuidesForPage(pathname: string): HelpGuide[] {
    return HELP_GUIDES.filter((guide) =>
        guide.pages.some((page) => {
            if (page === '/') return pathname === '/';
            return pathname.startsWith(page);
        })
    );
}

/** Get all help guides (for the "All Guides" section in help panel) */
export function getAllGuides(): HelpGuide[] {
    return HELP_GUIDES;
}