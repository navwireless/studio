"use server";

import { z } from 'zod';
import type { AnalysisParams, AnalysisResult, PointCoordinates, ElevationSampleAPI } from '@/types';
import { analyzeLOS } from '@/lib/los-calculator';
import { generatePdfReportForSingleAnalysis, type ReportGenerationOptions } from '@/tools/report-generator';
import { PointInputSchema_FC } from '@/lib/fiber-calculator-form-schema';
import type { FiberPathResult } from '@/tools/fiberPathCalculator';
import { generatePdfReportForFiberAnalysis } from '@/tools/report-generator/generateFiberPdfReport';
import JSZip from 'jszip';
import { xmlEscape } from '@/lib/xml-escape';
import { decodePolyline, formatCoordinatesForKml } from '@/lib/polyline-decoder';

// --- Google Elevation API Configuration ---
const GOOGLE_ELEVATION_API_KEY = process.env.GOOGLE_ELEVATION_API_KEY;
const GOOGLE_ELEVATION_API_URL = "https://maps.googleapis.com/maps/api/elevation/json";
// --- End Google Elevation API Configuration ---

// Define Zod schema for form validation on the server, expecting string inputs from FormData
const ServerActionPointInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  lat: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  }, "Latitude must be between -90 and 90 (e.g., 28.6139)"),
  lng: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  }, "Longitude must be between -180 and 180 (e.g., 77.2090)"),
  height: z.string()
    .refine(val => !isNaN(parseFloat(val)), "Tower height must be a number")
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, "Minimum tower height is 0m")
    .refine(val => val <= 100, "Maximum tower height is 100m"),
});

const ServerActionAnalysisSchema = z.object({
  pointA: ServerActionPointInputSchema,
  pointB: ServerActionPointInputSchema,
  clearanceThreshold: z.string()
    .refine(val => !isNaN(parseFloat(val)), "Clearance threshold must be a number")
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, "Clearance threshold must be a non-negative number"),
});

async function getGoogleElevationData(pointA: PointCoordinates, pointB: PointCoordinates, samples: number = 100): Promise<ElevationSampleAPI[]> {
  if (!GOOGLE_ELEVATION_API_KEY || GOOGLE_ELEVATION_API_KEY.trim() === "" || GOOGLE_ELEVATION_API_KEY === "YOUR_GOOGLE_ELEVATION_API_KEY_HERE") {
    console.error("ACTION_ERROR: getGoogleElevationData - Google Elevation API key is not configured or is a placeholder.");
    throw new Error("Elevation service API key is not configured. Please check server environment variables.");
  }

  const pathStr = `${pointA.lat},${pointA.lng}|${pointB.lat},${pointB.lng}`;
  const url = `${GOOGLE_ELEVATION_API_URL}?path=${pathStr}&samples=${samples}&key=${GOOGLE_ELEVATION_API_KEY.trim()}`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError: unknown) {
    console.error("ACTION_ERROR: getGoogleElevationData - Network error fetching elevation data:", networkError);
    throw new Error("Unable to reach the elevation service. Please check your internet connection and try again.");
  }

  if (!response.ok) {
    console.error(`ACTION_ERROR: getGoogleElevationData - HTTP ${response.status}`);
    throw new Error(`Elevation service returned HTTP ${response.status}. Please try again in a moment.`);
  }

  let data;
  try {
    data = await response.json();
  } catch (jsonError: unknown) {
    console.error("ACTION_ERROR: getGoogleElevationData - JSON parse failed:", jsonError);
    throw new Error("Received invalid data from the elevation service. Please try again.");
  }

  if (data.status === 'OVER_QUERY_LIMIT') {
    throw new Error("Elevation API rate limit exceeded. Please wait 30 seconds and try again.");
  }

  if (data.status === 'REQUEST_DENIED') {
    throw new Error("Elevation API access denied. This is a server configuration issue \u2014 please contact support.");
  }

  if (data.status !== 'OK') {
    console.error(`ACTION_ERROR: getGoogleElevationData - Google Elevation API error status '${data.status}':`, data.error_message);
    throw new Error(`Elevation service error: ${data.status}. ${data.error_message || 'Please try again.'}`);
  }

  if (!data.results || data.results.length === 0) {
    throw new Error("No elevation data returned for this path. The points may be over ocean or in an unsupported area.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.results.map((sample: any) => ({
    elevation: sample.elevation,
    location: {
      lat: sample.location.lat,
      lng: sample.location.lng,
    },
    resolution: sample.resolution,
  }));
}

export async function performLosAnalysis(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prevState: AnalysisResult | { error: string; fieldErrors?: any } | null,
  formData: FormData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<AnalysisResult | { error: string; fieldErrors?: any }> {
  try {
    const rawFormData = {
      pointA: {
        name: String(formData.get('pointA.name') ?? "Site A"),
        lat: String(formData.get('pointA.lat') ?? ""),
        lng: String(formData.get('pointA.lng') ?? ""),
        height: String(formData.get('pointA.height') ?? ""),
      },
      pointB: {
        name: String(formData.get('pointB.name') ?? "Site B"),
        lat: String(formData.get('pointB.lat') ?? ""),
        lng: String(formData.get('pointB.lng') ?? ""),
        height: String(formData.get('pointB.height') ?? ""),
      },
      clearanceThreshold: String(formData.get('clearanceThreshold') ?? ""),
    };

    const validationResult = ServerActionAnalysisSchema.safeParse(rawFormData);

    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten();
      const finalErrorMessage = "Input validation failed. Please check the fields.";
      console.error("ACTION_ERROR: performLosAnalysis - Server-side Zod validation failed:", flattenedErrors);
      return { error: finalErrorMessage, fieldErrors: flattenedErrors.fieldErrors };
    }

    const validatedData = validationResult.data;

    const params: AnalysisParams = {
      pointA: {
        name: validatedData.pointA.name,
        lat: parseFloat(rawFormData.pointA.lat),
        lng: parseFloat(rawFormData.pointA.lng),
        towerHeight: validatedData.pointA.height,
      },
      pointB: {
        name: validatedData.pointB.name,
        lat: parseFloat(rawFormData.pointB.lat),
        lng: parseFloat(rawFormData.pointB.lng),
        towerHeight: validatedData.pointB.height,
      },
      clearanceThreshold: validatedData.clearanceThreshold,
    };

    const elevationData = await getGoogleElevationData(params.pointA, params.pointB, 100);
    const result = analyzeLOS(params, elevationData);

    return {
      ...result,
      id: new Date().toISOString() + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      message: `${result.message} Using Google Elevation API data.`
    };
  } catch (err: unknown) {
    const clientErrorMessageString = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
    console.error("ACTION_ERROR: Unhandled exception in performLosAnalysis:", err);
    return { error: clientErrorMessageString };
  }
}

// ─── Single Analysis PDF Report ─────────────────────── // ← CHANGED: accepts fiberResult

export async function generateSingleAnalysisPdfReportAction(
  analysisResult: AnalysisResult,
  reportOptions?: ReportGenerationOptions,
  fiberResult?: FiberPathResult | null,                   // ← CHANGED: new parameter
): Promise<{ success: true; data: { base64Pdf: string; fileName: string } } | { success: false; error: string }> {
  try {
    if (!analysisResult) {
      console.error("ACTION_ERROR: generateSingleAnalysisPdfReportAction - Analysis result data is missing.");
      return { success: false, error: "Analysis result data is missing." };
    }

    const pdfBytes = await generatePdfReportForSingleAnalysis(
      analysisResult,
      reportOptions,
      fiberResult ?? null,                                // ← CHANGED: pass fiberResult
    );
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    const safePointAName = (analysisResult.pointA.name || "SiteA").replace(/[^a-zA-Z0-9]/g, '_');
    const safePointBName = (analysisResult.pointB.name || "SiteB").replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `LOS_Report_${safePointAName}_to_${safePointBName}.pdf`;

    return { success: true, data: { base64Pdf, fileName } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during PDF report generation.";
    console.error("ACTION_ERROR: Unhandled exception in generateSingleAnalysisPdfReportAction:", error);
    return { success: false, error: `Failed to generate PDF report: ${errorMessage}` };
  }
}

// ─── Fiber Report ───────────────────────────────────────

const FiberReportParamsSchema = z.object({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fiberPathResult: z.custom<FiberPathResult>((val) => val !== null && typeof val === 'object' && 'status' in (val as any), {
    message: "Valid FiberPathResult object is required."
  }),
  pointA_form: PointInputSchema_FC,
  pointB_form: PointInputSchema_FC,
  snapRadiusUsed_form: z.number().min(0, "Snap radius must be non-negative."),
  reportOptions: z.custom<ReportGenerationOptions>().optional()
});

export async function generateFiberReportAction(
  params: z.infer<typeof FiberReportParamsSchema>
): Promise<{ success: true; data: { base64Pdf: string; fileName: string } } | { success: false; error: string }> {
  try {
    const validation = FiberReportParamsSchema.safeParse(params);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      console.error("ACTION_ERROR: generateFiberReportAction - Invalid input:", validation.error.flatten());
      return { success: false, error: `Invalid input: ${errorMessages}` };
    }

    const { fiberPathResult, pointA_form, pointB_form, snapRadiusUsed_form, reportOptions } = validation.data;

    if (!fiberPathResult || fiberPathResult.status !== 'success') {
      console.warn("ACTION_WARNING: generateFiberReportAction - Cannot generate report: Fiber path calculation was not successful or data is missing.");
      return { success: false, error: "Cannot generate report: Fiber path calculation was not successful or data is missing." };
    }

    const pointA_coords_report: PointCoordinates = {
      lat: parseFloat(pointA_form.lat),
      lng: parseFloat(pointA_form.lng)
    };
    const pointB_coords_report: PointCoordinates = {
      lat: parseFloat(pointB_form.lat),
      lng: parseFloat(pointB_form.lng)
    };

    if (isNaN(pointA_coords_report.lat) || isNaN(pointA_coords_report.lng) || isNaN(pointB_coords_report.lat) || isNaN(pointB_coords_report.lng)) {
      console.error("ACTION_ERROR: generateFiberReportAction - Invalid coordinates provided in form data for report generation.");
      return { success: false, error: "Invalid coordinates provided in form data for report generation." };
    }

    const pdfBytes = await generatePdfReportForFiberAnalysis(
      fiberPathResult,
      { name: pointA_form.name, ...pointA_coords_report },
      { name: pointB_form.name, ...pointB_coords_report },
      snapRadiusUsed_form,
      reportOptions
    );
    const base64Pdf = Buffer.from(pdfBytes).toString('base64');

    const safePointAName = (pointA_form.name || "SiteA").replace(/[^a-zA-Z0-9]/g, '_');
    const safePointBName = (pointB_form.name || "SiteB").replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Fiber_Path_Report_${safePointAName}_to_${safePointBName}.pdf`;

    return { success: true, data: { base64Pdf, fileName } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during Fiber PDF report generation.";
    console.error("ACTION_ERROR: Unhandled exception in generateFiberReportAction:", error);
    return { success: false, error: `Failed to generate Fiber PDF report: ${errorMessage}` };
  }
}

// ─── Single Fiber Path KMZ ──────────────────────────────

const SingleFiberPathKmzParamsSchema = z.object({
  fiberPathResult: z.custom<FiberPathResult>((val) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (val === null || typeof val !== 'object' || !('status' in (val as any))) {
      return false;
    }
    return (val as FiberPathResult).status === 'success';
  }, {
    message: "Successful FiberPathResult object is required for KMZ generation."
  }),
  pointA_name: z.string().min(1, "Point A name is required."),
  pointB_name: z.string().min(1, "Point B name is required."),
});

export async function generateSingleFiberPathKmzAction(
  params: z.infer<typeof SingleFiberPathKmzParamsSchema>
): Promise<{ success: true; data: { base64Kmz: string; fileName: string } } | { success: false; error: string }> {
  try {
    const validation = SingleFiberPathKmzParamsSchema.safeParse(params);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      console.error("ACTION_ERROR: generateSingleFiberPathKmzAction - Invalid input:", validation.error.flatten());
      return { success: false, error: `Invalid input for KMZ generation: ${errorMessages}` };
    }

    const { fiberPathResult, pointA_name, pointB_name } = validation.data;

    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Fiber Path: ${xmlEscape(pointA_name)} to ${xmlEscape(pointB_name)}</name>
    <Style id="originalPointStyle">
      <IconStyle><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><scale>1.0</scale></IconStyle>
      <LabelStyle><scale>0.8</scale></LabelStyle>
    </Style>
    <Style id="snappedPointStyle">
      <IconStyle><Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-blank.png</href></Icon><scale>0.8</scale></IconStyle>
      <LabelStyle><scale>0.7</scale></LabelStyle>
    </Style>
    <Style id="offsetLineStyle">
      <LineStyle><color>a000aaff</color><width>3</width></LineStyle>
    </Style>
    <Style id="roadRouteLineStyle">
      <LineStyle><color>a0ffaa00</color><width>4</width></LineStyle>
    </Style>

    <Folder><name>Original Sites</name>
      <Placemark>
        <name>${xmlEscape(pointA_name)} (Original)</name>
        <styleUrl>#originalPointStyle</styleUrl>
        <Point><coordinates>${fiberPathResult.pointA_original.lng},${fiberPathResult.pointA_original.lat},0</coordinates></Point>
      </Placemark>
      <Placemark>
        <name>${xmlEscape(pointB_name)} (Original)</name>
        <styleUrl>#originalPointStyle</styleUrl>
        <Point><coordinates>${fiberPathResult.pointB_original.lng},${fiberPathResult.pointB_original.lat},0</coordinates></Point>
      </Placemark>
    </Folder>

    <Folder><name>Fiber Path Segments</name>`;

    if (fiberPathResult.pointA_snappedToRoad) {
      kmlContent += `
      <Placemark>
        <name>${xmlEscape(pointA_name)} (Snapped to Road)</name>
        <styleUrl>#snappedPointStyle</styleUrl>
        <Point><coordinates>${fiberPathResult.pointA_snappedToRoad.lng},${fiberPathResult.pointA_snappedToRoad.lat},0</coordinates></Point>
      </Placemark>`;
    }
    if (fiberPathResult.pointB_snappedToRoad) {
      kmlContent += `
      <Placemark>
        <name>${xmlEscape(pointB_name)} (Snapped to Road)</name>
        <styleUrl>#snappedPointStyle</styleUrl>
        <Point><coordinates>${fiberPathResult.pointB_snappedToRoad.lng},${fiberPathResult.pointB_snappedToRoad.lat},0</coordinates></Point>
      </Placemark>`;
    }

    if (fiberPathResult.segments) {
      for (const segment of fiberPathResult.segments) {
        let segmentName = "";
        let styleUrl = "";
        let coordinatesString = "";
        let description = `Segment Type: ${xmlEscape(segment.type)}\nDistance: ${segment.distanceMeters.toFixed(1)} m`;

        switch (segment.type) {
          case 'offset_a':
            segmentName = `Offset A: ${xmlEscape(pointA_name)} to Road`;
            styleUrl = "#offsetLineStyle";
            coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
            break;
          case 'offset_b':
            segmentName = `Offset B: Road to ${xmlEscape(pointB_name)}`;
            styleUrl = "#offsetLineStyle";
            coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
            break;
          case 'road_route':
            segmentName = `Road Segment (${xmlEscape(pointA_name)} to ${xmlEscape(pointB_name)})`;
            styleUrl = "#roadRouteLineStyle";
            if (segment.pathPolyline) {
              const decodedCoords = decodePolyline(segment.pathPolyline);
              coordinatesString = formatCoordinatesForKml(decodedCoords);
              description += `\nEncoded Polyline (for reference): ${xmlEscape(segment.pathPolyline)}`;
            } else {
              console.warn("ACTION_WARNING: KMZ Gen - Road_route segment missing pathPolyline. Drawing straight line.");
              coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
              description += "\nNote: Polyline missing, showing straight line.";
            }
            break;
        }

        if (segmentName && styleUrl && coordinatesString) {
          kmlContent += `
      <Placemark>
        <name>${segmentName}</name>
        <styleUrl>${styleUrl}</styleUrl>
        <description>${xmlEscape(description)}</description>
        <LineString><tessellate>1</tessellate><coordinates>${coordinatesString}</coordinates></LineString>
      </Placemark>`;
        }
      }
    }

    kmlContent += `
    </Folder>
  </Document>
</kml>`;

    const zip = new JSZip();
    zip.file("doc.kml", kmlContent);

    const kmzBuffer = await zip.generateAsync({ type: "nodebuffer", mimeType: "application/vnd.google-earth.kmz" });
    const base64Kmz = kmzBuffer.toString('base64');

    const safePointAName = (pointA_name || "SiteA").replace(/[^a-zA-Z0-9]/g, '_');
    const safePointBName = (pointB_name || "SiteB").replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Fiber_Path_KMZ_${safePointAName}_to_${safePointBName}.kmz`;

    return { success: true, data: { base64Kmz, fileName } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during KMZ generation.";
    console.error("ACTION_ERROR: Unhandled exception in generateSingleFiberPathKmzAction:", error);
    return { success: false, error: `Failed to generate KMZ: ${errorMessage}` };
  }
}

export async function getGoogleMapsApiKey(): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_JS_API_KEY_HERE") {
    console.error("ACTION_ERROR: getGoogleMapsApiKey - Google Maps API key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is not configured.");
    return null;
  }
  return apiKey;
}

// ─── Combined PDF Report for Saved Links ─────────────── // ← CHANGED: passes options

export async function generateCombinedPdfReportAction(
  savedLinksJson: string,
  reportOptionsJson?: string,                              // ← CHANGED: new parameter
): Promise<{ success: true; data: { base64Pdf: string; fileName: string } } | { success: false; error: string }> {
  'use server';
  try {
    const links = JSON.parse(savedLinksJson) as import('@/types').SavedLink[];
    if (!links.length) return { success: false, error: 'No links to export.' };

    const options = reportOptionsJson ? JSON.parse(reportOptionsJson) : undefined;

    const { generateCombinedPdfReport } = await import('@/tools/report-generator/generateCombinedPdfReport');
    const pdfBytes = await generateCombinedPdfReport(links, options); // ← CHANGED: pass options

    const base64Pdf = Buffer.from(pdfBytes).toString('base64');
    const ts = new Date().toISOString().slice(0, 10);
    return {
      success: true,
      data: { base64Pdf, fileName: `findlos_combined_report_${ts}.pdf` },
    };
  } catch (e) {
    console.error('Combined PDF generation failed:', e);
    return { success: false, error: e instanceof Error ? e.message : 'PDF generation failed.' };
  }
}