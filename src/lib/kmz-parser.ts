import JSZip from 'jszip';

export interface KmzPlacemark {
  name: string;
  lat: number;
  lng: number;
  altitude?: number;
}

/**
 * Parses a KMZ (or KML-inside-ZIP) file and extracts all Placemarks that have
 * Point geometry with valid coordinates.
 *
 * Handles:
 * - Finding the .kml file within the ZIP archive
 * - XML parsing with error detection
 * - Coordinate validation (skips invalid placemarks with a warning)
 * - Large files (streams via JSZip)
 *
 * @param file - A File object representing the KMZ file
 * @returns A Promise resolving to an array of extracted placemarks
 * @throws Error if the file cannot be processed or contains no valid KML
 *
 * @example
 * const placemarks = await parseKmzFile(fileInput.files[0]);
 * console.log(`Found ${placemarks.length} sites`);
 */
export async function parseKmzFile(file: File): Promise<KmzPlacemark[]> {
  const placemarks: KmzPlacemark[] = [];

  try {
    const zip = await JSZip.loadAsync(file);
    let kmlContent: string | null = null;

    // Find the KML file within the KMZ (usually doc.kml or *.kml)
    const kmlFileObject = Object.values(zip.files).find(
      zipEntry => !zipEntry.dir && zipEntry.name.toLowerCase().endsWith('.kml')
    );

    if (!kmlFileObject) {
      throw new Error('No .kml file found within the KMZ archive.');
    }

    kmlContent = await kmlFileObject.async('string');

    if (!kmlContent) {
      throw new Error(`Could not read content of ${kmlFileObject.name}.`);
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'application/xml');

    // Check for parser errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      const errorText = parserError[0].textContent || 'Unknown parsing error';
      console.error('KML Parser Error:', errorText);
      throw new Error(`Error parsing KML content: ${errorText}`);
    }

    const placemarkElements = xmlDoc.getElementsByTagName('Placemark');

    for (let i = 0; i < placemarkElements.length; i++) {
      const placemarkElement = placemarkElements[i];
      const nameElement = placemarkElement.getElementsByTagName('name')[0];
      const pointElement = placemarkElement.getElementsByTagName('Point')[0];

      if (nameElement && pointElement) {
        const name = nameElement.textContent?.trim() || `Placemark ${i + 1}`;
        const coordinatesElement = pointElement.getElementsByTagName('coordinates')[0];

        if (coordinatesElement) {
          const coordsText = coordinatesElement.textContent?.trim();
          if (coordsText) {
            const parts = coordsText.split(',');
            if (parts.length >= 2) {
              const lng = parseFloat(parts[0]);
              const lat = parseFloat(parts[1]);
              const altitude = parts.length >= 3 ? parseFloat(parts[2]) : undefined;

              if (
                !isNaN(lat) && !isNaN(lng) &&
                lat >= -90 && lat <= 90 &&
                lng >= -180 && lng <= 180
              ) {
                placemarks.push({
                  name,
                  lat,
                  lng,
                  altitude: altitude !== undefined && !isNaN(altitude) ? altitude : undefined,
                });
              } else {
                console.warn(
                  `Skipping placemark "${name}" due to out-of-range coordinates: lat=${lat}, lng=${lng}`
                );
              }
            }
          }
        }
      }
    }

    if (placemarks.length === 0) {
      console.warn('No valid placemarks with Point coordinates found in the KML.');
    }
  } catch (error) {
    console.error('Error processing KMZ file:', error);
    throw new Error(
      `Failed to process KMZ file: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return placemarks;
}