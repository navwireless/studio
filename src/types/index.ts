
export type PointCoordinates = {
  lat: number;
  lng: number;
};

export type PointInput = {
  name: string;
  coordinates: string; // Changed from lat: string, lng: string
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

// This is the result from the server-side analysis
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

// --- New types for Multi-Link Context ---
export interface LOSLinkPoint extends PointCoordinates {
  name: string;
  towerHeight: number;
}

export interface LOSLink {
  id: string;
  pointA: LOSLinkPoint;
  pointB: LOSLinkPoint;
  clearanceThreshold: number;
  analysisResult?: AnalysisResult; 
  analysisTimestamp?: number; 
  color: string; 
  isDirty: boolean; 
}

declare module 'file-saver' {
  export function saveAs(data: Blob | string, filename?: string, options?: FileSaverOptions): void;
}

export interface FileSaverOptions {
    autoBom?: boolean;
}
