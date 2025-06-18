
import * as XLSX from 'xlsx';
import type { WorkBook } from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'; // For robust downloads
import type { BulkAnalysisResultItem } from '@/app/bulk-los-analyzer/page';
import type { KmzPlacemark } from './kmz-parser';
import type { FiberPathSegment } from '@/tools/fiberPathCalculator';

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
      baseData['Fiber Path Status'] = r.fiberPathStatus ? r.fiberPathStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : (r.losPossible ? 'Not Calculated' : 'N/A (LOS Blocked)');
      baseData['Fiber Path Total Distance (m)'] = r.fiberPathTotalDistanceMeters?.toFixed(0) ?? (r.losPossible && r.fiberPathStatus ? 'N/A' : '');
      
      let offsetA = 'N/A', roadRoute = 'N/A', offsetB = 'N/A';
      if (r.fiberPathStatus === 'success' && r.fiberPathSegments) {
        const segA = r.fiberPathSegments.find(s => s.type === 'offset_a');
        const segRoad = r.fiberPathSegments.filter(s => s.type === 'road_route').reduce((sum, s) => sum + s.distanceMeters, 0);
        const segB = r.fiberPathSegments.find(s => s.type === 'offset_b');
        offsetA = segA ? segA.distanceMeters.toFixed(0) : 'Error';
        roadRoute = segRoad > 0 ? segRoad.toFixed(0) : 'Error';
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
  
  if (worksheetData.length > 0) {
    const colWidths = Object.keys(worksheetData[0] || {}).map(key => ({
      wch: Math.max(String(key).length, ...worksheetData.map(row => String(row[key as keyof typeof row] ?? '').length)) + 2
    }));
    worksheet['!cols'] = colWidths;
  } else {
     worksheet['!cols'] = [ // Default widths if no data
        { wch: 20 },{ wch: 25 },{ wch: 20 },{ wch: 20 },{ wch: 25 },{ wch: 20 },
        { wch: 25 },{ wch: 20 },{ wch: 15 },{ wch: 25 },{ wch: 30 },{ wch: 50 },
        // Fiber columns if applicable
        { wch: 25 },{ wch: 25 },{ wch: 20 },{ wch: 25 },{ wch: 20 },{ wch: 40 }
     ];
  }
  return workbook;
}

export function exportResultsToExcel(results: BulkAnalysisResultItem[], fileName: string = 'bulk_los_fiber_analysis_results.xlsx'): void {
  const workbook = createExcelWorkbook(results);
  XLSX.writeFile(workbook, fileName);
}

// Helper function to get the encoded polyline for the road route segment
function getRoadRouteEncodedPolyline(segments?: FiberPathSegment[]): string {
    if (!segments) return "";
    // Assuming road_route segments might be multiple if Google API returns it that way.
    // For simplicity, concatenating polylines. This might not be ideal if they are not continuous.
    // A better approach would be if the `calculator.ts` provided a single overview polyline for the entire road portion.
    // For now, let's assume the first road_route segment's polyline is representative or the only one.
    const roadSegment = segments.find(s => s.type === 'road_route');
    return roadSegment?.pathPolyline || "";
}


// KMZ Export for Feasible Links
function generateKmlContent(
    originalPlacemarks: KmzPlacemark[], 
    analysisResults: BulkAnalysisResultItem[], // All results, will filter inside
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
  let kmlFiberPaths = '';

  analysisResults.forEach(link => {
    if (link.losPossible) {
      // LOS Feasible Link (Straight Line)
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
        <ExtendedData>
          <Data name="LOS Distance (km)"><value>${link.aerialDistanceKm.toFixed(2)}</value></Data>
          <Data name="Min Clearance (m)"><value>${link.minClearanceActual?.toFixed(1) ?? 'N/A'}</value></Data>
          <Data name="LOS Remarks"><value>${xmlEscape(link.remarks)}</value></Data>`;
      
      // Fiber Path Data if available and successful
      if (link.fiberPathStatus === 'success' && link.fiberPathSegments && link.pointA && link.pointB) {
         kmlFeasibleLosLinks += `
          <Data name="Fiber Path Status"><value>Success</value></Data>
          <Data name="Fiber Total Distance (m)"><value>${link.fiberPathTotalDistanceMeters?.toFixed(0) ?? 'N/A'}</value></Data>
          <Data name="Fiber Offset A (m)"><value>${link.fiberPathSegments.find(s=>s.type === 'offset_a')?.distanceMeters.toFixed(0) ?? 'N/A'}</value></Data>
          <Data name="Fiber Road Route (m)"><value>${link.fiberPathSegments.filter(s=>s.type === 'road_route').reduce((sum,s)=>sum+s.distanceMeters,0).toFixed(0) ?? 'N/A'}</value></Data>
          <Data name="Fiber Offset B (m)"><value>${link.fiberPathSegments.find(s=>s.type === 'offset_b')?.distanceMeters.toFixed(0) ?? 'N/A'}</value></Data>
          <Data name="Encoded Road Polyline"><value>${xmlEscape(getRoadRouteEncodedPolyline(link.fiberPathSegments))}</value></Data>
        </ExtendedData>
      </Placemark>`; // Close Placemark for LOS link

        // Add KML for Fiber Path Segments (Offset A, Road Route (simplified), Offset B)
        const offsetASegment = link.fiberPathSegments.find(s => s.type === 'offset_a');
        const offsetBSegment = link.fiberPathSegments.find(s => s.type === 'offset_b');
        // Snapped points would be end of offset_a and start of offset_b
        const snappedPointA = offsetASegment?.endPoint;
        const snappedPointB = offsetBSegment?.startPoint;

        if (offsetASegment && snappedPointA) {
             kmlFiberPaths += `
          <Placemark>
            <name>${xmlEscape(link.pointAName)} to Road (Offset A)</name>
            <styleUrl>#fiberOffsetStyle</styleUrl>
            <LineString><tessellate>1</tessellate><coordinates>${offsetASegment.startPoint.lng},${offsetASegment.startPoint.lat},0 ${snappedPointA.lng},${snappedPointA.lat},0</coordinates></LineString>
          </Placemark>`;
        }
        if (offsetBSegment && snappedPointB) {
            kmlFiberPaths += `
          <Placemark>
            <name>Road to ${xmlEscape(link.pointBName)} (Offset B)</name>
            <styleUrl>#fiberOffsetStyle</styleUrl>
            <LineString><tessellate>1</tessellate><coordinates>${snappedPointB.lng},${snappedPointB.lat},0 ${offsetBSegment.endPoint.lng},${offsetBSegment.endPoint.lat},0</coordinates></LineString>
          </Placemark>`;
        }
        if (snappedPointA && snappedPointB) {
            kmlFiberPaths += `
          <Placemark>
            <name>Road Route (${xmlEscape(link.pointAName)} to ${xmlEscape(link.pointBName)})</name>
            <styleUrl>#fiberRoadStyle</styleUrl>
            <description>Encoded Polyline: ${xmlEscape(getRoadRouteEncodedPolyline(link.fiberPathSegments))}</description>
            <LineString><tessellate>1</tessellate><coordinates>${snappedPointA.lng},${snappedPointA.lat},0 ${snappedPointB.lng},${snappedPointB.lat},0</coordinates></LineString>
          </Placemark>`;
        }
      } else if (link.fiberPathStatus) { // Fiber attempted but not successful, or LOS not feasible for fiber part
        kmlFeasibleLosLinks += `
          <Data name="Fiber Path Status"><value>${xmlEscape(link.fiberPathStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</value></Data>
          <Data name="Fiber Error/Remarks"><value>${xmlEscape(link.fiberPathErrorMessage || 'N/A')}</value></Data>
        </ExtendedData>
      </Placemark>`; // Close Placemark for LOS link
      } else {
         kmlFeasibleLosLinks += `
          <Data name="Fiber Path Status"><value>Not Calculated</value></Data>
        </ExtendedData>
      </Placemark>`; // Close Placemark for LOS link
      }
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
      <LineStyle><color>ff00aaff</color><width>2.5</width></LineStyle> <!-- AA BB GG RR - Yellow/Orange for Offset -->
    </Style>
    <Style id="fiberRoadStyle">
      <LineStyle><color>ffffaa00</color><width>3.5</width></LineStyle> <!-- Cyan/Light Blue for Road Route -->
    </Style>
    <Style id="placemarkIcon">
      <IconStyle><Icon><href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href></Icon><scale>1.0</scale></IconStyle>
      <LabelStyle><scale>0.8</scale></LabelStyle>
    </Style>
    
    <Folder><name>Original Sites</name>${kmlOriginalPlacemarks}</Folder>
    
    <Folder><name>Feasible LOS Links (Tower: ${analysisParams.towerHeight}m, Fresnel: ${analysisParams.fresnelHeight}m)</name>
      ${kmlFeasibleLosLinks}
    </Folder>
    
    ${kmlFiberPaths ? `<Folder><name>Fiber Path Segments</name>${kmlFiberPaths}</Folder>` : ''}
  </Document>
</kml>`;
}

function xmlEscape(str: string | undefined): string {
    if (str === undefined || str === null) return '';
    return str.replace(/[<>&"']/g, (match) => {
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
  analysisResults: BulkAnalysisResultItem[], // Changed from feasibleLinks to all results
  analysisParams: { towerHeight: number; fresnelHeight: number }
): Promise<Blob> {
  try {
    const kmlString = generateKmlContent(originalPlacemarks, analysisResults, analysisParams);
    const zip = new JSZip();
    zip.file("doc.kml", kmlString);
    return await zip.generateAsync({ type: "blob", mimeType: "application/vnd.google-earth.kmz" });
  } catch (error) {
    console.error("Error generating KMZ blob:", error);
    throw new Error(`Failed to generate KMZ blob: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateAndDownloadFeasibleLinksKmz(
  originalPlacemarks: KmzPlacemark[],
  analysisResults: BulkAnalysisResultItem[], // Changed from feasibleLinks to all results
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

    if (originalPlacemarks.length > 0 || bulkResults.filter(r => r.losPossible).length > 0) {
        const kmzBlob = await generateKmzBlob(originalPlacemarks, bulkResults, analysisParams);
        zip.file(`${baseFileName}_analysis.kmz`, kmzBlob);
    } else {
       zip.file('no_links_or_placemarks.txt', 'No placemarks uploaded or no feasible links found to generate KMZ.');
    }
    
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${baseFileName}.zip`);

  } catch (error) {
    console.error("Error generating ZIP package:", error);
    throw new Error(`Failed to generate ZIP package: ${error instanceof Error ? error.message : String(error)}`);
  }
}
