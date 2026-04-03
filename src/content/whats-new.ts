// src/content/whats-new.ts

export interface WhatsNewItem {
  id: string;
  version: string;
  /** ISO date string */
  date: string;
  title: string;
  description: string;
  features: string[];
  type: 'major' | 'minor' | 'fix';
}

export const WHATS_NEW: WhatsNewItem[] = [
  // Phase 11: Map Toolbox announcement
  {
    id: 'v1.1-map-toolbox',
    version: '1.1',
    date: '2026-03-30',
    title: 'Map Toolbox — 10 Professional Tools 🧰',
    description:
      'A new vertical toolbar on the map gives you instant access to 10 engineering utilities without leaving the analysis page.',
    features: [
      'Measure Distance — multi-click polyline with segment breakdown',
      'Measure Area — polygon area and perimeter measurement',
      'Drop Pin — labeled markers with DD/DMS/UTM coordinates',
      'Point Elevation — single-click ground elevation lookup',
      'Coordinate Converter — DD, DMS, and UTM in one click',
      'Range Circle — visualize device operational radius',
      'Terrain Profile — elevation cross-section between two points',
      'Bearing Calculator — azimuth and compass direction',
      'Grid Overlay — adaptive lat/lng grid lines',
      'Map Screenshot — export map view as PNG',
      'Keyboard shortcuts: M, N, E, R, T, G for quick tool access',
    ],
    type: 'major',
  },
  {
    id: 'v1.0-launch',
    version: '1.0',
    date: '2025-03-29',
    title: 'FindLOS is Live! 🚀',
    description:
      'Welcome to FindLOS — professional line-of-sight feasibility analysis for FSO deployments.',
    features: [
      'Single and multi-link LOS analysis',
      'Device compatibility checking (OpticSpectra series)',
      'Professional PDF reports with maps and charts',
      'Bulk analysis from KMZ files',
      'Fiber path distance calculation',
      'WhatsApp report sharing',
      'Export configuration with client details',
      'Guided onboarding tour',
      'Contextual help system',
    ],
    type: 'major',
  },
];

/** Max age in days for showing What's New items */
const MAX_AGE_DAYS = 30;

/** Filter items to those within the last N days */
export function getRecentWhatsNew(): WhatsNewItem[] {
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  return WHATS_NEW.filter((item) => new Date(item.date).getTime() > cutoff);
}