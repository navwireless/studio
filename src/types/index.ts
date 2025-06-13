

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

// Specific types for bulk analysis
export type KmzPlacemark = {
  name: string;
  lat: number;
  lng: number;
  altitude?: number;
};

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
}
