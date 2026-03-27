LiFi Link Pro — Complete Context Transfer Document
PART 1: Project Foundation & Business Logic
What This Project Is
LiFi Link Pro (domain: findlos.com, internal name: "FSO-LOS Analyzer") is a professional Free Space Optics (FSO) Line-of-Sight feasibility analysis tool. It's being built as a full-fledged GIS software similar to Google Earth, targeting telecom engineers.

Core Features (Working)
Single Link LOS Analysis: User places two points (Site A, Site B) on a Google Map, sets tower heights, clicks Analyze. Server fetches elevation profile from Google Elevation API (100 samples), runs LOS math (Haversine distance, Earth curvature correction, clearance calculation), returns whether LOS is feasible or blocked.

Fiber Path Calculation: If LOS is feasible and fiber toggle is ON, system snaps each point to nearest road via Google Directions API, calculates driving route between snapped points. Returns total fiber distance = offset_A + road_distance + offset_B.

Elevation Profile Chart: Hand-drawn HTML5 Canvas chart showing terrain, LOS line, obstruction dots, draggable tower handles. User can drag tower tops to adjust height and auto-re-analyze.

Bulk LOS Analyzer (/bulk-los-analyzer): Upload KMZ file with placemarks, system evaluates LOS + fiber for every valid pair within a radius. Has its own auth gate.

Fiber Calculator (/fiber-calculator): Standalone page for fiber path calculation without LOS analysis.

PDF & KMZ Export: Generate PDF reports and KMZ files of analysis results.

Technology Stack
Layer	Tech	Version
Framework	Next.js (App Router)	15.2.3
Language	TypeScript	^5
React	React 18	^18.3.1
Styling	Tailwind CSS + CSS variables	^3.4.1
UI Components	Radix UI (shadcn/ui)	Various
Forms	react-hook-form + Zod	^7.54.2 / ^3.24.2
Maps	@react-google-maps/api	^2.19.3
Charts	Custom Canvas (hand-written)	—
State	useState/useEffect/useActionState + localStorage	—
Server Actions	Next.js Server Actions	—
Auth	NextAuth v4 (Google OAuth) + Firebase Admin	^4.24.7
Database	Firebase Firestore	^12.3.0
PDF	pdf-lib	^1.17.1
KMZ/KML	jszip + XML templates	^3.10.1
Environment Variables Required
text
GOOGLE_ELEVATION_API_KEY — Server-side Google Elevation API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — Client-side Google Maps JS API
GOOGLE_DIRECTIONS_API_KEY — Server-side Google Directions API
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET — Google OAuth
NEXTAUTH_URL / NEXTAUTH_SECRET — NextAuth config
FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY — Firebase Admin
AUTHORIZED_EMAILS / AUTHORIZED_PASSWORDS — Bulk analyzer manual auth
PART 2: Previous Refactoring Sprint (7 Phases — Already Complete)
Before this UI/UX overhaul, a code quality sprint was completed:

What Was Done (All 7 Phases)
Phase 1: Consolidated all types into src/types/index.ts, added missing auth types, created NextAuth route handler
Phase 2: Removed 7 unused component files (stubs like fresnel-settings-bar.tsx, input-form.tsx, results-display.tsx, product-catalog.tsx, bulk-analysis-view.tsx, elevation-profile-chart.tsx)
Phase 3: Extracted 6 custom hooks from page.tsx (735→228 lines, 69% reduction):
use-analysis-state.ts (215 lines) — manages server action, result processing, history, staleness
use-fiber-calculation.ts (170 lines) — fiber toggle, snap radius, fiber calculation trigger
use-map-interaction.ts (75 lines) — map click, marker drag, live distance, placement mode
use-form-persistence.ts (105 lines) — localStorage save/restore of form values
use-pdf-download.ts (55 lines) — PDF generation and download
use-local-storage.ts (55 lines) — generic localStorage hook
use-online-status.ts (35 lines) — navigator.onLine detection
Phase 4: Added Error Boundaries to all 3 pages, granular Google API error messages, retry mechanism
Phase 5: React.memo on 6 components, form.watch() refactored to scalar subscriptions, canvas rAF throttled, dynamic imports for pdf-lib
Phase 6: Smooth panel animations, AnimatedNumber component, ProgressBar, responsive mobile layout, ARIA labels
Phase 7: Removed ignoreBuildErrors: true from next.config.ts, resolved all TypeScript/ESLint errors, clean build
Post-Sprint State
0 TypeScript errors
0 ESLint errors
Clean npm run build
0 @ts-ignore or @ts-expect-error
9 as any (all intentional with eslint-disable comments)
PART 3: UI/UX Overhaul — What Was Decided & Implemented
The Problem
After the refactoring sprint, the UI was functional but messy:

A tab-based bottom-sheet.tsx was added that forced users to click between Results/Profile/Sites tabs — bad UX for engineers who need everything visible at once
Floating toolbar buttons overlapped with the bottom panel on mobile
No way to reopen panel if collapsed on some browsers
Bottom panel height was scrollable instead of fixed
No search, no save system, no side panel
Design Decision: Google Earth-Style Layout
We decided to move from "floating toolbar + bottom sheet" to a Google Earth-style layout:

text
DESKTOP:
┌──────────────────────────────────────────────────────┐
│ ☰ FindLOS  [logo]              [Bulk] [Fiber] [Hist] │ ← floating glassmorphic top bar
├──────────┬───────────────────────────────────────────┤
│ SIDE     │                                           │
│ PANEL    │            GOOGLE MAP                     │
│ (320px)  │          (full height)                    │
│          │                                           │
│ ◉ Site A │                        [Satellite][Map]   │
│ ◉ Site B │                              [+][-]      │
│ ──────── │                                           │
│ ⚡Analyze │                                           │
│ ──────── │                                           │
│ 📊Results │                                           │
│ ──────── │                                           │
│ ⚙Settings│                                           │
│ ──────── │                                           │
│ 📁Saved  │                                           │
│ ──────── │                                           │
│ 📥Export  │                                           │
├──────────┴───────────────────────────────────────────┤
│ ▬ Peek bar: LOS✓ | Distance: 5.2km | Clear: 12m ... │ ← always visible
│   [Elevation Profile Chart — 200px, expandable]      │
└──────────────────────────────────────────────────────┘

MOBILE:
Side panel slides from left on ☰ tap
Bottom strip is the same peek bar + expandable chart
What Was Actually Implemented (UI/UX Changes)
Files Created:
src/components/fso/side-panel.tsx (NEW) — Full Google Earth-style left panel with collapsible sections
Files Modified:
src/app/page.tsx — Complete rewrite from AppHeader+FloatingToolbar layout to SidePanel+Map+BottomStrip layout
src/components/fso/bottom-panel.tsx — Converted from 3-column (SiteA|Chart|SiteB) to slim elevation profile strip with rich peek bar
src/components/fso/map-toolbar.tsx — DELETED (functionality moved to side panel)
Files Deleted:
src/components/fso/map-toolbar.tsx — replaced by side panel
src/components/fso/bottom-sheet.tsx — replaced by bottom-panel.tsx (deleted in earlier phase)
src/components/fso/site-input-card.tsx — replaced by SiteBlock in side-panel.tsx (deleted in earlier phase)
PART 4: Current File Structure & States
Complete Directory Structure (Current)
text
studio/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    ← Root layout (GoogleMapsLoaderProvider wraps app)
│   │   ├── page.tsx                      ← HOME: Side panel + Map + Bottom profile strip
│   │   ├── actions.ts                    ← Server Actions: LOS analysis, PDF, KMZ
│   │   ├── globals.css                   ← CSS variables, dark theme, utilities
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts ← NextAuth route handler
│   │   │   └── login/route.ts            ← Manual auth for bulk analyzer
│   │   ├── bulk-los-analyzer/
│   │   │   ├── page.tsx                  ← Bulk analysis page
│   │   │   └── actions.ts               ← Bulk elevation fetching
│   │   └── fiber-calculator/
│   │       └── page.tsx                  ← Standalone fiber calculator
│   ├── components/
│   │   ├── GoogleMapsLoaderProvider.tsx   ← Google Maps API loading context
│   │   ├── animated-number.tsx           ← Animated number display
│   │   ├── error-boundary.tsx            ← React error boundary
│   │   ├── error-modal.tsx               ← Dismissible error modal
│   │   ├── map-error-boundary.tsx        ← Map-specific error boundary
│   │   ├── progress-bar.tsx              ← Top progress bar
│   │   ├── fso/
│   │   │   ├── side-panel.tsx            ← NEW: Google Earth-style left panel
│   │   │   ├── bottom-panel.tsx          ← Slim elevation profile strip
│   │   │   ├── bottom-panel-skeleton.tsx ← Loading skeleton
│   │   │   ├── custom-profile-chart.tsx  ← Canvas elevation chart (550 lines)
│   │   │   ├── interactive-map.tsx       ← Google Map component (335 lines)
│   │   │   ├── analysis-settings.tsx     ← Settings sheet (NOW UNUSED — settings moved to side panel)
│   │   │   └── tower-height-control.tsx  ← Tower height slider+input
│   │   ├── bulk-los/                     ← Bulk analysis sub-components (7 files)
│   │   ├── fiber-calculator/
│   │   │   └── FiberInputPanel.tsx       ← Fiber calculator side panel
│   │   ├── layout/
│   │   │   ├── app-header.tsx            ← NOW UNUSED — replaced by floating top bar in page.tsx
│   │   │   ├── footer.tsx                ← Footer (still in layout.tsx)
│   │   │   └── history-panel.tsx         ← History sheet panel
│   │   └── ui/                           ← ~30 shadcn/ui primitives
│   ├── hooks/
│   │   ├── use-analysis-state.ts         ← 215 lines
│   │   ├── use-fiber-calculation.ts      ← 170 lines
│   │   ├── use-form-persistence.ts       ← 105 lines
│   │   ├── use-local-storage.ts          ← 55 lines
│   │   ├── use-map-interaction.ts        ← 75 lines
│   │   ├── use-online-status.ts          ← 35 lines
│   │   ├── use-pdf-download.ts           ← 55 lines
│   │   ├── use-mobile.tsx                ← 20 lines
│   │   └── use-toast.ts                  ← 170 lines
│   ├── lib/
│   │   ├── los-calculator.ts             ← Core LOS math (120 lines)
│   │   ├── form-schema.ts                ← Zod schema + defaults
│   │   ├── utils.ts                      ← cn() utility
│   │   ├── kmz-parser.ts                 ← KMZ/KML parser
│   │   ├── export-utils.ts               ← Bulk export utilities
│   │   ├── polyline-decoder.ts           ← Google polyline decoder
│   │   ├── xml-escape.ts                 ← XML escaping
│   │   ├── authOptions.ts                ← NextAuth config
│   │   ├── firebaseAdmin.ts              ← Firebase Admin init
│   │   └── fiber-calculator-form-schema.ts
│   ├── tools/
│   │   ├── fiberPathCalculator/
│   │   │   ├── index.ts
│   │   │   ├── types.ts                  ← FiberPathResult, FiberPathSegment types
│   │   │   ├── actions.ts                ← performFiberPathAnalysisAction
│   │   │   └── calculator.ts             ← Road snapping + routing (272 lines)
│   │   └── report-generator/
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── generatePdfReport.ts
│   │       ├── generateFiberPdfReport.ts
│   │       ├── generateWordReport.ts     ← Placeholder
│   │       └── reportUtils.ts
│   ├── types/
│   │   └── index.ts                      ← Central type definitions
│   └── ai/                               ← Genkit (dormant, not used)
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── .env.local
PART 5: Current State of Each Key File
src/app/page.tsx — Current State (JUST REWRITTEN)
The page now uses a horizontal flex layout:

Left: <SidePanel> (320px, collapsible on mobile via hamburger)
Right: <Map> (flex-1) + <BottomPanel> (profile strip at bottom)
Key features:

No AppHeader component — replaced by floating glassmorphic pills over the map
No MapToolbar — all placement/analyze/settings controls are in the side panel
BottomPanel is now just an elevation profile strip (no site inputs)
Side panel auto-closes on mobile when placing a point
Side panel starts closed on mobile, open on desktop
State variables:

isSidePanelOpen — controls side panel visibility
isProfileExpanded — controls bottom profile strip expansion
isHistoryPanelOpen — controls history sheet
All form state via react-hook-form
Analysis state via useAnalysisState hook
Fiber state via useFiberCalculation hook
Map interaction via useMapInteraction hook
src/components/fso/side-panel.tsx — Current State (NEW FILE)
Contains:

Section component — collapsible accordion sections with icon, title, badge
SiteBlock component — site input card with name, lat, lng, tower height, "Map" placement button
Main SidePanel — scrollable left panel with sections:
Sites (default open): Two SiteBlocks + Analyze button + Clear button
Results (shows when analysis exists): LOS badge, metrics grid (distance, clearance), path details (route, tower heights, threshold), deficit warning, fiber results, PDF download button
Settings (default closed): Clearance threshold slider, fiber toggle + snap radius
Saved Links (PLACEHOLDER): Empty state with "Coming soon" message
Export (PLACEHOLDER): Empty state with "Coming soon" message
Props interface:

typescript
export interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  control: Control<AnalysisFormValues>;
  register: UseFormRegister<AnalysisFormValues>;
  clientFormErrors: FieldErrors<AnalysisFormValues>;
  serverFormErrors?: Record<string, string[] | undefined>;
  placementMode: PlacementMode;
  onSetPlacementMode: (mode: PlacementMode) => void;
  onAnalyze: () => void;
  onClearMap: () => void;
  isActionPending: boolean;
  analysisResult: AnalysisResult | null;
  isStale: boolean;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  fiberPathResult: FiberPathResult | null;
  isFiberCalculating: boolean;
  fiberPathError: string | null;
  isFiberPathEnabled: boolean;
  onToggleFiberPath: (enabled: boolean) => void;
  snapRadius: number;
  onSnapRadiusChange: (value: string) => void;
  onApplySnapRadius: () => void;
  clearanceThreshold: number;
  onClearanceThresholdChange: (value: number[]) => void;
  isPending: boolean;
}
KNOWN ISSUE: The SiteBlock uses template string Tailwind classes like bg-${color}-500/20 which don't work with Tailwind's JIT compiler. These need to be changed to explicit classes or safelist entries.

src/components/fso/bottom-panel.tsx — Current State (REWRITTEN)
Now a slim elevation profile strip:

Peek bar: Always visible when analysis exists. Shows: LOS badge, Distance (labeled), Clearance (labeled), Tower A height, Tower B height, Fiber distance, expand/collapse chevron
Expandable chart: 200px/220px fixed height chart area. Uses CustomProfileChart with Suspense fallback
No site inputs (moved to side panel)
No analyze/PDF buttons (moved to side panel)
src/components/fso/interactive-map.tsx — Current State (UNCHANGED)
422→335 lines after refactoring. Features:

Google Map with satellite default
Draggable markers with arrow icons and label overlays
LOS polyline (green=feasible, red=blocked, blue=stale)
Fiber polylines (orange=offset, blue=road route)
Distance labels at midpoints
Custom zoom/map-type buttons (top-right, bottom-right)
Flash animation on new analysis result
Fit bounds when both points placed
Greedy gesture handling for mobile
src/components/fso/custom-profile-chart.tsx — Current State (UNCHANGED)
550 lines. Canvas-based elevation profile with:

Terrain fill area with stroke
LOS line
Obstruction dots (red) where LOS intersects terrain
Tower lines with draggable handles
Hover tooltip with distance, elevation, clearance
Live drag visuals during tower height adjustment
Keyboard navigation (Shift+Up/Down for Site A, Up/Down for Site B)
ResizeObserver for responsive canvas
src/components/fso/analysis-settings.tsx — NOW POTENTIALLY UNUSED
This was a bottom Sheet with clearance slider, fiber toggle, and snap radius. Its functionality has been moved into the Side Panel's "Settings" section. Should be deleted unless other pages still use it.

src/components/layout/app-header.tsx — NOW POTENTIALLY UNUSED
Was the top navigation bar. Replaced by floating glassmorphic pills in the new page.tsx. May still be used by /bulk-los-analyzer and /fiber-calculator pages. Check before deleting.

src/components/layout/footer.tsx — Still in layout.tsx
The root layout.tsx still renders <Footer /> after <main>. With the new full-height flex layout in page.tsx (h-screen), the footer may be hidden or cause layout issues. Needs investigation.

PART 6: Planned Features (NOT YET IMPLEMENTED)
From the 6-Phase Plan
Phase	Feature	Status
1	Side panel + layout restructure	✅ CODE WRITTEN (needs testing/debugging)
2	Search bar (Google Places Autocomplete)	❌ NOT STARTED
3	Save system (localStorage) — save points & analysis links	❌ NOT STARTED
4	Saved links library panel + select/multi-select + load/delete	❌ NOT STARTED
5	Export: KMZ of all saved, combined PDF of selected links	❌ NOT STARTED
6	Mobile bottom sheet integration + animation polish	❌ NOT STARTED
Phase 2 Details — Search Bar
Add Google Places Autocomplete input at top of side panel (or in the floating top bar)
When user selects a place, map navigates to that location
User can then click to place Site A or B at that location
Uses google.maps.places.Autocomplete from the already-loaded Maps API (libraries: ['geometry', 'places'] already configured in GoogleMapsLoaderProvider.tsx)
Phase 3 Details — Save System
New hook: use-saved-links.ts
Save to localStorage (or Firestore if auth is available)
Data structure for saved items:
typescript
SavedPoint = { id, name, lat, lng, towerHeight, createdAt }
SavedLink = { id, pointA: SavedPoint, pointB: SavedPoint, analysisResult: AnalysisResult, fiberResult?: FiberPathResult, createdAt }
"Save Link" button appears in Results section after successful analysis
Saved items persist across sessions
Phase 4 Details — Saved Links Library
In the "Saved Links" section of side panel, show list of saved links
Each link card shows: name, distance, LOS status badge, date
Click to load (restores form values + displays result)
Multi-select with checkboxes for batch export
Delete individual or selected links
Saved links' polylines shown on map in a different color/style
Phase 5 Details — Export
"Export" section in side panel
Export all saved points as KMZ with placemarks
Export all saved links as KMZ with placemarks + polylines
Export combined PDF report of selected saved links
Export Excel/CSV of all saved analysis data
Phase 6 Details — Mobile Polish
Refined bottom sheet behavior on mobile
Side panel as proper slide-over with gesture dismiss
Touch-friendly interactions throughout
Proper safe-area handling for notched phones
Animation refinements (spring physics, gesture-following)
PART 7: Known Issues & Bugs to Fix
Critical Issues
Tailwind dynamic classes in side-panel.tsx: The SiteBlock component uses template literals like `bg-${color}-500/20` — Tailwind JIT cannot detect these. Fix: use explicit class mappings or add to safelist.

analysis-settings.tsx is now orphaned: Its functionality is duplicated in side-panel.tsx. The old page.tsx import was removed, but the file still exists. Should be deleted.

app-header.tsx may be orphaned: No longer imported in page.tsx. Check if /bulk-los-analyzer/page.tsx and /fiber-calculator/page.tsx still import it. If yes, keep. If no, delete.

Footer in layout.tsx may break layout: The root layout renders <Footer /> after <main>, but page.tsx now uses h-screen with overflow-hidden. The footer may be invisible or cause the page to exceed viewport height.

PlacementMode type is now defined in side-panel.tsx: It was previously exported from map-toolbar.tsx (now deleted). The interactive-map.tsx imports PlacementMode from ./map-toolbar. THIS WILL BREAK. Fix: move PlacementMode type to @/types/index.ts or export from side-panel.tsx and update imports in interactive-map.tsx.

Logo image: page.tsx references /logo.png in the floating top bar. This file may or may not exist in the public/ directory.

Build Issues to Verify
After implementing Phase 1 changes, must run:

bash
npx tsc --noEmit
npx next lint
npm run build
Expected issues:

Import of PlacementMode from deleted map-toolbar.tsx
Possible unused imports in files that previously imported AnalysisSettings or AppHeader
Tailwind dynamic class warnings
PART 8: Data Flow Architecture
text
User clicks map or enters coordinates in Side Panel
  → react-hook-form state update
  → localStorage persistence (via useFormPersistence hook)
  → User clicks "Analyze Link" in Side Panel
  → processSubmit() builds FormData
  → React.startTransition → formAction (useActionState)
  → Server Action: performLosAnalysis()
    → Zod validation
    → Google Elevation API (100 samples along path)
    → analyzeLOS() — curvature + clearance math
    → Return AnalysisResult
  → useAnalysisState hook processes rawServerState
    → Sets analysisResult
    → Pushes to historyList
    → Sets isProfileExpanded(true) — opens bottom profile strip
  → If fiber enabled & LOS feasible:
    → useFiberCalculation hook triggers
    → Server Action: performFiberPathAnalysisAction()
      → Snap points to roads via Directions API
      → Get driving route between snapped points
      → Return FiberPathResult with segments
    → Sets fiberPathResult
  → UI Updates:
    → Side Panel: Results section shows metrics
    → Bottom Panel: Peek bar shows summary, chart expands
    → Map: Polylines drawn (LOS + fiber), markers positioned
Key Types
typescript
AnalysisResult = {
  id: string;
  losPossible: boolean;
  distanceKm: number;
  minClearance: number | null;
  additionalHeightNeeded: number | null;
  profile: LOSPoint[];
  message: string;
  pointA/pointB: { lat, lng, towerHeight, name? };
  clearanceThresholdUsed: number;
  timestamp: number;
}

FiberPathResult = {
  status: 'success' | 'no_road_for_a' | 'no_road_for_b' | 'no_route_between_roads' | 'api_error' | 'input_error' | 'los_not_feasible' | 'radius_too_small';
  totalDistanceMeters?: number;
  pointA_original/pointB_original: { lat, lng };
  pointA_snappedToRoad?/pointB_snappedToRoad?: { lat, lng };
  offsetDistanceA_meters?/offsetDistanceB_meters?: number;
  roadRouteDistanceMeters?: number;
  segments?: FiberPathSegment[];
  errorMessage?: string;
  losFeasible: boolean;
  radiusMetersUsed: number;
}

LOSPoint = {
  distance: number;        // km from Point A
  terrainElevation: number; // meters AMSL
  losHeight: number;        // LOS path height AMSL (curvature-corrected)
  clearance: number;        // losHeight - terrainElevation
}
PART 9: Custom Hooks Reference
useAnalysisState(config)
File: src/hooks/use-analysis-state.ts (215 lines)
Manages: Server action execution, raw result processing, analysis result, staleness detection, error display, history list, form reset on result
Returns: { rawServerState, analysisResult, isStale, isActionPending, formAction, displayedError, fieldErrors, historyList, setHistoryList, setDisplayedError, setFieldErrors, dismissErrorModal, retryLastAnalysis, clearAnalysis, loadFromHistory }

useFiberCalculation(config)
File: src/hooks/use-fiber-calculation.ts (170 lines)
Manages: Fiber toggle state (localStorage persisted), snap radius (localStorage persisted), fiber calculation trigger when LOS succeeds, fiber result state
Returns: { calculateFiberPathEnabled, fiberPathResult, isFiberCalculating, fiberPathError, localSnapRadiusInput, handleToggleFiberPath, setLocalSnapRadiusInput, handleApplySnapRadius, setFiberPathResult, setFiberPathError }

useMapInteraction(form)
File: src/hooks/use-map-interaction.ts (75 lines)
Manages: Placement mode (A/B/null), map click handler, marker drag handler, live distance calculation
Returns: { placementMode, setPlacementMode, handleMapClick, handleMarkerDrag, liveDistanceKm }

useFormPersistence(form)
File: src/hooks/use-form-persistence.ts (105 lines)
Manages: Save/restore form values to/from localStorage on every change and on mount
Exports: LOCAL_STORAGE_KEYS constant

usePdfDownload()
File: src/hooks/use-pdf-download.ts (55 lines)
Manages: PDF generation state, download trigger
Returns: { isGeneratingPdf, handleDownloadPdf }

useOnlineStatus()
File: src/hooks/use-online-status.ts (35 lines)
Returns: boolean — whether browser is online

PART 10: Immediate Next Steps (Priority Order)
Step 1: Fix Build-Breaking Issues from Phase 1
Fix PlacementMode import: interactive-map.tsx imports from ./map-toolbar which was deleted. Move type to @/types/index.ts or re-export from side-panel.tsx.

Fix Tailwind dynamic classes in side-panel.tsx: Replace `bg-${color}-500/20` pattern with explicit class mappings:

tsx
const colorClasses = {
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50', ... },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', ... },
};
Fix Footer: Either remove <Footer /> from layout.tsx or add it inside page.tsx at the appropriate location.

Clean up orphaned files: Delete analysis-settings.tsx if confirmed unused. Check if app-header.tsx is still needed by other pages.

Test and verify build: Run npx tsc --noEmit, npm run build

Step 2: Implement Phase 2 — Search
Add Google Places Autocomplete search to side panel header or floating top bar.

Step 3: Implement Phase 3 — Save System
Create use-saved-links.ts hook, add save button to Results section, persist to localStorage.

Step 4: Implement Phase 4 — Saved Links Library
Fill in the "Saved Links" section with actual list UI, load/delete functionality.

Step 5: Implement Phase 5 — Export
Fill in the "Export" section with KMZ/PDF/Excel generation for saved data.

Step 6: Implement Phase 6 — Mobile Polish
Refine all mobile interactions, gestures, safe areas, animations.

PART 11: Files That Need Immediate Attention
Priority	File	Issue
P0	src/components/fso/interactive-map.tsx	Imports PlacementMode from deleted ./map-toolbar — WILL CRASH
P0	src/components/fso/side-panel.tsx	Dynamic Tailwind classes won't compile
P1	src/app/layout.tsx	Footer may conflict with h-screen layout
P1	src/components/fso/analysis-settings.tsx	Orphaned — settings now in side panel
P1	src/components/layout/app-header.tsx	Orphaned from home page — check other pages
P2	src/components/fso/bottom-panel-skeleton.tsx	May reference old layout structure
P2	src/app/bulk-los-analyzer/page.tsx	Still uses old AppHeader — needs consistency check
P2	src/app/fiber-calculator/page.tsx	Still uses old AppHeader — needs consistency check
This document provides complete context for any AI to continue this project. The immediate priority is fixing the P0 build-breaking issues, then proceeding with Phase 2-6 features.