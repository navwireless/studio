
export type PointCoordinates = {
  lat: number;
  lng: number;
};

export type PointInput = {
  name: string;
  coordinates: string;
  height: number; // This remains for RHF, though not directly edited in UI
};

export type AnalysisFormValues = {
  pointA: PointInput;
  pointB: PointInput;
  clearanceThreshold: number; // Changed from string to number
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

// Specific type for error state returned by server actions
export type ActionErrorState = {
  error: string;
  fieldErrors?: { [key: string]: string[] | undefined };
};


// --- New types for Multi-Link Context ---
export interface LOSLinkPoint extends Partial<PointCoordinates> { // Lat/Lng can be null initially
  name: string;
  towerHeight: number;
  lat: number | null; // Allow null for unset coordinates
  lng: number | null; // Allow null for unset coordinates
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
