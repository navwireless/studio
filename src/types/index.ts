// src/types/index.ts

// ============================================
// UI State Types
// ============================================

/** Which site the user is currently placing on the map */
export type PlacementMode = "A" | "B" | null;

/** Target for programmatic map navigation (e.g., from search) */
export interface MapNavigationTarget {
  lat: number;
  lng: number;
  zoom?: number;
  timestamp: number;
}

/** Right-click context menu state */
export interface MapContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  lat: number;
  lng: number;
}

/** Saved link for the library */
export interface SavedLink {
  id: string;
  name: string;
  pointA: {
    name: string;
    lat: number;
    lng: number;
    towerHeight: number;
  };
  pointB: {
    name: string;
    lat: number;
    lng: number;
    towerHeight: number;
  };
  clearanceThreshold: number;
  analysisResult: AnalysisResult;
  fiberPathResult?:
  | import("@/tools/fiberPathCalculator/types").FiberPathResult
  | null;
  createdAt: number;
  color: string;
}

/** Search action when no placement mode is active */
export type SearchAction = "placeA" | "placeB" | "navigate";

// ============================================
// Core Geometry & Form Types
// ============================================

export type PointCoordinates = {
  lat: number;
  lng: number;
};

export type PointInput = {
  name: string;
  lat: string;
  lng: string;
  height: number;
};

export type AnalysisFormValues = {
  pointA: PointInput;
  pointB: PointInput;
  clearanceThreshold: string;
};

export type AnalysisParams = {
  pointA: PointCoordinates & { towerHeight: number; name?: string };
  pointB: PointCoordinates & { towerHeight: number; name?: string };
  clearanceThreshold: number;
};

export type ElevationSampleAPI = {
  elevation: number;
  location: PointCoordinates;
  resolution?: number;
};

export type LOSPoint = {
  distance: number;
  terrainElevation: number;
  losHeight: number;
  clearance: number;
  fresnelRadius?: number;
};

export type AnalysisResult = {
  id: string;
  losPossible: boolean;
  distanceKm: number;
  minClearance: number | null;
  additionalHeightNeeded: number | null;
  profile: LOSPoint[];
  message: string;
  pointA: PointCoordinates & { towerHeight: number; name?: string };
  pointB: PointCoordinates & { towerHeight: number; name?: string };
  clearanceThresholdUsed: number;
  timestamp: number;
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

export type {
  FiberPathSegment,
  FiberPathResult,
} from "@/tools/fiberPathCalculator/types";

export interface BulkAnalysisResultItem {
  id: string;
  pointAName: string;
  pointACoords: string;
  pointBName: string;
  pointBCoords: string;
  towerHeightUsed: number;
  fresnelHeightUsed: number;
  aerialDistanceKm: number;
  losPossible: boolean;
  minClearanceActual: number | null;
  additionalHeightNeeded: number | null;
  remarks: string;
  pointA: PointCoordinates & { name: string; towerHeight: number };
  pointB: PointCoordinates & { name: string; towerHeight: number };
  profile?: LOSPoint[];
  fiberPathStatus?:
  | import("@/tools/fiberPathCalculator/types").FiberPathResult["status"]
  | null;
  fiberPathTotalDistanceMeters?: number | null;
  fiberPathErrorMessage?: string | null;
  fiberPathSegments?:
  | import("@/tools/fiberPathCalculator/types").FiberPathSegment[]
  | null;
  pointA_snappedToRoad?: PointCoordinates;
  pointB_snappedToRoad?: PointCoordinates;
}

// ============================================
// Re-export Auth Types for convenience
// ============================================

export type {
  UserRole,
  UserStatus,
  UserPlan,
  FirestoreUser,
  CreditTransactionType,
  AnalysisType,
  AnalysisHistoryDoc,
  CreditTransactionDoc,
  AdminLogDoc,
  SubscriptionDoc,
  SessionUser,
} from "./auth";

// ============================================
// Legacy compatibility aliases
// (keeping these so existing code doesn't break)
// ============================================

/** @deprecated Use UserRole from auth types */
export type Role = "user" | "admin";

/** @deprecated Use UserPlan from auth types */
export type ProPlanType = "monthly" | "yearly" | "lifetime" | null;

/** @deprecated Use FirestoreUser from auth types */
export interface UserCredits {
  losAnalysis: number;
  bulkAnalysis: number;
}

/** @deprecated */
export interface DailyUsage {
  date: string;
  losAnalysisCount: number;
  bulkAnalysisCount: number;
}

/** @deprecated */
export interface UserActionLog {
  action: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

/** @deprecated */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
  toMillis: () => number;
}

/** @deprecated Use FirestoreUser from auth types instead */
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