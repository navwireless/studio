
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Loader2, MapPin } from 'lucide-react';
import type { KmzPlacemark } from '@/lib/kmz-parser';
import type { BulkAnalysisResultItem } from '@/app/bulk-los-analyzer/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center
const defaultZoom = 4;

interface BulkAnalysisMapProps {
  placemarks: KmzPlacemark[];
  results: BulkAnalysisResultItem[];
}

const BulkAnalysisMap: React.FC<BulkAnalysisMapProps> = ({ placemarks, results }) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isMapInstanceLoaded, setIsMapInstanceLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<KmzPlacemark | null>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_JS_API_KEY_HERE") {
      setMapLoadError("Google Maps API key is not configured for Bulk Analysis Map.");
      console.error("Google Maps API key is missing or is a placeholder for Bulk Analysis Map.");
    }
  }, []);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    if (window.google && window.google.maps) {
      map.setMapTypeId(google.maps.MapTypeId.HYBRID); // Hybrid for better terrain view
      map.setOptions({
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
        clickableIcons: false,
      });
    }
    setIsMapInstanceLoaded(true);
  }, []);

  useEffect(() => {
    if (isMapInstanceLoaded && mapRef.current && placemarks.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      placemarks.forEach(p => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, 50); // Add some padding
         const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
          if (mapRef.current?.getZoom() && mapRef.current.getZoom()! > 16) { // Don't zoom in too much
            mapRef.current.setZoom(16);
          }
        });
        return () => {
           if (listener && window.google && window.google.maps) { 
              window.google.maps.event.removeListener(listener);
           }
         };
      }
    } else if (isMapInstanceLoaded && mapRef.current) {
        mapRef.current.setCenter(defaultCenter);
        mapRef.current.setZoom(defaultZoom);
    }
  }, [placemarks, isMapInstanceLoaded]);

  const feasibleLinks = results.filter(r => r.losPossible);

  if (mapLoadError) {
    return (
      <Card className="h-[400px] md:h-[500px] shadow-md">
        <CardHeader><CardTitle className="text-lg">Site Map</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center h-full text-destructive">
          <p>{mapLoadError}</p>
        </CardContent>
      </Card>
    );
  }
  if (placemarks.length === 0) {
     return (
        <Card className="h-[400px] md:h-[500px] shadow-md">
         <CardHeader><CardTitle className="text-lg">Site Map</CardTitle></CardHeader>
         <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MapPin className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-500" />
            <p>Upload a KMZ file to see sites on the map.</p>
         </CardContent>
        </Card>
     )
  }

  return (
    <Card className="h-[400px] md:h-[500px] shadow-md">
      <CardHeader><CardTitle className="text-lg">Site Map</CardTitle></CardHeader>
      <CardContent className="h-[calc(100%-4rem)] p-0"> {/* Adjust height based on CardHeader padding */}
        <LoadScript
          // Use a common, static ID for the script to prevent multiple loads by the library.
          id="google-maps-api-script-loader"
          googleMapsApiKey={GOOGLE_MAPS_API_KEY as string}
          loadingElement={
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
          onError={(error) => setMapLoadError(`Failed to load Google Maps: ${error.message}`)}
        >
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={defaultCenter}
            zoom={defaultZoom}
            onLoad={handleMapLoad}
          >
            {placemarks.map(p => (
              <Marker 
                key={`${p.name}-${p.lat}-${p.lng}`} 
                position={{ lat: p.lat, lng: p.lng }} 
                title={p.name}
                onClick={() => setSelectedMarker(p)}
                icon={{
                    path: window.google?.maps?.SymbolPath?.CIRCLE,
                    fillColor: '#FFC107', // Amber
                    fillOpacity: 0.9,
                    strokeColor: '#000000',
                    strokeWeight: 0.5,
                    scale: 5,
                }}
              />
            ))}
            {feasibleLinks.map(link => (
              <Polyline
                key={link.id}
                path={[{ lat: link.pointA.lat, lng: link.pointA.lng }, { lat: link.pointB.lat, lng: link.pointB.lng }]}
                options={{
                  strokeColor: 'hsl(var(--app-accent))', // Green for feasible
                  strokeOpacity: 0.8,
                  strokeWeight: 2.5,
                  geodesic: true,
                }}
              />
            ))}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-1 text-sm">
                  <h4 className="font-semibold">{selectedMarker.name}</h4>
                  <p>Lat: {selectedMarker.lat.toFixed(5)}</p>
                  <p>Lng: {selectedMarker.lng.toFixed(5)}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </CardContent>
    </Card>
  );
};

export default BulkAnalysisMap;
