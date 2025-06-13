
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver'; // For robust downloads
import type { BulkAnalysisResultItem } from '@/app/bulk-los-analyzer/page';
import type { KmzPlacemark } from './kmz-parser';

// Excel Export
export function exportResultsToExcel(results: BulkAnalysisResultItem[], fileName: string = 'bulk_los_analysis.xlsx'): void {
  const worksheetData = results.map(r => ({
    'Point A Name': r.pointAName,
    'Point A Coordinates': r.pointACoords,
    'Tower Height A (m)': r.towerHeightUsed, // Assuming global tower height for A
    'Point B Name': r.pointBName,
    'Point B Coordinates': r.pointBCoords,
    'Tower Height B (m)': r.towerHeightUsed, // Assuming global tower height for B
    'Fresnel/Clearance Height (m)': r.fresnelHeightUsed,
    'Aerial Distance (km)': r.aerialDistanceKm,
    'LOS Possible': r.losPossible ? 'Yes' : 'No',
    'Actual Min Clearance (m)': r.minClearanceActual?.toFixed(1) ?? 'N/A',
    'Additional Height Needed (m)': r.additionalHeightNeeded?.toFixed(1) ?? 'N/A',
    'Remarks': r.remarks,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'LOS Results');
  
  // Auto-size columns (basic attempt)
  const colWidths = Object.keys(worksheetData[0] || {}).map(key => ({
    wch: Math.max(key.length, ...worksheetData.map(row => String(row[key as keyof typeof row] ?? '').length)) + 2
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
}


// KMZ Export for Feasible Links
function generateKmlContent(
    originalPlacemarks: KmzPlacemark[], 
    feasibleLinks: BulkAnalysisResultItem[],
    analysisParams: { towerHeight: number; fresnelHeight: number }
  ): string {
  
  let kmlPlacemarks = '';
  originalPlacemarks.forEach(p => {
    kmlPlacemarks += `
      <Placemark>
        <name>${xmlEscape(p.name)}</name>
        <styleUrl>#placemarkIcon</styleUrl>
        <Point>
          <coordinates>${p.lng},${p.lat},0</coordinates>
        </Point>
      </Placemark>`;
  });

  let kmlFeasibleLinks = '';
  feasibleLinks.forEach(link => {
    kmlFeasibleLinks += `
      <Placemark>
        <name>${xmlEscape(link.pointAName)} to ${xmlEscape(link.pointBName)}</name>
        <styleUrl>#feasibleLinkStyle</styleUrl>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>
            ${link.pointA.lng},${link.pointA.lat},${link.towerHeightUsed}
            ${link.pointB.lng},${link.pointB.lat},${link.towerHeightUsed}
          </coordinates>
        </LineString>
        <ExtendedData>
          <Data name="Distance (km)"><value>${link.aerialDistanceKm.toFixed(2)}</value></Data>
          <Data name="Min Clearance (m)"><value>${link.minClearanceActual?.toFixed(1) ?? 'N/A'}</value></Data>
          <Data name="Remarks"><value>${xmlEscape(link.remarks)}</value></Data>
        </ExtendedData>
      </Placemark>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Feasible LOS Links</name>
    <Style id="feasibleLinkStyle">
      <LineStyle>
        <color>ff00ff00</color> <!-- AABBGGRR (Green) -->
        <width>3</width>
      </LineStyle>
    </Style>
    <Style id="placemarkIcon">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png</href>
        </Icon>
        <scale>1.0</scale>
      </IconStyle>
      <LabelStyle>
        <scale>0.8</scale>
      </LabelStyle>
    </Style>
    
    <Folder>
      <name>Original Sites</name>
      ${kmlPlacemarks}
    </Folder>
    
    <Folder>
      <name>Feasible Links</name>
      ${kmlFeasibleLinks}
    </Folder>
  </Document>
</kml>`;
}

function xmlEscape(str: string): string {
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

export async function generateAndDownloadFeasibleLinksKmz(
  originalPlacemarks: KmzPlacemark[],
  feasibleLinks: BulkAnalysisResultItem[],
  analysisParams: { towerHeight: number; fresnelHeight: number },
  fileName: string = 'feasible_links.kmz'
): Promise<void> {
  try {
    const kmlString = generateKmlContent(originalPlacemarks, feasibleLinks, analysisParams);
    
    const zip = new JSZip();
    zip.file("doc.kml", kmlString); // Standard name for KML file in KMZ

    const kmzBlob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.google-earth.kmz" });
    
    saveAs(kmzBlob, fileName);

  } catch (error) {
    console.error("Error generating or downloading KMZ file:", error);
    throw new Error(`Failed to generate KMZ: ${error instanceof Error ? error.message : String(error)}`);
  }
}
