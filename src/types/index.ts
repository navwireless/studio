
export type PointCoordinates = {
  lat: number;
  lng: number;
};

// Updated to include name, used in page.tsx form
export type PointInput = {
  name: string; // Added name
  lat: string;
  lng: string;
  height: string;
};

// Updated to reflect new form structure in page.tsx
export type AnalysisFormValues = {
  pointA: PointInput;
  pointB: PointInput;
  clearanceThreshold: string;
};

export type AnalysisParams = {
  pointA: PointCoordinates & { towerHeight: number; name?: string }; // name is optional here for backend
  pointB: PointCoordinates & { towerHeight: number; name?: string }; // name is optional here for backend
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
};

export type AnalysisResult = {
  losPossible: boolean;
  distanceKm: number;
  minClearance: number | null;
  additionalHeightNeeded: number | null;
  profile: LOSPoint[];
  message: string; 
  pointA?: PointCoordinates & { towerHeight: number; name?: string }; 
  pointB?: PointCoordinates & { towerHeight: number; name?: string }; 
};
