
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
  distance: number;
  terrainElevation: number;
  losHeight: number;
  clearance: number;
  fresnelRadius?: number; // Optional: For future Fresnel zone display
};

export type AnalysisResult = {
  id: string; // Unique identifier for history
  losPossible: boolean;
  distanceKm: number;
  minClearance: number | null;
  additionalHeightNeeded: number | null;
  profile: LOSPoint[];
  message: string;
  pointA: PointCoordinates & { towerHeight: number; name?: string }; // Made pointA and pointB non-optional
  pointB: PointCoordinates & { towerHeight: number; name?: string }; // Made pointA and pointB non-optional
  clearanceThresholdUsed: number;
  timestamp: number; // To sort or display history items
};

