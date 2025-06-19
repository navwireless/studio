
import * as XLSX from 'xlsx';
import type { WorkBook } from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'; // For robust downloads
import type { BulkAnalysisResultItem } from '@/app/bulk-los-analyzer/page';
import type { KmzPlacemark } from './kmz-parser';
import type { FiberPathSegment, FiberPathResult } from '@/tools/fiberPathCalculator';
import { xmlEscape } from './xml-escape';
import { decodePolyline, formatCoordinatesForKml } from './polyline-decoder';


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
        roadRoute = totalRoadDistance > 0 ? totalRoadDistance.toFixed(0) : (segRoadList.length > 0 ? '0' : 'Error');
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
  
  if (worksheetData.length > 0 && Object.keys(worksheetData[0]).length > 0) {
    const colWidths = Object.keys(worksheetData[0]).map(key => ({
      wch: Math.max(String(key).length, ...worksheetData.map(row => String(row[key as keyof typeof row] ?? '').length)) + 2
    }));
    worksheet['!cols'] = colWidths;
  } else {
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


// KMZ Export for Bulk Analysis (includes LOS links and fiber paths for feasible ones)
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
  let kmlFiberPathGeometries = ''; // For separate folder of detailed fiber paths

  analysisResults.forEach(link => {
    if (link.losPossible) {
      // LOS Feasible Link (Straight Line)
      let extendedDataContent = `
          <Data name="LOS Distance (km)"><value>${link.aerialDistanceKm.toFixed(2)}</value></Data>
          <Data name="Min Clearance (m)"><value>${link.minClearanceActual?.toFixed(1) ?? 'N/A'}</value></Data>
          <Data name="Tower Height (m)"><value>${link.towerHeightUsed}</value></Data>
          <Data name="Fresnel Height (m)"><value>${link.fresnelHeightUsed}</value></Data>
          <Data name="LOS Remarks"><value>${xmlEscape(link.remarks)}</value></Data>`;
      
      // Fiber Path Data if available and successful
      if (link.fiberPathStatus === 'success' && link.fiberPathSegments && link.pointA_snappedToRoad && link.pointB_snappedToRoad) {
        extendedDataContent += `
          <Data name="Fiber Path Status"><value>${xmlEscape(formatFiberStatusForExport(link.fiberPathStatus))}</value></Data>
          <Data name="Fiber Total Distance (m)"><value>${link.fiberPathTotalDistanceMeters?.toFixed(0) ?? 'N/A'}</value></Data>`;
        
        // Create placemarks for each fiber segment (offset_a, road_route, offset_b)
        link.fiberPathSegments.forEach((segment, index) => {
          let segmentName = `Fiber Segment ${index + 1} (${segment.type})`;
          let styleUrl = '';
          let coordinatesString = '';
          let segmentDescription = `Type: ${xmlEscape(segment.type)}\nDistance: ${segment.distanceMeters.toFixed(1)} m`;

          switch(segment.type) {
            case 'offset_a':
              segmentName = `Offset A: ${xmlEscape(link.pointAName)} to Road`;
              styleUrl = '#fiberOffsetStyle';
              coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
              break;
            case 'offset_b':
              segmentName = `Offset B: Road to ${xmlEscape(link.pointBName)}`;
              styleUrl = '#fiberOffsetStyle';
              coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
              break;
            case 'road_route':
              segmentName = `Road Route: ${xmlEscape(link.pointAName)} to ${xmlEscape(link.pointBName)} (Segment ${index})`;
              styleUrl = '#fiberRoadStyle';
              if (segment.pathPolyline) {
                const decodedCoords = decodePolyline(segment.pathPolyline);
                coordinatesString = formatCoordinatesForKml(decodedCoords);
                segmentDescription += `\nEncoded Polyline (for reference): ${xmlEscape(segment.pathPolyline)}`;
              } else {
                // Fallback: straight line for road route if polyline is missing
                console.warn("KMZ Gen (Bulk): Road_route segment missing pathPolyline. Drawing straight line.");
                coordinatesString = `${segment.startPoint.lng},${segment.startPoint.lat},0 ${segment.endPoint.lng},${segment.endPoint.lat},0`;
                segmentDescription += "\nNote: Polyline missing, showing straight line.";
              }
              break;
          }
          if (coordinatesString) {
             kmlFiberPathGeometries += `
            <Placemark>
              <name>${xmlEscape(segmentName)}</name>
              <styleUrl>${styleUrl}</styleUrl>
              <description>${xmlEscape(segmentDescription)}</description>
              <LineString><tessellate>1</tessellate><coordinates>${coordinatesString}</coordinates></LineString>
            </Placemark>`;
          }
        });

      } else if (link.fiberPathStatus) { // Fiber attempted but not successful
        extendedDataContent += `
          <Data name="Fiber Path Status"><value>${xmlEscape(formatFiberStatusForExport(link.fiberPathStatus))}</value></Data>
          <Data name="Fiber Error/Remarks"><value>${xmlEscape(link.fiberPathErrorMessage || 'N/A')}</value></Data>`;
      } else { // Fiber not calculated
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
      <LineStyle><color>a000aaff</color><width>2.5</width></LineStyle> <!-- Orange/Yellow for Offset -->
    </Style>
    <Style id="fiberRoadStyle">
      <LineStyle><color>a0ffaa00</color><width>3.5</width></LineStyle> <!-- Cyan/Light Blue for Road Route -->
    </Style>
    <Style id="placemarkIcon">
      <IconStyle><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><scale>1.0</scale></IconStyle>
      <LabelStyle><scale>0.8</scale></LabelStyle>
    </Style>
    
    <Folder><name>Original Sites</name>${kmlOriginalPlacemarks}</Folder>
    
    <Folder><name>Feasible LOS Links (Tower: ${analysisParams.towerHeight}m, Fresnel: ${analysisParams.fresnelHeight}m)</name>
      ${kmlFeasibleLosLinks}
    </Folder>
    
    ${kmlFiberPathGeometries ? `<Folder><name>Fiber Path Geometries (Detailed)</name>${kmlFiberPathGeometries}</Folder>` : ''}
  </Document>
</kml>`;
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

    const hasFeasibleLosLinks = bulkResults.some(r => r.losPossible);
    // Ensure there are results or placemarks to justify KMZ generation
    if (bulkResults.length > 0 || originalPlacemarks.length > 0) {
        const kmzBlob = await generateKmzBlob(originalPlacemarks, bulkResults, analysisParams);
        zip.file(`${baseFileName}_analysis.kmz`, kmzBlob);
    } else {
       zip.file('notes.txt', 'No original placemarks were provided and/or no analysis results were generated, so no KMZ file was created for visualization.');
    }
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${baseFileName}.zip`);

  } catch (error) {
    console.error("Error generating ZIP package:", error);
    throw new Error(`Failed to generate ZIP package: ${error instanceof Error ? error.message : String(error)}`);
  }
}

