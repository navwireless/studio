
export type PointCoordinates = {
  lat: number;
  lng: number;
};

export type PointInput = {
  lat: string;
  lng: string;
  height: string;
};

export type AnalysisFormValues = {
  pointA: PointInput;
  pointB: PointInput;
  clearanceThreshold: string;
};

export type AnalysisParams = {
  pointA: PointCoordinates & { towerHeight: number };
  pointB: PointCoordinates & { towerHeight: number };
  clearanceThreshold: number;
};

export type ElevationSampleAPI = {
  elevation: number;
  location: PointCoordinates;
  resolution?: number; // Optional, as per Google API docs
};

export type LOSPoint = {
  distance: number; // Distance from Point A in km
  terrainElevation: number; // Terrain elevation at this point in meters
  losHeight: number; // Line of Sight height (corrected for curvature) at this point in meters
  clearance: number; // Clearance at this point in meters
};

export type AnalysisResult = {
  losPossible: boolean;
  distanceKm: number;
  minClearance: number | null;
  additionalHeightNeeded: number | null;
  profile: LOSPoint[];
  message: string; // For any specific messages, e.g., about mock data
  pointA?: PointCoordinates & { towerHeight: number }; // Added: Original Point A
  pointB?: PointCoordinates & { towerHeight: number }; // Added: Original Point B
};

