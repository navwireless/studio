
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

// This is the result from the server-side analysis
export type AnalysisResult = {
  id: string; // Keep for history panel compatibility, though LOSLink will have its own ID
  losPossible: boolean;
  distanceKm: number;
  minClearance: number | null;
  additionalHeightNeeded: number | null;
  profile: LOSPoint[];
  message: string;
  pointA: PointCoordinates & { towerHeight: number; name?: string };
  pointB: PointCoordinates & { towerHeight: number; name?: string };
  clearanceThresholdUsed: number;
  timestamp: number; // For history panel
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
  analysisResult?: AnalysisResult; // Stores the full analysis outcome
  analysisTimestamp?: number; // When this analysisResult was fetched/updated
  color: string; // For map polyline
  isDirty: boolean; // True if form data changed since last analysis
}

// Add this new type for TypeScript to recognize the file-saver saveAs function
declare module 'file-saver' {
  export function saveAs(data: Blob | string, filename?: string, options?: FileSaverOptions): void;
}

export interface FileSaverOptions {
    autoBom?: boolean;
}
