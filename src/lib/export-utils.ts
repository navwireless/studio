
import * as XLSX from 'xlsx';
import type { WorkBook } from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'; // For robust downloads
import type { BulkAnalysisResultItem } from '@/app/bulk-los-analyzer/page';
import type { KmzPlacemark } from './kmz-parser';
import type { FiberPathSegment, FiberPathResult } from '@/tools/fiberPathCalculator';

// Helper function to get the encoded polyline for the road route segment
// This extracts the encoded polyline for the main road route portion.
function getRoadRouteEncodedPolyline(segments?: FiberPathSegment[]): string {
    if (!segments) return "";
    const roadSegments = segments.filter(s => s.type === 'road_route');
    // Assuming Google Directions API might return multiple steps for the road route.
    // Concatenate their polylines if they exist. Or, if a single overview polyline for the road part
    // was available and stored, that would be better. Here, we take polylines from all 'road_route' type segments.
    // Note: Simple concatenation might not be visually perfect if segments aren't perfectly contiguous.
    // For KML description, it's usually fine to list them or provide the primary one.
    return roadSegments.map(s => s.pathPolyline || "").join('; '); // Join with semicolon if multiple.
}

// Helper to format fiber status for display/export
const formatFiberStatusForExport = (status?: FiberPathResult['status']): string => {
  if (!status) return 'N/A';
  switch (status) {
    case 'success': return 'Success';
    case 'los_not_feasible': return 'LOS Not Feasible';
    case 'no_road_for_a': return 'No Road Near Site A';
    case 'no_road_for_b': return 'No Road Near Site B';
    case 'no_route_between_roads': return 'No Road Route Between Snapped Points';
    case 'radius_too_small': return 'Snap Radius Too Small';
    case 'api_error': return 'API Error';
    case 'input_error': return 'Input Error';
    default: return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};


// Excel Export
export function createExcelWorkbook(results: BulkAnalysisResultItem[]): WorkBook {
  const hasFiberData = results.some(item => 
    item.fiberPathStatus !== undefined || 
    item.fiberPathTotalDistanceMeters !== undefined ||
    item.fiberPathErrorMessage !== undefined
  );

  const worksheetData = results.map(r => {
    const baseData: any = {
      'Point A Name': r.pointAName,
      'Point A Coordinates': r.pointACoords,
      'Tower Height A (m)': r.towerHeightUsed,
      'Point B Name': r.pointBName,
      'Point B Coordinates': r.pointBCoords,
      'Tower Height B (m)': r.towerHeightUsed, // Assuming same tower height applied from global
      'Fresnel/Clearance Height (m)': r.fresnelHeightUsed,
      'Aerial Distance (km)': r.aerialDistanceKm,
      'LOS Possible': r.losPossible ? 'Yes' : 'No',
      'Actual Min Clearance (m)': r.minClearanceActual?.toFixed(1) ?? 'N/A',
      'Additional Height Needed (m)': r.additionalHeightNeeded?.toFixed(1) ?? 'N/A',
      'LOS Remarks': r.remarks,
    };

    if (hasFiberData) {
      baseData['Fiber Path Status'] = formatFiberStatusForExport(r.fiberPathStatus);
      baseData['Fiber Path Total Distance (m)'] = r.fiberPathTotalDistanceMeters?.toFixed(0) ?? 'N/A';
      
      let offsetA = 'N/A', roadRoute = 'N/A', offsetB = 'N/A';
      if (r.fiberPathStatus === 'success' && r.fiberPathSegments) {
        const segA = r.fiberPathSegments.find(s => s.type === 'offset_a');
        const segRoadList = r.fiberPathSegments.filter(s => s.type === 'road_route');
        const totalRoadDistance = segRoadList.reduce((sum, s) => sum + s.distanceMeters, 0);
        const segB = r.fiberPathSegments.find(s => s.type === 'offset_b');
        
        offsetA = segA ? segA.distanceMeters.toFixed(0) : 'Error';
        roadRoute = totalRoadDistance > 0 ? totalRoadDistance.toFixed(0) : (segRoadList.length > 0 ? '0' : 'Error'); // If segments exist but total 0
        offsetB = segB ? segB.distanceMeters.toFixed(0) : 'Error';
      }
      baseData['Fiber Offset A (m)'] = offsetA;
      baseData['Fiber Road Route (m)'] = roadRoute;
      baseData['Fiber Offset B (m)'] = offsetB;
      baseData['Fiber Error/Remarks'] = r.fiberPathErrorMessage || '';
    }
    return baseData;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'LOS_Fiber_Results');
  
  // Auto-column widths
  if (worksheetData.length > 0) {
    const colWidths = Object.keys(worksheetData[0] || {}).map(key => ({
      wch: Math.max(String(key).length, ...worksheetData.map(row => String(row[key as keyof typeof row] ?? '').length)) + 2
    }));
    worksheet['!cols'] = colWidths;
  } else {
     // Default widths if no data, ensure fiber columns are accounted for if hasFiberData is true
     const defaultLOSCols = [
        { wch: 20 },{ wch: 25 },{ wch: 20 },{ wch: 20 },{ wch: 25 },{ wch: 20 },
        { wch: 25 },{ wch: 20 },{ wch: 15 },{ wch: 25 },{ wch: 30 },{ wch: 50 },
     ];
     const defaultFiberCols = hasFiberData ? [
        { wch: 30 },{ wch: 25 },{ wch: 20 },{ wch: 25 },{ wch: 20 },{ wch: 40 }
     ] : [];
     worksheet['!cols'] = [...defaultLOSCols, ...defaultFiberCols];
  }
  return workbook;
}

export function exportResultsToExcel(results: BulkAnalysisResultItem[], fileName: string = 'bulk_los_fiber_analysis_results.xlsx'): void {
  const workbook = createExcelWorkbook(results);
  XLSX.writeFile(workbook, fileName);
}


// KMZ Export for Feasible Links
function generateKmlContent(
    originalPlacemarks: KmzPlacemark[], 
    analysisResults: BulkAnalysisResultItem[], 
    analysisParams: { towerHeight: number; fresnelHeight: number }
  ): string {
  
  let kmlOriginalPlacemarks = '';
  originalPlacemarks.forEach(p => {
    kmlOriginalPlacemarks += `
      <Placemark>
        <name>${xmlEscape(p.name)}</name>
        <styleUrl>#placemarkIcon</styleUrl>
        <Point>
          <coordinates>${p.lng},${p.lat},0</coordinates>
        </Point>
      </Placemark>`;
  });

  let kmlFeasibleLosLinks = '';
  let kmlFiberPathGeometries = ''; // Separate folder for fiber path geometries

  analysisResults.forEach(link => {
    if (link.losPossible) {
      // LOS Feasible Link (Straight Line)
      let extendedDataContent = `
          <Data name="LOS Distance (km)"><value>${link.aerialDistanceKm.toFixed(2)}</value></Data>
          <Data name="Min Clearance (m)"><value>${link.minClearanceActual?.toFixed(1) ?? 'N/A'}</value></Data>
          <Data name="LOS Remarks"><value>${xmlEscape(link.remarks)}</value></Data>`;
      
      // Fiber Path Data if available
      if (link.fiberPathStatus) {
        extendedDataContent += `
          <Data name="Fiber Path Status"><value>${xmlEscape(formatFiberStatusForExport(link.fiberPathStatus))}</value></Data>`;
        if (link.fiberPathStatus === 'success') {
          extendedDataContent += `
          <Data name="Fiber Total Distance (m)"><value>${link.fiberPathTotalDistanceMeters?.toFixed(0) ?? 'N/A'}</value></Data>`;
          
          const offsetASeg = link.fiberPathSegments?.find(s => s.type === 'offset_a');
          const roadRouteSegs = link.fiberPathSegments?.filter(s => s.type === 'road_route') || [];
          const roadRouteDist = roadRouteSegs.reduce((sum,s) => sum + s.distanceMeters, 0);
          const offsetBSeg = link.fiberPathSegments?.find(s => s.type === 'offset_b');

          extendedDataContent += `
          <Data name="Fiber Offset A (m)"><value>${offsetASeg?.distanceMeters.toFixed(0) ?? 'N/A'}</value></Data>
          <Data name="Fiber Road Route (m)"><value>${roadRouteDist > 0 ? roadRouteDist.toFixed(0) : 'N/A'}</value></Data>
          <Data name="Fiber Offset B (m)"><value>${offsetBSeg?.distanceMeters.toFixed(0) ?? 'N/A'}</value></Data>
          <Data name="Encoded Road Polyline"><snippet maxLines="0">${xmlEscape(getRoadRouteEncodedPolyline(link.fiberPathSegments))}</snippet></Data>`;
          // Note: <snippet maxLines="0"> might be needed for long polylines in GE.

          // Add KML for Fiber Path Segments
          if (offsetASeg && link.pointA) { // Snapped point A is endPoint of offset_a
             kmlFiberPathGeometries += `
          <Placemark>
            <name>${xmlEscape(link.pointAName)} to Road (Offset A)</name>
            <styleUrl>#fiberOffsetStyle</styleUrl>
            <LineString><tessellate>1</tessellate><coordinates>${link.pointA.lng},${link.pointA.lat},0 ${offsetASeg.endPoint.lng},${offsetASeg.endPoint.lat},0</coordinates></LineString>
          </Placemark>`;
          }
          if (offsetBSeg && link.pointB) { // Snapped point B is startPoint of offset_b
            kmlFiberPathGeometries += `
          <Placemark>
            <name>Road to ${xmlEscape(link.pointBName)} (Offset B)</name>
            <styleUrl>#fiberOffsetStyle</styleUrl>
            <LineString><tessellate>1</tessellate><coordinates>${offsetBSeg.startPoint.lng},${offsetBSeg.startPoint.lat},0 ${link.pointB.lng},${link.pointB.lat},0</coordinates></LineString>
          </Placemark>`;
          }
          // Road Route (simplified straight line between snapped points)
          const snappedPointA = offsetASeg?.endPoint;
          const snappedPointB = offsetBSeg?.startPoint;
          if (snappedPointA && snappedPointB) {
            kmlFiberPathGeometries += `
          <Placemark>
            <name>Road Route (${xmlEscape(link.pointAName)} to ${xmlEscape(link.pointBName)}) - Simplified</name>
            <description>Actual road route polyline: ${xmlEscape(getRoadRouteEncodedPolyline(link.fiberPathSegments))}. Total road distance: ${roadRouteDist.toFixed(0)}m</description>
            <styleUrl>#fiberRoadStyle</styleUrl>
            <LineString><tessellate>1</tessellate><coordinates>${snappedPointA.lng},${snappedPointA.lat},0 ${snappedPointB.lng},${snappedPointB.lat},0</coordinates></LineString>
          </Placemark>`;
          }

        } else if (link.fiberPathErrorMessage) { // Fiber attempted but not successful
          extendedDataContent += `
          <Data name="Fiber Error/Remarks"><value>${xmlEscape(link.fiberPathErrorMessage)}</value></Data>`;
        }
      } else { // Fiber not calculated for this LOS link
         extendedDataContent += `
          <Data name="Fiber Path Status"><value>Not Calculated</value></Data>`;
      }
      
      kmlFeasibleLosLinks += `
      <Placemark>
        <name>${xmlEscape(link.pointAName)} to ${xmlEscape(link.pointBName)} (LOS)</name>
        <styleUrl>#feasibleLosLinkStyle</styleUrl>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>
            ${link.pointA.lng},${link.pointA.lat},${link.towerHeightUsed}
            ${link.pointB.lng},${link.pointB.lat},${link.towerHeightUsed}
          </coordinates>
        </LineString>
        <ExtendedData>${extendedDataContent}</ExtendedData>
      </Placemark>`;
    }
  });


  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>LOS and Fiber Path Analysis</name>
    <Style id="feasibleLosLinkStyle">
      <LineStyle><color>ff00ff00</color><width>3</width></LineStyle> <!-- Green for LOS -->
    </Style>
    <Style id="fiberOffsetStyle">
      <LineStyle><color>a000aaff</color><width>2.5</width></LineStyle> <!-- Orange/Yellow for Offset (A0 RRGGBB - a0 for some transparency) -->
    </Style>
    <Style id="fiberRoadStyle">
      <LineStyle><color>a0ffaa00</color><width>3.5</width></LineStyle> <!-- Cyan/Light Blue for Road Route (a0 for some transparency) -->
    </Style>
    <Style id="placemarkIcon">
      <IconStyle><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><scale>1.0</scale></IconStyle>
      <LabelStyle><scale>0.8</scale></LabelStyle>
    </Style>
    
    <Folder><name>Original Sites</name>${kmlOriginalPlacemarks}</Folder>
    
    <Folder><name>Feasible LOS Links (Tower: ${analysisParams.towerHeight}m, Fresnel: ${analysisParams.fresnelHeight}m)</name>
      ${kmlFeasibleLosLinks}
    </Folder>
    
    ${kmlFiberPathGeometries ? `<Folder><name>Fiber Path Geometries</name>${kmlFiberPathGeometries}</Folder>` : ''}
  </Document>
</kml>`;
}

function xmlEscape(str: string | undefined | null): string {
    if (str === undefined || str === null) return '';
    return String(str).replace(/[<>&"']/g, (match) => {
        switch (match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&apos;';
            default: return match;
        }
    });
}

export async function generateKmzBlob(
  originalPlacemarks: KmzPlacemark[],
  analysisResults: BulkAnalysisResultItem[], 
  analysisParams: { towerHeight: number; fresnelHeight: number }
): Promise<Blob> {
  try {
    const kmlString = generateKmlContent(originalPlacemarks, analysisResults, analysisParams);
    const zip = new JSZip();
    zip.file("doc.kml", kmlString);
    // Ensure mimeType is correctly set for KMZ
    return await zip.generateAsync({ type: "blob", mimeType: "application/vnd.google-earth.kmz+xml" });
  } catch (error) {
    console.error("Error generating KMZ blob:", error);
    throw new Error(`Failed to generate KMZ blob: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateAndDownloadFeasibleLinksKmz(
  originalPlacemarks: KmzPlacemark[],
  analysisResults: BulkAnalysisResultItem[], 
  analysisParams: { towerHeight: number; fresnelHeight: number },
  fileName: string = 'los_fiber_analysis.kmz'
): Promise<void> {
  const kmzBlob = await generateKmzBlob(originalPlacemarks, analysisResults, analysisParams);
  saveAs(kmzBlob, fileName);
}

export async function generateAndDownloadZipPackage(
  originalPlacemarks: KmzPlacemark[],
  bulkResults: BulkAnalysisResultItem[],
  analysisParams: { towerHeight: number; fresnelHeight: number },
  baseFileName: string = 'bulk_analysis_package'
): Promise<void> {
  try {
    const zip = new JSZip();

    const excelWorkbook = createExcelWorkbook(bulkResults);
    const excelBuffer = XLSX.write(excelWorkbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    zip.file(`${baseFileName}_results.xlsx`, excelBlob);

    // Check if there are any LOS feasible links or original placemarks before attempting KMZ generation
    const hasFeasibleLosLinks = bulkResults.some(r => r.losPossible);
    if (originalPlacemarks.length > 0 || hasFeasibleLosLinks) {
        const kmzBlob = await generateKmzBlob(originalPlacemarks, bulkResults, analysisParams);
        zip.file(`${baseFileName}_analysis.kmz`, kmzBlob);
    } else {
       // Add a note if no KMZ is generated due to lack of data
       zip.file('notes.txt', 'No original placemarks were provided and/or no LOS-feasible links were found, so no KMZ file was generated for visualization.');
    }
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${baseFileName}.zip`);

  } catch (error) {
    console.error("Error generating ZIP package:", error);
    throw new Error(`Failed to generate ZIP package: ${error instanceof Error ? error.message : String(error)}`);
  }
}
