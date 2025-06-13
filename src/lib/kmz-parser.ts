
import JSZip from 'jszip';

export interface KmzPlacemark {
  name: string;
  lat: number;
  lng: number;
  altitude?: number; // Optional altitude
}

export async function parseKmzFile(file: File): Promise<KmzPlacemark[]> {
  const placemarks: KmzPlacemark[] = [];
  
  try {
    const zip = await JSZip.loadAsync(file);
    let kmlContent: string | null = null;

    // Find the KML file within the KMZ (usually doc.kml or *.kml)
    const kmlFileObject = Object.values(zip.files).find(
      (zipEntry) => !zipEntry.dir && (zipEntry.name.toLowerCase().endsWith('.kml'))
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
    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        console.error("KML Parser Error:", parserError[0].textContent);
        throw new Error(`Error parsing KML content: ${parserError[0].textContent || 'Unknown parsing error'}`);
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

              if (!isNaN(lat) && !isNaN(lng)) {
                placemarks.push({ name, lat, lng, altitude });
              } else {
                console.warn(`Skipping placemark "${name}" due to invalid coordinates: ${coordsText}`);
              }
            }
          }
        }
      }
    }

    if (placemarks.length === 0) {
        console.warn("No valid placemarks with Point coordinates found in the KML.");
        // Depending on requirements, could throw error or return empty array.
        // For now, returning empty array and letting UI handle "not enough points".
    }

  } catch (error) {
    console.error('Error processing KMZ file:', error);
    throw new Error(`Failed to process KMZ file: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return placemarks;
}
