'use client';

import type { SavedLink } from '@/types';
import { xmlEscape } from '@/lib/xml-escape';

// ─── Helpers ───────────────────────────────────────────

/**
 * Formats a Unix timestamp to a human-readable date string.
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Escapes a value for safe inclusion in a CSV cell.
 * Wraps in quotes and escapes internal quotes if the value contains
 * commas, quotes, or newlines.
 * @param value - The value to escape
 * @returns A CSV-safe string
 */
function csvEscape(value: string | number | boolean): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─── Shared Row Type ───────────────────────────────────

interface ExportRow {
  'Link Name': string;
  'Site A': string;
  'Site A Lat': number;
  'Site A Lng': number;
  'Site A Tower (m)': number;
  'Site B': string;
  'Site B Lat': number;
  'Site B Lng': number;
  'Site B Tower (m)': number;
  'Distance (km)': number;
  'LOS Feasible': string;
  'Min Clearance (m)': string;
  'Threshold (m)': number;
  'Height Deficit (m)': string;
  'Fiber Status': string;
  'Fiber Distance (m)': string;
  'Device': string;
  'Date': string;
}

/**
 * Converts an array of SavedLink objects into flat export rows.
 * Includes device information if a selectedDeviceId is present.
 * @param links - Array of saved links to convert
 * @returns Array of flat export row objects
 */
function linksToRows(links: SavedLink[]): ExportRow[] {
  return links.map(link => {
    const mc = link.analysisResult.minClearance;
    const deficit =
      mc !== null && mc < link.clearanceThreshold
        ? Math.ceil(link.clearanceThreshold - mc)
        : 0;

    // Device info from analysis result or saved link
    const deviceName =
      link.analysisResult.deviceCompatibility?.selectedDevice?.deviceName ??
      (link.selectedDeviceId || 'N/A');

    return {
      'Link Name': link.name,
      'Site A': link.pointA.name,
      'Site A Lat': parseFloat(link.pointA.lat.toFixed(6)),
      'Site A Lng': parseFloat(link.pointA.lng.toFixed(6)),
      'Site A Tower (m)': link.pointA.towerHeight,
      'Site B': link.pointB.name,
      'Site B Lat': parseFloat(link.pointB.lat.toFixed(6)),
      'Site B Lng': parseFloat(link.pointB.lng.toFixed(6)),
      'Site B Tower (m)': link.pointB.towerHeight,
      'Distance (km)': parseFloat(link.analysisResult.distanceKm.toFixed(2)),
      'LOS Feasible': link.analysisResult.losPossible ? 'Yes' : 'No',
      'Min Clearance (m)': mc !== null ? mc.toFixed(1) : 'N/A',
      'Threshold (m)': link.clearanceThreshold,
      'Height Deficit (m)': deficit > 0 ? String(deficit) : '0',
      'Fiber Status':
        link.fiberPathResult?.status === 'success'
          ? 'Calculated'
          : link.fiberPathResult?.status
            ? link.fiberPathResult.status
            : 'N/A',
      'Fiber Distance (m)':
        link.fiberPathResult?.status === 'success' && link.fiberPathResult.totalDistanceMeters
          ? link.fiberPathResult.totalDistanceMeters.toFixed(0)
          : 'N/A',
      'Device': deviceName,
      'Date': formatDate(link.createdAt),
    };
  });
}

// ─── KMZ Export ────────────────────────────────────────

/**
 * Builds a KML document string from saved links, including site placemarks
 * and LOS link lines with color coding (green = feasible, red = blocked).
 * @param links - Array of saved links
 * @returns A KML XML string
 */
function buildKml(links: SavedLink[]): string {
  const COLOR_GREEN = 'ff00cc00';
  const COLOR_RED = 'ff0000ff';
  const COLOR_WHITE = 'ffffffff';

  const siteSet = new Map<string, { name: string; lat: number; lng: number; towerHeight: number }>();
  let linkPlacemarks = '';

  links.forEach(link => {
    const keyA = `${link.pointA.lat.toFixed(6)},${link.pointA.lng.toFixed(6)}`;
    const keyB = `${link.pointB.lat.toFixed(6)},${link.pointB.lng.toFixed(6)}`;
    if (!siteSet.has(keyA)) siteSet.set(keyA, link.pointA);
    if (!siteSet.has(keyB)) siteSet.set(keyB, link.pointB);

    const color = link.analysisResult.losPossible ? COLOR_GREEN : COLOR_RED;
    const status = link.analysisResult.losPossible ? 'Feasible' : 'Blocked';
    const dist = link.analysisResult.distanceKm.toFixed(2);
    const clearance =
      link.analysisResult.minClearance !== null
        ? `${link.analysisResult.minClearance.toFixed(1)}m`
        : 'N/A';
    const fiberInfo =
      link.fiberPathResult?.status === 'success' && link.fiberPathResult.totalDistanceMeters
        ? `<b>Fiber:</b> ${(link.fiberPathResult.totalDistanceMeters / 1000).toFixed(2)} km<br/>`
        : '';
    const deviceInfo = link.selectedDeviceId
      ? `<b>Device:</b> ${xmlEscape(link.analysisResult.deviceCompatibility?.selectedDevice?.deviceName ?? link.selectedDeviceId)}<br/>`
      : '';

    linkPlacemarks += `
    <Placemark>
      <name>${xmlEscape(link.name)}</name>
      <description><![CDATA[
        <b>LOS:</b> ${status}<br/>
        <b>Distance:</b> ${dist} km<br/>
        <b>Clearance:</b> ${clearance}<br/>
        <b>Tower A:</b> ${link.pointA.towerHeight}m | <b>Tower B:</b> ${link.pointB.towerHeight}m<br/>
        ${fiberInfo}${deviceInfo}
        <b>Analyzed:</b> ${formatDate(link.createdAt)}
      ]]></description>
      <Style>
        <LineStyle><color>${color}</color><width>3</width></LineStyle>
      </Style>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${link.pointA.lng},${link.pointA.lat},0 ${link.pointB.lng},${link.pointB.lat},0</coordinates>
      </LineString>
    </Placemark>`;
  });

  let sitePlacemarks = '';
  siteSet.forEach(site => {
    sitePlacemarks += `
    <Placemark>
      <name>${xmlEscape(site.name)}</name>
      <description><![CDATA[
        <b>Coordinates:</b> ${site.lat.toFixed(6)}, ${site.lng.toFixed(6)}<br/>
        <b>Tower Height:</b> ${site.towerHeight}m
      ]]></description>
      <Style>
        <IconStyle><color>${COLOR_WHITE}</color><scale>1.0</scale>
          <Icon><href>http://maps.google.com/mapfiles/kml/paddle/wht-blank.png</href></Icon>
        </IconStyle>
      </Style>
      <Point><coordinates>${site.lng},${site.lat},0</coordinates></Point>
    </Placemark>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>FindLOS — Saved Links Export</name>
    <description>Exported ${links.length} link(s) from FindLOS</description>
    <Folder><name>Sites</name>${sitePlacemarks}</Folder>
    <Folder><name>LOS Links</name>${linkPlacemarks}</Folder>
  </Document>
</kml>`;
}

/**
 * Exports saved links as a KMZ file and triggers a browser download.
 *
 * @param links - Array of saved links to export
 *
 * @example
 * await exportSavedLinksAsKmz(selectedLinks);
 */
export async function exportSavedLinksAsKmz(links: SavedLink[]): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const { saveAs } = await import('file-saver');
  const kml = buildKml(links);
  const zip = new JSZip();
  zip.file('doc.kml', kml);
  const blob = await zip.generateAsync({ type: 'blob' });
  const ts = new Date().toISOString().slice(0, 10);
  saveAs(blob, `findlos_links_${ts}.kmz`);
}

/**
 * Exports saved links as an Excel (.xlsx) file and triggers a browser download.
 *
 * @param links - Array of saved links to export
 *
 * @example
 * await exportSavedLinksAsExcel(selectedLinks);
 */
export async function exportSavedLinksAsExcel(links: SavedLink[]): Promise<void> {
  const XLSX = await import('xlsx');
  const { saveAs } = await import('file-saver');
  const rows = linksToRows(links);
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 25 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 20 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Saved Links');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const ts = new Date().toISOString().slice(0, 10);
  saveAs(blob, `findlos_links_${ts}.xlsx`);
}

/**
 * Exports saved links as a CSV file and triggers a browser download.
 * Handles empty data gracefully (no download triggered).
 *
 * @param links - Array of saved links to export
 *
 * @example
 * await exportSavedLinksAsCsv(selectedLinks);
 */
export async function exportSavedLinksAsCsv(links: SavedLink[]): Promise<void> {
  const { saveAs } = await import('file-saver');
  const rows = linksToRows(links);
  if (!rows.length) return;
  const headers = Object.keys(rows[0]) as (keyof ExportRow)[];
  let csv = headers.map(h => csvEscape(h)).join(',') + '\n';
  for (const row of rows) {
    csv += headers.map(h => csvEscape(row[h])).join(',') + '\n';
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const ts = new Date().toISOString().slice(0, 10);
  saveAs(blob, `findlos_links_${ts}.csv`);
}