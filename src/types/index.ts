
export type PointCoordinates = {
  lat: number;
  lng: number;
};

export type PointInput = {
  name: string;
  lat: string; // Keep as string for form input
  lng: string; // Keep as string for form input
  height: number; // Number for controlled component (slider/TowerHeightControl)
};

export type AnalysisFormValues = {
  pointA: PointInput;
  pointB: PointInput;
  clearanceThreshold: string;
};

export type AnalysisParams = {
  pointA: PointCoordinates & { towerHeight: number; name?: string };
  pointB: PointCoordinates & { towerHeight: number; name?:string };
  clearanceThreshold: number;
};

export type ElevationSampleAPI = {
  elevation: number;
  location: PointCoordinates;
  resolution?: number;
};

export type LOSPoint = {
  distance: number; // distance from point A in km
  terrainElevation: number; // terrain elevation AMSL in meters
  losHeight: number; // LOS path height AMSL in meters (corrected for curvature)
  clearance: number; // losHeight - terrainElevation in meters
  fresnelRadius?: number; // Optional: For future Fresnel zone display
};

export type AnalysisResult = {
  id: string; // Unique identifier for history
  losPossible: boolean;
  distanceKm: number;
  minClearance: number | null; // Actual minimum clearance from terrain to LOS path
  additionalHeightNeeded: number | null; // Additional height to meet clearanceThreshold
  profile: LOSPoint[];
  message: string;
  pointA: PointCoordinates & { towerHeight: number; name?: string }; 
  pointB: PointCoordinates & { towerHeight: number; name?: string }; 
  clearanceThresholdUsed: number; // The threshold value used for this analysis
  timestamp: number; // To sort or display history items
};

// ============================================
// KMZ / Bulk Analysis Types
// ============================================

export type KmzPlacemark = {
  name: string;
  lat: number;
  lng: number;
  altitude?: number;
};

// Re-export fiber types for use in BulkAnalysisResultItem and consuming code
export type { FiberPathSegment, FiberPathResult } from '@/tools/fiberPathCalculator/types';

export interface BulkAnalysisResultItem {
  id: string;
  pointAName: string;
  pointACoords: string; // "lat, lng"
  pointBName: string;
  pointBCoords: string; // "lat, lng"
  towerHeightUsed: number;
  fresnelHeightUsed: number; // This is the clearanceThresholdUsed
  aerialDistanceKm: number;
  losPossible: boolean;
  minClearanceActual: number | null; // Actual min clearance from terrain to LOS line
  additionalHeightNeeded: number | null;
  remarks: string;
  // For KMZ export and detailed internal use
  pointA: PointCoordinates & { name: string; towerHeight: number };
  pointB: PointCoordinates & { name: string; towerHeight: number };
  profile?: LOSPoint[];
  // Fiber Path related fields (consolidated from bulk-los-analyzer/page.tsx)
  fiberPathStatus?: import('@/tools/fiberPathCalculator/types').FiberPathResult['status'] | null;
  fiberPathTotalDistanceMeters?: number | null;
  fiberPathErrorMessage?: string | null;
  fiberPathSegments?: import('@/tools/fiberPathCalculator/types').FiberPathSegment[] | null;
  // Fields for KMZ path reconstruction for fiber, if snapped points are different
  pointA_snappedToRoad?: PointCoordinates;
  pointB_snappedToRoad?: PointCoordinates;
}

// ============================================
// User Authentication & Profile Types
// (Used by NextAuth + Firestore integration in authOptions.ts)
// ============================================

export type Role = 'user' | 'admin' | 'viewer';

export type ProPlanType = 'monthly' | 'yearly' | 'lifetime' | null;

export interface UserCredits {
  losAnalysis: number;
  bulkAnalysis: number;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  losAnalysisCount: number;
  bulkAnalysisCount: number;
}

export interface UserActionLog {
  action: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

/**
 * Represents a Firestore-compatible Timestamp.
 * Using a generic shape to avoid importing firebase-admin in shared types.
 * At runtime, these are firebase-admin Timestamp instances from `firebase-admin/firestore`.
 */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
  toMillis: () => number;
}

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  role: Role;
  proPlan: ProPlanType;
  planExpiresAt: FirestoreTimestamp | null;
  credits: UserCredits;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  lastLoginAt: FirestoreTimestamp;
  dailyUsage: DailyUsage;
  userActionsCount: number;
}
